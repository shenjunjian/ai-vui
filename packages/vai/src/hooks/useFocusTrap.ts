import { onMounted, onBeforeUnmount, reactive, type Ref } from "vue";

/** 可以自动聚焦的功能
 * container: 需要捕获焦点的容器，tab时会循环每一个可聚焦元素。
 * initialFocus: 初始聚焦的区域，如果为空，则自动聚焦到容器内第一个可聚焦元素。比如 dialog时，可以传入正文区域，这样就不会第一时间聚焦于close按钮了。
 */
export function useFocusTrap(
  /** 需要捕获焦点的容器 */
  container: HTMLElement | null | Ref<HTMLElement | null>,
  /** 初始聚焦的区域 */
  initialFocus?: HTMLElement | null | Ref<HTMLElement | null>,
) {
  const state = reactive({
    container,
    initialFocus,
  });
  const focusTrap = new FocusTrap();

  function activate() {
    focusTrap.activate(state.container!, state.initialFocus!);
  }
  function deactivate() {
    focusTrap.deactivate();
  }

  onMounted(() => focusTrap.activate(state.container!, state.initialFocus!));
  onBeforeUnmount(() => focusTrap.deactivate());

  return { activate, deactivate };
}
/** AI生成的焦点捕获 */
class FocusTrap {
  container: HTMLElement | null = null;
  focusableElements: HTMLElement[] = [];
  previousFocus: HTMLElement | null;
  isActivated = false;

  constructor() {
    this.focusableElements = []; // 容器内可聚焦元素集合
    this.previousFocus = null; // 激活陷阱前的原有焦点元素（用于后续恢复）
    this.handleKeyDown = this.handleKeyDown.bind(this); // 绑定事件处理函数的 this 指向
  }

  /**
   * 1. 获取容器内所有可聚焦元素
   */
  getFocusableElements() {
    const selector = [
      'input:not([type="hidden"]):not([disabled])',
      "select:not([disabled])",
      "textarea:not([disabled])",
      "button:not([disabled])",
      "a[href]:not([disabled])",
      "area[href]",
      '[tabindex]:not([tabindex="-1"]):not([disabled])',
      '[contenteditable="true"]',
    ].join(",");

    // 将 NodeList 转换为数组，方便后续操作
    return Array.from(
      this.container!.querySelectorAll<HTMLElement>(selector),
    ).filter((element: HTMLElement) => {
      // 额外过滤：元素必须可见（避免隐藏元素被聚焦）
      const style = window.getComputedStyle(element);
      return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        element.offsetParent !== null
      );
    }) as HTMLElement[];
  }

  /**
   * 2. 键盘事件处理：控制焦点循环
   * @param {KeyboardEvent} e
   */
  handleKeyDown(e: KeyboardEvent) {
    // 仅处理 Tab 键事件（排除其他快捷键干扰）
    if (e.key !== "Tab") return;

    // 获取并缓存可聚焦元素
    this.focusableElements = this.getFocusableElements();

    const { focusableElements } = this;
    if (focusableElements.length === 0) return; // 无可用可聚焦元素，直接返回

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const currentFocus = document.activeElement;

    // 场景 1：Shift+Tab（反向切换），当前焦点是第一个元素 → 跳转到最后一个
    if (e.shiftKey && currentFocus === firstElement) {
      e.preventDefault(); // 阻止浏览器默认的焦点跳转行为
      lastElement!.focus();
    }

    // 场景 2：仅 Tab（正向切换），当前焦点是最后一个元素 → 跳转到第一个
    if (!e.shiftKey && currentFocus === lastElement) {
      e.preventDefault();
      firstElement!.focus();
    }
  }

  /**
   * 3. 激活焦点陷阱
   */
  activate(container: HTMLElement, initialFocus: HTMLElement) {
    if (this.isActivated) return;

    if (!container || !(container instanceof HTMLElement)) {
      throw new Error("必须传入有效的 DOM 容器元素");
    }
    this.container = container; // 容器内可聚焦元素集合

    // 记录激活前的焦点元素，用于后续恢复
    this.previousFocus = document.activeElement as HTMLElement;

    // 绑定键盘事件（监听全局 keydown，确保能捕获 Tab 键操作）
    document.addEventListener("keydown", this.handleKeyDown);

    // 可选：自动聚焦到容器内第一个可聚焦元素
    const firstContainer = initialFocus || container;
    const autoFocusEl =
      firstContainer.querySelector<HTMLElement>("[autofocus]");

    if (autoFocusEl) {
      autoFocusEl.focus();
    } else if (this.focusableElements.length > 0) {
      this.focusableElements[0]!.focus();
    }

    this.isActivated = true;
  }

  /**
   * 4. 关闭/销毁焦点陷阱
   */
  deactivate() {
    if (!this.isActivated) return;

    // 移除键盘事件监听，防止内存泄漏
    document.removeEventListener("keydown", this.handleKeyDown);

    // 恢复激活陷阱前的原有焦点
    if (this.previousFocus && this.previousFocus.focus) {
      this.previousFocus.focus();
    }

    // 清空缓存
    this.focusableElements = [];
    this.previousFocus = null;
    this.isActivated = false;
  }
}
