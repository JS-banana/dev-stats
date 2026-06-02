import { formatTokenCount } from "../format.js";
import type { WeeklyArchive } from "../wakatime/types.js";

const WIDTH = 495;
const LEFT = 25;
const LANGUAGE_TIME_X = 138;
const LANGUAGE_BAR_X = 236;
const LANGUAGE_BAR_WIDTH = 150;
const LANGUAGE_PERCENT_X = 460;
const AI_LABEL_X = 70;
const AI_VALUE_X = 252;
const AI_RING_CX = 382;
const AI_RING_CY = 122;
const AI_RING_RADIUS = 48;

export type CardThemeName = "light" | "dark";

export interface CardRenderOptions {
  theme?: CardThemeName;
}

interface CardTheme {
  card: string;
  border: string;
  shadow: string;
  shadowOpacity: string;
  title: string;
  text: string;
  muted: string;
  barBg: string;
  badgeText: string;
  ringBg: string;
  accents: string[];
}

const THEMES: Record<CardThemeName, CardTheme> = {
  light: {
    card: "#fffefe",
    border: "#d8dee4",
    shadow: "#1b1f24",
    shadowOpacity: "0.12",
    title: "#24292f",
    text: "#24292f",
    muted: "#57606a",
    barBg: "#eaeef2",
    badgeText: "#ffffff",
    ringBg: "#eaeef2",
    accents: ["#2f81f7", "#2da44e", "#d29922", "#8250df", "#bf3989"],
  },
  dark: {
    card: "#141821",
    border: "#30363d",
    shadow: "#000000",
    shadowOpacity: "0.22",
    title: "#f0f3f6",
    text: "#c9d1d9",
    muted: "#8b949e",
    barBg: "#2f3549",
    badgeText: "#ffffff",
    ringBg: "#2f3549",
    accents: ["#58a6ff", "#56d364", "#f2cc60", "#a371f7", "#db61a2"],
  },
};

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function resolveTheme(options: CardRenderOptions | undefined): CardTheme {
  return THEMES[options?.theme ?? "light"];
}

