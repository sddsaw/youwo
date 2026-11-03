import { ButtonView, Plugin } from 'ckeditor5'

// Sigma icon for math formula
const FORMULA_ICON = `<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M5 4h10v2H8.5l4.5 4-4.5 4H15v2H5v-1.5l5-4.5-5-4.5V4z" fill="currentColor"/></svg>`

export default class FormulaEntry extends Plugin {
  static get pluginName() {
    return 'FormulaEntry'
  }

  init() {
    const editor = this.editor

    editor.ui.componentFactory.add('formulaEntry', (locale) => {
      const buttonView = new ButtonView(locale)

      buttonView.set({
        label: '插入公式',
        icon: FORMULA_ICON,
        tooltip: true,
      })

      // Clicking prints a log
      this.listenTo(buttonView, 'execute', () => {
        // eslint-disable-next-line no-console
        console.log('[FormulaEntry] Formula button clicked!')
        editor.editing.view.focus()
      })

      return buttonView
    })
  }
}
