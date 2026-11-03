import { Plugin } from 'ckeditor5'
import LineHeightCommand from './lineheightcommand'

/**
 * 行高编辑逻辑插件
 */
export default class LineHeightEditing extends Plugin {
  public static get pluginName() {
    return 'LineHeightEditing' as const
  }

  public init(): void {
    const editor = this.editor

    // 1. 在 Schema 中对常见的 Block 级元素允许使用 lineHeight 属性
    const blockNames = [
      'paragraph',
      'heading1',
      'heading2',
      'heading3',
      'heading4',
      'heading5',
      'heading6',
      'listItem',
    ]

    for (const blockName of blockNames) {
      if (editor.model.schema.isRegistered(blockName)) {
        editor.model.schema.extend(blockName, { allowAttributes: 'lineHeight' })
      }
    }

    // 2. 配置数据转换器 (Conversion)
    const conversion = editor.conversion

    // Downcast: Model -> HTML (将 model 里的 lineHeight 属性渲染成 CSS style="line-height: X")
    conversion.for('downcast').attributeToAttribute({
      model: 'lineHeight',
      view: (modelAttributeValue) => {
        return {
          key: 'style',
          value: {
            'line-height': String(modelAttributeValue),
          },
        }
      },
    })

    // Upcast: HTML -> Model (从 HTML 中的 line-height 样式解析出 lineHeight 属性值)
    conversion.for('upcast').attributeToAttribute({
      view: {
        styles: {
          'line-height': /.+/,
        },
      },
      model: {
        key: 'lineHeight',
        value: (viewElement: any) => {
          return viewElement.getStyle('line-height')
        },
      },
    })

    // 3. 注册命令
    editor.commands.add('lineHeight', new LineHeightCommand(editor))
  }
}
