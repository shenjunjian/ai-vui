# 组件 CSS 开发规范

## 1. Token（`--v-*`）

- 公共设计 token 一律使用 `--v-` 前缀，定义在 [`packages/vai/src/theme/basic-vars.less`](../../packages/vai/src/theme/basic-vars.less) 的 `:root`。
- 分组：
  - **Color**：灰阶、语义色（success / info / warn / error）、control / dark、`color-mix` 比例（`--v-mix-*`）
  - **Size**：字族 / 字号 / 行高、控件高度、勾选框尺寸、圆角、边框、focus ring 宽度
  - **Space**：`--v-space-1` … `--v-space-10`
  - **Motion / state**：时长、缓动、禁用透明度等
- 组件 less **禁止**再写裸 hex；应引用 `var(--v-*)`。例外：图标 SVG data URI 等无法用 CSS 变量表达的场景。
- 组件内部可用局部 alias（如 `--btn-bg: var(--v-color-control)`），**不要**把组件专属变量提升到 `:root`。

## 2. 主题色与尺寸

- 主题色统一为：`control | dark | success | info | warn | error`。
  - `control`：中性控件灰（类似系统控件）。
  - 色值与映射以 **Button** 为权威来源；其他组件对齐 Button，不要各自发明一套 hex。
- 表单类组件统一支持 `sm | md | lg` 三档尺寸（高度、字号、内边距等用 `--v-control-height-*` / `--v-font-size-*` / `--v-space-*`）。

## 3. 类名约定

| 类型 | 前缀 / 形态 | 示例 |
| --- | --- | --- |
| 组件根 | `v-{name}` | `v-btn`、`v-input` |
| 变体 | `v-{variant}-{name}` | `v-plain-btn`、`v-ghost-btn`、`v-icon-btn` |
| 元素 | `v-{name}__{el}` | `v-btn__loading`、`v-checkbox__control` |
| 状态（尺寸 / 主题 / 禁用 / pressed 等） | `st-*` | `st-sm`、`st-md`、`st-lg`、`st-control`、`st-success`、`st-disabled`、`st-pressed` |
| 布尔 UI 态 | `is-*` | `is-checked`、`is-indeterminate` |

- 类名前缀为 **`v-`（连字符）**，不要使用旧的 `sc-`。
- `vai-popper` 等主题层特殊命名暂保持不动。

## 4. 公共样式（mixin）

- 优先使用 [`packages/vai/src/theme/common.less`](../../packages/vai/src/theme/common.less) 中的 mixin，例如：
  - `.v-inline-flex-center()` / `.v-font-base()` / `.v-transition-colors()`
  - `.v-disabled(@opacity)` / `.v-plain-surface(@color)` / `.v-overlay-input()`
  - `.v-focus-interactive(@ring)` / `.v-focus-ring-static(@color)`
- 新增样式时：若发现跨组件重复规则，**先抽到 `common.less` 再写组件**；复杂 mixin 需加中文注释（用途、依赖的 CSS 变量、与 `st-*` 的配合方式）。

## 5. Focus

- 交互控件（button、link 等）：用 `.v-focus-interactive(@ring)`。
  - 键盘：`:focus-visible` → 保留 halo（`v-focus-halo`）+ 静态 ring。
  - 鼠标点击：`:focus:not(:focus-visible)` → 瞬时 wave（`v-focus-wave`）后消失。
- 表单输入（input / textarea）：用 `.v-focus-ring-static(@color)` 画静态 ring。
- checkbox / radio：焦点在原生 input、光晕画在 `__control` 时，手动设置 `--v-focus-ring-current`，并对 `:has(input:focus…)` 挂 `v-focus-wave` / `v-focus-halo`。
- ring 色用 `color-mix(in srgb, … var(--v-mix-focus-ring), transparent)`；需要更强时用 `--v-mix-focus-ring-strong`（如 checkbox / radio）。**不要**强行把各组件 ring / disabled 透明度统一成同一数值。

## 6. 引入方式

组件 less 顶部统一：

```less
@import "../../theme/common.less";
```

`common.less` 会自动 `@import` `basic-vars.less`，组件无需再单独引入 vars。

## 7. 主题定制

- 换肤：在应用侧覆盖 `:root` 的 `--v-*` 即可（不必改组件 less）。
- 暗色主题：通过覆盖同一组 `--v-*` 实现；本库暂不内置完整 dark scheme。
