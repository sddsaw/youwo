# @sa/components

## 📌 概述 (Overview)

`@sa/components` 是 Soybean Admin 项目的通用 Vue 组件库。作为一个多项目单体仓库 (Monorepo) 中的核心共享模块，它包含了两类组件：

1. **基础组件 (`basic`)**：高内聚、纯 UI/布局逻辑、解耦业务的基础通用组件，可在任何应用或页面中无缝复用。
2. **业务组件 (`business`)**：与 Soybean Admin 系统服务、全局状态（例如主题配置、国际化、用户上下文等）或特定业务实体（如数据表格结构）相绑定的高层业务组件。

---

## 📂 目录结构 (Directory Structure)

```text
packages/components/
├── package.json (依赖声明)
├── tsconfig.json (TypeScript 配置)
└── src/
    ├── index.ts (入口文件, 62行) ─────────────────────────────────── 组件库集中导出
    │
    ├── basic/ ────────────────────────────────────────────────────── 基础组件目录
    │   ├── BetterScroll/index.vue (BetterScroll, 54行) ────────────── 滚动容器
    │   ├── ButtonIcon/index.vue (ButtonIcon, 49行) ────────────────── 图标按钮
    │   ├── CollapsiblePanel/index.vue (CollapsiblePanel, 257行) ───── 折叠面板
    │   ├── CountTo/index.vue (CountTo, 88行) ──────────────────────── 数字滚动
    │   ├── DarkModeContainer/index.vue (DarkModeContainer, 17行) ──── 暗黑容器
    │   ├── FullScreen/index.vue (FullScreen, 26行) ────────────────── 全屏按钮
    │   ├── IconTooltip/index.vue (IconTooltip, 43行) ──────────────── 图标提示
    │   ├── IframeContainer/ ──────────────────────────────────────── iframe 容器
    │   │   ├── index.vue (IframeContainer, 188行)
    │   │   └── types.ts (33行)
    │   ├── InfiniteScroll/index.vue (InfiniteScroll, 92行) ────────── 无限滚动
    │   ├── LookForward/index.vue (LookForward, 28行) ──────────────── 敬请期待
    │   ├── MenuToggler/index.vue (MenuToggler, 57行) ──────────────── 菜单折叠
    │   ├── PinToggler/index.vue (PinToggler, 31行) ────────────────── 面板固定
    │   ├── ReloadButton/index.vue (ReloadButton, 24行) ────────────── 刷新按钮
    │   ├── SvgIcon/index.vue (SvgIcon, 54行) ──────────────────────── 图标组件
    │   ├── SystemLogo/index.vue (SystemLogo, 166行) ──────────────── 系统 Logo
    │   ├── WaveBg/index.vue (WaveBg, 61行) ────────────────────────── 波浪背景
    │   └── SchemaForm/ ───────────────────────────────────────────── 动态表单
    │       ├── index.vue (SchemaForm, 118行) ──────────────────────── 表单主入口
    │       ├── types.ts (113行) ───────────────────────────────────── 表单类型
    │       └── components/
    │           ├── FormDatePicker.vue (FormDatePicker, 46行)
    │           ├── SchemaFormItem.vue (SchemaFormItem, 79行)
    │           └── OptionsGroup.tsx (OptionsGroup, 67行)
    │
    ├── business/ ─────────────────────────────────────────────────── 业务组件目录
    │   ├── AppProvider/index.vue (AppProvider, 39行) ──────────────── 全局注入
    │   ├── ExceptionBase/index.vue (ExceptionBase, 49行) ──────────── 异常页面
    │   ├── FileUpload/index.vue (FileUpload, 365行) ───────────────── 存储直传
    │   ├── SoybeanAvatar/index.vue (SoybeanAvatar, 18行) ──────────── 头像组件
    │   ├── TableColumnSetting/index.vue (TableColumnSetting, 124行) ─ 表格列设置
    │   ├── TableHeaderOperation/index.vue (TableHeaderOperation, 78行) 表格操作区
    │   └── ThemeSchemaSwitch/index.vue (ThemeSchemaSwitch, 60行) ──── 主题切换
    │
    ├── hooks/
    │   └── icon.ts (10行) ────────────────────────────────────────── 图标 hook
    │
    └── typings/
        └── global.d.ts (14行) ────────────────────────────────────── 全局类型
```

---

## 🧭 组件概览 (Components Summary)

### 1. 基础组件 (Basic Components)

