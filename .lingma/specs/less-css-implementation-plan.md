# Less CSS 实施计划（修订版）

## 修订说明

基于对 `.rules/css.md` 的逐项核对，本计划在原版基础上做以下调整。

### 调整的核心设计原则（与原版最大的差异）

- **场景类（`s-*`）与状态类（`st-*`）具有"双重身份"**：在 Less 中它们既定义为**真实 CSS 类**（可直接在 DOM 上使用），又作为 **Less mixin** 可被组件类内部调用。
- **组件类（`sc-*`）通过 Less mixin 调用方式构建**，等价于 UnoCSS / Tailwind 的 `@apply`：
  1. 终端用户使用组件类名（`class="sc-btn st-info st-lg"`），符合传统组件库习惯
  2. 编译产物里 `.sc-btn` 已经包含所有相关属性，DOM 上无需再写 `.s-bg-info` 等
  3. 源文件层样式已被复用，编译产物不会出现"看起来重复"的 CSS（场景类独立使用时仍会生成对应类规则）
- 暂不设计 `sc-{component}__{element}` 子元素（按指示延后）
- 主题色 `primary` 不在 css.md 原列表中，本计划统一以 `info` 作为品牌主色（决策点，见末尾）

### 新增 / 补齐的状态类

- `st-plain`（朴素色，仅主题色时有效）
- `st-icon`（正方形图标样式）
- `st-round` / `st-circle`（圆角 / 正圆）
- `st-bold` / `st-thin`（字体粗细）

### 补齐的设计项

- `base` 层（reset、typography）
- 暗色主题切换机制（`[data-theme="dark"]` + ConfigProvider 预留）
- token 命名规范 `--s-{layer}-{cat}-{variant}`
- per-component CSS 文件（按需引入）
- 验收：stylelint + 视觉 demo（apps/site）
- scene-theme 自身的 RFC（按 AGENTS.md 设计先行）

### 关于构建工具

- Less 在 2026 仍是必要选项：mixin 是 css.md 明确要求的复用机制，原生 CSS 无法替代
- 不引入 Tailwind v4 / Vanilla-extract / Panda CSS（按指示）

---

## 设计参考与核心约定

本计划参考了 `E:\tiny-vue-next\tvp-vue\packages\scene-theme\src` 的设计思路，结合 `.rules/css.md` 规范做了重新梳理。**约定一旦确定，不再随意变更**。

### 0. 双重身份（整个体系的地基）

`E:\tiny-vue-next` 参考设计中，**所有场景类（`s-*`）与状态类（`st-*`）都同时是真实 CSS 类与 Less mixin**：

```less
/* 场景类：作为真实类，独立写在 DOM 上也能生效 */
.s-txt {
  color: var(--s-norm);
}
.s-livetxt {
  color: var(--s-norm);
  &:hover {
    color: var(--s-norm-hover);
  }
}

/* 同一个类名 + 括号调用，就成了 mixin，可以被组件类消费 */
.sc-btn {
  .s-livetxt(); /* 把 .s-livetxt 的所有规则内联到 .sc-btn */
}
```

**这样做的好处**：

1. **用户使用传统组件类名**：`<button class="sc-btn st-info st-lg">` —— 看起来与 Element Plus / Ant Design 等传统组件库完全一致
2. **编译产物里 `.sc-btn` 已包含全部属性**：DOM 上无需写 `s-bg-info` 等
3. **样式在源文件层就被复用**：场景类独立使用时仍生成对应类规则，组件类内联时复用同一份规则，**不会出现"看起来重复"的 CSS**
4. **不依赖 UnoCSS / Tailwind 的 `@apply` 插件**：纯 Less 原生能力

> 本计划对应到参考设计的 `sc-*` 前缀（参考设计里原子也用 `sc-`），按 css.md 规范修正为 `s-`。

### 1. @layer 优先级管理

使用 CSS `@layer` 显式声明 4 层优先级（从低到高）：

```less
@layer sc-base, sc-icons, sc-component, sc-utils;
```

| 层             | 内容                                        | 优先级             |
| -------------- | ------------------------------------------- | ------------------ |
| `sc-base`      | CSS 变量、reset、全局样式、场景/状态类      | 最低               |
| `sc-icons`     | 图标基础样式                                | 低                 |
| `sc-component` | 组件类（`sc-btn` 等）                       | 中                 |
| `sc-utils`     | 工具类（`su-transition`、`su-ellipsis` 等） | 最高（业务层之上） |

> **关键策略**：`mixins/` 目录中的 mixin 定义**不放在任何 @layer 内**（在 `index.less` 顶部 `@import` 一次），这样 mixin 内联到组件类时不会受层级限制，组件类可以放在 `sc-component` 层稳定生效。
>
> 用户业务样式可继续追加 `@layer`，自然叠在 `sc-utils` 之上，无需 `!important`。

### 2. 类族双层模型（场景原子 + 组件类）

实际设计采用"原子 + 组件"两层类族：

- **场景原子（`s-*` / `s-live-*`）**：单一维度的样式
- **状态类（`st-*`）**：可与场景原子叠加的状态维度
- **组件类（`sc-*`）**：组合多个原子，专门为某组件设计

