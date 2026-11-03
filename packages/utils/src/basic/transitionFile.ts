/**
 * 从URL获取图片并创建File对象
 *
 * @param url - 图片的URL地址
 * @param imageName - 图片文件名称
 * @returns 返回包含图片数据的File对象
 * @throws 当URL无效或网络请求失败时抛出错误
 */
export async function getImageFileFromUrl(url: string, imageName: string): Promise<File> {
  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`获取图片失败: ${response.status} ${response.statusText}`)
    }

    const blob = await response.blob()
    return new File([blob], imageName, { type: blob.type || 'image/png' })
  }
  catch (error) {
    throw new Error(`创建图片文件失败: ${(error as Error).message}`)
  }
}

/**
 * 将base64字符串转换为File对象
 *
 * @param base64 - base64编码的字符串
 * @param filename - 文件名
 * @param type - 文件MIME类型，默认为'image/png'
 * @returns 返回File对象
 * @throws 当base64格式无效时抛出错误
 */
export function base64ToFile(base64: string, filename: string, type = 'image/png'): File {
  try {
    // 移除base64字符串中的头部信息(如果存在)
    const base64String = base64.includes('base64,') ? base64.split('base64,')[1] : base64

    // 将base64解码为二进制数据
    const byteCharacters = atob(base64String as string)
    const byteArrays = new Uint8Array(byteCharacters.length)

    for (let i = 0; i < byteCharacters.length; i++) {
      byteArrays[i] = byteCharacters.charCodeAt(i)
    }

    const blob = new Blob([byteArrays], { type })
    return new File([blob], filename, { type })
  }
  catch (error) {
    throw new Error(`base64转文件失败: ${(error as Error).message}`)
  }
}

/**
 * 将Blob对象转换为File对象
 *
 * @param blob - 要转换的Blob对象
 * @param filename - 文件名
 * @param options - 可选的文件选项，包含type和lastModified
 * @param options.type - 文件 MIME 类型
 * @param options.lastModified - 文件最后修改时间戳
 * @returns 返回File对象
 */
export function blobToFile(blob: Blob, filename: string, options?: { type?: string, lastModified?: number }): File {
  const fileOptions = {
    type: options?.type || blob.type,
    lastModified: options?.lastModified || Date.now(),
  }
  return new File([blob], filename, fileOptions)
}

/**
 * 将File或Blob对象转换为base64字符串
 *
 * @param file - 要转换的File或Blob对象
 * @returns 返回base64编码的字符串
 * @throws 当文件读取失败时抛出错误
 */
export function fileToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = error => reject(new Error(`文件转base64失败: ${error}`))
  })
}

/**
 * 将图片URL转换为base64字符串
 *
 * @param url - 图片URL地址
 * @returns 返回base64编码的字符串
 * @throws 当URL无效或转换失败时抛出错误
 */
export async function imageUrlToBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`获取图片失败: ${response.status} ${response.statusText}`)
    }

    const blob = await response.blob()
    return await fileToBase64(blob)
  }
  catch (error) {
    throw new Error(`图片URL转base64失败: ${(error as Error).message}`)
  }
}

/**
 * 将Base64编码的字符串转换为ArrayBuffer
 *
 * 此函数用于处理Base64格式的数据，将其转换为二进制数据（ArrayBuffer），
 * 以便进行进一步的处理，如文件操作、网络传输等
 */
export function base64ToArrayBuffer(base64: string) {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    try {
      // 将Base64编码的字符串转换为二进制字符串
      const binaryString = window.atob(base64)
      // 获取二进制字符串的长度
      const len = binaryString.length
      // 创建一个Uint8Array对象来存储二进制数据
      const bytes = new Uint8Array(len)
      // 遍历二进制字符串，将每个字符的ASCII码放入Uint8Array中
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      // 返回存储了二进制数据的ArrayBuffer
      return resolve(bytes as unknown as ArrayBuffer)
    }
    catch (error) {
      reject(error)
    }
  })
}
/**
 * 视频信息接口
 */
export interface VideoInfo {
  duration: number // 视频时长（秒）
  format: string | null // 视频格式（扩展名）
  resolution: string // 分辨率，例如 "1920x1080"
  fileSize: number | null // 文件大小（字节）
  firstFrame: string // 首帧图片（Base64）
  url: string // 视频链接
  name: string // 视频名称
}

/**
 * 通过视频链接获取视频信息
 * @param videoUrl 视频链接
 * @returns Promise<VideoInfo>
 */
