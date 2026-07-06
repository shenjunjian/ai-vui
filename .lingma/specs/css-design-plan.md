# CSS 场景化主题库开发计划

## Context（背景）

根据 `.rules/css.md` 的设计规范，需要实现一个场景化的 CSS 主题库 `scene-theme`。该库的目标是通过场景类、状态类和组件类的组合方式，实现可复用、可定制的 CSS 样式系统。

**当前状态**：
- `packages/scene-theme/src/` 目录完全为空
- 只有 package.json 定义了导出结构，但没有任何实际 CSS 文件
- 仅有 button 组件的 Vue 代码，但未使用场景化类名
- 没有定义任何 CSS 变量（tokens）
- 没有实现 @layer 分层管理

**设计目标**：
1. 建立 CSS token 变量系统，支持主题定制和深色模式
2. 使用最新的 Chrome CSS 特性（如 `@supports`）
3. 以使用场景而非组件维度组织类名，减少类名数量
4. 统一支持 lg/md/sm 三种尺寸和 control/dark/success/info/warn/error 六种主题色
5. 采用三层架构：场景类（s-*）、状态类（st-*）、组件类（sc-*）

## Implementation Plan（实施计划）

### Phase 1: 基础架构搭建

#### 1.1 创建目录结构
```
packages/scene-theme/src/
├── index.less                    # 主入口，声明 @layer
├── base/
│   └── reset.less               # 全局重置样式
├── tokens/
│   ├── colors.less              # 颜色 token 变量
│   ├── sizes.less               # 尺寸 token 变量
│   ├── spacing.less             # 间距 token 变量
│   └── typography.less          # 字体 token 变量
└── layers/
    ├── scene.less               # 场景类样式
    ├── state.less               # 状态类样式
    └── components/              # 组件类样式
        ├── button.less
        ├── tag.less
        ├── link.less
        └── modal.less
```

#### 1.2 定义 @layer 架构
在 `index.less` 中声明图层顺序：
```less
@layer s-base, s-component;
```

### Phase 2: Token 变量系统设计

#### 2.1 颜色 Token（`tokens/colors.less`）
定义基础颜色变量，前缀为 `--s-`：

**主题色系**：
- `--s-color-control`: 控件灰色（类似 Windows 控件色）
- `--s-color-dark`: 深色
- `--s-color-success`: 成功色（绿色系）
- `--s-color-info`: 信息色（蓝色系）
- `--s-color-warn`: 警告色（橙色系）
- `--s-color-error`: 错误色（红色系）

**每种主题色需定义变体**：
- 文本色：`--s-color-{theme}-text`
- 背景色：`--s-color-{theme}-bg`
- 边框色：`--s-color-{theme}-border`
- Hover 态：`--s-color-{theme}-hover-bg`
- Active 态：`--s-color-{theme}-active-bg`

**深色模式支持**：
通过 `@media (prefers-color-scheme: dark)` 或 `.dark` 类覆盖变量值

#### 2.2 尺寸 Token（`tokens/sizes.less`）
定义三种尺寸系列的变量：
- `--s-size-xs`: 超小尺寸
- `--s-size-sm`: 小尺寸
- `--s-size-md`: 中等尺寸（默认）
- `--s-size-lg`: 大尺寸

每个尺寸影响：
- 字体大小：`--s-font-size-{size}`
- 内边距：`--s-padding-{size}`
- 行高：`--s-line-height-{size}`
- 圆角：`--s-border-radius-{size}`

#### 2.3 间距 Token（`tokens/spacing.less`）
定义统一的间距系统：
- `--s-spacing-xs`: 4px
- `--s-spacing-sm`: 8px
- `--s-spacing-md`: 16px
- `--s-spacing-lg`: 24px
- `--s-spacing-xl`: 32px

#### 2.4 字体 Token（`tokens/typography.less`）
定义字体相关变量：
- `--s-font-family`: 默认字体族
- `--s-font-weight-normal`: 正常粗细（400）
- `--s-font-weight-bold`: 粗体（700）
- `--s-font-weight-thin`: 细体（300）

### Phase 3: Reset 样式（`base/reset.less`）

实现全局重置样式，包含：
1. **基础重置**：box-sizing、margin、padding 归零
2. **滚动条样式**：自定义滚动条外观
3. **::placeholder**：输入框占位符样式
4. **::selection**：文本选择样式
5. **默认字体**：设置全局字体族
6. **图片响应式**：max-width: 100%

放入 `s-base` layer：
```less
@layer s-base {
  /* reset styles */
}
```

### Phase 4: 场景类实现（`layers/scene.less`）

根据 CSS 属性分组，创建以下场景类：

#### 4.1 文字场景（`.s-font`）
控制：font-family、font-size、line-height、font-weight
```less
.s-font {
  font-family: var(--s-font-family);
  font-size: var(--s-font-size-md);
  line-height: var(--s-line-height-md);
  font-weight: var(--s-font-weight-normal);
}
```

#### 4.2 背景色场景（`.s-bg`）
控制：background-color
```less
.s-bg {
  background-color: var(--s-color-control-bg);
}
```

