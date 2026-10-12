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
> A hand-made dark theme for WEBTOON that never touches the comic art, from reader to comments. Not affiliated with NAVER WEBTOON.

**Description** (paste only the text, not this guide; Chrome and Edge show plain text, so the bullets are `•` characters, which read well in all three stores):
> Toonlight is a dark theme made for WEBTOON, and only WEBTOON. The comics stay exactly as the artist drew them.
>
> General-purpose dark-mode tools have to work on every website, so they guess: they invert or recolour whatever they find. On WEBTOON that can catch cover art and stickers, let white pop-ups slip through and leave buttons grey on grey. Toonlight was made by hand for WEBTOON's own pages instead, and it never puts a filter or a colour change on a comic panel.
>
> What you get:
>
> • Reading: the panels sit on a dark page as one long card, with no seams or white gaps. An optional night dim (Alt+Shift+N) lowers only the panels' brightness.
> • Comments: WEBTOON's comment section has a dark colour set that the site never switches on. Toonlight turns it on and finishes the job: one calm panel, coloured letter avatars, amber TOP comments, clear reply threads, and dark emoji and GIF pickers.
> • Series pages: the title sits on the cover art. Unread episodes have a green dot and read ones are muted, so you can see where you stopped at a glance.
> • Browsing: dark cards for Home, Originals, Rankings and CANVAS, readable genre colours, and the page you're on lit up in the menu like a neon sign.
> • Everywhere else: login, account settings, creator profiles, community feeds, search, pop-ups and the cookie banner.
> • On phones: the mobile site (m.webtoons.com) is dark from top to bottom in Firefox for Android.
> • No white flash while pages load. Text meets WCAG AA contrast, keyboard focus is visible, and "reduce motion" is respected.
> • Turn it on or off with Alt+Shift+T or the toolbar button. Optional: the ← / → keys for the previous / next episode (off until you switch it on in the toolbar popup).
> • Private and light: no tracking, no data collection, no requests of its own.
>
> Toonlight is an independent project and is not affiliated with, endorsed by or sponsored by NAVER WEBTOON. WEBTOON is a trademark of NAVER WEBTOON.
>
> Source code and changelog: https://github.com/hervad/webtoons-dark-mode

**Images:** the current set is in `dist/store/`, all 24-bit PNG without alpha (Chrome refuses alpha):

- `1-series.png`, `2-reader-end.png`, `3-comments.png` (commenter names replaced with neutral ones), `4-originals.png`, `5-reader-popup.png`: 1280 × 800, up to five.
- `promo-tile-440x280.png`: the small promo tile (Chrome, Edge). Chrome's marquee tile is left out; Google only uses it when it features the item.
- `promo-large-1400x560.png`: Edge's large promo tile, used only if Microsoft features the item in a banner. It is all original: the moon icon, text in Inter (SIL OFL, which allows logo use), an abstract page sketch of plain shapes, WEBTOON only as plain grey text, and a "Not affiliated" line.
- Store icon: `extension/icons/icon-128.png` (Chrome, AMO); Edge wants `store-logo-300.png` (300 × 300).

They are build output and stay out of git (`dist/` is ignored); the README's smaller copies are in `docs/screenshots/`. `python -I tools/make-icons.py` redraws the 300 px logo; the screenshots and tiles come from local tools in `.claude/tools/` (`store-images.py`, `promo-large.py`, on the other machine). On the Fedora machine, `.claude/tools/store-popup.sh <out.png>` remakes `5-reader-popup.png` from the built `dist/chrome` popup (a stub supplies the menu labels; add a new setting's label to its `LABELS`), and `shot.mjs` with `W=1600 H=1000`, scaled to 1280 × 800, makes the reader shots (`2-reader-end.png`: the end card and the episode strip of Office Romance Contract episode 1).

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
   - `storage` justification: "Saves the user's own theme settings on their device: dark mode on/off, reader dim on/off, edge shading on/off, whether the reader's scroll-to-top button is hidden, and whether the ← / → keys open the previous / next episode. Nothing is sent anywhere."
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
   - **Description:** the text above **without the "On phones … Firefox for Android" bullet**. Edge refuses to save a description that names another browser ("Avoid referencing other browsers … such as Firefox"), and on desktop Edge m.webtoons.com redirects to www anyway.
   - **Screenshots** can't be reordered: a replaced one (trash, then Add Image) goes to the end.
   - **Search terms:** at most 7, at most 30 characters each, 21 words in total, added **one per Add Term**. Seven terms pasted as one comma list gave "Something went wrong"; an eighth term greys out Save draft. Current set: `dark mode`, `webtoons`, `dark theme`, `night mode`, `comics`, `manhwa`, `comic reader`. No other products' names (store policy).
   - **Save draft**, then **Close**, then reload: the row must say Complete before Publish works.
