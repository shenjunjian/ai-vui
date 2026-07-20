import { onUnmounted, shallowReactive, watch, type ShallowReactive } from "vue";
import "../theme/popper.less";
import { random } from "../utils/dataHelper";
import { applyClass } from "../utils/cssHelper";

export type PopperPlacement =
  | "top"
  | "right"
  | "bottom"
  | "left"
  | "top-start"
  | "top-end"
  | "right-start"
  | "right-end"
  | "bottom-start"
  | "bottom-end"
  | "left-start"
  | "left-end";

/** 目标元素（锚点） */
export type ReferenceElement = Element;

/** 裁剪/翻转边界元素 */
export type Boundary = Element;

export interface PopperOption {
  reference: null | ReferenceElement;
  popper: null | HTMLElement;
  /** 是否弹出 */
  show?: boolean;
  /** 默认出现的 12 个位置 */
  placement?: PopperPlacement;
  /**
   * 弹出层偏移量，支持正值和负值，默认 0。
   * - 单值：placement 交叉方向偏移（如 top 时向右，right 时向上）
   * - 双值：[交叉偏移, 远离目标的位移]
   */
  offset?: number | [number, number];
  /** 是否显示箭头，默认 true */
  arrowVisible?: boolean;
  /** 箭头边长（px），默认 8；写入 `--vai-popper-arrow-size` */
  arrowSize?: number;
  /** 箭头到弹出层四角的安全距离，默认 8 */
  arrowSafeOffset?: number;
  /**
   * 裁剪元素。默认为 reference 的 offsetParent。
   * 滚动时碰到边界会通过 position-try-fallbacks 向反方向翻转。
   * 注：Popover top layer 下翻转参照视口；自定义 boundary 目前作为语义保留。
   */
  boundary?: Boundary | null;
  /**
   * 边界预留 padding（非负）。
   * 浏览器 position-try-fallbacks 本身不支持 padding，该值仅写入 CSS 变量供样式层近似使用。
   */
  boundaryPadding?: number;
  /** 弹出后任意滚动则自动关闭 */
  autoHide?: boolean;
  /** 是否动画，默认 true */
  animate?: boolean;
  /** 添加到 Popper DOM 的自定义类名，支持空格分隔 */
  customClass?: string;
}

const BASE_GAP = 8;
const POPPER_CLASS = "vai-popper";
const ARROW_CLASS = "vai-popper--arrow";
const NO_ANIMATE_CLASS = "vai-popper--no-animate";

/**
 * Floating UI 风格 placement → CSS position-area。
 * -start：对齐起始边，并向另一侧跨格（如 bottom-start → bottom span-right，左对齐且可向右伸展）
 * -end：对齐结束边，并反向跨格
 */
const POSITION_AREA_MAP: Record<PopperPlacement, string> = {
  top: "top",
  "top-start": "top span-right",
  "top-end": "top span-left",
  bottom: "bottom",
  "bottom-start": "bottom span-right",
  "bottom-end": "bottom span-left",
  left: "left",
  "left-start": "left span-bottom",
  "left-end": "left span-top",
  right: "right",
  "right-start": "right span-bottom",
  "right-end": "right span-top",
};

const DEFAULT_OPTION: Required<PopperOption> = {
  reference: null,
  popper: null,
  show: false,
  placement: "bottom",
  offset: 0,
  arrowVisible: true,
  arrowSize: 8,
  arrowSafeOffset: 8,
  boundary: null,
  boundaryPadding: 0,
  autoHide: false,
  animate: true,
  customClass: "",
};

/**
 * 弹出层：基于 Popover API + CSS Anchor Positioning，将 popper 锚定到 reference。
 * 返回可写的 shallowReactive 配置，修改 `show` 等字段即可驱动显示与定位。
 */
