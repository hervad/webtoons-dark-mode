// Builds the browser extension from the userscript: the theme ships as
// webtoons-dark-mode.user.js (no build step); this wraps the same file
// for the extension stores.
//
//   node tools/build-extension.mjs
//
// Output (dist/, not committed):
//   chrome/   unpacked, for Chrome and Edge (chrome://extensions → Load unpacked)
//   firefox/  unpacked, for Firefox (about:debugging → Load Temporary Add-on)
//   <slug>-<version>-chrome.zip   upload to the Chrome Web Store and Edge Add-ons
//   <slug>-<version>-firefox.zip  upload to addons.mozilla.org
//
// The extension runs extension/gm-shim.js and then the userscript body,
// unchanged, as a document_start content script. Its version is the
// userscript's @version.
import { readFileSync, writeFileSync, mkdirSync, rmSync, copyFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateRawSync, crc32 } from 'node:zlib';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const NAME = 'Toonlight: Dark Mode for WEBTOON';
const SHORT_NAME = 'Toonlight';
const SLUG = 'toonlight';
const DESCRIPTION = 'A dark theme for WEBTOON (webtoons.com) that keeps every comic panel in its original colours. Not affiliated with NAVER WEBTOON.';
// Fixed for good once the add-on is on AMO: Firefox identifies it by this ID.
const GECKO_ID = 'toonlight@hervad';

const userscript = readFileSync(join(ROOT, 'webtoons-dark-mode.user.js'), 'utf8');
const version = (userscript.match(/^\/\/ @version\s+(\S+)/m) || [])[1];
if (!version) throw new Error('no @version in the userscript');
const end = userscript.indexOf('// ==/UserScript==');
if (end < 0) throw new Error('no userscript header');
const body = userscript.slice(end + '// ==/UserScript=='.length).replace(/^\s+/, '');
const content = `// ${NAME} ${version}: the userscript body, run after gm-shim.js.\n// Built by tools/build-extension.mjs; edit webtoons-dark-mode.user.js instead.\n${body}`;

const base = {
    manifest_version: 3,
    name: NAME,
    short_name: SHORT_NAME,
    version,
    description: DESCRIPTION,
    homepage_url: 'https://github.com/hervad/webtoons-dark-mode',
    icons: { 16: 'icons/icon-16.png', 32: 'icons/icon-32.png', 48: 'icons/icon-48.png', 128: 'icons/icon-128.png' },
    action: {
        default_title: SHORT_NAME,
        default_popup: 'popup.html',
        default_icon: { 16: 'icons/icon-16.png', 32: 'icons/icon-32.png', 48: 'icons/icon-48.png' },
    },
    permissions: ['storage'],
    content_scripts: [{
        matches: ['https://www.webtoons.com/*', 'https://m.webtoons.com/*'],
        js: ['gm-shim.js', 'content.js'],
        run_at: 'document_start',
    }],
};
const targets = {
    chrome: base,
    // Firefox: an add-on ID is required for MV3 signing, and AMO requires a
    // data-collection declaration (supported from Firefox 140 desktop /
    // 142 Android, hence the floor).
    firefox: {
        ...base,
        browser_specific_settings: {
            gecko: { id: GECKO_ID, strict_min_version: '142.0', data_collection_permissions: { required: ['none'] } },
            gecko_android: { strict_min_version: '142.0' },
        },
    },
};

const SRC = join(ROOT, 'extension');
const DIST = join(ROOT, 'dist');
// Clear only this script's own output: dist/store/ (the store images) stays.
mkdirSync(DIST, { recursive: true });
for (const f of readdirSync(DIST)) {
    if (f === 'chrome' || f === 'firefox' || f.endsWith('.zip')) rmSync(join(DIST, f), { recursive: true, force: true });
}

function zip(files, out) {
    // A plain zip writer (deflate), so the build needs no npm packages.
    const local = [], central = [];
    let offset = 0;
    for (const [name, data] of files) {
        const nameBuf = Buffer.from(name, 'utf8');
        const deflated = deflateRawSync(data, { level: 9 });
        const crc = crc32(data);
        const head = Buffer.alloc(30);
        head.writeUInt32LE(0x04034b50, 0); head.writeUInt16LE(20, 4); head.writeUInt16LE(0x0800, 6);
        head.writeUInt16LE(8, 8); head.writeUInt32LE(0, 10); head.writeUInt32LE(crc, 14);
        head.writeUInt32LE(deflated.length, 18); head.writeUInt32LE(data.length, 22);
        head.writeUInt16LE(nameBuf.length, 26); head.writeUInt16LE(0, 28);
        local.push(head, nameBuf, deflated);
        const cen = Buffer.alloc(46);
        cen.writeUInt32LE(0x02014b50, 0); cen.writeUInt16LE(20, 4); cen.writeUInt16LE(20, 6);
        cen.writeUInt16LE(0x0800, 8); cen.writeUInt16LE(8, 10); cen.writeUInt32LE(0, 12);
        cen.writeUInt32LE(crc, 16); cen.writeUInt32LE(deflated.length, 20); cen.writeUInt32LE(data.length, 24);
        cen.writeUInt16LE(nameBuf.length, 28); cen.writeUInt32LE(offset, 42);
        central.push(cen, nameBuf);
        offset += head.length + nameBuf.length + deflated.length;
    }
    const cenBuf = Buffer.concat(central);
    const endRec = Buffer.alloc(22);
    endRec.writeUInt32LE(0x06054b50, 0); endRec.writeUInt16LE(files.length, 8); endRec.writeUInt16LE(files.length, 10);
    endRec.writeUInt32LE(cenBuf.length, 12); endRec.writeUInt32LE(offset, 16);
    writeFileSync(out, Buffer.concat([...local, cenBuf, endRec]));
}

for (const [target, manifest] of Object.entries(targets)) {
    const dir = join(DIST, target);
    mkdirSync(join(dir, 'icons'), { recursive: true });
    const files = [];
    const add = (name, data) => { writeFileSync(join(dir, name), data); files.push([name, Buffer.from(data)]); };
    add('manifest.json', JSON.stringify(manifest, null, 2) + '\n');
    add('content.js', content);
    for (const f of ['gm-shim.js', 'popup.html', 'popup.css', 'popup.js']) add(f, readFileSync(join(SRC, f)));
    for (const f of readdirSync(join(SRC, 'icons'))) {
        copyFileSync(join(SRC, 'icons', f), join(dir, 'icons', f));
        files.push([`icons/${f}`, readFileSync(join(SRC, 'icons', f))]);
    }
    zip(files, join(DIST, `${SLUG}-${version}-${target}.zip`));
    console.log(`${target}: dist/${target}/ and dist/${SLUG}-${version}-${target}.zip`);
}
