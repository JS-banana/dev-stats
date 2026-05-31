import { describe, expect, it } from "vitest";

import { formatCompactNumber, formatDuration } from "../src/format.js";

describe("formatDuration", () => {
  it("formats seconds as compact hours and minutes", () => {
    expect(formatDuration(11_280)).toBe("3 hrs 8 mins");
    expect(formatDuration(3_600)).toBe("1 hr");
    expect(formatDuration(420)).toBe("7 mins");
  });
});

describe("formatCompactNumber", () => {
  it("formats large integers for card display", () => {
    expect(formatCompactNumber(999)).toBe("999");
    expect(formatCompactNumber(1_250)).toBe("1.3k");
    expect(formatCompactNumber(1_999_999)).toBe("2.0m");
    expect(formatCompactNumber(129_324_252)).toBe("129m");
    expect(formatCompactNumber(724_338)).toBe("724k");
  });
});
