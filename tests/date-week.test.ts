import { describe, expect, it } from "vitest";

import { getIsoWeekWindow } from "../src/date/week.js";

describe("getIsoWeekWindow", () => {
  it("returns ISO week metadata for a middle-of-week date", () => {
    expect(getIsoWeekWindow(new Date("2026-05-30T12:00:00Z"))).toEqual({
      id: "2026-W22",
      start: "2026-05-25",
      end: "2026-05-31",
    });
  });

  it("keeps ISO week year when the calendar year changes", () => {
    expect(getIsoWeekWindow(new Date("2026-01-01T12:00:00Z"))).toEqual({
      id: "2026-W01",
      start: "2025-12-29",
      end: "2026-01-04",
    });
  });
});
