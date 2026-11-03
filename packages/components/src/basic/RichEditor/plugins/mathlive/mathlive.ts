import { Plugin, Widget } from 'ckeditor5'

import MathliveEditing from './mathliveediting'
import MathliveUI from './mathliveui'

export default class Mathlive extends Plugin {
  public static get requires() {
    return [MathliveEditing, MathliveUI, Widget] as const
  }

  public static get pluginName() {
    return 'Mathlive' as const
  }
}