#### 4.3 文本色场景（`.s-text`）
控制：color
```less
.s-text {
  color: var(--s-color-control-text);
}
```

#### 4.4 边框场景（`.s-bd`）
控制：border、border-color、border-radius
```less
.s-bd {
  border: 1px solid var(--s-color-control-border);
  border-radius: var(--s-border-radius-md);
}
```

#### 4.5 内边距场景（`.s-pad`）
控制：padding
```less
.s-pad {
  padding: var(--s-padding-md);
}
```

#### 4.6 Flex 行布局场景（`.s-flexr`）
控制：display: flex、flex-direction: row、gap、align-items
```less
.s-flexr {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--s-spacing-sm);
}
```

#### 4.7 省略号场景（`.s-ellipsis`）
控制：overflow、text-overflow、white-space
```less
.s-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

#### 4.8 光标场景（`.s-cursor`）
控制：cursor
```less
.s-cursor {
  cursor: pointer;
}
```

#### 4.9 图标正方形场景（`.s-iconish`）
控制：width、height、display: flex、justify-content、align-items
```less
.s-iconish {
  width: var(--s-size-md);
  height: var(--s-size-md);
  display: flex;
  justify-content: center;
  align-items: center;
}
```

所有场景类放入 `s-base` layer。

### Phase 5: 状态类实现（`layers/state.less`）

状态类叠加在场景类上生效，需要考虑优先级：normal < hover < active < disabled

#### 5.1 尺寸状态（`.st-xs`, `.st-sm`, `.st-md`, `.st-lg`）
影响：字体大小、内边距、行高、圆角、gap
```less
.st-xs {
  --s-font-size-current: var(--s-font-size-xs);
  --s-padding-current: var(--s-padding-xs);
  /* ... */
}
```

#### 5.2 主题色状态（`.st-success`, `.st-info`, `.st-warn`, `.st-error`, `.st-dark`, `.st-control`）
影响：文本色、背景色、边框色
```less
.st-success {
  --s-color-text-current: var(--s-color-success-text);
  --s-color-bg-current: var(--s-color-success-bg);
  --s-color-border-current: var(--s-color-success-border);
}
```

#### 5.3 交互状态（`:hover`, `.st-hover`, `:active`, `.st-active`, `:disabled`, `.st-disabled`）
使用 CSS 嵌套和 `&:hover` 等伪类实现状态叠加
```less
.s-btn {
  &:hover {
    background-color: var(--s-color-control-hover-bg);
  }
  
  &:active {
    background-color: var(--s-color-control-active-bg);
  }
  
  &:disabled, &.st-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
```

#### 5.4 字体状态（`.st-bold`, `.st-thin`）
影响：font-weight
```less
.st-bold {
  font-weight: var(--s-font-weight-bold);
}

.st-thin {
  font-weight: var(--s-font-weight-thin);
}
```

#### 5.5 形状状态（`.st-round`, `.st-circle`）
影响：border-radius
```less
.st-round {
  border-radius: 9999px;
}

.st-circle {
  border-radius: 50%;
}
```

#### 5.6 朴素状态（`.st-plain`）
仅在主题色时生效，背景透明，仅保留边框和文字色

所有状态类放入 `s-base` layer。

### Phase 6: 组件类实现（`layers/components/*.less`）

组件类通过 `@apply` 或 Less mixin 组合多个场景类，形成完整的组件样式。

#### 6.1 Button 组件（`components/button.less`）

**主按钮类** `.sc-btn`：
组合场景类：s-font、s-bg、s-text、s-bd、s-pad、s-cursor

**变体**：
- `.sc-plain-btn`：朴素按钮（背景透明）
- `.sc-ghost-btn`：幽灵按钮（无边框）
- `.sc-text-btn`：文本按钮（无边框无背景）
- `.sc-link-btn`：链接按钮（下划线）

**子元素**：
- `.sc-btn__icon`：图标区域（使用 s-iconish）
- `.sc-btn__loading`：加载状态

**状态支持**：
- 尺寸：`.sc-btn.st-lg`、`.sc-btn.st-sm` 等
- 主题：`.sc-btn.st-success`、`.sc-btn.st-error` 等
- 交互：`:hover`、`:active`、`:disabled`

**CSS 变量**：
- `--sc-btn-font-size`
- `--sc-btn-padding`
- `--sc-btn-border-radius`
- `--sc-btn-bg`
- `--sc-btn-text`
- `--sc-btn-border`

#### 6.2 Tag 组件（`components/tag.less`）

**主标签类** `.sc-tag`：
组合场景类：s-font、s-bg、s-text、s-bd、s-pad

**变体**：
- `.sc-plain-tag`：朴素标签
- `.sc-round-tag`：圆角标签

**子元素**：
- `.sc-tag__icon`：图标
- `.sc-tag__close`：关闭按钮

**状态支持**：同 Button

#### 6.3 Link 组件（`components/link.less`）

**主链接类** `.sc-link`：
组合场景类：s-font、s-text、s-cursor

**变体**：
- `.sc-link-underline`：带下划线
- `.sc-link-plain`：朴素链接

**状态支持**：
- `:hover`：文字颜色变化
- `:active`：按下效果
- `:disabled`：禁用状态

#### 6.4 Modal 组件（`components/modal.less`）

**主弹窗类** `.sc-modal`：
基于原生 `<dialog>` 元素

**子元素**：
- `.sc-modal__header`：头部区域（s-flexr、s-pad、s-bd）
- `.sc-modal__body`：内容区域（s-pad）
- `.sc-modal__footer`：底部区域（s-flexr、s-pad、s-bd）
- `.sc-modal__title`：标题（s-font、st-bold）
- `.sc-modal__close`：关闭按钮（s-iconish）

**尺寸变体**：
- `.sc-modal.st-xs`、`.sc-modal.st-sm`、`.sc-modal.st-md`、`.sc-modal.st-lg`

**动画**：
使用 `@starting-style` 和 view transitions API 实现进入/退出动画

所有组件类放入 `s-component` layer。

### Phase 7: 深色模式支持

通过以下方式实现深色模式：

1. **媒体查询**：
```less
@media (prefers-color-scheme: dark) {
  :root {
    --s-color-control-bg: #333;
    --s-color-control-text: #fff;
    /* ... */
  }
}
```

2. **手动切换类**：
```less
.dark {
  --s-color-control-bg: #333;
  --s-color-control-text: #fff;
  /* ... */
}
```

### Phase 8: 集成到 vai 组件库

更新 `packages/vai/src/components/button/` 中的文件：

1. **button.vue**：将类名从 `tiny-button` 改为 `sc-btn`，添加状态类绑定
2. **button.less**：导入 scene-theme 的 button 样式
3. **button.vm.ts**：确保 props 映射到正确的状态类

示例：
```vue
<template>
  <button
    class="sc-btn"
    :class="[
      sizeClass,      // st-lg, st-sm 等
      themeClass,     // st-success, st-error 等
      variantClass,   // sc-plain-btn, sc-ghost-btn 等
      { 'st-disabled': disabled }
    ]"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>
