# Alert

> 状态：**开发中** | 优先级：**P0** | 分类：**Data Display 数据展示**

## 概述

页内占位警告条。有前置状态图标、主题色以及可关闭等特性。渲染为 `div` 块级条，占满容器宽度。

- **包**：`vai`
- **导出**：`Alert`

## Props

| 属性          | 类型                                                 | 默认值  | 说明                                                                                 |
| ------------- | ---------------------------------------------------- | ------- | ------------------------------------------------------------------------------------ |
| `size`        | `'sm' \| 'md' \| 'lg'`                               | `'md'`  | 尺寸（映射 `st-*`）                                                                  |
| `theme`       | `'success' \| 'info' \| 'warn' \| 'error' \| 'dark'` | —       | 语义主题色；未指定时使用 control 中性色                                              |
| `showIcon`    | `boolean`                                            | `true`  | 是否显示前置状态图标                                                                 |
| `closable`    | `boolean`                                            | `false` | 是否有关闭按钮                                                                       |
| `beforeClose` | `() => boolean \| Promise<boolean>`                  | —       | 关闭前拦截；返回 `true` 允许关闭，返回 `false` / Promise reject / 异步错误时取消关闭 |

状态图标（UnoCSS 第三方图标类，组件仅挂类名）：未指定 theme / `dark` → `ci-info`；`success` → `ci-check`；`info` → `ci-info`；`warn` → `ci-risk`；`error` → `ci-close`

## Events

| 事件   | payload | 说明       |
| ------ | ------- | ---------- |
| closed | —       | 关闭后事件 |

## Slots

| 插槽      | 说明                                           |
| --------- | ---------------------------------------------- |
| `default` | 默认内容                                       |
| `icon`    | 状态图标内容；未提供时按 theme 使用默认 `ci-*` |
| `close`   | 关闭按钮内容；未提供时为 `×`                   |

## Exposed Methods

| 方法  | 签名 | 说明     |
| ----- | ---- | -------- |
| state | —    | 组件状态 |
| api   | —    | 组件 API |

## State 模型

```ts
interface AlertState {
  /** 关闭后为 false，根节点卸载 */
  visible: boolean;
  sizeClass: string;
  themeClass: string;
  /** 默认状态图标类名（ci-check / ci-info / ci-risk / ci-close） */
  iconClass: string;
  rootClass: unknown[];
}
```

## Hook 依赖（hooks）

| Hook | 用途 |
| ---- | ---- |
| —    | 无   |

## 实现逻辑

1. 解析 props，合并 ConfigProvider 上下文
2. 无 `theme` 时挂 `st-control` 中性色；有 `theme` 时挂对应 `st-*`，色值与 Button 对齐
3. `showIcon`：显示前置图标；默认图标按 theme 映射：`success→ci-check`、`info/dark/未指定→ci-info`、`warn→ci-risk`、`error→ci-close`（样式由 UnoCSS 提供；图标集无独立 error 图标）；可通过 `icon` 插槽覆盖
4. `closable`：点击关闭按钮时调用 `beforeClose`（未传入则默认允许）；通过后隐藏节点并触发 `closed`（与 Tag 一致）
5. 根节点 `role="alert"`；关闭按钮提供 `aria-label="关闭"`

## 无障碍（a11y）

- **role / aria / 键盘 / 焦点**：根节点 `role="alert"`；关闭按钮 `aria-label="关闭"`；其余待定

## Web Component 预留

- Custom Element：`tvp-alert`

## 验收标准

- [x] API 与本文档一致
- [ ] 无障碍达标
- [x] 测试与演示页
