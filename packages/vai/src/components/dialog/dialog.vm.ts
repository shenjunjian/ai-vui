import { reactive, computed, watch, nextTick, onUnmounted, ref } from "vue";
import type { DialogCtx } from "./dialog.vue";
import { INTERACTIVE_SELECTOR } from "../../utils/constant.ts";
import { callWithGuard } from "../../utils/promiseHelper.ts";
import { random, clamp } from "../../utils/dataHelper.ts";
import { useDrag } from "../../hooks/useDrag.ts";

type Point = { x: number; y: number };
type Size = { width: number; height: number };

const MIN_WIDTH = 240;
const MIN_HEIGHT = 160;

export default function useVm(ctx: DialogCtx) {
  const { props, refs, models, emit } = ctx;

  const titleId = `v-modal-title-${random()}`;
  /** destroyOnClose=false 时始终挂载；true 时仅打开期间挂载整个 dialog */
  const dialogMounted = ref(!props.destroyOnClose || models.open.value);
  /** header 拖动结束后的位移（拖动中写 DOM，结束时再同步） */
  const offset = ref<Point>({ x: 0, y: 0 });
  /** drawer 缩放结束后的尺寸（拖动中写 DOM，结束时再同步，避免每帧 Vue 更新） */
  const size = ref<Partial<Size> | null>(null);
  const closingGuard = ref(false);

  const canDrag = computed(() => props.draggable && props.variant === "dialog");

  /** drawer 空闲边：远离贴边的那一侧 */
  const resizeClass = computed(() => ({
    "is-edge-left": props.placement === "right",
    "is-edge-right": props.placement === "left",
    "is-edge-top": props.placement === "bottom",
    "is-edge-bottom": props.placement === "top",
  }));

  const resizeCursor = computed(() =>
    props.placement === "left" || props.placement === "right"
      ? "ew-resize"
      : "ns-resize",
  );

  /** header 拖动：拖动中直接改 el.style.translate，结束时同步 offset */
  const {
    init: initDrag,
    stop: stopDrag,
    state: moveDragState,
  } = useDrag({
    el: refs.rootRef,
    handler: refs.headerRef,
    cursor: "move",
    container: document.documentElement,
    disabled: computed(() => !canDrag.value),
    /** title 插槽可以塞自定义按钮、链接、输入框等，这些节点默认没有 .stop，事件会冒泡到 header，要拦截它 */
    shouldStart(event) {
      const target = event.target as HTMLElement | null;
      return !target?.closest(INTERACTIVE_SELECTOR);
    },
    startDrag(s) {
      s._.baseX = offset.value.x;
      s._.baseY = offset.value.y;
      emit("drag-start");
    },
    applyDrag(s) {
      const el = s.el;
      if (!el) return;
      const { rect, boundary, deltaX, deltaY } = s._;
      const baseX = s._.baseX as number;
      const baseY = s._.baseY as number;
      const x =
        baseX +
        clamp(deltaX, boundary.left - rect.left, boundary.right - rect.right);
      const y =
        baseY +
        clamp(deltaY, boundary.top - rect.top, boundary.bottom - rect.bottom);
      s._.currX = x;
      s._.currY = y;
      el.style.translate = `${x}px ${y}px`;
      emit("drag-move");
    },
    endDrag(s) {
      if (typeof s._.currX === "number" && typeof s._.currY === "number") {
        offset.value = { x: s._.currX as number, y: s._.currY as number };
      }
      emit("drag-end");
    },
  });

  /** drawer 空闲边缩放：手柄为 v-modal__resize；拖动中直接改 el.style，结束时同步 size */
  const {
    init: initResize,
    stop: stopResize,
    state: resizeDragState,
  } = useDrag({
    el: refs.rootRef,
    handler: refs.resizeRef,
    cursor: resizeCursor,
    container: document.documentElement,
    disabled: computed(
      () => !(props.resizable && props.variant === "drawer"),
    ),
    applyDrag(s) {
      const el = s.el;
      if (!el) return;
      const { rect, deltaX, deltaY } = s._;

      switch (props.placement) {
        case "right":
          el.style.width = `${Math.max(MIN_WIDTH, rect.width - deltaX)}px`;
          break;
        case "left":
          el.style.width = `${Math.max(MIN_WIDTH, rect.width + deltaX)}px`;
          break;
        case "bottom":
          el.style.height = `${Math.max(MIN_HEIGHT, rect.height - deltaY)}px`;
          break;
        case "top":
          el.style.height = `${Math.max(MIN_HEIGHT, rect.height + deltaY)}px`;
          break;
      }
    },
    endDrag(s) {
      const el = s.el;
      if (!el) return;
      if (props.placement === "left" || props.placement === "right") {
        const width = parseFloat(el.style.width);
        if (!Number.isNaN(width)) size.value = { width };
      } else {
        const height = parseFloat(el.style.height);
        if (!Number.isNaN(height)) size.value = { height };
      }
    },
  });

  const rootClass = computed(() => [
    {
      "v-drawer-modal": props.variant === "drawer",
      "is-no-mask": !props.showMask,
      "is-mask-blur": props.showMask && props.maskStyle === "blur",
      "is-dragging": moveDragState._.isDragging,
      "is-resizing": resizeDragState._.isDragging,
      /** dialog 变体：原生 CSS resize:both */
      "is-resizable": props.resizable && props.variant === "dialog",
      [`is-${props.placement}`]: props.variant === "drawer",
    },
  ]);

  const dialogStyle = computed(() => {
    const style: Record<string, string> = {};
    if (offset.value.x || offset.value.y) {
      style.translate = `${offset.value.x}px ${offset.value.y}px`;
    }
    if (size.value?.width != null) {
      style.width = `${size.value.width}px`;
    }
    if (size.value?.height != null) {
      style.height = `${size.value.height}px`;
    }
    return style;
  });

  const state = reactive({
    rootClass,
    dialogStyle,
    dialogMounted,
    canDrag,
    resizeClass,
  });

  function resetPositionSize() {
    offset.value = { x: 0, y: 0 };
    size.value = null;
    /** 拖动 / CSS resize:both 写入的 inline 样式，关闭时清掉 */
    const el = refs.rootRef.value;
    if (el) {
      el.style.removeProperty("translate");
      el.style.removeProperty("width");
      el.style.removeProperty("height");
    }
  }

  function focusAfterOpen(el: HTMLDialogElement) {
    if (props.autoFocus) return;
    el.focus({ preventScroll: true });
  }

  function open() {
    if (!dialogMounted.value) {
      dialogMounted.value = true;
    }

    nextTick(() => {
      const dialog = refs.rootRef.value;
      if (!dialog) return;
      const wasOpen = dialog.open;
      if (!wasOpen) {
        dialog.showModal();
      }
      models.open.value = true;
      if (!wasOpen) {
        focusAfterOpen(dialog);
        nextTick(() => emit("opened"));
      }
    });
  }

  function close() {
    const el = refs.rootRef.value;
    if (!el) {
      models.open.value = false;
      if (props.destroyOnClose) {
        dialogMounted.value = false;
      }
      return;
    }
    if (el.open) {
      el.close();
    } else {
      syncClosed();
    }
  }

  function requestClose() {
    const el = refs.rootRef.value;
    if (!el?.open || closingGuard.value) return;

    if (typeof el.requestClose === "function") {
      el.requestClose();
      return;
    }

    callWithGuard(props.beforeClose, () => close());
  }

  async function handleCancel(event: Event) {
    event.preventDefault();
    if (closingGuard.value) return;
    closingGuard.value = true;
    try {
      await callWithGuard(props.beforeClose, () => {
        refs.rootRef.value?.close();
      });
    } finally {
      closingGuard.value = false;
    }
  }

  function syncClosed() {
    models.open.value = false;
    resetPositionSize();
    if (props.destroyOnClose) {
      dialogMounted.value = false;
    }
    emit("closed");
  }

  function handleDialogClose() {
    syncClosed();
  }

  watch(
    () => models.open.value,
    (value) => {
      const el = refs.rootRef.value;
      if (value) {
        if (!el?.open) open();
      } else if (el?.open) {
        close();
      } else if (props.destroyOnClose && !value) {
        dialogMounted.value = false;
      }
    },
    { immediate: true },
  );

  watch(
    () => props.destroyOnClose,
    (value) => {
      if (!value) {
        dialogMounted.value = true;
      } else if (!models.open.value) {
        dialogMounted.value = false;
      }
    },
  );

  /** destroyOnClose / header 晚就绪时主动 init；卸载或不可拖时 stop */
  watch(
    [
      dialogMounted,
      canDrag,
      () => refs.rootRef.value,
      () => refs.headerRef.value,
    ],
    async ([mounted, drag]) => {
      stopDrag();
      if (mounted && drag && refs.rootRef.value && refs.headerRef.value) {
        await nextTick();
        initDrag();
      }
    },
  );

  /** drawer resize 手柄晚就绪时主动 init */
  watch(
    [
      dialogMounted,
      () => props.resizable,
      () => props.variant,
      () => refs.rootRef.value,
      () => refs.resizeRef.value,
    ],
    async ([mounted, resizable, variant]) => {
      stopResize();
      if (
        mounted &&
        resizable &&
        variant === "drawer" &&
        refs.rootRef.value &&
        refs.resizeRef.value
      ) {
        await nextTick();
        initResize();
      }
    },
  );

  onUnmounted(() => {
    stopResize();
  });

  const api = {
    open,
    close,
    requestClose,
    handleCancel,
    handleDialogClose,
  };

  return { state, api, titleId };
}
