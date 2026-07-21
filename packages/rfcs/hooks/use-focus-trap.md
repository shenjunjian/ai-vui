# useFocusTrap

> 状态：**已实现** | 包：**hooks**

## 概述

将键盘 Tab / Shift+Tab 焦点限制在指定容器内循环，并在激活时自动聚焦、停用时恢复先前焦点。用于非原生模态场景（如 DropdownMenu、非 `showModal` 的自定义浮层）；原生 `<dialog showModal()>` 已自带焦点陷阱，Dialog 组件不必依赖本 hook。

**能力：**

1. **Tab 循环**：容器内可聚焦元素首尾循环，焦点不可逃出
2. **初始聚焦**：支持指定初始焦点元素 / 区域；优先 `[autofocus]`
3. **焦点恢复**：`deactivate` 时把焦点还给激活前的元素
4. **显式启停**：`activate` / `deactivate`；组件卸载时自动 `deactivate`

**使用方：** DropdownMenu、Popover（非 modal）、自定义浮层；演示见 site `useFocusTrap` 页

## 入参

```ts
function useFocusTrap(
  container: MaybeRef<HTMLElement | null>,
  initialFocus?: MaybeRef<HTMLElement | null>,
): { activate: () => void; deactivate: () => void; isActive: Ref<boolean> };
```

| 参数           | 类型                            | 说明                                                                                                                                 |
| -------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `container`    | `HTMLElement \| null \| Ref<…>` | 焦点陷阱容器；Tab 仅在其内部可聚焦元素间循环                                                                                         |
| `initialFocus` | `HTMLElement \| null \| Ref<…>`？ | 可选。若为可聚焦元素则直接聚焦它；若为容器区域则在其内找首个可聚焦元素（如正文区，避免先落到关闭按钮）。缺省则在 `container` 内查找 |

每次 `activate` 通过 `toValue` 读取当前 DOM，不把 DOM 节点塞进 `reactive`。

## 返回值

```ts
{
  activate: () => void; // 开启陷阱：记录 previousFocus、绑 keydown、执行初始聚焦
  deactivate: () => void; // 关闭陷阱：解绑、恢复 previousFocus
  isActive: Ref<boolean>; // 是否处于激活态
}
```

- **不要**在 `onMounted` 里无条件自动 `activate`。由调用方在「打开」时 `activate`、在「关闭」时 `deactivate`。
- `onBeforeUnmount` 自动 `deactivate`，防止监听泄漏。

## 示例

### 打开时启用 / 关闭时停用

```ts
const panelRef = useTemplateRef<HTMLElement>("panel");
const open = ref(false);
const { activate, deactivate, isActive } = useFocusTrap(panelRef);

watch(open, (v) => {
  if (v) activate();
  else deactivate();
});
```

```html
<button type="button" @click="open = true">打开面板</button>
<div v-show="open" ref="panel" tabindex="-1" class="panel">
  <input placeholder="姓名" />
  <button type="button">确定</button>
  <button type="button" @click="open = false">关闭</button>
</div>
```

### 指定初始聚焦区域（避开关闭按钮）

```ts
const rootRef = useTemplateRef<HTMLElement>("root");
const bodyRef = useTemplateRef<HTMLElement>("body");
const { activate, deactivate } = useFocusTrap(rootRef, bodyRef);

function openPanel() {
  open.value = true;
  nextTick(() => activate());
}
```

```html
<div v-show="open" ref="root" class="panel" tabindex="-1">
  <button type="button" class="close" @click="close">关闭</button>
  <div ref="body">
    <input placeholder="会先聚焦这里" />
    <button type="button">提交</button>
  </div>
</div>
```

## 实现逻辑

### 可聚焦元素收集

选择器（在 `container` 内 `querySelectorAll`）：

- `input:not([type="hidden"]):not([disabled])`
- `select:not([disabled])` / `textarea:not([disabled])` / `button:not([disabled])`
- `a[href]` / `area[href]` / `summary`
- `[tabindex]:not([tabindex="-1"])`
- `[contenteditable="true"]`

过滤：`hidden` / `inert` 祖先；优先 `checkVisibility()`，否则 `display` / `visibility` + `getClientRects()`（**不用** `offsetParent`，以免误杀 `position: fixed`）。

每次 Tab 处理前重新收集，兼容动态增删节点。

### 初始聚焦顺序（activate）

1. `initialFocus`（有则）或 `container` 子树内的 `[autofocus]`
2. 否则若 `initialFocus` 自身可程序聚焦 → 聚焦它
3. 否则在 `initialFocus`（有则）或 `container` 内取首个可聚焦元素
4. 再否则若 `container` 可程序聚焦（如 `tabindex="-1"`）→ 聚焦容器

### Tab 循环

- 仅处理 `key === "Tab"`
- 无可用可聚焦元素：`preventDefault`，尝试聚焦 `container`
- `Shift+Tab` 且当前为第一个，或焦点已在容器外 / 不在列表中 → 聚焦最后一个
- `Tab` 且当前为最后一个，或焦点已在容器外 / 不在列表中 → 聚焦第一个
- 焦点在列表中间：交给浏览器默认行为

### 启停

1. `activate`：幂等；校验容器；保存 `document.activeElement`；绑定 `document` keydown；初始聚焦；`isActive = true`
2. `deactivate`：幂等；解绑；`previousFocus` 仍在文档中则 `focus()`；清空；`isActive = false`

## 验收标准

- [x] API：`activate` / `deactivate` / `isActive`；入参支持 `MaybeRef`
- [x] 不在 `onMounted` 自动激活；卸载时自动 `deactivate`
- [x] 初始聚焦顺序符合本文；`initialFocus` 语义正确
- [x] Tab / Shift+Tab 首尾循环；焦点在容器外时也能拉回
- [x] 不停用 `position: fixed` 可聚焦元素
- [x] `deactivate` 恢复先前焦点；无监听泄漏
- [x] 从 `_index.ts` / 包入口导出
- [x] site 示例页可演示 Tab 循环与 `initialFocus`
