// 通用下载函数
export function saveAs(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/** 将string转换为blob */
export function stringToBlob(str: string) {
  return new Blob([str], { type: 'text/plain' })
}

type MimeType = 'image/png' | 'image/png' | 'image/jpeg' | 'image/webp'
/** 将canvas转换为blob */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: MimeType = 'image/png', // 可选 'image/png' | 'image/jpeg' | 'image/webp'
) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), mimeType)
  })
}
/** 将数组转换为blob */
export function arrayToCsvBlob(data: any[][]) {
  const csvContent = data.map((row) => row.join(',')).join('\n')
  return new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
}

/** 将canvas转换为base64 的url */
export function canvasToBase64Url(
  canvas: HTMLCanvasElement,
  mimeType: MimeType = 'image/png', // 可选 'image/png' | 'image/jpeg' | 'image/webp'
) {
  canvas.toDataURL(mimeType)
}
