// Greps the cached Webtoons CSS bundle for selectors matching a regex.
// This is the workflow I've used for almost every release: download the
// bundle, then extract every CSS rule whose selector matches a pattern.
//
// Usage:  node scripts/grep-css.mjs <regex>
// Example:
//   node scripts/grep-css.mjs 'snb_'
//   node scripts/grep-css.mjs 'wcc_App'
//
// Run `npm run fetch:bundle` first to populate scripts/cache/main.css.

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const cssPath = join(here, 'cache', 'main.css');

if (!existsSync(cssPath)) {
    console.error('scripts/cache/main.css not found. Run: npm run fetch:bundle');
    process.exit(1);
}

const pattern = process.argv[2];
if (!pattern) {
    console.error('Usage: node scripts/grep-css.mjs <regex>');
    console.error('Example: node scripts/grep-css.mjs "wcc_App"');
    process.exit(1);
}

const css = readFileSync(cssPath, 'utf8');
const re = new RegExp(`([^{}]*${pattern}[^{}]*)\\{([^}]+)\\}`, 'g');

let match;
let count = 0;
const limit = parseInt(process.env.LIMIT || '30', 10);

while ((match = re.exec(css)) && count < limit) {
    const sel = match[1].trim();
    const body = match[2].trim();
    if (sel.length < 280) {
        console.log(`SEL: ${sel}`);
        console.log(`     ${body.slice(0, 180)}`);
        console.log();
        count++;
    }
}

if (count === 0) {
    console.log(`No selectors matched /${pattern}/`);
} else {
    console.log(`(${count} matches${count === limit ? ', limited; set LIMIT=N to raise' : ''})`);
}