export async function getVideoInfo(videoUrl: string): Promise<VideoInfo> {
  return new Promise((resolve, reject) => {
    let video: HTMLVideoElement | null = document.createElement('video')

    const cleanup = () => {
      if (!video)
        return
      video.removeEventListener('loadedmetadata', onLoadedMetadata)
      video.removeEventListener('seeked', onSeeked)
      video.removeEventListener('error', onError)
      video.removeAttribute('src')
      video.load()
      video = null
    }

    const onLoadedMetadata = () => {
      if (video) {
        video.currentTime = 2 // 跳到视频的第2秒画面
      }
    }

    const onSeeked = async () => {
      if (!video)
        return
      try {
        // 1. 获取基本视频信息
        const duration = video.duration // 视频时长（秒）
        const videoWidth = video.videoWidth // 视频宽度
        const videoHeight = video.videoHeight // 视频高度
        // 根据 URL 获取扩展名（简单处理，不一定100%准确）
        const urlWithoutQuery = video.currentSrc.split('?')[0]
        const format = urlWithoutQuery.includes('.')
          ? urlWithoutQuery.split('.').pop() || null
          : null

        // 2. 获取文件大小（需要服务器返回 Content-Length）
        let fileSize: number | null = null
        try {
          const res = await fetch(videoUrl, { method: 'HEAD' })
          if (res.ok && res.headers.has('content-length')) {
            fileSize = Number.parseInt(res.headers.get('content-length') || '0', 10)
          }
        }
        catch {
          // 忽略 HEAD 请求跨域或无 Content-Length 异常
        }

        // 3. 获取首帧图片
        const canvas = document.createElement('canvas')
        canvas.width = videoWidth
        canvas.height = videoHeight
        const ctx = canvas.getContext('2d')
        if (ctx && video) {
          ctx.drawImage(video, 0, 0, videoWidth, videoHeight)
        }
        const firstFrame = canvas.toDataURL('image/jpeg') // 转成 Base64 图片

        cleanup()
        // 返回视频信息
        resolve({
          duration: Math.ceil(duration || 0),
          format,
          resolution: `${videoWidth}x${videoHeight}`,
          fileSize,
          firstFrame,
          name: extractFileName(videoUrl),
          url: videoUrl,
        })
      }
      catch (err) {
        reject(err)
      }
      finally {
        cleanup()
      }
    }

    const onError = () => {
      cleanup()
      reject(new Error('视频加载失败'))
    }

    video.src = videoUrl
    video.crossOrigin = 'anonymous' // 允许跨域获取首帧（需要视频源服务器允许）
    video.preload = 'metadata'

    video.addEventListener('loadedmetadata', onLoadedMetadata)
    video.addEventListener('seeked', onSeeked)
    video.addEventListener('error', onError)
  })
}
/**
 * 格式化视频时长（秒 -> 分:秒）
 * @param seconds 视频时长（秒）
 * @returns 格式化后的时间字符串（如 "3:45"）
 */
export function formatDuration(seconds: number | undefined): string {
  if (seconds === undefined || Number.isNaN(seconds))
    return '0:00'

  const mins: number = Math.floor(seconds / 60)
  const secs: number = Math.floor(seconds % 60)

  return `${mins}:${secs < 10 ? '0' : ''}${secs}`
}
/**
 * 从URL中提取文件名
 * @param url 文件URL字符串
 * @returns 提取的文件名，如果URL无效则返回空字符串
 */
export function extractFileName(url: string | undefined | null): string {
  // 处理 null/undefined/空字符串的情况
  if (!url?.trim())
    return ''

  try {
    // 处理URL可能包含查询参数的情况（如 example.com/video.mp4?param=value）
    const cleanUrl = url.split('?')[0]
    const segments = cleanUrl.split('/')
    const lastSegment = segments[segments.length - 1]

    // 确保最后一段不是空字符串（如以斜杠结尾的URL）
    return lastSegment || ''
  }
  catch {
    return ''
  }
};
/**
 * 计算并格式化文件大小（模拟）
 * @param size 文件大小（MB）
 * @returns 格式化后的文件大小字符串（如 "45.6 MB"）
 */
export function calculateFileSize(size: number | undefined): string {
  if (size === undefined || Number.isNaN(size) || size <= 0)
    return '0 MB'
  const sizeInMB = size / (1024 * 1024)
  return `${sizeInMB.toFixed(1)} MB`
}

/**
 * 计算视频宽高比
 * @param width 视频宽度（像素）
 * @param height 视频高度（像素）
 * @returns 宽高比字符串（如 "16:9"）或 "-"（无效输入时）
 */
export function getAspectRatio(width: number | undefined, height: number | undefined): string {
  // 检查无效输入
  if (width === undefined || height === undefined
    || Number.isNaN(width) || Number.isNaN(height)
    || width <= 0 || height <= 0) {
    return '-'
  }

  /**
   * 计算最大公约数（GCD）的辅助函数
   * @param a 第一个数
   * @param b 第二个数
   * @returns 最大公约数
   */
  const gcd = (a: number, b: number): number => {
    return b ? gcd(b, a % b) : a
  }

  const divisor: number = gcd(width, height)
  const simplifiedWidth: number = width / divisor
  const simplifiedHeight: number = height / divisor

  // 处理常见的宽高比简写
  if (simplifiedWidth === 16 && simplifiedHeight === 9)
    return '16:9'
  if (simplifiedWidth === 4 && simplifiedHeight === 3)
    return '4:3'
  if (simplifiedWidth === 1 && simplifiedHeight === 1)
    return '1:1'

  return `${simplifiedWidth}:${simplifiedHeight}`
}
