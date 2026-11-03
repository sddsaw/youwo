import axios from 'axios'

/**
 * 从URL提取文件名
 */
function getFilenameFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)
    return urlObj.pathname.split('/').pop() || null
  }
  catch {
    return null
  }
}

/**
 * 下载Blob对象
 * @param blob - Blob对象
 * @param filename - 下载文件名
 * @param options - 下载选项
 * @param options.revokeDelay - 延迟释放URL的时间（毫秒）
 */
export function downloadBlob(
  blob: Blob,
  filename: string,
  options?: { revokeDelay?: number },
): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = filename
  link.style.display = 'none'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  setTimeout(
    () => URL.revokeObjectURL(url),
    options?.revokeDelay || 1000,
  )
}

/**
 * 下载在线图片
 * @param url - 图片URL
 * @param filename - 下载文件名（可选）
 * @param options - 下载选项
 * @param options.timeout - 请求超时时间（毫秒）
 * @param options.headers - 自定义请求头
 */
export async function downloadImage(
  url: string,
  filename?: string,
  options?: {
    timeout?: number
    headers?: Record<string, string>
  },
): Promise<void> {
  try {
    const controller = new AbortController()
    const timeoutId = options?.timeout
      ? setTimeout(() => controller.abort(), options.timeout)
      : null

    const response = await fetch(url, {
      signal: controller.signal,
      headers: options?.headers,
    })

    if (timeoutId)
      clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`图片下载失败: ${response.status} ${response.statusText}`)
    }

    const blob = await response.blob()
    const finalFilename = filename || getFilenameFromUrl(url) || 'download'
    downloadBlob(blob, finalFilename, { revokeDelay: 1000 })
  }
  catch (error) {
    throw new Error(`图片下载失败: ${(error as Error).message}`)
  }
}

/**
 * 下载Base64数据
 * @param base64 - base64数据
 * @param filename - 下载文件名
 * @param mimeType - 文件类型，默认image/png
 */
export function downloadBase64(
  base64: string,
  filename: string,
  mimeType = 'image/png',
): void {
  try {
    const byteCharacters = atob(base64.includes('base64,') ? base64.split('base64,')[1] : base64)
    const byteArrays = new Uint8Array(byteCharacters.length)

    for (let i = 0; i < byteCharacters.length; i++) {
      byteArrays[i] = byteCharacters.charCodeAt(i)
    }

    const blob = new Blob([byteArrays], { type: mimeType })
    downloadBlob(blob, filename, { revokeDelay: 1000 })
  }
  catch (error) {
    throw new Error(`Base64下载失败: ${(error as Error).message}`)
  }
}

/**
 * 下载文件地址
 * @param url - 文件URL
 * @param options - 下载选项
 * @param options.filename - 下载文件名（可选）
 * @param options.target - 链接打开方式，可选值：
 *   '_blank' - 新窗口打开（默认）
 *   '_self' - 当前窗口打开
 *   '_parent' - 父框架打开
 *   '_top' - 顶层窗口打开
 *   string - 指定框架名称打开
 * @param options.download - 是否强制下载（默认根据target自动判断）
 */
export function downloadFileUrl(
  url: string,
  options?: {
    filename?: string
    target?: '_blank' | '_self' | '_parent' | '_top'
    download?: boolean
  },
): void {
  try {
    const link = document.createElement('a')
    link.href = url

    // 设置目标打开方式
    const target = options?.target || '_blank'
    link.target = target

    // 安全最佳实践
    if (target === '_blank') {
      link.rel = 'noopener noreferrer'
    }

    // 判断是否需要下载
    const shouldDownload = options?.download ?? (target === '_blank')
    if (shouldDownload) {
      link.download = options?.filename || getFilenameFromUrl(url) || 'download'
    }

    // 触发下载/打开
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()

    // 延迟移除元素以避免某些浏览器问题
    setTimeout(() => {
      document.body.removeChild(link)
    }, 100)
  }
  catch (error) {
    throw new Error(`文件URL下载失败: ${(error as Error).message}`)
  }
}

/**
 * 下载API返回的文件流
 * @param apiUrl - API地址
 * @param filename - 下载文件名
 * @param options - 请求配置
 * @param options.method - HTTP 请求方法
 * @param options.data - 请求体负载
 * @param options.headers - 自定义请求头
 * @param options.timeout - 超时时间（毫秒）
 */
export async function downloadApiFile(
  apiUrl: string,
  filename: string,
  options?: {
    method?: string
    data?: any
    headers?: Record<string, string>
    timeout?: number
  },
): Promise<void> {
  try {
    const response = await axios({
      url: apiUrl,
      method: options?.method || 'GET',
      data: options?.data,
      headers: options?.headers,
      responseType: 'blob',
      timeout: options?.timeout || 10000,
    })

    let ext = filename.split('.').pop()
    if (!ext || ext === filename) {
      ext = apiUrl.split('.').pop()
      if (ext && ext !== apiUrl) {
        // 有后缀并且后缀不是文件名，才添加后缀
        filename = `${filename}.${ext}`
      }
    }

    const blob = new Blob([response.data])
    downloadBlob(blob, filename, { revokeDelay: 1000 })
  }
  catch (error) {
    throw new Error(`API文件下载失败: ${(error as Error).message}`)
  }
}
