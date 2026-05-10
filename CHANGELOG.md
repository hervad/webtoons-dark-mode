# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.95] - 2026-05-11

### Changed

- Re-added subtle left/right edge shadow on comic panel container (`::before` gradient, 4% width, 28% opacity) — same technique as v1.0.93 but far more restrained, creating barely-perceptible depth without visibly dimming artwork; horizontal gradient means zero inter-panel line artifacts

## [1.0.94] - 2026-05-11

### Changed

- Removed side-shadow overlay on comic panels — the gradient darkened too much of the actual artwork; the viewport-level vignette (`body.wt-viewer::before`) already provides the depth effect without touching panel content; kept `border-radius:0` to prevent inter-panel line artifacts

## [1.0.93] - 2026-05-11

### Fixed

- Side shadow now actually renders: moved left/right gradient from `inset` box-shadow on `<img>` (doesn't work on replaced elements) to a `::before` pseudo-element on `.viewer_img._img_viewer_area` (the parent div); purely horizontal gradient creates no horizontal-line artifacts between stacked panels

## [1.0.92] - 2026-05-11

### Changed

- Comic panels: replaced outer dark glow with `inset` left/right side shadows (`inset ±28px 0 28px rgba(0,0,0,.5)`) — adds visible volume at panel edges without creating horizontal lines between stacked panels; removed `border-radius:2px` which was causing corner gap artifacts at panel boundaries

## [1.0.91] - 2026-05-11

### Fixed

- Removed white spread ring from comic panel shadow — it created visible white lines between adjacent panels; dark outer glow alone (`0 0 28px rgba(0,0,0,.8)`) provides depth without inter-panel artifacts

## [1.0.90] - 2026-05-11

### Changed

- Comic panel shadow: white ring increased to `2px rgba(255,255,255,.22)` (was 1px/7%) for consistent visibility across all panels on dark background

## [1.0.89] - 2026-05-11

### Fixed

- Comic panel shadow is now symmetric (`0 0 28px` instead of `0 6px 28px`) so it appears on all sides, not just below; removed `display:block` override that was left-shifting panels out of their centered container

## [1.0.88] - 2026-05-11

### Added

- Comic panels (`img._images`) now have a drop shadow (`0 6px 28px rgba(0,0,0,.7)`) and hairline edge highlight (`0 0 0 1px rgba(255,255,255,.07)`) so each panel lifts off the dark background; `box-shadow` is purely decorative and does not affect image colors

## [1.0.87] - 2026-05-11

### Added

- Left/right vignette gradient now applies to series detail pages (`body.wt-detail`) and home/genre listing pages (`body.wt-home`), matching the existing viewer-page gradient; all three classes are synced by a unified `syncBodyClasses()` function on every navigation

## [1.0.86] - 2026-05-11

### Fixed

- Detail page artwork now shows through the header area: `.detail_bg + .cont_box` makes the content box transparent on detail pages (sibling combinator scopes it safely without `:has()`), while `.detail_body`'s explicit background keeps the episode list dark

## [1.0.85] - 2026-05-11

### Fixed

- Removed `body:has(#content.viewer)` CSS fallback entirely — Webtoons briefly adds class `viewer` to `#content` during SPA transitions, causing false positives on detail pages; the `position:fixed; z-index:9999` overlay made this very visible. `body.wt-viewer` (JS-driven) is now the sole gate for all viewer vignette rules

## [1.0.84] - 2026-05-11

### Fixed

- Viewer vignette no longer bleeds onto detail pages after SPA navigation: removed `syncViewerClass()` call from the `watchHead` MutationObserver — head mutations fire during stylesheet swaps while the old `#content.viewer` is still in the DOM, causing `wt-viewer` to be re-added immediately after pushState removed it

## [1.0.83] - 2026-05-11

### Fixed

- Vignette overlay no longer bleeds onto detail pages after SPA navigation from viewer: `body.wt-viewer` is now removed immediately on `pushState`/`popstate` (optimistic removal), preventing the `::before` gradient from rendering during the ~100ms before the new page's DOM is ready

## [1.0.82] - 2026-05-11

### Fixed

- Viewer vignette gradient now persists at all scroll positions: replaced `background-attachment: fixed` on `body` with a `position: fixed; inset: 0` `::before` pseudo-element overlay, which stays locked to the viewport regardless of how far the page has scrolled

## [1.0.81] - 2026-05-11

### Fixed
- Viewer vignette gradient now persists through all scroll positions: added `fixed` to the `background` shorthand so the gradient uses `background-attachment: fixed` — it is positioned relative to the viewport and never scrolls away.

## [1.0.80] - 2026-05-11

### Fixed
- Viewer page vignette gradient now persists through the full scroll. Root cause: `.cont_box` and `.comment_area` had solid `var(--wt-bg)` backgrounds which covered the body gradient below the first panel. Fixed by adding `body.wt-viewer .cont_box` and `body.wt-viewer .comment_area` to the transparent overrides, and changing `fixViewerBanners()` to set `background-color: transparent` instead of `var(--wt-bg)` on viewer sub-sections.

## [1.0.79] - 2026-05-11

### Fixed
- Episode strip (`.episode_area`) now uses `var(--wt-bg)` instead of `var(--wt-bg-elev)` so it matches all other viewer sections (no visible shade difference); removed card styling (border-radius, box-shadow).
- Removed `.episode_area` exemption from `fixViewerBanners()` so JS also normalizes it.

## [1.0.78] - 2026-05-10

### Fixed
- `fixViewerBanners()` now scans inside `.viewer_lst` too (previously only scanned direct children of `#_viewerBox`, missing the "Want more?" banner which lives inside `viewer_lst`). All viewer_lst children except the comic panel wrapper and episode strip get forced to `var(--wt-bg)` for uniform background.

## [1.0.77] - 2026-05-10

### Fixed
- Viewer "Want more?" banner and other unknown cont_box children: added `fixViewerBanners()` JS function that scans direct children of `#_viewerBox`, skips known elements (viewer_lst, aside, comment_area), and forces `background-color: var(--wt-bg-elev)` via inline style on everything else. CSS `!important` alone was not reaching these elements because their class names are unknown and may be set via Webtoons' own JS.

## [1.0.76] - 2026-05-10

### Fixed
- Added `.cont_box` to the dark background selector — transparent viewer sub-elements were revealing the cont_box native gray background instead of the page dark color.
- Changed viewer sub-sections (`viewer_info_area`, `viewer_ad_area`, `viewer_patron_area`) from `background: transparent` to explicit `var(--wt-bg)`.
- Broadened the app download banner (`foot_app`) rule to cover all occurrences inside the viewer box.

## [1.0.75] - 2026-05-10

### Fixed
- Viewer page: dark overrides for sub-sections below the comic panels (`viewer_info_area`, `viewer_ad_area`, `viewer_patron_area`) and the "Want more?" app download banner that appeared with brownish/olive backgrounds.

## [1.0.74] - 2026-05-10

### Changed
- Viewer sidebar cards now built by JS (`buildViewerCards`) instead of CSS class guessing. Groups children of `.ranking_lst` by "non-UL header + following UL" and wraps each section in a `div.wt-viewer-card`, bypassing the need to know Webtoons' internal class names.

## [1.0.73] - 2026-05-10

### Fixed
- Viewer sidebar: card now targets `.aside_item` (which wraps both the section header and ranked list) instead of `.ranking_wrap` alone; `.ranking_wrap` kept as fallback in case the DOM uses that class as the section container.

## [1.0.72] - 2026-05-10

### Fixed
- Viewer sidebar cards: added `border: 1px solid var(--wt-border)` to match the visual style of the Creator and comment cards on the same page.

## [1.0.71] - 2026-05-10

### Fixed
- Viewer sidebar: removed bottom separator between the two section cards — `.lst_type1` border-bottom was drawing a line inside each `.ranking_wrap` card.

## [1.0.70] - 2026-05-10

### Fixed
- Viewer sidebar: target `.ranking_wrap` (not `> *`) as individual section cards — the two sections (Trending & Popular / Top Originals) are nested inside a single `.ranking_lst.viewer` wrapper, so `> *` only produced one card; now each `.ranking_wrap` gets its own elevated card.
- Viewer sidebar section header arrows (`.ico_arr1`) were invisible — they are sprite background-images, not text, so `color` had no effect; added `filter: invert` to make them visible.
- Scoped border rules on `.ranking_wrap` to non-viewer asides only, to avoid double-borders inside the new cards.

## [1.0.69] - 2026-05-10

### Changed
- Viewer sidebar: split into two separate cards (Trending & Popular / Top Originals) by making `.aside.viewer` a transparent flex-column container and styling each direct child as its own elevated card; added `height: fit-content` to stop the aside stretching to match the taller comment column.

## [1.0.68] - 2026-05-10

### Fixed
- Viewer sidebar: reverted width from 375px back to 330px; the wider value caused the aside to exceed the 1200px cont_box and wrap below the comic panels, misaligning it next to the comments instead of the full content column.

## [1.0.67] - 2026-05-10

### Fixed
- Viewer sidebar: width increased from 330px to 375px so longer titles aren't truncated.
- Viewer vignette SPA persistence: single 150ms retry replaced with three retries at 100ms / 600ms / 1500ms; `watchHead()` MutationObserver now also calls `syncViewerClass()` so head stylesheet swaps during SPA navigation re-trigger the check.

## [1.0.66] - 2026-05-10

### Fixed
- Viewer vignette: gradient now also driven by JS `body.wt-viewer` class (hooks `pushState`/`replaceState`/`popstate`) so it survives SPA episode navigation. CSS `:has()` kept as fallback.
- Viewer sidebar: `overflow: hidden` clips the "THRILLER ✓" filter button overflow at the `border-radius: 14px` boundary (`box-shadow` is unaffected by overflow clipping). Ranking list items now also have `border: none` to remove separator lines at card edges.

## [1.0.65] - 2026-05-10

### Fixed
- Viewer sidebar: ranking list items inside `.aside.viewer` were getting the generic `.ranking_lst li { background: --wt-bg-elev; border-radius: 6px }` rule, making them appear as nested cards-on-card. Reset to transparent + no border-radius within the sidebar.
- Viewer vignette: gradient edge changed from `#020304` to pure `#000000`, transition zone narrowed from 28% to 14% — creates a clearly visible dark border at screen edges.

## [1.0.64] - 2026-05-10

### Fixed
- Viewer sidebar layout: `padding: 16px` on `.aside.viewer` expanded it from 330px to 362px (content-box), causing float overflow beyond the 1200px container → sidebar wrapped below comments. Fixed with `box-sizing: border-box; width: 330px` to keep padding inside the original footprint.
- Viewer vignette: gradient edge color changed from `#0d1014` to `#020304` (near-black) for a visible depth effect on the sides.

## [1.0.63] - 2026-05-10

### Fixed
- Viewer depth: previous gradient on `#content.viewer` never reached the side dead zones (the ellipse was too narrow) and lightened the like/subscribe area. New approach: gradient on `body` scoped via `body:has(#content.viewer)`, with `#container` and `#content` transparent so the body shows in the side areas. Elements with own backgrounds (toolbar, sidebar, episode strip, comments) are unaffected.

## [1.0.62] - 2026-05-10

### Fixed
- Viewer depth: gradient ellipse height reduced to 25% so it fades before reaching the like/subscribe area; no box-shadow on `#_imageList` (y=0 + 70px blur bled vertically into sections below panels). `#content.viewer` correctly overrides the general `#content` background rule.

## [1.0.61] - 2026-05-10

### Fixed
- Reverted v1.0.60 viewer changes — `#content.viewer` gradient bled into the Like/Subscribe area and episode strip; `box-shadow` on `#_imageList` had unintended side effects. Viewer styling back to v1.0.59 baseline pending proper investigation.

## [1.0.60] - 2026-05-10

### Fixed
- Viewer page: gradient background was on `#_viewerArea` which doesn't exist in current Webtoons markup — moved to `#content.viewer` so it actually fires. Added horizontal `box-shadow` on the comic panel column to create depth on the flat side areas.

## [1.0.59] - 2026-05-10

### Fixed
- Detail page: `.detail_body` was height-0 (floated children collapsed it), so its background never painted — artwork bled through card corners. Fixed with `display: flow-root` (contains floats), `overflow: hidden` (clips artwork at boundary), `border-radius: 16px` (rounded outer shape), and `padding-top: 24px` (breathing room between header and cards).

## [1.0.58] - 2026-05-10

### Fixed
- Detail page: `.detail_body` background changed from `--wt-bg-elev` to `--wt-bg` so the container rectangle is invisible against the page — previously the elevated color showed as a visible box below the shorter sidebar card.

## [1.0.51] - 2026-05-10

### Fixed
- Detail page elevation now visible: removed `.detail_lst_wrap` from generic `--wt-bg` rule that was overriding it; added `overflow: visible` to `.detail_body` so shadows aren't clipped; added `1px rgba(255,255,255,.1)` border to episode list and sidebar cards for guaranteed visibility
- Viewer page: replaced flat `--wt-bg` with a radial gradient spotlight (`#1d2026` center → `--wt-bg` edges) that makes the comic column feel raised above dark side areas

## [1.0.50] - 2026-05-10

### Added
- Homepage card hover: Material Design white-overlay elevation — surface lightens to `#30363f` + inset rim-light + thin white outline; removed `filter: brightness` which was tinting comic artwork
- Detail page elevation: episode list column and sidebar become separate elevated cards (`--wt-bg-elev`) above the page background, matching the homepage section hierarchy
- Viewer page elevation: episode thumbnail strip gets border-radius + shadow; ranking sidebar becomes an elevated card

## [1.0.49] - 2026-05-10

### Added
- Homepage "Option B" three-level elevation design: page → section cards → comic cards with shadows and transitions
- Heart icon in Like/Subscribe viewer pills tinted red via CSS filter
- Episode list hover: accent border via `::after` pseudo-element, date/like count turn green, `.subj` width capped at 385px to prevent episode-number overflow
- Sidebar CTA buttons (Continue reading / First episode) with green ring hover
- Search Creators section: dark hover background
- Multiple white/light border fixes: sidebar `border-left`, CANVAS Weekly top separator, viewer/comment section dividers

## [1.0.48] - 2026-05-10

### Added
- Series detail page: full dark theme — episode list, paywall strip, sort dropdown, subscribe button, recommendation cards, author info tooltip, subscribe-tier popup
- Series detail page: `.detail_header` background left transparent so `.detail_bg` series artwork shows through correctly in the header area
- Series detail page: header typography — text-shadow on title/genre/author for legibility on any artwork; genre label uppercase with wide letter-spacing
- Series detail page: subscribe "+" icon (`ico_plus4`) inverted to white on dark background
- Episode list typography: 17px episode titles, accent hover, visible date color, red-tinted like area, muted episode-number column
- Homepage: carousel arrow glassmorphic buttons, ranking number sprite replaced with CSS text, tab pill overrides

### Fixed
- Navigation artifacts (ghost backgrounds on nav items) caused by applying `border-color`/`box-shadow` to `.gnb`/`.lnb` — moved to outer header shell only
- Dead CSS selectors (`.wrap`, `.container`, `.section`) that matched nothing — removed
- `#wrap` excluded from section background rule (caused nav artifacts)
- Recently-viewed panel white background and sprite icon
- Sort dropdown, subscribe popup, episode sort, recommendation cards — all had white backgrounds
- Author info icon (`.ico_info2`) showing dark rectangle over series artwork
- `.detail_header` was incorrectly given `background-color: var(--wt-bg)` which painted over the series artwork in the center; removed from section rule

## [1.0.16] - 2026-05-10

### Diagnostic
- **Moved the console-info banner to the very first line of the IIFE** so it logs *before* any other code that could throw. Previously it was at the end — so a single error anywhere upstream would silently kill the banner, making it impossible to tell whether the script "wasn't running" vs "was running but errored out."
- The startup banner now also reports the type of `GM_getValue` / `GM_setValue` / `GM_registerMenuCommand` so we can see whether Tampermonkey is granting them.
- The end-of-IIFE banner now says "fully loaded" — if you only see "starting" but not "fully loaded", an error happened in between and we can see exactly which line in the console.

## [1.0.15] - 2026-05-10

### Added
- **Backup keyboard shortcuts** for users whose OS or keyboard layout swallows `Alt+Shift+T`. On Windows specifically, `Alt+Shift` is the default Switch Input Language hotkey on multi-language setups — that can intercept the keystroke before it reaches our handler. Now also accepts:
  - **`Ctrl + Alt + D`** → toggle theme (alongside `Alt + Shift + T`)
  - **`Ctrl + Alt + Shift + D`** → toggle reader dim (alongside `Alt + Shift + N`)
- **`console.info` startup banner** so you can confirm the script actually loaded and which version Tampermonkey is serving: open DevTools → Console and look for `[webtoons-dark-mode] v1.0.15 loaded …`. Each successful toggle also logs `theme toggled` / `reader dim toggled` so we can tell whether the handler is firing.

### Changed
- **Handler attached to four roots** (`window`, `document`, `<html>`, `<body>`) in capture phase. If a focus-stealing widget (WCC comment editor) somehow blocks one root, another will still see the event.

## [1.0.14] - 2026-05-10

### Fixed
- **`Alt + Shift + T` / `Alt + Shift + N` keyboard shortcuts stopped firing** on some pages. Most likely cause: a focused contenteditable in the WCC comment editor (added in v1.0.11) intercepts the keystroke before our window-level capture handler, OR a Webtoons handler calls `stopImmediatePropagation` ahead of ours. Hardened the keyboard handler:
  - Bound to **both `window` and `document`** capture phase so we catch the event regardless of which root Webtoons attaches to.
  - Matches both `e.code` (physical key, layout-independent) AND `e.key` (translated character) so non-QWERTY layouts also work.
  - Calls `e.stopImmediatePropagation()` + `e.stopPropagation()` after a successful toggle so Webtoons' own handlers can't undo or interfere.
  - Wraps `toggle()` calls in `try/catch` so a single `GM_setValue` failure doesn't silently kill the binding for the rest of the session — errors now log to the console with a `[webtoons-dark-mode]` prefix.

## [1.0.13] - 2026-05-10

### Fixed
- **Per-series artwork on the title banner appeared dim/muted** in dark mode (gold sparkles for *The Cup of Vengeance*, pink bubbles for *Sweet Romance*, sky/clouds for *Best Teacher Baek*, etc.). Root cause traced after the user pointed out a clear before/after comparison: `.detail_bg` carries the artwork via inline `style="background:url(...) repeat-x"`, but the `background:` shorthand also resets `background-color` to **transparent**. The artist designed the image assuming a **white** backdrop — gold-on-white, pink-on-white, etc. With our dark `#content` showing through the image's transparent regions, the artwork looked muted.
  - Removing the dim filter (v1.0.12) wasn't enough because the issue was compositing, not brightness.
  - The fix is to force `background-color: #fff` on `.detail_bg` so the inline image paints onto white the way the artist intended. Trade-off: the title banner area is a light strip in dark mode (~321px tall at the top of series detail pages). Net: the per-series identity is preserved exactly as in light mode.

## [1.0.12] - 2026-05-10

### Fixed
- **Brand-green stats icons turned grey** in "You may also like" recommendation cards (and elsewhere). The view eye, subscribe person, and grade star sprites have brand green baked in — my v1.0.5 filter (`brightness(0) invert(1)`) was bleaching them to white/grey, killing the brand identity. Removed `.ico_view`, `.ico_view2`, `.ico_subscribe`, `.ico_grade`, `.ico_grade2` from the filter list; they render natively now (brand green, fully visible against dark).
- **Author-info "i" icon rendered as a solid white blob** on series detail pages (e.g. *The Cup of Vengeance Is in Your Hands*). Same root cause: `brightness(0) invert(1)` bleaches the entire sprite area, not just the glyph. Removed `.ico_info2` from the filter; same as v1.0.11's `.detail_header.type_white .ico_info2` carve-out (now removed since the global rule is gone).

### Changed
- **Skin-image dimming removed entirely.** Earlier versions stepped from `.55` → `.7` → `.9`; v1.0.12 sets `filter: none` so the per-series artwork on the sides matches its light-mode brightness exactly. The artwork was designed by the artist for that brightness — there's no real reason to dim it for dark mode beyond initial caution that turned out to be unnecessary.

### Filter scope (unchanged)
- Filter is still applied to ranking-number digits (`.ico_n1` … `.ico_n10`) — those ARE plain dark glyphs designed for white bg.
- Footer brand social icons (`.btn_foot_*`) keep their separate `.75` opacity filter.

## [1.0.11] - 2026-05-10

### Fixed
- **Comments still had a white background** despite v1.0.9's WCC overhaul. Found the missing piece: WCC has a master container called `wcc_App__root` that wraps the entire comment widget. v1.0.9 covered the inner items (CommentItem / CommentBody / CommentHeader) but the outer App container itself stayed white. Now covered.
- **Comment editor (the input where you type a reply) was uncovered.** Added all the WCC `Editor__*` sub-classes: `root`, `content`, `editor` (the contenteditable area), `scrollArea`, `actionBar`, `toolbar`, `attachment`, `replyContainer`, `modifyContainer`, `spoilerWrapper`, etc. Caret color also set so it's visible against the dark input.
- **Spoiler toggle** in the comment editor (`wcc_Spoiler__*` and `wcc_SpoilerGuard__*`).
- **Kebab-case WCC loaders** (`wcc-comment-list-loader`, `wcc-sort-order-loader`) — these don't match `[class*="wcc_"]` because they use dashes, not underscores. Added separate selectors.
- **Notice popup buttons (Yes / No / OK / Cancel) were dark-on-dark** in v1.0.9. The buttons used `--wt-bg-elev2` which sat too close to the popup card's `--wt-bg-elev` — they disappeared into the surface. Switched to the lighter `--wt-bg-hover` with a visible border so they read as clickable pills. Hover lifts further to elev2 with a brighter border.
- **`.detail_header.type_white` series banners** (e.g. Sweet Romance / Spicy Roommates with the pink skin) had the title (`#000`), author (`#252525`), and info `i` icon hard-coded for light page bg. Author was nearly invisible, title was pure black-on-dark. All three retinted: title uses `--wt-text`, author uses `--wt-text-dim`, info icon bleached to white.

### Changed
- **Skin image brightness bumped from `.7` to `.9`.** v1.0.5 set it to `.55`, v1.0.8 raised to `.7`. The remaining dimming was making the per-series artwork on the sides too washed out — `.9` keeps the art vivid while still preventing the worst clashes with the dark chrome.

## [1.0.10] - 2026-05-10

### Fixed
- **Trending sidebar ranking numbers (1–10) invisible on dark.** They render as sprite digit glyphs (`.ico_n1` ... `.ico_n10`) designed for white bg — previously left untouched. Now bleached white via the same filter trick used on stats glyphs.
- **Search autocomplete result hover/select highlight went white.** When typing in the search box and getting autocomplete suggestions (e.g. "roman" → Selfish Romance / Sweet Romance / …), hovering or arrow-key-selecting an item set `.list_autocomplete li.on` and `.link:hover` to `background:#f3f3f3` — a near-white pill — and the title text underneath stayed `#000`. Hover/active bg now uses `--wt-bg-elev2`; title text uses `--wt-text`; author/info uses `--wt-text-dim`; the bold matched-substring (`<strong>roman</strong>` inside "Sweet Romance") uses `--wt-accent` (was `#03aa5a`, kept brand-green identity).

### Changed
- **Currently-viewing episode highlight is now visibly louder.** The base 3px green border on the active `.thmb` is preserved, but now sits inside a softer outer ring + a 14px green glow halo. The active episode title (`.subj`) is also bolded. Makes the "you are here" position obvious at a glance when scrubbing the thumbnail strip.

## [1.0.9] - 2026-05-10

### Fixed
- **Comments still white / nicknames invisible** (this was the big one). Webtoons replaced the legacy Naver `u_cbox` comment widget with a new in-house **WCC** ("Webtoon Comment Component") served from `ssl.pstatic.net/static/wcc/gw/prod-1.0/index.js`. WCC uses CSS-Module class names of the form `wcc_<Component>__<element>` (e.g. `wcc_CommentHeader__name` for nicknames, `wcc_CommentBody__root` for body text, `wcc_SortOrderTab__active` for the active TOP/NEWEST tab). The previous `.u_cbox_*` selectors matched *nothing* on this widget. Added a full `[class*="wcc_..."]` block covering: comment items (cards), header (name/createdAt/creator badge), body, reactions, best/super-like badges, sort tabs, reply-fold toggles, "more comments" loaders, alert/report/option-menu popups, and empty state. Legacy `.u_cbox_*` rules retained as a fallback.
- **Sub-nav underline broken / discontinuous** ("the line begins, disappears, and after the categories appears again"). Base CSS gives `.snb_wrap { border-bottom: .5px solid #e0e0e0 }` (invisible on dark). The scroll-arrow buttons (`.btn_snb_prev` / `.btn_snb_next`) had their own `border-bottom: .5px solid #e0e0e0` *plus* white background that broke the bottom edge into segments. Forced both to `--wt-border` so the line reads continuously across the strip.
- **Pagination numbers (2 / 3 / … / 10) not visible.** Base CSS hard-codes `.paginate a, .paginate strong { color: #070707 }`. Bumped from `--wt-text-dim` (set in v1.0.6) to full `--wt-text` for clearly readable numbers; hover now uses accent green to match the active page indicator.
- **Episode titles still dim grey** despite the v1.0.8 fix. Broadened the rule to also catch `.detail_lst li a` and any direct `<span>` children that aren't `.date`/`.tx`. Date column now uses `--wt-text-dim` instead of leaking the base `#b1b1b1`.
- **Top-right "Log In" hover went near-white**, hiding the white-glyph icon. Base CSS sets `.header_right .link_login:hover { background: #e0e0e0 }`. Now uses `--wt-bg-hover` like the search button next to it.
- **Footer Facebook icon "barely visible"** at v1.0.6's `opacity(.65)`. Bumped to `.75` (hover up to `1.0`) — readable while still even with the line-style Instagram/X/YouTube siblings.

## [1.0.8] - 2026-05-10

### Fixed
- **Search dropdown "still white" after v1.0.6.** v1.0.6 covered `.search_area` (outer panel) and `.input_search` (transparent `<input>`) but missed the *middle* layer: `.search_area .input_box` is the rounded grey pill that wraps the input (`background:#f3f3f3` in base CSS). Now styled with `--wt-bg-input` so the pill is dark; the inner `<input>` is forced transparent so the pill bg shows through. Also added `.ly_autocomplete .title` and `.autocomplete_foot` text colors and item hover state.
- **Episode titles "Episode 26 / 25 / 24" almost invisible.** Base CSS hard-codes `.detail_body .detail_lst .subj span { color: #3d3d3d }` — high specificity (3 classes + element) targeting the *inner* span. Our previous `.subj` rule only colored the outer span; the inner one inherited the dark grey from the more specific rule. Added matching-specificity overrides for `.detail_body .detail_lst .subj span` plus the date column.
- **Terms / Policy language pills** (English / Français / Indonesia / 中文 / ภาษาไทย at the top of `/<lang>/terms*`). Base: inactive `#f3f3f3` bg + `#666` text (invisible on dark); active `#000` bg + `#fff` text (off-theme). Now: inactive uses `--wt-bg-elev2` + `--wt-text-dim`; active uses `--wt-accent` + `--wt-text-on-accent`; inactive hover uses `--wt-bg-hover` + `--wt-text`.
- **White-circle social icons in title banner** (FB / X / Tumblr / Reddit / Copy / RSS next to the Subscribe button). v1.0.5 applied `filter: brightness(0) invert(1)` to all `.ico_*` selectors, but the sprite at those positions includes brand-colored disc backgrounds — the filter bleached the whole disc to a solid white circle, hiding the glyph. Filter is now scoped to **stats glyphs only** (`.ico_subscribe`, `.ico_view`, `.ico_view2`, `.ico_grade`, `.ico_grade2`). Brand social icons render in their native colors (FB blue, X dark, Tumblr indigo, Reddit orange, RSS orange) — visible on dark.
- The viewer-context filter override added in v1.0.7 is now redundant and removed — social icons are no longer filtered anywhere, and the viewer's `.ico_favorites` / `.ico_like2` / `.ico_plus3` were never affected by the v1.0.5 rule.

### Changed
- **Skin image less dimmed.** v1.0.5 used `filter: brightness(.55)` on `.detail_bg`, which made per-series artwork (sky/clouds for Best Teacher Baek, red cracks for A Cadet Becomes a Prophet) too dark on the sides. Bumped to `.7` — still tames the bright artwork next to dark chrome, but keeps the artist's image readable.
- **Sub-nav hover now uses accent green** instead of plain white. `.snb_item:hover .snb_tab` color changed from `--wt-text` to `--wt-accent` so hover affordance matches the active-tab indicator.

## [1.0.7] - 2026-05-10

### Fixed
- **Viewer top toolbar** (`.tool_area`, the fixed bar at the top of every chapter page). Was natively `#2f2f2f` — now uses `--wt-bg-elev` for theme consistency, with a `--wt-border` bottom edge.
- **Top-toolbar icons rendering as solid white circles.** The same `.ico_facebook` / `.ico_twitter` / `.ico_copy` / `.ico_favorites` classes are reused in the title banner (where v1.0.5's `filter: brightness(0) invert(1)` works well) and in the viewer toolbar (where the sprite picks up icons that have a colored circle background baked in — the filter then bleached the whole disc to solid white). Filter is now suppressed in the viewer-toolbar and viewer-share contexts; icons render in their native colors.
- **Episode thumbnail strip** above and below the comic (`.episode_area`). Base CSS hard-codes `background:#f5f5f5`. Now `--wt-bg-elev` with `--wt-border` outline.
- **"Trending & Popular" sidebar** on the viewer (`.aside.viewer`, `.ranking_lst.viewer`). Wrapper gets dark surface, headings + counts get proper text/dim colors.
- **"Share this series and show support for the creator!" prompt** (`.viewer_lst .dsc_encourage`). Was hard-coded to `color:#080808` — invisible on dark.
- **Like / Subscribe pill buttons** in the viewer footer (`.spi_area .bx`). Were `background:#ececec` `color:#585858` by default. Now elevated dark surface with hover state.
- **Creator-note card** at the top of the comments section (`.comment_area .creator_note`, `.creator_note .title`, `.author_area .author`). Title was `#3c3c3c`; now muted-dim. Author name is now full primary text.
- **Comments section header** (`.comment_head .title_comments`, `.count`).

### Added
- **Defensive cbox-widget catch-alls** for slightly different class variants (`[class*="cbox_nick"]`, `[class*="cbox_date"]`, `[class*="cbox_sort"]`). Addresses "user nicknames almost invisible" reports without changing the v1.0.2 rules that already work.

## [1.0.6] - 2026-05-10

### Fixed
- **Search button (top-right of header) was nearly invisible.** Base CSS sets `.header_right .btn_search { background: #f3f3f3 }` (light grey). Now uses `--wt-bg-elev2` background with a `--wt-border` outline; the magnifying-glass `:before` sprite is forced to white via `filter: brightness(0) invert(1) opacity(.85)`.
- **Search dropdown** (recent searches + autocomplete) was a white box. Targeted: `.search_cont`, `.search_area`, `._searchArea`, `.input_search`, `._txtKeyword`, `.ly_autocomplete`, `._searchLayer`, plus item hover state.
- **Notice list page** (`/<lang>/notice/list`). Base CSS gives `.notice_area2 .tb_notice tbody tr { color: #000 }` and `tr.special { background: #f8f8f8 }` — invisible/jarring on dark. Now: dark page surface, `--wt-bg-elev2` table headers, `--wt-bg-elev` for the highlighted "special" row, `--wt-border` row dividers, `--wt-text` cell text.
- **Terms and Privacy Policy pages** (`/<lang>/terms`, `/<lang>/terms/privacyPolicy`). Base CSS hard-codes `.terms_area { background: #fff; color: #858585 }`. Overridden along with `.terms_box`, `.terms_card`, `.terms_lang_area`, `.terms_lang_desc`, `.terms_list`. Headings (`h3`, `strong`) get full text color, dates get muted, links use the link blue.
- **About / Contact / Feedback / and similar static pages.** These are rendered by a **separate Next.js subapp** (bundle from `/static/wec/.../next/...`) and use Tailwind utility classes (`text-black`, `bg-white`, `bg-gray-100`, …) that ignore the body color cascade. Added a scoped override block — anything inside `section[class*="layout_container"]` gets dark background + dark-mode text colors. Limited to that wrapper so it can't leak into the main linewebtoon-rendered pages.
- **Facebook footer icon was visibly brighter than the other socials.** All the footer social icons go through `filter: brightness(0) invert(1)`, but the FB glyph fills more pixel area than the line-style Instagram / X / YouTube glyphs, so at high opacity it dominated the row. Lowered base opacity from `.85` to `.65` (hover from `1` to `.95`) to even out the visual weight.

### Added
- **Hover highlight on top-nav links** (Originals / Categories / Rankings / Canvas / Webtoon Shop / Creators 101). Were previously plain text with no hover affordance — now get an accent-green text + `--wt-bg-elev2` rounded background on hover. Same upgrade applied to sub-nav tabs (`.snb_item`, `.snb_tab`).

## [1.0.5] - 2026-05-10

### Fixed
- **White wrapper around the episode list on series detail pages** (e.g. `/en/action/best-teacher-baek/list?...`). The base CSS sets `background:#fff` on `.detail_body .detail_lst` directly — overridden with our dark surface.
- **"You may also like" recommendation cards** (`.detail_other .lst_type1 li`) were also explicitly white. Now styled as elevated dark cards with hover state, plus dark-mode-appropriate text colors for title (`.subj`), author, and stats.
- **Title-banner social icons** — Facebook, X, Tumblr, Reddit, Copy-link, RSS (`.ico_facebook`, `.ico_twitter`, `.ico_tumblr`, `.ico_reddit`, `.ico_copy`, `.ico_rss`). Same sprite-glyph fix used on the footer icons in v1.0.2: `filter: brightness(0) invert(1) opacity(.85)`.
- **Stats icons** in the title banner (view / subscribe / grade) were also invisible sprite glyphs — same treatment.
- **Pagination** at the bottom of the episode list (`.paginate`). Page numbers were hard-coded to `#070707` text in the base CSS, invisible on dark.

### Added
- **Skin-image preservation.** Each series has a unique skin image at the top of its detail page (sky/clouds for Best Teacher Baek, flames for Surviving the Game as a Barbarian, etc.) painted on `.detail_bg` via inline `background:url(...)`. Previous versions implicitly hid this with the chrome dark-out. Now the artist's image is kept visible, with `filter: brightness(.55)` applied so it doesn't clash with our dark chrome on the sides.

## [1.0.4] - 2026-05-10

### Added
- **`prefers-color-scheme` first-run default.** New installs now default to whatever the OS dark/light preference is (was: always on regardless of OS). Once the user toggles for the first time, that choice is persisted via `GM_setValue` and OS preference is ignored. Existing users with a stored preference are unaffected — only fresh installs see this.
- **`html[data-wt-dark]` hook.** When the theme is on, `<html>` gets `data-wt-dark="on"`; when off, `data-wt-dark="off"`. Power users can write personal CSS like `html[data-wt-dark="on"] .my-thing { ... }` and have it scoped to only the dark state.
- **SPA-resilience MutationObserver.** A small observer watches `<head>` for direct childList changes. If our `<style>` element is ever removed (Webtoons swaps stylesheets on some chapter transitions, and external bundles can race with our injection), it's re-applied. The observer only fires on direct head-child mutations, so its overhead is negligible.

### Not done (intentional)
- The "split `theme` into named chunks" refactor item was reconsidered and skipped. The existing section comments already act as a TOC, the planned v1.1 preset switcher only swaps the palette (not the theme), and the diff churn (~330 lines moved) doesn't pay back. If we hit a real maintainability problem later, we can revisit.

## [1.0.3] - 2026-05-10

### Changed
- **Palette tuning** based on a contrast/perception review against Material 3, Apple HIG, GitHub Dark, Tailwind Slate and Catppuccin reference palettes:
  - `--wt-text-mute` lifted from `#6B7079` to `#7B828D`. The previous value computed to ~3.9:1 against the page background, failing WCAG AA for normal text. The new value is ~5:1 and still clearly muted.
  - `--wt-border` lifted from `#2C3036` to `#363B44`. The previous value was ~1.3:1 against the page background — card edges and table dividers were nearly invisible. The new value sits at ~2:1 so the elevation hierarchy reads.
- **Palette consolidated.** The two hard-coded colors that were sprinkled in the theme CSS (`#30353c` button-hover, `#0a0a0a` text on accent surfaces) are now the new variables `--wt-bg-hover` and `--wt-text-on-accent`. The whole theme is once again re-skinnable from a single block at the top of the file.

### Fixed
- `ensureStyle()` now updates the `<style>` element's `textContent` if it already exists. Previously a second call with the same `id` but different CSS would silently do nothing — a latent bug that would have surfaced the moment a preset switcher was added.

## [1.0.2] - 2026-05-10

### Fixed
- **"Recently viewed" floating bar** on the right edge of every page (`.recently_area`). The site paints a white PNG sprite (`bg_recently.png`) as the background — overridden with our dark surface, plus dark text/border colors for the inner thumbnails (`.t_recently`, `.t_recently2`, `.recently_cont .subj`, `.episode`, `.bar`).
- **Footer social icons** (Facebook / Instagram / Twitter / YouTube / Pinterest / LINE). They are CSS-sprite glyphs positioned out of a single dark-on-white SVG sheet. With our dark background they were nearly invisible. Forced to white via `filter: brightness(0) invert(1) opacity(.85)`, with full opacity on hover.
- **Footer language selector** — both the closed "English ▾" button (`.foot_menu .language .lk_lang`) and the dropdown (`.ly_lang`, items, dropdown arrow). Active language now uses the brand-green accent.
- **Login modal** ("Log in now and enjoy free comics") injected by `/static/bundle/common/gnb-*.js` on Log-In click. Targets the actual JS-hook classes: `._loginLayer`, `._loginDimLayer` (backdrop overlay), `._loginComponentParent`, `._defaultLoginComponent`, `.emailLoginComponent`, plus the SNS buttons (`._btnLoginSns`, `.btn_sns`, `._emailLoginButton`, `._btnLoginEmail`) and the close + back buttons.
- Added a defensive `[role="dialog"], [aria-modal="true"]` catch-all so any future Webtoons dialog inherits dark surfaces by default.

## [1.0.1] - 2026-05-10

### Fixed
- White sub-navigation strip on the daily-schedule page (MON/TUE/.../SAT/SUN/COMPLETED tabs). The site uses `.snb_wrap` / `.snb_inner` / `.snb` / `.snb_item` / `.snb_tab`, which v1.0.0 did not target.
- White genre-tabs strip on `/genres/*` pages (DRAMA / FANTASY / COMEDY / …) — same shared `.snb` component.
- White section-header strip above series listings showing "N series" + "by Popularity | by Likes | by Date" (`.section_header`, `.series_count`, `.sort_area`, `.sort_by`, `[aria-current="true"]` for the active sort).
- White "Notice" strip above the footer (`.notice_area`, `#noticeArea`).
- White "Download WEBTOON now!" promo band in the footer (`.foot_app`, `.foot_cont`, `.foot_down_msg`, `.footapp_icon_cont`, `.btn_google`, `.btn_ios`).
- QR code in the app-download strip is now placed on a small white tile so it remains scannable against the dark surrounding band.

### Notes
- Active tab indicators now follow the site's `aria-current="true"` / `aria-current="page"` and `.is_selected` class instead of the legacy `.on` class.

## [1.0.0] - 2026-05-10

### Added
- Initial release.
- Targeted dark theme for Webtoons covering header, navigation, cards, episode lists, viewer, comments (Naver `u_cbox` widget), popups, modals, footer, inputs, buttons, scrollbars.
- CSS-variable palette (`--wt-bg`, `--wt-text`, `--wt-accent`, …) for one-line re-skinning.
- Persistent toggle via `GM_setValue` / `GM_getValue` — state survives reloads and browser restarts.
- Userscript-manager menu commands: *Toggle Webtoons dark mode*, *Toggle reader dim*.
- Keyboard shortcuts: `Alt + Shift + T` (theme), `Alt + Shift + N` (reader dim).
- Optional reader-dim mode that lowers comic-panel brightness for late-night reading without tinting the rest of the page.
- Mobile site coverage (`m.webtoons.com`).
- `@updateURL` / `@downloadURL` for auto-updates from GitHub `main`.
- `@noframes` so the script doesn't re-run inside ad iframes.
- Style injection at `@run-at document-start` to avoid flash of light theme.
