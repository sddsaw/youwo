/**
 * 检测当前设备是否为PC端
 * @returns 返回true表示是PC端，false表示是移动端
 */
export function isPC(): boolean {
  // 常见移动设备标识数组
  const agents = [
    'Android', // 安卓设备标识
    'iPhone', // iPhone设备标识
    'webOS', // LG webOS系统标识
    'BlackBerry', // 黑莓设备标识
    'SymbianOS', // 诺基亚塞班系统标识
    'Windows Phone', // Windows Phone设备标识
    'iPad', // iPad设备标识
    'iPod', // iPod设备标识
  ]

  // 检查用户代理字符串是否包含任何移动设备标识
  const isMobile = agents.some(agent => window.navigator.userAgent.includes(agent))
  const isTouchScreen = window.navigator.maxTouchPoints > 0
  // 反向判断：如果都不是移动设备，则认为是PC端
  return !isMobile && !isTouchScreen
}

const CHROME_REGEXP = /chrome|crios/
const EXCLUDE_REGEXP = /edg|opr|micromessenger|qqbrowser|baiduboxapp|baidubrowser|ucbrowser|360ee|360se/

/**
 * 检测当前浏览器是否为 Google Chrome (排除了 Edge, Opera, QQ, 微信, 百度, UC, 360 等其他 Chromium 内核浏览器)
 * @returns 返回 true 表示是 Chrome，false 表示不是
 */
export function isChrome(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false
  }

  const ua = navigator.userAgent.toLowerCase()
  return CHROME_REGEXP.test(ua) && !EXCLUDE_REGEXP.test(ua)
}