| 组件名称 | 目录路径 | 描述说明 |
| :--- | :--- | :--- |
| **BetterScroll** | `src/basic/BetterScroll` | 包装 `@better-scroll/core` 的轻量级滚动容器，支持高定制化的流畅滚动。 |
| **ButtonIcon** | `src/basic/ButtonIcon` | 带 Tooltip 提示的图标按钮，继承了 Naive UI 的 `NButton` 和 `NTooltip`。 |
| **CountTo** | `src/basic/CountTo` | 动态数字滚动组件，利用 `@vueuse/core` 的 `useTransition` 实现高性能平滑过渡。 |
| **DarkModeContainer** | `src/basic/DarkModeContainer` | 暗黑模式过渡容器，能平滑响应系统的暗黑模式切换，变换背景色与前景色。 |
| **FullScreen** | `src/basic/FullScreen` | 全屏状态切换图标按钮，内置全屏与退出全屏的提示。 |
| **IconTooltip** | `src/basic/IconTooltip` | 图标级气泡提示组件，鼠标悬停在图标上时显示自定义提示文本。 |
| **InfiniteScroll** | `src/basic/InfiniteScroll` | 无限滚动触底加载组件，基于 Intersection Observer API 结合 `NScrollbar` 封装。 |
| **LookForward** | `src/basic/LookForward` | 功能占位（敬请期待）空白页组件。 |
| **MenuToggler** | `src/basic/MenuToggler` | 侧边栏菜单展开/收起切换按钮，支持内置的折叠图标动画。 |
| **PinToggler** | `src/basic/PinToggler` | 面板钉住（固定）状态切换按钮。 |
| **ReloadButton** | `src/basic/ReloadButton` | 触发重新加载的刷新按钮，在加载状态下支持旋转动画。 |
| **SchemaForm** | `src/basic/SchemaForm` | **高度配置化表单组件**，支持通过 JSON 配置项一键渲染完整的 Naive UI 表单、内置表单校验、异步选项加载和响应式布局。 |
| **SvgIcon** | `src/basic/SvgIcon` | 统一图标渲染器，支持 Iconify 线上图标与本地 SVG 矢量图标。 |
| **SystemLogo** | `src/basic/SystemLogo` | 系统的 SVG Logo 矢量组件，使用 CSS 变量自适应主题色。 |
| **WaveBg** | `src/basic/WaveBg` | 装饰性的波浪背景组件，根据传入的主题色自动计算色调深浅。 |

### 2. 业务组件 (Business Components)

| 组件名称 | 目录路径 | 描述说明 |
| :--- | :--- | :--- |
| **AppProvider** | `src/business/AppProvider` | 全局顶层注入容器，包装并注册了 Naive UI 的 `LoadingBar`、`Dialog`、`Message` 和 `Notification` 实例到 `window` 上。 |
| **ExceptionBase** | `src/business/ExceptionBase` | 通用的异常状态页组件，统一封装了 `403` / `404` / `500` 状态的 SVG 样式插画和一键返回首页动作。 |
| **FileUpload** | `src/business/FileUpload` | **文件/图片直传组件**，封装了火山引擎 TOS (OBS 协议) 客户端直传逻辑，内置文件格式限制、大小限制、文件选择和进度反馈等核心能力。 |
| **SoybeanAvatar** | `src/business/SoybeanAvatar` | 头像组件，预置了圆角和背景兜底逻辑。 |
| **TableColumnSetting** | `src/business/TableColumnSetting` | **表格列控制与排序挂件**，提供复选展示、拖拽排序（通过 `vue-draggable-plus`）和列左右固定功能。 |
| **TableHeaderOperation** | `src/business/TableHeaderOperation` | **表格标准头部操作区**，预置了新增、批量删除、刷新和列设置控制入口。 |
| **ThemeSchemaSwitch** | `src/business/ThemeSchemaSwitch` | 主题模式切换按钮，支持日间模式 (`light`)、暗黑模式 (`dark`) 及系统随动 (`auto`)。 |

---

## 🛠️ 核心组件详细说明 (Detailed Components Specs)

