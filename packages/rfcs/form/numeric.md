# Numeric

> 状态：**已实现** | 优先级：**P1** | 分类：**Form & Input 表单录入**

## 概述

数字输入组合。原生 `<input type="number">` + `appearance: none` 自定义样式实现；`min` / `max` / `step` 等常见属性通过属性继承透传到内部 `<input>`，组件自身不重复声明。

样式参见：`./images/numeric.png`。默认左侧减号、右侧加号，每次按 `step`（默认 `1`）增减。

用户清空输入时，`modelValue` 为 `NaN`。

自动提示：输入时以 debounce=300ms 匹配 `pop-items`。值为 `string[]` / `number[]` / `Option[]` / 异步函数。`Option` 为 `{ label: string }`。选中后将 `label` 解析为数字写入 `modelValue`：优先使用 `parse`，未提供时用默认字符串转数字。弹出层打开时 Tab / Enter 选中当前项、↑↓ 在匹配项间切换；关闭时 ↑↓ 仍走增减。无匹配时关闭弹出层。

- **包**：`vai`
- **导出**：`Numeric`
- **组件类名**：`v-numeric`

## Props

| 属性            | 类型                                                                                     | 默认值  | 说明                                                        |
| --------------- | ---------------------------------------------------------------------------------------- | ------- | ----------------------------------------------------------- |
| `v-model`       | `number`                                                                                 | `NaN`   | 绑定内部 input 的 `valueAsNumber`；空值为 `NaN`             |
| `size`          | `'sm' \| 'md' \| 'lg'`                                                                   | `'md'`  | 尺寸（映射 `st-*`）                                         |
| `theme`         | `'success' \| 'info' \| 'warn' \| 'error' \| 'dark'`                                     | —       | 语义主题色，只影响 border 和文字；无主题时使用 control 色系 |
| `disabled`      | `boolean`                                                                                | `false` | 是否禁用态                                                  |
| `loop`          | `boolean`                                                                                | `false` | 到达 max / min 后继续增减时，是否循环到另一端               |
| `controls`      | `boolean`                                                                                | `true`  | 是否显示左右增减按钮                                        |
| `unit`          | `string`                                                                                 | `''`    | 单位文案；有单位时不显示 controls 按钮                      |
| `parse`         | `(str: string) => number`                                                                | —       | 粘贴与选中 `pop-items` 时解析文本；粘贴未提供则走浏览器默认；选中未提供则用 `Number(label)` |
| `pop-items`     | `string[] \| number[] \| Option[] \| (query: string) => Promise<string[] \| number[] \| Option[]>` | `[]`    | 自动提示数据项                                              |
| `popper-option` | `Partial<Omit<PopperOption, 'reference' \| 'popper' \| 'show'>>`                         | —       | 自动提示弹出层配置（透传 `usePopper`）                      |

图标类名（UnoCSS）：减号 `ci-minus1`，加号 `ci-plus1`。

## Events

| 事件                | payload  | 说明                                                                 |
| ------------------- | -------- | -------------------------------------------------------------------- |
| `update:modelValue` | `number` | v-model 更新                                                         |
| `input`             | `number` | 值变化时立即触发（键入、增减、api、粘贴、选中提示等）                |
| `change`            | `number` | 值确认时触发（原生失焦提交；增减按钮 / `setValue` / `clear` / 粘贴 / 选中提示等） |

## Slots

| 插槽 | 说明 |
| ---- | ---- |

无插槽

## Exposed Methods

| 方法        | 签名                      | 说明                                   |
| ----------- | ------------------------- | -------------------------------------- |
| `focus`     | —                         | 激活焦点                               |
| `blur`      | —                         | 失焦                                   |
| `clear`     | —                         | 清除值，设置值为 `NaN`                 |
| `setValue`  | `(value: number) => void` | 设置值到 `modelValue`（含钳制 / loop） |
| `selectall` | —                         | 全选文本                               |
| `increase`  | —                         | 按 step 增加                           |
| `decrease`  | —                         | 按 step 减少                           |

通过 `defineExpose({ state, api })` 暴露；方法挂在 `api` 上。

## State 模型

```ts
interface NumericState {
  sizeClass: string;
  themeClass: string;
  rootClass: (string | Record<string, boolean>)[];
  inputAttrs: Record<string, unknown>;
  displayValue: string | number;
  showControls: boolean;
  showUnit: boolean;
  minusDisabled: boolean;
  plusDisabled: boolean;
  filteredItems: Option[];
  activeIndex: number;
  popVisible: boolean;
}
```

## Hook 依赖（hooks）

| Hook        | 用途                        |
| ----------- | --------------------------- |
| `usePopper` | 控制自动提示弹出层          |
| `useTimer`  | debounce 300ms 触发匹配查询 |

## 实现逻辑

1. `inheritAttrs: false`，将 `min` / `max` / `step` / `placeholder` 等落到内部 `<input type="number">`；排除 `class` / `style` / `type` / `disabled` / `value`
2. `v-model` 读写 `valueAsNumber`；输入为空或非法时写 `NaN`，展示为空字符串；值变化时触发 `input`，确认时触发 `change`
3. `showControls = controls && !unit`；有 `unit` 时右侧展示单位区
4. 增减：读取 attrs 中的 `step`（默认 `1`）、`min` / `max`；空值时 `+` 落到 `min ?? 0`，`-` 落到 `max ?? 0`；有值则按 step 加减并按小数位修正精度；增减同时触发 `input` + `change`
5. `loop=false` 时钳制在 `[min, max]`；已到 min 时禁用减号，已到 max 时禁用加号；`loop=true` 时越界落到另一端且不禁用按钮
6. 键盘：弹出层打开时 ↑↓ 切换提示项、Enter/Tab 选中、Esc 关闭；关闭时 ↑↓ 走增减逻辑（覆盖原生，保证 loop 一致；边界禁用时 ↑↓ 同样不生效）
7. 键入过程只触发 `input`；原生 `change`（失焦提交）触发组件 `change`
8. 提供 `parse` 时拦截 `paste`，用解析结果写入并立即 `input` + `change`
9. `pop-items` 经 `useTimer(300)` debounce 后过滤/请求（匹配用输入框字符串），结果用 `usePopper` 展示；选中项优先用 `parse(label)`，否则 `Number(label)`，再 `writeValue`（`input` + `change`）
10. 销毁时由 hooks 清理定时器与 popover 绑定

## 无障碍（a11y）

- 减号按钮：`aria-label="减少"`
- 加号按钮：`aria-label="增加"`
- 控件按钮：`tabindex="-1"`（焦点留在 input）
- 建议列表：`role="listbox"`，选项 `role="option"` + `aria-selected`
- 键盘：↑↓（提示打开时切换项，否则增减）/ Enter / Tab / Esc

## 动画

- 弹出层动画由 `usePopper`（`animate`）控制

## Web Component 预留

- Custom Element：`tvp-numeric`

## 验收标准

- [x] API 与本文档一致
- [x] 无障碍基础达标（增减按钮 aria-label、listbox、↑↓）
- [x] 组件类名正确
- [x] 测试与演示页
