# Tag

> 状态：**开发中** | 优先级：**P0** | 分类：**Data Display 数据展示**

## 概述

标签。渲染为 span, inline-block， 有外边框。不响应聚焦，所以不需要halo 效果。 可以有 icon, 但是让用记使用插槽即可。

- **包**：`@opentiny/vue-next`
- **导出**：`Tag`

## Props

| 属性       | 类型                                                 | 默认值  | 说明                                                                                       |
| ---------- | ---------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------ |
| `size`     | `'xs' \| 'sm' \| 'md' \| 'lg'`                       | `'md'`  | 尺寸（映射 `st-*`）                                                                        |
| `disabled` | `boolean`                                            | `false` | 禁用态                                                                                     |
| `closable` | `boolean`                                            | `false` | 是否有关闭按钮                                                                             |
| `theme`    | `'success' \| 'info' \| 'warn' \| 'error' \| 'dark'` | —       | 语义主题色（与 Button 一致）；但没有 hover, active 的行为。 无主题色时，主文本色带边框即可 |
| `plain`    | `boolean`                                            | `false` | 朴素主题色 ；仅指定theme时生效。                                                           |
| `circle`   | `boolean`                                            | `false` | 当值为`true` 左右是半圆形圆角；当值为 false时， 为普通圆角，                               |

## Events

| 事件    | payload | 说明       |
| ------- | ------- | ---------- |
| closing | —       | 关闭前事件 |
| closed  | —       | 关闭后事件 |

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
interface TagState {
  // 待定义
}
```

## Hook 依赖（@opentiny/vue-next-hooks）

| Hook | 用途 |
| ---- | ---- |
| —    | 无   |

## 实现逻辑

1. 解析 props，合并 ConfigProvider 上下文
2. 根元素挂载 `sc-tag` + `st-*` 状态类
3. 通过 hook 处理 DOM，state 驱动 UI
4. 销毁时清理监听与引用

> 待细化：Tag 交互流程。

## 无障碍（a11y）

- **role / aria / 键盘 / 焦点**：待定

## 动画

- 使用 `usePresence`（如适用）
- 遵循 `--sv-transition-*` token

## Web Component 预留

- Custom Element：`tvp-tag`

## 验收标准

- [ ] API 与本文档一致
- [ ] 无障碍达标
- [ ] scene-theme 类名正确（实现后）
- [ ] 测试与演示页
