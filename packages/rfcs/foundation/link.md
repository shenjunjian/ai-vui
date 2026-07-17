# Link

> 状态：**开发中** | 优先级：**P0** | 分类：**Foundation 基础**

## 概述

超链接，渲染为 `a` 标签，inline 没有 padding / margin。

- **包**：`@opentiny/vue-next`
- **导出**：`Link`

## Props

| 属性        | 类型                                                 | 默认值    | 说明                                                                           |
| ----------- | ---------------------------------------------------- | --------- | ------------------------------------------------------------------------------ |
| `size`      | `'sm' \| 'md' \| 'lg'`                               | `'md'`    | 尺寸（映射 `st-*`）                                                            |
| `disabled`  | `boolean`                                            | `false`   | 禁用态                                                                         |
| `theme`     | `'success' \| 'info' \| 'warn' \| 'error' \| 'dark'` | —         | 语义主题色（与 Button 一致）；未指定时为正常主色文字，悬停高亮使用 Info 主题色 |
| `underline` | `'none' \| 'hover' \| 'always'`                      | `'hover'` | 下划线显示策略                                                                 |

> `href` / `target` / `rel` 等原生 `a` 属性通过透传使用。

## Events

| 事件 | payload | 说明 |
| ---- | ------- | ---- |
| —    | —       | 无   |

## Slots

| 插槽      | 说明     |
| --------- | -------- |
| `default` | 默认内容 |

## Exposed Methods

| 方法  | 签名 | 说明 |
| ----- | ---- | ---- |
| state | -    | -    |
| api   | -    | -    |

## State 模型

```ts
interface LinkState {
  // 仅存放计算属性
}
```

## Hook 依赖（@opentiny/vue-next-hooks）

| Hook | 用途 |
| ---- | ---- |
| —    | 无   |

## 实现逻辑

1. 解析 props，合并 ConfigProvider 上下文
2. 无 `theme` 时不挂主题类：使用文本主色，悬停高亮为 Info 色（Link 非表单控件，无 `st-control`）
3. 有 `theme` 时挂对应 `st-*`，色值与 Button 对齐
4. `disabled`：阻止默认跳转与冒泡，并设置 `aria-disabled` / `tabindex=-1`

## 无障碍（a11y）

- **role / aria / 键盘 / 焦点**：禁用时 `aria-disabled` + `tabindex=-1`；焦点环待完善

## Web Component 预留

- Custom Element：`tvp-link`

## 验收标准

- [x] API 与本文档一致
- [ ] 无障碍达标
- [x] 测试与演示页
