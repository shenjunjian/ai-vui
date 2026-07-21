# Divider

> 状态：**已完成** | 优先级：**P0** | 分类：**Layout 布局**

## 概述

分割线。支持水平和垂直模式，宽度均为 1px。水平时上下 margin: 16px，垂直时左右 margin: 8px。

- **包**：`vai`
- **导出**：`Divider`
- **组件类名**：`v-divider`；垂直变体：`v-vertical-divider`

## Props

| 属性           | 类型                                                 | 默认值    | 说明                              |
| -------------- | ---------------------------------------------------- | --------- | --------------------------------- |
| `vertical`     | `boolean`                                            | `false`   | 是否垂直                          |
| `border-style` | `string`                                             | `solid`   | 线型，支持所有 border-style 的类型 |
| `theme`        | `'success' \| 'info' \| 'warn' \| 'error' \| 'dark'` | —         | 线的主题色；未指定时使用灰色      |

## Events

| 事件 | payload | 说明 |
| ---- | ------- | ---- |

无

## Slots

| 插槽 | 说明 |
| ---- | ---- |

无

## Exposed Methods

| 方法  | 签名 | 说明 |
| ----- | ---- | ---- |
| state | —    | 只读状态 |
| api   | —    | 空对象（预留） |

## State 模型

```ts
interface DividerState {
  themeClass: string;
  rootClass: (string | Record<string, boolean>)[];
  lineStyle: { "--divider-border-style": string };
}
```

## Hook 依赖（hooks）

| Hook | 用途 |
| ---- | ---- |

无

## 实现逻辑

1. 解析 props：`vertical` / `borderStyle` / `theme`
2. `theme` 未指定时挂 `st-control`（灰色）；指定时挂对应 `st-*`
3. `vertical` 为 true 时挂 `v-vertical-divider`，并设置 `aria-orientation="vertical"`
4. `borderStyle` 通过 CSS 变量 `--divider-border-style` 注入到根节点 style

## 无障碍（a11y）

- 根节点：`role="separator"`
- `aria-orientation`：水平 `"horizontal"`，垂直 `"vertical"`
- 无键盘交互、无焦点

## 动画

无

## Web Component 预留

- Custom Element：`tvp-divider`

## 验收标准

- [x] API 与本文档一致
- [x] 无障碍达标
- [x] 组件类名正确
- [x] 测试与演示页
