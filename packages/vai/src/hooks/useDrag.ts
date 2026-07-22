import {
  nextTick,
  onBeforeUnmount,
  onMounted,
  reactive,
  toValue,
  watch,
  type MaybeRef,
} from "vue";

export type DragCallbackFn = (state: DragOption) => void;

export interface DragInternalState {
  isDragging: boolean;
  /** 按下时的屏幕坐标 */
  startX: number;
  startY: number;
  /** 开始拖动时元素的大小与位置 */
  rect: DOMRect;
  /** 开始拖动时边界容器的大小与位置 */
  boundary: DOMRect;
  /** 相对起点的实时偏移 */
  deltaX: number;
  deltaY: number;
  /** 调用方在 startDrag 中缓存的自定义字段 */
  [others: string]: unknown;
}

export interface DragOption {
  /** 被拖动的元素 */
  el: MaybeRef<HTMLElement | null>;
  /** 拖动手柄；缺省时与 `el` 相同 */
  handler: MaybeRef<HTMLElement | null>;
  /** 手柄光标，默认 `move`；空字符串表示不修改 */
  cursor: string;
  /** 边界参考元素，默认 `document.body`；用于填充 `_.boundary` */
  container: HTMLElement | null;
  /** 是否禁用拖动 */
  disabled: MaybeRef<boolean>;
  /** 拖动开始：可记录初始 left/top 等 */
  startDrag: DragCallbackFn;
  /** 拖动中：根据 `delta*` 写位置（left/top、translate、margin 等由调用方决定） */
  applyDrag: DragCallbackFn;
  /** 拖动结束（pointerup / pointercancel / stop 中途打断） */
  endDrag: DragCallbackFn;
  /** 内部状态（每实例独立） */
  _: DragInternalState;
}

const noop: DragCallbackFn = () => {};

function createInternalState(): DragInternalState {
  return {
    isDragging: false,
    startX: 0,
    startY: 0,
    rect: new DOMRect(),
    boundary: new DOMRect(),
    deltaX: 0,
    deltaY: 0,
  };
}

function asElement(value: unknown): HTMLElement | null {
  const el = toValue(value as MaybeRef<HTMLElement | null>);
  return el instanceof HTMLElement ? el : null;
}

/**
 * 通用拖动：在容器坐标系内移动元素。区别于 DnD / useSortable——没有 drop target。
 * `el` / `handler` 若在挂载时尚未就绪，需在 DOM 可用后主动调用 `init()`。
 */
export function useDrag(option: Partial<DragOption> = {}) {
  const state = reactive({
    el: option.el ?? null,
    handler: option.handler ?? null,
    cursor: option.cursor ?? "move",
    container: option.container ?? null,
    disabled: option.disabled ?? false,
    startDrag: option.startDrag ?? noop,
    applyDrag: option.applyDrag ?? noop,
    endDrag: option.endDrag ?? noop,
    _: createInternalState(),
  }) as DragOption;

  let inited = false;
  let boundHandler: HTMLElement | null = null;
  let activePointerId: number | null = null;

  function resolveEl(): HTMLElement | null {
    return asElement(state.el);
  }

  function resolveHandler(): HTMLElement | null {
    return asElement(state.handler) ?? resolveEl();
  }

  function resolveContainer(): HTMLElement {
    return state.container ?? document.body;
  }

  function isDisabled(): boolean {
    return !!toValue(state.disabled);
  }

  function finishDrag() {
    if (!state._.isDragging) return;

    resolveEl()?.classList.remove("st-dragging");

    document.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerup", onPointerUp);
    document.removeEventListener("pointercancel", onPointerUp);

    if (boundHandler && activePointerId != null) {
      try {
        if (boundHandler.hasPointerCapture(activePointerId)) {
          boundHandler.releasePointerCapture(activePointerId);
        }
      } catch {
        // 指针已释放时忽略
      }
    }

    activePointerId = null;
    state._.isDragging = false;
    state.endDrag(state);
  }

  /** 绑定拖动手柄；幂等。元素未就绪时 warn 并返回，调用方稍后重试。 */
  function init() {
    if (inited || isDisabled()) return;

    const el = resolveEl();
    const handler = resolveHandler();
    if (!el || !handler) {
      console.warn("useDrag: el / handler 未就绪，请在 DOM 可用后调用 init()");
      return;
    }

    boundHandler = handler;
    if (state.cursor) {
      handler.style.cursor = state.cursor;
    }
    handler.addEventListener("pointerdown", onPointerDown);
    inited = true;
  }

  function stop() {
    if (!inited) return;

    finishDrag();

    if (boundHandler) {
      if (state.cursor) {
        boundHandler.style.cursor = "";
      }
      boundHandler.removeEventListener("pointerdown", onPointerDown);
    }

    boundHandler = null;
    inited = false;
  }

  function onPointerDown(e: PointerEvent) {
    if (e.button !== 0 || isDisabled()) return;
    if (activePointerId != null) return;

    const el = resolveEl();
    const handler = boundHandler ?? resolveHandler();
    if (!el || !handler) return;

    activePointerId = e.pointerId;
    state._.isDragging = true;
    state._.startX = e.clientX;
    state._.startY = e.clientY;
    state._.deltaX = 0;
    state._.deltaY = 0;
    state._.rect = el.getBoundingClientRect();
    state._.boundary = resolveContainer().getBoundingClientRect();

    el.classList.add("st-dragging");
    handler.setPointerCapture(e.pointerId);

    state.startDrag(state);

    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);
    document.addEventListener("pointercancel", onPointerUp);
  }

  function onPointerMove(e: PointerEvent) {
    if (!state._.isDragging || e.pointerId !== activePointerId) return;

    state._.deltaX = e.clientX - state._.startX;
    state._.deltaY = e.clientY - state._.startY;
    state.applyDrag(state);
  }

  function onPointerUp(e: PointerEvent) {
    if (!state._.isDragging || e.pointerId !== activePointerId) return;
    finishDrag();
  }

  watch(
    () => toValue(state.disabled),
    (disabled) => {
      if (disabled) {
        if (inited) stop();
      } else if (!inited) {
        init();
      }
    },
  );

  onMounted(() => {
    nextTick(() => {
      if (!isDisabled()) init();
    });
  });

  onBeforeUnmount(stop);

  return {
    state,
    init,
    stop,
  };
}
