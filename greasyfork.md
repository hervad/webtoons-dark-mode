A dark theme for [WEBTOON](https://www.webtoons.com) that leaves the comics alone.

Most dark-mode extensions invert the whole page, which also inverts the artwork: skin tones go blue, pinks turn green. This script does the opposite. It restyles only the site around the comic (header, menus, episode lists, comments, sidebars, popups) and never touches the comic panels, so every page looks exactly as the artist drew it.

## Getting started

Click **Install this script** above, then open or reload webtoons.com.

**Chrome / Edge + Tampermonkey:** Chrome needs an extra permission before any userscript can run. Open `chrome://extensions`, click **Details** on Tampermonkey, and turn on **Allow User Scripts**. On Chrome versions before 138, turn on **Developer mode** (top-right of `chrome://extensions`) instead.

On first run the theme follows your system setting: dark if your OS is in dark mode, light otherwise. After that, your choice is remembered.

## Shortcuts

- **Turn dark mode on / off:** `Alt + Shift + T` (backup: `Ctrl + Alt + D`)
- **Dim comic panels for night reading:** `Alt + Shift + N` (backup: `Ctrl + Alt + Shift + D`)
- **Dark edge shading on / off:** `Alt + Shift + V` (backup: `Ctrl + Alt + Shift + V`)

All three toggles are also in the Tampermonkey / Violentmonkey menu. Each entry says what clicking it will do, e.g. **Turn off dark mode** while the theme is on. The backup shortcuts exist because `Alt + Shift` switches keyboard layouts on Windows machines with more than one input language.

**Scroll-to-top button** in the episode reader can be hidden from the same menu (**Hide scroll-to-top button in reader**; the entry then reads **Show…** to bring it back). It's shown by default; the `Home` key still jumps to the top when it's hidden.

**Reader dim** lowers the brightness of the comic panels only, which is easier on the eyes in a dark room. It's off by default.

**Edge shading** is the soft dark gradient on the left and right edges of the screen, which frames the page. It's on by default; turn it off if you prefer a flat background.

## What it covers

- **Home, Originals, Categories, Rankings, Canvas:** dark section cards, readable genre colours, green active tabs, dark carousels and pagination.
- **Series page:** the cover artwork stays visible behind a dark episode list. Episodes you've already read are shown slightly muted, so the next one stands out.
- **Reader:** the comic strip sits on a dark page as one card with a soft shadow; there are no seams between panels. The episode strip, toolbar, sidebar rankings and comments are all dark.
- **Comments, search, login, popups, footer:** dark, with visible hover and keyboard-focus states.

Text meets WCAG AA contrast: body text is 12–14:1, secondary text 6.6–9:1. There's a visible focus ring for keyboard navigation, which the site itself doesn't provide. Animations are turned off if your system asks for reduced motion.

## How it works

The script adds one stylesheet before the page is drawn, so there's no white flash while a page loads. Instead of using a colour filter, that stylesheet overrides the specific elements Webtoons uses with a small colour palette, and the comic images are explicitly excluded. A little JavaScript keeps the theme applied when you move between pages without a reload and handles the shortcuts. There are no animation loops and no scroll handlers.

**Privacy:** the script uses `GM_getValue` / `GM_setValue` only to remember your two toggles, and `GM_registerMenuCommand` for the menu entries. It makes no network requests and collects no data.

## Compatibility

- **Browsers:** Chrome, Edge, Brave, Opera, Vivaldi, Firefox, and Safari with Tampermonkey.
- **Userscript managers:** Tampermonkey and Violentmonkey. Greasemonkey 4 is not supported, because it doesn't provide `GM_getValue` / `GM_setValue`.
- **Sites:** the desktop site `www.webtoons.com`, which is fully styled. The mobile site `m.webtoons.com` has basic support.

## Something still looks white?

Webtoons occasionally renames parts of its pages, which can make an area light again. Please [open an issue on GitHub](https://github.com/hervad/webtoons-dark-mode/issues) (or use the Feedback tab) with the page URL and a screenshot. These are usually quick fixes.

Source code, full changelog and colour-customisation guide: [github.com/hervad/webtoons-dark-mode](https://github.com/hervad/webtoons-dark-mode)

License: MIT
