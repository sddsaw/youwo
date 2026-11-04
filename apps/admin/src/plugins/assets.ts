// @ts-expect-error ignore type error of svg icons
import 'virtual:svg-icons-register'
import 'uno.css'
import '../styles/css/global.css'

if (typeof window !== 'undefined') {
  const globalObj = window as any
  globalObj.MathfieldElement = globalObj.MathfieldElement || {}
  const baseUrl = (import.meta.env.VITE_BASE_URL || '/').replace(/\/$/, '')
  globalObj.MathfieldElement.fontsDirectory = `${baseUrl}/fonts/`
  globalObj.MathfieldElement.soundsDirectory = null
}