| 类别          | 类名                                                                                                              | 用途           |
| ------------- | ----------------------------------------------------------------------------------------------------------------- | -------------- |
| 原子 - 文字   | `s-txt` / `s-livetxt` / `s-whitetxt` / `s-ctrltxt`                                                                | 文字色         |
| 原子 - 背景   | `s-bg` / `s-livebg` / `s-plainbg` / `s-liveplainbg` / `s-whitebg` / `s-ctrlbg`                                    | 背景色         |
| 原子 - 边框   | `s-bd` / `s-livebd` / `s-ctrlbd`                                                                                  | 边框           |
| 原子 - 字体   | `s-font` / `s-livefont`                                                                                           | 字体/行高/字重 |
| 原子 - 内边距 | `s-pad` / `s-livepad`                                                                                             | padding        |
| 原子 - 外边距 | `s-margin` / `s-livemargin`                                                                                       | margin         |
| 原子 - 圆角   | `s-br`                                                                                                            | 圆角           |
| 原子 - 图标   | `s-icon`                                                                                                          | 方形图标       |
| 原子 - 光标   | `s-cursor`                                                                                                        | 光标           |
| 原子 - 阴影   | `s-shadow` / `s-liveshadow`                                                                                       | 阴影           |
| 原子 - 下划线 | `s-underline` / `s-hoverunderline`                                                                                | 下划线         |
| 原子 - 布局   | `s-flexr` / `s-flexc` / `s-gridstack` / `s-list` / `s-listitem`                                                   | 布局           |
| 组件 - 按钮   | `sc-btn` / `sc-theme-btn` / `sc-plain-btn` / `sc-ghost-btn` / `sc-icon-btn` / `sc-icon-plain-btn` / `sc-link-btn` | 按钮系列       |
| 组件 - 链接   | `sc-link`                                                                                                         | 文字链接       |
| 组件 - 图标   | `sc-icon` / `sc-theme-icon` / `sc-plain-icon`                                                                     | 图标按钮       |
| 工具          | `su-transition` / `su-ellipsis`                                                                                   | 工具类         |

> **关键修正**：原参考设计里原子也用了 `sc-` 前缀，与 css.md 规范冲突。本计划按 css.md 规定统一为 `s-` 前缀（仅组件用 `sc-`，仅工具用 `su-`）。

### 3. 静态 vs 响应的成对设计

每个有"交互态"诉求的原子，都提供两个变体：

| 静态（仅基础） | 响应（含 hover/active/disabled） | 适用   |
| -------------- | -------------------------------- | ------ |
| `s-txt`        | `s-livetxt`                      | 文字色 |
| `s-bg`         | `s-livebg`                       | 背景色 |
| `s-bd`         | `s-livebd`                       | 边框色 |
| `s-font`       | `s-livefont`                     | 字体   |
| `s-pad`        | `s-livepad`                      | 内边距 |
| `s-shadow`     | `s-liveshadow`                   | 阴影   |
| `s-underline`  | `s-hoverunderline`               | 下划线 |

Less 中通过 `when` 条件守卫 + 局部变量控制：

```less
.mixin-text-color() {
  --it-text: var(--s-norm);
  color: var(--it-text);
}
.mixin-text-color() when (@withHover = true) {
  &:not(.st-disabled, :disabled, [disabled]):hover {
    --it-text-hover: var(--s-norm-hover);
    color: var(--it-text-hover);
  }
}

.s-txt {
  @withHover: false;
  @withActive: false;
  .mixin-text-color();
}
.s-livetxt {
  @withHover: true;
  @withActive: true;
  .mixin-text-color();
}
```

### 4. 状态类的双重生效：`:active` + `.st-active`

参考设计中，所有 hover/active 状态都同时支持**伪类触发**和**类名触发**：

```less
&:not(.st-disabled, :disabled, [disabled]):is(.st-active, :active) {
  --it-@{value}-bg-active: ~"var(--s-@{value}-active)";
  background-color: ~"var(--it-@{value}-bg-active)";
}
```

- `&:active` —— 用户按下鼠标时浏览器自动触发
- `&.st-active` —— 程序可主动给元素加类，模拟"按下"状态（如 toggle 按钮、菜单选中项）
- 用 `:is()` 合并选择器，避免重复写两遍

**这意味着**：`st-active` 既是一个"状态类"（可被 JS 控制），又是一个"激活指示器"（被 mixin 消费）。

### 5. 状态类内嵌在 mixin 输出中

参考设计的另一个关键模式：**部分状态类（如 `st-secondary`、`st-bold`、`st-thin`、`st-italic`、`st-halo`）直接在 mixin 内输出**，不需要在 `states/` 目录再写一遍：

```less
// box-mixin.less 中的 mixin-text-color
&.st-secondary {
  --it-text-secondary: var(--sv-norm-secondary);
  color: var(--it-text-secondary);
}

// box-mixin.less 中的 mixin-font
&.st-bold {
  font-weight: var(--sv-fw-bold);
}
&.st-thin {
  font-weight: var(--sv-fw-thin);
}
&.st-italic {
  font-style: italic;
}

// box-mixin.less 中的 mixin-border
&.st-halo {
  &:focus-visible {
    outline: var(--sv-outline-width) var(--sv-outline-style) var(--sv-outline);
    outline-offset: var(--sv-outline-offset);
  }
}
```

- 这些状态类**只在混入 mixin 的元素上生效**（被 mixin 包含在父选择器内）
- 单独写在 DOM 上不会起作用（不生成顶层规则）
- 优点：避免散落的状态类污染全局命名空间

### 6. 主题色的循环展开

使用 Less 的 `each` 一次性展开所有主题色状态：

```less
@themeList: control, dark, success, info, warn, error, invalid;
each(@themeList, {
  &.st-@{value} {
    --it-@{value}-text: ~'var(--s-@{value})';
    color: ~'var(--it-@{value}-text)';
  }
  // 叠加 hover / active / disabled ...
});
```

### 7. CSS 变量桥接（`--it-*` 局部变量）

mixin 内部用 `--it-*` 前缀的局部变量承载运行时主题，便于组件内某个状态被父组件覆写：

```less
.s-livebg {
  --it-bg: var(--s-norm-bg);
  background-color: var(--it-bg);
  &.st-info {
    --it-info-bg: var(--s-info);
    background-color: var(--it-info-bg);
  }
}
```

> `--s-*` 是"系统级全局变量"（在 `:root` 上声明），`--it-*` 是"组件实例级局部变量"（在元素上声明）。运行时主题切换只改 `--s-*`，`--it-*` 自动跟随。
>
> **命名对照**：参考设计用 `--sv-*`（system variable）作为全局变量，本计划按 css.md 简化为 `--s-*`（更短）。

### 8. "ctrl" 控件色

除常规主题色外，保留 `ctrl` 系列（Windows 风格的灰色控件），独立于主题色：

