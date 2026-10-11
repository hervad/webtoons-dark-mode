# Mobile site (m.webtoons.com): findings and fix

Phase 1 (investigation) 2026-10-11 against v1.8.6 (`webtoons-dark-mode.user.js` @ `f1babe7`).
Phase 2 (fix) shipped as **v1.9.0**; results in [section 5](#5-phase-2-results-v190).
Line numbers in sections 1–4 refer to v1.8.6 (`f1babe7`); section 5 cites v1.9.0.

## Summary

- **One root cause explains almost everything.** The theme's *site-wide* rules
  run on `m.webtoons.com`: page background dark, every `a`, `h1–h6`, `p`,
  `strong`… light, every `<button>` a dark box. Its *per-component* rules
  (the cards, bars, footers, sheets) were written for `www` markup, and the
  mobile site uses different markup. So on mobile we change the ink but not
  the paper: light text on the site's white boxes (P1), the site's dark text
  and icons on our dark page (P3).
- The automated sweep (24 pages + 11 opened states, phone viewport and UA,
  theme on vs off) found **483 real problems in 27 components**, plus
  **5 more** seen only in screenshots (32 components in total). It also flagged
  35 false positives, removed with reasons (see [Method](#method)).
- **18 of the 32 components are "high" (invisible text or controls).** Your
  11 screenshots show 19 components; **13 are new**, including the CANVAS
  "Weekly HOT" block, every tab strip under the header, the series ⓘ info
  sheet, the share sheet and a "slow networks" sheet.
- Fixing about **17 surfaces** (backgrounds) clears an estimated **414 of
  the 483 findings (86 %)**. Their text is already our light colour; only the
  box under it is wrong.

## 1. How the theme reaches the mobile site

| What | Where | Mobile? |
|---|---|---|
| Extension manifests (Chrome + Firefox) | [tools/build-extension.mjs:52](../../../tools/build-extension.mjs#L52) `matches: www + m` at `document_start`; Firefox adds `gecko_android` (line 66) | yes, both builds |
| Userscript | `@match https://m.webtoons.com/*` (line 8) | yes |
| How the theme is applied | **Static CSS**: one `<style id="wt-dark-style">` (palette + theme). No JS colour rewriting. JS only tags elements (`domPass`) and sets gates. | same CSS on both hosts |
| Page gates | `routeBodyClass()` returns early off www ([:10166](../../../webtoons-dark-mode.user.js#L10166)), so no `body.wt-*` rule ever applies on mobile. There is no mobile gate. | none |
| Deliberate mobile rules | only three: mobile comments `.wcc_layout_mobile` ([:4333](../../../webtoons-dark-mode.user.js#L4333)), login rows `.login_sns .btn_sns` ([:5642](../../../webtoons-dark-mode.user.js#L5642)), home tab pills `.main_section_tab .button` ([:8382](../../../webtoons-dark-mode.user.js#L8382)) | partial |
| Mobile *exclusions* | desktop rules kept off mobile by scoping (`:where(#header) .lnb`, `div.paginate`, `.login_sns .btn_sns`, section headers; CLAUDE.md "Mobile site") | — |

**The mobile site is a separate surface. Verified on real rendered HTML** (saved
per page under `.claude/audit/mobile-2026-10/before-on/*.dom.html`), not
assumed:

- Layout: `div#wrap > header[role=banner] > .gnb` plus `nav.snb > ul.lnb`; `div#ct`
  (`.bg_g` on /more); `footer._footer` with `p.downapp_area2`, `#noticeArea`,
  `.foot_menu`. Desktop uses `#header .header_inner`, `#container`, `#footer`.
- Four header variants: `header[role=banner]` (main), `header#header.sub_header.v2`
  (sub-pages), `header.sub_detail` (series), `header#header.sub_header._toolbar` (viewer).
- Viewer: `#_viewer.viewer_img > div.flick-ct._imageWrap > img` (desktop: `#_imageList`).
- Without a mobile user agent, `m.webtoons.com` redirects to
  `www…?webtoon-platform-redirect=true`. Every audited page was checked to
  have stayed on `m.` (its final URL is in the report).

## 2. Root causes, with evidence

### RC1: we set the text colour, not the background (→ P1, 333 findings)

| Our rule | Line | Effect on mobile |
|---|---|---|
| `h1…h6, p, dt, dd, label, em, strong, small, .tit, .subj, .genre, .info …` → `--wt-text` (#e6e6e6) | [:247](../../../webtoons-dark-mode.user.js#L247) | titles, labels, `strong` light |
| `a, a:visited` → `--wt-text` | [:257](../../../webtoons-dark-mode.user.js#L257) | every link light, and every `<span>` inside a link inherits it |
| `.desc, .date, .count, .num …` → `--wt-text-dim` | [:251](../../../webtoons-dark-mode.user.js#L251) | secondary text light grey |

The site's mobile containers keep their own `background-color` (#fff, #f5f5f5,
#f3f3f8, #f8f8f8, #e8e8e8, #e9e9e9, #efefef). The audit records, for each
failing text node, which of our rules won `color` (via CDP
`CSS.getMatchedStylesForNode`). Example, `/en/more`:

```
"About" (p.foot_menu > a.link)  #e6e6e6 on #f3f3f8 = 1.13:1  color ← a, a:visited (ours)  background ← site (no rule of ours)
"WEBTOON!" (span._msgLogin > strong) #e6e6e6 on #f5f5f5 = 1.14:1  color ← h1, …, strong (ours)
```

With the theme off the same text is the site's dark grey on that white, and readable.

### RC2: we darken the page, the site's dark text and icons stay dark (→ P3, 46 findings)

`html, body { background-color: var(--wt-bg) }` ([:148](../../../webtoons-dark-mode.user.js#L148)) shows through
every transparent mobile container. Where the site sets an explicit dark
colour, it lands on our dark page:

- search titles `span.subject` `#3c3c3c` (1.63:1);
- the viewer's "Wanna access your favorite comics offline?" `#000` (1.17:1);
- "N series" `#666` (3.13:1);
- black sprite icons: view-all chevrons, the search glass, the sign-up arrow.

**P4 (inverted hierarchy, search)** is RC1 plus RC2 on neighbours. The genre
line gets our `.genre` → `#e6e6e6` ([:248](../../../webtoons-dark-mode.user.js#L248)), while the title below it keeps the
site's `#3c3c3c`.

### RC3: the generic button box (→ part of P3, plus cosmetic)

`button, .btn … { background: var(--wt-bg-elev2); border: 1px solid var(--wt-border) }`
([:1589](../../../webtoons-dark-mode.user.js#L1589)) turns mobile's *icon* buttons into dark boxes:

- the series header ⓘ / ⋮ (`button.btn_info`, `button.btn_more`): dark sprite on `#2c313a`, 1.68:1;
- the info-sheet close button;
- "I'll stick with limited access" (`button.button_web`);
- "See other options" (`button.btn_expand`).

Same family: the login rows ([:5642](../../../webtoons-dark-mode.user.js#L5642)) got a dark fill, but their black Email /
Apple / X sprites were never redrawn. The desktop popup does redraw them, with
`--wt-login-ico` masks ([:5768-5769](../../../webtoons-dark-mode.user.js#L5768-L5769)).

### RC4: a desktop rule half-leaks (explains the mixed headers)

`#header { background-color: var(--wt-bg-elev); z-index: 10000 }` ([:293](../../../webtoons-dark-mode.user.js#L293)) matches the
mobile headers that carry `id="header"`:

- the viewer bar is dark **by accident**;
- the sub-page bars are dark, but their own white `h1.sub_title` child paints
  over them with a 1.25:1 title;
- the main header and `header.sub_detail` have no id, so they stay white.

### RC5: our text colour on the site's green (low)

`a` → `#e6e6e6` on the site's `#00dc64` CTAs gives 1.47:1. The site's own white
is 1.84:1, which also fails AA. So we make an existing problem slightly worse.
You listed these buttons as "fine"; see [Decision D2](#decisions-for-kai).

### In plain terms

In CSS, **text colour is inherited but background is not**. Each box paints its
own background (or none, and you see the box behind it).

- We told every link and heading "be light", and that colour flows down into
  every `<span>` inside.
- We told the *page* "be dark", but each white mobile box keeps painting its
  own white on top of the page.

On desktop every one of those boxes has a rule of ours. On mobile they have
different class names, so none of those rules match. That's like recolouring
the ink in every pen in the office but only repainting the desks in one room:
in the other room you now write white on white desks.

```
 desktop (www)                           mobile (m.)  — today
 ┌ page   #15171a  ← ours ┐              ┌ page   #15171a  ← ours ──────────┐
 │ ┌ card #22262b ← ours ┐│              │ ┌ footer #f3f3f8 ← site (no rule)┐│
 │ │ a    #e6e6e6 ← ours ││  readable    │ │ a    #e6e6e6  ← ours         ││  1.13:1
 │ └──────────────────────┘│              │ └───────────────────────────────┘│
 └─────────────────────────┘              │ span.subject #3c3c3c ← site      │  1.63:1 (on the page)
                                          └──────────────────────────────────┘
```

**Why fixing surfaces is enough:** once a white box is repainted dark, all
the light text already inside it becomes readable. One background rule fixes
dozens of text nodes.

## Method

- **Tool:** `.claude/tools/mobile-audit.mjs`, new because the documented
  `.claude/tools/` scripts don't exist on this machine. It uses headless
  Chromium 154 over CDP with a throwaway profile, a 390×844 @2x viewport, an
  Android user agent and touch.
  - The userscript is injected at document-start through a sync `GM_*` shim
    (theme on), or not at all (theme off).
  - The tool scrolls each page by screen, takes a screenshot of each one and
    saves the rendered DOM.
  - A page entry can define steps that open modals or sheets; each step is
    audited too.
  - Page list: `.claude/tools/mobile-pages.json`.
- **Text check:** every visible text run's colour, multiplied by the opacity
  of its ancestors, against the background composited from its ancestors.
  - The threshold is AA: 4.5:1, or 3:1 for large text (≥ 24 px, or ≥ 18.66 px bold).
  - Over a background image, the background is the most common colour in the
    text box's pixels.
  - Hidden text is skipped: clipped away, font smaller than 6 px, or
    text-indent off-screen.
- **Light boxes:** opaque, ≥ 120×32 px, luminance > 0.8. A box nested in a
  reported box of the same colour is not listed again.
- **Icons:** svg, small `img` and small background-image elements whose most
  contrasting pixel is under 3:1 against the background behind them.
- **Classifier** (`mobile-audit-diff.mjs`): matches each theme-on finding to the
  same element in the theme-off run.
  - `ours-P1`: we lightened the text and the background stayed light.
  - `ours-P3`: we darkened the background and the text or icon stayed dark.
  - `gap`: the same light block exists with the theme off; we never restyle it.
  - `site`: the problem is the same with the theme off.
- **Grouping:** `mobile-components.mjs` groups the rows into components.
- **False positives removed (35):**
  - 16 were **covered by a fixed overlay** when the screenshot was taken (the
    "slow networks" sheet or the "Get the app" pill sat on comments or footer
    icons). Their DOM colours are fine, for example `#eef0f3` on `#22262b`.
  - 8 are cover badges and 5 the WEBTOON logo (artwork).
  - 6 are the comic panel wrappers (see [Leave alone](#leave-alone-artwork-or-site-design)).
- **Limits:**
  - The text walker doesn't enter shadow roots (the cookie banner was checked
    by screenshot).
  - The icon check doesn't see `::before` / `::after` sprites (the login icons
    were found by screenshot).
- **Raw data:**
  - every finding: [audit-before.tsv](audit-before.tsv) (301 merged rows);
  - full runs, screenshots and DOMs: `.claude/audit/mobile-2026-10/before-{on,off}/` (local, gitignored, 121 MB).

### Is it the same on your phone?

Your screenshots come from a phone browser; the shield in the URL bar suggests
Firefox for Android (**unverified**). The sweep ran in Chromium. Every one of
your 11 screenshots reproduces in the sweep with the same colours (for example
`/en/more` matches 04 and 05 element for element), so the cause is our CSS, not
the engine. Firefox itself was not run.

## 3. Every problem found

Severity: **high** = invisible or near-invisible text or control; **medium** =
an unthemed block (text still readable); **low** = cosmetic, or the site
already fails AA without the theme.
Source: `S01…S11` = your screenshots; **new** = found by the sweep.
Pages with `*` = in an opened state (sheet, scrolled end, step).

| ID | Component — selector | Pages | Pattern | Source | Severity | Cause | Worst | Count | Fix |
|---|---|---|---|---|---|---|---|---|---|
| M01 | Main header bar — `#wrap > header[role=banner]` (`.gnb`), #fff | home, originals, canvas, MY, /more | P2 | S01, S04, S05 | medium | gap | — | 7 | F1 |
| M02 | Sub-page title bar — `header#header > h1.sub_title` #fff; title `a` #e6e6e6 | genres, genre list, ranking, new, login, email login, reset pw, consents, terms, contact (+ settings / promo → login) | P1, P2 | S10, S11 | **high** | RC1 + RC4 | 1.25 | 26 | F1 |
| M03 | Tab strips under the header — `.category_tab_wrap`, `div#view > ul.flicking-camera` (ranking), `._weekdayTab` (Originals), `._subTabItem` (MY), `span.genre_txt` (CANVAS) | originals, canvas, MY, genres, genre list, ranking | P1, P2 | new | **high** | RC1 | 1.25 | 49 | F1 |
| M04 | Series sub-header bar — `header.sub_detail` #fff | series, CANVAS series | P2 | S06, S07 | medium | gap | — | 5 | F1 |
| M05 | Series header ⓘ / ⋮ — `.button_area > button.btn_info._infoBtn`, `button.btn_more._shareLayerPopBtn` | series, CANVAS series | P3 | S06, S07 | **high** | RC3 | 1.68 | 8 | F3, F4 |
| M06 | Floating "Get the app" pill — `.ly_app_floating > a._floatingBtnDownload` #fff | 21 of 24 pages | P1, P2 | S01–03, S05–07, S10 | **high** | RC1 | 1.25 | 51 | F1 |
| M07 | App-promo block — `footer._footer > p.downapp_area2` #fff, `.downapp_text` | every page with the footer | P1, P2 | S02, S04, S05, S07, S10, S11 | **high** | RC1 | 1.25 | 47 | F1 |
| M08 | Notice bar — `#noticeArea` (`strong.notice_title`, `span.ellipsis`) on #f3f3f8 | every page with the footer | P1 | S07 | **high** | RC1 | 1.13 | 22 | F1 |
| M09 | Footer — `footer._footer` #f3f3f8, `p.foot_menu > a`, `p.copyright > a` | every page with the footer | P1, P2 | S02, S04, S05, S07, S11 | **high** | RC1 | 1.13 | 112 | F1 |
| M10 | /more — `#ct.bg_g` #f5f5f5, tiles `.more_menu_wrap a._moreMenu` #fff, `span._msgLogin > strong` | /more | P1, P2 | S04, S05 | **high** | RC1 | 1.14 | 9 | F1 |
| M11 | Home logged-out strip — `div.main_login._main_login > a.link` #f8f8f8 ("Enter the world of **WEBTOON!** Log in") | home | P1 | new | **high** | RC1 | 1.18 | 4 | F1 |
| M12 | Home app interstitial — `.pop_download_app`: CTA `a.link_app` our text on green; `button.button_web._btnClose` boxed | home (first visit) | P1, cosmetic | new | low | RC3, RC5 | 1.47 | 1 | F4, F5 |
| M13 | "View all" chevrons — `a.section_header > span.button_view_all` (dark sprite) | home | P3 | new | medium | RC2 | 1.13 | 6 | F3 |
| M14 | Search Trending titles — `div.info > span.subject` #3c3c3c, under white `.genre` | search, search results | P3, P4 | S03 | **high** | RC2 + RC1 | 1.63 | 18 | F2 |
| M15 | Search glass `span.ico_srch`; results "more" chevrons `a.link_more._resultTab` | search, search results | P3 | new | low | RC2 | 1.63 | 3 | F3 |
| M16 | CANVAS "Weekly HOT" — `div.discover_list` #e8e8e8, tiles `a.link_discover` #fff, `h4.tit_list`, `strong.tit_discover`, `em.grade_num`, our genre colours on white | canvas | P1, P2 | new | **high** | RC1 | 1.02 | 20 | F1 |
| M17 | CANVAS "Popular By Category" — `h4.tit_popular`, `a#moreGenreLink` #e6e6e6 on violet #7a41e9 (site white: 5.36:1) | canvas | below AA | new | low | RC1 | 4.47 | 2 | F6 |
| M18 | "N series" — `div.daily_count > span` #666 | originals, genres, genre list | P3, P4 | new | low | RC2 | 3.13 | 4 | F2 |
| M19 | Series ⓘ info sheet — `.ly_detail._detailDiv` full-screen #fff: title, About, Status / Subscribers / Views, synopsis, creators | series* | P1, P2 | new | **high** | RC1 | 1.25 | 17 | F1 |
| M20 | Share sheet — `#_shareLayer .inner` #fff; heading `p.dsc_encourage` | series*, viewer* | P1 | new | **high** | RC1 | 1.25 | 3 | F1 |
| M21 | "Having trouble with slow networks?" sheet — `.ly_induce_download.data_save` #fff, `.txt_area strong / p` | series, viewer, CANVAS viewer | P1, P2 | new | **high** | RC1 | 1.25 | 27 | F1 |
| M22 | Green CTAs — `a.btn_episode._readEpisodeBtn`, `a.link_appdown`, `a.lk_appdown`, `a._btnLogin`, `a.lk_download_app` (#00dc64) | series, viewer, /more, footer | below AA | S05, S06, S09 (listed as fine) | low | RC5 | 1.47 | 22 | F5 (D2) |
| M23 | Viewer Subscribe pill — `p.fav_area > a.btn_favorites` #efefef | viewer*, CANVAS viewer* | P1 | S08 | **high** | RC1 | 1.09 | 3 | F1 |
| M24 | "Wanna access your favorite comics offline?" — `div.downapp_area2.viewer > span` #000 | viewer*, CANVAS viewer* | P3 | S09 | **high** | RC2 | 1.17 | 4 | F2 |
| M25 | TOP strip — `a.viewer_top._goTop` #e9e9e9 | viewer*, CANVAS viewer* | P1, P2 | S09 | **high** | RC1 | 1.03 | 8 | F1, F3 |
| M26 | CANVAS Patreon — `a.btn_become_patron` #e6e6e6 on #f35e36 (site white 3.25:1, also fails); divider `#patreonInfoArea em.bar` | CANVAS viewer* | below AA | new | low | RC1 | 2.6 | 1 | F6 |
| M27 | Email login — label strips `div.account_dsc` #f5f5f5; "Forgot Password?" `a.btn_pw`; sign-up arrow `span.ico_login_arr` | email login | P1, P2, P3 | S11 | **high** | RC1, RC2 | 1.14 | 4 | F1, F2, F3 |
| M28 | Login row icons — Email, Apple, X (in "See other options") black on our dark row | login | P3 | S10 (X: new) | medium | RC3 | screenshot | — | F3 |
| M29 | "See other options" — `button.btn_expand._expandSnsAreaButton` boxed | login | cosmetic | S10 | low | RC3 | — | — | F4 |
| M30 | Search category discs — white discs | search | P2 | S03 | low | site design | — | — | D3 |
| M31 | Thin light-grey band under the last panel, above "Creator" | viewer | P2 | S08 | low | not identified | — | — | F1 (after locating) |
| M32 | Boxed close buttons — `._detailCloseBtn` (info sheet), `button.button_web` (interstitial) | series*, home | cosmetic | new | low | RC3 | — | — | F4 |

M28–M32 come from screenshots only; the automated checks don't see them (see Limits).
M31: the elements right after the strip are `.viewer_cta_next` (white, 0 px
tall, 50/40 px padding) and two empty ad wrappers. Which one paints the band
is **not yet identified**.

**Per page (theme on, real findings):**

| Page | Findings |
|---|---|
| series | 69 |
| CANVAS | 53 |
| viewer | 48 |
| home | 33 |
| /more | 30 |
| originals | 26 |
| MY (recent) | 26 |
| ranking | 26 |
| email login | 24 |
| login | 20 |
| reset password | 20 |
| contact | 20 |
| CANVAS viewer | 19 |
| search | 18 |
| genres | 11 |
| genre list | 11 |
| search results | 9 |
| CANVAS series | 6 |
| new | 4 |
| consents | 4 |
| terms | 2 |

Settings (9) and promo code (20) are the login page after a redirect. The
counts include the shared footer and header rows on each page.

### Already correct (verified in the sweep, keep as is)

- the HOME / ORIGINALS / CANVAS / MY tab bar;
- the Trending / Popular pills and grid, and the "More stories from indie creators" row;
- the series cover, title, synopsis and tags;
- the episode list;
- the viewer top bar (dark through RC4) and the bottom toolbar;
- WCC mobile comments and TOP comments;
- the login inputs, the email-login inputs and the Log In button;
- the search results list (titles, authors, views);
- the age gate (sign-up step 1; its white block is the illustration);
- the cookie banner (dark already: `darkenConsentBanner()` reaches the mobile
  banner; checked by screenshot only).

### Leave alone (artwork or site design)

- **Comic panel wrappers** `.flick-ct._imageWrap` (#fff, one per panel `<img>`).
  The white only shows while a panel loads. Darkening it would change any
  transparent-PNG panel drawn to sit on white, so it is left alone (the
  no-panel-changes rule).
- **The REDICE STUDIO strip (S08) is the episode's last panel**
  (`Prologue_0211.jpg`, with the credits drawn into the image). It is
  artwork, not a container.
- Cover badges, the WEBTOON logo sprite, the app-promo characters, the
  "Snug Stories" banner image, the age-gate illustration.

### Not tested

- **Login-only pages:**
  - settings (`/en/settings/account`) and the promo code
    (`/en/promotion/coin/codeRedeem`), which both redirect to login;
  - MY → Subscriptions / Following / Comments;
  - the logged-in comment composer, coin pages and logged-in header states.
- **App-only:** the destinations of "Read N new episodes only on the app",
  Download and "Go to the WEBTOON app".
- **Native controls:** the Originals sort `<select>` and the age-gate month
  picker are drawn by the OS. Our `color-scheme: dark` should make them dark;
  **unverified**.
- **Firefox for Android:** the sweep used Chromium (see above).
- **"Slow networks" sheet:** headless shows it on every series and viewer
  load. When real users see it is **unverified**.
- **Not reached:**
  - mobile search autocomplete (none appeared while typing);
  - the cookie banner's "Cookie Settings" screen;
  - age-restricted series;
  - the community app on mobile;
  - other languages (the same markup is expected; **unverified**);
  - tablet and landscape.

## 4. Fix plan (approved 2026-10-11)

Ordered by leverage. All new rules go in `theme`, under one new banner
`/* ===== Mobile site (m.webtoons.com) ===== */`, with comments that say why.

### F0: a mobile gate, `html[data-wt-mobile]`

- **What:** set once at document-start when
  `location.hostname === 'm.webtoons.com'`, next to the dashboard flag
  ([:9981-9986](../../../webtoons-dark-mode.user.js#L9981-L9986)), and never changed. Every new rule starts with it.
- **Why:**
  - Mobile class names (`.sub_title`, `.category_tab`, `.ly_detail`,
    `.btn_more`, `footer`) are generic, and some exist on www. The gate makes
    a desktop match impossible, so "desktop is untouched" can be *proved*
    (style diff = 0), not hoped.
  - It is cheap for performance: a static attribute on `<html>`, checked
    after the subject class matches. It is not a `:has()` gate.
- **Alternatives:**
  - *(a) Rely on mobile-only class names, no gate:* fewer characters, but no
    proof against collisions.
  - *(b) Stop theming mobile* (drop the `m.` match): zero bugs, but phones go
    back to light. That's the opposite of what you're testing for.
  - *(c) A JavaScript colour rewriter (Dark Reader style):* catches everything,
    but it scans the DOM (against the performance rules: no new observers),
    can flash, and risks touching artwork. That is the opposite of this
    project's targeted design.

### F1: repaint the mobile surfaces (RC1, clears ~414 findings)

One background rule per surface family, using our tokens:

- **Bars** (`--wt-bg-elev`): the main header and `.gnb`, `header.sub_header`
  with its `h1.sub_title`, `header.sub_detail`, and the tab strips (M01–M04,
  M03 wrappers). Tab states: inactive `--wt-text-dim`; active `--wt-text`
  with the green underline used by the tab bar.
- **Page sections** (`--wt-bg` / `--wt-bg-elev`): `#ct.bg_g`, `footer._footer`,
  `p.downapp_area2`, `#noticeArea`, `.main_login`, and CANVAS `.discover_list`
  with its tiles (M07–M11, M16).
- **Sheets and pills** (`--wt-bg-elev`, a hairline border and the site's own
  radius): `.ly_detail`, `#_shareLayer .inner`, `.ly_induce_download`, the
  `.ly_app_floating` pill, `.btn_favorites`, `.viewer_top`, `.account_dsc`
  and the /more tiles (M06, M19–M21, M23, M25, M27).

These are plain comma-separated selector lists, not a long `:is()` (performance
rule). Most text then needs no rule at all; it is already light.

### F2: lift the site's dark text on our dark page (RC2, P4)

- `span.subject` → `--wt-text`, and its `.genre` line → `--wt-text-dim`. That
  restores the hierarchy: title first.
- `.downapp_area2.viewer > span` → `--wt-text`.
- `.daily_count span` → `--wt-text-read` (≥ 4.5:1 on every surface).

### F3: redraw dark UI sprites as light icons (RC2, RC3)

- Use the existing **mask tokens** where one exists:
  - `--wt-ico-chevron-right` for view-all, the result "more" chevrons and the sign-up arrow;
  - `--wt-ico-info` for ⓘ;
  - `--wt-ico-mail`, `--wt-ico-apple` and `--wt-ico-x` for the login rows,
    the same way as the desktop popup ([:5765-5769](../../../webtoons-dark-mode.user.js#L5765-L5769)).
- For the few with no token (⋮, the search glass, the TOP arrow), either add
  `--wt-ico-more` / `--wt-ico-search` tokens or use `filter: invert(1)` on
  those **monochrome UI sprites only, never artwork**.
- Trade-off: masks match the theme's icon style and colour by token. Inverting
  is less code but gives a slightly different grey. I recommend masks plus two
  new tokens.

### F4: un-box the icon and text buttons (RC3)

Reset the generic button box (transparent, no border) for:

- `.button_area > button` (ⓘ / ⋮);
- `._detailCloseBtn`;
- `button.button_web._btnClose`;
- `button.btn_expand` ("See other options": plain text with a chevron).

### F5: green calls to action (RC5, decision D2)

Two options:

- **(a)** Keep the site's `#00dc64` and give the label the site's white back
  (1.84:1, the site's own look).
- **(b)** Restyle them as our **key** (`--wt-key`, white text, ≥ 4.5:1,
  rule B5), the same as every primary button on desktop.

### F6: small colour fixes

- M17: `#fff` on the violet header.
- M26: Patreon in coral with white, following the desktop coral convention.
- M16's genre colours need nothing: they were made for dark surfaces and
  pass once F1 lands.

### Expected size and risk

- About 150–200 lines of CSS plus one JS line (the gate).
- Risk is limited to `m.webtoons.com` by F0. Nothing touches `<img>`, panels
  or covers.

### Testing plan (Phase 2)

1. Re-run the sweep, theme on and off, with the same page list. Before → after
   numbers per component and per page go into this file.
2. Before/after screenshots for every page, produced by the same runner.
3. **"Don't break what's correct":** a computed-style diff (old vs new script)
   on mobile, limited to the elements in the "Already correct" list. Expected
   result: no changes.
4. **Desktop regression:** the same computed-style diff on www pages: home,
   originals, canvas, a series page, a viewer with comments, search, login.
   Expected result: **0 changed properties** (the F0 gate).
   `style-diff.mjs` is missing on this machine, so I would write a small one.
5. Theme off on mobile: nothing left over (all new rules live in the theme CSS).
6. Version bump, CHANGELOG, `node tools/build-extension.mjs`, and
   `npx web-ext lint` on `dist/firefox/`. web-ext downloads from npm, so I'll
   ask before running it.

### Decisions for Kai

Answered 2026-10-11: D1 yes, D2 the key, D3 dark discs, D4 the key, D5 1.9.0. Also: port the desktop look, with no performance cost on desktop.


- **D1: header and app pop-up.** CLAUDE.md says "Left as the site's look: the
  mobile header (a light bar; a possible later look decision) and the app
  popup". ISSUES.md now lists the white header as a bug. Is the header (and the
  app pop-up) in scope to darken? *Recommended: yes*, and CLAUDE.md gets updated.
- **D2: green CTAs.** Option (a), the site's green with white text, or option
  (b), our key? *Recommended: (b)*. It's the only option that passes AA and
  matches desktop. It does change buttons you listed as "fine".
- **D3: search category discs** (M30). Keep the site's white discs, or make
  them dark glass discs with light icons? *Recommended: dark discs*. They are
  the brightest thing on a dark page. Low priority.
- **D4: viewer Subscribe pill** (M23). Make it a green key (desktop end-card
  style), or a quiet glass pill? *Recommended: key* (it's the main action
  there).
- **D5: version.** 1.8.7 (a fix) or 1.9.0 (new mobile coverage)?
  *Recommended: 1.9.0*. It's a large, visible change for phone users.

## 5. Phase 2 results (v1.9.0)

### Before → after

Same instrument for both: the current `mobile-audit.mjs`, the same 24 pages and
11 opened states, both compared with the same theme-off run. The "before"
baseline was re-measured with the final tool (a 6 px light-box threshold and a
repeated cookie-banner answer), so it is **491**, not the 483 of section 3.

| | v1.8.6 | v1.9.0 |
|---|---|---|
| Real findings (text < AA, light blocks, faint icons) | **491** | **0** |
| Known false positives (artwork, covered by an overlay) | 35 | 15 |

The 15 remaining exclusions, each checked on its screenshot:

- **5 covered by an overlay:** header icons under the open info sheet's dim,
  and a comment date under the bottom sheet.
- **6 comic panel wrappers.**
- **2 cover badges under the sticky header.**
- **1 WEBTOON logo under the first-visit pop-up.**
- **1 "Snug Stories" banner backdrop:** art.

**Per component**, before → after:

| Component | Before | After |
|---|---|---|
| M09 footer | 112 | 0 |
| M06 "Get the app" pill | 51 | 0 |
| M07 app-promo block | 49 | 0 |
| M03 tab strips | 49 | 0 |
| M21 "slow networks" sheet | 27 | 0 |
| M02 sub-page title bar | 26 | 0 |
| M08 notice | 22 | 0 |
| M22 green CTAs | 22 | 0 |
| M16 CANVAS Weekly HOT | 19 | 0 |
| M14 search titles | 18 | 0 |
| M19 info sheet | 17 | 0 |
| M10 /more | 9 | 0 |
| M05 ⓘ / ⋮ | 8 | 0 |
| M25 TOP strip | 8 | 0 |
| M01 main header | 7 | 0 |
| M17 Popular By Category band | 7 | 0 |
| M13 view-all chevrons | 6 | 0 |
| M04 series bar | 5 | 0 |
| M27 email login | 5 | 0 |
| M11 home login strip | 4 | 0 |
| M18 "N series" | 4 | 0 |
| M24 "Wanna access…" | 4 | 0 |
| M15 search icons | 3 | 0 |
| M20 share sheet | 3 | 0 |
| M23 viewer Subscribe | 3 | 0 |
| M12 interstitial | 1 | 0 |
| M26 Patreon | 1 | 0 |
| M33 home ad slot (new) | 1 | 0 |

**Per page**, before → after:

| Page | Before | After |
|---|---|---|
| series | 68 | 0 |
| CANVAS | 50 | 0 |
| home | 34 | 0 |
| viewer | 33 | 0 |
| /more | 29 | 0 |
| ranking | 26 | 0 |
| email login | 25 | 0 |
| originals | 24 | 0 |
| MY | 23 | 0 |
| login | 20 | 0 |
| reset password | 20 | 0 |
| contact | 20 | 0 |
| promo → login | 20 | 0 |
| search results | 18 | 0 |
| CANVAS viewer | 15 | 0 |
| genres | 11 | 0 |
| genre list | 11 | 0 |
| cookie banner page | 10 | 0 |
| search | 9 | 0 |
| settings → login | 9 | 0 |
| CANVAS series | 6 | 0 |
| new | 4 | 0 |
| consents | 4 | 0 |
| terms | 2 | 0 |
| sign-up (age gate) | 0 | 0 |

**Screenshot-only items (M28–M32), checked on the after screenshots:**

- the Email / Apple icons are light masks;
- "See other options" is a plain text button;
- the search discs are dark;
- the grey band under the last panel was `.viewer_cont_wrap`'s 10 px `#f3f3f3`
  `border-top`, now the raised surface;
- the close buttons are bare glyphs.

The X icon is in the collapsed "See other options" list and was not opened:
it uses the same rule as Apple and Email.

**Before / after screenshots:**

- one JPEG per page and per opened state, in [compare/](compare/) (36 files,
  2.1 MB, the first two screens of each);
- full-size runs in `.claude/audit/mobile-2026-10/{before-on-v2,after-on}/` (local).

### What changed (`webtoons-dark-mode.user.js`)

- **F0, the gate:** `html[data-wt-mobile]`, set from the host next to the
  dashboard flag ([:10386](../../../webtoons-dark-mode.user.js#L10386)).
- **F1–F6:** a new "Mobile site (m.webtoons.com)" block at the end of `theme`
  ([:9908](../../../webtoons-dark-mode.user.js#L9908), about 380 lines with
  comments), grouped as header bars and tabs, series header, footer, /more and
  home, search, CANVAS, sheets, reader, login, and green calls to action.
- **Footer social buttons:** the mobile footer was added to the four desktop
  `#footer .foot_sns` rules ([:5489](../../../webtoons-dark-mode.user.js#L5489)) instead of copying them.
- **Two additions found during the fix:**
  - the empty home ad slot (`.main_ad_area`, a `#f3f3f3` band, now the page colour);
  - the CANVAS "Popular By Category" bands: a 35% black layer over each
    genre's colour keeps its hue, and white text reaches ≥ 4.5:1 on every
    genre colour. Comedy's `#eea800` was 2.05:1.

### Nothing else changed: proof

- **Desktop (www):** `style-diff.mjs`, old vs new on the same DOM, checks every
  element and `::before` / `::after`. A property only counts as changed if it
  goes back when the old CSS returns, which drops animation and lazy-layout
  noise.
  - Result: **0 changed properties on 10 pages** (home, originals, CANVAS home,
    CANVAS list, ranking, series, reader with comments, search, login,
    creator profile; 11,057 elements, plus their pseudo-elements).
  - Control (old vs old): 0.
  - Positive control (old vs new on mobile /more): 81 changed elements.
- **Mobile parts listed as correct:** the same diff with these containers
  protected: tab bar `.lnb`, `.main_section_tab`, `.webtoon_list`, the episode
  list `.episode_area`, comments `#wcc_root` / `.wcc_App__root`, the toolbar
  `.viewer_footer`, `.login_email`, `.login_sns`.
  - Home, originals, series and viewer: **0 protected changes**.
  - Login: only the three intended icon masks (Email, Apple, X).
  - Email login: only the intended label strips and the "Forgot Password?"
    colour. The inputs are unchanged.
- **Theme toggle on mobile** (Alt+Shift+T): off removes the style (header, tiles
  and labels back to the site's white and black); on again restores it
  without a reload.
- **The built extension** (`dist/chrome`, loaded unpacked in headless
  Chromium): on `m.webtoons.com` it runs 1.9.0 with the gate set and a dark
  header and footer. On www the gate is absent.

### Performance

| Measure | Result |
|---|---|
| CSS size | 535,110 → 558,818 bytes (+23.7 KB, +4.4%; about 95 rule blocks, much of it comments) |
| Extension zip | about 127 KB |
| Parse + full style match, desktop (`perf-swap.mjs`, same DOM, ABAB blocks) | home 10.50 → 10.50 ms; reader 18.15 → 17.50; originals 15.10 → 15.00 (80 runs); series 6.65 → 6.60; CANVAS 9.00 → 8.80 |
| Whole-page restyle, desktop | home 5.35 → 5.40 ms; reader 10.85 → 10.70; originals 7.70 → 7.70 (80 runs); series 3.95 → 3.70; CANVAS 4.40 → 4.55 |
| Mobile | home 3.75 → 4.10; originals (13,935 elements) 46.65 → 46.80; reader 3.20 → 3.05 ms restyle |
| Noise floor (old vs old) | up to ±8% / ±1.3 ms with 25 runs; ±1% with 80 runs |

Every difference is inside the noise. Why it costs nothing on desktop:

- the browser matches a rule from its last part (`.link`, `.ly_detail` …) and
  only then checks ancestors;
- on www that check fails at `html[data-wt-mobile]`;
- no `:has()`, no long `:is()` subject, no blur, no animation, no transition,
  no new observer, timer or request.

### Firefox (Gecko)

`firefox-mobile.mjs` checked the built add-on (`dist/firefox`, installed as a temporary add-on) in headless Firefox 157, over WebDriver BiDi. The profile was set up like a phone: an Android Firefox user agent, the meta viewport honoured, a 390 × 844 window.

- **All 25 pages:** the add-on ran (`data-wt-running` 1.9.0), with the mobile gate set.
- **Text below AA: 0.**
- **Light boxes: 3,** all known exclusions: the "Snug Stories" banner backdrop and two comic-panel wrappers.
- **For scale:** without the add-on, the same check finds 340 text failures and 111 light boxes on the site's own light pages.
- **Not covered:** this is Firefox's engine, not an Android phone. Android's fonts, its native pickers and touch behaviour were not part of it.

Runs: `.claude/audit/mobile-2026-10/firefox-{on,off}/`.

### Still not verified

- A real Android phone: the Firefox check above used desktop Firefox's engine.
- Edge for Android extension support.
- Logged-in pages (settings, MY tabs, the subscribed state of the Subscribe buttons).
- The native sort picker.
- `npx web-ext lint dist/firefox`: needs a download from npm; left for Kai to
  run or approve.

## How to re-run

```bash
S=<scratch dir>
node .claude/tools/mobile-audit.mjs - $S/off .claude/tools/mobile-pages.json                       # theme off
node .claude/tools/mobile-audit.mjs webtoons-dark-mode.user.js $S/on .claude/tools/mobile-pages.json  # theme on
node .claude/tools/mobile-audit-diff.mjs $S/on/report.json $S/off/report.json --json $S/diff.json > $S/diff.txt
node .claude/tools/mobile-components.mjs $S/diff.json --md
```

`CONSENT=keep` leaves the cookie banner up (use a single page: the profile
remembers the answer). `SCREENS=n` caps the screens per page.
