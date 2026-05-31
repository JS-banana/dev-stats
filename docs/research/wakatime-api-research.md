# WakaTime API Research

## Purpose

This project needs two first-class capabilities:

1. Read weekly programming language statistics plus AI-related activity.
2. Persist weekly and daily source data into this repository so long-term analysis remains possible even when the WakaTime dashboard only shows a short history for free users.

The research below focuses on official WakaTime APIs and the implementation patterns used by waka-box and github-readme-stats.

## Official WakaTime APIs

Source: https://wakatime.com/developers

### Authentication

WakaTime documents OAuth scopes for application integrations. For this project, the practical credential is `WAKATIME_API_KEY`, kept as a server-side secret in local `.env` and GitHub Actions secrets. It must never be placed in a public frontend, README image URL, or query string.

### Stats

Endpoint:

```text
GET /api/v1/users/current/stats/:range
```

Useful range for the README card:

```text
last_7_days
```

`stats` is the best API for a current weekly card because it already aggregates total coding time, language percentages, projects, editors, and AI fields.

Important top-level fields under `data`:

- `total_seconds`, `human_readable_total`
- `daily_average`, `human_readable_daily_average`
- `languages[]`: `name`, `total_seconds`, `percent`, `text`, `hours`, `minutes`
- `projects[]`, `editors[]`, `operating_systems[]`, `machines[]`
- `is_up_to_date`

Important AI fields under `data`:

- `ai_additions`, `ai_deletions`
- `human_additions`, `human_deletions`
- `ai_agent_line_changes`
- `ai_line_changes_total`
- `ai_agent_costs`
- `ai_agent_breakdown[]`: `name`, `lines`, `cost`
- `ai_agent_total_cost`
- `ai_input_tokens`, `ai_output_tokens`
- `ai_prompt_length_avg`, `ai_prompt_length_sum`
- `ai_prompt_events_total`
- `ai_sessions`

### Summaries

Endpoint:

```text
GET /api/v1/users/current/summaries?start=YYYY-MM-DD&end=YYYY-MM-DD
```

`summaries` is the best API for repository retention because it returns daily records for a date range. The same AI aggregate fields appear under `data[].grand_total`, and many are also available under per-project and per-editor entries.

Required query fields:

- `start`: inclusive date.
- `end`: inclusive date.

Useful optional fields:

- `timezone`
- `project`
- `branches`

### User Agents

Endpoint:

```text
GET /api/v1/users/current/user_agents
```

This helps diagnose whether data is missing because an editor or AI-aware plugin has not reported activity. It is not required for the weekly card, but it is useful as an optional diagnostics artifact.

## WakaTime CLI Assessment

Source: https://github.com/wakatime/wakatime-cli

`wakatime-cli` is the command line program used by WakaTime editor plugins to submit heartbeats. It is useful when building a new editor plugin, custom tracker, or local activity collector.

For this project, the first version does not need to call `wakatime-cli` directly because:

- The user's editors and AI tools already submit data through official plugins.
- This project reads aggregated data from WakaTime APIs rather than submitting new heartbeats.
- Calling API endpoints keeps the archive job deterministic and easier to test.
- Adding `wakatime-cli` would introduce another runtime dependency without improving weekly retention.

Conclusion: keep `wakatime-cli` as a research reference only. Reconsider it later only if the project needs to collect activity not covered by existing WakaTime plugins.

## Retention Strategy

The project considered three GitHub-native retention targets.

| Strategy         | Fit                       | Tradeoff                                                                                                                                        |
| ---------------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Repository files | Best first choice         | Versioned, reviewable, easy to consume from future tools, and works with static SVG generation. Can expose project names if the repo is public. |
| GitHub Gist      | Good for profile snippets | Simple for pinned profile display, but separates long-term data from the codebase and is less convenient for annual analysis.                   |
| GitHub Issues    | Weak fit                  | Searchable and append-only, but data shape is awkward, automation is noisier, and issue history is not a clean analytics source.                |

Decision: store compact weekly JSON and generated SVG files in the repository. The JSON should keep normalized fields used for display and future annual analysis, not full raw WakaTime responses by default.

### Endpoints intentionally not used in v1

- `heartbeats`: too granular for the first version and requires broader access.
- `durations`: useful for deep analysis later, but unnecessary for weekly retention.
- `insights/ai_days`: useful for a future AI-vs-human heatmap, but not needed for the first weekly card.

## Free Plan Implication

WakaTime's free dashboard history is short, so this project should not depend on retrieving historical weeks later. The safer model is:

1. Run on a schedule.
2. Pull the current week while it is still available.
3. Commit normalized snapshots into `data/YYYY/MM/`.
4. Generate README-friendly SVG cards into `assets/`.

Daily execution is safer than weekly execution because it reduces the chance of missing data due to stale caches, failed GitHub Actions, or future API plan changes.

## Reference Projects

### waka-box

Source:

- https://github.com/matchai/waka-box
- https://github.com/JS-banana/waka-box

waka-box reads `WAKATIME_API_KEY`, fetches `last_7_days` stats, formats the top languages as a text table, and updates a GitHub Gist through GitHub Actions. It is a useful minimal reference for scheduled WakaTime fetching, but it does not solve repository-local JSON retention or AI metrics.

### github-readme-stats

Source:

- https://github.com/anuraghazra/github-readme-stats

github-readme-stats is the better product reference. The strongest pattern is "URL or generated image as the final interface": parse configuration, fetch data, render SVG, and let README users embed an image.

For this project, the first version should not expose a public WakaTime image service because private API keys would need server-side handling and abuse controls. Static SVG generation through GitHub Actions fits the current project better.

## Recommended v1 Scope

Build a CLI-first repository tool:

- Fetch `stats/last_7_days` for the current card.
- Fetch `summaries` for the same date window for retention.
- Normalize the useful totals, language breakdown, AI tokens, AI lines, prompts, sessions, and agent breakdown.
- Write JSON files into `data/YYYY/MM/`.
- Write GitHub README-friendly SVG cards into `assets/wakatime-language.svg`, `assets/wakatime-ai.svg`, and `assets/wakatime-agents.svg`.
- Provide a local HTML preview for browser verification.
- Provide a GitHub Action that runs on a schedule and commits changed generated files.

## Deferred Scope

- Public Next/Vercel image API.
- OAuth onboarding.
- Multi-user service.
- Gist or issue storage.
- Annual dashboard UI.
- Heartbeat-level analysis.
- Complex theme marketplace.
