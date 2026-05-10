// Downloads the current Webtoons main CSS bundle into scripts/cache/.
// The bundle URL has a hash suffix that changes when Webtoons rebuilds, so
// we fetch a Webtoons page first, extract the <link rel="stylesheet"> URL,
// then download that.
//
// Usage:  node scripts/fetch-bundle.mjs
// Output: scripts/cache/main.css  + scripts/cache/main.url.txt
//
// This is the resource almost every "find a class name" task needs.

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const cacheDir = join(here, 'cache');
await mkdir(cacheDir, { recursive: true });

const UA = 'Mozilla/5.0 (Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36';
const PAGE = 'https://www.webtoons.com/en/';

async function get(url) {
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
    return res.text();
}

console.log(`Fetching ${PAGE} to discover the current CSS bundle URL...`);
const html = await get(PAGE);

// Find the linewebtoon-*.css link
const match = html.match(/href="(\/static\/bundle\/linewebtoon-[a-f0-9]+\.css)"/);
if (!match) {
    console.error('Could not locate linewebtoon-*.css in the page HTML.');
    console.error('Webtoons may have changed its bundle naming scheme.');
    process.exit(1);
}

const cssUrl = `https://www.webtoons.com${match[1]}`;
console.log(`→ ${cssUrl}`);
const css = await get(cssUrl);

await writeFile(join(cacheDir, 'main.css'), css, 'utf8');
await writeFile(join(cacheDir, 'main.url.txt'), cssUrl + '\n', 'utf8');

console.log(`Saved scripts/cache/main.css (${(css.length / 1024).toFixed(0)} KB)`);
