# useScrollLock

> 状态：**已实现** | 包：**hooks**

## 概述

锁定文档滚动，防止模态层打开后背景页面仍可滚动，并补偿滚动条消失导致的布局跳动。用于 Dialog / Drawer 等 overlay。

**能力：**

1. **文档滚动锁定**：对 `document.documentElement` 设 `overflow: hidden`
2. **滚动条宽度补偿**：有纵向滚动条时写入 `padding-right`，避免内容左右抖动
3. **多层引用计数**：多个实例同时 `lock` 时共享一把锁，最后一个 `unlock` 才恢复
4. **显式启停**：`lock` / `unlock`；组件卸载时自动 `unlock`

**非目标：** 不负责浮层内部滚动（由组件自身 `overflow` + `overscroll-behavior` 处理）。

**使用方：** Dialog（打开时 `lock`、关闭时 `unlock`）；演示见 site `useScrollLock` 页。

## 入参

```ts
function useScrollLock(): {
  lock: () => void;
  unlock: () => void;
  isLocked: Ref<boolean>;
};
```

无入参。目标固定为 `document.documentElement`（`<html>`）。

## 返回值

```ts
{
  lock: () => void;       // 锁定文档滚动（本实例幂等）
  unlock: () => void;     // 解锁（本实例幂等；全局计数归零时恢复样式）
  isLocked: Ref<boolean>; // 本实例是否处于已 lock 状态
}
```

- **不要**在 `onMounted` 里无条件自动 `lock`。由调用方在「打开」时 `lock`、在「关闭」时 `unlock`。
- `onBeforeUnmount` 自动 `unlock`，防止样式泄漏。

## 示例

### Dialog 打开 / 关闭

```ts
const { lock, unlock } = useScrollLock();

function open() {
  dialog.showModal();
  lock();
}

function onClosed() {
  unlock();
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
| `savedHtmlOverflow` / `savedBodyOverflow` / `savedBodyPaddingRight` | 首次加锁前保存的 inline 样式，便于完整还原 |

### lock

1. 本实例已 `isLocked` 则直接返回（幂等）
2. `lockCount++`；若变为 `1`：
   - 记录锁定前滚动条占位：`gapBefore = innerWidth - documentElement.clientWidth`
   - 保存 `html` / `body` 的 `overflow`，以及 `body` 的 `paddingRight`
   - 设 `html`、`body` 的 `overflow = hidden`
   - 再测 `gapAfter`；**仅按实际腾出宽度** `gap = gapBefore - gapAfter` 补偿（`scrollbar-gutter: stable` 或 overlay 滚动条时 gap 为 0，不再加 padding，避免内容左移）
   - 测试环境若 `clientWidth` 不随 overflow 变化：在 gutter 非 stable 时回退用 `gapBefore`
   - `gap > 0` 时：在 `body` 当前 `padding-right` 上累加 `gap`
3. `isLocked = true`

### unlock

1. 本实例未 lock 则直接返回（幂等）
2. `lockCount--`；若变为 `0`：恢复保存的 `html`/`body` overflow 与 `body` paddingRight
3. `isLocked = false`

### 与 overlay 组件配合

- Dialog：`showModal` 成功后 `lock`；`close` 事件 / 关闭路径中 `unlock`
- 浮层内容区建议 `overscroll-behavior: contain`，避免内部滚到边界后穿透（由组件 CSS 负责，非本 hook）
- 站点也可长期设 `html { scrollbar-gutter: stable }`；本 hook 检测到 gutter 已占位时不会再叠 padding

## 验收标准

- [x] API：`lock` / `unlock` / `isLocked`
- [x] 不在 `onMounted` 自动锁定；卸载时自动 `unlock`
- [x] 多层 `lock` 引用计数正确；最后一次 `unlock` 才恢复样式
- [x] 有滚动条时补偿 `padding-right`，关闭后还原
- [x] 由 `_index.ts` / 包入口导出
- [x] site 示例可演示锁定 / 解锁
- [x] Dialog 打开锁定、关闭解锁
