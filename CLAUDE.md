# CLAUDE.md — webtoons-dark-mode

## What this project is

A single-file Greasemonkey/Tampermonkey userscript (`webtoons-dark-mode.user.js`) that applies a
targeted dark theme to `webtoons.com` and `m.webtoons.com`. No build step, no bundler — the file
ships directly to users via `@updateURL` / `@downloadURL`.

## Architecture at a glance

```
webtoons-dark-mode.user.js
├── Metadata block          @match, @grant, @run-at, @updateURL …
├── Constants               KEY_THEME, KEY_DIM, VERSION
├── CSS strings             palette (CSS vars) + theme (rules) + dimCss
├── ensureStyle()           inject/remove a <style> by id
├── applyTheme/applyDim     thin wrappers over ensureStyle
├── State                   darkOn / dimOn (cached from GM_getValue)
├── watchHead()             MutationObserver — re-injects style after SPA nav
├── toggleTheme/Dim()       flip state, persist, apply, log
├── GM_registerMenuCommand  extension popup menu entries
├── matchCombo/handleKey    keyboard shortcut dispatch
├── window keydown          single capture-phase listener
├── syncBodyClasses()       sets wt-viewer / wt-detail / wt-home on body
├── _navGen + scheduleSpa() generation-token-gated SPA retry helper
├── onSpaNav()              pushState/replaceState/popstate dispatcher
├── fixViewerBanners()      clears rogue backgrounds inside #_viewerBox
└── buildViewerCards()      wraps sidebar sections in elevated card divs
```

