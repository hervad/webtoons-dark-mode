# CLAUDE.md — webtoons-dark-mode

## What this project is

A single-file Greasemonkey/Tampermonkey userscript (`webtoons-dark-mode.user.js`) that applies a
targeted dark theme to `webtoons.com` and `m.webtoons.com`. No build step, no bundler — the file
ships directly to users via `@updateURL` / `@downloadURL`.

## Architecture at a glance

```
webtoons-dark-mode.user.js
├── Metadata block        @match, @grant, @run-at, @updateURL …
├── Constants             KEY_THEME, KEY_DIM, VERSION
├── CSS strings           palette (CSS vars) + theme (rules) + dimCss
├── ensureStyle()         inject/remove a <style> by id
├── applyTheme/applyDim   thin wrappers over ensureStyle
├── State                 darkOn / dimOn (cached from GM_getValue)
├── watchHead()           MutationObserver — re-injects style after SPA nav
├── toggleTheme/Dim()     flip state, persist, apply, log
├── GM_registerMenuCommand  extension popup menu entries
├── matchCombo/handleKey  keyboard shortcut dispatch
└── window keydown        single capture-phase listener
```

Key invariants:
- **No global CSS inversion** — only targeted selectors. Comic panel images are explicitly `filter: none`.
- **State is cached** in `darkOn`/`dimOn` module vars. Never call `GM_getValue` in the MutationObserver.
- **`ensureStyle` is idempotent** — checks for existing element by id before creating. Style text is set only on creation (it never changes at runtime).
- **Single keydown listener** on `window` in capture phase. Do not add more.

## Diagnosing a broken selector

When a surface on the site still looks light after a Webtoons CSS bundle update:

```bash
# 1. Download the current bundle (re-run whenever Webtoons ships a redesign)
node .claude/scripts/fetch-bundle.mjs

# 2. Find the selector controlling the broken element
#    (get the class name from DevTools → Inspect → right-click element)
node .claude/scripts/grep-css.mjs 'class_name_from_devtools'

# 3. Check what the base rule does (background, color, specificity)
# 4. Add an override in the theme CSS string with !important at matching or
#    higher specificity
# 5. Hard-reload webtoons.com (Ctrl+F5) to verify
```

The DevTools **Computed** tab shows which rule wins — useful when `!important` doesn't take effect
(means there's a more specific rule still beating it).

## CSS selector conventions

| Prefix/pattern | Meaning |
|---|---|
| `.gnb_*`, `.lnb_*` | Global/local nav bar |
| `.snb_*` | Sub-nav (day picker, genre tabs) |
| `.detail_*` | Series detail page |
| `._listInfo`, `._episodeItem` | Episode list (prefixed = JS-targeted) |
| `[class*="wcc_"]` | WCC comment widget (CSS-module hashed names) |
| `.u_cbox_*` | Legacy Naver comment widget (fallback) |
| `._loginLayer`, `._loginDimLayer` | Login modal (injected by gnb bundle) |
| `section[class*="layout_container"]` | Next.js subapp pages (About, Contact…) |

When Webtoons updates, the `wcc_*` CSS-module names may gain a hash suffix. Prefer
`[class*="wcc_ComponentName__element"]` over exact class names for these.

## Coding conventions

- All CSS lives in the `theme` template literal. No `GM_addStyle`, no `document.head.appendChild` outside `ensureStyle`.
- `!important` is required on every override — base CSS specificity is unpredictable.
- Group selectors by page section with a `/* Section */` comment.
- Comments explain WHY a rule exists (what broke without it), not what it does.
- Never add version numbers to comments — they belong in CHANGELOG.md.
- `dimCss` is the only CSS that mutates at runtime (reader dim toggle). Keep it separate.

## Release workflow

```bash
# 1. Bump @version in the metadata block AND the VERSION constant
# 2. Add entry to CHANGELOG.md
# 3. Commit
git add webtoons-dark-mode.user.js CHANGELOG.md
git commit -m "vX.Y.Z: <what changed>"
git push origin main
git tag vX.Y.Z
git push origin vX.Y.Z

# 4. Create GitHub release
gh release create vX.Y.Z --title "vX.Y.Z — <short title>" --notes-from-tag
```

Auto-update for installed users happens via `@updateURL` → `raw.githubusercontent.com/main/...`.
Pushing to `main` is enough to ship. The tag and release are for changelog readability.

## Bumping the version

Two places must match:
1. `@version` in the metadata block (line 4)
2. `const VERSION = '...'` (line 25)

## Testing

There is no automated test suite — this is a DOM-manipulation script. Manual testing checklist:

- [ ] Hard-reload `webtoons.com` — dark theme applies immediately (no flash of white)
- [ ] Console shows `[webtoons-dark-mode] vX.Y.Z ready —` banner
- [ ] `Alt+Shift+T` toggles dark mode; console logs `theme → light/dark`
- [ ] `Ctrl+Alt+D` also toggles (Windows backup combo)
- [ ] Toggle persists after page reload (GM storage)
- [ ] Reader dim toggle (`Alt+Shift+N`) dims comic panels only
- [ ] Navigate to a chapter (SPA route change) — theme stays applied
- [ ] Comic panel images have no color shift

## Custom slash commands (local only)

- `/project:diagnose` — step-by-step CSS diagnosis workflow
- `/project:release` — guided release checklist
