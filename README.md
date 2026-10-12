# Webtoons Dark Mode

**A dark theme made for WEBTOON, and only WEBTOON. The comics stay exactly as the artist drew them.**

Reading at night on webtoons.com means a bright white page around every episode. General-purpose dark-mode tools help, but they have to work on every website, so they guess: they invert or recolour whatever they find. On WEBTOON that can catch cover art and stickers, let white pop-ups slip through, and leave buttons grey on grey.

This theme takes the opposite approach. Every part of WEBTOON's pages was restyled by hand, from the menus and episode lists to the comments, the reader and the phone site. Nothing ever touches the comic panels: no filter, no colour shift.

It comes in two forms that run the same code: the **Toonlight** browser extension (Chrome, Edge, Firefox) and the **Webtoons Dark Mode** userscript ([Install](#install)).

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Latest release](https://img.shields.io/github/v/release/hervad/webtoons-dark-mode)](https://github.com/hervad/webtoons-dark-mode/releases/latest)
[![Greasy Fork](https://img.shields.io/badge/Greasy%20Fork-install-670000)](https://greasyfork.org/scripts/577859)
[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-Toonlight-1a73e8)](https://chromewebstore.google.com/detail/toonlight-dark-mode-for-w/jefblpkbipgmpefdnninpnofkjckpafn)
[![Edge Add-ons](https://img.shields.io/badge/Edge%20Add--ons-Toonlight-0078d7)](https://microsoftedge.microsoft.com/addons/detail/toonlight-dark-mode-for-/iheadalpoiialennkmndleakobiilcfm)
[![Firefox Add-ons](https://img.shields.io/badge/Firefox%20Add--ons-Toonlight-ff7139)](https://addons.mozilla.org/firefox/addon/toonlight/)

![The same WEBTOON series page split down the middle: the site's own light look on the left, Webtoons Dark Mode on the right, with the cover art unchanged](docs/screenshots/before-after.jpg)

<p align="center">
  <img src="docs/screenshots/series.jpg" width="32%" alt="A series page: the title over the cover art, episode tiles with green unread dots and flame like counts, and the sidebar card">
  <img src="docs/screenshots/reader.jpg" width="32%" alt="Under the comic: the end card with Like and Subscribe, the episode card with large covers, a reading-progress bar and a wide pager, and the ranking cards">
  <img src="docs/screenshots/comments.jpg" width="32%" alt="The comment panel with letter avatars and amber TOP comments">
</p>

![Three phone screens of the mobile site m.webtoons.com in dark mode: the CANVAS home with dark cards, the search page with dark category discs, and the More menu with the footer](docs/screenshots/mobile.jpg)

### Why it feels different

| | General dark-mode tools | Webtoons Dark Mode |
| --- | --- | --- |
| **Comic panels** | Can be inverted or tinted along with the page | Never touched. An optional night dim lowers only their brightness |
| **Covers and thumbnails** | Can be recoloured | Shown as published |
| **Comments** | Recoloured by guesswork | WEBTOON's own dark comment colours, switched on and finished by hand |
| **Pop-ups, sheets, banners** | White boxes often slip through | Each one is styled by name, and text is checked against WCAG AA contrast |
| **Opening a page** | Can flash white first | Dark from the first frame |
| **Buttons and highlights** | Turned into greys | WEBTOON green, readable: white on a deep green |

## Install

There are two ways to get the theme. Both run the same code; use one or the other (if both are installed, only one runs on a page).

### Browser extension: Toonlight (easiest)

One click, no userscript manager, and a toolbar button for the settings.

- **Chrome, Brave, Opera, Vivaldi:** [Toonlight on the Chrome Web Store](https://chromewebstore.google.com/detail/toonlight-dark-mode-for-w/jefblpkbipgmpefdnninpnofkjckpafn)
- **Edge:** [Toonlight on Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/toonlight-dark-mode-for-/iheadalpoiialennkmndleakobiilcfm)
- **Firefox (also Firefox for Android):** [Toonlight on Firefox Add-ons](https://addons.mozilla.org/firefox/addon/toonlight/)

The extension starts in dark mode and updates through the store.

### Userscript

For people who already use a userscript manager, and for Safari. Updates reach you as soon as they're published.

1. **Install a userscript manager** in your browser:
   - [Tampermonkey](https://www.tampermonkey.net/): Chrome, Edge, Firefox, Opera, Safari
   - [Violentmonkey](https://violentmonkey.github.io/): Chrome, Edge, Firefox
   - [ScriptCat](https://scriptcat.org/): Chrome, Edge, Firefox
   - Greasemonkey (Firefox) and [Userscripts](https://github.com/quoid/userscripts) (Safari) also work, with the limits listed under [Compatibility](#compatibility).
2. **Install the script** from one of these two places (pick one, not both):
   - **[Greasy Fork](https://greasyfork.org/scripts/577859)**: click **Install this script**.
   - **[GitHub](https://raw.githubusercontent.com/hervad/webtoons-dark-mode/main/webtoons-dark-mode.user.js)**: your userscript manager opens an install page; confirm it.
3. **Open or reload [webtoons.com](https://www.webtoons.com).**

Updates install automatically. A copy from Greasy Fork updates from Greasy Fork, and a copy from GitHub updates from this repository. Both get the same versions; Greasy Fork usually has a new version within a day.

### On a phone or tablet

The theme covers the mobile site (`m.webtoons.com`) too: every page, the reader, comments, login, menus and pop-ups.

- **Android:** use Firefox for Android. Open [Toonlight on Firefox Add-ons](https://addons.mozilla.org/firefox/addon/toonlight/) in Firefox on the phone and tap **Add to Firefox**. The settings are in Firefox's menu, under the extension. Chrome for Android can't run extensions or userscripts.
- **iPhone and iPad:** install the free [Userscripts](https://github.com/quoid/userscripts) app for Safari, then the userscript from [GitHub](https://raw.githubusercontent.com/hervad/webtoons-dark-mode/main/webtoons-dark-mode.user.js). There is no menu there; the theme follows your device's dark / light setting.

> **Chrome, Edge and other Chromium browsers:** the browser needs an extra permission before any userscript can run. Open `chrome://extensions`, click **Details** on your userscript manager (Tampermonkey, Violentmonkey, ScriptCat), and turn on **Allow User Scripts**. On Chrome versions before 138, turn on **Developer mode** (top-right of `chrome://extensions`) instead.

## Using it

On first run the userscript follows your system setting: dark if your device is in dark mode, light otherwise (the Toonlight extension always starts dark). Once you switch it yourself, your choice is remembered. In the extension, the toolbar button lists the same settings as the userscript manager's menu.

| Action | Shortcut | Backup shortcut |
| --- | --- | --- |
| Turn dark mode on / off | `Alt + Shift + T` | `Ctrl + Alt + D` |
| Dim comic panels for night reading | `Alt + Shift + N` | `Ctrl + Alt + Shift + D` |
| Edge shading on / off | `Alt + Shift + V` | `Ctrl + Alt + Shift + V` |

On a Mac, `Alt` is the `Option` key. The backup shortcuts exist because `Alt + Shift` switches keyboard layouts on Windows computers with more than one input language. On keyboard layouts where `Ctrl + Alt + D` types a letter (such as Đ or ð), the script leaves that key alone so you can still type it; use `Alt + Shift + T` there.

The toggles are also in your userscript manager's menu (click its icon while on webtoons.com). Each entry says what clicking it will do, for example **Turn off dark mode** while the theme is on. Managers that can't relabel menu entries show **Toggle …** instead. Greasemonkey and the Safari Userscripts app have no menu for this script; the shortcuts work everywhere.

**Reader dim** lowers the brightness of the comic panels only, which is easier on the eyes in a dark room. It's off by default, and it works whether dark mode is on or off.

**Edge shading** darkens the empty margins to the left and right of the page on wide windows, which frames the page. It never covers the page itself, so on narrower windows there is nothing to shade. It's on by default and is part of dark mode.

**Arrow keys for episodes:** turn on **Turn on ← / → for previous / next episode** in the menu (or the Toonlight toolbar button), and the `←` and `→` keys open the previous and next episode while you read. It's off by default. The keys are ignored while you type a comment or search, and with `Alt` or `Shift` held, so `Alt + ←` still goes Back. It works on the mobile site too, and whether dark mode is on or off.

**Scroll-to-top button:** the round arrow button in the episode reader can be hidden from the menu (**Hide scroll-to-top button in reader**; the entry then reads **Show scroll-to-top button in reader** to bring it back). It's shown by default, it stays hidden whether dark mode is on or off, and the `Home` key still jumps to the top.

## What's different, page by page

### Reading an episode

- The panels sit on a dark page as one long card with a soft shadow, with no seams or white gaps between them.
- **Night dim** (`Alt + Shift + N`) lowers the brightness of the panels only, for reading in a dark room.
- Under the last panel, Like and Subscribe are two equal green buttons. Liking an episode turns the button deep orange with a short burst of flames.
- Under the comic, the series' other episodes sit in one card: large covers with each episode's title on them, the series name on top and a wide ‹ › pager. The rankings sit in a row of large, sharp covers above the comments.
- In the top toolbar, previous / episode number / next is one tidy capsule with big buttons; the number opens and closes the episode list.
- Optional: turn on the `←` / `→` keys for the previous and next episode (see [Using it](#using-it)).
- On wide screens, the empty margins beside the page are gently shaded (edge shading, `Alt + Shift + V`).

### Comments

WEBTOON's comment section comes with a dark colour set that the site never switches on. The theme switches it on, then finishes the job:

- One calm panel of comments instead of boxes inside boxes, in your system's font at a comfortable size.
- Everyone without a profile picture gets a coloured letter avatar, so you can follow who's talking in a long thread.
- TOP comments stand out in amber, with a TOP chip between the name and the date.
- Replies hang off one thin line. Your up and down votes light up green and red. Long comments fold behind **More**.
- The comment box, the emoji picker and the GIF picker are dark too.

### Series pages

- The title sits right on the cover art, readable on light and dark covers alike.
- Every episode is its own row. Unread episodes have a green dot and the ones you've read are muted with a hollow ring, so you can see where you stopped at a glance. Like counts get a little flame.
- Long episode titles unfold when you point at them, without the list jumping. Long synopses fold behind a button.

### Browsing

- The page you're on lights up in the main menu like a green neon sign.
- Home, Originals, Rankings and CANVAS get dark cards, readable genre colours, clear tabs and sort switches, and page numbers that are easy to spot.
- If you're logged in, your name shows straight away, without a LOG IN button flashing first.

### Your account, creators and pop-ups

- Login and sign-up, account settings, My Comments, followed creators and subscriptions.
- Creator profile pages, community feeds and the CANVAS Creator Dashboard.
- Pop-ups, search, the mature-content notice, the age check and the cookie banner are dark, with clear buttons.

### On your phone

The mobile site, `m.webtoons.com`, is dark too, from top to bottom. That covers the header and tabs, series pages and their info sheet, the reader and its comments, login, the menus, the footer and the app pop-ups. Green buttons use the same deep green as on desktop. See [On a phone or tablet](#on-a-phone-or-tablet) to install it.

### Small things the site itself doesn't do

- A visible focus ring when you move around with the keyboard.
- Text that meets WCAG AA contrast on every surface.
- Respect for your system's reduce-motion setting.
- Stepping aside under Windows High Contrast.

## Accessibility

- Main and secondary text meet the WCAG AA contrast minimum (4.5:1) on every surface. So do the white labels on green buttons, and the keyboard focus ring clears the 3:1 minimum for outlines. That includes the faintest labels, such as input placeholders.
- There's a visible focus ring for keyboard navigation, which the site itself doesn't provide.
- If your system asks for reduced motion, the theme's own motion (hover lifts and zooms, the menu's flicker) is switched off, and the burst of flames after you like an episode only fades in place. Webtoons' own animations are left alone.
- Under Windows High Contrast (contrast themes), the theme steps aside so your system colours apply, and comes back when you turn High Contrast off.

## How it works

The script adds one stylesheet to the page before anything is drawn, so there's no white flash while a page loads. Instead of using a colour filter, that stylesheet overrides the specific elements Webtoons uses (the episode list, sidebar, comment widget and so on) with a small colour palette. No filter or colour change ever reaches the comic panels; only the optional reader dim lowers their brightness.

The comment section is a separate widget that already has a dark colour set built in, but the website never turns it on. The script switches that built-in set on with this theme's colours.

A little JavaScript handles the parts CSS can't:

- It marks the page as reader, series or listing from its address, so page-specific styles apply from the first frame.
- It touches up a few things Webtoons adds to the page later: letter avatars for commenters (built from the name shown on the page, never stored), reply counts on the Replies buttons, genre colours on CANVAS lists, a fold-out button for long synopses, a stray gap in search results, the "$0" Patreon amount when a creator doesn't share earnings, and the emoji picker's category bar. This runs at most once per screen refresh, and only when something new appears on the page.
- On CANVAS lists, it turns the sort menu into a switch: choosing an option reloads the list in that order, as the site's own menu does.
- In the reader, it loads the ranking covers in a sharper size (see Privacy).
- It remembers whether you were logged in, so LOG IN doesn't flash before your name.
- It listens for the keyboard shortcuts, saves your settings and puts the stylesheet back if anything removes it.

There are no scroll handlers and no endless animations: the lit menu item flickers on once and then stays lit. Nothing runs while you're reading unless something is added to the page, by Webtoons or by another userscript.

The theme was tuned so pages open with much less extra work than before; for example, the browser no longer restyles the whole page each time a comment, menu or popup appears.
Measured in Chrome with the theme on, the browser's styling work while a page loads went down by about 50–85 % (home 124 → 21 ms, reader 199 → 61 ms), an idle Originals page no longer restyles itself 60 times a second, and scrolling the reader takes about half the drawing work.

### Privacy

- **Permissions:** `GM_getValue` and `GM_setValue` (with `GM.getValue` and `GM.setValue`, the same storage for managers that only offer the newer form) to remember your settings, and `GM_registerMenuCommand` and `GM_unregisterMenuCommand` for the menu entries.
- **What it stores:** only its own settings: dark mode on or off, reader dim, edge shading, the scroll-to-top choice, the arrow-keys choice, and whether you were logged in on the last page (a yes / no, used for the LOG IN fix). In Greasemonkey and the Safari Userscripts app, a copy of these settings is also kept in webtoons.com's local storage so the first frame of each page already has them.
- **Network:** the script makes no requests of its own and sends no data anywhere. The one exception is a change to what the page loads: in the reader, the ranking covers are swapped from Webtoons' 92 px images to the 210 px size of the same images, on Webtoons' own image server. Those few covers are therefore downloaded a second time, in the larger size.

The full privacy policy, which also covers the Toonlight extension, is in [PRIVACY.md](PRIVACY.md).

## Customising the colours

The palette is the first block in the script. These are the main values:

```css
--wt-bg:            #15171a;  /* page background */
--wt-bg-elev:       #22262b;  /* cards, header, episode list */
--wt-bg-elev2:      #2c313a;  /* buttons, inner surfaces */
--wt-bg-hover:      #30353c;  /* hover highlight */
--wt-bg-input:      #2a2e35;  /* text fields */
--wt-border:        #4a5360;  /* dividers, card edges */
--wt-text:          #e6e6e6;  /* main text */
--wt-text-body:     #d2d6dc;  /* longer text: synopses, notes */
--wt-text-dim:      #b5b9c0;  /* dates, authors, metadata */
--wt-text-mute:     #979ea8;  /* least important text */
--wt-text-read:     #9aa1ab;  /* titles of episodes you've read, focus ring */
--wt-link:          #7cb6ff;  /* links on hover, text links */
--wt-accent:        #00d564;  /* WEBTOON green: selected tabs, highlights */
--wt-key:           linear-gradient(180deg, #157f45, #0f6a39);  /* green buttons */
```

Some colours are fixed in the rules rather than in the palette, such as the amber of notices and top comments and the orange of the like flame, so not everything can be changed here.

Edits made directly in the script are overwritten when it updates. To keep your colours across updates, put them in a separate style instead, for example a [Stylus](https://add0n.com/stylus.html) style for webtoons.com, and scope it to the dark theme so it only applies while the theme is on:

```css
html[data-wt-dark="on"] {
  --wt-bg: #000;
  --wt-bg-elev: #111418;
}
```

## Compatibility

- **Browsers:** Chrome, Edge, Brave, Opera, Vivaldi, Firefox and Safari. On Android, Firefox runs the Toonlight extension (or the userscript in Tampermonkey or Violentmonkey) on the mobile site; Chrome for Android has no extensions. On iPhone and iPad, Safari runs the userscript in the Userscripts app.
- **Userscript managers:**
  - **Tampermonkey, Violentmonkey and ScriptCat:** everything works, including the menu.
  - **Violentmonkey on Chrome / Edge:** its newer (Manifest V3) build may start the script a moment after the page begins to draw, so you can see a brief white flash. Turning on **Alternative page mode** in Violentmonkey's settings avoids it.
  - **Greasemonkey (Firefox) and Userscripts (Safari):** the theme and the shortcuts work, but there is no menu. Without a keyboard (on an iPhone or iPad), the theme simply follows your device's dark / light setting.
- **Sites:** the desktop site `www.webtoons.com` and the mobile site `m.webtoons.com`.

## Something still looks white?

Webtoons occasionally renames parts of its pages, which can make an area light again. Please [open an issue](https://github.com/hervad/webtoons-dark-mode/issues) with:

- the page URL
- a screenshot
- if you can, the element's class name (right-click it → **Inspect**)

These are usually quick fixes. To report a security problem privately instead, see [SECURITY.md](SECURITY.md).

## Also by the author

[Webtoons Chapter Preloader](https://github.com/hervad/webtoons-chapter-preloader) ([Greasy Fork](https://greasyfork.org/scripts/575967)) is made for WEBTOON too: open an episode and every panel is on its way, panel 1 first, so you don't wait for panels as you scroll. It works alongside this theme. It's also available as the **Toonlight Preloader** browser extension for [Chrome](https://chromewebstore.google.com/detail/toonlight-preloader-for-w/kanadpglihpekgidpopkpblcheoinekh), [Edge](https://microsoftedge.microsoft.com/addons/detail/toonlight-preloader-for-w/mpgabnfjnfleojaokcojabpcpfnnpgfd) and [Firefox](https://addons.mozilla.org/firefox/addon/toonlight-preloader/).

## Development

The theme lives in one file, [`webtoons-dark-mode.user.js`](webtoons-dark-mode.user.js), with no build step. To test changes, paste the file into a new Tampermonkey script, or point Tampermonkey at your local copy.

The Toonlight extension is built from that file, unchanged: `node tools/build-extension.mjs` (Node 22+, no dependencies) writes `dist/chrome/` (Chrome and Edge), `dist/firefox/` and a zip of each. [`extension/STORE.md`](extension/STORE.md) has the store listings and the publishing steps.

- [`CONTRIBUTING.md`](CONTRIBUTING.md): how to report problems and send changes.
- [`CLAUDE.md`](CLAUDE.md): the architecture, Webtoons' page structure, known pitfalls and the release checklist.
- [`CHANGELOG.md`](CHANGELOG.md): the changes in each release.
- [`ACCESSIBILITY.md`](ACCESSIBILITY.md): the accessibility details behind the summary above.

## License

MIT — see [LICENSE](LICENSE).

Webtoons Dark Mode (Toonlight) is an independent project and is not affiliated with, endorsed by or sponsored by NAVER WEBTOON. WEBTOON is a trademark of NAVER WEBTOON. The comics in the screenshots belong to their creators.
