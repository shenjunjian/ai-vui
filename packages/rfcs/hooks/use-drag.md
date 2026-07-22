# useDrag

> 状态：**已实现** | 包：**hooks**

## 概述

通用「按住拖动」逻辑：在容器坐标系内移动元素位置。区别于 HTML5 DnD / `useSortable`——**没有 drop target**，只负责 pointer 生命周期与位移数据，**如何写样式由调用方决定**。

**能力：**

1. **手柄拖动**：在 `handler` 上 `pointerdown` 开始；可与被拖元素 `el` 分离（如 Dialog header）
2. **位移数据**：提供 `startX/Y`、`deltaX/Y`、元素 `rect`、边界 `boundary`
3. **定位策略外置**：`startDrag` / `applyDrag` / `endDrag` 自行写 `left/top`、`translate`、`margin` 等
4. **禁用 / 启停**：`disabled`；暴露 `init` / `stop`；卸载时自动 `stop`

**非目标：** 列表排序、跨容器 drop、文件拖放（见 `useSortable` / 原生 DnD）。

**使用方：** Dialog（`draggable`）、可拖浮层；演示见 site `useDrag` 页。

## 入参

```ts
function useDrag(option?: Partial<DragOption>): {
  state: DragOption;
  init: () => void;
  stop: () => void;
};
```

| 字段 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `el` | `MaybeRef<HTMLElement \| null>` | `null` | 被拖动的元素 |
| `handler` | `MaybeRef<HTMLElement \| null>` | 同 `el` | 响应 pointer 的手柄；缺省时使用 `el` |
| `cursor` | `string` | `'move'` | 手柄光标；`''` 表示不改 |
| `container` | `HTMLElement \| null` | `document.body`（读取时解析） | 边界参考元素，用于 `_ .boundary` |
| `disabled` | `MaybeRef<boolean>` | `false` | 为 true 时解绑；拖拽中会立即 `stop` 并收尾 |
| `startDrag` | `(state) => void` | `() => {}` | pointerdown 进入拖拽后调用，可缓存初始 left/top 等 |
| `applyDrag` | `(state) => void` | `() => {}` | pointermove 时调用，根据 `delta*` 写位置 |
| `endDrag` | `(state) => void` | `() => {}` | pointerup / pointercancel / `stop` 打断时调用 |

### 内部状态 `state._`

| 字段 | 说明 |
|------|------|
| `isDragging` | 是否处于拖拽 |
| `startX` / `startY` | 按下时的 `clientX/Y` |
| `deltaX` / `deltaY` | 相对起点的偏移 |
| `rect` | 开始时 `el.getBoundingClientRect()` |
| `boundary` | 开始时 `container.getBoundingClientRect()` |
| `[key: string]: unknown` | 调用方在 `startDrag` 里缓存自定义字段 |

**约定：** `_` **每个实例必须独立对象**，禁止多实例共享默认 `_` 引用。边界钳制由 `applyDrag` 用 `rect` / `boundary` 自行计算，hook 不自动改样式。

## 返回值

```ts
{
  state: DragOption; // reactive；含配置与 `_`
  init: () => void;  // 幂等绑定 handler
  stop: () => void;  // 解绑；若正在拖须完整收尾
}
```

- 挂载后若 `el` / `handler` 已就绪且未 `disabled`，会自动 `init` 一次。
- **若元素晚就绪**（如 `v-if` / 异步打开），**不会**监听 DOM 变化；调用方在节点可用后**主动调用 `init()`**。
- `onBeforeUnmount` 自动 `stop`，防止监听泄漏。

## 示例

### 绝对定位 + 边界钳制

```ts
const box = useTemplateRef<HTMLElement>("box");
const stage = useTemplateRef<HTMLElement>("stage");

const { state } = useDrag({
  el: box,
  container: null, // 可在 onMounted 后赋值为 stage.value
  startDrag(s) {
    const el = toValue(s.el)!;
    const style = getComputedStyle(el);
    s._.originLeft = parseFloat(style.left) || 0;
    s._.originTop = parseFloat(style.top) || 0;
  },
  applyDrag(s) {
    const el = toValue(s.el)!;
    const { rect, boundary, deltaX, deltaY } = s._;
    let left = (s._.originLeft as number) + deltaX;
    let top = (s._.originTop as number) + deltaY;
    const maxX = boundary.width - rect.width;
    const maxY = boundary.height - rect.height;
    left = Math.min(Math.max(0, left), maxX);
    top = Math.min(Math.max(0, top), maxY);
    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
  },
});
```

### 晚就绪：打开后再 `init`

```ts
const panel = useTemplateRef<HTMLElement>("panel");
const open = ref(false);
const { init, stop } = useDrag({
  el: panel,
  applyDrag(s) {
    const el = toValue(s.el)!;
    el.style.translate = `${s._.deltaX}px ${s._.deltaY}px`;
  },
});

watch(open, async (v) => {
  if (v) {
    await nextTick();
    init(); // DOM 已挂载后再绑定
  } else {
    stop();
  }
});
```

### Dialog header 作手柄

```ts
useDrag({
  el: dialogRef,
  handler: headerRef,
  startDrag(s) {
    const el = toValue(s.el)!;
    const t = el.style.translate.match(/(-?\d+(?:\.\d+)?)px\s+(-?\d+(?:\.\d+)?)px/);
    s._.baseX = t ? Number(t[1]) : 0;
    s._.baseY = t ? Number(t[2]) : 0;
  },
  applyDrag(s) {
    const el = toValue(s.el)!;
    el.style.translate = `${(s._.baseX as number) + s._.deltaX}px ${(s._.baseY as number) + s._.deltaY}px`;
  },
});
```

## 实现逻辑

1. **init**：解析 `toValue(el)`；`handler` 缺省用 `el`；设 `cursor`；绑定 `pointerdown`；幂等。元素缺失则 `warn` 并返回。
2. **pointerdown**（仅主按钮、校验 `pointerId`）：记录起点与 `rect`/`boundary`；加 `st-dragging`；`setPointerCapture`；`startDrag`；在 document 上听 `pointermove` / `pointerup` / `pointercancel`。
3. **pointermove**：按 `pointerId` 过滤；更新 `delta*` → `applyDrag`。
4. **pointerup / pointercancel / stop**：去 class、解绑、`releasePointerCapture`、`isDragging = false`、`endDrag`。
5. **disabled**：`true` → `stop`；`false` 且未 init → 尝试 `init`（仍可能因 DOM 未就绪失败，需调用方稍后 `init`）。
6. **不** watch `el` / `handler` 的晚就绪；由调用方显式 `init()`。

### 与周边约定

- 拖拽中 class：`st-dragging`（与现有 dialog 前缀一致）。
- 触控：手柄建议 `touch-action: none`。
- 不替代 `useSortable`。

## 验收标准

- [x] 每实例独立 `_`；无共享可变默认状态
- [x] `disabled` 启停正确；禁用中不会 init
- [x] `el`/`handler` 晚就绪不自动绑定；调用方主动 `init`
- [x] `startDrag` / `endDrag` 默认 noop；缺省不抛错
- [x] `handler` 缺省等于 `el`
- [x] `pointercancel` / 中途 `stop` 完整收尾；`pointerId` 过滤
- [x] 从 `_index.ts` / 包入口导出
- [x] 单测：启停、disabled、多实例、收尾
- [x] site 示例：容器内拖动 + 晚就绪 `init`
