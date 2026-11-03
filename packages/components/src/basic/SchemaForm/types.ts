import type {
  CheckboxGroupProps,
  DatePickerProps,
  FormItemProps,
  FormItemRule,
  InputNumberProps,
  InputProps,
  RadioGroupProps,
  SelectProps,
  SwitchProps,
  TimePickerProps,
} from 'naive-ui'

export type FormComponentType
  = | 'input'
    | 'select'
    | 'switch'
    | 'date-picker'
    | 'checkbox'
    | 'radio'
    | 'input-number'
    | 'time-picker'
    | 'upload'
    | 'rich-editor'
    | 'slot'

interface FileUploadProps {
  /** 最大上传数量 */
  max?: number
  /** 最大文件大小（字节） */
  maxSize?: number
  /** 是否支持多选 */
  multiple?: boolean
  /** 接受的文件类型 */
  accept?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 是否显示文件列表 */
  showFileList?: boolean
  /** 列表类型 */
  listType?: 'text' | 'image' | 'image-card'
  /** 是否支持拖拽文件夹 */
  isDirectoryDnd?: boolean
  /** 上传前的钩子 */
  beforeUpload?: (file: File) => boolean | Promise<boolean>
  /** 是否自动上传到 OBS */
  autoUploadObs?: boolean
  /** 上传任务启动事件 */
  onUploadStart?: (file: File) => void
  /** 上传进度更新事件 */
  onUploadProgress?: (file: File, progress: number) => void
  /** 上传成功事件，返回上传后的云文件 URL */
  onUploadSuccess?: (url: string) => void
  /** 上传失败事件 */
  onUploadError?: (error: any, file: File) => void
  /** 移除文件事件 */
  onRemove?: (file: any) => void
  /** 是否开启裁剪 */
  cropper?: boolean
  /** 裁剪比例，不传则为自由比例 */
  cropperAspectRatio?: number
  /** 裁剪预览是否为圆形（常用于头像） */
  cropperPreviewRound?: boolean
}

export interface OptionItem {
  label: string
  value: string | number
  disabled?: boolean
  [key: string]: unknown // 允许附加其他 API 响应的未知字段
}

// 1. 建立组件类型与 Naive UI 属性类型的映射表
interface ComponentPropsMap {
  'input': InputProps
  'select': SelectProps
  'switch': SwitchProps
  'date-picker': DatePickerProps
  'checkbox': CheckboxGroupProps & {
    options?: OptionItem[]
  }
  'radio': RadioGroupProps & {
    options?: OptionItem[]
  }
  'input-number': InputNumberProps
  'time-picker': TimePickerProps
  'upload': FileUploadProps
  'rich-editor': {
    placeholder?: string
    disabled?: boolean
    minHeight?: string
    maxHeight?: string
  }
  'slot': Record<string, unknown>
}

// 2. 基础公共配置项
export interface BaseSchemaFormOptions {
  /** 表单字段的键名 */
  value: string
  /** 表单项的 Label */
  label: string
  /** 默认值 */
  defaultValue?: unknown
  /** 验证规则 */
  rules?: FormItemRule | FormItemRule[]
  /** 栅格布局所占份额，默认 24 (即占满整行)，支持响应式字符串如 '24 s:12 m:8' */
  span?: number | string
  /** 透传给 NFormItem 组件的属性 */
  formItemAttrs?: FormItemProps
  /** 候选项数据：支持静态数组，或动态获取的（同步/异步）函数 */
  options?: OptionItem[] | ((model: any) => OptionItem[] | Promise<OptionItem[]>)
}

// 3. 通过映射类型，自动生成组件的判别联合类型（Discriminated Union）
export type SchemaFormOptions = {
  [K in keyof ComponentPropsMap]: BaseSchemaFormOptions & {
    type: K
    /** 透传给具体输入组件的属性 */
    attrs?: ComponentPropsMap[K]
  }
}[keyof ComponentPropsMap]
