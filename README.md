# Soybean Admin Monorepo

清新优雅、功能强大的 Vue3 + Vite + TypeScript + Pinia + UnoCSS 后台管理系统（Monorepo 多项目架构版）。

---

## 📂 项目结构 (Directory Structure)

```text
soybean-admin/
├── apps/                  # 应用项目 (Applications)
│   └── admin/             # 管理员端后台 (@apps/admin)
├── packages/              # 共享模块/本地包 (Shared Packages)
│   ├── components/        # 通用 Vue 组件库 (@sa/components)
│   ├── utils/             # 通用工具库 (@sa/utils)
│   ├── color/             # 颜色调色板工具 (@sa/color)
│   ├── uno-preset/        # UnoCSS 自定义预设 (@sa/uno-preset)
│   └── scripts/           # 内部构建与发布脚本 (@sa/scripts)
├── package.json           # 根目录配置
└── pnpm-workspace.yaml    # Workspace 范围定义
```

---

## 🛠️ 开发与构建命令 (Development & Build Commands)

### 1. 本地开发 (Development)
启动指定应用的本地开发服务器：
```bash
# 启动管理员端后台 (Web)
pnpm dev
```

### 2. 代码检查 (Quality Verification)
```bash
# 格式化与 Lint 检查
pnpm lint

# 自动修复 Lint 问题
pnpm lint:fix

# 全量工作区类型检查
pnpm typecheck
```

---

## 🚀 生产发布与打包步骤 (Release & Build Pipeline)

为了保证生产环境代码版本一致性、更新日志完整以及构建输出的版本号正确，请严格按照以下步骤进行打包和发布：

### 第一步：代码自检与清理
在发布前，建议先清理冗余缓存并运行全量检查：
```bash
# 1. 彻底清除冗余的 node_modules 和 dist 目录
pnpm cleanup

# 2. 重新安装依赖
pnpm i

# 3. 运行全量 TypeScript 类型检查
pnpm typecheck
```

### 第二步：运行发布指令 (pnpm release)
使用统一版本发布脚本，进行版本升级和日志生成：
```bash
pnpm release
```
* **在此步骤中，脚本会自动执行以下流程**：
  1. **交互式选版**：在终端弹出 UI，让您选择升级的版本级别（`patch` / `minor` / `major`）。
  2. **同步版本号**：自动将项目根目录及所有子项目（`apps/*`、`packages/*`）的 `package.json` 中的 `version` 同步修改为新版本。
  3. **自动生成 Changelog**：调用 `changelogen --output` 自动分析 Conventional Commits 提交历史，并将本次版本的更新日志追加到根目录的 `CHANGELOG.md` 中。
  4. **创建提交与 Tag**：自动创建 Release 提交（例如 `chore(projects): release v2.3.1`），自动打上对应版本的 Git Tag（例如 `v2.3.1`），并将代码及 Tag 一并推送到远程 Git 仓库。

### 第三步：执行构建打包 (pnpm build)
当版本号更新和 Tag 推送完成后，执行生产环境静态资源打包：
```bash
pnpm build
```
* **说明**：
  * 打包产物将输出在各个子应用的 `dist` 目录中。
  * **为什么必须在 release 之后运行 build？**
    先执行 `pnpm release` 可以确保所有 `package.json` 中的版本号已经是最新。在此之后运行 `pnpm build`，打包出来的静态资源中注入的版本信息以及静态资源哈希缓存清除参数（Cache Busting）才能正确映射最新的版本号。
