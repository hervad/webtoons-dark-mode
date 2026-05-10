// ==UserScript==
// @name         Webtoons Dark Mode
// @namespace    https://github.com/hervad/webtoons-dark-mode
// @version      1.0.9
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
        .gnb a, .lnb a            { color: var(--wt-text) !important; transition: color .15s, background-color .15s; }
        .gnb .on a, .lnb .on a    { color: var(--wt-accent) !important; }
        /* Hover highlight on top-nav links (Originals / Categories / Rankings / Canvas / Webtoon Shop / Creators 101). */
        .gnb a:hover, .lnb a:hover, .gnb .link:hover, .header .link_menu:hover {
            color: var(--wt-accent) !important;
            background-color: var(--wt-bg-elev2) !important;
            border-radius: 4px;
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

        /* Search dropdown — recent searches + autocomplete shown when search opens.
           Has three nested layers: .search_area (outer panel) → .input_box
           (the rounded grey pill) → .input_search (the actual transparent
           <input>). v1.0.6 missed .input_box, so the pill stayed light grey. */
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

        /* Top fixed toolbar (.tool_area is natively #2f2f2f — bring it in line). */
        .tool_area {
            background: var(--wt-bg-elev) !important;
            color: var(--wt-text) !important;
            border-bottom: 1px solid var(--wt-border) !important;
        }
        .tool_area .subj_info .subj, .tool_area .subj_episode { color: var(--wt-text) !important; }
        .tool_area a { color: var(--wt-text) !important; }

        /* (The viewer-context filter override added in v1.0.7 is no longer
           needed in v1.0.8 — social SHARE icons are now never filtered, and
           the .ico_favorites / .ico_like2 / .ico_plus3 are stats glyphs that
           render fine in their native state inside the viewer.) */

        /* Episode thumbnail strip below the comic (top + bottom of viewer).
           Base CSS sets background:#f5f5f5 on bare .episode_area. */
        .episode_area {
            background: var(--wt-bg-elev) !important;
            border-color: var(--wt-border) !important;
        }
        .episode_lst { background: transparent !important; }

        /* Right-side aside on viewer page ("Trending & Popular") */
        .aside.viewer { background: transparent !important; }
        .aside .ranking_lst.viewer { background: var(--wt-bg) !important; }
        .ranking_lst .title_area h2 a, .ranking_lst .title_area h2 span {
            color: var(--wt-text) !important;
        }
        .ranking_lst .title_area h2 span em { color: var(--wt-text-dim) !important; }
        .ranking_lst .ico_arr1 { color: var(--wt-text-dim) !important; }

        /* "Share this series and show support" prompt + Like/Subscribe pills */
        .viewer_lst .dsc_encourage { color: var(--wt-text) !important; }
        .viewer_lst .spi_area .bx, .spi_area .bx {
            background: var(--wt-bg-elev2) !important;
            color: var(--wt-text) !important;
            border: 1px solid var(--wt-border) !important;
        }
        .viewer_lst .spi_area .bx:hover, .spi_area .bx:hover {
            background: var(--wt-bg-hover) !important;
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

        /* Defensive widening of the v1.0.2 cbox rules — newer comment widget
           variants sometimes use slightly different class names. Catches
           "almost-invisible nickname" reports without overriding existing rules. */
        [class*="cbox_nick"], [class*="cbox_name"], [class*="comment_nick"], [class*="user_nick"] {
            color: var(--wt-link) !important;
        }
        [class*="cbox_date"], [class*="comment_date"] { color: var(--wt-text-mute) !important; }
        [class*="cbox_sort"] a, [class*="cbox_sort"] button { color: var(--wt-text-dim) !important; }
        [class*="cbox_sort"] .on, [class*="cbox_sort"] [aria-current="true"] {
            color: var(--wt-text) !important;
        }

        /* Comments — Webtoons replaced the legacy Naver u_cbox widget with a
           new "WCC" (Webtoon Comment Component) loaded from
           ssl.pstatic.net/static/wcc/gw/prod-1.0/index.js. It uses CSS-Module
           class names of the form wcc_<Component>__<element>. The legacy
           .u_cbox_* selectors below are kept as a fallback for older pages. */

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
        [class*="wcc_AlertPopup__cancel"],
        [class*="wcc_CommentReportPopup__cancel"],
        [class*="wcc_CommentReportPopup__reason"] {
            background: var(--wt-bg-elev2) !important;
            color: var(--wt-text) !important;
            border-color: var(--wt-border) !important;
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

        /* Footer social icons (sprite glyphs — invisible against dark bg).
           v1.0.6 dropped opacity to .65 to even out FB vs the line-style
           Instagram/X/YouTube glyphs. .65 was a touch too dim — bumped to .75. */
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
        .detail_body .detail_lst .tx, .detail_lst .tx {
            color: var(--wt-text-dim) !important;
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
           Don't override the artist's background-image — just slightly dim it
           so the bright artwork sits comfortably with the dark chrome on the
           sides. v1.0.5 used .55 which was too dim; .7 keeps the art readable. */
        .detail_bg { filter: brightness(.7) !important; }

        /* Stats sprite glyphs (eye for view count, person for subscribers, star
           for grade). These are plain dark glyphs designed for light bg —
           bleach to white so they're visible on dark.
           Brand SOCIAL icons (FB / X / Tumblr / Reddit / Copy / RSS) intentionally
           NOT filtered — the sprite at those positions includes brand-colored
           disc backgrounds that bleach to solid white circles when filtered.
           Native colors render fine on the dark theme. */
        .ico_subscribe, .ico_view, .ico_view2,
        .ico_grade, .ico_grade2 {
            filter: brightness(0) invert(1) opacity(.85) !important;
        }

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
