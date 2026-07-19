# useTimer

> 状态：**已实现** | 包：**hooks**

## 概述

延时触发的通用定时器，统一替代组件内散落的 `setTimeout` 与手写 debounce。

**能力：**

1. **debounce**：连续调用 `start` 时，仅最后一次在 delay 后执行
2. **自动卸载**：组件 `onUnmounted` 时自动 `stop`，避免泄漏
3. **异步**：`start` 返回 `Promise`，支持 `await start(...)`

**使用方：** Button（防重复点击）、搜索/表格查询 debounce 等

## 入参

```ts
function useTimer(cb: (...args: any[]) => void, delay: MaybeRef<number>);
```

| 参数    | 类型                       | 说明                                            |
| ------- | -------------------------- | ----------------------------------------------- |
| `cb`    | `(...args: any[]) => void` | delay 到期后执行的回调；`start` 的参数原样传入  |
| `delay` | `number \| Ref<number>`    | 延迟毫秒数；支持响应式，每次 `start` 读取当前值 |

## 返回值

```ts
{
  start: (...args: any[]) => Promise<unknown>
  stop: () => void
  isPending: ComputedRef<boolean>  // 由 timerId 是否存在推导
}
```

## 示例

### 防重复点击（Button）

```ts
const { start: resetDisabled } = useTimer(() => {
  disabled.value = false;
}, 1000);

function onClick() {
  disabled.value = true;
  resetDisabled();
}
```

### 查询 debounce

```ts
const { start: debounceQuery, stop: stopQuery } = useTimer(
  (page: number) => grid.query(page),
  500,
);

debounceQuery(1);
debounceQuery(2); // 仅第 2 次在 500ms 后触发

stopQuery(); // 立即取消
```

## 实现逻辑

1. `timerId` 为 `ref(0)`，保存 `setTimeout` 句柄；`isPending = computed(() => !!timerId.value)`
2. `delay` 在每次 `start` 时通过 `unref(delay)` 读取当前值
3. `start(...args)`：先 `stop()` 取消上一次定时并 reject 悬挂 Promise，再注册新定时器
4. `stop()`：`clearTimeout`，并以 `pendingReject` reject 未完成的 Promise
5. `onUnmounted` 注册 `stop` 清理

## 验收标准

- [x] 基础 API：`start` / `stop` / debounce / 卸载清理
- [x] `stop` 或重入 `start` 时 pending Promise 正确 reject
- [x] `isPending` 由 `timerId` 推导
- [x] 无泄漏
- [ ] 单测覆盖：debounce、stop、卸载、错误传播、响应式 delay
