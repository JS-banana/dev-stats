import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { renderHtmlPreview } from "../render/html-preview.js";
import { renderAllCards } from "../render/svg-card.js";
import type { WeeklyArchive } from "../wakatime/types.js";

export interface ArchiveWriteResult {
  archivePath: string;
  cards: {
    languagePath: string;
    aiPath: string;
    agentsPath: string;
    languageDarkPath: string;
    aiDarkPath: string;
    agentsDarkPath: string;
  };
  previewPath: string;
}

export async function writeArchiveArtifacts(
  root: string,
  archive: WeeklyArchive,
): Promise<ArchiveWriteResult> {
  const [year, month] = archive.week.start.split("-");
  const dataDir = join(root, "data", year ?? "unknown", month ?? "unknown");
  const assetsDir = join(root, "assets");
  const publicDir = join(root, "public");
  await Promise.all([
    mkdir(dataDir, { recursive: true }),
    mkdir(assetsDir, { recursive: true }),
    mkdir(publicDir, { recursive: true }),
  ]);

  const archivePath = join(dataDir, `${archive.week.id}.json`);
  const languagePath = join(assetsDir, "wakatime-language.svg");
  const aiPath = join(assetsDir, "wakatime-ai.svg");
  const agentsPath = join(assetsDir, "wakatime-agents.svg");
  const languageDarkPath = join(assetsDir, "wakatime-language-dark.svg");
  const aiDarkPath = join(assetsDir, "wakatime-ai-dark.svg");
  const agentsDarkPath = join(assetsDir, "wakatime-agents-dark.svg");
  const previewPath = join(publicDir, "preview.html");
  const cards = renderAllCards(archive);

  await writeFile(archivePath, `${JSON.stringify(archive, null, 2)}\n`);
  await writeFile(languagePath, cards.language);
  await writeFile(aiPath, cards.ai);
  await writeFile(agentsPath, cards.agents);
  await writeFile(languageDarkPath, cards.languageDark);
  await writeFile(aiDarkPath, cards.aiDark);
  await writeFile(agentsDarkPath, cards.agentsDark);
  await writeFile(previewPath, renderHtmlPreview());

  return {
    archivePath,
    cards: { languagePath, aiPath, agentsPath, languageDarkPath, aiDarkPath, agentsDarkPath },
    previewPath,
  };
}
