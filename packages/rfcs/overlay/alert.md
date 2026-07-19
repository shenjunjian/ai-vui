# Alert

> 状态：**开发中** | 优先级：**P0** | 分类：**Overlay & Feedback 浮层与反馈**

## 概述

页内占位警告条。 有前置状态图标， 主题色以及可关闭等特性。

- **包**：`vai`
- **导出**：`Alert`

## Props

| 属性    | 类型                                                 | 默认值 | 说明                                       |
| ------- | ---------------------------------------------------- | ------ | ------------------------------------------ |
| `size`  | ` 'sm' \| 'md' \| 'lg'`                              | `'md'` | 尺寸                                       |
| `theme` | `'success' \| 'info' \| 'warn' \| 'error' \| 'dark'` | —      | 语义主题色 ；未指定时使用 control 中性色色 |

| `show-icon` | `boolean` | `true` | 是否显示前置状态图标 |
| `closable` | `boolean` | `false` | 是否有关闭按钮 |
| `beforeClose` | `() => boolean \| Promise<boolean>` | — | 关闭前拦截；返回 `true` 允许关闭，返回 `false` / Promise reject / 异步错误时取消关闭 |

## Events

| 事件   | payload | 说明       |
| ------ | ------- | ---------- |
| closed | —       | 关闭后事件 |

## Slots

| 插槽      | 说明         |
| --------- | ------------ |
| `default` | 默认内容     |
| `icon`    | 状态图标内容 |
| `close`   | 关闭的内容   |

## Exposed Methods

| 方法  | 签名 | 说明 |
| ----- | ---- | ---- |
| state | -    | -    |
| api   | -    | -    |

## State 模型

```ts
interface AlertState {
  // 待定义
}
```

## Hook 依赖（hooks）

| Hook | 用途 |
| ---- | ---- |

## 实现逻辑

1. 解析 props，合并 ConfigProvider 上下文

## 无障碍（a11y）

- **role / aria / 键盘 / 焦点**：待定

## Web Component 预留

- Custom Element：`tvp-alert`

## 验收标准

- [ ] API 与本文档一致
- [ ] 无障碍达标
- [ ] 测试与演示页
