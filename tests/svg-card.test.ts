import { describe, expect, it } from "vitest";

import { renderAiStatsCard, renderLanguageCard } from "../src/render/svg-card.js";
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
  it("renders weekly coding stats with aligned language time and share columns", () => {
    const svg = renderLanguageCard(archive);

    expect(svg).toContain("<svg");
    expect(svg).toContain("2026-W22");
    expect(svg).toContain("Weekly Coding Stats");
    expect(svg).not.toContain('text-anchor="end">2026-W22</text>');
    expect(svg).not.toContain("Language coding time");
    expect(svg).not.toContain("Daily average");
    expect(svg).toContain("TypeScript");
    expect(svg).toContain("3 hrs 58 mins");
    expect(svg).toContain("50.8%");
    expect(svg).toContain("Rust &amp; Tools");
    expect(svg).toContain('class="time" x="138"');
    expect(svg).toContain('class="percent" x="460"');
    expect(svg).not.toContain("AI tokens");
  });

  it("supports a dark github-readme-stats style theme", () => {
    const svg = renderLanguageCard(archive, { theme: "dark" });

    expect(svg).toContain("Weekly Coding Stats");
    expect(svg).toContain("#141821");
    expect(svg).toContain("#58a6ff");
  });

  it("grows the language card to fit the displayed language rows", () => {
    const svg = renderLanguageCard({
      ...archive,
      languages: [
        ...archive.languages,
        { name: "Markdown", totalSeconds: 3600, percent: 12, text: "1 hr" },
        { name: "Swift", totalSeconds: 2400, percent: 8, text: "40 mins" },
        { name: "Less", totalSeconds: 1800, percent: 6, text: "30 mins" },
      ],
    });

    expect(svg).toContain('height="228"');
    expect(svg).toContain("Markdown");
    expect(svg).toContain("Swift");
    expect(svg).toContain("Less");
  });
});

describe("renderAiStatsCard", () => {
  it("renders weekly AI stats as totals and a single AI share", () => {
    const svg = renderAiStatsCard(archive);

    expect(svg).toContain("Weekly AI Stats");
    expect(svg).toContain('height="228"');
    expect(svg).not.toContain('text-anchor="end">2026-W22</text>');
    expect(svg).toContain("69.44K");
    expect(svg).toContain("$1.24");
    expect(svg).toContain("96");
    expect(svg).toContain("1,764");
    expect(svg).toContain("Total Tokens");
    expect(svg).toContain("AI Cost");
    expect(svg).toContain("AI Prompts");
    expect(svg).toContain("Line Changes");
    expect(svg).toContain("AI Share");
    expect(svg).toContain("20.6%");
    expect(svg).toContain('data-icon="database"');
    expect(svg).toContain('data-icon="dollar-sign"');
    expect(svg).toContain('data-icon="message-circle"');
    expect(svg).toContain('data-icon="code"');
    expect(svg).toContain('width="16" height="16"');
    expect(svg).toContain("stroke-width: 2.4");
    expect(svg).toContain('r="13"');
    expect(svg).toContain('d="m14 4-4 16"');
    expect(svg).toContain("stroke-dasharray");
    expect(svg).not.toContain(">T</text>");
    expect(svg).not.toContain(">P</text>");
    expect(svg).not.toContain(">#</text>");
    expect(svg).not.toContain("Messages");
    expect(svg).not.toContain(">Lines<");
    expect(svg).not.toContain("Human share");
    expect(svg).not.toContain("79.4%");
    expect(svg).not.toContain("AI agents");
    expect(svg).not.toContain("TypeScript");
  });
});
