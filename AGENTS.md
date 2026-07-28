# AGENTS.md

> 本文件由 Claude Code 根据工作区内容生成并持续维护，用于对齐项目意图、角色职责与行为准则。

## 1. 角色与职责

本 AI 助手作为项目的协作式编码搭档，承担以下职责：

- **需求理解**：在完全理解用户意图后再进入实现阶段；对模糊或不明确的需求主动澄清，不做默认假设。
- **代码实现**：以最少、最清晰、最易于 review 的代码完成用户要求的功能。
- **代码质量**：编写高性能、高可读性的代码，遵循项目已有风格与约定。
- **项目维护**：持续根据工作区文件校准本文件，确保对项目目标、结构与行为准则的理解保持最新。
- **学习与解释**：在关键实现前后给出简短的教育性说明，帮助用户理解设计选择。

## 2. 项目概述

### 2.1 项目定位

`MHalo.CoreFx.RsaToolBox` 是一个面向 Windows 桌面的 **RSA 工具箱应用**，帮助开发者完成 RSA 密钥生成、加解密、签名/验签以及密钥格式转换等常见密码学操作。

`RsaToolBox.Crossfrom` 是该工具的 **跨平台桌面应用「RSA工具箱」**，目标平台为 Windows / macOS / Linux，功能与逻辑与 WPF 版本严格对齐。

### 2.2 技术栈

**WPF 版本（`RsaToolBox.Winform`）**：

