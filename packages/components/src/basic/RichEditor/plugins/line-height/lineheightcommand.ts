import type { Editor } from 'ckeditor5'
import { Command } from 'ckeditor5'

/**
 * 行高命令
 */
export default class LineHeightCommand extends Command {
  constructor(editor: Editor) {
    super(editor)
  }

  /**
   * 刷新命令状态并根据当前选区获取行高值
   */
  public override refresh(): void {
    const model = this.editor.model
    const docSelection = model.document.selection
    const blocks = Array.from(docSelection.getSelectedBlocks())

    this.value = blocks.length > 0 ? blocks[0].getAttribute('lineHeight') : undefined
    this.isEnabled = blocks.some(block => model.schema.checkAttribute(block, 'lineHeight'))
  }

  /**
   * 执行修改行高的操作
   * @param options 参数
   * @param options.value 行高具体值；若为 'default' 或空则移除行高设置
   */
  public override execute(options: { value?: string | number } = {}): void {
    const editor = this.editor
    const model = editor.model
    const docSelection = model.document.selection
    const blocks = Array.from(docSelection.getSelectedBlocks())

    const value = options.value

    model.change((writer) => {
      for (const block of blocks) {
        if (value && value !== 'default') {
          writer.setAttribute('lineHeight', value, block)
        }
        else {
          writer.removeAttribute('lineHeight', block)
        }
      }
    })
  }
}
