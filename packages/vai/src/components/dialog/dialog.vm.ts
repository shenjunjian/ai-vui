import { reactive, computed, watch, nextTick, onUnmounted, ref } from "vue";
import type { DialogCtx } from "./dialog.vue";
import { INTERACTIVE_SELECTOR } from "../../utils/constant.ts";
import { callWithGuard } from "../../utils/promiseHelper.ts";
import { random, clamp } from "../../utils/dataHelper.ts";
import { useDrag } from "../../hooks/useDrag.ts";

type Point = { x: number; y: number };
type Size = { width: number; height: number };

export default function useVm(ctx: DialogCtx) {
  const { props, refs, models, emit } = ctx;

  const titleId = `v-modal-title-${random()}`;
  /** destroyOnClose=false 时始终挂载；true 时仅打开期间挂载整个 dialog */
  const dialogMounted = ref(!props.destroyOnClose || models.open.value);
  const isDragging = ref(false);
  const isResizing = ref(false);
  const offset = ref<Point>({ x: 0, y: 0 });
  const size = ref<Size | null>(null);
  const closingGuard = ref(false);

  let resizeOrigin: Point | null = null;
  let resizeSizeStart: Size | null = null;

  const canDrag = computed(() => props.draggable && props.variant === "dialog");

  const canResize = computed(() => props.resizable);

  const resizeClass = computed(() => {
    if (props.variant !== "drawer") return "is-corner";
    return {
      "is-edge-left": props.placement === "right",
      "is-edge-right": props.placement === "left",
      "is-edge-top": props.placement === "bottom",
      "is-edge-bottom": props.placement === "top",
    };
  });

  const rootClass = computed(() => [
    {
      "v-drawer-modal": props.variant === "drawer",
      "is-no-mask": !props.showMask,
      "is-mask-blur": props.showMask && props.maskStyle === "blur",
      "is-dragging": isDragging.value,
      "is-resizing": isResizing.value,
      [`is-${props.placement}`]: props.variant === "drawer",
    },
  ]);

  const dialogStyle = computed(() => {
    const style: Record<string, string> = {};
    if (offset.value.x || offset.value.y) {
      style.translate = `${offset.value.x}px ${offset.value.y}px`;
    }
    if (size.value) {
      style.width = `${size.value.width}px`;
      style.height = `${size.value.height}px`;
    }
    return style;
  });

  const state = reactive({
    rootClass,
    dialogStyle,
    dialogMounted,
    isDragging,
    isResizing,
    canDrag,
    canResize,
    resizeClass,
  });

  const {
    init: initDrag,
    stop: stopDrag,
    state: dragState,
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
      isDragging.value = true;
      emit("drag-start");
    },
    applyDrag(s) {
      const { rect, boundary, deltaX, deltaY } = s._;
      const baseX = s._.baseX as number;
      const baseY = s._.baseY as number;
      const dx = clamp(
        deltaX,
        boundary.left - rect.left,
        boundary.right - rect.right,
      );
      const dy = clamp(
        deltaY,
        boundary.top - rect.top,
        boundary.bottom - rect.bottom,
      );
      offset.value = { x: baseX + dx, y: baseY + dy };
      emit("drag-move");
    },
    endDrag() {
      isDragging.value = false;
      emit("drag-end");
    },
  });

  function resetPositionSize() {
    offset.value = { x: 0, y: 0 };
    size.value = null;
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

  function currentSize(el: HTMLElement): Size {
    if (size.value) return { ...size.value };
    const rect = el.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  }

  function handleResizeStart(event: PointerEvent) {
    if (!canResize.value || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();

    const el = refs.rootRef.value;
    if (!el) return;

    isResizing.value = true;
    resizeOrigin = { x: event.clientX, y: event.clientY };
    resizeSizeStart = currentSize(el);
    el.setPointerCapture?.(event.pointerId);
    window.addEventListener("pointermove", handleResizeMove);
    window.addEventListener("pointerup", handleResizeEnd);
    window.addEventListener("pointercancel", handleResizeEnd);
  }

  function handleResizeMove(event: PointerEvent) {
    if (!isResizing.value || !resizeOrigin || !resizeSizeStart) return;

    const dx = event.clientX - resizeOrigin.x;
    const dy = event.clientY - resizeOrigin.y;
    const minW = 240;
    const minH = 160;

    let width = resizeSizeStart.width;
    let height = resizeSizeStart.height;

    if (props.variant === "drawer") {
      switch (props.placement) {
        case "right":
          width = Math.max(minW, resizeSizeStart.width - dx);
          break;
        case "left":
          width = Math.max(minW, resizeSizeStart.width + dx);
          break;
        case "bottom":
          height = Math.max(minH, resizeSizeStart.height - dy);
          break;
        case "top":
          height = Math.max(minH, resizeSizeStart.height + dy);
          break;
      }
    } else {
      width = Math.max(minW, resizeSizeStart.width + dx);
      height = Math.max(minH, resizeSizeStart.height + dy);
    }

    size.value = { width, height };
  }

  function handleResizeEnd() {
    if (!isResizing.value) return;
    isResizing.value = false;
    resizeOrigin = null;
    resizeSizeStart = null;
    window.removeEventListener("pointermove", handleResizeMove);
    window.removeEventListener("pointerup", handleResizeEnd);
    window.removeEventListener("pointercancel", handleResizeEnd);
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

  onUnmounted(() => {
    handleResizeEnd();
  });

  const api = {
    open,
    close,
    requestClose,
    handleCancel,
    handleDialogClose,
    handleResizeStart,
  };

  return { state, api, titleId };
}