```less
:root {
  --s-ctrl-text: #212121;
  --s-ctrl-bg: #f0f0f0;
  --s-ctrl-bg-hover: #e5e5e5;
  --s-ctrl-bg-active: #d6d6d6;
  --s-ctrl-bd: #7b7b7b;
  --s-ctrl-bd-hover: #e5e5e5;
  --s-ctrl-bd-active: #333333;
  --s-ctrl-disabled: #dbdbdb;
  --s-ctrl-bg-disabled: #dbdbdb;
  --s-ctrl-bd-disabled: #dbdbdb;
}
```

> `ctrl` 与主题色（`info` / `success` / ...）平级，可以像主题色一样被 mixin 消费。按钮的"普通按钮"（`sc-btn`）使用 `ctrl` 灰底，区别于"主题按钮"（`sc-theme-btn`）的有色实心。

### 9. 组件内部元素处理

组件类（如 `sc-btn`）需要处理内部子元素（`span` 文字省略、icon 不被压缩）。参考设计的模式是 mixin 内部用 `& span` / `& :is(i, svg, img)` 嵌套：

```less
// mixin-init-button
& span {
  .mixin-ellipsis(); /* 内部 span 强制单行省略 */
}
& :is(i, svg, img) {
  .mixin-item-noshrink(); /* 内部图标禁止被 flex 压缩 */
  &:first-child {
    margin-left: var(--sv-button-overshoot);
  }
  &:last-child {
    margin-right: var(--sv-button-overshoot);
  }
}
```

**为什么不抽成"组件子元素类 `sc-btn__text` / `sc-btn__icon`"**：

- 增加 DOM 上的类名噪音
- 用户写按钮时还要关心子元素类名
- 子元素样式只与父组件强相关，外部不会复用

按指示延后 `sc-{component}__{element}` 方案，本计划维持参考设计的"mixin 内嵌套"做法。

### 10. 工厂函数 `.atomic()`（可选）

参考设计中 `extra-mixin.less` 提供了一个原子类工厂：

```less
.atomic(@prefix, @property, @unit: none, @start, @end, @step: 1) {
  .unit-check() when (@unit = none) {
    /* 无单位 .m-2 { margin: 2; } */
  }
  .unit-check() when (not (@unit = none) and not (@unit = percent)) {
    /* .p-2 { padding: 2px; } */
  }
  .unit-check() when (@unit = percent) {
    /* .w-50 { width: 50%; } */
  }
}

// 使用
.atomic(m-, margin, px, 0, 100, 2); // 生成 .m-0 / .m-2 / ... / .m-100
.atomic(fs, font-size, px, 12, 24, 2); // 生成 .fs-12 / .fs-14 / ...
```

**本计划决策**：

- `atomic()` 工厂**不纳入**场景类（`s-*`）与状态类（`st-*`）的主体系
- 工具类（`su-*`）中可按需调用 `atomic()`，生成 `su-m-*` / `su-p-*` / `su-fs-*` 等数值类
- 留待 utility 阶段按需启用

### 11. 现代 CSS 特性（直接使用，不做 @supports 降级）

按 AGENTS.md"不考虑向下兼容"原则，直接使用：

| 特性                                                   | 用途               |
| ------------------------------------------------------ | ------------------ |
| `aspect-ratio: 1`                                      | 方形图标           |
| `interpolate-size: allow-keywords`                     | 高度动画支持关键字 |
| `text-wrap-mode: nowrap` / `text-wrap: pretty/balance` | 文字换行控制       |
| `dialog[open]::backdrop` + `backdrop-filter: blur()`   | 弹窗遮罩毛玻璃     |
| `popover` 原生 API + `[popover]:not(:popover-open)`    | 弹出层             |
| `scrollbar-color` / `scrollbar-width`                  | 现代滚动条         |
| `content-visibility: auto`                             | 长列表性能优化     |
| `scroll-snap-type` / `scroll-snap-align`               | 列表吸附滚动       |
| `[popover] { overflow: visible }` 修正小三角           | popover 样式重置   |

> 参考设计中对滚动条仍保留 `@supports` 降级（`::-webkit-scrollbar-*`）——本计划按 AGENTS.md 直接只写 `scrollbar-color`，不做降级。

### 12. 扩张原则（迭代式设计）

**场景类与状态类不必一次性穷举**。开发组件时遇到新样式，按以下顺序处理：

1. **先复用**：检查是否已存在可复用的场景/状态类
2. **后扩展**：若不存在：
   - 判断维度（`bg` / `txt` / `bd` / `pad` / `layout` / ...）
   - 添加到 `scenes/<dim>.less` 或 `states/<cat>.less`
   - 同步更新 stylelint 规则、RFC 清单
3. **禁止**：直接在组件 `.less` 中写"一次性"的内联样式（特殊样式除外）

**目标覆盖范围**（按 css.md 列举的 CSS 属性，逐步补齐）：

- 文字：`color` / `font-size` / `line-height` / `font-weight` / `font-style` / `text-align` / `text-decoration` / `text-overflow` / `white-space` / `text-wrap`
- 背景：`background-color` / `background-image`（按需）
- 边框：`border-width` / `border-style` / `border-color` / `border-radius`
- 盒模型：`padding` / `margin` / `width` / `height` / `aspect-ratio` / `box-sizing`
- 布局：`display` / `flex-direction` / `flex-wrap` / `justify-content` / `align-items` / `gap` / `place-items`
- 视觉：`box-shadow` / `opacity` / `filter` / `backdrop-filter` / `outline`
- 交互：`cursor` / `pointer-events` / `user-select` / `touch-action`
- 动画：`transition` / `transition-duration` / `animation`
- 滚动：`overflow` / `scrollbar-color` / `scrollbar-width` / `scroll-snap-type` / `content-visibility`

> 完整覆盖后再考虑横向扩展（如：阴影尺寸、字号、间距的完整阶梯）。先纵向（维度）后横向（阶梯）。

**示例**：开发 `select` 组件时，需要 `.st-gap` 状态控制 flex gap：

