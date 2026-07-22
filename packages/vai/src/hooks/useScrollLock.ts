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

/** scrollbar-gutter: stable 时滚动条消失后仍占位，无需再补 padding */
function needsPaddingCompensation(gap: number): boolean {
  if (gap <= 0) return false;
  const gutter = getComputedStyle(document.documentElement).scrollbarGutter;
  return !gutter || gutter === "auto";
}

/**
 * 冻结文档视口：overflow hidden + body fixed。
 * 锁定期间页面宽高不再随子元素进出变化；有经典滚动条时补 padding 防抖。
 */
function applyDocumentLock() {
  const html = document.documentElement;
  const body = document.body;
  const gap = getScrollbarGap();
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
  body.style.position = "fixed";
  body.style.top = `-${savedScrollY}px`;
  body.style.left = "0";
  body.style.right = "0";
  body.style.width = "100%";

  if (needsPaddingCompensation(gap)) {
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

/** @internal 测试隔离 */
export function resetScrollLockForTest() {
  if (lockCount > 0) {
    restoreDocumentLock();
  }
  lockCount = 0;
  savedScrollY = 0;
}

/**
 * 锁定文档滚动。有/无滚动条均可；锁定后视口尺寸稳定，不随页面元素进出抖动。
 * @example
 * lock()
 * dialog.showModal()
 * unlock()
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
