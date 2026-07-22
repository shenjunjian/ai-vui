import { onBeforeUnmount, ref, type Ref } from "vue";

/** 模块级：多层弹层共享一把文档滚动锁 */
let lockCount = 0;
let savedHtmlOverflow = "";
let savedBodyOverflow = "";
let savedBodyPaddingRight = "";

function getScrollbarGap(): number {
  return window.innerWidth - document.documentElement.clientWidth;
}

function hasStableScrollbarGutter(): boolean {
  const gutter = getComputedStyle(document.documentElement).scrollbarGutter;
  return Boolean(gutter && gutter !== "auto");
}

function applyDocumentLock() {
  const html = document.documentElement;
  const body = document.body;
  const gapBefore = getScrollbarGap();

  savedHtmlOverflow = html.style.overflow;
  savedBodyOverflow = body.style.overflow;
  savedBodyPaddingRight = body.style.paddingRight;

  html.style.overflow = "hidden";
  body.style.overflow = "hidden";

  /**
   * 只补偿「锁定后实际腾出的」宽度，避免：
   * - `scrollbar-gutter: stable` 已占位时再加 padding → 内容左移
   * - overlay 滚动条（gap=0）误补偿
   */
  let gap = Math.max(0, gapBefore - getScrollbarGap());
  if (gap === 0 && gapBefore > 0 && !hasStableScrollbarGutter()) {
    // happy-dom 等环境：overflow 变化不一定反映到 clientWidth
    gap = gapBefore;
  }

  if (gap > 0) {
    const current = parseFloat(getComputedStyle(body).paddingRight) || 0;
    body.style.paddingRight = `${current + gap}px`;
  }
}

function restoreDocumentLock() {
  const html = document.documentElement;
  const body = document.body;
  html.style.overflow = savedHtmlOverflow;
  body.style.overflow = savedBodyOverflow;
  body.style.paddingRight = savedBodyPaddingRight;
  savedHtmlOverflow = "";
  savedBodyOverflow = "";
  savedBodyPaddingRight = "";
}

/** @internal 测试隔离：强制清零引用计数并恢复文档样式 */
export function resetScrollLockForTest() {
  if (lockCount > 0) {
    restoreDocumentLock();
  }
  lockCount = 0;
}

/** 锁定文档滚动，防止模态打开后背景仍可滚；按实际腾出宽度补偿，避免布局左移。
 * 多层实例共享引用计数，最后一次 unlock 才恢复。
 * @example
 * const { lock, unlock, isLocked } = useScrollLock()
 * watch(open, (v) => (v ? lock() : unlock()))
 */
export function useScrollLock(): {
  lock: () => void;
  unlock: () => void;
  isLocked: Ref<boolean>;
} {
  const isLocked = ref(false);

  function lock() {
    if (isLocked.value) return;
    lockCount += 1;
    if (lockCount === 1) {
      applyDocumentLock();
    }
    isLocked.value = true;
  }

  function unlock() {
    if (!isLocked.value) return;
    isLocked.value = false;
    if (lockCount <= 0) return;
    lockCount -= 1;
    if (lockCount === 0) {
      restoreDocumentLock();
    }
  }

  onBeforeUnmount(unlock);

  return { lock, unlock, isLocked };
}
