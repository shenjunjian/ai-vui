// worker 脚本：接收 { fnStr, data } 并执行
import { isFunction } from '@vue/shared'
import { WorkerPool } from './workerPool'

const workerPool = new WorkerPool()

/**
 * 使用 Web Worker 在后台执行函数并返回结果 ，ai辅助生成
 * - fn: 接收一个参数并返回结果（可返回 Promise） 或者传入一个内置的name
 * - data: 传递给 fn 参数的数组
 * - options:
 *    - transfer: Transferable 数组（可选）
 *    - timeout: 超时时间，毫秒（可选）
 *    - fallback: 回退条件函数（可选）
 * @eg fn: (a,b)=> a+b
 * @eg data: [1,2]  // 哪怕一个参数，也必须 [1] 传入
 * @eg transfer:[myBuffer]
 * @eg fallback:() => data.length < 10
 *
 * 经验证：普通量级数据，速度更慢。需要优化：数据传入，需要worker池，避免销毁才行。
 */
export async function runInWorker(
  fnOrFnName: string | ((...args: any) => any | Promise<any>),
  args: any,
  options?: { transfers?: Transferable[]; timeout?: number; fallback?: () => boolean; signal: AbortSignal },
): Promise<any> {
  const { transfers, timeout, fallback, signal } = options || {}

  // 在主线程执行: 符合回退条件
  if (isFunction(fnOrFnName) && fallback && fallback()) {
    return fnOrFnName(...args)
  }

  // 进入worker运行
  const fnStr = fnOrFnName.toString()
  return workerPool.submitTask({ fnStr, args }, transfers)
}
