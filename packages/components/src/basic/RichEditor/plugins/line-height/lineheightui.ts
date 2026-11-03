import { ButtonView, createDropdown, ListItemView, ListView, Plugin } from 'ckeditor5'
import { NInput } from 'naive-ui'
import { h, ref } from 'vue'
import LineHeightEditing from './lineheightediting'

/**
 * 行高 UI 插件
 */
export default class LineHeightUI extends Plugin {
  public static get requires() {
    return [LineHeightEditing] as const
  }

  public static get pluginName() {
    return 'LineHeightUI' as const
  }

  public init(): void {
    const editor = this.editor
    const t = editor.t

    editor.ui.componentFactory.add('lineHeight', (locale) => {
      const dropdownView = createDropdown(locale)
      const command = editor.commands.get('lineHeight')!

      // 1. 设置下拉按钮的展示
      const buttonView = dropdownView.buttonView
      buttonView.set({
        label: t('行高'),
        icon: this._getLineHeightIcon(),
        tooltip: true,
      })

      // 绑定按钮是否可用
      dropdownView.bind('isEnabled').to(command, 'isEnabled')

      // 2. 定义行高可选项
      const options = [
        { model: 'default', title: t('默认') },
        { model: '1', title: '1.0' },
        { model: '1.2', title: '1.2' },
        { model: '1.3', title: '1.3' },
        { model: '1.5', title: '1.5' },
        { model: '1.8', title: '1.8' },
        { model: '2', title: '2.0' },
        { model: 'custom', title: t('自定义...') },
      ]

      const listView = new ListView(locale)

      for (const option of options) {
        const button = new ButtonView(locale)
        button.set({
          label: option.title,
          withText: true,
        })

        // 绑定高亮状态：当命令值和当前行高一致时高亮
        button.bind('isOn').to(command, 'value', (value) => {
          if (option.model === 'custom') {
            // 如果有值，但不在常规预设值中，则认为是自定义行高
            const standardValues = ['1', '1.15', '1.2', '1.3', '1.5', '1.8', '2']
            return value !== undefined && !standardValues.includes(String(value))
          }
          if (option.model === 'default') {
            return value === undefined
          }
          return String(value) === String(option.model)
        })

        const listItem = new ListItemView(locale)
        listItem.children.add(button)
        listView.items.add(listItem)

        // 监听按钮的执行事件
        this.listenTo(button, 'execute', () => {
          if (option.model === 'custom') {
            const inputValue = ref('')
            window.$dialog?.create({
              title: t('自定义行高'),
              content: () => h(NInput, {
                'placeholder': t('例如 1.5, 2, 2.5, 150%, 24px'),
                'value': inputValue.value,
                'onUpdate:value': (val: string) => {
                  inputValue.value = val
                },
              }),
              positiveText: t('确定'),
              negativeText: t('取消'),
              onPositiveClick: () => {
                const trimmedValue = inputValue.value.trim()
                if (trimmedValue) {
                  editor.execute('lineHeight', { value: trimmedValue })
                }
                editor.editing.view.focus()
              },
              onNegativeClick: () => {
                editor.editing.view.focus()
              },
            })
          }
          else {
            editor.execute('lineHeight', { value: option.model })
          }
          dropdownView.isOpen = false
          editor.editing.view.focus()
        })
      }

      dropdownView.panelView.children.add(listView)

      return dropdownView
    })
  }

  /**
   * 行高图标 (SVG)
   */
  private _getLineHeightIcon(): string {
    return `<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 3.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm0 4a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm0 4a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm0 4a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zM17.854 4.854a.5.5 0 0 0 0-.708l-1.5-1.5a.5.5 0 0 0-.708.708L16.293 4H15.5A1.5 1.5 0 0 0 14 5.5v9A1.5 1.5 0 0 0 15.5 16h.793l-.647.646a.5.5 0 0 0 .708.708l1.5-1.5a.5.5 0 0 0 0-.708l-1.5-1.5a.5.5 0 0 0-.708.708l.647.646H15.5a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h.793l-.647.646a.5.5 0 0 0 .708.708l1.5-1.5z" fill="currentColor"/>
    </svg>`
  }
}
