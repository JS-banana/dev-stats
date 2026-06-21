import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

import { normalizeWakaTimeWeek } from "../src/wakatime/normalize.js";
import type { WakaTimeBundle } from "../src/wakatime/types.js";

async function readFixture(): Promise<WakaTimeBundle> {
  return JSON.parse(await readFile("tests/fixtures/wakatime-week.json", "utf8")) as WakaTimeBundle;
}

describe("normalizeWakaTimeWeek", () => {
  it("aggregates weekly totals from ISO week summaries", async () => {
    const normalized = normalizeWakaTimeWeek(await readFixture(), {
      week: { id: "2026-W22", start: "2026-05-25", end: "2026-05-31" },
      generatedAt: "2026-05-30T00:00:00.000Z",
    });

    expect(normalized.week.id).toBe("2026-W22");
    expect(normalized.totals).toEqual({
      totalSeconds: 9000,
      humanReadable: "2 hrs 30 mins",
      dailyAverageSeconds: 4500,
      humanReadableDailyAverage: "1 hr 15 mins",
    });
    expect(normalized.languages).toEqual([
      { name: "Markdown", totalSeconds: 5400, percent: 60, text: "1 hr 30 mins" },
      { name: "TypeScript", totalSeconds: 3600, percent: 40, text: "1 hr" },
    ]);
    expect(normalized.ai).toEqual({
      additions: 120,
      deletions: 15,
      humanAdditions: 0,
      humanDeletions: 0,
      lineChangesTotal: 135,
      humanLineChangesTotal: 0,
      aiSharePercent: 100,
      humanSharePercent: 0,
      agentTotalCost: 0,
      inputTokens: 3500,
      outputTokens: 9000,
      promptEventsTotal: 20,
      sessions: 5,
      agents: [],
    });
    expect(normalized.days).toHaveLength(2);
    expect(normalized).not.toHaveProperty("raw");
    expect(normalized).not.toHaveProperty("diagnostics");
  });

  it("combines repeated languages and recomputes weekly percentages", () => {
    const normalized = normalizeWakaTimeWeek(
      {
        stats: { data: { total_seconds: 999999, languages: [] } },
        summaries: {
          data: [
            {
              range: { date: "2026-05-25" },
              grand_total: { total_seconds: 3600, text: "1 hr" },
              languages: [
                { name: "TypeScript", total_seconds: 1800, percent: 50, text: "30 mins" },
                { name: "Markdown", total_seconds: 1800, percent: 50, text: "30 mins" },
              ],
            },
            {
              range: { date: "2026-05-26" },
              grand_total: { total_seconds: 7200, text: "2 hrs" },
              languages: [
                { name: "TypeScript", total_seconds: 5400, percent: 75, text: "1 hr 30 mins" },
                { name: "JSON", total_seconds: 1800, percent: 25, text: "30 mins" },
              ],
            },
          ],
        },
      },
      {
        week: { id: "2026-W22", start: "2026-05-25", end: "2026-05-31" },
        generatedAt: "2026-05-30T00:00:00.000Z",
      },
    );

    expect(normalized.totals.totalSeconds).toBe(10800);
    expect(normalized.languages).toEqual([
      { name: "TypeScript", totalSeconds: 7200, percent: 66.7, text: "2 hrs" },
      { name: "Markdown", totalSeconds: 1800, percent: 16.7, text: "30 mins" },
      { name: "JSON", totalSeconds: 1800, percent: 16.7, text: "30 mins" },
    ]);
  });
});
