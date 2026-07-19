# Input

> 状态：**开发中** | 优先级：**P0** | 分类：**Form & Input 表单录入**

## 概述

单行输入（含 autocomplete、前后缀、Mention）。仅支持type=text 或 password 的情况。 日期，数字等input 类型，建议用户选择相应的组件。 多行文本，建议用户选择TextArea组件。

支持主题色，前后置的装饰。 用户定义事件和input常见属性，通过属性继承传递到内部的inut元素上。

input的结构为： #prefix + input + char-count + #suffix + clear-icon

自动提示功能： 用户在输入时，通过debounce=300ms 来动态匹配pop-items中的值. 它的值是 string[] 或 Option[]. Option 是 {label: string }的类型。 当用户按下 tab 或回车时， 自动选择当前匹配的值。 没有匹配值时，自动关闭弹出层。 用户按上下键时， 从当前匹配值向上或向下选择。

- **包**：`vai`
- **导出**：`Input`

## Props

| 属性          | 类型                                                                    | 默认值  | 说明                                                                                     |
| ------------- | ----------------------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------- |
| `size`        | ` 'sm' \| 'md' \| 'lg'`                                                 | `'md'`  | 尺寸                                                                                     |
| `theme`       | `'success' \| 'info' \| 'warn' \| 'error' \| 'dark'`                    | —       | 语义主题色, 只影响border和文字                                                           |
| `disabled`    | `boolean`                                                               | `false` | 禁用态                                                                                   |
| `clearable`   | `boolean`                                                               | `false` | 有值时，是否显示可清除                                                                   |
| `password`    | `boolean`                                                               | `false` | 是否显示为password                                                                       |
| `char-count`  | `boolean`                                                               | `false` | 是否在后面显示字符数 ，显示在 suffix 插槽前面                                            |
| `beforeClear` | `() => boolean \| Promise<boolean>`                                     | —       | 清除前拦截；返回 `true` 允许清除值，返回 `false` / Promise reject / 异步错误时，阻止清除 |
| `pop-items`   | string[] \| Option[] \| (query:string) => Promise<string[]> \| Option[] | []      | 自动提示的数据项                                                                         |
| `pop-option`  | 全局的弹出层选项配置值                                                  | -       | - 自动提示的弹出选项配置                                                                 |

## Events

| 事件    | payload | 说明           |
| ------- | ------- | -------------- |
| cleared | —       | 值清除后的事件 |

## Slots

| 插槽      | 说明         |
| --------- | ------------ |
| `default` | 默认内容     |
| `prefix`  | 前置图标内容 |
| `suffix`  | 后置图标内容 |

> 待细化：补充 Input 专属 named slots。

## Exposed Methods

| 方法      | 签名 | 说明     |
| --------- | ---- | -------- |
| focus     | —    | 激活     |
| blur      | —    | 失焦     |
| clear     | —    | 清除值   |
| selectall | —    | 全选文本 |

## State 模型

```ts
interface InputState {
  // 待定义
}
```

## Hook 依赖（hooks）

| Hook              | 用途                  |
| ----------------- | --------------------- |
| `useControllable` | 受控/非受控（如适用） |
| —                 | 待补充                |

## 实现逻辑

1. 解析 props，合并 ConfigProvider 上下文
2. 通过 hook 处理 DOM，state 驱动 UI

> 待细化：Input 交互流程。

## 无障碍（a11y）

- **role / aria / 键盘 / 焦点**：待定

## 动画

- 使用 `usePresence`（如适用）
- 遵循 `--sv-transition-*` token

## Web Component 预留

- Custom Element：`tvp-input`

## 验收标准

- [ ] API 与本文档一致
- [ ] 无障碍达标
- [ ] 测试与演示页
