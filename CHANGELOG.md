# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
