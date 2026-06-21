import { describe, expect, it, vi } from "vitest";

import { WakaTimeClient } from "../src/wakatime/client.js";

function mockFetch(response: Response) {
  return vi.fn((() => Promise.resolve(response)) as typeof fetch);
}

describe("WakaTimeClient", () => {
  it("fetches weekly stats with basic auth and range path", async () => {
    const fetchMock = mockFetch(new Response(JSON.stringify({ data: { ok: true } })));
    const client = new WakaTimeClient({ apiKey: "secret", fetch: fetchMock });

    await client.fetchStats("last_7_days");

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(String(url)).toBe("https://wakatime.com/api/v1/users/current/stats/last_7_days");
    expect((init?.headers as Record<string, string>).Authorization).toBe(
      `Basic ${Buffer.from("secret").toString("base64")}`,
    );
  });

  it("fetches summaries with encoded dates and timezone", async () => {
    const fetchMock = mockFetch(new Response(JSON.stringify({ data: [] })));
    const client = new WakaTimeClient({ apiKey: "secret", fetch: fetchMock });

    await client.fetchSummaries({
      start: "2026-05-25",
      end: "2026-05-31",
      timezone: "Asia/Shanghai",
    });

    const [url] = fetchMock.mock.calls[0]!;
    expect(String(url)).toBe(
      "https://wakatime.com/api/v1/users/current/summaries?start=2026-05-25&end=2026-05-31&timezone=Asia%2FShanghai",
    );
  });

  it("does not expose unused user agent fetching", () => {
    const client = new WakaTimeClient({ apiKey: "secret" });

    expect("fetchUserAgents" in client).toBe(false);
  });

  it("throws a readable error when WakaTime returns a non-2xx response", async () => {
    const fetchMock = mockFetch(
      new Response("bad key", { status: 401, statusText: "Unauthorized" }),
    );
    const client = new WakaTimeClient({ apiKey: "secret", fetch: fetchMock });

    await expect(client.fetchStats("last_7_days")).rejects.toThrow(
      "WakaTime request failed: 401 Unauthorized",
    );
  });
});
