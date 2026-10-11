**A dark theme made for [WEBTOON](https://www.webtoons.com), and only WEBTOON. The comics stay exactly as the artist drew them.**

Reading at night on webtoons.com means a bright white page around every episode. General-purpose dark-mode tools help, but they have to work on every website, so they guess: they invert or recolour whatever they find. On WEBTOON that can catch cover art and stickers, let white pop-ups slip through, and leave buttons grey on grey.

This script takes the opposite approach. Every part of WEBTOON's pages was restyled by hand, from the menus and episode lists to the comments, the reader and the phone site. Nothing ever touches the comic panels: no filter, no colour shift.

> **No userscript manager?** The same theme is also a browser extension, **Toonlight**: one click to install, with a toolbar button for the settings. Get it for [Chrome, Brave and Opera](https://chromewebstore.google.com/detail/toonlight-dark-mode-for-w/jefblpkbipgmpefdnninpnofkjckpafn), [Edge](https://microsoftedge.microsoft.com/addons/detail/toonlight-dark-mode-for-/iheadalpoiialennkmndleakobiilcfm) or [Firefox, including Firefox for Android](https://addons.mozilla.org/firefox/addon/toonlight/). Use either the script or the extension, not both.

Screenshots: [github.com/hervad/webtoons-dark-mode](https://github.com/hervad/webtoons-dark-mode#readme)

## What's different

**Reading an episode.** The panels sit on a dark page as one long card with a soft shadow, with no seams or white gaps between them. **Night dim** (`Alt + Shift + N`) lowers the brightness of the panels only, for reading in a dark room. Under the last panel, Like and Subscribe are two equal green buttons, and liking an episode turns the button deep orange with a short burst of flames. The rankings sit in a row of large, sharp covers above the comments.

**Comments.** WEBTOON's comment section comes with a dark colour set that the site never switches on. The script switches it on, then finishes the job:

- one calm panel of comments instead of boxes inside boxes, at a comfortable size;
- a coloured letter avatar for everyone without a profile picture;
- TOP comments in amber, with a TOP chip between the name and the date;
- replies hanging off one thin line, and votes that light up green and red;
- a dark comment box, emoji picker and GIF picker.

**Series pages.** The title sits right on the cover art, readable on light and dark covers alike. Every episode is its own row: unread ones have a green dot and the ones you've read are muted, so you can see where you stopped at a glance. Like counts get a little flame, and long synopses fold behind a button.

**Browsing.** The page you're on lights up in the menu like a green neon sign. Home, Originals, Rankings and CANVAS get dark cards, readable genre colours and clear tabs. If you're logged in, your name shows straight away, without a LOG IN button flashing first.

**Everything else.** Login and sign-up, account settings, My Comments, subscriptions, creator profiles, community feeds, the CANVAS Creator Dashboard, search, pop-ups, the mature-content notice, the age check and the cookie banner.

**On your phone.** New in 1.9.0: the mobile site, m.webtoons.com, is dark from top to bottom. That covers the header and tabs, series pages, the reader and its comments, login, the menus, the footer and the app pop-ups.

**Things the site itself doesn't do.** Text meets WCAG AA contrast, there's a visible focus ring for keyboard users, the theme respects your reduce-motion setting, and it steps aside under Windows High Contrast. Pages are dark from the first frame, with no white flash while they load.

## Getting started

Click **Install this script** above, then open or reload webtoons.com. Updates arrive automatically through Greasy Fork.

It works in Tampermonkey, Violentmonkey and ScriptCat, and also in Greasemonkey (Firefox) and Userscripts (Safari), which have no menu for it (the shortcuts work everywhere).

**Chrome, Edge and other Chromium browsers:** the browser needs an extra permission before any userscript can run. Open `chrome://extensions`, click **Details** on your userscript manager, and turn on **Allow User Scripts**. On Chrome versions before 138, turn on **Developer mode** (top-right of `chrome://extensions`) instead.

**On a phone:**

- **Android:** use Firefox with Tampermonkey or Violentmonkey, or the Toonlight extension. Chrome for Android can't run userscripts.
- **iPhone and iPad:** use Safari with the Userscripts app.

On first run the theme follows your system setting: dark if your device is in dark mode, light otherwise. Once you switch it yourself, your choice is remembered.

## Shortcuts

- **Turn dark mode on / off:** `Alt + Shift + T` (backup: `Ctrl + Alt + D`)
- **Dim comic panels for night reading:** `Alt + Shift + N` (backup: `Ctrl + Alt + Shift + D`)
- **Edge shading on / off:** `Alt + Shift + V` (backup: `Ctrl + Alt + Shift + V`)

On a Mac, `Alt` is the `Option` key. The backup shortcuts exist because `Alt + Shift` switches keyboard layouts on Windows computers with more than one input language. On layouts where `Ctrl + Alt + D` types a letter (such as Đ or ð), the script leaves that key alone so you can still type it.

The toggles are also in your userscript manager's menu. Each entry says what clicking it will do, for example **Turn off dark mode** while the theme is on.

- **Reader dim** lowers the brightness of the comic panels only. It's off by default, and works whether dark mode is on or off.
- **Edge shading** darkens the empty margins to the left and right of the page on wide windows. It never covers the page itself. It's on by default.
- **Scroll-to-top button:** the button in the episode reader can be hidden from the menu (**Hide scroll-to-top button in reader**; the entry then reads **Show…** to bring it back). It's shown by default. When it's hidden, the `Home` key still jumps to the top.

## How it works

The script adds one stylesheet before the page is drawn, so there's no white flash while a page loads. Instead of a colour filter, that stylesheet restyles the specific parts Webtoons uses, with a small colour palette. No filter or colour change ever reaches the comic panels.

A little JavaScript does the rest:

- marks the page type;
- touches up a few things Webtoons adds later (commenter avatars, genre colours, a fold-out button for long synopses);
- loads sharper ranking covers in the reader;
- handles the shortcuts.

There are no scroll handlers and no endless animations. Measured in Chrome, the browser's styling work while a page loads went down by about 50–85% after the theme was tuned (home 124 → 21 ms, reader 199 → 61 ms).

**Privacy:**

- **What it stores:** only its own settings: dark mode, reader dim, edge shading, the scroll-to-top choice, and whether you were logged in on the last page (for the LOG IN fix).
- **Permissions:** `GM_getValue` / `GM_setValue` (and `GM.getValue` / `GM.setValue`) for those settings, and `GM_registerMenuCommand` / `GM_unregisterMenuCommand` for the menu entries.
- **Network:** it makes no requests of its own and sends no data anywhere. The one change to what the page loads: in the reader, the ranking covers are swapped for a sharper size of the same images, from Webtoons' own image server.

## Something still looks white?

Webtoons occasionally renames parts of its pages, which can make an area light again. Please [open an issue on GitHub](https://github.com/hervad/webtoons-dark-mode/issues) (or use the Feedback tab) with the page URL and a screenshot. These are usually quick fixes.

Also by the author: [Webtoons Chapter Preloader](https://greasyfork.org/scripts/575967) loads every panel of the episode you open right away. It works alongside this theme. It's also available as the **Toonlight Preloader** browser extension for [Chrome](https://chromewebstore.google.com/detail/toonlight-preloader-for-w/kanadpglihpekgidpopkpblcheoinekh) and [Edge](https://microsoftedge.microsoft.com/addons/detail/toonlight-preloader-for-w/mpgabnfjnfleojaokcojabpcpfnnpgfd).

Source code, full changelog and colour-customisation guide: [github.com/hervad/webtoons-dark-mode](https://github.com/hervad/webtoons-dark-mode)

License: MIT
