# DialogBox

> 状态：**已完成** | 优先级：**P0** | 分类：**Overlay & Feedback 浮层与反馈**

## 概述

通用模态框/对话框（含 drawer）。渲染为原生 `<dialog>`，使用 TopLayer、`closedby` Light Dismiss、`requestClose` / `cancel` 等特性。

默认结构：头部（左侧标题、右侧关闭按钮）、可滚动正文、页脚（右侧取消 / 确定）。标题、正文、页脚均有插槽。正文按内容溢出自动出现水平 / 垂直滚动条。

支持遮罩、拖拽标题移动、尺寸缩放（dialog 原生 CSS resize；drawer 空闲边手柄）。

- **包**：`vai`
- **导出**：`Dialog`
- **组件类名**：`v-modal`；drawer 变体：`v-drawer-modal`
- **浏览器 API**：`<dialog>` / `showModal` / `closedby` / `requestClose`

## Props

| 属性               | 类型                                         | 默认值     | 说明                                                                                                                                                         |
| ------------------ | -------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `v-model:open`     | `boolean`                                    | `false`    | 是否打开                                                                                                                                                     |
| `title`            | `string`                                     | `''`       | 标题文案；可被 `title` 插槽覆盖                                                                                                                              |
| `show-close`       | `boolean`                                    | `true`     | 是否显示关闭图标                                                                                                                                             |
| `closedby`         | `'none' \| 'closerequest' \| 'any'`          | `'any'`    | Light Dismiss：`any` 点击遮罩或 Esc；`closerequest` 仅 Esc；`none` 仅开发者关闭                                                                              |
| `show-mask`        | `boolean`                                    | `true`     | 是否显示遮罩；为 `false` 时 backdrop 透明，仍走 `showModal` TopLayer                                                                                         |
| `mask-style`       | `'opaque' \| 'blur'`                         | `'opaque'` | 遮罩样式：半透明或毛玻璃                                                                                                                                     |
| `show-header`      | `boolean`                                    | `true`     | 显示 header                                                                                                                                                  |
| `show-footer`      | `boolean`                                    | `true`     | 显示 footer                                                                                                                                                  |
| `draggable`        | `boolean`                                    | `false`    | 是否允许拖动 header 移动；限制在视口（`document.documentElement`）内；`variant=drawer` 时强制失效                                                                                                        |
| `resizable`        | `boolean`                                    | `false`    | 是否可改尺寸；`dialog` 用 CSS `resize: both`（右下角）；`drawer` 在空闲边渲染手柄并用 `useDrag` 改宽/高                                                     |
| `auto-focus`       | `boolean`                                    | `true`     | 打开后自动聚焦第一个可聚焦元素；为 `false` 时聚焦到 dialog 根节点                                                                                            |
| `before-close`     | `() => boolean \| Promise<boolean>`          | —          | 关闭前拦截；返回 `false` / reject 则取消关闭                                                                                                                 |
| `destroy-on-close` | `boolean`                                    | `false`    | `false`：关闭后 dialog 仍挂载，靠 `display: none` + 离散过渡隐藏，并保留拖动 / 缩放后的位置与尺寸；`true`：关闭后 `v-if` 销毁整个 `<dialog>`，再次打开为默认居中位置与默认尺寸 |
| `variant`          | `'dialog' \| 'drawer'`                       | `'dialog'` | `dialog` 居中浮层；`drawer` 贴边抽屉（此时 `draggable` 失效，`resizable` 作用于空闲边）                                                                      |
| `placement`        | `'right' \| 'left' \| 'top' \| 'bottom'`     | `'right'`  | 仅 `drawer` 变体：弹出贴边位置                                                                                                                               |

## Events

| 事件         | payload | 说明               |
| ------------ | ------- | ------------------ |
| `opened`     | —       | 对话框已打开       |
| `closed`     | —       | 对话框已关闭       |
| `drag-start` | —       | 拖动开始           |
| `drag-move`  | —       | 拖动中             |
| `drag-end`   | —       | 拖动结束           |

## Slots

| 插槽      | 作用域                         | 说明                                       |
| --------- | ------------------------------ | ------------------------------------------ |
| `default` | `{ state, api, props }`        | 正文内容                                   |
| `title`   | `{ state, api, props }`        | 标题区；覆盖 `title` prop                  |
| `footer`  | `{ state, api, props }`        | 页脚；默认渲染取消 / 确定按钮              |
| `close`   | `{ state, api, props }`        | 关闭按钮内容；默认 `×` / `ci-close` 图标   |

## Exposed Methods

| 方法           | 签名 | 说明                                                                 |
| -------------- | ---- | -------------------------------------------------------------------- |
| `state`        | —    | 只读状态                                                             |
| `api.open`     | `()` | 直接打开（不经 `before-close`）                                      |
| `api.close`    | `()` | 直接关闭（不经 `before-close`）                                      |
| `api.requestClose` | `()` | 请求关闭；触发 `cancel`，经 `before-close` 拦截后再 `close` |

