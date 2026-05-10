# Development setup (Fedora + VS Code)

This guide gets you from a fresh Fedora install to actively developing the userscript.

## 1. Install system prerequisites

```bash
sudo dnf install -y git nodejs
```

That's it for system packages. Node.js is the only runtime needed — for the linter and the helper scripts. The userscript itself runs in your browser via a userscript manager, not via Node.

If your distro repository has an older Node.js (< 20), install Node 20+ via [nodesource](https://github.com/nodesource/distributions) or [fnm](https://github.com/Schniz/fnm).

Optional: install VS Code if you don't have it.

```bash
sudo rpm --import https://packages.microsoft.com/keys/microsoft.asc
sudo dnf config-manager --add-repo https://packages.microsoft.com/yumrepos/vscode
sudo dnf install -y code
```

## 2. Clone and install dev dependencies

```bash
git clone https://github.com/hervad/webtoons-dark-mode.git
cd webtoons-dark-mode
npm install
```

That installs ESLint and the `eslint-plugin-userscripts` plugin into `node_modules/`. Nothing global.

## 3. Open in VS Code

```bash
code .
```

VS Code will prompt to install the recommended extensions defined in `.vscode/extensions.json`:

- **ESLint** (`dbaeumer.vscode-eslint`) — runs the linter inline as you edit
- **EditorConfig** (`editorconfig.editorconfig`) — picks up `.editorconfig` for indentation
- **Live Server** (`ms-vscode.live-server`) — optional, for a quick local serve when prototyping CSS

Accept the prompt. The shared workspace settings in `.vscode/settings.json` enable ESLint validation and "fix on save" for the userscript file.

## 4. Install Tampermonkey in your browser

The userscript runs in the browser via a userscript manager. Pick whichever fits your browser:

- **Tampermonkey** — Chrome / Chromium / Edge / Brave / Firefox / Opera ([tampermonkey.net](https://www.tampermonkey.net/))
- **Violentmonkey** — Chromium / Firefox ([violentmonkey.github.io](https://violentmonkey.github.io/)) — fully open-source alternative
- **Greasemonkey** — Firefox only

> **Chrome users on Manifest V3:** open `chrome://extensions/`, toggle on **Developer mode** in the top-right corner. Without it, Tampermonkey can't actually run user scripts.

## 5. Install your in-development copy of the script

You have two options.

### A. Live-edit via Tampermonkey "Track local file"

The fastest dev loop. In Tampermonkey dashboard → click the script → **Editor** tab → check **Track local file** and point it at `webtoons-dark-mode.user.js` in your clone. Now any save in VS Code reloads the script in your browser on next page load.

### B. Paste-on-update

Copy the contents of `webtoons-dark-mode.user.js`, paste over the script in Tampermonkey, save (Ctrl+S), then hard-reload `webtoons.com` (Ctrl+F5). Slower but works without giving Tampermonkey filesystem access.

## 6. Useful npm scripts

All defined in `package.json`:

| Command | What it does |
|---|---|
| `npm run lint` | Lint the userscript + helper scripts. Catches @grant/GM_* mismatches and basic JS errors. |
| `npm run lint:fix` | Same, but auto-fix what can be fixed. |
| `npm run validate` | Custom validator for the `==UserScript==` metadata block. Reports missing `@grant`s, unused grants, and missing required keys. |
| `npm run fetch:bundle` | Download the current `linewebtoon-*.css` bundle into `scripts/cache/main.css`. The bundle URL has a hash that changes when Webtoons rebuilds — this auto-discovers it. |
| `npm run grep:css '<regex>'` | Grep the cached CSS for selectors matching a regex. Example: `npm run grep:css 'wcc_'` prints every rule whose selector contains `wcc_`. This is the workflow used to diagnose almost every bug. |

Typical "why is this surface still light?" cycle:

```bash
# 1. Download the latest bundle (do this once per session, or after Webtoons ships a redesign)
npm run fetch:bundle

# 2. Find what selector controls the broken element
npm run grep:css 'name_of_class_you_saw_in_devtools'

# 3. Add an override to webtoons-dark-mode.user.js with !important and a matching specificity
# 4. Hard-reload webtoons.com to test
```

## 7. Release workflow

Each user-facing release follows this pattern:

```bash
# 1. Bump @version in webtoons-dark-mode.user.js
# 2. Add an entry to CHANGELOG.md
# 3. Lint + validate
npm run lint
npm run validate

# 4. Commit and tag
git add CHANGELOG.md webtoons-dark-mode.user.js
git commit -m "vX.Y.Z: <what changed>"
git push origin main
git tag vX.Y.Z
git push origin vX.Y.Z

# 5. Create the GitHub release (notes auto-pulled from the commit message if you prefer)
gh release create vX.Y.Z --title "vX.Y.Z — <short title>" --notes-from-tag
```

Auto-update for installed users happens through `@updateURL` / `@downloadURL` in the metadata block, which point at `raw.githubusercontent.com/.../main/webtoons-dark-mode.user.js`. So pushing to `main` is enough to ship; the tag and release are for changelog readability.

## 8. Browser DevTools companion

When the user reports something looks wrong:

1. Reproduce on `webtoons.com`
2. Right-click the broken element → **Inspect**
3. Note the class name (e.g. `wcc_CommentItem__root` or `.detail_lst .subj`)
4. `npm run grep:css '<that class>'` to see what the base CSS does
5. Add an override in the userscript

The DevTools **Computed** tab shows which rule wins — useful when an `!important` override doesn't take effect (means there's a more specific rule still beating it).

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| `npm install` fails on `eslint-plugin-userscripts` | Node < 20. Upgrade to Node 20+. |
| ESLint extension shows "no eslint config" | VS Code is opening a parent dir, not the repo root. Open the repo root specifically with `code .` from inside the clone. |
| `npm run grep:css` says cache not found | Run `npm run fetch:bundle` first. |
| Tampermonkey shows the script but it doesn't run on `webtoons.com` | Chrome Developer Mode not enabled (see step 4), or the script is paused. |
| Console shows no `[webtoons-dark-mode] starting` banner | Same as above — script not actually running. |
| `Alt+Shift+T` doesn't toggle on Windows | OS-level "Switch Input Language" hotkey. Use `Ctrl+Alt+D` instead, or disable the language-switcher hotkey in Windows settings. (Doesn't apply to Fedora.) |
