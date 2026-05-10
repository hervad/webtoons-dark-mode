// Quick sanity check on the userscript metadata block.
// Catches the kind of mistake that breaks the script silently:
// - missing @version (auto-update doesn't know there's a new release)
// - @grant declared but the GM_ function never called
// - GM_ function called but @grant missing
//
// Usage:  node scripts/validate-metadata.mjs

import { readFileSync } from 'node:fs';

const file = 'webtoons-dark-mode.user.js';
const src = readFileSync(file, 'utf8');

const headerMatch = src.match(/\/\/ ==UserScript==([\s\S]*?)\/\/ ==\/UserScript==/);
if (!headerMatch) {
    console.error(`✗ ${file}: missing ==UserScript== metadata block`);
    process.exit(1);
}
const header = headerMatch[1];

function pick(key) {
    return [...header.matchAll(new RegExp(`^\\s*//\\s*@${key}\\s+(.*)$`, 'gm'))].map(m => m[1].trim());
}

const errors = [];
const warnings = [];

// Required keys
for (const required of ['name', 'version', 'description', 'match']) {
    if (pick(required).length === 0) errors.push(`missing @${required}`);
}

// @match URLs should look like URLs
for (const m of pick('match')) {
    if (!/^https?:\/\//.test(m) && m !== '*://*/*') {
        warnings.push(`@match ${m} doesn't look like a URL`);
    }
}

// @grant ↔ GM_ usage parity
const granted = new Set(pick('grant').filter(g => g !== 'none'));
const used = new Set();
const callRe = /\bGM_[a-zA-Z]+\b/g;
let mc;
while ((mc = callRe.exec(src)) !== null) {
    used.add(mc[0]);
}
for (const g of granted) {
    if (g.startsWith('GM_') && !used.has(g)) {
        warnings.push(`@grant ${g} declared but never called`);
    }
}
for (const u of used) {
    if (!granted.has(u) && !granted.has('none')) {
        errors.push(`${u} called but not @grant'ed`);
    }
}

console.log(`Validating ${file}...`);
console.log(`  @name        = ${pick('name')[0]}`);
console.log(`  @version     = ${pick('version')[0]}`);
console.log(`  @match       = ${pick('match').join(', ')}`);
console.log(`  @grant       = ${[...granted].join(', ') || '(none)'}`);
console.log(`  GM_* calls   = ${[...used].join(', ') || '(none)'}`);

if (warnings.length) {
    console.log('');
    for (const w of warnings) console.log(`  ⚠ ${w}`);
}
if (errors.length) {
    console.log('');
    for (const e of errors) console.log(`  ✗ ${e}`);
    process.exit(1);
}

console.log('\n✓ metadata OK');
