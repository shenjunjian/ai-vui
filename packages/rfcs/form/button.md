# Button

> 状态：**开发中** | 优先级：**P0** | 分类：**Form & Input 表单录入**

## 概述

按钮，一个点击或命令触组件。
它具有：

1. 大小，主题色，朴素主题色，禁用，幽灵按钮， 切换选中状态（类似toggleModeButton），加载中状态（此时禁用点击）
2. 插槽，可显示图标。
3. 图标按钮变体，此时显示为正圆型或正方开形。
4. 文字变体：显示为纯文字 或 链接， 但此时仍占有padding。 （区别于Link组件， 它是纯文字 或 链接， 但没有padding）

- **包**：`@opentiny/vue-next`
- **导出**：`Button`

## Props

### 外观

| 属性      | 类型                                                 | 默认值     | 说明                                                                                                                                                                            |
| --------- | ---------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `size`    | `'sm' \| 'md' \| 'lg'`                               | `'md'`     | 尺寸 → `st-sm` / `st-md` / `st-lg`；可通过 ConfigProvider 继承默认尺寸                                                                                                          |
| `theme`   | `'success' \| 'info' \| 'warn' \| 'error' \| 'dark'` | —          | 语义主题色 ；未指定时使用 control 中性色                                                                                                                                        |
| `plain`   | `boolean`                                            | `false`    | 朴素主题色 ；仅指定theem是生效。                                                                                                                                                |
| `ghost`   | `boolean`                                            | `false`    | 幽灵按钮（透明背景，仅保留主题色文字与边框                                                                                                                                      |
| `variant` | `'button' \| 'text' \| 'link' \| 'icon'`             | `'button'` | 外观变体：`button` 默认实底/描边按钮；`text` 纯文字（仍保留 padding）；`link` 链接样式（仍保留 padding，区别于 [Link](../foundation/link.md)）；`icon` 仅图标样式，正方形或圆形 |
| `circle`  | `boolean`                                            | `false`    | 当值为`true` button 变量时，左右是半圆形圆角， icon变量时，为正圆 ；当值为 false时， 为普通圆角，                                                                               |
| `circle`  | `boolean`                                            | `false`    | 当值为`true` button 变量时，左右是半圆形圆角， icon变量时，为正圆 ；当值为 false时， 为普通圆角，                                                                               |

### 状态与行为

| 属性         | 类型      | 默认值  | 说明                                                                                                                                                                    |
| ------------ | --------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `disabled`   | `boolean` | `false` | 禁用态 → `st-disabled`；禁止点击与键盘激活                                                                                                                              |
| `loading`    | `boolean` | `false` | 加载中；禁止点击并加 `sc-btn-loading`；非 `icon` 变体时额外插入 `sc-btn__loading` 指示；`icon` 变体不插入该元素（由插槽内容自行表达加载态）；不强制同步 `disabled` prop |
| `toggleMode` | `boolean` | `false` | 切换模式，仅button,icon变体时生效；点击在选中/未选中间切换（类似 toggleModeButton）；直接切换，不受 `resetTime` 影响                                                    |
| `pressed`    | `boolean` | —       | 选中态（受控）；`toggleMode` 为 `true` 时生效 ， actived为true时，显示为选中状态。                                                                                      |
| `resetTime`  | `number`  | 1000    | 点击后禁用时长，防止重复提交；`toggleMode` 为 `true` 时不生效（切换无需防重复提交）                                                                                     |

## Events

| 事件             | payload                      | 说明                            |
| ---------------- | ---------------------------- | ------------------------------- |
| `update:pressed` | `(pressed: boolean) => void` | `toggleMode` 模式下选中态变更； |

## Slots

| 插槽      | 说明     |
| --------- | -------- |
| `default` | 默认内容 |

## Exposed Methods

| 方法  | 签名 | 说明 |
| ----- | ---- | ---- |
| state | -    | -    |
| api   | -    | -    |

## State 模型

```ts
interface ButtonState {
  // 有resetTime时， 点击后的冷却状态
  pending: boolean;
}
```

## Hook 依赖（@opentiny/vue-next-hooks）

| Hook       | 用途         |
| ---------- | ------------ |
| `useTimer` | 防止重复点击 |

## 实现逻辑

1. 解析 props，合并 ConfigProvider 上下文
2. 点击处理：
   - `toggleMode` 生效时：直接切换 `pressed`，不启动 `resetTime` 冷却
   - 非 `toggleMode`：通过 `useTimer` 按 `resetTime` 进入 pending，防止重复提交
3. `loading`：根节点加 `sc-btn-loading` 并禁用交互；仅当 `variant !== 'icon'` 时插入 `sc-btn__loading` 元素

> 待细化：Button 交互流程。

## 无障碍（a11y）

- **role / aria / 键盘 / 焦点**：待定

## 验收标准

- [ ] API 与本文档一致
- [ ] 无障碍达标
- [ ] 测试与演示页
