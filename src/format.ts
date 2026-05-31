export function formatDuration(seconds: number): string {
  const totalMinutes = Math.round(Math.max(0, seconds) / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours} ${hours === 1 ? "hr" : "hrs"}`);
  }
  if (minutes > 0 || parts.length === 0) {
    parts.push(`${minutes} ${minutes === 1 ? "min" : "mins"}`);
  }

  return parts.join(" ");
}

export function formatCompactNumber(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) {
    const millions = value / 1_000_000;
    return `${abs >= 10_000_000 ? Math.round(millions).toString() : millions.toFixed(1)}m`;
  }
  if (abs >= 1_000) {
    const thousands = value / 1_000;
    return `${abs >= 100_000 ? Math.round(thousands).toString() : thousands.toFixed(1)}k`;
  }
  return String(value);
}
