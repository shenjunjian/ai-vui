/** 可交互元素选择器（用于拖拽等场景排除交互控件） */
export const INTERACTIVE_SELECTOR =
  "button, a, input, textarea, select, [contenteditable]";

/** 可聚焦元素选择器（用于 focus trap） */
export const FOCUSABLE_SELECTOR = [
  ':is(input:not([type="hidden"]),select,textarea,button):not([disabled])',
  "a[href]",
  "area[href]",
  "summary",
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(",");
