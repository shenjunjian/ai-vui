# DialogBox

> 状态：**开发中** | 优先级：**P0** | 分类：**Overlay & Feedback 浮层与反馈**

## 概述

通用模态框/对话框（含 drawer/modal等功能）。 渲染为原生的 <dialog> 元素，使用它的TopLayer， Dialog Light Dismiss 等特性

默认有头部，正文和页脚， 头部左侧是标题，右侧是关闭按钮， 页脚的右边有取消和确定2个按钮。
标题，正文和页脚都有相应插槽以方便用户定制。 正文区根据内部元素大小，自动有水平或垂直的滚动条

有遮罩层功能，点击能关闭或不能关闭。

可拖动右下脚改变大小以及拖动header区可在屏幕移动

- **包**：`vai`
- **导出**：`Dialog`
- **组件类名**：`v-modal`（规划，scene-theme 尚未实现）
- **浏览器 API**：<dialog>

## Props

| 属性 | 类型 | 默认值 | 说明 |
| ---- | ---- | ------ | ---- |

| `v-model:open` | `boolean` | 是否打开 |
| `title` | `string` | ``|标题 |
|`show-close`|`boolean`|`true`| 是否可见关闭图标 |
|`closedby`|`none \| closerequest \| any`|`false`| Light Dismiss标记 |
|`show-mask`|`boolean`|`true`| 显示遮罩层 |
|`mask-style`|`"opaque", "blur"`|`opaque`| 遮罩层样式，半透明或毛玻璃 |
|`show-header`|`boolean`|`true`| 显示header区 |
|`show-footer`|`boolean`|`true`| 显示footer区 |
|`draggable`|`boolean`|`false`| 是否允许点击标题拖动 |
|`resizable`|`boolean`|`false`| 是否允许改变窗口大小 |
|`auto-focus`|`boolean`|`true`| 打开窗口后自动聚焦第一个可聚焦元素 |
|`before-close`|`() => boolean \| Promise<boolean>`|``| 关闭前拦截； |
|`destroy-on-close`|`boolean`|`false` | 是否关闭时，销毁所有元素。默认为false,使用v-show来切换显示 加载时直接加载子组件，关闭时仅隐藏。 当设置其为true时，关闭时，用v-if 来销毁整个组件内的元素。 |
| `variant` | `'dialog' \| 'drawer' ` | `'dialog'` | 外观变体：`dialog` 即默认状态。 `drawer`变体时，它固定在浏览器的四周，且此时draggable失效， resizable变为拖动空闲的那条边 |
| `placement` | `right,left,top,bottom` | `right`|draw变体时，它的弹出位置 |

> 待细化：补充 Dialog 专属 props。

## Events

| 事件       | payload | 说明               |
| ---------- | ------- | ------------------ |
| opened     | —       | 对话框打开事件     |
| closed     | —       | 对话框关闭事件     |
| drag-start | —       | 对话框拖动开始事件 |
| drag-move  | —       | 对话框拖动中事件   |
| drag-end   | —       | 对话框拖动结束事件 |

## Slots

| 插槽      | 说明     |
| --------- | -------- |
| `default` | 默认内容 |
| `title`   | 标题内容 |
| `footer`  | 页脚内容 |

> 待细化：补充 Dialog 专属 named slots。

## Exposed Methods

| 方法         | 签名 | 说明                                                       |
| ------------ | ---- | ---------------------------------------------------------- |
| open         | —    | 直接打开对话框                                             |
| close        | —    | 直接关闭对话框                                             |
| requestClose | —    | 请求关闭对话框，如果有before-close属性，会经过它拦截判断。 |

## State 模型

```ts
interface DialogState {
  // 待定义
}
```

## Hook 依赖（hooks）

| Hook | 用途   |
| ---- | ------ |
| —    | 待补充 |

## 实现逻辑

> 待细化：Dialog 交互流程。

## 无障碍（a11y）

- **role / aria / 键盘 / 焦点**：待定

## 动画

- dialog变体的打开或关闭时，需要动画
- drawer变体的打开或关闭时，需要推拉动画

## Web Component 预留

- Custom Element：`tvp-dialog`

## 验收标准

- [ ] API 与本文档一致
- [ ] 无障碍达标
- [ ] 组件类名正确
- [ ] 测试与演示页
