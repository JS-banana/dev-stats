import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { runCli } from "../src/cli.js";

describe("runCli", () => {
  it("generates artifacts from a fixture bundle", async () => {
    const root = await mkdtemp(join(tmpdir(), "ai-wakatime-cli-"));

    const result = await runCli([
      "--fixture",
      "tests/fixtures/wakatime-week.json",
      "--root",
      root,
      "--now",
      "2026-05-30T00:00:00.000Z",
    ]);

    expect(result.week.id).toBe("2026-W22");
    await expect(readFile(join(root, "data/2026/05/2026-W22.json"), "utf8")).resolves.toContain(
      '"generatedAt": "2026-05-30T00:00:00.000Z"',
    );
    await expect(readFile(join(root, "assets/wakatime-language.svg"), "utf8")).resolves.toContain(
      "Language coding time",
    );
    await expect(readFile(join(root, "assets/wakatime-ai.svg"), "utf8")).resolves.toContain(
      "AI coding",
    );
  });

  it("fails before network work when no API key is available", async () => {
    await expect(runCli(["--root", "/tmp/noop"], { env: {} })).rejects.toThrow(
      "WAKATIME_API_KEY is required",
    );
  });
});
