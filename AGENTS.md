# AGENTS.md

## 项目定位

这是一个面向个人仓库的 WakaTime 周数据归档与 GitHub README SVG 卡片生成工具。当前版本通过 WakaTime API 拉取周数据，归一化后写入仓库 JSON，并生成可直接嵌入 README 的静态 SVG。

当前不是公开多用户服务，不做 OAuth，不接数据库，不默认使用 Gist 或 GitHub Issues 归档。

## 基本要求

- 不要泄露、打印、提交或写入公开产物中的 `WAKATIME_API_KEY`。
- 遇到账号、权限、密钥、远程发布或不可逆操作问题，先停下来问用户。
- 只做当前任务需要的改动，不顺手重构无关代码。

## 上下文读取顺序

非平凡任务先按需读取这些文件：

1. README：面向使用者的当前功能、命令和产物说明。
2. `package.json`、相关源码与测试文件：当前实现和验证入口。
3. 若本地存在未跟踪的 `docs/` 目录，可按需读取其中的上下文、研究或计划文档。

不要把历史需求全文继续堆进 `AGENTS.md`。如需长期沉淀上下文，可放入本地 `docs/`；公开使用说明仍优先维护 README。

## 工作方式

- 编码前说明关键假设；如果需求存在多个合理解释，先把分歧说清楚。
- 优先选择最小可行实现，不添加未要求的配置、抽象或功能。
- 修改已有代码时匹配当前风格，不清理与任务无关的旧代码。
- 功能和 bugfix 按 TDD 推进：先补能证明目标的测试，再实现。
- 如果第一次修复失败，继续排查真实原因，不用猜测覆盖错误。
- 影响 SVG 或预览效果时，除了测试以外还要做浏览器验证。

## 数据与产物约定

- 周归档路径固定为 `data/YYYY/MM/YYYY-WW.json`。
- JSON 只保留展示和后续统计需要的归一化字段。
- 默认不要保存完整 WakaTime 原始响应。
- 默认不要保存 `diagnostics`。
- SVG 产物包括 `Weekly Coding Stats` 和 `Weekly AI Stats` 两类卡片，每类都有浅色和深色变体。
- README 可使用 `public/dev-stats-card-reference.png` 作为设计效果图；真实可嵌入产物仍以 `assets/*.svg` 为准。
- 预览页写入 `public/preview.html`。

如果要改变数据 shape、归档路径、卡片文件名或公开产物内容，必须同步更新测试和 README；若本地维护了 `docs/`，也要同步更新对应上下文。

## 常用命令

```bash
npm install
npm test
npm run lint
npm run format:check
npm run build
npm run update
npm run preview
```

功能修改完成前至少运行：

```bash
npm test
npm run lint
npm run format:check
npm run build
```

文档-only 修改至少运行相关格式检查。

## 文档维护

- README 面向使用者，保持简洁，并随公开行为变化同步更新。
- 本地 `docs/` 当前不纳入版本控制；若存在并用于记录上下文、研究或计划，相关行为变更时同步维护。
