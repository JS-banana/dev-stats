# Development Plan

## Goal

Create a complete first version of `dev-stats` that can fetch WakaTime weekly data, retain it in the repository, generate GitHub README-friendly SVG cards, and verify the implementation with tests, linting, formatting, build, and browser preview.

## Assumptions

- The local `.env` contains `WAKATIME_API_KEY`.
- The API key is treated as a private server-side secret.
- The first version is for the repository owner's own data, not a public multi-user hosted service.
- Repository file storage is the chosen retention backend.
- Daily scheduled execution is acceptable because it is safer than only running weekly.

## Non-scope

- OAuth.
- Public API hosting.
- Database, Gist, or GitHub Issues storage.
- Annual report UI.
- Per-heartbeat deep analytics.

## Architecture

```text
WakaTime API
  -> src/wakatime/client.ts
  -> src/wakatime/normalize.ts
  -> data/YYYY/MM/YYYY-WW.json
  -> src/render/svg-card.ts
  -> assets/wakatime-language.svg
  -> assets/wakatime-ai.svg
  -> assets/wakatime-agents.svg
  -> assets/wakatime-language-tokyonight.svg
  -> assets/wakatime-ai-tokyonight.svg
  -> assets/wakatime-agents-tokyonight.svg
  -> public/preview.html
```

## File Responsibilities

- `src/wakatime/client.ts`: HTTP client for WakaTime `stats`, `summaries`, and optional `user_agents`.
- `src/wakatime/types.ts`: Minimal type definitions for API payloads and normalized records.
- `src/wakatime/normalize.ts`: Convert raw API payloads into stable repository snapshots.
- `src/date/week.ts`: Date and ISO week helpers.
- `src/render/svg-card.ts`: Render accessible GitHub-readme-stats-style SVG cards from normalized data.
- `src/render/html-preview.ts`: Render a simple local preview document for all card variants.
- `src/archive/write.ts`: Write JSON and SVG artifacts.
- `src/cli.ts`: Command entrypoint.
- `tests/`: Vitest coverage for date helpers, normalizers, SVG rendering, and CLI behavior.
- `.github/workflows/update-wakatime.yml`: Scheduled GitHub Action.

## Implementation Tasks

1. Create Node + TypeScript engineering baseline.
   - Verify: `npm test`, `npm run lint`, `npm run format:check`, `npm run build`.

2. Add WakaTime date and formatting helpers.
   - Verify: unit tests for ISO week file names and human-readable formatting.

3. Add WakaTime client.
   - Verify: tests mock `fetch` and assert URL, auth header, query parameters, and error handling.

4. Add normalization model.
   - Verify: tests with fixture payloads containing languages and AI fields.

5. Add SVG card renderer.
   - Verify: tests assert XML escaping, key text, language rows, AI metrics, and empty AI fallback.

6. Add archive writer and CLI.
   - Verify: tests run the CLI against a mocked local server or mocked fetch and inspect generated files.

7. Add GitHub Action and README instructions.
   - Verify: YAML syntax is simple and references existing npm scripts.

8. Generate a local preview and verify in browser.
   - Verify: open `public/preview.html` or a local server and inspect desktop/mobile rendering.

## Runtime Commands

```bash
npm install
npm test
npm run lint
npm run format:check
npm run build
npm run update
```

## API Credentials

Local:

```text
WAKATIME_API_KEY=...
```

GitHub Actions:

```text
Settings -> Secrets and variables -> Actions -> New repository secret -> WAKATIME_API_KEY
```

## Success Criteria Mapping

- Research report: `docs/research/wakatime-api-research.md`.
- Executable plan: this file.
- Engineering baseline: `package.json`, TypeScript, ESLint, Prettier, Vitest.
- TDD and tests: all source behavior covered by unit tests.
- Functionality: `npm run update` fetches WakaTime data, writes compact repository JSON and multiple SVG cards, and creates a browser preview.
