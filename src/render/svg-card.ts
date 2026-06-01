import { formatCompactNumber } from "../format.js";
import type { NormalizedAiAgent, WeeklyArchive } from "../wakatime/types.js";

const WIDTH = 495;
const LEFT = 25;
const BAR_X = 165;
const BAR_WIDTH = 210;
const VALUE_X = 455;

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
  accents: string[];
}

const THEMES: Record<CardThemeName, CardTheme> = {
  light: {
    card: "#fffefe",
    border: "#d8dee4",
    shadow: "#1b1f24",
    shadowOpacity: "0.12",
    title: "#0969da",
    text: "#24292f",
    muted: "#57606a",
    barBg: "#eaeef2",
    accents: ["#0969da", "#1a7f37", "#bc4c00", "#8250df", "#bf3989"],
  },
  dark: {
    card: "#1a1b27",
    border: "#30363d",
    shadow: "#000000",
    shadowOpacity: "0.22",
    title: "#70a5fd",
    text: "#c9d1d9",
    muted: "#8b949e",
    barBg: "#2f3549",
    accents: ["#70a5fd", "#3fb950", "#f0883e", "#a371f7", "#db61a2"],
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
  subtitle: string,
  height: number,
  body: string,
  options?: CardRenderOptions,
): string {
  const theme = resolveTheme(options);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(title)}</title>
  <desc id="desc">${escapeXml(subtitle)}</desc>
  <defs>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="120%">
      <feDropShadow dx="0" dy="1" stdDeviation="1.2" flood-color="${theme.shadow}" flood-opacity="${theme.shadowOpacity}" />
    </filter>
  </defs>
  <style>
    .card { fill: ${theme.card}; stroke: ${theme.border}; filter: url(#shadow); }
    .title { font: 600 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; fill: ${theme.title}; }
    .subtle { font: 400 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; fill: ${theme.muted}; }
    .label { font: 600 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; fill: ${theme.text}; }
    .value { font: 600 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; fill: ${theme.muted}; font-variant-numeric: tabular-nums; }
    .metric { font: 700 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; fill: ${theme.text}; font-variant-numeric: tabular-nums; }
    .metric-label { font: 600 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; fill: ${theme.muted}; text-transform: uppercase; letter-spacing: 0.04em; }
    .bar-bg { fill: ${theme.barBg}; }
    .blue { fill: ${theme.accents[0]}; }
    .green { fill: ${theme.accents[1]}; }
    .orange { fill: ${theme.accents[2]}; }
    .purple { fill: ${theme.accents[3]}; }
    .pink { fill: ${theme.accents[4]}; }
  </style>
  <rect class="card" x="0.5" y="0.5" width="${WIDTH - 1}" height="${height - 1}" rx="6" />
  <text class="title" x="${LEFT}" y="34">${escapeXml(title)}</text>
  <text class="subtle" x="${LEFT}" y="55">${escapeXml(subtitle)}</text>
  ${body}
</svg>
`;
}

function colorClass(index: number): string {
  return ["blue", "green", "orange", "purple", "pink"][index % 5]!;
}

function progressRow(
  label: string,
  value: string,
  percent: number,
  y: number,
  index: number,
  options: { barX?: number; barWidth?: number; valueX?: number } = {},
): string {
  const localBarX = options.barX ?? BAR_X;
  const localBarWidth = options.barWidth ?? BAR_WIDTH;
  const localValueX = options.valueX ?? VALUE_X;
  const width = Math.max(2, Math.round((clampPercent(percent) / 100) * localBarWidth));
  return `
  <g transform="translate(0 ${y})">
    <text class="label" x="${LEFT}" y="0">${escapeXml(label)}</text>
    <rect class="bar-bg" x="${localBarX}" y="-10" width="${localBarWidth}" height="8" rx="4" />
    <rect class="${colorClass(index)}" x="${localBarX}" y="-10" width="${width}" height="8" rx="4" />
    <text class="value" x="${localValueX}" y="0" text-anchor="end">${escapeXml(value)}</text>
  </g>`;
}

export function renderLanguageCard(archive: WeeklyArchive, options?: CardRenderOptions): string {
  const theme = resolveTheme(options);
  const languages = archive.languages.slice(0, 5);
  const height = Math.max(220, 104 + languages.length * 30 + 44);
  const rows = languages
    .map((language, index) =>
      progressRow(
        language.name,
        `${language.text} ${language.percent.toFixed(1)}%`,
        language.percent,
        92 + index * 30,
        index,
      ),
    )
    .join("");

  return cardShell(
    "Language coding time",
    `${archive.week.id} · ${archive.totals.humanReadable}`,
    height,
    `${rows}
  <line x1="${LEFT}" y1="${height - 38}" x2="${WIDTH - LEFT}" y2="${height - 38}" stroke="${theme.border}" />
  <text class="subtle" x="${LEFT}" y="${height - 17}">Daily average: ${escapeXml(archive.totals.humanReadableDailyAverage)}</text>`,
    options,
  );
}

export function renderAiCodingCard(archive: WeeklyArchive, options?: CardRenderOptions): string {
  const input = `${formatCompactNumber(archive.ai.inputTokens)} input`;
  const output = `${formatCompactNumber(archive.ai.outputTokens)} output`;
  const totalTokenPercent =
    archive.ai.inputTokens + archive.ai.outputTokens > 0
      ? (archive.ai.outputTokens / (archive.ai.inputTokens + archive.ai.outputTokens)) * 100
      : 0;

  return cardShell(
    "AI coding",
    `${archive.week.id} · tokens, prompts, and coding share`,
    270,
    `
  <g transform="translate(${LEFT} 92)">
    <text class="metric-label" x="0" y="0">AI tokens</text>
    <text class="metric" x="0" y="27">${escapeXml(input)}</text>
    <text class="subtle" x="0" y="47">${escapeXml(output)}</text>
  </g>
  <g transform="translate(265 92)">
    <text class="metric-label" x="0" y="0">Activity</text>
    <text class="metric" x="0" y="27">${archive.ai.promptEventsTotal} prompts</text>
    <text class="subtle" x="0" y="47">${archive.ai.sessions} sessions · $${archive.ai.agentTotalCost.toFixed(2)}</text>
  </g>
  ${progressRow("AI share", `${archive.ai.aiSharePercent.toFixed(1)}%`, archive.ai.aiSharePercent, 176, 0, { barX: 155, barWidth: 245, valueX: 455 })}
  ${progressRow("Human share", `${archive.ai.humanSharePercent.toFixed(1)}%`, archive.ai.humanSharePercent, 209, 1, { barX: 155, barWidth: 245, valueX: 455 })}
  ${progressRow("Output token share", `${totalTokenPercent.toFixed(1)}%`, totalTokenPercent, 242, 3, { barX: 155, barWidth: 245, valueX: 455 })}`,
    options,
  );
}

function agentRow(agent: NormalizedAiAgent, totalLines: number, index: number): string {
  const percent = totalLines > 0 ? (agent.lines / totalLines) * 100 : 0;
  return progressRow(
    agent.name,
    `${agent.lines} lines · $${agent.cost.toFixed(2)}`,
    percent,
    92 + index * 32,
    index,
  );
}

export function renderAgentsCard(archive: WeeklyArchive, options?: CardRenderOptions): string {
  const agents = archive.ai.agents.slice(0, 5);
  const height = Math.max(190, 104 + agents.length * 32 + 28);
  const totalLines = archive.ai.agents.reduce((sum, agent) => sum + agent.lines, 0);
  const body = agents.length
    ? agents.map((agent, index) => agentRow(agent, totalLines, index)).join("")
    : `<text class="subtle" x="${LEFT}" y="98">No AI agent breakdown available.</text>`;

  return cardShell(
    "AI agents",
    `${archive.week.id} · generated line changes by agent`,
    height,
    body,
    options,
  );
}

export function renderAllCards(archive: WeeklyArchive): Record<string, string> {
  return {
    language: renderLanguageCard(archive),
    ai: renderAiCodingCard(archive),
    agents: renderAgentsCard(archive),
    languageDark: renderLanguageCard(archive, { theme: "dark" }),
    aiDark: renderAiCodingCard(archive, { theme: "dark" }),
    agentsDark: renderAgentsCard(archive, { theme: "dark" }),
  };
}
