# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