- 发现没有 → 在 `states/layout.less` 添加 `.st-gap { gap: var(--s-gap-md); }`
- 同步更新 RFC

---

## Context

按 `AGENTS.md`，项目目标之一是"将 CSS 场景化复用"，规范见 `.rules/css.md`。当前 `packages/scene-theme` 是空脚手架，VAI 中 button 组件也仅有占位 `.less`。本计划用 Less 落地完整的场景化 CSS 系统。

---

## 阶段 1：环境与依赖

```bash
pnpm add -D less stylelint stylelint-config-standard -F scene-theme
```

不引入 `@tsdown/css`（vite-plus 没有 `css: { inject: false }` 配置项）。CSS 单独用 `lessc` 编译。

---

## 阶段 2：目录结构

按 `@layer` 优先级与"原子 + 组件"双层类族设计：

```
packages/scene-theme/src/
├── index.less                       # 全量入口（声明 @layer 优先级 + @import 各层）
│
├── layers/
│   ├── base.less                    # @layer sc-base：tokens / reset / global / mixins
│   ├── icons.less                   # @layer sc-icons：图标基础
│   ├── component.less               # @layer sc-component：组件类
│   └── utils.less                   # @layer sc-utils：工具类
│
├── tokens/                          # CSS 变量层（被 base.less @import）
│   ├── colors.less
│   ├── sizes.less
│   ├── spacing.less
│   ├── typography.less
│   ├── themes.less                  # 主题切换 + 暗色变量
│   └── _index.less
│
├── base/                            # reset / global / mixin 定义
│   ├── reset.less
│   ├── global.less                  # scrollbar、::placeholder、::selection、dialog::backdrop
│   ├── mixins/
│   │   ├── _index.less
│   │   ├── box-mixin.less           # 颜色/边框/圆角/阴影/光标 mixin
│   │   ├── layout-mixin.less        # flex/grid/list mixin
│   │   └── extra-mixin.less         # 过渡/省略号/下划线/原子工厂
│   └── _index.less
│
├── scenes/                          # 场景原子（s-* / s-live-*，同时为 Less mixin）
│   ├── background.less              # .s-bg / .s-livebg / .s-plainbg / .s-ctrlbg ...
│   ├── text.less                    # .s-txt / .s-livetxt / .s-whitetxt / .s-ctrltxt
│   ├── border.less                  # .s-bd / .s-livebd / .s-ctrlbd
│   ├── font.less                    # .s-font / .s-livefont
│   ├── padding.less                 # .s-pad / .s-livepad
│   ├── margin.less                  # .s-margin / .s-livemargin
│   ├── radius.less                  # .s-br
│   ├── icon.less                    # .s-icon
│   ├── cursor.less                  # .s-cursor
│   ├── shadow.less                  # .s-shadow / .s-liveshadow
│   ├── underline.less               # .s-underline / .s-hoverunderline
│   ├── layout.less                  # .s-flexr / .s-flexc / .s-gridstack / .s-list
│   └── _index.less
│
├── states/                          # 状态类（st-*，可与 s-* 叠加）
│   ├── sizes.less                   # .st-xs / .st-sm / .st-md / .st-lg
│   ├── themes.less                  # .st-control / .st-dark / .st-success / .st-info / .st-warn / .st-error / .st-plain
│   ├── interactions.less            # .st-active / .st-disabled / .st-halo
│   ├── modifiers.less               # .st-bold / .st-thin / .st-italic / .st-round / .st-circle / .st-icon / .st-rect
│   ├── layout.less                  # .st-wrap / .st-gap / .st-between / .st-around / .st-evenly
│   ├── text.less                    # .st-secondary / .st-ellipsis
│   ├── animation.less               # .st-fast / .st-slow
│   └── _index.less
│
├── components/                      # 组件类（sc-*，用 mixin 引用 scenes/states）
│   ├── button/index.less
│   ├── link/index.less
│   ├── tag/index.less
│   ├── modal/index.less
│   └── input/index.less
│
└── utils/                           # 工具类（su-*，最高优先级）
    ├── transition.less              # .su-transition
    ├── ellipsis.less                # .su-ellipsis
    └── _index.less
```

**`index.less` 入口示例**：

```less
/* 1. 声明层级顺序（从低到高） */
@layer sc-base, sc-icons, sc-component, sc-utils;

@import "./layers/base.less";
@import "./layers/icons.less";
@import "./layers/component.less";
@import "./layers/utils.less";
```

**`layers/base.less` 示例**：

```less
@layer sc-base {
  @import "../base/_index.less";
  @import "../tokens/_index.less";
  @import "../scenes/_index.less";
  @import "../states/_index.less";
}
```

> 每个文件用 `@layer xxx { @import ... }` 包裹，确保产物中各层独立、用户可覆盖。

---

## 阶段 3：核心实现

### 3.1 Token 命名规范

所有 token 形如 `--s-{layer}-{category}-{variant}`：

| 前缀            | 含义          | 示例                   |
| --------------- | ------------- | ---------------------- |
| `--s-color-bg-` | 背景色        | `--s-color-bg-control` |
| `--s-color-fg-` | 前景色        | `--s-color-fg-default` |
| `--s-color-bd-` | 边框色        | `--s-color-bd-default` |
| `--s-color-`    | 主题色        | `--s-color-info`       |
| `--s-size-`     | 尺寸（高/宽） | `--s-size-control-md`  |
| `--s-space-`    | 间距          | `--s-space-pad-md`     |
| `--s-font-`     | 字体          | `--s-font-size-md`     |
| `--s-radius-`   | 圆角          | `--s-radius-sm`        |
| `--s-shadow-`   | 阴影          | `--s-shadow-md`        |

> **避免命名冲突**：`dark` 仅作为**主题**（`[data-theme="dark"]`）使用，不再作为颜色 token 名字，避免与 `.st-dark` 状态类名混淆。

### 3.2 Token 完整结构（`tokens/colors.less`）

