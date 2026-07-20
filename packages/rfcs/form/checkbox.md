# Checkbox

> 状态：**开发中** | 优先级：**P0** | 分类：**Form & Input 表单录入**

## 概述

复选框。用原生 <input type="checkbox"> + appearance: none 自定义样式来实现。用户自定义事件与 input 常见属性，通过属性继承传递到内部 `<input>` 元素。它与 switch 类似，区别在于切换 switch 会直接触发状态改变，而 checkbox 一般用于状态标记，需要和提交操作配合

支持label属性， 自动生成 < label>元素与input进行关联。

支持：indeterminate 属性，透传到input实例的indeterminate 属性上去。 而不是html属性。

<label class="sc-checkbox">
  <input type="checkbox" class="sc-checkbox__input" />
  <span class="sc-checkbox__label"><!-- default slot --></span>
</label>

三个状态使用图标来表示，svg图标存放在： `./icons` 下面， no-checked half-checked checked 三个svg.

- **包**：`vai`
- **导出**：`Checkbox`

## Props

| 属性              | 类型      | 默认值 | 说明     |
| ----------------- | --------- | ------ | -------- |
| `v-model:checked` | `boolean` | `''`   | 是否勾选 |

| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 尺寸（映射 `st-*`） |
| `disabled` | `boolean` | `false` | 禁用态 |
| `label` | `string` | ``| 文本内容， |
| `indeterminate` | `boolean` |`` | 是否为半选， 半选的优先级高。 当它为true时， 无论modelValue是什么值，都显示为半选 |

## Events

| 事件 | payload | 说明   |
| ---- | ------- | ------ |
| —    | —       | 待定义 |

## Slots

| 插槽      | 说明          |
| --------- | ------------- |
| `default` | 默认label内容 |

## Exposed Methods

| 方法       | 签名                  | 说明        |
| ---------- | --------------------- | ----------- |
| `focus`    | —                     | 激活焦点    |
| `blur`     | —                     | 失焦        |
| `setCheck` | (value:boolean)=>void | 设置check值 |

通过 `defineExpose({ state, api })` 暴露；方法挂在 `api` 上。

## State 模型

```ts
interface CheckboxState {
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

## 动画

暂时先不引入动画

## Web Component 预留

- Custom Element：`tvp-checkbox`

## 验收标准

- [ ] API 与本文档一致
- [ ] 无障碍达标
- [ ] 测试与演示页
