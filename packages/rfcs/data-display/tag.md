# Tag

> 状态：**开发中** | 优先级：**P0** | 分类：**Data Display 数据展示**

## 概述

标签。渲染为 span, inline-block， 有外边框。不响应聚焦，也没有hover, 按下等响应，所以不需要halo 效果。 可以有 icon, 但是通过插槽注入即可。

- **包**：`vai`
- **导出**：`Tag`

## Props

| 属性       | 类型                                                 | 默认值  | 说明                                                                                       |
| ---------- | ---------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------ |
| `size`     | `'xs' \| 'sm' \| 'md' \| 'lg'`                       | `'md'`  | 尺寸（映射 `st-*`）                                                                        |
| `disabled` | `boolean`                                            | `false` | 禁用态                                                                                     |
| `closable` | `boolean`                                            | `false` | 是否有关闭按钮                                                                             |
| `theme`    | `'success' \| 'info' \| 'warn' \| 'error' \| 'dark'` | —       | 语义主题色（与 Button 一致）；但没有 hover, active 的行为。 无主题色时，主文本色带边框即可 |
| `plain`    | `boolean`                                            | `false` | 朴素主题色（浅主题色底 + 主题色字/边）；仅指定 theme 时生效。                              |
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
  /** 关闭后为 false，根节点卸载 */
  visible: boolean;
  sizeClass: string;
  themeClass: string;
  rootClass: unknown[];
}
```

## Hook 依赖（hooks）

| Hook | 用途 |
| ---- | ---- |
| —    | 无   |

## 实现逻辑

1. 解析 props，合并 ConfigProvider 上下文
2. 无 `theme` 时不挂主题类：使用主文本色 + 边框（非表单控件，无 `st-control`）；需要高亮语义时使用 `theme="info"`（色值与 Button Info 一致）
3. 有 `theme` 时挂对应 `st-*`，色值与 Button 对齐；`plain` 仅在指定 theme 时挂 `sc-plain-tag`
4. 无 hover / active / focus halo
5. `closable`：点击关闭按钮依次触发 `closing` → 隐藏节点 → `closed`；`disabled` 时不可关闭

## 无障碍（a11y）

- **role / aria / 键盘 / 焦点**：关闭按钮提供 `aria-label="关闭"`；其余待定

## Web Component 预留

## 验收标准

- [x] API 与本文档一致
- [ ] 无障碍达标
- [x] 测试与演示页
