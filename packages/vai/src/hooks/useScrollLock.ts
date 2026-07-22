import { onBeforeUnmount, ref, type Ref } from "vue";

/** 模块级：多层弹层共享一把文档滚动锁 */
let lockCount = 0;
let savedScrollX = 0;
let savedScrollY = 0;
let savedBodyOverflow = "";
let savedBodyPosition = "";
let savedBodyTop = "";
let savedBodyLeft = "";
let savedBodyRight = "";
let savedBodyPaddingRight = "";

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
  const body = document.body;
  const gap = getScrollbarGap();
  savedScrollX = window.scrollX;
  savedScrollY = window.scrollY;

  savedBodyOverflow = body.style.overflow;
  savedBodyPosition = body.style.position;
  savedBodyTop = body.style.top;
  savedBodyLeft = body.style.left;
  savedBodyRight = body.style.right;
  savedBodyPaddingRight = body.style.paddingRight;

  body.style.overflow = "hidden";
  body.style.position = "fixed";
  body.style.top = `-${savedScrollY}px`;
  body.style.left = `-${savedScrollX}px`;
  body.style.right = "0";

  if (needsPaddingCompensation(gap)) {
    const current = parseFloat(getComputedStyle(body).paddingRight) || 0;
    body.style.paddingRight = `${current + gap}px`;
  }
}

function restoreDocumentLock() {
  const body = document.body;

  body.style.overflow = savedBodyOverflow;
  body.style.position = savedBodyPosition;
  body.style.top = savedBodyTop;
  body.style.left = savedBodyLeft;
  body.style.right = savedBodyRight;
  body.style.paddingRight = savedBodyPaddingRight;

  savedBodyOverflow = "";
  savedBodyPosition = "";
  savedBodyTop = "";
  savedBodyLeft = "";
  savedBodyRight = "";
  savedBodyPaddingRight = "";

  window.scrollTo(savedScrollX, savedScrollY);
  savedScrollY = 0;
  savedScrollX = 0;
}

/** @internal 测试隔离 */
export function resetScrollLockForTest() {
  if (lockCount > 0) {
    restoreDocumentLock();
  }
  lockCount = 0;
  savedScrollY = 0;
  savedScrollX = 0;
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
