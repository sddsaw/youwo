import { Plugin } from 'ckeditor5'

/**
 * WPS粘贴处理插件
 * 解决从WPS复制的内容在CKEditor中不显示的问题
 */
export default class WpsPasteHandler extends Plugin {
  public static get pluginName() {
    return 'WpsPasteHandler' as const
  }

  public static get requires() {
    return [] as const
  }

  public init(): void {
    const editor = this.editor
    const view = editor.editing.view

    // 监听粘贴事件
    this.listenTo(view.document, 'clipboardInput', (evt, data) => {
      const dataTransfer = data.dataTransfer

      // 检查是否来自WPS
      if (this.isFromWPS(dataTransfer)) {
        // 获取粘贴的HTML内容
        const htmlData = dataTransfer.getData('text/html')
        const textData = dataTransfer.getData('text/plain')

        if (htmlData || textData) {
          // 阻止默认的粘贴处理
          evt.stop()

          // 处理WPS内容
          this.handleWPSContent(htmlData, textData)
        }
      }
    }, { priority: 'high' })
  }

  /**
   * 检测是否来自WPS
   */
  private isFromWPS(dataTransfer: DataTransfer): boolean {
    const htmlData = dataTransfer.getData('text/html')
    const textData = dataTransfer.getData('text/plain')

    // WPS特征检测 (使用小写以优化匹配性能)
    const wpsIndicators = [
      'mso-',
      'wps-',
      'progid="word.document"',
      'progid="wps.document"',
      'generator="wps"',
      'class="msonormal"',
      'style="mso-',
      'xmlns:w="urn:schemas-microsoft-com:office:word"',
      'xmlns:o="urn:schemas-microsoft-com:office:office"',
    ]

    // 检查HTML内容中是否包含WPS特征
    if (htmlData) {
      const lowerHtml = htmlData.toLowerCase()
      const hasWPSIndicator = wpsIndicators.some(indicator =>
        lowerHtml.includes(indicator),
      )

      if (hasWPSIndicator) {
        return true
      }
    }

    // 检查是否有HTML但内容为空或不可见（WPS常见问题）
    if (htmlData && textData) {
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = htmlData
      const visibleText = tempDiv.textContent || ''

      // 如果HTML存在但可见文本很少，可能是WPS格式问题
      if (visibleText.trim().length === 0 && textData.trim().length > 0) {
        return true
      }
    }

    return false
  }

  /**
   * 处理WPS内容
   */
  private handleWPSContent(htmlData: string, textData: string): void {
    const editor = this.editor
    const model = editor.model

    let processedContent = ''

    if (htmlData) {
      // 清理WPS HTML内容
      processedContent = this.cleanWPSHTML(htmlData)
    }

    // 如果清理后的HTML内容为空或不可见，使用纯文本
    if (!processedContent || this.getVisibleText(processedContent).trim().length === 0) {
      if (textData) {
        processedContent = this.convertTextToHTML(textData)
      }
    }

    if (processedContent) {
      // 将处理后的内容插入到编辑器中
      model.change(() => {
        const viewFragment = editor.data.processor.toView(processedContent)
        const modelFragment = editor.data.toModel(viewFragment)

        const insertPosition = model.document.selection.getFirstPosition()
        model.insertContent(modelFragment, insertPosition)
      })
    }
  }

  /**
   * 清理WPS HTML内容
   */
  private cleanWPSHTML(html: string): string {
    // 创建临时DOM元素来处理HTML
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = html

    // 移除WPS特有的样式和属性
    this.removeWPSStyles(tempDiv)

    // 处理空的或隐藏的元素
    this.processEmptyElements(tempDiv)

    // 简化HTML结构
    this.simplifyHTML(tempDiv)

    return tempDiv.innerHTML
  }