## State 模型

```ts
interface DialogState {
  rootClass: (string | Record<string, boolean>)[];
  /** destroyOnClose 时控制整个 dialog 是否挂载 */
  dialogMounted: boolean;
}
```

位置 / 尺寸不进 Vue 状态：拖动与缩放全程写 `el.style`，模板不绑定 `:style`，避免 `dialogStyle` / `offset` / `size` 引起组件更新。

**位置 / 尺寸保留策略**

- `destroy-on-close=false`：关闭时**不**清除拖动 / 缩放写入的 inline 样式（`margin-left` / `margin-top` / `width` / `height`），再次打开沿用上次位置与尺寸；避免关闭瞬间闪回中央。
- `destroy-on-close=true`：关闭销毁节点，再次打开是全新挂载，使用默认居中与默认尺寸，无需也不应手动 reset。

## Hook 依赖（hooks）

| Hook | 用途 |
| ---- | ---- |
| `useDrag` | header 拖动：位移、`shouldStart` 跳过交互控件、视口边界钳制；drawer `resizable` 时绑定空闲边手柄改宽/高 |

## 实现逻辑

1. 根节点为 `<dialog class="v-modal">`，打开时调用 `showModal()`，关闭时调用 `close()`。
2. `v-model:open` 与 dialog 的 open 状态双向同步；外部设为 `false` 走 `api.close()`（不经拦截）。
3. 关闭按钮、取消 / 确定、Light Dismiss、Esc 均走 `api.requestClose()` → 原生 `requestClose()` → `cancel` 事件；在 `cancel` 中 `preventDefault` 后异步执行 `before-close`，通过则再 `close()`。
4. `close` 事件：同步 `open=false`；`destroy-on-close=false` 时保留 inline 位置 / 尺寸，`true` 时卸载 dialog；触发 `closed`。
5. 关闭态 CSS：`display: none`；打开态：`display: flex`。通过 `transition` 的 `display` / `overlay` + `allow-discrete` 与 `@starting-style` 做进出场动画（`destroy-on-close=false` 时 dialog 常驻 DOM）。
6. `destroy-on-close=true`：整个 `<dialog>` 用 `v-if="dialogMounted"`，关闭后直接不渲染（不做退场离散动画）；再次打开为全新节点与默认位置 / 尺寸。
7. `variant=drawer`：加 `v-drawer-modal` + `is-{placement}`；忽略 `draggable`；贴边用显式 `inset` + `margin: 0`（覆盖原生 dialog UA 的 inline inset / `margin: auto` 居中，以及 `max-*-size: calc(100% - 2em - 6px)`，避免贴边留缝）；`resizable` 时在空闲边渲染 `v-modal__resize`，由 `useDrag` 在拖动开始记录宽/高，拖动中直接写 `el.style` 宽/高（不经 Vue 状态）；`is-resizing` 类取自 `useDrag` 的 `_.isDragging`。
8. `draggable`：`useDrag` 绑定 header → dialog；dialog 默认 `margin: auto` 居中；`startDrag` 用当前屏幕位置固化 `margin-left` / `margin-top`，`applyDrag` 按 `rect`/`boundary` 钳制后继续写这两项；发出 drag-*；`is-dragging` 类取自 `useDrag` 的 `_.isDragging`；节点晚就绪（如 `destroy-on-close`）时主动 `init()`。
9. `resizable` + `variant=dialog`：根节点加 `is-resizable`（`resize: both`），不渲染 resize 手柄；CSS resize 写入的 inline 尺寸在 `destroy-on-close=false` 时随关闭保留。
10. `auto-focus=false`：`showModal` 后将焦点落到 dialog 根（`tabindex="-1"`）。

## 无障碍（a11y）

- 原生 `<dialog>` 提供模态焦点陷阱与 Esc（受 `closedby` 约束）
- 标题：`aria-labelledby` 指向标题节点
- 关闭按钮：`aria-label="关闭"`
- `tabindex="-1"` 于 dialog，便于 `auto-focus=false` 时聚焦容器

## 动画

- 关闭：`display: none`；打开：`display: flex`
- 使用 `transition` 的 `display` / `overlay` + `allow-discrete`，配合 `@starting-style` 实现离散进出场
- **dialog**：透明度 + 轻微缩放
- **drawer**：按 `placement` 推拉位移
- `destroy-on-close=true` 时关闭直接卸载节点，无退场动画

## Web Component 预留

- Custom Element：`tvp-dialog`

## 验收标准

- [x] API 与本文档一致
- [x] 无障碍达标
- [x] 组件类名正确
- [x] 测试与演示页
