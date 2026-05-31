import type { IsoWeekWindow } from "../date/week.js";

export interface WakaTimeLanguage {
  name?: string;
  total_seconds?: number;
  percent?: number;
  text?: string;
  hours?: number;
  minutes?: number;
}

export interface WakaTimeAiAgent {
  name?: string;
  lines?: number;
  cost?: number;
}

export interface WakaTimeStatsData {
  range?: string;
  is_up_to_date?: boolean;
  total_seconds?: number;
  human_readable_total?: string;
  daily_average?: number;
  human_readable_daily_average?: string;
  ai_additions?: number;
  ai_deletions?: number;
  human_additions?: number;
  human_deletions?: number;
  ai_line_changes_total?: number;
  ai_agent_total_cost?: number;
  ai_input_tokens?: number;
  ai_output_tokens?: number;
  ai_prompt_events_total?: number;
  ai_sessions?: number;
  ai_agent_breakdown?: WakaTimeAiAgent[];
  languages?: WakaTimeLanguage[];
}

export interface WakaTimeStatsResponse {
  data?: WakaTimeStatsData;
}

export interface WakaTimeSummaryDay {
  range?: {
    date?: string;
  };
  grand_total?: WakaTimeStatsData & {
    text?: string;
  };
  languages?: WakaTimeLanguage[];
}

export interface WakaTimeSummariesResponse {
  data?: WakaTimeSummaryDay[];
}

export interface WakaTimeUserAgent {
  id?: string;
  value?: string;
  editor?: string;
  version?: string;
  os?: string;
  last_seen_at?: string;
  is_browser_extension?: boolean;
  is_desktop_app?: boolean;
  created_at?: string;
}

export interface WakaTimeUserAgentsResponse {
  data?: WakaTimeUserAgent[];
}

export interface WakaTimeBundle {
  stats: WakaTimeStatsResponse;
  summaries: WakaTimeSummariesResponse;
  userAgents?: WakaTimeUserAgentsResponse;
}

export interface NormalizedLanguage {
  name: string;
  totalSeconds: number;
  percent: number;
  text: string;
}

export interface NormalizedAiAgent {
  name: string;
  lines: number;
  cost: number;
}

export interface NormalizedAiTotals {
  additions: number;
  deletions: number;
  humanAdditions: number;
  humanDeletions: number;
  lineChangesTotal: number;
  humanLineChangesTotal: number;
  aiSharePercent: number;
  humanSharePercent: number;
  agentTotalCost: number;
  inputTokens: number;
  outputTokens: number;
  promptEventsTotal: number;
  sessions: number;
  agents: NormalizedAiAgent[];
}

export interface WeeklyArchiveDay {
  date: string;
  totalSeconds: number;
  humanReadable: string;
  ai: NormalizedAiTotals;
  languages: NormalizedLanguage[];
}

export interface WeeklyArchive {
  schemaVersion: 1;
  generatedAt: string;
  week: IsoWeekWindow;
  totals: {
    totalSeconds: number;
    humanReadable: string;
    dailyAverageSeconds: number;
    humanReadableDailyAverage: string;
  };
  languages: NormalizedLanguage[];
  ai: NormalizedAiTotals;
  days: WeeklyArchiveDay[];
}
