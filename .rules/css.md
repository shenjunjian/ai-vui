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

## 设计方式

1. 首先设计`场景类`，可以将开发组件库时，可能涉及到的css属性，对它们进行分组，起一个场景名字代表它的应用场景。比如 边框bd, 文字色txt,背景色bg,圆角br, 内边距pad ，阴影shadow， 光标cursor, 布局display 等等。
   相关的css属性，通常要联合使用的时候，将它们合并为同一个类名，比如省略号， 字体等。

2. 设计`状态类`，将状态类叠加到同一个场景类的元素之上时，它才有效果，比如： st-lg(影响pad, font-size等)， st-success(影响文本色，背景色，边框色), st-plain(朴素色，只有在主题色时)
   st-hover,st-active, st-disabled, st-bold,st-thin(表示字体的粗细), st-icon(表示显示为正方形的图标样式), st-round,st-circle(表示普通圆角或正圆)。

3. 设计`组件类`， 它根据组件的实际情况，mixin一组的场景类，类似于unocss中的 `@apply` 一样，将多个场景类名合并到组件名类勤劳组件子组件元素上。 这样用户使用组件类名，就能拥有多个css属性的设计，用户添加不同的状态类，来让组件呈现不同的状态。

4. 组件库有一组底层CSS变量，方便定制主题。 基础token变量以 `--s-`为前缀， 组件token变量以 `--sc-`为前缀。覆盖所有这些css变量就能完成一套新风格的组件库。
5. 需要有reset.css 文件，包含常用到的reset的内容，以及配置默认 滚动条， ::placeholder, ::selection等全局生效的一些样式。
6. 用@layer进行样式管理 ， s-base 包含reset以及场景类，状态类的样式， s-component 包含组件的样式

```less
@layer s-base, s-component;
```

### 场景类 + 状态类 + 组件类 的示例

1.  每一个场景类，对应一个或多个css属性，示例：  
    font-family font-size line-height font-weight 都是应用在文字上的， 可以起一个名字 s-font;
    border, padding，margin 等，可以起名字 s-bd s-pad, s-margin ，
    color, background, border-color是控制颜色的， 可以起 s-text,s-bg
    常见的flex行布局， 可以起名字 s-flexr
    文字超长时显示省略号也是一个场景，可以起名字 s-ellipsis
    其它光标样式，overflow, 下划线， display都可以设计相应的场景类名。
    像头像组件，图标组件，会用到正方形的场景，可以起名字叫 s-iconish

    总之每遇到一种css属性，它一定是服务于某个场景，我们就可以为它起一个场景名字来方便未来复用。

2.  状态类是叠加在场景类名上的状态， 示例：
    st-bold, st-thin来控制字体，那么它只对 s-font 才生效。如果元素有s-font，才会响应st-bold, st-thin 来影响字体粗细。
    st-lg, st-md,st-sm 控制尺寸大小，那么它对 s-font,s-pad,s-margin 都会生效, 也会影响 s-flexr的gap值。
    st-success,st-info, st-plaint等都影响颜色， 那么它对 s-text,s-bg,s-bd 才生效，只控制颜色的css属性。
    :hover, st-hover,:active,st-active,st-diabled,:disabed等 通常响应颜色，所以它们只对颜色类的场景类生效。 disabled的状态类也会影响光标， 所以它对 s-cursor 也产生效果。

    上面只是一些例子，很多场景类都可以为它设计专门的场景类名。 我们能看到，状态类只影响与它相关的css属性和这些场景类名。 更重要的时，状态类名是有优先级的，比如 正常状态 < hover状态< active状态 < disabled状态。

3.  组件类是将场景类组合到一个组件类名。
    比如按钮， 它一定有border, 文本色，背景色， padding等值，所以我将多个场景类名合并(@apply)到 sc-btn下， 那么sc-btn这个类名就迅速拥有了多个场景类能力，并且它也默认支持场景类所拥有的状态类， 比如 .sc-btn.st-lg 就表示大按钮，那么它的字体，padding 都会变大。 sc-btn.st-success 那么它的边框色，文本色，背景色都要相应改变, 并且支持hover, active,disabled的多个状态叠加。
    有的组件不止一层dom， 可以有组件子元素，组件子元素同样是将场景类组合到一起， 实现组件样式的快速开发，并且支持状态类。

## 开发方式

样式库不是一下子开发完成的，要根据实际遇到的组件后，慢慢扩充场景类，状态类。所以现在只需要考虑 button按钮， Tag标签， link 链接文字, modal 弹窗这4个组件为起点，设计场景类 + 状态类 + 组件类 。
