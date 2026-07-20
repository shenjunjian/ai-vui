# Checkbox

> 状态：**已实现** | 优先级：**P0** | 分类：**Form & Input 表单录入**

## 概述

复选框。用原生 `<input type="checkbox">` + `appearance: none` 自定义样式来实现。用户自定义事件与 input 常见属性，通过属性继承传递到内部 `<input>` 元素。它与 switch 类似，区别在于切换 switch 会直接触发状态改变，而 checkbox 一般用于状态标记，需要和提交操作配合。

支持主题色；**未指定 `theme` 时使用 control 色系**（根节点挂 `st-control`，色值对齐 Button）。支持 `label` 属性，根节点为 `<label>`，自动与内部 input 关联。

色值映射（与 Button 同名 CSS 变量一致）：

| 用途 | 对应 Button | control 示例 |
| ---- | ----------- | ------------ |
| 轮廓边框 | `--btn-border` | `#d1d5db` |
| 勾选底色 / 半选内块 | `--btn-bg` | `#f3f4f6` |
| 对号 | `--btn-color` | `#1f2937` |
| 焦点光晕 | `--btn-focus-color` | `#6b7280` |

支持 `indeterminate` 属性，透传到 input 实例的 `indeterminate` 属性（DOM 属性，非 HTML attribute）。半选优先级高于勾选：为 `true` 时无论 `checked` 为何值均显示半选图标。

```html
<label class="sc-checkbox">
  <span class="sc-checkbox__control">
    <input type="checkbox" class="sc-checkbox__input" />
  </span>
  <span class="sc-checkbox__label"><!-- default slot / label --></span>
</label>
```

三个状态使用图标表示，svg 存放在 `./icons`（组件内同步于 `vai/.../checkbox/icons`）：`no-checked`、`half-checked`、`checked`。

- **包**：`vai`
- **导出**：`Checkbox`
- **scene-theme 类名**：`sc-checkbox`（组件内实现）

## Props

| 属性              | 类型                                                 | 默认值  | 说明                                                         |
| ----------------- | ---------------------------------------------------- | ------- | ------------------------------------------------------------ |
| `v-model:checked` | `boolean`                                            | `false` | 是否勾选                                                     |
| `size`            | `'sm' \| 'md' \| 'lg'`                               | `'md'`  | 尺寸（映射 `st-*`）                                          |
| `theme`           | `'success' \| 'info' \| 'warn' \| 'error' \| 'dark'` | —       | 语义主题色，色值对齐 Button 同名主题；未指定时使用 control（`st-control`） |
| `disabled`        | `boolean`                                            | `false` | 禁用态                                                       |
| `label`           | `string`                                             | `''`    | 文本内容；无默认插槽时作为 label 显示                        |
| `indeterminate`   | `boolean`                                            | `false` | 半选；为 true 时优先显示半选，并同步到 `input.indeterminate` |

## Events

| 事件             | payload   | 说明                   |
| ---------------- | --------- | ---------------------- |
| `update:checked` | `boolean` | `v-model:checked` 同步 |

常见原生事件（如 `change`、`focus`）经属性透传到内部 `<input>`。

### `change` 透传策略

组件内部需监听原生 `change` 以同步 `v-model:checked`（并在 `indeterminate` 仍为 true 时恢复半选），同时不得覆盖用户传入的 `@change`。实现约定：

1. `inheritAttrs: false`，非 prop 属性与监听器进入 `attrs`
2. 从 `attrs` 中取出 `onChange`（用户 `@change`），其余属性透传到内部 `<input>`
3. 组装统一的 `onChange` 挂到 input：**先**执行内部同步（更新 `checked` / 恢复 `indeterminate`），**再**调用用户 `onChange`（支持单个函数或函数数组）
4. 模板上不要再写独立的 `@change="handleChange"` 覆盖 `v-bind`，否则会丢掉用户监听

因此 `@change` 与 `v-model:checked` 可同时使用；`change` 的 payload 仍为原生 `Event`（`event.target` 为内部 input）。

## Slots

| 插槽      | 说明                                      |
| --------- | ----------------------------------------- |
| `default` | 默认 label 内容（优先于 `label` 属性文本） |

## Exposed Methods

| 方法       | 签名                    | 说明     |
| ---------- | ----------------------- | -------- |
| `focus`    | `() => void`            | 激活焦点 |
| `blur`     | `() => void`            | 失焦     |
| `setCheck` | `(value: boolean) => void` | 设置勾选值（禁用时无效） |

通过 `defineExpose({ state, api })` 暴露；方法挂在 `api` 上。

## State 模型

```ts
interface CheckboxState {
  sizeClass: string;
  themeClass: string;
  /** unchecked | checked | indeterminate（半选优先） */
  visualState: "unchecked" | "checked" | "indeterminate";
  showLabel: boolean;
  inputAttrs: Record<string, unknown>;
  rootClass: (string | Record<string, boolean>)[];
}
```

## Hook 依赖（hooks）

| Hook | 用途 |
| ---- | ---- |
| —    | 无额外 hook |

## 实现逻辑

1. 解析 props；根元素为 `<label class="sc-checkbox">` + `st-*` / `is-*` 状态类；**无 `theme` 时挂 `st-control`（control 色系）**，有 theme 时映射为 `st-success` / `st-info` / `st-warn` / `st-error` / `st-dark`
2. `v-model:checked` 绑定原生 checkbox 的勾选态
3. `watch` 将 `indeterminate` 同步到 `input.indeterminate`；点击后若 prop 仍为 true 则立即恢复
4. 常见 input 属性 / 事件经 `inheritAttrs: false` 透传到内部 input；`change` 按上文「透传策略」合并内部同步与用户监听
5. 图标绘制在 `sc-checkbox__control`：边框用 border 色；勾选底用 bg 色、对号用 color 色；半选内块用 bg 色；input 透明叠层接收交互
6. 焦点光晕画在 `sc-checkbox__control` 上，交互对齐 Button：`:focus-visible` 保留 halo，鼠标点击播 wave

## 无障碍（a11y）

- 根节点 `<label>` 包裹 input，点击文案即可切换
- 键盘：原生 checkbox 焦点与空格切换
- `:focus-visible` 时 `sc-checkbox__control` 外扩 box-shadow 光晕

## 动画

暂时先不引入动画

## Web Component 预留

- Custom Element：`tvp-checkbox`

## 验收标准

- [x] API 与本文档一致
- [x] 无障碍达标（label 关联 + 原生键盘）
- [x] 测试与演示页