function cardShell(
  title: string,
  description: string,
  height: number,
  body: string,
  options?: CardRenderOptions,
): string {
  const theme = resolveTheme(options);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(title)}</title>
  <desc id="desc">${escapeXml(description)}</desc>
  <defs>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="120%">
      <feDropShadow dx="0" dy="1" stdDeviation="1.2" flood-color="${theme.shadow}" flood-opacity="${theme.shadowOpacity}" />
    </filter>
  </defs>
  <style>
    .card { fill: ${theme.card}; stroke: ${theme.border}; filter: url(#shadow); }
    .title { font: 600 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; fill: ${theme.title}; }
    .label { font: 600 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; fill: ${theme.text}; }
    .time { font: 600 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; fill: ${theme.muted}; font-variant-numeric: tabular-nums; }
    .percent { font: 600 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; fill: ${theme.muted}; font-variant-numeric: tabular-nums; }
    .metric-row-label { font: 600 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; fill: ${theme.text}; }
    .metric-row-value { font: 700 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; fill: ${theme.text}; font-variant-numeric: tabular-nums; }
    .badge-symbol { font: 700 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; fill: ${theme.badgeText}; text-anchor: middle; dominant-baseline: central; }
    .ring-value { font: 700 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; fill: ${theme.text}; text-anchor: middle; font-variant-numeric: tabular-nums; }
    .ring-label { font: 600 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; fill: ${theme.muted}; text-anchor: middle; text-transform: uppercase; letter-spacing: 0.04em; }
    .bar-bg { fill: ${theme.barBg}; }
    .blue { fill: ${theme.accents[0]}; }
    .green { fill: ${theme.accents[1]}; }
    .orange { fill: ${theme.accents[2]}; }
    .purple { fill: ${theme.accents[3]}; }
    .pink { fill: ${theme.accents[4]}; }
  </style>
  <rect class="card" x="0.5" y="0.5" width="${WIDTH - 1}" height="${height - 1}" rx="6" />
  <text class="title" x="${LEFT}" y="34">${escapeXml(title)}</text>
  ${body}
</svg>
`;
}

function colorClass(index: number): string {
  return ["blue", "green", "orange", "purple", "pink"][index % 5]!;
}

function languageRow(
  label: string,
  time: string,
  percent: number,
  y: number,
  index: number,
): string {
  const width = Math.max(2, Math.round((clampPercent(percent) / 100) * LANGUAGE_BAR_WIDTH));
  return `
  <g transform="translate(0 ${y})">
    <text class="label" x="${LEFT}" y="0">${escapeXml(label)}</text>
    <text class="time" x="${LANGUAGE_TIME_X}" y="0">${escapeXml(time)}</text>
    <rect class="bar-bg" x="${LANGUAGE_BAR_X}" y="-10" width="${LANGUAGE_BAR_WIDTH}" height="8" rx="4" />
    <rect class="${colorClass(index)}" x="${LANGUAGE_BAR_X}" y="-10" width="${width}" height="8" rx="4" />
    <text class="percent" x="${LANGUAGE_PERCENT_X}" y="0" text-anchor="end">${percent.toFixed(1)}%</text>
  </g>`;
}

function metricRow(label: string, value: string, y: number, index: number, symbol: string): string {
  return `
  <g transform="translate(0 ${y})">
    <circle class="${colorClass(index)}" cx="${LEFT + 14}" cy="-5" r="10" />
    <text class="badge-symbol" x="${LEFT + 14}" y="-5">${escapeXml(symbol)}</text>
    <text class="metric-row-label" x="${AI_LABEL_X}" y="0">${escapeXml(label)}</text>
    <text class="metric-row-value" x="${AI_VALUE_X}" y="0" text-anchor="end">${escapeXml(value)}</text>
  </g>`;
}

function formatInteger(value: number): string {
  return Math.round(Math.max(0, value)).toLocaleString("en-US");
}

function formatCost(value: number): string {
  return `$${Math.max(0, value).toFixed(2)}`;
}

function donutChart(percent: number, theme: CardTheme): string {
  const value = clampPercent(percent);
  const circumference = Number((2 * Math.PI * AI_RING_RADIUS).toFixed(2));
  const strokeLength = Number(((value / 100) * circumference).toFixed(2));

  return `
  <g>
    <circle cx="${AI_RING_CX}" cy="${AI_RING_CY}" r="${AI_RING_RADIUS}" fill="none" stroke="${theme.ringBg}" stroke-width="12" />
    <circle cx="${AI_RING_CX}" cy="${AI_RING_CY}" r="${AI_RING_RADIUS}" fill="none" stroke="${theme.accents[0]}" stroke-linecap="round" stroke-width="12" stroke-dasharray="${strokeLength} ${circumference}" transform="rotate(-90 ${AI_RING_CX} ${AI_RING_CY})" />
    <text class="ring-value" x="${AI_RING_CX}" y="${AI_RING_CY - 2}">${value.toFixed(1)}%</text>
    <text class="ring-label" x="${AI_RING_CX}" y="${AI_RING_CY + 21}">AI Share</text>
  </g>`;
}

export function renderLanguageCard(archive: WeeklyArchive, options?: CardRenderOptions): string {
  const languages = archive.languages.slice(0, 5);
  const height = Math.max(168, 78 + languages.length * 30);
  const rows = languages
    .map((language, index) =>
      languageRow(language.name, language.text, language.percent, 76 + index * 30, index),
    )
    .join("");

  return cardShell(
    "Weekly Coding Stats",
    `${archive.week.id} language coding time`,
    height,
    rows,
    options,
  );
}

export function renderAiStatsCard(archive: WeeklyArchive, options?: CardRenderOptions): string {
  const theme = resolveTheme(options);
  const totalTokens = archive.ai.inputTokens + archive.ai.outputTokens;
  const totalLines = archive.ai.lineChangesTotal + archive.ai.humanLineChangesTotal;
  const rows = [
    metricRow("Total Tokens", formatTokenCount(totalTokens), 77, 0, "T"),
    metricRow("AI Cost", formatCost(archive.ai.agentTotalCost), 113, 1, "$"),
    metricRow("AI Prompts", formatInteger(archive.ai.promptEventsTotal), 149, 2, "P"),
    metricRow("Line Changes", formatInteger(totalLines), 185, 3, "#"),
    donutChart(archive.ai.aiSharePercent, theme),
  ].join("");

  return cardShell(
    "Weekly AI Stats",
    `${archive.week.id} AI totals and coding share`,
    228,
    rows,
    options,
  );
}

export function renderAllCards(archive: WeeklyArchive): Record<string, string> {
  return {
    language: renderLanguageCard(archive),
    ai: renderAiStatsCard(archive),
    languageDark: renderLanguageCard(archive, { theme: "dark" }),
    aiDark: renderAiStatsCard(archive, { theme: "dark" }),
  };
}
