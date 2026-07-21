import {
  reactive,
  computed,
  watch,
  nextTick,
  onUnmounted,
  ref,
} from "vue";
import type { DialogCtx } from "./dialog.vue";
import { callWithGuard } from "../../utils/promiseHelper.ts";
import { random } from "../../utils/dataHelper.ts";

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

  let dragOrigin: Point | null = null;
  let dragOffsetStart: Point | null = null;
  let resizeOrigin: Point | null = null;
  let resizeSizeStart: Size | null = null;

  const canDrag = computed(
    () => props.draggable && props.variant === "dialog",
  );

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

  function getDialog(): HTMLDialogElement | null {
    return refs.rootRef.value;
  }

  function ensureDialogMounted() {
    if (!dialogMounted.value) {
      dialogMounted.value = true;
    }
  }

  function resetPositionSize() {
    offset.value = { x: 0, y: 0 };
    size.value = null;
  }

  function focusAfterOpen(el: HTMLDialogElement) {
    if (props.autoFocus) return;
    el.focus({ preventScroll: true });
  }

  function open() {
    ensureDialogMounted();
    nextTick(() => {
      const dialog = getDialog();
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
    const el = getDialog();
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
    const el = getDialog();
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
        getDialog()?.close();
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

  function handleDragStart(event: PointerEvent) {
    if (!canDrag.value || event.button !== 0) return;
    const target = event.target as HTMLElement | null;
    if (target?.closest("button, a, input, textarea, select, [contenteditable]")) {
      return;
    }

    const el = getDialog();
    if (!el) return;

    isDragging.value = true;
    dragOrigin = { x: event.clientX, y: event.clientY };
    dragOffsetStart = { ...offset.value };
    el.setPointerCapture?.(event.pointerId);
    window.addEventListener("pointermove", handleDragMove);
    window.addEventListener("pointerup", handleDragEnd);
    window.addEventListener("pointercancel", handleDragEnd);
    emit("drag-start");
  }

  function handleDragMove(event: PointerEvent) {
    if (!isDragging.value || !dragOrigin || !dragOffsetStart) return;
    offset.value = {
      x: dragOffsetStart.x + (event.clientX - dragOrigin.x),
      y: dragOffsetStart.y + (event.clientY - dragOrigin.y),
    };
    emit("drag-move");
  }

  function handleDragEnd() {
    if (!isDragging.value) return;
    isDragging.value = false;
    dragOrigin = null;
    dragOffsetStart = null;
    window.removeEventListener("pointermove", handleDragMove);
    window.removeEventListener("pointerup", handleDragEnd);
    window.removeEventListener("pointercancel", handleDragEnd);
    emit("drag-end");
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

    const el = getDialog();
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
      const el = getDialog();
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

  onUnmounted(() => {
    handleDragEnd();
    handleResizeEnd();
  });

  const api = {
    open,
    close,
    requestClose,
    handleCancel,
    handleDialogClose,
    handleDragStart,
    handleResizeStart,
  };

  return { state, api, titleId };
}
