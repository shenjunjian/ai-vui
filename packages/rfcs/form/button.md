# Button

> 状态：**草案** | 优先级：**P0** | 分类：**Form & Input 表单录入**

## 概述

按钮，一个点击或命令触组件。
它具有：

1. 大小，主题色，朴素主题色，禁用，幽灵按钮， 切换选中状态（类似toggleModeButton），加载中状态（此时禁用点击）
2. 插槽，可显示图标。 或者仅图标，此时显示为正圆型或正方开形。
3. 显示为纯文字 或 链接， 但此时仍占有padding。 （区别于Link组件， 它是纯文字 或 链接， 但没有padding）

- **包**：`@opentiny/vue-next`
- **导出**：`Button`
- **scene-theme 类名**：`sc-btn 系`（规划，scene-theme 尚未实现）

## Props

### 外观

| 属性          | 类型                                                 | 默认值     | 说明                                                                                                                                                         |
| ------------- | ---------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `size`        | `'xs' \| 'sm' \| 'md' \| 'lg'`                       | `'md'`     | 尺寸 → `st-xs` / `st-sm` / `st-md` / `st-lg`；可通过 ConfigProvider 继承默认尺寸                                                                             |
| `theme`       | `'success' \| 'info' \| 'warn' \| 'error' \| 'dark'` | —          | 语义主题色 → 对应 `st-*`；未指定时使用 control 中性色（`sc-btn`）                                                                                            |
| `plain`       | `boolean`                                            | `false`    | 朴素主题色 → `sc-plain-btn` / `sc-icon-plain-btn`；与 `ghost` 互斥，同时设置时以 `ghost` 为准                                                                |
| `ghost`       | `boolean`                                            | `false`    | 幽灵按钮（透明背景，仅保留主题色文字与边框）→ `sc-ghost-btn`                                                                                                 |
| `variant`     | `'button' \| 'text' \| 'link'`                        | `'button'`  | 外观变体：`button` 默认实底/描边按钮；`text` 纯文字（仍保留 padding）；`link` 链接样式（仍保留 padding，区别于 [Link](../foundation/link.md)）→ `sc-link-btn` |
| `iconOnly`    | `boolean`                                            | `false`    | 仅图标按钮；无文字时使用图标按钮布局 → `sc-icon-btn` / `sc-icon-plain-btn`                                                                                   |
| `circle`       |`boolean`                                 | `false` | 仅 `iconOnly` 时有效；`true` 正圆 → `st-circle`，`false` 正方形 → `st-round`                                                                                |

> **scene-theme 类名映射**（由 props 组合推导，互斥优先级：`variant="link"` > `iconOnly` > `ghost` > `plain` > 默认）：
>
> | 组合                    | scene-theme 类名              |
> | ----------------------- | ----------------------------- |
> | 默认                    | `sc-btn`                      |
> | `theme="success"`       | `sc-theme-btn` + `st-success` |
> | `theme="success" plain` | `sc-plain-btn` + `st-success` |
> | `theme="success" ghost` | `sc-ghost-btn` + `st-success` |
> | `variant="link"`        | `sc-link-btn`                 |
> | `iconOnly` + `theme`    | `sc-icon-btn` + `st-*`        |
> | `iconOnly` + `plain`    | `sc-icon-plain-btn` + `st-*`  |

### 状态与行为

| 属性        | 类型      | 默认值  | 说明                                                                                |
| ----------- | --------- | ------- | ----------------------------------------------------------------------------------- |
| `disabled`  | `boolean` | `false` | 禁用态 → `st-disabled`；禁止点击与键盘激活                                          |
| `loading`   | `boolean` | `false` | 加载中；展示 loading 指示（`sc-btn-loading`）并禁止点击，不强制同步 `disabled` prop |
| `toggleMode`    | `boolean` | `false` | 切换模式；点击在选中/未选中间切换（类似 toggleModeButton）                              |
| `actived`   | `boolean` | —       | 选中态（受控）；`toggleMode` 为 `true` 时生效 → `st-active`                             |
| `resetTime`   | `number` | 1000   | 点击后禁用时长  ，防止重复提交                          |

## Events

| 事件             | payload                      | 说明                                                       |
| ---------------- | ---------------------------- | ---------------------------------------------------------- |
| `update:actived` | `(pressed: boolean) => void` | `toggleMode` 模式下选中态变更；用于 `v-model:pressed` 受控绑定 |

## Slots

| 插槽      | 说明     |
| --------- | -------- |
| `default` | 默认内容 |

> 待细化：补充 Button 专属 named slots。

## Exposed Methods

| 方法    | 签名     | 说明     |
| ------- | -------- | -------- |
| state | - | - |
| api | - | - |

## State 模型

```ts
interface ButtonState {
  // 待定义
}
```

## Hook 依赖（@opentiny/vue-next-hooks）

| Hook       | 用途         |
| ---------- | ------------ |
| `useTimer` | 防止重复点击 |

## 实现逻辑

1. 解析 props，合并 ConfigProvider 上下文
2. 根元素挂载 `sc-btn 系` + `st-*` 状态类
3. 通过 hook 处理 DOM，state 驱动 UI
4. 销毁时清理监听与引用

> 待细化：Button 交互流程。

## 无障碍（a11y）

- **role / aria / 键盘 / 焦点**：待定

## 动画

- 遵循 `--sv-transition-*` token

## Web Component 预留

- Custom Element：`tvp-button`

## 验收标准

- [ ] API 与本文档一致
- [ ] 无障碍达标
- [ ] scene-theme 类名正确（实现后）
- [ ] 测试与演示页
