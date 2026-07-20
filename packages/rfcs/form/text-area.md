# TextArea

> 状态：**开发中** | 优先级：**P0** | 分类：**Form & Input 表单录入**

## 概述

多行输入（含 Mention）。渲染为textarea 元素。

支持主题色（仅影响 border 与文字），用户自定义事件与 textarea 常见属性，通过属性继承传递到内部 `<input>` 元素。

支持自动控制行高： autoSize属性支持{ minRow: number, maxRow: number }，当用户指定该属性时，textarea 元素textarea 元素最小显示 minRow 行、最大显示 maxRow 行，并随输入内容自动调整高度。用户不指定该属性时，textarea 元素的高度依赖用户输入的rows属性

- **包**：`vai`
- **导出**：`TextArea`
- **scene-theme 类名**：`sc-textarea`（规划，scene-theme 尚未实现）

## Props

| 属性      | 类型     | 默认值 | 说明   |
| --------- | -------- | ------ | ------ |
| `v-model` | `string` | `''`   | 输入值 |

| `size` | `'xs' \| 'sm' \| 'md' \| 'lg'` | `'md'` | 尺寸 |
| `theme` | `'success' \| 'info' \| 'warn' \| 'error' \| 'dark'` | — | 语义主题色，只影响 border 和文字 |
| `disabled` | `boolean` | `false` | 禁用态 |
| `autoSize` | `{ minRow: number, maxRow: number }` | `undefined` | 指定元素的最小行和最大行 |
| `show-count` | `boolean` | `false` | 是否显示字符数；若透传 `maxlength` 则显示 `当前/最大`。 用灰色字显示到textarea元素的右下角 |

> 待细化：补充 TextArea 专属 props。

## Events

| 事件                | payload  | 说明         |
| ------------------- | -------- | ------------ |
| `update:modelValue` | `string` | v-model 更新 |

## Slots

| 插槽 | 说明 |
| ---- | ---- |

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
  // 待定义
}
```

## Hook 依赖（hooks）

| Hook | 用途 |
| ---- | ---- |

## 实现逻辑

1. 解析 props，合并 ConfigProvider 上下文

## 无障碍（a11y）

- **role / aria / 键盘 / 焦点**：待定

## 动画

## Web Component 预留

- Custom Element：`tvp-text-area`

## 验收标准

- [ ] API 与本文档一致
- [ ] 无障碍达标
- [ ] 测试与演示页
