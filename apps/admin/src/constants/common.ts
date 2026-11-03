import { transformRecordToOption } from '@sa/utils'

export const yesOrNoRecord: Record<CommonType.YesOrNo, string> = {
  Y: '是',
  N: '否',
}

export const yesOrNoOptions = transformRecordToOption(yesOrNoRecord)
