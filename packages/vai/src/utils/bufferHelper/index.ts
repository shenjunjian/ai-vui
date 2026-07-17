// ArrayBuffer, TypedArray等辅助函数，便于传递到Worker

/**
 * 通用工具：普通数组（基础类型/对象）↔ ArrayBuffer 双向转换
 * 支持：数字、字符串、布尔、对象（数组），自动处理序列化与类型归一化
 */

export function dataToBuffer(data: any) {
  const dataStr = JSON.stringify(data)
  const encoder = new TextEncoder()
  const typedArray = encoder.encode(dataStr)

  return typedArray.buffer
}

export function bufferToData(buffer: ArrayBuffer) {
  const typedArray = new Uint8Array(buffer)
  const decoder = new TextDecoder('utf-8')
  const str = decoder.decode(typedArray)
  return JSON.parse(str)
}
