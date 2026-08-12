// Builds assets/og.png, the social preview card, from the same wordmark, node
// glyph and gradient the TUI uses, so a shared link and `dabn up` show the same
// thing. The constants below are copied verbatim from the dabn repository, at
// crates/dabn-cli/src/banner.rs; re-copy them if that file changes.
//
// Regenerate (writes og.html here, then rasterises it at 2x):
//
//   node _tools/og/build-og.js
//   "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
//     --headless=new --disable-gpu --hide-scrollbars \
//     --force-device-scale-factor=2 --window-size=1200,630 \
//     --screenshot=assets/og.png "file://$PWD/_tools/og/og.html"
//
// This directory starts with an underscore and is listed in _config.yml's
// exclude, so Jekyll does not publish it.
const fs = require('fs');
const path = require('path');

// --- verbatim from banner.rs ---
const WORD = [
  '██████╗  █████╗ ██████╗ ███╗   ██╗',
  '██╔══██╗██╔══██╗██╔══██╗████╗  ██║',
  '██║  ██║███████║██████╔╝██╔██╗ ██║',
  '██║  ██║██╔══██║██╔══██╗██║╚██╗██║',
  '██████╔╝██║  ██║██████╔╝██║ ╚████║',
  '╚═════╝ ╚═╝  ╚═╝╚═════╝ ╚═╝  ╚═══╝',
];
const GLYPH = [
  ' ●   ● ',
  '  ╲ ╱  ',
  '●──●──●',
  '  ╱ ╲  ',
  ' ●   ● ',
  '       ',
];

const chars = (s) => [...s].length;
const ww = Math.max(...WORD.map(chars));
const gw = Math.max(...GLYPH.map(chars));
const total = Math.max(ww + 2 + gw, 2);

// grad(): #2f6bff -> #22d3ee, same lerp as the Rust
function grad(t) {
  t = Math.min(1, Math.max(0, t));
  const l = (a, b) => Math.round(a + (b - a) * t);
  return `rgb(${l(47, 34)},${l(107, 211)},${l(255, 238)})`;
}

const pad = (s, w) => s + ' '.repeat(Math.max(0, w - chars(s)));

// One span per character, coloured by its column, exactly as render() does.
function bannerHtml() {
  return WORD.map((_, row) => {
    const line = `${pad(WORD[row], ww)}  ${pad(GLYPH[row], gw)}`;
    return [...line]
      .map((ch, i) =>
        ch === ' '
          ? ' '
          : `<span style="color:${grad(i / (total - 1))}">${
              ch === '<' ? '&lt;' : ch === '&' ? '&amp;' : ch
            }</span>`
      )
      .join('');
  }).join('\n');
}

const html = `<!doctype html>
<html><head><meta charset="utf-8"><style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1200px; height: 630px; }
  body {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 40px;
    background:
      radial-gradient(circle at 78% 8%, rgba(20, 184, 255, 0.10), transparent 30rem),
      linear-gradient(180deg, #090e14 0, #080c11 100%);
    font-family: Menlo, "SF Mono", Monaco, monospace;
    -webkit-font-smoothing: antialiased;
  }
  /* line-height 1 so the block rows meet and the box rules join up */
  pre.banner {
    font-size: 41px;
    line-height: 1;
    letter-spacing: 0;
    white-space: pre;
  }
  .rule {
    width: 1062px;
    height: 1px;
    background: linear-gradient(90deg, rgba(47,107,255,0.55), rgba(34,211,238,0.55));
  }
  .sub {
    color: #dbe6f0;
    font-size: 27px;
    letter-spacing: 0.10em;
  }
  .tag {
    color: #8593a1;
    font-size: 18px;
    letter-spacing: 0.06em;
  }
</style></head>
<body>
  <pre class="banner">${bannerHtml()}</pre>
  <div class="rule"></div>
  <div class="sub">Distributed Agent Backup Network</div>
  <div class="tag">Encrypted fragments. Witnessed custody. Local trust.</div>
</body></html>`;

fs.writeFileSync(path.join(__dirname, 'og.html'), html);
console.log(`wordmark ${ww} cols, glyph ${gw} cols, ${total} total`);
