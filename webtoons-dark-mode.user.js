// ==UserScript==
// @name         Webtoons Dark Mode
// @namespace    https://github.com/hervad/webtoons-dark-mode
// @version      1.8.4
// @description  Dark theme for WEBTOON (webtoons.com) that keeps every comic panel in its original colours. Toggle with Alt+Shift+T; optional night-reading dim with Alt+Shift+N.
// @author       hervad
// @match        https://www.webtoons.com/*
// @match        https://m.webtoons.com/*
// @icon         https://webtoons-static.pstatic.net/image/favicon/ios_60x60.png
// @run-at       document-start
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM.getValue
// @grant        GM.setValue
// @noframes
// @license      MIT
// @homepage     https://github.com/hervad/webtoons-dark-mode
// @homepageURL  https://github.com/hervad/webtoons-dark-mode
// @supportURL   https://github.com/hervad/webtoons-dark-mode/issues
// @updateURL    https://raw.githubusercontent.com/hervad/webtoons-dark-mode/main/webtoons-dark-mode.user.js
// @downloadURL  https://raw.githubusercontent.com/hervad/webtoons-dark-mode/main/webtoons-dark-mode.user.js
// ==/UserScript==

(function () {
    'use strict';

    const KEY_THEME = 'wt_dark_enabled';
    const KEY_DIM = 'wt_reader_dim';
    const KEY_VIGNETTE = 'wt_vignette';
    const KEY_TOP_BTN = 'wt_top_button';
    const VERSION = '1.8.4';

    // Log the startup banner as the FIRST runtime statement so that if anything
    // below throws, the console still proves the script loaded and which
    // version Tampermonkey is serving.
    console.info(`[webtoons-dark-mode] v${VERSION} starting`);

    /* ---------- palette: shared colour and icon tokens ---------- */
    const palette = `
        :root {
            --wt-bg:              #15171a;
            --wt-bg-elev:         #22262b;
            --wt-bg-elev2:        #2c313a;
            --wt-bg-hover:        #30353c;
            --wt-bg-input:        #2a2e35;
            --wt-border:          #4a5360;
            --wt-border-strong:   #5a6472;
            --wt-text:            #e6e6e6;
            --wt-text-dim:        #b5b9c0;
            --wt-text-mute:       #979ea8;  /* >= 4.5:1 on every surface, a shade under --wt-text-read */
            --wt-text-read:       #9aa1ab;
            --wt-link:            #7cb6ff;
            --wt-accent:          #00d564;
            --wt-accent-soft:     #4ade80;
            --wt-accent-like:     #f06868;
            /* Primary buttons ("key"): white text on a deep green. Black text
               on the bright brand green looked harsh (the user's call), and
               white on the bright green is unreadable (~1.6:1). White is at
               least 4.5:1 on every stop of both gradients (key 5.1-6.7:1,
               hover 4.6-5.5:1); hover is the lighter of the two. */
            --wt-key:             linear-gradient(180deg, #157f45, #0f6a39);
            --wt-key-hover:       linear-gradient(180deg, #18874b, #127843);
            --wt-key-edge:        rgba(74,222,128,.5);
            --wt-heart-mask:      url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'/></svg>");
            --wt-bubble-mask:     url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2.2' stroke-linejoin='round'><path d='M4 5h16v11H9l-5 4z'/></svg>");
            --wt-shadow:          0 1px 2px rgba(0,0,0,.6);
            /* Share icons for the end-of-episode card (masks; the colour comes from currentColor). */
            --wt-ico-facebook:    url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M13.5 22v-8.2h2.8l.4-3.3h-3.2V8.4c0-.9.3-1.6 1.6-1.6h1.7V3.9c-.3 0-1.3-.1-2.5-.1-2.5 0-4.1 1.5-4.1 4.2v2.5H7.4v3.3h2.8V22z'/></svg>");
            --wt-ico-x:           url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M17.8 3h3.1l-6.8 7.8L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.3-8.3L2 3h6.4l4.4 5.8zm-1.1 16.2h1.7L7.4 4.7H5.6z'/></svg>");
            --wt-ico-tumblr:      url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M14.6 21.5c-2.9 0-4.9-1.5-4.9-5v-5.4H7.2V8.2c2.8-.7 3.9-3.1 4-5.2h2.9v4.7h3.4v3.4h-3.4v4.8c0 1.4.7 2 1.9 2h1.6v3.6z'/></svg>");
            --wt-ico-reddit:      url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path fill-rule='evenodd' d='M12 8.6c4.6 0 8.3 2.6 8.3 5.9S16.6 20.4 12 20.4s-8.3-2.6-8.3-5.9S7.4 8.6 12 8.6zm-3 4a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8zm6 0a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8z'/><circle cx='4.4' cy='11.2' r='2'/><circle cx='19.6' cy='11.2' r='2'/><circle cx='17.4' cy='4.6' r='1.7'/><path d='M12 8.8l1.4-5.3 4 .9' fill='none' stroke='black' stroke-width='1.4' stroke-linejoin='round'/></svg>");
            --wt-ico-link:        url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2.4' stroke-linecap='round'><path d='M10 14a4.2 4.2 0 0 0 6 0l3-3a4.2 4.2 0 0 0-6-6l-1.5 1.5'/><path d='M14 10a4.2 4.2 0 0 0-6 0l-3 3a4.2 4.2 0 0 0 6 6l1.5-1.5'/></svg>");
            --wt-ico-rss:         url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><circle cx='5.5' cy='18.5' r='2.3'/><path d='M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16' fill='none' stroke='black' stroke-width='2.6' stroke-linecap='round'/></svg>");
            /* Stand-in avatar for creators without a profile picture (coloured image, not a mask). */
            --wt-avatar-none:     url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23878e99'><circle cx='12' cy='9' r='4'/><path d='M4.5 20c.8-3.9 3.9-6 7.5-6s6.7 2.1 7.5 6z'/></svg>");
            /* Long-form reading text (series synopsis): ~87% white — the dark-theme
               "high emphasis" level — softer than --wt-text for whole paragraphs. */
            --wt-text-body:       #d2d6dc;
            --wt-ico-play:        url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M8 4.8v14.4a1 1 0 0 0 1.5.86l11.6-7.2a1 1 0 0 0 0-1.72L9.5 3.94A1 1 0 0 0 8 4.8z'/></svg>");
            --wt-ico-restart:     url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><rect x='4' y='4.5' width='2.6' height='15' rx='1.1'/><path d='M20 5.6v12.8a1 1 0 0 1-1.52.85L8.6 13.1a1.3 1.3 0 0 1 0-2.2l9.88-6.15A1 1 0 0 1 20 5.6z'/></svg>");
            /* Green play badge shown over an episode thumbnail on hover (coloured image). */
            --wt-play-badge:      url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><circle cx='12' cy='12' r='12' fill='%2300d564'/><path d='M9.6 7.4v9.2l7.2-4.6z' fill='%230a0a0a'/></svg>");
            /* Footer social + NOTE callout icons (masks). */
            --wt-ico-instagram:   url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><rect x='3' y='3' width='18' height='18' rx='5.2' fill='none' stroke='black' stroke-width='2.2'/><circle cx='12' cy='12' r='4.1' fill='none' stroke='black' stroke-width='2.2'/><circle cx='17.4' cy='6.6' r='1.35'/></svg>");
            --wt-ico-youtube:     url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path fill-rule='evenodd' d='M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15.2V8.8l5.5 3.2z'/></svg>");
            --wt-ico-megaphone:   url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M3 10v4a1.2 1.2 0 0 0 1.2 1.2H6l5.2 4.1a.8.8 0 0 0 1.3-.6V5.3a.8.8 0 0 0-1.3-.6L6 8.8H4.2A1.2 1.2 0 0 0 3 10z'/><path d='M15.8 8.6a5 5 0 0 1 0 6.8M18.6 5.8a9 9 0 0 1 0 12.4' fill='none' stroke='black' stroke-width='2' stroke-linecap='round'/></svg>");
            --wt-ico-info:        url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path fill-rule='evenodd' d='M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-1.25 8.6h2.5V17h-2.5zm0-3.6h2.5v2.4h-2.5z'/></svg>");
            /* Dark arrow on the green login call-to-action button (coloured image). */
            --wt-cta-arrow:       url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%230a0a0a' stroke-width='2.6' stroke-linecap='round' stroke-linejoin='round'><path d='M5 12h13M13 6l6 6-6 6'/></svg>");
            --wt-ico-chevron-down: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2.6' stroke-linecap='round' stroke-linejoin='round'><path d='M6 9l6 6 6-6'/></svg>");
            --wt-ico-close:       url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M6 6l12 12M18 6L6 18' stroke='black' stroke-width='3' stroke-linecap='round'/></svg>");
            --wt-ico-chevron-right: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2.8' stroke-linecap='round' stroke-linejoin='round'><path d='M9 5l7 7-7 7'/></svg>");
            /* Flame for episode like counts, as two masks (outer flame +
               core) so a read row's :visited rule can recolour both: a
               coloured image can't be changed by :visited. */
            --wt-flame-mask:      url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M12.6 1.5c.6 3.4-1.1 5.3-2.8 7.1C8.1 10.3 5.5 12.3 5.5 15.6c0 3.8 2.9 6.9 6.5 6.9s6.5-3.1 6.5-6.9c0-3-1.6-5.4-3.4-7.3-.1 1.7-.8 3-2 3.6.6-3.8-.3-7.6-.5-10.4z'/></svg>");
            --wt-flame-core:      url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M12 12.6c-.9 1.6-3 2.8-3 5a3 3 0 0 0 6 0c0-1.4-.7-2.4-1.5-3.2-.2.8-.6 1.3-1.2 1.6.1-1.3 0-2.3-.3-3.4z'/></svg>");
            --wt-ico-flag:        url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M5.5 21V4' fill='none' stroke='black' stroke-width='2.2' stroke-linecap='round'/><path d='M6.5 4.2h11.2a.6.6 0 0 1 .5.9L16.3 8.5l1.9 3.4a.6.6 0 0 1-.5.9H6.5z'/></svg>");
            /* Reader toolbar Subscribe (plus / tick), translate, account Patreon (masks). */
            --wt-ico-plus:        url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M12 5v14M5 12h14' fill='none' stroke='black' stroke-width='2.6' stroke-linecap='round'/></svg>");
            --wt-ico-check:       url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M5 12.5l4.5 4.5L19 7.5' fill='none' stroke='black' stroke-width='2.6' stroke-linecap='round' stroke-linejoin='round'/></svg>");
            --wt-ico-translate:   url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M3 5h10M8 3v2M5 5c1 4 4 7 7 8M11 5c-1 4-4 7-7 9'/><path d='M13 21l4-9 4 9M14.5 18h5'/></svg>");
            --wt-ico-thumb-up:    url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M2 21h3.5V9.5H2zM22 10.5c0-1.1-.9-2-2-2h-5.6l.9-4.3v-.3c0-.4-.2-.8-.4-1.1L13.8 2 7.6 8.2c-.4.4-.6.9-.6 1.4V19c0 1.1.9 2 2 2h8.6c.8 0 1.5-.5 1.8-1.2l2.5-6c.1-.2.1-.5.1-.7z'/></svg>");
            --wt-ico-thumb-down:  url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M22 3h-3.5v11.5H22zM2 13.5c0 1.1.9 2 2 2h5.6l-.9 4.3v.3c0 .4.2.8.4 1.1l1.1 1.8 6.2-6.2c.4-.4.6-.9.6-1.4V5c0-1.1-.9-2-2-2H6.4c-.8 0-1.5.5-1.8 1.2l-2.5 6c-.1.2-.1.5-.1.7z'/></svg>");
            --wt-ico-trash:       url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M6 7h12l-1 13a2 2 0 0 1-2 1.8H9A2 2 0 0 1 7 20zM9 3.5h6l1 1.5h4v2H4V5h4z'/></svg>");
            --wt-ico-patreon:     url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><circle cx='14.6' cy='9.4' r='6.4'/><rect x='3' y='3' width='3.6' height='18' rx='.6'/></svg>");
            /* Account page login marks (coloured images). */
            --wt-logo-google:     url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'><path fill='%23EA4335' d='M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z'/><path fill='%234285F4' d='M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z'/><path fill='%23FBBC05' d='M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z'/><path fill='%2334A853' d='M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z'/></svg>");
            --wt-logo-mail:       url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23e6e6e6' stroke-width='2' stroke-linejoin='round'><rect x='3' y='5' width='18' height='14' rx='2.5'/><path d='M4 7l8 6.2L20 7' stroke-linecap='round'/></svg>");
            --wt-logo-x:          url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path fill='%23e6e6e6' d='M17.8 3h3.1l-6.8 7.8L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.3-8.3L2 3h6.4l4.4 5.8zm-1.1 16.2h1.7L7.4 4.7H5.6z'/></svg>");
            /* Login popup: the site's mail / Apple sprites are black glyphs (masks). */
            --wt-ico-mail:        url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linejoin='round'><rect x='3' y='5' width='18' height='14' rx='2.5'/><path d='M4 7l8 6.2L20 7' stroke-linecap='round'/></svg>");
            --wt-ico-apple:       url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z'/></svg>");
            --wt-ico-eye:         url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linejoin='round'><path d='M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z'/><circle cx='12' cy='12' r='3'/></svg>");
            --wt-ico-eye-off:     url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linejoin='round' stroke-linecap='round'><path d='M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z'/><circle cx='12' cy='12' r='3'/><path d='M4 4l16 16'/></svg>");
            /* Amber "heads up" badge at the top of the mature-content notice (coloured image). */
            --wt-notice-badge:    url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 56 56'><circle cx='28' cy='28' r='27' fill='%23ffc233' fill-opacity='.13' stroke='%23ffc233' stroke-opacity='.45' stroke-width='1.5'/><rect x='25.5' y='15' width='5' height='17' rx='2.5' fill='%23ffc233'/><circle cx='28' cy='39.5' r='3' fill='%23ffc233'/></svg>");
            /* Five-petal flower beside the selected top-menu item (coloured image). */
            --wt-flower:          url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><g fill='%2300d564'><circle cx='12' cy='6.2' r='4.2'/><circle cx='17.5' cy='10.2' r='4.2'/><circle cx='15.4' cy='16.7' r='4.2'/><circle cx='8.6' cy='16.7' r='4.2'/><circle cx='6.5' cy='10.2' r='4.2'/></g><circle cx='12' cy='12' r='3' fill='%23eafff2'/></svg>");
        }
    `;

    /* ---------- theme: targeted selectors, no global filter ---------- */
    const theme = `
        /* color-scheme tells the browser the page is dark, so everything it
           paints itself — native scrollbars, <select> popups, date pickers,
           autofill, the canvas behind the page during load — renders dark
           too instead of flashing white. accent-color brands checkboxes,
           radios and range sliders without restyling them by hand. */
        :root {
            color-scheme: dark !important;
            accent-color: var(--wt-accent);
        }
        html, body {
            background-color: var(--wt-bg) !important;
            color: var(--wt-text) !important;
            scrollbar-color: var(--wt-bg-hover) var(--wt-bg);
        }
        /* Strips the site scrolls sideways with its scrollbar hidden by
           ::-webkit-scrollbar { display: none }. Chrome ignores that once a
           standard scrollbar property (the scrollbar-color above, inherited)
           applies, so the bars came back. */
        .wcc_CommentBody__contentTagList,
        .TextEditor_OgAttachment-module__root,
        .TextEditor_SortableAttachment-module__list,
        .lnb { scrollbar-width: none !important; }
        /* Respect the OS "reduce motion" setting — but only for motion WE add
           (hover lifts, the sort-menu slide-in). A global "* { transition-
           duration: .01ms }" also shortened the site's own transitions and
           broke its JS: the reader's episode-strip thumbnails never
           lazy-loaded (they stayed grey placeholders) for anyone with
           Windows "Animation effects" off. Never override site-wide timing. */
        @media (prefers-reduced-motion: reduce) {
            /* Every selector starts with "html": this block sits at the top
               of the theme, so without the extra type selector the equal-
               specificity hover rules further down would win again. */
            html .aside.detail .aside_btn .btn_type7:hover,
            html .aside.detail .aside_btn .btn_type7:active,
            html .age_gate_area .btn_type9:active,
            html .age_gate_area ._btn_enter:active,
            html .viewer_lst .spi_area .bx:hover,
            html .viewer_lst .spi_area .bx:focus-visible,
            html .viewer_lst .spi_area .bx:active,
            html .viewer_lst .spi_area .lnk_like.bx:hover,
            html .viewer_lst .spi_area .lnk_favorites.bx:hover,
            html .viewer_lst .spi_area .lnk_like.bx:focus-visible,
            html .viewer_lst .spi_area .lnk_favorites.bx:focus-visible,
            html .cont_box .viewer_lst .spi_area .lnk_favorites.bx.on:hover,
            html .viewer_lst .spi_area > li > a[class^="ico_"]:hover,
            html .viewer_lst .spi_area > li > a[class^="ico_"]:focus-visible,
            html .viewer_lst .spi_area .lnk_like.bx:hover .ico_like2,
            html .detail_header .spi_area > li > a[class^="ico_"]:hover,
            html .detail_header .spi_wrap .btn_favorite:hover,
            html #footer .foot_sns a:is(.btn_foot_facebook, .btn_foot_instagram, .btn_foot_twitter, .btn_foot_youtube):is(:hover, :focus-visible),
            html #footer .footapp_icon_cont a:hover,
            html #footer .footapp_icon_cont a:focus-visible { transform: none !important; }
            html .comment_area .creator_note .author::after,
            html .comment_area .creator_note:has(a.author_name:hover) .author::after { transform: rotate(45deg) !important; }
            html .aside.detail .aside_btn .btn_type7:hover::before,
            html .detail_other .lst_type1 li > a:hover .pic_area img,
            html .challenge_spot_list a:hover .img_area img,
            html .challenge_spot_list a:focus-visible .img_area img,
            html .detail_body .detail_list_area .detail_list_item:hover .thmb img,
            html .detail_body .detail_list_area .detail_list_item .thmb::after,
            html .detail_body .detail_list_area .detail_list_item:hover .thmb::after,
            html .detail_body .detail_list_area .detail_list_item:hover .ico_like { transform: none !important; }
            html .aside.detail .wt-summary-toggle::before { transition: none !important; }
            html .ly_creator,
            html .ly_wrap .ly_box:has(> .ly_adult),
            html .ly_wrap._loginLayer ._loginComponentParent { animation: none !important; }
            html :is(.ly_wrap._loginLayer, .login_wrap) .sns_list .btn_sns:is(:hover, :focus-visible)::after { transform: rotate(45deg) !important; }
            html .login_wrap .login_content_wrap,
            html .agreement { animation: none !important; }
            html .wcc_Editor__editor:has([contenteditable="false"]):hover::after,
            html .wcc_CommentMore__more:hover::after,
            html .wcc_Editor__actionBar .TextEditor_SubmitControlPanel-module__button:hover:not(:disabled) { transform: none !important; }
            html .viewer_lst .spi_area .lnk_like.bx:hover .ico_like2,
            html .viewer_lst .spi_area .lnk_like.bx:is([aria-pressed="true"], :has(> .ico_like2.on)) .ico_like2 { animation: none !important; }
            /* Liking still answers, without movement: the flames fade in
               and out where they sit, and the glow fades. */
            html .viewer_lst .spi_area .lnk_like.bx:is([aria-pressed="true"], :has(> .ico_like2.on))::before { animation: wt-fade-out 1.6s ease-in both !important; }
            html .viewer_lst .spi_area .lnk_like.bx:is([aria-pressed="true"], :has(> .ico_like2.on))::after { animation: wt-like-glow 1.2s ease-out both !important; }
            html #app[class*="BaseLayout_container"] button[class*="ProfileActionButton_follow__"]:is(:hover, :active, :focus-visible),
            html #app[class*="BaseLayout_container"] button[class*="ProfileActionButton_follow__"]:hover::before { transform: none !important; }
            html .btn_lineset,
            html .wcc_Spoiler__slider,
            html .wcc_Spoiler__slider::before { transition: none !important; }
            html .ly_creator .title:has(> a.link:hover)::after,
            html .section_header .button_view_all:hover::after,
            html .discover_cont_area .popular_genre_area .lk_more:hover .ico_arr::after { transform: rotate(45deg) !important; }
            html #header .lnb a[aria-current="true"],
            html #header .lnb a[aria-current="true"]::before, html #header .lnb a[aria-current="true"]::after { animation: none !important; }
            html #bottomEpisodeList .episode_lst li a:hover .thmb,
            html #bottomEpisodeList .episode_lst li a:focus-visible .thmb,
            html #bottomEpisodeList .episode_lst li a:hover .thmb img,
            html .challenge_cont_area a.challenge_item:hover .img_area img,
            html .episode_area#bottomEpisodeList .episode_lst .pg_next:hover::after { transform: none !important; }
            html .episode_area#bottomEpisodeList .episode_lst .pg_prev:hover::before { transform: rotate(180deg) !important; }
            html .tool_area .spi_area > li > a[class^="ico_"]:hover,
            html .tool_area .spi_area > li > a[class^="ico_"]:focus-visible,
            html .aside.viewer .ranking_lst.viewer .lst_type1 > li > a:is(:hover, :focus-visible) .pic_area img,
            html .aside.detail .aside_btn .btn_type7:focus-visible,
            html .detail_header .spi_area > li > a[class^="ico_"]:focus-visible,
            html .detail_header .spi_wrap .btn_favorite:focus-visible,
            html button[class*="ReactionButton_popOverButton"]:is(:hover, :focus-visible, :active),
            html #app[class*="BaseLayout_container"] [class*="HomeFeed_root"] section[class*="Post_root"]:hover { transform: none !important; }
            html .viewer_lst .spi_area .lnk_favorites.bx:hover .ico_plus3 { transform: scale(1.15) !important; transition: none !important; }
            html .sort_box { animation: none !important; }
            html .sort_box a:hover { padding-left: 14px !important; }
        }

        /* Text */
        h1, h2, h3, h4, h5, h6, p, dt, dd, label, em, strong, small,
        .tit, .sub_tit, .subj, .author, .genre, .grade_num, .info, .summary {
            color: var(--wt-text) !important;
        }
        .desc, .date, .count, .from, .ico_view, .num,
        .grade_area, .info_area .author, .meta {
            color: var(--wt-text-dim) !important;
        }

        /* Links */
        a, a:visited { color: var(--wt-text) !important; }
        a:hover      { color: var(--wt-link) !important; }

        /* Exclude button-styled anchors from the global a:hover blue. CTA
           buttons (e.g. age-verification "Continue", "First episode") use
           <a> or <button> with a green background; inheriting --wt-link
           turns their text bright blue on hover which looks broken. Keep
           the button's own text color on hover. */
        a.btn:hover, a[class*="btn_" i]:hover,
        a[class*="button" i]:hover,
        a[role="button"]:hover, button a:hover,
        a[class*="_cta" i]:hover,
        a[class*="primary" i]:hover,
        a.lk_continue:hover {
            color: inherit !important;
        }

        /* Keyboard focus ring — site has none of its own on most controls,
           which fails WCAG 2.4.7. A 2 px outline in --wt-text-read with a
           2 px offset: 4.7:1 or more on every theme surface (the old
           --wt-border-strong ring was 2-3:1). :focus-visible so it only
           appears for keyboard nav. */
        a:focus-visible, button:focus-visible,
        input:focus-visible, textarea:focus-visible, select:focus-visible,
        [role="button"]:focus-visible, [tabindex]:focus-visible {
            outline: 2px solid var(--wt-text-read) !important;
            outline-offset: 2px !important;
        }
        .more { color: var(--wt-link) !important; }

        /* Header / global nav — border-color and box-shadow only on the outer
           header shell, NOT on the .lnb nav list (causes nav item artifacts).
           The menu rules are desktop only: on m.webtoons.com .gnb / .lnb are
           the mobile header (no #header), and the desktop sizing pushed its
           MY tab off-screen. :where() keeps the specificity of the old
           unscoped selectors, so the hover pill still loses to the lit item. */
        #header {
            background-color: var(--wt-bg-elev) !important;
            border-color: var(--wt-border) !important;
            box-shadow: var(--wt-shadow) !important;
            z-index: 10000 !important;
        }
        :where(#header) .lnb {
            background-color: var(--wt-bg-elev) !important;
        }
        /* The links sit edge to edge (only their own padding apart); with
           the selected item lit as a glowing pill, its neighbours' text
           crowded the glow. */
        #header .lnb { gap: 8px !important; align-items: center !important; }
        /* Header rhythm: every control in the bar is 40px tall and centred
           on one line, and the type uses one scale: the main menu at the
           site's own 18px (the theme's old 23px towered over everything
           else) and the right-hand links one step down at 14px, in the same
           face, case and tracking, so the two groups read as one bar. */
        :where(#header) .lnb a {
            position: relative !important;
            display: inline-flex !important;
            align-items: center !important;
            box-sizing: border-box !important;
            height: 40px !important;
            color: var(--wt-text) !important;
            font-family: system-ui, -apple-system, 'Segoe UI', sans-serif !important;
            font-size: 18px !important;
            font-weight: 700 !important;
            letter-spacing: .06em !important;
            padding: 0 20px !important;
            border-radius: 12px !important;
            transition: color .15s, background-color .15s, box-shadow .15s !important;
        }
        /* Selected menu item (the site sets aria-current="true" on the <a>):
           a neon sign. The outline is a lit tube (a near-white core ring plus
           inner and outer green glow), the text has a hot pale core with
           stacked green halos, and a small green flower sits on each side.
           It flickers on once when the page loads and then stays lit. (A
           breathing box-shadow animation never showed, because the
           !important box-shadow beats keyframes, yet it restyled and
           repainted every frame.) The old flat underline sat on the header's bottom
           edge and read as a stray line. The #header ID prefix beats the
           site's own colour rule (0,2,1). The flowers live inside the 20px
           side padding, so the selection never shifts the menu. */
        #header .lnb a[aria-current="true"] {
            color: #eafff2 !important;
            background: rgba(0,255,127,.05) !important;
            border-radius: 12px !important;
            text-shadow: 0 0 1px #fff, 0 0 6px #3dff9a, 0 0 14px rgba(0,230,110,.85), 0 0 30px rgba(0,213,100,.55) !important;
            box-shadow: var(--wt-neon) !important;
            animation: wt-neon-on .9s linear both !important;
        }
        #header {
            --wt-neon: inset 0 0 0 1.5px #b8ffd8, inset 0 0 0 3px rgba(0,255,127,.55), inset 0 0 16px rgba(0,255,127,.28), 0 0 0 1px rgba(0,255,127,.45), 0 0 12px rgba(0,255,127,.55), 0 0 30px rgba(0,213,100,.35);
        }
        /* A tube striking: two quick drop-outs, then lit. Opacity only, so
           the text and the flowers flicker with the ring. */
        @keyframes wt-neon-on {
            0%, 9%   { opacity: .25; }
            10%, 16% { opacity: 1; }
            17%, 24% { opacity: .35; }
            25%, 40% { opacity: 1; }
            41%, 44% { opacity: .55; }
            45%, 100% { opacity: 1; }
        }
        #header .lnb a[aria-current="true"]::before, #header .lnb a[aria-current="true"]::after {
            content: '' !important;
            position: absolute !important;
            top: 50% !important;
            width: 10px !important;
            height: 10px !important;
            margin-top: -5px !important;
            background: var(--wt-flower) center / contain no-repeat !important;
            filter: drop-shadow(0 0 2px rgba(120,255,180,.9)) drop-shadow(0 0 6px rgba(0,255,127,.7)) !important;
            animation: wt-bloom .55s cubic-bezier(.2,.9,.3,1.3) both !important;
            pointer-events: none !important;
        }
        #header .lnb a[aria-current="true"]::before { left: 6px !important; }
        #header .lnb a[aria-current="true"]::after { right: 6px !important; animation-delay: .08s !important; }
        @keyframes wt-bloom {
            from { opacity: 0; transform: scale(.3) rotate(-72deg); }
            to   { opacity: 1; transform: none; }
        }
        /* GNB links wrap their text in <h1> — our blanket h1 rule sets
           color:--wt-text !important which beats the inherited accent color.
           Scope the override directly under #header so it wins by ID specificity. */
        #header a[aria-current="true"] h1 {
            color: #eafff2 !important;
            font-size: inherit !important;
            font-weight: inherit !important;
        }
        /* Hover: a light pill and white text, like every other hover tile
           in the theme; green is kept for the selected item. */
        :where(#header) .lnb a:hover,
        #header .header_right .link_menu:hover,
        #header .header_right .link_menu:focus-visible {
            color: #fff !important;
            background-color: rgba(255,255,255,.07) !important;
            box-shadow: inset 0 0 0 1px rgba(255,255,255,.08) !important;
        }

        /* Search button (top-right of header): the magnifier sprite is a
           dark glyph, filtered to white for the dark header. */
        .header_right .btn_search:before { filter: brightness(0) invert(1) opacity(.85) !important; }
        /* Right-hand header controls, as one set. Base: two text links in a
           condensed bold face, DASHBOARD a solid black pill, Log In an
           outlined pill and the search disc, all different. Now the links
           use the menu's face (quieter: secondary navigation, so smaller
           and dimmer than the main menu) with the menu's hover pill, and
           DASHBOARD, Log In and search share one quiet 40px glass control.
           #btnLogin only: #btnLoginInfo (logged in) is the profile button. */
        #header .header_right { column-gap: 4px !important; align-items: center !important; }
        #header .header_right .util_cont { column-gap: 8px !important; margin-left: 12px !important; align-items: center !important; }
        #header .header_right .link_menu {
            position: relative !important;
            display: inline-flex !important;
            align-items: center !important;
            box-sizing: border-box !important;
            height: 40px !important;
            padding: 0 14px !important;
            border-radius: 12px !important;
            color: var(--wt-text-dim) !important;
            font-family: system-ui, -apple-system, 'Segoe UI', sans-serif !important;
            font-size: 14px !important;
            font-weight: 700 !important;
            letter-spacing: .06em !important;
            transition: color .15s, background-color .15s, box-shadow .15s !important;
        }
        #header .header_right .link_menu .link_text { color: inherit !important; }
        #header .header_right .link_publish,
        #header .header_right #btnLogin,
        #header .header_right .btn_search {
            box-sizing: border-box !important;
            height: 40px !important;
            background: rgba(255,255,255,.05) !important;
            border: 1px solid rgba(255,255,255,.14) !important;
            box-shadow: none !important;
            color: var(--wt-text) !important;
            transition: background-color .15s ease, border-color .15s ease, color .15s ease !important;
        }
        #header .header_right .link_publish,
        #header .header_right #btnLogin {
            display: inline-flex !important;
            align-items: center !important;
            padding: 0 18px !important;
            border-radius: 999px !important;
            font-family: system-ui, -apple-system, 'Segoe UI', sans-serif !important;
            font-size: 14px !important;
            font-weight: 700 !important;
            letter-spacing: .06em !important;
            text-transform: uppercase !important;
            line-height: 1 !important;
        }
        #header .header_right .btn_search { width: 40px !important; }
        /* Logged in, the site hides Log In and shows the profile button
           with an inline display; the inline-flex above beat it, so Log In
           stayed next to the name. */
        #header .header_right #btnLogin[style*="none"],
        #header .header_right #btnLoginInfo[style*="none"] { display: none !important; }
        /* The page ships "Log In" visible and the site's script swaps in
           the name only after an account request returns, so every page
           load flashed LOG IN for a logged-in reader. watchLoginState()
           (JS) marks the page while that request is pending if the last
           page was logged in; the button keeps its space but is not drawn. */
        html[data-wt-auth="pending"] #header .header_right #btnLogin { visibility: hidden !important; }
        #header .header_right #btnLoginInfo {
            display: inline-flex !important;
            align-items: center !important;
            box-sizing: border-box !important;
            height: 40px !important;
            padding: 0 18px !important;
            border-radius: 999px !important;
            background: rgba(255,255,255,.05) !important;
            border: 1px solid rgba(255,255,255,.14) !important;
            box-shadow: none !important;
            color: var(--wt-text) !important;
            font-family: system-ui, -apple-system, 'Segoe UI', sans-serif !important;
            font-size: 14px !important;
            font-weight: 700 !important;
            line-height: 1 !important;
            transition: background-color .15s ease, border-color .15s ease, color .15s ease !important;
        }
        #header .header_right #btnLoginInfo:hover,
        #header .header_right #btnLoginInfo[aria-expanded="true"] {
            background: rgba(255,255,255,.1) !important;
            border-color: rgba(255,255,255,.28) !important;
            color: #fff !important;
        }
        #header .header_right #btnLoginInfo * { color: inherit !important; }
        /* Account menu (#layerMy: Subscriptions, Comments, Following,
           Account, Logout; filled in by the site's script). Base: a white
           panel with grey rows. Now the comment menu's dark panel: plain
           40px rows with a soft tile on hover, Logout below a hairline. */
        .util_cont .ly_loginbox {
            min-width: 200px !important;
            padding: 6px !important;
            background: #2a2f36 !important;
            border: 1px solid rgba(255,255,255,.1) !important;
            border-radius: 12px !important;
            box-shadow: 0 16px 40px rgba(0,0,0,.55), 0 2px 8px rgba(0,0,0,.35) !important;
        }
        .util_cont .ly_loginbox .login_name {
            background: transparent !important;
            border: 0 !important;
            color: var(--wt-text) !important;
        }
        .util_cont .ly_loginbox .loginbox_cont { padding: 0 !important; background: transparent !important; }
        .util_cont .ly_loginbox .loginbox_cont .login_menu {
            display: flex !important;
            align-items: center !important;
            min-height: 40px !important;
            padding: 0 12px !important;
            border-radius: 8px !important;
            color: var(--wt-text) !important;
            font-family: system-ui, -apple-system, 'Segoe UI', sans-serif !important;
            font-size: 15px !important;
            font-weight: 500 !important;
            line-height: 1 !important;
            text-decoration: none !important;
            transition: background-color .12s ease, color .12s ease !important;
        }
        .util_cont .ly_loginbox .loginbox_cont .login_menu:hover,
        .util_cont .ly_loginbox .loginbox_cont .login_menu:focus-visible {
            background: rgba(255,255,255,.08) !important;
            color: #fff !important;
        }
        .util_cont .ly_loginbox .loginbox_cont .login_menu:last-child {
            position: relative !important;
            margin-top: 11px !important;
            color: var(--wt-text-dim) !important;
            font-weight: 600 !important;
        }
        .util_cont .ly_loginbox .loginbox_cont .login_menu:last-child::before {
            position: absolute !important;
            top: -6px !important;
            left: 4px !important;
            right: 4px !important;
            margin: 0 !important;
            height: 1px !important;
            background-color: rgba(255,255,255,.08) !important;
        }
        #header .header_right .link_publish:hover,
        #header .header_right .link_publish:focus-visible,
        #header .header_right #btnLogin:hover,
        #header .header_right #btnLogin:focus-visible,
        #header .header_right .btn_search:hover,
        #header .header_right .btn_search:focus-visible {
            background: rgba(255,255,255,.1) !important;
            border-color: rgba(255,255,255,.28) !important;
            color: #fff !important;
        }

        /* Search dropdown — ONE surface. .search_area is the floating panel;
           everything inside it (.input_box pill, .ly_autocomplete list) is
           flat on that panel. .search_cont is only the wrapper around the
           header's search button — giving it a box drew a second frame
           behind the panel. The <input> itself gets no border / bg / outline
           (the generic input rule would add a box inside the pill); focus is
           shown on the pill via :focus-within instead. */
        .search_area {
            background: var(--wt-bg-elev) !important;
            border: 1px solid rgba(255,255,255,.12) !important;
            border-radius: 14px !important;
            box-shadow: 0 16px 40px rgba(0,0,0,.6), 0 2px 8px rgba(0,0,0,.4) !important;
        }
        .search_area .input_box {
            background: var(--wt-bg-input) !important;
            border: 1px solid transparent !important;
            transition: border-color .15s ease, box-shadow .15s ease !important;
        }
        .search_area .input_box:focus-within {
            border-color: var(--wt-accent) !important;
            box-shadow: 0 0 0 3px rgba(0,213,100,.18) !important;
        }
        .search_area .input_box:before { filter: brightness(0) invert(1) opacity(.6) !important; }
        .search_area .input_search, .search_area ._txtKeyword {
            background: transparent !important;
            border: 0 !important;
            outline: none !important;
            box-shadow: none !important;
            color: var(--wt-text) !important;
        }
        /* Clear (×) button in the search box. The sprite is a grey disc with
           a white ×; brightness(0) invert(1) turned both white, leaving a
           blank grey circle. Draw the × as a mask on a small round button
           that brightens on hover. display is left alone: the site shows
           and hides the button itself. */
        .search_area .btn_delete_search {
            width: 22px !important;
            height: 22px !important;
            top: 50% !important;
            margin-top: -11px !important;
            padding: 0 !important;
            border: 0 !important;
            border-radius: 50% !important;
            background: rgba(255,255,255,.12) !important;
            color: var(--wt-text-dim) !important;
            font-size: 0 !important;
            filter: none !important;
            cursor: pointer !important;
            transition: background-color .15s ease, color .15s ease !important;
        }
        .search_area .btn_delete_search::before {
            content: '' !important;
            position: absolute !important;
            inset: 0 !important;
            margin: auto !important;
            width: 10px !important;
            height: 10px !important;
            background: currentColor !important;
            -webkit-mask: var(--wt-ico-close) center / contain no-repeat !important;
            mask: var(--wt-ico-close) center / contain no-repeat !important;
        }
        .search_area .btn_delete_search:hover,
        .search_area .btn_delete_search:focus-visible {
            background: rgba(255,255,255,.24) !important;
            color: #fff !important;
        }
        .search_area .ly_autocomplete {
            background: transparent !important;
            border: 0 !important;
            box-shadow: none !important;
        }
        .search_area .ly_autocomplete li { background: transparent !important; }
        .search_area .ly_autocomplete a, .search_area .ly_autocomplete .title { color: var(--wt-text) !important; }
        .search_area .ly_autocomplete .autocomplete_foot a { color: var(--wt-text-dim) !important; }
        .search_area .ly_autocomplete .autocomplete_foot a:hover { color: var(--wt-text) !important; }
        .search_area .ly_autocomplete .autocomplete_foot .ico_arr_black { filter: invert(1) opacity(.7) !important; }

        /* Recent-search history. Base: #767676 text, #f3f3f3 hover / keyboard
           (.on) background — the white bar in the dropdown. */
        .search_area .lst_history a {
            color: var(--wt-text-dim) !important;
            border-radius: 8px !important;
            transition: background-color .12s ease, color .12s ease !important;
        }
        .search_area .lst_history li.on,
        .search_area .lst_history li { background: transparent !important; }
        .search_area .lst_history a:hover,
        .search_area .lst_history li.on a {
            background: var(--wt-bg-hover) !important;
            color: var(--wt-text) !important;
        }
        .search_area .lst_history a strong { color: var(--wt-accent) !important; }
        .search_area .lst_history.type_none { color: var(--wt-text-mute) !important; }

        /* Search autocomplete RESULT LIST (e.g. typing "roman" → Selfish Romance,
           Sweet Romance, ... Each <li class="link"> has white-on-hover from base
           CSS, plus #000 title + #8c8c8c info — all needs overriding. */
        .search_area .list_autocomplete .link { border-radius: 8px !important; }
        .search_area .list_autocomplete li.on,
        .search_area .list_autocomplete .link:hover,
        .search_area .list_autocomplete li.on .link {
            background: var(--wt-bg-hover) !important;
        }
        .search_area .list_autocomplete .subj { color: var(--wt-text) !important; }
        .search_area .list_autocomplete .info { color: var(--wt-text-dim) !important; }
        /* Bold-highlighted matching substring (e.g. "roman" inside "Sweet Romance").
           Base uses brand green #03aa5a — keep brand identity but use our accent var. */
        .search_area .list_autocomplete strong { color: var(--wt-accent) !important; }
        .search_area .list_autocomplete+.title { border-top-color: var(--wt-border) !important; }
        .search_area .list_autocomplete .info .bar { background: var(--wt-border) !important; }
        .search_area .list_autocomplete .pic:before { border-color: var(--wt-border) !important; }

        /* Creators section in search autocomplete — base hover is #f3f3f3 (white). */
        .search_area .list_creator .link:hover { background: var(--wt-bg-hover) !important; }
        .search_area .list_creator .info .author { color: var(--wt-text) !important; }
        .search_area .list_creator .link strong { color: var(--wt-accent) !important; }
        .search_area .list_creator .info { color: var(--wt-text-dim) !important; }
        .search_area .list_creator .info .bar { background: var(--wt-border) !important; }


        /* /canvas home tiles (<a class="discover_item">, styled in the
           /canvas block further down): the anchor keeps the text colour, or
           a hovered tile's text would turn link-blue. */
        a.discover_item { color: var(--wt-text) !important; }

        /* Hover darken: hovering a cover dims the artwork, the listing
           tiles' hover cue (with the title turning green). Scoped strictly
           to card containers to avoid touching viewer panel images, which
           must stay pristine. transition lives on the img so the dim eases
           in/out. */
        .discover_lst li img, a.discover_item img,
        .webtoon_list li img, .webtoon_list_wrap li img,
        .discover_spot li img {
            transition: filter .2s ease !important;
        }
        .discover_lst li:hover img, a.discover_item:hover img,
        .webtoon_list li:hover img, .webtoon_list_wrap li:hover img,
        .discover_spot li:hover img {
            filter: brightness(.7) !important;
        }
        /* Hover darken extended to: viewer bottom episode strip + viewer sidebar
           "Trending & Popular" / "Top Originals" rankings. */
        .episode_lst li .thmb img, .episode_lst li img,
        .ranking_lst li img, .aside .ranking_lst li img {
            transition: filter .2s ease !important;
        }
        .episode_lst li:hover .thmb img, .episode_lst li:hover img,
        .ranking_lst li:hover img, .aside .ranking_lst li:hover img {
            filter: brightness(.7) !important;
        }

        /* /canvas genre lists: .challenge_cont_area > .challenge_lst > ul >
           li > a.challenge_item (the /canvas home tab is .discover_*). Flat
           tiles: the section card is the only elevation. The /canvas list
           block further down lays them out. */
        a.challenge_item {
            background: transparent !important;
            color: var(--wt-text) !important;
            border-radius: 6px !important;
            overflow: visible !important;
            border: 0 !important;
            box-shadow: none !important;
            min-width: 0 !important;
            max-width: 100% !important;
            /* overflow: visible so the rounded image (clipped on the img/thmb
               itself, not the anchor) doesn't fight a square clip box. */
            transition: color .15s ease !important;
        }
        .challenge_item img { transition: filter .2s ease !important; }
        a.challenge_item:hover img { filter: brightness(.7) !important; }
        /* Like / subscriber counter on canvas cards — match the green heart
           icon so number + icon read as one element. */
        .challenge_item .grade_num { color: var(--wt-accent) !important; }
        /* The grid in one elevated section card (its padding and shape are
           set in the /canvas list block). box-sizing:border-box is
           critical: without it the padding adds outside the computed width
           and pushes the .aside.challenge float (Top CANVAS / Up & Coming)
           down below the grid instead of beside it. */
        .challenge_cont_area {
            background: var(--wt-bg-elev) !important;
            box-sizing: border-box !important;
            overflow: visible !important;
        }
        /* The base clips the list; nothing inside the card is cut off. */
        .challenge_cont_area .challenge_lst,
        .challenge_cont_area .challenge_lst > ul { overflow: visible !important; }
        /* Grid layout with explicit gap — the base CSS lays cards out with
           no breathing room, leaving them edge-to-edge. Fixed 4 columns with
           minmax(0, 1fr) so a card's intrinsic min-width (cover image) can't
           force the column wider than the available track, which would
           otherwise push the rightmost card out of view or drop the row. */
        .challenge_lst > ul {
            display: grid !important;
            grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
            padding: 0 !important;
            margin: 0 !important;
        }
        .challenge_lst > ul > li {
            width: auto !important;
            min-width: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            float: none !important;
        }
        a.challenge_item img { max-width: 100% !important; display: block !important; }
        /* No bottom borders in the challenge_* tree: the base CSS draws
           them on the list levels and on each cover's .thum_skin overlay. */
        .challenge_cont_area,
        .challenge_cont_area .thum_skin,
        .challenge_lst,
        .challenge_lst > ul,
        .challenge_lst > ul > li {
            border-bottom: 0 !important;
        }

        /* Shared sidebar card: the /canvas rail's Top CANVAS / Up & Coming
           AND the viewer's Trending & Popular / Top Originals — all are
           .ranking_lst.viewer > .lst_area. One card per .lst_area, nothing
           wrapped around it, and no id-scoped rules: they made Top CANVAS
           differ from Up & Coming. A top-lit hairline (brighter top edge) +
           shadow separates the card from the page without the harsh
           full-white outline. */
        .aside.challenge .lst_area,
        .ranking_lst.viewer > .lst_area {
            background: var(--wt-bg-elev) !important;
            border: 1px solid rgba(255,255,255,.08) !important;
            border-top-color: rgba(255,255,255,.14) !important;
            border-radius: 16px !important;
            padding: 16px !important;
            box-sizing: border-box !important;
            box-shadow: 0 12px 32px rgba(0,0,0,.35) !important;
            margin: 0 !important;
        }
        /* Flat ranking rows inside Top CANVAS / Up & Coming — no per-row
           border or background ("volume"). Hover only turns the title green. */
        .aside.challenge .lst_type1 > li,
        .ranking_lst.viewer .lst_type1 > li {
            border: 0 !important;
            background: transparent !important;
            padding: 6px 0 !important;
            margin: 0 !important;
            transition: color .15s ease !important;
        }
        .aside.challenge .lst_type1 > li:hover,
        .ranking_lst.viewer .lst_type1 > li:hover {
            background: transparent !important;
        }
        .aside.challenge .lst_type1 > li:hover .subj,
        .ranking_lst.viewer .lst_type1 > li:hover .subj {
            color: var(--wt-accent) !important;
        }
        /* Ranking-card header arrow (.ico_arr1 in each card's .title_area):
           strip the sprite and reset the box. The "Ranking sidebar cards"
           block draws the chevron. */
        .title_area h2 .ico_arr1 {
            background: none !important;
            color: var(--wt-text-dim) !important;
            font-style: normal !important;
            text-indent: 0 !important;
            filter: none !important;
            width: auto !important;
            height: auto !important;
            display: inline-flex !important;
            align-items: center !important;
            margin: 0 0 0 6px !important;
            vertical-align: middle !important;
            position: static !important;
        }
        .aside.challenge .lst_type1 { border-bottom: none !important; }
        .aside.challenge h2, .aside.challenge h3,
        .aside.challenge .title_area { color: var(--wt-text) !important; }
        /* Subscriber-count badge overlaid on each carousel card thumbnail.
           DOM: <span class="badge_discover num">7K</span> inside .discover_badge_area */
        .badge_discover { border-radius: 9999px !important; }

        /* Sections — #content and #container are the actual IDs in the DOM.
           #wrap wraps the entire page including header so excluded here —
           html/body already covers the page background.
           .detail_header is intentionally excluded: it is 1200px centered and
           sits ON TOP of the full-width .detail_bg artwork element. Setting its
           background-color to dark would paint over the artwork in the center
           while leaving the artwork visible on the sides — the opposite of
           what we want. .detail_header background defaults to transparent, which
           lets the .detail_bg artwork show through in the header area. */
        #content, #container, .cont_area, .cont_box, .detail_body {
            background-color: var(--wt-bg) !important;
            color: var(--wt-text) !important;
        }
        /* detail_body children are floated, so detail_body collapses to height 0
           and its background paints nothing — artwork bleeds through card corners.
           display:flow-root forces detail_body to contain its floats (proper height).
           overflow:hidden clips the artwork at the rounded boundary.
           background:--wt-bg matches the page so the container is invisible below
           the shorter sidebar card, and card corners show the page colour naturally. */
        .detail_body {
            display: flow-root !important;
            overflow: hidden !important;
            border-radius: 16px !important;
            background: var(--wt-bg) !important;
            padding-top: 0 !important;
        }
        .detail_header { color: var(--wt-text) !important; }

        /* Popups / modals */
        .modal, .dialog, .ly_box {
            background-color: var(--wt-bg-elev) !important;
            color: var(--wt-text) !important;
            border: 1px solid var(--wt-border) !important;
            box-shadow: 0 8px 24px rgba(0,0,0,.5) !important;
        }

        /* Promotional banners on /canvas: <a class="contest_banner"
           style="background-color: …"> — a full-width strip with a 1200px
           creative centred inside. The strip's colour is the site's guess at
           the creative's edge and often misses (#181818 behind a #282828
           "Make money" banner), leaving visible side strips, so the strip is
           transparent and the creative is a rounded card on the page
           background. The anchor must not clip, or the card's shadow is cut
           off. Only light creatives get dimmed: tuneContestBanners() (JS)
           measures the inline colour and sets data-wt-light on light ones,
           and the filter goes on the whole anchor. */
        .contest_banner, a.contest_banner {
            border-radius: 0 !important;
            display: block !important;
            position: relative !important;
            transition: filter .2s ease !important;
        }
        .contest_banner img { display: block !important; margin: 0 auto !important; }
        a.contest_banner { background-color: transparent !important; margin-bottom: 32px !important; }
        a.contest_banner img {
            max-width: 100% !important;
            border-radius: 16px !important;
            box-shadow: 0 12px 32px rgba(0,0,0,.35) !important;
        }
        .contest_banner[data-wt-light] { filter: brightness(.34) saturate(.4) contrast(1.05) !important; }
        .contest_banner[data-wt-light]:hover { filter: brightness(.5) saturate(.55) contrast(1.05) !important; }

        /* Sub-nav (snb): day-of-week picker AND genre tabs share this component */
        .snb_wrap, .snb_inner, .snb {
            background-color: var(--wt-bg) !important;
            border-color: var(--wt-border) !important;
        }
        /* Force the bottom underline color so the strip reads continuously
           on dark — base CSS uses .5px solid #e0e0e0 which is invisible.
           padding-bottom:0 removes the height gap between snb_inner and
           snb_wrap. border-bottom alone gets covered by snb_inner
           (position:relative paints above its parent's border), so we draw
           the line via ::after with z-index:10 to paint over snb_inner. */
        .snb_wrap, .snb_wrap.type_sub {
            padding-bottom: 0 !important;
            position: relative !important;
            border-bottom: none !important;
            z-index: 10000 !important;
        }
        .snb_wrap::after {
            content: '' !important;
            position: absolute !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            height: 1px !important;
            background-color: var(--wt-border) !important;
            z-index: 10 !important;
            pointer-events: none !important;
        }
        /* Sub-nav scroll arrows (on long tab strips, e.g. the /canvas genre
           row). Base: a dark sprite on a #fff button, invisible on dark.
           The button is a fade from the page colour (tabs slide under it)
           holding a 34px round button (::before) with a mask chevron
           (::after) in the button's colour, like the carousel arrows; on
           hover the disc and the chevron turn green. */
        .snb_wrap .snb_inner .btn_snb_prev,
        .snb_wrap .snb_inner .btn_snb_next {
            border: 0 !important;
            box-shadow: none !important;
            color: var(--wt-text) !important;
            background: linear-gradient(90deg, var(--wt-bg) 55%, rgba(21,23,26,0)) !important;
        }
        .snb_wrap .snb_inner .btn_snb_next { background: linear-gradient(270deg, var(--wt-bg) 55%, rgba(21,23,26,0)) !important; }
        /* Centred from the button's midpoint: the button is 30px wide with
           uneven padding, narrower than the 34px disc, so "inset: 0; margin:
           auto" could not centre it and the disc sat 2-3px off the chevron. */
        .snb_wrap .snb_inner .btn_snb_prev::before,
        .snb_wrap .snb_inner .btn_snb_next::before {
            content: '' !important;
            position: absolute !important;
            inset: auto !important;
            top: 50% !important;
            left: 50% !important;
            margin: -17px 0 0 -17px !important;
            width: 34px !important;
            height: 34px !important;
            box-sizing: border-box !important;
            border-radius: 50% !important;
            background: var(--wt-bg-elev) !important;
            border: 1px solid rgba(255,255,255,.16) !important;
            box-shadow: 0 4px 12px rgba(0,0,0,.45) !important;
            transition: background-color .15s ease, border-color .15s ease, box-shadow .15s ease !important;
        }
        .snb_wrap .snb_inner .btn_snb_prev::after,
        .snb_wrap .snb_inner .btn_snb_next::after {
            content: '' !important;
            position: absolute !important;
            pointer-events: none !important;
            inset: auto !important;
            top: 50% !important;
            left: 50% !important;
            margin: -7px 0 0 -7px !important;
            width: 14px !important;
            height: 14px !important;
            font-size: 0 !important;
            background: currentColor !important;
            -webkit-mask: var(--wt-ico-chevron-right) center / contain no-repeat !important;
            mask: var(--wt-ico-chevron-right) center / contain no-repeat !important;
        }
        .snb_wrap .snb_inner .btn_snb_prev::after { transform: rotate(180deg) !important; }
        .snb_wrap .snb_inner .btn_snb_prev:hover,
        .snb_wrap .snb_inner .btn_snb_next:hover { color: var(--wt-accent-soft) !important; }
        .snb_wrap .snb_inner .btn_snb_prev:hover::before,
        .snb_wrap .snb_inner .btn_snb_next:hover::before {
            background: #1f3a2c !important;
            border-color: rgba(0,213,100,.55) !important;
            box-shadow: 0 0 0 4px rgba(0,213,100,.12), 0 4px 12px rgba(0,0,0,.45) !important;
        }
        .snb_item, .snb_tab {
            background-color: transparent !important;
            color: var(--wt-text) !important;
            border-color: var(--wt-border) !important;
        }
        /* Hover: a rounded light pill behind the label and white text, the
           same hover tile the pager, sort switch and comment buttons use.
           The tab is the full 60px bar height with 4px side padding, so a
           background on the tab itself was a hard-edged grey column; the
           pill is a ::before inset inside it instead. isolation makes the
           tab a stacking context so the z-index:-1 pill stays above the
           sub-nav's own background. */
        .snb_tab {
            position: relative !important;
            isolation: isolate !important;
        }
        .snb_tab::before {
            content: '' !important;
            position: absolute !important;
            inset: 12px -12px !important;
            height: auto !important;
            z-index: -1 !important;
            border-radius: 10px !important;
            background: rgba(255,255,255,.07) !important;
            opacity: 0 !important;
            transition: opacity .15s ease !important;
            pointer-events: none !important;
        }
        .snb_item:hover .snb_tab, .snb_tab:hover {
            color: #fff !important;
            background-color: transparent !important;
        }
        .snb_item:hover .snb_tab::before, .snb_tab:hover::before,
        .snb_tab:focus-visible::before { opacity: 1 !important; }
        .snb_item.is_selected .snb_tab,
        .snb_tab[aria-current="true"],
        .snb_tab[aria-current="page"] {
            color: var(--wt-accent) !important;
            transform: none !important;
        }

        /* === Homepage / listing pages ===
           Two levels: page (--wt-bg) → section card (--wt-bg-elev); the
           comic tiles inside a section are flat. */

        /* Section containers become elevated cards with rounded corners.
           .main_section = "Trending & Popular Series" carousel block.
           .webtoon_list_wrap = "Popular Series by Category", "Newly Released", etc. */
        .main_section, .webtoon_list_wrap {
            background: var(--wt-bg-elev) !important;
            border-radius: 16px !important;
            padding: 24px 24px 28px !important;
            box-shadow: 0 1px 0 rgba(255,255,255,.05), 0 8px 32px rgba(0,0,0,.35) !important;
            color: var(--wt-text) !important;
        }
        /* /originals, /genres: the list card is the page's first block and
           sat flush against the sub-nav's bottom line. */
        #content > .snb_wrap + .webtoon_list_wrap,
        #content > .webtoon_list_wrap:first-child { margin-top: 28px !important; }
        /* Faint accent line below each section header to anchor the title. */
        .main_section .section_header,
        .webtoon_list_wrap .section_header {
            border-bottom: 1px solid rgba(0, 213, 100, .18) !important;
            margin-bottom: 16px !important;
        }
        /* "more ›" link (a.lk_more, /canvas Popular By Category): the
           chevron is a dark sprite in a child <span class="ico_arr">. Strip
           the sprite and draw a border chevron in the link's colour (a
           "›" glyph sat on the baseline, low and glued to the label). */
        .lk_more {
            color: var(--wt-text-dim) !important;
        }
        .lk_more .ico_arr {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            width: 10px !important;
            height: 10px !important;
            margin-left: 4px !important;
            background: none !important;
            text-indent: 0 !important;
            overflow: visible !important;
            vertical-align: middle !important;
        }
        .lk_more .ico_arr::after {
            content: '' !important;
            width: 6px !important;
            height: 6px !important;
            margin-left: -3px !important;
            border-top: 2px solid currentColor !important;
            border-right: 2px solid currentColor !important;
            transform: rotate(45deg) !important;
        }

        /* Comic cards within section containers: flat tiles. The parent
           section already provides elevation, so per-card shadow + lift
           created a "double volume" effect. Hover = image darken (the hover
           darken rule above) + title turns accent green. */
        .main_section .webtoon_list li,
        .webtoon_list_wrap .webtoon_list li {
            background: transparent !important;
            border-color: transparent !important;
            border-radius: 10px !important;
            box-shadow: none !important;
            transform: none !important;
            transition: color .15s ease !important;
        }
        .main_section .webtoon_list li:hover .title,
        .main_section .webtoon_list li:hover .subj,
        .webtoon_list_wrap .webtoon_list li:hover .title,
        .webtoon_list_wrap .webtoon_list li:hover .subj {
            color: var(--wt-accent) !important;
        }
        /* Card text area: title sits on its own row; genre + like/view sit
           on a single row beneath. flex-wrap allows fallback to two rows on
           very narrow cards. Removing the previous .view_count margin-top is
           what brings the count onto the same line as .genre. */
        .webtoon_list .info_text {
            margin-top: 10px !important;
            padding: 0 4px !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 2px !important;
        }
        .webtoon_list .info_text .title {
            color: var(--wt-text) !important;
        }
        .webtoon_list .info_text > .genre,
        .webtoon_list .info_text > .view_count {
            display: inline-block !important;
            margin: 0 !important;
        }
        /* Heart / view counter inherits the brand-green heart-icon colour so
           number and icon read as one element. */
        .webtoon_list .view_count {
            color: var(--wt-accent) !important;
        }
        /* Pair genre with the heart/view stat on one row. Wraps both children
           in a flex row when both exist. Uses :has() so cards with only one
           child fall back gracefully. */
        .webtoon_list .info_text:has(.genre + .view_count) {
            display: grid !important;
            grid-template-columns: 1fr auto !important;
            grid-template-areas:
                "title title"
                "genre stat" !important;
            column-gap: 8px !important;
        }
        .webtoon_list .info_text > .title { grid-area: title !important; }
        .webtoon_list .info_text > .genre { grid-area: genre !important; }
        .webtoon_list .info_text > .view_count { grid-area: stat !important; justify-self: end !important; }

        /* Section header text. */
        .section_header { color: var(--wt-text) !important; }
        .sort_area, .sort_by_area {
            background-color: transparent !important;
        }
        /* Listing header ("159 series" · by Popularity | by Likes | by Date),
           e.g. /originals. Base: a small grey count and three grey text
           links split by 1px bars, with the current one only slightly
           darker — on dark neither read at a glance. The sort links become
           a segmented control on a full-width row of its own (beside the
           count it was squeezed: the user's call), its current option a
           green-tinted chip; the count is a quiet note under it. Text stays
           the site's (translated). */
        .section_header:has(> .series_count) {
            display: flex !important;
            flex-wrap: wrap !important;
            align-items: center !important;
            justify-content: flex-start !important;
            column-gap: 16px !important;
            height: auto !important;  /* base: a fixed one-row height */
            padding-bottom: 18px !important;
        }
        .section_header .series_count {
            display: flex !important;
            align-items: baseline !important;
            column-gap: 7px !important;
            color: var(--wt-text-dim) !important;
            font-size: 15px !important;
            line-height: 1 !important;
        }
        .section_header .section_title + .series_count::before { background-color: rgba(255,255,255,.18) !important; }
        .section_header .series_count .number {
            color: #fff !important;
            font-size: 26px !important;
            font-weight: 800 !important;
            font-style: normal !important;
            letter-spacing: -.01em !important;
            font-variant-numeric: tabular-nums !important;
        }
        .section_header .series_count span { color: var(--wt-text-dim) !important; }
        .section_header .sort_area:has(.sort_by) {
            display: inline-flex !important;
            align-items: center !important;
            gap: 2px !important;
            padding: 4px !important;
            background: rgba(255,255,255,.05) !important;
            border: 1px solid rgba(255,255,255,.12) !important;
            border-radius: 999px !important;
        }
        .section_header .sort_area .sort_by_area + .sort_by_area::before { display: none !important; }
        /* The switch takes all of the header row the count leaves free, in
           three equal segments, like the full-width sort bar on the CANVAS
           lists. */
        .section_header:has(> .series_count) > .sort_area:has(.sort_by) {
            flex: 1 0 100% !important;
            order: 2 !important;
            margin-left: 0 !important;
            box-sizing: border-box !important;
        }
        /* The count is a quiet note under the switch, at its right end
           (the user found even a caption above it too loud): no bar, small
           muted text, the figure a touch brighter. */
        .section_header:has(> .series_count) { row-gap: 10px !important; }
        .section_header:has(> .series_count) .series_count {
            order: 3 !important;
            margin-left: auto !important;
            column-gap: 4px !important;
            color: var(--wt-text-mute) !important;
            font-size: 13px !important;
        }
        .section_header:has(> .series_count) .series_count span { color: var(--wt-text-mute) !important; }
        .section_header:has(> .series_count) .series_count .number {
            color: var(--wt-text-dim) !important;
            font-size: 13px !important;
            font-weight: 700 !important;
        }
        .section_header:has(> .series_count) .series_count::before { display: none !important; }
        .section_header:has(> .series_count) > .sort_area:has(.sort_by) .sort_by_area {
            display: flex !important;
            flex: 1 1 0 !important;
            min-width: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
        }
        .section_header:has(> .series_count) > .sort_area .sort_by {
            flex: 1 1 auto !important;
            width: 100% !important;
            min-width: 0 !important;
            height: 44px !important;
        }
        /* Options are wide equal segments (the header row has room), so the
           switch reads as a real control rather than three small links. */
        .section_header .sort_area .sort_by {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            box-sizing: border-box !important;
            padding: 0 22px !important;
            border-radius: 999px !important;
            color: var(--wt-text-body) !important;
            font-size: 15px !important;
            font-weight: 600 !important;
            line-height: 1 !important;
            text-decoration: none !important;
            transition: background-color .15s ease, color .15s ease !important;
        }
        .section_header .sort_area .sort_by:hover,
        .section_header .sort_area .sort_by:focus-visible {
            background: rgba(255,255,255,.09) !important;
            color: #fff !important;
        }
        /* Current option: green-tinted chip with bright green text and a
           green ring (the pager's "you are here"). A solid green fill with
           black text looked harsh next to the idle options. */
        .section_header .sort_area .sort_by[aria-current="true"],
        .section_header .sort_area .sort_by[aria-current="true"]:hover {
            background: rgba(0,213,100,.16) !important;
            color: var(--wt-accent-soft) !important;
            font-weight: 700 !important;
            box-shadow: inset 0 0 0 1px rgba(0,213,100,.5), 0 0 14px rgba(0,213,100,.15) !important;
        }

        /* Sort / filter dropdowns: trigger .sort_area .checked, panel
           .sort_box. They serve the Top CANVAS genre filter and the
           logged-in history page's sort (the /canvas list sort is a
           segmented switch, see the /canvas list block). Base ships a white
           panel with a sprite checkmark — both invisible on dark. The
           trigger is a soft pill with a caret and a distinct open state
           ([aria-expanded="true"]); the panel an elevated card with hover
           rows. */
        .sort_area .checked {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            text-align: center !important;
            position: relative !important;
            background: var(--wt-bg-elev2) !important;
            color: var(--wt-text) !important;
            border: 1px solid rgba(255,255,255,.22) !important;
            border-radius: 999px !important;
            padding: 8px 32px 8px 30px !important;
            font-size: 13px !important;
            font-weight: 600 !important;
            line-height: 16px !important;
            white-space: nowrap !important;
            cursor: pointer !important;
            box-shadow: 0 1px 0 rgba(255,255,255,.04) !important;
            transition: background-color .15s ease, border-color .15s ease, color .15s ease, box-shadow .15s ease !important;
        }
        /* Sort-icon glyph (⇅) prefix — communicates the button's purpose. */
        .sort_area .checked::before {
            content: '\\21F5' !important;
            position: absolute !important;
            left: 12px !important;
            top: 50% !important;
            transform: translateY(-50%) !important;
            font-size: 13px !important;
            color: var(--wt-text-dim) !important;
            line-height: 1 !important;
            transition: color .15s ease !important;
        }
        .sort_area .checked:hover {
            background: var(--wt-bg-hover) !important;
            border-color: var(--wt-accent) !important;
            color: var(--wt-accent) !important;
            box-shadow: 0 0 0 3px rgba(0,213,100,.12) !important;
        }
        .sort_area .checked:hover::before { color: var(--wt-accent) !important; }
        /* Open state — solid accent border ring + brighter bg so it reads
           clearly as "active/pressed". Mirrors common dropdown patterns. */
        .sort_area .checked[aria-expanded="true"] {
            background: var(--wt-bg-hover) !important;
            border-color: var(--wt-accent) !important;
            color: var(--wt-accent) !important;
            box-shadow: 0 0 0 3px rgba(0,213,100,.18) !important;
        }
        .sort_area .checked[aria-expanded="true"]::before { color: var(--wt-accent) !important; }
        /* The /canvas list sort (.sort_area._sorting) is taken out of the
           flow and set above the grid card (top / right are in the /canvas
           list block), positioned against the card. */
        .challenge_cont_area { position: relative !important; }
        .sort_area._sorting {
            position: absolute !important;
            margin: 0 !important;
            display: inline-block !important;
            float: none !important;
            z-index: 50 !important;
        }
        /* Inner Top-CANVAS filter (.sort_area._filterArea) — shares the
           .title_area row with the "Top CANVAS" h2. Keep it compact so long
           labels (HEARTWARMING, SUPERNATURAL) don't push the row. The
           z-index lifts the pill's stacking context above sibling card rows
           so the panel it spawns isn't trapped beneath them. */
        .sort_area._filterArea {
            position: relative !important;
            top: auto !important;
            right: auto !important;
            margin-left: auto !important;
            flex-shrink: 0 !important;
            z-index: 10000 !important;
        }
        .sort_area._filterArea .checked {
            padding: 5px 14px !important;
            font-size: 11px !important;
            letter-spacing: .04em !important;
            min-width: 90px !important;
            max-width: 140px !important;
            text-overflow: ellipsis !important;
            overflow: hidden !important;
        }
        /* Compact filter pill: no leading ⇅ icon, no trailing caret — the
           label alone is sufficient in this context, and removing both
           glyphs frees space for long category names. */
        .sort_area._filterArea .checked::before { content: none !important; display: none !important; }
        .sort_area._filterArea .checked .ico_chk,
        .sort_area._filterArea .checked .ico_chk::after { display: none !important; content: none !important; }
        .sort_area._filterArea .sort_box._filterLayer {
            right: 0 !important;
            top: calc(100% + 4px) !important;
            min-width: 160px !important;
            max-height: 280px !important;
            overflow-y: auto !important;
            /* High z-index so the panel paints above the ranking-number
               sprites (.ico_nN) AND the body::before vignette gradient
               (z-index 9999). 10001 clears both unconditionally. */
            z-index: 10001 !important;
            background: var(--wt-bg-elev) !important;
            background-color: var(--wt-bg-elev) !important;
            isolation: isolate !important;
        }
        /* Make the .title_area inside the Top CANVAS card a flex row so the
           h2 and the filter pill align horizontally without one pushing
           the other. */
        .aside.challenge .lst_area .title_area,
        .ranking_lst.viewer > .lst_area > .title_area {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            gap: 8px !important;
        }
        .aside.challenge .lst_area .title_area h2,
        .ranking_lst.viewer > .lst_area > .title_area h2 {
            flex: 1 1 auto !important;
            min-width: 0 !important;
        }
        /* Replace the sprite check-mark icon next to the trigger with a
           caret-down so users see it's a dropdown. */
        .sort_area .checked .ico_chk {
            background: none !important;
            background-image: none !important;
            width: auto !important;
            height: auto !important;
            position: absolute !important;
            top: 50% !important;
            right: 10px !important;
            transform: translateY(-50%) !important;
            line-height: 1 !important;
            pointer-events: none !important;
        }
        .sort_area .checked .ico_chk::after {
            content: '\\25BE' !important;
            color: var(--wt-text-dim) !important;
            font-size: 11px !important;
            display: block !important;
            transition: transform .15s ease, color .15s ease !important;
        }
        /* Caret rotates 180° when the panel is open — visual confirmation
           that the menu is expanded. */
        .sort_area .checked[aria-expanded="true"] .ico_chk::after {
            transform: rotate(180deg) !important;
            color: var(--wt-accent) !important;
        }
        .sort_area .checked:hover .ico_chk::after { color: var(--wt-accent) !important; }
        /* Dropdown panel — elevated card with smooth open animation and
           ≥40 px hit targets on each option for accessibility. */
        .sort_box {
            background: var(--wt-bg-elev) !important;
            border: 1px solid var(--wt-border-strong) !important;
            border-radius: 10px !important;
            padding: 6px !important;
            box-shadow:
                0 12px 32px rgba(0,0,0,.6),
                0 4px 8px rgba(0,0,0,.4) !important;
            overflow: hidden !important;
            transform-origin: top right !important;
            animation: wt-sortbox-in .14s ease-out !important;
        }
        @keyframes wt-sortbox-in {
            from { opacity: 0; transform: translateY(-4px) scale(.98); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .sort_box li {
            height: auto !important;
            padding: 0 !important;
            text-align: left !important;
            background: transparent !important;
            border-bottom: 0 !important;
        }
        .sort_box a {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            color: var(--wt-text-dim) !important;
            padding: 10px 14px !important;
            border-radius: 6px !important;
            font-size: 13px !important;
            font-weight: 500 !important;
            line-height: 1.2 !important;
            min-height: 22px !important;
            height: auto !important;
            transition: background-color .12s ease, color .12s ease, padding .12s ease !important;
        }
        .sort_box a:hover {
            background: var(--wt-bg-elev2) !important;
            color: var(--wt-text) !important;
            padding-left: 18px !important;
        }
        .sort_box .ico_chk {
            background: none !important;
            background-image: none !important;
            width: auto !important;
            height: auto !important;
            position: static !important;
            margin-left: 8px !important;
        }
        /* Active option — accent text + soft-tinted background tile so it
           reads at a glance, not just by colour difference. */
        .sort_box [aria-current="true"],
        .sort_box li a[aria-current="true"] {
            color: var(--wt-accent) !important;
            background: rgba(0,213,100,.12) !important;
            font-weight: 700 !important;
        }
        .sort_box li a[aria-current="true"]:hover {
            background: rgba(0,213,100,.18) !important;
            padding-left: 14px !important;
        }
        .sort_box [aria-current="true"] .ico_chk::after,
        .sort_box li a[aria-current="true"] .ico_chk::after {
            content: '\\2713' !important;
            color: var(--wt-accent) !important;
            font-size: 13px !important;
            font-weight: 700 !important;
        }

        /* Genre labels (.genre.g_romance, .g_fantasy, …) — Webtoons' light
           theme tints these per category. Reproduce on dark, lightened so
           every hue is at least 4.5:1 on the --wt-bg-elev cards (the labels
           are 11-12px). The a.g_* variants keep a genre pill's hue on hover
           (the global a:hover would turn it link-blue). */
        .genre.g_romance, .g_romance, a.g_romance { color: #fd5591 !important; }
        .genre.g_romance_m, .g_romance_m, a.g_romance_m { color: #fd5591 !important; }
        .genre.g_comedy, .g_comedy, a.g_comedy { color: #ffc233 !important; }
        .genre.g_fantasy, .g_fantasy, a.g_fantasy { color: #b56af2 !important; }
        .genre.g_romantic_fantasy, .g_romantic_fantasy, a.g_romantic_fantasy { color: #e155f4 !important; }
        .genre.g_action, .g_action, a.g_action { color: #4a91ff !important; }
        .genre.g_drama, .g_drama, a.g_drama { color: #2dd4be !important; }
        .genre.g_slice_of_life, .g_slice_of_life, a.g_slice_of_life { color: #b8d62e !important; }
        .genre.g_supernatural, .g_supernatural, a.g_supernatural { color: #a983f5 !important; }
        .genre.g_horror, .g_horror, a.g_horror { color: #f06262 !important; }
        .genre.g_thriller, .g_thriller, a.g_thriller { color: #ec5f8d !important; }
        .genre.g_sports, .g_sports, a.g_sports { color: #4ec4f5 !important; }
        .genre.g_sf, .g_sf, a.g_sf { color: #8da8ce !important; }
        .genre.g_historical, .g_historical, a.g_historical { color: #c0926a !important; }
        .genre.g_heartwarming, .g_heartwarming, a.g_heartwarming { color: #ff8a3d !important; }
        .genre.g_super_hero, .g_super_hero, a.g_super_hero { color: #9c86ff !important; }
        .genre.g_tiptoon, .g_tiptoon, a.g_tiptoon { color: #ff8fd9 !important; }
        .genre.g_short_story, .g_short_story, a.g_short_story { color: #7fb2ff !important; }
        .genre.g_web_novel, .g_web_novel, a.g_web_novel { color: #5fb6e0 !important; }
        .genre.g_mystery, .g_mystery, a.g_mystery { color: #a5a8c8 !important; }
        .genre.g_bl_gl, .g_bl_gl, a.g_bl_gl { color: #ee82ff !important; }
        .genre.g_western_palace, .g_western_palace, a.g_western_palace { color: #e155f4 !important; }
        .genre.g_eastern_palace, .g_eastern_palace, a.g_eastern_palace { color: #c0926a !important; }
        .genre.g_time_slip, .g_time_slip, a.g_time_slip { color: #9085ff !important; }
        .genre.g_city_office, .g_city_office, a.g_city_office { color: #8a85e0 !important; }
        .genre.g_adaptation, .g_adaptation, a.g_adaptation { color: #2ee672 !important; }
        .genre.g_school, .g_school, a.g_school { color: #f0a064 !important; }
        .genre.g_local, .g_local, a.g_local { color: #25ef92 !important; }
        .genre.g_shonen, .g_shonen, a.g_shonen { color: #6a98e0 !important; }
        .genre.g_martial_arts, .g_martial_arts, a.g_martial_arts { color: #c08555 !important; }
        .genre.g_graphic_novel, .g_graphic_novel, a.g_graphic_novel { color: #7a83e8 !important; }
        .genre.g_others, .g_others, a.g_others { color: #9ea3ab !important; }
        .genre.g_informative { color: #7fc6a0 !important; }
        .genre.g_lgbtq { color: #ff7ed0 !important; }

        /* Notice strip above the footer (filled in by the site's JS). Base: a
           51px full-width white band. Now a centred pill on the page
           background — an amber "Notice" chip, the headline, the date on the
           right — and the whole pill answers hover (amber outline, amber
           headline) so it reads as the link it is. */
        .notice_area, #noticeArea {
            height: auto !important;
            line-height: normal !important;
            padding: 20px 0 !important;
            background: transparent !important;
            color: var(--wt-text-dim) !important;
            border: 0 !important;
        }
        .notice_area .notice_detail {
            box-sizing: border-box !important;
            align-items: center !important;
            column-gap: 14px !important;
            width: auto !important;
            max-width: 1200px !important;
            padding: 8px 20px 8px 8px !important;
            border-radius: 999px !important;
            background: var(--wt-bg-elev) !important;
            border: 1px solid rgba(255,255,255,.08) !important;
            transition: border-color .18s ease, box-shadow .18s ease !important;
        }
        .notice_area .notice_detail:hover {
            border-color: rgba(255,194,51,.4) !important;
            box-shadow: 0 0 0 4px rgba(255,194,51,.08) !important;
        }
        /* The chip is the series NOTE banner's amber with its megaphone:
           an announcement reads as "heads up", and green is kept for
           actions. No amber edge here: the bar stays calm. The chip is an
           <a> inside #footer, so its selectors need the id: #footer a
           (1,0,1) pinned it grey. */
        #noticeArea .notice_detail .notice_tit {
            display: inline-flex !important;
            align-items: center !important;
            gap: 6px !important;
            padding: 5px 12px 5px 10px !important;
            border-radius: 999px !important;
            background: rgba(255,194,51,.13) !important;
            color: #ffc233 !important;
            font-size: 12px !important;
            font-weight: 700 !important;
            line-height: 16px !important;
            letter-spacing: .06em !important;
            text-transform: uppercase !important;
        }
        .notice_area .notice_detail .notice_tit::after { display: none !important; }
        .notice_area .notice_detail .notice_tit::before {
            content: '' !important;
            flex: none !important;
            width: 14px !important;
            height: 14px !important;
            background: currentColor !important;
            -webkit-mask: var(--wt-ico-megaphone) center / contain no-repeat !important;
            mask: var(--wt-ico-megaphone) center / contain no-repeat !important;
        }
        #noticeArea .notice_detail .notice_tit:hover { background: rgba(255,194,51,.22) !important; color: #ffd666 !important; }
        .notice_area .notice_detail .notice_cont .subj {
            color: var(--wt-text) !important;
            font-size: 14px !important;
            font-weight: 500 !important;
            transition: color .15s ease !important;
        }
        .notice_area .notice_detail .notice_cont:hover .subj { color: #ffd666 !important; }
        .notice_area .notice_detail .date { color: var(--wt-text-mute) !important; font-size: 13px !important; font-style: normal !important; }

        /* "Download WEBTOON now!" app-download strip in the footer */
        .foot_app, .foot_cont, .foot_down_msg, .footapp_icon_cont {
            background-color: var(--wt-bg-elev) !important;
            color: var(--wt-text) !important;
            border-color: var(--wt-border) !important;
        }
        .foot_app .txt, .foot_down_msg .txt, .foot_app p { color: var(--wt-text) !important; }
        /* QR code stays on a white tile so it remains scannable */
        .ico_qrcode {
            background-color: #fff !important;
            padding: 4px;
            border-radius: 4px;
        }

        /* Buttons */
        button, .btn, .btn_area button, input[type="button"], input[type="submit"] {
            background-color: var(--wt-bg-elev2) !important;
            color: var(--wt-text) !important;
            border: 1px solid var(--wt-border) !important;
        }
        button:hover, .btn:hover { background-color: var(--wt-bg-hover) !important; }
        .btn_subscribe {
            background: var(--wt-key) !important;
            color: #fff !important;
            border-color: var(--wt-key-edge) !important;
        }

        /* Carousel prev/next buttons — base CSS sets background:#fff so the dark
           SVG arrow sprite is readable. Our generic button rule overrides to
           --wt-bg-elev2, making the dark arrow invisible. Restore a visible
           surface and invert the :before arrow glyph to white. */
        .carousel_wrap .carousel_paging .next,
        .carousel_wrap .carousel_paging .prev {
            background: rgba(15,17,20,.88) !important;
            border: 1px solid rgba(255,255,255,.3) !important;
            box-shadow: 0 2px 10px rgba(0,0,0,.7) !important;
        }
        .carousel_wrap .carousel_paging .next:hover,
        .carousel_wrap .carousel_paging .prev:hover {
            background: rgba(40,45,52,.95) !important;
            border-color: rgba(255,255,255,.5) !important;
        }
        .carousel_wrap .carousel_paging .next:before,
        .carousel_wrap .carousel_paging .prev:before {
            filter: brightness(0) invert(1) opacity(.9) !important;
        }
        /* Inputs */
        input, textarea, select {
            background-color: var(--wt-bg-input) !important;
            color: var(--wt-text) !important;
            border: 1px solid var(--wt-border) !important;
            caret-color: var(--wt-text) !important;
        }
        input::placeholder, textarea::placeholder { color: var(--wt-text-mute) !important; }
        /* Native <select> dropdown items: the options are painted on a
           system listbox that ignores the select's own colours. */
        select option {
            background-color: var(--wt-bg-elev) !important;
            color: var(--wt-text) !important;
        }
        /* Age-verification screen (.age_gate_container > .age_gate_area).
           The month picker is an <a class="lk_month _selectedMonth"> trigger
           opening ul.list_month (trigger and rows are styled below, with the
           Continue key); day / year are plain inputs. One frame each: the
           old ".month *" rule framed the wrapper, the trigger and every
           month row. */
        .age_gate_container,
        .age_gate_area, .age_gate_area .form_area {
            background: transparent !important;
            color: var(--wt-text) !important;
        }
        .age_gate_area input {
            background-color: var(--wt-bg-input) !important;
            color: var(--wt-text) !important;
            border: 1px solid var(--wt-border) !important;
            border-radius: 6px !important;
        }
        .age_gate_area .list_month {
            background-color: var(--wt-bg-elev) !important;
            border: 1px solid var(--wt-border) !important;
            border-radius: 6px !important;
        }
        /* Continue button: <a class="btn_type9 v2 _btn_enter"> inside
           <div class="btnarea">. The green key. */
        .age_gate_area .btn_type9,
        .age_gate_area ._btn_enter,
        .age_gate_area .btnarea a {
            background: var(--wt-key) !important;
            color: #fff !important;
            -webkit-text-fill-color: #fff !important;
            font-weight: 700 !important;
            text-decoration: none !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            text-align: center !important;
            line-height: 1 !important;
            padding: 14px 36px !important;
            min-width: 160px !important;
            border-radius: 999px !important;
            border: none !important;
            box-sizing: border-box !important;
            transition: background-color .15s ease, color .15s ease, box-shadow .15s ease, transform .1s ease !important;
        }
        .age_gate_area .btn_type9:hover,
        .age_gate_area ._btn_enter:hover,
        .age_gate_area .btnarea a:hover {
            background: var(--wt-key-hover) !important;
            color: #fff !important;
            -webkit-text-fill-color: #fff !important;
            box-shadow: 0 4px 12px rgba(0,213,100,.35) !important;
        }
        .age_gate_area .btn_type9:active,
        .age_gate_area ._btn_enter:active { transform: translateY(1px) !important; }

        /* "I'll stick with limited access": <a class="lk_continue _skipAgeGate">.
           Plain white underlined text on transparent. */
        .age_gate_area .lk_continue,
        .age_gate_area ._skipAgeGate {
            background: transparent !important;
            color: var(--wt-text) !important;
            -webkit-text-fill-color: var(--wt-text) !important;
            text-decoration: underline !important;
            padding: 0 !important;
            border: none !important;
            font-weight: normal !important;
        }
        .age_gate_area .lk_continue:hover,
        .age_gate_area ._skipAgeGate:hover { opacity: .8 !important; }

        /* Month dropdown trigger + list items — keep them dark, NOT green. */
        .age_gate_area .lk_month,
        .age_gate_area ._selectedMonth {
            background-color: var(--wt-bg-input) !important;
            color: var(--wt-text) !important;
            -webkit-text-fill-color: var(--wt-text) !important;
            border: 1px solid var(--wt-border) !important;
            border-radius: 6px !important;
            text-decoration: none !important;
            font-weight: normal !important;
        }
        .age_gate_area ._month .link {
            background-color: var(--wt-bg-elev) !important;
            color: var(--wt-text) !important;
            -webkit-text-fill-color: var(--wt-text) !important;
            text-decoration: none !important;
            font-weight: normal !important;
        }
        .age_gate_area ._month .link:hover {
            background-color: var(--wt-bg-hover) !important;
            color: var(--wt-text) !important;
        }

        /* Privacy Policy inline link inside .dsc_terms — soft accent link. */
        .age_gate_area .dsc_terms a {
            color: var(--wt-link) !important;
            -webkit-text-fill-color: var(--wt-link) !important;
            text-decoration: underline !important;
        }

        /* Edge shading (vignette) on the reader, series and listing pages: a
           fixed overlay that darkens only the empty side margins outside the
           1200px content column, from black at the window edge to clear at
           the content's edge. The stops come from the margin width, so the
           shading never reaches content (a fixed 14% band darkened the comic
           below ~1280px and page content below ~1670px), and a window with
           no margin gets none.
           --wt-vig is one margin: 50% - 600px in a window wider than the
           page. The page is at least 1400px wide (the header), so a
           narrower window scrolls sideways with the content at 100-1300px
           of the page; 100% - 1300px keeps the shading off it at either
           scroll end. Percentages, not vw: the overlay is the viewport
           minus the scrollbar, and 50vw would put the stop a half
           scrollbar into the content.
           The page-type classes on <body> are the only gate: a CSS :has()
           fallback matched non-reader pages while Webtoons briefly gives
           #content the class "viewer". pointer-events: none lets clicks
           through; toggleVignette() sets html[data-wt-vignette="off"]. */
        html:not([data-wt-vignette="off"]) body.wt-viewer::before,
        html:not([data-wt-vignette="off"]) body.wt-detail::before,
        html:not([data-wt-vignette="off"]) body.wt-home::before {
            content: '' !important;
            position: fixed !important;
            inset: 0 !important;
            --wt-vig: max(0px, min(50% - 600px, 100% - 1300px));
            background: linear-gradient(to right,
                #000 0, transparent var(--wt-vig),
                transparent calc(100% - var(--wt-vig)), #000 100%) !important;
            pointer-events: none !important;
            z-index: 9999 !important;
        }
        body.wt-viewer #container,
        body.wt-viewer #content,
        body.wt-viewer .cont_box,
        body.wt-viewer .comment_area {
            background-color: transparent !important;
        }

        /* The comic strip as one lifted card: the panels sit flush in one
           container (#_imageList, which is also .viewer_img._img_viewer_area)
           with 16px rounded corners, overflow: hidden to round the outer
           corners of the first and last panels, and ONE soft drop shadow.
           The theme never filters or recolours the panels themselves (only
           the optional reader dim does).
           - width: fit-content shrinks the container to the image width
             (parent wrappers are full width); margin: 0 auto re-centres it.
           - font-size / line-height 0 remove the baseline gap that the text
             nodes between sibling <img>s left between panels. */
        img._images {
            border-radius: 0 !important;
            display: block !important;
            vertical-align: top !important;
            box-shadow: none !important;
        }
        .viewer_img._img_viewer_area, #_imageList {
            width: fit-content !important;
            margin: 0 auto !important;
            font-size: 0 !important;
            line-height: 0 !important;
            border-radius: 16px !important;
            overflow: hidden !important;
            /* One shadow on the container, never per image: per-image
               shadows left a seam at every panel boundary. One soft drop
               shadow: a 60px + 40px halo running the strip's full height
               was ~90% of the theme's scroll raster cost on the reader.
               (Inset hairlines paint under the panels and never showed.) */
            box-shadow: 0 16px 40px rgba(0,0,0,.7) !important;
        }
        /* The base CSS clips .cont_box .viewer_lst (overflow: hidden), which
           cut the strip's shadow off. */
        .viewer_lst { overflow: visible !important; }

        /* Top fixed toolbar (.tool_area is natively #2f2f2f — bring it in line).
           Base z-index is 100, under the vignette (9999), which dimmed the
           logo and the share icons at both ends of the bar. Raising it alone
           does nothing: its ancestor #container (position:relative;
           z-index:10) is a stacking context that caps every descendant below
           body::before. z-index:auto on #container dissolves that context in
           the reader so the bar can paint above the vignette. */
        body.wt-viewer #container { z-index: auto !important; }
        .tool_area {
            z-index: 10000 !important;
            background: var(--wt-bg-elev) !important;
            color: var(--wt-text) !important;
            border-bottom: 1px solid var(--wt-border) !important;
        }
        .tool_area .subj_info .subj, .tool_area .subj_episode { color: var(--wt-text) !important; }
        /* Right side (Subscribe, Facebook, X, copy link, translate): 32px
           sprite discs drawn for the old grey bar, so on dark they were
           dim rings with tiny glyphs, crowded at the bar's right edge and
           sitting above its centre line. Now 36px glass discs with the
           theme's monochrome icons, centred on the 50px bar, 8px apart,
           16px in from the edge. Share icons fill with their brand colour
           on hover; Subscribe is a plus that turns green, and a green
           tick once subscribed (.on). */
        .tool_area .right_area {
            display: flex !important;
            align-items: center !important;
            height: 50px !important;
            padding-right: 16px !important;
        }
        .tool_area .right_area .spi_area {
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
            float: none !important;
            margin: 0 !important;
        }
        .tool_area .spi_area > li {
            float: none !important;
            width: 36px !important;
            height: 36px !important;
            margin: 0 !important;
        }
        .tool_area .spi_area > li > a[class^="ico_"] {
            position: relative !important;
            display: block !important;
            box-sizing: border-box !important;
            width: 36px !important;
            height: 36px !important;
            border-radius: 50% !important;
            background: rgba(255,255,255,.06) !important;
            border: 1px solid rgba(255,255,255,.14) !important;
            color: var(--wt-text-dim) !important;
            font-size: 0 !important;
            text-indent: 0 !important;
            overflow: hidden !important;
            filter: none !important;
            transition: background-color .15s ease, border-color .15s ease, color .15s ease, transform .15s ease !important;
        }
        .tool_area .spi_area > li > a[class^="ico_"]::before {
            content: '' !important;
            position: absolute !important;
            inset: 0 !important;
            margin: auto !important;
            width: 16px !important;
            height: 16px !important;
            background: currentColor !important;
            -webkit-mask: var(--wt-share) center / contain no-repeat !important;
            mask: var(--wt-share) center / contain no-repeat !important;
        }
        .tool_area .spi_area > li > a[class^="ico_"]:hover,
        .tool_area .spi_area > li > a[class^="ico_"]:focus-visible {
            background: var(--wt-brand) !important;
            border-color: transparent !important;
            color: #fff !important;
            transform: translateY(-1px) !important;
        }
        .tool_area .spi_area > li > a.ico_twitter:hover,
        .tool_area .spi_area > li > a.ico_twitter:focus-visible { border-color: rgba(255,255,255,.3) !important; }
        .tool_area .spi_area a.ico_favorites { --wt-share: var(--wt-ico-plus); --wt-brand: var(--wt-key); }
        .tool_area .spi_area a.ico_translate { --wt-share: var(--wt-ico-translate); --wt-brand: rgba(255,255,255,.16); }
        .tool_area .spi_area > li > a.ico_favorites.on {
            --wt-share: var(--wt-ico-check);
            background: rgba(0,213,100,.16) !important;
            border-color: rgba(0,213,100,.5) !important;
            color: var(--wt-accent-soft) !important;
        }
        .tool_area .spi_area > li > a.ico_favorites.on:hover { background: rgba(0,213,100,.26) !important; border-color: var(--wt-accent) !important; color: #fff !important; }
        /* The popups under the buttons hung 54px down, 4px below the bar. */
        .tool_area .spi_area li .ly_area { top: 46px !important; }
        /* Translate language list: a #171717 box. The theme's menu panel. */
        .tool_area .spi_area .ly_translate_lang {
            top: 44px !important;
            padding: 6px !important;
            background: #2a2f36 !important;
            border: 1px solid rgba(255,255,255,.1) !important;
            border-radius: 12px !important;
            box-shadow: 0 16px 40px rgba(0,0,0,.55), 0 2px 8px rgba(0,0,0,.35) !important;
        }
        .tool_area .spi_area .ly_translate_lang .translate_lang_lst a {
            min-height: 36px !important;
            padding: 0 10px !important;
            border-radius: 8px !important;
            font-size: 14px !important;
        }
        .tool_area .spi_area .ly_translate_lang .translate_lang_lst a:hover { background: rgba(255,255,255,.08) !important; }
        /* "Self-published on CANVAS. This series is rated Mature (18+)."
           under the bar: a #222 band. A heads-up, so the amber of the
           series page's age note, with its info icon. */
        .tool_area .age_text {
            column-gap: 8px !important;
            background:
                linear-gradient(90deg, rgba(255,194,51,0), rgba(255,194,51,.09) 50%, rgba(255,194,51,0)),
                #1b1e22 !important;
            border-bottom: 1px solid rgba(255,194,51,.22) !important;
            color: #fff1d0 !important;
            font-size: 14px !important;
            font-weight: 500 !important;
        }
        .tool_area .age_text::before {
            content: '' !important;
            flex: none !important;
            width: 15px !important;
            height: 15px !important;
            background: #ffc233 !important;
            -webkit-mask: var(--wt-ico-info) center / contain no-repeat !important;
            mask: var(--wt-ico-info) center / contain no-repeat !important;
        }
        .tool_area .age_text [class*="ico_mature"] { display: none !important; }

        /* Episode strip in the toolbar's episode-list dropdown
           (#topEpisodeList). These rules are unscoped, but the strip under
           the comic (#bottomEpisodeList, "Episode strip" below) restyles
           everything they set, so they only show in the dropdown: the page
           background, a green ring and glow on the current episode, and
           large chevron arrows. */
        .episode_area {
            background: var(--wt-bg) !important;
            border-color: var(--wt-border) !important;
        }
        /* Current episode: the base gives only a 3px green border. */
        .episode_lst li .on .thmb {
            border: 3px solid var(--wt-accent) !important;
            box-shadow: 0 0 0 1px rgba(0, 213, 100, .25), 0 0 14px rgba(0, 213, 100, .55) !important;
        }
        .episode_lst li .on .subj {
            color: var(--wt-accent) !important;
            font-weight: 700 !important;
        }
        /* Dropdown strip arrows: the base sprite is dark glyphs on white,
           lost on the dark surface. Heavy chevrons at thumbnail height,
           centred on the 87px thumbnail row. */
        .episode_area .episode_lst .pg_prev, .episode_area .episode_lst .pg_next {
            background: rgba(15,17,20,.6) !important;
            background-image: none !important;
            border: 1px solid var(--wt-border) !important;
            border-radius: 6px !important;
            width: 40px !important;
            height: 87px !important;
            top: 12px !important;
            transform: none !important;
            font-size: 0 !important;
            color: transparent !important;
            box-shadow: 0 2px 10px rgba(0,0,0,.6) !important;
            transition: background-color .15s, border-color .15s, box-shadow .15s !important;
        }
        .episode_area .episode_lst .pg_prev:hover, .episode_area .episode_lst .pg_next:hover {
            background: rgba(0,213,100,.18) !important;
            border-color: rgba(0,213,100,.6) !important;
            box-shadow: 0 0 16px rgba(0,213,100,.35) !important;
        }
        /* Hide the inner <em> label so it doesn't show alongside the chevron. */
        .episode_area .episode_lst .pg_prev > em, .episode_area .episode_lst .pg_next > em {
            display: none !important;
        }
        /* Heavy chevron drawn via pseudo-element, absolutely positioned + flex
           centered so the glyph sits dead-center in the button. */
        .episode_area .episode_lst .pg_prev::before, .episode_area .episode_lst .pg_next::after {
            text-indent: 0 !important;
            background: none !important;
            width: auto !important;
            height: auto !important;
            margin: 0 !important;
            position: absolute !important;
            inset: 0 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            color: var(--wt-text) !important;
            font-size: 36px !important;
            line-height: 1 !important;
            font-weight: normal !important;
            pointer-events: none !important;
        }
        .episode_area .episode_lst .pg_prev::before { content: '\\276E' !important; }
        .episode_area .episode_lst .pg_next::after  { content: '\\276F' !important; }
        .episode_area .episode_lst .pg_prev:hover::before,
        .episode_area .episode_lst .pg_next:hover::after {
            color: var(--wt-accent) !important;
        }

        /* Horizontal rules — base CSS leaves them with default browser styling. */
        hr { border-color: var(--wt-border) !important; background: var(--wt-border) !important; }

        /* Viewer sub-sections below the comic panels — explicitly dark so they
           don't reveal the cont_box background when set to transparent. */
        .viewer_info_area, .viewer_ad_area, .viewer_patron_area {
            background: var(--wt-bg) !important;
            color: var(--wt-text) !important;
        }
        /* === Viewer page elevation ===
           .ranking_lst.viewer > .lst_area cards (reader sidebar, /canvas
           rail) are styled in "Ranking sidebar cards" below — do NOT wrap
           them in extra elements or add a second card layer here (that
           produced a card-inside-a-card). The reader lays its two cards out
           side by side further down (#_bottomDisplay > .aside.viewer, a
           grid with its own gap); the space between the /canvas rail's
           cards is set in the /canvas list block. */
        .aside .ranking_lst.viewer {
            background: transparent !important;
            display: flex !important;
            flex-direction: column !important;
            padding: 0 !important;
        }
        /* Viewer info / ad / patron section top separators — hidden entirely
           so the column under the panels reads as one continuous dark surface
           (no faint horizontal lines below the comic). */
        .viewer_lst .viewer_info_area,
        .viewer_lst .viewer_ad_area,
        .viewer_patron_area {
            border-top: none !important;
            border-bottom: none !important;
        }

        /* Like icon (ico_like2): the episode list's flame (--wt-flame-mask),
           instead of the site's thin outline sprite. */
        .spi_area .ico_like2 {
            background: #ff6a24 !important;
            -webkit-mask: var(--wt-flame-mask) center / contain no-repeat !important;
            mask: var(--wt-flame-mask) center / contain no-repeat !important;
            filter: none !important;
            font-size: 0 !important;
            color: transparent !important;
        }

        /* Webtoons replaced the legacy Naver u_cbox widget with "WCC"
           (Webtoon Comment Component). Its class names are unhashed
           (wcc_<Component>__<element>), so rules use the plain classes:
           [class*="…"] substring selectors can't be bucketed or Bloom-
           filtered, and every class change then invalidates whole subtrees.
           Only prefixes and the community app's hashed CSS-module names
           (HomeProfile_root__hhg8Z) need [class*=]. */

        /* WCC design tokens. The widget styles itself from --wcc-* custom
           properties and ships a full dark set under .wcc_theme_dark, but
           Webtoons only applies that class when the page is in its own dark
           mode. Re-declare the dark set (greys remapped to our palette) at
           html:root — one notch more specific than WCC's light :root block —
           so every icon fill, divider, loader and popover the per-element
           rules below don't name still comes out dark. */
        html:root {
            --wte-bg-primary: var(--wt-bg-elev); --wte-bg-primary-container-1: var(--wt-bg-elev2);
            --wte-bg-secondary: var(--wt-bg-elev); --wte-placeholder-bg: rgba(255,255,255,.08);
            --wte-fg-secondary: var(--wt-text-dim); --wte-fg-disabled-primary: var(--wt-text-mute);
            --wte-fg-disabled-secondary: #5a6472; --wte-line-alpha-8: rgba(255,255,255,.08);
            --wte-line-alpha-10: rgba(255,255,255,.1); --wte-line-divider: var(--wt-border);
            --wte-text-primary: var(--wt-text); --wte-text-disabled: var(--wt-text-mute);
            --wte-text-tertiary: var(--wt-text-mute); --wte-icon-primary: var(--wt-text);
            --wte-icon-tertiary: var(--wt-text-mute); --wte-icon-inverted-primary: var(--wt-bg);
            --wcc-primary-01: var(--wt-accent); --wcc-primary-02: #ff3f78; --wcc-secondary-01: #e24e2c; --wcc-secondary-02: #ff7f00;
            --wcc-secondary-03: #3b6cef; --wcc-secondary-04: #9867ff; --wcc-text-01: #fff; --wcc-text-02: #8c8c8c;
            --wcc-text-03: var(--wt-bg-elev); --wcc-text-04: var(--wt-bg); --wcc-text-05: #8c8c8c; --wcc-text-06: var(--wt-bg-elev2);
            --wcc-text-07: #bbb; --wcc-text-08: #8c8c8c; --wcc-text-09: #a6a6a6; --wcc-text-10: #8c8c8c;
            --wcc-text-11: #8c8c8c; --wcc-text-12: #f8f8f8; --wcc-text-13: #8c8c8c; --wcc-text-14: var(--wt-accent);
            --wcc-text-15: #e24e2c; --wcc-text-16: #e99536; --wcc-text-17: #3b6cef; --wcc-text-20: #c9c9c9;
            --wcc-text-21: var(--wt-bg-elev2); --wcc-text-22: var(--wt-bg-elev); --wcc-text-23: #a6a6a6; --wcc-text-24: #a6a6a6;
            --wcc-text-25: #fff; --wcc-text-26: #ff3b0e; --wcc-text-27: #111; --wcc-text-29: rgba(255, 255, 255, 0.4);
            --wcc-line-01: #fff; --wcc-line-02: var(--wt-bg-elev2); --wcc-line-03: #8c8c8c; --wcc-line-04: var(--wt-bg-elev2);
            --wcc-line-05: var(--wt-bg-elev); --wcc-line-06: var(--wt-bg-elev2); --wcc-line-07: #bbb; --wcc-line-08: #a6a6a6;
            --wcc-line-09: #a6a6a6; --wcc-line-10: var(--wt-accent); --wcc-line-11: rgba(255, 255, 255, 0.1); --wcc-line-12: rgba(255, 255, 255, 0.1);
            --wcc-line-14: var(--wt-bg-elev); --wcc-line-15: rgba(0, 0, 0, 0.1); --wcc-line-16: #e0e0e0; --wcc-line-17: #d8d8d8;
            --wcc-line-18: #3f4963; --wcc-line-20: var(--wt-border); --wcc-line-21: #a6a6a6; --wcc-line-23: #8c8c8c;
            --wcc-line-25: #3b6cef; --wcc-line-26: rgba(59, 108, 239, 0.3); --wcc-line-27: rgba(255, 255, 255, 0.2); --wcc-bg-01: var(--wt-bg-elev2);
            --wcc-bg-02: var(--wt-bg-elev); --wcc-bg-03: var(--wt-bg); --wcc-bg-04: var(--wt-bg-elev2); --wcc-bg-05: var(--wt-bg-elev);
            --wcc-bg-06: var(--wt-bg-elev2); --wcc-bg-07: var(--wt-bg-elev2); --wcc-bg-08: #f8f8f8; --wcc-bg-09: #a6a6a6;
            --wcc-bg-10: #8c8c8c; --wcc-bg-11: var(--wt-bg-elev2); --wcc-bg-13: var(--wt-accent); --wcc-bg-14: #8c8c8c;
            --wcc-bg-15: var(--wt-bg-elev); --wcc-bg-16: #daffeb; --wcc-bg-18: rgba(251, 251, 251, 0.88); --wcc-bg-19: rgba(52, 60, 81, 0.88);
            --wcc-bg-20: rgba(40, 38, 42, 0.88); --wcc-bg-21: #000; --wcc-bg-22: #8c8c8c; --wcc-bg-23: rgba(23, 23, 23, 0.9);
            --wcc-bg-24: rgba(28, 28, 28, 0.85); --wcc-bg-25: rgba(255, 255, 255, 0.1); --wcc-bg-26: rgba(0, 0, 0, 0.6); --wcc-bg-27: #31384e;
            --wcc-bg-28: #fff; --wcc-bg-29: #49526c; --wcc-bg-30: var(--wt-bg-hover); --wcc-bg-31: var(--wt-bg-elev);
            --wcc-bg-32: #000; --wcc-bg-33: var(--wt-bg-elev); --wcc-bg-34: var(--wt-bg-elev); --wcc-bg-35: var(--wt-bg-elev);
            --wcc-bg-36: rgba(36, 36, 36, 0.95); --wcc-bg-37: rgba(0, 0, 0, 0.8); --wcc-bg-38: var(--wt-bg); --wcc-bg-39: #e24e2c;
            --wcc-bg-40: var(--wt-bg-hover); --wcc-bg-41: #141118; --wcc-bg-45: rgba(60, 60, 60, 0.6); --wcc-bg-46: rgba(0, 0, 0, 0.5);
            --wcc-bg-47: #3b6cef; --wcc-bg-48: #818894; --wcc-bg-49: rgba(60, 60, 60, 0.08); --wcc-bg-50: rgba(59, 108, 239, 0.08);
            --wcc-bg-51: #2e1b21; --wcc-bg-52: #fff; --wcc-bg-53: #c7c9d5; --wcc-icon-01: #fff;
            --wcc-icon-02: #8c8c8c; --wcc-icon-03: #f8f8f8; --wcc-icon-04: #f8f8f8; --wcc-icon-05: #8c8c8c;
            --wcc-icon-06: #8c8c8c; --wcc-icon-07: #a6a6a6; --wcc-icon-08: var(--wt-accent); --wcc-icon-09: #e24e2c;
            --wcc-icon-10: #e99536; --wcc-icon-11: #9867ff; --wcc-loader-foreground: #555; --wcc-loader-background: #333;
        }

        /* WCC's outermost wrapper (wcc_App__root): without it the dark
           comment items sat on a white widget. */
        .wcc_App__root, [class*="wcc_App__loader"] {
            background: var(--wt-bg) !important;
            color: var(--wt-text) !important;
        }
        /* Kebab-case wcc loaders (don't match [class*="wcc_"] -- they use dashes) */
        [class*="wcc-comment-list-loader"], [class*="wcc-sort-order-loader"] {
            background: transparent !important;
            color: var(--wt-text-dim) !important;
        }
        /* Comment editor (where the user types). Multiple sub-classes. */
        .wcc_Editor__root, .wcc_Editor__content,
        .wcc_Editor__editor, .wcc_Editor__scrollArea,
        .wcc_Editor__actionBar, .wcc_Editor__toolbar,
        [class*="wcc_Editor__attachment"], .wcc_Editor__creatorPost,
        [class*="wcc_Editor__modifyContainer"], .wcc_Editor__replyContainer,
        .wcc_Editor__spoilerWrapper, [class*="wcc_Editor__mobileShortened"],
        .wcc_Editor__bottomLeftCornerIcon {
            background: var(--wt-bg-elev) !important;
            color: var(--wt-text) !important;
            border-color: var(--wt-border) !important;
        }
        .wcc_Editor__editor {
            caret-color: var(--wt-text) !important;
        }
        /* Comment editor toolbar action icons. The current WCC ships them as
           inline SVGs with stroke="currentColor" and fill="currentColor"
           under a TextEditor_* CSS-module class family (not wcc_Editor__).
           So setting color on the button is enough — no filters needed
           (filters were flattening the icons to solid white blobs). */
        .wcc_Editor__actionBar button,
        .wcc_Editor__toolbar button,
        .wcc_Editor__bottomLeftCornerIcon,
        .wcc_Editor__bottomLeftCornerIcon button,
        [class*="TextEditor_"] button,
        [class*="TextEditor_"] [role="button"] {
            color: var(--wt-text-dim) !important;
            opacity: 1 !important;
        }
        .wcc_Editor__actionBar button:hover,
        .wcc_Editor__toolbar button:hover,
        .wcc_Editor__bottomLeftCornerIcon button:hover,
        [class*="TextEditor_"] button:hover,
        [class*="TextEditor_"] [role="button"]:hover {
            color: var(--wt-text) !important;
        }
        /* Spoiler toggle inside the comment editor */
        .wcc_Spoiler__root, .wcc_Spoiler__text {
            color: var(--wt-text) !important;
            background: transparent !important;
        }
        .wcc_Spoiler__disabled { color: var(--wt-text-mute) !important; }
        .wcc_SpoilerGuard__viewText { color: var(--wt-text-dim) !important; }
        .wcc_SpoilerGuard__viewAll { color: var(--wt-link) !important; }

        /* WCC widget root surfaces -- list, individual rows, body, header */
        [class*="wcc_CommentList__"], [class*="wcc_CommentLoader__"],
        [class*="wcc_CommentView__"], [class*="wcc_CommentEmpty__"] {
            background-color: var(--wt-bg) !important;
            color: var(--wt-text) !important;
        }
        /* Comment text body */
        [class*="wcc_CommentBody__"] {
            background: transparent !important;
            color: var(--wt-text) !important;
        }
        [class*="wcc_CommentBody__deleted"], [class*="wcc_CommentBody__blinded"],
        [class*="wcc_CommentBody__emptyBody"] {
            color: var(--wt-text-mute) !important;
        }
        /* Creator badge in the comment header. */
        .wcc_CommentHeader__creatorBadge,
        [class*="wcc_CommentHeader__ownerSign"]     { color: var(--wt-accent) !important; }

        /* Sort-order tabs (TOP / NEWEST): the tab look is in the comments
           block below; this is only the idle colour. */
        .wcc_SortOrderTabs__root, .wcc_SortOrderTab__root {
            color: var(--wt-text-dim) !important;
        }

        /* Votes: the vote and Reply buttons are styled in the comments
           block below. */
        .wcc_CommentReaction__root {
            background: transparent !important;
            color: var(--wt-text-dim) !important;
        }
        /* Editor toolbar icons + kebab menu: icon-only buttons, no box. */
        .wcc_ContentTagPopover__button,
        .wcc_CommentOptionMenu__trigger {
            background: transparent !important;
            border: 0 !important;
            border-radius: 6px !important;
        }
        .wcc_ContentTagPopover__button:hover,
        .wcc_CommentOptionMenu__trigger:hover { background: var(--wt-bg-hover) !important; }
        [class*="wcc_CommentReaction__active"] { color: var(--wt-accent) !important; }
        [class*="wcc_CommentReaction__disabled"] { color: var(--wt-text-mute) !important; }

        /* "Best comment" badge + super-like badge */
        [class*="wcc_BestBadge__root"] {
            background-color: var(--wt-bg-elev2) !important;
            color: var(--wt-accent) !important;
            border: 1px solid var(--wt-border) !important;
        }
        [class*="wcc_SuperLikeBadge__root"] {
            background-color: var(--wt-bg-elev2) !important;
            color: var(--wt-accent) !important;
        }

        /* Reply folder + unfold buttons */
        .wcc_ReplyFolder__root, .wcc_ReplyUnfold__root,
        .wcc_ReplyUnfold__unfold {
            background: transparent !important;
            color: var(--wt-link) !important;
        }
        .wcc_ReplyUnfold__arrow { color: var(--wt-text-dim) !important; }

        /* "More comments" loader / pagination */
        .wcc_CommentMore__root, .wcc_CommentMore__more,
        [class*="wcc_CommentMore__prev"], [class*="wcc_CommentMore__progress"],
        [class*="wcc_CommentMore__noEditor"], [class*="wcc_CommentMore__reply"] {
            background: transparent !important;
            color: var(--wt-text-dim) !important;
        }
        .wcc_CommentMore__more:hover,
        [class*="wcc_CommentMore__prev"]:hover { color: var(--wt-text) !important; }
        .wcc_CommentMore__arrow { color: var(--wt-text-dim) !important; }

        /* Alert / report / option-menu popups */
        [class*="wcc_AlertPopup__overlay"],
        [class*="wcc_CommentReportPopup__overlay"] {
            background: rgba(0,0,0,.7) !important;
        }
        [class*="wcc_AlertPopup__content"],
        [class*="wcc_CommentReportPopup__content"],
        .wcc_CommentOptionMenu__content,
        .wcc_CommentOptionMenu__menu {
            background-color: var(--wt-bg-elev) !important;
            color: var(--wt-text) !important;
            border: 1px solid var(--wt-border) !important;
            box-shadow: 0 8px 24px rgba(0,0,0,.5) !important;
        }
        [class*="wcc_AlertPopup__title"],
        [class*="wcc_CommentReportPopup__title"] { color: var(--wt-text) !important; }
        /* Popup buttons — --wt-bg-hover (not --wt-bg-elev2) keeps visible
           contrast against the popup card's --wt-bg-elev background. */
        [class*="wcc_AlertPopup__content"] button,
        [class*="wcc_CommentReportPopup__content"] button,
        [class*="wcc_AlertPopup__cancel"],
        [class*="wcc_CommentReportPopup__cancel"],
        [class*="wcc_CommentReportPopup__reason"] {
            background: var(--wt-bg-hover) !important;
            color: var(--wt-text) !important;
            border: 1px solid var(--wt-border) !important;
        }
        [class*="wcc_AlertPopup__content"] button:hover,
        [class*="wcc_CommentReportPopup__content"] button:hover {
            background: var(--wt-bg-elev2) !important;
            border-color: var(--wt-text-dim) !important;
        }

        /* Empty state */
        [class*="wcc_CommentEmpty__message"] { color: var(--wt-text-dim) !important; }

        /* ================================================================
           Reader — everything after the last comic panel.
           One card language for the whole area (same surface, hairline and
           radius as the sidebar cards): end-of-chapter card → episode strip
           card → creator note + comments card | sidebar cards → round-up.
           Declared after the generic WCC rules above so equal-specificity
           selectors here win by source order. Layout-sensitive parts (the
           strip's JS-measured carousel) get visual changes only — no size,
           padding or position changes on anything the site's JS measures.
           ================================================================ */

        /* Layout: the end card lines up with the comic (800px); the episode
           strip and the app banner sit on the 1200px grid that the comments
           + sidebar row below uses, so every edge continues a line above or
           below it. All three share one surface: --wt-bg-elev, a hairline
           with a brighter top edge, 16px radius, one soft shadow. */

        /* End-of-chapter card: schedule chip → prompt (as the heading) →
           Like + Subscribe → hairline → share icons. */
        .viewer_lst .viewer_info_area {
            max-width: 800px !important;
            margin: 40px auto 0 !important;
            padding: 30px 32px 26px !important;
            box-sizing: border-box !important;
            background: var(--wt-bg-elev) !important;
            border: 1px solid rgba(255,255,255,.08) !important;
            border-top-color: rgba(255,255,255,.14) !important;
            border-radius: 16px !important;
            box-shadow: 0 12px 32px rgba(0,0,0,.35) !important;
            text-align: center !important;
        }
        .viewer_lst .day_info {
            display: inline-flex !important;
            align-items: center !important;
            gap: 8px !important;
            margin: 0 !important;
            padding: 3px 14px 3px 3px !important;
            border-radius: 999px !important;
            background: rgba(0,213,100,.1) !important;
            color: var(--wt-accent-soft) !important;
            font-size: 12px !important;
            font-weight: 700 !important;
            line-height: 24px !important;
            letter-spacing: .08em !important;
            text-transform: uppercase !important;
        }
        .viewer_lst .day_info .txt_ico_up { margin: 0 !important; transform: scale(.8) !important; }
        /* The prompt is the card's heading. Its <br> is dropped so it reads
           as one line (the markup keeps a space after it). */
        .viewer_lst .dsc_encourage {
            color: var(--wt-text) !important;
            font-size: 18px !important;
            font-weight: 600 !important;
            line-height: 1.4 !important;
            margin: 14px 0 20px !important;
        }
        .viewer_lst .dsc_encourage br { display: none !important; }
        /* Actions row, then a hairline, then the share row. The ::after is
           a full-width flex item ordered between the two buttons (order 0)
           and the share icons (order 2), which forces the line break. */
        .viewer_lst .spi_area {
            display: flex !important;
            flex-wrap: wrap !important;
            justify-content: center !important;
            align-items: center !important;
            gap: 10px !important;
            margin: 0 !important;  /* base: 18px / 53px */
        }
        .viewer_lst .spi_area::after {
            content: '' !important;
            order: 1 !important;
            flex: 0 0 100% !important;
            height: 1px !important;
            margin: 12px 0 !important;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,.1) 20%, rgba(255,255,255,.1) 80%, transparent) !important;
        }
        .viewer_lst .spi_area li { float: none !important; margin: 0 !important; }
        .viewer_lst .spi_area li:nth-child(n+3) { order: 2 !important; }
        /* Like (secondary) and Subscribe (primary) are the same size so they
           read as a pair; colour carries the priority. Each answers the
           cursor in its own colour — Like warms to a brighter orange,
           Subscribe brightens — with a 2px lift and a soft ring, so the
           hovered button clearly stands out. At rest Like keeps an
           orange-tinted outline: a plain dark pill read as a hole in the
           card, not as a button. */
        .viewer_lst .spi_area .bx {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 8px !important;
            box-sizing: border-box !important;
            height: 60px !important;
            line-height: 1 !important;
            min-width: 260px !important;
            padding: 0 32px !important;
            border-radius: 999px !important;
            font-size: 17px !important;
            font-weight: 700 !important;
            letter-spacing: .01em !important;
            background: rgba(255,255,255,.06) !important;
            border: 1px solid rgba(255,255,255,.14) !important;
            color: var(--wt-text) !important;
            box-shadow: none !important;
            transform: none !important;
            -webkit-tap-highlight-color: transparent !important;
            user-select: none !important;
            /* A slight overshoot on the way back up makes the release feel
               springy; the press itself is fast (see :active). */
            transition: background-color .2s ease, border-color .2s ease, box-shadow .2s ease, color .2s ease, transform .28s cubic-bezier(.34,1.56,.64,1) !important;
        }
        /* Press: the button sinks and shrinks a little and its glow
           tightens, quickly, like a physical key. */
        .viewer_lst .spi_area .bx:active {
            transform: translateY(1px) scale(.96) !important;
            transition-duration: .08s !important;
        }
        .viewer_lst .spi_area > li:first-child { margin-right: 4px !important; }
        .viewer_lst .spi_area .ico_like2,
        .viewer_lst .spi_area .ico_plus3 { margin: 0 !important; flex: none !important; }
        .viewer_lst .spi_area .ico_like2 { transition: transform .18s ease, filter .18s ease !important; }
        /* Like: the flame of the episode list ("how hot is this episode")
           on a warm orange outline; the count stays bright. */
        .viewer_lst .spi_area .lnk_like.bx {
            background: linear-gradient(180deg, rgba(255,106,36,.16), rgba(255,106,36,.06)) !important;
            border-color: rgba(255,122,60,.55) !important;
            color: #fff !important;
            box-shadow: inset 0 1px 0 rgba(255,255,255,.08), 0 6px 18px rgba(255,106,36,.1) !important;
        }
        .viewer_lst .spi_area .lnk_like.bx .ico_like2 {
            position: relative !important;
            width: 26px !important;
            height: 26px !important;
            background: #ff6a24 !important;
            -webkit-mask: var(--wt-flame-mask) center / contain no-repeat !important;
            mask: var(--wt-flame-mask) center / contain no-repeat !important;
        }
        .viewer_lst .spi_area .lnk_like.bx .ico_like2::after {
            content: '' !important;
            position: absolute !important;
            inset: 0 !important;
            background: #ffd25e !important;
            -webkit-mask: var(--wt-flame-core) center / contain no-repeat !important;
            mask: var(--wt-flame-core) center / contain no-repeat !important;
        }
        .viewer_lst .spi_area .lnk_like.bx:hover,
        .viewer_lst .spi_area .lnk_like.bx:focus-visible {
            background: linear-gradient(180deg, rgba(255,106,36,.26), rgba(255,106,36,.14)) !important;
            border-color: #ff7a3c !important;
            color: #fff !important;
            box-shadow: 0 0 0 4px rgba(255,106,36,.16), 0 10px 24px rgba(255,106,36,.24) !important;
            transform: translateY(-2px) !important;
        }
        /* Hover: the flame flickers. */
        .viewer_lst .spi_area .lnk_like.bx:hover .ico_like2 {
            filter: drop-shadow(0 0 5px rgba(255,140,40,.75)) !important;
            animation: wt-flicker .9s ease-in-out infinite !important;
        }
        @keyframes wt-flicker {
            0%, 100% { transform: scale(1.15) rotate(-4deg); }
            50%      { transform: scale(1.25) translateY(-1px) rotate(4deg); }
        }
        /* Liked: the site adds .on to the flame icon (._btnLike; the
           aria-pressed test is kept for other editions). The whole button
           catches fire, the flame turns white-hot and pops, a burst of
           small flames rises out of the button and a glow ring spreads:
           the moment of liking should feel like something happened. The
           burst also plays once when a liked episode opens. The fill is a
           deep orange so the white label keeps 5:1 or more (the bright
           #ff7f36 -> #e9531b fill gave it 2.5-3.7:1). */
        .viewer_lst .spi_area .lnk_like.bx:is([aria-pressed="true"], :has(> .ico_like2.on)) {
            background: linear-gradient(180deg, #c2410c, #9a3412) !important;
            border-color: #ff9a5c !important;
            box-shadow: inset 0 1px 0 rgba(255,255,255,.3), 0 8px 24px rgba(255,106,36,.35) !important;
        }
        .viewer_lst .spi_area .lnk_like.bx:is([aria-pressed="true"], :has(> .ico_like2.on)) .ico_like2 {
            background: #fff !important;
            animation: wt-flame-pop .45s cubic-bezier(.34,1.56,.64,1) !important;
        }
        .viewer_lst .spi_area .lnk_like.bx:is([aria-pressed="true"], :has(> .ico_like2.on)) .ico_like2::after { background: #ffd25e !important; }
        .viewer_lst .spi_area .lnk_like.bx { position: relative !important; overflow: visible !important; }
        .viewer_lst .spi_area .lnk_like.bx:is([aria-pressed="true"], :has(> .ico_like2.on))::before {
            content: '' !important;
            position: absolute !important;
            left: 50% !important;
            top: 50% !important;
            width: 300px !important;
            height: 100px !important;
            margin: -112px 0 0 -150px !important;  /* along the button's top edge */
            pointer-events: none !important;
            background: linear-gradient(0deg, #ff7a2c, #ffd25e 55%, #fff3c4) !important;
            -webkit-mask:
                var(--wt-flame-mask) 4% 92% / 22px 22px no-repeat,
                var(--wt-flame-mask) 18% 52% / 28px 28px no-repeat,
                var(--wt-flame-mask) 33% 16% / 20px 20px no-repeat,
                var(--wt-flame-mask) 47% 0% / 32px 32px no-repeat,
                var(--wt-flame-mask) 62% 28% / 22px 22px no-repeat,
                var(--wt-flame-mask) 78% 8% / 26px 26px no-repeat,
                var(--wt-flame-mask) 95% 70% / 22px 22px no-repeat !important;
            mask:
                var(--wt-flame-mask) 4% 92% / 22px 22px no-repeat,
                var(--wt-flame-mask) 18% 52% / 28px 28px no-repeat,
                var(--wt-flame-mask) 33% 16% / 20px 20px no-repeat,
                var(--wt-flame-mask) 47% 0% / 32px 32px no-repeat,
                var(--wt-flame-mask) 62% 28% / 22px 22px no-repeat,
                var(--wt-flame-mask) 78% 8% / 26px 26px no-repeat,
                var(--wt-flame-mask) 95% 70% / 22px 22px no-repeat !important;
            /* No opacity here: an !important value would beat the
               animation; its "both" fill keeps the flames hidden before
               and after. */
            animation: wt-flame-burst 1.1s cubic-bezier(.2,.7,.3,1) both !important;
        }
        .viewer_lst .spi_area .lnk_like.bx:is([aria-pressed="true"], :has(> .ico_like2.on))::after {
            content: '' !important;
            position: absolute !important;
            inset: -1px !important;
            border-radius: inherit !important;
            pointer-events: none !important;
            animation: wt-like-ring .8s ease-out both !important;
        }
        @keyframes wt-flame-burst {
            0%   { opacity: 0; transform: translateY(26px) scale(.5); }
            20%  { opacity: 1; }
            100% { opacity: 0; transform: translateY(-22px) scale(1.12); }
        }
        @keyframes wt-fade-out {
            0%, 35% { opacity: 1; }
            100% { opacity: 0; }
        }
        @keyframes wt-like-glow {
            0%   { box-shadow: 0 0 0 6px rgba(255,140,40,.45); }
            100% { box-shadow: 0 0 0 6px rgba(255,140,40,0); }
        }
        @keyframes wt-like-ring {
            0%   { box-shadow: 0 0 0 0 rgba(255,140,40,.65); }
            100% { box-shadow: 0 0 0 18px rgba(255,140,40,0); }
        }
        @keyframes wt-flame-pop {
            0%   { transform: scale(.6); }
            60%  { transform: scale(1.35); }
            100% { transform: scale(1); }
        }
        .viewer_lst .spi_area .lnk_favorites.bx {
            background: var(--wt-key) !important;
            border-color: var(--wt-key-edge) !important;
            color: #fff !important;
            box-shadow: inset 0 1px 0 rgba(255,255,255,.16) !important;
        }
        .viewer_lst .spi_area .lnk_favorites.bx .ico_plus3 {
            filter: brightness(0) invert(1) !important;
            transform: scale(1.15) !important;
            transition: transform .28s cubic-bezier(.34,1.56,.64,1) !important;
        }
        /* Hover: the plus turns a quarter. */
        .viewer_lst .spi_area .lnk_favorites.bx:hover .ico_plus3 { transform: scale(1.25) rotate(90deg) !important; }
        .viewer_lst .spi_area .lnk_favorites.bx:hover,
        .viewer_lst .spi_area .lnk_favorites.bx:focus-visible {
            background: var(--wt-key-hover) !important;
            border-color: var(--wt-accent-soft) !important;
            box-shadow: 0 0 0 4px rgba(0,213,100,.18), 0 10px 24px rgba(0,213,100,.3) !important;
            transform: translateY(-2px) !important;
        }
        /* Already subscribed: calm secondary style so it doesn't shout. */
        .cont_box .viewer_lst .spi_area .lnk_favorites.bx.on {
            background: rgba(255,255,255,.06) !important;
            border-color: rgba(255,255,255,.14) !important;
            color: var(--wt-text-dim) !important;
        }
        .cont_box .viewer_lst .spi_area .lnk_favorites.bx.on:hover {
            background: rgba(255,255,255,.1) !important;
            border-color: rgba(255,255,255,.28) !important;
            color: var(--wt-text) !important;
            box-shadow: none !important;
            transform: translateY(-2px) !important;
        }
        .cont_box .viewer_lst .spi_area .lnk_favorites.bx.on .ico_plus3 { filter: brightness(0) invert(1) opacity(.7) !important; }
        /* Share icons: the site's sprite is a set of brand-coloured discs —
           greyed out they looked disabled, in colour they shouted over the
           actions. Draw one monochrome icon set instead (SVG masks in the
           palette, like the Like flame) on quiet round buttons; each fills
           with its brand colour on hover / keyboard focus. */
        .viewer_lst .spi_area > li > a[class^="ico_"] {
            position: relative !important;
            display: block !important;
            width: 40px !important;
            height: 40px !important;
            box-sizing: border-box !important;
            border-radius: 50% !important;
            background: rgba(255,255,255,.05) !important;
            border: 1px solid rgba(255,255,255,.1) !important;
            color: var(--wt-text-dim) !important;
            font-size: 0 !important;
            text-indent: 0 !important;
            overflow: hidden !important;
            filter: none !important;
            transition: background-color .15s ease, border-color .15s ease, color .15s ease, transform .15s ease !important;
        }
        .viewer_lst .spi_area > li > a[class^="ico_"]::before {
            content: '' !important;
            position: absolute !important;
            inset: 0 !important;
            margin: auto !important;
            width: 18px !important;
            height: 18px !important;
            background: currentColor !important;
            -webkit-mask: var(--wt-share) center / contain no-repeat !important;
            mask: var(--wt-share) center / contain no-repeat !important;
        }
        .viewer_lst .spi_area > li > a[class^="ico_"]:hover,
        .viewer_lst .spi_area > li > a[class^="ico_"]:focus-visible {
            background: var(--wt-brand) !important;
            border-color: var(--wt-brand) !important;
            color: #fff !important;
            transform: translateY(-1px) !important;
        }
        /* Icon + brand colour per network. Unscoped on purpose: the reader's
           end card and the series header both draw their share buttons from
           these two variables. */
        /* Copy link, and networks without a mask of their own (LINE on
           some language editions), use the link icon; without a mask the
           button drew a solid square. :where() keeps it below the
           per-network rules. */
        :where(.spi_area a[class^="ico_"]) { --wt-share: var(--wt-ico-link); --wt-brand: #2f9e62; }
        .spi_area a.ico_facebook { --wt-share: var(--wt-ico-facebook); --wt-brand: #1877f2; }
        .spi_area a.ico_twitter  { --wt-share: var(--wt-ico-x);        --wt-brand: #000; }
        .spi_area a.ico_tumblr   { --wt-share: var(--wt-ico-tumblr);   --wt-brand: #3a5174; }
        .spi_area a.ico_reddit   { --wt-share: var(--wt-ico-reddit);   --wt-brand: #ff4500; }
        .spi_area a.ico_rss      { --wt-share: var(--wt-ico-rss);      --wt-brand: #ee802f; }
        .viewer_lst .spi_area a.ico_twitter:hover,
        .viewer_lst .spi_area a.ico_twitter:focus-visible,
        .detail_header .spi_area a.ico_twitter:hover,
        .detail_header .spi_area a.ico_twitter:focus-visible { border-color: rgba(255,255,255,.3) !important; }

        /* "Report" (the episode): the site pins .report_area absolutely to
           the right edge of the 1200px .viewer_lst, so a bordered pill
           floated in the empty space beside the 800px end card. It now sits
           inside the card's bottom-right corner (.viewer_lst ends at the
           card's bottom; the card is centred, so its right edge is 50% +
           400px; 20px in clears the card's edge) as a flag + label on a glass pill, the same surface as the
           share discs beside it, that turns red on hover. Plain grey text
           was too easy to miss; it still ranks well below Like / Subscribe. The full-width share row
           (.spi_area, z-index 50) is painted over it, so only the last few
           pixels of the link took the click; z-index 60 lifts it above. */
        .viewer_lst .report_area {
            top: auto !important;
            bottom: 28px !important;  /* centred on the share row */
            right: calc(50% - 400px + 20px) !important;
            left: auto !important;
            z-index: 60 !important;
        }
        /* width: the site fixes the link at 78px, so the label ran past
           the pill's right edge. */
        .viewer_lst .report_area .lk_report,
        .viewer_lst .report_area .lk_report:visited {
            width: auto !important;
            white-space: nowrap !important;
            display: inline-flex !important;
            align-items: center !important;
            gap: 7px !important;
            box-sizing: border-box !important;
            height: 36px !important;
            padding: 0 14px 0 12px !important;
            border: 1px solid rgba(255,255,255,.12) !important;
            border-radius: 999px !important;
            background: rgba(255,255,255,.05) !important;
            color: var(--wt-text-dim) !important;
            font-size: 14px !important;
            font-weight: 500 !important;
            line-height: 1 !important;
            text-decoration: none !important;
            transition: background-color .15s ease, border-color .15s ease, color .15s ease !important;
        }
        .viewer_lst .report_area .lk_report::before {
            content: '' !important;
            flex: none !important;
            width: 15px !important;
            height: 15px !important;
            background: currentColor !important;
            -webkit-mask: var(--wt-ico-flag) center / contain no-repeat !important;
            mask: var(--wt-ico-flag) center / contain no-repeat !important;
        }
        .viewer_lst .report_area .lk_report:hover,
        .viewer_lst .report_area .lk_report:focus-visible {
            background: rgba(240,104,104,.12) !important;
            border-color: rgba(240,104,104,.45) !important;
            color: #ff8a8a !important;
        }

        /* Patreon block under the end card (CANVAS series with a Patreon):
           "Enjoying the series? ..." · patron count | amount · "Become a
           Patron". Base: loose centred text on the page with a flat orange
           button. Now a card the width of the end card, in the coral of
           the series sidebar's Patreon panel: the prompt and the figures
           on the left, the button on the right as a coral outline that
           fills on hover. It is a direct child of #_viewerBox (beside
           .viewer_lst). The site shows / hides the count and error lines
           with an inline display. */
        #_viewerBox > .viewer_patron_area {
            display: grid !important;
            /* The text column is as wide as the prompt, and the count is
               centred under it (left-aligned it hung off the prompt's
               start); the button keeps the right edge. */
            grid-template-columns: minmax(0, max-content) auto !important;
            justify-content: space-between !important;
            column-gap: 24px !important;
            align-items: center !important;
            box-sizing: border-box !important;
            max-width: 800px !important;
            margin: 16px auto 0 !important;
            padding: 20px 24px !important;
            background: linear-gradient(90deg, rgba(243,94,54,.1), rgba(243,94,54,.02) 60%), var(--wt-bg-elev) !important;
            border: 1px solid rgba(255,255,255,.08) !important;
            border-top-color: rgba(255,255,255,.14) !important;
            border-radius: 16px !important;
            box-shadow: 0 12px 32px rgba(0,0,0,.35) !important;
            text-align: left !important;
        }
        #_viewerBox > .viewer_patron_area > p:first-child {
            grid-column: 1 !important;
            margin: 0 !important;
            color: var(--wt-text) !important;
            font-size: 15px !important;
            font-weight: 500 !important;
            line-height: 1.45 !important;
            text-align: center !important;
            text-wrap: balance !important;
        }
        #_viewerBox > .viewer_patron_area .patron_info {
            grid-column: 1 !important;
            justify-content: center !important;
            align-items: center !important;
            gap: 10px !important;
            width: auto !important;
            margin: 8px 0 0 !important;
            padding: 0 !important;
            text-align: left !important;
        }
        #_viewerBox > .viewer_patron_area .patron_info:not([style*="none"]) { display: flex !important; }
        /* The site pads each span 27px for an absolutely placed sprite;
           with the sprite hidden (money) that left a hole before "$0". */
        #_viewerBox > .viewer_patron_area .patron_info > span { display: inline-flex !important; align-items: center !important; gap: 7px !important; padding: 0 !important; }
        /* The amount is "$0" when the creator doesn't share earnings
           (tagPatronAmount() marks it): hidden, with its divider. */
        #_viewerBox > .viewer_patron_area .patron_info > span[data-wt-zero],
        #_viewerBox > .viewer_patron_area .patron_info:has(> span[data-wt-zero]) > em.bar { display: none !important; }
        #_viewerBox > .viewer_patron_area .patron_info em {
            margin: 0 !important;
            color: #fff !important;
            font-size: 15px !important;
            font-weight: 700 !important;
            font-style: normal !important;
            font-variant-numeric: tabular-nums !important;
        }
        #_viewerBox > .viewer_patron_area .ico_hand {
            flex: none !important;
            width: 16px !important;
            height: 16px !important;
            position: static !important;
            margin: 0 !important;
            background: #ff7a59 !important;
            -webkit-mask: var(--wt-heart-mask) center / contain no-repeat !important;
            mask: var(--wt-heart-mask) center / contain no-repeat !important;
        }
        #_viewerBox > .viewer_patron_area .ico_money { display: none !important; }
        #_viewerBox > .viewer_patron_area .patron_info em.bar {
            width: 4px !important;
            height: 4px !important;
            margin: 0 !important;
            border-radius: 50% !important;
            background: rgba(255,255,255,.3) !important;
            font-size: 0 !important;
        }
        #_viewerBox > .viewer_patron_area .btn_patron {
            grid-column: 2 !important;
            grid-row: 1 / span 4 !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            box-sizing: border-box !important;
            width: auto !important;
            height: 44px !important;
            margin: 0 !important;
            padding: 0 24px !important;
            border-radius: 12px !important;
            background: rgba(243,94,54,.12) !important;
            border: 1px solid rgba(255,122,89,.5) !important;
            color: #ffb39e !important;
            font-size: 15px !important;
            font-weight: 600 !important;
            line-height: 1 !important;
            white-space: nowrap !important;
            text-decoration: none !important;
            transition: background-color .18s ease, border-color .18s ease, color .18s ease, box-shadow .18s ease !important;
        }
        #_viewerBox > .viewer_patron_area .btn_patron:hover,
        #_viewerBox > .viewer_patron_area .btn_patron:focus-visible {
            background: #f35e36 !important;
            border-color: #f35e36 !important;
            color: #fff !important;
            box-shadow: 0 0 0 4px rgba(243,94,54,.18), 0 8px 22px rgba(243,94,54,.28) !important;
        }

        /* Episode strip — the card is the outer #bottomEpisodeList box on the
           1200px grid. The carousel JS measures .episode_lst and its <ul>, so
           those keep their size; only the wrapper around them changes. */
        #bottomEpisodeList.episode_area {
            max-width: 1200px !important;
            height: auto !important;  /* base: fixed, shorter than the strip */
            margin: 32px auto 0 !important;
            /* The strip keeps room for a second title line (and 12px
               under it); most titles take one, which left 45px under them
               against 31px above the covers. */
            padding: 18px 0 8px !important;
            box-sizing: border-box !important;
            background: var(--wt-bg-elev) !important;
            border: 1px solid rgba(255,255,255,.08) !important;
            border-top-color: rgba(255,255,255,.14) !important;
            border-radius: 16px !important;
            box-shadow: 0 12px 32px rgba(0,0,0,.35) !important;
        }
        /* The <ul> (fixed 132px) and .episode_cont both clip, which cut the
           second title line; heights only — the carousel pages by width. */
        #bottomEpisodeList .episode_lst,
        #bottomEpisodeList .episode_lst .episode_cont { height: 150px !important; }
        #bottomEpisodeList .episode_lst .episode_cont > ul { height: 150px !important; }
        /* A short series (fewer episodes than one carousel page — 9 at this
           width) used to hug the left edge with a void on the right; centre
           that row. From 9 episodes up the row fills the strip and keeps
           the site's start alignment, so paging positions stay pixel-identical. */
        #bottomEpisodeList .episode_lst .episode_cont > ul {
            display: flex !important;
            justify-content: safe center !important;
        }
        #bottomEpisodeList .episode_lst .episode_cont > ul:has(> li:nth-child(9)) { justify-content: flex-start !important; }
        #bottomEpisodeList .episode_lst .episode_cont > ul > li { float: none !important; flex: none !important; }
        /* Tiles: rounded covers with a soft drop shadow and a hairline,
           titles on up to two lines (one line cut most of them to "Ep. 3 -
           The Tri…"). Hover lifts the cover, zooms the art a touch and rings
           it green. The episode being read keeps a green ring with a glow
           and a ▶ badge in its corner. Only the cover moves (transform), so
           the tile widths the carousel JS pages by never change. */
        #bottomEpisodeList .episode_lst .thmb {
            position: relative !important;
            border: 0 !important;
            border-radius: 14px !important;
            overflow: hidden !important;
            box-shadow: 0 6px 16px rgba(0,0,0,.45) !important;
            transition: transform .2s ease, box-shadow .2s ease !important;
        }
        #bottomEpisodeList .episode_lst .thmb img {
            border-radius: 0 !important;
            filter: none !important;
            transition: transform .3s ease !important;
        }
        #bottomEpisodeList .episode_lst ul .mask {
            background: transparent !important;
            border: 0 !important;
            border-radius: inherit !important;
            box-shadow: inset 0 0 0 1px rgba(255,255,255,.1) !important;
            transition: box-shadow .2s ease !important;
        }
        #bottomEpisodeList .episode_lst li a:hover .thmb,
        #bottomEpisodeList .episode_lst li a:focus-visible .thmb {
            transform: translateY(-3px) !important;
            box-shadow: 0 10px 22px rgba(0,0,0,.5) !important;
        }
        #bottomEpisodeList .episode_lst li a:hover .thmb img { transform: scale(1.06) !important; filter: none !important; }
        #bottomEpisodeList .episode_lst li a:hover .mask,
        #bottomEpisodeList .episode_lst li a:focus-visible .mask { box-shadow: inset 0 0 0 2px var(--wt-accent-soft) !important; }
        #bottomEpisodeList .episode_lst .subj {
            display: -webkit-box !important;
            -webkit-box-orient: vertical !important;
            -webkit-line-clamp: 2 !important;
            box-sizing: border-box !important;
            width: 100% !important;
            margin-top: 9px !important;
            padding: 0 4px !important;
            overflow: hidden !important;
            white-space: normal !important;
            text-overflow: clip !important;
            text-align: center !important;
            color: var(--wt-text-dim) !important;
            font-size: 12.5px !important;
            font-weight: 500 !important;
            line-height: 1.3 !important;
            letter-spacing: .01em !important;
            transition: color .15s ease !important;
        }
        #bottomEpisodeList .episode_lst li a:hover .subj { color: #fff !important; }
        /* The site offsets the current cover by -3px for its old 3px border;
           with the border gone that pushed it up into the strip's clip. */
        #bottomEpisodeList .episode_lst li a.on { margin: 0 !important; width: 92px !important; }
        #bottomEpisodeList .episode_lst li .on .thmb,
        #bottomEpisodeList .episode_lst li .on:hover .thmb {
            margin: 0 0 7px !important;
            border: 0 !important;
            border-radius: 14px !important;
        }
        #bottomEpisodeList .episode_lst ul .on .mask,
        #bottomEpisodeList .episode_lst ul .on:hover .mask {
            z-index: 1 !important;
            opacity: 1 !important;
            background: transparent !important;
            box-shadow: inset 0 0 0 3px var(--wt-accent), inset 0 0 14px rgba(0,213,100,.45) !important;
        }
        #bottomEpisodeList .episode_lst li .on .thmb::after {
            content: '' !important;
            position: absolute !important;
            right: 6px !important;
            bottom: 6px !important;
            z-index: 2 !important;
            width: 22px !important;
            height: 22px !important;
            border-radius: 50% !important;
            background: var(--wt-play-badge) center / contain no-repeat !important;
            box-shadow: 0 2px 8px rgba(0,0,0,.5) !important;
        }
        #bottomEpisodeList .episode_lst li .on .subj { color: var(--wt-accent-soft) !important; font-weight: 700 !important; }
        /* Prev / next: a slim tab in each of the card's 66px side gutters,
           exactly as tall as the covers (12px in, 87px) and rounded like
           them, so the arrows read as the ends of the cover row. Round discs
           beside the square covers looked pasted on (the user's call). The
           tab is a faint glass column with a chevron; hover lights it
           green. 30px wide, centred in the gutter: .episode_lst starts 26px
           in, so -8px. A disabled arrow (.off: first / last page) stays as
           a faint tab: hiding it left one gutter empty, and the row read as
           pushed to one side. Both hide only when there is nothing to page
           (a short series). */
        .episode_area#bottomEpisodeList .episode_lst .pg_prev,
        .episode_area#bottomEpisodeList .episode_lst .pg_next {
            width: 30px !important;
            height: 87px !important;
            top: 12px !important;
            border-radius: 14px !important;
            background: linear-gradient(180deg, rgba(255,255,255,.07), rgba(255,255,255,.03)) !important;
            border: 1px solid rgba(255,255,255,.1) !important;
            box-shadow: inset 0 1px 0 rgba(255,255,255,.06) !important;
            color: var(--wt-text-dim) !important;
            transition: background-color .18s ease, border-color .18s ease, box-shadow .18s ease, color .18s ease, opacity .18s ease !important;
        }
        .episode_area#bottomEpisodeList .episode_lst .pg_prev { left: -8px !important; }
        .episode_area#bottomEpisodeList .episode_lst .pg_next { right: -8px !important; left: auto !important; }
        .episode_area#bottomEpisodeList .episode_lst .pg_prev:hover,
        .episode_area#bottomEpisodeList .episode_lst .pg_next:hover,
        .episode_area#bottomEpisodeList .episode_lst .pg_prev:focus-visible,
        .episode_area#bottomEpisodeList .episode_lst .pg_next:focus-visible {
            background: linear-gradient(180deg, rgba(0,213,100,.18), rgba(0,213,100,.08)) !important;
            border-color: rgba(0,213,100,.5) !important;
            box-shadow: 0 0 0 3px rgba(0,213,100,.1), 0 6px 16px rgba(0,0,0,.35) !important;
            color: var(--wt-accent-soft) !important;
        }
        .episode_area#bottomEpisodeList .episode_lst .pg_prev.off,
        .episode_area#bottomEpisodeList .episode_lst .pg_next.off {
            opacity: .35 !important;
            box-shadow: none !important;
            pointer-events: none !important;
        }
        .episode_area#bottomEpisodeList .episode_lst:has(.pg_prev.off):has(.pg_next.off) :is(.pg_prev, .pg_next) { opacity: 0 !important; }
        /* text-indent:0 — the pseudo inherits the site's text-indent:100%
           hidden-label trick, which shoved the chevron to the button's right edge. */
        .episode_area#bottomEpisodeList .episode_lst .pg_prev::before,
        .episode_area#bottomEpisodeList .episode_lst .pg_next::after {
            content: '' !important;
            inset: 0 !important;
            margin: auto !important;
            width: 16px !important;
            height: 16px !important;
            padding: 0 !important;
            font-size: 0 !important;
            text-indent: 0 !important;
            color: inherit !important;
            background: currentColor !important;
            -webkit-mask: var(--wt-ico-chevron-right) center / contain no-repeat !important;
            mask: var(--wt-ico-chevron-right) center / contain no-repeat !important;
        }
        .episode_area#bottomEpisodeList .episode_lst .pg_prev::before,
        .episode_area#bottomEpisodeList .episode_lst .pg_next::after { transition: transform .18s ease !important; }
        .episode_area#bottomEpisodeList .episode_lst .pg_prev::before { transform: rotate(180deg) !important; }
        .episode_area#bottomEpisodeList .episode_lst .pg_prev:hover::before { transform: translateX(-2px) rotate(180deg) !important; }
        .episode_area#bottomEpisodeList .episode_lst .pg_next:hover::after { transform: translateX(2px) !important; }

        /* "Want more? Read more episodes … on the WEBTOON App" — shown under
           the newest free episode. Base: a full-bleed #2f2f2f band that
           matched nothing else on the page. Now a card on the 1200px grid
           with a faint brand-green wash; the QR code keeps a white tile so it
           stays scannable. */
        .induce_app_area {
            display: flex !important;
            align-items: center !important;
            gap: 18px !important;
            max-width: 1200px !important;
            height: auto !important;
            margin: 16px auto 0 !important;
            padding: 16px 20px !important;
            box-sizing: border-box !important;
            background: linear-gradient(90deg, rgba(0,213,100,.09), rgba(0,213,100,0) 55%), var(--wt-bg-elev) !important;
            border: 1px solid rgba(255,255,255,.08) !important;
            border-top-color: rgba(255,255,255,.14) !important;
            border-radius: 16px !important;
            box-shadow: 0 12px 32px rgba(0,0,0,.35) !important;
            text-align: left !important;
        }
        /* No overflow clip here: the .preview variant hangs a badge off the
           thumbnail's left edge (left: -15px). Round the <img> instead. */
        .induce_app_area .img_area {
            flex: none !important;
            width: 56px !important;
            height: 56px !important;
            margin: 0 !important;
        }
        .induce_app_area .img_area img { display: block !important; width: 100% !important; height: 100% !important; object-fit: cover !important; border-radius: 12px !important; }
        .induce_app_area .text_area {
            flex: 1 1 auto !important;
            min-width: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            text-align: left !important;
        }
        .induce_app_area .text_area strong {
            color: var(--wt-text) !important;
            font-size: 16px !important;
            font-weight: 600 !important;
            line-height: 1.35 !important;
        }
        .induce_app_area .text_area strong em { color: var(--wt-accent) !important; font-style: normal !important; }
        .induce_app_area .text_area p {
            margin: 4px 0 0 !important;
            color: var(--wt-text-dim) !important;  /* mute was 3.9:1 on the green wash */
            font-size: 13px !important;
            line-height: 1.4 !important;
        }
        .induce_app_area .text_area p em { color: var(--wt-text) !important; font-style: normal !important; }
        .induce_app_area .qrcode_area {
            flex: none !important;
            width: auto !important;
            height: auto !important;
            margin: 0 !important;
            padding: 5px !important;
            background: #fff !important;
            border-radius: 9px !important;
            line-height: 0 !important;
        }
        .induce_app_area .qrcode_area img { display: block !important; width: 48px !important; height: 48px !important; }

        /* ================================================================
           Ranking sidebar cards — one component for the reader sidebar
           (Trending & Popular, Top Originals) and the /canvas right rail
           (Top CANVAS, Up & Coming): all are .ranking_lst.viewer > .lst_area.
           Header: title + one CSS-drawn chevron (a text ">" / "›" never
           centres across fonts, and older ID-scoped rules doubled it), filter
           pill on the right, hairline underneath. Rows: the base layout
           absolutely positions thumb / rank / text at fixed offsets; here it
           becomes one flex row — rank · rounded thumb · genre/title/author —
           with a rounded hover highlight. Every rank number has the same
           colour (green on the top three set them apart for no reason).
           ================================================================ */
        .ranking_lst.viewer > .lst_area > .title_area {
            height: auto !important;
            padding: 0 0 12px !important;
            margin: 0 0 8px !important;
            border-bottom: 1px solid rgba(255,255,255,.07) !important;
        }
        .ranking_lst.viewer > .lst_area > .title_area h2 {
            position: relative !important;
            display: flex !important;
            align-items: center !important;
            gap: 2px !important;
            margin: 0 !important;
            line-height: 1.2 !important;
        }
        /* The header looks like one button, but the site binds the click on
           the link (a._rankingMoveBtn) alone: the chevron and the empty
           part of the header did nothing. The link's ::after covers the
           whole header; without z-index 1 the chevron still took the
           click. /canvas
           headers are a plain <span> (no link), so they get no pointer and
           no hover cue. */
        .ranking_lst.viewer > .lst_area > .title_area h2 > a::after {
            content: '' !important;
            position: absolute !important;
            inset: 0 !important;
            z-index: 1 !important;
        }
        .ranking_lst.viewer > .lst_area > .title_area h2 > a,
        .ranking_lst.viewer > .lst_area > .title_area h2 > span {
            display: inline-block !important;
            font-size: 17px !important;
            font-weight: 700 !important;
            line-height: 1.2 !important;
            letter-spacing: .01em !important;
            color: var(--wt-text) !important;
            vertical-align: middle !important;
            transition: color .15s ease !important;
        }
        .ranking_lst.viewer > .lst_area > .title_area h2 .ico_arr1 {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            flex: none !important;
            width: 22px !important;
            height: 22px !important;
            margin: 0 !important;
            padding: 0 !important;
            font-size: 0 !important;
            color: var(--wt-text-mute) !important;
            background: none !important;
            filter: none !important;
            border-radius: 50% !important;
            position: static !important;
            transition: background-color .15s ease, color .15s ease !important;
        }
        .ranking_lst.viewer > .lst_area > .title_area h2 .ico_arr1::after {
            content: '' !important;
            width: 6px !important;
            height: 6px !important;
            margin-left: -3px !important;
            border-top: 2px solid currentColor !important;
            border-right: 2px solid currentColor !important;
            transform: rotate(45deg) !important;
        }
        .ranking_lst.viewer > .lst_area > .title_area h2 > a:is(:hover, :focus-visible) { color: var(--wt-accent) !important; }
        .ranking_lst.viewer > .lst_area > .title_area h2 > a:is(:hover, :focus-visible) ~ .ico_arr1 {
            background: var(--wt-bg-hover) !important;
            color: var(--wt-accent) !important;
        }

        /* Rows */
        .ranking_lst.viewer .lst_type1 { border: 0 !important; }
        .ranking_lst.viewer .lst_type1 > li {
            height: auto !important;
            padding: 0 !important;
            border: 0 !important;
            background: transparent !important;
        }
        .ranking_lst.viewer .lst_type1 > li + li { margin-top: 2px !important; }
        .ranking_lst.viewer .lst_type1 > li > a {
            display: flex !important;
            align-items: center !important;
            gap: 12px !important;
            height: auto !important;
            padding: 8px 8px 8px 4px !important;
            border-radius: 12px !important;
            transition: background-color .15s ease !important;
        }
        .ranking_lst.viewer .lst_type1 > li > a:hover { background: var(--wt-bg-hover) !important; }
        .ranking_lst.viewer .lst_type1 .num_area {
            position: static !important;
            order: -1 !important;
            flex: none !important;
            width: 22px !important;
            height: auto !important;
            justify-content: center !important;
        }
        /* Rank digits ship as sprite spans (.ico_n1 …) with the number as
           hidden text — show the text, drop the sprite. */
        .ranking_lst.viewer .lst_type1 .num_area [class^="ico_n"] {
            background: none !important;
            filter: none !important;
            width: auto !important;
            height: auto !important;
            text-indent: 0 !important;
            overflow: visible !important;
            font-size: 16px !important;
            font-weight: 800 !important;
            line-height: 1 !important;
            font-style: normal !important;
            color: var(--wt-text-dim) !important;
            font-variant-numeric: tabular-nums !important;
        }
        .ranking_lst.viewer .lst_type1 .pic_area {
            position: relative !important;
            inset: auto !important;
            flex: none !important;
            width: 64px !important;
            height: 64px !important;
            border-radius: 10px !important;
            overflow: hidden !important;
        }
        .ranking_lst.viewer .lst_type1 .pic_area img {
            display: block !important;
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
        }
        .ranking_lst.viewer .lst_type1 .pic_area::before {
            border-color: rgba(255,255,255,.08) !important;
            border-radius: inherit !important;
            z-index: 1 !important;
        }
        /* Thumbnail badges (e.g. "NEW") were positioned against the old
           layout; re-anchor them on the thumbnail (4 + 22 + 12 + 4 px). */
        .ranking_lst.viewer .lst_type1 .icon_area { left: 42px !important; top: 12px !important; }
        .ranking_lst.viewer .lst_type1 .info_area {
            flex: 1 1 auto !important;
            min-width: 0 !important;
            height: auto !important;
            padding: 0 !important;
            gap: 1px !important;
        }
        .ranking_lst.viewer .lst_type1 .info_area .genre {
            font-size: 11px !important;
            font-weight: 600 !important;
            line-height: 15px !important;
            letter-spacing: .04em !important;
            text-transform: uppercase !important;
        }
        .ranking_lst.viewer .lst_type1 .info_area .genre:not([class*="g_"]) { color: var(--wt-text-mute) !important; }
        .ranking_lst.viewer .lst_type1 .info_area .subj {
            font-size: 15px !important;
            font-weight: 600 !important;
            line-height: 20px !important;
            margin: 0 !important;
            color: var(--wt-text) !important;
        }
        .ranking_lst.viewer .lst_type1 .info_area .author {
            font-size: 12px !important;
            line-height: 16px !important;
            margin: 0 !important;
            color: var(--wt-text-mute) !important;
        }
        .ranking_lst.viewer .lst_type1 > li > a:hover .subj { color: var(--wt-accent) !important; }
        /* On the rail's hover tile the muted grey fell to 3.7:1. */
        .aside.challenge .ranking_lst.viewer .lst_type1 > li > a:hover :is(.author, .genre:not([class*="g_"])) { color: var(--wt-text-dim) !important; }
        .ranking_lst.viewer .lst_type1 > li > a:hover img { filter: none !important; }

        /* Creator card — the one block on the page about the people who made
           the episode, so it is presented like a profile: a large ringed
           avatar, a small green "Creator" eyebrow over the name, the
           verified badge beside it, and a chevron that slides on hover when
           the name links to the creator's page (one linked creator: the
           whole card is the link). A faint green glow comes off the avatar
           corner. The creator's note for the episode (.author_text) becomes
           a speech bubble under the header.
           Grid: .author_area is display:contents, so the avatar can span the
           eyebrow + name rows. Without a profile picture (several authors, or
           no community page) a neutral person mark stands in. */
        .comment_area .creator_note {
            display: grid !important;
            grid-template-columns: auto minmax(0, 1fr) !important;
            column-gap: 16px !important;
            row-gap: 2px !important;
            align-items: center !important;
            position: relative !important;
            padding: 22px 24px !important;
            background:
                radial-gradient(140% 160% at 0% 0%, rgba(0,213,100,.13), rgba(0,213,100,0) 50%),
                var(--wt-bg-elev) !important;
            border: 1px solid rgba(255,255,255,.08) !important;
            border-top-color: rgba(255,255,255,.14) !important;
            border-radius: 18px !important;
            box-shadow: 0 12px 32px rgba(0,0,0,.35) !important;
            transition: border-color .18s ease, box-shadow .18s ease !important;
        }
        .comment_area .creator_note .title {
            grid-column: 2 !important;
            grid-row: 1 !important;
            align-self: end !important;
            margin: 0 !important;
            color: var(--wt-accent-soft) !important;
            font-size: 11px !important;
            font-weight: 700 !important;
            line-height: 16px !important;
            letter-spacing: .14em !important;
            text-transform: uppercase !important;
        }
        .comment_area .creator_note .author_area { display: contents !important; }
        .comment_area .creator_note .author_area .profile,
        .comment_area .creator_note:not(:has(.profile)) .author_area::before {
            grid-column: 1 !important;
            grid-row: 1 / span 2 !important;
            width: 60px !important;
            height: 60px !important;
            margin: 0 !important;
            border-radius: 50% !important;
            box-shadow:
                0 0 0 3px var(--wt-bg-elev),
                0 0 0 5px var(--wt-accent),
                0 8px 22px rgba(0,213,100,.25) !important;
        }
        .comment_area .creator_note .author_area .profile::after { border-color: rgba(255,255,255,.1) !important; }
        .comment_area .creator_note .author_area .profile img {
            display: block !important;
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
        }
        .comment_area .creator_note:not(:has(.profile)) .author_area::before {
            content: '' !important;
            background: var(--wt-avatar-none) center / 30px no-repeat, var(--wt-bg-elev2) !important;
            box-shadow:
                0 0 0 3px var(--wt-bg-elev),
                0 0 0 5px rgba(255,255,255,.14) !important;
        }
        .comment_area .creator_note .author_area .author {
            grid-column: 2 !important;
            grid-row: 2 !important;
            align-self: start !important;
            display: flex !important;
            flex-wrap: wrap !important;
            align-items: center !important;
            min-width: 0 !important;
            color: var(--wt-text) !important;
            font-size: 20px !important;
            font-weight: 700 !important;
            line-height: 28px !important;
        }
        .comment_area .creator_note .author_area .author_name {
            display: inline-flex !important;
            align-items: center !important;
            color: var(--wt-text) !important;
            text-decoration: none !important;
        }
        .comment_area .creator_note .author_area .author_name span {
            color: inherit !important;
            transition: color .15s ease !important;
        }
        /* Verified badge (the site's sprite on ::after): centre it on the name. */
        .comment_area .creator_note .author_area a.author_name::after {
            margin: 0 0 0 6px !important;
            align-self: center !important;
        }
        /* One linked creator: stretch the link over the whole card, add a
           chevron after the name, and light both up on hover. */
        .comment_area .creator_note .author:has(> a.author_name:only-child)::after {
            content: '' !important;
            width: 8px !important;
            height: 8px !important;
            margin-left: 12px !important;
            border-top: 2px solid currentColor !important;
            border-right: 2px solid currentColor !important;
            color: var(--wt-text-mute) !important;
            transform: rotate(45deg) !important;
            transition: transform .18s ease, color .18s ease !important;
        }
        .comment_area .creator_note .author > a.author_name:only-child::before {
            content: '' !important;
            position: absolute !important;
            inset: 0 !important;
            border-radius: inherit !important;
        }
        .comment_area .creator_note:has(a.author_name:hover) {
            border-color: rgba(0,213,100,.35) !important;
            box-shadow: 0 0 0 4px rgba(0,213,100,.08), 0 14px 36px rgba(0,0,0,.4) !important;
        }
        .comment_area .creator_note .author_area a.author_name:hover span,
        .comment_area .creator_note .author_area a.author_name:focus-visible span { color: var(--wt-accent) !important; }
        .comment_area .creator_note:has(a.author_name:hover) .author::after {
            color: var(--wt-accent) !important;
            transform: translateX(4px) rotate(45deg) !important;
        }
        /* The creator's note for this episode: a speech bubble whose square
           top-left corner points back at the avatar. Raised above the
           stretched link so its text stays selectable. */
        .comment_area .creator_note .author_text {
            grid-column: 1 / -1 !important;
            position: relative !important;
            z-index: 1 !important;
            margin: 16px 0 0 !important;
            padding: 14px 18px !important;
            background: rgba(255,255,255,.04) !important;
            border: 1px solid rgba(255,255,255,.08) !important;
            border-radius: 4px 16px 16px 16px !important;
            color: var(--wt-text) !important;
            font-size: 15px !important;
            line-height: 1.65 !important;
        }
        .comment_area .creator_note .author_text:empty { display: none !important; }
        .comment_area .creator_note .button_see_original {
            grid-column: 1 / -1 !important;
            justify-self: start !important;
            position: relative !important;
            z-index: 1 !important;
            margin: 8px 0 0 !important;
            padding: 0 !important;
            border: 0 !important;
            background: transparent !important;
            color: var(--wt-link) !important;
            font-size: 13px !important;
        }

        /* Comments header: title + count. The count was a small grey chip
           that read as a disabled label; it is now a light glass pill with a
           speech-bubble icon and bold white tabular figures, so "how many
           people are talking" registers at a glance. Green was tried and
           dropped: it stacked on the green login bar right below it. */
        .comment_head {
            display: flex !important;
            align-items: center !important;
            margin: 36px 0 14px !important;
            column-gap: 12px !important;
        }
        .comment_head .title_comments {
            font-size: 20px !important;
            font-weight: 700 !important;
            letter-spacing: .02em !important;
        }
        .comment_head .count {
            display: inline-flex !important;
            align-items: center !important;
            gap: 7px !important;
            margin: 0 !important;
            padding: 6px 13px 6px 11px !important;
            border-radius: 999px !important;
            background: rgba(255,255,255,.09) !important;
            border: 1px solid rgba(255,255,255,.18) !important;
            color: #ffc233 !important;  /* the figure in amber (the user's call); pill and icon stay neutral */
            font-size: 15px !important;
            font-weight: 700 !important;
            line-height: 1 !important;
            letter-spacing: .01em !important;
            font-variant-numeric: tabular-nums !important;
        }
        .comment_head .count::before {
            content: '' !important;
            flex: none !important;
            width: 15px !important;
            height: 15px !important;
            background: var(--wt-text-dim) !important;
            -webkit-mask: var(--wt-bubble-mask) center / contain no-repeat !important;
            mask: var(--wt-bubble-mask) center / contain no-repeat !important;
        }

        /* Composer — rounded field with an accent focus ring. */
        .wcc_Editor__root { background: transparent !important; }
        .wcc_Editor__editor {
            border: 1px solid rgba(255,255,255,.1) !important;
            border-radius: 14px !important;
            overflow: hidden !important;
            transition: border-color .15s ease, box-shadow .15s ease !important;
        }
        .wcc_Editor__editor:focus-within {
            border-color: var(--wt-accent) !important;
            box-shadow: 0 0 0 3px rgba(0,213,100,.15) !important;
        }
        .wcc_Editor__actionBar { border-top: 1px solid rgba(255,255,255,.06) !important; }
        /* Logged in: the composer is a card like the comments panel below
           it (same surface, hairline with a brighter top edge, 16px radius,
           soft shadow): a roomy text area in the comments' reading size, the
           Spoiler switch under it, then the toolbar. Toolbar icons are round
           ghost buttons; the send icon (a disc with the arrow cut out) is
           amber when there is something to send and a faint disc while
           disabled (see the send button below).
           One bottom bar: Spoiler on the left, a divider, the toolbar, and
           send on the right (the site stacked Spoiler on a row of its own
           above the toolbar). Every other child spans the full width; the
           last two share the bottom row. */
        .wcc_Editor__editor:not(:has([contenteditable="false"])) {
            display: grid !important;
            grid-template-columns: auto minmax(0, 1fr) !important;
            background: var(--wt-bg-elev) !important;
            border: 1px solid rgba(255,255,255,.1) !important;
            border-top-color: rgba(255,255,255,.16) !important;
            border-radius: 16px !important;
            box-shadow: 0 12px 32px rgba(0,0,0,.35) !important;
        }
        .wcc_Editor__editor:not(:has([contenteditable="false"])):focus-within {
            border-color: rgba(0,213,100,.7) !important;
            box-shadow: 0 0 0 3px rgba(0,213,100,.15), 0 12px 32px rgba(0,0,0,.35) !important;
        }
        .wcc_Editor__editor:not(:has([contenteditable="false"])) :is(.wcc_Editor__scrollArea, .wcc_Editor__content, .wcc_Editor__spoilerWrapper, .wcc_Editor__actionBar) {
            background: transparent !important;
        }
        .wcc_Editor__editor:not(:has([contenteditable="false"])) .ProseMirror {
            min-height: 56px !important;
            padding: 18px 22px 10px !important;
            color: #eef0f3 !important;
            font-size: 17px !important;
            line-height: 1.6 !important;
            outline: none !important;
        }
        /* The prompt ("Leave a comment.", "Leave a reply."): the muted
           grey read as disabled; a light grey, still clearly a hint. */
        .wcc_Editor__editor:not(:has([contenteditable="false"])) .TextEditor_EditorCore-module__empty::before {
            color: #c3c7ce !important;
            font-size: 17px !important;
        }
        .wcc_Editor__editor:not(:has([contenteditable="false"])) > * { grid-column: 1 / -1 !important; }
        .wcc_Editor__editor:not(:has([contenteditable="false"])) > .wcc_Editor__spoilerWrapper {
            grid-column: 1 !important;
            display: flex !important;
            align-items: center !important;
            padding: 6px 0 6px 20px !important;
            border-top: 1px solid rgba(255,255,255,.07) !important;
        }
        .wcc_Editor__editor:not(:has([contenteditable="false"])) > .wcc_Editor__spoilerWrapper::after {
            content: '' !important;
            width: 1px !important;
            height: 22px !important;
            margin-left: 14px !important;
            background: rgba(255,255,255,.1) !important;
        }
        .wcc_Editor__editor:not(:has([contenteditable="false"])) > .wcc_Editor__actionBar { grid-column: 2 !important; }
        /* Spoiler: a label + a 26x15 switch (a hidden checkbox and a
           slider span), with the label nudged 2px down by WCC and the
           switch boxed by the generic rule, so neither sat on the bar's
           centre line. Now one row, centred: the label, then a 34x20
           switch whose knob slides over and turns the track green. */
        .wcc_Spoiler__root {
            display: inline-flex !important;
            align-items: center !important;
            gap: 10px !important;
            height: 38px !important;
            margin: 0 !important;
        }
        /* Hover: the generic button:hover rule painted a tight grey box
           flush against the label. An even pill around label + switch
           instead (the negative margin keeps the label in line with the
           text above). */
        button.wcc_Spoiler__root {
            box-sizing: border-box !important;
            padding: 0 10px !important;
            margin-left: -10px !important;
            border: 0 !important;
            border-radius: 10px !important;
            background: transparent !important;
            box-shadow: none !important;
            transition: background-color .15s ease !important;
        }
        button.wcc_Spoiler__root:hover { background: rgba(255,255,255,.06) !important; }
        .wcc_Spoiler__root:hover .wcc_Spoiler__text { color: #fff !important; }
        .wcc_Spoiler__text {
            margin: 0 !important;
            color: var(--wt-text-dim) !important;
            font-size: 14px !important;
            font-weight: 600 !important;
            line-height: 1 !important;
        }
        .wcc_Spoiler__switch {
            position: relative !important;
            flex: none !important;
            width: 34px !important;
            height: 20px !important;
            margin: 0 !important;
            background: transparent !important;
            border: 0 !important;
        }
        .wcc_Spoiler__switch input {
            position: absolute !important;
            width: 0 !important;
            height: 0 !important;
            margin: 0 !important;
            opacity: 0 !important;
        }
        .wcc_Spoiler__slider {
            inset: 0 !important;
            border-radius: 999px !important;
            background: rgba(255,255,255,.16) !important;
            box-shadow: inset 0 0 0 1px rgba(255,255,255,.12) !important;
            transition: background-color .2s ease !important;
        }
        .wcc_Spoiler__slider::before {
            top: 3px !important;
            left: 3px !important;
            width: 14px !important;
            height: 14px !important;
            background: #d2d6dc !important;
            box-shadow: 0 1px 3px rgba(0,0,0,.4) !important;
            transition: transform .2s ease, background-color .2s ease !important;
        }
        .wcc_Spoiler__switch input:checked + .wcc_Spoiler__slider { background: #179452 !important; box-shadow: inset 0 0 0 1px var(--wt-key-edge) !important; }
        .wcc_Spoiler__switch input:checked + .wcc_Spoiler__slider::before { transform: translateX(14px) !important; background: #fff !important; }
        .wcc_Editor__editor:not(:has([contenteditable="false"])) .wcc_Editor__actionBar {
            padding: 6px 10px 6px 6px !important;
            border-top: 1px solid rgba(255,255,255,.07) !important;
        }
        .wcc_Editor__actionBar .wcc_Editor__toolbar { display: flex !important; align-items: center !important; gap: 2px !important; }
        .wcc_Editor__actionBar .wcc_Editor__toolbar > button {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            width: 38px !important;
            height: 38px !important;
            padding: 0 !important;
            border: 0 !important;
            border-radius: 50% !important;
            background: transparent !important;
            color: var(--wt-text-dim) !important;
            transition: background-color .15s ease, color .15s ease !important;
        }
        .wcc_Editor__actionBar .wcc_Editor__toolbar > button:hover:not(:disabled),
        .wcc_Editor__actionBar .wcc_Editor__toolbar > button[data-state="open"] {
            background: rgba(255,255,255,.08) !important;
            color: #fff !important;
        }
        .wcc_Editor__actionBar .wcc_Editor__toolbar > button:disabled { opacity: .45 !important; }
        .wcc_Editor__actionBar .TextEditor_SubmitControlPanel-module__button {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            width: 40px !important;
            height: 40px !important;
            padding: 0 !important;
            border: 0 !important;
            border-radius: 50% !important;
            background: transparent !important;
            transition: filter .15s ease, transform .15s ease !important;
        }
        .wcc_Editor__actionBar .TextEditor_SubmitControlPanel-module__button:hover:not(:disabled) {
            filter: brightness(1.1) drop-shadow(0 4px 10px rgba(255,194,51,.35)) !important;
            transform: translateX(1px) !important;
        }
        .wcc_Editor__actionBar .TextEditor_SubmitControlPanel-module__button svg { width: 32px !important; height: 32px !important; }
        /* The send icon's paths carry their own colour classes (WCC's
           green token once there is text to send), so a colour on the
           button never reaches them: they are recoloured here, amber when
           active (the user's call), a faint disc otherwise. */
        .TextEditor_SendIcon-module__background { color: rgba(255,255,255,.16) !important; }
        .TextEditor_SendIcon-module__border { color: rgba(255,255,255,.08) !important; }
        [class*="TextEditor_SendIcon-module__activeBackground"],
        [class*="TextEditor_SendIcon-module__activeBorder"] { color: #ffc233 !important; }
        /* Emoji picker: emoji-mart (forked as <em-gw-emoji-picker>, a shadow
           root) paints from --rgb-* / --color-border custom properties that
           inherit through the shadow boundary; unset, it was a white panel
           inside the dark popover. */
        em-gw-emoji-picker {
            --rgb-background: 34, 38, 43 !important;
            --rgb-color: 230, 230, 230 !important;
            --rgb-input: 42, 46, 53 !important;
            --rgb-accent: 0, 213, 100 !important;
            --color-border: rgba(255,255,255,.08) !important;
            --color-border-over: rgba(255,255,255,.16) !important;
            --shadow: none !important;
        }
        [class*="TextEditor_Popover-module__content"] {
            background: var(--wt-bg-elev) !important;
            border: 1px solid rgba(255,255,255,.1) !important;
            border-radius: 14px !important;
            box-shadow: 0 16px 40px rgba(0,0,0,.55), 0 2px 8px rgba(0,0,0,.35) !important;
        }
        /* GIF search and the series picker (the 4th toolbar button): the
           search field drew two frames (the site's box and the generic
           input rule), the RECENT / SUBSCRIBED tabs were boxed by the
           generic button rule, and the picker's footer was a light strip.
           One rounded search field with a green focus ring, underline
           tabs like Top / Newest, and a footer on the panel's surface. */
        [class*="wcc_ContentTagPopover__content"] {
            overflow: hidden !important;
            background: var(--wt-bg-elev) !important;
            border: 1px solid rgba(255,255,255,.1) !important;
            border-radius: 14px !important;
            box-shadow: 0 16px 40px rgba(0,0,0,.55), 0 2px 8px rgba(0,0,0,.35) !important;
        }
        :is([class*="TextEditor_GifContent-module__inputWrapper"], [class*="wcc_ContentTagContent__inputWrapper"]) {
            box-sizing: border-box !important;
            height: 40px !important;
            background: rgba(255,255,255,.06) !important;
            border: 1px solid rgba(255,255,255,.12) !important;
            border-radius: 10px !important;
            transition: border-color .15s ease, box-shadow .15s ease !important;
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
            padding: 0 12px !important;
        }
        :is([class*="TextEditor_GifContent-module__inputWrapper"], [class*="wcc_ContentTagContent__inputWrapper"]):focus-within {
            border-color: var(--wt-accent) !important;
            box-shadow: 0 0 0 3px rgba(0,213,100,.16) !important;
        }
        :is([class*="TextEditor_GifContent-module__input"], [class*="wcc_ContentTagContent__searchInput"]):not([class*="Wrapper"]):not([class*="Overlay"]) {
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: transparent !important;
            border: 0 !important;
            outline: none !important;
            box-shadow: none !important;
            color: var(--wt-text) !important;
            font-size: 15px !important;
        }
        :is([class*="TextEditor_GifContent-module__searchIcon"], [class*="wcc_ContentTagContent__searchIcon"]) { flex: none !important; margin: 0 !important; color: var(--wt-text-mute) !important; }
        /* The series picker's magnifier is stroked #343434 (invisible on
           dark), which left an empty gap before the placeholder. */
        :is([class*="TextEditor_GifContent-module__searchIcon"], [class*="wcc_ContentTagContent__searchIcon"]) :is(circle, path, line)[stroke] { stroke: currentColor !important; }
        :is([class*="TextEditor_GifContent-module__searchIcon"], [class*="wcc_ContentTagContent__searchIcon"]) path[fill]:not([fill="none"]) { fill: currentColor !important; }
        [class*="wcc_ContentTagTab__root"] { gap: 18px !important; border-bottom: 1px solid rgba(255,255,255,.07) !important; }
        [class*="wcc_ContentTagTab__item"] + [class*="wcc_ContentTagTab__item"] { margin-left: 0 !important; }
        button[class*="wcc_ContentTagTab__button"] {
            height: 36px !important;
            padding: 0 2px !important;
            background: transparent !important;
            border: 0 !important;
            border-radius: 0 !important;
            box-shadow: inset 0 -2px 0 transparent !important;
            color: var(--wt-text-dim) !important;
            font-size: 13px !important;
            font-weight: 700 !important;
            letter-spacing: .06em !important;
            transition: color .15s ease, box-shadow .15s ease !important;
        }
        button[class*="wcc_ContentTagTab__button"]:hover { background: transparent !important; color: #fff !important; }
        button[class*="wcc_ContentTagTab__selected"] { color: #fff !important; box-shadow: inset 0 -2px 0 var(--wt-accent) !important; }
        [class*="wcc_ContentTagContent__indicator"] {
            background: var(--wt-bg-elev) !important;
            border-top: 1px solid rgba(255,255,255,.07) !important;
            color: var(--wt-text-mute) !important;
        }
        [class*="wcc_ContentTagContent__selectedCount"] { color: var(--wt-accent) !important; }
        button[class*="wcc_ContentTagList__button"] { background: transparent !important; border: 0 !important; border-radius: 10px !important; }
        button[class*="wcc_ContentTagList__button"]:hover:not(:disabled) { background: rgba(255,255,255,.06) !important; }
        [class*="wcc_ContentTagList__thumbnail"] { border-radius: 8px !important; }
        [class*="wcc_ContentTagList__title"] { color: var(--wt-text) !important; }
        [class*="wcc_ContentTagList__text"] { color: var(--wt-text-mute) !important; }
        [class*="TextEditor_EmotionToolbar-module__tabTrigger"] { color: var(--wt-text-mute) !important; }
        [class*="TextEditor_EmotionToolbar-module__tabTrigger"][data-state="active"] { color: #fff !important; }
        [class*="TextEditor_EmotionToolbar-module__tabIndicator"] { background-color: var(--wt-accent) !important; }
        /* Logged out, the composer is a read-only box saying "Please log in
           to leave a comment / reply" (its editable area is
           contenteditable=false) — clicking it opens the login. It is an
           inviting call-to-action laid out as an input bar: a green-tinted
           surface, a chat-bubble icon, the site's prompt in light text and
           a round green arrow on the right (the whole bar is the click
           target), a glow on hover, and no empty typing space. Centred
           text in a 1200px box read as a banner; text alone on the left
           left the bar looking empty. */
        .wcc_Editor__editor:has([contenteditable="false"]) {
            cursor: pointer !important;
            border: 1px solid rgba(0,213,100,.3) !important;
            background: linear-gradient(135deg, rgba(0,213,100,.10), rgba(0,213,100,.03)) !important;
            transition: border-color .15s ease, box-shadow .15s ease, background-color .15s ease !important;
            position: relative !important;
            display: flex !important;
            align-items: center !important;
            min-height: 60px !important;
            box-sizing: border-box !important;
            padding: 0 70px 0 54px !important;
        }
        .wcc_Editor__editor:has([contenteditable="false"]) .wcc_Editor__scrollArea,
        .wcc_Editor__editor:has([contenteditable="false"]) .wcc_Editor__content {
            background: transparent !important;
        }
        .wcc_Editor__editor:has([contenteditable="false"])::before {
            content: '' !important;
            position: absolute !important;
            left: 20px !important;
            top: 50% !important;
            width: 20px !important;
            height: 20px !important;
            margin-top: -10px !important;
            background: var(--wt-accent-soft) !important;
            -webkit-mask: var(--wt-bubble-mask) center / contain no-repeat !important;
            mask: var(--wt-bubble-mask) center / contain no-repeat !important;
        }
        .wcc_Editor__editor:has([contenteditable="false"])::after {
            content: '' !important;
            position: absolute !important;
            right: 12px !important;
            top: 50% !important;
            width: 38px !important;
            height: 38px !important;
            margin-top: -19px !important;
            border-radius: 50% !important;
            background: var(--wt-cta-arrow) center / 18px no-repeat, var(--wt-accent) !important;
            box-shadow: 0 4px 14px rgba(0,213,100,.3) !important;
            transition: transform .18s ease, box-shadow .18s ease !important;
        }
        .wcc_Editor__editor:has([contenteditable="false"]):hover::after {
            transform: translateX(3px) !important;
            box-shadow: 0 6px 18px rgba(0,213,100,.45) !important;
        }
        .wcc_Editor__editor:has([contenteditable="false"]) > .wcc_Editor__scrollArea { flex: 1 1 auto !important; }
        /* Spoiler switch + emoji / sticker / GIF / send do nothing until you
           log in — hide them so the box is a single clear prompt. */
        .wcc_Editor__editor:has([contenteditable="false"]) .wcc_Editor__spoilerWrapper,
        .wcc_Editor__editor:has([contenteditable="false"]) .wcc_Editor__actionBar { display: none !important; }
        /* m.webtoons.com's shortened composer has no action bar: WCC puts a
           bare send button straight into the editor, a second (grey) send
           button beside the green arrow. The two-line prompt also overflowed
           the shortened box by a few pixels and showed a scrollbar. */
        .wcc_Editor__editor:has([contenteditable="false"]) > .TextEditor_SubmitControlPanel-module__button { display: none !important; }
        .wcc_Editor__editor:has([contenteditable="false"]) .ProseMirror { overflow: hidden !important; }
        .wcc_Editor__editor:has([contenteditable="false"]) .wcc_Editor__scrollArea,
        .wcc_Editor__editor:has([contenteditable="false"]) .wcc_Editor__content,
        .wcc_Editor__editor:has([contenteditable="false"]) .ProseMirror,
        .wcc_Editor__editor:has([contenteditable="false"]) .ProseMirror p {
            min-height: 0 !important;
            height: auto !important;
            padding: 0 !important;
        }
        /* The reply composer's wrapper has min-height: 9.75rem baked in. */
        .wcc_Editor__replyContainer:has([contenteditable="false"]) { min-height: 0 !important; }
        /* Empty paragraph holds a <br> that adds a blank line under the prompt. */
        .wcc_Editor__editor:has([contenteditable="false"]) .ProseMirror p br { display: none !important; }
        .wcc_Editor__editor:has([contenteditable="false"]) .TextEditor_EditorCore-module__empty::before {
            content: attr(data-placeholder) !important;
            color: var(--wt-text) !important;
            font-weight: 600 !important;
            font-size: 17px !important;
            float: none !important;
            display: block !important;
            height: auto !important;
            padding: 0 !important;
        }
        .wcc_Editor__editor:has([contenteditable="false"]):hover {
            border-color: var(--wt-accent) !important;
            box-shadow: 0 0 0 3px rgba(0,213,100,.14), 0 8px 24px rgba(0,213,100,.10) !important;
        }
        .wcc_Editor__editor:has([contenteditable="false"]):hover .TextEditor_EditorCore-module__empty::before {
            color: #fff !important;
        }
        /* The send button outside an action bar: m.webtoons.com's
           shortened composer renders it bare in the editor, where the
           generic button rule boxed it. */
        .TextEditor_SubmitControlPanel-module__button {
            background: transparent !important;
            border: 0 !important;
            border-radius: 8px !important;
        }

        /* Sort order (TOP / NEWEST): the header strip of the comments panel,
           not a control on its own row. The tabs and the list below are
           siblings, so the tab bar takes the panel's top edge and corners
           and the list its bottom ones; together they read as one card.
           Active tab: white text on a green underline. */
        .wcc_SortOrderTabs__root {
            display: flex !important;
            gap: 22px !important;
            margin: 22px 0 0 !important;
            padding: 0 30px !important;
            background: var(--wt-bg-elev) !important;
            border: 1px solid rgba(255,255,255,.08) !important;
            border-top-color: rgba(255,255,255,.14) !important;
            border-bottom-color: rgba(255,255,255,.07) !important;
            border-radius: 16px 16px 0 0 !important;
        }
        .wcc_SortOrderTabs__root:not(:has(+ .wcc_CommentList__list)) { border-radius: 16px !important; }
        .wcc_SortOrderTab__root,
        .wcc_SortOrderTab__root:hover {
            height: auto !important;
            margin: 0 !important;
            padding: 17px 4px 15px !important;
            background: transparent !important;
            border: 0 !important;
            border-radius: 0 !important;
            box-shadow: inset 0 -3px 0 transparent !important;
            color: var(--wt-text-dim) !important;
            font-size: 17px !important;
            font-weight: 600 !important;
            text-transform: none !important;
            transition: color .15s ease, box-shadow .15s ease !important;
        }
        /* WCC's own active-tab underline (::after). */
        .wcc_SortOrderTab__root::after { display: none !important; }
        .wcc_SortOrderTab__root:hover { color: #fff !important; box-shadow: inset 0 -3px 0 rgba(255,255,255,.18) !important; }
        /* The idle tab is light grey (the muted grey read as disabled), the
           active one white and bold on a 3px green bar. */
        .wcc_SortOrderTab__active,
        .wcc_SortOrderTab__active:hover {
            color: #fff !important;
            font-weight: 700 !important;
            box-shadow: inset 0 -3px 0 var(--wt-accent) !important;
        }

        /* Comments, modelled on asurascans (the reference the user picked):
           one quiet panel holding flat rows split by hairlines. No card per
           comment; only TOP comments get an amber block. Colour appears only
           where it carries meaning: the avatar, a vote you cast, the TOP
           blocks and hover. Each row
           is avatar · name + date · text · small grey icon buttons (votes,
           then Reply). WCC renders no avatar, so tagCommentAvatars() (JS)
           stamps data-wt-initial / data-wt-hue and ::before draws a coloured
           initial: same user, same colour, every time. Flat rows also paint
           cheaper than a shadowed card per comment. */
        .wcc_CommentList__list {
            display: block !important;
            margin-top: 0 !important;
            padding: 4px 30px !important;
            background: var(--wt-bg-elev) !important;
            border: 1px solid rgba(255,255,255,.08) !important;
            border-top: 0 !important;
            border-radius: 0 0 16px 16px !important;
            box-shadow: 0 12px 32px rgba(0,0,0,.35) !important;
            overflow: visible !important;
        }
        .wcc_CommentItem__root {
            background: transparent !important;
            border: 0 !important;
            border-radius: 0 !important;
            margin: 0 !important;
            padding: 24px 0 10px !important;
            box-shadow: none !important;
        }
        .wcc_CommentItem__root + .wcc_CommentItem__root { border-top: 1px solid rgba(255,255,255,.07) !important; }
        /* Top comments (WCC marks them with a TOP badge in the text) are
           amber blocks in the NOTE banner's style: amber wash, hairline and
           a 3px amber left edge. The negative side margin keeps the avatar
           and text where the other rows have them. No hairline next to a
           block: the block's own edge separates it. */
        .wcc_CommentList__list > .wcc_CommentItem__root:has(.wcc_TopBadge__root),
        .wcc_CommentList__list > .wcc_CommentItem__root:has(.wcc_TopBadge__root) + .wcc_CommentItem__root:has(.wcc_TopBadge__root) {
            margin: 12px -16px !important;
            padding: 20px 16px 6px !important;
            border: 1px solid rgba(255,194,51,.26) !important;
            border-radius: 14px !important;
            background: linear-gradient(90deg, rgba(255,194,51,.11), rgba(255,194,51,.025) 70%) !important;
            box-shadow: inset 3px 0 0 #ffc233 !important;
        }
        .wcc_CommentList__list > .wcc_CommentItem__root:has(.wcc_TopBadge__root) + .wcc_CommentItem__root { border-top: 0 !important; }
        /* A top comment's reply thread sits inside its element. With the
           full amber wash it ran through every reply, "More" and the reply
           box; on the plain panel (cut out of the frame) it looked like a
           black hole in the block. It stays inside the amber frame on a
           fainter amber wash than the comment, with a dimmer amber left
           edge, under an amber hairline: part of the TOP block, the
           comment still the brightest thing in it (the user's call). The
           section is stretched to the block's padding edges (root padding
           16px + the text column's 64px; 6px of bottom padding); the left
           padding puts the reply avatars back where they were (70px in). */
        .wcc_CommentList__list > .wcc_CommentItem__root:has(.wcc_TopBadge__root) .wcc_ReplyFolder__root {
            margin: 8px -16px -6px -80px !important;
            padding: 4px 16px 10px 70px !important;
            background: linear-gradient(90deg, rgba(255,194,51,.05), rgba(255,194,51,.012) 70%), var(--wt-bg-elev) !important;
            border-top: 1px solid rgba(255,194,51,.2) !important;
            border-radius: 0 0 13px 13px !important;
            box-shadow: inset 3px 0 0 rgba(255,194,51,.45) !important;
        }
        /* WCC puts the badge inline before the text, so the first line of a
           top comment started 40px right of its other lines; pinned to the
           far right it floated away from everything. It now reads as part
           of the byline: name · TOP · date. The real badge lives in the
           text block, which can't be moved into the header, so the header
           draws the chip (::after; the badge is the SVG word "TOP" in every
           edition that has one) and the original is hidden. Replies are
           never top comments, so :has() only matches the top comment
           itself, and ">" keeps the chip off its replies' headers. The chip
           is the block's own hue with the tone flipped: near-black amber with
           bright amber letters (~10:1) and an amber hairline (a pale amber
           chip melted into the wash; violet vibrated against it). */
        .wcc_CommentBody__badges .wcc_TopBadge__root { display: none !important; }
        .wcc_CommentBody__badges:not(:has(> :not(.wcc_TopBadge__root))) { display: none !important; }
        .wcc_CommentItem__inside:has(.wcc_TopBadge__root) > .wcc_CommentHeader__root > .wcc_CommentHeader__createdAt { order: 2 !important; }
        .wcc_CommentItem__inside:has(.wcc_TopBadge__root) > .wcc_CommentHeader__root::after {
            order: 1 !important;
            content: 'TOP' !important;
            display: inline-flex !important;
            align-items: center !important;
            box-sizing: border-box !important;
            height: 20px !important;
            /* On the shared baseline the 10px caps sat below the name's
               17px caps; this lifts the chip onto their centre line. */
            position: relative !important;
            top: -2px !important;
            padding: 0 8px !important;
            border: 1px solid rgba(255,194,51,.7) !important;
            border-radius: 999px !important;
            background: #1d1704 !important;
            color: #ffc233 !important;
            font-size: 10px !important;
            font-weight: 800 !important;
            line-height: 1 !important;
            letter-spacing: .1em !important;
            box-shadow: 0 1px 4px rgba(0,0,0,.4) !important;
        }
        .wcc_CommentItem__inside {
            position: relative !important;
            padding-left: 64px !important;
            min-height: 50px !important;
        }
        /* Long comments ran right up to the panel's edge. Keep the text
           column clear of the right side, in line with the kebab menu. */
        .wcc_CommentBody__root { padding-right: 40px !important; }
        .wcc_CommentItem__inside[data-wt-initial]::before {
            content: attr(data-wt-initial) !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 48px !important;
            height: 48px !important;
            border-radius: 50% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            font-size: 20px !important;
            font-weight: 700 !important;
            line-height: 1 !important;
            color: #fff !important;
            background: var(--wt-av, #5b6574) !important;
        }
        [data-wt-hue="0"] { --wt-av: #e5484d; }
        [data-wt-hue="1"] { --wt-av: #e8691c; }
        [data-wt-hue="2"] { --wt-av: #b7870c; }
        [data-wt-hue="3"] { --wt-av: #2f9e62; }
        [data-wt-hue="4"] { --wt-av: #0f8f88; }
        [data-wt-hue="5"] { --wt-av: #3b76e0; }
        [data-wt-hue="6"] { --wt-av: #8455e8; }
        [data-wt-hue="7"] { --wt-av: #cc3f93; }

        /* Name · date on one line, kebab menu top-right. */
        .wcc_CommentHeader__root {
            display: flex !important;
            align-items: baseline !important;
            flex-wrap: wrap !important;
            column-gap: 8px !important;
            margin-bottom: 4px !important;
            padding-right: 28px !important;
        }
        .wcc_CommentHeader__identity { padding-right: 0 !important; margin: 0 !important; }
        .wcc_CommentHeader__name {
            color: #fff !important;
            font-weight: 700 !important;
            font-size: 17px !important;
            line-height: 24px !important;
        }
        .wcc_CommentHeader__createdAt {
            font-size: 14px !important;
            line-height: 24px !important;
            color: var(--wt-text-mute) !important;
        }
        /* Kebab (⋮): a round ghost button that stays lit while its menu is
           open (Radix sets data-state="open"). */
        .wcc_CommentOptionMenu__trigger {
            top: 0 !important;
            right: 0 !important;
            border-radius: 50% !important;
            color: var(--wt-text-mute) !important;
            transition: background-color .15s ease, color .15s ease !important;
        }
        .wcc_CommentOptionMenu__trigger:hover,
        .wcc_CommentOptionMenu__trigger[data-state="open"] {
            background: rgba(255,255,255,.1) !important;
            color: #fff !important;
        }
        /* The comment menu (Report / Cancel). Radix markup: one
           [role=menu] panel holding [role=menuitem] divs. The generic popup
           rule boxed the panel AND every item, and the keyboard focus ring
           Radix moves onto the first item added a third frame. Now one
           rounded panel with plain rows; the row under the pointer or the
           keyboard (Radix sets data-highlighted) gets a soft tile with a
           green bar on its left edge instead of an outline (the tile alone
           was 1.3:1 against the panel, too faint to show keyboard focus;
           the bar passes 3:1). The labels are translated, so rows are styled by
           position only: the last one (Cancel) is quieter. Labels are
           centred: a short action list reads as a set of buttons. */
        .wcc_CommentOptionMenu__content {
            min-width: 168px !important;
            padding: 6px !important;
            background: #2a2f36 !important;
            border: 1px solid rgba(255,255,255,.1) !important;
            border-radius: 12px !important;
            box-shadow: 0 16px 40px rgba(0,0,0,.55), 0 2px 8px rgba(0,0,0,.35) !important;
        }
        .wcc_CommentOptionMenu__menu {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            text-align: center !important;
            box-sizing: border-box !important;
            min-height: 40px !important;
            margin: 0 !important;
            padding: 0 12px !important;
            background: transparent !important;
            border: 0 !important;
            border-radius: 8px !important;
            box-shadow: none !important;
            outline: none !important;
            color: var(--wt-text) !important;
            font-size: 15px !important;
            font-weight: 500 !important;
            line-height: 1 !important;
            cursor: pointer !important;
            transition: background-color .12s ease, color .12s ease, box-shadow .12s ease !important;
        }
        /* Cancel is not an action: it sits under a hairline, quieter, so
           the actions read as one group (Report / Block) and the panel
           doesn't look like three unrelated rows. */
        .wcc_CommentOptionMenu__menu:last-child:not(:first-child) {
            position: relative !important;
            margin-top: 11px !important;
            color: var(--wt-text-dim) !important;
        }
        .wcc_CommentOptionMenu__menu:last-child:not(:first-child)::before {
            content: '' !important;
            position: absolute !important;
            top: -6px !important;
            left: 4px !important;
            right: 4px !important;
            height: 1px !important;
            background: rgba(255,255,255,.08) !important;
            pointer-events: none !important;
        }
        .wcc_CommentOptionMenu__menu:hover,
        .wcc_CommentOptionMenu__menu:focus-visible,
        .wcc_CommentOptionMenu__menu[data-highlighted] {
            background: rgba(255,255,255,.12) !important;
            box-shadow: inset 3px 0 0 var(--wt-accent-soft) !important;
            color: #fff !important;
            outline: none !important;
        }
        /* Near-white (#eef0f3, ~15:1 on the panel): the softer
           --wt-text-body read as grey at comment length.
           Long comments: WCC clips the text at 6.5625rem, five of its own
           21px lines. At the theme's 18px / 1.6 that cut through the fifth
           line, so the clip is five of our lines (8em) and follows the
           font size (replies are 17px). Opened ("More" ticks a hidden
           checkbox), it has no limit. */
        .wcc_TextContent__content {
            color: #eef0f3 !important;
            font-size: 18px !important;
            line-height: 1.6 !important;
            max-height: 8em !important;
        }
        .wcc_TextContent__expanded:checked + .wcc_TextContent__content {
            max-height: none !important;
            -webkit-line-clamp: 999 !important;
        }
        /* "More": a small underlined grey label at 13px, glued to the
           clipped text. The theme's green text button, under the text. */
        [class*="wcc_TextContent__more"] {
            display: inline-block !important;
            margin: 6px 0 0 !important;
            color: var(--wt-accent-soft) !important;
            font-size: 15px !important;
            font-weight: 600 !important;
            line-height: 1.4 !important;
            text-decoration: none !important;
        }
        [class*="wcc_TextContent__more"]:hover {
            color: var(--wt-accent) !important;
            text-decoration: underline !important;
            text-underline-offset: 3px !important;
        }
        /* The widget sets Hind, a narrow face that reads cramped on dark.
           The system UI face (Segoe UI on Windows, SF on macOS) is wider
           and covers every script the language editions use. */
        .wcc_App__root,
        .wcc_App__root *,
        .wcc_App__root *::before,
        .wcc_App__root *::after {
            font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
        }
        /* WCC stacks 12px + 10px of bottom margin under the text, which left
           the votes floating 30px below it. */
        .wcc_CommentBody__root,
        .wcc_TextContent__root { margin-bottom: 0 !important; }

        /* Actions under the text, left-aligned: votes first, then Reply.
           Icon + count in grey, no box; hover tints the button (green up,
           red down), and a vote you cast keeps its colour. Both vote buttons
           share a class and differ only by the icon inside, hence :has(). */
        .wcc_CommentItem__action {
            display: flex !important;
            justify-content: flex-start !important;
            align-items: center !important;
            gap: 14px !important;
            padding: 8px 0 14px !important;
            margin: 0 !important;
        }
        .wcc_CommentReaction__root {
            order: -1 !important;
            margin: 0 0 0 -10px !important;
            gap: 2px !important;
        }
        .wcc_CommentReaction__action,
        .wcc_ReplyFolderToggle__root {
            display: inline-flex !important;
            align-items: center !important;
            gap: 6px !important;
            min-height: 34px !important;
            margin: 0 !important;
            padding: 0 10px !important;
            background: transparent !important;
            border: 0 !important;
            border-radius: 8px !important;
            color: #c3c7ce !important;
            font-size: 15px !important;
            font-weight: 600 !important;
            font-variant-numeric: tabular-nums !important;
            transition: background-color .15s ease, color .15s ease !important;
        }
        .wcc_CommentReaction__action svg { width: 17px !important; margin: 0 !important; }
        .wcc_CommentReaction__action svg path { fill: currentColor !important; }
        .wcc_CommentReaction__action:has(.wcc_UpvoteIcon__root):hover,
        [class*="wcc_CommentReaction__active"]:has(.wcc_UpvoteIcon__root) {
            background: rgba(0,213,100,.1) !important;
            color: var(--wt-accent) !important;
        }
        .wcc_CommentReaction__action:has(.wcc_DownvoteIcon__root):hover,
        [class*="wcc_CommentReaction__active"]:has(.wcc_DownvoteIcon__root) {
            background: rgba(240,104,104,.1) !important;
            color: var(--wt-accent-like) !important;
        }
        .wcc_ReplyFolderToggle__root::before {
            content: '' !important;
            width: 16px !important;
            height: 16px !important;
            background: currentColor !important;
            -webkit-mask: var(--wt-bubble-mask) center / contain no-repeat !important;
            mask: var(--wt-bubble-mask) center / contain no-repeat !important;
        }
        .wcc_ReplyFolderToggle__root:hover {
            background: rgba(255,255,255,.06) !important;
            color: var(--wt-accent) !important;
        }
        /* A comment that HAS replies: the toggle is a glass pill (bubble +
           "Replies 5") in white, so a conversation worth opening stands out
           from a plain grey "Reply". A green pill was too loud on the dark
           panel and clashed with the amber top-comment blocks; neutral
           glass sits on both. The button carries only translated text, so
           tagReplyToggles() (JS) stamps the count from its trailing digits. */
        .wcc_ReplyFolderToggle__root[data-wt-replies]:not([data-wt-replies="0"]) {
            margin-left: 4px !important;
            padding: 0 14px 0 12px !important;
            background: rgba(255,255,255,.06) !important;
            border: 1px solid rgba(255,255,255,.14) !important;
            border-radius: 999px !important;
            color: #fff !important;
            font-weight: 700 !important;
        }
        .wcc_ReplyFolderToggle__root[data-wt-replies]:not([data-wt-replies="0"])::before { background: var(--wt-text-dim) !important; }
        .wcc_ReplyFolderToggle__root[data-wt-replies]:not([data-wt-replies="0"]):hover {
            background: rgba(255,255,255,.11) !important;
            border-color: rgba(255,255,255,.28) !important;
            color: #fff !important;
            box-shadow: none !important;
        }
        .wcc_ReplyFolderToggle__root[data-wt-replies]:not([data-wt-replies="0"]):hover::before { background: #fff !important; }

        /* Replies hang off ONE thin rail that drops from under the parent's
           avatar (x = 23px). The reply folder sits in the parent's text
           column (64px in) and is pulled back 10px, so reply avatars start
           just left of the parent's text, like asurascans. Each reply is
           a faint tile (below); no divider, no elbow. */
        .wcc_ReplyFolder__root {
            position: relative !important;
            background: transparent !important;
            border: 0 !important;
            border-radius: 0 !important;
            margin: 0 0 8px -10px !important;
            padding: 0 !important;
        }
        .wcc_CommentItem__inside:has(.wcc_ReplyFolder__root)::after {
            content: '' !important;
            position: absolute !important;
            left: 23px !important;
            top: 58px !important;
            bottom: 14px !important;
            width: 2px !important;
            border-radius: 2px !important;
            background: rgba(255,255,255,.1) !important;
            pointer-events: none !important;
        }
        .wcc_ReplyFolder__root .wcc_CommentList__list {
            margin: 0 !important;
            padding: 0 !important;
            background: transparent !important;
            border: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
        }
        /* Each reply is a barely-there tile (2.5% white, rounded, 8px apart)
           so consecutive replies read as separate messages without boxing
           the thread. The negative left margin keeps the avatar where it
           was; hover lifts the tile a touch. */
        .wcc_ReplyFolder__root .wcc_CommentItem__root,
        .wcc_ReplyFolder__root .wcc_CommentItem__root + .wcc_CommentItem__root {
            margin: 8px 0 0 -14px !important;
            padding: 14px 14px 6px !important;
            border: 0 !important;
            border-radius: 12px !important;
            background: rgba(255,255,255,.025) !important;
            transition: background-color .15s ease !important;
        }
        .wcc_ReplyFolder__root .wcc_CommentItem__root:hover { background: rgba(255,255,255,.045) !important; }
        .wcc_ReplyFolder__root .wcc_CommentItem__inside { padding-left: 54px !important; min-height: 40px !important; }
        .wcc_ReplyFolder__root .wcc_CommentItem__inside[data-wt-initial]::before {
            width: 40px !important;
            height: 40px !important;
            font-size: 17px !important;
        }
        .wcc_ReplyFolder__root .wcc_CommentItem__action { padding: 6px 0 4px !important; }
        .wcc_ReplyFolder__root .wcc_CommentHeader__name { font-size: 16px !important; }
        .wcc_ReplyFolder__root .wcc_TextContent__content { font-size: 17px !important; }
        /* The "└" corner glyphs are redundant next to the thread rail. */
        .wcc_CommentItem__corner,
        .wcc_Editor__bottomLeftCornerIcon { display: none !important; }
        .wcc_ReplyFolder__root .wcc_Editor__replyContainer { margin: 12px 0 0 !important; }
        /* "Show less" — a small grey text button under the thread. */
        .wcc_ReplyUnfold__root {
            text-align: left !important;
            padding: 10px 0 2px !important;
            border: 0 !important;
        }
        .wcc_ReplyUnfold__unfold {
            display: inline-flex !important;
            align-items: center !important;
            gap: 6px !important;
            height: auto !important;
            margin-left: -10px !important;
            padding: 6px 10px !important;
            background: transparent !important;
            border: 0 !important;
            border-radius: 8px !important;
            color: #a3a8b0 !important;
            font-size: 15px !important;
            font-weight: 600 !important;
        }
        .wcc_ReplyUnfold__unfold:hover {
            background: rgba(255,255,255,.06) !important;
            color: var(--wt-accent) !important;
        }
        .wcc_ReplyUnfold__arrow path { fill: currentColor !important; }
        /* "More": a full-width "load more" bar fused to the bottom of the
           comments panel (the list gives up its bottom corners to it), green
           label + chevron, the whole bar a click target. A small button
           floating under the panel read as unrelated and easy to miss. */
        .wcc_CommentList__list:has(+ .wcc_CommentMore__root .wcc_CommentMore__more) {
            border-bottom: 0 !important;
            border-radius: 0 !important;
        }
        .wcc_CommentMore__root { padding: 0 !important; text-align: center !important; }
        .wcc_CommentMore__more {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 8px !important;
            box-sizing: border-box !important;
            width: 100% !important;
            height: 56px !important;
            margin: 0 !important;
            padding: 0 !important;
            background: var(--wt-bg-elev) !important;
            border: 1px solid rgba(255,255,255,.08) !important;
            border-top-color: rgba(255,255,255,.07) !important;
            border-radius: 0 0 16px 16px !important;
            box-shadow: 0 12px 32px rgba(0,0,0,.35) !important;
            color: var(--wt-accent-soft) !important;
            font-size: 16px !important;
            font-weight: 700 !important;
            letter-spacing: .01em !important;
            cursor: pointer !important;
            transition: background-color .15s ease, color .15s ease !important;
        }
        /* The site's thin grey chevron is replaced by a bolder one in the
           label colour. */
        .wcc_CommentMore__more svg { display: none !important; }
        .wcc_CommentMore__more::after {
            content: '' !important;
            width: 18px !important;
            height: 18px !important;
            background: currentColor !important;
            -webkit-mask: var(--wt-ico-chevron-down) center / contain no-repeat !important;
            mask: var(--wt-ico-chevron-down) center / contain no-repeat !important;
            transition: transform .18s ease !important;
        }
        .wcc_CommentMore__more:hover,
        .wcc_CommentMore__more:focus-visible {
            background: linear-gradient(0deg, rgba(0,213,100,.1), rgba(0,213,100,.1)), var(--wt-bg-elev) !important;
            color: var(--wt-accent) !important;
        }
        .wcc_CommentMore__more:hover::after { transform: translateY(2px) !important; }
        /* Inside a reply thread "More" is not the panel's bottom bar: a
           plain green text row on the thread, no frame or shadow. */
        .wcc_ReplyFolder__root .wcc_CommentMore__more {
            height: 44px !important;
            margin: 8px 0 0 -14px !important;
            width: calc(100% + 14px) !important;
            background: transparent !important;
            border: 0 !important;
            border-radius: 12px !important;
            box-shadow: none !important;
            font-size: 15px !important;
        }
        .wcc_ReplyFolder__root .wcc_CommentMore__more:hover,
        .wcc_ReplyFolder__root .wcc_CommentMore__more:focus-visible { background: rgba(0,213,100,.08) !important; }

        /* m.webtoons.com (WCC marks the root .wcc_layout_mobile): the desktop
           geometry above (30px panel padding, a 64px avatar column, a 40px
           right gutter, 18px text) left a 182px text column on a 390px
           phone, about 20 characters a line. Same look, phone-sized: 18px
           panel padding, a 36px avatar, text up to the panel's edge, 16px
           text; replies get 30px avatars and the rail moves under the
           smaller avatar's centre. */
        .wcc_layout_mobile .wcc_SortOrderTabs__root { padding: 0 18px !important; }
        .wcc_layout_mobile .wcc_CommentList__list { padding: 4px 18px !important; }
        .wcc_layout_mobile .wcc_ReplyFolder__root .wcc_CommentList__list { padding: 0 !important; }
        .wcc_layout_mobile .wcc_CommentItem__root { padding: 18px 0 8px !important; }
        .wcc_layout_mobile .wcc_CommentList__list > .wcc_CommentItem__root:has(.wcc_TopBadge__root),
        .wcc_layout_mobile .wcc_CommentList__list > .wcc_CommentItem__root:has(.wcc_TopBadge__root) + .wcc_CommentItem__root:has(.wcc_TopBadge__root) {
            margin: 10px -10px !important;
            padding: 16px 10px 4px !important;
        }
        .wcc_layout_mobile .wcc_CommentItem__inside { padding-left: 46px !important; min-height: 36px !important; }
        .wcc_layout_mobile .wcc_CommentItem__inside[data-wt-initial]::before {
            width: 36px !important;
            height: 36px !important;
            font-size: 16px !important;
        }
        .wcc_layout_mobile .wcc_CommentBody__root { padding-right: 0 !important; }
        .wcc_layout_mobile .wcc_CommentHeader__name { font-size: 16px !important; }
        .wcc_layout_mobile .wcc_CommentHeader__createdAt { font-size: 13px !important; }
        .wcc_layout_mobile .wcc_TextContent__content { font-size: 16px !important; }
        .wcc_layout_mobile .wcc_CommentItem__action { gap: 8px !important; }
        .wcc_layout_mobile .wcc_ReplyFolderToggle__root { white-space: nowrap !important; }
        .wcc_layout_mobile .wcc_CommentItem__inside:has(.wcc_ReplyFolder__root)::after { left: 17px !important; top: 44px !important; }
        .wcc_layout_mobile .wcc_ReplyFolder__root .wcc_CommentItem__root,
        .wcc_layout_mobile .wcc_ReplyFolder__root .wcc_CommentItem__root + .wcc_CommentItem__root {
            margin: 8px 0 0 -10px !important;
            padding: 12px 10px 6px !important;
        }
        .wcc_layout_mobile .wcc_ReplyFolder__root .wcc_CommentItem__inside { padding-left: 40px !important; min-height: 30px !important; }
        .wcc_layout_mobile .wcc_ReplyFolder__root .wcc_CommentItem__inside[data-wt-initial]::before {
            width: 30px !important;
            height: 30px !important;
            font-size: 14px !important;
        }
        .wcc_layout_mobile .wcc_ReplyFolder__root .wcc_CommentHeader__name { font-size: 15px !important; }
        .wcc_layout_mobile .wcc_ReplyFolder__root .wcc_TextContent__content { font-size: 15px !important; }
        .wcc_layout_mobile .wcc_ReplyFolder__root .wcc_CommentMore__more { margin-left: -10px !important; width: calc(100% + 10px) !important; }
        /* A TOP comment's thread still spans the amber block (root padding
           10px + the 46px text column; 4px of bottom padding). */
        .wcc_layout_mobile .wcc_CommentList__list > .wcc_CommentItem__root:has(.wcc_TopBadge__root) .wcc_ReplyFolder__root {
            margin: 8px -10px -4px -56px !important;
            padding: 4px 10px 10px 46px !important;
        }
        .wcc_layout_mobile .wcc_Editor__editor:has([contenteditable="false"]) .TextEditor_EditorCore-module__empty::before { font-size: 15px !important; }

        /* Comment stickers / GIFs: each wrapper holds a SMIL-animated
           loader SVG until its image loads, and those kept Chromium
           restyling and repainting every frame while you read the comic
           far above them. Off screen they are now skipped; WCC sizes every
           wrapper inline, so nothing moves. */
        .wcc_MediaContent__imageWrapper {
            content-visibility: auto !important;
            contain-intrinsic-size: auto 81px !important;
        }

        /* ================================================================
           Reader — rankings row above the comments, comments full width.
           Base: the comments (800px) and a 330px sidebar of two vertical
           ranking lists (Trending & Popular, Top Originals) float side by
           side. Now #_bottomDisplay is a flex column: the sidebar moves
           above the comments (order: -1) as two cards side by side, each a
           row of five cover tiles (the streaming "Top 10" row), and the
           comments take the full 1200px grid. Gated structurally (the
           .aside.viewer child; #_bottomDisplay is that server-rendered
           .cont_box), not on body.wt-viewer, so the layout is right on
           first paint. Only the flex container keeps a :has(): with :has()
           in front of a descendant selector, Chromium restyled ~920
           elements on every comment-area change. Only the reader's sidebar is laid out this way:
           the /canvas rail shares the ranking-card component and stays a
           vertical list.
           ================================================================ */
        .cont_box:has(> .aside.viewer) {
            display: flex !important;
            flex-direction: column !important;
        }
        .cont_box:has(> .aside.viewer)::after { display: none !important; }
        #_bottomDisplay > .aside.viewer {
            order: -1 !important;
            float: none !important;
            width: 100% !important;
            height: auto !important;
            margin: 36px 0 0 !important;
        }
        #_bottomDisplay > .comment_area {
            float: none !important;
            width: auto !important;
            padding: 32px 0 22px !important;
        }
        /* The composer is pinned to 800px by WCC. */
        #_bottomDisplay .wcc_Editor__root { width: auto !important; max-width: none !important; }
        .aside.viewer .ranking_lst.viewer {
            width: 100% !important;  /* base: 330px */
            margin: 0 !important;
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 16px !important;
        }
        .aside.viewer .ranking_lst.viewer > .lst_area {
            min-width: 0 !important;
            padding: 18px 18px 16px !important;
        }
        /* Same header height with or without the genre filter pill, so the
           two rows of covers line up. */
        .aside.viewer .ranking_lst.viewer > .lst_area > .title_area {
            box-sizing: border-box !important;
            min-height: 43px !important;
        }
        .aside.viewer .ranking_lst.viewer .lst_type1 {
            display: grid !important;
            grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
            gap: 12px !important;
            margin: 0 !important;
        }
        .aside.viewer .ranking_lst.viewer .lst_type1 > li + li { margin-top: 0 !important; }
        .aside.viewer .ranking_lst.viewer .lst_type1 > li > a {
            position: relative !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 0 !important;
            padding: 0 !important;
            border-radius: 12px !important;
            background: transparent !important;
        }
        .aside.viewer .ranking_lst.viewer .lst_type1 > li > a:hover { background: transparent !important; }
        .aside.viewer .ranking_lst.viewer .lst_type1 .pic_area {
            width: 100% !important;
            height: auto !important;
            aspect-ratio: 1 !important;
            border-radius: 12px !important;
            box-shadow: 0 6px 16px rgba(0,0,0,.35) !important;
        }
        .aside.viewer .ranking_lst.viewer .lst_type1 .pic_area img { transition: transform .3s ease !important; }
        .aside.viewer .ranking_lst.viewer .lst_type1 > li > a:hover .pic_area img,
        .aside.viewer .ranking_lst.viewer .lst_type1 > li > a:focus-visible .pic_area img { transform: scale(1.06) !important; }
        /* Hover ring drawn over the cover (the pic_area's own ::before is
           the site's hairline). */
        .aside.viewer .ranking_lst.viewer .lst_type1 .pic_area::after {
            content: '' !important;
            position: absolute !important;
            inset: 0 !important;
            z-index: 2 !important;
            border-radius: inherit !important;
            box-shadow: inset 0 0 0 2px transparent !important;
            transition: box-shadow .18s ease !important;
            pointer-events: none !important;
        }
        .aside.viewer .ranking_lst.viewer .lst_type1 > li > a:hover .pic_area::after,
        .aside.viewer .ranking_lst.viewer .lst_type1 > li > a:focus-visible .pic_area::after { box-shadow: inset 0 0 0 2px var(--wt-accent) !important; }
        /* Rank: a solid dark badge on the cover's top-left corner, the same
           for every rank. Green on the top three only made 4 and 5 look like
           a different kind of badge. No backdrop blur: one per cover made
           each its own compositing layer. */
        .aside.viewer .ranking_lst.viewer .lst_type1 .num_area {
            position: absolute !important;
            top: 6px !important;
            left: 6px !important;
            z-index: 3 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            width: auto !important;
            min-width: 24px !important;
            height: 24px !important;
            padding: 0 6px !important;
            box-sizing: border-box !important;
            border-radius: 8px !important;
            background: #14171b !important;
            box-shadow: 0 2px 8px rgba(0,0,0,.4) !important;
        }
        .aside.viewer .ranking_lst.viewer .lst_type1 > li .num_area [class^="ico_n"] {
            filter: none !important;
            color: #fff !important;
            font-size: 13px !important;
            font-weight: 800 !important;
        }
        .aside.viewer .ranking_lst.viewer .lst_type1 .icon_area { left: auto !important; right: 6px !important; top: 6px !important; z-index: 3 !important; }
        .aside.viewer .ranking_lst.viewer .lst_type1 .info_area {
            display: flex !important;
            flex-direction: column !important;
            gap: 2px !important;
            padding: 10px 2px 0 !important;
        }
        .aside.viewer .ranking_lst.viewer .lst_type1 .info_area .genre { font-size: 10px !important; line-height: 14px !important; }
        .aside.viewer .ranking_lst.viewer .lst_type1 .info_area .subj {
            font-size: 14px !important;
            line-height: 18px !important;
            white-space: normal !important;
            display: -webkit-box !important;
            -webkit-box-orient: vertical !important;
            -webkit-line-clamp: 2 !important;
            overflow: hidden !important;
            transition: color .15s ease !important;
        }
        .aside.viewer .ranking_lst.viewer .lst_type1 .info_area .author {
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
        }

        /* CANVAS Weekly round-up — one card on the 1200px grid, like the end
           card and the app banner above it. Base: a full-bleed band with a
           hairline, a loose caption, sprite arrows and grey dots.
           Geometry the carousel JS relies on is untouched: the 1032px
           .challenge_spot_rolling viewport, 188px tiles, 23px gaps. The card
           is 1200px border-box with 84px side padding, so the viewport sits
           exactly in its middle and the 40px disc arrows fit in the margins.
           Tiles keep their title on hover (the base hid it), zoom the cover
           and gain a green ring; a deeper bottom gradient keeps white text
           readable on bright covers. The page dots are pills: the current
           page stretches into a green bar. */
        .viewer .challenge_spot {
            height: auto !important;
            margin: 32px 0 40px !important;
            padding: 0 16px !important;
            border-top: 0 !important;
        }
        .viewer .challenge_spot_inner {
            box-sizing: border-box !important;
            width: 100% !important;
            max-width: 1200px !important;
            margin: 0 auto !important;
            padding: 70px 84px 54px !important;
            background:
                radial-gradient(60% 120% at 0% 0%, rgba(0,213,100,.07), rgba(0,213,100,0) 60%),
                var(--wt-bg-elev) !important;
            border: 1px solid rgba(255,255,255,.08) !important;
            border-top-color: rgba(255,255,255,.14) !important;
            border-radius: 16px !important;
            box-shadow: 0 12px 32px rgba(0,0,0,.35) !important;
        }
        .viewer .challenge_spot_inner h3 {
            display: flex !important;
            align-items: center !important;
            gap: 10px !important;
            left: 84px !important;
            top: 24px !important;
            margin: 0 !important;
            color: var(--wt-text) !important;
            font-size: 20px !important;
            font-weight: 700 !important;
            line-height: 28px !important;
            letter-spacing: .01em !important;
        }
        .viewer .challenge_spot_inner h3::before {
            content: '' !important;
            flex: none !important;
            width: 4px !important;
            height: 20px !important;
            border-radius: 2px !important;
            background: var(--wt-accent) !important;
        }
        .challenge_spot_list a,
        .challenge_spot_list .img_area { border-radius: 12px !important; overflow: hidden !important; }
        .challenge_spot_list .img_area img {
            display: block !important;
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
            transition: transform .35s ease !important;
        }
        .challenge_spot_list a:hover .img_area img,
        .challenge_spot_list a:focus-visible .img_area img { transform: scale(1.07) !important; }
        .challenge_spot_list .skin,
        .challenge_spot_list a:hover .skin {
            background: linear-gradient(to bottom, rgba(0,0,0,0) 38%, rgba(0,0,0,.55) 68%, rgba(0,0,0,.9) 100%) !important;
            opacity: 1 !important;
        }
        /* Hairline + hover ring, drawn above the cover and the gradient. */
        .challenge_spot_list a::after {
            content: '' !important;
            position: absolute !important;
            inset: 0 !important;
            z-index: 40 !important;
            border-radius: inherit !important;
            box-shadow: inset 0 0 0 1px rgba(255,255,255,.1) !important;
            pointer-events: none !important;
            transition: box-shadow .2s ease !important;
        }
        .challenge_spot_list a:hover::after,
        .challenge_spot_list a:focus-visible::after { box-shadow: inset 0 0 0 2px var(--wt-accent) !important; }
        .challenge_spot_list .info_area,
        .challenge_spot_list a:hover .info_area {
            display: block !important;
            left: 14px !important;
            right: 14px !important;
            bottom: 13px !important;
            width: auto !important;
        }
        .challenge_spot_list .info_area .subj {
            color: #fff !important;
            font-size: 16px !important;
            font-weight: 700 !important;
            line-height: 21px !important;
            text-shadow: 0 1px 3px rgba(0,0,0,.6) !important;
            transition: color .15s ease !important;
        }
        .challenge_spot_list a:hover .info_area .subj { color: var(--wt-accent-soft) !important; }
        .challenge_spot_list .info_area .author {
            margin-top: 2px !important;
            color: rgba(255,255,255,.78) !important;
            font-size: 13px !important;
            line-height: 17px !important;
            text-shadow: 0 1px 3px rgba(0,0,0,.6) !important;
        }
        /* Prev / next: 40px dark discs with a border-drawn chevron (see the
           chevron invariant), centred on the 188px tile row. */
        .viewer .challenge_spot_inner .btn_chal_prev,
        .viewer .challenge_spot_inner .btn_chal_next {
            top: 144px !important;
            width: 40px !important;
            height: 40px !important;
            border-radius: 50% !important;
            background: rgba(255,255,255,.06) !important;
            border: 1px solid rgba(255,255,255,.12) !important;
            opacity: 1 !important;
            filter: none !important;
            text-indent: -9999px !important;
            transition: background-color .18s ease, border-color .18s ease, box-shadow .18s ease !important;
        }
        .viewer .challenge_spot_inner .btn_chal_prev { left: 22px !important; }
        .viewer .challenge_spot_inner .btn_chal_next { right: 22px !important; }
        .viewer .challenge_spot_inner .btn_chal_prev::after,
        .viewer .challenge_spot_inner .btn_chal_next::after {
            content: '' !important;
            position: absolute !important;
            top: 50% !important;
            left: 50% !important;
            width: 8px !important;
            height: 8px !important;
            margin: -5px 0 0 -6px !important;
            border-top: 2px solid var(--wt-text) !important;
            border-right: 2px solid var(--wt-text) !important;
            transform: rotate(45deg) !important;
        }
        .viewer .challenge_spot_inner .btn_chal_prev::after {
            margin-left: -3px !important;
            transform: rotate(-135deg) !important;
        }
        .viewer .challenge_spot_inner .btn_chal_prev:hover,
        .viewer .challenge_spot_inner .btn_chal_next:hover,
        .viewer .challenge_spot_inner .btn_chal_prev:focus-visible,
        .viewer .challenge_spot_inner .btn_chal_next:focus-visible {
            background: rgba(0,213,100,.14) !important;
            border-color: rgba(0,213,100,.5) !important;
            box-shadow: 0 0 0 4px rgba(0,213,100,.12) !important;
        }
        .viewer .challenge_spot_inner .btn_chal_prev:hover::after,
        .viewer .challenge_spot_inner .btn_chal_next:hover::after { border-color: var(--wt-accent-soft) !important; }
        .viewer .challenge_spot_inner .paging .num { bottom: 22px !important; column-gap: 6px !important; align-items: center !important; }
        .viewer .challenge_spot_inner .paging .num .ico_pg {
            width: 8px !important;
            height: 8px !important;
            padding: 0 !important;
            border: 0 !important;
            border-radius: 999px !important;
            background: rgba(255,255,255,.22) !important;
            box-shadow: none !important;
            transition: width .25s ease, background-color .2s ease !important;
        }
        .viewer .challenge_spot_inner .paging .num .ico_pg:hover { background: rgba(255,255,255,.45) !important; }
        .viewer .challenge_spot_inner .paging .num .ico_pg[aria-current="true"] {
            width: 24px !important;
            background: var(--wt-accent) !important;
        }

        /* ================================================================
           CANVAS — genre lists (/canvas/list?genreTab=…) and the /canvas
           home, in the theme's card language: one elevated section card
           per block (hairline with a brighter top edge, 16px radius, one
           soft shadow), flat tiles inside, rounded covers that darken on
           hover, and titles that turn green.
           ================================================================ */

        /* Sort: the site's dropdown ("Sort by Date ▾") becomes the same
           segmented switch as the Originals header. The option list is
           shown permanently and the trigger hidden. The site ignores clicks
           while its menu is closed, so a capture-phase listener (JS) reloads
           the list with ?sortOrder=<data-sort>. */
        .sort_area._sorting .checked { display: none !important; }
        .sort_area._sorting .sort_box {
            display: inline-flex !important;
            position: static !important;
            align-items: center !important;
            gap: 2px !important;
            width: auto !important;
            height: auto !important;
            min-width: 0 !important;
            max-height: none !important;
            margin: 0 !important;
            padding: 4px !important;
            overflow: visible !important;
            background: rgba(255,255,255,.05) !important;
            border: 1px solid rgba(255,255,255,.12) !important;
            border-radius: 999px !important;
            box-shadow: none !important;
            animation: none !important;
        }
        .sort_area._sorting .sort_box li { margin: 0 !important; padding: 0 !important; background: transparent !important; }
        .sort_area._sorting .sort_box li a,
        .sort_area._sorting .sort_box li a:hover {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            box-sizing: border-box !important;
            min-width: 150px !important;
            height: 40px !important;
            min-height: 0 !important;
            padding: 0 20px !important;
            border-radius: 999px !important;
            color: var(--wt-text-body) !important;
            font-size: 15px !important;
            font-weight: 600 !important;
            white-space: nowrap !important;
            background: transparent !important;
            box-shadow: none !important;
            transition: background-color .15s ease, color .15s ease !important;
        }
        .sort_area._sorting .sort_box li a:hover { background: rgba(255,255,255,.09) !important; color: #fff !important; }
        .sort_area._sorting .sort_box li a[aria-current="true"],
        .sort_area._sorting .sort_box li a[aria-current="true"]:hover {
            background: rgba(0,213,100,.16) !important;
            color: var(--wt-accent-soft) !important;
            font-weight: 700 !important;
            box-shadow: inset 0 0 0 1px rgba(0,213,100,.5), 0 0 14px rgba(0,213,100,.15) !important;
        }
        .sort_area._sorting .sort_box .ico_chk { display: none !important; }

        /* Genre list grid: one card, flat tiles. */
        .challenge_cont_area {
            padding: 20px !important;
            border: 0 !important;
            border-radius: 16px !important;
            box-shadow: 0 1px 0 rgba(255,255,255,.05), 0 8px 32px rgba(0,0,0,.35) !important;
        }
        /* Genre labels take the per-genre colour (tagGenreLabels() adds the
           .g_* class the /canvas home uses); unknown labels stay muted. */
        .challenge_cont_area a.challenge_item .genre:not([class*="g_"]) { color: var(--wt-text-mute) !important; }
        /* Hover as on the other listing pages: the cover darkens (the
           generic a.challenge_item:hover img rule) and the title turns green. */
        .challenge_cont_area a.challenge_item:hover .subj { color: var(--wt-accent) !important; }

        /* Page layout (1120px): the grid card was 731px with a 77px gap and
           the rail 280px, while the Top CANVAS list inside it was 330px
           (it hung 50px out of the rail) and the banner 312px, so no two
           edges lined up. Now: grid card 800px, 24px gutter, rail 296px,
           and every rail card (banner, Top CANVAS, Up & Coming) exactly
           the rail's width. */
        .cont_box.v2 > .challenge_cont_area {
            width: 800px !important;
            margin: 0 0 24px !important;
        }
        .cont_box.v2 > .aside.challenge { width: 296px !important; }
        /* The banner image is absolutely positioned, so the box needs its
           own square size; the caption is screen-reader text. */
        .aside.challenge .ban_area {
            width: 100% !important;
            height: auto !important;
            aspect-ratio: 1 !important;
            margin-bottom: 16px !important;
            border: 0 !important;
            background: transparent !important;
        }
        .aside.challenge .ban_img,
        .aside.challenge .ban_img a,
        .aside.challenge .ban_img img { width: 100% !important; height: 100% !important; }
        .aside.challenge .ban_area .ban_cont {
            position: absolute !important;
            width: 1px !important;
            height: 1px !important;
            overflow: hidden !important;
            clip-path: inset(50%) !important;
        }
        .aside.challenge .ranking_lst { width: 100% !important; margin: 0 !important; }
        /* 16px between the rail cards, as under the banner: the shared
           ranking-card column already spaced them 12px (gap), and a 16px
           margin on top of that made 28px. */
        .aside.challenge .ranking_lst.viewer { gap: 16px !important; }
        .aside.challenge .lst_area + .lst_area { margin-top: 0 !important; }
        /* Sort: one full-width bar of three equal segments above the grid
           card, instead of a small switch floating over its middle. */
        .challenge_cont_area .sort_area._sorting {
            left: 0 !important;
            right: 0 !important;
            top: -64px !important;
            width: auto !important;
            padding: 0 !important;
        }
        .challenge_cont_area .sort_area._sorting .sort_box {
            display: flex !important;
            width: 100% !important;
            box-sizing: border-box !important;
        }
        .challenge_cont_area .sort_area._sorting .sort_box li { flex: 1 1 0 !important; }
        .challenge_cont_area .sort_area._sorting .sort_box li a,
        .challenge_cont_area .sort_area._sorting .sort_box li a:hover { width: 100% !important; min-width: 0 !important; height: 44px !important; }
        /* Tiles: square cover filling the column, then a meta row (genre
           left, likes right), the title and the author. The base padded
           the genre 19px down from the cover and spaced every line with
           its own padding, which left a dead band under each cover. */
        .challenge_cont_area .challenge_lst > ul { gap: 24px 16px !important; }
        .challenge_cont_area a.challenge_item {
            display: grid !important;
            grid-template-columns: minmax(0, 1fr) auto !important;
            grid-template-areas: "cover cover" "genre stat" "subj subj" "author author" !important;
            align-items: center !important;
            column-gap: 8px !important;
            width: 100% !important;
            height: auto !important;
        }
        .challenge_cont_area a.challenge_item .img_area {
            grid-area: cover !important;
            position: relative !important;
            display: block !important;
            width: 100% !important;
            height: auto !important;
            aspect-ratio: 1 !important;
            margin: 0 0 10px !important;
            border-radius: 12px !important;
            overflow: hidden !important;
            isolation: isolate !important;
            box-shadow: 0 6px 16px rgba(0,0,0,.35) !important;
        }
        .challenge_cont_area a.challenge_item .img_area img {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
            border-radius: 0 !important;
        }
        .challenge_cont_area a.challenge_item .genre {
            grid-area: genre !important;
            min-width: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
            white-space: nowrap !important;
            text-overflow: ellipsis !important;
            font-size: 11px !important;
            font-weight: 700 !important;
            letter-spacing: .06em !important;
            text-transform: uppercase !important;
            line-height: 16px !important;
        }
        .challenge_cont_area a.challenge_item .grade_area {
            grid-area: stat !important;
            display: inline-flex !important;
            align-items: center !important;
            gap: 4px !important;
            margin: 0 !important;
            padding: 0 !important;
            line-height: 16px !important;
        }
        .challenge_cont_area a.challenge_item .grade_area .ico_like3 { margin: 0 !important; }
        .challenge_cont_area a.challenge_item .grade_num {
            margin: 0 !important;
            font-size: 13px !important;
            font-weight: 600 !important;
            font-style: normal !important;
            font-variant-numeric: tabular-nums !important;
        }
        .challenge_cont_area a.challenge_item .subj {
            grid-area: subj !important;
            margin: 4px 0 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
            white-space: nowrap !important;
            text-overflow: ellipsis !important;
            color: #fff !important;
            font-size: 16px !important;
            font-weight: 600 !important;
            line-height: 21px !important;
            transition: color .15s ease !important;
        }
        .challenge_cont_area a.challenge_item .author {
            grid-area: author !important;
            margin: 1px 0 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
            white-space: nowrap !important;
            text-overflow: ellipsis !important;
            color: var(--wt-text-mute) !important;
            font-size: 13px !important;
            line-height: 18px !important;
        }
        .challenge_cont_area .discover_badge_area { top: 8px !important; left: 8px !important; }
        .challenge_cont_area .discover_badge_area .badge_discover {
            display: inline-flex !important;
            align-items: center !important;
            width: auto !important;
            height: 22px !important;
            padding: 0 8px !important;
            border-radius: 999px !important;
            background: #14171b !important;
            border: 1px solid rgba(0,213,100,.45) !important;
            color: var(--wt-accent-soft) !important;
            font-size: 11px !important;
            font-weight: 700 !important;
            line-height: 1 !important;
        }
        /* Rail cards (Top CANVAS / Up & Coming), in the theme's card
           language: a heading behind the green bar like every section
           title, and the rows as the series page's episode tiles (a faint
           surface each, 6px apart, a lighter tile with a green hairline on
           hover). The rank is the reader ranking tiles' dark badge on the
           cover's corner, so the cover moves to the edge and the titles
           get two lines (one line cut most of them). Bare grey numbers in
           a column beside plain rows read as a different, older list. */
        .aside.challenge .ranking_lst.viewer > .lst_area { padding: 16px 12px 12px !important; }
        .aside.challenge .ranking_lst.viewer > .lst_area > .title_area { margin: 0 4px 10px !important; }
        .aside.challenge .ranking_lst.viewer > .lst_area > .title_area h2::before {
            content: '' !important;
            flex: none !important;
            width: 4px !important;
            height: 18px !important;
            margin-right: 8px !important;
            border-radius: 2px !important;
            background: var(--wt-accent) !important;
        }
        /* With the bar, a long genre in the filter pill (HEARTWARMING,
           SUPERNATURAL) cut the title to "Top CANVA". These headers are a
           plain <span>, not a link, so their "›" promised a click that did
           nothing: it goes, and with a tighter pill both fit in the 262px
           header. */
        .aside.challenge .ranking_lst.viewer > .lst_area > .title_area h2 > span ~ .ico_arr1 { display: none !important; }
        .aside.challenge .ranking_lst.viewer > .lst_area > .title_area .sort_area._filterArea .checked {
            padding: 5px 23px 5px 10px !important;
            letter-spacing: .02em !important;
        }
        .aside.challenge .ranking_lst.viewer > .lst_area > .title_area .sort_area._filterArea .checked::after { right: 8px !important; }
        .aside.challenge .ranking_lst.viewer .lst_type1 > li { padding: 0 !important; }
        .aside.challenge .ranking_lst.viewer .lst_type1 > li + li { margin-top: 6px !important; }
        .aside.challenge .ranking_lst.viewer .lst_type1 > li > a {
            position: relative !important;
            gap: 12px !important;
            padding: 8px !important;
            background: rgba(255,255,255,.025) !important;
            transition: background-color .15s ease, box-shadow .15s ease !important;
        }
        .aside.challenge .ranking_lst.viewer .lst_type1 > li > a:hover,
        .aside.challenge .ranking_lst.viewer .lst_type1 > li > a:focus-visible {
            background: rgba(255,255,255,.055) !important;
            box-shadow: inset 0 0 0 1px rgba(0,213,100,.3) !important;
        }
        .aside.challenge .ranking_lst.viewer .lst_type1 .pic_area {
            width: 60px !important;
            height: 60px !important;
            box-shadow: 0 4px 12px rgba(0,0,0,.35) !important;
        }
        .aside.challenge .ranking_lst.viewer .lst_type1 .num_area {
            position: absolute !important;
            top: 11px !important;
            left: 11px !important;
            z-index: 3 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            box-sizing: border-box !important;
            width: auto !important;
            min-width: 20px !important;
            height: 20px !important;
            padding: 0 5px !important;
            border-radius: 6px !important;
            background: #14171b !important;
            box-shadow: 0 2px 6px rgba(0,0,0,.45) !important;
        }
        .aside.challenge .ranking_lst.viewer .lst_type1 .num_area [class^="ico_n"] {
            color: #fff !important;
            font-size: 12px !important;
            font-weight: 800 !important;
        }
        .aside.challenge .ranking_lst.viewer .lst_type1 .info_area .subj {
            display: -webkit-box !important;
            -webkit-box-orient: vertical !important;
            -webkit-line-clamp: 2 !important;
            overflow: hidden !important;
            white-space: normal !important;
            line-height: 19px !important;
        }

        /* Right rail: the promo banner gets the card corners; the genre
           filter pill on Top CANVAS is a green-tinted chip with a chevron
           (it opens a menu), not a grey outline. */
        .aside.challenge .ban_img, .aside.challenge .ban_img img {
            display: block !important;
            border-radius: 16px !important;
            overflow: hidden !important;
        }
        .ranking_lst.viewer .sort_area._filterArea .checked {
            position: relative !important;
            padding: 5px 26px 5px 12px !important;
            background: rgba(0,213,100,.12) !important;
            border: 1px solid rgba(0,213,100,.4) !important;
            color: var(--wt-accent-soft) !important;
            font-size: 11px !important;
            font-weight: 700 !important;
            box-shadow: none !important;
        }
        .ranking_lst.viewer .sort_area._filterArea .checked::after {
            content: '' !important;
            position: absolute !important;
            right: 9px !important;
            top: 50% !important;
            width: 10px !important;
            height: 10px !important;
            margin-top: -5px !important;
            background: currentColor !important;
            -webkit-mask: var(--wt-ico-chevron-down) center / contain no-repeat !important;
            mask: var(--wt-ico-chevron-down) center / contain no-repeat !important;
            transition: transform .15s ease !important;
        }
        .ranking_lst.viewer .sort_area._filterArea .checked[aria-expanded="true"]::after { transform: rotate(180deg) !important; }
        .ranking_lst.viewer .sort_area._filterArea .checked:hover,
        .ranking_lst.viewer .sort_area._filterArea .checked[aria-expanded="true"] {
            background: rgba(0,213,100,.2) !important;
            border-color: rgba(0,213,100,.6) !important;
            color: var(--wt-accent) !important;
            box-shadow: 0 0 0 3px rgba(0,213,100,.1) !important;
        }

        /* /canvas home. The intro line sits on the page instead of a black
           band ("Recommended series" is a card, below). */
        .canvas_guidetext_wrap {
            background: transparent !important;
            border-bottom: 1px solid rgba(255,255,255,.06) !important;
        }
        .canvas_guidetext_wrap .canvas_guidetext { color: var(--wt-text-dim) !important; }
        .discover_spot_inner h3.tit,
        .discover_cont_area h2.tit {
            display: flex !important;
            align-items: center !important;
            gap: 10px !important;
            color: var(--wt-text) !important;
            font-size: 20px !important;
            font-weight: 700 !important;
            letter-spacing: .01em !important;
            text-transform: none !important;
        }
        .discover_spot_inner h3.tit::before,
        .discover_cont_area h2.tit::before {
            content: '' !important;
            flex: none !important;
            width: 4px !important;
            height: 20px !important;
            border-radius: 2px !important;
            background: var(--wt-accent) !important;
        }
        /* "Recommended series" is a section card like Weekly HOT and
           Popular By Category below it: the same 1168px surface, so the
           three blocks share their edges. The carousel viewport keeps its
           1130px width (five 216px tiles + margins, which the flicking JS
           pages by) and sits in the card's 19px side padding, so the tiles
           line up with the 1120px grids below. */
        .discover_spot {
            height: auto !important;
            padding: 24px 0 0 !important;
            overflow: visible !important;
            background: transparent !important;
        }
        /* The site spaces the blocks below 77px down and pulls their
           wrapper up 15px; 24px is the gap between the other cards. */
        .discover_spot + .cont_box.v2 { margin-top: 24px !important; }
        .discover_spot + .cont_box.v2 > .discover_cont_area { margin-top: 0 !important; }
        .discover_spot .discover_spot_inner {
            box-sizing: border-box !important;
            width: 1168px !important;
            max-width: 100% !important;
            height: auto !important;
            margin: 0 auto !important;
            padding: 72px 19px 28px !important;
            background: var(--wt-bg-elev) !important;
            border-radius: 16px !important;
            box-shadow: 0 1px 0 rgba(255,255,255,.05), 0 8px 32px rgba(0,0,0,.35) !important;
        }
        .discover_spot .discover_spot_rolling { margin: 0 !important; }
        .discover_spot .discover_spot_inner h3.tit {
            top: 24px !important;
            left: 24px !important;
            height: 30px !important;
            margin: 0 !important;
            line-height: 30px !important;
        }
        /* Prev, the page dots and next are one pager capsule on the
           header row, opposite the title. 52px discs straddling the card's
           side edges covered the first and last covers and looked pasted
           on (the user asked for a redesign). The site's .paging wraps the
           three in that order, so it becomes the capsule; the buttons are
           round ghosts with a mask chevron that turn green on hover, like
           the theme's other carousel arrows. The flicking JS only listens
           for clicks on the buttons, so moving them is safe. */
        .discover_spot .paging {
            position: absolute !important;
            top: 21px !important;  /* centred on the 30px title row at 24px */
            right: 24px !important;
            left: auto !important;
            z-index: 10 !important;
            display: flex !important;
            align-items: center !important;
            gap: 2px !important;
            box-sizing: border-box !important;
            width: auto !important;
            height: 36px !important;
            padding: 3px !important;
            border-radius: 999px !important;
            background: rgba(255,255,255,.05) !important;
            border: 1px solid rgba(255,255,255,.12) !important;
        }
        .discover_spot .paging .btn_prev,
        .discover_spot .paging .btn_next {
            position: relative !important;
            inset: auto !important;
            flex: none !important;
            width: 28px !important;
            height: 28px !important;
            margin: 0 !important;
            padding: 0 !important;
            border: 0 !important;
            border-radius: 50% !important;
            background: transparent !important;
            box-shadow: none !important;
            filter: none !important;
            color: var(--wt-text-dim) !important;
            font-size: 0 !important;
            transform: none !important;
            cursor: pointer !important;
            transition: background-color .15s ease, color .15s ease !important;
        }
        .discover_spot .paging button.btn_prev::after,
        .discover_spot .paging button.btn_next::after {
            content: '' !important;
            display: block !important;
            position: absolute !important;
            inset: 0 !important;
            margin: auto !important;
            width: 13px !important;
            height: 13px !important;
            background: currentColor !important;
            -webkit-mask: var(--wt-ico-chevron-right) center / contain no-repeat !important;
            mask: var(--wt-ico-chevron-right) center / contain no-repeat !important;
        }
        .discover_spot .paging button.btn_prev::after { transform: rotate(180deg) !important; }
        .discover_spot .paging .btn_prev:hover,
        .discover_spot .paging .btn_next:hover,
        .discover_spot .paging .btn_prev:focus-visible,
        .discover_spot .paging .btn_next:focus-visible {
            background: rgba(0,213,100,.16) !important;
            color: var(--wt-accent-soft) !important;
        }
        .discover_spot .paging .btn_prev:active,
        .discover_spot .paging .btn_next:active { background: rgba(0,213,100,.26) !important; }
        .discover_spot .paging .num {
            position: static !important;
            display: flex !important;
            align-items: center !important;
            gap: 6px !important;
            width: auto !important;
            height: auto !important;
            margin: 0 8px !important;
        }
        .discover_spot .paging .ico_discover_pg {
            width: 8px !important;
            height: 8px !important;
            border-radius: 999px !important;
            background: rgba(255,255,255,.22) !important;
            opacity: 1 !important;
            transition: width .25s ease, background-color .2s ease !important;
        }
        .discover_spot .paging .ico_discover_pg.on,
        .discover_spot .paging .ico_discover_pg[aria-current="true"] { width: 24px !important; background: var(--wt-accent) !important; }

        /* Weekly HOT / Popular By Category: each block is a section card.
           Negative side margins grow the card outwards, so the 6-column grid
           below lines up with the other cards. */
        /* Same surface as the Originals / homepage list cards
           (.webtoon_list_wrap): no outline, a faint top highlight and one
           soft shadow. A visible hairline made these read as a different
           kind of box. */
        .discover_cont_area .weekly_hot_area,
        .discover_cont_area .popular_genre_area {
            position: relative !important;
            margin: 0 -24px 24px !important;
            padding: 24px 24px 28px !important;
            background: var(--wt-bg-elev) !important;
            border: 0 !important;
            border-radius: 16px !important;
            box-shadow: 0 1px 0 rgba(255,255,255,.05), 0 8px 32px rgba(0,0,0,.35) !important;
        }
        /* "more ›": the site pins it to the block's top-right corner, which
           became the card's rounded corner. Inside the padding instead, on
           the heading row (centred on its 30px line), as the same ghost
           pill as the home page's "View all": label, a gap, a border
           chevron that slides on hover, green on hover. */
        .discover_cont_area .popular_genre_area .lk_more {
            position: absolute !important;
            top: 22px !important;
            right: 24px !important;
            display: inline-flex !important;
            align-items: center !important;
            gap: 6px !important;
            box-sizing: border-box !important;
            height: 34px !important;
            padding: 0 14px 0 18px !important;
            border-radius: 999px !important;
            background: rgba(255,255,255,.05) !important;
            border: 1px solid rgba(255,255,255,.14) !important;
            color: var(--wt-text-body) !important;
            font-size: 14px !important;
            font-weight: 600 !important;
            line-height: 1 !important;
            white-space: nowrap !important;
            text-decoration: none !important;
            transition: background-color .15s ease, color .15s ease, border-color .15s ease !important;
        }
        .discover_cont_area .popular_genre_area .lk_more:hover,
        .discover_cont_area .popular_genre_area .lk_more:focus-visible {
            background: rgba(0,213,100,.14) !important;
            border-color: rgba(0,213,100,.55) !important;
            color: var(--wt-accent-soft) !important;
        }
        .discover_cont_area .popular_genre_area .lk_more .ico_arr { margin: 0 !important; }
        .discover_cont_area .popular_genre_area .lk_more .ico_arr::after { transition: transform .15s ease !important; }
        .discover_cont_area .popular_genre_area .lk_more:hover .ico_arr::after { transform: translateX(3px) rotate(45deg) !important; }
        .discover_cont_area .discover_lst li,
        .discover_cont_area a.discover_item,
        .discover_cont_area a.discover_item:hover {
            background: transparent !important;
            border: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            overflow: visible !important;
        }
        .discover_cont_area a.discover_item .img_area {
            position: relative !important;
            display: block !important;
            border-radius: 12px !important;
            overflow: hidden !important;
            isolation: isolate !important;
            box-shadow: 0 6px 16px rgba(0,0,0,.35) !important;
            width: 100% !important;
            height: auto !important;
            aspect-ratio: 178 / 145 !important;
        }

        /* Per-genre colour strip under each cover: the genre label already
           carries the colour, and the strip cut the rounded corners. */
        .discover_cont_area .genre_band { display: none !important; }
        /* Grid: the site floats fixed 178px tiles with 8px gaps and lets
           the row overhang the block by 10px. A 6-column grid with 16px
           gaps fills the card exactly. */
        .discover_cont_area .discover_lst {
            display: grid !important;
            grid-template-columns: repeat(6, minmax(0, 1fr)) !important;
            gap: 22px 16px !important;
            width: auto !important;
            margin: 18px 0 0 !important;
            padding: 0 !important;
        }
        .discover_cont_area .discover_lst::after { content: none !important; }
        /* Popular By Category keeps one list per genre and hides the others
           with an inline display:none; the grid rule must not show them. */
        .discover_cont_area .discover_lst[style*="none"] { display: none !important; }
        .discover_cont_area .discover_lst > li {
            float: none !important;
            width: auto !important;
            height: auto !important;
            margin: 0 !important;
            min-width: 0 !important;
        }
        .discover_cont_area a.discover_item { display: block !important; height: auto !important; }
        .discover_cont_area a.discover_item .img_area img {
            display: block !important;
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
        }
        /* Text block: a meta row (genre on the left, likes on the right)
           over the title. The base gave the title a fixed 138px-wide box
           and the likes their own padded row, so short titles wrapped
           early and every tile carried empty lines. The title now ends the
           tile, so a one-line title leaves no gap and the meta rows still
           line up across the grid. */
        .discover_cont_area a.discover_item .info {
            display: grid !important;
            grid-template-columns: minmax(0, 1fr) auto !important;
            grid-template-areas: "genre stat" "subj subj" !important;
            align-items: center !important;
            column-gap: 8px !important;
            row-gap: 4px !important;
            height: auto !important;
            padding: 10px 2px 0 !important;
        }
        .discover_cont_area a.discover_item .genre {
            grid-area: genre !important;
            min-width: 0 !important;
            overflow: hidden !important;
            white-space: nowrap !important;
            text-overflow: ellipsis !important;
            font-size: 12px !important;
            font-weight: 700 !important;
            line-height: 16px !important;
            letter-spacing: .02em !important;
        }
        .discover_cont_area a.discover_item .subj {
            grid-area: subj !important;
            display: -webkit-box !important;
            -webkit-box-orient: vertical !important;
            -webkit-line-clamp: 2 !important;
            overflow: hidden !important;
            width: auto !important;
            height: auto !important;
            max-height: none !important;
            margin: 0 !important;
            padding: 0 !important;
            color: #fff !important;
            font-size: 15px !important;
            font-weight: 600 !important;
            line-height: 20px !important;
            transition: color .15s ease !important;
        }
        .discover_cont_area a.discover_item:hover .subj { color: var(--wt-accent) !important; }
        .discover_cont_area a.discover_item .grade_area {
            grid-area: stat !important;
            display: inline-flex !important;
            align-items: center !important;
            gap: 4px !important;
            margin: 0 !important;
            padding: 0 !important;
            line-height: 16px !important;
        }
        .discover_cont_area a.discover_item .grade_area .ico_like3 { margin: 0 !important; }
        .discover_cont_area .grade_area,
        .discover_cont_area .grade_num { color: var(--wt-accent) !important; font-style: normal !important; font-weight: 600 !important; }
        .discover_cont_area a.discover_item .grade_num { margin: 0 !important; font-size: 13px !important; font-variant-numeric: tabular-nums !important; }
        /* Subscriber count on the cover: a small dark pill. The base 32px
           circle squeezed "214K" into a coin. */
        .discover_cont_area .discover_badge_area { top: 8px !important; left: 8px !important; }
        .discover_cont_area .discover_badge_area .badge_discover {
            display: inline-flex !important;
            align-items: center !important;
            width: auto !important;
            height: 22px !important;
            padding: 0 8px !important;
            border-radius: 999px !important;
            font-size: 11px !important;
            font-weight: 700 !important;
            line-height: 1 !important;
        }
        /* Subscriber badge on the cover: a solid dark chip, green figures.
           A blurred glass chip on every cover made each its own backdrop
           layer and nearly doubled compositing work while scrolling. */
        .discover_cont_area .badge_discover,
        .discover_spot .badge_discover {
            background: #14171b !important;
            border: 1px solid rgba(0,213,100,.45) !important;
            color: var(--wt-accent-soft) !important;
        }
        /* Status badges on the cover (.txt_ico_completed "END",
           .txt_ico_hiatus pause; /canvas home and lists): 30px white sprite
           discs, glaring next to the dark subscriber chip. Inverted to dark
           discs, the creator profile's END badge treatment; the hue turn
           keeps END green. */
        .discover_badge_area > [class^="txt_ico"] {
            border-radius: 50% !important;
            filter: invert(.9) hue-rotate(180deg) brightness(1.7) saturate(1.6) contrast(1.15) drop-shadow(0 1px 3px rgba(0,0,0,.5)) !important;
        }
        /* Popular By Category genre switch: each genre is a pill in its own
           colour (color-mix off currentColor, so every .g_* hue works); the
           selected one is tinted and ringed. */
        .popular_genre_area h2.tit .bar { display: none !important; }
        .discover_cont_area h2.tit {
            height: 30px !important;
            margin: 0 !important;
            padding: 0 !important;
            line-height: 30px !important;
        }
        /* The category row: the base pulls it 5px up into the heading and
           spaces items with 25px margins; here it is its own row of pills
           between the heading and the covers. */
        .popular_genre_area .genre_menu {
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 6px !important;
            margin: 14px 0 0 -2px !important;
            padding: 0 !important;
        }
        .popular_genre_area .genre_menu li { margin: 0 !important; padding: 0 !important; }
        .popular_genre_area .genre_menu a {
            display: inline-flex !important;
            align-items: center !important;
            height: 32px !important;
            padding: 0 14px !important;
            border-radius: 999px !important;
            font-size: 13px !important;
            font-weight: 700 !important;
            letter-spacing: .04em !important;
            transition: background-color .15s ease, box-shadow .15s ease !important;
        }
        .popular_genre_area .genre_menu a:hover { background: color-mix(in srgb, currentColor 14%, transparent) !important; }
        .popular_genre_area .genre_menu a[aria-selected="true"],
        .popular_genre_area .genre_menu .on a {
            background: color-mix(in srgb, currentColor 18%, transparent) !important;
            box-shadow: inset 0 0 0 1px color-mix(in srgb, currentColor 55%, transparent) !important;
        }

        /* Footer */
        #footer {
            background-color: var(--wt-bg-elev) !important;
            color: var(--wt-text-dim) !important;
            border-top: 1px solid var(--wt-border) !important;
        }
        #footer a { color: var(--wt-text-dim) !important; }
        /* Footer hover. "#footer a" above carries an ID, so it outranked the
           global a:hover and links never reacted. Menu links now brighten
           with a green underline; the separators are soft hairlines. The
           copyright line is an <a> without href — not a link, no hover. */
        #footer .foot_menu > li > a { transition: color .15s ease !important; }
        #footer .foot_menu > li > a:hover,
        #footer .foot_menu > li > a:focus-visible {
            color: var(--wt-text) !important;
            text-decoration: underline !important;
            text-decoration-color: var(--wt-accent) !important;
            text-decoration-thickness: 2px !important;
            text-underline-offset: 5px !important;
        }
        #footer .foot_menu > li + li::before { background-color: rgba(255,255,255,.15) !important; }
        #footer .copyright a, #footer .copyright a:hover { color: var(--wt-text-mute) !important; text-decoration: none !important; }
        /* App-store badges: lift + brighten on hover like the other buttons. */
        #footer .footapp_icon_cont a {
            border-radius: 8px !important;
            transition: transform .18s ease, filter .18s ease, box-shadow .18s ease !important;
        }
        #footer .footapp_icon_cont a:hover,
        #footer .footapp_icon_cont a:focus-visible {
            transform: translateY(-2px) !important;
            filter: brightness(1.15) !important;
            box-shadow: 0 8px 20px rgba(0,0,0,.45) !important;
        }

        /* Footer social links: the sprite glyphs filtered to white turned the
           filled Facebook disc into a blank grey circle, and hover only
           nudged opacity. Same treatment as the share buttons: quiet round
           buttons with one monochrome icon set (masks), filling with the
           network's colour on hover. Pinterest / LINE (other language
           editions) have no mask yet, so they keep the filtered sprite. */
        .btn_foot_pinterest, .btn_foot_line {
            filter: brightness(0) invert(1) opacity(.75) !important;
        }
        .btn_foot_pinterest:hover, .btn_foot_line:hover {
            filter: brightness(0) invert(1) opacity(1) !important;
        }
        #footer .foot_sns { column-gap: 10px !important; }
        #footer .foot_sns a.btn_foot_facebook,
        #footer .foot_sns a.btn_foot_instagram,
        #footer .foot_sns a.btn_foot_twitter,
        #footer .foot_sns a.btn_foot_youtube {
            position: relative !important;
            display: block !important;
            width: 42px !important;
            height: 42px !important;
            box-sizing: border-box !important;
            border-radius: 50% !important;
            background: rgba(255,255,255,.05) !important;
            border: 1px solid rgba(255,255,255,.12) !important;
            color: var(--wt-text-dim) !important;
            font-size: 0 !important;
            text-indent: 0 !important;
            overflow: hidden !important;
            filter: none !important;
            transition: background .18s ease, border-color .18s ease, color .18s ease, transform .18s ease !important;
        }
        #footer .foot_sns a.btn_foot_facebook::before,
        #footer .foot_sns a.btn_foot_instagram::before,
        #footer .foot_sns a.btn_foot_twitter::before,
        #footer .foot_sns a.btn_foot_youtube::before {
            content: '' !important;
            position: absolute !important;
            inset: 0 !important;
            margin: auto !important;
            width: 19px !important;
            height: 19px !important;
            background: currentColor !important;
            -webkit-mask: var(--wt-share) center / contain no-repeat !important;
            mask: var(--wt-share) center / contain no-repeat !important;
        }
        #footer .foot_sns a.btn_foot_facebook  { --wt-share: var(--wt-ico-facebook);  --wt-brand: #1877f2; }
        #footer .foot_sns a.btn_foot_instagram { --wt-share: var(--wt-ico-instagram); --wt-brand: linear-gradient(45deg, #f58529, #dd2a7b 55%, #8134af); }
        #footer .foot_sns a.btn_foot_twitter   { --wt-share: var(--wt-ico-x);         --wt-brand: #000; }
        #footer .foot_sns a.btn_foot_youtube   { --wt-share: var(--wt-ico-youtube);   --wt-brand: #ff0033; }
        #footer .foot_sns a.btn_foot_facebook:hover,
        #footer .foot_sns a.btn_foot_instagram:hover,
        #footer .foot_sns a.btn_foot_twitter:hover,
        #footer .foot_sns a.btn_foot_youtube:hover,
        #footer .foot_sns a.btn_foot_facebook:focus-visible,
        #footer .foot_sns a.btn_foot_instagram:focus-visible,
        #footer .foot_sns a.btn_foot_twitter:focus-visible,
        #footer .foot_sns a.btn_foot_youtube:focus-visible {
            background: var(--wt-brand) !important;
            border-color: transparent !important;
            color: #fff !important;
            transform: translateY(-2px) !important;
        }
        #footer .foot_sns a.btn_foot_twitter:hover,
        #footer .foot_sns a.btn_foot_twitter:focus-visible { border-color: rgba(255,255,255,.3) !important; }

        /* Footer language selector (English ▾ button + dropdown) */
        .foot_menu .language .lk_lang:hover,
        .foot_menu .language .lk_lang[aria-expanded="true"] {
            border-color: var(--wt-accent) !important;
            box-shadow: 0 0 0 3px rgba(0,213,100,.15) !important;
        }
        .foot_menu .language .lk_lang {
            border-radius: 10px !important;
            transition: border-color .15s ease, box-shadow .15s ease !important;
            background: var(--wt-bg-elev) !important;
            border: 1px solid var(--wt-border) !important;
            color: var(--wt-text) !important;
        }
        .foot_menu .language .lk_lang:after {
            border-top-color: var(--wt-text) !important;
        }
        .foot_menu .language .ly_lang {
            background: var(--wt-bg-elev) !important;
            border: 1px solid var(--wt-border) !important;
            box-shadow: 0 0 8px rgba(0,0,0,.5) !important;
        }
        .foot_menu .language .ly_lang li        { background: transparent !important; }
        .foot_menu .language .ly_lang a         { color: var(--wt-text-dim) !important; }
        .foot_menu .language .ly_lang li:hover a,
        .foot_menu .language .ly_lang a[aria-current="true"] {
            color: var(--wt-accent) !important;
        }

        /* Selection: a calm blue tint with white text, the usual dark-UI
           selection. Black text on the neon brand green (the old rule)
           looked harsh, worst on a selected field value. */
        ::selection { background: rgba(84,140,230,.5); color: #fff; }

        /* Cover chips are localized sprite images. "New Series"
           (.badge_new*) is black text on neon green, which shouted over the
           cover art; "New Episode" (.badge_up*) is already green text on a
           dark chip. The text can't be restyled, so the green one is
           recoloured as an image: greyscale + invert swaps the lightness
           (green -> dark, black text -> white), contrast pushes the chip near
           black, then brightness, sepia and saturate tint it gold (see
           below). The same filter on the dark .badge_up* sprite turned it
           light, so it is left as it is. */
        [class^="badge_new"], [class^="badge_up"] {
            opacity: 1 !important;
            border-radius: 4px !important;
            box-shadow: 0 2px 8px rgba(0,0,0,.45) !important;
        }
        /* Gold text on a near-black chip: the same chip shape as "New
           Episode" but its own colour, so the two badges can be told apart
           at a glance (green for both read as one badge). brightness(.62)
           before the tint keeps the gold warm rather than neon. The site's
           box-shadow is dropped and redrawn with drop-shadow() after the
           tint: a box-shadow goes through the filter chain too, and the
           inverted shadow became a bright green glow around the chip. */
        [class^="badge_new"] {
            box-shadow: none !important;
            filter: grayscale(1) invert(1) contrast(3) brightness(.62) sepia(1) saturate(4) drop-shadow(0 2px 6px rgba(0,0,0,.45)) !important;
        }

        /* Floating scroll-to-top button. The sprite is a white disc with a
           dark arrow — a glaring white circle on /canvas (on vignette pages
           it was only dark because body::before painted over it). Invert
           to a dark disc / light arrow (hue-rotate undoes the colour flip of
           the grey shadow ring) and lift it above the vignette layer. */
        .go_top { z-index: 10000 !important; }
        .go_top .btn_top {
            filter: invert(.9) hue-rotate(180deg) !important;
            border-radius: 50% !important;
            transition: filter .15s ease !important;
        }
        .go_top .btn_top:hover { filter: invert(.82) hue-rotate(180deg) !important; }

        /* "Recently viewed" floating bar on the right edge. */
        .recently_area {
            background: var(--wt-bg-elev) !important;
            border-left: 1px solid var(--wt-border) !important;
        }
        /* .menu is the collapsed tab — its white appearance comes from the sprite
           sheet, not the bg PNG. Clear the sprite and draw our own dark pill. */
        .recently_area .menu {
            background-image: none !important;
            background-color: var(--wt-bg-elev) !important;
            border-radius: 8px 0 0 8px !important;
            border: 1px solid var(--wt-border) !important;
            border-right: none !important;
        }
        /* Collapse/expand chevron (← arrow) — dark sprite glyph on white. */
        .recently_area.unfd .ico_recently {
            filter: brightness(0) invert(1) opacity(.7) !important;
        }
        .recently_area .t_recently,
        .recently_area .t_recently2,
        .recently_cont .subj { color: var(--wt-text) !important; }
        .recently_cont .episode { color: var(--wt-text-dim) !important; }
        .recently_cont .bar { background: var(--wt-border) !important; }
        .recently_area.unfd [class$="_line"] { border-left-color: var(--wt-border) !important; }

        /* Mobile login page (m.webtoons.com): .login_sns .btn_sns rows had
           no fill and a #e0e0e0 border. Scoped: m.webtoons.com draws its
           reader share icons as .btn_sns sprites too, and an unscoped
           background wiped them into grey squares. */
        .login_sns .btn_sns {
            background: var(--wt-bg-elev2) !important;
            color: var(--wt-text) !important;
            border: 1px solid var(--wt-border) !important;
        }
        .login_sns .btn_sns:hover {
            background: var(--wt-bg-hover) !important;
        }
        /* Login popup. Markup: .ly_dim._loginDimLayer (the site's own dim
           layer, z-index 2990) + .ly_wrap._loginDimLayer._loginLayer (the
           full-screen layer) > .ly_box._loginComponentParent >
           .login_content_wrap (title_area, ul.sns_list > li.item >
           a.btn_sns, p.cookie_setting_info) + button.button_login_close.
           The .ly_wrap is the one dim, blurred backdrop, so the site's
           .ly_dim is hidden (stacked under it the page sank to ~4%
           brightness while the header stayed at 28%), and the box is one
           dialog card, like the mature-content notice. The Email, Apple and X icons were black
           sprites (invisible on dark) and are redrawn as light masks; Google,
           Facebook and LINE keep their brand-coloured sprites. The labels
           start on one line after the icons (centred labels of different
           lengths left ragged edges), a chevron on the right marks each row
           as a choice, and the title and notes wrap evenly. The words are
           the site's (translated). */
        .ly_dim._loginDimLayer { display: none !important; }
        /* z-index: the header (10000) painted over the backdrop. */
        .ly_wrap._loginLayer {
            z-index: 10002 !important;
            background: rgba(5,6,8,.72) !important;
            -webkit-backdrop-filter: blur(4px) !important;
            backdrop-filter: blur(4px) !important;
            border: 0 !important;
            box-shadow: none !important;
        }
        .ly_wrap._loginLayer ._loginComponentParent,
        .login_wrap .login_content_wrap {
            box-sizing: border-box !important;
            width: 412px !important;
            max-width: calc(100vw - 32px) !important;
            padding: 0 !important;
            background:
                radial-gradient(90% 50% at 50% 0%, rgba(0,213,100,.1), rgba(0,213,100,0) 70%),
                var(--wt-bg-elev) !important;
            border: 1px solid rgba(255,255,255,.1) !important;
            border-top-color: rgba(255,255,255,.18) !important;
            border-radius: 20px !important;
            box-shadow: 0 24px 64px rgba(0,0,0,.6), 0 4px 14px rgba(0,0,0,.35) !important;
            text-align: left !important;
            animation: wt-pop-in .18s ease-out !important;
        }
        .ly_wrap._loginLayer .login_content_wrap {
            box-sizing: border-box !important;
            width: auto !important;
            height: auto !important;
            padding: 44px 32px 28px !important;
            background: transparent !important;
            border: 0 !important;
            box-shadow: none !important;
        }
        /* /member/login (and the dashboard's login redirect) is the same
           markup without the layer: #wrap.login_wrap > #content >
           .login_content_wrap, which is the card there. */
        .login_wrap .login_content_wrap {
            padding: 44px 32px 28px !important;
            margin: auto !important;
        }
        .login_wrap .footer_simple .foot_link .link { color: var(--wt-text-dim) !important; }
        .login_wrap .footer_simple .foot_copyright { color: var(--wt-text-mute) !important; }
        .login_wrap .footer_simple .foot_copyright::before { background-color: rgba(255,255,255,.15) !important; }
        :is(.ly_wrap._loginLayer, .login_wrap) .title_area { margin: 0 0 26px !important; text-align: center !important; }
        :is(.ly_wrap._loginLayer, .login_wrap) .title_area .title {
            margin: 0 !important;
            color: #fff !important;
            font-family: system-ui, -apple-system, "Segoe UI", sans-serif !important;
            font-size: 24px !important;
            font-weight: 700 !important;
            line-height: 30px !important;
            letter-spacing: -.01em !important;
            text-wrap: balance !important;
        }
        :is(.ly_wrap._loginLayer, .login_wrap) .title_area .desc {
            margin: 10px 0 0 !important;
            color: var(--wt-text-body) !important;
            font-size: 15px !important;
            line-height: 1.5 !important;
            text-wrap: balance !important;
        }
        :is(.ly_wrap._loginLayer, .login_wrap) .sns_list {
            display: flex !important;
            flex-direction: column !important;
            gap: 10px !important;
            margin: 0 !important;
            padding: 0 !important;
        }
        :is(.ly_wrap._loginLayer, .login_wrap) .sns_list .item { height: auto !important; margin: 0 !important; padding: 0 !important; }
        :is(.ly_wrap._loginLayer, .login_wrap) .sns_list .btn_sns {
            display: flex !important;
            align-items: center !important;
            gap: 14px !important;
            box-sizing: border-box !important;
            width: 100% !important;
            height: 50px !important;
            margin: 0 !important;
            padding: 0 18px !important;
            border-radius: 12px !important;
            background: rgba(255,255,255,.05) !important;
            border: 1px solid rgba(255,255,255,.12) !important;
            color: var(--wt-text) !important;
            font-size: 15px !important;
            font-weight: 600 !important;
            line-height: 1 !important;
            text-align: left !important;
            text-decoration: none !important;
            transition: background-color .15s ease, border-color .15s ease, color .15s ease !important;
        }
        :is(.ly_wrap._loginLayer, .login_wrap) .sns_list .btn_sns::before {
            position: static !important;
            flex: none !important;
            margin: 0 !important;
        }
        :is(.ly_wrap._loginLayer, .login_wrap) .sns_list .btn_sns:is(._btnLoginEmail, .apple, .twitter)::before {
            width: 22px !important;
            height: 22px !important;
            background: #fff !important;
            -webkit-mask: var(--wt-login-ico) center / 20px no-repeat !important;
            mask: var(--wt-login-ico) center / 20px no-repeat !important;
        }
        :is(.ly_wrap._loginLayer, .login_wrap) .sns_list .btn_sns._btnLoginEmail { --wt-login-ico: var(--wt-ico-mail); }
        :is(.ly_wrap._loginLayer, .login_wrap) .sns_list .btn_sns.apple { --wt-login-ico: var(--wt-ico-apple); }
        :is(.ly_wrap._loginLayer, .login_wrap) .sns_list .btn_sns.twitter { --wt-login-ico: var(--wt-ico-x); }
        :is(.ly_wrap._loginLayer, .login_wrap) .sns_list .btn_sns.twitter::before {
            -webkit-mask-size: 17px !important;
            mask-size: 17px !important;
        }
        :is(.ly_wrap._loginLayer, .login_wrap) .sns_list .btn_sns::after {
            content: '' !important;
            flex: none !important;
            width: 7px !important;
            height: 7px !important;
            margin: 0 4px 0 auto !important;
            border-top: 2px solid currentColor !important;
            border-right: 2px solid currentColor !important;
            color: var(--wt-text-mute) !important;
            transform: rotate(45deg) !important;
            transition: transform .15s ease, color .15s ease !important;
        }
        :is(.ly_wrap._loginLayer, .login_wrap) .sns_list .btn_sns:hover,
        :is(.ly_wrap._loginLayer, .login_wrap) .sns_list .btn_sns:focus-visible {
            background: rgba(255,255,255,.1) !important;
            border-color: rgba(255,255,255,.26) !important;
            color: #fff !important;
        }
        :is(.ly_wrap._loginLayer, .login_wrap) .sns_list .btn_sns:hover::after,
        :is(.ly_wrap._loginLayer, .login_wrap) .sns_list .btn_sns:focus-visible::after {
            color: #fff !important;
            transform: translateX(3px) rotate(45deg) !important;
        }
        :is(.ly_wrap._loginLayer, .login_wrap) .cookie_setting_info {
            margin: 22px 0 0 !important;
            color: var(--wt-text-mute) !important;
            font-size: 12px !important;
            line-height: 1.55 !important;
            text-align: center !important;
            text-wrap: balance !important;
        }
        :is(.ly_wrap._loginLayer, .login_wrap) .cookie_setting_info .link {
            color: var(--wt-accent-soft) !important;
            text-decoration: underline !important;
            text-underline-offset: 2px !important;
        }
        /* Email step (.login_content_wrap.defaultLoginComponent: label +
           .input_box > input per field, Back / Log In, two info links).
           The box kept a 548px min-height (a void under the links), every
           field drew two frames (the box and the generic input rule), the
           eye toggle and the Sign Up chevron were dark sprites, and Log In
           was a grey box. Now: one rounded field per input with a green
           focus ring, a light eye mask (slashed while the password is
           hidden, aria-pressed="false"), Back as glass and Log In as the
           green read button. */
        :is(.ly_wrap._loginLayer, .login_wrap) .login_content_wrap { min-height: 0 !important; color: var(--wt-text) !important; }
        :is(.ly_wrap._loginLayer, .login_wrap) .input_area + .input_area { margin-top: 18px !important; }
        :is(.ly_wrap._loginLayer, .login_wrap) .input_label {
            display: block !important;
            margin: 0 0 8px !important;
            color: var(--wt-text-dim) !important;
            font-size: 12px !important;
            font-weight: 700 !important;
            line-height: 16px !important;
            letter-spacing: .08em !important;
        }
        :is(.ly_wrap._loginLayer, .login_wrap) .input_box {
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
            box-sizing: border-box !important;
            width: auto !important;
            height: 48px !important;
            padding: 0 6px 0 14px !important;
            border-radius: 12px !important;
            background: rgba(255,255,255,.05) !important;
            border: 1px solid rgba(255,255,255,.14) !important;
            transition: border-color .15s ease, box-shadow .15s ease !important;
        }
        :is(.ly_wrap._loginLayer, .login_wrap) .input_box:focus-within {
            border-color: var(--wt-accent) !important;
            box-shadow: 0 0 0 3px rgba(0,213,100,.16) !important;
        }
        :is(.ly_wrap._loginLayer, .login_wrap) .input_box .input {
            flex: 1 1 auto !important;
            width: auto !important;
            min-width: 0 !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: transparent !important;
            border: 0 !important;
            outline: none !important;
            box-shadow: none !important;
            color: var(--wt-text) !important;
            font-size: 15px !important;
        }
        :is(.ly_wrap._loginLayer, .login_wrap) .btn_show {
            position: relative !important;
            flex: none !important;
            width: 34px !important;
            height: 34px !important;
            margin: 0 !important;
            padding: 0 !important;
            border: 0 !important;
            border-radius: 50% !important;
            background: transparent !important;
            color: var(--wt-text-dim) !important;
            transition: background-color .15s ease, color .15s ease !important;
        }
        :is(.ly_wrap._loginLayer, .login_wrap) .btn_show::before {
            content: '' !important;
            position: absolute !important;
            inset: 0 !important;
            margin: auto !important;
            width: 18px !important;
            height: 18px !important;
            background: currentColor !important;
            -webkit-mask: var(--wt-ico-eye-off) center / contain no-repeat !important;
            mask: var(--wt-ico-eye-off) center / contain no-repeat !important;
        }
        :is(.ly_wrap._loginLayer, .login_wrap) .btn_show[aria-pressed="true"]::before {
            -webkit-mask-image: var(--wt-ico-eye) !important;
            mask-image: var(--wt-ico-eye) !important;
        }
        :is(.ly_wrap._loginLayer, .login_wrap) .btn_show:hover,
        :is(.ly_wrap._loginLayer, .login_wrap) .btn_show:focus-visible {
            background: rgba(255,255,255,.1) !important;
            color: #fff !important;
        }
        :is(.ly_wrap._loginLayer, .login_wrap) .txt_warning { margin: 6px 0 0 !important; color: #ff8a8a !important; font-size: 13px !important; }
        :is(.ly_wrap._loginLayer, .login_wrap) .btn_area {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 10px !important;
            margin: 26px 0 0 !important;
            padding: 0 !important;  /* base: 28px on top */
        }
        :is(.ly_wrap._loginLayer, .login_wrap) .login_btn {
            width: auto !important;
            height: 48px !important;
            margin: 0 !important;
            border-radius: 14px !important;
            background: rgba(255,255,255,.06) !important;
            border: 1px solid rgba(255,255,255,.16) !important;
            color: var(--wt-text) !important;
            font-size: 16px !important;
            font-weight: 700 !important;
            transition: background-color .18s ease, border-color .18s ease, box-shadow .18s ease, filter .18s ease !important;
        }
        :is(.ly_wrap._loginLayer, .login_wrap) .login_btn:hover,
        :is(.ly_wrap._loginLayer, .login_wrap) .login_btn:focus-visible {
            background: rgba(255,255,255,.11) !important;
            border-color: rgba(255,255,255,.3) !important;
            color: #fff !important;
        }
        :is(.ly_wrap._loginLayer, .login_wrap) .login_btn.type_green {
            background: var(--wt-key) !important;
            border-color: var(--wt-key-edge) !important;
            color: #fff !important;
            box-shadow: inset 0 1px 0 rgba(255,255,255,.35), 0 8px 20px rgba(0,213,100,.2) !important;
        }
        :is(.ly_wrap._loginLayer, .login_wrap) .login_btn.type_green:hover,
        :is(.ly_wrap._loginLayer, .login_wrap) .login_btn.type_green:focus-visible {
            color: #fff !important;
            box-shadow: inset 0 1px 0 rgba(255,255,255,.4), 0 0 0 4px rgba(0,213,100,.18), 0 12px 28px rgba(0,213,100,.3) !important;
        }
        :is(.ly_wrap._loginLayer, .login_wrap) .info_area {
            margin: 22px 0 0 !important;
            color: var(--wt-text-mute) !important;
            font-size: 14px !important;
            line-height: 20px !important;
            text-align: center !important;
        }
        :is(.ly_wrap._loginLayer, .login_wrap) .info_area .info + .info { margin-top: 8px !important; }
        :is(.ly_wrap._loginLayer, .login_wrap) .info_area .link_pw { color: var(--wt-text-body) !important; }
        :is(.ly_wrap._loginLayer, .login_wrap) .info_area .link_pw:hover { color: #fff !important; text-decoration: underline !important; text-underline-offset: 3px !important; }
        :is(.ly_wrap._loginLayer, .login_wrap) .info_area .link_signup {
            display: inline-flex !important;
            align-items: center !important;
            gap: 6px !important;
            margin-left: 6px !important;
            padding: 0 !important;
            color: var(--wt-accent-soft) !important;
            font-weight: 700 !important;
        }
        :is(.ly_wrap._loginLayer, .login_wrap) .info_area .link_signup::after {
            content: '' !important;
            width: 6px !important;
            height: 6px !important;
            margin: 0 !important;
            background: none !important;
            border-top: 2px solid currentColor !important;
            border-right: 2px solid currentColor !important;
            transform: rotate(45deg) !important;
        }
        :is(.ly_wrap._loginLayer, .login_wrap) .info_area .link_signup:hover { color: var(--wt-accent) !important; }
        :is(.ly_wrap._loginLayer, .login_wrap) .button_login_close {
            top: 16px !important;
            right: 16px !important;
            width: 34px !important;
            height: 34px !important;
            padding: 0 !important;
            border: 0 !important;
            border-radius: 50% !important;
            background: rgba(255,255,255,.06) !important;
            color: var(--wt-text-dim) !important;
            font-size: 0 !important;
            text-indent: 0 !important;
            overflow: hidden !important;
            transition: background-color .15s ease, color .15s ease !important;
        }
        :is(.ly_wrap._loginLayer, .login_wrap) .button_login_close::before {
            content: '' !important;
            position: absolute !important;
            inset: 0 !important;
            margin: auto !important;
            width: 12px !important;
            height: 12px !important;
            background: currentColor !important;
            -webkit-mask: var(--wt-ico-close) center / contain no-repeat !important;
            mask: var(--wt-ico-close) center / contain no-repeat !important;
        }
        :is(.ly_wrap._loginLayer, .login_wrap) .button_login_close:hover,
        :is(.ly_wrap._loginLayer, .login_wrap) .button_login_close:focus-visible {
            background: rgba(255,255,255,.14) !important;
            color: #fff !important;
        }

        /* ================================================================
           Signed-in and sign-up pages that the base CSS paints white: the
           sign-up consent card (.agreement, after a first SNS login), the
           e-mail sign-up form (/member/join: .cont_box2 .inner_wrap >
           .sign_up_area), the account settings and delete pages
           (.account_wrap > .account_area), My Comments (.my_comments) and
           the coin / redeem / invite / collection panels. The theme's text
           colours are light, so on the white boxes the text all but
           vanished. Each box becomes the theme's card; the controls get
           the theme's glass buttons and the green read button.
           ================================================================ */
        .agreement_wrap #container { background: var(--wt-bg) !important; }
        .agreement {
            background:
                radial-gradient(90% 50% at 50% 0%, rgba(0,213,100,.1), rgba(0,213,100,0) 70%),
                var(--wt-bg-elev) !important;
            border: 1px solid rgba(255,255,255,.1) !important;
            border-top-color: rgba(255,255,255,.18) !important;
            border-radius: 20px !important;
            box-shadow: 0 24px 64px rgba(0,0,0,.6), 0 4px 14px rgba(0,0,0,.35) !important;
            animation: wt-pop-in .18s ease-out !important;
        }
        .agreement .title {
            color: #fff !important;
            font-family: system-ui, -apple-system, "Segoe UI", sans-serif !important;
            font-weight: 700 !important;
            text-wrap: balance !important;
        }
        .agreement .description { color: var(--wt-text-body) !important; text-wrap: balance !important; }
        .agreement_box {
            border: 1px solid rgba(255,255,255,.14) !important;
            border-radius: 12px !important;
            background: rgba(255,255,255,.04) !important;
            transition: background-color .15s ease, border-color .15s ease !important;
        }
        .agreement_box:hover { border-color: rgba(255,255,255,.26) !important; }
        .agreement_box:has(input:checked) {
            background: rgba(0,213,100,.1) !important;
            border-color: rgba(0,213,100,.6) !important;
        }
        .agreement_box .label_text { color: var(--wt-text) !important; }
        .agreement_box .link { color: var(--wt-accent-soft) !important; }
        .agreement_box .agreement_expand { color: var(--wt-text-mute) !important; }
        /* The expand chevron is a dark sprite, boxed by the generic button
           rule; it is a light glyph on no box. */
        .agreement_box .button_expand {
            background-color: transparent !important;
            border: 0 !important;
            border-radius: 50% !important;
            filter: invert(1) brightness(.85) !important;
        }
        .agreement_footer .privacy_policy { color: var(--wt-text-mute) !important; }
        .agreement_footer .privacy_policy .link { color: var(--wt-accent-soft) !important; }
        .agreement_footer .button_done {
            border: 1px solid var(--wt-key-edge) !important;
            border-radius: 14px !important;
            background: var(--wt-key) !important;
            color: #fff !important;
            font-weight: 700 !important;
            box-shadow: inset 0 1px 0 rgba(255,255,255,.35), 0 8px 20px rgba(0,213,100,.2) !important;
        }
        .agreement_footer .button_done[disabled] {
            background: rgba(255,255,255,.06) !important;
            border-color: rgba(255,255,255,.12) !important;
            color: var(--wt-text-mute) !important;
            box-shadow: none !important;
        }
        .agreement_footer .link_signup { color: var(--wt-text-dim) !important; }
        .agreement_footer .link_signup:hover { color: #fff !important; }
        .agreement_wrap #footer { background: transparent !important; }
        .agreement_wrap #footer .foot_menu a { color: var(--wt-text-dim) !important; }
        .agreement_wrap #footer .bg_line { background: rgba(255,255,255,.15) !important; }
        .agreement_wrap #footer .copyright { color: var(--wt-text-mute) !important; }

        /* "Thank you, your email address is now verified" (the link in
           the verification e-mail): .login_area > .logo + .loginbox >
           p.loginbox_tx ×2 + .lk_area ×2. Base: a white box, so the
           theme's light text vanished on it. The login card instead, the
           message in white, and the two links as buttons: the first (back
           to WEBTOON) the green key, the second a glass outline. */
        .login_area .loginbox {
            background:
                radial-gradient(90% 50% at 50% 0%, rgba(0,213,100,.1), rgba(0,213,100,0) 70%),
                var(--wt-bg-elev) !important;
            border: 1px solid rgba(255,255,255,.1) !important;
            border-top-color: rgba(255,255,255,.18) !important;
            border-radius: 20px !important;
            box-shadow: 0 24px 64px rgba(0,0,0,.6), 0 4px 14px rgba(0,0,0,.35) !important;
        }
        .login_area .loginbox_tx {
            color: #fff !important;
            font-family: system-ui, -apple-system, "Segoe UI", sans-serif !important;
            font-size: 18px !important;
            line-height: 26px !important;
            white-space: normal !important;
            text-wrap: balance !important;
        }
        .login_area .loginbox_tx:first-child { font-size: 22px !important; font-weight: 700 !important; }
        .login_area .lk_area a {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            box-sizing: border-box !important;
            width: 100% !important;
            height: 48px !important;
            border-radius: 14px !important;
            background: rgba(255,255,255,.06) !important;
            border: 1px solid rgba(255,255,255,.16) !important;
            color: var(--wt-text) !important;
            font-size: 16px !important;
            font-weight: 700 !important;
            line-height: 1 !important;
            text-decoration: none !important;
            transition: background-color .18s ease, border-color .18s ease, box-shadow .18s ease, filter .18s ease !important;
        }
        .login_area .lk_area a:hover,
        .login_area .lk_area a:focus-visible {
            background: rgba(255,255,255,.11) !important;
            border-color: rgba(255,255,255,.3) !important;
            color: #fff !important;
        }
        .login_area .loginbox_tx + .lk_area a {
            background: var(--wt-key) !important;
            border-color: var(--wt-key-edge) !important;
            color: #fff !important;
            box-shadow: inset 0 1px 0 rgba(255,255,255,.35), 0 8px 20px rgba(0,213,100,.2) !important;
        }
        .login_area .loginbox_tx + .lk_area a:hover,
        .login_area .loginbox_tx + .lk_area a:focus-visible {
            box-shadow: inset 0 1px 0 rgba(255,255,255,.4), 0 0 0 4px rgba(0,213,100,.18), 0 12px 28px rgba(0,213,100,.3) !important;
        }

        /* E-mail sign-up form (/member/join). Underlined fields: the
           generic input rule boxed them into dark bars. */
        .cont_box2 .tit { color: #fff !important; font-weight: 700 !important; }
        .cont_box2 .inner_wrap,
        .account_area {
            background: var(--wt-bg-elev) !important;
            border: 1px solid rgba(255,255,255,.08) !important;
            border-top-color: rgba(255,255,255,.14) !important;
            border-radius: 16px !important;
            box-shadow: 0 12px 32px rgba(0,0,0,.35) !important;
        }
        .sign_up_area .sub_tit { color: var(--wt-text-dim) !important; }
        .cont_box2 .placeholder { color: var(--wt-text-mute) !important; }
        .cont_box2 .input_area .input_box,
        .account_area .input_account {
            background: transparent !important;
            border: 0 !important;
            border-bottom: 1px solid rgba(255,255,255,.16) !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            outline: none !important;
            color: var(--wt-text) !important;
            transition: border-color .15s ease !important;
        }
        .cont_box2 .input_area .input_box:focus,
        .account_area .input_account:focus { border-bottom-color: var(--wt-accent) !important; }
        .cont_box2 .warning_txt, .account_area .email_warning,
        .account_area .login_info .txt_warning { color: #ff8a8a !important; }
        .sign_up_area .consent_area .chk_area .lb_chkbox { color: var(--wt-text-dim) !important; }
        .sign_up_area .consent_area .chk_area .lb_chkbox::before { background-color: transparent !important; filter: invert(1) brightness(.8) !important; }
        .sign_up_area .consent_area .dsc_area,
        .sign_up_area .consent_area .txt_short_notice,
        .sign_up_area .txt_agree, .sign_up_area .txt_marketing { color: var(--wt-text-dim) !important; }
        .sign_up_area .consent_area a,
        .sign_up_area .txt_agree a, .sign_up_area .txt_marketing a,
        .account_area .lk_detail, .account_area .link,
        .account_area .email_description .link { color: var(--wt-accent-soft) !important; }
        .sign_up_area .consent_area .dsc_area .dsc_agree { color: #ff8a8a !important; }
        .cont_box2 .btn_type9 {
            border: 1px solid var(--wt-key-edge) !important;
            border-radius: 14px !important;
            background: var(--wt-key) !important;
            color: #fff !important;
            font-weight: 700 !important;
        }
        .cont_box2 .btn_type9.disabled {
            background: rgba(255,255,255,.06) !important;
            border-color: rgba(255,255,255,.12) !important;
            color: var(--wt-text-mute) !important;
        }
        .sign_up_area .bg_line { background: rgba(255,255,255,.1) !important; }
        .sign_up_area .bg_line .line_txt { background: var(--wt-bg-elev) !important; color: var(--wt-text-mute) !important; }
        .cont_box2 .footer_simple .foot_link .link { color: var(--wt-text-dim) !important; }
        .cont_box2 .footer_simple .foot_copyright { color: var(--wt-text-mute) !important; }

        /* Account settings / delete (/account). Section titles get the
           theme's heading (green bar, bold); the text in the cards is
           readable (the toggle labels were #848484 / #000); the sprite
           toggles become switches; the login icon is a dark disc. */
        .account_wrap h2, .account_wrap h3 { color: #fff !important; }
        .account_wrap .account_tit {
            display: flex !important;
            align-items: center !important;
            gap: 10px !important;
            padding: 44px 0 14px !important;
            font-size: 20px !important;
            font-weight: 700 !important;
            letter-spacing: .01em !important;
        }
        .account_wrap .account_tit::before {
            content: '' !important;
            flex: none !important;
            width: 4px !important;
            height: 20px !important;
            border-radius: 2px !important;
            background: var(--wt-accent) !important;
        }
        .account_wrap .account_tit .ico_info3 { margin: 0 !important; filter: invert(.8) !important; }
        .account_area { color: var(--wt-text) !important; font-size: 17px !important; }
        .account_area .default_txt,
        .account_area .login_info .user_area { color: #fff !important; }
        .account_area .noti_area,
        .account_area .noti_area + .noti_area { border-top-color: rgba(255,255,255,.08) !important; }
        .noti_area .txt { color: #e4e7eb !important; font-size: 16px !important; }
        .noti_area li:first-child .txt { color: #fff !important; font-weight: 600 !important; }
        /* Toggles (.btn_lineset, .on = enabled): sprite pills drawn for
           white. A switch: grey track with a light knob, green when on. */
        /* The knob is a background layer, not a pseudo-element: the
           toggle didn't render a ::before (no knob showed), and a
           background-position transition slides it. */
        .btn_lineset {
            box-sizing: border-box !important;
            width: 46px !important;
            height: 26px !important;
            margin-top: 2px !important;
            padding: 0 !important;
            border: 1px solid rgba(255,255,255,.16) !important;
            border-radius: 999px !important;
            -webkit-appearance: none !important;
            appearance: none !important;
            background-color: rgba(255,255,255,.12) !important;
            background-image: radial-gradient(circle closest-side, #e6e6e6 90%, rgba(230,230,230,0) 100%) !important;
            background-size: 20px 20px !important;
            background-repeat: no-repeat !important;
            background-position: 2px 50% !important;
            box-shadow: none !important;
            font-size: 0 !important;
            text-indent: 0 !important;
            cursor: pointer !important;
            transition: background-position .2s ease, background-color .2s ease, border-color .2s ease !important;
        }
        .btn_lineset.on {
            background-color: #179452 !important;
            background-position: 22px 50% !important;
            border-color: var(--wt-key-edge) !important;
        }
        .btn_lineset:hover { border-color: rgba(255,255,255,.32) !important; }
        .btn_lineset.on:hover { border-color: var(--wt-accent-soft) !important; }
        /* Ads Settings: the toggle is pinned to the right of its label's
           inline box, so it floated in the middle of the row. The label
           becomes a full-width block, which puts it at the row's end. */
        .account_area .txt:has(> .btn_lineset) { display: block !important; position: relative !important; }
        /* Login icon: the sprite is a 72px white disc. A dark glass disc
           with the network's mark. */
        .account_area :is(.ico_google, .ico_email, .ico_twitter) {
            box-sizing: border-box !important;
            width: 60px !important;
            height: 60px !important;
            margin: 6px 0 0 6px !important;
            border-radius: 50% !important;
            background: var(--wt-login-mark) center / 26px no-repeat, rgba(255,255,255,.06) !important;
            border: 1px solid rgba(255,255,255,.12) !important;
        }
        .account_area .ico_google { --wt-login-mark: var(--wt-logo-google); }
        .account_area .ico_email { --wt-login-mark: var(--wt-logo-mail); }
        .account_area .ico_twitter { --wt-login-mark: var(--wt-logo-x); }
        .account_area .button_group { align-items: center !important; }
        /* As wide as the cards above it, so it closes the page instead of
           hanging off the left edge. */
        .account_wrap .lk_delete {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            box-sizing: border-box !important;
            width: 100% !important;
            height: 52px !important;
            margin: 28px 0 0 !important;
            padding: 0 16px !important;
            border-radius: 16px !important;
            background: rgba(240,104,104,.05) !important;
            border: 1px solid rgba(240,104,104,.3) !important;
            color: #ff8a8a !important;
            font-size: 15px !important;
            font-weight: 600 !important;
            text-decoration: none !important;
            transition: background-color .15s ease, border-color .15s ease !important;
        }
        .account_wrap .lk_delete:hover { background: rgba(240,104,104,.12) !important; border-color: rgba(240,104,104,.6) !important; color: #ffa3a3 !important; }
        /* Help text (the e-mail consent note, nickname tips, the ads note)
           was the muted grey at 14px: hard to read in a block of three
           lines. The dim grey, a size up, with roomier leading. */
        .account_area .placeholder,
        .account_area .input_box .placeholder,
        .account_area .nickname_tip,
        .account_area .nickname_available,
        .account_area .nickname_error,
        .account_area .email_description,
        .account_area .edit_email_area .txt_warning,
        .account_area .ad_setting_desc { color: var(--wt-text-dim) !important; }
        .account_area :is(.email_description, .ad_setting_desc, .nickname_tip) {
            font-size: 15px !important;
            line-height: 1.6 !important;
            text-wrap: pretty !important;
        }
        .account_area .input_account {
            color: #fff !important;
            font-size: 17px !important;
            font-weight: 500 !important;
        }
        .account_area .ad_setting_desc { border-top-color: rgba(255,255,255,.08) !important; }
        .account_area .delete_form_dsc { color: var(--wt-text) !important; }
        .account_area .delete_form_dsc [class^="ico_chkbox"] { background-color: transparent !important; filter: invert(1) brightness(.8) !important; }
        .account_area .delete_info li::before { background: var(--wt-text-mute) !important; }
        .account_area .alert_area { border-color: rgba(255,255,255,.14) !important; }
        .account_area :is(.add_btn, .change_btn, .delete_btn, .edit_btn, .check_btn, .join_btn, .verify_btn, .register_btn),
        .account_area .edit_button_area .edit_button,
        .account_area .btn_account2 {
            background: rgba(255,255,255,.06) !important;
            border: 1px solid rgba(255,255,255,.16) !important;
            border-radius: 999px !important;
            color: var(--wt-text) !important;
            transition: background-color .15s ease, border-color .15s ease, color .15s ease !important;
        }
        /* Small row buttons (Edit, Delete, Redeem): 34px pills, label
           centred (the base set a 33px line in a 32px box). */
        .account_area :is(.add_btn, .change_btn, .delete_btn, .edit_btn, .check_btn, .join_btn, .verify_btn, .register_btn, .save_btn) {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            box-sizing: border-box !important;
            width: auto !important;
            min-width: 76px !important;
            height: 34px !important;
            padding: 0 16px !important;
            font-size: 14px !important;
            font-weight: 600 !important;
            line-height: 1 !important;
        }
        /* The site swaps buttons with an inline display (nickname: "Check
           for availability" until the name checks out, then Save, both at
           the same spot); the inline-flex above showed both, stacked. */
        .account_area :is(.add_btn, .change_btn, .delete_btn, .edit_btn, .check_btn, .join_btn, .verify_btn, .register_btn, .save_btn, .lk_patreon)[style*="none"] { display: none !important; }
        .account_area .delete_btn:hover { background: rgba(240,104,104,.12) !important; border-color: rgba(240,104,104,.5) !important; color: #ff8a8a !important; }
        /* Connect with Patreon: the site's solid coral pill had a dark
           sprite logo and link-coloured text. Here it is the coral outline
           of the Patreon panels elsewhere (fills on hover), with a Patreon
           mark. */
        .account_area .lk_patreon {
            display: inline-flex !important;
            align-items: center !important;
            gap: 8px !important;
            height: 36px !important;
            padding: 0 18px 0 14px !important;
            border-radius: 999px !important;
            background: rgba(243,94,54,.12) !important;
            border: 1px solid rgba(255,122,89,.5) !important;
            color: #ffb39e !important;
            font-weight: 600 !important;
            line-height: 1 !important;
            text-decoration: none !important;
            transition: background-color .18s ease, border-color .18s ease, color .18s ease, box-shadow .18s ease !important;
        }
        .account_area .lk_patreon::before {
            position: static !important;
            flex: none !important;
            width: 14px !important;
            height: 14px !important;
            background: currentColor !important;
            -webkit-mask: var(--wt-ico-patreon) center / contain no-repeat !important;
            mask: var(--wt-ico-patreon) center / contain no-repeat !important;
        }
        .account_area .lk_patreon:hover,
        .account_area .lk_patreon:focus-visible {
            background: #f35e36 !important;
            border-color: #f35e36 !important;
            color: #fff !important;
            box-shadow: 0 0 0 4px rgba(243,94,54,.18), 0 8px 22px rgba(243,94,54,.28) !important;
        }
        /* Redeem your Free Coins: coins are gold, so the amber key (the
           profile page's Follow), not a grey pill. */
        .account_area .register_btn {
            background: linear-gradient(180deg, #ffd666, #ffbb1f) !important;
            border-color: rgba(255,194,51,.95) !important;
            color: #2a1d00 !important;
            font-weight: 700 !important;
            box-shadow: inset 0 1px 0 rgba(255,255,255,.4), 0 6px 16px rgba(255,194,51,.18) !important;
        }
        .account_area .register_btn:hover {
            background: linear-gradient(180deg, #ffd666, #ffbb1f) !important;
            border-color: #ffd666 !important;
            color: #2a1d00 !important;
            filter: brightness(1.06) !important;
            box-shadow: inset 0 1px 0 rgba(255,255,255,.45), 0 0 0 4px rgba(255,194,51,.2), 0 10px 24px rgba(255,194,51,.26) !important;
        }
        .account_area :is(.add_btn, .change_btn, .edit_btn, .check_btn, .join_btn, .verify_btn):hover,
        .account_area .edit_button_area .edit_button:hover,
        .account_area .btn_account2:not(.disabled):hover {
            background: rgba(255,255,255,.11) !important;
            border-color: rgba(255,255,255,.3) !important;
            color: #fff !important;
        }
        .account_area :is(.check_btn, .verify_btn)[disabled],
        .account_area .btn_account2.disabled { color: var(--wt-text-mute) !important; background: rgba(255,255,255,.03) !important; }
        .account_area [class^="btn_account"] { border-radius: 14px !important; }
        .account_area .save_btn,
        .account_area .btn_account1 {
            border: 1px solid var(--wt-key-edge) !important;
            background: var(--wt-key) !important;
            color: #fff !important;
            font-weight: 700 !important;
        }

        /* My page lists (/mycreator "Following creators", subscriptions):
           the counts were #000 and the dividers #e0e0e0 on the dark page,
           and the generic button rule boxed Edit into a dim grey square.
           Readable figures, hairlines, and Edit / Delete / Cancel as the
           theme's glass pills. */
        .my_wrap .creator_info .nickname { color: #fff !important; }
        .my_wrap .creator_info .etc strong { color: var(--wt-text-dim) !important; }
        .my_wrap .creator_info .etc strong span,
        .my_wrap .my_count strong { color: #fff !important; font-weight: 700 !important; }
        .my_wrap .creator_info .etc strong:after { background: rgba(255,255,255,.18) !important; }
        .my_wrap .my_count { color: var(--wt-text-dim) !important; }
        .my_list .item { border-bottom-color: rgba(255,255,255,.08) !important; }
        .my_list .link .info .subj .num,
        .my_list .link .info .update { color: var(--wt-text-dim) !important; }
        .my_list .link .image_wrap:after,
        .my_wrap .profile:after { border-color: rgba(255,255,255,.1) !important; }
        .my_wrap .profile_wrap .alert_new { box-shadow: 0 0 0 2px var(--wt-bg) !important; }
        .my_wrap .creator_loading_fail,
        .my_wrap .creator_loading_fail .button_refresh { color: var(--wt-text-dim) !important; }
        .my_wrap .sub_title_wrap button,
        .my_wrap .right .edit {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            box-sizing: border-box !important;
            height: 34px !important;
            min-width: 72px !important;
            padding: 0 16px !important;
            border-radius: 999px !important;
            background: rgba(255,255,255,.06) !important;
            border: 1px solid rgba(255,255,255,.16) !important;
            color: var(--wt-text) !important;
            font-size: 14px !important;
            font-weight: 600 !important;
            line-height: 1 !important;
            transition: background-color .15s ease, border-color .15s ease, color .15s ease !important;
        }
        .my_wrap .sub_title_wrap button:hover,
        .my_wrap .sub_title_wrap button:focus-visible,
        .my_wrap .right .edit:hover {
            background: rgba(255,255,255,.11) !important;
            border-color: rgba(255,255,255,.3) !important;
            color: #fff !important;
        }
        /* The site shows Edit and Select All by edit mode
           (.my_wrap.edit_mode); the pill's inline-flex above showed both
           all the time, which stacked Edit over Unsubscribe and pushed
           the page title up against the sub-nav line. */
        .my_wrap.edit_mode .right .edit,
        .my_wrap:not(.edit_mode) .link_select_all { display: none !important; }
        /* Hover: the row dims a little, so it reads as a link. */
        .my_list .link { transition: opacity .15s ease !important; }
        .my_list .link:hover { opacity: .75 !important; }
        .my_wrap .sub_title_wrap .edit_area { align-items: center !important; gap: 8px !important; }
        .my_wrap .sub_title_wrap .edit_area .bar { display: none !important; }
        .my_wrap .sub_title_wrap .edit_area .cancel { color: var(--wt-text-dim) !important; }
        /* Select All and the row checks were 24px sprites, hard to hit.
           A check circle drawn with a mask (30px in Select All, 36px on
           the rows) that turns green when ticked; Select All and the
           edit-mode buttons are 44px pills. */
        .my_wrap .sub_title_wrap button.link_select_all {
            gap: 10px !important;
            height: 44px !important;
            min-width: 0 !important;
            padding: 0 18px 0 7px !important;
            background: rgba(255,255,255,.06) !important;
            border: 1px solid rgba(255,255,255,.16) !important;
            font-size: 16px !important;
            font-weight: 700 !important;
        }
        .my_wrap .sub_title_wrap .edit_area button {
            height: 44px !important;
            min-width: 104px !important;
            padding: 0 22px !important;
            font-size: 16px !important;
            font-weight: 700 !important;
        }
        .my_wrap .ico_chk3 {
            position: relative !important;
            box-sizing: border-box !important;
            width: 30px !important;
            height: 30px !important;
            margin: 0 !important;
            border-radius: 50% !important;
            background: transparent !important;
            border: 2px solid rgba(255,255,255,.38) !important;
            color: rgba(255,255,255,.55) !important;
            transition: background-color .15s ease, border-color .15s ease, color .15s ease !important;
        }
        .my_list .ico_chk3 { width: 36px !important; height: 36px !important; margin-left: auto !important; }
        .my_wrap .ico_chk3::before {
            content: '' !important;
            position: absolute !important;
            inset: 0 !important;
            margin: auto !important;
            width: 60% !important;
            height: 60% !important;
            background: currentColor !important;
            -webkit-mask: var(--wt-ico-check) center / contain no-repeat !important;
            mask: var(--wt-ico-check) center / contain no-repeat !important;
        }
        .my_wrap .sub_title_wrap button.link_select_all:hover .ico_chk3,
        .my_list .check_area .label_check:hover .ico_chk3 { border-color: rgba(255,255,255,.7) !important; color: #fff !important; }
        .my_wrap .sub_title_wrap button.link_select_all[aria-checked="true"] .ico_chk3,
        .my_list .check_area input[type="checkbox"]:checked + .label_check .ico_chk3 {
            background: #179452 !important;
            border-color: var(--wt-accent-soft) !important;
            color: #fff !important;
            box-shadow: 0 0 0 4px rgba(0,213,100,.15) !important;
        }

        /* My Comments (/mycomment). Markup per item: a.link >
           .my_comment_name (the episode commented on) · .my_comment_text
           (.type_reply when it answers someone, a "└" sprite) ·
           .my_comment_date, then .my_comment_button_wrap (like /
           dislike / delete, sprite icons on boxed white buttons). Base: a
           white sheet. Now one card holding the comments as tiles, two to a
           row: full-width rows of mostly short comments left the 1200px
           card two-thirds empty (the user's call). Each tile is the series
           page's episode tile (a faint surface, a lighter one on hover):
           the episode as a bold title that turns green on hover, the
           comment in the comments' 18px near-white text, the date, and at
           the tile's foot the votes as green / red stat chips with Delete
           as a red trash button at the right (details below). Tiles in a
           row share a height and keep their foot on the bottom edge. */
        .my_comments {
            padding: 20px !important;
            background: var(--wt-bg-elev) !important;
            border: 1px solid rgba(255,255,255,.08) !important;
            border-top-color: rgba(255,255,255,.14) !important;
            border-radius: 16px !important;
            box-shadow: 0 12px 32px rgba(0,0,0,.35) !important;
            overflow: hidden !important;
        }
        .my_comments ul:has(> .my_comment_item) {
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 12px !important;
            margin: 0 !important;
            padding: 0 !important;
        }
        .my_comments .my_comment_item {
            display: flex !important;
            flex-direction: column !important;
            min-width: 0 !important;
            padding: 18px 20px 16px !important;
            background: rgba(255,255,255,.03) !important;
            border: 1px solid rgba(255,255,255,.07) !important;
            border-radius: 14px !important;
            transition: background-color .15s ease, border-color .15s ease !important;
        }
        .my_comments .my_comment_item:hover {
            background: rgba(255,255,255,.05) !important;
            border-color: rgba(255,255,255,.12) !important;
        }
        .my_comments .my_comment_item > .my_comment_button_wrap { margin-top: auto !important; padding-top: 14px !important; }
        .my_comments .my_comment_item + .my_comment_item { border-top-color: rgba(255,255,255,.07) !important; }
        .my_comments .my_comment_reply_item,
        .my_comments .my_comment_reply_button { border-top-color: rgba(255,255,255,.07) !important; }
        .my_comments .my_comment_name,
        .my_comments :is(.my_comment_reply_name_text, .my_comment_writer_name) { color: #fff !important; }
        .my_comments .my_comment_name {
            font-size: 17px !important;
            font-weight: 700 !important;
            line-height: 26px !important;
            transition: color .15s ease !important;
        }
        .my_comments .my_comment_item .link:hover .my_comment_name { color: var(--wt-accent) !important; }
        .my_comments :is(.my_comment_text, .my_comment_reply_text) {
            color: #eef0f3 !important;
            font-size: 18px !important;
            line-height: 1.6 !important;
        }
        .my_comments .my_comment_text { margin-top: 4px !important; }
        /* A reply: the site's "└" is a dark sprite. A border-drawn corner
           in the muted grey instead. */
        .my_comments .my_comment_text.type_reply { text-indent: 22px !important; }
        .my_comments .my_comment_text.type_reply::before,
        .my_comments .my_comment_reply_item::before {
            width: 9px !important;
            height: 9px !important;
            background: none !important;
            border-left: 2px solid var(--wt-text-mute) !important;
            border-bottom: 2px solid var(--wt-text-mute) !important;
            border-bottom-left-radius: 3px !important;
        }
        .my_comments .my_comment_text.type_reply::before { top: 6px !important; left: 2px !important; }
        .my_comments .my_comment_text.type_blinded,
        .my_comments .my_comment_item.type_language_unable :is(.my_comment_name, .my_comment_text, .my_comment_date) { color: var(--wt-text-mute) !important; }
        .my_comments :is(.my_comment_date, .my_comment_reply_date) {
            margin-top: 6px !important;
            color: var(--wt-text-mute) !important;
            font-size: 14px !important;
        }
        .my_comments :is(.my_comment_writer_text, .my_comment_tag_writer) { color: var(--wt-text-mute) !important; }
        .my_comments .my_comment_button_text_more {
            margin-top: 6px !important;
            color: var(--wt-accent-soft) !important;
            font-size: 15px !important;
            font-weight: 600 !important;
            text-decoration: none !important;
        }
        .my_comments .my_comment_button_text_more:hover { color: var(--wt-accent) !important; text-decoration: underline !important; }
        .my_comments :is(.my_comment_writer_wrap, .my_comment_reply_wrap, .my_comment_tag) { background-color: rgba(255,255,255,.04) !important; border-radius: 12px !important; }
        .my_comment_tag_title { color: var(--wt-text) !important; }
        .my_comments .my_comment_image_area { border-radius: 12px !important; }
        .my_comments .my_comment_image_area::before { border-color: rgba(255,255,255,.08) !important; }
        .my_comments .my_comment_writer_react .writer_thumbnail_area { border-color: var(--wt-bg-elev) !important; }
        .my_comments .my_comment_reply_creator { color: var(--wt-accent) !important; }
        .my_comments .my_comment_button_wrap {
            gap: 8px !important;
            margin: 14px 0 0 !important;
        }
        .my_comments .my_comment_reply_item .my_comment_button_wrap { margin-top: 10px !important; }
        .my_comments .my_comment_writer_react.type_like,
        .my_comments .my_comment_button.type_like,
        .my_comments .my_comment_button.type_dislike { margin-left: 0 !important; }
        .my_comments .my_comment_button {
            gap: 6px !important;
            height: 34px !important;
            padding: 0 10px !important;
            background: transparent !important;
            border: 0 !important;
            border-radius: 8px !important;
            color: #c3c7ce !important;
            font-size: 15px !important;
            font-weight: 600 !important;
            font-variant-numeric: tabular-nums !important;
            transition: background-color .15s ease, color .15s ease !important;
        }
        .my_comments .my_comment_button::before {
            flex: none !important;
            width: 17px !important;
            height: 17px !important;
            margin: 0 !important;
            background: currentColor !important;
            -webkit-mask: var(--wt-mc-ico) center / contain no-repeat !important;
            mask: var(--wt-mc-ico) center / contain no-repeat !important;
        }
        .my_comments .my_comment_button.type_like { --wt-mc-ico: var(--wt-ico-thumb-up); }
        .my_comments .my_comment_button.type_dislike { --wt-mc-ico: var(--wt-ico-thumb-down); }
        .my_comments .my_comment_button:disabled,
        .my_comments .my_comment_button.unable_alert { color: rgba(255,255,255,.25) !important; background: transparent !important; }
        /* The counts are what this page is for: how your comment landed.
           Likes and dislikes are stat chips (green / red, bold figures),
           also when the buttons are disabled on your own comment (which
           greyed them out). Delete is a clear red button at the row's
           end that fills on hover. */
        .my_comments .my_comment_button:is(.type_like, .type_dislike),
        .my_comments .my_comment_button:is(.type_like, .type_dislike):is(:disabled, .unable_alert, :hover) {
            gap: 8px !important;
            height: 38px !important;
            padding: 0 14px 0 12px !important;
            border-radius: 999px !important;
            font-size: 17px !important;
            font-weight: 800 !important;
            letter-spacing: .01em !important;
        }
        .my_comments .my_comment_button:is(.type_like, .type_dislike)::before { width: 18px !important; height: 18px !important; }
        .my_comments .my_comment_button.type_like,
        .my_comments .my_comment_button.type_like:is(:disabled, .unable_alert) {
            background: rgba(0,213,100,.12) !important;
            border: 1px solid rgba(0,213,100,.4) !important;
            color: var(--wt-accent-soft) !important;
        }
        .my_comments .my_comment_button.type_dislike,
        .my_comments .my_comment_button.type_dislike:is(:disabled, .unable_alert) {
            background: rgba(240,104,104,.1) !important;
            border: 1px solid rgba(240,104,104,.38) !important;
            color: #ff9a9a !important;
        }
        .my_comments .my_comment_button:is(.type_like, .type_dislike):is(:disabled, .unable_alert) { cursor: default !important; }
        .my_comments .my_comment_button.type_like:not(:disabled):not(.unable_alert):hover { background: rgba(0,213,100,.2) !important; color: var(--wt-accent) !important; }
        .my_comments .my_comment_button.type_dislike:not(:disabled):not(.unable_alert):hover { background: rgba(240,104,104,.18) !important; color: #ffb0b0 !important; }
        /* A vote you cast (the site's aria-pressed): a stronger fill and a
           ring with a soft glow in the chip's colour, like the pager's
           current page. It used to differ from an uncast vote by one shade. */
        .my_comments .my_comment_button.type_like[aria-pressed="true"] {
            background-color: rgba(0,213,100,.22) !important;
            border-color: var(--wt-accent) !important;
            box-shadow: 0 0 0 1px var(--wt-accent), 0 0 12px rgba(0,213,100,.25) !important;
        }
        .my_comments .my_comment_button.type_dislike[aria-pressed="true"] {
            background-color: rgba(240,104,104,.22) !important;
            border-color: #ff8a8a !important;
            box-shadow: 0 0 0 1px #ff8a8a, 0 0 12px rgba(240,104,104,.25) !important;
        }
        .my_comments .my_comment_button.type_delete {
            --wt-mc-ico: var(--wt-ico-trash);
            justify-content: center !important;
            margin-left: auto !important;
            padding: 0 !important;
            width: 38px !important;
            height: 38px !important;
            border-radius: 12px !important;
            background: rgba(240,104,104,.1) !important;
            border: 1px solid rgba(240,104,104,.45) !important;
            color: #ff8a8a !important;
        }
        .my_comments .my_comment_button.type_delete::before { width: 18px !important; height: 18px !important; }
        .my_comments .my_comment_button.type_delete:not(:disabled):hover,
        .my_comments .my_comment_button.type_delete:focus-visible {
            background: #d64545 !important;
            border-color: #e85a5a !important;
            color: #fff !important;
            box-shadow: 0 0 0 4px rgba(240,104,104,.18), 0 6px 16px rgba(214,69,69,.3) !important;
        }
        .my_comments .my_comment_button.type_delete:disabled { opacity: .4 !important; }
        .my_comments .my_comment_reply_button { color: var(--wt-text-dim) !important; }
        .my_comments .my_comment_button_list_more {
            background: transparent !important;
            border-top: 1px solid rgba(255,255,255,.07) !important;
            color: var(--wt-accent-soft) !important;
        }

        /* Coin shop, redeem, invite, collections and the reader's small
           popups: the same white boxes, given the card surface. */
        .my_coin_content .my_coin_area, .buy_coin_content .coin_package_list .item,
        .payment_information_content .payment_information, .transaction_history_content .transaction_history_list,
        .transaction_history_content .transaction_history_none, .redeem_wrap .redeem_area, .invite_wrap .invite_area,
        .invite_friends_content, .multi_collection_cont, .multi_collection_item, .collections_link,
        .month_promo .month_promo_box, .month_promo .month_promo_redeem_box, .month_promo .month_promo_center_box,
        .creators101_end_list_wrap, .ly_translatemore .ly_cont .inner, .ly_viewer_report, .ly_viewer_report_done,
        .pop_upload .upload_cont, .sel_bx.bg_wh, .history_area .sort_box {
            background: var(--wt-bg-elev) !important;
            border-color: rgba(255,255,255,.1) !important;
        }
        .redeem_wrap .input_redeem, .month_promo .month_promo_redeem_box .redeem_code_area {
            background: var(--wt-bg-input) !important;
            border-color: rgba(255,255,255,.14) !important;
        }
        .ly_redeem_free_coin .redeem_code_select_area .redeem_code_list,
        .ly_invoice_information .information_area .select_group .select_list,
        .ly_invoice_information .information_area .autocomplete_list {
            background: var(--wt-bg-elev2) !important;
            border-color: rgba(255,255,255,.12) !important;
        }

        /* ================================================================
           CANVAS Creator Dashboard (/<lang>/creators/…: series, analytics,
           comments, …). Its own stylesheet (creators-*.css) paints from
           design tokens (--background-*, --foreground-*, --line-*) declared
           light on :root AND on every ::before / ::after, so the tokens are
           re-declared dark in all three places, gated on
           html[data-wt-dashboard], which the script sets at document-start
           on /<lang>/creators/ pages. (An html:has(.logo_dashboard) gate
           made Chromium restyle the whole page on every DOM change, on
           every page.) The theme's generic button / input rules boxed every
           control here (dropdown triggers, text fields, the back arrow), so
           inside the dashboard buttons drop that box and keep only the
           site's own fills. The icons are dark sprites drawn for white:
           they are inverted to light.
           ================================================================ */
        html[data-wt-dashboard],
        html[data-wt-dashboard] ::before,
        html[data-wt-dashboard] ::after {
            --background-primary-default: #22262b;
            --background-primary-container-1: #2c313a;
            --background-primary-container-2: #30353c;
            --background-secondary-default: #22262b;
            --background-secondary-container-1: #2c313a;
            --background-secondary-container-2: #30353c;
            --background-tertiary-default: #22262b;
            --background-tertiary-container-1: #2c313a;
            --background-tertiary-container-2: #30353c;
            --background-interactive-disabled-primary: #4a5360;
            --background-interactive-disabled-secondary: #2a2e35;
            --background-interactive-primary: #00d564;
            --background-interactive-secondary: #e6e6e6;
            --background-interactive-tertiary: #3a414b;
            --background-inverted-primary: #e6e6e6;
            --background-inverted-secondary: #c3c7ce;
            --foreground-primary: #e6e6e6;
            --foreground-secondary: #d2d6dc;
            --foreground-tertiary: #b5b9c0;
            --foreground-quaternary: #878e99;
            --foreground-disabled-primary: #6b7380;
            --foreground-disabled-secondary: #59616d;
            --foreground-disabled-tertiary: #878e99;
            --foreground-inverted-primary: #15171a;
            --foreground-inverted-secondary: #2a2e35;
            --line-primary: rgba(255,255,255,.12);
            --line-secondary: rgba(255,255,255,.06);
            --line-interactive-secondary: #e6e6e6;
            --line-alpha-8: rgba(255,255,255,.08);
            --line-alpha-10: rgba(255,255,255,.1);
            --line-alpha-15: rgba(255,255,255,.15);
            --feature-superlike-container: #3a1d27;
            --feature-information-container: #1a2540;
            --specific-placeholder-default: rgba(255,255,255,.04);
            --specific-search-blue-gray: #2a2e35;
        }
        html[data-wt-dashboard] #container,
        html[data-wt-dashboard] .full_error { background: var(--wt-bg) !important; }
        html[data-wt-dashboard] .sidebar_wrap { background: var(--wt-bg-elev) !important; }
        html[data-wt-dashboard] .content_box {
            border: 1px solid rgba(255,255,255,.08) !important;
            border-radius: 14px !important;
            box-shadow: 0 8px 24px rgba(0,0,0,.25) !important;
        }
        /* Empty-state illustrations are drawn on white: rounded like the cards. */
        html[data-wt-dashboard] .content_box.type_empty::before { border-radius: 16px !important; }
        /* "DASHBOARD" next to the CANVAS logo is a black wordmark. */
        html[data-wt-dashboard] .header_inner .logo_dashboard { filter: invert(1) !important; }
        html[data-wt-dashboard] #wrap button:not(.link_login),
        html[data-wt-dashboard] dialog button {
            border: 0 !important;
            background-color: transparent !important;
            color: inherit !important;
        }
        html[data-wt-dashboard] #wrap .button.type_green,
        html[data-wt-dashboard] #wrap .sidebar .button.type_green {
            background: var(--wt-key) !important;
            color: #fff !important;
            font-weight: 600 !important;
            border-radius: 10px !important;
        }
        html[data-wt-dashboard] #wrap .button.type_black { background-color: #e6e6e6 !important; color: #15171a !important; border-radius: 10px !important; }
        html[data-wt-dashboard] #wrap .button.type_gray { background-color: #3a414b !important; color: var(--wt-text) !important; border-radius: 10px !important; }
        html[data-wt-dashboard] #wrap .button:disabled,
        html[data-wt-dashboard] #wrap .button[aria-disabled="true"] { background: #2a2e35 !important; color: #6b7380 !important; }
        html[data-wt-dashboard] #wrap .form_dropdown .input_button { color: var(--foreground-quaternary) !important; }
        html[data-wt-dashboard] #wrap .form_dropdown .input_button.is_selected { color: var(--wt-text) !important; }
        html[data-wt-dashboard] .form_text .input_text {
            border: 0 !important;
            background: transparent !important;
            box-shadow: none !important;
            outline: none !important;
        }
        html[data-wt-dashboard] .form_text { border-radius: 10px !important; background: rgba(255,255,255,.03) !important; }
        html[data-wt-dashboard] .form_dropdown { border-radius: 10px !important; background: rgba(255,255,255,.03) !important; }
        html[data-wt-dashboard] .form_list .thumbnail_wrap .thumbnail_item .thumbnail_input_label {
            background: rgba(255,255,255,.06) !important;
            border-color: rgba(255,255,255,.16) !important;
            color: var(--wt-text-dim) !important;
            border-radius: 8px !important;
        }
        /* Dark sprite icons, inverted to light. A ticked checkbox is a green
           sprite, so only the empty one is inverted. */
        /* Pseudo-elements can't go inside :is() (the whole entry is
           dropped), so they are listed one by one. */
        html[data-wt-dashboard] :is(.content_wrap .breadcrumb .button_back, .content_wrap .breadcrumb .separator,
            .form_list .form_label .button_info, .dialog_header .button_close, .dialog_header .button_backward),
        html[data-wt-dashboard] .sidebar .nav_area .link::before,
        html[data-wt-dashboard] .form_dropdown .input_button::after,
        html[data-wt-dashboard] .form_text.type_tag_area .tag_item::after,
        html[data-wt-dashboard] .button.type_add::before,
        html[data-wt-dashboard] .button.type_retry::before,
        html[data-wt-dashboard] .form_check input:not(:checked) + .input_label::before { filter: invert(.88) !important; }
        html[data-wt-dashboard] .sidebar .nav_area .link { color: var(--wt-text) !important; transition: background-color .15s ease, color .15s ease !important; }
        html[data-wt-dashboard] .sidebar .nav_area .link:hover { background: rgba(255,255,255,.05) !important; color: #fff !important; }
        html[data-wt-dashboard] .sidebar .nav_area .link[aria-current="page"] {
            color: #fff !important;
            background: rgba(0,213,100,.12) !important;
            box-shadow: inset 0 0 0 1px rgba(0,213,100,.3) !important;
        }
        /* The current page's icon in green, like its tile. */
        html[data-wt-dashboard] .sidebar .nav_area .link[aria-current="page"]::before {
            filter: invert(.88) sepia(1) saturate(5) hue-rotate(85deg) brightness(.95) !important;
        }
        /* Default avatar: a white disc with a grey figure. The theme's
           neutral person mark on a dark disc instead. */
        html[data-wt-dashboard] .sidebar .profile_area .profile_image {
            background: var(--wt-avatar-none) center / 46px no-repeat, var(--wt-bg-elev2) !important;
            box-shadow: 0 0 0 3px var(--wt-bg-elev), 0 0 0 4px rgba(255,255,255,.14) !important;
        }
        html[data-wt-dashboard] .sidebar .profile_area .profile_image:after { border-color: rgba(255,255,255,.08) !important; }
        html[data-wt-dashboard] .sidebar .profile_area .profile_image img[src*="default_profile_image"] { opacity: 0 !important; }
        html[data-wt-dashboard] .sidebar .profile_area .author_name { color: var(--wt-text) !important; font-weight: 600 !important; }
        /* Dropdowns: the field kept its rounded bottom corners while the
           list hung flat and 1px narrow under it. Open, the field squares
           its bottom and the list continues it: same edge, rounded bottom,
           rows as soft tiles. */
        html[data-wt-dashboard] .form_dropdown:has(.input_button[aria-expanded="true"]) {
            border-bottom-left-radius: 0 !important;
            border-bottom-right-radius: 0 !important;
        }
        html[data-wt-dashboard] .form_dropdown .dropdown_panel {
            background: #2a2f36 !important;
            box-sizing: border-box !important;
            width: calc(100% + 2px) !important;
            padding: 4px 6px 6px !important;
            border-radius: 0 0 10px 10px !important;
            box-shadow: 0 16px 32px rgba(0,0,0,.45) !important;
        }
        html[data-wt-dashboard] .form_dropdown .drop_list { padding: 0 !important; }
        html[data-wt-dashboard] .form_dropdown .drop_item { height: 40px !important; }
        html[data-wt-dashboard] #wrap .form_dropdown .drop_button {
            color: var(--wt-text) !important;
            padding: 0 10px !important;
            border-radius: 8px !important;
            font-size: 14px !important;
            transition: background-color .12s ease, color .12s ease !important;
        }
        html[data-wt-dashboard] #wrap .form_dropdown .drop_button:hover { background-color: rgba(255,255,255,.07) !important; color: #fff !important; }
        html[data-wt-dashboard] #wrap .form_dropdown .drop_button[aria-selected="true"] { background-color: rgba(0,213,100,.14) !important; color: var(--wt-accent-soft) !important; font-weight: 600 !important; }
        /* Account menu under the name (Account / Logout). */
        html[data-wt-dashboard] .header_inner .link_login {
            height: 40px !important;
            padding: 0 18px !important;
            border-radius: 999px !important;
            background: rgba(255,255,255,.05) !important;
            border: 1px solid rgba(255,255,255,.14) !important;
            color: var(--wt-text) !important;
            font-weight: 700 !important;
        }
        html[data-wt-dashboard] .header_inner .link_login:hover {
            background: rgba(255,255,255,.1) !important;
            border-color: rgba(255,255,255,.28) !important;
            color: #fff !important;
        }
        html[data-wt-dashboard] .header_inner .login_box_cont {
            padding: 6px !important;
            background: #2a2f36 !important;
            border: 1px solid rgba(255,255,255,.1) !important;
            border-radius: 12px !important;
            box-shadow: 0 16px 40px rgba(0,0,0,.55), 0 2px 8px rgba(0,0,0,.35) !important;
        }
        html[data-wt-dashboard] .header_inner .login_box_cont .login_menu {
            display: flex !important;
            align-items: center !important;
            min-height: 40px !important;
            padding: 0 12px !important;
            border-radius: 8px !important;
            color: var(--wt-text) !important;
            font-size: 15px !important;
            font-weight: 500 !important;
            text-decoration: none !important;
        }
        html[data-wt-dashboard] .header_inner .login_box_cont .login_menu:hover {
            background: rgba(255,255,255,.08) !important;
            color: #fff !important;
        }
        html[data-wt-dashboard] .header_inner .login_box_cont li + li .login_menu { color: var(--wt-text-dim) !important; }
        /* Analytics chart grid lines and the "all languages" series were
           near-white / near-black for a white chart. */
        html[data-wt-dashboard] #chart .bb-grid line,
        html[data-wt-dashboard] #chart .bb-axis-x path { stroke: rgba(255,255,255,.06) !important; }
        html[data-wt-dashboard] #chart :is(.bb-xgrid-line, .bb-ygrid-line) line { stroke: rgba(255,255,255,.12) !important; }
        html[data-wt-dashboard] .analytics_legend_item.type_all::before,
        html[data-wt-dashboard] #chart .tooltip_item .dot.type_all { background-color: #e6e6e6 !important; }
        html[data-wt-dashboard] #chart .bb-circles-all-languages .bb-circle._expanded_ { fill: #e6e6e6 !important; }
        html[data-wt-dashboard] .analytics_chart .left_legend li::after { background: rgba(255,255,255,.08) !important; }

        /* ---------- Series detail page (e.g. /<lang>/<genre>/<slug>/list?title_no=...) ---------- */

        /* === Detail page elevation ===
           Page (--wt-bg) → episode list + sidebar cards (--wt-bg-elev) →
           episode rows as faint rgba(255,255,255,.025) tiles. */

        /* .cont_box is a sibling of .detail_bg and sits on top of the artwork
           div. Transparent here lets the artwork show through the detail_header
           area (.detail_body has its own explicit dark background, so the
           episode list area stays correctly dark). Scoped via adjacent-sibling
           so the general .cont_box dark background still applies elsewhere. */
        .detail_bg + .cont_box {
            background-color: transparent !important;
        }

        /* Episode list column — .detail_body .detail_list_area is float:left,
           761px wide, base background:#fff. Base padding-bottom (66px, or
           175px on .banner pages) reserves room for an absolutely-positioned
           pager; our .paginate:not(.v2):not(.episode_lst *) rule puts the pager back in normal
           flow, so that reserved space would just be an empty white-ish gap. */
        .detail_body .detail_list_area {
            background: var(--wt-bg-elev) !important;
            border-radius: 16px !important;
            padding-bottom: 20px !important;
            border: none !important;
            box-shadow: inset 0 0 0 1px rgba(255,255,255,.08), 0 8px 32px rgba(0,0,0,.5) !important;
        }
        /* Series sidebar — the info panel beside the episode list, read top
           to bottom like a title page: stats as two equal tiles, the
           schedule as a full-width green band, the synopsis at a comfortable
           reading size across the full card (the base kept a 57px right
           margin), a hairline, then the call to action.
           "First episode" / "Continue reading" is THE action of this page,
           so it is a full-width green rounded rectangle with a leading icon
           (the site's trailing arrow is hidden). When both show, Continue
           reading stays green and First episode steps down to an outline.
           Outer size is pinned (border-box, 389px = the old 357px content +
           32px padding): any wider and the float drops under the episode
           list. */
        .aside.detail {
            box-sizing: border-box !important;
            width: 389px !important;
            background:
                radial-gradient(120% 50% at 100% 0%, rgba(0,213,100,.08), rgba(0,213,100,0) 60%),
                var(--wt-bg-elev) !important;
            border-radius: 16px !important;
            padding: 22px 22px 24px !important;
            border: 1px solid rgba(255,255,255,.08) !important;
            border-top-color: rgba(255,255,255,.14) !important;
            box-shadow: 0 12px 40px rgba(0,0,0,.45) !important;
        }
        /* Views / subscribers: two equal tiles spanning the card's full
           width, so the top of the card lines up with the full-width synopsis
           and button below instead of two small chips hugging the left. */
        .aside.detail .grade_area {
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 8px !important;
            margin: 0 0 16px !important;
            padding: 0 !important;
        }
        .aside.detail .grade_area li {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 8px !important;
            height: 44px !important;
            margin: 0 !important;
            padding: 0 12px !important;
            border-radius: 12px !important;
            background: rgba(255,255,255,.045) !important;
            border: 1px solid rgba(255,255,255,.08) !important;
        }
        .aside.detail .grade_area .cnt {
            margin: 0 !important;
            color: var(--wt-text) !important;
            font-size: 15px !important;
            font-weight: 700 !important;
            font-style: normal !important;
            letter-spacing: .01em !important;
            font-variant-numeric: tabular-nums !important;
        }
        /* Schedule / status ("EVERY TUESDAY", "COMPLETED"): a full-width band
           the same height and radius as the stat tiles above, so the card's
           top reads as one block. It is the series' status, not a third
           stat, so it is tinted green — a glassy fill that fades toward the
           ends, a green hairline and a soft inner top highlight — with the
           label centred between the badge and the text. */
        .aside.detail .day_info {
            display: flex !important;
            box-sizing: border-box !important;
            width: 100% !important;
            height: 44px !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 10px !important;
            margin: 0 0 18px !important;
            padding: 0 14px !important;
            border-radius: 12px !important;
            background:
                radial-gradient(80% 140% at 50% 0%, rgba(0,213,100,.16), rgba(0,213,100,0) 70%),
                linear-gradient(90deg, rgba(0,213,100,.04), rgba(0,213,100,.11) 50%, rgba(0,213,100,.04)) !important;
            border: 1px solid rgba(0,213,100,.22) !important;
            box-shadow: inset 0 1px 0 rgba(255,255,255,.06) !important;
            color: var(--wt-accent-soft) !important;
            font-size: 13px !important;
            font-weight: 700 !important;
            line-height: 1 !important;
            letter-spacing: .14em !important;
            text-transform: uppercase !important;
        }
        /* On hiatus (.txt_ico_hiatus): the same band in the NOTE banner's
           amber, since a series on a break is news, not a schedule. Also
           the reader's end-card chip. */
        .aside.detail .day_info:has(.txt_ico_hiatus) {
            background:
                radial-gradient(80% 140% at 50% 0%, rgba(255,194,51,.16), rgba(255,194,51,0) 70%),
                linear-gradient(90deg, rgba(255,194,51,.04), rgba(255,194,51,.11) 50%, rgba(255,194,51,.04)) !important;
            border-color: rgba(255,194,51,.3) !important;
            color: #ffc233 !important;
        }
        .viewer_lst .day_info:has(.txt_ico_hiatus) {
            background: rgba(255,194,51,.12) !important;
            color: #ffc233 !important;
        }
        .aside.detail .day_info [class^="txt_ico"] {
            position: static !important;
            flex: none !important;
            margin: 0 !important;
            transform: scale(.85) !important;
        }
        /* Synopsis — the site's own face, one size up from its 16px (17px,
           regular), set for reading on dark: off-white at ~87% (pure white on dark "halates"),
           regular weight (light text looks heavier on dark, so never bold),
           generous leading. text-wrap: pretty avoids one-word last lines.
           A recessed panel behind it was tried and dropped: it boxed the
           text in and made the card heavier. */
        .aside.detail .summary {
            margin: 0 !important;
            color: #e4e7eb !important;
            font-size: 17px !important;
            font-weight: 400 !important;
            line-height: 1.62 !important;
            letter-spacing: .002em !important;
            text-wrap: pretty !important;
            -webkit-font-smoothing: antialiased !important;
            -moz-osx-font-smoothing: grayscale !important;
        }
        /* Lead-in: the first line a touch brighter and heavier, like a
           magazine intro, so the eye lands on the synopsis from a distance. */
        .aside.detail .summary::first-line { color: #fff !important; font-weight: 500 !important; }
        /* Long synopses collapse to 6 lines that fade out, with a chevron
           button to expand (the usual streaming-app pattern). Without it a
           long synopsis stretched the sidebar far past the episode list.
           clampSynopsis() (JS) adds .wt-clamp only when the text runs past
           8 lines, so short synopses never get a pointless toggle. The
           button is inserted with the hidden attribute and only this rule
           shows it, so with the theme off it stays hidden. Line-clamp only
           hides the text visually; screen readers still get all of it. */
        .aside.detail .summary.wt-clamp:not(.wt-open) {
            display: -webkit-box !important;
            -webkit-box-orient: vertical !important;
            -webkit-line-clamp: 6 !important;
            overflow: hidden !important;
            cursor: pointer !important;
            -webkit-mask-image: linear-gradient(180deg, #000 calc(100% - 2.4em), transparent) !important;
            mask-image: linear-gradient(180deg, #000 calc(100% - 2.4em), transparent) !important;
        }
        .aside.detail .wt-summary-toggle[hidden] {
            display: block !important;
            position: relative !important;
            width: 44px !important;
            height: 26px !important;
            margin: 8px auto 0 !important;
            padding: 0 !important;
            border-radius: 999px !important;
            background: rgba(255,255,255,.06) !important;
            border: 1px solid rgba(255,255,255,.12) !important;
            color: var(--wt-text-dim) !important;
            cursor: pointer !important;
            transition: background-color .15s ease, border-color .15s ease, color .15s ease !important;
        }
        .aside.detail .wt-summary-toggle::before {
            content: '' !important;
            position: absolute !important;
            top: 50% !important;
            left: 50% !important;
            width: 7px !important;
            height: 7px !important;
            margin: -6px 0 0 -4px !important;
            border-right: 2px solid currentColor !important;
            border-bottom: 2px solid currentColor !important;
            transform: rotate(45deg) !important;
            transition: transform .2s ease, margin .2s ease !important;
        }
        .aside.detail .wt-summary-toggle[aria-expanded="true"]::before {
            margin-top: -2px !important;
            transform: rotate(-135deg) !important;
        }
        .aside.detail .wt-summary-toggle:hover,
        .aside.detail .wt-summary-toggle:focus-visible,
        .aside.detail .summary.wt-clamp:not(.wt-open):hover + .wt-summary-toggle {
            background: rgba(0,213,100,.14) !important;
            border-color: rgba(0,213,100,.5) !important;
            color: var(--wt-accent-soft) !important;
        }
        .aside.detail .aside_btn {
            margin: 22px 0 0 !important;
            padding-top: 20px !important;
            border-top: 1px solid rgba(255,255,255,.07) !important;
            row-gap: 10px !important;
        }
        /* Read buttons, styled like a streaming "Play" button: an icon before
           a sentence-case label (sentence case reads faster than ALL CAPS;
           the words themselves come from the site, translated per language,
           so only the type and icon change). A rounded rectangle rather
           than a pill marks them as the page's commands, not chips. The
           green is a soft top-to-bottom gradient with an inner highlight,
           so the large fill looks like a raised key instead of a flat neon
           slab. Continue reading gets ▶; First episode gets ▶ when it is
           the only button and a "back to start" ⏮ when it sits under
           Continue reading as the secondary (outline) action. */
        .aside.detail .aside_btn .btn_type7 {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 10px !important;
            position: relative !important;
            box-sizing: border-box !important;
            width: 100% !important;
            min-width: 0 !important;
            height: 52px !important;
            line-height: 1 !important;
            padding: 0 20px !important;
            border-radius: 14px !important;
            border: 1px solid var(--wt-key-edge) !important;
            background: var(--wt-key) !important;
            color: #fff !important;
            font-size: 16px !important;
            font-weight: 600 !important;
            text-transform: none !important;
            box-shadow: inset 0 1px 0 rgba(255,255,255,.35), 0 8px 20px rgba(0,213,100,.2) !important;
            transition: background-color .18s ease, border-color .18s ease, box-shadow .18s ease, transform .18s ease, color .18s ease, filter .18s ease !important;
        }
        .aside.detail .aside_btn .btn_type7::before {
            content: '' !important;
            flex: none !important;
            width: 16px !important;
            height: 16px !important;
            background: currentColor !important;
            -webkit-mask: var(--wt-ico-play) center / contain no-repeat !important;
            mask: var(--wt-ico-play) center / contain no-repeat !important;
            transition: transform .18s ease !important;
        }
        /* The site's arrow sprite — the icon now leads, so no trailing arrow. */
        .aside.detail .aside_btn .btn_type7 .ico_arr21 { display: none !important; }
        /* The site shows / hides Continue reading with an inline display. */
        .aside.detail .aside_btn .btn_type7[style*="none"] { display: none !important; }
        .aside.detail .aside_btn .btn_type7:hover,
        .aside.detail .aside_btn .btn_type7:focus-visible {
            border-color: var(--wt-accent-soft) !important;
            color: #fff !important;
            box-shadow: inset 0 1px 0 rgba(255,255,255,.4), 0 0 0 4px rgba(0,213,100,.18), 0 12px 28px rgba(0,213,100,.3) !important;
            transform: translateY(-2px) !important;
        }
        .aside.detail .aside_btn .btn_type7:hover::before { transform: scale(1.15) !important; }
        .aside.detail .aside_btn .btn_type7:active { transform: translateY(0) scale(.98) !important; }
        .aside.detail .aside_btn #continueRead:not([style*="none"]) ~ #_btnEpisode {
            height: 46px !important;
            background: rgba(255,255,255,.05) !important;
            border-color: rgba(255,255,255,.16) !important;
            color: var(--wt-text) !important;
            font-weight: 600 !important;
            box-shadow: none !important;
            filter: none !important;
        }
        .aside.detail .aside_btn #continueRead:not([style*="none"]) ~ #_btnEpisode::before {
            -webkit-mask-image: var(--wt-ico-restart) !important;
            mask-image: var(--wt-ico-restart) !important;
            width: 15px !important;
            height: 15px !important;
        }
        .aside.detail .aside_btn #continueRead:not([style*="none"]) ~ #_btnEpisode:hover,
        .aside.detail .aside_btn #continueRead:not([style*="none"]) ~ #_btnEpisode:focus-visible {
            background: rgba(255,255,255,.1) !important;
            border-color: rgba(255,255,255,.3) !important;
            color: #fff !important;
            box-shadow: none !important;
            filter: none !important;
        }
        /* Age-rating note ("This series is rated Mature (18+) ..."): a
           heads-up, so it uses the amber callout of the series NOTE banner
           (amber edge and wash, an info icon), at a smaller size. The base
           pinned it to 300px with a -18px bottom margin, so it hung off
           the synopsis in a narrower column. The site's rating sprite is
           dropped: the sentence already names the rating, and the icon
           would sit next to ours. */
        .aside.detail .age_text {
            display: flex !important;
            align-items: flex-start !important;
            gap: 9px !important;
            width: auto !important;
            margin: 16px 0 0 !important;
            padding: 10px 12px !important;
            border: 1px solid rgba(255,194,51,.28) !important;
            border-radius: 10px !important;
            background: linear-gradient(90deg, rgba(255,194,51,.12), rgba(255,194,51,.03) 80%) !important;
            box-shadow: inset 3px 0 0 #ffc233 !important;
            color: #fff1d0 !important;
            font-size: 13px !important;
            line-height: 1.5 !important;
        }
        .aside.detail .age_text::before {
            content: '' !important;
            flex: none !important;
            width: 15px !important;
            height: 15px !important;
            margin-top: 2px !important;
            background: #ffc233 !important;
            -webkit-mask: var(--wt-ico-info) center / contain no-repeat !important;
            mask: var(--wt-ico-info) center / contain no-repeat !important;
        }
        .aside.detail .age_text [class*="ico_mature"] { display: none !important; }
        /* Series without a rating note keep the paragraph, empty, hidden
           with an inline display:none; the flex rule above showed it as an
           empty amber box. */
        .aside.detail .age_text[style*="none"] { display: none !important; }
        /* Patreon block (CANVAS series): "Enjoying the series? Support the
           creator by becoming a patron." · patron count · "Become a
           Patron". Base: loose text under a divider that stopped 34px
           short of the card's edge, a sprite hand and a flat orange
           button. Now an inset panel with the stat tiles' hairline, the
           count as a coral heart + bold figure, and the button a
           full-width coral outline (the green "First episode" stays the
           page's main action); hover fills it. The site shows / hides the
           count, amount and error lines with an inline display, so only
           the visible ones are made flex rows. */
        .aside.detail .aside_patron {
            margin: 22px 0 0 !important;
            padding: 16px 18px 18px !important;
            border: 1px solid rgba(255,255,255,.08) !important;
            border-radius: 14px !important;
            background: linear-gradient(180deg, rgba(243,94,54,.07), rgba(243,94,54,.02)) !important;
            color: var(--wt-text-body) !important;
            font-size: 14px !important;
            font-weight: 400 !important;
            line-height: 1.5 !important;
            text-align: center !important;
            text-wrap: balance !important;
        }
        .aside.detail .aside_patron .patron_info {
            margin: 12px 0 0 !important;
            padding: 0 !important;
        }
        .aside.detail .aside_patron .patron_info p {
            align-items: center !important;
            justify-content: center !important;
            gap: 8px !important;
            margin: 0 !important;
        }
        .aside.detail .aside_patron .patron_info p:not([style*="none"]) { display: flex !important; }
        .aside.detail .aside_patron .patron_info p[data-wt-zero] { display: none !important; }
        .aside.detail .aside_patron .patron_info em {
            color: #fff !important;
            font-size: 16px !important;
            font-weight: 700 !important;
            font-style: normal !important;
            font-variant-numeric: tabular-nums !important;
        }
        .aside.detail .aside_patron .ico_hand,
        .aside.detail .aside_patron .ico_money {
            flex: none !important;
            width: 16px !important;
            height: 16px !important;
            margin: 0 !important;
            background: #ff7a59 !important;
            -webkit-mask: var(--wt-heart-mask) center / contain no-repeat !important;
            mask: var(--wt-heart-mask) center / contain no-repeat !important;
        }
        .aside.detail .aside_patron .btn_patron {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            box-sizing: border-box !important;
            width: 100% !important;
            height: 44px !important;
            margin: 14px 0 0 !important;
            padding: 0 20px !important;
            border-radius: 12px !important;
            background: rgba(243,94,54,.12) !important;
            border: 1px solid rgba(255,122,89,.5) !important;
            color: #ffb39e !important;
            font-size: 15px !important;
            font-weight: 600 !important;
            line-height: 1 !important;
            text-decoration: none !important;
            transition: background-color .18s ease, border-color .18s ease, color .18s ease, box-shadow .18s ease !important;
        }
        .aside.detail .aside_patron .btn_patron:hover,
        .aside.detail .aside_patron .btn_patron:focus-visible {
            background: #f35e36 !important;
            border-color: #f35e36 !important;
            color: #fff !important;
            box-shadow: 0 0 0 4px rgba(243,94,54,.18), 0 8px 22px rgba(243,94,54,.28) !important;
        }
        /* Episode rows: li.detail_list_item > a.detail_list_link (flex row:
           thumb · title · date · likes · #N). Base CSS draws #f5f5f5 row
           dividers and a #fbfbfb hover — both white on dark. Rows are
           separate rounded tiles, each on a faint surface of its own and 6px
           apart: on the bare card the rows ran together into one block
           (divider lines would cut through the rounded hover). Hover follows the streaming
           episode-list pattern: the whole row lifts onto a lighter tile with
           a thin green outline, the thumbnail zooms slightly under a dark
           veil with a green ▶ badge (this row starts that episode), the
           title turns green and the date and likes brighten. */
        .detail_body .detail_list_area .detail_list_item {
            background: transparent !important;
            border: 0 !important;
            box-shadow: none !important;
        }
        .detail_body .detail_list_area .detail_list_item + .detail_list_item { margin-top: 6px !important; }
        .detail_body .detail_list_area .detail_list_link {
            position: relative !important;
            background: rgba(255,255,255,.025) !important;
            height: auto !important;
            padding: 6px !important;
            border-radius: 12px !important;
            transition: background-color .18s ease, box-shadow .18s ease !important;
        }
        .detail_body .detail_list_area .detail_list_item:hover .detail_list_link,
        .detail_body .detail_list_area .detail_list_link:focus-visible {
            background: rgba(255,255,255,.055) !important;
            box-shadow: inset 0 0 0 1px rgba(0,213,100,.3), 0 6px 18px rgba(0,0,0,.28) !important;
        }
        .detail_body .detail_list_area .detail_list_item .thmb {
            border-radius: 8px !important;
            overflow: hidden !important;
        }
        .detail_body .detail_list_area .detail_list_item .thmb img {
            display: block !important;
            border-radius: 8px !important;
            transition: transform .3s ease !important;
        }
        .detail_body .detail_list_area .detail_list_item:hover .thmb img { transform: scale(1.08) !important; }
        .detail_body .detail_list_area .detail_list_item .thmb::before,
        .detail_body .detail_list_area .detail_list_item .thmb::after {
            content: '' !important;
            position: absolute !important;
            pointer-events: none !important;
            opacity: 0 !important;
            transition: opacity .18s ease, transform .18s ease !important;
        }
        .detail_body .detail_list_area .detail_list_item .thmb::before {
            inset: 0 !important;
            z-index: 1 !important;
            background: rgba(0,0,0,.38) !important;
        }
        .detail_body .detail_list_area .detail_list_item .thmb::after {
            z-index: 2 !important;
            top: 50% !important;
            left: 50% !important;
            width: 30px !important;
            height: 30px !important;
            margin: -15px 0 0 -15px !important;
            border-radius: 50% !important;
            background: var(--wt-play-badge) center / contain no-repeat !important;
            box-shadow: 0 4px 14px rgba(0,0,0,.45) !important;
            transform: scale(.7) !important;
        }
        .detail_body .detail_list_area .detail_list_item:hover .thmb::before { opacity: 1 !important; }
        .detail_body .detail_list_area .detail_list_item:hover .thmb::after { opacity: 1 !important; transform: scale(1) !important; }

        /* Row typography — title > date > likes > episode number. Base CSS
           paints title / #N #3c3c3c and date / likes #666 (unreadable on
           dark), so every column is restated at the base selector's
           specificity. */
        /* Title at 19px (the site's 17px read small on dark), regular
           weight: the theme once ran it a weight heavier, which read
           cramped — light-on-dark text already looks bolder. Capped at ~30
           characters and ending in an ellipsis: a title running right up
           to the date read as one long line with it. */
        .detail_body .detail_list_area .subj span {
            color: var(--wt-text) !important;
            font-size: 19px !important;
            font-weight: 400 !important;
            transition: color .15s ease !important;
            min-width: 0 !important;
            max-width: 30ch !important;
            overflow: hidden !important;
            white-space: nowrap !important;
            text-overflow: ellipsis !important;
        }
        /* Date and likes, as the site sets them: 14px, proportional digits
           (the theme once forced tabular ones, which in this face look wide
           and mechanical) and regular weight (the like count is raised to
           600 below). The +.01em tracking is the usual correction for small
           light-on-dark text, which otherwise reads tighter than the same
           text dark-on-light. #N is a badge of its own (see .tx below). */
        .detail_body .detail_list_area .date,
        .detail_body .detail_list_area .like_area {
            font-size: 14px !important;
            font-weight: 400 !important;
            font-variant-numeric: normal !important;
            letter-spacing: .01em !important;
        }
        /* Release date: bright on episodes not yet read (when it came out
           matters there), dimmed on read ones (see the :visited rules). */
        .detail_body .detail_list_area .date { color: var(--wt-text-body) !important; }
        /* Like count: how well an episode landed, so it stays readable at a
           glance: a bright semibold count after a flame (see .ico_like).
           Read rows grey both out (see the :visited rules). */
        .detail_body .detail_list_area .like_area { color: var(--wt-text) !important; font-weight: 600 !important; transition: color .15s ease !important; }
        .detail_body .detail_list_area .detail_list_item:hover .like_area { color: #fff !important; }
        /* Episode number (#N, Originals only): a small dark badge on
           the thumbnail's bottom-left corner, like the rank badges on the
           reader's ranking tiles, instead of its own column. The number is
           not redundant ("Ep. 262" can be #264: side stories count), but a
           column for it squeezed the titles, and CANVAS rows have none. */
        .detail_body .detail_list_area .detail_list_link .tx {
            position: absolute !important;
            left: 10px !important;
            bottom: 10px !important;
            z-index: 3 !important;
            display: inline-flex !important;
            align-items: center !important;
            flex: none !important;
            width: auto !important;
            height: 20px !important;
            margin: 0 !important;
            padding: 0 6px !important;
            border-radius: 6px !important;
            background: rgba(10,12,14,.86) !important;
            box-shadow: 0 2px 6px rgba(0,0,0,.45) !important;
            color: #fff !important;
            font-size: 11px !important;
            font-weight: 700 !important;
            line-height: 1 !important;
            letter-spacing: .02em !important;
            font-variant-numeric: tabular-nums !important;
            text-align: center !important;
            pointer-events: none !important;
        }
        .detail_body .detail_list_area .tx_up { color: var(--wt-accent) !important; }
        /* Columns. The title box did not shrink, so a long title ("Ep. 123
           - Family Portraits and the Seventh ...") pushed its row's date,
           likes and #N a few pixels right of every other row. The title
           now takes the free space and ends in an ellipsis, and the other
           columns have fixed widths, right-aligned, so they line up down
           the whole list. */
        .detail_body .detail_list_area .detail_list_link .subj {
            flex: 1 1 auto !important;
            width: auto !important;
            min-width: 0 !important;
            padding-right: 16px !important;
        }
        /* Hover / keyboard focus shows the whole title: it wraps onto up
           to three lines in its own column. 3 × 24px fits beside the 73px
           thumbnail, so the row doesn't change height. */
        .detail_body .detail_list_area .detail_list_item:hover .subj span,
        .detail_body .detail_list_area .detail_list_link:focus-visible .subj span {
            display: -webkit-box !important;
            -webkit-box-orient: vertical !important;
            -webkit-line-clamp: 3 !important;
            white-space: normal !important;
            line-height: 24px !important;
        }
        .detail_body .detail_list_area .detail_list_link .date {
            flex: 0 0 104px !important;
            width: 104px !important;
            text-align: right !important;
        }
        .detail_body .detail_list_area .detail_list_link .like_area {
            flex: 0 0 72px !important;
            width: 72px !important;
            padding-right: 14px !important;
            text-align: right !important;
        }
        /* The site's heart sprite (a thin dark outline) is replaced by a
           flame: "how hot is this episode". A green heart competed with the
           green unread dot, a grey one read as disabled, and pink is the
           reader's Like button. Hover makes it flare. The flame is an orange
           mask with a yellow core on ::after (two masks, not an image, so
           read rows can grey it out through :visited). The <em> holds
           hidden "like" text — keep it invisible. */
        .detail_body .detail_list_area .ico_like {
            position: relative !important;
            background: #ff6a24 !important;
            -webkit-mask: var(--wt-flame-mask) center / contain no-repeat !important;
            mask: var(--wt-flame-mask) center / contain no-repeat !important;
            filter: none !important;
            transition: transform .18s ease, filter .18s ease !important;
            width: 19px !important;
            height: 19px !important;
            margin: 0 2px 0 0 !important;
            font-size: 0 !important;
            color: transparent !important;
            vertical-align: -4px !important;
            display: inline-block !important;
        }
        .detail_body .detail_list_area .ico_like::after {
            content: '' !important;
            position: absolute !important;
            inset: 0 !important;
            background: #ffd25e !important;
            -webkit-mask: var(--wt-flame-core) center / contain no-repeat !important;
            mask: var(--wt-flame-core) center / contain no-repeat !important;
        }
        .detail_body .detail_list_area .detail_list_item:hover .ico_like {
            transform: scale(1.18) !important;
            filter: drop-shadow(0 0 4px rgba(255,140,40,.6)) !important;
        }
        .detail_body .detail_list_area .detail_list_item:hover .subj span {
            color: var(--wt-accent) !important;
        }
        .detail_body .detail_list_area .detail_list_item:hover .date {
            color: var(--wt-text) !important;
        }

        /* Already-read episodes. Base CSS greys every column of a :visited
           row to #c4c4c4 — on dark that made the list look washed out. The
           "read" signal is the title (muted, ~5.8:1 on --wt-bg-elev), with
           the release date, the like count and the flame dimmed further;
           #N keeps its white badge on every row. */
        .detail_body .detail_list_area .detail_list_link:visited .subj span {
            color: var(--wt-text-read) !important;
        }
        .detail_body .detail_list_area .detail_list_link:visited .date { color: var(--wt-text-mute) !important; }
        /* The like count and flame recede with the rest of a read row (the
           date's grey; the flame a two-tone grey), and light up again on
           hover. */
        .detail_body .detail_list_area .detail_list_link:visited .like_area { color: var(--wt-text-mute) !important; }
        .detail_body .detail_list_area .detail_list_link:visited .ico_like { background-color: #6b7380 !important; }
        .detail_body .detail_list_area .detail_list_link:visited .ico_like::after { background-color: #9aa1ab !important; }
        /* Read / unread marker before each title. Browsers only let :visited
           change colours (no content, size or opacity), so one 10px dot
           exists on every row and only its colours differ: unread = solid
           green dot (fill and ring green), read = hollow grey ring (fill =
           the card colour, ring grey). The read fill must match whatever is
           behind it, so the hovered-row fill is restated below. */
        .detail_body .detail_list_area .subj::before {
            content: '' !important;
            flex: none !important;
            box-sizing: border-box !important;
            width: 10px !important;
            height: 10px !important;
            margin-right: 12px !important;
            border-radius: 50% !important;
            border: 2px solid var(--wt-accent) !important;
            background-color: var(--wt-accent) !important;
        }
        .detail_body .detail_list_area .detail_list_link:visited .subj::before {
            border-color: #6b7380 !important;
            background-color: #272b30 !important;
        }
        .detail_body .detail_list_area .detail_list_item:hover .detail_list_link:visited .subj::before {
            background-color: #2e3237 !important;
        }
        /* Hover on a READ row: the :visited rules above have the same
           specificity as the plain hover rules and come later, so they won —
           the title, date and likes stayed muted under the cursor. Restate the hover
           colours here, one notch more specific. */
        .detail_body .detail_list_area .detail_list_item:hover .detail_list_link:visited .subj span {
            color: var(--wt-accent) !important;
        }
        .detail_body .detail_list_area .detail_list_item:hover .detail_list_link:visited .date { color: var(--wt-text) !important; }
        .detail_body .detail_list_area .detail_list_item:hover .detail_list_link:visited .like_area { color: #fff !important; }
        .detail_body .detail_list_area .detail_list_item:hover .detail_list_link:visited .ico_like { background-color: #ff6a24 !important; }
        .detail_body .detail_list_area .detail_list_item:hover .detail_list_link:visited .ico_like::after { background-color: #ffd25e !important; }

        /* "Read N new episodes on the app" QR strip at the top of the
           episode list (the paywall NOTE strip is the amber banner below). */
        .detail_body .detail_install_app { color: var(--wt-text-dim) !important; }
        /* The app strip opens the card: its top border was a stray line
           along the card's top edge. */
        .detail_body .detail_install_app { border-top: 0 !important; }
        .detail_body .detail_install_app strong { color: var(--wt-text) !important; }
        .detail_body .detail_install_app em,
        .detail_body .detail_paywall .lk_more { color: var(--wt-accent) !important; }
        .detail_body .detail_install_app .img_qrcode { border-radius: 4px !important; }
        /* The series NOTE ("Cinderella Boy will return!", hiatus / schedule
           news): an announcement banner, not a grey line. Warm amber tint
           with a solid amber edge (amber is the theme's heads-up colour, so
           it can't be mistaken for an episode row), a megaphone, the site's
           own NOTE badge (a localized sprite, recoloured amber) and the text
           in bright semibold. */
        .detail_body .detail_paywall {
            display: flex !important;
            align-items: center !important;
            gap: 12px !important;
            margin: 16px 0 10px !important;
            padding: 14px 18px !important;
            border: 1px solid rgba(255,194,51,.35) !important;
            border-radius: 12px !important;
            background: linear-gradient(90deg, rgba(255,194,51,.17), rgba(255,194,51,.04) 75%) !important;
            box-shadow: inset 3px 0 0 #ffc233, 0 6px 18px rgba(0,0,0,.25) !important;
            color: #fff1d0 !important;
            font-size: 15px !important;
            font-weight: 600 !important;
            line-height: 1.45 !important;
        }
        .detail_body .detail_paywall::before {
            content: '' !important;
            flex: none !important;
            width: 20px !important;
            height: 20px !important;
            background: #ffc233 !important;
            -webkit-mask: var(--wt-ico-megaphone) center / contain no-repeat !important;
            mask: var(--wt-ico-megaphone) center / contain no-repeat !important;
        }
        .detail_body .detail_paywall [class^="ico_"] { flex: none !important; margin: 0 !important; vertical-align: middle !important; }
        .detail_body .detail_paywall .ico_note,
        .detail_body .detail_paywall .ico_sale {
            filter: brightness(0) invert(.78) sepia(1) saturate(6) hue-rotate(-12deg) !important;
        }

        /* Series header: share row + Subscribe sit on top of the cover art,
           so each control is a dark disc, opaque enough to read on light
           and dark artwork alike, with the same monochrome icon set as the
           reader's end card; hover fills it with the network's colour. No
           backdrop blur: it made each of the seven discs its own
           compositing layer.
           Subscribe is a glass pill that turns green on hover (the green
           at rest belongs to the page's main action, "First episode"). */
        .detail_header .spi_area {
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
        }
        .detail_header .spi_area > li { float: none !important; margin: 0 !important; }
        .detail_header .spi_area > li > a[class^="ico_"],
        .detail_header .spi_wrap .btn_favorite {
            box-sizing: border-box !important;
            height: 38px !important;
            background: rgba(12,14,17,.7) !important;
            border: 1px solid rgba(255,255,255,.2) !important;
            box-shadow: 0 4px 14px rgba(0,0,0,.35) !important;
            color: #fff !important;
            transition: background-color .18s ease, border-color .18s ease, color .18s ease, box-shadow .18s ease, transform .18s ease !important;
        }
        .detail_header .spi_area > li > a[class^="ico_"] {
            position: relative !important;
            display: block !important;
            width: 38px !important;
            margin: 0 !important;
            border-radius: 50% !important;
            font-size: 0 !important;
            text-indent: 0 !important;
            overflow: hidden !important;
            filter: none !important;
        }
        .detail_header .spi_area > li > a[class^="ico_"]::before {
            content: '' !important;
            position: absolute !important;
            inset: 0 !important;
            margin: auto !important;
            width: 17px !important;
            height: 17px !important;
            background: currentColor !important;
            -webkit-mask: var(--wt-share) center / contain no-repeat !important;
            mask: var(--wt-share) center / contain no-repeat !important;
        }
        .detail_header .spi_area > li > a[class^="ico_"]:hover,
        .detail_header .spi_area > li > a[class^="ico_"]:focus-visible {
            background: var(--wt-brand) !important;
            border-color: var(--wt-brand) !important;
            transform: translateY(-2px) !important;
        }
        .detail_header .spi_wrap .btn_favorite {
            display: inline-flex !important;
            align-items: center !important;
            gap: 7px !important;
            padding: 0 18px 0 14px !important;
            border-radius: 999px !important;
            font-size: 14px !important;
            font-weight: 700 !important;
            line-height: 1 !important;
        }
        .detail_header .spi_wrap .btn_favorite .ico_plus4 { margin: 0 !important; filter: brightness(0) invert(1) !important; }
        .detail_header .spi_wrap .btn_favorite:hover,
        .detail_header .spi_wrap .btn_favorite:focus-visible {
            background: var(--wt-key) !important;
            border-color: var(--wt-key-edge) !important;
            color: #fff !important;
            box-shadow: 0 0 0 4px rgba(0,213,100,.2), 0 8px 22px rgba(0,213,100,.3) !important;
            transform: translateY(-2px) !important;
        }
        /* Subscribed (.on): the site turns the pill into a 35px disc whose
           tick is a sprite background with the label pushed out by
           text-indent; the glass background above painted over the
           sprite, leaving an empty disc. A green-tinted disc with a tick
           mask instead (the reader toolbar's subscribed state). */
        .detail_header .spi_wrap .btn_favorite.on {
            position: relative !important;
            justify-content: center !important;
            width: 38px !important;
            padding: 0 !important;
            border-radius: 50% !important;
            background: rgba(14,40,26,.72) !important;
            border-color: rgba(0,213,100,.6) !important;
            color: var(--wt-accent-soft) !important;
            font-size: 0 !important;
            text-indent: 0 !important;
            overflow: hidden !important;
        }
        .detail_header .spi_wrap .btn_favorite.on .ico_plus4 { display: none !important; }
        .detail_header .spi_wrap .btn_favorite.on::before {
            content: '' !important;
            position: absolute !important;
            inset: 0 !important;
            margin: auto !important;
            width: 17px !important;
            height: 17px !important;
            background: currentColor !important;
            -webkit-mask: var(--wt-ico-check) center / contain no-repeat !important;
            mask: var(--wt-ico-check) center / contain no-repeat !important;
        }
        .detail_header .spi_wrap .btn_favorite.on:hover,
        .detail_header .spi_wrap .btn_favorite.on:focus-visible {
            background: rgba(0,213,100,.28) !important;
            border-color: var(--wt-accent) !important;
            color: #fff !important;
            box-shadow: 0 0 0 4px rgba(0,213,100,.18), 0 8px 22px rgba(0,0,0,.35) !important;
        }

        /* .ly_area — the small confirmation popup ("The URL has been
           copied", "Subscribed to your list") in the series header, the
           reader toolbar and the end card. Base CSS: background:#fff; border:
           1px solid #b4b4b4. Our general .ly_box popup rule does not catch this. */
        .ly_area {
            background: var(--wt-bg-elev2) !important;
            border-color: rgba(255,255,255,.14) !important;
            border-radius: 12px !important;
            box-shadow: 0 12px 32px rgba(0,0,0,.5) !important;
            color: var(--wt-text) !important;
        }
        /* The message itself ("The URL has been copied", "Subscribed to your
           list", …): base CSS paints it #000, which vanished on the dark box. */
        .ly_area .ly_cont {
            color: var(--wt-text) !important;
            font-size: 14px !important;
            line-height: 1.5 !important;
        }
        /* The pointer arrow is a light sprite drawn for the white box. */
        .ly_area .ico_arr { display: none !important; }

        /* Subscribe-tier popup (.ly_subscribe) — white panel that appears when
           the subscribe button is clicked; right:20px, top:239px, z-index:120. */
        .ly_subscribe {
            background: var(--wt-bg-elev) !important;
            color: var(--wt-text) !important;
            border: 1px solid var(--wt-border) !important;
            box-shadow: 0 8px 24px rgba(0,0,0,.5) !important;
        }

        /* Creator info popup (.ly_creator, opened by the ⓘ after the authors
           in the series header). Base: a white box with loose, unstyled
           entries ("Art by" / name / socials / bio) 60px apart, so three
           creators made a tall, mostly empty panel. The markup is flat (no
           wrapper per creator), so each entry is shaped from its parts: the
           role is a small green eyebrow, the name a bold heading, and a
           hairline above every role after the first separates the entries.
           A linked name gets a chevron that slides on hover (like the
           reader's creator card); ::after on the link is the site's
           verified badge, so the chevron goes on the h3. Socials are quiet
           round buttons with the share-icon masks; the close × is a round
           ghost button. */
        .ly_creator {
            padding: 30px 14px 26px 32px !important;
            background:
                radial-gradient(90% 60% at 0% 0%, rgba(0,213,100,.1), rgba(0,213,100,0) 60%),
                var(--wt-bg-elev) !important;
            border: 1px solid rgba(255,255,255,.1) !important;
            border-top-color: rgba(255,255,255,.18) !important;
            border-radius: 20px !important;
            box-shadow: 0 24px 64px rgba(0,0,0,.6), 0 4px 14px rgba(0,0,0,.35) !important;
            animation: wt-pop-in .18s ease-out !important;
        }
        @keyframes wt-pop-in {
            from { opacity: 0; transform: translateY(6px) scale(.98); }
            to   { opacity: 1; transform: none; }
        }
        /* A scrollbar-color (also an inherited one) makes Chrome ignore
           the site's 6px ::-webkit-scrollbar and draw a 15px classic bar;
           scrollbar-width keeps it thin. Safari still uses the thumb rule. */
        .ly_creator .ly_creator_in {
            width: 420px !important;
            padding: 0 18px 2px 0 !important;
            scrollbar-width: thin !important;
            scrollbar-color: var(--wt-bg-hover) transparent !important;
        }
        .ly_creator .ly_creator_in::-webkit-scrollbar-thumb { background-color: var(--wt-bg-hover) !important; box-shadow: none !important; }
        .ly_creator .by {
            margin: 0 !important;
            color: var(--wt-accent-soft) !important;
            font-size: 11px !important;
            font-weight: 700 !important;
            line-height: 16px !important;
            letter-spacing: .14em !important;
            text-transform: uppercase !important;
        }
        .ly_creator .by ~ .by {
            margin-top: 18px !important;
            padding-top: 18px !important;
            border-top: 1px solid rgba(255,255,255,.08) !important;
        }
        .ly_creator .title {
            display: flex !important;
            align-items: center !important;
            margin: 4px 0 0 !important;
            padding-right: 40px !important;
            color: var(--wt-text) !important;
            font-size: 22px !important;
            font-weight: 700 !important;
            line-height: 30px !important;
            letter-spacing: -.005em !important;
        }
        /* The first name shares its row with the close button. */
        .ly_creator .by ~ .by + .title { padding-right: 0 !important; }
        .ly_creator .title .link {
            align-items: center !important;
            min-width: 0 !important;
            color: var(--wt-text) !important;
            text-decoration: none !important;
            transition: color .15s ease !important;
        }
        .ly_creator .title .link::after { margin: 0 0 0 6px !important; align-self: center !important; }
        .ly_creator .title:has(> a.link)::after {
            content: '' !important;
            flex: none !important;
            width: 7px !important;
            height: 7px !important;
            margin-left: 12px !important;
            border-top: 2px solid currentColor !important;
            border-right: 2px solid currentColor !important;
            color: var(--wt-text-mute) !important;
            transform: rotate(45deg) !important;
            transition: transform .18s ease, color .18s ease !important;
        }
        .ly_creator .title .link:hover,
        .ly_creator .title .link:focus-visible { color: var(--wt-accent) !important; }
        .ly_creator .title:has(> a.link:hover)::after {
            color: var(--wt-accent) !important;
            transform: translateX(4px) rotate(45deg) !important;
        }
        .ly_creator .sns_area {
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 8px !important;
            margin: 10px 0 0 !important;
        }
        .ly_creator .sns_area:not(:has(a)),
        .ly_creator .desc:empty { display: none !important; }
        .ly_creator .sns_area a[class^="ico_"] {
            --wt-share: var(--wt-ico-link);
            --wt-brand: #2f9e62;
            position: relative !important;
            display: block !important;
            width: 32px !important;
            height: 32px !important;
            margin: 0 !important;
            box-sizing: border-box !important;
            border-radius: 50% !important;
            background: rgba(255,255,255,.06) !important;
            border: 1px solid rgba(255,255,255,.12) !important;
            color: var(--wt-text-dim) !important;
            font-size: 0 !important;
            text-indent: 0 !important;
            overflow: hidden !important;
            filter: none !important;
            transition: background .15s ease, border-color .15s ease, color .15s ease !important;
        }
        .ly_creator .sns_area a[class^="ico_"]::before {
            content: '' !important;
            position: absolute !important;
            inset: 0 !important;
            margin: auto !important;
            width: 15px !important;
            height: 15px !important;
            background: currentColor !important;
            -webkit-mask: var(--wt-share) center / contain no-repeat !important;
            mask: var(--wt-share) center / contain no-repeat !important;
        }
        .ly_creator .sns_area a.ico_twitter   { --wt-share: var(--wt-ico-x);         --wt-brand: #000; }
        .ly_creator .sns_area a.ico_facebook  { --wt-share: var(--wt-ico-facebook);  --wt-brand: #1877f2; }
        .ly_creator .sns_area a.ico_instagram { --wt-share: var(--wt-ico-instagram); --wt-brand: linear-gradient(45deg, #f58529, #dd2a7b 55%, #8134af); }
        .ly_creator .sns_area a.ico_youtube   { --wt-share: var(--wt-ico-youtube);   --wt-brand: #ff0033; }
        .ly_creator .sns_area a.ico_tumblr    { --wt-share: var(--wt-ico-tumblr);    --wt-brand: #3a5174; }
        .ly_creator .sns_area a[class^="ico_"]:hover,
        .ly_creator .sns_area a[class^="ico_"]:focus-visible {
            background: var(--wt-brand) !important;
            border-color: rgba(255,255,255,.3) !important;
            color: #fff !important;
        }
        .ly_creator .desc {
            margin: 10px 0 0 !important;
            color: var(--wt-text-body) !important;
            font-size: 15px !important;
            line-height: 1.6 !important;
            text-wrap: pretty !important;
        }
        .ly_creator .btn_ly_close {
            top: 18px !important;
            right: 18px !important;
            width: 34px !important;
            height: 34px !important;
            border-radius: 50% !important;
            background: rgba(255,255,255,.06) !important;
            color: var(--wt-text-dim) !important;
            font-size: 0 !important;
            text-indent: 0 !important;
            filter: none !important;
            transition: background-color .15s ease, color .15s ease !important;
        }
        .ly_creator .btn_ly_close::before {
            content: '' !important;
            position: absolute !important;
            inset: 0 !important;
            margin: auto !important;
            width: 12px !important;
            height: 12px !important;
            background: currentColor !important;
            -webkit-mask: var(--wt-ico-close) center / contain no-repeat !important;
            mask: var(--wt-ico-close) center / contain no-repeat !important;
        }
        .ly_creator .btn_ly_close:hover,
        .ly_creator .btn_ly_close:focus-visible {
            background: rgba(255,255,255,.14) !important;
            color: #fff !important;
        }
        /* "Other works" strip (creators with more series). */
        .ly_creator .other_works { margin-top: 18px !important; }
        .ly_creator .other_works .sub_title { color: var(--wt-text) !important; font-size: 15px !important; font-weight: 700 !important; }
        .ly_creator .other_works_more { color: var(--wt-text-dim) !important; }
        .ly_creator .other_works_more:hover { color: var(--wt-accent) !important; }
        .ly_creator .other_works_more .ico_more { filter: brightness(0) invert(1) opacity(.7) !important; }
        .ly_creator .other_card { width: 420px !important; }
        .ly_creator .other_card li {
            width: calc((100% - 18px) / 4) !important;
            height: auto !important;
            aspect-ratio: 114 / 148 !important;
            border-radius: 10px !important;
        }
        .ly_creator .other_card .nodata { background-color: var(--wt-bg-elev2) !important; }
        .ly_creator .other_card_item { background: var(--wt-bg-elev2) !important; }
        .other_card_item { color: var(--wt-text) !important; }

        /* "You may also like" — one elevated section card holding three flat
           recommendation tiles (the card-grid rule: the section is the only
           elevation). Base: white rows with the cover pinned absolutely to
           the row's left edge, so a square image butted against a rounded
           row. Each tile is now a flex row — rounded cover with a soft
           shadow · title (up to two lines) · author · views — and hover
           tints the tile, zooms the cover a little and turns the title
           green. The heading gets a short green bar so it reads as a
           section title, not a loose caption. */
        .detail_other {
            margin: 40px 0 96px !important;
            padding: 22px 24px 24px !important;
            background: var(--wt-bg-elev) !important;
            border: 1px solid rgba(255,255,255,.08) !important;
            border-top-color: rgba(255,255,255,.14) !important;
            border-radius: 16px !important;
            box-shadow: 0 12px 32px rgba(0,0,0,.35) !important;
            overflow: visible !important;
        }
        .detail_other h2 {
            display: flex !important;
            align-items: center !important;
            gap: 10px !important;
            margin: 0 0 14px !important;
            color: var(--wt-text) !important;
            font-size: 20px !important;
            font-weight: 700 !important;
            line-height: 28px !important;
            letter-spacing: .01em !important;
        }
        .detail_other h2::before {
            content: '' !important;
            flex: none !important;
            width: 4px !important;
            height: 20px !important;
            border-radius: 2px !important;
            background: var(--wt-accent) !important;
        }
        .detail_other h2 .point { color: var(--wt-accent) !important; }
        .detail_other .lst_type1 {
            display: grid !important;
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            gap: 12px !important;
            border: 0 !important;
        }
        .detail_other .lst_type1 li,
        .detail_other .lst_type1 li:hover {
            position: relative !important;
            width: auto !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            border: 0 !important;
            border-radius: 14px !important;
            background: transparent !important;
        }
        .detail_other .lst_type1 li > a {
            display: flex !important;
            align-items: center !important;
            gap: 16px !important;
            height: auto !important;
            padding: 10px !important;
            border: 1px solid transparent !important;
            border-radius: 14px !important;
            transition: background-color .18s ease, border-color .18s ease !important;
        }
        .detail_other .lst_type1 li > a:hover,
        .detail_other .lst_type1 li > a:focus-visible {
            background: rgba(255,255,255,.045) !important;
            border-color: rgba(255,255,255,.1) !important;
        }
        .detail_other .lst_type1 .pic_area {
            position: relative !important;
            inset: auto !important;
            flex: none !important;
            width: 84px !important;
            height: 90px !important;
            border-radius: 10px !important;
            overflow: hidden !important;
            box-shadow: 0 6px 16px rgba(0,0,0,.4) !important;
        }
        .detail_other .lst_type1 .pic_area img {
            display: block !important;
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
            transition: transform .3s ease !important;
        }
        .detail_other .lst_type1 li > a:hover .pic_area img { transform: scale(1.06) !important; }
        .detail_other .lst_type1 .pic_area::before {
            border-color: rgba(255,255,255,.08) !important;
            border-radius: inherit !important;
            z-index: 1 !important;
        }
        /* Badges on the cover ("NEW", age rating): re-anchor on the moved cover. */
        .detail_other .lst_type1 .icon_area { left: 15px !important; top: 15px !important; }
        .detail_other .lst_type1 .info_area {
            flex: 1 1 auto !important;
            min-width: 0 !important;
            height: auto !important;
            padding: 0 !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            gap: 3px !important;
        }
        .detail_other .lst_type1 .info_area .subj {
            margin: 0 !important;
            color: var(--wt-text) !important;
            font-size: 16px !important;
            font-weight: 600 !important;
            line-height: 1.3 !important;
            white-space: normal !important;
            display: -webkit-box !important;
            -webkit-box-orient: vertical !important;
            -webkit-line-clamp: 2 !important;
            overflow: hidden !important;
            transition: color .15s ease !important;
        }
        .detail_other .lst_type1 li > a:hover .subj { color: var(--wt-accent) !important; }
        .detail_other .lst_type1 .info_area .author {
            margin: 0 !important;
            color: var(--wt-text-mute) !important;
            font-size: 13px !important;
            line-height: 1.4 !important;
        }
        .detail_other .lst_type1 .grade_area {
            display: inline-flex !important;
            align-items: center !important;
            gap: 5px !important;
            margin: 4px 0 0 !important;
        }
        .detail_other .lst_type1 .grade_num,
        .detail_other .lst_type1 .grade_area { color: var(--wt-text-dim) !important; }
        .detail_other .lst_type1 .grade_num {
            font-size: 13px !important;
            font-weight: 600 !important;
            font-style: normal !important;
            font-variant-numeric: tabular-nums !important;
        }

        /* Series title block over the cover art: genre · title · authors · ⓘ.
           The site sets this text dark on light artwork (.type_white) and
           white on dark artwork. The theme forced white everywhere, so on
           pale covers the title, genre and authors all but vanished.
           A frosted plate behind the block fixed that but hid a large part
           of the cover, often the characters. Now the text sits directly on
           the art, the way streaming hero banners do it: a feathered dark
           glow right behind the words (::before, a radial gradient with no
           edge), plus layered text shadows. The art around and between the
           words stays visible. The title is a bold display face with tight
           tracking. The genre is a pill in its own genre colour (color-mix
           off currentColor, so every .g_* hue works). The authors are
           bright, and the black sprite ⓘ is replaced by a clean mask icon
           on a small glass button. */
        .detail_header .info {
            box-sizing: border-box !important;
            margin-top: -14px !important;
            padding: 0 !important;
            background: none !important;
            border: 0 !important;
        }
        .detail_header .info::before {
            content: '' !important;
            position: absolute !important;
            inset: -34px -110px !important;
            z-index: -1 !important;
            pointer-events: none !important;
            background: radial-gradient(closest-side, rgba(8,10,12,.5), rgba(8,10,12,.32) 55%, rgba(8,10,12,0)) !important;
        }
        :is(.detail_header .info:not(.challenge), .detail_header.challenge .info) .genre {
            display: inline-flex !important;
            align-items: center !important;
            margin: 0 !important;
            padding: 4px 12px !important;
            border-radius: 999px !important;
            background: color-mix(in srgb, currentColor 16%, rgba(8,10,12,.7)) !important;
            border: 1px solid color-mix(in srgb, currentColor 55%, transparent) !important;
            filter: brightness(1.18) !important;
            font-size: 12px !important;
            font-weight: 700 !important;
            line-height: 16px !important;
            letter-spacing: .14em !important;
            text-transform: uppercase !important;
            text-shadow: none !important;
        }
        .detail_header .info .subj {
            width: auto !important;
            max-width: 1000px !important;
            margin: 8px auto 0 !important;
            color: #fff !important;
            font-size: 48px !important;
            font-weight: 700 !important;
            line-height: 1.1 !important;
            letter-spacing: -.015em !important;
            text-shadow: 0 1px 2px rgba(0,0,0,.55), 0 2px 10px rgba(0,0,0,.45), 0 4px 28px rgba(0,0,0,.45) !important;
        }
        /* The site breaks long titles onto two lines with a <br>. A smaller
           size there keeps the title clear of the share row below. */
        .detail_header .info .subj:has(br) { font-size: 38px !important; line-height: 1.08 !important; }
        .detail_header .info .author_area {
            margin-top: 8px !important;
            color: rgba(255,255,255,.86) !important;
            font-size: 16px !important;
            font-weight: 500 !important;
            letter-spacing: .01em !important;
            text-shadow: 0 1px 2px rgba(0,0,0,.7), 0 1px 10px rgba(0,0,0,.55) !important;
        }
        .detail_header .info .author {
            color: rgba(255,255,255,.92) !important;
            text-decoration-color: rgba(255,255,255,.4) !important;
            text-underline-offset: 4px !important;
            transition: color .15s ease, text-decoration-color .15s ease !important;
        }
        .detail_header .info a.author:hover {
            color: var(--wt-accent-soft) !important;
            text-decoration-color: var(--wt-accent-soft) !important;
        }
        /* CANVAS series header (.detail_header.challenge): the background is
           a flat series colour beside the square thumbnail, not artwork, so
           the feathered glow above turned into a dark smudge on it (worst
           on bright yellows). Here the block is a card like the series
           sidebar (same surface, hairline, radius and shadow): there is no
           art for a card to hide. A translucent glass plate picked up the
           yellow and turned brown. The card is as wide as its content and
           sits level with the 220px cover (the header is 240px tall; the
           block used to start at its very top, under the site header).
           The genres ("Comedy | Supernatural", no colour class;
           tagGenreLabels() adds one) become pills like the Originals
           genre, the 1px .bar divider goes, and the subscriber coin (437K)
           becomes a glass pill. */
        .detail_header.challenge .info::before { display: none !important; }
        /* A grid, not a wrapping flex row: fit-content of a wrapping row
           is every item on one line, so the card ran far past the title. */
        .detail_header.challenge .info {
            display: grid !important;
            grid-template-columns: repeat(3, auto) 1fr !important;
            justify-items: start !important;
            align-items: center !important;
            gap: 8px !important;
            width: fit-content !important;
            min-width: 320px !important;
            max-width: 720px !important;
            margin-top: 28px !important;
            padding: 16px 24px 18px !important;
            background:
                radial-gradient(120% 90% at 100% 0%, rgba(0,213,100,.08), rgba(0,213,100,0) 60%),
                var(--wt-bg-elev) !important;
            border: 1px solid rgba(255,255,255,.08) !important;
            border-top-color: rgba(255,255,255,.14) !important;
            border-radius: 16px !important;
            box-shadow: 0 12px 40px rgba(0,0,0,.45) !important;
        }
        .detail_header.challenge .info .subj,
        .detail_header.challenge .info .author_area {
            grid-column: 1 / -1 !important;
            text-align: left !important;
            text-shadow: none !important;
        }
        .detail_header.challenge .info .subj {
            margin: 6px 0 0 !important;
            font-size: 40px !important;
            line-height: 1.1 !important;
        }
        /* The CANVAS script adds long_text to titles over 30 characters. */
        .detail_header.challenge .info .subj.long_text { font-size: 36px !important; padding-top: 0 !important; }
        .detail_header.challenge .info .author_area { margin: 4px 0 0 !important; }
        .detail_header.challenge .info .genre .bar { display: none !important; }
        .detail_header.challenge .info .discover_badge_area { position: static !important; margin: 0 !important; }
        .detail_header.challenge .info .badge_discover {
            display: inline-flex !important;
            align-items: center !important;
            box-sizing: border-box !important;
            width: auto !important;
            height: 26px !important;
            padding: 0 10px !important;
            border-radius: 999px !important;
            background: rgba(10,12,14,.72) !important;
            border: 1px solid rgba(0,213,100,.45) !important;
            color: var(--wt-accent-soft) !important;
            font-size: 12px !important;
            font-weight: 700 !important;
            line-height: 1 !important;
            text-indent: 0 !important;
        }
        /* Author-info button: the sprite is a black disc with a white "i"
           on light covers. Now it's a 22px glass circle with a mask ⓘ. */
        .detail_header .info .ico_info2 {
            position: relative !important;
            width: 22px !important;
            height: 22px !important;
            margin: -3px 0 0 6px !important;
            padding: 0 !important;
            border-radius: 50% !important;
            background: rgba(255,255,255,.12) !important;
            border: 1px solid rgba(255,255,255,.18) !important;
            color: rgba(255,255,255,.85) !important;
            font-size: 0 !important;
            text-indent: 0 !important;
            filter: none !important;
            transition: background-color .15s ease, color .15s ease, border-color .15s ease !important;
        }
        .detail_header .info .ico_info2::before {
            content: '' !important;
            position: absolute !important;
            inset: 0 !important;
            margin: auto !important;
            width: 14px !important;
            height: 14px !important;
            background: currentColor !important;
            -webkit-mask: var(--wt-ico-info) center / contain no-repeat !important;
            mask: var(--wt-ico-info) center / contain no-repeat !important;
        }
        .detail_header .info .ico_info2:hover,
        .detail_header .info .ico_info2:focus-visible {
            background: rgba(0,213,100,.2) !important;
            border-color: rgba(0,213,100,.55) !important;
            color: var(--wt-accent-soft) !important;
        }

        /* Ranking-number sprites (.ico_n1-10): dark digits, inverted to
           white. The ranking cards (.ranking_lst.viewer) draw their own
           digits and set filter: none; this is the fallback for ranking
           lists elsewhere (logged-in pages, not checked). */
        .ico_n1, .ico_n2, .ico_n3, .ico_n4, .ico_n5,
        .ico_n6, .ico_n7, .ico_n8, .ico_n9, .ico_n10 {
            filter: brightness(0) invert(1) opacity(.85) !important;
        }
        /* Rank-number badges (.ranking_number_X) on homepage trending cards
           AND the /rankings listing page. The base markup is the same
           (<strong class="ranking_number_N"> with a sprite background +
           <span class="blind"> for screen readers), but the parent class
           differs per page: .webtoon_list on homepage, .ranking_text on
           /rankings. Match the sprite class globally so both render. The
           native sprite atlas covers 1–10, so /rankings 11–30 stayed blank;
           draw all 30 via ::before with content per number. */
        [class^="ranking_number_"]:before {
            background-image: none !important;
            text-indent: 0 !important;
            overflow: visible !important;
            width: auto !important;
            height: auto !important;
            font-size: 58px !important;
            font-weight: 900 !important;
            color: var(--wt-text) !important;
            text-shadow: 0 2px 10px rgba(0,0,0,.95) !important;
            white-space: normal !important;
            vertical-align: bottom !important;
            line-height: 1 !important;
            display: inline-block !important;
        }
        .ranking_number_1:before  { content: "1" !important; }
        .ranking_number_2:before  { content: "2" !important; }
        .ranking_number_3:before  { content: "3" !important; }
        .ranking_number_4:before  { content: "4" !important; }
        .ranking_number_5:before  { content: "5" !important; }
        .ranking_number_6:before  { content: "6" !important; }
        .ranking_number_7:before  { content: "7" !important; }
        .ranking_number_8:before  { content: "8" !important; }
        .ranking_number_9:before  { content: "9" !important; }
        .ranking_number_10:before { content: "10" !important; }
        .ranking_number_11:before { content: "11" !important; }
        .ranking_number_12:before { content: "12" !important; }
        .ranking_number_13:before { content: "13" !important; }
        .ranking_number_14:before { content: "14" !important; }
        .ranking_number_15:before { content: "15" !important; }
        .ranking_number_16:before { content: "16" !important; }
        .ranking_number_17:before { content: "17" !important; }
        .ranking_number_18:before { content: "18" !important; }
        .ranking_number_19:before { content: "19" !important; }
        .ranking_number_20:before { content: "20" !important; }
        .ranking_number_21:before { content: "21" !important; }
        .ranking_number_22:before { content: "22" !important; }
        .ranking_number_23:before { content: "23" !important; }
        .ranking_number_24:before { content: "24" !important; }
        .ranking_number_25:before { content: "25" !important; }
        .ranking_number_26:before { content: "26" !important; }
        .ranking_number_27:before { content: "27" !important; }
        .ranking_number_28:before { content: "28" !important; }
        .ranking_number_29:before { content: "29" !important; }
        .ranking_number_30:before { content: "30" !important; }
        /* m.webtoons.com home tab pills (Trending / Popular, categories):
           base CSS uses #f3f3f3 (inactive) and #000 (active). On the
           desktop home the .main_section rules below win. */
        .main_section_tab .button {
            background-color: var(--wt-bg-elev2) !important;
            color: var(--wt-text) !important;
            border: 1px solid var(--wt-border) !important;
        }
        .main_section_tab .button:hover {
            background-color: var(--wt-bg-hover) !important;
            color: var(--wt-text) !important;
        }
        .main_section_tab .button[aria-selected="true"] {
            background: var(--wt-key) !important;
            color: #fff !important;
            border-color: var(--wt-accent) !important;
        }
        /* Homepage section headers (Trending & Popular, Popular by
           Category, Daily, More stories from indie creators). The title was
           the same size as a card title two lines below it, "View all" a
           small grey link, and the filter tabs grey pills whose hover moved
           the background by 2% (no visible effect) next to a loud solid-
           green selected tab. Now: a large title behind a green bar (like
           the CANVAS headings), "View all" a ghost pill with a chevron, and
           the tabs follow the theme's selection language: quiet glass pills
           that clearly light up on hover, the selected one a green-tinted
           chip with a ring (the pager / sort switch look). Desktop only:
           m.webtoons.com's headers are direct children of
           .main_content_wrap, 42px tall, where the large title wrapped
           into the carousel below. */
        .section_header:not(:has(> .series_count)):where(:not(.main_content_wrap > *)) > .section_title {
            display: flex !important;
            align-items: center !important;
            gap: 12px !important;
            color: #fff !important;
            font-size: 26px !important;
            font-weight: 800 !important;
            line-height: 32px !important;
            letter-spacing: -.01em !important;
        }
        .section_header:not(:has(> .series_count)):where(:not(.main_content_wrap > *)) > .section_title::before {
            content: '' !important;
            flex: none !important;
            width: 4px !important;
            height: 24px !important;
            border-radius: 2px !important;
            background: var(--wt-accent) !important;
        }
        .section_header:not(:has(> .series_count)):where(:not(.main_content_wrap > *)) { align-items: center !important; }
        .section_header:where(:not(.main_content_wrap > *)) .button_view_all {
            display: inline-flex !important;
            align-items: center !important;
            gap: 8px !important;
            box-sizing: border-box !important;
            height: 36px !important;
            padding: 0 14px 0 18px !important;
            border-radius: 999px !important;
            background: rgba(255,255,255,.05) !important;
            border: 1px solid rgba(255,255,255,.14) !important;
            color: var(--wt-text-body) !important;
            font-size: 14px !important;
            font-weight: 600 !important;
            line-height: 1 !important;
            white-space: nowrap !important;
            transition: background-color .15s ease, border-color .15s ease, color .15s ease !important;
        }
        .section_header:where(:not(.main_content_wrap > *)) .button_view_all::after,
        .section_header:where(:not(.main_content_wrap > *)) .button_view_all:hover::after {
            content: '' !important;
            flex: none !important;
            width: 7px !important;
            height: 7px !important;
            margin: 0 3px 0 0 !important;
            background: none !important;
            border-top: 2px solid currentColor !important;
            border-right: 2px solid currentColor !important;
            transform: rotate(45deg) !important;
            transition: transform .15s ease !important;
        }
        .section_header:where(:not(.main_content_wrap > *)) .button_view_all:hover,
        .section_header:where(:not(.main_content_wrap > *)) .button_view_all:focus-visible {
            background: rgba(0,213,100,.14) !important;
            border-color: rgba(0,213,100,.55) !important;
            color: var(--wt-accent-soft) !important;
        }
        .section_header:where(:not(.main_content_wrap > *)) .button_view_all:hover::after { transform: translateX(3px) rotate(45deg) !important; }
        :is(.main_section, .webtoon_list_wrap) .main_section_tab { gap: 8px !important; flex-wrap: wrap !important; }
        :is(.main_section, .webtoon_list_wrap) .main_section_tab li { margin: 0 !important; }
        .main_section .main_section_tab .button,
        .webtoon_list_wrap .main_section_tab .button {
            box-sizing: border-box !important;
            height: 44px !important;
            min-width: 76px !important;
            margin: 0 !important;
            padding: 0 22px !important;
            border-radius: 999px !important;
            background: rgba(255,255,255,.05) !important;
            border: 1px solid rgba(255,255,255,.14) !important;
            color: var(--wt-text-body) !important;
            font-size: 15px !important;
            font-weight: 600 !important;
            line-height: 42px !important;
            letter-spacing: .01em !important;
            transition: background-color .15s ease, border-color .15s ease, color .15s ease, box-shadow .15s ease !important;
        }
        .main_section .main_section_tab .button:hover,
        .main_section .main_section_tab .button:focus-visible,
        .webtoon_list_wrap .main_section_tab .button:hover,
        .webtoon_list_wrap .main_section_tab .button:focus-visible {
            background: rgba(255,255,255,.13) !important;
            border-color: rgba(255,255,255,.34) !important;
            color: #fff !important;
            box-shadow: 0 4px 14px rgba(0,0,0,.3) !important;
        }
        .main_section .main_section_tab .button[aria-selected="true"],
        .webtoon_list_wrap .main_section_tab .button[aria-selected="true"] {
            background: rgba(0,213,100,.16) !important;
            border-color: rgba(0,213,100,.6) !important;
            color: var(--wt-accent-soft) !important;
            font-weight: 700 !important;
            box-shadow: 0 0 16px rgba(0,213,100,.18) !important;
        }
        .main_section .main_section_tab .button[aria-selected="true"]:hover,
        .webtoon_list_wrap .main_section_tab .button[aria-selected="true"]:hover {
            background: rgba(0,213,100,.24) !important;
            border-color: var(--wt-accent) !important;
            color: var(--wt-accent) !important;
            box-shadow: 0 0 0 3px rgba(0,213,100,.14), 0 0 18px rgba(0,213,100,.22) !important;
        }
        /* Stats glyphs (.ico_view / .ico_view2 / .ico_subscribe / .ico_grade /
           .ico_grade2) are intentionally NOT filtered: the sprite at those
           positions has the brand green baked in, and filtering bleached it
           to grey / white. Brand green renders fine on the dark surface. */

        /* Pagers (series episode list, /canvas list, notice list, reader
           toolbar and episode strip). Base CSS hard-codes color:#070707 on
           the links and the current page, invisible on dark. Every rule
           starts with div.paginate: all desktop pagers are <div>s, and the
           only .paginate on m.webtoons.com is the reader's fixed bottom
           toolbar (span.paginate: prev, #N, next), which these rules pushed
           below the screen. */
        /* Base .paginate is display:flex with a fixed 32px height. Keep it a
           flex row (display:block turned the prev arrow into a full-width
           block line and pushed the numbers below the card's clip edge);
           allow wrapping so 10+ pages never overflow the column. */
        div.paginate:not(.v2):not(.episode_lst *) {
            display: flex !important;
            flex-wrap: wrap !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 4px !important;
            height: auto !important;
            margin: 24px 0 4px !important;
        }
        div.paginate:not(.v2):not(.episode_lst *) .pg_page + .pg_page { margin-left: 0 !important; }
        div.paginate a, div.paginate strong, div.paginate span,
        div.paginate.v2 [class^="pg_"] {
            color: var(--wt-text) !important;
        }
        div.paginate a span { color: inherit !important; }
        /* Pagination pills: explicit centered dimensions so both the link
           and the active <strong> render as the same shape. The base CSS
           sizes .paginate .on with a sprite background and fixed width
           which, when combined with naive padding, produces a giant green
           box with a tiny clipped "1". inline-flex with min-width + height
           gives a consistent pill regardless of base markup. */
        div.paginate a,
        div.paginate strong,
        div.paginate .on,
        div.paginate [aria-current="true"] {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            min-width: 28px !important;
            height: 28px !important;
            padding: 0 8px !important;
            margin: 0 2px !important;
            border-radius: 6px !important;
            box-sizing: border-box !important;
            background: none !important;
            background-image: none !important;
            text-indent: 0 !important;
            line-height: 1 !important;
            transition: background-color .15s ease, color .15s ease, box-shadow .15s ease !important;
        }
        /* The next/prev arrows are sprite-backed with a dark fill that
           disappears on the dark surface. Filter-inverting them also
           inverted the hover background (a stark white pill), so the sprite
           goes and each pager draws its own chevron. The sprite icon inside
           the reader toolbar's and the episode strip's arrows is hidden;
           em.blind, the page pager's only label ("Next Page"), stays for
           screen readers. */
        div.paginate .pg_next, div.paginate .pg_prev,
        div.paginate a[class*="next"], div.paginate a[class*="prev"] {
            background-image: none !important;
            text-indent: 0 !important;
            color: var(--wt-text) !important;
        }
        div.paginate .pg_next > :not(.blind), div.paginate .pg_prev > :not(.blind) {
            display: none !important;
        }
        /* Base CSS draws the arrow sprite on ::before on both sides; the
           next chevron is drawn on ::after, so next's ::before goes. */
        div.paginate:not(.v2):not(.episode_lst *) .pg_next::before { content: none !important; }
        div.paginate:not(.v2):not(.episode_lst *) .pg_prev, div.paginate:not(.v2):not(.episode_lst *) .pg_next {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            width: 32px !important;
            margin: 0 !important;
        }
        /* Disabled first/last-page arrows (<span class="pg_prev off">). */
        div.paginate .pg_prev.off, div.paginate .pg_next.off {
            opacity: .3 !important;
            pointer-events: none !important;
        }
        /* Page-pager chevrons drawn with borders, not text: a "‹ ›" glyph
           sits on the font baseline and rendered visibly low in its pill. A
           rotated 7px box is centred exactly by the pill's flex centring. */
        div.paginate:not(.v2):not(.episode_lst *) .pg_prev::before,
        div.paginate:not(.v2):not(.episode_lst *) .pg_next::after {
            content: '' !important;
            display: block !important;
            width: 7px !important;
            height: 7px !important;
            font-size: 0 !important;
            background: none !important;
            border-top: 2px solid currentColor !important;
            border-right: 2px solid currentColor !important;
        }
        div.paginate:not(.v2):not(.episode_lst *) .pg_prev::before { transform: rotate(-135deg) !important; margin: 0 0 0 3px !important; }
        div.paginate:not(.v2):not(.episode_lst *) .pg_next::after  { transform: rotate(45deg) !important;  margin: 0 3px 0 0 !important; }
        /* Page pager, refined. The current page was a solid neon-green chip
           with near-black digits, which read as a warning label rather than
           "you are here". It now follows the dark-theme selected-tab
           pattern: a green-tinted pill with bright green bold digits, a
           green ring and a soft glow. The other pages are buttons too:
           bright semibold digits on a glass pill with a hairline (plain
           grey digits were easy to miss; the user asked for them brighter),
           lighter on hover. 36px pills, an easy target. */
        div.paginate:not(.v2):not(.episode_lst *) { gap: 6px !important; }
        div.paginate:not(.v2):not(.episode_lst *) a,
        div.paginate:not(.v2):not(.episode_lst *) strong,
        div.paginate:not(.v2):not(.episode_lst *) .pg_prev,
        div.paginate:not(.v2):not(.episode_lst *) .pg_next {
            min-width: 36px !important;
            height: 36px !important;
            margin: 0 !important;
            border-radius: 10px !important;
            font-size: 15px !important;
            font-variant-numeric: normal !important;
        }
        div.paginate:not(.v2):not(.episode_lst *) .pg_prev,
        div.paginate:not(.v2):not(.episode_lst *) .pg_next { width: 36px !important; }
        div.paginate:not(.v2):not(.episode_lst *) a,
        div.paginate:not(.v2):not(.episode_lst *) .pg_prev,
        div.paginate:not(.v2):not(.episode_lst *) .pg_next {
            color: var(--wt-text) !important;
            font-weight: 600 !important;
            background-color: rgba(255,255,255,.06) !important;
            box-shadow: inset 0 0 0 1px rgba(255,255,255,.12) !important;
        }
        /* The current page is an <a> too (a.pg_page[aria-current]): without
           the :not() this hover / focus tile replaced its green pill. */
        div.paginate:not(.v2):not(.episode_lst *) a:not([aria-current="true"]):hover,
        div.paginate:not(.v2):not(.episode_lst *) a:not([aria-current="true"]):focus-visible {
            color: #fff !important;
            background-color: rgba(255,255,255,.13) !important;
            box-shadow: inset 0 0 0 1px rgba(255,255,255,.3) !important;
        }
        div.paginate:not(.v2):not(.episode_lst *) strong,
        div.paginate:not(.v2):not(.episode_lst *) .on,
        div.paginate:not(.v2):not(.episode_lst *) [aria-current="true"] {
            color: var(--wt-accent-soft) !important;
            background-color: rgba(0,213,100,.2) !important;
            font-weight: 800 !important;
            box-shadow: inset 0 0 0 1.5px var(--wt-accent), 0 0 16px rgba(0,213,100,.28) !important;
        }

        /* Viewer toolbar prev/next-episode buttons (.paginate.v2 around #N).
           Same class family as the bottom-of-list pager but rendered at
           toolbar scale. Three things needed:
           1. Size the buttons explicitly (the disabled .pg_next.dim is a
              <span>, not <a>, so it picks up no pill rule from the generic
              .paginate a rule — zero dimensions, chevron invisible).
           2. Match parent line-height to button height so the text "#N"
              and the buttons share the same line metrics — without this,
              vertical-align:middle still leaves the buttons below text.
           3. Draw the heavy chevron ornaments ❮ ❯ (same as the snb
              scroll arrows) on the pseudo-elements and absolutely-position
              them inside the button: centering becomes bulletproof
              regardless of font metrics. */
        .paginate.v2 {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 12px !important;
        }
        .paginate.v2 .pg_prev,
        .paginate.v2 .pg_next {
            display: inline-block !important;
            position: relative !important;
            width: 36px !important;
            min-width: 36px !important;
            height: 36px !important;
            padding: 0 !important;
            margin: 0 !important;
            border-radius: 6px !important;
            background: none !important;
            background-image: none !important;
            text-indent: 0 !important;
            color: var(--wt-text) !important;
            flex: 0 0 auto !important;
        }
        .paginate.v2 ._btnOpenEpisodeList,
        .paginate.v2 .tx {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            height: 36px !important;
            line-height: 1 !important;
            flex: 0 0 auto !important;
            /* Nudge text up to optically align with the chevron centers.
               Empirical offset — flex-centering the line-box doesn't match
               the digits' visual center because "#289" has no descenders. */
            transform: translateY(-5px) !important;
        }
        .paginate.v2 .pg_prev::before { content: '\\276E' !important; }
        .paginate.v2 .pg_next::after  { content: '\\276F' !important; }
        /* Base CSS draws the dark arrow sprite on .pg_prev::before (a 20×20
           box with background-position) — the same pseudo we reuse for ❮.
           Without clearing the sprite and the fixed box, the dark sprite
           showed behind a squashed glyph ("<‹"). ::after (next) has no sprite. */
        .paginate.v2 .pg_prev::before,
        .paginate.v2 .pg_next::after {
            text-indent: 0 !important;
            background: none !important;
            width: auto !important;
            height: auto !important;
            margin: 0 !important;
            position: absolute !important;
            inset: 0 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            font-size: 28px !important;
            font-weight: normal !important;
            line-height: 1 !important;
            color: inherit !important;
        }
        .paginate.v2 a.pg_prev:hover,
        .paginate.v2 a.pg_next:hover {
            background-color: var(--wt-bg-hover) !important;
            color: var(--wt-accent) !important;
            box-shadow: inset 0 0 0 1px var(--wt-accent-soft) !important;
        }
        .paginate.v2 .pg_prev.dim,
        .paginate.v2 .pg_next.dim {
            opacity: 0.35 !important;
            cursor: default !important;
            pointer-events: none !important;
        }

        /* ---------- Static / policy pages ---------- */

        /* Notice list page (/<lang>/notice/list) — table on white. */
        .notice_area2 {
            background: var(--wt-bg) !important;
            color: var(--wt-text) !important;
        }
        .notice_area2 h3 { color: var(--wt-text) !important; }
        .notice_area2 .tb_notice { background: var(--wt-bg) !important; }
        .notice_area2 .tb_notice th {
            background: var(--wt-bg-elev2) !important;
            color: var(--wt-text) !important;
            border-color: var(--wt-border) !important;
        }
        .notice_area2 .tb_notice tbody tr           { color: var(--wt-text) !important; }
        .notice_area2 .tb_notice tbody tr.special   { background: var(--wt-bg-elev) !important; }
        .notice_area2 .tb_notice tbody td           { border-color: var(--wt-border) !important; }
        .notice_area2 .tb_notice a                  { color: var(--wt-text) !important; }
        .notice_area2 .tb_notice a:hover            { color: var(--wt-link) !important; }

        /* Terms / Privacy Policy pages (/<lang>/terms*, /<lang>/terms/privacyPolicy).
           Base CSS hard-codes background:#fff and color:#858585 on .terms_area. */
        .terms_area, .terms_box, .terms_card,
        .terms_lang_area, .terms_lang_desc, .terms_list {
            background: var(--wt-bg) !important;
            color: var(--wt-text) !important;
        }
        .terms_area h3, .terms_area strong { color: var(--wt-text) !important; }
        .terms_area .date                  { color: var(--wt-text-mute) !important; }
        .terms_area a                      { color: var(--wt-link) !important; }

        /* Terms / Policy language pills (English / Français / Indonesia / 中文 / ภาษาไทย).
           Base: inactive = #f3f3f3 bg + #666 text (invisible on dark).
                 active = #000 bg + #fff text (off-theme black pill). */
        .terms_lang_area .terms_lang_list .link,
        .terms_lang_area .terms_tab_list .link {
            background-color: var(--wt-bg-elev2) !important;
            color: var(--wt-text-dim) !important;
        }
        .terms_lang_area .terms_lang_list .link[aria-selected="true"],
        .terms_lang_area .terms_tab_list .link[aria-selected="true"] {
            background: var(--wt-key) !important;
            color: #fff !important;
        }
        .terms_lang_area .terms_lang_list .link[aria-selected="false"]:hover,
        .terms_lang_area .terms_tab_list .link[aria-selected="false"]:hover {
            background-color: var(--wt-bg-hover) !important;
            color: var(--wt-text) !important;
        }

        /* Defensive catch-all for any other dialog Webtoons might add later. */
        [role="dialog"], [aria-modal="true"] {
            background-color: var(--wt-bg-elev) !important;
            color: var(--wt-text) !important;
        }
        [role="dialog"] input, [role="dialog"] textarea, [role="dialog"] select {
            background-color: var(--wt-bg-input) !important;
            color: var(--wt-text) !important;
            border: 1px solid var(--wt-border) !important;
        }
        /* ================================================================
           Creator profile pages (/p/community/<lang>/u/<creator>). A
           separate app (CSS-module class names, its own --gw-app-*
           colours) that is already dark. The theme's generic rules only got
           in its way: the button rule boxed every icon button (the ⋮ menus,
           "more", the nav icons) and greyed the green Follow button, and
           the link rule hid the website link. Here it gets the theme's card
           language instead: the profile as a creator card (ringed avatar,
           stat tiles, an amber key for Follow), the series row and every
           feed post on their own cards. Scoped to the app root,
           #app.BaseLayout_container, except the popovers, toasts and
           tooltips, which the app portals out of it.
           ================================================================ */
        #app[class*="BaseLayout_container"] { background: var(--wt-bg) !important; padding-bottom: 32px !important; }
        /* The app's own face is a condensed one that looked cramped at
           heading sizes; the system UI face matches the rest of the theme
           (and the comments). */
        #app[class*="BaseLayout_container"],
        #app[class*="BaseLayout_container"] :is(h1, h2, h3, h4, p, span, a, button, strong, time, div, li),
        [data-radix-popper-content-wrapper] :is(button, a, span, li) {
            font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
        }
        /* Not inside #wcc_root: with the ID's weight this beat the comment
           widget's own button rules, so votes lost their colour and hover.
           :where() keeps the exclusion weightless: a bare :not(#wcc_root *)
           adds an ID and then beat the Follow / social button rules too. */
        #app[class*="BaseLayout_container"] button:where(:not(#wcc_root *)) {
            background: transparent !important;
            border: 0 !important;
            color: inherit !important;
        }
        /* Top bar: fixed, 790px; frosted so posts scroll under it. */
        #app[class*="BaseLayout_container"] nav[class*="NavigationBar_container"] {
            background: rgba(21,23,26,.86) !important;
            -webkit-backdrop-filter: blur(12px) !important;
            backdrop-filter: blur(12px) !important;
            border-bottom: 1px solid rgba(255,255,255,.08) !important;
        }
        #app[class*="BaseLayout_container"] [class*="ExtraButtonGroup_icon"],
        #app[class*="BaseLayout_container"] [class*="HomeNavigationBar_sideButton"] {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            border-radius: 50% !important;
            transition: background-color .15s ease !important;
        }
        #app[class*="BaseLayout_container"] [class*="ExtraButtonGroup_icon"]:hover,
        #app[class*="BaseLayout_container"] [class*="ExtraButtonGroup_icon"][data-state="open"],
        #app[class*="BaseLayout_container"] [class*="HomeNavigationBar_sideButton"]:hover { background: rgba(255,255,255,.08) !important; }
        /* "See posts from all the creators you follow" hint (portalled out
           of #app). The generic dialog rule turned the site's green bubble
           grey; it is a green-tinted chip with a matching arrow instead. */
        [class*="FeedAffordanceTooltip_content"] {
            background: #1c3d2b !important;
            color: #eafff2 !important;
            border-radius: 10px !important;
            box-shadow: 0 0 0 1px rgba(0,213,100,.45), 0 10px 26px rgba(0,0,0,.45) !important;
        }
        [class*="FeedAffordanceTooltip_arrow"] { fill: #1c3d2b !important; }
        /* Toasts ("Followed …", "Link copied"; portalled out of #app):
           the app paints them as an inverted white bar, a glaring flash at
           the bottom of a dark page. The theme's menu panel instead: a dark
           rounded chip with a hairline and a soft shadow. No icon: the same
           toast reports errors. */
        [class*="Toast_container"] {
            width: fit-content !important;
            margin: 0 auto !important;
            padding: 12px 22px !important;
            background: #2a2f36 !important;
            border: 1px solid rgba(255,255,255,.12) !important;
            border-radius: 12px !important;
            box-shadow: 0 16px 40px rgba(0,0,0,.55), 0 2px 8px rgba(0,0,0,.35) !important;
            color: var(--wt-text) !important;
            font-family: system-ui, -apple-system, "Segoe UI", sans-serif !important;
            font-size: 15px !important;
            font-weight: 600 !important;
        }
        [class*="Toast_container"] a { color: inherit !important; }
        /* Post / profile menus (Share, Report, Block; portalled out of
           #app). The generic button rule boxed every row; like the comment
           menu, it is one rounded panel with plain rows. */
        [data-radix-popper-content-wrapper] [class*="PopoverContent_wrapper"] {
            padding: 6px !important;
            background: #2a2f36 !important;
            border: 1px solid rgba(255,255,255,.1) !important;
            border-radius: 12px !important;
            box-shadow: 0 16px 40px rgba(0,0,0,.55), 0 2px 8px rgba(0,0,0,.35) !important;
        }
        [data-radix-popper-content-wrapper] [class*="PopoverContent_wrapper"]:focus-visible { outline: none !important; }
        /* Reaction picker on a post (ReactionButton_popOver*): a grey
           box (--gw-bg-01) inside our popover panel, with every emoji on
           a boxed square from the generic button rule. One dark panel,
           emoji on round buttons that grow on hover. */
        [data-radix-popper-content-wrapper] [class*="PopoverContent_wrapper"]:has([class*="ReactionButton_popOverContent"]) {
            padding: 0 !important;
            background: transparent !important;
            border: 0 !important;
            box-shadow: none !important;
        }
        [class*="ReactionButton_popOverContent"] {
            padding: 8px 10px !important;
            background: #2a2f36 !important;
            border: 1px solid rgba(255,255,255,.1) !important;
            border-radius: 999px !important;
            box-shadow: 0 16px 40px rgba(0,0,0,.55), 0 2px 8px rgba(0,0,0,.35) !important;
        }
        [class*="ReactionButton_popOverContent"]::after { display: none !important; }
        [class*="ReactionButton_popOverItem"]:not(:last-of-type) { margin-right: 4px !important; }
        button[class*="ReactionButton_popOverButton"],
        button[class*="ReactionButton_bottomSheetButton"] {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            width: 46px !important;
            height: 46px !important;
            padding: 0 !important;
            background: transparent !important;
            border: 0 !important;
            border-radius: 50% !important;
            box-shadow: none !important;
            transition: background-color .15s ease, transform .2s cubic-bezier(.34,1.56,.64,1) !important;
        }
        button[class*="ReactionButton_popOverButton"]:hover,
        button[class*="ReactionButton_popOverButton"]:focus-visible {
            background: rgba(255,255,255,.1) !important;
            transform: scale(1.18) translateY(-2px) !important;
            outline: none !important;
        }
        button[class*="ReactionButton_popOverButton"]:active { transform: scale(.94) !important; }
        [data-radix-popper-content-wrapper] [class*="PopoverContent_content"] {
            background: transparent !important;
            border: 0 !important;
            box-shadow: none !important;
            outline: none !important;
        }
        [data-radix-popper-content-wrapper] button[class*="PopoverItem_button"] {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            box-sizing: border-box !important;
            width: 100% !important;
            min-width: 0 !important;  /* a 152px floor left short labels (Share / Report / Block) in a sea of padding */
            min-height: 40px !important;
            margin: 0 !important;
            padding: 0 24px !important;
            background: transparent !important;
            border: 0 !important;
            border-radius: 8px !important;
            color: var(--wt-text) !important;
            font-size: 15px !important;
            font-weight: 500 !important;
            text-align: center !important;
            transition: background-color .12s ease, color .12s ease !important;
        }
        /* The creator's social links (Instagram, X, ...): each row is a
           link inside a button. The link only wrapped its icon and label,
           so most of the row was dead space. The link now fills the row
           (one click target), with the network's icon on a small glass
           tile. Rows are left-aligned so the icons form one column (centred
           rows put them at ragged x positions), and the panel hugs the
           rows with equal side padding, so the list sits centred under the
           button. */
        [data-radix-popper-content-wrapper] [class*="PopoverContent_wrapper"]:has([class*="SocialLinkTrigger_snsItem"]) { min-width: 0 !important; }
        [data-radix-popper-content-wrapper] button[class*="PopoverItem_button"]:has(> a) { min-width: 0 !important; padding: 0 !important; justify-content: flex-start !important; }
        [data-radix-popper-content-wrapper] a[class*="SocialLinkTrigger_snsItem"] {
            display: flex !important;
            align-items: center !important;
            justify-content: flex-start !important;
            gap: 12px !important;
            box-sizing: border-box !important;
            width: 100% !important;
            height: 46px !important;
            padding: 0 22px 0 12px !important;
            border-radius: 8px !important;
            color: var(--wt-text) !important;
            font-size: 15px !important;
            font-weight: 600 !important;
            text-decoration: none !important;
        }
        [data-radix-popper-content-wrapper] a[class*="SocialLinkTrigger_snsItem"] img {
            flex: none !important;
            box-sizing: content-box !important;
            width: 16px !important;
            height: 16px !important;
            padding: 6px !important;
            border-radius: 8px !important;
            background: rgba(255,255,255,.07) !important;
            box-shadow: inset 0 0 0 1px rgba(255,255,255,.08) !important;
        }
        [data-radix-popper-content-wrapper] a[class*="SocialLinkTrigger_snsItem"]:hover { color: #fff !important; }
        [data-radix-popper-content-wrapper] button[class*="PopoverItem_button"]:hover,
        [data-radix-popper-content-wrapper] button[class*="PopoverItem_button"]:focus-visible {
            background: rgba(255,255,255,.08) !important;
            color: #fff !important;
            outline: none !important;
        }

        /* Profile: a creator card, like the reader's (green corner glow,
           ringed avatar), centred as the site has it. */
        #app[class*="BaseLayout_container"] [class*="CreatorHomeContainer_info"] { padding: 0 !important; }
        #app[class*="BaseLayout_container"] [class*="HomeProfile_root"] {
            margin: 20px 18px 0 !important;
            padding: 30px 24px 26px !important;
            background:
                radial-gradient(120% 70% at 50% 0%, rgba(0,213,100,.12), rgba(0,213,100,0) 60%),
                var(--wt-bg-elev) !important;
            border: 1px solid rgba(255,255,255,.08) !important;
            border-top-color: rgba(255,255,255,.14) !important;
            border-radius: 18px !important;
            box-shadow: 0 12px 32px rgba(0,0,0,.35) !important;
        }
        #app[class*="BaseLayout_container"] [class*="HomeProfile_profileImageWrap"] [class*="ProfileImage_container"] {
            border-radius: 50% !important;
            box-shadow: 0 0 0 3px var(--wt-bg-elev), 0 0 0 5px var(--wt-accent), 0 8px 22px rgba(0,213,100,.25) !important;
        }
        #app[class*="BaseLayout_container"] [class*="HomeProfile_nickname"] {
            margin: 18px 0 0 !important;
            color: #fff !important;
            font-size: 26px !important;
            font-weight: 800 !important;
            line-height: 32px !important;
            letter-spacing: -.01em !important;
        }
        #app[class*="BaseLayout_container"] [class*="ExpandableProfileBio_root"] { margin-top: 8px !important; }
        #app[class*="BaseLayout_container"] [class*="ExpandableProfileBio_bio"] {
            color: var(--wt-text-body) !important;
            font-size: 15px !important;
            line-height: 22px !important;
        }
        /* Folded bio. The app's clamp (react-lines-ellipsis) already cuts
           the text to two lines, and trimBioCut() (JS) drops the half word
           it ended on ("…Webtoon, Scholas"). "... more" was a 12px grey
           underlined label glued to the cut; it is the theme's green text
           button. The site's own 2-line clamp is lifted from the folded
           text: measured in the site's narrower font, "... more" could
           wrap to a third line in ours and vanish under it, leaving no
           way to open the bio. */
        #app[class*="BaseLayout_container"] [class*="ExpandableProfileBio_folded"].LinesEllipsis--clamped {
            display: block !important;
            -webkit-line-clamp: none !important;
        }
        #app[class*="BaseLayout_container"] [class*="ExpandableProfileBio_bio"] .LinesEllipsis-ellipsis {
            margin-left: 2px !important;
            color: var(--wt-accent-soft) !important;
            font-size: 14px !important;
            font-weight: 600 !important;
            text-decoration: none !important;
            white-space: nowrap !important;
        }
        #app[class*="BaseLayout_container"] [class*="ExpandableProfileBio_bio"] .LinesEllipsis-ellipsis:hover {
            color: var(--wt-accent) !important;
            text-decoration: underline !important;
            text-underline-offset: 3px !important;
        }
        /* The website link: green with a link icon (the global link rule
           had made it plain text). */
        #app[class*="BaseLayout_container"] a[class*="HomeProfile_promotionLink"] {
            display: inline-flex !important;
            align-items: center !important;
            gap: 6px !important;
            margin-top: 6px !important;
            color: var(--wt-accent-soft) !important;
            font-size: 14px !important;
            font-weight: 500 !important;
            text-decoration: none !important;
        }
        #app[class*="BaseLayout_container"] a[class*="HomeProfile_promotionLink"]::before {
            content: '' !important;
            flex: none !important;
            width: 14px !important;
            height: 14px !important;
            background: currentColor !important;
            -webkit-mask: var(--wt-ico-link) center / contain no-repeat !important;
            mask: var(--wt-ico-link) center / contain no-repeat !important;
        }
        #app[class*="BaseLayout_container"] a[class*="HomeProfile_promotionLink"]:hover {
            color: var(--wt-accent) !important;
            text-decoration: underline !important;
            text-underline-offset: 3px !important;
        }
        /* Series / Followers: the figures creators care most about, so
           they are the card's largest numbers: two equal tiles, a 26px
           figure over a small uppercase label (the site's label comes
           first in the markup; order puts the figure on top). Violet
           tiles with amber figures (the user's call): grey tiles read as
           filler, and all-amber ones blended into the amber Follow /
           Following key below them. */
        #app[class*="BaseLayout_container"] [class*="HomeProfile_metric"] { margin-top: 20px !important; }
        #app[class*="BaseLayout_container"] [class*="CreatorBriefMetric_root"] {
            display: flex !important;
            justify-content: center !important;
            gap: 12px !important;
        }
        #app[class*="BaseLayout_container"] [class*="CreatorBriefMetric_wrap"] {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 4px !important;
            box-sizing: border-box !important;
            min-width: 150px !important;
            height: 76px !important;
            margin: 0 !important;
            padding: 0 22px !important;
            border-radius: 14px !important;
            background: linear-gradient(180deg, rgba(167,139,250,.16), rgba(167,139,250,.05)) !important;
            border: 1px solid rgba(167,139,250,.38) !important;
            box-shadow: inset 0 1px 0 rgba(196,181,253,.14) !important;
        }
        #app[class*="BaseLayout_container"] [class*="CreatorBriefMetric_count"] {
            order: -1 !important;
            margin: 0 !important;
            color: #ffc233 !important;
            font-size: 26px !important;
            font-weight: 800 !important;
            line-height: 1 !important;
            letter-spacing: -.01em !important;
            font-variant-numeric: tabular-nums !important;
        }
        #app[class*="BaseLayout_container"] [class*="CreatorBriefMetric_title"] {
            color: #ddd6fe !important;
            font-size: 12px !important;
            font-weight: 700 !important;
            line-height: 1 !important;
            letter-spacing: .08em !important;
            text-transform: uppercase !important;
        }
        /* Follow: an amber key (the user's choice), a 48px pill. The class
           test ends in "__" so a "following" state class doesn't match. */
        #app[class*="BaseLayout_container"] [class*="HomeProfile_actions"] {
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            gap: 10px !important;
            margin-top: 20px !important;
        }
        #app[class*="BaseLayout_container"] button[class*="ProfileActionButton_button"] {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            box-sizing: border-box !important;
            height: 44px !important;
            min-width: 168px !important;
            padding: 0 24px !important;
            border-radius: 14px !important;
            background: rgba(255,255,255,.06) !important;
            border: 1px solid rgba(255,255,255,.16) !important;
            color: var(--wt-text) !important;
            font-size: 15px !important;
            font-weight: 700 !important;
            line-height: 1 !important;
            transition: background-color .18s ease, border-color .18s ease, box-shadow .18s ease, filter .18s ease !important;
        }
        #app[class*="BaseLayout_container"] button[class*="ProfileActionButton_button"]:hover {
            background: rgba(255,255,255,.1) !important;
            border-color: rgba(255,255,255,.3) !important;
        }
        /* Built like the reader's end-card keys: a raised amber face (top
           highlight, darker bottom lip), a "+" before the label, a lift and
           a turning "+" on hover, and a quick sink on press with a springy
           release. */
        #app[class*="BaseLayout_container"] button[class*="ProfileActionButton_follow__"] {
            gap: 8px !important;
            height: 48px !important;
            min-width: 200px !important;
            padding: 0 28px !important;
            border-radius: 999px !important;
            background: linear-gradient(180deg, #ffd666, #ffbb1f) !important;
            border: 1px solid rgba(255,214,102,.95) !important;
            color: #2a1d00 !important;
            font-size: 16px !important;
            font-weight: 800 !important;
            letter-spacing: .01em !important;
            box-shadow: inset 0 1px 0 rgba(255,255,255,.55), inset 0 -3px 0 rgba(150,95,0,.35), 0 8px 22px rgba(255,194,51,.22) !important;
            transform: none !important;
            -webkit-tap-highlight-color: transparent !important;
            user-select: none !important;
            transition: filter .2s ease, box-shadow .2s ease, transform .28s cubic-bezier(.34,1.56,.64,1) !important;
        }
        #app[class*="BaseLayout_container"] button[class*="ProfileActionButton_follow__"]::before {
            content: '' !important;
            flex: none !important;
            width: 16px !important;
            height: 16px !important;
            background: currentColor !important;
            -webkit-mask: var(--wt-ico-plus) center / contain no-repeat !important;
            mask: var(--wt-ico-plus) center / contain no-repeat !important;
            transition: transform .28s cubic-bezier(.34,1.56,.64,1) !important;
        }
        #app[class*="BaseLayout_container"] button[class*="ProfileActionButton_follow__"]:hover,
        #app[class*="BaseLayout_container"] button[class*="ProfileActionButton_follow__"]:focus-visible {
            background: linear-gradient(180deg, #ffd666, #ffbb1f) !important;
            border-color: #ffe08a !important;
            filter: brightness(1.06) !important;
            box-shadow: inset 0 1px 0 rgba(255,255,255,.6), inset 0 -3px 0 rgba(150,95,0,.35), 0 0 0 4px rgba(255,194,51,.22), 0 14px 30px rgba(255,194,51,.32) !important;
            transform: translateY(-2px) !important;
        }
        #app[class*="BaseLayout_container"] button[class*="ProfileActionButton_follow__"]:hover::before { transform: rotate(90deg) scale(1.1) !important; }
        #app[class*="BaseLayout_container"] button[class*="ProfileActionButton_follow__"]:active {
            transform: translateY(1px) scale(.96) !important;
            box-shadow: inset 0 1px 0 rgba(255,255,255,.4), inset 0 -1px 0 rgba(150,95,0,.35), 0 4px 10px rgba(255,194,51,.2) !important;
            transition-duration: .08s !important;
        }
        /* Following (after a follow): the same size and shape as Follow,
           so the button doesn't jump, as an amber outline with a tick:
           the generic grey pill read as a different, disabled control. */
        #app[class*="BaseLayout_container"] button[class*="ProfileActionButton_following__"] {
            gap: 8px !important;
            height: 48px !important;
            min-width: 200px !important;
            padding: 0 28px !important;
            border-radius: 999px !important;
            background: rgba(255,194,51,.1) !important;
            border: 1px solid rgba(255,194,51,.55) !important;
            color: #ffc233 !important;
            font-size: 16px !important;
            font-weight: 800 !important;
            letter-spacing: .01em !important;
            box-shadow: none !important;
            transition: background-color .18s ease, border-color .18s ease, color .18s ease !important;
        }
        #app[class*="BaseLayout_container"] button[class*="ProfileActionButton_following__"]::before {
            content: '' !important;
            flex: none !important;
            width: 16px !important;
            height: 16px !important;
            background: currentColor !important;
            -webkit-mask: var(--wt-ico-check) center / contain no-repeat !important;
            mask: var(--wt-ico-check) center / contain no-repeat !important;
        }
        #app[class*="BaseLayout_container"] button[class*="ProfileActionButton_following__"]:hover,
        #app[class*="BaseLayout_container"] button[class*="ProfileActionButton_following__"]:focus-visible {
            background: rgba(255,194,51,.17) !important;
            border-color: #ffc233 !important;
            color: #ffd666 !important;
        }
        /* Social link: a 44px disc in the network's own colour (the
           icon is the site's white glyph). A faint glass disc beside the
           amber key was easy to miss (the user's call); other networks get
           a brighter glass disc. Hover adds a soft ring. */
        #app[class*="BaseLayout_container"] button[class*="SocialLinkTrigger_icon"] {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            box-sizing: border-box !important;
            width: 44px !important;
            height: 44px !important;
            border-radius: 50% !important;
            background: var(--wt-sns, rgba(255,255,255,.12)) !important;
            /* From the outer edge: from the padding box the gradient
               repeated under the 1px border, a blue rim along the bottom
               and a yellow one along the top. */
            background-origin: border-box !important;
            border: 1px solid rgba(255,255,255,.28) !important;
            box-shadow: 0 6px 16px rgba(0,0,0,.35) !important;
            transition: filter .15s ease, box-shadow .15s ease, border-color .15s ease !important;
        }
        #app[class*="BaseLayout_container"] button[class*="SocialLinkTrigger_icon"]:has(img[src*="instagram"]) { --wt-sns: radial-gradient(circle at 30% 107%, #fdf497 0%, #fd5949 45%, #d6249f 60%, #285aeb 90%); border-color: rgba(255,255,255,.2) !important; }
        #app[class*="BaseLayout_container"] button[class*="SocialLinkTrigger_icon"]:has(img[src*="youtube"]) { --wt-sns: #ff0033; border-color: rgba(255,255,255,.2) !important; }
        #app[class*="BaseLayout_container"] button[class*="SocialLinkTrigger_icon"]:has(img[src*="facebook"]) { --wt-sns: #1877f2; border-color: rgba(255,255,255,.2) !important; }
        #app[class*="BaseLayout_container"] button[class*="SocialLinkTrigger_icon"]:has(img[src*="twitter"]) { --wt-sns: #000; }
        #app[class*="BaseLayout_container"] button[class*="SocialLinkTrigger_icon"]:hover,
        #app[class*="BaseLayout_container"] button[class*="SocialLinkTrigger_icon"][data-state="open"] {
            border-color: rgba(255,255,255,.5) !important;
            filter: brightness(1.1) !important;
            box-shadow: 0 0 0 4px rgba(255,255,255,.12), 0 8px 20px rgba(0,0,0,.4) !important;
        }
        #app[class*="BaseLayout_container"] [class*="SocialLinkIcon_root"] { background: transparent !important; border-radius: 50% !important; }
        /* Card layout (the user's call): the social button sits after the
           creator's name, sized to it, and the stat tiles and the Follow /
           Following key span the card's full width. The card is a grid
           whose name row centres name + button together; the actions row is
           dissolved (display: contents) so its two children can be placed
           apart. Everything else spans all columns and auto-places. */
        #app[class*="BaseLayout_container"] [class*="HomeProfile_root"] {
            display: grid !important;
            grid-template-columns: 1fr auto auto 1fr !important;
            align-items: center !important;
        }
        #app[class*="BaseLayout_container"] [class*="HomeProfile_root"] > :is([class*="HomeProfile_profileImageWrap"], [class*="ExpandableProfileBio_root"], [class*="HomeProfile_metric"]),
        #app[class*="BaseLayout_container"] [class*="HomeProfile_actions"] > button {
            grid-column: 1 / -1 !important;
        }
        #app[class*="BaseLayout_container"] [class*="HomeProfile_root"] > a[class*="HomeProfile_promotionLink"] {
            grid-column: 1 / -1 !important;
            justify-self: center !important;
        }
        #app[class*="BaseLayout_container"] [class*="HomeProfile_root"] > [class*="HomeProfile_nickname"] { grid-row: 2 !important; grid-column: 2 !important; }
        #app[class*="BaseLayout_container"] [class*="HomeProfile_actions"] { display: contents !important; }
        #app[class*="BaseLayout_container"] [class*="HomeProfile_actions"] > [class*="SocialLinkTrigger_root"] {
            grid-row: 2 !important;
            grid-column: 3 !important;
            margin: 19px 0 0 10px !important;
            line-height: 0 !important;
        }
        #app[class*="BaseLayout_container"] [class*="HomeProfile_actions"] button[class*="SocialLinkTrigger_icon"] {
            width: 30px !important;
            height: 30px !important;
            box-shadow: 0 3px 10px rgba(0,0,0,.35) !important;
        }
        #app[class*="BaseLayout_container"] [class*="HomeProfile_actions"] [class*="SocialLinkIcon_root"] { width: auto !important; height: auto !important; }
        #app[class*="BaseLayout_container"] [class*="HomeProfile_actions"] [class*="SocialLinkIcon_root"] img { width: 16px !important; height: 16px !important; }
        #app[class*="BaseLayout_container"] [class*="HomeProfile_actions"] > button[class*="ProfileActionButton_button"] {
            justify-self: stretch !important;
            width: auto !important;
            min-width: 0 !important;
            margin-top: 20px !important;
        }
        #app[class*="BaseLayout_container"] [class*="CreatorBriefMetric_wrap"] { flex: 1 1 0 !important; min-width: 0 !important; }

        /* "Series" / "Feed": section headings behind the green bar, both
           with their text on one left edge (the card content's), so the
           heading inside the Series card and the one above the feed line
           up. Series is the card's header, set off by a hairline. */
        #app[class*="BaseLayout_container"] h2[class*="HomeTitleBar_root"] {
            display: flex !important;
            align-items: center !important;
            gap: 12px !important;
            height: auto !important;
            margin: 0 !important;
            padding: 20px 22px 16px !important;
            color: #fff !important;
            font-size: 21px !important;
            font-weight: 800 !important;
            line-height: 28px !important;
            letter-spacing: -.01em !important;
        }
        #app[class*="BaseLayout_container"] h2[class*="HomeTitleBar_root"]::before {
            content: '' !important;
            flex: none !important;
            width: 4px !important;
            height: 22px !important;
            border-radius: 2px !important;
            background: var(--wt-accent) !important;
        }
        #app[class*="BaseLayout_container"] [class*="CreatorHomeContainer_info"] > div:has(> [class*="CreatorTitles_content"]) > h2[class*="HomeTitleBar_root"] {
            margin-bottom: 16px !important;
            border-bottom: 1px solid rgba(255,255,255,.07) !important;
        }
        /* Series row: a section card around the site's swiper (its slide
           widths are the JS's, so only the card and the tiles' looks change).
           Covers are rounded and darken on hover, titles turn green, and the
           genre takes its colour (tagGenreLabels() adds the .g_* class). */
        #app[class*="BaseLayout_container"] [class*="CreatorHomeContainer_info"] > div:has(> [class*="CreatorTitles_content"]) {
            margin: 16px 18px 0 !important;
            padding-bottom: 20px !important;
            background: var(--wt-bg-elev) !important;
            border: 1px solid rgba(255,255,255,.08) !important;
            border-top-color: rgba(255,255,255,.14) !important;
            border-radius: 16px !important;
            box-shadow: 0 12px 32px rgba(0,0,0,.35) !important;
            overflow: hidden !important;
        }
        /* Tiles: three to a row, equal width. Swiper lays the slides out
           with slidesPerView "auto" (it measures their CSS width) and an
           18px leading offset, so a slide of a third of the row minus the
           offsets, padded 6px a side, gives three tiles with even 24px
           margins and 12px gaps. A 4th series still scrolls, and only then
           does the right edge fade. */
        /* The site fixes the row at 66px (its bare covers); the tiles are
           taller. */
        #app[class*="BaseLayout_container"] [class*="CreatorTitles_content"],
        #app[class*="BaseLayout_container"] [class*="CreatorTitles_content"] swiper-container { height: auto !important; }
        #app[class*="BaseLayout_container"] [class*="CreatorTitles_content"] swiper-slide {
            height: auto !important;
            box-sizing: border-box !important;
            width: calc((100% - 36px) / 3) !important;
            padding: 0 6px !important;
        }
        #app[class*="BaseLayout_container"] [class*="CreatorTitles_content"]:has(swiper-slide:nth-child(4)) {
            -webkit-mask-image: linear-gradient(90deg, #000 calc(100% - 36px), transparent) !important;
            mask-image: linear-gradient(90deg, #000 calc(100% - 36px), transparent) !important;
        }
        #app[class*="BaseLayout_container"] a[class*="CreatorTitleItem_link"] {
            display: block !important;
            padding: 10px !important;
            border-radius: 14px !important;
            background: rgba(255,255,255,.035) !important;
            border: 1px solid rgba(255,255,255,.07) !important;
            transition: background-color .15s ease, border-color .15s ease !important;
        }
        #app[class*="BaseLayout_container"] a[class*="CreatorTitleItem_link"]:hover {
            background: rgba(255,255,255,.06) !important;
            border-color: rgba(0,213,100,.35) !important;
        }
        #app[class*="BaseLayout_container"] [class*="CreatorTitleItem_root"] {
            display: flex !important;
            align-items: center !important;
            gap: 14px !important;
        }
        #app[class*="BaseLayout_container"] [class*="CreatorTitleItem_info"] {
            flex: 1 1 auto !important;
            min-width: 0 !important;
            width: auto !important;
            padding: 0 !important;
        }
        /* Type · genre: a long genre ("ORIGINALS SUPERHERO") was cut off
           mid-word at the tile's edge. It wraps onto its own line instead,
           and only a genre too long even for that ends in "…". */
        #app[class*="BaseLayout_container"] [class*="CreatorTitleItem_textWrap"] {
            display: flex !important;
            flex-wrap: wrap !important;
            align-items: center !important;
            column-gap: 6px !important;
            row-gap: 2px !important;
            width: auto !important;
            overflow: hidden !important;
            white-space: nowrap !important;
        }
        #app[class*="BaseLayout_container"] [class*="CreatorTitleItem_textWrap"] > :is([class*="CreatorTitleItem_type"], [class*="CreatorTitleItem_genre"]) {
            min-width: 0 !important;
            max-width: 100% !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
        }
        #app[class*="BaseLayout_container"] [class*="CreatorTitleItem_thumbnail"] {
            flex: none !important;
            width: 64px !important;
            height: 64px !important;
            border-radius: 12px !important;
            border-color: rgba(255,255,255,.1) !important;
            overflow: hidden !important;
        }
        #app[class*="BaseLayout_container"] [class*="CreatorTitleItem_image"] { transition: filter .2s ease !important; }
        /* Status badges on the cover (END, UP): white discs with green
           letters, glaring on dark tiles. Inverted to dark discs; the hue
           turn keeps the letters green. */
        #app[class*="BaseLayout_container"] [class*="CreatorTitleItem_badges"] > img {
            border-radius: 50% !important;
            filter: invert(.9) hue-rotate(180deg) brightness(1.7) saturate(1.6) contrast(1.15) drop-shadow(0 1px 3px rgba(0,0,0,.5)) !important;
        }
        #app[class*="BaseLayout_container"] a[class*="CreatorTitleItem_link"]:hover [class*="CreatorTitleItem_image"] { filter: brightness(.7) !important; }
        #app[class*="BaseLayout_container"] [class*="CreatorTitleItem_type"] {
            color: var(--wt-text-read) !important;
            font-size: 11px !important;
            font-weight: 700 !important;
            letter-spacing: .06em !important;
        }
        #app[class*="BaseLayout_container"] [class*="CreatorTitleItem_genre"] {
            margin-left: 0 !important;
            font-size: 11px !important;
            font-weight: 700 !important;
            letter-spacing: .06em !important;
            text-transform: uppercase !important;
        }
        #app[class*="BaseLayout_container"] [class*="CreatorTitleItem_genre"]:not([class*="g_"]) { color: var(--wt-text-dim) !important; }
        #app[class*="BaseLayout_container"] [class*="CreatorTitleItem_image"] { width: 100% !important; height: 100% !important; object-fit: cover !important; }
        #app[class*="BaseLayout_container"] [class*="CreatorTitleItem_title"] {
            display: -webkit-box !important;
            -webkit-box-orient: vertical !important;
            -webkit-line-clamp: 2 !important;
            overflow: hidden !important;
            width: auto !important;
            margin: 4px 0 0 !important;
            white-space: normal !important;
            color: #fff !important;
            font-size: 15px !important;
            font-weight: 700 !important;
            line-height: 20px !important;
            transition: color .15s ease !important;
        }
        #app[class*="BaseLayout_container"] a[class*="CreatorTitleItem_link"]:hover [class*="CreatorTitleItem_title"] { color: var(--wt-accent) !important; }

        /* Feed: a section card like Series (same surface, header with the
           green bar and a hairline), with every post a tile inside it, 16px
           apart (the site split them with full-width hairlines). A heading
           floating above loose post cards didn't line up with the Series
           card. A post's own page (DetailPost) keeps the card look. */
        #app[class*="BaseLayout_container"] [class*="HomeFeed_root"] {
            margin: 16px 18px 0 !important;
            padding-bottom: 18px !important;
            background: var(--wt-bg-elev) !important;
            border: 1px solid rgba(255,255,255,.08) !important;
            border-top-color: rgba(255,255,255,.14) !important;
            border-radius: 16px !important;
            box-shadow: 0 12px 32px rgba(0,0,0,.35) !important;
        }
        #app[class*="BaseLayout_container"] [class*="HomeFeed_root"] h2[class*="HomeTitleBar_root"] {
            margin-bottom: 16px !important;
            border-bottom: 1px solid rgba(255,255,255,.07) !important;
        }
        #app[class*="BaseLayout_container"] [class*="CreatorHomePostList_root"] > ul {
            display: flex !important;
            flex-direction: column !important;
            gap: 16px !important;
        }
        /* Same 24px inset as the Series tiles. */
        #app[class*="BaseLayout_container"] [class*="HomeFeed_root"] [class*="CreatorHomePostList_root"] > ul { padding: 0 6px !important; }
        #app[class*="BaseLayout_container"] section[class*="Post_root"] {
            padding: 18px 20px 16px !important;
            background: var(--wt-bg-elev) !important;
            border: 1px solid rgba(255,255,255,.08) !important;
            border-top-color: rgba(255,255,255,.14) !important;
            border-radius: 16px !important;
            box-shadow: 0 8px 24px rgba(0,0,0,.3) !important;
        }
        /* Posts in the feed: raised cards with a little life, a faint
           green light in the top-left corner over a soft top-to-bottom
           sheen, a brighter top edge, and a lift with a green edge on
           hover. The footer (reactions, comments) sits under a hairline. */
        #app[class*="BaseLayout_container"] [class*="HomeFeed_root"] section[class*="Post_root"] {
            background:
                radial-gradient(110% 70% at 0% 0%, rgba(0,213,100,.075), rgba(0,213,100,0) 55%),
                linear-gradient(180deg, #2b3037, #24282e) !important;
            border: 1px solid rgba(255,255,255,.08) !important;
            border-top-color: rgba(255,255,255,.16) !important;
            border-radius: 16px !important;
            box-shadow: 0 10px 26px rgba(0,0,0,.32), inset 0 1px 0 rgba(255,255,255,.04) !important;
            transition: transform .2s ease, border-color .2s ease, box-shadow .2s ease !important;
        }
        #app[class*="BaseLayout_container"] [class*="HomeFeed_root"] section[class*="Post_root"]:hover {
            transform: translateY(-2px) !important;
            border-color: rgba(0,213,100,.28) !important;
            box-shadow: 0 16px 34px rgba(0,0,0,.4), 0 0 0 1px rgba(0,213,100,.1) !important;
        }
        #app[class*="BaseLayout_container"] [class*="HomeFeed_root"] [class*="PostFooter_root"] {
            margin-top: 14px !important;
            padding-top: 12px !important;
            border-top: 1px solid rgba(255,255,255,.07) !important;
        }
        #app[class*="BaseLayout_container"] [class*="Username_root"] {
            color: #fff !important;
            font-size: 15px !important;
            font-weight: 700 !important;
        }
        #app[class*="BaseLayout_container"] [class*="PostHeader_lastRow"] time { color: var(--wt-text-read) !important; font-size: 13px !important; }
        /* ⋮ and the reaction picker: round ghost buttons, lit while open. */
        #app[class*="BaseLayout_container"] button[class*="MoreActionMenu_button"],
        #app[class*="BaseLayout_container"] button[class*="ReactionButton_triggerButton"] {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            width: 34px !important;
            height: 34px !important;
            border-radius: 50% !important;
            color: var(--wt-text-mute) !important;
            transition: background-color .15s ease, color .15s ease !important;
        }
        #app[class*="BaseLayout_container"] button[class*="MoreActionMenu_button"]:hover,
        #app[class*="BaseLayout_container"] button[class*="MoreActionMenu_button"][data-state="open"],
        #app[class*="BaseLayout_container"] button[class*="ReactionButton_triggerButton"]:hover,
        #app[class*="BaseLayout_container"] button[class*="ReactionButton_triggerButton"][data-state="open"] {
            background: rgba(255,255,255,.1) !important;
            color: #fff !important;
        }
        /* The ⋮ was barely visible: its dots are painted from the app's
           own grey (fill="var(--gw-icon-05)"), so the button's colour never
           reached them. A glass disc with bright dots, a size up (the
           user asked for it brighter); white on hover. */
        #app[class*="BaseLayout_container"] button[class*="MoreActionMenu_button"] {
            width: 36px !important;
            height: 36px !important;
            background: rgba(255,255,255,.07) !important;
            border: 1px solid rgba(255,255,255,.14) !important;
            color: var(--wt-text) !important;
        }
        #app[class*="BaseLayout_container"] button[class*="MoreActionMenu_button"] svg { width: 24px !important; height: 24px !important; }
        #app[class*="BaseLayout_container"] button[class*="MoreActionMenu_button"] svg path { fill: currentColor !important; }
        #app[class*="BaseLayout_container"] button[class*="MoreActionMenu_button"]:is(:hover, [data-state="open"]) {
            background: rgba(255,255,255,.16) !important;
            border-color: rgba(255,255,255,.3) !important;
        }
        /* Post text: the comments' near-white reading size. */
        #app[class*="BaseLayout_container"] p[class*="Text_content"] {
            margin-top: 4px !important;
            color: #eef0f3 !important;
            font-size: 16px !important;
            line-height: 1.55 !important;
        }
        #app[class*="BaseLayout_container"] button[class*="Text_expand"] {
            padding: 0 0 0 16px !important;  /* the site's "…" sits in it */
            color: var(--wt-accent-soft) !important;
            font-size: 14px !important;
            font-weight: 600 !important;
            text-decoration: none !important;
        }
        #app[class*="BaseLayout_container"] button[class*="Text_expand"]:hover { color: var(--wt-accent) !important; text-decoration: underline !important; }
        #app[class*="BaseLayout_container"] [class*="ImageContent_root"] {
            margin-top: 14px !important;
            border-radius: 12px !important;
            overflow: hidden !important;
        }
        #app[class*="BaseLayout_container"] [class*="PostFooter_root"] { margin-top: 10px !important; align-items: center !important; }
        #app[class*="BaseLayout_container"] [class*="PostFooter_root"] [class*="Count_root"] {
            color: var(--wt-text) !important;
            font-size: 16px !important;
            font-weight: 700 !important;
            line-height: 24px !important;
            font-variant-numeric: tabular-nums !important;
        }
        #app[class*="BaseLayout_container"] [class*="PostFooter_comment"] { transition: color .15s ease !important; }
        #app[class*="BaseLayout_container"] a:hover [class*="PostFooter_comment"] [class*="Count_root"] { color: var(--wt-accent-soft) !important; }
        /* Latest comment under a post: a soft glass row (the site's was a
           grey-outlined box). */
        #app[class*="BaseLayout_container"] a[class*="PostPreviewComment_root"] {
            margin: 12px 0 0 !important;
            padding: 12px 14px !important;
            background: rgba(255,255,255,.035) !important;
            border: 1px solid rgba(255,255,255,.07) !important;
            border-radius: 12px !important;
            transition: background-color .15s ease, border-color .15s ease !important;
        }
        #app[class*="BaseLayout_container"] a[class*="PostPreviewComment_root"]:hover {
            background: rgba(255,255,255,.06) !important;
            border-color: rgba(255,255,255,.14) !important;
        }
        #app[class*="BaseLayout_container"] [class*="PostPreviewComment_name"] { color: #fff !important; font-size: 14px !important; font-weight: 700 !important; margin-right: 8px !important; }
        #app[class*="BaseLayout_container"] [class*="PostPreviewComment_text"] { color: var(--wt-text-body) !important; font-size: 14px !important; }
        /* Follow beside a post's author (feed, post page): an 11px label
           that was easy to miss. Amber text (the profile's Follow colour)
           at 14px on no background (the user's call), a soft amber pill on
           hover; Following is quiet grey. */
        #app[class*="BaseLayout_container"] button[class*="FollowButton_root"] {
            height: 32px !important;
            padding: 0 12px !important;
            border-radius: 999px !important;
            background: transparent !important;
            border: 0 !important;
            transition: background-color .15s ease !important;
        }
        #app[class*="BaseLayout_container"] button[class*="FollowButton_root"] [class*="FollowButton_text"] {
            color: var(--wt-text-read) !important;
            font-size: 14px !important;
            font-weight: 700 !important;
            letter-spacing: .01em !important;
            transition: color .15s ease !important;
        }
        #app[class*="BaseLayout_container"] button[class*="FollowButton_follow__"] [class*="FollowButton_text"] { color: #ffc233 !important; }
        #app[class*="BaseLayout_container"] button[class*="FollowButton_root"]:hover,
        #app[class*="BaseLayout_container"] button[class*="FollowButton_root"]:focus-visible { background: rgba(255,194,51,.12) !important; }
        #app[class*="BaseLayout_container"] button[class*="FollowButton_follow__"]:hover [class*="FollowButton_text"] { color: #ffd666 !important; }
        /* Community feeds (/p/community/<lang>/feeds): the posts were
           stacked edge to edge, each card's border on the next one's. */
        #app[class*="BaseLayout_container"] ul[class*="FeedList_feedList"] {
            display: flex !important;
            flex-direction: column !important;
            gap: 20px !important;
            padding: 20px 18px 32px !important;  /* the first post touched the tab bar */
        }
        /* Feeds page chrome. The tab bar (Following / Trending) was a
           flat strip with 14px grey labels; the period filter ("This
           week") a bare grey label whose menu was a light-bordered box;
           the empty / logged-out states a grey slab button under small
           grey text. Now: a frosted tab bar like the top bar, with white
           bold labels on the active tab and a rounded green indicator;
           the filter a glass pill opening the theme's menu panel; the
           empty state a card with the green key as its one action. */
        #app[class*="BaseLayout_container"] [class*="FeedTabBar_container"] {
            height: 48px !important;
            background: rgba(21,23,26,.86) !important;
            -webkit-backdrop-filter: blur(12px) !important;
            backdrop-filter: blur(12px) !important;
            border-bottom: 1px solid rgba(255,255,255,.08) !important;
        }
        #app[class*="BaseLayout_container"] button[class*="FeedTabBar_tabButton"] {
            color: var(--wt-text-dim) !important;
            font-size: 15px !important;
            font-weight: 600 !important;
            line-height: 15px !important;
            transition: color .15s ease, background-color .15s ease !important;
        }
        #app[class*="BaseLayout_container"] button[class*="FeedTabBar_tabButton"]:hover { color: #fff !important; background: rgba(255,255,255,.03) !important; }
        #app[class*="BaseLayout_container"] button[class*="FeedTabBar_tabButton"][aria-selected="true"] { color: #fff !important; font-weight: 700 !important; }
        #app[class*="BaseLayout_container"] [class*="Indicator_indicator"] {
            height: 3px !important;
            margin-top: -1px !important;
            border-radius: 3px 3px 0 0 !important;
            background-color: var(--wt-accent) !important;
        }
        #app[class*="BaseLayout_container"] [class*="CreatorFeedContainer_container"] { padding-top: 48px !important; }
        #app[class*="BaseLayout_container"] [class*="FollowingFeedPanel_container"] { padding: 0 18px !important; }
        #app[class*="BaseLayout_container"] [class*="PeriodFilter_root"] { height: auto !important; margin: 16px 0 4px !important; }
        #app[class*="BaseLayout_container"] [class*="PeriodFilter_button"] {
            gap: 6px !important;
            height: 36px !important;
            padding: 0 12px 0 16px !important;
            border-radius: 999px !important;
            background: rgba(255,255,255,.06) !important;
            border: 1px solid rgba(255,255,255,.14) !important;
            color: var(--wt-text) !important;
            font-size: 14px !important;
            font-weight: 600 !important;
            transition: background-color .15s ease, border-color .15s ease !important;
        }
        #app[class*="BaseLayout_container"] [class*="PeriodFilter_button"]:hover,
        #app[class*="BaseLayout_container"] [class*="PeriodFilter_button"][aria-expanded="true"],
        #app[class*="BaseLayout_container"] [class*="PeriodFilter_button"][data-state="open"] {
            background: rgba(255,255,255,.1) !important;
            border-color: rgba(255,255,255,.28) !important;
            color: #fff !important;
        }
        [class*="PeriodFilter_list"] {
            min-width: 160px !important;
            padding: 6px !important;
            background: #2a2f36 !important;
            border: 1px solid rgba(255,255,255,.1) !important;
            border-radius: 12px !important;
            box-shadow: 0 16px 40px rgba(0,0,0,.55), 0 2px 8px rgba(0,0,0,.35) !important;
        }
        [class*="PeriodFilter_list"] [class*="PeriodFilter_itemWrapper"]:not(:first-child) { border-top: 0 !important; }
        [class*="PeriodFilter_list"] [class*="PeriodFilter_item__"] {
            height: 40px !important;
            padding: 0 12px 0 10px !important;
            background: transparent !important;
            border: 0 !important;
            border-radius: 8px !important;
            color: var(--wt-text) !important;
            font-size: 15px !important;
            transition: background-color .12s ease, color .12s ease !important;
        }
        [class*="PeriodFilter_list"] [class*="PeriodFilter_item__"]:hover,
        [class*="PeriodFilter_list"] [class*="PeriodFilter_item__"]:focus-visible,
        [class*="PeriodFilter_list"] [class*="PeriodFilter_item__"][data-highlighted] { background: rgba(255,255,255,.08) !important; color: #fff !important; outline: none !important; }
        [class*="PeriodFilter_list"] [class*="PeriodFilter_item__"][aria-selected="true"] { background: rgba(0,213,100,.14) !important; color: var(--wt-accent-soft) !important; font-weight: 600 !important; }
        [class*="PeriodFilter_list"] [class*="PeriodFilter_checkIcon"] { color: var(--wt-accent-soft) !important; }
        #app[class*="BaseLayout_container"] [class*="TrendingFeedAffordance_root"],
        #app[class*="BaseLayout_container"] [class*="ErrorPage_container"] {
            box-sizing: border-box !important;
            width: 100% !important;
            max-width: 520px !important;
            margin: 0 auto !important;
            padding: 30px 28px 28px !important;
            background:
                radial-gradient(90% 60% at 50% 0%, rgba(0,213,100,.1), rgba(0,213,100,0) 70%),
                var(--wt-bg-elev) !important;
            border: 1px solid rgba(255,255,255,.08) !important;
            border-top-color: rgba(255,255,255,.14) !important;
            border-radius: 18px !important;
            box-shadow: 0 12px 32px rgba(0,0,0,.35) !important;
        }
        /* The logged-out prompt is the same element as the panel the site
           sizes to the viewport (FollowingFeedPanel_loginGuidePage), so
           the card ran to the bottom of the screen. */
        #app[class*="BaseLayout_container"] [class*="ErrorPage_container"] {
            flex-grow: 0 !important;
            height: auto !important;
            margin: 18vh auto 0 !important;
        }
        #app[class*="BaseLayout_container"] [class*="TrendingFeedAffordance_profileImage__"] {
            border-radius: 50% !important;
            box-shadow: 0 0 0 3px var(--wt-bg-elev) !important;
        }
        #app[class*="BaseLayout_container"] :is([class*="TrendingFeedAffordance_text"], [class*="ErrorPage_text"]) {
            margin-top: 14px !important;
            color: var(--wt-text-body) !important;
            font-size: 16px !important;
            line-height: 1.55 !important;
            text-wrap: balance !important;
        }
        /* "You're all caught up!" is a headline; the login prompt is one
           sentence broken mid-way, so it stays plain. */
        #app[class*="BaseLayout_container"] [class*="TrendingFeedAffordance_text"]::first-line { color: #fff !important; font-weight: 700 !important; }
        #app[class*="BaseLayout_container"] :is(a, button):is([class*="TrendingFeedAffordance_trendingFeedButton"], [class*="ErrorPage_button"]) {
            height: 48px !important;
            margin-top: 22px !important;
            border-radius: 14px !important;
            background: var(--wt-key) !important;
            border: 1px solid var(--wt-key-edge) !important;
            color: #fff !important;
            font-size: 16px !important;
            font-weight: 700 !important;
            box-shadow: inset 0 1px 0 rgba(255,255,255,.35), 0 8px 20px rgba(0,213,100,.2) !important;
            transition: filter .18s ease, box-shadow .18s ease !important;
        }
        #app[class*="BaseLayout_container"] :is(a, button):is([class*="TrendingFeedAffordance_trendingFeedButton"], [class*="ErrorPage_button"]):hover,
        #app[class*="BaseLayout_container"] :is(a, button):is([class*="TrendingFeedAffordance_trendingFeedButton"], [class*="ErrorPage_button"]):focus-visible {
            box-shadow: inset 0 1px 0 rgba(255,255,255,.4), 0 0 0 4px rgba(0,213,100,.18), 0 12px 28px rgba(0,213,100,.3) !important;
        }
        /* A post's own page: the post card sits in a 15px gutter
           (DetailPost_root), the comment widget below it did not, so the
           Top / Newest panel ran 15px wider on each side. The login bar
           was glued to the post card's bottom edge. */
        #app[class*="BaseLayout_container"] #wcc_root .wcc_Editor__creatorPost { margin: 16px 15px 0 !important; }
        #app[class*="BaseLayout_container"] #wcc_root .wcc_SortOrderTabs__root,
        #app[class*="BaseLayout_container"] #wcc_root .wcc_CommentList__list:not(.wcc_ReplyFolder__root *),
        #app[class*="BaseLayout_container"] #wcc_root .wcc_CommentMore__root {
            margin-left: 15px !important;
            margin-right: 15px !important;
        }

        /* Mature-content notice ("This series contains adult themes ...
           Proceed to view content?", No / Yes), the reader's popup
           template: .ly_wrap > .ly_box > .ly_adult > strong.title + p +
           p.button_area > a.button._no + a.button._yes, over
           #_dimForPopup. Base: a flat box with two dark, near-invisible
           buttons. Now a dialog card: an amber "heads up" badge (amber is
           the theme's notice colour), a bold title, the message in reading
           text, and two equal buttons: No a glass outline, Yes the green
           read button. The words are the site's (translated). */
        #_dimForPopup.ly_dim {
            background: rgba(5,6,8,.72) !important;
            -webkit-backdrop-filter: blur(4px) !important;
            backdrop-filter: blur(4px) !important;
            opacity: 1 !important;
        }
        /* One layer: painted on the child too, the dim stacked to ~92%
           with a second full-screen blur. .bg stays as the click target. */
        #_dimForPopup .bg {
            background: transparent !important;
            -webkit-backdrop-filter: none !important;
            backdrop-filter: none !important;
        }
        .ly_wrap .ly_box:has(> .ly_adult) {
            box-sizing: border-box !important;
            width: 440px !important;
            max-width: calc(100vw - 32px) !important;
            padding: 0 !important;
            background:
                radial-gradient(90% 60% at 50% 0%, rgba(255,194,51,.08), rgba(255,194,51,0) 70%),
                var(--wt-bg-elev) !important;
            border: 1px solid rgba(255,255,255,.1) !important;
            border-top-color: rgba(255,255,255,.18) !important;
            border-radius: 20px !important;
            box-shadow: 0 24px 64px rgba(0,0,0,.6), 0 4px 14px rgba(0,0,0,.35) !important;
            animation: wt-pop-in .18s ease-out !important;
        }
        .ly_wrap .ly_adult {
            width: auto !important;
            height: auto !important;
            margin: 0 !important;
            padding: 30px 30px 26px !important;
            background: transparent !important;
            text-align: center !important;
        }
        .ly_wrap .ly_adult::before {
            content: '' !important;
            display: block !important;
            width: 56px !important;
            height: 56px !important;
            margin: 0 auto 16px !important;
            background: var(--wt-notice-badge) center / contain no-repeat !important;
        }
        .ly_wrap .ly_adult .title {
            display: block !important;
            margin: 0 0 10px !important;
            color: #fff !important;
            font-size: 22px !important;
            font-weight: 800 !important;
            line-height: 28px !important;
            letter-spacing: -.01em !important;
        }
        .ly_wrap .ly_adult p:not(.button_area) {
            margin: 0 !important;
            padding: 0 !important;
            color: var(--wt-text-body) !important;
            font-size: 15px !important;
            line-height: 1.6 !important;
            text-wrap: balance !important;
        }
        .ly_wrap .ly_adult .button_area {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 10px !important;
            margin: 26px 0 0 !important;
            padding: 0 !important;
            border: 0 !important;
        }
        .ly_wrap .ly_adult .button_area .button {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            box-sizing: border-box !important;
            width: auto !important;
            height: 48px !important;
            margin: 0 !important;
            padding: 0 16px !important;
            border-radius: 14px !important;
            font-size: 16px !important;
            font-weight: 700 !important;
            line-height: 1 !important;
            text-decoration: none !important;
            transition: background-color .18s ease, border-color .18s ease, box-shadow .18s ease, filter .18s ease, color .18s ease !important;
        }
        .ly_wrap .ly_adult .button_area .button._no {
            background: rgba(255,255,255,.06) !important;
            border: 1px solid rgba(255,255,255,.16) !important;
            color: var(--wt-text) !important;
        }
        .ly_wrap .ly_adult .button_area .button._no:hover,
        .ly_wrap .ly_adult .button_area .button._no:focus-visible {
            background: rgba(255,255,255,.11) !important;
            border-color: rgba(255,255,255,.3) !important;
            color: #fff !important;
        }
        .ly_wrap .ly_adult .button_area .button._yes {
            background: var(--wt-key) !important;
            border: 1px solid var(--wt-key-edge) !important;
            color: #fff !important;
            box-shadow: inset 0 1px 0 rgba(255,255,255,.35), 0 8px 20px rgba(0,213,100,.2) !important;
        }
        .ly_wrap .ly_adult .button_area .button._yes:hover,
        .ly_wrap .ly_adult .button_area .button._yes:focus-visible {
            color: #fff !important;
            box-shadow: inset 0 1px 0 rgba(255,255,255,.4), 0 0 0 4px rgba(0,213,100,.18), 0 12px 28px rgba(0,213,100,.3) !important;
        }
    `;

    /* Optional: dim panels in the viewer for late-night reading. */
    const dimCss = `
        .viewer_lst img, .viewer_img img {
            filter: brightness(.78) !important;
        }
    `;
    /* Optional: hide the reader's scroll-to-top button (issue #2: it sits over
       the comic). Its own <style>, so it also works with the theme off. */
    const topBtnCss = `
        body.wt-viewer .go_top { display: none !important; }
    `;

    function ensureStyle(id, css, on) {
        let el = document.getElementById(id);
        if (on) {
            if (!el) {
                el = document.createElement('style');
                el.id = id;
                el.textContent = css;
                (document.head || document.documentElement).appendChild(el);
            }
        } else if (el) {
            el.remove();
        }
    }

    // Settings. Tampermonkey, Violentmonkey and ScriptCat have the sync GM_*
    // API; Greasemonkey 4 and Userscripts (Safari) only the async GM.*. There
    // a localStorage mirror gives the first paint its setting, and GM storage
    // corrects it once it answers. Values are cached in variables, so the hot
    // paths never touch storage.
    const syncGM = typeof GM_getValue === 'function' && typeof GM_setValue === 'function';
    const asyncGM = !syncGM && typeof GM !== 'undefined' && GM && typeof GM.getValue === 'function';
    const MIRROR = 'wt-dark-mode:';
    function loadPref(key, def) {
        if (syncGM) { try { return GM_getValue(key, def); } catch { /* fall back */ } }
        try { const v = localStorage.getItem(MIRROR + key); return v === null ? def : JSON.parse(v); } catch { return def; }
    }
    function savePref(key, val) {
        if (syncGM) { try { GM_setValue(key, val); return; } catch { /* fall back */ } }
        try { localStorage.setItem(MIRROR + key, JSON.stringify(val)); } catch { /* storage blocked */ }
        if (asyncGM) GM.setValue(key, val).catch(() => {});
    }

    // First-run default follows the OS preference — once the user toggles, their
    // choice persists and OS changes are ignored.
    const themeDefault = !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    let darkOn = loadPref(KEY_THEME, themeDefault);
    let dimOn = loadPref(KEY_DIM, false);
    let vignetteOn = loadPref(KEY_VIGNETTE, true);
    let topBtnOn = loadPref(KEY_TOP_BTN, true);

    // Windows contrast themes (forced colours): the OS already paints a
    // high-contrast palette, and under it the theme's mask icons and
    // box-shadow focus rings vanish, so the theme steps aside while one is on.
    const forcedColors = window.matchMedia ? window.matchMedia('(forced-colors: active)') : null;
    const themeActive = () => darkOn && !(forcedColors && forcedColors.matches);

    // Set a hook on <html> so power users can write their own CSS like
    //     html[data-wt-dark="on"] .my-thing { ... }
    // and have it scoped to only fire when our theme is active.
    const applyTheme = () => {
        const on = themeActive();
        ensureStyle('wt-dark-style', palette + theme, on);
        document.documentElement.dataset.wtDark = on ? 'on' : 'off';
    };
    const applyDim = () => ensureStyle('wt-dim-style', dimCss, dimOn);
    // The vignette lives in the theme CSS, gated on this attribute, so it
    // follows the theme on/off state without a separate <style>.
    const applyVignette = () => {
        document.documentElement.dataset.wtVignette = vignetteOn ? 'on' : 'off';
    };
    const applyTopButton = () => ensureStyle('wt-topbtn-style', topBtnCss, !topBtnOn);

    applyTheme();
    applyDim();
    applyVignette();
    applyTopButton();
    if (forcedColors && forcedColors.addEventListener) {
        forcedColors.addEventListener('change', () => { applyTheme(); if (themeActive()) domPass(); else undoDomTweaks(); });
    }

    // Creator Dashboard (/<lang>/creators/…; DASHBOARD opens it as a full
    // page load) gates its CSS on this attribute. Set once and never
    // changed: its rules include html[data-wt-dashboard] ::before / ::after,
    // so changing the attribute would restyle the whole page.
    if (/^\/[a-z]{2}(?:-[a-z]+)?\/creators(?:\/|$)/.test(location.pathname)) {
        document.documentElement.setAttribute('data-wt-dashboard', '');
    }

    // Header login flash. The page always ships "Log In" and the site
    // swaps in the account name only once its getUserInfo() request
    // returns, so a logged-in reader saw LOG IN on every page load. If the
    // last page was logged in, hide the button (CSS on data-wt-auth) until
    // the name shows up. Only a page with the site header can tell: the
    // reader, the community app and the mobile site have none, so they
    // leave the remembered state alone. Capped: if no name appears in time
    // (logged out elsewhere, slow network) the button comes back.
    const KEY_LOGGED_IN = 'wt_logged_in';
    const AUTH_WAIT_MS = 4000;
    let loggedIn = loadPref(KEY_LOGGED_IN, false);
    if (loggedIn) document.documentElement.dataset.wtAuth = 'pending';
    function setLoggedIn(on) {
        if (loggedIn !== on) { loggedIn = on; savePref(KEY_LOGGED_IN, on); }
    }
    function watchLoginState() {
        document.addEventListener('click', (e) => {
            if (e.target.closest && e.target.closest('._btnLogout')) setLoggedIn(false);
        }, true);
        const started = Date.now();
        const timer = setInterval(() => {
            const info = document.getElementById('btnLoginInfo');
            const login = document.getElementById('btnLogin');
            const shown = !!info && info.style.display !== 'none';
            const noHeader = !info && !login;
            const timedOut = Date.now() - started > AUTH_WAIT_MS;
            if (!shown && !noHeader && !timedOut) return;
            clearInterval(timer);
            if (!noHeader) setLoggedIn(shown);
            delete document.documentElement.dataset.wtAuth;
        }, 120);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watchLoginState, { once: true });
    else watchLoginState();
    if (asyncGM) {
        // Greasemonkey 4 / Userscripts: the stored settings arrive after the
        // first paint; adopt them if the localStorage mirror was stale.
        const keys = [KEY_THEME, KEY_DIM, KEY_VIGNETTE, KEY_TOP_BTN, KEY_LOGGED_IN];
        Promise.all(keys.map(k => GM.getValue(k))).then((vals) => {
            // Refresh the mirror, so the next page paints with these.
            vals.forEach((v, i) => { if (typeof v === 'boolean') { try { localStorage.setItem(MIRROR + keys[i], JSON.stringify(v)); } catch { /* storage blocked */ } } });
            const [t, d, v, b] = vals;
            if (typeof t === 'boolean' && t !== darkOn) { darkOn = t; applyTheme(); }
            if (typeof d === 'boolean' && d !== dimOn) { dimOn = d; applyDim(); }
            if (typeof v === 'boolean' && v !== vignetteOn) { vignetteOn = v; applyVignette(); }
            if (typeof b === 'boolean' && b !== topBtnOn) { topBtnOn = b; applyTopButton(); }
            registerMenu();
        }).catch(() => {});
    }

    // Guard: put our <style> elements back if something removes them (not
    // seen on the current site; cheap, it only runs on <head> child changes).
    // Never sync the body classes from here: head changes can arrive while
    // the previous page's DOM is still in place.
    function watchHead() {
        if (!document.head) return;
        new MutationObserver(() => {
            if (themeActive() && !document.getElementById('wt-dark-style')) applyTheme();
            if (dimOn && !document.getElementById('wt-dim-style')) applyDim();
            if (!topBtnOn && !document.getElementById('wt-topbtn-style')) applyTopButton();
        }).observe(document.head, { childList: true });
    }
    if (document.head) watchHead();
    else document.addEventListener('DOMContentLoaded', watchHead, { once: true });

    function toggleTheme() {
        darkOn = !darkOn;
        savePref(KEY_THEME, darkOn);
        applyTheme();
        if (themeActive()) domPass(); else undoDomTweaks();
        console.info('[webtoons-dark-mode] theme →', darkOn ? 'dark' : 'light');
        registerMenu();
    }
    function toggleDim() {
        dimOn = !dimOn;
        savePref(KEY_DIM, dimOn);
        applyDim();
        console.info('[webtoons-dark-mode] reader dim →', dimOn ? 'on' : 'off');
        registerMenu();
    }
    function toggleVignette() {
        vignetteOn = !vignetteOn;
        savePref(KEY_VIGNETTE, vignetteOn);
        applyVignette();
        console.info('[webtoons-dark-mode] edge vignette →', vignetteOn ? 'on' : 'off');
        registerMenu();
    }
    function toggleTopButton() {
        topBtnOn = !topBtnOn;
        savePref(KEY_TOP_BTN, topBtnOn);
        applyTopButton();
        console.info('[webtoons-dark-mode] reader scroll-to-top button →', topBtnOn ? 'shown' : 'hidden');
        registerMenu();
    }

    // Menu entries say what a click will do ("Turn off dark mode" / "Turn on
    // dark mode"), so someone who changed a setting long ago can still see
    // how to undo it. Every toggle — menu or keyboard shortcut — relabels.
    // All entries are re-added, not just the changed one, because a re-added
    // entry lands at the bottom of the list. Without GM_unregisterMenuCommand
    // labels can't change, so they stay neutral ("Toggle …") instead of going
    // stale or piling up duplicates.
    const canRelabel = typeof GM_unregisterMenuCommand === 'function';
    let menuIds = [];
    function registerMenu() {
        if (typeof GM_registerMenuCommand !== 'function') return;
        if (menuIds.length) {
            if (!canRelabel) return;
            menuIds.forEach(id => GM_unregisterMenuCommand(id));
        }
        const entries = [
            // [state, label while on, label while off, neutral label, action]
            [darkOn, 'Turn off dark mode', 'Turn on dark mode', 'Toggle Webtoons dark mode', toggleTheme],
            [dimOn, 'Turn off reader dim', 'Turn on reader dim', 'Toggle reader dim', toggleDim],
            [vignetteOn, 'Hide edge shading', 'Show edge shading', 'Toggle edge shading (vignette)', toggleVignette],
            [topBtnOn, 'Hide scroll-to-top button in reader', 'Show scroll-to-top button in reader',
                'Toggle scroll-to-top button in reader', toggleTopButton],
        ];
        menuIds = entries.map(([on, whenOn, whenOff, neutral, action]) =>
            GM_registerMenuCommand(canRelabel ? (on ? whenOn : whenOff) : neutral, action));
    }
    registerMenu();

    // Keyboard shortcuts. Multiple combos so the user can use whichever doesn't
    // conflict with their OS / browser / keyboard-layout switcher:
    //   - Alt+Shift+T  OR  Ctrl+Alt+D       → toggle theme
    //   - Alt+Shift+N  OR  Ctrl+Alt+Shift+D → toggle reader dim
    //   - Alt+Shift+V  OR  Ctrl+Alt+Shift+V → toggle edge vignette
    // Note: bare Alt+D opens the address bar; Alt+Shift on Windows can also
    // trigger the input-language switcher, which can swallow Alt+Shift+T on
    // multi-language setups. The Ctrl+Alt+D backup avoids both. Windows sends
    // AltGr as Ctrl+Alt, so Ctrl+Alt+D is ignored when it types a character
    // (Đ on Hungarian / Czech / Croatian layouts, ð on US-International).
    function matchCombo(e, want) {
        if (!!e.altKey !== want.alt) return false;
        if (!!e.shiftKey !== want.shift) return false;
        if (!!e.ctrlKey !== want.ctrl) return false;
        if (e.metaKey) return false; // never with Cmd
        const key = e.key || '';
        // A Latin letter other than ours, or a symbol, is AltGr text. A letter
        // of another script (в on a Cyrillic layout) is that layout's own key,
        // so the combo keeps working there.
        if (e.ctrlKey && e.altKey && (key === 'Dead' || ([...key].length === 1 &&
            key.toUpperCase() !== want.letter &&
            (/\p{Script=Latin}/u.test(key) || !/\p{L}/u.test(key))))) return false;
        return e.code === want.code || key.toUpperCase() === want.letter;
    }
    function handleKey(e) {
        if (e.isComposing) return;
        const themeAltShiftT = matchCombo(e, { alt: true, shift: true, ctrl: false, code: 'KeyT', letter: 'T' });
        const themeCtrlAltD = matchCombo(e, { alt: true, shift: false, ctrl: true, code: 'KeyD', letter: 'D' });
        const dimAltShiftN = matchCombo(e, { alt: true, shift: true, ctrl: false, code: 'KeyN', letter: 'N' });
        const dimCtrlAltShD = matchCombo(e, { alt: true, shift: true, ctrl: true, code: 'KeyD', letter: 'D' });
        const vigAltShiftV = matchCombo(e, { alt: true, shift: true, ctrl: false, code: 'KeyV', letter: 'V' });
        const vigCtrlAltShV = matchCombo(e, { alt: true, shift: true, ctrl: true, code: 'KeyV', letter: 'V' });
        const action = (themeAltShiftT || themeCtrlAltD) ? toggleTheme
            : (dimAltShiftN || dimCtrlAltShD) ? toggleDim
            : (vigAltShiftV || vigCtrlAltShV) ? toggleVignette : null;
        if (!action) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        if (e.repeat) return;  // holding the keys: one toggle per press
        try { action(); } catch (err) { console.error('[webtoons-dark-mode] toggle failed:', err); }
    }
    // Capture phase on window catches all keydowns before any page handler,
    // regardless of which element has focus.
    window.addEventListener('keydown', handleKey, true);

    // Page-type classes on <body> (wt-viewer / wt-detail / wt-home) gate the
    // vignette and the reader rules. JS is the only gate: no CSS :has()
    // fallbacks. The URL gives the type before the first paint;
    // syncBodyClasses() corrects it from the DOM at DOMContentLoaded.
    // www only: m.webtoons.com has none of these layouts. Every www route
    // change is a full page load (episode links included), so there is no
    // SPA navigation to follow; the community app (/p/community) is an SPA
    // but uses none of these classes.
    function routeBodyClass() {
        if (location.hostname !== 'www.webtoons.com') return '';
        const p = location.pathname;
        if (/\/viewer\/?$/.test(p)) return 'wt-viewer';
        if (/\/list\/?$/.test(p) && /[?&]title_no=/.test(location.search)) return 'wt-detail';
        if (/^\/[a-z]{2}(?:-[a-z]+)?\/(?:(?:originals|genres|ranking|search)(?:\/[^/]*)?)?$/i.test(p)) return 'wt-home';
        return '';
    }
    const earlyClass = routeBodyClass();
    if (earlyClass) {
        const put = () => document.body.classList.add(earlyClass);
        if (document.body) put();
        else new MutationObserver((_, o) => { if (document.body) { o.disconnect(); put(); } })
            .observe(document.documentElement, { childList: true });
    }
    function syncBodyClasses() {
        if (!document.body) return;
        const isViewer = !!document.querySelector('#content.viewer');
        // Detail page: series episode list (has the full-width artwork banner).
        const isDetail = !isViewer && !!document.querySelector('.detail_bg');
        // Home / genre listing pages: has the trending carousel or series grid,
        // but is not a detail or viewer page.
        const isHome = !isViewer && !isDetail && !!document.querySelector('.main_section, .webtoon_list_wrap');
        document.body.classList.toggle('wt-viewer', isViewer);
        document.body.classList.toggle('wt-detail', isDetail);
        document.body.classList.toggle('wt-home', isHome);
    }
    document.addEventListener('DOMContentLoaded', syncBodyClasses);

    // Mark light-background promo banners (/canvas .contest_banner) so CSS can
    // dim them. The site sets an inline background-color that matches each
    // rotating creative; dark creatives are left untouched.
    function tuneContestBanners() {
        document.querySelectorAll('.contest_banner').forEach(a => {
            const m = (a.style.backgroundColor || '').match(/\d+(\.\d+)?/g);
            if (!m || m.length < 3) return;
            const [r, g, b] = m.slice(0, 3).map(Number);
            const light = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 > 0.5;
            a.toggleAttribute('data-wt-light', light);
        });
    }

    // /canvas sort: the theme shows the dropdown's options as an always-open
    // switch and hides its trigger, but the site ignores option clicks
    // unless its own menu state says "open" (opening it programmatically
    // first was not enough). The site's click ends in a load of the same
    // list with ?sortOrder=<data-sort> from page 1, so do exactly that.
    document.addEventListener('click', (e) => {
        if (!themeActive()) return;
        const opt = e.target.closest && e.target.closest('.sort_area._sorting .sort_box a[data-sort]');
        if (!opt) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        const url = new URL(location.href);
        url.searchParams.set('sortOrder', opt.dataset.sort);
        url.searchParams.delete('page');
        if (url.href !== location.href) location.assign(url.href);
    }, true);

    // Series synopsis: collapse long ones to 6 lines (CSS .wt-clamp) with a
    // chevron toggle. Only text longer than 8 lines is clamped. The button
    // carries no visible text: the same markup serves every language
    // edition. Its state is exposed through aria-expanded, its name in the
    // page's language.
    const SYNOPSIS_MIN_LINES = 8;
    const SYNOPSIS_LABEL = {
        en: 'Show full synopsis', es: 'Mostrar la sinopsis completa', fr: 'Afficher le résumé complet',
        de: 'Vollständige Zusammenfassung anzeigen', id: 'Tampilkan sinopsis lengkap',
        th: 'แสดงเรื่องย่อทั้งหมด', 'zh-hant': '顯示完整簡介',
    };
    function clampSynopsis() {
        const s = document.querySelector('.aside.detail .summary');
        if (!s || s.dataset.wtClamp) return;
        const lh = parseFloat(getComputedStyle(s).lineHeight);
        if (!lh || s.scrollHeight <= lh * SYNOPSIS_MIN_LINES) return;
        s.dataset.wtClamp = '1';
        if (!s.id) s.id = 'wtSynopsis';
        s.classList.add('wt-clamp');
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'wt-summary-toggle';
        btn.hidden = true;  // shown only by the theme CSS
        btn.setAttribute('aria-controls', s.id);
        btn.setAttribute('aria-expanded', 'false');
        const lang = (document.documentElement.lang || 'en').toLowerCase();
        btn.setAttribute('aria-label', SYNOPSIS_LABEL[lang] || SYNOPSIS_LABEL[lang.split('-')[0]] || SYNOPSIS_LABEL.en);
        const setOpen = (open) => {
            s.classList.toggle('wt-open', open);
            btn.setAttribute('aria-expanded', String(open));
        };
        btn.addEventListener('click', () => setOpen(!s.classList.contains('wt-open')));
        s.addEventListener('click', () => { if (!s.classList.contains('wt-open')) setOpen(true); });
        s.after(btn);
    }

    // Comment avatars. WCC renders no profile picture, so stamp each comment
    // with its author's initial + a stable colour bucket (hash of the name)
    // and let CSS draw the circle.
    const AVATAR_COLOURS = 8;
    function tagCommentAvatars() {
        if (!document.getElementsByClassName('wcc_App__root').length) return;
        document.querySelectorAll('.wcc_CommentItem__inside:not([data-wt-initial])').forEach(el => {
            const nameEl = el.querySelector('.wcc_CommentHeader__name');
            const name = nameEl && nameEl.textContent.trim();
            if (!name) return;
            let hash = 0;
            for (const ch of name) hash = (hash * 31 + ch.codePointAt(0)) >>> 0;
            el.dataset.wtInitial = Array.from(name)[0].toUpperCase();
            el.dataset.wtHue = String(hash % AVATAR_COLOURS);
        });
    }
    // Search suggestions: the site's highlight template leaves a line break
    // right after the bolded match ("Selfish <strong>Roman</strong>\nce"),
    // which renders as a space inside the word ("Roman ce"). Trim it. Only a
    // leading line break is removed, never a real typed space.
    const HIGHLIGHT_GAP = /^[ \t]*\n\s*/;
    function fixSearchHighlights() {
        document.querySelectorAll('.search_area strong').forEach(st => {
            const t = st.nextSibling;
            if (t && t.nodeType === 3 && HIGHLIGHT_GAP.test(t.data)) t.data = t.data.replace(HIGHLIGHT_GAP, '');
        });
    }
    // Reader ranking tiles: the site serves 92px thumbnails (?type=a92) for
    // its 64px sidebar rows. The theme shows them as ~100px cover tiles,
    // where they look soft, so ask the same CDN for its 210px size. The
    // site re-renders Top Originals when its genre filter changes, which
    // is why this runs from the DOM pass, not once.
    function upgradeRankingThumbs() {
        document.querySelectorAll('.aside.viewer .lst_type1 img[src*="type=a92"]').forEach(img => {
            img.src = img.src.replace('type=a92', 'type=a210');
        });
    }
    // Reply toggles carry only translated text ("Replies 5", "Reply 1",
    // "Reply"), so stamp the count (trailing digits, 0 if none) for CSS to
    // highlight the ones that open a conversation. Re-read every pass: the
    // count changes when someone replies.
    function tagReplyToggles() {
        document.querySelectorAll('.wcc_ReplyFolderToggle__root').forEach(b => {
            const m = (b.textContent || '').match(/(\d[\d,.]*)\s*$/);
            const n = m ? m[1].replace(/\D/g, '') : '0';
            if (b.dataset.wtReplies !== n) b.dataset.wtReplies = n;
        });
    }
    // /canvas genre labels: the home page marks each with a .g_* class
    // (g_romance, g_comedy, ...) that the theme colours, but the genre
    // lists and the Top CANVAS / Up & Coming rail print only the name.
    // Derive the same class from the name so every page shows one colour
    // per genre. Names are per language edition; ones that don't match a
    // colour class keep the muted grey. data-wt-genre remembers the class
    // added, so turning the theme off can take it away again (the light
    // site colours g_* labels too).
    const GENRE_ALIAS = { sci_fi: 'sf', superhero: 'super_hero' };
    const ON_COMMUNITY = location.pathname.startsWith('/p/community/');
    const GENRE_LABELS = '.challenge_cont_area .genre:not([data-wt-genre]), .aside.challenge .info_area .genre:not([data-wt-genre]), .detail_header .info.challenge .genre:not([data-wt-genre])'
        + (ON_COMMUNITY ? ', [class*="CreatorTitleItem_genre"]:not([data-wt-genre])' : '');
    function tagGenreLabels() {
        document.querySelectorAll(GENRE_LABELS).forEach(p => {
            if (/(^|\s)g_/.test(p.className)) { p.dataset.wtGenre = ''; return; }
            const key = (p.textContent || '').trim().toLowerCase().replace(/[^a-z]+/g, '_').replace(/^_+|_+$/g, '');
            p.dataset.wtGenre = key;
            if (key) p.classList.add('g_' + (GENRE_ALIAS[key] || key));
        });
    }
    // Patreon blocks show the creator's monthly amount, which reads "$0"
    // when the creator doesn't share earnings. Mark it so CSS can hide
    // the zero (and its divider) instead of advertising nothing.
    const ZERO_AMOUNT = /^\D*0(?:[.,]0+)?\D*$/;
    function tagPatronAmount() {
        document.querySelectorAll('#patronAmount').forEach(a => {
            const box = a.closest('p, span');
            if (box) box.toggleAttribute('data-wt-zero', ZERO_AMOUNT.test(a.textContent.trim()));
        });
    }
    // Creator bio (community app): its two-line clamp cuts letter by
    // letter, so a folded bio ended mid-word ("…for publishers such as
    // Webtoon, Scholas... more"). Drop the partial word, and the comma or
    // space before it, from the text in front of the ellipsis. The full bio
    // is only rendered once expanded, so nothing is lost; the original text
    // is kept so turning the theme off can put it back.
    const bioCuts = new Map();  // text node → { original, trimmed }
    function trimBioCut() {
        if (!ON_COMMUNITY) return;
        for (const t of bioCuts.keys()) if (!t.isConnected) bioCuts.delete(t);
        document.querySelectorAll('.LinesEllipsis--clamped > .LinesEllipsis-ellipsis').forEach(el => {
            let t = el.previousSibling;
            if (t && t.nodeName === 'WBR') t = t.previousSibling;
            if (!t || t.nodeType !== 3) return;
            const seen = bioCuts.get(t);
            if (seen && seen.trimmed === t.data) return;
            // Cut on a word boundary already: only tidy the trailing space.
            const trimmed = /\s$/.test(t.data)
                ? t.data.replace(/[\s,;:]+$/, '')
                : t.data.replace(/\s+\S*$/, '').replace(/[\s,;:]+$/, '');
            if (!trimmed || trimmed === t.data) return;
            bioCuts.set(t, { original: t.data, trimmed });
            t.data = trimmed;
        });
    }
    // The emoji picker (<em-gw-emoji-picker>, emoji-mart) paints its
    // bottom category bar #fff from a stylesheet inside its open shadow
    // root, which no page CSS can reach (its other colours inherit, see
    // the theme). Put one rule into the shadow root while the theme is on.
    const EMOJI_NAV_CSS = '#nav{background:var(--wt-bg-elev)!important;border-top-color:rgba(255,255,255,.08)!important;border-radius:0 0 13px 13px!important}';
    function darkenEmojiPickers() {
        const on = themeActive();
        document.querySelectorAll('em-gw-emoji-picker').forEach(el => {
            const root = el.shadowRoot;
            if (!root) return;
            const st = root.getElementById('wt-dark-nav');
            if (on && !st) {
                const s = document.createElement('style');
                s.id = 'wt-dark-nav';
                s.textContent = EMOJI_NAV_CSS;
                root.appendChild(s);
            } else if (!on && st) st.remove();
        });
    }

    // The DOM pass: everything above that marks up the page for the theme.
    // It runs only while the theme is on, from the first parsed nodes on
    // (so server-rendered labels are tagged before the first paint), at
    // most once per frame, and never for changes to the Chapter Preloader's
    // progress bubble (a separate script that rewrites it on every image).
    function domPass() {
        if (!themeActive()) return;
        tagCommentAvatars();
        tagReplyToggles();
        fixSearchHighlights();
        upgradeRankingThumbs();
        tagGenreLabels();
        tagPatronAmount();
        trimBioCut();
        darkenEmojiPickers();
        tuneContestBanners();
        // The synopsis is measured once, complete: not while it is parsing.
        if (document.readyState !== 'loading') clampSynopsis();
    }
    // Theme turned off: put the site's own markup back where the light site
    // would show it. (data-wt-* attributes and the hidden synopsis button
    // have no effect without the theme CSS.)
    function undoDomTweaks() {
        document.querySelectorAll('[data-wt-genre]').forEach(p => {
            const key = p.dataset.wtGenre;
            if (key) p.classList.remove('g_' + (GENRE_ALIAS[key] || key));
            delete p.dataset.wtGenre;
        });
        bioCuts.forEach((v, t) => { if (t.isConnected && t.data === v.trimmed) t.data = v.original; });
        bioCuts.clear();
        darkenEmojiPickers();
    }
    const PRELOADER_BUBBLE = '__wt_preloader_status';
    const isPreloaderRecord = (r) => r.target.id === PRELOADER_BUBBLE ||
        [...r.addedNodes, ...r.removedNodes].every(n => n.id === PRELOADER_BUBBLE);
    let passQueued = false;
    new MutationObserver((records) => {
        if (passQueued || !themeActive() || records.every(isPreloaderRecord)) return;
        passQueued = true;
        requestAnimationFrame(() => { passQueued = false; domPass(); });
    }).observe(document.documentElement, { childList: true, subtree: true });
    document.addEventListener('DOMContentLoaded', domPass);

    console.info(`[webtoons-dark-mode] v${VERSION} fully loaded — Alt+Shift+T / Ctrl+Alt+D: theme | Alt+Shift+N / Ctrl+Alt+Shift+D: dim | Alt+Shift+V / Ctrl+Alt+Shift+V: vignette`);
})();
