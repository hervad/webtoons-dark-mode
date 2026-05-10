# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
