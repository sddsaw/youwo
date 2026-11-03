import { AttributeCommand, ButtonView, Plugin } from 'ckeditor5'

// Custom U-with-wavy-underline SVG icon matching CKEditor 5 aesthetic
const WAVY_ICON = `<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M4 2v6a6 6 0 1 0 12 0V2h-2v6a4 4 0 1 1-8 0V2H4z"/><path d="M2 15.5c1.25-1 2.75-1 4 0s2.75 1 4 0 2.75-1 4 0 2.75 1 4 0v1.5c-1.25 1-2.75 1-4 0s-2.75-1-4 0-2.75 1-4 0s-2.75-1-4 0v-1.5z"/></svg>`

export default class WavyUnderline extends Plugin {
  static get pluginName() {
    return 'WavyUnderline'
  }

  init() {
    const editor = this.editor

    // 1. Register attribute in model schema
    editor.model.schema.extend('$text', { allowAttributes: 'wavyUnderline' })

    // 2. Converters (Model <-> View)
    // Model -> View (Downcast)
    editor.conversion.for('downcast').attributeToElement({
      model: 'wavyUnderline',
      view: (attributeValue, { writer }) => {
        return writer.createAttributeElement('span', { class: 'wavy-underline' }, { priority: 7 })
      },
    })

    // View -> Model (Upcast)
    editor.conversion.for('upcast').elementToAttribute({
      view: {
        name: 'span',
        classes: 'wavy-underline',
      },
      model: 'wavyUnderline',
    })

    // 3. Register the formatting toggle command
    editor.commands.add('wavyUnderline', new AttributeCommand(editor, 'wavyUnderline'))

    // 4. Register toolbar UI button
    editor.ui.componentFactory.add('wavyUnderline', (locale) => {
      const command = editor.commands.get('wavyUnderline')!
      const buttonView = new ButtonView(locale)

      buttonView.set({
        label: '波浪下划线',
        icon: WAVY_ICON,
        tooltip: true,
      })

      // Bind button active state to the command execution state
      buttonView.bind('isOn', 'isEnabled').to(command as any, 'value', 'isEnabled')

      // Execute command on click and refocus editor
      this.listenTo(buttonView, 'execute', () => {
        editor.execute('wavyUnderline')
        editor.editing.view.focus()
      })

      return buttonView
    })
  }
}
