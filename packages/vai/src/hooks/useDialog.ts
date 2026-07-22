import { computed, reactive, type Ref } from "vue";
import { random } from "../utils/dataHelper";
import { OK } from "../utils";

type DialogPlacement = "center" | "top" | "bottom" | "right" | "left";
export interface DialogOption {
  el: HTMLDialogElement | null | Ref<HTMLDialogElement | null>;
  /** 外观变体 */
  variant?: "dialog" | "drawer";
  /** 弹出位置，模拟drawer 的行为 */
  placement: DialogPlacement | Ref<DialogPlacement>;
  /** Light Dismiss：any / closerequest / none */
  closedby?: "none" | "closerequest" | "any";
  /** 是否显示遮罩 */
  showMask?: boolean;
  /** 遮罩样式：半透明或毛玻璃 */
  maskStyle?: "opaque" | "blur";
  /** 关闭前拦截；返回 true 允许关闭 */
  beforeClose?: () => boolean | Promise<boolean>;
}

const defaultOption: Partial<DialogOption> = {
  variant: "dialog",
  placement: "right",
  showMask: true,
  maskStyle: "opaque",
  beforeClose: OK,
};

/**
 * 快速让dialog 拥有 Dialog的能力  TODO: 未完成开发
 */
export function useDialog(option: DialogOption) {
  /** 转为内部响应式对象 */
  const _r = reactive(Object.assign({}, defaultOption, option)) as DialogOption;

  const state = reactive({
    /** 对话框id */
    id: "dialog-" + random(),
  });

  function openDialog() {}
  function closeDialog() {}

  function requestCloseDialog() {}
  return { state, openDialog, closeDialog, requestCloseDialog };
}
