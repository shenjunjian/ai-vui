# usePopper

> 状态：**已实现** | 包：**hooks**

## 概述

弹出层功能：实现在页面上的dom元素四周弹出一个新dom， 随着页面滚动也不分离的场景。页面上的dom称为 reference 元素或目标元素， 弹出层元素为 popper 元素。
弹出层默认与目标元素有一定的间隙 8px, 有箭头时，这个间隙会更大。 用户可以通过 offset 来定制弹出层的具体偏移。

它目标是使用在 select, datetime picker ，tooltip等组件中，提供原始的弹出能力。

**能力：**

1. 使用浏览器最新的 Popover API, 以及锚定容器查询的功能 和 锚点 fallbacks 功能， 不用考虑兼容低版本浏览器

## 入参

```ts
function usePopper(option: PopperOption): ShallowReactive<Required<PopperOption>>;
```

| 参数     | 类型         | 说明                 |
| -------- | ------------ | -------------------- |
| `option` | PopperOption | 设置弹出层的详细配置 |

## 返回值

```ts
interface PopperOption {
  reference: null | ReferenceElement;
  popper: null | HTMLElement;
  /** ✅ 是否弹出 */
  show?: boolean;
  /** ✅ 默认出现的12个位置 */
  placement?:
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
  /** ✅ 弹出层偏移量 支持 正值和负值, 默认值为 0
   * 传入一个值，表示弹出层在 placement 的交叉方向的偏移，比如： placement:top,  offset=2, 那么就是在top位置下，向右位移2px，  placement:right时， offset: -4, 就是在right值下，向上偏移4px
   *
   * 传入2个值， 第一个值等同上面的行为。 第二个值表示弹出层远离目标层的位移值。
   */
  offset?: number | [number, number];
  /** ✅ 是否显示箭头, 默认为true */
  arrowVisible?: boolean;
  /** ✅ 箭头的安全距离， 防止箭头到弹出层的外面去，默认值为8, 表示箭头的位置启动在弹出层的四个边上，且到四个角有8px的安全距离 */
  arrowSafeOffset?: number;

  /** ✅ 裁剪元素， 默认为reference 元素的offsetParent 元素。 此处可自定义为新元素。 当滚动时弹出层碰到boundary元素时，需要自动向反方向反转， 使用  position-try-fallbacks 的策略 */
  boundary?: Boundary | null;
  /**
   * ✅ 边界预留padding，非负数. 设置后，期望弹出层快到边界时提前翻转。
   *
   * ⚠️ 浏览器限制：`position-try-fallbacks` **不支持** 设置 padding。
   * 翻转时机由 overflow containing block（Popover top layer 下通常为视口）决定，
   * 没有类似 Floating UI `padding` 的原生参数。
   * 当前实现将该值写入 CSS 变量 `--vai-popper-boundary-padding`，供样式层自行近似；
   * 若需精确提前翻转，需另行用 IntersectionObserver + rootMargin 或自定义 `@position-try`。
   */
  boundaryPadding?: number;

  /** ✅ 元素弹出后，有任何滚动都自动关闭popper， 适用于右键菜单打开后，滚动就或日期组件在滚动时自动关闭 */
  autoHide?: boolean;
  /** ✅ 是否动画。 默认值为true, 弹出层出现和消失，需要有动画效果。 当设置为false时，取消动画 */
  animate?: boolean;

  /** ✅ 添加到Popper dom的自定义类名，  支持空格分隔的多个类名 */
  customClass?: string;
}
```

## 示例

### 防重复点击（Button）

```ts
const popperOption = usePopper({
  reference: targetEl,
  popper: popperEl,
  show: false,
  arrowVisible: true,
});

// 触发打开
popperOption.show = true;

// 触发关闭
popperOption.show = false;
```

## 实现逻辑

1. 用户初始传入目标元素和弹出层元素，给它绑定上popover API（`popover="manual"`）与 `anchor-name` / `position-anchor`
2. 通过 `position-area` + `position-try-fallbacks: flip-block, flip-inline` 做 12 方位与边界翻转
3. 小箭头使用 `::before` 伪元素实现（`background/border: inherit`，内侧两边透明），并用 `arrowSafeOffset` 做四角 clamp；`.vai-popper` 需 `overflow: visible`，以覆盖 Popover UA 默认的 `overflow: auto`（否则箭头会被裁切）
4. `show` 驱动 `showPopover` / `hidePopover`；`animate` 控制 CSS 过渡；`autoHide` 在捕获阶段监听 scroll
5. 组件卸载时，清除锚点、类名、popover 状态与滚动监听

## 验收标准

- [x] 基础 API：show / placement / offset / arrow / customClass / animate / autoHide
- [x] 无泄漏：卸载时清理锚点、样式、事件
- [x] 单测覆盖
- [x] `boundaryPadding`：已确认原生 `position-try-fallbacks` 不支持 padding，并在规范中说明
