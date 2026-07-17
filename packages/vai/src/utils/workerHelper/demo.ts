import { runInWorker } from '.'
import { chunk } from '../dataHelper'

export async function testWorker(N = 100) {
  const data = [...Array(N).keys()]

  const segs = chunk(data, N / 20) // 20核心的计算
  console.log('N=', N)

  // 主线程计算
  console.time('s')
  data.map((i) => i + Math.random())
  console.timeEnd('s')

  // 1 个worker计算
  console.time('p1')
  await runInWorker('randomArr', [data])
  console.timeEnd('p1')

  // 20个worker计算
  console.time('p20')
  const tasks = segs.map((seg) => runInWorker('randomArr', [seg]))
  const result = await Promise.all(tasks)
  console.log(result)

  console.timeEnd('p20')

  // 自定义函数，多个参数的情况
  const list = Array.from(Array(100).keys()) // 0 .. 99
  let sum = await runInWorker(
    (list, base) => {
      return list.reduce((sum: number, curr: number) => sum + curr) + base
    },
    [list, 100],
  )

  console.log('sum should equal 5050, sum=', sum)
}

// 测试 randomArr 内置方法：
// 直接JS运行：
// 1000： 0.1 ms
// 1000_0   0.5ms
// 1000_000   50ms

// 单 worker 运行
// 1000： 5~10 ms
// 1000_0   5~10ms
// 1000_000   80ms  传输量大

// 20 个worker运行
// 1000: 21~30 ms
// 1000_0  30~40ms
// 1000_000   50ms   // 偶有反先

// 结论：
// 使用worker, 初始成本大，传入数据成本大，返回数据成本大
// 所以需要： 函数要相对复杂，woker复用， 返回数据最好是汇总值。
