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

function sumAi(days: WeeklyArchiveDay[]): NormalizedAiTotals {
  const additions = days.reduce((total, day) => total + day.ai.additions, 0);
  const deletions = days.reduce((total, day) => total + day.ai.deletions, 0);
  const humanAdditions = days.reduce((total, day) => total + day.ai.humanAdditions, 0);
  const humanDeletions = days.reduce((total, day) => total + day.ai.humanDeletions, 0);
  const lineChangesTotal = days.reduce((total, day) => total + day.ai.lineChangesTotal, 0);
  const humanLineChangesTotal = days.reduce(
    (total, day) => total + day.ai.humanLineChangesTotal,
    0,
  );
  const allLineChanges = lineChangesTotal + humanLineChangesTotal;
  const aiSharePercent = allLineChanges > 0 ? (lineChangesTotal / allLineChanges) * 100 : 0;
  const agents = new Map<string, NormalizedAiAgent>();

  for (const day of days) {
    for (const agent of day.ai.agents) {
      const existing = agents.get(agent.name);
      agents.set(agent.name, {
        name: agent.name,
        lines: (existing?.lines ?? 0) + agent.lines,
        cost: (existing?.cost ?? 0) + agent.cost,
      });
    }
  }

  return {
    additions,
    deletions,
    humanAdditions,
    humanDeletions,
    lineChangesTotal,
    humanLineChangesTotal,
    aiSharePercent: Number(aiSharePercent.toFixed(1)),
    humanSharePercent: Number((100 - aiSharePercent).toFixed(1)),
    agentTotalCost: days.reduce((total, day) => total + day.ai.agentTotalCost, 0),
    inputTokens: days.reduce((total, day) => total + day.ai.inputTokens, 0),
    outputTokens: days.reduce((total, day) => total + day.ai.outputTokens, 0),
    promptEventsTotal: days.reduce((total, day) => total + day.ai.promptEventsTotal, 0),
    sessions: days.reduce((total, day) => total + day.ai.sessions, 0),
    agents: [...agents.values()].sort((left, right) => right.lines - left.lines),
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

function sumLanguages(days: WeeklyArchiveDay[]): NormalizedLanguage[] {
  const totalSeconds = days.reduce((total, day) => total + day.totalSeconds, 0);
  const languages = new Map<string, number>();

  for (const day of days) {
    for (const language of day.languages) {
      languages.set(language.name, (languages.get(language.name) ?? 0) + language.totalSeconds);
    }
  }

  return [...languages.entries()]
    .map(([name, seconds]) => ({
      name,
      totalSeconds: seconds,
      percent: totalSeconds > 0 ? Number(((seconds / totalSeconds) * 100).toFixed(1)) : 0,
      text: formatDuration(seconds),
    }))
    .sort((left, right) => right.totalSeconds - left.totalSeconds);
}

export function normalizeWakaTimeWeek(
  bundle: WakaTimeBundle,
  options: NormalizeOptions,
): WeeklyArchive {
  const days = (bundle.summaries.data ?? []).map(normalizeDay);
  const totalSeconds = days.reduce((total, day) => total + day.totalSeconds, 0);
  const dailyAverage = days.length > 0 ? totalSeconds / days.length : 0;

  return {
    schemaVersion: 1,
    generatedAt: options.generatedAt,
    week: options.week,
    totals: {
      totalSeconds,
      humanReadable: formatDuration(totalSeconds),
      dailyAverageSeconds: dailyAverage,
      humanReadableDailyAverage: formatDuration(dailyAverage),
    },
    languages: sumLanguages(days),
    ai: sumAi(days),
    days,
  };
}
