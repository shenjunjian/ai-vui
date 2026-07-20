# ColorSwatch

> 状态：**草案** | 优先级：**P3** | 分类：**Color System 颜色**

## 概述

色块。

- **包**：`vai`
- **导出**：`ColorSwatch`
- **scene-theme 类名**：`sc-color-swatch`（规划，scene-theme 尚未实现）

## Props

| 属性       | 类型                   | 默认值  | 说明                |
| ---------- | ---------------------- | ------- | ------------------- |
| `class`    | `string \| string[]`   | —       | 自定义类名          |
| `style`    | `CSSProperties`        | —       | 自定义样式          |
| `size`     | `'sm' \| 'md' \| 'lg'` | `'md'`  | 尺寸（映射 `st-*`） |
| `disabled` | `boolean`              | `false` | 禁用态              |

> 待细化：补充 ColorSwatch 专属 props。

## Events

| 事件 | payload | 说明   |
| ---- | ------- | ------ |
| —    | —       | 待定义 |

## Slots

| 插槽      | 说明     |
| --------- | -------- |
| `default` | 默认内容 |

> 待细化：补充 ColorSwatch 专属 named slots。

## Exposed Methods

| 方法 | 签名 | 说明   |
| ---- | ---- | ------ |
| —    | —    | 待定义 |

## State 模型

```ts
interface ColorSwatchState {
  // 待定义
}
```

## Hook 依赖（hooks）

| Hook              | 用途                  |
| ----------------- | --------------------- |
| `useControllable` | 受控/非受控（如适用） |
| —                 | 待补充                |

## 实现逻辑

1. 解析 props，合并 ConfigProvider 上下文
2. 根元素挂载 `sc-color-swatch` + `st-*` 状态类
3. 通过 hook 处理 DOM，state 驱动 UI
4. 销毁时清理监听与引用

> 待细化：ColorSwatch 交互流程。

## 无障碍（a11y）

- **role / aria / 键盘 / 焦点**：待定

## 动画

- 使用 `usePresence`（如适用）
- 遵循 `--sv-transition-*` token

## Web Component 预留

- Custom Element：`tvp-color-swatch`

## 验收标准

- [ ] API 与本文档一致
- [ ] 无障碍达标
- [ ] scene-theme 类名正确（实现后）
- [ ] 测试与演示页
