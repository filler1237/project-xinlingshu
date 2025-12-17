# Copilot 使用说明（面向 AI 编码代理）

目的：让 AI 代理快速在本仓库里完成开发任务，理解工程结构、常见模式、关键文件与可执行的开发步骤。

- **工程类型**：微信小程序 + 云函数（Tencent Cloud / 微信云开发）。前端在项目根目录，云函数在 `cloud/`。

- **关键位置（示例）**：
  - `app.js` — 全局初始化（包含 `wx.cloud.init`，注意 env 配置）：[app.js](app.js#L1-L40)
  - `app.json` — 页面与子包配置、全局 `usingComponents`：[app.json](app.json#L1-L80)
  - `project.config.json` — WeChat DevTools 配置与 `cloudfunctionRoot`：[project.config.json](project.config.json#L1-L40)
  - `cloud/` — 所有云函数，每个子目录对应一个云函数（例如 `cloud/loginRegister/index.js`）：[cloud/loginRegister/index.js](cloud/loginRegister/index.js#L1-L60)
  - `components/`, `pages/`, `utils/` — 前端组件、页面与工具库（常见修改点）

- **大体架构 & 数据流**：
  - 前端页面通过 `wx.cloud.callFunction({ name: '<fnName>' })` 调用云函数（示例见任意页面，如 `pages/diary/create/create.js`）。
  - 云函数使用 `wx-server-sdk`，并通过 `db.collection(...)` 操作云数据库，通常依赖 `_openid` 字段与集合命名规则（参见 `cloud/loginRegister/index.js`）。
  - 前端全局 `wx.cloud.init` 在 `app.js` 中使用了固定 `env`（注意可能与云函数部署时的 `DYNAMIC_CURRENT_ENV` 不一致）。

- **约定与模式（可被 AI 直接复用）**：
  - 云函数位置与名称一一对应：`cloud/<name>/index.js` → `wx.cloud.callFunction({ name: '<name>' })`。
  - 数据库对象约定：使用 `db.collection('<collectionName>')`，用户相关记录包含 `_openid`、`_id`、`createTime`（`db.serverDate()`）等字段。
  - 子包与页面：新增页面时必须修改 `app.json` 的 `pages` 或相应 `subpackages`。组件需在 `app.json` 的 `usingComponents` 或单页 `json` 中注册。

- **常见开发 / 调试步骤（可直接执行）**
  1. 安装依赖（若在本地调试 JS/工具）：`npm install`（仓库已包含 `node_modules`，但在本地修改依赖时运行）。
  2. 在微信开发者工具中打开本项目根目录（使用 `project.config.json`），确保已登录并启用云开发功能。部署云函数请在开发者工具 Cloud Functions 面板操作或使用 CI 流程。
  3. 本地调试前端：修改 `pages/` 或 `components/` 后，在 DevTools 预览并查看控制台日志（云函数调用会在 Cloud 调试面板中显示日志）。

- **注意事项 / 潜在陷阱**
  - `app.js` 内固定 `env` 与云函数内 `cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })` 的差异会导致本地与云端环境不一致；修改或新增功能时先确认目标环境（`project.config.json` 中 appid/环境）。
  - 大量页面使用 `wx.cloud.callFunction` 异步逻辑，AI 修改时应保留错误处理与 loading 状态（参照 `pages/diary/create/create.js` 的调用模式）。
  - 组件库：项目使用 `vant-weapp`（见 `package.json`），组件路径在 `miniprogram_npm/vant-weapp/`。

- **如何为新任务生成补丁（给 AI 的指示）**
  - 修改前端页面：编辑 `pages/.../.js/.wxml/.wxss/.json`。若新增页面，添加 `pages` 或 `subpackages` 条目到 `app.json`。
  - 修改/新增云函数：在 `cloud/<name>/index.js` 中实现 `exports.main = async (event, context) => {}`；云端依赖 `wx-server-sdk`，初始化请参照现有函数（使用 `cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })`）。
  - 更新 DB 模式：阅读现有 `db.collection(...).add/update` 示例，尽量与现有字段一致（如 `createTime: db.serverDate()`、`_openid`、`growthValue` 等）。

- **快速定位示例**
  - 用户注册/登录：`cloud/loginRegister/index.js`（用户集合 schema、`_openid` 使用示例） — [cloud/loginRegister/index.js](cloud/loginRegister/index.js#L1-L120)
  - 全局初始化与 env 注意：`app.js` — [app.js](app.js#L1-L40)
  - 项目与云函数根：`project.config.json` — [project.config.json](project.config.json#L1-L40)

如果有你关心的特定任务（例如：新增云函数、重构某个页面、或修复某个云函数的权限/环境问题），告诉我目标文件或路径，我会基于本文件夹结构生成补丁并运行静态检查。

---
请反馈哪些部分需要更详细的示例或需要补充的团队约定（例如代码风格、PR 流程、CI 部署细节）。