6. **Publish → Submit your extension:** answer **Yes** to "Does a tester need … other info": with No, the notes box is disabled, and Microsoft warns that submissions without notes may be flagged. Notes for certification:

   ```text
   No account or setup needed. Open any page on https://www.webtoons.com (for example https://www.webtoons.com/en/originals or any series page and episode): the dark theme applies automatically on first run. The mobile site m.webtoons.com is themed too (it needs a phone user agent; on desktop it redirects to www).

   How to test:
   - Alt+Shift+T turns the theme off and on; the choice is remembered across reloads.
   - Alt+Shift+N dims only the comic panels in the episode reader.
   - In the episode reader (for example https://www.webtoons.com/en/super-hero/unordinary/episode-100/viewer?title_no=679&episode_no=100), the episode list under the comic and the one opened from the episode number in the toolbar show the episodes as covers with a ‹ › pager.
   - Optional, off by default: in the toolbar popup, turn on "← / → for previous / next episode"; then the ← and → keys open the previous and next episode in the reader. They do nothing while typing in a field.
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
   - Summary and description: the text above. Add-on URL: the slug is `toonlight` (https://addons.mozilla.org/firefox/addon/toonlight/).
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

     To test: open any page on www.webtoons.com; the theme is on by default. Alt+Shift+T turns it off and on; the toolbar popup lists the same settings. On Firefox for Android the mobile site m.webtoons.com is themed too (on desktop, a phone user agent is needed: without one, m.webtoons.com redirects to www).
     ```

5. **Submit Version.** Publication usually takes up to 24 hours (longer if picked for manual review); AMO emails when it's live.
6. **Manage Listing → Edit Product Page → Images:** the icon and the five screenshots with their captions. They aren't part of the submission form.

## AlternativeTo

Listed since 2026-10-12: https://alternativeto.net/software/toonlight/about/ (approved the same day, in the free queue). It's a directory, not a store: nothing is uploaded, and people find it through the apps it's listed as an alternative to. Anyone can suggest edits (**Contribute to this app** → edit); the site's team reviews them before they show.

- **Name:** `Toonlight` only (the form forbids taglines).
- **Short description:** A browser extension that gives the WEBTOON website a hand-made dark theme without touching the comic panels.
- **Full description** (no links allowed in it):
  > WEBTOON's website has no dark mode. This makes webtoons.com dark: the menus, series pages and episode lists, the reader, comments and the mobile site.
  >
  > Unlike general dark-mode tools, it doesn't guess or invert colors. WEBTOON's pages were styled by hand, so the comics stay exactly as they were drawn. An optional night dim lowers only the panels' brightness when you read in the dark, and keyboard shortcuts turn the theme and the dim on and off.
  >
  > It's free, with no ads, no paid version and no account. It collects no data and runs only on webtoons.com. The code is open source (MIT).
  >
  > Downsides: it only works on WEBTOON, and when WEBTOON changes its site, some parts can show up light until the theme is updated.
  >
  > Also available as a userscript for Tampermonkey and Violentmonkey, on Greasy Fork. An independent project, not affiliated with NAVER WEBTOON.
