import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { writeArchiveArtifacts } from "../src/archive/write.js";
import type { WeeklyArchive } from "../src/wakatime/types.js";

describe("writeArchiveArtifacts", () => {
  it("writes year/month week JSON, multiple SVG cards, and HTML preview", async () => {
    const root = await mkdtemp(join(tmpdir(), "dev-stats-"));
    const archive = {
      schemaVersion: 1,
      generatedAt: "2026-05-30T00:00:00.000Z",
      week: { id: "2026-W22", start: "2026-05-25", end: "2026-05-31" },
      totals: {
        totalSeconds: 3600,
        humanReadable: "1 hr",
        dailyAverageSeconds: 600,
        humanReadableDailyAverage: "10 mins",
      },
      languages: [],
      ai: {
        additions: 0,
        deletions: 0,
        humanAdditions: 0,
        humanDeletions: 0,
        lineChangesTotal: 0,
        humanLineChangesTotal: 0,
        aiSharePercent: 0,
        humanSharePercent: 0,
        agentTotalCost: 0,
        inputTokens: 0,
        outputTokens: 0,
        promptEventsTotal: 0,
        sessions: 0,
        agents: [],
      },
      days: [],
    } satisfies WeeklyArchive;

    const result = await writeArchiveArtifacts(root, archive);

    expect(result.archivePath).toBe(join(root, "data/2026/05/2026-W22.json"));
    expect(result.cards.languagePath).toBe(join(root, "assets/wakatime-language.svg"));
    expect(result.cards.aiPath).toBe(join(root, "assets/wakatime-ai.svg"));
    expect(result.cards.agentsPath).toBe(join(root, "assets/wakatime-agents.svg"));
    expect(result.cards.languageDarkPath).toBe(
      join(root, "assets/wakatime-language-dark.svg"),
    );
    expect(result.cards.aiDarkPath).toBe(join(root, "assets/wakatime-ai-dark.svg"));

    const archiveJson = await readFile(result.archivePath, "utf8");
    expect(archiveJson).toContain('"id": "2026-W22"');
    expect(archiveJson).not.toContain('"raw"');
    expect(archiveJson).not.toContain('"diagnostics"');

    await expect(readFile(result.cards.languagePath, "utf8")).resolves.toContain(
      "Language coding time",
    );
    await expect(readFile(result.cards.aiPath, "utf8")).resolves.toContain("AI coding");
    await expect(readFile(result.cards.agentsPath, "utf8")).resolves.toContain("AI agents");
    await expect(readFile(result.cards.languageDarkPath, "utf8")).resolves.toContain("#1a1b27");
    await expect(readFile(result.previewPath, "utf8")).resolves.toContain("wakatime-language.svg");
    await expect(readFile(result.previewPath, "utf8")).resolves.toContain("wakatime-ai.svg");
    await expect(readFile(result.previewPath, "utf8")).resolves.toContain(
      "wakatime-language-dark.svg",
    );
  });
});