Key invariants:
- **No global CSS inversion** — only targeted selectors. Comic panel images are explicitly `filter: none`.
- **State is cached** in `darkOn`/`dimOn` module vars. Never call `GM_getValue` in the MutationObserver.
- **`ensureStyle` is idempotent** — checks for existing element by id before creating. Style text is set only on creation (it never changes at runtime).
- **Single keydown listener** on `window` in capture phase. Do not add more.
- **`watchHead` MutationObserver must NOT call `syncViewerClass()`** — head mutations fire during SPA stylesheet swaps while the old page's DOM is still present. Calling `syncViewerClass()` there will re-add `wt-viewer` to body right after `pushState` removed it.
- **No `body:has(#content.viewer)` CSS fallback** — Webtoons briefly assigns class `viewer` to `#content` during SPA transitions, causing false positive matches on non-viewer pages. `body.wt-viewer` (set/cleared by JS) is the only gate for viewer-scoped rules.
- **`.detail_bg + .cont_box` must be transparent** — the general `.cont_box { background-color: var(--wt-bg) }` rule would hide the detail page artwork. The adjacent-sibling selector scopes the transparency override to detail pages only.
- **Panel elevation is ONE shadow on the strip container** — `box-shadow` on `.viewer_img._img_viewer_area` / `#_imageList`, NOT per-image. Per-image shadows create a hard step at every panel boundary because each shadow's blur falloff stops at its own image y-edge — even with `spread = -blur` cancelling vertical bleed, sub-pixel rendering still leaves a faint horizontal seam. One container = one continuous shadow = no internal seam possible.
- **Strip container needs `width: fit-content` + `margin: 0 auto`** — parent wrappers default to full-width, which lands the shadow far from the actual image edge. `fit-content` shrinks the container to the image width (~800px); `margin: 0 auto` re-centers the now-shrunken container in the column.
- **`font-size: 0` / `line-height: 0` on the strip container** — sibling `<img class="_images">` elements have text nodes between them; without zeroing text metrics those nodes reserve baseline whitespace and create visible gaps between stacked panels. Pair with `display: block; vertical-align: top` on `img._images`.
- **`overflow: visible` must cascade up** — the container shadow needs `.viewer_lst`, `.cont_box`, and `body.wt-viewer #content` all set to `overflow: visible` or the halo gets clipped by parent wrappers.
- **SPA-deferred work runs through `scheduleSpa(fn)`** — every `pushState` / `replaceState` / `popstate` increments `_navGen`, and timers from previous routes early-out when they fire. Do not call `setTimeout` directly for navigation work; route it through `scheduleSpa` so rapid back-to-back nav doesn't queue stale DOM mutations.
- **`onSpaNav()` clears `aside.dataset.wtCards`** — the viewer sidebar DOM node sometimes survives viewer-to-viewer navigation; without clearing the idempotency flag the new chapter's sidebar would never be re-wrapped.
- **`snb_wrap` separator uses `::after`, not `border-bottom`** — `snb_inner` has `position: relative` which creates a stacking context that paints above the parent's border, hiding the separator in the centre section. The fix is a full-width `::after` pseudo-element with `z-index: 10` on `snb_wrap`. Also set `padding-bottom: 0` on `snb_wrap` to align its bottom edge with `snb_inner` so the line sits at a consistent Y across the full width.
- **Active GNB link uses `aria-current="true"` on `<a>`, not `.on` on `<li>`** — the legacy `.gnb .on a` selector never fires on the current site. Target `.gnb a[aria-current="true"]` and prefix with `#header`/`#gnbWrap` to gain the ID-level specificity needed to override the site's own colour rule.
- **GNB links wrap their text in `<h1>`** — our blanket `h1 { color: var(--wt-text) !important }` rule sets heading colour explicitly, overriding the accent colour inherited from the `<a>`. Always add `#header a[aria-current="true"] h1` alongside the link rule, with `font-size: inherit` and `font-weight: inherit` to prevent the site's UA/base heading styles from shrinking the text.
- **Do not use `font-size: inherit` on SNB active tabs** — the parent `<li>` computes to 12 px while the base `<a>` tab uses 16 px. `font-size: inherit` on the `<a>` would shrink the active tab. Leave font-size unset on the active rule so the base 16 px is used.
- **Header and sub-nav need `z-index: 10000`** — the page vignette gradient (`body::before`) uses `z-index: 9999` and `position: fixed; inset: 0`, which covers the right portion of the sub-nav, dimming tabs near the edge. Set `z-index: 10000` on `#header`, `.gnb_wrap`, and `.snb_wrap` so they paint above the gradient.
- **/canvas genre tabs use `.challenge_cont_area` / `.challenge_item`, NOT `.discover_lst` / `.discover_item`** — the /canvas home tab uses the discover_* family but every genre filter (DRAMA, FANTASY, …) renders cards via `.challenge_cont_area > .challenge_lst > ul > li > a.challenge_item`. Both DOMs need parallel rule sets. The right-rail sidebar (Top CANVAS, Up & Coming) is `.aside.challenge .ranking_lst.viewer > .lst_area` (flex column of two `.lst_area` cards).
- **`.challenge_cont_area` needs `box-sizing: border-box` + `overflow: visible`** — without `border-box` the section's padding adds outside its computed width and pushes the floated `.aside.challenge` (Top CANVAS / Up & Coming) down below the grid. Without `overflow: visible` on the section, `.challenge_lst`, and the inner `<ul>`, the 1 px right border of the rightmost grid column gets clipped.
- **Rank-number badges (`[class^="ranking_number_"]`) need text content for 1–30** — the site ships a sprite atlas that covers only 1–10. On /rankings (which goes to 30), ranks 11+ are blank with no fallback. Generate the digit via `::before { content: "N" !important }` for every number 1–30, and keep the rule unscoped (do NOT prefix with `.webtoon_list`) so both homepage trending and /rankings render. `content` must use `!important` because the base CSS sets `content: url(sprite)` at the same specificity.
- **`.paginate .pg_next` / `.pg_prev` arrows: text chevron, not filter** — a previous attempt used `filter: invert(1)` on the link itself to recolour the sprite, but the filter also inverted the hover background, producing a stark white pill. Replace the sprite with `::after { content: '›' }` and kill `background-image` + `text-indent` on the link instead.
- **Detail-page pagination needs `position: static; clear: both` scoped to `body.wt-detail`** — base CSS places `.paginate` inside the floated `.detail_lst` column at a position the floats paint around, so the row renders between episode rows. Force normal flow on detail pages only. An unscoped attempt broke /canvas layout where pagination was already correct, hence the body-class gate.
- **Age-verification screen (`.age_gate_container > .age_gate_area`) uses anchors-as-buttons, not `<button>`** — the Continue CTA is `<a class="btn_type9 v2 _btn_enter">` inside `<div class="btnarea">`, the secondary action is `<a class="lk_continue _skipAgeGate">` ("I'll stick with limited access"), the month picker is `<a class="lk_month _selectedMonth">` (not a native `<select>`), and the dropdown items are `<a class="link">` inside `<li class="item _month">`. Style them by exact class, not by `<button>` / position selectors — `:first-of-type` matches the month picker, not Continue, and `[class*="continue" i]` matches `.lk_continue` (the secondary "skip" link), not the Continue button. The Continue pill needs `display: inline-flex; align-items: center; justify-content: center` plus `min-width: 160px` for visually-centred text; idle text is `#0a0a0a` (~9:1 on `#00d564`), hover fades to `#ffffff` on a darker `#00b855` ground.
- **Button-styled anchors must be excluded from the global `a:hover { color: var(--wt-link) }`** — any CTA implemented as `<a>` (Continue, "First episode", etc.) inherits the link-blue on hover, which clashes with green/coloured button backgrounds. Add an override on `a.btn:hover, a[class*="btn_" i]:hover, a[role="button"]:hover, [class*="cta" i]:hover, a[class*="primary" i]:hover { color: inherit !important }` so buttons keep their own text colour.

## Diagnosing a broken selector

When a surface on the site still looks light after a Webtoons CSS bundle update:

```bash
# 1. Download the current bundle (re-run whenever Webtoons ships a redesign)
node .claude/scripts/fetch-bundle.mjs

# 2. Verify the class actually exists before writing CSS (critical — saves hours)
node .claude/scripts/grep-css.mjs 'class_name_from_devtools'
# If no output: the class doesn't exist. Re-inspect the DOM.

# 3. Check if we already override it
grep -n 'class_name' webtoons-dark-mode.user.js

# 4. Add an override in the theme CSS string with !important
# 5. Hard-reload webtoons.com (Ctrl+F5) to verify
```