- **运行时 / 框架**：.NET 8（`net8.0-windows`）
- **UI 框架**：WPF + [WPF-UI](https://github.com/lepoco/wpfui) 3.0.4
- **架构模式**：MVVM（使用 `CommunityToolkit.Mvvm` 8.2.2）
- **依赖注入**：`Microsoft.Extensions.Hosting`
- **密码学库**：BouncyCastle.NetCore 2.2.1
- **发布优化**：使用 `nulastudio.NetBeauty` 整理依赖 DLL

**跨平台版本（`RsaToolBox.Crossfrom`）**：

- **桌面壳**：Tauri 2.x
- **前端框架**：React 19 + Vite
- **UI 方案**：Tailwind CSS v4 + shadcn/ui（Radix UI 行为层）
- **状态管理**：Zustand
- **路由**：React Router
- **图标**：Lucide
- **密码学核心**：.NET 9 WebAssembly Browser App，复用现有 `RsaToolBox.Winform/Helpers/RSAExtensions` 逻辑（已重构为纯 BouncyCastle 以兼容 browser-wasm）
- **前后端互操作**：JSImport / JSExport（.NET WASM JS interop）
- **构建工具**：Vite + Tauri CLI + `dotnet publish`
- **CI/CD**：GitHub Actions 自动发布流水线（tag `v*.*.*` 触发 → 三平台并行构建 → Draft Release）
- **版本管理**：Git tag 驱动，`scripts/sync-version.mjs` 同步 `package.json` / `tauri.conf.json` / `Cargo.toml`

### 2.3 目录结构

```text
MHalo.RsaToolBox/
├── RsaToolBox.Winform/          # 当前主项目（WPF 桌面应用）
│   ├── App.xaml                 # 应用入口、WPF-UI 主题
│   ├── Assets/                  # Logo 与截图资源
│   ├── Helpers/                 # 工具类与扩展方法
│   │   └── RSAExtensions/       # RSA 相关扩展
│   ├── Models/                  # 数据模型
│   ├── Services/                # 应用级服务（导航、主机托管）
│   ├── ViewModels/              # MVVM 视图模型
│   │   ├── Pages/               # 页面 ViewModel
│   │   └── Windows/             # 窗口 ViewModel
│   ├── Views/                   # XAML 视图
│   │   ├── Pages/               # 页面 XAML
│   │   └── Windows/             # 窗口 XAML
│   ├── Resources/Translations.cs # 本地化/文案资源
│   └── MHalo.CoreFx.RsaToolBox.csproj
└── RsaToolBox.Crossfrom/        # 跨平台桌面应用（Tauri + React + .NET WASM）
    ├── .github/workflows/       # GitHub Actions CI/CD（tag 触发多平台构建）
    ├── public/                  # 静态资源（logo.png、rsaWorker.js）
    ├── scripts/                 # 构建脚本（sync-version.mjs）
    ├── src/                     # React 前端源码（pages/components/services/stores）
    ├── src-core/                # .NET 9 WASM Browser App（net9.0-browser，RSA 核心）
    ├── src-tauri/               # Tauri Rust 项目（文件系统/打开文件夹）
    ├── package.json
    ├── vite.config.ts
    └── tsconfig.json
```

### 2.4 核心功能模块

当前已实现的页面与功能：

**WPF 版本**：
- **RsaKeyGeneratePage/ViewModel**：RSA 密钥生成，支持将生成的密钥发送到加解密与签名验签页面。
- **RsaCryptPage/ViewModel**：RSA 加密 / 解密操作。
- **RsaSignPage/ViewModel**：RSA 签名 / 验签操作，支持算法选择。
- **RsaTransKeyFormatPage/Model**：RSA 密钥格式转换（如 PEM、XML 等）。
- **SettingsPage/ViewModel**：应用设置。
- **MainWindow**：主导航窗口，默认打开密钥生成页。

**跨平台版本（RSA工具箱）**：
- **KeyGenerate 页**：RSA 密钥生成，支持密钥长度/算法选择、严格位对齐开关、自动保存到桌面 `~/Desktop/rsa-keys/[KeyType]-[random]/`、一键打开保存目录。
- **Crypt 页**：RSA 加密 / 解密操作。
- **Sign 页**：RSA 签名 / 验签操作。
- **Transform 页**：密钥格式检测与转换（PEM、XML 等）。
- **Settings 页**：主题色、暗色模式、圆角、默认密钥格式/算法、严格位对齐等全局设置（Zustand + localStorage 持久化）。
- **Layout**：侧边栏导航 + RSA Logo + 深色/浅色模式切换。
- **Tauri Rust 后端**：三个命令 `get_save_path` / `save_key_file` / `open_folder`（`dirs` + `opener` crate）。
- **Web Worker**：.NET 9 WASM 运行时在 Worker 中加载 `rsaWorker.js`，避免阻塞主线程。

## 3. 行为准则

除全局 `CLAUDE.md` 的通用准则外，针对本项目额外约定如下：

### 3.1 先思考再编码

- 对密码学相关操作（密钥长度、填充模式、签名算法、格式转换）必须明确需求，不擅自决定默认参数。
- 若修改 UI 交互（按钮、导航、页面跳转），需先说明方案并确认。

### 3.2 简单优先

- 不在 WPF 项目中引入不必要的抽象或通用基础设施。
- 一次性的辅助方法直接放在对应页面或 Helper 中，不强行抽取公共基类。
- 不预先为 `RsaToolBox.Crossfrom` 添加代码，除非用户明确要求。

### 3.3 手术式改动

- 保持 XAML 与 ViewModel 的命名、结构与现有风格一致。
- 不重构未损坏的代码；不清理未涉及的旧代码。
- 改动导致的未使用引用、字段、方法应立即清理。
- 每行改动都应能追溯到用户的当前需求。

### 3.4 目标驱动执行

- 对 bug 修复：先写/描述复现步骤或测试，再修复。
- 对功能新增：先明确验收标准，再实现。
- 对重构：确保改动前后核心功能一致，必要时人工验证。

## 4. 项目特定约定

### 4.1 Git 提交规范

- 每次完成里程碑开发后应进行 Git 提交。
- 提交信息需简要说明本次修改内容，并根据所属类型添加前缀标识：
  - `[corefx-commit]` —— 当前 WPF 核心项目（`RsaToolBox.Winform`）的提交
  - 若未来扩展出 web / server / microapp / dashboard 等模块，再分别使用 `[web-commit]`、`[server-commit]`、`[microapp-commit]`、`[dashboard-commit]`。

### 4.2 运行与测试命令

- **需要启动应用**（如 `pnpm run dev`、`dotnet run`）时，不主动执行；告知用户由用户手动启动。
- **静态检查与构建**（如 `pnpm run lint`、`pnpm run build`、`dotnet build`）可直接运行，无需额外授权。

### 4.3 框架与库约束

**WPF 版本**：

- UI 继续使用 WPF-UI 3.x 主题与控件；如需自定义样式，优先复用其内置资源。
- MVVM 使用 `CommunityToolkit.Mvvm` 的源生成器（`ObservableProperty`、`RelayCommand` 等）。
- RSA 运算优先使用 BouncyCastle 提供的 API，保持跨格式兼容性。

**跨平台版本**：

- 桌面壳使用 Tauri 2.x，Rust 后端仅做最小化 shell，不处理业务逻辑。
- UI 使用 React 19 + Tailwind CSS v4 + shadcn/ui，主题需支持浅色/深色切换（`dark` class 策略）。
- RSA 运算必须在 .NET WASM 中复用现有 `RSAExtensions` 逻辑，确保与 WPF 版本及外部类库严格对齐结果。
- 前端与 WASM 之间的复合数据统一使用 JSON 字符串传递，规避 `[JSExport]` 复杂类型限制。

## 5. 开放问题（待用户确认）

以下事项尚未明确，将随着对话逐步补充到本文件：

1. ~~`RsaToolBox.Crossfrom` 目录的用途与规划是什么？是否计划未来作为跨平台版本？~~（已明确：跨平台桌面应用，使用 Tauri + React + .NET WASM；2026-07-28 前端由 Vue 3 + Naive UI 迁移至 React 19 + Tailwind v4 + shadcn/ui）
2. 当前项目是否已有单元测试计划？是否需要为新功能补充测试？（已纳入设计：Vitest 单元测试 + 兼容性测试 + Tauri WebDriver E2E）
3. 是否需要支持多语言/本地化？目前 `Resources/Translations.cs` 的使用范围有限。（首期不做，架构上预留）
4. ~~是否有计划将业务逻辑（RSA 运算）抽离为可共享的核心库？~~（已明确：首期通过文件复用 `RSAExtensions`，后续可抽取为共享类库）
5. 发布管理：发布新版本时需先取得用户许可，再打 tag。

## 6. 版本历史（RsaToolBox.Crossfrom）

## 6. 版本历史（RsaToolBox.Crossfrom）

### v0.1.1（首个正式发布）
- React 19 + Tailwind v4 + shadcn/ui 迁移完成
- WASM 运行时迁移到 Web Worker
- 密钥生成自动保存到本地 `~/Desktop/rsa-keys/`
- GitHub Actions CI/CD（tag 触发三平台构建 + 自动发布）
- macOS 无证书 ad-hoc 签名修复
- 菜单栏改为悬浮圆角面板 + 阴影
- Sonner toast `richColors` 修复
- 版本更新检测（GitHub Releases API + 侧边栏提示 + 设置页卡片）

### v0.1.0
- 初始 Tauri 2 + Vue 3 + .NET 9 WASM 架构（后于 2026-07-28 迁移至 React）
- RSA 密钥生成、加解密、签名验签、格式转换

---

*最后更新：2026-07-28（添加发布管理规则、版本历史）*
