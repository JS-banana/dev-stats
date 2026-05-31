import { formatDuration } from "../format.js";
import type {
  NormalizedAiAgent,
  NormalizedAiTotals,
  NormalizedLanguage,
  WakaTimeAiAgent,
  WakaTimeBundle,
  WakaTimeLanguage,
  WakaTimeStatsData,
  WeeklyArchive,
  WeeklyArchiveDay,
} from "./types.js";
import type { IsoWeekWindow } from "../date/week.js";

export interface NormalizeOptions {
  week: IsoWeekWindow;
  generatedAt: string;
}

function numberValue(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function stringValue(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

function normalizeLanguage(language: WakaTimeLanguage): NormalizedLanguage {
  const totalSeconds = numberValue(language.total_seconds);
  return {
    name: stringValue(language.name, "Unknown"),
    totalSeconds,
    percent: numberValue(language.percent),
    text: stringValue(language.text, formatDuration(totalSeconds)),
  };
}

function normalizeAgent(agent: WakaTimeAiAgent): NormalizedAiAgent {
  return {
    name: stringValue(agent.name, "Unknown"),
    lines: numberValue(agent.lines),
    cost: numberValue(agent.cost),
  };
}

function normalizeAi(data: WakaTimeStatsData | undefined): NormalizedAiTotals {
  const additions = numberValue(data?.ai_additions);
  const deletions = numberValue(data?.ai_deletions);
  const humanAdditions = numberValue(data?.human_additions);
  const humanDeletions = numberValue(data?.human_deletions);
  const lineChangesTotal = numberValue(data?.ai_line_changes_total) || additions + deletions;
  const humanLineChangesTotal = humanAdditions + humanDeletions;
  const allLineChanges = lineChangesTotal + humanLineChangesTotal;
  const aiSharePercent = allLineChanges > 0 ? (lineChangesTotal / allLineChanges) * 100 : 0;

  return {
    additions,
    deletions,
    humanAdditions,
    humanDeletions,
    lineChangesTotal,
    humanLineChangesTotal,
    aiSharePercent: Number(aiSharePercent.toFixed(1)),
    humanSharePercent: Number((100 - aiSharePercent).toFixed(1)),
    agentTotalCost: numberValue(data?.ai_agent_total_cost),
    inputTokens: numberValue(data?.ai_input_tokens),
    outputTokens: numberValue(data?.ai_output_tokens),
    promptEventsTotal: numberValue(data?.ai_prompt_events_total),
    sessions: numberValue(data?.ai_sessions),
    agents: (data?.ai_agent_breakdown ?? []).map(normalizeAgent),
  };
}

function normalizeDay(
  day: NonNullable<WakaTimeBundle["summaries"]["data"]>[number],
): WeeklyArchiveDay {
  const grandTotal = day.grand_total;
  const totalSeconds = numberValue(grandTotal?.total_seconds);
  return {
    date: stringValue(day.range?.date),
    totalSeconds,
    humanReadable: stringValue(grandTotal?.text, formatDuration(totalSeconds)),
    ai: normalizeAi(grandTotal),
    languages: (day.languages ?? []).map(normalizeLanguage),
  };
}

export function normalizeWakaTimeWeek(
  bundle: WakaTimeBundle,
  options: NormalizeOptions,
): WeeklyArchive {
  const stats = bundle.stats.data;
  const totalSeconds = numberValue(stats?.total_seconds);

  return {
    schemaVersion: 1,
    generatedAt: options.generatedAt,
    week: options.week,
    totals: {
      totalSeconds,
      humanReadable: stringValue(stats?.human_readable_total, formatDuration(totalSeconds)),
      dailyAverageSeconds: numberValue(stats?.daily_average),
      humanReadableDailyAverage: stringValue(
        stats?.human_readable_daily_average,
        formatDuration(numberValue(stats?.daily_average)),
      ),
    },
    languages: (stats?.languages ?? []).map(normalizeLanguage),
    ai: normalizeAi(stats),
    days: (bundle.summaries.data ?? []).map(normalizeDay),
  };
}
