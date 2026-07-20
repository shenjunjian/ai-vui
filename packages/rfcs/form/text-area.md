# TextArea

> 状态：**已实现** | 优先级：**P0** | 分类：**Form & Input 表单录入**

## 概述

多行输入（含 Mention，后续迭代）。渲染为 `<textarea>` 元素。

支持主题色（仅影响 border 与文字）。用户自定义事件与 textarea 常见属性（如 `cols` / `rows` / `maxlength` / `minlength` / `placeholder` / `name`），通过属性继承传递到内部 `<textarea>` 元素。可通过 `style` 控制 `resize`（`both` / `vertical` / `horizontal` / `none`）。

支持自动控制行高：`autoSize` 属性支持 `{ minRows: number, maxRows: number }`。指定后 textarea 最小显示 `minRows` 行、最大显示 `maxRows` 行，并随输入内容自动调整高度（此时强制 `resize: none`）。未指定时，高度依赖透传的 `rows` 属性。

`show-count` 开启后，用灰色字显示在 textarea 右下角；若同时透传 `maxlength`，显示为 `当前/最大`。

- **包**：`vai`
- **导出**：`TextArea`
- **scene-theme 类名**：`sc-textarea`（组件内实现）

## Props

| 属性         | 类型                                                 | 默认值        | 说明                                                                 |
| ------------ | ---------------------------------------------------- | ------------- | -------------------------------------------------------------------- |
| `v-model`    | `string`                                             | `''`          | 输入值                                                               |
| `size`       | `'sm' \| 'md' \| 'lg'`                               | `'md'`        | 尺寸                                                                 |
| `theme`      | `'success' \| 'info' \| 'warn' \| 'error' \| 'dark'` | —             | 语义主题色，只影响 border 和文字                                     |
| `disabled`   | `boolean`                                            | `false`       | 禁用态                                                               |
| `autoSize`   | `{ minRows: number, maxRows: number }`               | `undefined`   | 指定最小/最大行数，随内容自动调整高度                                |
| `show-count` | `boolean`                                            | `false`       | 是否显示字符数；若透传 `maxlength` 则显示 `当前/最大`（右下角灰色字） |

## Events

| 事件                | payload  | 说明         |
| ------------------- | -------- | ------------ |
| `update:modelValue` | `string` | v-model 更新 |

## Slots

无插槽

## Exposed Methods

| 方法        | 签名 | 说明     |
| ----------- | ---- | -------- |
| `focus`     | —    | 激活焦点 |
| `blur`      | —    | 失焦     |
| `clear`     | —    | 清除值   |
| `selectall` | —    | 全选文本 |

通过 `defineExpose({ state, api })` 暴露；方法挂在 `api` 上。

## State 模型

```ts
interface TextAreaState {
  sizeClass: string;
  themeClass: string;
  rootClass: (string | Record<string, boolean>)[];
  charCountText: string;
  textareaAttrs: Record<string, unknown>;
  textareaStyle: CSSProperties | (CSSProperties | string)[];
}
```

## Hook 依赖（hooks）

无

## 实现逻辑

1. 解析 props；`inheritAttrs: false`，将常见属性落到内部 `<textarea>`
2. `v-model` 驱动值
3. `autoSize` 开启时按 `minRows` / `maxRows` 与 `scrollHeight` 计算高度，内容变化时重算
4. `show-count` 根据值长度与透传 `maxlength` 生成计数文案

## 无障碍（a11y）

- 原生 `<textarea>` 保留浏览器默认键盘与焦点行为
- 字数统计：`aria-hidden="true"`（装饰性信息）

## 动画

无

## Web Component 预留

- Custom Element：`tvp-text-area`

## 验收标准

- [x] API 与本文档一致
- [x] 无障碍基础达标
- [x] 测试与演示页
