# Webtoons Dark Mode

A dark theme for [WEBTOON](https://www.webtoons.com) that leaves the comics alone.

Most dark-mode extensions invert the whole page, which also inverts the artwork: skin tones go blue, pinks turn green. This userscript does the opposite. It restyles only the site around the comic (header, menus, episode lists, comments, sidebars, popups) and never touches the comic panels, so every page looks exactly as the artist drew it.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Latest release](https://img.shields.io/github/v/release/hervad/webtoons-dark-mode)](https://github.com/hervad/webtoons-dark-mode/releases/latest)

## Install

1. **Install a userscript manager** in your browser:
   - [Tampermonkey](https://www.tampermonkey.net/) — Chrome, Edge, Firefox, Opera, Safari
   - [Violentmonkey](https://violentmonkey.github.io/) — Chrome, Edge, Firefox
2. **Click [Install Webtoons Dark Mode](https://raw.githubusercontent.com/hervad/webtoons-dark-mode/main/webtoons-dark-mode.user.js).** Your userscript manager opens an install page; confirm it.
3. **Open or reload [webtoons.com](https://www.webtoons.com).**

Updates install automatically; your userscript manager checks this repository for new versions.

> **Chrome / Edge + Tampermonkey:** Chrome needs an extra permission before any userscript can run. Open `chrome://extensions`, click **Details** on Tampermonkey, and turn on **Allow User Scripts**. On Chrome versions before 138, turn on **Developer mode** (top-right of `chrome://extensions`) instead.

## Using it

On first run the theme follows your system setting: dark if your OS is in dark mode, light otherwise. After that, your choice is remembered.

| Action | Shortcut | Backup shortcut |
|---|---|---|
| Turn dark mode on / off | `Alt + Shift + T` | `Ctrl + Alt + D` |
| Dim comic panels for night reading | `Alt + Shift + N` | `Ctrl + Alt + Shift + D` |
| Dark edge shading on / off | `Alt + Shift + V` | `Ctrl + Alt + Shift + V` |

All three toggles are also in the userscript manager's menu (click the Tampermonkey / Violentmonkey icon while on webtoons.com). Each entry says what clicking it will do, e.g. **Turn off dark mode** while the theme is on. The backup shortcuts exist because `Alt + Shift` switches keyboard layouts on Windows machines with more than one input language.

**Scroll-to-top button** in the episode reader can be hidden from the same menu (**Hide scroll-to-top button in reader**; the entry then reads **Show…** to bring it back). It's shown by default; the `Home` key still jumps to the top when it's hidden.

**Reader dim** lowers the brightness of the comic panels only, which is easier on the eyes in a dark room. It's off by default.

**Edge shading** is the soft dark gradient on the left and right edges of the screen, which frames the page. It's on by default; turn it off if you prefer a flat background.

## What it covers

- **Home, Originals, Categories, Rankings, Canvas:** dark section cards, readable genre colours, green active tabs, dark carousels and pagination.
- **Series page:** the cover artwork stays visible behind a dark episode list. Episodes you've already read are shown slightly muted, so the next one stands out.
- **Reader:** the comic strip sits on a dark page as one card with a soft shadow; there are no seams between panels. The episode strip, toolbar, sidebar rankings and comments are all dark.
- **Comments, search, login, popups, footer:** dark, with visible hover and keyboard-focus states.

Text meets WCAG AA contrast: body text is 12–14:1 against the page and cards, secondary text 6.6–9:1, and the green accent 6.7–9:1. There's a visible focus ring for keyboard navigation, which the site itself doesn't provide. Animations are turned off if your system asks for reduced motion.

## How it works

The script adds one stylesheet to the page before anything is drawn, so there's no white flash while a page loads. Instead of using a colour filter, that stylesheet overrides the specific elements Webtoons uses (the episode list, sidebar, comment widget and so on) with a small colour palette. The comic images are explicitly excluded.

The comment section is a separate widget that already has a dark colour set built in, but the website never turns it on. The script switches that built-in set on with this theme's colours.

A little JavaScript handles the parts CSS can't:

- It re-adds the stylesheet if Webtoons swaps its own styles while you move between pages without a reload.
- It detects those in-page navigations and marks the page as reader, series or listing, so page-specific styles apply.
- It clears a few background colours Webtoons sets directly on elements in the reader.
- It listens for the keyboard shortcuts and saves your toggle settings.

There are no animation loops and no scroll handlers, and nothing runs while you're reading. The script uses three userscript permissions: `GM_getValue` and `GM_setValue` to remember your settings, and `GM_registerMenuCommand` for the menu entries. It makes no network requests and collects no data.

## Customising the colours

The palette is the first block in the script. In Tampermonkey or Violentmonkey, open the script's editor and change any of these values:

```css
--wt-bg:            #15171a;  /* page background */
--wt-bg-elev:       #22262b;  /* cards, header, episode list */
--wt-bg-elev2:      #2c313a;  /* buttons, inner surfaces */
--wt-bg-hover:      #30353c;  /* hover highlight */
--wt-bg-input:      #2a2e35;  /* text fields */
--wt-border:        #4a5360;  /* dividers, card edges */
--wt-text:          #e6e6e6;  /* main text */
--wt-text-dim:      #b5b9c0;  /* dates, authors, metadata */
--wt-text-mute:     #878e99;  /* least important text */
--wt-text-read:     #9aa1ab;  /* titles of episodes you've read */
--wt-link:          #7cb6ff;  /* links, commenter names */
--wt-accent:        #00d564;  /* WEBTOON green: active tabs, highlights */
--wt-accent-like:   #f06868;  /* heart icons */
```

Edits made this way are overwritten when the script auto-updates. To keep them, turn off updates for this script in your userscript manager.

## Compatibility

- **Browsers:** Chrome, Edge, Brave, Opera, Vivaldi, Firefox, and Safari with Tampermonkey.
- **Userscript managers:** Tampermonkey and Violentmonkey. Greasemonkey 4 is **not** supported, because it doesn't provide the `GM_getValue` / `GM_setValue` functions the script uses to store settings.
- **Sites:** the desktop site `www.webtoons.com`, which is fully styled. The mobile site `m.webtoons.com` has basic support.

## Something still looks white?

Webtoons occasionally renames parts of its pages, which can make an area light again. Please [open an issue](https://github.com/hervad/webtoons-dark-mode/issues) with:

- the page URL
- a screenshot
- if you can, the element's class name (right-click it → **Inspect**)

These are usually quick fixes.

## Development

Everything lives in one file, [`webtoons-dark-mode.user.js`](webtoons-dark-mode.user.js), with no build step. To test changes, paste the file into a new Tampermonkey script, or point Tampermonkey at your local copy. [`CLAUDE.md`](CLAUDE.md) documents the architecture, Webtoons' page structure, known pitfalls, and the release checklist. [`CHANGELOG.md`](CHANGELOG.md) lists every release.

## License

MIT — see [LICENSE](LICENSE).