### SchemaForm (配置化表单组件)
*   **路径**: `src/basic/SchemaForm/index.vue`
*   **用途**: 通过定义配置对象数组，快速渲染表单项，避免冗长且重复的 HTML 模板代码。
*   **支持控件**: `input` / `select` / `switch` / `date-picker` / `checkbox` / `radio` / `input-number` / `time-picker` 以及自定义插槽 `slot`。
*   **关键属性**:
    *   `model` (`defineModel`): 表单的表单绑定数据对象（双向绑定）。
    *   `options`: 类型为 `SchemaFormOptions[]` 的配置列表。
    *   `cols`: 栅格布局总列数，默认 24。
*   **调用示例**:
    ```vue
    <script setup lang="ts">
    import { ref } from 'vue'
    import { SchemaForm, type SchemaFormOptions } from '@sa/components'
    
    const formData = ref({ username: '', gender: 'male' })
    const formOptions = ref<SchemaFormOptions[]>([
      {
        value: 'username',
        label: '用户名',
        type: 'input',
        rules: { required: true, message: '请输入用户名' },
        span: '24 s:12', // 响应式栅格占位
      },
      {
        value: 'gender',
        label: '性别',
        type: 'radio',
        options: [{ label: '男', value: 'male' }, { label: '女', value: 'female' }]
      }
    ])
    </script>
    
    <template>
      <SchemaForm v-model:model="formData" :options="formOptions" />
    </template>
    ```

---

### FileUpload (上传组件)
*   **路径**: `src/business/FileUpload/index.vue`
*   **用途**: 提供高集成的上传组件，支持文件格式限制、大小校验、进度条更新，支持通过 `customUploader` 实现自定义上传逻辑。
*   **核心特性**:
    *   **上传调度**：支持通过 `customUploader` 属性或上下文注入自定义上传处理函数。
    *   **格式转换**：内置了 iOS 等平台上 `.mov` 视频文件自动转为更通用的 `.mp4` 格式的钩子（需父上下文注入并提供 `fetchConvertMovToMp4` 服务）。
    *   **手动控制** (`autoUploadObs` 为 `false`)：只选择文件，触发 `fileSelected` 并由外部做后续处理。
*   **关键属性**:
    *   `modelValue` / `v-model`: 绑定的文件/图片 URL 列表（支持 `string` 或 `string[]`）。
    *   `max`: 允许上传的最大文件个数，默认 5。
    *   `maxSize`: 限制的单文件大小（字节数）。
    *   `accept`: 接受的文件类型，默认 `image/*`。
    *   `autoUploadObs`: 是否在选定文件后自动直传至云，默认 `true`。

---

### TableColumnSetting & TableHeaderOperation (数据表格控制组)
*   **路径**: `src/business/TableColumnSetting/index.vue` & `src/business/TableHeaderOperation/index.vue`
*   **用途**: 搭配封装的数据表格使用，实现列可见性切换、列的前后位置拖拽排序、列的固定定位，以及新增、删除、刷新的标准交互操作。
*   **关键依赖**: `vue-draggable-plus` (拖拽库), `@sa/hooks` 的表格列配置逻辑。

---

### AppProvider (核心全局实例容器)
*   **路径**: `src/business/AppProvider/index.vue`
*   **用途**: 在应用入口文件包裹最外层节点，通过全局 `ContextHolder` 将 Naive UI 的非响应式通知/弹窗/加载条服务挂载到全局 `window` 对象上，确保全局任何纯 JS/TS 文件（如 Axios 拦截器等）都能直接调用，如 `window.$message.success('...')`。

---

### SvgIcon (通用矢量图标渲染)
*   **路径**: `src/basic/SvgIcon/index.vue`
*   **用途**: 统一图标规范。
    *   传入 `icon` 属性渲染 Iconify 在线图标库。
    *   传入 `localIcon` 属性加载本地项目的 `src/assets/svg-icon` 中定制的 SVG 图标。
*   **注意**: 若两者同时提供，本地图标 `localIcon` 的渲染优先级最高。

---

## 🎨 Hooks 导出 (Shared Hooks)

### useSvgIcon
*   **路径**: `src/hooks/icon.ts`
*   **用途**: 返回一个支持响应式渲染的 VNode 节点生成方法 `SvgIconVNode`，主要用于 Naive UI 组件（如 `NMenu` 或 `NDropdown`）的选项中直接传入 Icon VNode：
    ```ts
    import { useSvgIcon } from '@sa/components'
    const { SvgIconVNode } = useSvgIcon()
    
    const menuOptions = [
      {
        label: '工作台',
        key: 'dashboard',
        icon: SvgIconVNode({ icon: 'mdi:monitor-dashboard' })
      }
    ]
    ```
