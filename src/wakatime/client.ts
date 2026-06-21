import type { WakaTimeStatsResponse, WakaTimeSummariesResponse } from "./types.js";

type FetchLike = typeof fetch;

export interface WakaTimeClientOptions {
  apiKey: string;
  baseUrl?: string;
  fetch?: FetchLike;
}

export interface FetchSummariesOptions {
  start: string;
  end: string;
  timezone?: string;
}

export class WakaTimeClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly fetchImpl: FetchLike;

  constructor(options: WakaTimeClientOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl ?? "https://wakatime.com/api/v1";
    this.fetchImpl = options.fetch ?? fetch;
  }

  fetchStats(range = "last_7_days"): Promise<WakaTimeStatsResponse> {
    return this.request<WakaTimeStatsResponse>(`/users/current/stats/${range}`);
  }

  fetchSummaries(options: FetchSummariesOptions): Promise<WakaTimeSummariesResponse> {
    const params = new URLSearchParams({ start: options.start, end: options.end });
    if (options.timezone) {
      params.set("timezone", options.timezone);
    }
    return this.request<WakaTimeSummariesResponse>(`/users/current/summaries?${params.toString()}`);
  }

  private async request<T>(path: string): Promise<T> {
    const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
      headers: {
        Authorization: `Basic ${Buffer.from(this.apiKey).toString("base64")}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`WakaTime request failed: ${response.status} ${response.statusText}`);
    }

    return (await response.json()) as T;
  }
}
