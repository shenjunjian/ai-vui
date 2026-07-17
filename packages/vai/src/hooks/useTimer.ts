import { computed, onUnmounted, ref, unref, type MaybeRef } from "vue";

/** 延时触发的通用定时器。setTimeout / debounce 的场景，均由该函数代替。
 * @1 debounce 能力：防止连续触发
 * @2 自动卸载能力：组件卸载时自动取消
 * @3 异步能力：支持 await start()
 * @example
 * const { start: resetButton } = useTimer(() => (state.disabled = false), 1000)
 * resetButton()
 *
 * const { start: debounceQuery, stop: stopQuery } = useTimer(
 *   (page) => grid.query(page),
 *   500
 * )
 * debounceQuery(1)
 * debounceQuery(2) // 仅请求第 2 页
 * stopQuery() // 立即取消
 */
export function useTimer(cb: (...args: any[]) => void, delay: MaybeRef<number>) {
  const timerId = ref(0);
  let pendingReject: ((reason?: unknown) => void) | undefined;
  const isPending = computed(() => !!timerId.value);

  function stop() {
    pendingReject?.();
    pendingReject = undefined;
    if (timerId.value) {
      clearTimeout(timerId.value);
      timerId.value = 0;
    }
  }

  function start(...args: any[]) {
    return new Promise((resolve, reject) => {
      stop();
      pendingReject = reject;
      timerId.value = setTimeout(() => {
        pendingReject = undefined;
        timerId.value = 0;
        try {
          cb(...args);
          resolve(true);
        } catch (error) {
          reject(error);
        }
      }, unref(delay));
    });
  }

  onUnmounted(() => stop());

  return { start, stop, isPending };
}
