# Radio

> 状态：**已实现** | 优先级：**P0** | 分类：**Form & Input 表单录入**

## 概述

单选框。用原生 `<input type="radio">` + `appearance: none` 自定义样式来实现。用户自定义事件与 input 常见属性，通过属性继承传递到内部 `<input>` 元素。

支持 `label` 属性，根节点为 `<label>`，自动与内部 input 关联。

同组互斥可通过透传原生 `name` / `value` 实现（与原生 radio 一致）；更完整的组控见 `RadioGroup`。

```html
<label class="sc-radio">
  <span class="sc-radio__control">
    <input type="radio" class="sc-radio__input" />
  </span>
  <span class="sc-radio__label"><!-- default slot / label --></span>
</label>
```

两个状态使用图标表示，svg 存放在 `./icons`（组件内同步于 `vai/.../radio/icons`）：`no-checked`、`checked`。

- **包**：`vai`
- **导出**：`Radio`
- **scene-theme 类名**：`sc-radio`（组件内实现）

## Props

| 属性              | 类型                   | 默认值  | 说明                                  |
| ----------------- | ---------------------- | ------- | ------------------------------------- |
| `v-model:checked` | `boolean`              | `false` | 是否勾选                              |
| `size`            | `'sm' \| 'md' \| 'lg'` | `'md'`  | 尺寸（映射 `st-*`）                   |
| `disabled`        | `boolean`              | `false` | 禁用态                                |
| `label`           | `string`               | `''`    | 文本内容；无默认插槽时作为 label 显示 |

## Events

| 事件             | payload   | 说明                   |
| ---------------- | --------- | ---------------------- |
| `update:checked` | `boolean` | `v-model:checked` 同步 |

常见原生事件（如 `change`、`focus`）经属性透传到内部 `<input>`。

## Slots

| 插槽      | 说明                                       |
| --------- | ------------------------------------------ |
| `default` | 默认 label 内容（优先于 `label` 属性文本） |

## Exposed Methods

| 方法       | 签名                       | 说明                     |
| ---------- | -------------------------- | ------------------------ |
| `focus`    | `() => void`               | 激活焦点                 |
| `blur`     | `() => void`               | 失焦                     |
| `setCheck` | `(value: boolean) => void` | 设置勾选值（禁用时无效） |

通过 `defineExpose({ state, api })` 暴露；方法挂在 `api` 上。

## State 模型

```ts
interface RadioState {
  sizeClass: string;
  /** unchecked | checked */
  visualState: "unchecked" | "checked";
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

1. 解析 props；根元素为 `<label class="sc-radio">` + `st-*` / `is-*` 状态类
2. `v-model:checked` 绑定原生 radio 的勾选态
3. 常见 input 属性 / 事件经 `inheritAttrs: false` 透传到内部 input
4. 双态图标：`appearance: none` + CSS `mask`（未选 / 选中）
5. 焦点光晕画在无 mask 的 `sc-radio__control` 上（mask 会裁切 input 自身的 box-shadow / outline），交互对齐 Button：`:focus-visible` 保留 halo，鼠标点击播 wave

## 无障碍（a11y）

- 根节点 `<label>` 包裹 input，点击文案即可切换
- 键盘：原生 radio 焦点与方向键在同名组内切换
- `:focus-visible` 时 `sc-radio__control` 外扩 box-shadow 光晕

## 动画

暂时先不引入动画

## Web Component 预留

- Custom Element：`tvp-radio`

## 验收标准

- [x] API 与本文档一致
- [x] 无障碍达标（label 关联 + 原生键盘）
- [x] 测试与演示页
