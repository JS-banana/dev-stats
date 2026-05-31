# Project Context

这份文档给后续新对话快速接上当前项目状态。遇到代码实现、文档更新、功能规划时，先读这里；需要追溯决策依据时，再读 `docs/research/wakatime-api-research.md` 和 `docs/plan/development-plan.md`。

## 项目定位

`ai-wakatime-tool` 是一个面向个人仓库的 WakaTime 周数据归档和 GitHub README 卡片生成工具。

当前版本不做公开服务，不做 OAuth，不接第三方数据库。它通过本地或 GitHub Actions 中的 `WAKATIME_API_KEY` 拉取 WakaTime 数据，把每周快照留存在仓库文件里，并生成可直接嵌入 README 的静态 SVG。

核心目标有两个：

1. 展示编程语言时长，以及 AI 使用相关指标。
2. 持续留存每周数据，避免免费账号只能查看短期历史导致长期分析缺失。

## 当前实现状态

当前项目已经完成第一版 CLI 工作流：

```text
WakaTime API
  -> src/wakatime/client.ts
  -> src/wakatime/normalize.ts
  -> data/YYYY/MM/YYYY-WW.json
  -> src/render/svg-card.ts
  -> assets/*.svg
  -> public/preview.html
```

已实现内容：

- Node + TypeScript 工程。
- Vitest、ESLint、Prettier、TypeScript build。
- WakaTime `stats/last_7_days`、`summaries`、`user_agents` 客户端。
- 周数据归一化与紧凑 JSON 归档。
- 三类 SVG 卡片：语言时长、AI coding、AI agents。
- 两套主题：默认浅色和 `tokyonight`。
- 本地 HTML 预览。
- GitHub Actions 定时更新与自动提交。

## 关键命令

本项目终端命令默认使用 `rtk` 前缀执行。

```bash
npm install
npm test
npm run lint
npm run format:check
npm run build
npm run update
npm run preview
```

命令含义：

- `npm run update`：读取真实 WakaTime API，写入归档 JSON、SVG 卡片和预览页。
- `npm run preview`：使用 `tests/fixtures/wakatime-week.json` 生成本地预览产物，不需要真实 API key。
- `npm test`：跑全部 Vitest 测试。
- `npm run lint`、`npm run format:check`、`npm run build`：代码质量和构建验证。

## 环境变量

本地运行真实更新需要 `.env`：

```text
WAKATIME_API_KEY=...
```

GitHub Actions 需要仓库 secret：

```text
WAKATIME_API_KEY
```

任何时候都不要打印、提交或写入公开产物中的 API key。不要把 API key 放进 README 图片 URL、前端代码或查询参数。

## 数据归档约定

归档文件路径固定为：

```text
data/YYYY/MM/YYYY-WW.json
```

例如：

```text
data/2026/05/2026-W22.json
```

JSON 顶层字段：

- `schemaVersion`
- `generatedAt`
- `week`
- `totals`
- `languages`
- `ai`
- `days`

归档原则：

- 只保留展示和后续年度分析需要的归一化字段。
- 默认不保留完整 WakaTime 原始响应。
- 默认不保留 `diagnostics`。
- 如果未来要加入原始响应、诊断信息或更细粒度 heartbeat，必须先说明体积、隐私和长期维护影响。

当前预览和 SVG 使用的数据主要是：

- 周总时长、日均时长。
- 语言名称、语言时长、语言占比。
- AI 新增/删除行数。
- human 新增/删除行数。
- AI/human 行变更占比。
- AI input/output tokens。
- prompt events、sessions。
- AI agent 名称、lines、cost。

## SVG 产物约定

`npm run update` 和 `npm run preview` 会写入：

```text
assets/wakatime-language.svg
assets/wakatime-ai.svg
assets/wakatime-agents.svg
assets/wakatime-language-tokyonight.svg
assets/wakatime-ai-tokyonight.svg
assets/wakatime-agents-tokyonight.svg
public/preview.html
```

卡片方向：

- 接近 `github-readme-stats` 的静态 SVG 使用方式。
- 卡片适合 GitHub README 嵌入。
- 信息密度要足够，不能只做概念展示。
- 保持稳定尺寸、清晰层级、可读数字和进度条。
- UI 或卡片变化必须做浏览器预览验证。

## 关键文件

- `src/cli.ts`：CLI 入口，支持真实 API 与 fixture。
- `src/wakatime/client.ts`：WakaTime API 请求。
- `src/wakatime/normalize.ts`：把 API 响应转换成归档模型。
- `src/wakatime/types.ts`：API 与归档类型。
- `src/archive/write.ts`：写 JSON、SVG、HTML 预览。
- `src/render/svg-card.ts`：SVG 卡片渲染。
- `src/render/html-preview.ts`：预览页渲染。
- `tests/fixtures/wakatime-week.json`：测试和预览 fixture。
- `.github/workflows/update-wakatime.yml`：定时更新工作流。

## 测试覆盖

当前测试覆盖重点：

- ISO week 和时间格式化。
- WakaTime client 的 URL、认证 header、错误处理。
- 归一化结果 shape。
- JSON 归档路径和文件内容。
- SVG 卡片文案、转义、主题和空数据状态。
- CLI fixture 路径。

改代码时优先按 TDD 补测试。文档-only 修改至少跑格式检查；功能修改需要跑：

```bash
npm test
npm run lint
npm run format:check
npm run build
```

## 后续功能边界

可以继续推进：

- README 展示效果优化。
- 更多主题。
- 年度或月度聚合分析。
- 基于历史 JSON 的长期趋势图。
- 更细的 AI agent 指标展示。

暂不默认推进：

- 公开在线图片服务。
- OAuth 多用户服务。
- 数据库、Gist 或 Issues 归档。
- heartbeat 级别深度分析。
- 复杂配置系统。

这些方向都需要先重新确认需求和隐私边界。