- **Tags:** `dark-mode-extension`, `browser-extension`, `webcomics`, `webtoon`, `userscript`, `dark-mode-enforcer`. The last one matters: it's the application type (Dark Mode Enforcer) that Dark Reader and the other alternatives share; without it Toonlight had nothing in common with them. Tags that are really features (`ad-free`, `lightweight`) are converted to features by the site.
- **Features:** Dark Mode, Ad-free, Browser extension. Lightweight is left unticked: it claims "less than similar apps", which hasn't been measured.
- **Platforms:** Chrome, Firefox, Edge, with the three store links. Firefox note: "Needs Firefox 142 or later. Also works in Firefox for Android." The reviewer dropped Brave and Vivaldi.
- **Alternatives:** Dark Reader, Midnight Lizard, Night Eye, Turn Off the Lights (each suggestion is reviewed separately from the listing).
- **Icon:** 512 px PNG from `python -I tools/make-icons.py` (`dist/store/icon-512.png`); the site wants 280 px or more.
- **Screenshots** (1280 × 800, under 3 MB each), in this order, with captions:
  1. `docs/screenshots/series.jpg`: Series page: episode list, sidebar and synopsis
  2. `docs/screenshots/before-after.jpg`: Series page without and with the dark theme (its label still says "Webtoons Dark Mode", so it isn't first)
  3. `docs/screenshots/reader.jpg`: End of an episode: like, subscribe, episode strip and rankings
  4. `docs/screenshots/comments.jpg`: Comments in one clean panel
  5. `docs/screenshots/mobile.jpg`: The mobile site (m.webtoons.com)
  6. `dist/store/5-reader-popup.png`: The toolbar popup with the reader settings
- **Author:** hervad (github.com/hervad). The listing shows "Coen", the GitHub profile's display name.

Update it only when the description, the platforms or the look of a screenshot changes; a new version alone needs nothing there.

## Each new version

1. Bump `@version` in the userscript as usual (the extension takes it from there), and commit. Any change to `extension/` also needs a bump: a store rejects a package whose version isn't higher, even when the userscript itself didn't change.
2. `node tools/build-extension.mjs`, **then** the `git archive` line above (the build deletes every zip in `dist/`, the source zip too). Check `unzip -p dist/toonlight-<version>-chrome.zip manifest.json | grep version`.
3. Upload one version at a time: if a store still has an earlier version in review, wait for it (or cancel that review first). A store several versions behind gets release notes covering everything since its version.
4. **Chrome Web Store:** the item → **Package** → **Upload new package** (the Draft column must show the new version) → **Save draft** after every page you change → **Submit for review**, "publish automatically" ticked. An update takes about 1–3 days. Chrome has no release-notes field.
5. **Edge:** the extension → **Packages** → **Replace** (the row must show the new version and Complete) → **Save & Continue** → **Publish** → **Yes** to "tester needs other info" → certification notes (above, required on every submission). Don't touch **Cancel submission** or **Unpublish** on the overview; the live version stays until the review passes (up to 7 business days).
6. **AMO:** the add-on → **Upload New Version** → validation → **Yes** to source code + the new source zip → **Release notes** (what's new, shown to users) and **Notes to reviewer** (the build steps above, with the new version number and a "new since the last approved version" line). Updates usually go public within minutes after the automatic checks (1.11.2: 3 minutes) and can still be picked for manual review later. Check with `curl -s https://addons.mozilla.org/api/v5/addons/addon/toonlight/ | jq .current_version.version`.

**When a setting, a shortcut or the look of a screenshot changes,** update the listings too:

- the `storage` justification (Chrome **Privacy**, Edge **Privacy**) names every saved setting;
- the test steps in the Edge certification notes and the AMO reviewer notes;
- the description (here first, then Chrome **Store listing**, Edge **Store listings → Edit details**, AMO **Edit Product Page → Describe Add-on**; Edge without the Firefox bullet);
- the screenshots (`store-popup.sh` for the popup). Captions: Chrome has none; on AMO and Edge reuse the captions above. AMO listing text and images aren't reviewed and change at once; Chrome and Edge send them through review with the next submission.

AMO's tags come from a fixed list; only `dark mode` fits.
