# Webtoons Dark Mode

A targeted dark theme for [Webtoons](https://www.webtoons.com) — desktop and mobile. No global filter inversion, no white-text-on-white-panel bugs, no per-frame JavaScript work. Just CSS.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
<!-- After publishing on Greasyfork, replace SCRIPT_ID with the assigned ID and uncomment:
[![Greasyfork version](https://img.shields.io/greasyfork/v/SCRIPT_ID.svg)](https://greasyfork.org/en/scripts/SCRIPT_ID-webtoons-dark-mode)
[![Greasyfork installs](https://img.shields.io/greasyfork/dt/SCRIPT_ID.svg)](https://greasyfork.org/en/scripts/SCRIPT_ID-webtoons-dark-mode)
-->

## What it does

Applies a dark theme to Webtoons by overriding background, text, border, and surface colors on the actual containers the site uses (header, cards, episode lists, viewer, comments, footer, popups, inputs). Built around a small CSS-variable palette so the whole look can be re-skinned by editing a handful of values.

It also ships an optional **reader dim** mode that lowers comic-panel brightness for late-night reading without affecting the rest of the page.

## Why not just use [a global `filter: invert()` userstyle](https://en.wikipedia.org/wiki/Filter_(higher-order_function))?

Two reasons:

1. Inverting the whole page also inverts comic panels — colors look wrong and tones are off.
2. Inversion shifts hues (`hue-rotate(180deg)`) so pinks turn green and brand colors look broken.

This script does the opposite: scoped overrides on the chrome, comic images left untouched.

## Install

**Recommended (with auto-updates):**

[Install from Greasyfork](https://greasyfork.org/en/scripts/) — open the link in a browser that has a userscript manager installed, then click **Install this script**.

**Manual:**

1. Install a userscript manager:
   - [Tampermonkey](https://www.tampermonkey.net/) — Chrome, Edge, Firefox, Safari, Opera
   - [Violentmonkey](https://violentmonkey.github.io/) — Chrome, Edge, Firefox
   - [Greasemonkey](https://www.greasespot.net/) — Firefox
2. Open the [raw `.user.js` file](https://raw.githubusercontent.com/hervad/webtoons-dark-mode/main/webtoons-dark-mode.user.js) and confirm the install prompt.

> **Chrome users:** since Manifest V3, Tampermonkey requires Developer Mode to be enabled in `chrome://extensions/` for userscripts to actually run. Flip the toggle in the top-right of that page once.

## Usage

Once installed, the theme is on by default. To toggle:

- **Tampermonkey/Violentmonkey menu** → *Toggle Webtoons dark mode* / *Toggle reader dim*
- **Keyboard:** `Alt + Shift + T` (theme), `Alt + Shift + N` (night-reading dim)

State persists across pages and reloads via `GM_setValue`.

## How it works

A single `<style>` element is injected at `document-start` (before paint, so no flash of light theme). The CSS targets the actual container classes Webtoons uses — `.gnb`, `.detail_lst`, `#_viewerArea`, `.u_cbox_*`, etc. — and overrides background, color, and border properties. Comic panels (`.viewer_lst img`, `._images img`) are explicitly excluded with `filter: none`, so they render exactly as the artist intended.

There is no `MutationObserver` and no scroll/route observer. SPA navigation between chapters works "for free" because CSS persists across same-origin in-place navigation. The only JavaScript that runs after init is the keydown listener (early-exits on non-modifier keys) and the optional menu-command handlers.

The script uses three Greasemonkey grants (`GM_getValue`, `GM_setValue`, `GM_registerMenuCommand`) for persistence and the toggle menu — nothing network-facing, nothing that could exfiltrate data.

## Configuration

The palette is the first block in the script. Edit any of these CSS variables to re-skin:

```css
:root {
    --wt-bg:        #15171a;  /* page background */
    --wt-bg-elev:   #1e2125;  /* cards, header */
    --wt-bg-elev2:  #262a30;  /* hover, active */
    --wt-bg-input:  #2a2e35;  /* form fields */
    --wt-border:    #2c3036;
    --wt-text:      #e6e6e6;
    --wt-text-dim:  #a0a4ab;  /* metadata, dates */
    --wt-text-mute: #6b7079;  /* placeholders */
    --wt-link:      #7cb6ff;
    --wt-accent:    #00d564;  /* Webtoons brand green */
}
```

To change the keybindings, edit the `keydown` listener at the bottom — the `e.code === 'KeyT'` and `e.code === 'KeyN'` lines.

## Compatibility

- Tampermonkey, Violentmonkey, Greasemonkey
- Chromium browsers: Chrome, Edge, Brave, Opera, Vivaldi
- Firefox (stable + ESR)
- Safari (with Userscripts app or Tampermonkey)
- Desktop site (`www.webtoons.com`) and mobile site (`m.webtoons.com`)

## Performance

The script is essentially zero-overhead at runtime:

- One `<style>` element insert at `document-start` (~5 KB of CSS, parsed once).
- One global `keydown` listener that early-exits on non-Alt-Shift keys.
- No `MutationObserver`, no scroll handlers, no `requestAnimationFrame` loops.
- No global CSS transitions (an earlier draft used `body * { transition: ... }` — removed because it makes the browser track transitions on every descendant of `<body>`, including comic panels).
- `@noframes` set, so the script doesn't re-run inside ad iframes or embedded frames.

## Known issues

- **Selector drift.** Webtoons occasionally renames classes when they redesign sections. If a panel goes white again, please open an issue with the URL and a screenshot — the fix is usually a one-line selector add.
- **Naver `u_cbox` comments widget** is shared across Naver properties; if Naver pushes an update, comment styles may need a refresh.

## Contributing

Issues and pull requests welcome. For "this surface is still light" bug reports, please include:

- The page URL where it reproduces
- The element class/ID (right-click → Inspect)
- A screenshot if possible

For local development setup (Fedora + VS Code recommended), see [SETUP.md](SETUP.md). The short version: `git clone`, `npm install`, open in VS Code, install Tampermonkey in your browser. The repo includes ESLint config (with userscript-metadata validation), helper scripts to grep Webtoons' minified CSS bundles, and a metadata validator.

## License

MIT — see [LICENSE](LICENSE).
