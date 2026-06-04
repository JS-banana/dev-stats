const CARD_FILES = [
  "wakatime-language.svg",
  "wakatime-language-dark.svg",
  "wakatime-ai.svg",
  "wakatime-ai-dark.svg",
];

export function renderHtmlPreview(cardFiles = CARD_FILES): string {
  const cards = cardFiles
    .map(
      (file) => `
        <img src="../assets/${file}" alt="${file.replace(".svg", "")}" />`,
    )
    .join("");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Dev Stats Preview</title>
    <style>
      :root {
        color-scheme: light;
      }
      body {
        margin: 0;
        min-height: 100vh;
        background: #f6f8fa;
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      main {
        width: min(94vw, 1030px);
        margin: 0 auto;
        padding: 40px 0;
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 18px;
        align-items: start;
      }
      img {
        display: block;
        width: 100%;
        height: auto;
      }
      @media (max-width: 760px) {
        main {
          grid-template-columns: 1fr;
        }
      }
    </style>
  </head>
  <body>
    <main>
      ${cards}
    </main>
  </body>
</html>
`;
}
