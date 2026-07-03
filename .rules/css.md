# 场景化主题库

## 目标

1.  CSS token 变量可以定制主题，支持黑色主题
2.  尽量使用 chrome 支持的最新 CSS 能力以及 support来兼容
3.  不以组件为维度进行组织类名，而是以它的使用场景来设计类名。但比原子类名的颗粒度要大，这样在使用时减少类名的数量。
    比如： button, tag, link 等组件都有主题色， 涉及文字，背景，边框等，可以共用一些类名的。
    dialog-box， popconfirm, card 等都是一个区域，是由 header,body,footer组件， 可以共用一些类名的。
    全局相同的布局使用相同的类名
4.  组件统一支持lg, md, sm 三个尺寸系列值， 支持 `主题色 control，dark,success, info,warn,error` 的颜色， 其中control 色是类似window中的控件的灰色。

## 统一命名规范

- 场景类前缀：`s-`（scene class），例如 `s-flexr`、`s-txt`,`s-bg` ,`s-bd` 。
- 状态类前缀：`st-`（state class），用于叠加到 `s-*`，例如 `st-xs`、`st-dark`、`st-disabled`。
- 组件类前缀：`sc-`（component class），组件场景类名到同一个dom上，例如 `s-btn`、`s-link`,`s-tag` 。
- 组件子元素建议：`sc-{component}__{element}`，例如 `sc-modal__header`、`sc-input__prefix`。
- 尺寸统一：`st-sm | st-md | st-lg`。
- 主题/语义统一：`st-dark | st-success | st-info | st-warn | st-error`。
- 交互统一：优先 `:hover/:active` + `st-active/st-disabled`，不再引入 `is-*` 系列。

## 设计方式

首先设计`场景类`，可以将`css控制的属性为维度`进行设计，比如 边框bd, 文字色txt,背景色bg,圆角br, 内边距pad ，阴影shadow， 光标cursor, 布局display 等等。
其次设计`状态类`，将状态类叠加到同一个场景类的元素之上时，它才有效果，比如： st-lg(影响pad, font-size等)， st-success(影响文本色，背景色，边框色), st-plain(朴素色，只有在主题色时)
st-hover,st-active, st-disabled, st-bold,st-thin(表示字体的粗细), st-icon(表示显示为正方形的图标样式), st-round,st-circle(表示普通圆角或正圆)。

当设计`场景类+状态类` 之后 ，才可以设计`组件类`， 它根据组件的实际情况，mixin使用前面的场景类，类似于unocss中的 `@apply` 一样。 这样用户使用时简单指定组件类名，就能拥有多个css属性的设计，同时用户添加不同的状态类，来让组件呈现不同的状态。

## css var Token

组件库有一组底层CSS变量，方便定制主题。 基础token变量以 `--s-`为前缀， 组件token变量以 `--sc-`为前缀。
