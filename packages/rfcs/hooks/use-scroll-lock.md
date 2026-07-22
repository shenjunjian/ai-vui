# useScrollLock

> 状态：**已实现** | 包：**hooks**

## 概述

锁定文档滚动，防止模态层打开后背景页面仍可滚动；**冻结当前视口位置**（避免 `overflow: hidden` 把页面甩回顶部）；并补偿滚动条消失导致的布局跳动。用于 Dialog / Drawer 等 overlay。

**能力：**

1. **视口冻结**：`body { position: fixed; top: -scrollY }`，打开瞬间停在原滚动位置
2. **文档滚动锁定**：`html` / `body` 设 `overflow: hidden`
3. **滚动条宽度补偿**：有纵向滚动条时写入 `body.padding-right`，避免内容左右抖动
4. **多层引用计数**：多个实例同时 `lock` 时共享一把锁，最后一个 `unlock` 才恢复样式并 `scrollTo` 原位置
5. **显式启停**：`lock` / `unlock`；组件卸载时自动 `unlock`

**非目标：** 不负责浮层内部滚动（由组件自身 `overflow` + `overscroll-behavior` 处理）。

**使用方：** Dialog（**先** `lock`、再 `showModal`；关闭时 `unlock`）；演示见 site `useScrollLock` 页。

## 入参

```ts
function useScrollLock(): {
  lock: () => void;
  unlock: () => void;
  isLocked: Ref<boolean>;
};
```

无入参。作用于 `document.documentElement` + `document.body`。

## 返回值

```ts
{
  lock: () => void;       // 锁定并冻结当前视口（本实例幂等）
  unlock: () => void;     // 解锁（本实例幂等；全局计数归零时恢复样式与 scrollY）
  isLocked: Ref<boolean>; // 本实例是否处于已 lock 状态
}
```

- **不要**在 `onMounted` 里无条件自动 `lock`。由调用方在「打开」时 `lock`、在「关闭」时 `unlock`。
- `onBeforeUnmount` 自动 `unlock`，防止样式泄漏。

## 示例

### Dialog：先锁位置再打开

```ts
const { lock, unlock } = useScrollLock();

function open() {
  lock(); // 先定在当前滚动位置
  dialog.showModal();
}

function onClosed() {
  unlock(); // 恢复样式并 scrollTo 原位置
}
```

### 手动演示

```ts
const { lock, unlock, isLocked } = useScrollLock();
```

```html
<button type="button" @click="lock">锁定滚动</button>
<button type="button" @click="unlock">解锁</button>
<p>isLocked: {{ isLocked }}</p>
```

## 实现逻辑

### 模块级共享状态

| 字段 | 说明 |
|------|------|
| `lockCount` | 当前已 lock 的实例数 |
| `savedScrollY` | 首次加锁时的 `window.scrollY` |
| `savedHtmlOverflow` / `savedBody*` | 首次加锁前保存的 inline 样式，便于完整还原 |

### lock

1. 本实例已 `isLocked` 则直接返回（幂等）
2. `lockCount++`；若变为 `1`：
   - 记录 `savedScrollY = window.scrollY` 与滚动条占位 `gapBefore`
   - 保存 `html.overflow`、`body` 的 `overflow` / `paddingRight` / `position` / `top` / `left` / `right` / `width`
   - `html`、`body` 设 `overflow: hidden`
   - 按实际腾出宽度计算 `gap`（`scrollbar-gutter: stable` / overlay 时为 0，不叠 padding）
   - **先** `body.style.top = -${savedScrollY}px`，**再** `position: fixed`（以及 `left/right/width`），避免写入间隙里 scrollY 被清零
   - `gap > 0` 时累加 `body.padding-right`
3. `isLocked = true`

### unlock

1. 本实例未 lock 则直接返回（幂等）
2. `lockCount--`；若变为 `0`：恢复全部保存的 inline 样式，再 `window.scrollTo(0, savedScrollY)`
3. `isLocked = false`

### 与 overlay 组件配合

- Dialog：**先** `lock`，再 `showModal`；聚焦补 `preventScroll`；`close` 路径 `unlock`
- 浮层内容区建议 `overscroll-behavior: contain`
- 站点也可长期设 `html { scrollbar-gutter: stable }`；本 hook 检测到 gutter 已占位时不会再叠 padding

## 验收标准

- [x] API：`lock` / `unlock` / `isLocked`
- [x] 不在 `onMounted` 自动锁定；卸载时自动 `unlock`
- [x] 多层 `lock` 引用计数正确；最后一次 `unlock` 才恢复样式与滚动位置
- [x] `overflow: hidden` 不会把页面甩到顶部（fixed + top 冻结）
- [x] 有滚动条时补偿 `padding-right`，关闭后还原
- [x] 由 `_index.ts` / 包入口导出
- [x] site 示例可演示锁定 / 解锁
- [x] Dialog 先 lock 再打开、关闭解锁