每个主题色（info/success/warn/error 等）需要 8 个变体：`base` / `-hover` / `-active` / `-plain` / `-plain-hover` / `-plain-active` / `-disabled` / `-bg-disabled`：

```less
:root {
  /* 中性文本/边框/背景 */
  --s-norm: #191919;
  --s-norm-secondary: #595959; /* 次级文字色（用于 .st-secondary） */
  --s-norm-inv: #ffffff; /* 反转文本（深色背景上的字） */
  --s-norm-hover: #1476ff;
  --s-norm-active: #084cac;
  --s-norm-bg: #f5f5f5;
  --s-norm-white-bg: #ffffff;
  --s-norm-bg-hover: #9cc0f3;
  --s-norm-bg-active: #80b0f3;
  --s-norm-bd: #c2c2c2;
  --s-norm-disabled: #c2c2c2;
  --s-norm-bd-disabled: #dbdbdb;
  --s-norm-bg-disabled: #f0f0f0;

  /* ctrl 控件色（Windows 风格灰色） */
  --s-ctrl-text: #212121;
  --s-ctrl-bg: #f0f0f0;
  --s-ctrl-bg-hover: #e5e5e5;
  --s-ctrl-bg-active: #d6d6d6;
  --s-ctrl-bd: #7b7b7b;
  --s-ctrl-bd-hover: #e5e5e5;
  --s-ctrl-bd-active: #333333;
  --s-ctrl-disabled: #dbdbdb;
  --s-ctrl-bg-disabled: #dbdbdb;
  --s-ctrl-bd-disabled: #dbdbdb;

  /* 主题色（每个 8 个变体） */
  --s-dark: #191919;
  --s-dark-hover: #3a3a3a;
  --s-dark-active: #0d0d0d;
  --s-dark-plain: #f5f5f5;
  --s-dark-plain-hover: #fafafa;
  --s-dark-plain-active: #e8e8e8;
  --s-dark-disabled: #bfbfbf;
  --s-dark-bg-disabled: #f5f5f5;

  --s-success: #5cb300;
  --s-success-hover: #6ec700;
  --s-success-active: #4a9100;
  --s-success-plain: #f0f9e6;
  --s-success-plain-hover: #f5fce9;
  --s-success-plain-active: #e8f5d9;
  --s-success-disabled: #bfbfbf;
  --s-success-bg-disabled: #f0f5eb;

  --s-info: #1476ff;
  --s-info-hover: #3d8bff;
  --s-info-active: #005ce6;
  --s-info-plain: #e6f2ff;
  --s-info-plain-hover: #f0f7ff;
  --s-info-plain-active: #d6ebff;
  --s-info-disabled: #bfbfbf;
  --s-info-bg-disabled: #eaf2fb;

  --s-warn: #ff8800;
  --s-warn-hover: #ff9922;
  --s-warn-active: #e67a00;
  --s-warn-plain: #fff7e6;
  --s-warn-plain-hover: #fffbf0;
  --s-warn-plain-active: #ffefd6;
  --s-warn-disabled: #bfbfbf;
  --s-warn-bg-disabled: #f5ede0;

  --s-error: #f23030;
  --s-error-hover: #ff4d4d;
  --s-error-active: #d92020;
  --s-error-plain: #ffe6e6;
  --s-error-plain-hover: #fff0f0;
  --s-error-plain-active: #ffd6d6;
  --s-error-disabled: #bfbfbf;
  --s-error-bg-disabled: #f5e8e8;

  --s-invalid: #f23030;
  --s-invalid-hover: #f76f6c;
  --s-invalid-active: #f23030;
  --s-invalid-plain: #fff1f0;
  --s-invalid-plain-hover: #fff1f0;
  --s-invalid-plain-active: #faddda;
  --s-invalid-disabled: #c2c2c2;
  --s-invalid-bg-disabled: #f1e5e5;
}

[data-theme="dark"] {
  --s-norm: #f5f5f5;
  --s-norm-bg: #1f1f1f;
  --s-norm-bd: #303030;
  --s-info: #1668dc;
  /* ... 仅覆盖必要项，未列出的保持 light 主题值 */
}
```

### 3.3 主题切换（`tokens/themes.less`）

```less
:root {
  color-scheme: light; /* 触发浏览器原生控件跟随 */
}

[data-theme="dark"] {
  color-scheme: dark;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    color-scheme: dark;
    /* 可选：自动应用暗色变量（需复制 :root 中的 [data-theme="dark"] 规则） */
  }
}
```

**切换 API 约定**：

- HTML 根节点添加 `data-theme="dark"` / `data-theme="light"`
- 由 ConfigProvider（待实现）通过 `document.documentElement` 注入
- 用户也可手动加属性，无需等待 ConfigProvider

### 3.4 场景原子（"双重身份" + 静态/响应成对）

**核心设计**：

1. 场景原子既是**真实 CSS 类**，又可作为 **Less mixin** 被组件类调用
2. 每个有交互态的维度，都提供 `s-*`（静态）和 `s-live-*`（响应）两个变体
3. mixin 通过 `@withHover` / `@withActive` / `@withDisabled` / `@withTheme` 等局部变量控制行为

**`scenes/background.less`**

```less
@themeList: control, dark, success, info, warn, error, invalid;
@sizeList: xs, sm, md, lg;

/* 内部 mixin（不在 .less 输出中保留，仅供场景类内部消费） */
.mixin-bg-color() {
  --it-bg: var(--s-norm-bg);
  background-color: var(--it-bg);
}
.mixin-bg-color() when (@withHover = true) {
  &:not(.st-disabled, :disabled, [disabled]):hover {
    --it-bg-hover: var(--s-norm-bg-hover);
    background-color: var(--it-bg-hover);
  }
}
.mixin-bg-color() when (@withTheme = true) {
  each(@themeList, {
    &.st-@{value} {
      --it-@{value}-bg: ~'var(--s-@{value})';
      background-color: ~'var(--it-@{value}-bg)';
    }
    /* 嵌套 hover/active/disabled 略，见 box-mixin.less */
  });
}

/* 静态背景（仅基础色） */
.s-bg {
  @withHover: false;
  @withActive: false;
  @withTheme: true;
  .mixin-bg-color();
}

/* 响应背景（含 hover/active/disabled） */
.s-livebg {
  @withHover: true;
  @withActive: true;
  @withDisabled: true;
  @withTheme: true;
  .mixin-bg-color();
}

/* 朴素背景（仅主题色，纯背景，无边框） */
.s-plainbg {
  @withTheme: true;
  .mixin-plain-bg-color();
}
.s-liveplainbg {
  @withHover: true;
  @withActive: true;
  @withTheme: true;
  .mixin-plain-bg-color();
}

/* 纯白背景（不混入 hover/active） */
.s-whitebg {
  .mixin-white-bg-color();
}

/* ctrl 控件背景 */
.s-ctrlbg {
  @withHover: true;
  @withActive: true;
  .mixin-control-bg-color();
}
```

