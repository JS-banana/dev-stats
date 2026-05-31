import { describe, expect, it } from "vitest";

import {
  renderAiCodingCard,
  renderAgentsCard,
  renderLanguageCard,
} from "../src/render/svg-card.js";
import type { WeeklyArchive } from "../src/wakatime/types.js";

const archive: WeeklyArchive = {
  schemaVersion: 1,
  generatedAt: "2026-05-30T00:00:00.000Z",
  week: { id: "2026-W22", start: "2026-05-25", end: "2026-05-31" },
  totals: {
    totalSeconds: 28140,
    humanReadable: "7 hrs 49 mins",
    dailyAverageSeconds: 4020,
    humanReadableDailyAverage: "1 hr 7 mins",
  },
  languages: [
    { name: "TypeScript", totalSeconds: 14280, percent: 50.75, text: "3 hrs 58 mins" },
    { name: "Rust & Tools", totalSeconds: 7200, percent: 25.58, text: "2 hrs" },
  ],
  ai: {
    additions: 320,
    deletions: 44,
    humanAdditions: 1200,
    humanDeletions: 200,
    lineChangesTotal: 364,
    humanLineChangesTotal: 1400,
    aiSharePercent: 20.6,
    humanSharePercent: 79.4,
    agentTotalCost: 1.24,
    inputTokens: 18240,
    outputTokens: 51200,
    promptEventsTotal: 96,
    sessions: 18,
    agents: [{ name: "Claude <Code>", lines: 260, cost: 0.8 }],
  },
  days: [],
};

describe("renderLanguageCard", () => {
  it("renders a focused GitHub-readme-stats style language card", () => {
    const svg = renderLanguageCard(archive);

    expect(svg).toContain("<svg");
    expect(svg).toContain("2026-W22");
    expect(svg).toContain("Language coding time");
    expect(svg).toContain("7 hrs 49 mins");
    expect(svg).toContain("TypeScript");
    expect(svg).toContain("Rust &amp; Tools");
    expect(svg).not.toContain("AI tokens");
  });

  it("supports a dark github-readme-stats style theme", () => {
    const svg = renderLanguageCard(archive, { theme: "tokyonight" });

    expect(svg).toContain("Language coding time");
    expect(svg).toContain("#1a1b27");
    expect(svg).toContain("#70a5fd");
  });

  it("keeps the language card footer below the language rows", () => {
    const svg = renderLanguageCard({
      ...archive,
      languages: [
        ...archive.languages,
        { name: "Markdown", totalSeconds: 3600, percent: 12, text: "1 hr" },
        { name: "Swift", totalSeconds: 2400, percent: 8, text: "40 mins" },
        { name: "Less", totalSeconds: 1800, percent: 6, text: "30 mins" },
      ],
    });

    expect(svg).toContain('height="298"');
    expect(svg).toContain("Daily average");
  });
});

describe("renderAiCodingCard", () => {
  it("renders tokens and human versus AI coding share", () => {
    const svg = renderAiCodingCard(archive);

    expect(svg).toContain("AI coding");
    expect(svg).toContain("18.2k input");
    expect(svg).toContain("51.2k output");
    expect(svg).toContain("AI share");
    expect(svg).toContain("20.6%");
    expect(svg).toContain("Human share");
    expect(svg).toContain("79.4%");
    expect(svg).toContain("96 prompts");
    expect(svg).not.toContain("TypeScript");
  });
});

describe("renderAgentsCard", () => {
  it("renders AI agent breakdown as a separate optional card", () => {
    const svg = renderAgentsCard(archive);

    expect(svg).toContain("AI agents");
    expect(svg).toContain("Claude &lt;Code&gt;");
    expect(svg).toContain("260 lines");
    expect(svg).not.toContain("Claude <Code>");
  });
});
