# Contributing

Thanks for helping! Bug reports with a page URL and a screenshot are the most useful contribution: Webtoons changes its pages now and then, and a report is usually all it takes to fix an area that turned light again.

## How the project is built

- **One file:** `webtoons-dark-mode.user.js` is the whole theme, mostly CSS in two template strings (`palette` for colour and icon tokens, `theme` for the rules) plus a little JavaScript. It ships as it is; there is no build step.
- **The Toonlight browser extension** is built from that same file by `node tools/build-extension.mjs` (Node 22+, no dependencies). Don't put extension-only code in the userscript; it goes in `extension/`.
- **The comic panels are never filtered or recoloured.** The theme restyles only the site around them.

## Making a change

1. Install the userscript from your local file in your userscript manager (or edit the installed copy), and open the page you're changing.
2. Find the existing rule first (`grep -n 'class_name' webtoons-dark-mode.user.js`) and edit it rather than adding a new one. Rules are grouped by page under banner comments.
3. Check the page with the theme on and off (`Alt + Shift + T`), and on `m.webtoons.com` if the selector could match there too.

## Conventions

- Every override of the site's CSS uses `!important`: the site's own specificity is unpredictable.
- The comment above a rule says **why** it exists (what broke without it), not what it does.
- Colours come from the `--wt-*` tokens in `palette`. Text must reach WCAG AA contrast (4.5:1) on the surface it sits on.
- Motion added by the theme needs an entry in the `prefers-reduced-motion` block at the top of `theme`, and every selector there starts with `html`.
- Never inject text into the page: the same markup serves every language edition, so restyle the site's own (translated) strings.
- The site often shows / hides elements with an inline `display`. A rule that forces `display` needs a `[style*="none"] { display: none !important }` guard.

## Performance rules

The theme was tuned so pages open with little extra work. Please keep it that way:

- No page-level `:has()` gates (`html:has(…)`, `body:has(…)`). Put page state in a class or attribute the script sets.
- Use plain classes. The comment widget's classes (`wcc_X__y`) are stable, so write `.wcc_X__y`, not `[class*="wcc_X__y"]`.
- No infinite animations, and no `backdrop-filter` on repeated elements (badges, tiles).

## Pull requests

Keep a pull request to one change, include before / after screenshots for anything visual, and leave `@version` alone: versions are bumped on release.

Please follow the [Code of Conduct](CODE_OF_CONDUCT.md).
