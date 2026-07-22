# useScrollLock

> 状态：**已实现** | 包：**hooks**

## 概述

锁定文档滚动，供 Dialog / Drawer 等 overlay 使用。

**能力：**

1. **冻结视口**：仅改 `body`：`overflow: hidden` + `position: fixed; top: -scrollY; left: -scrollX; right: 0`，锁定期间视口不随元素进出变化，也不因 `overflow` 清零滚动位置
2. **滚动条 gap 补偿**：存在经典滚动条占位（`innerWidth - clientWidth > 0`）且无 `scrollbar-gutter: stable` 时，累加 `body.padding-right`，避免锁/解锁横向晃动
3. **多层引用计数**：最后一次 `unlock` 才恢复
4. **显式启停**：`lock` / `unlock`；卸载自动 `unlock`

**边界：** Top Layer 上对 `<dialog>` 自身做 `translate` 仍可能撑开布局（浏览器特性，祖先 `overflow` 裁不到）。Drawer 须把位移做在壳内 panel，并由壳 `overflow: hidden` + `position: fixed` 裁剪——这是组件 CSS 职责，不是本 hook 的职责。

**使用方：** Dialog（先 `lock` 再 `showModal`；`close` 时立即 `unlock`）。

## 入参

```ts
function useScrollLock(): {
  lock: () => void;
  unlock: () => void;
  isLocked: Ref<boolean>;
};
```

## 返回值

```ts
{
  lock: () => void;
  unlock: () => void;
  isLocked: Ref<boolean>;
}
```

## 示例

```ts
const { lock, unlock } = useScrollLock();

function open() {
  lock();
  dialog.showModal();
}

function onClosed() {
  unlock();
}
```

## 实现逻辑

### lock

1. 幂等；`lockCount++`，仅首次真正改 DOM
2. 记下 `scrollX` / `scrollY` 与 body 相关 inline 样式
3. `body` → `overflow: hidden; position: fixed; top: -scrollY; left: -scrollX; right: 0`
4. `gap = innerWidth - documentElement.clientWidth`；若 `gap > 0` 且 `scrollbar-gutter` 非 `stable` → `padding-right = 原有 computed padding-right + gap`

### unlock

还原全部 inline；`scrollTo(savedScrollX, savedScrollY)`。

## 验收标准

- [x] 有滚动条 / 无滚动条均可锁定，解锁后滚动位置正确
- [x] 有经典滚动条时锁/解锁不横向晃动；`scrollbar-gutter: stable` 时不额外补 padding
- [x] 锁定期间向页面增删溢出元素，视口不抖动
- [x] 多层引用计数；卸载清理
- [x] 导出与 site 演示
