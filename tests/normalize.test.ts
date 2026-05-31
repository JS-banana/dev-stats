import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

import { normalizeWakaTimeWeek } from "../src/wakatime/normalize.js";
import type { WakaTimeBundle } from "../src/wakatime/types.js";

async function readFixture(): Promise<WakaTimeBundle> {
  return JSON.parse(await readFile("tests/fixtures/wakatime-week.json", "utf8")) as WakaTimeBundle;
}

describe("normalizeWakaTimeWeek", () => {
  it("keeps weekly language and AI totals in a stable archive shape", async () => {
    const normalized = normalizeWakaTimeWeek(await readFixture(), {
      week: { id: "2026-W22", start: "2026-05-25", end: "2026-05-31" },
      generatedAt: "2026-05-30T00:00:00.000Z",
    });

    expect(normalized.week.id).toBe("2026-W22");
    expect(normalized.totals.humanReadable).toBe("7 hrs 49 mins");
    expect(normalized.languages[0]).toEqual({
      name: "TypeScript",
      totalSeconds: 14280,
      percent: 50.75,
      text: "3 hrs 58 mins",
    });
    expect(normalized.ai).toEqual({
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
      agents: [
        { name: "Claude Code", lines: 260, cost: 0.8 },
        { name: "Codex", lines: 104, cost: 0.44 },
      ],
    });
    expect(normalized.days).toHaveLength(2);
    expect(normalized).not.toHaveProperty("raw");
    expect(normalized).not.toHaveProperty("diagnostics");
  });
});
