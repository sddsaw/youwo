import {
  type Editor,
  viewToModelPositionOutsideModelElement,
} from 'ckeditor5'
import {
  CKEditorError,
  Plugin,
  toWidget,
  Widget,
} from 'ckeditor5'
import MathliveCommand from './mathlivecommand'

export default class MathliveEditing extends Plugin {
  public static get requires() {
    return [Widget] as const
  }

  public static get pluginName() {
    return 'MathliveEditing' as const
  }

  constructor(editor: Editor) {
    super(editor)
    const mathliveConfig = editor.config.get('mathlive') as any
    editor.config.define('mathlive', {
      mathPanelDestroyOnClose: false,
      openPanelWhenEquationSelected: true,
      processClass: 'math-tex',
      processScriptType: 'math/tex',
      output: {
        type: 'script',
        attributes: mathliveConfig?.output?.attributes
          ? mathliveConfig.output.attributes
          : {
              type: 'math/tex',
            },
      },
    })
  }

  public init(): void {
    const editor = this.editor
    editor.commands.add('mathlive', new MathliveCommand(editor))

    this._defineSchema()
    this._defineConverters()

    editor.editing.mapper.on(
      'viewToModelPosition',
      viewToModelPositionOutsideModelElement(
        editor.model,
        viewElement => viewElement.hasClass('math'),
      ),
    )
  }

  private _defineSchema() {
    const schema = this.editor.model.schema
    schema.register('mathlive-mathtex', {
      allowWhere: '$text',
      isInline: true,
      isObject: true,
      allowAttributes: ['equation', 'alignment', 'fontSize', 'fontColor', 'fontBackgroundColor', 'bold', 'linkHref', 'code'],
    })
  }

  private _defineConverters() {
    const conversion = this.editor.conversion
    const mathliveConfig = this.editor.config.get('mathlive') as any

    // View -> Model
    conversion
      .for('upcast')
      .elementToElement({
        view: {
          classes: [mathliveConfig.processClass!],
        },
        model: createMathtexModel,
      })
      .elementToElement({
        view: {
          name: 'script',
          attributes: {
            type: 'math/tex',
          },
        },
        model: createMathtexModel,
      })
      .elementToElement({
        view: {
          name: mathliveConfig.output!.type,
          attributes: mathliveConfig.output!.attributes,
        },
        model: createMathtexModel,
      })

    // Create view for Model
    function createMathtexModel(
      viewElement: any,
      { writer }: { writer: any },
    ) {
      const child = viewElement.getChild(0)
      if (child?.is('$text')) {
        const equation = child.data.trim()

        return writer.createElement(
          'mathlive-mathtex',
          {
            equation,
          },
        )
      }

      return null
    }

    // Model -> View (element)
    conversion
      .for('editingDowncast')
      .elementToElement({
        model: 'mathlive-mathtex',
        view: (modelItem, { writer }) => {
          const widgetElement = createMathtexEditingView(
            modelItem,
            writer,
          )
          return toWidget(widgetElement, writer, {
            label: 'Math widget',
            hasSelectionHandle: false,
          })
        },
      })

    // Model -> Data
    conversion
      .for('dataDowncast')
      .elementToElement({
        model: 'mathlive-mathtex',
        view: createMathtexView,
      })

    // Create view for editor
    function createMathtexEditingView(
      modelItem: any,
      writer: any,
    ) {
      const equation = String(modelItem.getAttribute('equation'))

      const mathtexView = writer.createContainerElement(
        'span',
        {
          style: 'display: inline-block;',
          class: 'ck-mathlive-tex',
        },
      )

      const mathFieldWrapper = writer.createContainerElement(
        'span',
        {
          class: 'ck-math-field',
        },
      )

      const mathField = writer.createContainerElement(
        'math-field',
        {
          'read-only': '',
        },
      )

      writer.insert(
        writer.createPositionAt(mathField, 0),
        writer.createText(equation),
      )

      writer.insert(
        writer.createPositionAt(mathFieldWrapper, 0),
        mathField,
      )

      writer.insert(
        writer.createPositionAt(mathtexView, 0),
        mathFieldWrapper,
      )

      return mathtexView
    }

    // Create view for data
    function createMathtexView(
      modelItem: any,
      { writer }: { writer: any },
    ) {
      const equation = modelItem.getAttribute('equation')
      if (typeof equation != 'string') {
        /**
         * Couldn't find equation on current element
         * @error missing-equation
         */
        throw new CKEditorError('missing-equation', { pluginName: 'mathlive' })
      }

      const { output } = mathliveConfig
      if (output) {
        const mathtexView = writer.createContainerElement(output.type, output.attributes)

        writer.insert(
          writer.createPositionAt(mathtexView, 0),
          writer.createText(equation),
        )

        return mathtexView
      }
    }
  }
}
