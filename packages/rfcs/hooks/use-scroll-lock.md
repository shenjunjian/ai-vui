# useScrollLock

> 状态：**已实现** | 包：**hooks**

## 概述

锁定文档滚动，供 Dialog / Drawer 等 overlay 使用。

**能力：**

1. **冻结视口**：`html`/`body` `overflow: hidden` + `body { position: fixed; top: -scrollY; width: 100% }`，锁定期间页面宽高不随元素进出变化
2. **滚动条补偿**：仅存在经典滚动条占位（且无 `scrollbar-gutter: stable`）时写 `body.padding-right`，避免锁/解锁横向跳动
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
2. 记下 `scrollY` 与相关 inline 样式
3. `html`/`body` → `overflow: hidden`
4. `body` → `position: fixed; top: -scrollY; left/right: 0; width: 100%`（有无滚动条、是否已滚动都一样）
5. 有经典滚动条 gap 且无 stable gutter → 累加 `body.padding-right`

### unlock

还原全部 inline；`scrollTo(0, savedScrollY)`。

## 验收标准

- [x] 有滚动条 / 无滚动条均可锁定，解锁后滚动位置正确
- [x] 锁定期间向页面增删溢出元素，视口不抖动
- [x] 多层引用计数；卸载清理
- [x] 导出与 site 演示
