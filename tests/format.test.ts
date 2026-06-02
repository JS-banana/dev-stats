import { describe, expect, it } from "vitest";

import { formatCompactNumber, formatDuration, formatTokenCount } from "../src/format.js";

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

describe("formatTokenCount", () => {
  it("formats tokens with AI platform units", () => {
    expect(formatTokenCount(999)).toBe("999");
    expect(formatTokenCount(4_750)).toBe("4.75K");
    expect(formatTokenCount(1_250_000)).toBe("1.25M");
    expect(formatTokenCount(129_771_424)).toBe("129.77M");
    expect(formatTokenCount(1_950_000_000)).toBe("1.95B");
    expect(formatTokenCount(2_000_000)).toBe("2M");
  });
});