**`scenes/text.less`**

```less
.s-txt {
  @withHover: false;
  @withActive: false;
  @withDisabled: true;
  @withTheme: true;
  .mixin-text-color();
}
.s-livetxt {
  @withHover: true;
  @withActive: true;
  @withDisabled: true;
  @withTheme: true;
  .mixin-text-color();
}
.s-whitetxt {
  .mixin-white-text-color();
} /* 主题色背景上的白字 */
.s-ctrltxt {
  .mixin-control-text-color();
}
```

**`scenes/layout.less`**

```less
.s-flexr {
  @withSize: true;
  .mixin-flex-align(inline-flex, row);
}
.s-flexc {
  @withSize: true;
  .mixin-flex-align(inline-flex, column);
}
.s-gridstack {
  .mixin-grid-stack();
}
.s-list {
  .mixin-list();
}
.s-listitem {
  .mixin-list-item();
}
```

> Less 同名类 + 括号调用即作为 mixin，所以 `.sc-btn { .s-livebg(); }` 会把 `.s-livebg` 的属性内联到 `.sc-btn` 中。

### 3.5 状态类

**`states/sizes.less`**

```less
@sizeList: xs, sm, md, lg;

.st-xs {
  font-size: var(--s-fs-xs);
  padding: var(--s-pad-xs);
}
.st-sm {
  font-size: var(--s-fs-sm);
  padding: var(--s-pad-sm);
}
.st-md {
  font-size: var(--s-fs-md);
  padding: var(--s-pad-md);
}
.st-lg {
  font-size: var(--s-fs-lg);
  padding: var(--s-pad-lg);
}
```

> **决策**：仅保留 `sm / md / lg` 三档（与 css.md 一致）。VAI 中 button 现有的 `xs` size 后续需移除（待办）。`st-xs` 作为最小尺寸用于 tag 等特殊场景。

**`states/themes.less`**

```less
.st-control {
  /* 基础 control 色，依赖 .s-ctrlbg/.s-ctrltxt 显式启用 */
}
.st-dark {
  color: var(--s-norm-inv);
  background: var(--s-dark);
}
.st-success {
  color: var(--s-success);
}
.st-info {
  color: var(--s-info);
}
.st-warn {
  color: var(--s-warn);
}
.st-error {
  color: var(--s-error);
}
.st-invalid {
  color: var(--s-invalid);
}

/* 朴素态：仅与主题色类组合使用，去掉背景，保留前景色 */
.st-plain {
  background-color: transparent !important;
}
```

**`states/interactions.less`**

```less
/* css.md：优先 :hover/:active；st-active/st-disabled 用于无法用伪类的场景 */
.st-disabled,
:disabled {
  cursor: not-allowed;
  opacity: 1; /* 由各维度（bg/txt/bd）通过 :disabled 覆写颜色 */
  pointer-events: none;
}

/* 焦点光晕 */
.st-halo:focus-visible {
  outline: var(--s-outline-width) var(--s-outline-style) var(--s-outline);
  outline-offset: var(--s-outline-offset);
}
```

**`states/modifiers.less`**

```less
.st-bold {
  font-weight: var(--s-fw-bold);
}
.st-thin {
  font-weight: var(--s-fw-thin);
}
.st-italic {
  font-style: italic;
}
.st-icon {
  width: 1em;
  height: 1em;
  aspect-ratio: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.st-round {
  border-radius: var(--s-br-round);
}
.st-circle {
  border-radius: 50%;
}
.st-rect {
  border-radius: 0;
}
```

**`states/layout.less`**

```less
.st-wrap {
  flex-wrap: wrap;
}
.st-gap {
  gap: var(--s-gap-md);
}
.st-gap-xs {
  gap: var(--s-gap-xs);
}
.st-gap-sm {
  gap: var(--s-gap-sm);
}
.st-gap-md {
  gap: var(--s-gap-md);
}
.st-gap-lg {
  gap: var(--s-gap-lg);
}

.st-start {
  justify-content: start;
}
.st-end {
  justify-content: end;
}
.st-stretch {
  justify-content: stretch;
}
.st-between {
  justify-content: space-between;
}
.st-around {
  justify-content: space-around;
}
.st-evenly {
  justify-content: space-evenly;
}
.st-align-start {
  align-items: start;
}
.st-align-end {
  align-items: end;
}
```

**`states/text.less`**

```less
.st-secondary {
  color: var(--s-norm-secondary);
} /* 次级文字色 */
.st-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

**`states/animation.less`**

```less
.st-fast {
  transition-duration: var(--s-ani-time-fast);
}
.st-slow {
  transition-duration: var(--s-ani-time-slow);
}
```

### 3.6 组件类（mixin 组合 + 多变体）

**`components/button/index.less`**

```less
@import "../../scenes/background.less";
@import "../../scenes/text.less";
@import "../../scenes/border.less";
@import "../../scenes/font.less";
@import "../../scenes/padding.less";
@import "../../scenes/cursor.less";
@import "../../states/sizes.less";
@import "../../states/themes.less";
@import "../../states/modifiers.less";

