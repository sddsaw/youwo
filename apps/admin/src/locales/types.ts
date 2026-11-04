type ThemeScheme = 'light' | 'dark' | 'auto'
type ThemeColorKey = 'primary' | 'info' | 'success' | 'warning' | 'error'
type ThemeLayoutMode
  = | 'vertical'
    | 'vertical-mix'
    | 'vertical-hybrid-header-first'
    | 'horizontal'
    | 'top-hybrid-sidebar-first'
    | 'top-hybrid-header-first'
type ThemeTabMode = 'chrome' | 'button' | 'slider'
type ThemeScrollMode = 'wrapper' | 'content'
type ThemePageAnimateMode = 'fade' | 'fade-slide' | 'fade-bottom' | 'fade-scale' | 'zoom-fade' | 'zoom-out' | 'none'
type DropdownKey = string

export type LangType = 'en-US' | 'zh-CN'

export interface LangOption {
  label: string
  key: LangType
}

export interface FormMsg {
  required: string
  invalid: string
}

export interface Schema {
  system: {
    title: string
    updateTitle: string
    updateContent: string
    updateConfirm: string
    updateCancel: string
  }
  common: {
    action: string
    add: string
    addSuccess: string
    back: string
    backToHome: string
    batchDelete: string
    cancel: string
    close: string
    check: string
    selectAll: string
    expandColumn: string
    columnSetting: string
    config: string
    confirm: string
    delete: string
    deleteSuccess: string
    confirmDelete: string
    detail: string
    edit: string
    warning: string
    error: string
    index: string
    keywordSearch: string
    logout: string
    logoutConfirm: string
    lookForward: string
    modify: string
    modifySuccess: string
    noData: string
    operate: string
    pleaseCheckValue: string
    refresh: string
    reset: string
    search: string
    switch: string
    tip: string
    trigger: string
    update: string
    updateSuccess: string
    userCenter: string
    yesOrNo: {
      yes: string
      no: string
    }
  }
  request: {
    logout: string
    logoutMsg: string
    logoutWithModal: string
    logoutWithModalMsg: string
    refreshToken: string
    tokenExpired: string
  }
  theme: {
    themeDrawerTitle: string
    tabs: {
      appearance: string
      layout: string
      general: string
      preset: string
    }
    appearance: {
      themeSchema: { title: string } & Record<ThemeScheme, string>
      grayscale: string
      colourWeakness: string
      themeColor: {
        title: string
        followPrimary: string
      } & Record<ThemeColorKey, string>
      recommendColor: string
      recommendColorDesc: string
      themeRadius: {
        title: string
      }
      preset: {
        title: string
        apply: string
        applySuccess: string
        [key: string]:
          | {
            name: string
            desc: string
          }
          | string
      }
    }
    layout: {
      layoutMode: { title: string } & Record<ThemeLayoutMode, string> & {
        [K in `${ThemeLayoutMode}_detail`]: string;
      }
      tab: {
        title: string
        visible: string
        cache: string
        cacheTip: string
        height: string
        mode: { title: string } & Record<ThemeTabMode, string>
        closeByMiddleClick: string
        closeByMiddleClickTip: string
      }
      header: {
        title: string
        height: string
        breadcrumb: {
          visible: string
          showIcon: string
        }
      }
      sider: {
        title: string
        inverted: string
        width: string
        collapsedWidth: string
        mixWidth: string
        mixCollapsedWidth: string
        mixChildMenuWidth: string
        autoSelectFirstMenu: string
        autoSelectFirstMenuTip: string
      }
      footer: {
        title: string
        visible: string
        fixed: string
        height: string
        right: string
      }
      content: {
        title: string
        scrollMode: { title: string, tip: string } & Record<ThemeScrollMode, string>
        page: {
          animate: string
          mode: { title: string } & Record<ThemePageAnimateMode, string>
        }
        fixedHeaderAndTab: string
      }
    }
    general: {
      title: string
      watermark: {
        title: string
        visible: string
        text: string
        enableUserName: string
        enableTime: string
        timeFormat: string
      }
      multilingual: {
        title: string
        visible: string
      }
      globalSearch: {
        title: string
        visible: string
      }
    }
    configOperation: {
      copyConfig: string
      copySuccessMsg: string
      resetConfig: string
      resetSuccessMsg: string
    }
  }
  route: Record<string, string>
  page: {
    login: {
      common: {
        loginOrRegister: string
        userNamePlaceholder: string
        phonePlaceholder: string
        codePlaceholder: string
        passwordPlaceholder: string
        confirmPasswordPlaceholder: string
        codeLogin: string
        confirm: string
        back: string
        validateSuccess: string
        loginSuccess: string
        welcomeBack: string
      }
      pwdLogin: {
        title: string
        rememberMe: string
        forgetPassword: string
        register: string
        otherAccountLogin: string
        otherLoginMode: string
        superAdmin: string
        admin: string
        user: string
      }
      codeLogin: {
        title: string
        getCode: string
        reGetCode: string
        sendCodeSuccess: string
        imageCodePlaceholder: string
      }
    }
    workbench_knowledge: {
      tableTitle: string
      name: string
      category: string
      confidence: string
      trustStatus: string
      lastVerifiedAt: string
      categoryFilter: string
      clearFilter: string
    }
  }
  form: {
    required: string
    userName: FormMsg
    phone: FormMsg
    pwd: FormMsg
    confirmPwd: FormMsg
    code: FormMsg
    email: FormMsg
  }
  dropdown: Record<DropdownKey, string>
  icon: {
    themeConfig: string
    themeSchema: string
    lang: string
    fullscreen: string
    fullscreenExit: string
    reload: string
    collapse: string
    expand: string
    pin: string
    unpin: string
  }
  datatable: {
    itemCount: string
    fixed: {
      left: string
      right: string
      unFixed: string
    }
  }
}

export type GetI18nKey<T, K extends keyof T = keyof T> = K extends string
  ? T[K] extends Record<string, any>
    ? `${K}.${GetI18nKey<T[K]>}`
    : K
  : never

export type I18nKey = GetI18nKey<Schema>

export type I18nFlexibleKey = I18nKey | (string & {})

export type TranslateOptions<Locales extends string> = import('vue-i18n').TranslateOptions<Locales>

export interface $T {
  (key: I18nFlexibleKey): string
  (key: I18nFlexibleKey, plural: number, options?: TranslateOptions<LangType>): string
  (key: I18nFlexibleKey, defaultMsg: string, options?: TranslateOptions<string>): string
  (key: I18nFlexibleKey, list: unknown[], options?: TranslateOptions<string>): string
  (key: I18nFlexibleKey, list: unknown[], plural: number): string
  (key: I18nFlexibleKey, list: unknown[], defaultMsg: string): string
  (key: I18nFlexibleKey, named: Record<string, unknown>, options?: TranslateOptions<LangType>): string
  (key: I18nFlexibleKey, named: Record<string, unknown>, plural: number): string
  (key: I18nFlexibleKey, named: Record<string, unknown>, defaultMsg: string): string
}

/* eslint-disable ts/no-namespace */
declare global {
  namespace App {
    namespace I18n {
      type LangType = import('@/locales').LangType
      type LangOption = import('@/locales').LangOption
      type FormMsg = import('@/locales').FormMsg
      type Schema = import('@/locales').Schema
      type I18nKey = import('@/locales').I18nKey
      type $T = import('@/locales').$T
    }
  }
}
/* eslint-enable ts/no-namespace */