  /**
   * 移除WPS特有的样式和属性
   */
  private removeWPSStyles(element: HTMLElement): void {
    // 使用 querySelectorAll 代替复杂的 TreeWalker
    const elementsToProcess = Array.from(element.querySelectorAll('*')) as HTMLElement[]

    elementsToProcess.forEach((el) => {
      // 移除WPS/MSO相关的类名
      if (el.className) {
        el.className = el.className
          .split(' ')
          .filter(cls => !cls.toLowerCase().includes('mso') && !cls.toLowerCase().includes('wps'))
          .join(' ')
      }

      // 移除WPS/MSO相关的样式
      if (el.style) {
        const stylesToRemove = []
        for (let i = 0; i < el.style.length; i++) {
          const prop = el.style[i]
          if (prop.toLowerCase().includes('mso-') || prop.toLowerCase().includes('wps-')) {
            stylesToRemove.push(prop)
          }
        }
        stylesToRemove.forEach(prop => el.style.removeProperty(prop))
      }

      // 移除WPS特有的属性
      const attributesToRemove = ['lang', 'xml:lang', 'xmlns', 'xmlns:w', 'xmlns:o', 'xmlns:m', 'xmlns:v']
      attributesToRemove.forEach((attr) => {
        if (el.hasAttribute(attr)) {
          el.removeAttribute(attr)
        }
      })
    })
  }

  /**
   * 处理空的或隐藏的元素
   */
  private processEmptyElements(element: HTMLElement): void {
    // 使用 querySelectorAll 代替 TreeWalker 提升可读性
    const elementsToCheck = Array.from(element.querySelectorAll('*')) as HTMLElement[]

    elementsToCheck.forEach((el) => {
      // 优化：在未挂载的 DOM 树上使用 getComputedStyle 是无效的，且在循环中调用会导致严重的浏览器重排（Layout Thrashing）
      // 改为直接检查 inline 属性与样式
      const display = el.style.display
      const visibility = el.style.visibility
      const opacity = el.style.opacity

      const isHidden = display === 'none'
        || visibility === 'hidden'
        || opacity === '0'

      if (isHidden) {
        // 移除隐藏样式，让内容可见
        el.style.display = ''
        el.style.visibility = ''
        el.style.opacity = ''
      }

      // 检查高度为 0 且包含文本的元素，防止文本被隐藏
      const inlineHeight = el.style.height
      const isZeroHeight = inlineHeight === '0px' || inlineHeight === '0' || el.getAttribute('height') === '0'
      if (isZeroHeight && el.textContent && el.textContent.trim()) {
        el.style.height = 'auto'
      }
    })
  }

  /**
   * 简化HTML结构
   */
  private simplifyHTML(element: HTMLElement): void {
    // 移除多余的嵌套span和div
    const spans = element.querySelectorAll('span')
    spans.forEach((span) => {
      if (!span.hasAttributes() || (span.attributes.length === 1 && span.hasAttribute('style') && !span.style.cssText)) {
        this.unwrapElement(span)
      }
    })

    const divs = element.querySelectorAll('div')
    divs.forEach((div) => {
      if (!div.hasAttributes() || (div.attributes.length === 1 && div.hasAttribute('style') && !div.style.cssText)) {
        // 将div转换为p标签，保持段落结构
        const p = document.createElement('p')
        p.innerHTML = div.innerHTML
        div.parentNode?.replaceChild(p, div)
      }
    })
  }

  /**
   * 解包装元素（移除外层标签，保留内容）
   */
  private unwrapElement(element: HTMLElement): void {
    const parent = element.parentNode
    if (parent) {
      while (element.firstChild) {
        parent.insertBefore(element.firstChild, element)
      }
      parent.removeChild(element)
    }
  }

  /**
   * 将纯文本转换为HTML
   */
  private convertTextToHTML(text: string): string {
    // 将换行符转换为段落
    const paragraphs = text.split(/\r?\n\r?\n/)
    const htmlParagraphs = paragraphs
      .filter(p => p.trim())
      .map((p) => {
        // 处理单个换行符为<br>
        const content = p.replace(/\r?\n/g, '<br>')
        return `<p>${content}</p>`
      })

    return htmlParagraphs.join('')
  }

  /**
   * 获取元素的可见文本
   */
  private getVisibleText(html: string): string {
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = html
    return tempDiv.textContent || ''
  }
}
