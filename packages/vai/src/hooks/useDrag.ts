import {
  nextTick,
  onBeforeUnmount,
  onMounted,
  reactive,
  watch,
  type Ref,
} from "vue";

export type DragCallbackFn = (state: DragOption) => void;
export interface DragOption {
  /** 拖动的元素 */
  el: null | HTMLElement | Ref<HTMLElement | null>;
  /** 拖动的拖柄 */
  handler: null | HTMLElement | Ref<HTMLElement | null>;
  /** 拖动的拖柄的光标, 默认为‘move', 设置空字符串表示不添加光标 */
  cursor: string;
  /** 拖动元素的容器边界,默认是body */
  container: null | HTMLElement;
  /** ✅ 是否禁用拖动效果 */
  disabled: boolean | Ref<boolean>;
  /** 点击拖动开始时，可以记录目标当前的状态值。 */
  startDrag: DragCallbackFn;
  /** ✅ 移动时设置位置, 不同场景的定位模式需要不同的设置,比如绝对定位使用 left,top, 也可能使用 translate来设置或margin设置的情况
   * 所以要暴露一个函数,让用户有权利选择哪个方法去设置
   */
  applyDrag: DragCallbackFn;
  /** 内部状态值 */
  _: {
    isDragging: boolean;
    /** 点击的屏幕坐标 */
    startX: number;
    startY: number;
    /** 元素的大小 */
    rect: DOMRect;
    /** 边界的大小 */
    boundary: DOMRect;
    deltaX: number;
    deltaY: number;
    /** 用户缓存一些变量 */
    [others: string]: any;
  };
}

/** 默认配置 */
const defaultOption: Partial<DragOption> = {
  el: null,
  handler: null,
  cursor: "move",
  container: document.body,
  disabled: false,
  applyDrag: () => {},
  _: {
    isDragging: false,
    startX: 0, // 点击的屏幕坐标
    startY: 0,
    rect: new DOMRect(), // 元素的大小
    boundary: new DOMRect(), // 边界的大小
    /** 实时偏移量 */
    deltaX: 0,
    deltaY: 0,
  },
};
/** 通用的拖动逻辑,比如元素在某个容器内拖动。 它区别于dnd的drag and drop行为，它没有释放目标
 */
export function useDrag(option: Partial<DragOption> = {}) {
  const state = reactive(
    Object.assign({}, defaultOption, option)
  ) as DragOption;

  let inited = false;

  /** 初始化拖动 */
  function init() {
    if (inited) return;

    if (state.el == null || state.handler == null) {
      console.warn("目标元素和拖动手柄未设置");
      return;
    }

    state.handler.style.cursor = state.cursor;
    state.handler.addEventListener("pointerdown", onMouseDown);
    inited = true;
  }

  function stop() {
    if (!inited) return;

    state.handler!.style.cursor = "";
    state.handler!.removeEventListener("pointerdown", onMouseDown);

    if (state._.isDragging) {
      document.removeEventListener("pointermove", onMouseMove);
      document.removeEventListener("pointerup", onMouseUp);
    }
    inited = false;
  }
  /** 绑定在拖动handler的click事件 */
  function onMouseDown(e: PointerEvent) {
    // 只处理左键
    if (e.button !== 0) return;

    state._.isDragging = true;
    state._.startX = e.clientX;
    state._.startY = e.clientY;

    // 拖拽过程中,默认为元素和container的大小不会变化
    state._.rect = state.el!.getBoundingClientRect();
    state._.boundary = state.container!.getBoundingClientRect();

    state.el!.classList.add("st-dragging");

    // e.preventDefault(); // 阻止默认行为（避免文本选中）， 但也会阻止内部的click， mousedown 等事件的触发
    state.handler?.setPointerCapture(e.pointerId); // 指针捕获，拖拽，滑块等建议要使用它

    state.startDrag(state);

    // 绑定全局事件
    document.addEventListener("pointermove", onMouseMove);
    document.addEventListener("pointerup", onMouseUp);
  }

  function onMouseMove(e: PointerEvent) {
    if (!state._.isDragging) return;

    state._.deltaX = e.clientX - state._.startX;
    state._.deltaY = e.clientY - state._.startY;

    // 更新位置
    state.applyDrag(state);
  }

  function onMouseUp(e: PointerEvent) {
    if (!state._.isDragging) return;

    state.el!.classList.remove("st-dragging");
    // 移除全局事件
    document.removeEventListener("pointermove", onMouseMove);
    document.removeEventListener("pointerup", onMouseUp);

    state._.isDragging = false;
  }

  watch(
    () => state.disabled,
    (disabled) => {
      if (disabled && inited) {
        stop();
      } else if (!inited) {
        init();
      }
    }
  );

  onMounted(() => {
    nextTick(() => {
      if (!state.disabled) {
        init();
      }
    });
  });

  onBeforeUnmount(() => {
    stop();
  });

  return {
    state,
    init,
    stop,
  };
}
