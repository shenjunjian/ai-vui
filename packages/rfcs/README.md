# RFC 索引

本目录为 `vai` 与 `hooks` 的设计文档。**实现某组件前，请先完善对应 RFC 中的 Props / Events / Slots / Exposed / 实现逻辑。**

## 子工程

| 包名          | 目录                                                  | 职责                        |
| ------------- | ----------------------------------------------------- | --------------------------- |
| `vai`         | [packages/vue-next](../packages/vue-next)             | Vue 3 组件，单包全量导出    |
| `hooks`       | [packages/vue-next-hooks](../packages/vue-next-hooks) | 可复用 DOM 逻辑 hooks       |
| `scene-theme` | [packages/scene-theme](../packages/scene-theme)       | 独立 CSS 样式库（暂不修改） |

## RFC 章节说明

每份组件 RFC 包含：**Props、Events、Slots、Exposed Methods、State 模型、Hook 依赖、实现逻辑、无障碍、动画、Web Component 预留、验收标准**。

## RFC 编写约定

### `class` / `style` 不在 Props 中声明

Vue 3 会自动将模板上的 `class`、`style` 透传到组件根元素，**所有组件的 Props 表均不列出 `class`、`style`**。

仅当组件内部存在**用户需要单独定制的深层 DOM** 时，才在 Props 中暴露语义化命名，例如：

| 属性                      | 说明                                      |
| ------------------------- | ----------------------------------------- |
| `bodyClass` / `bodyStyle` | 作用于内容区（如 Dialog body、Card body） |
| `tableBodyClass`          | 作用于表格 tbody 等内部节点               |

命名格式：`{区域}{Class\|Style}`，区域名与组件 DOM 结构或 slot 名称对应。

重新生成全部 RFC 草案：`node scripts/generate-rfcs.mjs`

---

## Foundation 基础

- [ConfigProvider](./foundation/config-provider.md) — 主题/方向/尺寸/无障碍上下文（P0）
- [Icon](./foundation/icon.md) — 图标容器（P0）
- [Typography](./foundation/typography.md) — 标题/段落/文本与 Markdown 渲染（P1）
- [Link](./foundation/link.md) — 超链接（P0）

## Layout 布局

- [Container](./layout/container.md) — 最大宽度居中容器（P1）
- [Grid](./layout/grid.md) — CSS Grid 容器，支持拖拽布局（P2）
- [Flex](./layout/flex.md) — Flex 布局容器（P1）
- [Row](./layout/row.md) — 水平栅格行（P1）
- [Col](./layout/col.md) — 栅格列（P1）
- [Space](./layout/space.md) — 子元素间距（P1）
- [Divider](./layout/divider.md) — 分割线（P0）
- [Affix](./layout/affix.md) — 吸顶/吸底（P2）
- [Splitter](./layout/splitter.md) — 面板分割器（P3）
- [Card](./layout/card.md) — 卡片容器（P0）
- [Carousel](./layout/carousel.md) — 轮播（P2）
- [CarouselItem](./layout/carousel-item.md) — 轮播项（P2）
- [Accordion](./layout/accordion.md) — 多面板手风琴（P1）
- [AccordionItem](./layout/accordion-item.md) — 手风琴面板项（P1）
- [Collapsible](./layout/collapsible.md) — 单块折叠（P2）

## Navigation 导航

- [Menu](./navigation/menu.md) — 导航菜单容器（P1）
- [MenuItem](./navigation/menu-item.md) — 菜单项（P1）
- [MenuGroup](./navigation/menu-group.md) — 菜单分组（P2）
- [SubMenu](./navigation/sub-menu.md) — 子菜单（P2）
- [DropdownMenu](./navigation/dropdown-menu.md) — 通用下拉菜单（P0）
- [DropdownMenuItem](./navigation/dropdown-menu-item.md) — 下拉菜单项（P0）
- [DropdownMenuGroup](./navigation/dropdown-menu-group.md) — 下拉菜单分组（P1）
- [Breadcrumb](./navigation/breadcrumb.md) — 面包屑（P0）
- [BreadcrumbItem](./navigation/breadcrumb-item.md) — 面包屑项（P0）
- [Tabs](./navigation/tabs.md) — 选项卡容器（P0）
- [Tab](./navigation/tab.md) — 选项卡标签（P0）
- [TabPanel](./navigation/tab-panel.md) — 选项卡面板（P0）
- [Steps](./navigation/steps.md) — 流程步骤容器（P1）
- [Step](./navigation/step.md) — 单个步骤（P1）
- [Pagination](./navigation/pagination.md) — 分页（P0）
- [Anchor](./navigation/anchor.md) — 锚点导航（P2）
- [AnchorLink](./navigation/anchor-link.md) — 锚点链接（P2）

## Form & Input 表单录入

