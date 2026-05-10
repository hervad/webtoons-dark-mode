// ESLint v9 flat config. Lints the userscript and the helper scripts.
//
// The userscripts plugin validates the ==UserScript== metadata block:
// required keys, @match URL syntax, @grant matching the GM_* calls actually
// used, etc. Catches the kind of mistake that breaks auto-update silently.

import globals from 'globals';
import userscripts from 'eslint-plugin-userscripts';

export default [
    // The userscript itself
    {
        files: ['webtoons-dark-mode.user.js'],
        plugins: { userscripts },
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'script',
            globals: {
                ...globals.browser,
                GM_getValue: 'readonly',
                GM_setValue: 'readonly',
                GM_addStyle: 'readonly',
                GM_registerMenuCommand: 'readonly',
                GM_xmlhttpRequest: 'readonly',
            },
        },
        rules: {
            ...userscripts.configs.recommended.rules,
            // Downgrade noisy rules — these are stylistic, not bugs.
            'userscripts/no-invalid-metadata': 'warn',
            // Plugin wants both @homepage AND @homepageURL; we use @homepageURL.
            'userscripts/use-homepage-and-url': 'off',
        },
    },

    // Node helper scripts
    {
        files: ['scripts/**/*.mjs'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: { ...globals.node },
        },
        rules: {
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
        },
    },
];
