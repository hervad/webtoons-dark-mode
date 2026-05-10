// ==UserScript==
// @name         Webtoons Dark Mode
// @namespace    https://github.com/hervad/webtoons-dark-mode
// @version      1.0.74
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
    const KEY_DIM = 'wt_reader_dim';
    const VERSION = '1.0.74';

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

        /* Header / global nav — border-color and box-shadow only on the outer
           header shell, NOT on .gnb/.lnb nav lists (causes nav item artifacts). */
        #header, .header, .gnb_wrap, #gnbWrap, .header_bn {
            background-color: var(--wt-bg-elev) !important;
            border-color: var(--wt-border) !important;
            box-shadow: var(--wt-shadow) !important;
        }
        .gnb, .lnb {
            background-color: var(--wt-bg-elev) !important;
        }
        .gnb a, .lnb a {
            color: var(--wt-text) !important;
            font-family: system-ui, -apple-system, 'Segoe UI', sans-serif !important;
            font-size: 23px !important;
            font-weight: 600 !important;
            letter-spacing: .05em !important;
            padding: 15px 20px !important;
            border-radius: 6px !important;
            transition: color .15s, background-color .15s !important;
        }
        /* Active page link — accent green + inset underline (box-shadow avoids
           clipping, works even when the parent has overflow:hidden). */
        .gnb .on a, .lnb .on a {
            color: var(--wt-accent) !important;
            box-shadow: inset 0 -2px 0 var(--wt-accent) !important;
            border-radius: 6px 6px 0 0 !important;
        }
        /* Hover — rounded dark pill + accent text. */
        .gnb a:hover, .lnb a:hover, .gnb .link:hover, .header .link_menu:hover {
            color: var(--wt-accent) !important;
            background-color: var(--wt-bg-elev2) !important;
            border-radius: 6px !important;
        }

        /* Search button (top-right of header). Base CSS sets a light-grey
           circle (#f3f3f3) which is nearly invisible on our dark header. */
        .header_right .btn_search {
            background: var(--wt-bg-elev2) !important;
            border: 1px solid var(--wt-border) !important;
        }
        .header_right .btn_search:hover { background: var(--wt-bg-hover) !important; }
        .header_right .btn_search:before { filter: brightness(0) invert(1) opacity(.85) !important; }
        /* Log In button hover -- base CSS is #e0e0e0 (light grey, almost white).
           That made our white-glyph icon disappear into the hover background. */
        .header_right .link_login:hover, .header_right .btn_login:hover {
            background: var(--wt-bg-hover) !important;
        }

        /* Search dropdown — three nested layers: .search_area (outer panel) →
           .input_box (the rounded grey pill) → .input_search (the transparent
           <input>). All three need overriding; .input_box has its own bg. */
        .search_cont, .search_area, ._searchArea, .big_search.search_area {
            background: var(--wt-bg-elev) !important;
            border: 1px solid var(--wt-border) !important;
            box-shadow: 0 8px 24px rgba(0,0,0,.5) !important;
        }
        .search_area .input_box {
            background: var(--wt-bg-input) !important;
            border: 1px solid var(--wt-border) !important;
        }
        .input_search, ._txtKeyword,
        .search_area .input_search {
            background: transparent !important;
            color: var(--wt-text) !important;
        }
        input::placeholder { color: var(--wt-text-mute) !important; }
        .ly_autocomplete, ._searchLayer {
            background: var(--wt-bg-elev) !important;
            border: 1px solid var(--wt-border) !important;
            border-radius: 4px;
        }
        .ly_autocomplete li, ._searchLayer li { background: transparent !important; }
        .ly_autocomplete li:hover, ._searchLayer li:hover,
        .ly_autocomplete li.on, ._searchLayer li.on {
            background: var(--wt-bg-elev2) !important;
        }
        .ly_autocomplete a, ._searchLayer a, .ly_autocomplete .title { color: var(--wt-text) !important; }
        .search_area .ly_autocomplete .autocomplete_foot a { color: var(--wt-text-dim) !important; }

        /* Search autocomplete RESULT LIST (e.g. typing "roman" → Selfish Romance,
           Sweet Romance, ... Each <li class="link"> has white-on-hover from base
           CSS, plus #000 title + #8c8c8c info — all needs overriding. */
        .search_area .list_autocomplete li.on,
        .search_area .list_autocomplete .link:hover,
        .search_area .list_autocomplete li.on .link {
            background: var(--wt-bg-elev2) !important;
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
        .search_area .list_creator .link:hover { background: var(--wt-bg-elev2) !important; }
        .search_area .list_creator .info { color: var(--wt-text-dim) !important; }
        .search_area .list_creator .info .bar { background: var(--wt-border) !important; }

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

        /* Sections — #content and #container are the actual IDs in the DOM.
           #wrap wraps the entire page including header so excluded here —
           html/body already covers the page background.
           .detail_header is intentionally excluded: it is 1200px centered and
           sits ON TOP of the full-width .detail_bg artwork element. Setting its
           background-color to dark would paint over the artwork in the center
           while leaving the artwork visible on the sides — the opposite of
           what we want. .detail_header background defaults to transparent, which
           lets the .detail_bg artwork show through in the header area. */
        #content, #container, .cont_area, .detail_body {
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
            padding-top: 0px !important;
        }
        .detail_header { color: var(--wt-text) !important; }

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
        /* Force the bottom underline color so the strip reads continuously
           on dark — base CSS uses .5px solid #e0e0e0 which is invisible. */
        .snb_wrap, .snb_wrap.type_sub {
            border-bottom: 1px solid var(--wt-border) !important;
        }
        /* Snb scroll arrow buttons (← / → on long tab strips). Base CSS
           background is #fff with light hover — break the underline. */
        .snb_inner .btn_snb_prev, .snb_inner .btn_snb_next {
            background-color: var(--wt-bg) !important;
            border-bottom: 1px solid var(--wt-border) !important;
            border-right-color: var(--wt-border) !important;
            border-left-color: var(--wt-border) !important;
        }
        .snb_inner .btn_snb_prev:hover, .snb_inner .btn_snb_next:hover {
            background-color: var(--wt-bg-hover) !important;
        }
        .snb_item, .snb_tab, ._snb_tab_a {
            background-color: transparent !important;
            color: var(--wt-text-dim) !important;
            border-color: var(--wt-border) !important;
        }
        .snb_item:hover .snb_tab, .snb_tab:hover {
            color: var(--wt-accent) !important;
            background-color: var(--wt-bg-elev2) !important;
        }
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

        /* === Homepage / listing pages: Option B elevation design ===
           Three-level hierarchy: page (--wt-bg) → section card (--wt-bg-elev)
           → comic card (--wt-bg-elev2 + shadow). */

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
        /* Faint accent line below each section header to anchor the title. */
        .main_section .section_header,
        .webtoon_list_wrap .section_header {
            border-bottom: 1px solid rgba(0, 213, 100, .18) !important;
            margin-bottom: 16px !important;
        }
        /* "View all ›" link in section header. */
        .section_header .button_view_all { color: var(--wt-text-dim) !important; }
        .section_header .button_view_all:hover { color: var(--wt-accent) !important; }

        /* Comic cards within section containers: elevated above the section bg. */
        .main_section .card_item,
        .main_section .card_lst li,
        .main_section .webtoon_list li,
        .webtoon_list_wrap .card_item,
        .webtoon_list_wrap .card_lst li,
        .webtoon_list_wrap ._popularList li,
        .webtoon_list_wrap ._dailyList li,
        .webtoon_list_wrap .webtoon_list li {
            background: var(--wt-bg-elev2) !important;
            border-color: rgba(255,255,255,.06) !important;
            border-radius: 10px !important;
            box-shadow: 0 4px 16px rgba(0,0,0,.5), 0 1px 3px rgba(0,0,0,.3) !important;
            transition: transform .18s ease, box-shadow .18s ease, border-color .18s !important;
        }
        .main_section .card_item:hover,
        .main_section .card_lst li:hover,
        .main_section .webtoon_list li:hover,
        .webtoon_list_wrap .card_item:hover,
        .webtoon_list_wrap .card_lst li:hover,
        .webtoon_list_wrap ._popularList li:hover,
        .webtoon_list_wrap ._dailyList li:hover,
        .webtoon_list_wrap .webtoon_list li:hover {
            transform: translateY(-6px) scale(1.02) !important;
            background: #30363f !important;
            box-shadow: inset 0 1px 0 rgba(255,255,255,.2), 0 0 0 1px rgba(255,255,255,.15) !important;
            border-color: rgba(255,255,255,.15) !important;
        }
        /* Card text area: more breathing room for title + view count. */
        .webtoon_list .info_text {
            margin-top: 10px !important;
            padding: 0 4px !important;
        }
        .webtoon_list .view_count {
            margin-top: 5px !important;
            color: var(--wt-text-mute) !important;
        }
        .webtoon_list .title {
            color: var(--wt-text) !important;
        }

        /* Section header text. */
        .section_header { color: var(--wt-text) !important; }
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
        /* discover_spot arrows are sprite elements — invert to white on dark bg */
        .discover_spot .paging .btn_next,
        .discover_spot .paging .btn_prev {
            filter: brightness(0) invert(1) opacity(.8) !important;
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

        /* Viewer depth — body.wt-viewer is set by JS (more reliable for SPA nav);
           body:has() kept as CSS-only fallback. Both target the same gradient. */
        body.wt-viewer,
        body:has(#content.viewer) {
            background: linear-gradient(to right,
                #000000 0%, var(--wt-bg) 14%,
                var(--wt-bg) 86%, #000000 100%) !important;
        }
        body.wt-viewer #container,
        body.wt-viewer #content,
        body:has(#content.viewer) #container,
        body:has(#content.viewer) #content {
            background-color: transparent !important;
        }
        #_viewerArea { background-color: transparent !important; }
        .viewer_lst, .viewer_lst .on, .viewer_header,
        .viewer_footer, ._toolBox, .ly_episode {
            background-color: transparent !important;
            color: var(--wt-text) !important;
        }
        /* Never touch comic panels */
        .viewer_lst img, ._images, ._images img, .viewer_img img { filter: none !important; }

        /* Top fixed toolbar (.tool_area is natively #2f2f2f — bring it in line). */
        .tool_area {
            background: var(--wt-bg-elev) !important;
            color: var(--wt-text) !important;
            border-bottom: 1px solid var(--wt-border) !important;
        }
        .tool_area .subj_info .subj, .tool_area .subj_episode { color: var(--wt-text) !important; }
        .tool_area a { color: var(--wt-text) !important; }

        /* Episode thumbnail strip below the comic (top + bottom of viewer).
           Base CSS sets background:#f5f5f5 on bare .episode_area. */
        .episode_area {
            background: var(--wt-bg-elev) !important;
            border-color: var(--wt-border) !important;
            border-radius: 12px !important;
            box-shadow: 0 1px 0 rgba(255,255,255,.05), 0 4px 20px rgba(0,0,0,.4) !important;
        }
        .episode_lst { background: transparent !important; }
        /* Currently-viewing episode highlight in the thumbnail strip.
           Base CSS gives just a 3px green border on the .thmb. Make it pop more
           with a green glow halo + bold subj text so the "you are here" is
           obvious at a glance. */
        .episode_lst li .on .thmb {
            border: 3px solid var(--wt-accent) !important;
            box-shadow: 0 0 0 1px rgba(0, 213, 100, .25), 0 0 14px rgba(0, 213, 100, .55) !important;
        }
        .episode_lst li .on .subj {
            color: var(--wt-accent) !important;
            font-weight: 700 !important;
        }

        /* Horizontal rules — base CSS leaves them with default browser styling. */
        hr { border-color: var(--wt-border) !important; background: var(--wt-border) !important; }

        /* === Viewer page elevation ===
           Cards are injected by buildViewerCards() in JS — CSS only provides the
           class definition and resets; JS handles the section grouping. */

        /* width:330px keeps the float from exceeding the 1200px cont_box;
           height:fit-content prevents stretching to match the comment column. */
        .aside.viewer {
            box-sizing: border-box !important;
            width: 330px !important;
            background: transparent !important;
            border-radius: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            height: fit-content !important;
        }
        .aside .ranking_lst.viewer {
            background: transparent !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 12px !important;
            padding: 0 !important;
        }
        /* Ranking list items: transparent so they don't nest card-on-card. */
        .aside.viewer .ranking_lst li {
            background-color: transparent !important;
            border-radius: 0 !important;
            border: none !important;
        }
        /* Card class injected by JS onto each section wrapper. */
        .wt-viewer-card {
            background: var(--wt-bg-elev) !important;
            border-radius: 14px !important;
            padding: 16px !important;
            border: 1px solid var(--wt-border) !important;
            box-shadow: 0 8px 32px rgba(0,0,0,.35) !important;
        }
        /* Section header arrow — sprite, needs filter not color. */
        .aside.viewer .ico_arr1 {
            filter: brightness(0) invert(1) opacity(.6) !important;
        }
        .ranking_lst .title_area h2 a, .ranking_lst .title_area h2 span {
            color: var(--wt-text) !important;
        }
        .ranking_lst .title_area h2 span em { color: var(--wt-text-dim) !important; }
        .ranking_lst .ico_arr1 { color: var(--wt-text-dim) !important; }
        /* Ranking list item dividers and section separators. */
        .ranking_lst li, .aside_item, .aside_wrap,
        .cont_box .aside { border-color: var(--wt-border) !important; }
        /* .ranking_wrap inside .aside.viewer is now a card — no internal borders.
           Keep the rule for .section_wrap and non-viewer asides only. */
        .cont_box .aside:not(.viewer) .section_wrap,
        .cont_box .aside:not(.viewer) .ranking_wrap {
            border-top-color: var(--wt-border) !important;
            border-bottom-color: var(--wt-border) !important;
        }
        /* Viewer info / ad / patron section top separators. */
        .viewer_lst .viewer_info_area,
        .viewer_lst .viewer_ad_area { border-top-color: var(--wt-border) !important; }
        .viewer_patron_area { border-top-color: var(--wt-border) !important; }
        /* WCC comment sort tabs bottom border. */
        [class*="wcc_SortOrderTabs__root"] { border-bottom-color: var(--wt-border) !important; }
        /* Sidebar patron/section separator inside .aside.detail. */
        .aside.detail .aside_patron { border-top-color: var(--wt-border) !important; }
        /* Ranking list section bottom border (.lst_type1 = the ranked item list).
           Suppress in viewer aside — each .ranking_wrap is already a card. */
        .lst_type1 { border-bottom-color: var(--wt-border) !important; }
        .aside.viewer .lst_type1 { border-bottom: none !important; }
        /* CANVAS Weekly round-up / challenge_spot top separator. */
        .challenge_spot, .viewer .challenge_spot { border-top-color: var(--wt-border) !important; }

        /* "Share this series and show support" prompt + Like/Subscribe pills */
        .viewer_lst .dsc_encourage { color: var(--wt-text) !important; }
        .viewer_lst .spi_area .bx, .spi_area .bx {
            background: var(--wt-bg-elev2) !important;
            color: var(--wt-text) !important;
            border: 1px solid var(--wt-border) !important;
            transition: background .15s, border-color .15s, box-shadow .15s, transform .1s !important;
        }
        .viewer_lst .spi_area .bx:hover, .spi_area .bx:hover {
            background: var(--wt-bg-hover) !important;
            border-color: var(--wt-accent) !important;
            box-shadow: 0 0 0 1px var(--wt-accent), 0 4px 14px rgba(0,213,100,.15) !important;
            transform: translateY(-1px) !important;
        }
        /* Heart sprite (ico_like2) — tint red to signal "like". */
        .spi_area .ico_like2 {
            filter: brightness(0) saturate(100%) invert(47%) sepia(89%) saturate(505%) hue-rotate(314deg) brightness(95%) contrast(92%) !important;
        }
        /* Subscribe "+" icon (ico_plus3/ico_plus4) — sprite is dark-on-transparent,
           invert to white so it's visible on the dark button background. */
        .spi_area .ico_plus3, .spi_area .ico_plus4 {
            filter: brightness(0) invert(1) opacity(.9) !important;
        }
        .cont_box .viewer_lst .spi_area .lnk_favorites.on { color: var(--wt-text-dim) !important; }

        /* Comments section header + creator note card */
        .comment_area { background: var(--wt-bg) !important; color: var(--wt-text) !important; }
        .comment_head .title_comments { color: var(--wt-text) !important; }
        .comment_head .count { color: var(--wt-text-dim) !important; }
        .comment_area .creator_note {
            background: var(--wt-bg-elev) !important;
            border: 1px solid var(--wt-border) !important;
            border-radius: 8px;
            padding: 16px;
        }
        .comment_area .creator_note .title { color: var(--wt-text-dim) !important; }
        .comment_area .creator_note .author_area .author,
        .comment_area .creator_note .author_area .author_name { color: var(--wt-text) !important; }
        .comment_area .creator_note .author_area .author_name span { color: var(--wt-text) !important; }

        /* Wildcard attribute selectors catch variant class names the WCC
           component ships — avoids invisible-text regressions on updates. */
        [class*="cbox_nick"], [class*="cbox_name"], [class*="comment_nick"], [class*="user_nick"] {
            color: var(--wt-link) !important;
        }
        [class*="cbox_date"], [class*="comment_date"] { color: var(--wt-text-mute) !important; }
        [class*="cbox_sort"] a, [class*="cbox_sort"] button { color: var(--wt-text-dim) !important; }
        [class*="cbox_sort"] .on, [class*="cbox_sort"] [aria-current="true"] {
            color: var(--wt-text) !important;
        }

        /* Webtoons replaced the legacy Naver u_cbox widget with "WCC"
           (Webtoon Comment Component), which uses CSS-module class names of
           the form wcc_<Component>__<element>. Legacy .u_cbox_* kept as fallback. */

        /* WCC App MASTER container -- this is the OUTERMOST wrapper of the
           comment widget (wcc_App__root). v1.0.9 missed this; comment
           items inside were dark, but the whole widget sat on a white App. */
        [class*="wcc_App__root"], [class*="wcc_App__loader"] {
            background: var(--wt-bg) !important;
            color: var(--wt-text) !important;
        }
        /* Kebab-case wcc loaders (don't match [class*="wcc_"] -- they use dashes) */
        [class*="wcc-comment-list-loader"], [class*="wcc-sort-order-loader"] {
            background: transparent !important;
            color: var(--wt-text-dim) !important;
        }
        /* Comment editor (where the user types). Multiple sub-classes. */
        [class*="wcc_Editor__root"], [class*="wcc_Editor__content"],
        [class*="wcc_Editor__editor"], [class*="wcc_Editor__scrollArea"],
        [class*="wcc_Editor__actionBar"], [class*="wcc_Editor__toolbar"],
        [class*="wcc_Editor__attachment"], [class*="wcc_Editor__creatorPost"],
        [class*="wcc_Editor__modifyContainer"], [class*="wcc_Editor__replyContainer"],
        [class*="wcc_Editor__spoilerWrapper"], [class*="wcc_Editor__mobileShortened"],
        [class*="wcc_Editor__bottomLeftCornerIcon"] {
            background: var(--wt-bg-elev) !important;
            color: var(--wt-text) !important;
            border-color: var(--wt-border) !important;
        }
        [class*="wcc_Editor__editor"] {
            caret-color: var(--wt-text) !important;
        }
        /* Spoiler toggle inside the comment editor */
        [class*="wcc_Spoiler__root"], [class*="wcc_Spoiler__text"] {
            color: var(--wt-text) !important;
            background: transparent !important;
        }
        [class*="wcc_Spoiler__switch"] {
            background: var(--wt-bg-elev2) !important;
            border-color: var(--wt-border) !important;
        }
        [class*="wcc_Spoiler__slider"] { background: var(--wt-text-dim) !important; }
        [class*="wcc_Spoiler__disabled"] { color: var(--wt-text-mute) !important; }
        [class*="wcc_SpoilerGuard__viewText"] { color: var(--wt-text-dim) !important; }
        [class*="wcc_SpoilerGuard__viewAll"] { color: var(--wt-link) !important; }

        /* WCC widget root surfaces -- list, individual rows, body, header */
        [class*="wcc_CommentList__"], [class*="wcc_CommentLoader__"],
        [class*="wcc_CommentView__"], [class*="wcc_CommentEmpty__"] {
            background-color: var(--wt-bg) !important;
            color: var(--wt-text) !important;
        }
        [class*="wcc_CommentItem__root"] {
            background-color: var(--wt-bg-elev) !important;
            border: 1px solid var(--wt-border) !important;
            border-radius: 8px !important;
            margin-bottom: 8px !important;
            padding: 12px !important;
        }
        [class*="wcc_CommentItem__inside"], [class*="wcc_CommentItem__corner"],
        [class*="wcc_CommentItem__action"], [class*="wcc_CommentItem__bestOnly"],
        [class*="wcc_CommentItem__replied"] {
            background: transparent !important;
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
        /* Comment header: nickname + date + creator badge */
        [class*="wcc_CommentHeader__root"], [class*="wcc_CommentHeader__identity"] {
            background: transparent !important;
        }
        [class*="wcc_CommentHeader__name"]          { color: var(--wt-link) !important; }
        [class*="wcc_CommentHeader__createdAt"]     { color: var(--wt-text-mute) !important; }
        [class*="wcc_CommentHeader__creatorBadge"],
        [class*="wcc_CommentHeader__ownerSign"]     { color: var(--wt-accent) !important; }

        /* Sort-order tabs (TOP / NEWEST) */
        [class*="wcc_SortOrderTabs__root"], [class*="wcc_SortOrderTab__root"] {
            background: transparent !important;
            color: var(--wt-text-dim) !important;
        }
        [class*="wcc_SortOrderTab__active"] {
            color: var(--wt-accent) !important;
        }

        /* Reaction buttons (like / dislike / etc.) */
        [class*="wcc_CommentReaction__root"],
        [class*="wcc_CommentReaction__action"] {
            background: transparent !important;
            color: var(--wt-text-dim) !important;
        }
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
        [class*="wcc_ReplyFolder__root"], [class*="wcc_ReplyUnfold__root"],
        [class*="wcc_ReplyUnfold__unfold"], [class*="wcc_ReplyFolderToggle__root"] {
            background: transparent !important;
            color: var(--wt-link) !important;
        }
        [class*="wcc_ReplyUnfold__arrow"] { color: var(--wt-text-dim) !important; }

        /* "More comments" loader / pagination */
        [class*="wcc_CommentMore__root"], [class*="wcc_CommentMore__more"],
        [class*="wcc_CommentMore__prev"], [class*="wcc_CommentMore__progress"],
        [class*="wcc_CommentMore__noEditor"], [class*="wcc_CommentMore__reply"] {
            background: transparent !important;
            color: var(--wt-text-dim) !important;
        }
        [class*="wcc_CommentMore__more"]:hover,
        [class*="wcc_CommentMore__prev"]:hover { color: var(--wt-text) !important; }
        [class*="wcc_CommentMore__arrow"] { color: var(--wt-text-dim) !important; }

        /* Alert / report / option-menu popups */
        [class*="wcc_AlertPopup__overlay"],
        [class*="wcc_CommentReportPopup__overlay"] {
            background: rgba(0,0,0,.7) !important;
        }
        [class*="wcc_AlertPopup__content"],
        [class*="wcc_CommentReportPopup__content"],
        [class*="wcc_CommentOptionMenu__content"],
        [class*="wcc_CommentOptionMenu__menu"] {
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

        /* Legacy u_cbox widget (kept as fallback for older pages) */
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

        /* Footer social icons are sprite glyphs — invert to white. Opacity .75
           balances the filled Facebook glyph against line-style Instagram/X/YouTube. */
        .btn_foot_facebook, .btn_foot_instagram, .btn_foot_twitter,
        .btn_foot_youtube, .btn_foot_pinterest, .btn_foot_line {
            filter: brightness(0) invert(1) opacity(.75) !important;
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

        /* "NEW" / "UP" badge chips — actual classes are badge_new2, badge_up2.
           Dim them slightly on dark rather than override with a solid color
           (they're sprite-based so background-color would block the graphic). */
        [class^="badge_new"], [class^="badge_up"] {
            opacity: .85 !important;
        }

        /* Mobile (m.webtoons.com) */
        .header_wrap, .navigation, .nav_wrap, .lst_episode, .episode_cont {
            background-color: var(--wt-bg) !important;
            color: var(--wt-text) !important;
        }

        /* "Recently viewed" floating bar on the right edge. */
        .recently_area {
            background: var(--wt-bg-elev) !important;
            background-image: none !important;
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

        /* === Detail page elevation ===
           Three-level hierarchy: page (--wt-bg) → episode list + sidebar cards
           (--wt-bg-elev) → episode rows (--wt-bg-elev2). */

        /* Episode list column — .detail_body .detail_lst is float:left, 761px wide.
           No border-top: it connects to the app-download banner above.
           No overflow:hidden: the pagination is position:absolute at the bottom
           and clips badly with hidden overflow. Base padding-bottom was 66px —
           keep that so pagination stays in its original position. */
        .detail_body .detail_lst {
            background: var(--wt-bg-elev) !important;
            border-radius: 16px !important;
            padding-bottom: 66px !important;
            border: none !important;
            box-shadow: inset 0 0 0 1px rgba(255,255,255,.1), 0 8px 32px rgba(0,0,0,.55) !important;
        }
        /* Right sidebar — its own elevated card. */
        .aside.detail {
            background: var(--wt-bg-elev) !important;
            border-radius: 16px !important;
            padding: 16px !important;
            border: none !important;
            box-shadow: inset 0 0 0 1px rgba(255,255,255,.1), 0 12px 40px rgba(0,0,0,.55) !important;
        }
        /* Sidebar CTA buttons (Continue reading / First episode). */
        .aside.detail .aside_btn .btn_type7 {
            background: var(--wt-bg-elev2) !important;
            border: 1px solid var(--wt-border) !important;
            color: var(--wt-text) !important;
            transition: background .15s, border-color .15s, box-shadow .15s, transform .1s !important;
        }
        .aside.detail .aside_btn .btn_type7:hover {
            background: var(--wt-bg-hover) !important;
            border-color: var(--wt-accent) !important;
            box-shadow: 0 0 0 1px var(--wt-accent), 0 4px 16px rgba(0,213,100,.18) !important;
            transform: translateY(-1px) !important;
            color: var(--wt-accent) !important;
        }
        /* Episode list dividers — base CSS uses #f5f5f5 (nearly white) on both
           top and bottom borders of each row. */
        .detail_body .detail_lst li,
        .detail_body .detail_lst li:first-child {
            border-color: var(--wt-border) !important;
            transition: background .12s, box-shadow .12s !important;
        }
        .detail_body .detail_lst li:hover {
            background: var(--wt-bg-elev2) !important;
        }
        /* Cap .subj so the row's total column widths fit inside the li and don't
           overflow past the ::after border. Overrides base CSS width:411px. */
        .detail_body .detail_lst .subj {
            max-width: 385px !important;
            width: 385px !important;
        }
        /* Pseudo-element border renders above thumbnail and all children. */
        .detail_body .detail_lst li:hover::after {
            content: '' !important;
            position: absolute !important;
            inset: 0 !important;
            border: 2px solid var(--wt-accent) !important;
            border-radius: 6px !important;
            pointer-events: none !important;
            z-index: 5 !important;
        }
        /* Turn date and like count accent green on hover. */
        .detail_body .detail_lst li > a:hover .date {
            color: var(--wt-accent) !important;
        }
        .detail_body .detail_lst li > a:hover .like_area {
            color: var(--wt-accent) !important;
        }
        /* Also tint the heart sprite green on hover. */
        .detail_body .detail_lst li > a:hover .ico_like {
            filter: brightness(0) saturate(100%) invert(62%) sepia(67%) saturate(475%) hue-rotate(103deg) brightness(95%) contrast(92%) !important;
        }
        .detail_body .detail_lst li > a:hover .tx {
            color: var(--wt-text-dim) !important;
        }
        /* Base CSS: .detail_body .detail_lst .subj span { color: #3d3d3d } and
           .date { color: #b1b1b1 } — invisible on dark. Restate at matching
           specificity, plus broader fallbacks to catch any internal element. */
        .detail_body .detail_lst .subj,
        .detail_body .detail_lst .subj span,
        .detail_lst .subj, .detail_lst .subj span,
        .detail_lst li a, .detail_lst li a span:not(.date):not(.tx) {
            color: var(--wt-text) !important;
        }
        .detail_body .detail_lst .date, .detail_lst .date,
        .detail_body .detail_lst .tx, .detail_lst .tx { color: var(--wt-text-dim) !important; }

        /* Paywall notice and install-app strip at the bottom of the episode list.
           Base CSS uses border-top: 1px solid #f5f5f5 which is nearly invisible
           on dark; tint to our border colour. */
        .detail_paywall, .detail_install_app {
            border-top-color: var(--wt-border) !important;
            color: var(--wt-text) !important;
        }
        .detail_install_app em { color: var(--wt-accent) !important; }

        /* Subscribe / bookmark button (.btn_favorite) — base CSS hardcodes
           background:#fff + color:#000. This element is NOT a <button> so our
           generic button rule misses it. */
        .btn_favorite {
            background: var(--wt-bg-elev2) !important;
            color: var(--wt-text) !important;
            border: 1px solid var(--wt-border) !important;
        }
        .btn_favorite:hover { background: var(--wt-bg-hover) !important; }

        /* .ly_area — inline popup/dropdown used for share menus and author info
           tooltips throughout the detail page. Base CSS: background:#fff; border:
           1px solid #b4b4b4. Our general .ly_box popup rule does not catch this. */
        .ly_area {
            background: var(--wt-bg-elev) !important;
            border-color: var(--wt-border) !important;
            color: var(--wt-text) !important;
        }

        /* Subscribe-tier popup (.ly_subscribe) — white panel that appears when
           the subscribe button is clicked; right:20px, top:239px, z-index:120. */
        .ly_subscribe {
            background: var(--wt-bg-elev) !important;
            color: var(--wt-text) !important;
            border: 1px solid var(--wt-border) !important;
            box-shadow: 0 8px 24px rgba(0,0,0,.5) !important;
        }

        /* Episode sort dropdown (.sort_box) — "Latest / Oldest" selector above
           the episode list; base CSS: background:#fff; border:1px solid #ddd. */
        .sort_box {
            background: var(--wt-bg-elev) !important;
            border-color: var(--wt-border) !important;
            color: var(--wt-text) !important;
            box-shadow: 0 4px 12px rgba(0,0,0,.5) !important;
        }
        .sort_box a, .sort_box button { color: var(--wt-text-dim) !important; background: transparent !important; }
        .sort_box a:hover, .sort_box button:hover,
        .sort_box .on, .sort_box [aria-current="true"] { color: var(--wt-text) !important; }

        /* "You may also like" recommendation card items (.other_card_item) —
           base CSS: background:#fff. They sit inside .detail_other which has
           no background set, so overriding the item itself is enough. */
        .other_card_item {
            background: var(--wt-bg-elev) !important;
            color: var(--wt-text) !important;
        }
        .other_card_item:hover { background: var(--wt-bg-elev2) !important; }

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

        /* Skin image — filter:none prevents any parent rule from inverting the
           artwork. We let the artwork tile naturally: the inline background-image
           shorthand resets background-color to transparent, so the dark
           .detail_header background shows in the side margins where the image
           doesn't fully cover (no artificial clipping or masking). */
        .detail_bg { filter: none !important; }

        /* Author info icon (.ico_info2) inside the detail header is typically
           a <button> element, so our generic button rule gives it a dark
           background rectangle. Since .detail_header is now transparent (shows
           artwork), that rectangle is visible against the artwork. Clear it. */
        .detail_header .ico_info2, .detail_header [class*="ico_info"] {
            background-color: transparent !important;
            border: none !important;
            box-shadow: none !important;
        }

        /* Series title and genre text — text-shadow improves legibility on any
           artwork background; letter-spacing and uppercase on the genre label
           give the header a more editorial, polished look. */
        .detail_header .info .subj {
            letter-spacing: .04em !important;
            text-shadow: 0 2px 16px rgba(0,0,0,.95), 0 0 48px rgba(0,0,0,.6) !important;
        }
        .detail_header .info .genre {
            letter-spacing: .18em !important;
            text-transform: uppercase !important;
            font-size: 13px !important;
            font-weight: 500 !important;
            text-shadow: 0 1px 6px rgba(0,0,0,.95) !important;
        }
        .detail_header .info .author_area {
            text-shadow: 0 1px 4px rgba(0,0,0,.9) !important;
        }

        /* Subscribe button "+" icon (.ico_plus4 sprite). The sprite was designed
           for the original white btn_favorite background (dark glyph on white).
           Now that btn_favorite has a dark background, invert the sprite to white. */
        .btn_favorite .ico_plus4 {
            filter: brightness(0) invert(1) !important;
        }

        /* Episode list typography — clear visual hierarchy across the four columns:
           title > date > likes > episode number. */
        .detail_body .detail_lst .subj span {
            font-size: 17px !important;
            font-weight: 500 !important;
            color: var(--wt-text) !important;
            letter-spacing: .01em !important;
        }
        .detail_body .detail_lst li > a:hover .subj span {
            color: var(--wt-accent) !important;
        }
        .detail_body .detail_lst .date {
            font-size: 13px !important;
            color: var(--wt-text) !important;
            letter-spacing: .03em !important;
        }
        /* Like area count number — red to match the heart icon. */
        .detail_body .detail_lst .like_area {
            color: #e05252 !important;
            font-size: 13px !important;
        }
        /* .ico_like is a sprite (background-image), not text — filter it red. */
        .detail_body .detail_lst .ico_like {
            filter: brightness(0) saturate(100%) invert(47%) sepia(89%) saturate(505%) hue-rotate(314deg) brightness(95%) contrast(92%) !important;
        }
        /* Episode number (#5, #4 …) — slightly muted so it reads as metadata.
           padding-right keeps it clear of the 2px hover border. */
        .detail_body .detail_lst .tx {
            font-size: 14px !important;
            font-weight: 600 !important;
            color: var(--wt-text-mute) !important;
            letter-spacing: .03em !important;
            padding-right: 6px !important;
        }

        /* Series with .type_white skin (e.g. Sweet Romance, Spicy Roommates):
           the base CSS hard-codes .info text to #000 / #252525 which assumes
           the page is light. Override so author / title are readable on dark.
           (.ico_info2 is intentionally NOT filtered here — that was the
           "white blob" bug from v1.0.11.) */
        .detail_header.type_white .subj,
        .detail_header.type_white h1.subj { color: var(--wt-text) !important; }
        .detail_header.type_white .info .author,
        .detail_header.type_white .info .author_area,
        .detail_header.type_white .author,
        .detail_header.type_white .author_area {
            color: var(--wt-text-dim) !important;
        }

        /* Ranking number sprite digits (1, 2, 3, ... 10) in trending/popular
           sidebars — plain dark glyphs on transparent, invert to white. */
        .ico_n1, .ico_n2, .ico_n3, .ico_n4, .ico_n5,
        .ico_n6, .ico_n7, .ico_n8, .ico_n9, .ico_n10 {
            filter: brightness(0) invert(1) opacity(.85) !important;
        }
        /* Homepage trending card badges (.ranking_number_X:before) — the SVG
           sprite bakes in a white rectangle. Replace the sprite entirely with
           CSS-generated text: clear background-image, set content per number,
           and override the text-indent/overflow that the sprite class hides. */
        .webtoon_list [class^="ranking_number_"]:before {
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
        }
        .webtoon_list .ranking_number_1:before  { content: "1"  !important; }
        .webtoon_list .ranking_number_2:before  { content: "2"  !important; }
        .webtoon_list .ranking_number_3:before  { content: "3"  !important; }
        .webtoon_list .ranking_number_4:before  { content: "4"  !important; }
        .webtoon_list .ranking_number_5:before  { content: "5"  !important; }
        .webtoon_list .ranking_number_6:before  { content: "6"  !important; }
        .webtoon_list .ranking_number_7:before  { content: "7"  !important; }
        .webtoon_list .ranking_number_8:before  { content: "8"  !important; }
        .webtoon_list .ranking_number_9:before  { content: "9"  !important; }
        .webtoon_list .ranking_number_10:before { content: "10" !important; }
        /* Homepage "Trending" / "Popular" tab pills — base CSS uses
           #f3f3f3 (inactive) and #000 (active). Our generic button rule
           targets the <button> element, not <div class="button">. */
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
            background-color: var(--wt-accent) !important;
            color: var(--wt-text-on-accent) !important;
            border-color: var(--wt-accent) !important;
        }
        /* Stats glyphs (.ico_view / .ico_view2 / .ico_subscribe / .ico_grade /
           .ico_grade2) and the author-info icon (.ico_info2) are intentionally
           NOT filtered: the sprite at those positions has the BRAND GREEN
           color baked in. Filtering bleaches it to grey/white — losing the
           brand identity AND turning the info icon into a solid white blob.
           Brand green renders fine against our dark surface as-is. */

        /* Pagination row at the bottom of the episode list. Base CSS hard-codes
           color:#070707 on both .paginate a and strong — invisible on dark. */
        .paginate a, .paginate strong, .paginate span,
        .paginate.v2 [class^="pg_"] {
            color: var(--wt-text) !important;
        }
        .paginate a:hover { color: var(--wt-accent) !important; }
        .paginate .on, .paginate [aria-current="true"] {
            color: var(--wt-text-on-accent) !important;
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
            background-color: var(--wt-accent) !important;
            color: var(--wt-text-on-accent) !important;
        }
        .terms_lang_area .terms_lang_list .link[aria-selected="false"]:hover,
        .terms_lang_area .terms_tab_list .link[aria-selected="false"]:hover {
            background-color: var(--wt-bg-hover) !important;
            color: var(--wt-text) !important;
        }

        /* Static Next.js subapp pages (About, Contact, Feedback, etc.).
           These are rendered by a separate bundle from /static/wec/.../next/...
           and use Tailwind utility classes (text-black, bg-white) that ignore
           the body color cascade. Scope overrides to the Next.js layout
           wrapper class so we don't catch other pages. */
        section[class*="layout_container"],
        section[class*="layout_container"] main {
            background-color: var(--wt-bg) !important;
            color: var(--wt-text) !important;
        }
        section[class*="layout_container"] .bg-white,
        section[class*="layout_container"] [class*="bg-white"],
        section[class*="layout_container"] [class*="bg-gray-50"],
        section[class*="layout_container"] [class*="bg-gray-100"],
        section[class*="layout_container"] [class*="bg-gray-200"] {
            background-color: var(--wt-bg-elev) !important;
        }
        section[class*="layout_container"] .text-black,
        section[class*="layout_container"] [class*="text-black"],
        section[class*="layout_container"] [class*="text-gray-9"],
        section[class*="layout_container"] [class*="text-gray-8"] {
            color: var(--wt-text) !important;
        }
        section[class*="layout_container"] [class*="text-gray-5"],
        section[class*="layout_container"] [class*="text-gray-6"],
        section[class*="layout_container"] [class*="text-gray-7"] {
            color: var(--wt-text-dim) !important;
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
                el.textContent = css;
                (document.head || document.documentElement).appendChild(el);
            }
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
    const themeDefault = !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);

    // Cached state — avoids GM IPC calls in the hot MutationObserver path.
    let darkOn = GM_getValue(KEY_THEME, themeDefault);
    let dimOn = GM_getValue(KEY_DIM, false);

    applyTheme(darkOn);
    applyDim(dimOn);

    // SPA / late-loading bundle defense: if our <style> ever gets removed
    // (Webtoons swaps stylesheets on some chapter transitions), put it back.
    // Cheap — only fires on direct childList changes to <head>.
    function watchHead() {
        if (!document.head) return;
        new MutationObserver(() => {
            if (darkOn && !document.getElementById('wt-dark-style')) applyTheme(true);
            if (dimOn && !document.getElementById('wt-dim-style')) applyDim(true);
            // Head changes during SPA stylesheet swaps — re-check viewer state
            typeof syncViewerClass === 'function' && syncViewerClass();
        }).observe(document.head, { childList: true });
    }
    if (document.head) watchHead();
    else document.addEventListener('DOMContentLoaded', watchHead, { once: true });

    function toggleTheme() {
        darkOn = !darkOn;
        GM_setValue(KEY_THEME, darkOn);
        applyTheme(darkOn);
        console.info('[webtoons-dark-mode] theme →', darkOn ? 'dark' : 'light');
    }
    function toggleDim() {
        dimOn = !dimOn;
        GM_setValue(KEY_DIM, dimOn);
        applyDim(dimOn);
        console.info('[webtoons-dark-mode] reader dim →', dimOn ? 'on' : 'off');
    }

    if (typeof GM_registerMenuCommand === 'function') {
        GM_registerMenuCommand('Toggle Webtoons dark mode', toggleTheme);
        GM_registerMenuCommand('Toggle reader dim', toggleDim);
    }

    // Keyboard shortcuts. Multiple combos so the user can use whichever doesn't
    // conflict with their OS / browser / keyboard-layout switcher:
    //   - Alt+Shift+T  OR  Ctrl+Alt+D       → toggle theme
    //   - Alt+Shift+N  OR  Ctrl+Alt+Shift+D → toggle reader dim
    // Note: bare Alt+D opens the address bar; Alt+Shift on Windows can also
    // trigger the input-language switcher, which can swallow Alt+Shift+T on
    // multi-language setups. The Ctrl+Alt+D backup avoids both.
    function matchCombo(e, want) {
        if (!!e.altKey !== want.alt) return false;
        if (!!e.shiftKey !== want.shift) return false;
        if (!!e.ctrlKey !== want.ctrl) return false;
        if (e.metaKey) return false; // never with Cmd
        const code = e.code;
        const key = (e.key || '').toUpperCase();
        return code === want.code || key === want.letter;
    }
    function handleKey(e) {
        const themeAltShiftT = matchCombo(e, { alt: true, shift: true, ctrl: false, code: 'KeyT', letter: 'T' });
        const themeCtrlAltD = matchCombo(e, { alt: true, shift: false, ctrl: true, code: 'KeyD', letter: 'D' });
        const dimAltShiftN = matchCombo(e, { alt: true, shift: true, ctrl: false, code: 'KeyN', letter: 'N' });
        const dimCtrlAltShD = matchCombo(e, { alt: true, shift: true, ctrl: true, code: 'KeyD', letter: 'D' });

        let handled = false;
        try {
            if (themeAltShiftT || themeCtrlAltD) {
                toggleTheme();
                handled = true;
            } else if (dimAltShiftN || dimCtrlAltShD) {
                toggleDim();
                handled = true;
            }
        } catch (err) {
            console.error('[webtoons-dark-mode] toggle failed:', err);
        }
        if (handled) {
            e.preventDefault();
            e.stopImmediatePropagation();
            e.stopPropagation();
        }
    }
    // Capture phase on window catches all keydowns before any page handler,
    // regardless of which element has focus.
    window.addEventListener('keydown', handleKey, true);

    // Sync body.wt-viewer class for the vignette gradient — CSS :has() alone
    // doesn't re-fire reliably after SPA navigation (pushState). This ensures
    // the class is set on every navigation, initial load, and theme toggle.
    function syncViewerClass() {
        if (!document.body) return;
        document.body.classList.toggle('wt-viewer', !!document.querySelector('#content.viewer'));
    }
    syncViewerClass();
    document.addEventListener('DOMContentLoaded', syncViewerClass);
    // Schedule multiple retries — SPA content may not be ready at the first check.
    // 100ms catches fast loads; 600ms and 1500ms catch lazy-rendered pages.
    function scheduleViewerSync() {
        [100, 600, 1500].forEach(d => setTimeout(syncViewerClass, d));
    }
    ['pushState', 'replaceState'].forEach(fn => {
        const orig = history[fn];
        history[fn] = function() {
            orig.apply(this, arguments);
            scheduleViewerSync();
            scheduleViewerCards();
        };
    });
    window.addEventListener('popstate', () => { scheduleViewerSync(); scheduleViewerCards(); });

    // Inject card wrappers into the viewer sidebar. CSS selectors for inner
    // sections are unreliable (class names vary); JS groups children of
    // .ranking_lst by "non-UL header + following UL" and wraps each pair.
    function buildViewerCards() {
        const aside = document.querySelector('.aside.viewer');
        if (!aside || aside.dataset.wtCards) return;
        const lst = aside.querySelector('.ranking_lst');
        if (!lst) return;

        const children = Array.from(lst.children);
        if (!children.length) return;

        // Group children: whenever we hit a non-UL element, start a new section.
        const groups = [];
        let cur = null;
        for (const el of children) {
            if (el.tagName !== 'UL') { cur = []; groups.push(cur); }
            if (cur) cur.push(el);
        }

        aside.dataset.wtCards = '1';

        if (groups.length < 2) {
            // Fallback: single card around the whole ranking_lst.
            lst.classList.add('wt-viewer-card');
            lst.style.flexDirection = '';
            lst.style.gap = '';
            return;
        }

        // Rebuild lst with each group wrapped in a card div.
        while (lst.firstChild) lst.removeChild(lst.firstChild);
        groups.forEach(group => {
            const card = document.createElement('div');
            card.className = 'wt-viewer-card';
            group.forEach(el => card.appendChild(el));
            lst.appendChild(card);
        });
    }
    function scheduleViewerCards() {
        aside_cards_done = false;
        [300, 900, 2000].forEach(d => setTimeout(() => {
            if (!aside_cards_done) buildViewerCards();
        }, d));
    }
    let aside_cards_done = false;
    // Override buildViewerCards to track completion.
    const _bvc = buildViewerCards;
    buildViewerCards = function() {
        _bvc();
        if (document.querySelector('.aside.viewer[data-wt-cards]')) aside_cards_done = true;
    };
    document.addEventListener('DOMContentLoaded', buildViewerCards);
    scheduleViewerCards();

    console.info(`[webtoons-dark-mode] v${VERSION} ready — Alt+Shift+T / Ctrl+Alt+D: theme | Alt+Shift+N / Ctrl+Alt+Shift+D: dim`);
})();