- [Form](./form/form.md) — 表单上下文（P0）
- [FormItem](./form/form-item.md) — 单字段布局（P0）
- [Button](./form/button.md) — 按钮（P0）
- [ButtonGroup](./form/button-group.md) — 按钮组（P1）
- [Input](./form/input.md) — 单行输入（含 autocomplete、前后缀、Mention）（P0）
- [TextArea](./form/text-area.md) — 多行输入（含 Mention）（P0）
- [InputOTP](./form/input-otp.md) — 验证码输入（P1）
- [InputTag](./form/input-tag.md) — 标签式多值输入（P2）
- [Numeric](./form/numeric.md) — 数字输入组合（P1）
- [Checkbox](./form/checkbox.md) — 复选框（P0）
- [CheckboxGroup](./form/checkbox-group.md) — 复选框组（P1）
- [Radio](./form/radio.md) — 单选（P0）
- [RadioGroup](./form/radio-group.md) — 单选组（P0）
- [Switch](./form/switch.md) — 开关（P0）
- [Slider](./form/slider.md) — 滑块（P1）
- [ProgressBar](./form/progress-bar.md) — 线性进度（P1）
- [Rate](./form/rate.md) — 评分（P2）
- [SelectCore](./form/select-core.md) — 下拉选择基础层（P0）
- [Select](./form/select.md) — 下拉选择（P0）
- [Option](./form/option.md) — 下拉选项（P0）
- [OptionGroup](./form/option-group.md) — 下拉选项分组（P1）
- [Cascader](./form/cascader.md) — 级联选择（P2）
- [Transfer](./form/transfer.md) — 穿梭框（P2）
- [Upload](./form/upload.md) — 文件上传（P1）

## Date & Time 日期时间

- [Calendar](./date-time/calendar.md) — 月历面板（P1）
- [RangeCalendar](./date-time/range-calendar.md) — 范围月历（P1）
- [DatePicker](./date-time/date-picker.md) — 日期选择（P1）
- [DateRangePicker](./date-time/date-range-picker.md) — 日期范围（P2）
- [TimePicker](./date-time/time-picker.md) — 时间选择（P1）
- [DateTimePicker](./date-time/date-time-picker.md) — 日期+时间（P2）

## Data Display 数据展示

- [Table](./data-display/table.md) — 基础表格（P0）
- [TableColumn](./data-display/table-column.md) — 表格列（P0）
- [List](./data-display/list.md) — 列表（P1）
- [ListItem](./data-display/list-item.md) — 列表项（P1）
- [VirtualList](./data-display/virtual-list.md) — 虚拟列表（P3）
- [VirtualListItem](./data-display/virtual-list-item.md) — 虚拟列表项（P3）
- [InfiniteScroll](./data-display/infinite-scroll.md) — 无限滚动（P3）
- [Tree](./data-display/tree.md) — 树形展示（P1）
- [TreeNode](./data-display/tree-node.md) — 树节点（P1）
- [Tag](./data-display/tag.md) — 标签（P0）
- [TagGroup](./data-display/tag-group.md) — 标签组（P2）
- [Badge](./data-display/badge.md) — 徽标/计数（P0）
- [Avatar](./data-display/avatar.md) — 头像（P0）
- [AvatarGroup](./data-display/avatar-group.md) — 头像组（P2）
- [Image](./data-display/image.md) — 图片（P2）
- [Empty](./data-display/empty.md) — 空状态（P1）
- [Timeline](./data-display/timeline.md) — 时间线（P2）
- [TimelineItem](./data-display/timeline-item.md) — 时间线项（P2）
- [Tour](./data-display/tour.md) — 新手引导（P2）
- [TourStep](./data-display/tour-step.md) — 引导步骤（P2）
- [QRCode](./data-display/qrcode.md) — 二维码（P3）
- [Watermark](./data-display/watermark.md) — 水印（P2）
- [Sign](./data-display/sign.md) — 手写签名（P3）

## Overlay & Feedback 浮层与反馈

- [Dialog](./overlay/dialog.md) — 通用模态框（含 drawer/alert-dialog/confirm）（P0）
- [Popover](./overlay/popover.md) — 非模态浮层（P0）
- [Tooltip](./overlay/tooltip.md) — 文字提示（P0）
- [Command](./overlay/command.md) — 命令面板（P2）
- [Alert](./overlay/alert.md) — 页内警告条（P0）
- [Toast](./overlay/toast.md) — 轻量全局提示（P0）
- [Loading](./overlay/loading.md) — 加载指示（含遮罩）（P0）
- [Skeleton](./overlay/skeleton.md) — 骨架屏（P0）

## Color System 颜色

- [ColorPicker](./color/color-picker.md) — 完整取色器（P2）
- [ColorArea](./color/color-area.md) — 色域面板（P3）
- [ColorSlider](./color/color-slider.md) — 色相/透明度滑条（P3）
- [ColorSwatch](./color/color-swatch.md) — 色块（P3）
- [ColorSwatchPicker](./color/color-swatch-picker.md) — 色块选择器（P3）
- [ColorField](./color/color-field.md) — 颜色字段组合（P3）

## Hooks

- [useControllable](./hooks/use-controllable.md) — 受控/非受控状态
- [useDialog](./hooks/use-dialog.md) — dialog 打开/关闭/焦点
- [usePopover](./hooks/use-popover.md) — Popover API 定位
- [useFocusTrap](./hooks/use-focus-trap.md) — 焦点陷阱
- [useDismiss](./hooks/use-dismiss.md) — 外部点击/ESC 关闭
- [useDrag](./hooks/use-drag.md) — 元素拖拽
- [useSortable](./hooks/use-sortable.md) — 列表/表格排序
- [useVirtualizer](./hooks/use-virtualizer.md) — 虚拟滚动
- [useForm](./hooks/use-form.md) — 表单校验
- [useId](./hooks/use-id.md) — 唯一 id
- [useLabel](./hooks/use-label.md) — label-control 绑定
- [useToast](./hooks/use-toast.md) — Toast 队列
- [useCalendar](./hooks/use-calendar.md) — 日历计算
- [useScrollLock](./hooks/use-scroll-lock.md) — 滚动锁定
- [usePresence](./hooks/use-presence.md) — 进出场动画
- [useMediaQuery](./hooks/use-media-query.md) — 响应式断点
