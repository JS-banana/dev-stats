# Dev Stats

Archive WakaTime coding stats into this repository and render GitHub README-friendly SVG cards for language coding time and AI coding metrics.

## Setup

```bash
npm install
cp .env.example .env
```

Add your WakaTime API key:

```text
WAKATIME_API_KEY=...
```

## Commands

```bash
npm test
npm run lint
npm run format:check
npm run build
npm run update
```

`npm run update` writes:

- `data/YYYY/MM/YYYY-WW.json`
- `assets/wakatime-language.svg`
- `assets/wakatime-ai.svg`
- `assets/wakatime-agents.svg`
- `assets/wakatime-language-tokyonight.svg`
- `assets/wakatime-ai-tokyonight.svg`
- `assets/wakatime-agents-tokyonight.svg`
- `public/preview.html`

## GitHub README Usage

After the scheduled workflow has generated the SVG files, embed the cards you want from this repository:

```md
![WakaTime language coding time](./assets/wakatime-language.svg)
![WakaTime AI coding](./assets/wakatime-ai.svg)
![WakaTime AI agents](./assets/wakatime-agents.svg)
```

## GitHub Actions Secret

Create this repository secret before enabling scheduled updates:

```text
WAKATIME_API_KEY
```

## Project Docs

- [Current project context](docs/context/project-context.md)
- [WakaTime API research](docs/research/wakatime-api-research.md)
- [Development plan](docs/plan/development-plan.md)
