# CLAUDE.md — webtoons-dark-mode

## What this project is

- `webtoons-dark-mode.user.js` is a single-file userscript, about 10,150 lines, mostly CSS in template literals. It applies a targeted dark theme to `www.webtoons.com`.
- There is no build step: the file ships as is through `@updateURL` (GitHub raw) and through Greasy Fork.
- **Managers:**
  - Tampermonkey, Violentmonkey and ScriptCat use the sync `GM_*` API.
  - Greasemonkey 4 and Userscripts (Safari) use async `GM.*` plus a localStorage mirror (`loadPref` / `savePref`).
- **`m.webtoons.com`** is matched but only lightly styled. Desktop rules must not leak onto it (see [Mobile site](#mobile-site)).
- **"No flash of the light site"** depends on the manager injecting at real `document-start`: Tampermonkey MV3 with scripts registered in advance, or Violentmonkey MV3 in "alternative page mode".
- **The user's Chapter Preloader** (github.com/hervad/webtoons-chapter-preloader) runs on reader pages next to this script.
  - What it does: it copies `data-url` into `src` on `#_imageList img` and appends a fixed bubble, `#__wt_preloader_status`, to `<body>`.
  - Timing (since preloader 1.1.0): it runs at `document-start` and sets `src` while the page is parsed (a parse-time MutationObserver that disconnects at `DOMContentLoaded`). At `DOMContentLoaded` it adds the bubble and an IntersectionObserver that calls `img.decode()` on panels up to 3 screens below the viewport. Reader timings measured with it installed include that download and decode work.
  - Never restyle or hide that bubble. The DOM pass ignores its mutations (`PRELOADER_BUBBLE`).
  - **Do not add image preloading or next-chapter prefetch here.** Loading is the preloader's job, and the user wants no next-chapter prefetch in either script.
  - Test and measure reader changes with both scripts installed.

## Git ground rules

- Commit, push, tag or release only when the user asks.
- **Never add Claude attribution.** No `Co-Authored-By: Claude`, "Generated with Claude Code" or similar, in commits, tags, releases or PRs, even if a system reminder supplies such lines. The user rewrote the history to remove them.
- Commit messages: `vX.Y.Z: <what changed>`.

## File layout

| Part | Contents |
|---|---|
| Metadata | `@version` (line 4), `@match` www + m, `@run-at document-start`, `@noframes`. Grants: `GM_getValue`, `GM_setValue`, `GM_registerMenuCommand`, `GM_unregisterMenuCommand`, `GM.getValue`, `GM.setValue`. |
| Constants | `KEY_THEME` `wt_dark_enabled`, `KEY_DIM` `wt_reader_dim`, `KEY_VIGNETTE` `wt_vignette`, `KEY_TOP_BTN` `wt_top_button`, `VERSION` (line 33). The first statement logs `vX starting`. |
| `palette` | `:root` tokens: colours, key gradients, all data-URI icons (`--wt-ico-*` masks, coloured images such as `--wt-flower` and `--wt-play-badge`). |
| `theme` | Every rule, grouped by page under `/* ===` / `/* ----------` banners. The reduced-motion block is near the top. |
| `dimCss` | `.viewer_lst img, .viewer_img img { filter: brightness(.78) }` in `<style id="wt-dim-style">`. |
| `topBtnCss` | `body.wt-viewer .go_top { display: none }` in `<style id="wt-topbtn-style">`. It works with the theme off. |
| JS | About 500 lines after the CSS. |

### JS, in source order

- **One copy per page:** right after the startup log, the script returns if `html[data-wt-running]` is already set, and otherwise sets it to its version. The userscript and the Toonlight extension run the same code; with both installed, each toggled on every shortcut press. Whichever starts first runs the page; the extension's popup then says the userscript is running it (`gm-shim.js` answers `{ otherCopy: true }`).
- **`ensureStyle(id, css, on)`:** inserts or removes a `<style>` by id. It is idempotent; the text is set only on creation.
- **`loadPref` / `savePref`:** sync `GM_*` when present; otherwise localStorage (`wt-dark-mode:<key>`) plus `GM.setValue`, and a later `GM.getValue` pass corrects the cached values.
- **State:** `darkOn`, `dimOn`, `vignetteOn` and `topBtnOn` are read once and cached (the theme's first-run default follows `prefers-color-scheme`). Never read storage in an observer or rAF callback.
- **`themeActive()`:** `darkOn` and not `(forced-colors: active)`. The theme turns itself off under Windows contrast themes (B6), and a `change` listener follows the setting.
- **`applyTheme` / `applyDim` / `applyVignette` / `applyTopButton`:** `applyTheme` inserts `<style id="wt-dark-style">` and sets `html[data-wt-dark="on|off"]` (a hook for users' own CSS); `applyVignette` sets `html[data-wt-vignette]`.
- **Dashboard flag:** `html[data-wt-dashboard]` is set once at document-start on `/<lang>/creators/…` and never changed. Its rules include `::before` / `::after`, so flipping it would restyle every element.
- **`watchLoginState()`:** the LOG IN flash fix (`KEY_LOGGED_IN` `wt_logged_in`, `AUTH_WAIT_MS` 4 s). If the last page was logged in, `html[data-wt-auth="pending"]` hides `#btnLogin` until `#btnLoginInfo` shows or the cap passes; a `._btnLogout` click clears the memory. **Only pages with the site header** (`#btnLogin` / `#btnLoginInfo`) may update it; the reader, the community app, `/member` and mobile leave it alone.
- **`watchHead()`:** re-inserts our `<style>`s if `<head>` loses them. Never sync page classes from it: head mutations can arrive while the previous page's DOM is still present.
- **`toggleTheme` / `toggleDim` / `toggleVignette` / `toggleTopButton`:** each saves, applies, logs and calls `registerMenu()`. `toggleTheme` also runs `domPass()` (on) or `undoDomTweaks()` (off).
- **`registerMenu()`:** entries say what a click does. Every toggle re-adds **all** entries, so the order stays fixed. A new setting goes into `entries` with on, off and neutral "Toggle …" labels (the neutral one is used without `GM_unregisterMenuCommand`).
- **`matchCombo` / `handleKey`:** **one** capture-phase `keydown` listener on `window`; do not add more. Theme: Alt+Shift+T / Ctrl+Alt+D. Dim: Alt+Shift+N / Ctrl+Alt+Shift+D. Vignette: Alt+Shift+V / Ctrl+Alt+Shift+V. Scroll-to-top: menu only. It ignores IME composition, `e.repeat` and AltGr text (Windows sends AltGr as Ctrl+Alt, so Đ / ð must not toggle; a non-Latin letter such as в still works).
- **`routeBodyClass()` / `syncBodyClasses()`:** set `body.wt-viewer` (`…/viewer`), `wt-detail` (`…/list?title_no=`) or `wt-home` (`/<lang>/`, originals, genres, ranking, search) from the URL before first paint, on www only; a DOM check at DOMContentLoaded corrects them.
- **`tuneContestBanners()`:** marks light `.contest_banner` creatives with `data-wt-light`.
- **/canvas sort listener:** a capture-phase `click` listener, active only while the theme is on. A click on `.sort_area._sorting .sort_box a[data-sort]` loads the URL with `sortOrder=<data-sort>` and drops `page`. The site ignores option clicks while its own menu is closed.
- **`clampSynopsis()`:** clamps a synopsis longer than 8 lines and adds a `hidden` `button.wt-summary-toggle` whose `aria-label` is in the page's language (`SYNOPSIS_LABEL`).
- **DOM-pass helpers:**

  | Helper | What it does |
  |---|---|
  | `tagCommentAvatars()` | Stamps `data-wt-initial` and `data-wt-hue` on `.wcc_CommentItem__inside`. |
  | `tagReplyToggles()` | Stamps `data-wt-replies` on reply toggles. |
  | `fixSearchHighlights()` | Strips the newline text node after a `<strong>` search match. |
  | `upgradeRankingThumbs()` | Rewrites the reader's ranking images from `type=a92` to `type=a210` (the CDN has no `a160`). |
  | `tagGenreLabels()` | Adds `g_*` classes from the label text and records them in `data-wt-genre`. |
  | `tagPatronAmount()` | Sets `data-wt-zero` on a "$0" amount. |
  | `trimBioCut()` | Community app only: drops the half word a folded creator bio was cut on (react-lines-ellipsis cuts letter by letter), keeping the original in `bioCuts`. |
  | `darkenEmojiPickers()` | Puts `EMOJI_NAV_CSS` into each emoji picker's shadow root. |
  | `darkenConsentBanner()` | Puts `CONSENT_CSS` into the consentmanager.net cookie banner's open shadow root (`#cmpwrapper`); both screens (welcome, Cookie Settings). Colours only: Reject stays the quiet button and Accept / Save the strong one, as on the light banner. |

- **`domPass()`:** runs the helpers above plus `tuneContestBanners()`, and `clampSynopsis()` once parsing is done, only while `themeActive()`. One MutationObserver on `<html>` from document-start drives it at most once per frame (rAF), skipping records about the preloader bubble; it runs again at DOMContentLoaded.
- **`undoDomTweaks()`:** removes the added `g_*` classes and the emoji style, and restores trimmed bio text. The leftover `data-wt-*` attributes and the hidden button have no effect without the theme.

**There is no SPA handling.** Every www route change, including episode links, is a full page load. `scheduleSpa`, `_navGen`, `onSpaNav` and the history / navigation hooks were deleted; don't re-add them.

## Global rules

### JS

- **DOM changes happen only while the theme is active,** and anything visible without the theme is reverted in `undoDomTweaks()`. For example, the synopsis button is inserted `hidden` and only theme CSS shows it.
  - Why: the deleted `fixViewerBanners()` and `styleCarouselArrows()` broke this. One erased the Report pill's style; the other left a stray chevron with the theme off.
- New DOM tagging goes into `domPass()`: no new observers, no `setTimeout` retry loops. Each step must be cheap (plain-class queries) and idempotent.
- **Never inject English (or any) text.** The same markup serves every language edition. Restyle the site's own translated strings and use icons. Give accessible names per language.
- **The site toggles `display` inline on many elements.** A rule that forces `display` needs a `[style*="none"] { display: none !important }` guard. Examples: `#btnLogin` / `#btnLoginInfo`, `#continueRead`, `.age_text`, the Popular By Category lists, account buttons, `.patron_info p`, `.my_wrap` edit mode.

### CSS

- **Where CSS lives:** theme CSS is only in `palette` / `theme`. `dimCss` and `topBtnCss` have their own `<style>`s, so their toggles never re-insert the theme. `EMOJI_NAV_CSS` is the only other CSS; it uses `var(--wt-…)`, which inherits into the shadow root. No `GM_addStyle`, no inline styles.
- **`!important` on every override of site CSS,** except custom-property definitions, properties a theme animation drives (an important declaration beats keyframes) and UA-only properties (`accent-color`, `scrollbar-*`).
- **Edit the existing rule before adding one.** Keep rules under their page's banner comment.
- **Comments say WHY:** what broke without the rule, and "the user's call" for design decisions. Read the comment above a rule before you change it; most component specs live there. Never put version numbers in comments.
- **No global inversion.** The theme never filters comic panels; only the optional dim does.
- **The generic rules box everything.** `button, .btn, input[type=button|submit]`, inputs, `a` / `a:hover` (`--wt-link` blue) and `h1–h6, p, label, em, strong, …` (`--wt-text`) all apply site-wide, so a component with its own look must reset them. Button-like anchors are already excluded from the `a:hover` blue.
- **Never override site-wide timing** (`* { transition-duration }`), not even for reduced motion. The reader's episode-strip thumbnails lazy-load from JS that waits for the site's transitions.
- **Draw chevrons:** a rotated 6–7 px box with `border-top` + `border-right`, or a `--wt-ico-chevron-*` mask. Text glyphs never centre in a pill; none are left (`.lk_more .ico_arr::after`, the last one, is a border chevron now).
- **Site sprites live on `::before` / `::after`** (pager arrows, verified badges, rank digits). Reusing such a pseudo-element means resetting `background`, `width`, `height` and `margin`.
- **`:visited` can only change colours.** A read / unread difference must be a colour of something present on every row.

## Performance rules

Before the October 2026 audit, every DOM change restyled the whole document (reader: about 5,300 elements, about 29 ms per change). Check every new selector against these rules.

- **No page-level `:has()` gates.** That means no `html:has()`, `body:has()` or `:root:has()`, and no `:has()` on a page container (`#wrap`, `#content`, `.cont_box`) in front of a descendant.
  - Put page state in a JS-set attribute or class (`html[data-wt-dashboard]`, `body.wt-*`) or use a server-rendered id: the reader layout uses `#_bottomDisplay > …`.
  - `html:has(.logo_dashboard)` restyled every page on every DOM change. `.cont_box:has(> .aside.viewer) …` restyled about 920 elements per comment change.
- **`:has()` goes in the subject** (`.a:has(> .b) { … }`), with a tight argument: `> .child`, `+ .sibling`, a class.
  - A non-subject `:has()` is acceptable only on a small component root (comment item, `.wcc_Editor__editor`, `.section_header`).
  - Avoid attribute arguments: they make Blink's pre-filter pass for nearly every insertion.
- **No featureless subjects** (`*`, `> *`, bare `::before` / `::after`, `::first-line`) under `[class*=]` or `:has()` ancestors. Each class change then restyles the whole subtree.
- **Use plain classes.** WCC names are unhashed: write `.wcc_X__y`, not `[class*="wcc_X__y"]`. Keep `[class*=]` / `[class^=]` for real prefixes (`ico_`, `txt_ico`, `g_`) and the community app's hashed CSS-module names. No new `[class*="btn_"]`-style patterns.
- **No long `:is()` subjects:** a 20-argument `:is()` lands in the universal bucket.
- **No `backdrop-filter` on repeated elements** (badges, discs, tiles), the user's B4 call: use an opaque or high-alpha fill. Blur stays only on single large surfaces: the login backdrop, the community top bar and tab bar, and the popup dim.
- **No infinite animations,** and no `!important` on an animated property.
  - The neon "breathing" never showed (an important `box-shadow` beats keyframes) yet repainted every frame, so it was removed (B1).
  - The only infinite animation is the Like flame's flicker, and only while hovered.
  - Animate `opacity` / `transform`.
- **Keep large blurs off tall surfaces:** the comic strip has one `0 16px 40px` shadow. The old halo was about 90 % of the reader's scroll raster cost (B2).
- **Skip off-screen animated content:** `.wcc_MediaContent__imageWrapper` uses `content-visibility: auto` (comment stickers' SMIL loaders).
- **Gate structurally.** Anything needed at first paint must not wait for a late JS class. Never use a CSS `:has()` fallback for page type: Webtoons briefly gives `#content` the class `viewer` on other pages.
- **Measure:** `perf.mjs` / `perf-report.mjs` before and after; `style-diff.mjs` to prove a refactor is invisible.

## Colour and accessibility

### Palette roles

- **Surfaces:** `--wt-bg #15171a` is the page and `--wt-bg-elev #22262b` the cards. `--wt-bg-elev2`, `--wt-bg-hover` and `--wt-bg-input` are controls.
- **Text:** `--wt-text`, `--wt-text-body` (`#d2d6dc`, long text), `--wt-text-dim` (secondary). `--wt-text-read` (`#9aa1ab`, ≥ 4.74:1 on every surface) is for small muted text. `--wt-text-mute` (`#979ea8`, ≥ 4.57:1 on every surface) is the faintest text colour and stays a shade under `--wt-text-read`. Any new grey for text must also clear 4.5:1 on `--wt-bg-hover` (`#30353c`).
- **Green:**
  - `--wt-accent #00d564` / `--wt-accent-soft` mark selection and hover.
  - Primary buttons are the **key**: white text on `--wt-key` (`#157f45 → #0f6a39`), hover `--wt-key-hover` (`#18874b → #127843`), edge `--wt-key-edge`.
  - White must be at least 4.5:1 on every stop (B5). No `brightness()` on key hovers.
  - Never black text on bright green (the user rejected it).
  - Selected tabs, the pager's current page and sort switches are a green-**tinted** chip (`rgba(0,213,100,.14)`, `--wt-accent-soft` text, green ring), never solid green.
- **Amber** (`#ffc233`; text on amber `#fff1d0`, hover `#ffd666`) means "heads up": NOTE, age-rating notes, the NOTICE chip, hiatus, TOP comments, the CANVAS reader age strip. Keep it off actions, except the user's picks: the profile Follow key, Redeem Free Coins and the comment send icon.
- **Coral** is Patreon. The **orange flame** (`#ff6a24`, core `#ffd25e`) is likes. **Red** is destructive or a downvote.
- **`::selection`** is blue `rgba(84,140,230,.5)` with white text (the user's call).
- **Gone:** `--wt-text-on-accent`, `--wt-name`, `--wt-heart` and `--wt-neon-dim` were removed.
- Run `palette-contrast.mjs` after any token change.

### Accessibility rules

- **WCAG AA** (B5): 4.5:1 for text, 3:1 for focus indicators and UI parts.
- **Focus ring:** `:focus-visible` gets `outline: 2px solid var(--wt-text-read)` with a 2 px offset. A component that removes the outline draws its own at 3:1 or better (for example, the comment menu's green left bar).
- **Reduced motion:**
  - The `@media (prefers-reduced-motion: reduce)` block sits near the top of `theme`, so **every selector in it starts with `html`** to outrank the later `:hover { transform }` rules.
  - Every motion the theme adds needs an entry there, with the exact selector, including `:focus-visible` variants.
  - Rotated chevrons keep `transform: rotate(45deg)` there, not `none`.
- **Forced colours:** the theme switches off (`themeActive()`). Don't add a `forced-colors` block.

## Page gates and scoping

| Gate | Set by | Used for |
|---|---|---|
| `body.wt-viewer` / `wt-detail` / `wt-home` | `routeBodyClass()` (URL, before first paint) + `syncBodyClasses()` | vignette, reader-only rules, `topBtnCss` |
| `html[data-wt-dashboard]` | path at document-start, never changed | Creator Dashboard |
| `html[data-wt-vignette="off"]` / `[data-wt-auth="pending"]` | `applyVignette()` / `watchLoginState()` | vignette off / hide LOG IN |
| `#_bottomDisplay` (server-rendered) | site | reader rankings row + comments layout |
| `#app[class*="BaseLayout_container"]` | site | community app |
| `.wcc_App__root`, `#wcc_root`, `.wcc_layout_mobile` | WCC | comments, post pages, mobile comments |

### Mobile site

`routeBodyClass()` sets nothing off www, so no `body.wt-*` rule applies on `m.webtoons.com`. Desktop rules that leaked broke mobile, so these scopes must stay:

- **Header menu:** `:where(#header) .lnb …` / `#header .lnb …`. On mobile, `.gnb` / `.lnb` are the mobile header, which has no `#header`; desktop sizing pushed its MY tab off-screen.
- **Pagers:** every generic pager rule starts with `div.paginate`. The mobile reader toolbar is `span.paginate` (◀ #N ▶) and keeps the site's styles.
- **Login rows:** style `.login_sns .btn_sns`, never bare `.btn_sns`. Mobile draws its reader share icons and the creator sheet as `.btn_sns` sprites.
- **Home section headers:** `.section_header…:where(:not(.main_content_wrap > *))`. Mobile headers are 42 px children of `.main_content_wrap`. The unscoped `.main_section_tab .button` only styles the mobile tabs.
- **Comments (`.wcc_layout_mobile`):** the desktop geometry left a 182 px text column on a phone. Mobile uses 18 px panel padding, a 36 px avatar in a 46 px column and 16 px text; replies have 30 px avatars and the rail at `left: 17px`; TOP blocks are inset −10 px; the logged-out composer hides WCC's bare send button.
- **Left as the site's look:** the mobile header (a light bar; a possible later look decision) and the app popup.

## Component invariants

Each rule's comment holds its full spec. These are the constraints a session must not break.

### Stacking, vignette, popups

- **Vignette:** `html:not([data-wt-vignette="off"]) body.wt-*::before`, fixed, `z-index: 9999`, `pointer-events: none`.
  - It shades **only the empty margins** of the 1200 px column (B3): `--wt-vig: max(0px, min(50% - 600px, 100% - 1300px))`.
  - It uses `%`, not `vw`, because of the scrollbar; the second term handles the 1400 px page scrolled sideways.
  - It lives in the theme CSS, so it goes away with the theme.
- **Painting above the vignette** needs `z-index: 10000` and a way out of `#container`, which is a `z-index: 10` stacking context.
  - `#header`, `.snb_wrap`, `.tool_area` and `.go_top` are 10000.
  - The reader sets `body.wt-viewer #container { z-index: auto }`.
  - The Top CANVAS filter panel is 10001 with `isolation: isolate`; the login layer is 10002.
- **Confirmation popups (`.ly_area`):** `.ly_area .ly_cont` is `#000` in the base. Recolour the text and hide the `.ico_arr` pointer. Never set `display` on `.ly_area`: the site opens it by adding `.on`.
- **Mature notice:** `.ly_wrap .ly_box:has(> .ly_adult)` is a dialog card with an amber badge, No as glass and Yes as the key. Its dim is one layer, `#_dimForPopup.ly_dim` (.72 plus blur); `.bg` stays transparent as the click target.

### Header and sub-nav

- **Selected menu item:** `#header .lnb a[aria-current="true"]`. The old `.gnb .on` never fires, and `.gnb` is the mobile list.
  - It is a **static** neon sign (B1): the `--wt-neon` ring, glowing pale text, and a 10 px `--wt-flower` on each side inside the 20 px padding, so the menu never shifts.
  - It flickers on once (`wt-neon-on`, opacity) and blooms (`wt-bloom`). There is no breathing.
  - Its text is in an `<h1>`, so keep `#header a[aria-current="true"] h1 { color; font-size: inherit; font-weight: inherit }`.
- **Header rhythm:**
  - Every control is 40 px on one centre line, in one face (system-ui, `.06em` tracking, 700; DASHBOARD and LOG IN uppercased).
  - The menu is 18 px and the right-hand links 14 px: one step apart, never equal.
  - Hover is a light pill with white text.
- **Header right side:**
  - DASHBOARD, `#btnLogin` and search are one glass set.
  - Style `#btnLogin`, never `.link_login`, which the logged-in `#btnLoginInfo` shares.
  - Both buttons need the `[style*="none"]` guard.
  - `#btnLoginInfo` is not uppercased (it shows the user's name). Its menu `#layerMy` is the dark menu panel, with Logout under a hairline.
  - Link hover needs the `#header .header_right .link_menu` prefix.
- **Sub-nav:**
  - The separator is `.snb_wrap::after` (`z-index: 10`), not `border-bottom`: `.snb_inner` paints over the parent's border.
  - Tab hover is a pill on `.snb_tab::before` (`inset: 12px -12px`, `z-index: -1`, the tab `isolation: isolate`).
  - Never `font-size: inherit` on the active tab: its `<li>` is 12 px.
  - The scroll arrows (`.snb_wrap .snb_inner .btn_snb_*`) centre their 34 px disc from the midpoint (the button is narrower than the disc), and the site toggles their `display`.

### Search, notice, footer, banners

- **Search:** `.search_area` is the panel; `.search_cont` only wraps the header button (boxing it or `.ly_autocomplete` stacked frames).
- **NOTICE:** rules need `#noticeArea`, or `#footer a` outranks them. The chip is amber.
- **Footer:** hover rules need `#footer` in the selector (ID weight). Facebook / Instagram / X / YouTube are mask buttons; filtering their disc sprites gave blank discs.
- **`.contest_banner`:** the anchor is transparent (the site's guessed strip colour mismatched the creatives) and **must not clip**, or the rounded `<img>` card loses its shadow.

### Listing pages (home, /originals, /genres, /ranking)

- **Cards:** card grids are flat tiles in one elevated section (`--wt-bg-elev`, no border, soft shadow, 16 px radius).
  - Hover darkens the cover (`brightness(.7)`) and turns the title green. No per-card lift or shadow: two elevation layers read as "double volume".
  - `.view_count` / `.grade_num` are always green, like the heart.
- **Rank numbers:** `.ranking_number_N:before { content: "N" !important }` for N = 1–30, unscoped (home and /rankings). The sprite stops at 10, and /rankings goes to 30.
- **Home section headers** (desktop only):
  - 26 px title behind a green bar, `.button_view_all` a ghost pill, `.main_section_tab` glass pills with a tinted selected chip.
  - The selector `:not(:has(> .series_count))` leaves the /originals header alone.
- **/originals header** (`.section_header:has(> .series_count)`):
  - The sort links are a full-width row (`flex: 1 0 100%`) of three equal 44 px segments.
  - The count is a quiet 13 px note (the user found a large count too loud).
  - The header wraps (`height: auto`).
  - Scope everything to `.section_header`: `.sort_area` is also the /canvas dropdown.
- **Genre colours:** `.genre.g_*`, `.g_*` and `a.g_*`, lightened for AA. The grey fallback is `.genre:not([class*="g_"])`.
- **Sort dropdowns** (`.sort_area .checked` + `.sort_box`): the open state keys off `[aria-expanded="true"]`, never `:focus`.

### /canvas

- **Two DOM families** need parallel rules: home is `.discover_*`; genre lists are `.challenge_cont_area > .challenge_lst > ul > li > a.challenge_item`.
- **List layout:** 800 px grid card + 24 px gutter + 296 px rail; the banner, Top CANVAS and Up & Coming are the rail's width, **16 px apart** (B8; `.aside.challenge .ranking_lst.viewer { gap: 16px }`). `.challenge_cont_area` needs `box-sizing: border-box` (or the rail drops below) and `overflow: visible` down the list; `.ban_area` needs `aspect-ratio: 1` (its image is absolute).
- **Covers:** `.img_area` is the rounded, clipped box, never the anchor (that clipped the text). Hover is darken + green title, as on every listing page; a zoom + ring was rejected.
- **Sort:** `.sort_area._sorting` is a segmented switch (option `<ul>` always shown, `width: auto`, trigger hidden) and the JS listener navigates. Scope it with `._sorting` so the `._filterArea` dropdown keeps its rules.
- **Genre labels** on lists and the rail get their `g_*` class from `tagGenreLabels()`.
- **Home:** `.discover_lst` is a 6-column grid; Popular By Category hides the other genres inline, so it needs the `[style*="none"]` guard. The cards grow outward (−24 px side margins) so the site's tiles keep their place, 24 px apart.
- **"Recommended series":** never change the 1130 px `.discover_spot_rolling` width (the flicking JS pages by it). Prev / dots / next (`.paging`) are one capsule on the header row (the user's request).
- **Cover chips:** `.badge_discover` is a solid `#14171b` chip. The status sprites beside it (`.discover_badge_area > [class^="txt_ico"]`: END, hiatus) are white discs, inverted to dark (`invert(.9) hue-rotate(180deg)`, then `brightness(1.7) saturate(1.6) contrast(1.15)` so END reads bright green: the user's call; the profile's END badges use the same chain). `.badge_new*` gets the gold filter chain (`brightness(.62)` → sepia → saturate, no hue step) with a trailing `drop-shadow()`, since a box-shadow would be filtered. `.badge_up*` must **not** be filtered.
- **Weekly round-up** (`#_challengeRoundUp`, in the reader): never change the 1032 px `.challenge_spot_rolling`, 188 px tiles or 23 px gaps (the carousel relies on them). The card is `.challenge_spot_inner` (1200 px, 84 px side padding); the viewport clips, so hover rings are inset.

### Ranking cards (reader sidebar + /canvas rail)

- **One component** for Trending & Popular, Top Originals, Top CANVAS and Up & Coming: `.ranking_lst.viewer > .lst_area`, styled only in the "Ranking sidebar cards" block. **No id-scoped rules** (`#challengeGenreRanking`, …): they made Top CANVAS differ from Up & Coming (B7). Never wrap a card in JS elements.
- **Header:** the link is stretched over the h2 (`z-index: 1`). /canvas headers are a `<span>`: no pointer, no hover cue, and no `.ico_arr1` chevron (it promised a link; hiding it also makes room for the green bar and a long genre pill such as SUPERNATURAL in the 262 px header).
- **Rail rows** (all `.aside.challenge`-prefixed): the episode list's tiles (`.025` surface, 6 px apart, `.055` + green hairline on hover); the rank is the reader's solid `#14171b` badge on the 60 px cover's corner (`.num_area` absolute in the `position: relative` link); titles clamp to 2 lines; headings get the green bar on `h2::before`.
- **Reader:** `#_bottomDisplay > .aside.viewer` (`order: -1`) puts the cards in a row above the comments, each a 5-column grid of covers with solid `#14171b` rank badges; `.ranking_lst.viewer` gets `width: 100%`. Every horizontal rule is prefixed `.aside.viewer`, so the rail stays vertical.

### Series page

- **Layout:** `.detail_bg + .cont_box` stays transparent (or the artwork is hidden). `.aside.detail` is pinned at `box-sizing: border-box; width: 389px`: any wider and it drops under the list.
- **Pager** (`div.paginate:not(.v2):not(.episode_lst *)`): stays `display: flex` (`block` turned the sprite `::before` into a full-width line); no `position` / `clear` rules; hover is `a:not([aria-current="true"])` so the current page keeps its pill; idle pages and arrows are 36 px glass pills with bright 600 digits (grey digits were easy to miss, the user's call); the hide rule is `> :not(.blind)` so the accessible names survive.
- **Episode rows** (`li.detail_list_item > a.detail_list_link`):
  - Rows are faint tiles (`.025`) with no dividers.
  - The title is 19 px, capped at `30ch`. On hover it unwraps to 3 lines × 24 px, which fits beside the 73 px thumbnail, so the row never changes height.
  - `.date` (104 px) and `.like_area` (72 px) have fixed widths so the columns align. They are 14 px, weight 400 (likes 600).
  - `#N` (`.tx`) is a solid `rgba(10,12,14,.86)` badge on the thumbnail, not a column.
  - `.thmb` keeps `overflow: hidden` for the zoom.
- **Read state:**
  - The marker is one `.subj::before` dot: green when unread, a grey ring filled `#272b30` when `:visited` (`#2e3237` on a hovered row). Change it together with the row surface.
  - The `:visited` rules tie with the hover rules and come later, so every hover colour is restated as `…:hover .detail_list_link:visited …`.
- **Likes:** a flame drawn as **two masks** (`--wt-flame-mask` + `--wt-flame-core`), so `:visited` can grey it. Never a coloured image.
- **Sidebar:**
  - **Status band:** `.day_info` turns amber when `:has(.txt_ico_hiatus)` (untested live).
  - **Synopsis:** the site's face at 17 px, regular, flat on the card (a recessed panel was rejected).
    - Only `.wt-summary-toggle[hidden] { display: block }` shows the toggle; its state is `aria-expanded`.
  - **Read buttons** (`.btn_type7`): a leading icon on `::before`; `.ico_arr21` hidden; labels stay the site's.
    - `#continueRead` needs the `[style*="none"]` guard.
    - When Continue reading is visible, `#_btnEpisode` steps down to an outline.
  - **Patreon:** coral (green is reserved for the read button).
    - `p[data-wt-zero]` hides "$0".
    - `.age_text` needs the `[style*="none"]` guard: Crow Time showed an empty amber box without it.
- **NOTE (`.detail_paywall`):** an amber banner with a megaphone.
- **Header, Originals:**
  - The text sits on an edgeless radial scrim (`.info::before`) with text shadows. **No plate or box:** it hides the cover art, and the site colours the text per cover.
  - Title sizes: `.subj:has(br)` is 38 px everywhere; a CANVAS `long_text` title is 36 px.
- **Header, CANVAS (`.info.challenge`):** the background is a flat colour, so the block is a solid `width: fit-content` card, laid out as a grid (`fit-content` of a wrapping flex row is one line).
- **Header discs:** solid `rgba(12,14,17,.7)`, never frosted (B4). `.btn_favorite.on` gets a `--wt-ico-check` mask: the site's tick is a sprite the fill hid.
- **Creator popup (`.ly_creator`):** entries are flat siblings, separated by `.by ~ .by`. `a.link::after` is the verified sprite, so the hover chevron goes on `.title:has(> a.link)::after`. Empty `.sns_area` holds whitespace: test `:not(:has(a))`.

### Reader

- **Comic strip** (`.viewer_img._img_viewer_area` / `#_imageList`):
  - ONE shadow on the container, `0 16px 40px rgba(0,0,0,.7)`, never per image: per-image shadows seam at every panel join.
  - It keeps a 16 px radius with `overflow: hidden` (B2), which rounds the first and last panels' outer corners; README says so.
  - `width: fit-content; margin: 0 auto` puts the shadow at the image edge.
  - `font-size: 0; line-height: 0` on the container plus `display: block` on `img._images` remove the gaps between panels.
  - Only `.viewer_lst` needs `overflow: visible`.
- **Toolbar:** `.tool_area` is 10000 (needs the `#container` fix); its icons are 36 px mask discs; `.paginate.v2` (prev / #N / next) is excluded from the page pager. The CANVAS `.age_text` band is amber: change only its colours, the viewer's top padding is sized for it.
- **After the comic:** one block, declared after the generic WCC rules so it wins by source order. The end card (`.viewer_info_area`) is 800 px; the episode strip and `.induce_app_area` are 1200 px, on the comments grid.
- **End card:** Like and Subscribe are equal 60 px keys. Liked is `.lnk_like.bx:is([aria-pressed="true"], :has(> .ico_like2.on))` (the site marks it with `.on` on the flame): solid `#c2410c → #9a3412`, white text, a flame burst.
- **Share icons** (`.spi_area a[class^="ico_"]`): masks, with the per-network `--wt-share` / `--wt-brand` variables set unscoped. The end card, the series header and the toolbar all use them.
- **Report** (`.report_area .lk_report`, CANVAS only): pinned into the end card's corner (`right: calc(50% - 400px + 20px)`), `width: auto; white-space: nowrap` (the site fixes 78 px), `z-index: 60` (the share row is 50).
- **Patreon card** (`#_viewerBox > .viewer_patron_area`): coral. `data-wt-zero` hides "$0".
- **Episode strip (`#bottomEpisodeList`):**
  - **Size:** style the wrapper, never the carousel. The JS measures `.episode_lst` / `.episode_cont` and pages the `<ul>` by inline `left` / `width`.
    - Change heights only (150 px for 2-line titles).
    - Fewer than 9 episodes are centred; `ul:has(> li:nth-child(9))` restores start alignment, so paging stays pixel-identical.
  - **Tiles:** change only by `transform`. `a.on` is reset to `margin: 0; width: 92px` (same effective width), and its ring is an **inset** shadow on `.mask` (an outer ring is clipped on the first tile).
  - **Arrows:** slim 30 × 87 px glass tabs in the side gutters (`top: 12px`, `left / right: -8px`), as tall and as rounded as the covers; round discs looked pasted on (the user's call). A disabled (`.off`) arrow stays faint; both hide only when both are `.off`. Strip rules are prefixed `.episode_area#bottomEpisodeList`; `#topEpisodeList` is the toolbar dropdown's strip.
- **App banner (`.induce_app_area`):** don't clip `.img_area`, because the `.preview` badge hangs off its edge. The QR code keeps a white tile so it stays scannable.
- **Creator card (`.creator_note`):** a grid with `.author_area { display: contents }`; `--wt-avatar-none` without a `.profile`; one linked creator stretches the link's `::before` over the card (its `::after` is the verified sprite).

### Comments (WCC)

- **Tokens first:** the theme re-declares WCC's dark `--wcc-*` / `--wte-*` set at `html:root` (it beats WCC's light `:root`). Per-element rules only shape and lay out.
- **Comment count** (`.comment_head .count`): a neutral glass pill with the figure and the bubble icon in amber (the user's call).
- **Font:** `.wcc_App__root`, all its descendants and their pseudo-elements use the system UI face, not Hind.
- **asurascans model** (the user's reference): one panel (`.wcc_CommentList__list`) of flat rows split by hairlines, no per-comment cards. Text 18 px `#eef0f3`, names 17 px, dates 14 px on a shared baseline, 48 px avatars (replies 17 / 16 / 40 px). Long text is clipped at `8em`.
- **Votes and Reply:** grey icon buttons under the text, votes first (`.wcc_CommentReaction__root { order: -1; margin-left: -10px }`), green up / red down on hover and when cast. A toggle with replies (`data-wt-replies` > 0) is a neutral glass pill (green was too loud).
- **TOP / NEWEST:** the panel's header strip, with the active tab on a 3 px green underline. WCC's `::after` underline is hidden.
- **TOP comments** (`.wcc_CommentItem__root:has(.wcc_TopBadge__root)`) are amber blocks.
  - **Alignment:** `margin: 12px -16px` keeps them aligned with the flat rows.
  - **The real badge is hidden and unstyled.** A chip is drawn on `…__inside:has(TopBadge) > .wcc_CommentHeader__root::after` as name · TOP · date (`::after` `order: 1`, the date `order: 2`).
    - The user rejected the inline chip and the right-pinned chip.
    - The chip is dark amber: `#1d1704` fill, amber border and letters (the user's choice over pale amber, violet and green).
  - **Thread:** a TOP comment's reply thread stays inside the block on a fainter wash with a dimmer left edge (`rgba(255,194,51,.45)`), the user's call. A full wash and a dark cut-out were both rejected.
- **Reply threads:** one rail at x = 23 px, no elbows; each reply is a faint `.025` tile (bordered cards boxed the thread in).
- **"More":** a full-width bar fused to the panel's bottom; inside a thread, a plain green row.
- **Kebab menu:** one Radix panel of plain 40 px rows; `[data-highlighted]` is a `.12` tile plus a green left bar (items have `outline: none`); Cancel, the last item (translated label), sits under a hairline.
- **Composer, logged out** (`.wcc_Editor__editor:has([contenteditable="false"])`): an input bar (bubble icon, the site's `attr(data-placeholder)` prompt, a green arrow). Clear `.wcc_Editor__replyContainer`'s `min-height: 9.75rem`.
- **Composer, logged in:**
  - A card whose last two children, `__spoilerWrapper` and `__actionBar`, share the bottom row.
  - The send icon's paths carry their own colour classes, so they are recoloured directly: **amber** when active (the user's call), a faint disc when disabled.
  - The Spoiler checked state is `input:checked + .wcc_Spoiler__slider`. Its root is a `<button>`, so it gets its own hover.
- **Pickers:** the emoji picker (`<em-gw-emoji-picker>`) gets `--rgb-*` / `--color-border*` on the host, and its `#nav` needs `darkenEmojiPickers()`. In the GIF and series pickers the inner `<input>` drops the generic box.
- **No `::-webkit-scrollbar` rules:** Chromium ignores them once `scrollbar-color` applies.

### Login, account and "my" pages

- **Login popup:**
  - `.ly_dim._loginDimLayer` is hidden. `.ly_wrap._loginLayer` is the only backdrop (`rgba(5,6,8,.72)` + blur, `z-index: 10002`), and `._loginComponentParent` is the card.
  - Every rule is scoped `:is(.ly_wrap._loginLayer, .login_wrap)` so `/member/login` matches. The text colour is set on `… .login_content_wrap`.
  - The Email, Apple and X sprites are black, so they become white masks.
- **Age gate:** the controls are anchors: `a.btn_type9._btn_enter` (Continue, the key), `a.lk_continue._skipAgeGate` (plain underlined text), `a.lk_month`. No `<button>` rules, no `.month *` rule; `.list_month` is one frame.
- **Account:**
  - `.btn_lineset` is a switch whose knob is a `radial-gradient` layer slid by `background-position`; a `::before` knob never rendered.
  - The generic glass `:hover` list excludes `.delete_btn` (red) and `.register_btn` (amber key, the user's call). Keep any button with its own hover out of that list.
  - The nickname check / save buttons swap inline, so they need the `[style*="none"]` guard.
- **My Comments:** the items are tiles in a 2-column grid (`.my_comments ul:has(> .my_comment_item)`), each a flex column with the button row pinned to the foot (`margin-top: auto`): full-width rows of short comments left the card two-thirds empty (the user's call). Your own vote chips (`:disabled` / `.unable_alert`) stay visible as chips and static on hover (the user's call). A cast vote (`aria-pressed="true"`) gets a stronger fill plus a ring.
- **/mycreator, /favorite:** `.my_wrap.edit_mode` toggles Edit / Select All, so `.edit_mode .right .edit` and `:not(.edit_mode) .link_select_all` restate `display: none` against the pill's `inline-flex`.
- **Testing:** logged-in and coin / redeem / invite pages can't be crawled. Check them on the user's saved HTML or on injected mock markup.

### Creator Dashboard (`/<lang>/creators/…`)

- **Tokens:** its CSS paints from `--background-*` / `--foreground-*` / `--line-*`, declared light on `:root`, `::before` and `::after`. The theme re-declares them on `html[data-wt-dashboard]` **and** on its `::before` / `::after`.
- **Buttons:** inside `#wrap` / `dialog`, buttons drop the generic box. `.button.type_green` / `_black` / `_gray` / `.drop_button` restate their looks.
- **Icons:** sprite icons are inverted. Pseudo-elements can't go inside `:is()` (the entry is silently dropped), so list them separately.
- **Testing:** it needs a logged-in creator. Use the user's saved HTML (`<base href="https://www.webtoons.com/">`, scripts removed).

### Community app (`/p/community/…`)

- **Scoping:** `#app[class*="BaseLayout_container"]` (popovers, toasts and tooltips are portalled outside it). The button reset is `button:where(:not(#wcc_root *))`: unscoped it beat WCC's vote colours, and a bare `:not(#wcc_root *)` adds ID weight and beat the Follow rules. Small muted text uses `--wt-text-read`.
- **Profile card layout** (the user's call): `HomeProfile_root` is a grid (`1fr auto auto 1fr`); `HomeProfile_actions` is `display: contents`, so the social button (`SocialLinkTrigger_root`, a 30 px disc) sits in row 2 after the name (`HomeProfile_nickname`, row 2 col 2) and Follow / Following spans the full width. The avatar, bio, link and metric span all columns and auto-place. An unknown direct child would auto-place into the empty cell beside the name: give it `grid-column: 1 / -1`.
- **Series / Followers tiles** (`CreatorBriefMetric_*`, full width, `flex: 1 1 0`): violet (wash, hairline, `#ddd6fe` label) with amber `#ffc233` figures, the user's call: grey read as filler, all-amber tiles blended into the Follow / Following key.
- **Social link button** (`SocialLinkTrigger_icon`): the network's brand fill (`--wt-sns`, picked by `:has(img[src*="instagram"])` etc.; other networks a brighter glass disc), so it stands out beside the key. It needs `background-origin: border-box`: from the padding box the gradient repeated under the 1 px border (coloured rims at the top and bottom).
- **Post ⋮** (`MoreActionMenu_button`): its dots are filled `var(--gw-icon-05)` in the SVG, so `svg path { fill: currentColor }`; a 36 px glass disc with bright dots.
- **Follow** (`ProfileActionButton_follow__`, double underscore so "following" can't match) is an **amber key**, the user's choice. Following (`…following__`) is an amber outline with a tick.
- **Series swiper:** Swiper measures slide CSS widths, so `swiper-slide` is `calc((100% - 36px) / 3)`; `CreatorTitles_content` and `swiper-container` need `height: auto`. The type · genre line (`CreatorTitleItem_textWrap`) wraps, so a long genre (SUPERHERO) drops to its own line instead of being cut mid-word.
- **Folded bio** (`ExpandableProfileBio_folded.LinesEllipsis--clamped`): the site's `-webkit-line-clamp` is lifted (the app already cut the text; in our wider font "... more" could wrap under the clamp and vanish), and `.LinesEllipsis-ellipsis` is a green text button.
- **Popover menus** (`PopoverItem_button`: Share / Report / Block): no `min-width`, 24 px side padding, so the panel hugs its short labels.
- **Post pages:** `#wcc_root`'s tabs, list and More get 15 px side margins to sit in `DetailPost_root`'s gutter.

## Diagnosing a broken selector

1. Find the element's real classes on the live page, or in the crawl's DOM snapshots and bundles (`.claude/audit/dom/*.html.gz`, `.claude/audit/bundles/`, refreshed by `coverage.mjs`).
2. Confirm the class exists before you write CSS.
3. `grep -n 'class_name' webtoons-dark-mode.user.js` to find the existing rule.
4. Edit that rule (or add one), with `!important` and within the performance rules.
5. Verify with `shot.mjs`, and with `style-diff.mjs` when nothing else should change.

DevTools' Computed tab shows which rule wins.

## Local tools

The tools are in `.claude/tools/`, which is gitignored, so they exist on this machine only. They are Node scripts with no npm packages that drive the system Chrome over CDP.

| Tool | Purpose |
|---|---|
| `shot.mjs <script\|-> <url> <outPrefix> [selector…]` | Screenshots page regions with the script injected at document-start (`-` = theme off). Env: `W`/`H`, `JS`, `HOVER`, `RANGE`, `TOP`, `VIEW=1`, `DUMP`, `PREFS="wt_vignette=false"`. |
| `style-diff.mjs <old.user.js> <new.user.js> <page>…` | Computed-style diff of every element and pseudo-element; it swaps the CSS in place on the same DOM. It proves a refactor is invisible, except for hover / focus. `name=URL@mobile` uses a phone viewport. |
| `js-checks.mjs <script>` | Live JS behaviour scenarios: storage paths including async GM, page-class timing, toggles. |
| `perf.mjs [opts] <url>…` | Theme off vs on, plus `--variant` ablations: load, idle, scroll, full-restyle cost, selector stats. |
| `perf-report.mjs [a.json] [b.json]` | Markdown tables from `perf.mjs` runs, or a comparison of two runs. |
| `coverage.mjs` | Crawls the site to find which theme selectors still match; saves bundles and DOM snapshots. |
| `palette-contrast.mjs <script>` | WCAG / APCA ratios of every text token on every surface token. |

- For an "old" copy: `git show HEAD:webtoons-dark-mode.user.js > <scratch>/old.user.js`.
- `.claude/tools/perf/` holds lower-level probes (`probe.mjs`, `summ.mjs`, `layers.mjs`, …).
- **Chrome is only ever launched with `--headless=new` and a throwaway `--user-data-dir`.** On Windows even `chrome.exe --version` opens the user's real browser. Read the version with `(Get-Item 'C:/Program Files/Google/Chrome/Application/chrome.exe').VersionInfo.ProductVersion`.

## Browser extension

The same theme also ships as a browser extension, **Toonlight: Dark Mode for WEBTOON** (short name Toonlight), for Chrome, Edge and Firefox, built from the userscript. Unlike the userscript, the extension starts dark on first run (the user's call): `gm-shim.js` seeds an empty localStorage mirror with `true`.

- `node tools/build-extension.mjs` writes `dist/chrome/` (Chrome and Edge: the same package), `dist/firefox/` and a zip of each for the stores. `dist/` is not committed.
- The extension runs `extension/gm-shim.js` and then the userscript body **unchanged**, as a `document_start` content script on www and m.webtoons.com. The shim provides `GM.getValue` / `GM.setValue` on `chrome.storage.local` and no `GM_getValue`, so the script takes its async path: the first paint uses the localStorage mirror, as in Greasemonkey 4. It also collects `GM_registerMenuCommand` entries for the toolbar popup (`extension/popup.*`), which lists and runs them in the open tab.
- **Never put extension-only code in the userscript.** Extension needs go in the shim or the popup.
- The Firefox manifest adds `browser_specific_settings.gecko`: an ID (`toonlight@hervad`; it can never change once the add-on is on AMO), `data_collection_permissions: { required: ["none"] }` (required by AMO) and `strict_min_version` 142.
- Icons: `python -I tools/make-icons.py` (Pillow) redraws `extension/icons/`.
- Name, description and add-on ID are constants at the top of `tools/build-extension.mjs`. The version is the userscript's `@version`.
- Test: `node .claude/tools/ext-test.mjs <outDir>` loads `dist/chrome` into headless Chrome through CDP `Extensions.loadUnpacked` (branded Chrome ignores `--load-extension`), then checks the theme, the popup menu, persistence across a reload and the shortcut. Validate the Firefox build with `npx web-ext lint --source-dir dist/firefox`.

## Release workflow

Release only when the user asks.

```bash
# 1. Bump BOTH (they must match): `// @version` (line 4) and `const VERSION` (line 33)
# 2. Add the CHANGELOG.md entry (Keep a Changelog; [Unreleased] → the new version)
# 3. Commit and tag (plain message, no Claude attribution)
git add webtoons-dark-mode.user.js CHANGELOG.md
git commit -m "vX.Y.Z: <what changed>"
git push origin main
git tag vX.Y.Z && git push origin vX.Y.Z
# 4. GitHub release
gh release create vX.Y.Z --title "vX.Y.Z — <short title>" --notes-from-tag
```

There are two install channels:

- **GitHub installs** auto-update from `raw.githubusercontent.com/…/main/…`, so a push to `main` ships to them.
- **Greasy Fork** (<https://greasyfork.org/scripts/577859>) rewrites the update URLs and syncs from the raw GitHub URL, about daily or on push with the webhook.
  - It publishes only versions with a bumped `@version`.
  - Its summary is `@description`; its long text is `greasyfork.md`.

## Manual test checklist

There is no automated suite. Check the pages a change touches, logged out unless noted.

**Test pages:**

- TOP comments: `/en/romance/office-romance-contract/episode-1/viewer?title_no=10487&episode_no=1`
- Creator profile: `/p/community/en/u/OutcastStudios`
- Feeds: `/p/community/en/feeds?tab=following`
- CANVAS with Patreon: Crow Time, Slack Wyrm, Spicy Mints

### Script and settings

- [ ] Hard reload: no light frame. The console shows `vX.Y.Z starting`, then `fully loaded`.
- [ ] Alt+Shift+T / Ctrl+Alt+D toggle the theme (AltGr text such as Đ / ð does not; holding the keys toggles once), Alt+Shift+N dims the panels only, Alt+Shift+V toggles edge shading. Every choice survives a reload.
- [ ] Menu entries name their action, relabel after every change (shortcuts too) and keep their order. Scroll-to-top hiding affects episode pages only, also with the theme off.
- [ ] Theme off: nothing dark left, no stray button, no added genre colours. Theme on again: everything back without a reload.
- [ ] A Windows contrast theme turns the theme off. Greasemonkey 4 / Userscripts: the theme applies and the settings persist.
- [ ] Keyboard focus shows a 2 px light-grey ring. Reduced motion: no lifts or zooms, a static neon item, and the strip thumbnails still load.

### Header and listing pages

- [ ] Header:
  - the active item is a static neon sign with flowers, flickering on once, and the menu never shifts;
  - every control is 40 px on one line;
  - WEBTOON SHOP / CREATORS hover.
- [ ] Logged in: no LOG IN beside the name and no LOG IN flash, also after reading an episode. Logged out: LOG IN shows.
- [ ] Sub-nav: one continuous separator, bright tabs at the right edge, a 16 px green active tab, a pill hover, centred scroll-arrow chevrons.
- [ ] Search is one panel with a visible × and no gap after a bold match. NOTICE is an amber chip. Footer social buttons turn brand-coloured.
- [ ] Home / /originals:
  - cards darken and the title turns green on hover, with no lift;
  - green counts, coloured genres;
  - the /originals sort switch is its own row; /rankings shows ranks 1–30.
- [ ] Pager: 36 px glass pills with bright digits, centred chevrons, and the current page keeps its green pill on hover.

### /canvas checks

- [ ] Home: three matching cards 24 px apart. Recommended series has its ‹ • › capsule on the title row. 6-column tiles; END / hiatus badges on covers are dark discs (also on the lists). A category click shows one row; "more" is a pill with a chevron, green on hover.
- [ ] List: the sort switch re-sorts from page 1; 4 columns with no clipped border. The rail (296 px) has identical cards 16 px apart, the filter panel covers the rank numbers, and the headers have a green bar, no pointer and no chevron. Rows are faint tiles with the rank on the cover's corner and 2-line titles; a long genre (SUPERNATURAL) leaves "Top CANVAS" whole.

### Series page checks

- [ ] Header text sits on the art with no box, readable on light (Office Romance Contract) and dark covers. A two-line title clears the share row. CANVAS (Crow Time): a content-width dark card.
- [ ] Sidebar:
  - it stays beside the list;
  - a long synopsis is clamped with a toggle (and theme off shows it in full, with no button);
  - with Continue reading, First episode is an outline;
  - Patreon is coral;
  - no empty amber box (Crow Time) and no "$0" (Spicy Mints).
- [ ] Episode list:
  - long titles (Your Throne) end in "…" and unwrap on hover without the row growing;
  - the columns align;
  - read rows are muted and light up on hover;
  - #N sits on the thumbnail;
  - the pager is inside the card from first paint.

### Reader checks

- [ ] Strip: one card with rounded outer corners and one soft shadow, no seams, colours unchanged. Edge shading only in the empty margins.
- [ ] Toolbar icons at full brightness, matching discs. End card: equal 60 px keys; Liked is deep orange with a flame burst; Report is fully clickable in the corner.
- [ ] Episode strip:
  - 2-line titles;
  - the current tile is not clipped, even as the first tile;
  - a short series is centred with no arrows;
  - paging matches the site;
  - thumbnails load.
- [ ] Rankings: two cards of 5 sharp covers above the comments; the genre filter re-renders sharp covers. Mature notice (Slack Wyrm): one even dim.
- [ ] With the Chapter Preloader installed, its bubble is unchanged and nothing flickers.

### Comments checks

- [ ] One full-width panel of flat rows in the system font, the date on the name's baseline.
- [ ] TOP comments are amber blocks with a dark amber chip between the name and the date; an opened thread stays inside on a fainter amber.
- [ ] "Replies N" is a white glass pill. A long comment shows 5 lines and "More". ⋮ shows Cancel under a hairline.
- [ ] Logged out: an input bar with a green arrow. Logged in: one bottom bar, send amber once you type, a fully dark emoji picker.

### Login, account, dashboard, community

- [ ] Login popup: one dim + blur behind one card, white Email / Apple / X icons; `/member/login` matches. Age gate: a single-frame month list.
- [ ] No green button anywhere has black text.
- [ ] Account: Delete turns red on hover and Redeem stays amber; one of Check / Save at a time.
- [ ] My Comments: tiles two to a row, the vote chips and trash at each tile's foot; your own chips static, a cast vote ringed. /mycreator, /favorite: Edit hides in edit mode.
- [ ] Dashboard: dark sidebar and fields, light icons, an open dropdown joins its field.
- [ ] Creator profile: the social button sits after the name and opens its menu under it; Series / Followers and Follow span the card. Amber Follow, Following as an outline with a tick, a dark toast, three equal series tiles, a folded bio ending on a whole word with a green "... more", a long genre (SUPERHERO) on its own line; ⋮ opens a narrow menu that hugs Share / Report / Block. Feeds: separate post cards. Post page: comments the card's width, votes grey.

### Mobile (`m.webtoons.com`)

- [ ] The header is the site's light bar with the MY tab visible. The home category strip is one row.
- [ ] Reader: ◀ #N ▶ inside its bar; share icons are the site's sprites.
- [ ] Comments use phone geometry, with one send arrow when logged out.
