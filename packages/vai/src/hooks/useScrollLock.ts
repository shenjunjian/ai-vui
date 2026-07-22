import { onBeforeUnmount, ref, type Ref } from "vue";

/** 模块级：多层弹层共享一把文档滚动锁 */
let lockCount = 0;
let savedScrollY = 0;
let savedHtmlOverflow = "";
let savedBodyOverflow = "";
let savedBodyPaddingRight = "";
let savedBodyPosition = "";
let savedBodyTop = "";
let savedBodyLeft = "";
let savedBodyRight = "";
let savedBodyWidth = "";

function getScrollbarGap(): number {
  return window.innerWidth - document.documentElement.clientWidth;
}

function hasStableScrollbarGutter(): boolean {
  const gutter = getComputedStyle(document.documentElement).scrollbarGutter;
  return Boolean(gutter && gutter !== "auto");
}

function computePaddingGap(gapBefore: number): number {
  let gap = Math.max(0, gapBefore - getScrollbarGap());
  if (gap === 0 && gapBefore > 0 && !hasStableScrollbarGutter()) {
    // happy-dom 等环境：overflow 变化不一定反映到 clientWidth
    gap = gapBefore;
  }
  return gap;
}

/**
 * 仅用 overflow:hidden 会在部分浏览器把 scrollY 重置为 0（页面闪回顶部）。
 * 用 position:fixed + top:-scrollY 冻结视觉位置，unlock 时再 scrollTo 还原。
 */
function applyDocumentLock() {
  const html = document.documentElement;
  const body = document.body;
  const gapBefore = getScrollbarGap();
  savedScrollY = window.scrollY;

  savedHtmlOverflow = html.style.overflow;
  savedBodyOverflow = body.style.overflow;
  savedBodyPaddingRight = body.style.paddingRight;
  savedBodyPosition = body.style.position;
  savedBodyTop = body.style.top;
  savedBodyLeft = body.style.left;
  savedBodyRight = body.style.right;
  savedBodyWidth = body.style.width;

  html.style.overflow = "hidden";
  body.style.overflow = "hidden";

  const gap = computePaddingGap(gapBefore);

  // 先写 top 再 position:fixed，避免读取/写入间隙里 scrollY 被清零
  body.style.top = `-${savedScrollY}px`;
  body.style.left = "0";
  body.style.right = "0";
  body.style.width = "100%";
  body.style.position = "fixed";

  if (gap > 0) {
    const current = parseFloat(getComputedStyle(body).paddingRight) || 0;
    body.style.paddingRight = `${current + gap}px`;
  }
}

function restoreDocumentLock() {
  const html = document.documentElement;
  const body = document.body;
  const y = savedScrollY;

  html.style.overflow = savedHtmlOverflow;
  body.style.overflow = savedBodyOverflow;
  body.style.paddingRight = savedBodyPaddingRight;
  body.style.position = savedBodyPosition;
  body.style.top = savedBodyTop;
  body.style.left = savedBodyLeft;
  body.style.right = savedBodyRight;
  body.style.width = savedBodyWidth;

  savedHtmlOverflow = "";
  savedBodyOverflow = "";
  savedBodyPaddingRight = "";
  savedBodyPosition = "";
  savedBodyTop = "";
  savedBodyLeft = "";
  savedBodyRight = "";
  savedBodyWidth = "";
  savedScrollY = 0;

  window.scrollTo(0, y);
}

/** @internal 测试隔离：强制清零引用计数并恢复文档样式 */
export function resetScrollLockForTest() {
  if (lockCount > 0) {
    restoreDocumentLock();
  }
  lockCount = 0;
  savedScrollY = 0;
}

/** 锁定文档滚动并冻结当前视口位置，避免 overflow:hidden 把页面甩回顶部。
 * 多层实例共享引用计数，最后一次 unlock 才恢复样式与 scrollY。
 * @example
 * const { lock, unlock, isLocked } = useScrollLock()
 * lock()          // 先锁在当前位置
 * dialog.showModal()
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
