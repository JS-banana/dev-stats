import { describe, expect, it } from "vitest";

import { renderHtmlPreview } from "../src/render/html-preview.js";

describe("renderHtmlPreview", () => {
  it("orders cards as light left and dark right in the two-column preview", () => {
    const html = renderHtmlPreview();
    const files = [...html.matchAll(/src="\.\.\/assets\/([^"]+)"/g)].map((match) => match[1]);

    expect(files).toEqual([
      "wakatime-language.svg",
      "wakatime-language-dark.svg",
      "wakatime-ai.svg",
      "wakatime-ai-dark.svg",
    ]);
    expect(html).toContain("grid-template-columns: repeat(2, minmax(0, 1fr));");
    expect(html).toContain("@media (max-width: 760px)");
    expect(html).toContain("grid-template-columns: 1fr;");
  });
});
