// ==UserScript==
// @name         Webtoons Dark Mode
// @namespace    https://github.com/hervad/webtoons-dark-mode
// @version      1.0.5
// @description  Targeted dark theme for Webtoons (desktop + mobile). Respects OS dark/light preference on first install. Persistent toggle, optional reader dim, no image inversion.
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
            --wt-bg:              #15171a;
            --wt-bg-elev:         #1e2125;
            --wt-bg-elev2:        #262a30;
            --wt-bg-hover:        #30353c;
            --wt-bg-input:        #2a2e35;
            --wt-border:          #363b44;
            --wt-text:            #e6e6e6;
            --wt-text-dim:        #a0a4ab;
            --wt-text-mute:       #7b828d;
            --wt-text-on-accent:  #0a0a0a;
            --wt-link:            #7cb6ff;
            --wt-accent:          #00d564;
            --wt-shadow:          0 1px 2px rgba(0,0,0,.6);
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
        button:hover, .btn:hover { background-color: var(--wt-bg-hover) !important; }
        .btn_subscribe, .btn_main, ._btnSubscribe {
            background-color: var(--wt-accent) !important;
            color: var(--wt-text-on-accent) !important;
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

        /* Footer social icons (sprite glyphs — invisible against dark bg). */
        .btn_foot_facebook, .btn_foot_instagram, .btn_foot_twitter,
        .btn_foot_youtube, .btn_foot_pinterest, .btn_foot_line {
            filter: brightness(0) invert(1) opacity(.85) !important;
        }
        .btn_foot_facebook:hover, .btn_foot_instagram:hover, .btn_foot_twitter:hover,
        .btn_foot_youtube:hover, .btn_foot_pinterest:hover, .btn_foot_line:hover {
            filter: brightness(0) invert(1) opacity(1) !important;
        }

        /* Footer language selector (English ▾ button + dropdown) */
        .foot_menu .language .lk_lang {
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
        ::selection { background: var(--wt-accent); color: var(--wt-text-on-accent); }

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

        /* "Recently viewed" floating bar on the right edge.
           The site paints a white PNG background — we replace it with our dark surface. */
        .recently_area {
            background: var(--wt-bg-elev) !important;
            background-image: none !important;
            border-left: 1px solid var(--wt-border) !important;
        }
        .recently_area .t_recently,
        .recently_area .t_recently2,
        .recently_cont .subj { color: var(--wt-text) !important; }
        .recently_cont .episode { color: var(--wt-text-dim) !important; }
        .recently_cont .bar { background: var(--wt-border) !important; }
        .recently_area.unfd [class$="_line"] { border-left-color: var(--wt-border) !important; }

        /* Login modal (Naver SNS-login widget). Uses ._loginLayer / ._loginDimLayer
           injected by /static/bundle/common/gnb-*.js when "Log In" is clicked. */
        ._loginDimLayer { background: rgba(0,0,0,.7) !important; }
        ._loginLayer, ._loginComponentParent,
        ._defaultLoginComponent, .emailLoginComponent {
            background: var(--wt-bg-elev) !important;
            color: var(--wt-text) !important;
            border: 1px solid var(--wt-border) !important;
            box-shadow: 0 12px 32px rgba(0,0,0,.6) !important;
        }
        ._loginLayer h1, ._loginLayer h2, ._loginLayer h3,
        ._loginLayer p, ._loginLayer label, ._loginLayer span,
        ._defaultLoginComponent h1, ._defaultLoginComponent h2,
        ._defaultLoginComponent p, ._defaultLoginComponent span,
        ._defaultLoginComponent label {
            color: var(--wt-text) !important;
            background: transparent !important;
        }
        ._btnLoginSns, .btn_sns, ._emailLoginButton, ._btnLoginEmail {
            background: var(--wt-bg-elev2) !important;
            color: var(--wt-text) !important;
            border: 1px solid var(--wt-border) !important;
        }
        ._btnLoginSns:hover, .btn_sns:hover,
        ._emailLoginButton:hover, ._btnLoginEmail:hover {
            background: var(--wt-bg-hover) !important;
        }
        ._btnLoginLayerClose, ._backToDefaultLoginButton { color: var(--wt-text) !important; }

        /* ---------- Series detail page (e.g. /<lang>/<genre>/<slug>/list?title_no=...) ---------- */

        /* The episode list and "You may also like" cards are explicitly white
           in the base CSS — both follow our dark surface now. */
        .detail_body .detail_lst {
            background: var(--wt-bg) !important;
            border-right-color: var(--wt-border) !important;
        }
        .detail_other .lst_type1 li, .lst_type1 li {
            background: var(--wt-bg-elev) !important;
            border-color: var(--wt-border) !important;
            border-radius: 6px;
        }
        .lst_type1 li:hover { background: var(--wt-bg-elev2) !important; }
        .lst_type1 .subj   { color: var(--wt-text) !important; }
        .lst_type1 .author { color: var(--wt-text-dim) !important; }
        .lst_type1 .grade_num, .lst_type1 .grade_area { color: var(--wt-text-mute) !important; }
        .detail_other h2 { color: var(--wt-text) !important; }
        .detail_other h2 .point { color: var(--wt-accent) !important; }

        /* Skin image (per-series artwork at the top of the page).
           Don't override the artist's background-image — just dim it so the
           bright artwork doesn't clash with our dark chrome on the sides. */
        .detail_bg { filter: brightness(.55) !important; }

        /* Title-banner social-share icons (FB / X / Tumblr / Reddit / Copy / RSS)
           and stats icons (view / subscribe / grade). Sprite glyphs from a
           dark-on-transparent SVG sheet — same trick as the footer icons. */
        .ico_facebook, .ico_twitter, .ico_tumblr, .ico_reddit,
        .ico_copy, .ico_rss,
        .ico_subscribe, .ico_view, .ico_view2,
        .ico_grade, .ico_grade2 {
            filter: brightness(0) invert(1) opacity(.85) !important;
        }
        .ico_facebook:hover, .ico_twitter:hover, .ico_tumblr:hover, .ico_reddit:hover,
        .ico_copy:hover, .ico_rss:hover {
            filter: brightness(0) invert(1) opacity(1) !important;
        }

        /* Pagination row at the bottom of the episode list */
        .paginate a, .paginate strong, .paginate span {
            color: var(--wt-text-dim) !important;
        }
        .paginate a:hover { color: var(--wt-text) !important; }
        .paginate .on, .paginate [aria-current="true"] {
            color: var(--wt-text-on-accent) !important;
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
        if (on) {
            if (!el) {
                el = document.createElement('style');
                el.id = id;
                (document.head || document.documentElement).appendChild(el);
            }
            if (el.textContent !== css) el.textContent = css;
        } else if (el) {
            el.remove();
        }
    }

    // Set a hook on <html> so power users can write their own CSS like
    //     html[data-wt-dark="on"] .my-thing { ... }
    // and have it scoped to only fire when our theme is active.
    const applyTheme = (on) => {
        ensureStyle('wt-dark-style', palette + theme, on);
        document.documentElement.dataset.wtDark = on ? 'on' : 'off';
    };
    const applyDim = (on) => ensureStyle('wt-dim-style', dimCss, on);

    // First-run default follows the OS preference — once the user toggles, their
    // choice persists and OS changes are ignored.
    const prefersDark = !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const themeDefault = prefersDark;

    applyTheme(GM_getValue(KEY_THEME, themeDefault));
    applyDim(GM_getValue(KEY_DIM, false));

    // SPA / late-loading bundle defense: if our <style> ever gets removed
    // (Webtoons swaps stylesheets on some chapter transitions), put it back.
    // Cheap — only fires on direct childList changes to <head>.
    function watchHead() {
        if (!document.head) return;
        new MutationObserver(() => {
            if (GM_getValue(KEY_THEME, themeDefault) && !document.getElementById('wt-dark-style')) {
                applyTheme(true);
            }
            if (GM_getValue(KEY_DIM, false) && !document.getElementById('wt-dim-style')) {
                applyDim(true);
            }
        }).observe(document.head, { childList: true });
    }
    if (document.head) watchHead();
    else document.addEventListener('DOMContentLoaded', watchHead, { once: true });

    function toggle(key, fn, defaultVal) {
        const next = !GM_getValue(key, defaultVal);
        GM_setValue(key, next);
        fn(next);
    }

    if (typeof GM_registerMenuCommand === 'function') {
        GM_registerMenuCommand('Toggle Webtoons dark mode', () => toggle(KEY_THEME, applyTheme, themeDefault));
        GM_registerMenuCommand('Toggle reader dim',         () => toggle(KEY_DIM,   applyDim,   false));
    }

    // Alt+Shift+T = theme, Alt+Shift+N = night dim. Avoid bare Alt+D (= focus URL bar).
    window.addEventListener('keydown', (e) => {
        if (!e.altKey || !e.shiftKey || e.ctrlKey || e.metaKey) return;
        if (e.code === 'KeyT') { e.preventDefault(); toggle(KEY_THEME, applyTheme, themeDefault); }
        else if (e.code === 'KeyN') { e.preventDefault(); toggle(KEY_DIM, applyDim, false); }
    }, true);
})();
