import { dataToBuffer, bufferToData } from '.'

export function testBuffer() {
  const data = [...Array(1000_000).keys()]

  console.time('序列化')
  const str = JSON.stringify(data) //12 ms
  console.timeEnd('序列化')
  console.time('反序列化')
  JSON.stringify(str) // 2 ms
  console.timeEnd('反序列化')

  const objArr = [
    { id: 1, name: '张三', age: 25 },
    { id: 2, name: '李四', isStudent: true },
    [10, 20, '30'],
    '纯字符串元素',
    true,
    false,
    1,
    2,
    3,
  ]
  const objBuffer = dataToBuffer(objArr)
  const restoredObjArr = bufferToData(objBuffer)
  console.log('对象数组还原结果：', objBuffer, restoredObjArr)
}
