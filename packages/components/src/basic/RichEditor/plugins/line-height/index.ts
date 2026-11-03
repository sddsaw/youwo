import { Plugin } from 'ckeditor5'
import LineHeightEditing from './lineheightediting'
import LineHeightUI from './lineheightui'

/**
 * 自定义行高插件入口
 */
export default class LineHeight extends Plugin {
  public static get requires() {
    return [LineHeightEditing, LineHeightUI] as const
  }

  public static get pluginName() {
    return 'LineHeight' as const
  }
}
