import { random } from "@opentiny/utils";
import { computed, reactive, type Ref } from "vue";

type DialogPlacement = "center" | "top" | "bottom" | "right" | "left";
export interface DialogOption {
  el: HTMLDialogElement | null | Ref<HTMLDialogElement | null>;
  /** 弹出位置，模拟drawer 的行为 */
  placement: DialogPlacement | Ref<DialogPlacement>;
  /** 是否显示遮罩层 */
  mask?: boolean;
  /** 是否点击模态框的遮罩层关闭。 */
  maskClosable?: boolean;
  /** 居中模式时，是否拖动右下角改变大小, 建议通过style 设置最小高度和最小宽度,以防止太小。
   *  drawer模式时，是否允许拖动活动边框改变大小 */
  resizable?: boolean;
  /** 是否拖动位置, 仅placement=center是生效 */
  draggable?: boolean;
  /** 是否自由拖动, 当draggable生效时,拖动是否允许超出窗口. freeDrag=false时,拖动被限制在窗口*/
  freeDrag?: boolean;
  /** 是否有打开和关闭动画 */
  animate?: boolean;
}

const defaultOption: Partial<DialogOption> = {
  placement: "center",
  mask: true,
  maskClosable: true,
  resizable: false,
  draggable: false,
  freeDrag: false,
  animate: true,
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
    /** 应该绑定到 dialog 的class */
    dialogCls: computed(() => {
      return {
        "st-drawer": _r.placement !== "center",
        "st-resizable": _r.placement == "center" && _r.resizable,
        "st-mask": _r.mask,
        ["st-" + _r.placement]: true,
        "st-animate": _r.animate,
      };
    }),
    /** 应该绑定到 dialog 的 closedby */
    closedby: computed(() =>
      _r.mask && _r.maskClosable ? "any" : "closerequest",
    ),
  });

  function openDialog() {
    _r.el?.showModal();
  }
  function closeDialog() {
    _r.el?.close();
  }

  function requestCloseDialog() {
    _r.el?.requestClose();
  }
  return { state, openDialog, closeDialog, requestCloseDialog };
}
