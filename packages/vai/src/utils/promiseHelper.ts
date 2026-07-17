import { isPromise, isFunction } from "@vue/shared";
// 组件的一些拦截函数： beforeClose 等， 通过返回 boolean | Promise<boolean> 来判断是否允许close的。

/** 异步解析函数返回 any | Promise<any> 的确切值
 * @example
 * let boolOrPromise = beforeClose()
 * resolvePromise ( boolOrPromise)
 */
export const resolvePromise = /*@__PURE__*/ async (val: any | Promise<any>) => {
  if (isPromise(val)) {
    try {
      const ret = await val;
      return !!ret;
    } catch {
      return false;
    }
  } else {
    return !!val;
  }
};

/** 通过传入的guard函数， 来判断返回是否为true。 为true则执行后面的回调函数
 * @example
 * callWithGuard(props.beforeClose, ()=> api.close())
 * callWithGuard(new Promise(....), ()=> api.close())
 * callWithGuard(true, ()=> api.close())
 * callWithGuard(false, ()=> api.close())
 *
 * */
export const callWithGuard = /*@__PURE__*/ async (
  guard: (() => boolean | Promise<boolean>) | Promise<boolean> | boolean,
  callback: () => void
) => {
  const promise = isFunction(guard) ? guard() : guard;

  if (await resolvePromise(promise)) {
    callback();
  }
};

/** 异步等待函数，且返回值
 * @example
 * await delayValue('foo', 100)
 */
export const $delayValue = /*@__PURE__*/ async (value: any, time: number) =>
  new Promise((resolve) =>
    setTimeout(() => {
      resolve(value);
    }, time)
  );

/** 异步等待函数，简化setTimeout的嵌套地狱
 * @example
 * await delay(100)
 */
export const $delay = /*@__PURE__*/ $delayValue.bind(true);

/** 按顺序执行异步任务
 *
 * @example
 * const job= useSeqJob()
 * job.run(async ()=> await $delay(100))
 * job.run(async ()=> await $delay(200))
 */
export const useSeqJob = /*@__PURE__*/ () => {
  type Task<T = any> = {
    runner: () => Promise<T>;
    resolve: (v: T) => void;
    reject: (e: any) => void;
  };

  const queue: Task[] = [];
  let running = false;

  const runLoop = async () => {
    if (running) return;
    running = true;
    while (queue.length) {
      const task = queue.shift()!;
      try {
        const res = await task.runner();
        task.resolve(res);
      } catch (err) {
        task.reject(err);
      }
    }
    running = false;
  };

  return {
    run<T>(fn: () => T | Promise<T>): Promise<T> {
      return new Promise<T>((resolve, reject) => {
        queue.push({
          runner: () => Promise.resolve().then(fn),
          resolve,
          reject,
        });
        // 启动执行循环（如果尚未运行）
        runLoop();
      });
    },
  };
};
