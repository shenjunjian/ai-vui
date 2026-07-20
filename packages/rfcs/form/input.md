# Input

> 状态：**已实现** | 优先级：**P0** | 分类：**Form & Input 表单录入**

## 概述

单行输入（含 autocomplete、前后缀）。仅支持 `type=text` 或 `password`。日期、数字等 input 类型，建议使用相应组件；多行文本建议使用 TextArea。

支持主题色（仅影响 border 与文字）、前后置装饰。用户自定义事件与 input 常见属性，通过属性继承传递到内部 `<input>` 元素。

结构：`#prefix` + `input` + `char-count` + `#suffix` + `clear-icon`

自动提示：输入时以 debounce=300ms 匹配 `pop-items`。值为 `string[]` / `Option[]` / 异步函数。`Option` 为 `{ label: string }`。Tab / Enter 选中当前项；无匹配时关闭弹出层；↑↓ 在匹配项间切换。

支持line变体：line变体仅样式与input变体不一致，功能上要求安全一致。 line变体的样式是：呈现一个下划线，此时支持label属性。 默认将label的值渲染在< label> 元素中，定位在线的上方。 当组件focus时，< label> 元素变小上移，让用户输入值 。 line变体时，支持和input 相同的功能，比如主题色，禁用，可清除，插槽等等功能保持一致

- **包**：`vai`
- **导出**：`Input`
- **scene-theme 类名**：`sc-input`（组件内实现）

## Props

| 属性            | 类型                                                                       | 默认值    | 说明                                                                                 |
| --------------- | -------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------ |
| `v-model`       | `string`                                                                   | `''`      | 输入值                                                                               |
| `size`          | `'sm' \| 'md' \| 'lg'`                                                     | `'md'`    | 尺寸                                                                                 |
| `theme`         | `'success' \| 'info' \| 'warn' \| 'error' \| 'dark'`                       | —         | 语义主题色，只影响 border 和文字                                                     |
| `disabled`      | `boolean`                                                                  | `false`   | 禁用态                                                                               |
| `clearable`     | `boolean`                                                                  | `false`   | 有值时是否显示清除按钮                                                               |
| `password`      | `boolean`                                                                  | `false`   | 是否显示为 password                                                                  |
| `char-count`    | `boolean`                                                                  | `false`   | 是否显示字符数（位于 suffix 前）；若透传 `maxlength` 则显示 `当前/最大`              |
| `beforeClear`   | `() => boolean \| Promise<boolean>`                                        | —         | 清除前拦截；返回 `true` 允许清除，返回 `false` / Promise reject / 异步错误时阻止清除 |
| `pop-items`     | `string[] \| Option[] \| (query: string) => Promise<string[] \| Option[]>` | `[]`      | 自动提示数据项                                                                       |
| `popper-option` | `Partial<Omit<PopperOption, 'reference' \| 'popper' \| 'show'>>`           | —         | 自动提示弹出层配置（透传 `usePopper`）                                               |
| `variant`       | `'input' \| 'line' `                                                       | `'input'` | 设置变体                                                                             |
| `label`         | string                                                                     | `''`      | line变体时的标题                                                                     |

## Events

| 事件                | payload  | 说明         |
| ------------------- | -------- | ------------ |
| `cleared`           | —        | 值清除后触发 |
| `update:modelValue` | `string` | v-model 更新 |

## Slots

| 插槽      | 说明         |
| --------- | ------------ |
| `default` | 默认内容     |
| `prefix`  | 前置图标内容 |
| `suffix`  | 后置图标内容 |

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
interface InputState {
  sizeClass: string;
  themeClass: string;
  rootClass: (string | Record<string, boolean>)[];
  inputType: "text" | "password";
  showClear: boolean;
  charCountText: string;
  inputAttrs: Record<string, unknown>;
  filteredItems: Option[];
  activeIndex: number;
  popVisible: boolean;
  inputId: string;
  showLabel: boolean;
}
```

## Hook 依赖（hooks）

| Hook        | 用途                        |
| ----------- | --------------------------- |
| `usePopper` | 控制自动提示弹出层          |
| `useTimer`  | debounce 300ms 触发匹配查询 |

## 实现逻辑

1. 解析 props；`inheritAttrs: false`，将常见属性落到内部 `<input>`
2. `v-model` 驱动值；`clearable` + `beforeClear` 控制清除
3. `pop-items` 经 `useTimer(300)` debounce 后过滤/请求，结果用 `usePopper` 展示
4. 键盘：↑↓ 切换、Enter/Tab 选中、Esc 关闭；无匹配关闭弹出层
5. 销毁时由 hooks 清理定时器与 popover 绑定

## 无障碍（a11y）

- 清除按钮：`aria-label="清除"`
- 建议列表：`role="listbox"`，选项 `role="option"` + `aria-selected`
- 键盘：↑↓ / Enter / Tab / Esc

## 动画

- 弹出层动画由 `usePopper`（`animate`）控制

## Web Component 预留

- Custom Element：`tvp-input`

## 验收标准

- [x] API 与本文档一致
- [x] 无障碍基础达标（清除按钮、listbox）
- [x] 测试与演示页
