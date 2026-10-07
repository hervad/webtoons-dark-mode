# Publishing Toonlight

How to put the extension on the three stores. Build first:

```bash
node tools/build-extension.mjs
```

This writes `dist/toonlight-<version>-chrome.zip` (Chrome and Edge) and `dist/toonlight-<version>-firefox.zip` (Firefox). The version is the userscript's `@version`; a store rejects an upload whose version isn't higher than the published one.

## Listing text (all stores)

**Name:** Toonlight: Dark Mode for WEBTOON

**Short description** (Chrome allows 132 characters; it's already in the manifest):
> A dark theme for WEBTOON (webtoons.com) that keeps every comic panel in its original colours. Not affiliated with NAVER WEBTOON.

**Description:**
> Toonlight gives WEBTOON a carefully designed dark theme without touching the art.
>
> Most dark-mode extensions invert the whole page, which also inverts the comics: skin tones go blue, pinks turn green. Toonlight restyles only the site around the comic (header, menus, episode lists, comments, sidebars, popups) and never filters or recolours a comic panel.
>
> • Works on every part of webtoons.com: home, Originals, CANVAS, series pages, the reader, comments, your account, creator profiles and the mobile site
> • No white flash while pages load
> • Reader dim for night reading (Alt+Shift+N), dims only the comic panels
> • Turn the theme on or off with Alt+Shift+T or the toolbar button
> • Readable contrast (WCAG AA), visible keyboard focus, respects "reduce motion"
> • Lightweight: no tracking, no data collection, no requests of its own
>
> Toonlight is an independent project and is not affiliated with, endorsed by or sponsored by NAVER WEBTOON. WEBTOON is a trademark of NAVER WEBTOON.
>
> Source code and changelog: https://github.com/hervad/webtoons-dark-mode

**Screenshots:** 1280 × 800 PNG or JPEG (at least one for Chrome, up to five). Good choices are the reader with its end card, a series page, the comments, the /canvas home and the popup.

**Support / homepage:** https://github.com/hervad/webtoons-dark-mode (issues: …/issues)

## Chrome Web Store

1. Register at https://chrome.google.com/webstore/devconsole (one-time US$5 per developer account, then unlimited extensions).
2. **New item** → upload `toonlight-<version>-chrome.zip`.
3. **Store listing:** the text above; category Accessibility (or the closest "Make Chrome Yours" category); language English; icon is taken from the zip (128 px); screenshots.
4. **Privacy practices:**
   - Single purpose: "Applies a dark theme to webtoons.com."
   - `storage` justification: "Saves the user's theme settings (dark mode on/off, reader dim, edge shading, scroll-to-top button)."
   - Host access (webtoons.com content script) justification: "The theme's stylesheet and settings have to run on webtoons.com pages, the only site the extension changes."
   - Remote code: **No.**
   - Data usage: tick nothing (no data collected); certify the three statements.
5. Submit for review (usually a few days for a new item, faster for updates).

## Microsoft Edge Add-ons

1. Register at https://partner.microsoft.com/dashboard/microsoftedge (free).
2. **Create new extension** → upload the same `toonlight-<version>-chrome.zip`.
3. Fill in the same listing text and screenshots, category Accessibility, and the privacy answers (no personal data).
4. Submit (review usually takes a few days).

## Firefox (addons.mozilla.org)

1. Sign in at https://addons.mozilla.org/developers/ (free).
2. **Submit a New Add-on** → On this site → upload `toonlight-<version>-firefox.zip`.
3. The add-on ID is `toonlight@hervad` and can never change after the first upload.
4. **Source code:** the extension's `content.js` is the userscript joined with a header by `tools/build-extension.mjs`, not minified. If the reviewer asks for sources, upload a zip of the repository and say: "Run `node tools/build-extension.mjs` (Node 22+, no dependencies); the output is in dist/firefox/."
5. Data collection: the manifest declares none (`data_collection_permissions: required: none`).
6. Listing: the same text and screenshots; category Appearance; also offer it for Firefox for Android (it works on m.webtoons.com).

## Each new version

1. Bump `@version` in the userscript as usual (the extension takes it from there).
2. `node tools/build-extension.mjs`.
3. Upload the new zips: Chrome Web Store → Package → Upload new package; Edge → Update; AMO → Upload new version.
