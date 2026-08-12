// Builds assets/og.png, the social preview card, from the same wordmark and
// gradient the TUI prints, so a shared link and `dabn up` look like the same
// product. WORD and grad() are copied verbatim from the dabn repository, at
// crates/dabn-cli/src/banner.rs; re-copy them if that file changes.
//
// Two deliberate departures from the terminal rendering:
//
//   * The node glyph that sits beside the wordmark in the TUI is left off, so
//     the gradient is spread across the wordmark's own columns. banner.rs
//     divides by the width of the wordmark plus the glyph, which here would
//     stop the ramp partway and end on a mid-blue instead of cyan.
//   * SCALE_Y stretches the rows. A terminal cell is taller than it is wide,
//     but CSS line-height only adds leading, which would pull the block rows
//     apart; scaling the glyphs keeps them touching at terminal proportions.
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

// grad(): #2f6bff -> #22d3ee, same lerp as the Rust
function grad(t) {
  t = Math.min(1, Math.max(0, t));
  const l = (a, b) => Math.round(a + (b - a) * t);
  return `rgb(${l(47, 34)},${l(107, 211)},${l(255, 238)})`;
}

const chars = (s) => [...s].length;
const cols = Math.max(...WORD.map(chars));
const pad = (s, w) => s + ' '.repeat(Math.max(0, w - chars(s)));

const FONT = 48; // px
const SCALE_Y = 1.17; // terminal cell proportions, see above
const ADVANCE = 0.6022; // Menlo advance width, in em
const width = Math.round(cols * FONT * ADVANCE);
const height = Math.round(WORD.length * FONT * SCALE_Y);

// One span per character, coloured by its column.
const banner = WORD.map((row) =>
  [...pad(row, cols)]
    .map((ch, i) =>
      ch === ' ' ? ' ' : `<span style="color:${grad(i / (cols - 1))}">${ch}</span>`
    )
    .join('')
).join('\n');

const html = `<!doctype html>
<html><head><meta charset="utf-8"><style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1200px; height: 630px; }
  body {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 42px;
    background:
      radial-gradient(circle at 78% 8%, rgba(20, 184, 255, 0.10), transparent 30rem),
      linear-gradient(180deg, #090e14 0, #080c11 100%);
    font-family: Menlo, "SF Mono", Monaco, monospace;
    -webkit-font-smoothing: antialiased;
  }
  /* A transform does not affect layout, so the box reserves the scaled height. */
  .banner-box {
    display: flex;
    align-items: center;
    height: ${height}px;
  }
  /* line-height 1 so the block rows meet and the box rules join up */
  pre.banner {
    font-size: ${FONT}px;
    line-height: 1;
    white-space: pre;
    transform: scaleY(${SCALE_Y});
  }
  .rule {
    width: ${width}px;
    height: 1px;
    background: linear-gradient(90deg, rgba(47,107,255,0.55), rgba(34,211,238,0.55));
  }
  .sub {
    color: #dbe6f0;
    font-size: 29px;
    letter-spacing: 0.10em;
  }
</style></head>
<body>
  <div class="banner-box"><pre class="banner">${banner}</pre></div>
  <div class="rule"></div>
  <div class="sub">Distributed Agent Backup Network</div>
</body></html>`;

fs.writeFileSync(path.join(__dirname, 'og.html'), html);
console.log(`wordmark ${cols} cols -> ${width}x${height}px at ${FONT}px, scaleY ${SCALE_Y}`);
