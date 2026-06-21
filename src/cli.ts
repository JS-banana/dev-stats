import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { writeArchiveArtifacts, type ArchiveWriteResult } from "./archive/write.js";
import { getIsoWeekWindow } from "./date/week.js";
import { WakaTimeClient } from "./wakatime/client.js";
import { normalizeWakaTimeWeek } from "./wakatime/normalize.js";
import type { WakaTimeBundle, WeeklyArchive } from "./wakatime/types.js";

interface CliDependencies {
  env?: NodeJS.ProcessEnv;
  fetch?: typeof fetch;
}

interface CliOptions {
  root: string;
  fixture?: string;
  now: Date;
  timezone?: string;
}

export interface CliRunResult extends ArchiveWriteResult {
  week: WeeklyArchive["week"];
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    root: process.cwd(),
    now: new Date(),
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const value = argv[index + 1];

    if (arg === "--root" && value) {
      options.root = resolve(value);
      index += 1;
    } else if (arg === "--fixture" && value) {
      options.fixture = value;
      index += 1;
    } else if (arg === "--now" && value) {
      options.now = new Date(value);
      index += 1;
    } else if (arg === "--timezone" && value) {
      options.timezone = value;
      index += 1;
    } else if (arg === "--help") {
      throw new Error("Usage: npm run update -- [--timezone Asia/Shanghai] [--fixture path]");
    } else {
      throw new Error(`Unknown or incomplete argument: ${arg ?? ""}`);
    }
  }

  if (Number.isNaN(options.now.getTime())) {
    throw new Error("--now must be a valid date");
  }

  return options;
}

async function readFixture(path: string): Promise<WakaTimeBundle> {
  return JSON.parse(await readFile(path, "utf8")) as WakaTimeBundle;
}

async function fetchBundle(options: CliOptions, deps: CliDependencies): Promise<WakaTimeBundle> {
  if (options.fixture) {
    return readFixture(options.fixture);
  }

  const apiKey = deps.env?.WAKATIME_API_KEY;
  if (!apiKey) {
    throw new Error("WAKATIME_API_KEY is required");
  }

  const week = getIsoWeekWindow(options.now);
  const client = new WakaTimeClient({ apiKey, fetch: deps.fetch });
  const summaries = await client.fetchSummaries({
    start: week.start,
    end: week.end,
    timezone: options.timezone,
  });

  return { summaries };
}

export async function runCli(
  argv = process.argv.slice(2),
  deps: CliDependencies = {},
): Promise<CliRunResult> {
  const options = parseArgs(argv);
  const bundle = await fetchBundle(options, { env: process.env, ...deps });
  const archive = normalizeWakaTimeWeek(bundle, {
    week: getIsoWeekWindow(options.now),
    generatedAt: options.now.toISOString(),
  });
  const result = await writeArchiveArtifacts(options.root, archive);
  return { ...result, week: archive.week };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  runCli()
    .then((result) => {
      console.log(`Updated ${result.week.id}`);
      console.log(result.archivePath);
      console.log(result.cards.languagePath);
      console.log(result.cards.aiPath);
      console.log(result.cards.languageDarkPath);
      console.log(result.cards.aiDarkPath);
      console.log(result.previewPath);
    })
    .catch((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      console.error(message);
      process.exitCode = 1;
    });
}
