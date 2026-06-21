import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

describe("project configuration", () => {
  it("does not format ignored docs globs", async () => {
    const packageJson = JSON.parse(await readFile("package.json", "utf8")) as {
      scripts: Record<string, string>;
    };

    expect(packageJson.scripts.format).not.toContain("docs/**/*.md");
    expect(packageJson.scripts["format:check"]).not.toContain("docs/**/*.md");
  });

  it("does not require ignored docs as mandatory agent context", async () => {
    const agents = await readFile("AGENTS.md", "utf8");

    expect(agents).not.toContain("docs/context/project-context.md");
    expect(agents).not.toContain("docs/research/wakatime-api-research.md");
    expect(agents).not.toContain("docs/plan/development-plan.md");
  });
});
