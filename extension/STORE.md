# Publishing Toonlight

How to put the extension on the three stores. Build first, then zip the source for AMO (in this order: the build deletes every zip in `dist/`):

```bash
node tools/build-extension.mjs
git archive --format=zip -o dist/toonlight-<version>-source.zip HEAD
```

This writes `dist/toonlight-<version>-chrome.zip` (Chrome and Edge), `dist/toonlight-<version>-firefox.zip` (Firefox) and the source zip (the repository at `HEAD`, for AMO's reviewers; commit first). The version is the userscript's `@version`; a store rejects an upload whose version isn't higher than the published one.

## Listing text (all stores)

**Name:** Toonlight: Dark Mode for WEBTOON

**Short description / summary** (Chrome allows 132 characters; it's already in the manifest, and Chrome takes it from there):
> A dark theme for WEBTOON (webtoons.com) that keeps every comic panel in its original colours. Not affiliated with NAVER WEBTOON.

**Description** (paste only the text, not this guide; AMO accepts Markdown, so `-` bullets work there):
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

**Images:** the current set is in `dist/store/`, all 24-bit PNG without alpha (Chrome refuses alpha):

- `1-series.png`, `2-reader-end.png`, `3-comments.png` (commenter names replaced with neutral ones), `4-originals.png`, `5-reader-popup.png`: 1280 × 800, up to five.
- `promo-tile-440x280.png`: the small promo tile (Chrome, Edge). Chrome's marquee tile is left out; Google only uses it when it features the item.
- `promo-large-1400x560.png`: Edge's large promo tile, used only if Microsoft features the item in a banner. It is all original: the moon icon, text in Inter (SIL OFL, which allows logo use), an abstract page sketch of plain shapes, WEBTOON only as plain grey text, and a "Not affiliated" line.
- Store icon: `extension/icons/icon-128.png` (Chrome, AMO); Edge wants `store-logo-300.png` (300 × 300).

They are build output and stay out of git (`dist/` is ignored); the README's smaller copies are in `docs/screenshots/`. `python -I tools/make-icons.py` redraws the 300 px logo; the screenshots and tiles come from local tools in `.claude/tools/` (`store-images.py`, `promo-large.py`).

Captions, where a store asks:

1. Series page: episode list, sidebar and synopsis
2. The end of an episode: like, subscribe and the episode strip
3. Comments in one clean panel
4. Originals: cover cards with genre colours
5. The toolbar popup with the reader settings

**URLs:**

- Homepage: https://github.com/hervad/webtoons-dark-mode
- Support: https://github.com/hervad/webtoons-dark-mode/issues
- Privacy policy: https://github.com/hervad/webtoons-dark-mode/blob/main/PRIVACY.md

**License:** MIT.

## Chrome Web Store

**One-time account setup** (https://chrome.google.com/webstore/devconsole; US$5 once per developer account, then unlimited extensions):

- **Trader declaration:** non-trader (a free hobby project). A trader's address, phone and email are shown on the listing.
- **Settings → Contact email:** required before anything can be submitted, and it must be verified (Google emails a link). It is shown publicly with the items.
- **Address:** leave it empty; only traders need one, and it would be shown on the listing.
- **Notifications:** turn on email for "Item review completed" and "Item published".

**New item:**

1. **Add new item** → upload `toonlight-<version>-chrome.zip` (the zip itself, not the folder).
2. **Store listing:**
   - Description: the text above.
   - Category: Accessibility (or the closest one offered). Language: English.
   - Store icon, screenshots and small promo tile as listed above; no promo video.
   - Official URL: None (it needs a site verified in Search Console). Homepage and support URLs as above.
   - Mature content: off (the extension has none, whatever some comics contain).
   - Item support: off (GitHub issues do that job).
3. **Privacy:**
   - Single purpose: "Applies a dark theme to the WEBTOON website (www.webtoons.com and m.webtoons.com). It restyles the site's pages (menus, lists, comments, sidebars) and never alters the comic images."
   - `storage` justification: "Saves the user's own theme settings on their device: dark mode on/off, reader dim on/off, edge shading on/off, and whether the reader's scroll-to-top button is hidden. Nothing is sent anywhere."
   - Host permission justification: "The extension's only function is to restyle webtoons.com, so its content script (a stylesheet plus a small script that applies it before the page first paints, avoiding a white flash) must run on www.webtoons.com and m.webtoons.com. It runs on no other site and makes no network requests."
   - Remote code: **No** (check it; the form can come up with Yes selected).
   - Data usage: tick none of the data types; tick all three certifications.
   - Privacy policy URL: as above (required).
   - The yellow "Host Permission … in-depth review" warning is normal for any content script on a site; nothing to change.
4. **Distribution:** free, public, all regions.
5. **Submit for review**, with "publish automatically after it has passed review" ticked. A new item takes a few days, up to a couple of weeks with the host-permission review; updates are faster. If Submit stays grey, **Why can't I submit?** lists what's missing.

## Microsoft Edge Add-ons

**One-time account setup** (free):

- Sign in at https://partner.microsoft.com/dashboard/microsoftedge with a personal Microsoft account. If the sign-in loops in Firefox (tracking protection blocks Microsoft's cross-site sign-in), use Edge.
- Signing in isn't registering: a Home page with only **My access** means the account hasn't joined the Edge program. Open https://partner.microsoft.com/dashboard/microsoftedge/public/login?ref=dd and register: account type Individual, publisher display name `hervad`.
- The form calls the address "the address you want your customers to view", but in Account settings → Legal info only the publisher name is under *Public info*; name, email, phone and address are seller contact info. Address validation fails on many Polish street addresses: **Continue** keeps the entered one.
- Account settings → Legal info → **Verification Summary** must say *Authorized* before publishing. Payout and tax profiles are only for paid items.

**New extension** (Edge workspace → **Create new extension**):

1. **Packages:** upload the same `toonlight-<version>-chrome.zip`. "Languages in package" stays empty (the manifest has no `default_locale`).
2. **Availability:** Public, all markets, future markets ticked.
3. **Properties:** category Accessibility; website and support URLs as above; mature content unticked.
4. **Privacy:** the same single-purpose and `storage` texts as Chrome (Edge asks no host-permission question); remote code No; no data types; privacy policy URL; all three certifications.
5. **Store listings → English (United States) → Edit details:** description, `store-logo-300.png`, both promo tiles, the five screenshots with captions, and search terms.
   - **Search terms:** at most 7, at most 30 characters each, 21 words in total, added **one per Add Term**. Seven terms pasted as one comma list gave "Something went wrong"; an eighth term greys out Save draft. Current set: `dark mode`, `webtoons`, `dark theme`, `night mode`, `comics`, `manhwa`, `comic reader`. No other products' names (store policy).
   - **Save draft**, then **Close**, then reload: the row must say Complete before Publish works.
6. **Publish → Submit your extension:** answer **Yes** to "Does a tester need … other info": with No, the notes box is disabled, and Microsoft warns that submissions without notes may be flagged. Notes for certification:

   ```text
   No account or setup needed. Open any page on https://www.webtoons.com (for example https://www.webtoons.com/en/originals or any series page and episode): the dark theme applies automatically on first run.

   How to test:
   - Alt+Shift+T turns the theme off and on; the choice is remembered across reloads.
   - Alt+Shift+N dims only the comic panels in the episode reader.
   - The toolbar button opens a popup with the same settings.

   The extension only runs on www.webtoons.com and m.webtoons.com. It uses the "storage" permission to save these settings locally, collects no data, loads no remote code and makes no network requests of its own. Source code: https://github.com/hervad/webtoons-dark-mode
   ```

7. Review takes up to 7 business days. The listing URL appears on the Extension overview once it's published.

## Firefox (addons.mozilla.org)

1. Sign in at https://addons.mozilla.org/developers/ (free) → **Submit Your First Add-on** (not "Theme": that's a browser colour scheme). Accept the agreement and the review policies; the display name is `hervad`.
2. **On this site** → upload `toonlight-<version>-firefox.zip`. It should validate with no errors or warnings.
   - Compatibility: Firefox, and Firefox for Android ticked and greyed out. The manifest's `gecko_android` sets it; that's expected.
   - The add-on ID is `toonlight@hervad` and can never change after the first upload.
3. **Do you need to submit source code?** **Yes:** `content.js` is generated from the userscript by `tools/build-extension.mjs`, which counts as "a tool that generates code", although nothing is minified. Upload `toonlight-<version>-source.zip`.
4. **Describe add-on:**
   - Summary and description: the text above. Add-on URL: the default slug (`toonlight-dark-mode-for-webtoon`) is fine.
   - Not experimental; doesn't require payment.
   - Category: Appearance.
   - Support email: optional (shown publicly). Support website: the issues URL. License: MIT.
   - **This add-on has a Privacy Policy:** ticked. AMO wants the text itself, not a link: paste a plain-text copy of `PRIVACY.md`, ending with its URL.
   - Data collection: the manifest declares none (`data_collection_permissions: required: none`), so there is no form for it.
   - **Notes to Reviewer** (AMO asks for step-by-step build instructions):

     ```text
     content.js is webtoons-dark-mode.user.js (in the source zip, also at https://github.com/hervad/webtoons-dark-mode) with its userscript metadata block replaced by a two-line header. Nothing is minified, bundled or transpiled; gm-shim.js, popup.* and the icons are copied as they are.

     Build steps (Windows, macOS or Linux):
     1. Install Node.js 22 or newer (no npm packages are needed).
     2. Unzip the source and run, from its root: node tools/build-extension.mjs
     3. The add-on is written to dist/firefox/ (and dist/toonlight-<version>-firefox.zip).

     To test: open any page on www.webtoons.com; the theme is on by default. Alt+Shift+T turns it off and on; the toolbar popup lists the same settings.
     ```

5. **Submit Version.** Publication usually takes up to 24 hours (longer if picked for manual review); AMO emails when it's live.
6. **Manage Listing → Edit Product Page → Images:** the icon and the five screenshots with their captions. They aren't part of the submission form.

## Each new version

1. Bump `@version` in the userscript as usual (the extension takes it from there), and commit.
2. `node tools/build-extension.mjs`, then the `git archive` line above for the source zip.
3. Upload the new zips:
   - Chrome Web Store: the item → **Package** → Upload new package → Submit for review.
   - Edge: the extension → **Update** → Packages → Replace; certification notes are required again on every submission.
   - AMO: the add-on → **Upload New Version**; answer Yes to source code, upload the new source zip, and reuse the reviewer notes with the new version number.
