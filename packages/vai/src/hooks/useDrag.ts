import {
  nextTick,
  onBeforeUnmount,
  onMounted,
  reactive,
  watch,
  type MaybeRef,
} from "vue";
import { NOOP } from "@vue/shared";

export type DragCallbackFn = (state: DragOption) => void;
/** 返回 false 时不进入拖拽（尚未 capture / 未改状态） */
export type DragShouldStartFn = (event: PointerEvent) => boolean;

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

/** reactive state：MaybeRef 入参解包后的形态 */
export interface DragOption {
  /** 被拖动的元素 */
  el: HTMLElement | null;
  /** 拖动手柄；缺省时与 `el` 相同 */
  handler: HTMLElement | null;
  /** 手柄上光标，默认 `move`；空字符串表示不修改。有的场景是左右或上下拖动，光标用ew-resize	或ns-resize  */
  cursor: string;
  /** 边界参考元素，默认 `document.body`；用于填充 `_.boundary` */
  container: HTMLElement | null;
  /** 是否禁用拖动 */
  disabled: boolean;
  /** pointerdown 时决定是否开始拖拽，默认允许；比如点击在拖动手柄中的close按钮了，要拦截它 */
  shouldStart: DragShouldStartFn;
  /** 拖动开始：可记录初始 left/top 等 */
  startDrag: DragCallbackFn;
  /** 拖动中：根据 `delta*` 写位置（left/top、translate、margin 等由调用方决定） */
  applyDrag: DragCallbackFn;
  /** 拖动结束（pointerup / pointercancel / stop 中途打断） */
  endDrag: DragCallbackFn;
  /** 内部状态（每实例独立） */
  _: DragInternalState;
}

/** useDrag 入参：可响应字段接受 MaybeRef */
export type DragOptionInput = Partial<{
  el: MaybeRef<HTMLElement | null>;
  handler: MaybeRef<HTMLElement | null>;
  cursor: MaybeRef<string>;
  container: MaybeRef<HTMLElement | null>;
  disabled: MaybeRef<boolean>;
  shouldStart: DragShouldStartFn;
  startDrag: DragCallbackFn;
  applyDrag: DragCallbackFn;
  endDrag: DragCallbackFn;
}>;

const allowStart: DragShouldStartFn = () => true;

const defaultOption: Omit<DragOption, "_"> = {
  el: null,
  handler: null,
  cursor: "move",
  container: null,
  disabled: false,
  shouldStart: allowStart,
  startDrag: NOOP,
  applyDrag: NOOP,
  endDrag: NOOP,
};

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

/**
 * 通用拖动：在容器坐标系内移动元素。区别于 DnD / useSortable——没有 drop target。
 * `el` / `handler` 若在挂载时尚未就绪，需在 DOM 可用后主动调用 `init()`。
 * 入参中的 MaybeRef 放入 reactive 后会自动解包，逻辑内按普通值访问即可。
 */
export function useDrag(option: DragOptionInput = {}) {
  const state = reactive({
    ...defaultOption,
    ...option,
    _: createInternalState(),
  }) as DragOption;

  let inited = false;
  let boundHandler: HTMLElement | null = null;
  let activePointerId: number | null = null;

  function finishDrag() {
    if (!state._.isDragging) return;

    state.el?.classList.remove("st-dragging");

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
    if (inited || state.disabled) return;

    const el = state.el;
    const handler = state.handler ?? el;
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
    if (e.button !== 0 || state.disabled) return;
    if (activePointerId != null) return;
    if (!state.shouldStart(e)) return;

    const el = state.el;
    const handler = boundHandler ?? state.handler ?? el;
    if (!el || !handler) return;

    activePointerId = e.pointerId;
    state._.isDragging = true;
    state._.startX = e.clientX;
    state._.startY = e.clientY;
    state._.deltaX = 0;
    state._.deltaY = 0;
    state._.rect = el.getBoundingClientRect();
    state._.boundary = (
      state.container ?? document.body
    ).getBoundingClientRect();

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
    () => state.disabled,
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
      if (!state.disabled) init();
    });
  });

  onBeforeUnmount(stop);

  return {
    state,
    init,
    stop,
  };
}
