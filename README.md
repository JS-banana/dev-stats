# Dev Stats

[![Tests](https://github.com/JS-banana/dev-stats/actions/workflows/update-wakatime.yml/badge.svg)](https://github.com/JS-banana/dev-stats/actions)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D22-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![WakaTime](https://img.shields.io/badge/Powered%20by-WakaTime-orange?logo=wakatime&logoColor=white)](https://wakatime.com/)

> Archive your weekly WakaTime coding stats and generate beautiful SVG cards for GitHub README.

[English](./README.md) | [中文](./README-zh.md)

---

## ✨ Preview

|                       Light Mode                       |                            Dark Mode                             |
| :----------------------------------------------------: | :--------------------------------------------------------------: |
| ![Weekly coding stats](./assets/wakatime-language.svg) | ![Weekly coding stats dark](./assets/wakatime-language-dark.svg) |
|      ![Weekly AI stats](./assets/wakatime-ai.svg)      |      ![Weekly AI stats dark](./assets/wakatime-ai-dark.svg)      |

---

## 🚀 Quick Start

Get your stats cards in 3 steps:

### 1. Fork this repo

Click the **Fork** button at the top right of this page.

### 2. Add your WakaTime API Key

1. Go to [WakaTime Settings](https://wakatime.com/settings/api-key) and copy your API key.
2. In your forked repo, go to **Settings > Secrets and variables > Actions**.
3. Click **New repository secret**:
   - Name: `WAKATIME_API_KEY`
   - Secret: your API key

### 3. Enable GitHub Actions

1. Go to the **Actions** tab in your repo.
2. Click **I understand my workflows, go ahead and enable them**.
3. Run the workflow manually or wait for the daily auto-run (UTC 01:18 / Beijing 09:18).

Done! Your SVG cards will be generated in `assets/` and updated daily.

---

## 📊 What You Get

| Card               | Description                             | Light                   | Dark                         |
| ------------------ | --------------------------------------- | ----------------------- | ---------------------------- |
| **Language Stats** | Weekly coding time per language         | `wakatime-language.svg` | `wakatime-language-dark.svg` |
| **AI Stats**       | AI tokens, cost, prompts & line changes | `wakatime-ai.svg`       | `wakatime-ai-dark.svg`       |

All data is archived weekly as JSON in `data/YYYY/MM/YYYY-WW.json`, so you never lose historical stats—even after your free WakaTime account's retention period expires.

---

## 🎯 Features

- 📊 **Weekly archival** — structured JSON with normalized fields
- 🎨 **4 SVG variants** — 2 card types × 2 themes (light & dark)
- 🔄 **Auto updates** — daily via GitHub Actions
- 📱 **Local preview** — HTML preview for quick inspection
- 🧪 **Fully tested** — reliable and maintainable

---

## 📖 Embed in Your README

Copy and paste into your README.md:

**Light theme:**

```md
![Weekly coding stats](https://raw.githubusercontent.com/JS-banana/dev-stats/main/assets/wakatime-language.svg)
![Weekly AI stats](https://raw.githubusercontent.com/JS-banana/dev-stats/main/assets/wakatime-ai.svg)
```

**Dark theme:**

```md
![Weekly coding stats](https://raw.githubusercontent.com/JS-banana/dev-stats/main/assets/wakatime-language-dark.svg)
![Weekly AI stats](https://raw.githubusercontent.com/JS-banana/dev-stats/main/assets/wakatime-ai-dark.svg)
```

**Responsive (auto switch):**

```html
<picture>
  <source
    media="(prefers-color-scheme: dark)"
    srcset="
      https://raw.githubusercontent.com/JS-banana/dev-stats/main/assets/wakatime-language-dark.svg
    "
  />
  <source
    media="(prefers-color-scheme: light)"
    srcset="https://raw.githubusercontent.com/JS-banana/dev-stats/main/assets/wakatime-language.svg"
  />
  <img
    alt="Weekly coding stats"
    src="https://raw.githubusercontent.com/JS-banana/dev-stats/main/assets/wakatime-language.svg"
  />
</picture>
```

---

## 💡 How It Works

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  WakaTime   │────▶│  Dev Stats   │────▶│  Your Repo  │
│     API     │     │   (GitHub    │     │  - assets/  │
│             │     │   Actions)   │     │  - data/    │
└─────────────┘     └──────────────┘     └─────────────┘
     Weekly              Fetch &              SVG cards
     stats              Generate             + JSON archive
```

1. **Fetch** — pulls weekly stats from WakaTime API
2. **Normalize** — extracts and cleans relevant fields
3. **Archive** — saves as `data/YYYY/MM/YYYY-WW.json`
4. **Generate** — renders 4 SVG card variants
5. **Commit** — pushes updates to your repo

---

<details>
<summary><strong>⚙️ Advanced Setup (Local Development)</strong></summary>

### Prerequisites

- Node.js >= 22
- WakaTime account with [API key](https://wakatime.com/settings/api-key)

### Installation

```bash
git clone https://github.com/JS-banana/dev-stats.git
cd dev-stats
npm install
cp .env.example .env
```

Add your API key to `.env`:

```text
WAKATIME_API_KEY=your_key_here
```

### Commands

```bash
npm test              # Run tests
npm run lint          # Lint code
npm run format:check  # Check formatting
npm run build         # Build TypeScript
npm run update        # Fetch WakaTime data and generate artifacts
npm run preview       # Generate preview with test fixtures (no API key needed)
```

### Environment Variables

| Variable           | Description           | Required |
| ------------------ | --------------------- | -------- |
| `WAKATIME_API_KEY` | Your WakaTime API key | Yes      |

</details>

---

## 📄 License

[MIT](./LICENSE)