export function usePopper(
  option: PopperOption = { reference: null, popper: null },
): ShallowReactive<Required<PopperOption>> {
  const anchorName = `--vai-popper-${random()}`;
  const state = shallowReactive<Required<PopperOption>>({
    ...DEFAULT_OPTION,
    ...option,
  });

  let boundReference: ReferenceElement | null = null;
  let boundPopper: HTMLElement | null = null;
  let appliedCustomClass = "";
  let scrollListening = false;
  let boundaryInitialized = option.boundary != null;

  const onScroll = () => {
    if (state.show) state.show = false;
  };

  const onToggle = (event: Event) => {
    const e = event as ToggleEvent;
    if (e.newState === "open") {
      if (!state.show) state.show = true;
    } else if (e.newState === "closed") {
      if (state.show) state.show = false;
    }
  };

  function syncAutoHide(enable: boolean) {
    if (typeof document === "undefined") return;
    if (enable && !scrollListening) {
      document.addEventListener("scroll", onScroll, true);
      scrollListening = true;
    } else if (!enable && scrollListening) {
      document.removeEventListener("scroll", onScroll, true);
      scrollListening = false;
    }
  }

  function unbindReference() {
    if (!boundReference) return;
    (boundReference as HTMLElement).style.removeProperty("anchor-name");
    boundReference = null;
  }

  function unbindPopper() {
    if (!boundPopper) return;
    boundPopper.removeEventListener("toggle", onToggle);
    if (boundPopper.matches(":popover-open")) {
      try {
        boundPopper.hidePopover();
      } catch {
        /* ignore */
      }
    }
    if (appliedCustomClass) {
      applyClass(boundPopper, appliedCustomClass, false);
      appliedCustomClass = "";
    }
    boundPopper.classList.remove(POPPER_CLASS, ARROW_CLASS, NO_ANIMATE_CLASS);
    boundPopper.removeAttribute("data-placement");
    boundPopper.style.removeProperty("position-anchor");
    boundPopper.style.removeProperty("position-area");
    boundPopper.style.removeProperty("margin");
    boundPopper.style.removeProperty("translate");
    boundPopper.style.removeProperty("--vai-popper-gap");
    boundPopper.style.removeProperty("--vai-popper-cross");
    boundPopper.style.removeProperty("--vai-popper-arrow-size");
    boundPopper.style.removeProperty("--vai-popper-arrow-safe");
    boundPopper.style.removeProperty("--vai-popper-boundary-padding");
    if (boundPopper.getAttribute("popover") === "manual") {
      boundPopper.removeAttribute("popover");
    }
    boundPopper = null;
  }

  function applyPlacementStyles(popper: HTMLElement) {
    const [cross, away] = Array.isArray(state.offset)
      ? state.offset
      : [state.offset, 0];
    const arrowSize = Math.max(0, state.arrowSize);
    const gap = (state.arrowVisible ? BASE_GAP + arrowSize : BASE_GAP) + away;
    const placement = state.placement;

    popper.dataset.placement = placement;
    popper.style.setProperty("position-anchor", anchorName);
    popper.style.setProperty("position-area", POSITION_AREA_MAP[placement]);
    popper.style.setProperty("--vai-popper-gap", `${gap}px`);
    popper.style.setProperty("--vai-popper-cross", `${cross}px`);
    popper.style.setProperty("--vai-popper-arrow-size", `${arrowSize}px`);
    popper.style.setProperty(
      "--vai-popper-arrow-safe",
      `${Math.max(0, state.arrowSafeOffset)}px`,
    );
    popper.style.setProperty(
      "--vai-popper-boundary-padding",
      `${Math.max(0, state.boundaryPadding)}px`,
    );

    // 主轴间隙 + 交叉轴偏移
    if (placement.startsWith("top")) {
      popper.style.margin = `0 0 ${gap}px`;
      popper.style.translate = `${cross}px 0`;
    } else if (placement.startsWith("bottom")) {
      popper.style.margin = `${gap}px 0 0`;
      popper.style.translate = `${cross}px 0`;
    } else if (placement.startsWith("left")) {
      popper.style.margin = `0 ${gap}px 0 0`;
      // left/right：正 offset 向下，负值向上
      popper.style.translate = `0 ${cross}px`;
    } else {
      popper.style.margin = `0 0 0 ${gap}px`;
      popper.style.translate = `0 ${cross}px`;
    }
  }

  function bindElements() {
    const { reference, popper } = state;

    if (boundReference !== reference) {
      unbindReference();
      if (reference) {
        (reference as HTMLElement).style.setProperty("anchor-name", anchorName);
        boundReference = reference;
        // 未显式指定 boundary 时，默认取 reference.offsetParent（仅初始化一次）
        if (!boundaryInitialized) {
          state.boundary =
            (reference as HTMLElement).offsetParent ?? document.documentElement;
          boundaryInitialized = true;
        }
      }
    }

    if (boundPopper !== popper) {
      unbindPopper();
      if (popper) {
        popper.popover = "manual";
        popper.classList.add(POPPER_CLASS);
        popper.addEventListener("toggle", onToggle);
        boundPopper = popper;
      }
    }
  }

  function syncPopperChrome() {
    const popper = boundPopper;
    if (!popper) return;

    applyPlacementStyles(popper);
    popper.classList.toggle(ARROW_CLASS, state.arrowVisible);
    popper.classList.toggle(NO_ANIMATE_CLASS, !state.animate);

    if (appliedCustomClass !== state.customClass) {
      if (appliedCustomClass) applyClass(popper, appliedCustomClass, false);
      if (state.customClass) applyClass(popper, state.customClass, true);
      appliedCustomClass = state.customClass;
    }
  }

  function syncVisibility() {
    const popper = boundPopper;
    if (!popper) return;

    const isOpen = popper.matches(":popover-open");
    if (state.show && !isOpen) {
      try {
        popper.showPopover();
      } catch {
        /* reference/popper 未连入文档时忽略 */
      }
    } else if (!state.show && isOpen) {
      try {
        popper.hidePopover();
      } catch {
        /* ignore */
      }
    }

    syncAutoHide(state.show && state.autoHide);
  }

  watch(
    () => state,
    () => {
      bindElements();
      syncPopperChrome();
      syncVisibility();
    },
    { flush: "post", immediate: true },
  );

  onUnmounted(() => {
    syncAutoHide(false);
    unbindPopper();
    unbindReference();
  });

  return state;
}
