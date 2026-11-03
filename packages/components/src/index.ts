import { defineAsyncComponent } from 'vue'
// Basic components
import BetterScroll from './basic/BetterScroll/index.vue'
import ButtonIcon from './basic/ButtonIcon/index.vue'
import CollapsiblePanel from './basic/CollapsiblePanel/index.vue'
import CountTo from './basic/CountTo/index.vue'
import DarkModeContainer from './basic/DarkModeContainer/index.vue'
import FullScreen from './basic/FullScreen/index.vue'
import IconTooltip from './basic/IconTooltip/index.vue'
import IframeContainer from './basic/IframeContainer/index.vue'
import InfiniteScroll from './basic/InfiniteScroll/index.vue'
import LookForward from './basic/LookForward/index.vue'
import MenuToggler from './basic/MenuToggler/index.vue'
import PinToggler from './basic/PinToggler/index.vue'
import ReloadButton from './basic/ReloadButton/index.vue'
import SvgIcon from './basic/SvgIcon/index.vue'
import SystemLogo from './basic/SystemLogo/index.vue'
import WaveBg from './basic/WaveBg/index.vue'

// Business components
import AppProvider from './business/AppProvider/index.vue'
import ExceptionBase from './business/ExceptionBase/index.vue'
import SoybeanAvatar from './business/SoybeanAvatar/index.vue'
import ThemeSchemaSwitch from './business/ThemeSchemaSwitch/index.vue'

// Heavy components - lazy loaded to avoid cascading module loading on first screen
const FileUpload = defineAsyncComponent(() => import('./business/FileUpload/index.vue'))
const SchemaForm = defineAsyncComponent(() => import('./basic/SchemaForm/index.vue'))
const TableColumnSetting = defineAsyncComponent(() => import('./business/TableColumnSetting/index.vue'))
const TableHeaderOperation = defineAsyncComponent(() => import('./business/TableHeaderOperation/index.vue'))
const RichEditor = defineAsyncComponent(() => import('./basic/RichEditor/index.vue'))

export {
  AppProvider,
  BetterScroll,
  ButtonIcon,
  CollapsiblePanel,
  CountTo,
  DarkModeContainer,
  ExceptionBase,
  FileUpload,
  FullScreen,
  IconTooltip,
  IframeContainer,
  InfiniteScroll,
  LookForward,
  MenuToggler,
  PinToggler,
  ReloadButton,
  RichEditor,
  SchemaForm,
  SoybeanAvatar,
  SvgIcon,
  SystemLogo,
  TableColumnSetting,
  TableHeaderOperation,
  ThemeSchemaSwitch,
  WaveBg,
}
export * from './basic/IframeContainer/types'
export type { SchemaFormProps } from './basic/SchemaForm/index.vue'
export type * from './basic/SchemaForm/types'
export * from './hooks/icon'
