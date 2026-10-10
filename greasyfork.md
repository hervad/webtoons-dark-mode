A dark theme for [WEBTOON](https://www.webtoons.com) that keeps the comic's colours exactly as the artist drew them.

Most dark-mode extensions invert the whole page, which also inverts the artwork: skin tones go blue, pinks turn green. This script does the opposite. It restyles the site around the comic (header, menus, episode lists, comments, sidebars, popups) and never filters or recolours the comic panels. The only thing it does to the comic itself is frame it: the strip of panels is shown as one card with rounded corners, so the outer corners of the first and last panel are rounded off.

> **No userscript manager?** The same theme is also a browser extension, **Toonlight**: one click to install, with a toolbar button for the settings. Get it for [Chrome, Brave and Opera](https://chromewebstore.google.com/detail/toonlight-dark-mode-for-w/jefblpkbipgmpefdnninpnofkjckpafn), [Edge](https://microsoftedge.microsoft.com/addons/detail/toonlight-dark-mode-for-/iheadalpoiialennkmndleakobiilcfm) or [Firefox](https://addons.mozilla.org/firefox/addon/toonlight/). Use either the script or the extension, not both.

## Getting started

Click **Install this script** above, then open or reload webtoons.com. Updates arrive automatically through Greasy Fork.

It works in Tampermonkey, Violentmonkey and ScriptCat, and also in Greasemonkey (Firefox) and Userscripts (Safari), which have no menu for it (the shortcuts work everywhere).

**Chrome, Edge and other Chromium browsers:** the browser needs an extra permission before any userscript can run. Open `chrome://extensions`, click **Details** on your userscript manager, and turn on **Allow User Scripts**. On Chrome versions before 138, turn on **Developer mode** (top-right of `chrome://extensions`) instead.

On first run the theme follows your system setting: dark if your device is in dark mode, light otherwise. Once you switch it yourself, your choice is remembered.

## Shortcuts

- **Turn dark mode on / off:** `Alt + Shift + T` (backup: `Ctrl + Alt + D`)
- **Dim comic panels for night reading:** `Alt + Shift + N` (backup: `Ctrl + Alt + Shift + D`)
- **Edge shading on / off:** `Alt + Shift + V` (backup: `Ctrl + Alt + Shift + V`)

On a Mac, `Alt` is the `Option` key. The backup shortcuts exist because `Alt + Shift` switches keyboard layouts on Windows computers with more than one input language. On layouts where `Ctrl + Alt + D` types a letter (such as Đ or ð), the script leaves that key alone so you can still type it.

The toggles are also in your userscript manager's menu. Each entry says what clicking it will do, for example **Turn off dark mode** while the theme is on.

**Reader dim** lowers the brightness of the comic panels only, which is easier on the eyes in a dark room. It's off by default, and works whether dark mode is on or off.

**Edge shading** darkens the empty margins to the left and right of the page on wide windows. It never covers the page itself. It's on by default.

**Scroll-to-top button** in the episode reader can be hidden from the menu (**Hide scroll-to-top button in reader**; the entry then reads **Show…** to bring it back). It's shown by default; the `Home` key still jumps to the top when it's hidden.

## What it covers

- **Header and menus:** the page you're on lights up in the main menu like a green neon sign. When you're logged in, your name shows straight away instead of a LOG IN button flashing first.
- **Home, Originals, Categories, Rankings, Canvas:** dark section cards, readable genre colours, clear sort switches and tabs, dark carousels, and page numbers that are easy to spot. On CANVAS lists, Top CANVAS and Up & Coming show each series on its own tile with its rank on the cover.
- **Series page:** the title sits right on the cover art, readable on light and dark covers. Unread episodes have a green dot, episodes you've read are muted, and like counts are shown with a flame. Long synopses fold up.
- **Reader:** the comic strip sits on a dark page as one card with a soft shadow, with no seams between panels. Under the last panel, the like / subscribe / share card, the episode strip and the app banner share one card style. The episode strip has slim arrows at both ends, the rankings sit in a row of large covers above the comments, and the comments use the full width of the page with large, easy-to-read text.
- **Comments:** one dark panel with letter avatars, highlighted top comments, clear reply threads and a dark comment box, emoji picker and GIF picker.
- **Your account:** login, sign-up, account settings, My Comments (your comments as tiles, with their likes and dislikes), followed creators and subscriptions.
- **Creators:** creator profile pages (a profile card with the creator's social link next to their name, their series and follower counts, and a clear Follow button), community feeds and the CANVAS Creator Dashboard.
- **Popups, search and footer:** dark, with visible hover and keyboard-focus states, including the mature-content notice, the age check and the cookie consent banner.
- **Mobile site (m.webtoons.com):** pages, the reader and its toolbar, share buttons and comments are dark. The top bar keeps the site's own look.

Main and secondary text, the labels on green buttons and the keyboard focus ring meet WCAG AA contrast. There's a visible focus ring for keyboard navigation, which the site itself doesn't provide. If your system asks for reduced motion, the theme's own motion is switched off. Under Windows High Contrast, the theme steps aside so your system colours apply.

## How it works

The script adds one stylesheet before the page is drawn, so there's no white flash while a page loads. Instead of using a colour filter, that stylesheet overrides the specific elements Webtoons uses with a small colour palette; no filter or colour change ever reaches the comic panels. A little JavaScript marks the page type, touches up a few things Webtoons adds later (commenter avatars, genre colours, a fold-out button for long synopses, creator bios that were cut off mid-word), loads sharper ranking covers in the reader and handles the shortcuts. There are no scroll handlers and no endless animations, and the theme was tuned so pages open with much less extra work.
Measured in Chrome with the theme on, the browser's styling work while a page loads went down by about 50–85 % (home 124 → 21 ms, reader 199 → 61 ms), an idle Originals page no longer restyles itself 60 times a second, and scrolling the reader takes about half the drawing work.

**Privacy:** the script stores only its own settings (dark mode, reader dim, edge shading, the scroll-to-top choice, and whether you were logged in on the last page, for the LOG IN fix). It uses `GM_getValue` / `GM_setValue` (and `GM.getValue` / `GM.setValue`) for that, and `GM_registerMenuCommand` / `GM_unregisterMenuCommand` for the menu entries. It makes no requests of its own and sends no data anywhere. The one change to what the page loads: in the reader, the ranking covers are swapped for a sharper size of the same images from Webtoons' own image server.

## Something still looks white?

Webtoons occasionally renames parts of its pages, which can make an area light again. Please [open an issue on GitHub](https://github.com/hervad/webtoons-dark-mode/issues) (or use the Feedback tab) with the page URL and a screenshot. These are usually quick fixes.

Also by the author: [Webtoons Chapter Preloader](https://greasyfork.org/scripts/575967) loads every panel of the episode you open right away. It works alongside this theme. It's also available as the **Toonlight Preloader** browser extension for [Chrome](https://chromewebstore.google.com/detail/toonlight-preloader-for-w/kanadpglihpekgidpopkpblcheoinekh) and [Edge](https://microsoftedge.microsoft.com/addons/detail/toonlight-preloader-for-w/mpgabnfjnfleojaokcojabpcpfnnpgfd).

Source code, full changelog and colour-customisation guide: [github.com/hervad/webtoons-dark-mode](https://github.com/hervad/webtoons-dark-mode)

License: MIT