/* 按钮重置（仅 button 标签需要的特殊处理） */
.mixin-init-button() {
  appearance: none;
  outline: none;
  border: none;
  text-align: center;
  touch-action: manipulation;
  user-select: none;
  text-wrap-mode: nowrap;
  white-space-collapse: collapse;

  & :is(i, svg, img) {
    flex-shrink: 0;
  }
  & span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

/* 普通按钮（control 灰底） */
.sc-btn {
  .mixin-init-button();
  .s-flexr();
  .st-md();

  .s-ctrlbg(); /* 背景 + hover + active */
  .s-ctrltxt(); /* 文字色 */
  .s-ctrlbd(); /* 边框 */
  .s-br(); /* 圆角 */
  .s-cursor(); /* 光标 */
  .s-liveshadow(); /* 阴影 + hover 阴影 */

  gap: var(--s-button-gap);
}

/* 主题按钮（实心 + 白字） */
.sc-theme-btn {
  .mixin-init-button();
  .s-flexr();
  .st-md();

  .s-livebg(); /* 主题色背景（自动循环展开 st-info/st-success/...） */
  .s-whitetxt(); /* 主题背景上的白字 */
  .s-livebd();
  .s-br();
  .s-cursor();
  .s-liveshadow();

  gap: var(--s-button-gap);
}

/* 朴素按钮（浅色背景 + 主题色字） */
.sc-plain-btn {
  .mixin-init-button();
  .s-flexr();
  .st-md();

  .s-liveplainbg();
  .s-livetxt();
  .s-livebd();
  .s-br();
  .s-cursor();
  .s-liveshadow();

  gap: var(--s-button-gap);
}

/* 幽灵按钮（透明背景 + 边框 + 主题色字） */
.sc-ghost-btn {
  .mixin-init-button();
  .s-flexr();
  .st-md();
  background-color: transparent !important;

  .s-livetxt();
  .s-livebd();
  .s-br();
  .s-cursor();
  .s-liveshadow();

  gap: var(--s-button-gap);
}

/* 图标按钮（方形） */
.sc-icon-btn {
  .mixin-init-button();
  .s-icon();
  .s-livebg();
  .s-livetxt();
  .s-livebd();
  .s-cursor();
  .s-liveshadow();
}

/* 链接按钮（无 padding，hover 下划线） */
.sc-link-btn {
  .mixin-init-button();
  .s-livetxt();
  .s-cursor();
  .s-hoverunderline();
  background-color: transparent !important;

  &.st-back {
    .s-liveplainbg();
  }
}
```

**用户使用**：

```html
<button class="sc-btn st-md">默认</button>
<button class="sc-theme-btn st-info st-lg">主按钮</button>
<button class="sc-theme-btn st-info st-lg st-plain">朴素</button>
<button class="sc-theme-btn st-info st-lg" disabled>禁用</button>
<button class="sc-icon-btn st-info"><svg>...</svg></button>
<button class="sc-link-btn st-info">链接</button>
```

### 3.7 入口与按需

**`index.less`（全量入口，按需慎用）**

```less
/* 1. 声明层级顺序（从低到高，覆盖优先级递增） */
@layer sc-base, sc-icons, sc-component, sc-utils;

/* 2. 按层导入 */
@layer sc-base {
  @import "./tokens/_index.less";
  @import "./base/reset.less";
  @import "./base/global.less";
  @import "./scenes/_index.less";
  @import "./states/_index.less";
}

@layer sc-icons {
  @import "./scenes/icon.less";
}

@layer sc-component {
  @import "./components/button/index.less";
  @import "./components/link/index.less";
  @import "./components/tag/index.less";
  @import "./components/modal/index.less";
  @import "./components/input/index.less";
}

@layer sc-utils {
  @import "./utils/_index.less";
}
```

**`base/reset.less`（最小化 reset）**

```less
@layer sc-base {
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
  body {
    margin: 0;
  }
  button {
    font: inherit;
  }
  /* 现代浏览器特性直接使用，不做向下兼容 */
  ::placeholder {
    color: var(--s-norm-secondary);
  }
  ::selection {
    background-color: var(--s-info);
    color: var(--s-norm-inv);
  }
  dialog::backdrop {
    background: rgba(0, 0, 0, 0.5);
  }
  :root {
    color-scheme: light dark;
  }
}
```

---

## 阶段 4：构建配置

### 4.1 `package.json`

```json
{
  "name": "scene-theme",
  "version": "0.0.0",
  "type": "module",
  "sideEffects": ["**/*.less", "**/*.css"],
  "exports": {
    ".": "./src/index.less",
    "./reset": "./src/base/reset.less",
    "./tokens/colors": "./src/tokens/colors.less",
    "./components/button": "./src/components/button/index.less",
    "./components/link": "./src/components/link/index.less",
    "./components/tag": "./src/components/tag/index.less",
    "./components/modal": "./src/components/modal/index.less",
    "./components/input": "./src/components/input/index.less",
    "./package.json": "./package.json"
  },
  "files": ["src"],
  "scripts": {
    "build": "lessc src/index.less dist/index.css --no-js",
    "dev": "lessc --watch src/index.less dist/index.css",
    "lint": "stylelint \"src/**/*.less\"",
    "test": "vp test",
    "check": "vp check"
  },
  "devDependencies": {
    "less": "^4.2.0",
    "stylelint": "^16.0.0",
    "stylelint-config-standard": "^36.0.0"
  }
}
```

**关键点**：

- 删 `vp pack`（纯 CSS 库不需要打 TS bundle）
- `sideEffects` 标记 less 文件，consumer 引入的 CSS 不会被 tree-shake 误删
- `exports` 暴露按需入口，consumer 可以只引入用到的组件
- `lessc --no-js` 关闭 JS 注入（less.js 的浏览器/Node 运行时，本项目用不上）

### 4.2 Vite-plus 配置

简化 `vite.config.ts`：

```typescript
import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: { dts: false }, // 纯 CSS 包不需要 .d.ts
  lint: { options: { typeAware: true, typeCheck: true } },
  fmt: {},
});
```

> 删除原计划中的 `css: { inject: false }`：vite-plus 没有这个配置项；CSS 走单独的 `lessc` 编译路径，不进 tsdown。

### 4.3 Stylelint 配置（`.stylelintrc.json`）

```json
{
  "extends": "stylelint-config-standard",
  "rules": {
    "selector-class-pattern": [
      "^(s-|st-|sc-)[a-z0-9-]+$",
      { "message": "类名必须以 s- / st- / sc- 开头" }
    ],
    "custom-property-pattern": "^-s-[a-z0-9-]+$"
  },
  "overrides": [
    {
      "files": ["**/tokens/**/*.less"],
      "rules": { "selector-class-pattern": null }
    }
  ]
}
```

---

## 阶段 5：VAI 集成

### 5.1 安装依赖

```bash
pnpm add scene-theme@workspace:* -F vai
```

### 5.2 VAI 入口一次性引入

**`packages/vai/src/index.ts`**

```typescript
// 在主入口一次性引入，避免每个组件 .vue 各自 import
import "scene-theme/components/button";
import "scene-theme/components/link";
// ... 用到哪个加哪个
```

**不要在 `button.vue` 里写 `import "scene-theme/..."`**。

### 5.3 Button 组件改造

**`button.vue`**

- 删除 `import "./button.less"`
- 根元素改为 `<button class="sc-btn">`（替换原 `tiny-button`）
- 移除 `size: "xs"`（统一 sm/md/lg）

**`button.less`**

- 场景类覆盖到的属性（背景/前景/边框/圆角/尺寸/状态）全部删除
- 仅保留**特殊**样式（如果有）：自定义动画、特有 focus ring、与具体交互绑定的过渡等
- 若无任何特殊样式，**直接删除 `button.less`**

**判断"特殊样式"标准**：是否仅在某个具体组件出现，且与场景/状态类维度不重合。

### 5.4 ConfigProvider 预留

> 暗色主题切换需要 ConfigProvider 组件，但 ConfigProvider 尚未实现。
> scene-theme 不依赖 ConfigProvider 存在，**API 设计上预留**：
>
> 约定根元素有 `data-theme` 属性即可切换。ConfigProvider 后续只需操作 `document.documentElement.dataset.theme`。

---

## 阶段 6：验收

### 6.1 Lint

```bash
cd packages/scene-theme
pnpm lint   # stylelint 校验类名前缀
```

### 6.2 视觉验收（apps/site）

`apps/site` 当前为空，需新建：

- 路径：`apps/site`
- 内容：每个组件一个 demo 页（HTML 即可，无需完整 Vue 工程）
- 提供切换按钮验证主题 / 尺寸 / 状态

```html
<!-- apps/site/button.html -->
<link rel="stylesheet" href="../../packages/scene-theme/dist/index.css" />
<button class="sc-btn st-info st-lg">主按钮</button>
<button class="sc-btn st-info st-lg st-plain">朴素</button>
<button class="sc-btn st-info st-lg" disabled>禁用</button>
```

### 6.3 构建产物检查

```bash
ls packages/scene-theme/dist/                 # 应有 index.css
cat dist/index.css | grep -E "\.(s-|st-|sc-)" | head
```

### 6.4 RFC 先行

按 AGENTS.md "设计为先"，scene-theme 本身需要 RFC：

```
packages/rfcs/foundation/scene-theme.md
```

至少包含：token 全表、场景类清单、状态类清单、命名规则、主题切换机制。

---

## 关键文件清单

**新增（scene-theme 包内）**

- `src/tokens/{colors,sizes,spacing,typography,themes,_index}.less`
- `src/base/{reset,typography,_index}.less`
- `src/scenes/{background,text,border,padding,layout,shadow,radius,cursor,_index}.less`
- `src/states/{sizes,themes,interactions,modifiers,_index}.less`
- `src/components/{button,link,tag,modal,input}/index.less`
- `src/index.less`
- `.stylelintrc.json`

**修改**

- `packages/scene-theme/package.json`（重写）
- `packages/scene-theme/vite.config.ts`（移除 tsdown css 假设）
- `packages/vai/package.json`（加 scene-theme 依赖）
- `packages/vai/src/index.ts`（引入组件样式）
- `packages/vai/src/components/button/button.vue`（删除 size xs、引入 sc-btn 类）
- `packages/vai/src/components/button/button.less`（清空或删除）

**新增（仓库级）**

- `apps/site/`（视觉验收）
- `packages/rfcs/foundation/scene-theme.md`（设计文档）

---

## 验证步骤

```bash
# 1. 安装
pnpm install

