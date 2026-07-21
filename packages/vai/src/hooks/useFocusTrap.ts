import {
  onBeforeUnmount,
  ref,
  toValue,
  type MaybeRef,
  type Ref,
} from "vue";

const FOCUSABLE_SELECTOR = [
  'input:not([type="hidden"]):not([disabled])',
  "select:not([disabled])",
  "textarea:not([disabled])",
  "button:not([disabled])",
  "a[href]",
  "area[href]",
  "summary",
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(",");

function isVisible(el: HTMLElement): boolean {
  if (el.hasAttribute("hidden") || el.closest("[inert]")) return false;
  if (typeof el.checkVisibility === "function") {
    return el.checkVisibility({
      checkOpacity: false,
      checkVisibilityCSS: true,
    });
  }
  const style = getComputedStyle(el);
  if (style.display === "none" || style.visibility === "hidden") return false;
  return el.getClientRects().length > 0;
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter(isVisible);
}

function isProgrammaticallyFocusable(el: HTMLElement): boolean {
  if (!isVisible(el)) return false;
  if (el.matches(FOCUSABLE_SELECTOR)) return true;
  // tabindex="-1" 等：可程序聚焦，但不进 Tab 序列
  return el.tabIndex >= -1 && el.hasAttribute("tabindex");
}

function findAutofocus(root: HTMLElement): HTMLElement | null {
  if (root.matches("[autofocus]") && isVisible(root)) return root;
  const el = root.querySelector<HTMLElement>("[autofocus]");
  return el && isVisible(el) ? el : null;
}

/** 焦点陷阱：Tab 在容器内循环；激活时自动聚焦，停用时恢复先前焦点。
 * @example
 * const panelRef = useTemplateRef('panel')
 * const { activate, deactivate } = useFocusTrap(panelRef)
 * watch(open, (v) => (v ? activate() : deactivate()))
 */
export function useFocusTrap(
  /** 需要捕获焦点的容器 */
  container: MaybeRef<HTMLElement | null>,
  /** 初始聚焦元素，或在其内查找首个可聚焦元素的区域 */
  initialFocus?: MaybeRef<HTMLElement | null>,
): {
  activate: () => void;
  deactivate: () => void;
  isActive: Ref<boolean>;
} {
  const isActive = ref(false);
  let previousFocus: HTMLElement | null = null;
  let activeContainer: HTMLElement | null = null;

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key !== "Tab" || !activeContainer) return;

    const focusables = getFocusableElements(activeContainer);
    if (focusables.length === 0) {
      e.preventDefault();
      if (isProgrammaticallyFocusable(activeContainer)) {
        activeContainer.focus();
      }
      return;
    }

    const first = focusables[0]!;
    const last = focusables[focusables.length - 1]!;
    const current = document.activeElement as HTMLElement | null;
    const outside =
      !current ||
      !activeContainer.contains(current) ||
      !focusables.includes(current);

    if (e.shiftKey) {
      if (outside || current === first) {
        e.preventDefault();
        last.focus();
      }
    } else if (outside || current === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function resolveInitialTarget(
    root: HTMLElement,
    initial: HTMLElement | null,
  ): HTMLElement | null {
    const searchRoot = initial ?? root;
    const autofocusEl = findAutofocus(searchRoot) ?? findAutofocus(root);
    if (autofocusEl) return autofocusEl;

    if (initial && isProgrammaticallyFocusable(initial)) return initial;

    const scope = initial ?? root;
    const focusables = getFocusableElements(scope);
    if (focusables.length > 0) return focusables[0]!;

    if (isProgrammaticallyFocusable(root)) return root;
    return null;
  }

  function activate() {
    if (isActive.value) return;

    const el = toValue(container);
    if (!el || !(el instanceof HTMLElement)) {
      throw new Error("useFocusTrap: 必须传入有效的 DOM 容器元素");
    }

    const initial = initialFocus != null ? toValue(initialFocus) : null;
    activeContainer = el;
    previousFocus = document.activeElement as HTMLElement | null;
    document.addEventListener("keydown", handleKeyDown);

    const target = resolveInitialTarget(el, initial);
    target?.focus();

    isActive.value = true;
  }

  function deactivate() {
    if (!isActive.value) return;

    document.removeEventListener("keydown", handleKeyDown);

    if (previousFocus?.isConnected) {
      previousFocus.focus();
    }

    previousFocus = null;
    activeContainer = null;
    isActive.value = false;
  }

  onBeforeUnmount(deactivate);

  return { activate, deactivate, isActive };
}
