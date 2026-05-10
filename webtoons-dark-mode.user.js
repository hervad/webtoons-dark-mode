// ==UserScript==
// @name         Webtoons Dark Mode
// @namespace    https://github.com/hervad/webtoons-dark-mode
// @version      1.0.1
// @description  Targeted dark theme for Webtoons (desktop + mobile). Persistent toggle, optional reader dim, no image inversion, no SPA observers.
// @author       hervad
// @match        https://www.webtoons.com/*
// @match        https://m.webtoons.com/*
// @icon         https://www.webtoons.com/favicon.ico
// @run-at       document-start
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @noframes
// @license      MIT
// @homepageURL  https://github.com/hervad/webtoons-dark-mode
// @supportURL   https://github.com/hervad/webtoons-dark-mode/issues
// @updateURL    https://raw.githubusercontent.com/hervad/webtoons-dark-mode/main/webtoons-dark-mode.user.js
// @downloadURL  https://raw.githubusercontent.com/hervad/webtoons-dark-mode/main/webtoons-dark-mode.user.js
// ==/UserScript==

(function () {
    'use strict';

    const KEY_THEME = 'wt_dark_enabled';
    const KEY_DIM   = 'wt_reader_dim';

    /* ---------- palette (one place to retheme everything) ---------- */
    const palette = `
        :root {
            --wt-bg:        #15171a;
            --wt-bg-elev:   #1e2125;
            --wt-bg-elev2:  #262a30;
            --wt-bg-input:  #2a2e35;
            --wt-border:    #2c3036;
            --wt-text:      #e6e6e6;
            --wt-text-dim:  #a0a4ab;
            --wt-text-mute: #6b7079;
            --wt-link:      #7cb6ff;
            --wt-accent:    #00d564;
            --wt-shadow:    0 1px 2px rgba(0,0,0,.6);
        }
    `;

    /* ---------- theme: targeted selectors, no global filter ---------- */
    const theme = `
        html, body {
            background-color: var(--wt-bg) !important;
            color: var(--wt-text) !important;
            scrollbar-color: var(--wt-bg-elev2) var(--wt-bg);
        }

        /* Text */
        h1, h2, h3, h4, h5, h6, p, dt, dd, label, em, strong, small,
        .tit, .sub_tit, .subj, .author, .genre, .grade_num, .info, .summary {
            color: var(--wt-text) !important;
        }
        .desc, .date, .count, .from, .ico_view, .ico_grade, .num,
        .grade_area, .info_area .author, .nick, .meta, .help_txt, .comment_count {
            color: var(--wt-text-dim) !important;
        }

        /* Links */
        a, a:visited { color: var(--wt-text) !important; }
        a:hover      { color: var(--wt-link) !important; }
        .NPI a, .lk_link, .more, .btn_link { color: var(--wt-link) !important; }

        /* Header / global nav */
        #header, .header, .gnb_wrap, #gnbWrap, .gnb, .lnb, .header_bn {
            background-color: var(--wt-bg-elev) !important;
            border-color: var(--wt-border) !important;
            box-shadow: var(--wt-shadow) !important;
        }
        .gnb a, .lnb a            { color: var(--wt-text) !important; }
        .gnb .on a, .lnb .on a    { color: var(--wt-accent) !important; }

        /* Cards / lists */
        .card_lst li, .card_item, .detail_lst li, .lst_area li,
        .daily_lst li, .ranking_lst li, .genre_lst li, .challenge_lst li,
        ._popularList li, ._dailyList li {
            background-color: var(--wt-bg-elev) !important;
            border-color: var(--wt-border) !important;
            border-radius: 6px;
        }
        .card_lst li:hover, .card_item:hover, .detail_lst li:hover {
            background-color: var(--wt-bg-elev2) !important;
        }

        /* Sections */
        #content, .cont_area, .section, .wrap, .container,
        .detail_body, .detail_header, .detail_lst_wrap {
            background-color: var(--wt-bg) !important;
            color: var(--wt-text) !important;
        }

        /* Popups / modals */
        .layer_popup, ._popupLayer, .layer_box, .pop_layer,
        .modal, .dialog, .tooltip, .balloon, .ly_box {
            background-color: var(--wt-bg-elev) !important;
            color: var(--wt-text) !important;
            border: 1px solid var(--wt-border) !important;
            box-shadow: 0 8px 24px rgba(0,0,0,.5) !important;
        }

        /* Tone down marketing banners */
        .header_bn, .bnr_area, .ad_bnr, ._bannerArea, .promotion_bnr {
            background: var(--wt-bg-elev) !important;
            filter: brightness(.85);
        }

        /* Tabs (older markup) */
        .tab_lst li, .tab_lst a, .sub_tab li, .sub_tab a {
            background-color: var(--wt-bg-elev) !important;
            color: var(--wt-text-dim) !important;
            border-color: var(--wt-border) !important;
        }
        .tab_lst li.on, .tab_lst li.on a, .sub_tab li.on, .sub_tab li.on a {
            background-color: var(--wt-bg-elev2) !important;
            color: var(--wt-accent) !important;
        }

        /* Sub-nav (snb): day-of-week picker AND genre tabs share this component */
        .snb_wrap, .snb_inner, .snb {
            background-color: var(--wt-bg) !important;
            border-color: var(--wt-border) !important;
        }
        .snb_item, .snb_tab, ._snb_tab_a {
            background-color: transparent !important;
            color: var(--wt-text-dim) !important;
            border-color: var(--wt-border) !important;
        }
        .snb_item:hover .snb_tab, .snb_tab:hover { color: var(--wt-text) !important; }
        .snb_item.is_selected .snb_tab,
        .snb_tab[aria-current="true"],
        .snb_tab[aria-current="page"] {
            color: var(--wt-accent) !important;
        }
        .btn_snb_prev, .btn_snb_next {
            background-color: var(--wt-bg-elev) !important;
            color: var(--wt-text) !important;
            border: 1px solid var(--wt-border) !important;
        }

        /* List page section header: "143 series" + by Popularity / Likes / Date */
        .webtoon_list_wrap, .section_header {
            background-color: var(--wt-bg) !important;
            color: var(--wt-text) !important;
        }
        .series_count, .series_count .number, .series_count span {
            color: var(--wt-text-dim) !important;
        }
        .sort_area, .sort_by_area {
            background-color: transparent !important;
        }
        .sort_by, ._sort_by_a {
            color: var(--wt-text-dim) !important;
            background-color: transparent !important;
        }
        .sort_by[aria-current="true"], ._sort_by_a[aria-current="true"] {
            color: var(--wt-text) !important;
        }

        /* Notice strip above the footer (shown conditionally) */
        .notice_area, #noticeArea {
            background-color: var(--wt-bg-elev) !important;
            color: var(--wt-text-dim) !important;
            border-top: 1px solid var(--wt-border) !important;
            border-bottom: 1px solid var(--wt-border) !important;
        }
        .notice_area a, #noticeArea a { color: var(--wt-text) !important; }

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
        button:hover, .btn:hover { background-color: #30353c !important; }
        .btn_subscribe, .btn_main, ._btnSubscribe {
            background-color: var(--wt-accent) !important;
            color: #0a0a0a !important;
            border-color: var(--wt-accent) !important;
        }

        /* Inputs */
        input, textarea, select {
            background-color: var(--wt-bg-input) !important;
            color: var(--wt-text) !important;
            border: 1px solid var(--wt-border) !important;
            caret-color: var(--wt-text) !important;
        }
        input::placeholder, textarea::placeholder { color: var(--wt-text-mute) !important; }
        .search_area, .search_box, ._searchBox {
            background-color: var(--wt-bg-elev) !important;
            border-color: var(--wt-border) !important;
        }

        /* Episode list */
        ._listInfo, .episode_lst, ._episodeItem {
            background-color: var(--wt-bg) !important;
        }
        .detail_lst li, ._episodeItem {
            background-color: var(--wt-bg-elev) !important;
            border-bottom: 1px solid var(--wt-border) !important;
        }

        /* Viewer (reading page) */
        #_viewerArea, .viewer_lst, .viewer_lst .on, .viewer_header,
        .viewer_footer, ._toolBox, .ly_episode {
            background-color: var(--wt-bg) !important;
            color: var(--wt-text) !important;
        }
        /* Never touch comic panels */
        .viewer_lst img, ._images, ._images img, .viewer_img img { filter: none !important; }

        /* Comments (Naver u_cbox widget) */
        #_cmtArea, .cmt_area, .u_cbox, .u_cbox_content_wrap,
        .u_cbox_comment_box, .u_cbox_write, .u_cbox_module {
            background-color: var(--wt-bg) !important;
            color: var(--wt-text) !important;
        }
        .u_cbox_comment, .u_cbox_reply_area {
            background-color: var(--wt-bg-elev) !important;
            border: 1px solid var(--wt-border) !important;
            border-radius: 4px;
        }
        .u_cbox_nick, .u_cbox_name        { color: var(--wt-link) !important; }
        .u_cbox_contents, .u_cbox_text    { color: var(--wt-text) !important; }
        .u_cbox_date, .u_cbox_info_txt    { color: var(--wt-text-mute) !important; }

        /* Footer */
        #footer, .footer, .ft_lnk, .ft_area {
            background-color: var(--wt-bg-elev) !important;
            color: var(--wt-text-dim) !important;
            border-top: 1px solid var(--wt-border) !important;
        }
        .footer a, #footer a { color: var(--wt-text-dim) !important; }

        /* Scrollbars (WebKit) */
        ::-webkit-scrollbar              { width: 10px; height: 10px; }
        ::-webkit-scrollbar-track        { background: var(--wt-bg); }
        ::-webkit-scrollbar-thumb        {
            background: var(--wt-bg-elev2);
            border-radius: 5px;
            border: 2px solid var(--wt-bg);
        }
        ::-webkit-scrollbar-thumb:hover  { background: #3a4049; }

        /* Selection */
        ::selection { background: var(--wt-accent); color: #0a0a0a; }

        /* Pure-white badge chips */
        .label, .badge, .ico_new, .ico_up, .ico_hot {
            background-color: var(--wt-bg-elev2) !important;
            color: var(--wt-text) !important;
        }

        /* Mobile (m.webtoons.com) */
        .header_wrap, .navigation, .nav_wrap, .lst_episode, .episode_cont {
            background-color: var(--wt-bg) !important;
            color: var(--wt-text) !important;
        }
    `;

    /* Optional: dim panels in the viewer for late-night reading. */
    const dimCss = `
        .viewer_lst img, ._images img, .viewer_img img,
        ._mobile_viewer img, ._scroll_view img {
            filter: brightness(.78) !important;
        }
    `;

    function ensureStyle(id, css, on) {
        let el = document.getElementById(id);
        if (on && !el) {
            el = document.createElement('style');
            el.id = id;
            el.textContent = css;
            (document.head || document.documentElement).appendChild(el);
        } else if (!on && el) {
            el.remove();
        }
    }

    const applyTheme = (on) => ensureStyle('wt-dark-style', palette + theme, on);
    const applyDim   = (on) => ensureStyle('wt-dim-style',  dimCss,           on);

    applyTheme(GM_getValue(KEY_THEME, true));
    applyDim(GM_getValue(KEY_DIM, false));

    function toggle(key, fn, defaultVal) {
        const next = !GM_getValue(key, defaultVal);
        GM_setValue(key, next);
        fn(next);
    }

    if (typeof GM_registerMenuCommand === 'function') {
        GM_registerMenuCommand('Toggle Webtoons dark mode', () => toggle(KEY_THEME, applyTheme, true));
        GM_registerMenuCommand('Toggle reader dim',         () => toggle(KEY_DIM,   applyDim,   false));
    }

    // Alt+Shift+T = theme, Alt+Shift+N = night dim. Avoid bare Alt+D (= focus URL bar).
    window.addEventListener('keydown', (e) => {
        if (!e.altKey || !e.shiftKey || e.ctrlKey || e.metaKey) return;
        if (e.code === 'KeyT') { e.preventDefault(); toggle(KEY_THEME, applyTheme, true); }
        else if (e.code === 'KeyN') { e.preventDefault(); toggle(KEY_DIM, applyDim, false); }
    }, true);
})();