The DevTools **Computed** tab shows which rule wins — useful when `!important` doesn't take effect
(means there's a more specific rule still beating it).

**Use `/project:diagnose` for the full workflow including common pitfalls.**

## CSS selector conventions

| Prefix/pattern | Meaning |
|---|---|
| `.gnb_*`, `.lnb_*` | Global/local nav bar |
| `.snb_*` | Sub-nav (day picker, genre tabs) |
| `.detail_*` | Series detail page |
| `._listInfo`, `._episodeItem` | Episode list (prefixed = JS-targeted) |
| `.discover_*` | /canvas home tab — `discover_lst` (grid), `discover_item` (card), `discover_spot` (Recommended Series carousel) |
| `.challenge_*` | /canvas genre-filtered tabs — `challenge_cont_area` (section), `challenge_lst` (grid wrapper), `challenge_item` (card), `aside.challenge` (right sidebar) |
| `ranking_number_N` | Rank badge sprite class (1–30). Used on homepage trending and /rankings |
| `.lst_type1`, `.lst_area` | Generic list/section wrappers used by sidebars on /canvas and /rankings |
| `.age_gate_*` | Age verification gate (logged-out, first visit). `.btn_type9._btn_enter` (Continue), `.lk_continue._skipAgeGate` (limited access), `.lk_month._selectedMonth` (month picker trigger), `._month .link` (month items) |
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
- [ ] Viewer: comic panel strip reads as one lifted card — rounded corners at top/bottom of the strip, hairline outline visible, dark halo on all sides
- [ ] Viewer: no horizontal seams between stacked panels (single container shadow, not per-image)
- [ ] Viewer: card halo not clipped by parent wrappers (`.cont_box`, `#content`, `.viewer_lst` all `overflow: visible`)
- [ ] Viewer: panel strip stays centered in the column after `width: fit-content` shrink
- [ ] Sub-nav bottom separator draws as one continuous line across the full viewport on `/originals`, `/canvas`, `/genre` — no gap in the centered region
- [ ] Active GNB tab (e.g. RANKINGS, ORIGINALS) renders in accent green at the base font size — text is not shrunken
- [ ] Active SNB day-of-week / genre tab stays at base 16 px font-size when selected — no shrink to 12 px
- [ ] Sub-nav tabs near the right viewport edge are bright — not dimmed by the page vignette (`body::before`)
- [ ] `/canvas` carousel arrows are centered in their dark circles and gain a green tint + glow on hover
- [ ] Subscriber-count badges on carousel cards render as green-text pills
- [ ] Viewer aside cards (ranking, info, ad, patron sections) re-wrap correctly after viewer→viewer SPA navigation
- [ ] `/canvas/genre/*` (DRAMA, FANTASY, …) renders cards inside one elevated section card with 4 columns, ~14 px gap, and the rightmost card's right border visible (not clipped)
- [ ] `/canvas` right rail shows **Top CANVAS** and **Up & Coming** as two separate stacked elevated cards with 8 px gap between, sidebar 280 px wide
- [ ] Pagination numbers render as 28 px pills with a visible hover state (`--wt-bg-hover` background + soft-accent ring); active page is a brand-green pill
- [ ] Pagination next/prev chevrons (`›` / `‹`) render as text on a dark pill; hovering does NOT produce a white background
- [ ] Detail-page pagination row lands at the bottom of the episode list, not interleaved between rows
- [ ] `/rankings` page shows all 30 rank numbers as bold dark-mode text (no missing ranks 11–30, no need to toggle the theme to reveal them)
- [ ] Tab-key navigation shows a 2 px `--wt-border-strong` focus ring with 2 px offset on links / buttons / form fields
- [ ] Hovering a sub-nav day/genre tab tints it soft accent (`--wt-accent-soft`); the active tab remains brand green (`--wt-accent`) — hover and active are visually distinct
- [ ] Age-verification screen (logged-out, first visit): month dropdown trigger + DD/YYYY inputs are dark; Continue is a centred green pill with near-black text that fades to white on hover; "I'll stick with limited access" is plain white underlined text (not blue, not green-pilled)

## Custom slash commands (local only)

- `/project:diagnose` — step-by-step CSS diagnosis workflow with common pitfalls
- `/project:release` — guided release checklist

## Reference library (`.claude/references/`)

| File | Contents |
|---|---|
| `homepage-dom-structure.md` | Homepage DOM, stylesheet load order, selector gotchas |
| `detail-page-dom.md` | Series detail/episode list page — full DOM structure |
| `viewer-page-dom.md` | Episode viewer page — toolbar, panels, aside |
| `css-techniques.md` | Reusable CSS patterns (elevation, inset shadows, flow-root, filter recoloring) |
| `design-system.md` | Color palette, elevation hierarchy, typography decisions |

Read the relevant reference before working on any page — it will tell you the actual class names and DOM structure without needing to inspect the site.