# 2. scene-theme 构建
cd packages/scene-theme
pnpm build
ls dist/index.css

# 3. stylelint
pnpm lint

# 4. VAI 集成
cd ../vai
pnpm dev
# 访问 http://localhost:5173 看 button 样式

# 5. 视觉验收
# 打开 apps/site/button.html 看纯 CSS 下的效果

# 6. 整体 monorepo 构建
cd ../..
vp run build
```

---

## 注意事项 / 待决策

1. **品牌主色**：css.md 列出 `info` 但未列 `primary`。本计划统一将 `info` 作为品牌主色（按钮默认 `st-info`）。**待决策**。
2. **size 调整**：VAI `button.vue` 当前 size 含 `xs`，按 css.md 三档（sm/md/lg）需移除 `xs`。**待执行**。
3. **`:hover` / `:active` 行为**：本计划把它们定义在 `.sc-btn` 等组件类内（通过 `&:hover`）。如需全局统一 hover 行为（`opacity` 变化），可考虑抽到 `states/interactions.less` 中。**待决策**。
4. **`st-plain` 用法**：仅与主题色类（`st-info` 等）组合。单独使用 `st-plain` 无效。
5. **暗色主题默认**：通过 `prefers-color-scheme: dark` 自动应用暗色。是否默认开启？**待决策**。
6. **未涉及**：组件子元素 `sc-{component}__{element}`（按指示延后）、`@supports` 降级（按 AGENTS.md 不考虑兼容）。