```

## Critical Files to Modify（关键修改文件）

### 新建文件
1. `packages/scene-theme/src/index.less` - 主入口
2. `packages/scene-theme/src/base/reset.less` - 重置样式
3. `packages/scene-theme/src/tokens/colors.less` - 颜色变量
4. `packages/scene-theme/src/tokens/sizes.less` - 尺寸变量
5. `packages/scene-theme/src/tokens/spacing.less` - 间距变量
6. `packages/scene-theme/src/tokens/typography.less` - 字体变量
7. `packages/scene-theme/src/layers/scene.less` - 场景类
8. `packages/scene-theme/src/layers/state.less` - 状态类
9. `packages/scene-theme/src/layers/components/button.less` - Button 组件
10. `packages/scene-theme/src/layers/component/tag.less` - Tag 组件
11. `packages/scene-theme/src/layers/component/link.less` - Link 组件
12. `packages/scene-theme/src/layers/component/modal.less` - Modal 组件

### 修改文件
1. `packages/vai/src/components/button/button.vue` - 更新类名
2. `packages/vai/src/components/button/button.less` - 导入 scene-theme

## Verification（验证方法）

### 1. 构建验证
运行构建命令确保 Less 编译成功：
```bash
vp run -r build
```

### 2. 样式检查
运行 Stylelint 确保类名符合规范：
```bash
cd packages/scene-theme && npm run lint
```

### 3. 视觉验证
启动网站开发服务，查看组件渲染效果：
```bash
vp run website#dev
```

检查以下内容：
- Button 组件在不同尺寸（xs/sm/md/lg）下的表现
- Button 组件在不同主题色（success/info/warn/error/dark/control）下的表现
- Button 组件的 hover、active、disabled 状态
- Tag、Link、Modal 组件的基本样式
- 深色模式切换是否正常

### 4. 测试验证
运行单元测试：
```bash
vp run -r test
```

### 5. CSS 变量验证
在浏览器 DevTools 中检查：
- CSS 变量是否正确定义
- 变量是否能被正确覆盖以实现主题定制
- @layer 顺序是否正确（s-base 在 s-component 之前）

## Design Decisions（设计决策）

1. **为什么使用 CSS 变量而非 Less 变量**：
   - CSS 变量可以在运行时动态修改，支持主题切换
   - Less 变量在编译时确定，无法动态改变

2. **为什么使用 @layer**：
   - 明确样式优先级，避免 specificity 问题
   - s-base（基础层）优先级低于 s-component（组件层）

3. **为什么状态类使用 CSS 变量覆盖而非直接写样式**：
   - 保持场景类的灵活性，状态类只需修改变量值
   - 便于维护和扩展新的状态

4. **为什么不考虑浏览器兼容性**：
   - 项目明确要求使用最前沿的浏览器 API
   - 目标用户群体使用现代 Chrome 浏览器

## Next Steps After Implementation（实施后的下一步）

1. 为其他组件（Input、Select、Dropdown 等）添加场景类和组件类
2. 添加过渡动画支持（使用 `--sv-transition-*` 变量）
3. 实现主题预设（light、dark、blue、green 等）
4. 编写使用文档和示例
5. 添加视觉回归测试
