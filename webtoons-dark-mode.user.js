// ==UserScript==
// @name         Webtoons Dark Mode
// @namespace    https://github.com/hervad/webtoons-dark-mode
// @version      1.5.1
// @description  Dark theme for WEBTOON (webtoons.com) that never touches the comic art — dark site, original colours in every panel. Toggle with Alt+Shift+T; optional night-reading dim with Alt+Shift+N.
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
    const KEY_VIGNETTE = 'wt_vignette';
    const VERSION = '1.5.1';

    // Retry cohort for SPA-navigation work (vignette class sync, viewer cards,
    // banner cleanup, panel glow). Webtoons renders the new page asynchronously
    // after pushState; one delay never fits all subapps, so we sample three
    // times spanning fast → slow bundles.
    const SPA_RETRY_DELAYS = [200, 800, 2000];

    // Log the startup banner as the FIRST runtime statement so that if anything
    // below throws, the console still proves the script loaded and which
    // version Tampermonkey is serving.
    console.info(`[webtoons-dark-mode] v${VERSION} starting`);

    /* ---------- palette (one place to retheme everything) ---------- */
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
            --wt-text-mute:       #878e99;
            --wt-text-read:       #9aa1ab;
            --wt-text-on-accent:  #0a0a0a;
            --wt-link:            #7cb6ff;
            --wt-name:            #8ab4f8;
            --wt-accent:          #00d564;
            --wt-accent-soft:     #4ade80;
            --wt-accent-like:     #f06868;
            --wt-shadow:          0 1px 2px rgba(0,0,0,.6);
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
        /* Respect the OS "reduce motion" setting — but only for motion WE add
           (hover lifts, the sort-menu slide-in). A global "* { transition-
           duration: .01ms }" also shortened the site's own transitions and
           broke its JS: the reader's episode-strip thumbnails never
           lazy-loaded (they stayed grey placeholders) for anyone with
           Windows "Animation effects" off. Never override site-wide timing. */
        @media (prefers-reduced-motion: reduce) {
            .aside.detail .aside_btn .btn_type7:hover,
            .spi_area .bx:hover,
            .age_gate_area button:active,
            .age_gate_area .btn_type9:active,
            .age_gate_area ._btn_enter:active { transform: none !important; }
            .sort_box { animation: none !important; }
            .sort_box a:hover { padding-left: 14px !important; }
        }

        /* Text */
        h1, h2, h3, h4, h5, h6, p, dt, dd, label, em, strong, small,
        .tit, .sub_tit, .subj, .author, .genre, .grade_num, .info, .summary {
            color: var(--wt-text) !important;
        }
        .desc, .date, .count, .from, .ico_view, .num,
        .grade_area, .info_area .author, .nick, .meta {
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
        a[class~="cta"]:hover, a[class*="_cta_" i]:hover, a[class*="_cta" i]:hover,
        a[class*="primary" i]:hover,
        a.lk_continue:hover, a._btn_enter:hover {
            color: inherit !important;
        }

        /* Keyboard focus ring — site has none of its own on most controls,
           which fails WCAG 2.4.7. A 2 px outline in --wt-border-strong with
           a 2 px offset reads clearly on every elevation level without
           clipping. :focus-visible so it only appears for keyboard nav. */
        a:focus-visible, button:focus-visible,
        input:focus-visible, textarea:focus-visible, select:focus-visible,
        [role="button"]:focus-visible, [tabindex]:focus-visible {
            outline: 2px solid var(--wt-border-strong) !important;
            outline-offset: 2px !important;
        }
        .more { color: var(--wt-link) !important; }

        /* Header / global nav — border-color and box-shadow only on the outer
           header shell, NOT on .gnb/.lnb nav lists (causes nav item artifacts). */
        #header, .header {
            background-color: var(--wt-bg-elev) !important;
            border-color: var(--wt-border) !important;
            box-shadow: var(--wt-shadow) !important;
            z-index: 10000 !important;
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
        /* Active GNB link: site sets aria-current="true" on the <a> itself.
           The #header ID prefix boosts specificity above the site's
           own color rule which wins at 0,2,1 or lower. */
        #header .gnb a[aria-current="true"],
        #header .lnb a[aria-current="true"] {
            color: var(--wt-accent) !important;
            box-shadow: inset 0 -2px 0 var(--wt-accent) !important;
            border-radius: 6px 6px 0 0 !important;
        }
        /* GNB links wrap their text in <h1> — our blanket h1 rule sets
           color:--wt-text !important which beats the inherited accent color.
           Scope the override directly under #header so it wins by ID specificity. */
        #header a[aria-current="true"] h1,
        #header a[aria-current="true"] h2,
        #header a[aria-current="true"] h3 {
            color: var(--wt-accent) !important;
            font-size: inherit !important;
            font-weight: inherit !important;
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

        /* Search dropdown — ONE surface. .search_area is the floating panel;
           everything inside it (.input_box pill, .ly_autocomplete list) is
           flat on that panel. .search_cont is only the wrapper around the
           header's search button — giving it a box drew a second frame
           behind the panel. The <input> itself gets no border / bg / outline
           (the generic input rule would add a box inside the pill); focus is
           shown on the pill via :focus-within instead. */
        .search_area, .big_search.search_area {
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
        .search_area .btn_delete_search { filter: brightness(0) invert(1) opacity(.6) !important; }
        input::placeholder { color: var(--wt-text-mute) !important; }
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


        /* /canvas "Weekly HOT" and "Popular By Category" grids. Each card is
           <a class="discover_item"> inside <li>; base CSS paints the link with
           a white background that broke through under the dark theme. */
        .discover_lst li, .discover_lst .discover_item,
        a.discover_item {
            background: var(--wt-bg-elev) !important;
            color: var(--wt-text) !important;
            border-radius: 8px !important;
            overflow: hidden !important;
            border-color: var(--wt-border) !important;
        }
        a.discover_item:hover {
            background: var(--wt-bg-elev2) !important;
        }
        a.discover_item:hover .subj,
        a.discover_item:hover .title,
        .discover_lst li:hover .subj,
        .discover_lst li:hover .title { color: var(--wt-accent) !important; }

        /* Hover darken: when the cursor lands on a card thumbnail, dim the
           artwork so the title/genre overlay (which sits on top of the image
           as the card's only label) becomes readable. Scoped strictly to card
           containers to avoid touching viewer panel images, which must stay
           pristine. transition lives on the img so the dim eases in/out. */
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

        .discover_lst .info { background: transparent !important; }
        .discover_lst .subj { color: var(--wt-text) !important; }
        .discover_lst .grade_num { color: var(--wt-text-dim) !important; }
        .discover_lst .grade_area { color: var(--wt-text-dim) !important; }

        /* /canvas genre-filtered pages (DRAMA, FANTASY, …) use a different DOM:
           .challenge_cont_area > .challenge_lst > ul > li > a.challenge_item
           instead of .discover_lst / .discover_item. Without parallel rules the
           cards render as raw thumbnails on the page background — no card
           container, no border, no rounded corners. Mirror the .discover_item
           treatment so /canvas/{genre} matches /canvas home visually. */
        a.challenge_item {
            background: transparent !important;
            color: var(--wt-text) !important;
            border-radius: 6px !important;
            overflow: visible !important;
            border: 0 !important;
            box-shadow: none !important;
            display: block !important;
            /* Flat tile — parent .challenge_cont_area provides elevation.
               overflow: visible so the rounded image (clipped on the img/thmb
               itself, not the anchor) doesn't fight a square clip box. */
            transition: color .15s ease !important;
        }
        a.challenge_item:hover { background: transparent !important; }
        .challenge_item img { transition: filter .2s ease !important; }
        a.challenge_item:hover img { filter: brightness(.7) !important; }
        a.challenge_item:hover .subj,
        a.challenge_item:hover .title { color: var(--wt-accent) !important; }
        /* Kill background/border on the parent <li> that 'Cards / lists'
           rule painted — same "flat tile" reasoning. */
        .challenge_lst li,
        .challenge_cont_area .challenge_lst li {
            background: transparent !important;
            border: 0 !important;
            box-shadow: none !important;
        }
        .challenge_item .info,
        .challenge_item .info_area,
        .challenge_item .area_genre { background: transparent !important; }
        .challenge_item .subj,
        .challenge_item .title { color: var(--wt-text) !important; }
        .challenge_item .area_genre,
        .challenge_item .genre,
        .challenge_item .author { color: var(--wt-text) !important; }
        /* Like / subscriber counter on canvas cards — match the green heart
           icon so number + icon read as one element. */
        .challenge_item .grade_num,
        .challenge_item .num,
        .challenge_item .like_area .num,
        .challenge_item .like_area,
        .challenge_item .subscribe,
        .challenge_item .subscribe_count { color: var(--wt-accent) !important; }
        /* Wrap the whole canvas grid in one elevated section card to match
           how other listing pages group their content. box-sizing:border-box
           is critical — without it, the 24 px padding adds outside the
           computed width and pushes the .aside.challenge float (Top CANVAS
           / Up & Coming) down below the grid instead of beside it. */
        .challenge_cont_area {
            background: var(--wt-bg-elev) !important;
            border: 1px solid var(--wt-border) !important;
            border-radius: 12px !important;
            padding: 16px 20px !important;
            box-sizing: border-box !important;
            overflow: visible !important;
            box-shadow: var(--wt-shadow) !important;
        }
        /* Ensure no ancestor clips the rightmost card's 1 px border. */
        .challenge_cont_area .challenge_lst,
        .challenge_cont_area .challenge_lst > ul { overflow: visible !important; }
        .challenge_lst,
        .challenge_lst > ul,
        .challenge_lst > ul > li { background: transparent !important; }
        /* Grid layout with explicit gap — the base CSS lays cards out with
           no breathing room, leaving them edge-to-edge. Fixed 4 columns with
           minmax(0, 1fr) so a card's intrinsic min-width (cover image) can't
           force the column wider than the available track, which would
           otherwise push the rightmost card out of view or drop the row. */
        .challenge_lst > ul {
            display: grid !important;
            grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
            gap: 14px !important;
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
        a.challenge_item img,
        .challenge_item .thmb,
        .challenge_item .thmb img {
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            display: block !important;
            /* Soft rounding on all four corners of the thumbnail itself so
               the card image reads as a discrete tile (rather than a
               half-rounded slab that meets a square text strip below). */
            border-radius: 6px !important;
            overflow: hidden !important;
        }
        a.challenge_item { min-width: 0 !important; max-width: 100% !important; }
        /* Base CSS draws a 1 px light separator at the bottom of multiple
           levels in the challenge_* tree. Cast a wider net to kill it. */
        .challenge_cont_area,
        .challenge_cont_area *,
        .challenge_lst,
        .challenge_lst > ul,
        .challenge_lst > ul > li {
            border-bottom: 0 !important;
        }
        .challenge_cont_area::after,
        .challenge_lst::after,
        .challenge_lst > ul::after {
            display: none !important;
            content: none !important;
            border: 0 !important;
        }

        /* Right-rail sidebar on /canvas (Top CANVAS, Up & Coming). Each is
           a separate .lst_area inside .aside.challenge .ranking_lst.viewer
           (a flex column). Card each .lst_area individually so the two
           sections render as two distinct stacked cards, not one big block. */
        /* Shrink the floated sidebar slightly so the grid section gets more
           horizontal room (the rightmost card column was being shaved). */
        .aside.challenge { width: 280px !important; }
        /* Shared sidebar card: /canvas Top CANVAS (#challengeGenreRanking) /
           Up & Coming (#upcomingChallengeRanking) AND the viewer's Trending &
           Popular / Top Originals — all are .ranking_lst.viewer > .lst_area.
           One card per .lst_area, nothing wrapped around it. A top-lit
           hairline (brighter top edge) + two-layer shadow separates the card
           from the page without the harsh full-white outline. */
        .aside.challenge .lst_area,
        #challengeGenreRanking,
        #upcomingChallengeRanking,
        .ranking_lst.viewer > .lst_area {
            background: var(--wt-bg-elev) !important;
            border: 1px solid rgba(255,255,255,.12) !important;
            border-top-color: rgba(255,255,255,.2) !important;
            border-radius: 14px !important;
            padding: 16px !important;
            box-sizing: border-box !important;
            box-shadow:
                0 2px 6px rgba(0,0,0,.35),
                0 12px 32px rgba(0,0,0,.45) !important;
            margin: 0 !important;
        }
        /* Flat ranking rows inside Top CANVAS / Up & Coming — no per-row
           border or background ("volume"). Hover only turns the title green. */
        .aside.challenge .lst_type1 > li,
        #challengeGenreRanking .lst_type1 > li,
        #upcomingChallengeRanking .lst_type1 > li,
        .ranking_lst.viewer .lst_type1 > li {
            border: 0 !important;
            background: transparent !important;
            padding: 6px 0 !important;
            margin: 0 !important;
            transition: color .15s ease !important;
        }
        .aside.challenge .lst_type1 > li:hover,
        #challengeGenreRanking .lst_type1 > li:hover,
        #upcomingChallengeRanking .lst_type1 > li:hover,
        .ranking_lst.viewer .lst_type1 > li:hover {
            background: transparent !important;
        }
        .aside.challenge .lst_type1 > li:hover .subj,
        #challengeGenreRanking .lst_type1 > li:hover .subj,
        #upcomingChallengeRanking .lst_type1 > li:hover .subj,
        .ranking_lst.viewer .lst_type1 > li:hover .subj {
            color: var(--wt-accent) !important;
        }
        /* Header arrow (.ico_arr1) next to "Top CANVAS" / "Up & Coming" —
           force inline-flex alignment so the chevron sits beside the title
           text, not on the line below it. Base CSS often gives ico_arr1
           display:block or width:14px (sprite). */
        #challengeGenreRanking .ico_arr1,
        #upcomingChallengeRanking .ico_arr1,
        .ranking_lst.viewer .title_area .ico_arr1,
        .aside.challenge .title_area .ico_arr1,
        .title_area h2 .ico_arr1 {
            background-image: none !important;
            background: none !important;
            color: var(--wt-text-dim) !important;
            font-size: 18px !important;
            line-height: 1 !important;
            font-style: normal !important;
            font-weight: 400 !important;
            text-indent: 0 !important;
            overflow: visible !important;
            white-space: nowrap !important;
            filter: none !important;
            width: auto !important;
            height: auto !important;
            min-width: 0 !important;
            display: inline-flex !important;
            align-items: center !important;
            margin: 0 0 0 6px !important;
            padding: 0 !important;
            vertical-align: middle !important;
            position: static !important;
            top: auto !important;
        }
        /* Make sure the parent h2 lays children out inline. */
        #challengeGenreRanking .title_area h2,
        #upcomingChallengeRanking .title_area h2,
        .aside.challenge .title_area h2 {
            display: inline-flex !important;
            align-items: center !important;
            gap: 0 !important;
        }
        #challengeGenreRanking .title_area h2 span,
        #upcomingChallengeRanking .title_area h2 span,
        .aside.challenge .title_area h2 span {
            display: inline !important;
        }
        /* Tight stacking: kill the flex column gap entirely and zero any
           top margin on the second .lst_area so Up & Coming sits directly
           under Top CANVAS with only a hairline gap. */
        .aside.challenge .ranking_lst {
            gap: 0 !important;
            row-gap: 0 !important;
        }
        .aside.challenge .lst_area + .lst_area { margin-top: 8px !important; }
        .aside.challenge .lst_type1 { border-bottom: none !important; }
        .aside.challenge h2, .aside.challenge h3,
        .aside.challenge .title_area { color: var(--wt-text) !important; }
        /* Subscriber-count badge overlaid on each carousel card thumbnail.
           DOM: <span class="badge_discover num">7K</span> inside .discover_badge_area */
        .badge_discover {
            background: var(--wt-bg-elev2) !important;
            color: var(--wt-accent) !important;
            border: 1px solid rgba(0,213,100,.35) !important;
            border-radius: 9999px !important;
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

        /* Promotional banner on /canvas ("Try the New CANVAS Creator Dashboard!").
           Ships as <a class="contest_banner" style="background-color: #bdffdb">
           with an inline mint-green PNG inside. Override the inline style with
           !important and tone the embedded image down so it blends with dark. */
        /* Promotional banners on /canvas. The <a class="contest_banner"> ships
           with inline style="background-color: #bdffdb" (mint green) and an
           <img> child whose pixels are also mint green. We override the inline
           bg and clip the image so its mint-green padding doesn't bleed past
           the dark anchor — image stretches to fill the full anchor width
           via object-fit, with the mint-green centre portion heavily
           desaturated so it blends with the dark page. */
        .contest_banner, a.contest_banner {
            background-color: var(--wt-bg-elev) !important;
            border-radius: 0 !important;
            overflow: hidden !important;
            display: block !important;
            position: relative !important;
        }
        .contest_banner img {
            display: block !important;
            margin: 0 auto !important;
            filter: brightness(.32) saturate(.35) contrast(1.05) !important;
            transition: filter .2s !important;
        }
        .contest_banner:hover img {
            filter: brightness(.5) saturate(.55) contrast(1.05) !important;
        }

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
        /* Snb scroll arrow buttons (← / → on long tab strips, e.g. /canvas
           genre row that runs past HORROR). Base CSS draws the arrow as a
           dark sprite (background-image) on a #fff button — invisible on
           dark. Strip the sprite and draw a white unicode chevron via a
           pseudo-element so the glyph is always readable. */
        .snb_inner .btn_snb_prev, .snb_inner .btn_snb_next {
            background-color: var(--wt-bg-elev) !important;
            background-image: none !important;
            border-bottom: 1px solid var(--wt-border) !important;
            border-right-color: var(--wt-border) !important;
            border-left-color: var(--wt-border) !important;
            box-shadow: inset 0 0 0 1px rgba(255,255,255,.07) !important;
        }
        /* Suppress the base sprite that's drawn via ::before — without this we
           render both the dark sprite AND our white chevron (doubled arrow). */
        .snb_inner .btn_snb_prev::before, .snb_inner .btn_snb_next::before {
            content: none !important;
            background-image: none !important;
            background: none !important;
        }
        /* Heavy guillemets (❮ ❯) at large size for clear readability. */
        .snb_inner .btn_snb_prev::after, .snb_inner .btn_snb_next::after {
            position: absolute !important;
            inset: 0 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            color: var(--wt-text) !important;
            font-size: 40px !important;
            line-height: 1 !important;
            font-weight: 300 !important;
            pointer-events: none !important;
        }
        .snb_inner .btn_snb_prev::after { content: '\\276E' !important; }
        .snb_inner .btn_snb_next::after { content: '\\276F' !important; }
        .snb_inner .btn_snb_prev:hover, .snb_inner .btn_snb_next:hover {
            background-color: var(--wt-bg-hover) !important;
        }
        .snb_inner .btn_snb_prev:hover::after,
        .snb_inner .btn_snb_next:hover::after {
            color: var(--wt-accent) !important;
        }
        .snb_item, .snb_tab, ._snb_tab_a {
            background-color: transparent !important;
            color: var(--wt-text) !important;
            border-color: var(--wt-border) !important;
        }
        .snb_item:hover .snb_tab, .snb_tab:hover {
            color: var(--wt-accent-soft) !important;
            background-color: var(--wt-bg-elev2) !important;
        }
        .snb_item.is_selected .snb_tab,
        .snb_tab[aria-current="true"],
        .snb_tab[aria-current="page"] {
            color: var(--wt-accent) !important;
            transform: none !important;
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
        .section_header .button_view_all:hover { color: var(--wt-accent-soft) !important; }
        /* "more ›" link — two element variants render this:
           - .button_view_all (homepage sections) — chevron via ::after sprite
           - a.lk_more (canvas / popular-by-category) — chevron via a
             child <span class="ico_arr"> sprite
           Both inherit text colour from our a/h rules, but the chevron sprite
           ships as a dark glyph. Strip the sprite and either inject our own
           text chevron (::after) or invert the inline span. */
        a.lk_more, .lk_more {
            color: var(--wt-text-dim) !important;
        }
        a.lk_more:hover, .lk_more:hover {
            color: var(--wt-accent-soft) !important;
        }
        .lk_more .ico_arr {
            background-image: none !important;
            background: none !important;
            width: auto !important;
            height: auto !important;
            text-indent: 0 !important;
            overflow: visible !important;
            white-space: normal !important;
            display: inline-block !important;
            vertical-align: middle !important;
            margin-left: 4px !important;
        }
        .lk_more .ico_arr::after {
            content: '\\203A' !important;
            color: inherit !important;
            font-size: 18px !important;
            line-height: 1 !important;
        }
        .button_view_all::after,
        .section_header .button_view_all::after {
            background-image: none !important;
            background: none !important;
            content: '\\203A' !important;
            color: inherit !important;
            font-size: 18px !important;
            line-height: 1 !important;
            width: auto !important;
            height: auto !important;
            margin-left: 4px !important;
            text-indent: 0 !important;
            overflow: visible !important;
            white-space: normal !important;
        }

        /* Comic cards within section containers: flat tiles. The parent
           section already provides elevation, so per-card shadow + lift
           created a "double volume" effect. Hover = image darken (handled by
           the generic .card_item img rule above) + title turns accent green. */
        .main_section .card_item,
        .main_section .card_lst li,
        .main_section .webtoon_list li,
        .webtoon_list_wrap .card_item,
        .webtoon_list_wrap .card_lst li,
        .webtoon_list_wrap ._popularList li,
        .webtoon_list_wrap ._dailyList li,
        .webtoon_list_wrap .webtoon_list li {
            background: transparent !important;
            border-color: transparent !important;
            border-radius: 10px !important;
            box-shadow: none !important;
            transform: none !important;
            transition: color .15s ease !important;
        }
        .main_section .card_item:hover .title,
        .main_section .card_item:hover .subj,
        .main_section .card_lst li:hover .title,
        .main_section .card_lst li:hover .subj,
        .main_section .webtoon_list li:hover .title,
        .main_section .webtoon_list li:hover .subj,
        .webtoon_list_wrap .card_item:hover .title,
        .webtoon_list_wrap .card_item:hover .subj,
        .webtoon_list_wrap .card_lst li:hover .title,
        .webtoon_list_wrap .card_lst li:hover .subj,
        .webtoon_list_wrap ._popularList li:hover .title,
        .webtoon_list_wrap ._popularList li:hover .subj,
        .webtoon_list_wrap ._dailyList li:hover .title,
        .webtoon_list_wrap ._dailyList li:hover .subj,
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
        .webtoon_list .info_text > .view_count,
        .webtoon_list .info_text > .like_count,
        .webtoon_list .info_text > .count_like {
            display: inline-block !important;
            margin: 0 !important;
        }
        /* Heart / view counter inherits the brand-green heart-icon colour so
           number and icon read as one element. */
        .webtoon_list .view_count,
        .webtoon_list .like_count,
        .webtoon_list .count_like {
            color: var(--wt-accent) !important;
        }
        /* Pair genre with the heart/view stat on one row. Wraps both children
           in a flex row when both exist. Uses :has() so cards with only one
           child fall back gracefully. */
        .webtoon_list .info_text:has(.genre + .view_count),
        .webtoon_list .info_text:has(.genre + .like_count),
        .webtoon_list .info_text:has(.genre + .count_like) {
            display: grid !important;
            grid-template-columns: 1fr auto !important;
            grid-template-areas:
                "title title"
                "genre stat" !important;
            column-gap: 8px !important;
        }
        .webtoon_list .info_text > .title { grid-area: title !important; }
        .webtoon_list .info_text > .genre { grid-area: genre !important; }
        .webtoon_list .info_text > .view_count,
        .webtoon_list .info_text > .like_count,
        .webtoon_list .info_text > .count_like { grid-area: stat !important; justify-self: end !important; }
        /* Green hover on the heart/view number. */
        .main_section .card_item:hover .view_count,
        .main_section .card_item:hover .like_count,
        .main_section .card_item:hover .count_like,
        .webtoon_list_wrap li:hover .view_count,
        .webtoon_list_wrap li:hover .like_count,
        .webtoon_list_wrap li:hover .count_like,
        .webtoon_list li:hover .view_count,
        .webtoon_list li:hover .like_count,
        .webtoon_list li:hover .count_like {
            color: var(--wt-accent) !important;
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

        /* /canvas sort dropdown ("Sort by Date ▾"). Trigger is .sort_area .checked,
           panel is .sort_box. Base ships a white panel with a sprite checkmark
           — both invisible on dark. Render the trigger as a soft pill with a
           subtle chevron, and the panel as an elevated card with hover rows. */
        /* Trigger pill — best-practice sort/filter button:
           - Clear affordance: icon prefix + label + caret suffix
           - Distinct open state via [aria-expanded="true"]
           - Generous touch target, focus-visible safe (--wt-border-strong) */
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
        /* Outer page sort (.sort_area._sorting) on /canvas/list — lift it
           ABOVE the cards section block entirely using negative top so the
           pill sits as a free-standing control, not overlapping the grid.
           The section card has 16px+ padding so position:absolute relative
           to the section card with top:-48px clears the top edge. */
        .challenge_cont_area { position: relative !important; }
        .sort_area._sorting {
            position: absolute !important;
            right: 4px !important;
            top: -52px !important;
            left: auto !important;
            margin: 0 !important;
            display: inline-block !important;
            float: none !important;
            z-index: 50 !important;
        }
        .sort_area._sorting .checked {
            padding: 11px 32px !important;
            font-size: 15px !important;
            letter-spacing: .02em !important;
            min-width: 160px !important;
        }
        .sort_area._sorting .sort_box {
            right: 0 !important;
            top: calc(100% + 6px) !important;
            min-width: 200px !important;
            z-index: 200 !important;
        }
        /* Inner Top-CANVAS filter (.sort_area._filterArea) — shares the
           .title_area row with the "Top CANVAS" h2. Keep it compact so long
           labels (HEARTWARMING, SUPERNATURAL) don't push the row. */
        .sort_area._filterArea {
            position: relative !important;
            top: auto !important;
            right: auto !important;
            margin-left: auto !important;
            flex-shrink: 0 !important;
            z-index: 5 !important;
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
        /* Lift the filter pill's stacking context above sibling card rows
           so the panel it spawns isn't trapped beneath them. */
        .sort_area._filterArea { z-index: 10000 !important; }
        /* Make the .title_area inside the Top CANVAS card a flex row so the
           h2 and the filter pill align horizontally without one pushing
           the other. */
        .aside.challenge .lst_area .title_area,
        .ranking_lst.viewer > .lst_area > .title_area {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            gap: 8px !important;
            margin-bottom: 8px !important;
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
        .sort_box .on a,
        .sort_box [aria-current="true"],
        .sort_box li.on a,
        .sort_box li a[aria-current="true"] {
            color: var(--wt-accent) !important;
            background: rgba(0,213,100,.12) !important;
            font-weight: 700 !important;
        }
        .sort_box .on a:hover,
        .sort_box li a[aria-current="true"]:hover {
            background: rgba(0,213,100,.18) !important;
            padding-left: 14px !important;
        }
        .sort_box .on .ico_chk::after,
        .sort_box [aria-current="true"] .ico_chk::after,
        .sort_box li a[aria-current="true"] .ico_chk::after {
            content: '\\2713' !important;
            color: var(--wt-accent) !important;
            font-size: 13px !important;
            font-weight: 700 !important;
        }

        /* Genre labels (.genre.g_romance, .g_fantasy, …) — Webtoons' light
           theme tints these per category. Reproduce on dark, lightening the
           originally-dark hues (navy / brown / charcoal) so they stay legible. */
        .genre.g_romance, .g_romance { color: #fd337f !important; }
        .genre.g_romance_m, .g_romance_m { color: #fd337f !important; }
        .genre.g_comedy, .g_comedy { color: #ffc233 !important; }
        .genre.g_fantasy, .g_fantasy { color: #b56af2 !important; }
        .genre.g_romantic_fantasy, .g_romantic_fantasy { color: #e155f4 !important; }
        .genre.g_action, .g_action { color: #4a91ff !important; }
        .genre.g_drama, .g_drama { color: #2dd4be !important; }
        .genre.g_slice_of_life, .g_slice_of_life { color: #b8d62e !important; }
        .genre.g_supernatural, .g_supernatural { color: #9b6df2 !important; }
        .genre.g_horror, .g_horror { color: #e84545 !important; }
        .genre.g_thriller, .g_thriller { color: #e23a72 !important; }
        .genre.g_sports, .g_sports { color: #4ec4f5 !important; }
        .genre.g_sf, .g_sf { color: #8da8ce !important; }
        .genre.g_historical, .g_historical { color: #c0926a !important; }
        .genre.g_heartwarming, .g_heartwarming { color: #ff8a3d !important; }
        .genre.g_super_hero, .g_super_hero { color: #8a6fff !important; }
        .genre.g_tiptoon, .g_tiptoon { color: #ff8fd9 !important; }
        .genre.g_short_story, .g_short_story { color: #7fb2ff !important; }
        .genre.g_web_novel, .g_web_novel { color: #5fb6e0 !important; }
        .genre.g_mystery, .g_mystery { color: #a5a8c8 !important; }
        .genre.g_bl_gl, .g_bl_gl { color: #ee82ff !important; }
        .genre.g_western_palace, .g_western_palace { color: #e155f4 !important; }
        .genre.g_eastern_palace, .g_eastern_palace { color: #c0926a !important; }
        .genre.g_time_slip, .g_time_slip { color: #9085ff !important; }
        .genre.g_city_office, .g_city_office { color: #8a85e0 !important; }
        .genre.g_adaptation, .g_adaptation { color: #2ee672 !important; }
        .genre.g_school, .g_school { color: #f0a064 !important; }
        .genre.g_local, .g_local { color: #25ef92 !important; }
        .genre.g_shonen, .g_shonen { color: #6a98e0 !important; }
        .genre.g_martial_arts, .g_martial_arts { color: #c08555 !important; }
        .genre.g_graphic_novel, .g_graphic_novel { color: #7a83e8 !important; }
        .genre.g_others, .g_others { color: #9ea3ab !important; }
        .genre.g_informative { color: #7fc6a0 !important; }
        .genre.g_lgbtq { color: #ff7ed0 !important; }

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
        .btn_subscribe {
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
        /* /canvas RECOMMENDED SERIES carousel paging arrows + dot indicators.
           Buttons (.btn_prev / .btn_next inside .discover_spot .paging) had no
           visible glyph after our generic button rule painted them with
           --wt-bg-elev2 (which then turned solid-white under a brightness(0)
           invert(1) filter — the small white squares).  Strip the inherited
           button styling, hide the screen-reader text, and draw a white
           unicode chevron via ::after. The page-indicator dots (.ico_discover_pg)
           are sprite-based pills — restyle as flat circles. */
        /* Strip the inherited button styling (our generic rule paints it
           --wt-bg-elev2 which then turns solid-white under brightness(0)invert(1)).
           Keep transparent — the native button has its own positioned dimensions;
           we just draw a unicode chevron on top via ::after. */
        .discover_spot .paging .btn_next,
        .discover_spot .paging .btn_prev {
            position: absolute !important;
            background-color: rgba(15,17,20,.35) !important;
            background-image: none !important;
            border: 1px solid rgba(255,255,255,.2) !important;
            border-radius: 50% !important;
            font-size: 0 !important;
            color: transparent !important;
            filter: none !important;
            width: 64px !important;
            height: 64px !important;
            z-index: 10 !important;
            top: calc(50% + 35px) !important;
            transform: translateY(-50%) !important;
            transition: background-color .2s, border-color .2s, box-shadow .2s !important;
        }
        .discover_spot .paging {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            height: 100% !important;
            pointer-events: none !important;
        }
        .discover_spot .paging .btn_prev,
        .discover_spot .paging .btn_next { pointer-events: all !important; }
        .discover_spot .paging .btn_prev { left: 8px !important; }
        /* scaleX(-1) on the button mirrors the whole element including ::after,
           so ❮ inside renders as ❯ — no transform conflict on the ::after. */
        .discover_spot .paging .btn_next {
            right: 8px !important;
            transform: translateY(-50%) scaleX(-1) !important;
        }
        .discover_spot .paging .btn_prev:hover,
        .discover_spot .paging .btn_next:hover {
            background-color: rgba(0,213,100,.25) !important;
            border-color: rgba(0,213,100,.6) !important;
            box-shadow: 0 0 16px rgba(0,213,100,.35) !important;
        }
        /* Glyph is injected as a real <span> by styleCarouselArrows() in JS —
           inline styles can't be beaten by any stylesheet cascade. Suppress
           native ::before (sprite) and ::after so we don't get a double glyph. */
        .discover_spot .paging .btn_next::before,
        .discover_spot .paging .btn_prev::before,
        .discover_spot .paging .btn_next::after,
        .discover_spot .paging .btn_prev::after {
            content: none !important;
            display: none !important;
            background: none !important;
            background-image: none !important;
        }
        .discover_spot .paging .ico_discover_pg {
            background: var(--wt-bg-elev2) !important;
            background-image: none !important;
            border-radius: 50% !important;
            opacity: .8 !important;
        }
        .discover_spot .paging .ico_discover_pg.on,
        .discover_spot .paging .ico_discover_pg[aria-current="true"] {
            background: var(--wt-accent) !important;
            opacity: 1 !important;
        }

        /* Inputs */
        input, textarea, select {
            background-color: var(--wt-bg-input) !important;
            color: var(--wt-text) !important;
            border: 1px solid var(--wt-border) !important;
            caret-color: var(--wt-text) !important;
        }
        input::placeholder, textarea::placeholder { color: var(--wt-text-mute) !important; }
        /* Native <select> dropdown items — the age-verification month picker
           renders its options on a system-painted listbox that ignored our
           select bg/color rule. Style <option> explicitly. */
        select option {
            background-color: var(--wt-bg-elev) !important;
            color: var(--wt-text) !important;
        }
        /* Age-verification screen (.age_gate_container > .age_gate_area).
           The month picker is <a class="lk_month _selectedMonth">; the
           day/year are plain inputs. .month is the legacy span wrapper
           still present in some builds. */
        .age_gate_container,
        .age_gate_area, .age_gate_area .form_area {
            background: transparent !important;
            color: var(--wt-text) !important;
        }
        .age_gate_area .month,
        .age_gate_area .month *, .age_gate_area input {
            background-color: var(--wt-bg-input) !important;
            color: var(--wt-text) !important;
            border: 1px solid var(--wt-border) !important;
            border-radius: 6px !important;
        }
        .age_gate_area .month::after { color: var(--wt-text) !important; }
        /* Continue CTA — explicit hover state so it actually reacts to the
           cursor. The button uses brand green at idle; darken on hover with
           a subtle shadow lift instead of falling back to plain inheritance. */
        /* Continue button: brand green pill with near-black bold text. Black
           reads ~9:1 against #00d564 (vs ~3.5:1 for white) and matches the
           Webtoons brand pattern of dark text on green CTAs elsewhere on
           the site. Forced via -webkit-text-fill-color on the button AND
           every descendant so an inner <span> can't override it. */
        .age_gate_area button {
            background-color: var(--wt-accent) !important;
            color: #0a0a0a !important;
            -webkit-text-fill-color: #0a0a0a !important;
            font-weight: 700 !important;
            border: none !important;
            transition: background-color .15s ease, box-shadow .15s ease, transform .1s ease !important;
        }
        .age_gate_area button * {
            color: #0a0a0a !important;
            -webkit-text-fill-color: #0a0a0a !important;
            background: transparent !important;
        }
        .age_gate_area button:hover {
            background-color: #00b855 !important;
            box-shadow: 0 4px 12px rgba(0,213,100,.35) !important;
        }
        .age_gate_area button:hover, .age_gate_area button:hover * {
            color: #0a0a0a !important;
            -webkit-text-fill-color: #0a0a0a !important;
        }
        .age_gate_area button:active { transform: translateY(1px) !important; }
        /* Continue button: <a class="btn_type9 v2 _btn_enter"> inside
           <div class="btnarea">. Brand green pill, dark text (9:1 contrast). */
        .age_gate_area .btn_type9,
        .age_gate_area ._btn_enter,
        .age_gate_area .btnarea a {
            background-color: var(--wt-accent) !important;
            color: #0a0a0a !important;
            -webkit-text-fill-color: #0a0a0a !important;
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
        .age_gate_area .btn_type9 *,
        .age_gate_area ._btn_enter *,
        .age_gate_area .btnarea a * {
            color: #0a0a0a !important;
            -webkit-text-fill-color: #0a0a0a !important;
            background: transparent !important;
            text-decoration: none !important;
            transition: color .15s ease !important;
        }
        .age_gate_area .btn_type9:hover,
        .age_gate_area ._btn_enter:hover,
        .age_gate_area .btnarea a:hover {
            background-color: #00b855 !important;
            color: #ffffff !important;
            -webkit-text-fill-color: #ffffff !important;
            box-shadow: 0 4px 12px rgba(0,213,100,.35) !important;
        }
        .age_gate_area .btn_type9:hover *,
        .age_gate_area ._btn_enter:hover *,
        .age_gate_area .btnarea a:hover * {
            color: #ffffff !important;
            -webkit-text-fill-color: #ffffff !important;
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
        .age_gate_area ::selection { background: var(--wt-bg-hover) !important; color: var(--wt-text) !important; }

        /* Vignette gradient — applied to viewer, detail, and home/listing pages.
           All three classes are set/cleared by JS on every navigation; no CSS
           :has() fallback (caused false positives — see detail-page-dom.md).
           position:fixed + inset:0 locks the overlay to the viewport so it
           never scrolls away. pointer-events:none lets all clicks through.
           Optional: toggleVignette() sets html[data-wt-vignette="off"]. */
        html:not([data-wt-vignette="off"]) body.wt-viewer::before,
        html:not([data-wt-vignette="off"]) body.wt-detail::before,
        html:not([data-wt-vignette="off"]) body.wt-home::before {
            content: '' !important;
            position: fixed !important;
            inset: 0 !important;
            background: linear-gradient(to right,
                #000000 0%, transparent 14%,
                transparent 86%, #000000 100%) !important;
            pointer-events: none !important;
            z-index: 9999 !important;
        }
        body.wt-viewer {
            background-color: var(--wt-bg) !important;
        }
        body.wt-viewer #container,
        body.wt-viewer #content,
        body.wt-viewer .cont_box,
        body.wt-viewer .comment_area {
            background-color: transparent !important;
        }
        .viewer_lst {
            background-color: transparent !important;
            color: var(--wt-text) !important;
        }
        /* Never touch comic panels — filter:none preserves original colors. */
        ._images { filter: none !important; }

        /* Panel-strip as one "card": no shadows. Rounded corners on the
           container + overflow:hidden clip the first/last panel corners into
           the card shape, and a 1px white hairline outline (via box-shadow
           inset) defines the card boundary — same idiom as the homepage cards,
           but on the comic strip wrapper.
           - width: fit-content shrinks the container to match the actual image
             width (parent wrappers are full-width by default).
           - margin: 0 auto re-centers the shrunken container.
           - font-size:0 / line-height:0 packs stacked panels flush by killing
             text-baseline whitespace between sibling <img>s. */
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
            /* One container = one shadow = no internal seams possible (unlike
               per-image shadows). Combines a rim highlight (top edge), hairline
               outline (full perimeter), and a soft outer halo shadow on all
               sides for the lifted-card read. */
            box-shadow:
                inset 0 1px 0 rgba(255,255,255,.28),
                inset 0 0 0 1px rgba(255,255,255,.14),
                0 0 60px rgba(0,0,0,.9),
                0 16px 40px rgba(0,0,0,.7) !important;
        }
        /* font-size:0 above cascades to anything Webtoons injects between
           panels (ads, chapter links). Restore normal text metrics on
           non-img children so future inline content stays readable. */
        .viewer_img._img_viewer_area > :not(img),
        #_imageList > :not(img) {
            font-size: 14px !important;
            line-height: normal !important;
        }
        .viewer_lst, .cont_box, body.wt-viewer #content { overflow: visible !important; }

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
        .tool_area a { color: var(--wt-text) !important; }

        /* Episode thumbnail strip — same base background as the rest of the
           viewer area so there are no visible shade shifts between sections. */
        .episode_area {
            background: var(--wt-bg) !important;
            border-color: var(--wt-border) !important;
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
        /* Episode-strip scroll arrows. Base sprite is dark glyphs on white
           that disappear into our dark surface; our generic button rule
           then paints them as small mis-aligned chips. Replace with heavy
           chevrons at thumbnail height, vertically centered against the
           87px tall thumbnail row. Scoped to .episode_lst so nothing else
           is touched even if the class names differ. */
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
        /* "Want more?" app download banner inside the viewer column — covers
           variants Webtoons may inject under nonstandard class names.
           Footer .foot_app/.foot_cont/.foot_down_msg/.footapp_icon_cont are
           already dark from the footer block above. */
        #_viewerBox .foot_app, .viewer_lst .foot_app,
        [class*="dsc_down"], [class*="DownApp"], [class*="download_app"] {
            background: var(--wt-bg-elev) !important;
            color: var(--wt-text) !important;
        }

        /* === Viewer page elevation ===
           .aside.viewer > .ranking_lst.viewer > .lst_area × 2 (Trending &
           Popular, Top Originals). Each .lst_area is carded by the shared
           sidebar-card rule above — do NOT wrap them in extra elements or add
           a second card layer here (that produced a card-inside-a-card). */

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
        /* Section header arrow — sprite, needs filter not color.
           Same treatment on .aside.viewer (viewer page) and .aside.challenge
           (canvas page sidebar). */
        .aside.viewer .ico_arr1,
        .aside.challenge .ico_arr1,
        .title_area .ico_arr1 {
            filter: brightness(0) invert(1) opacity(.7) !important;
            color: var(--wt-text) !important;
        }
        .ranking_lst .title_area h2 a, .ranking_lst .title_area h2 span {
            color: var(--wt-text) !important;
        }
        .ranking_lst .title_area h2 span em { color: var(--wt-text-dim) !important; }
        .ranking_lst .ico_arr1 { color: var(--wt-text-dim) !important; }
        /* Ranking list item dividers and section separators. */
        .ranking_lst li,
        .cont_box .aside { border-color: var(--wt-border) !important; }
        /* Viewer info / ad / patron section top separators — hidden entirely
           so the column under the panels reads as one continuous dark surface
           (no faint horizontal lines below the comic). */
        .viewer_lst .viewer_info_area,
        .viewer_lst .viewer_ad_area,
        .viewer_patron_area {
            border-top: none !important;
            border-bottom: none !important;
        }
        /* WCC comment sort tabs bottom border. */
        [class*="wcc_SortOrderTabs__root"] { border-bottom-color: var(--wt-border) !important; }
        /* Sidebar patron/section separator inside .aside.detail. */
        .aside.detail .aside_patron { border-top-color: var(--wt-border) !important; }
        /* Ranking list section bottom border (.lst_type1 = the ranked item list).
           Suppress in viewer aside — each .lst_area is already a card. */
        .lst_type1 { border-bottom-color: var(--wt-border) !important; }
        .aside.viewer .lst_type1 { border-bottom: none !important; }
        /* CANVAS Weekly round-up / challenge_spot top separator. */
        .challenge_spot, .viewer .challenge_spot { border-top-color: var(--wt-border) !important; }

        /* "Share this series and show support" prompt + Like/Subscribe pills */
        .viewer_lst .dsc_encourage { color: var(--wt-text) !important; }
        .spi_area .bx {
            background: var(--wt-bg-elev2) !important;
            color: var(--wt-text) !important;
            border: 1px solid var(--wt-border) !important;
            transition: background .15s, border-color .15s, box-shadow .15s, transform .1s !important;
        }
        .spi_area .bx:hover {
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
           the form wcc_<Component>__<element>. */

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
        /* Comment editor toolbar action icons. The current WCC ships them as
           inline SVGs with stroke="currentColor" and fill="currentColor"
           under a TextEditor_* CSS-module class family (not wcc_Editor__).
           So setting color on the button is enough — no filters needed
           (filters were flattening the icons to solid white blobs). */
        [class*="wcc_Editor__actionBar"] button,
        [class*="wcc_Editor__toolbar"] button,
        [class*="wcc_Editor__bottomLeftCornerIcon"],
        [class*="wcc_Editor__bottomLeftCornerIcon"] button,
        [class*="TextEditor_"] button,
        [class*="TextEditor_"] [role="button"] {
            color: var(--wt-text-dim) !important;
            opacity: 1 !important;
        }
        [class*="wcc_Editor__actionBar"] button:hover,
        [class*="wcc_Editor__toolbar"] button:hover,
        [class*="wcc_Editor__bottomLeftCornerIcon"] button:hover,
        [class*="TextEditor_"] button:hover,
        [class*="TextEditor_"] [role="button"]:hover {
            color: var(--wt-text) !important;
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

        /* Sort-order tabs (TOP / NEWEST) — underline tabs. They are <button>s,
           so the generic button rule boxed them; strip that and mark the
           active tab with an accent underline instead. */
        [class*="wcc_SortOrderTabs__root"], [class*="wcc_SortOrderTab__root"] {
            background: transparent !important;
            color: var(--wt-text-dim) !important;
        }
        [class*="wcc_SortOrderTab__root"] {
            border: 0 !important;
            border-radius: 0 !important;
            box-shadow: inset 0 -2px 0 transparent !important;
            transition: color .15s ease, box-shadow .15s ease !important;
        }
        [class*="wcc_SortOrderTab__root"]:hover {
            background: transparent !important;
            color: var(--wt-text) !important;
        }
        [class*="wcc_SortOrderTab__active"] {
            color: var(--wt-accent) !important;
            box-shadow: inset 0 -2px 0 var(--wt-accent) !important;
        }

        /* Reaction (like / dislike) and reply-toggle buttons — soft pills on
           the comment card instead of the generic square bordered button. */
        [class*="wcc_CommentReaction__root"] {
            background: transparent !important;
            color: var(--wt-text-dim) !important;
        }
        [class*="wcc_CommentReaction__action"],
        [class*="wcc_ReplyFolderToggle__root"] {
            background: var(--wt-bg-elev2) !important;
            color: var(--wt-text-dim) !important;
            border: 1px solid transparent !important;
            border-radius: 999px !important;
            padding: 0 12px !important;
            min-height: 30px !important;
            transition: background-color .15s ease, color .15s ease, border-color .15s ease !important;
        }
        [class*="wcc_CommentReaction__action"]:hover,
        [class*="wcc_ReplyFolderToggle__root"]:hover {
            background: var(--wt-bg-hover) !important;
            border-color: var(--wt-border) !important;
            color: var(--wt-text) !important;
        }
        [class*="wcc_ReplyFolderToggle__root"] { color: var(--wt-link) !important; }
        /* Editor toolbar icons + kebab menu: icon-only buttons, no box. */
        [class*="wcc_ContentTagPopover__button"],
        [class*="wcc_CommentOptionMenu__trigger"] {
            background: transparent !important;
            border: 0 !important;
            border-radius: 6px !important;
        }
        [class*="wcc_ContentTagPopover__button"]:hover,
        [class*="wcc_CommentOptionMenu__trigger"]:hover { background: var(--wt-bg-hover) !important; }
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
        [class*="wcc_ReplyUnfold__unfold"] {
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

        /* End-of-chapter card: schedule chip, prompt, actions, share. */
        .viewer_lst .viewer_info_area {
            max-width: 800px !important;
            margin: 40px auto 0 !important;
            padding: 28px 24px 26px !important;
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
            padding: 4px 14px 4px 4px !important;
            border-radius: 999px !important;
            background: var(--wt-bg-elev2) !important;
            color: var(--wt-text-dim) !important;
            font-size: 12px !important;
            font-weight: 700 !important;
            letter-spacing: .08em !important;
            text-transform: uppercase !important;
        }
        .viewer_lst .day_info .txt_ico_up { margin: 0 !important; transform: scale(.8) !important; }
        .viewer_lst .dsc_encourage {
            color: var(--wt-text-dim) !important;
            font-size: 15px !important;
            line-height: 1.5 !important;
            margin: 14px 0 18px !important;
        }
        .viewer_lst .spi_area {
            display: inline-flex !important;
            flex-wrap: wrap !important;
            justify-content: center !important;
            align-items: center !important;
            gap: 8px !important;
        }
        .viewer_lst .spi_area { margin: 0 !important; }  /* base: 18px / 53px */
        .viewer_lst .spi_area li { float: none !important; margin: 0 !important; }
        /* Primary action = Subscribe (brand green), secondary = Like. */
        .viewer_lst .spi_area .bx {
            height: 42px !important;
            line-height: 42px !important;
            min-width: 120px !important;
            padding: 0 18px !important;
            border-radius: 999px !important;
            font-weight: 600 !important;
        }
        .viewer_lst .spi_area .lnk_favorites.bx {
            background: var(--wt-accent) !important;
            border-color: var(--wt-accent) !important;
            color: var(--wt-text-on-accent) !important;
        }
        .viewer_lst .spi_area .lnk_favorites.bx .ico_plus3 { filter: brightness(0) !important; }
        .viewer_lst .spi_area .lnk_favorites.bx:hover {
            background: var(--wt-accent-soft) !important;
            border-color: var(--wt-accent-soft) !important;
            box-shadow: 0 6px 18px rgba(0,213,100,.25) !important;
        }
        /* Already subscribed: calm secondary style so it doesn't shout. */
        .cont_box .viewer_lst .spi_area .lnk_favorites.bx.on {
            background: var(--wt-bg-elev2) !important;
            border-color: var(--wt-border) !important;
            color: var(--wt-text-dim) !important;
        }
        .cont_box .viewer_lst .spi_area .lnk_favorites.bx.on .ico_plus3 { filter: brightness(0) invert(1) opacity(.7) !important; }
        /* Share icons: brand-coloured discs are loud next to the actions —
           muted at rest, full colour on hover/focus. A hairline divider
           separates them from the two action buttons. */
        .viewer_lst .spi_area li:nth-child(3) {
            margin-left: 10px !important;
            padding-left: 18px !important;
            border-left: 1px solid rgba(255,255,255,.1) !important;
        }
        .viewer_lst .spi_area [class^="ico_"]:not(.ico_like2):not(.ico_plus3) {
            filter: grayscale(1) brightness(1.3) opacity(.55) !important;
            transition: filter .15s ease !important;
        }
        .viewer_lst .spi_area [class^="ico_"]:not(.ico_like2):not(.ico_plus3):hover,
        .viewer_lst .spi_area [class^="ico_"]:not(.ico_like2):not(.ico_plus3):focus-visible {
            filter: none !important;
        }

        /* Episode strip — card surface drawn with an outer box-shadow spread
           (fake padding) so the carousel's measured box is untouched. */
        #bottomEpisodeList.episode_area {
            background: transparent !important;
            padding-top: 48px !important;
        }
        #bottomEpisodeList .episode_lst {
            background: var(--wt-bg-elev) !important;
            border-radius: 16px !important;
            box-shadow:
                0 0 0 14px var(--wt-bg-elev),
                0 0 0 15px rgba(255,255,255,.08),
                0 16px 40px rgba(0,0,0,.35) !important;
        }
        /* .episode_cont also matches our mobile-site rule (which paints it
           --wt-bg) — keep the strip's inner viewport on the card surface. */
        #bottomEpisodeList .episode_lst .episode_cont { background: transparent !important; }
        /* Base height 175px leaves dead space under the titles. Content runs
           12px (li padding-top) → ~123px (title baseline), so 135px gives the
           same 12px above the thumbnails and below the titles — vertically
           centred inside the card. */
        #bottomEpisodeList .episode_lst { height: 135px !important; }
        #bottomEpisodeList .episode_lst .thmb,
        #bottomEpisodeList .episode_lst .thmb img,
        #bottomEpisodeList .episode_lst ul .mask { border-radius: 8px !important; }
        #bottomEpisodeList .episode_lst .subj {
            color: var(--wt-text-dim) !important;
            font-size: 13px !important;
            letter-spacing: .02em !important;
        }
        #bottomEpisodeList .episode_lst li a:hover .subj { color: var(--wt-text) !important; }
        #bottomEpisodeList .episode_lst li .on .thmb { border-radius: 10px !important; }
        #bottomEpisodeList .episode_lst li .on .subj { color: var(--wt-accent) !important; }
        /* Round arrow buttons centred on the 87px thumbnail row. */
        .episode_area#bottomEpisodeList .episode_lst .pg_prev,
        .episode_area#bottomEpisodeList .episode_lst .pg_next {
            width: 40px !important;
            height: 40px !important;
            top: 35px !important;
            border-radius: 50% !important;
            background: var(--wt-bg-elev2) !important;
            border: 1px solid rgba(255,255,255,.12) !important;
            box-shadow: 0 4px 12px rgba(0,0,0,.4) !important;
        }
        /* Arrows sit in the card's side padding, clear of the first/last
           thumbnail (base left/right:-3px made them overlap the artwork). */
        .episode_area#bottomEpisodeList .episode_lst .pg_prev { left: -12px !important; }
        .episode_area#bottomEpisodeList .episode_lst .pg_next { right: -12px !important; left: auto !important; }
        /* text-indent:0 — the pseudo inherits the site's text-indent:100%
           hidden-label trick, which shoved ❮ to the circle's right edge. */
        .episode_area#bottomEpisodeList .episode_lst .pg_prev::before,
        .episode_area#bottomEpisodeList .episode_lst .pg_next::after {
            font-size: 18px !important;
            text-indent: 0 !important;
            padding: 0 !important;
        }

        /* Sidebar card headers ("Trending & Popular ›", "Top Originals ›"):
           the h2 is display:block with a plain-text ">" (.ico_arr1) that sat
           low beside the larger title. Flex-centre title + chevron, draw a
           proper › glyph, and move the whole header into one hover target. */
        .ranking_lst.viewer > .lst_area > .title_area h2 {
            display: flex !important;
            align-items: center !important;
            gap: 2px !important;
            line-height: 1.2 !important;
        }
        .ranking_lst.viewer > .lst_area > .title_area h2 > a {
            font-size: 18px !important;
            font-weight: 700 !important;
            line-height: 1.2 !important;
            letter-spacing: .01em !important;
        }
        .ranking_lst.viewer > .lst_area > .title_area h2 .ico_arr1 {
            font-size: 0 !important;
            width: 22px !important;
            height: 22px !important;
            margin: 0 !important;
            justify-content: center !important;
            border-radius: 50% !important;
            transition: background-color .15s ease, color .15s ease !important;
        }
        .ranking_lst.viewer > .lst_area > .title_area h2 .ico_arr1::after {
            content: '\\203A' !important;
            font-size: 20px !important;
            line-height: 1 !important;
            color: var(--wt-text-mute) !important;
            transform: translateY(-1px) !important;
        }
        .ranking_lst.viewer > .lst_area > .title_area h2:hover > a { color: var(--wt-accent) !important; }
        .ranking_lst.viewer > .lst_area > .title_area h2:hover .ico_arr1 { background: var(--wt-bg-hover) !important; }
        .ranking_lst.viewer > .lst_area > .title_area h2:hover .ico_arr1::after { color: var(--wt-accent) !important; }

        /* Creator note — highlighted card with an accent edge. */
        .comment_area .creator_note {
            background: var(--wt-bg-elev) !important;
            border: 1px solid rgba(255,255,255,.08) !important;
            border-radius: 16px !important;
            box-shadow: inset 3px 0 0 var(--wt-accent), 0 8px 24px rgba(0,0,0,.3) !important;
            padding: 20px 22px !important;
        }
        .comment_area .creator_note .title {
            color: var(--wt-text-mute) !important;
            font-size: 12px !important;
            font-weight: 700 !important;
            letter-spacing: .1em !important;
            text-transform: uppercase !important;
        }
        .comment_area .creator_note .author_area a.author_name { text-decoration: none !important; }
        .comment_area .creator_note .author_area a.author_name:hover span { color: var(--wt-accent) !important; }
        .comment_area .creator_note .author_text {
            color: var(--wt-text-dim) !important;
            font-size: 15px !important;
            line-height: 1.6 !important;
        }

        /* Comments header: title + count chip. */
        .comment_head { margin: 36px 0 14px !important; column-gap: 10px !important; }
        .comment_head .title_comments {
            font-size: 20px !important;
            font-weight: 700 !important;
            letter-spacing: .02em !important;
        }
        .comment_head .count {
            background: var(--wt-bg-elev2) !important;
            color: var(--wt-text-dim) !important;
            font-size: 13px !important;
            font-weight: 600 !important;
            line-height: 1 !important;
            padding: 5px 10px !important;
            border-radius: 999px !important;
        }

        /* Spoiler switch is a <button>: drop the generic button box. */
        [class*="wcc_Spoiler__root"] { border: 0 !important; padding: 0 !important; gap: 6px !important; }
        [class*="wcc_Spoiler__text"] { color: var(--wt-text-dim) !important; font-size: 13px !important; }

        /* Composer — rounded field with an accent focus ring. */
        [class*="wcc_Editor__root"] { background: transparent !important; }
        [class*="wcc_Editor__editor"] {
            border: 1px solid rgba(255,255,255,.1) !important;
            border-radius: 14px !important;
            overflow: hidden !important;
            transition: border-color .15s ease, box-shadow .15s ease !important;
        }
        [class*="wcc_Editor__editor"]:focus-within {
            border-color: var(--wt-accent) !important;
            box-shadow: 0 0 0 3px rgba(0,213,100,.15) !important;
        }
        [class*="wcc_Editor__actionBar"] { border-top: 1px solid rgba(255,255,255,.06) !important; }
        [class*="TextEditor_Toolbar-module__root"] button,
        [class*="TextEditor_SubmitControlPanel-module__button"] {
            background: transparent !important;
            border: 0 !important;
            border-radius: 8px !important;
        }
        [class*="TextEditor_Toolbar-module__root"] button:hover { background: var(--wt-bg-hover) !important; }

        /* Sort tabs sit on a hairline that runs the width of the column. */
        [class*="wcc_SortOrderTabs__root"] {
            border-bottom: 1px solid rgba(255,255,255,.08) !important;
            margin-top: 16px !important;
        }
        [class*="wcc_SortOrderTab__root"] {
            padding: 10px 14px !important;
            font-size: 14px !important;
            font-weight: 600 !important;
            text-transform: none !important;
        }

        /* Comment list — ONE card with hairline dividers, not a stack of
           separately bordered boxes. */
        [class*="wcc_CommentList__list"] {
            background: var(--wt-bg-elev) !important;
            border: 1px solid rgba(255,255,255,.08) !important;
            border-radius: 16px !important;
            margin-top: 14px !important;
            overflow: hidden !important;
        }
        [class*="wcc_CommentItem__root"] {
            background: transparent !important;
            border: 0 !important;
            border-radius: 0 !important;
            margin: 0 !important;
            padding: 18px 22px !important;
            transition: background-color .15s ease !important;
        }
        [class*="wcc_CommentItem__root"] + [class*="wcc_CommentItem__root"] {
            border-top: 1px solid rgba(255,255,255,.06) !important;
        }
        [class*="wcc_CommentItem__root"]:hover { background: rgba(255,255,255,.02) !important; }
        /* Names in a soft blue (not body-text white) so the author of each
           comment is identifiable at a glance; weight carries the hierarchy. */
        [class*="wcc_CommentHeader__name"] {
            color: var(--wt-name) !important;
            font-weight: 700 !important;
            font-size: 15px !important;
        }
        [class*="wcc_CommentHeader__createdAt"] { font-size: 12px !important; }
        [class*="wcc_TextContent__content"] {
            color: var(--wt-text) !important;
            font-size: 15px !important;
            line-height: 1.6 !important;
        }
        /* Actions: ghost pills — quiet until hovered. */
        [class*="wcc_CommentReaction__action"],
        [class*="wcc_ReplyFolderToggle__root"] {
            background: transparent !important;
            border: 1px solid rgba(255,255,255,.1) !important;
            min-height: 30px !important;
            font-size: 13px !important;
        }
        [class*="wcc_CommentReaction__action"]:hover,
        [class*="wcc_ReplyFolderToggle__root"]:hover {
            background: var(--wt-bg-hover) !important;
            border-color: rgba(255,255,255,.2) !important;
        }
        [class*="wcc_ReplyFolderToggle__root"] { color: var(--wt-text-dim) !important; }
        [class*="wcc_ReplyFolder__root"] {
            background: var(--wt-bg-elev2) !important;
            border-radius: 12px !important;
            margin-top: 12px !important;
        }
        /* "More" — full pill button under the card, not a boxed link. */
        [class*="wcc_CommentMore__root"] { padding: 18px 0 4px !important; text-align: center !important; }
        [class*="wcc_CommentMore__more"] {
            display: inline-flex !important;
            align-items: center !important;
            gap: 6px !important;
            height: auto !important;
            padding: 10px 26px !important;
            border: 1px solid rgba(255,255,255,.12) !important;
            border-radius: 999px !important;
            background: var(--wt-bg-elev) !important;
            color: var(--wt-text) !important;
            font-weight: 600 !important;
        }
        [class*="wcc_CommentMore__more"]:hover {
            background: var(--wt-bg-hover) !important;
            border-color: var(--wt-accent) !important;
            color: var(--wt-accent) !important;
        }

        /* CANVAS Weekly round-up — rounded tiles with a bottom gradient so
           the overlaid title/author stay readable on any artwork (the base
           24% flat black .skin let bright covers swallow the white text). */
        .viewer .challenge_spot { border-top-color: rgba(255,255,255,.06) !important; }
        .viewer .challenge_spot_inner h3 { color: var(--wt-text) !important; font-weight: 700 !important; }
        .challenge_spot_list a,
        .challenge_spot_list .img_area { border-radius: 12px !important; overflow: hidden !important; }
        .challenge_spot_list .skin {
            background: linear-gradient(to bottom, transparent 40%, rgba(0,0,0,.85) 100%) !important;
            opacity: 1 !important;
        }
        .challenge_spot_list a:hover .skin { opacity: 0 !important; }
        .challenge_spot_list .info_area .subj { font-size: 18px !important; font-weight: 700 !important; }
        .challenge_spot_list .info_area .author { font-size: 13px !important; color: rgba(255,255,255,.8) !important; }
        .viewer .challenge_spot_inner .paging .num [class*="ico"],
        .viewer .challenge_spot_inner .paging .num a,
        .viewer .challenge_spot_inner .paging .num span {
            border-radius: 50% !important;
        }

        /* Footer */
        #footer, .footer {
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
        .navigation, .episode_cont {
            background-color: var(--wt-bg) !important;
            color: var(--wt-text) !important;
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
        ._loginLayer, ._defaultLoginComponent {
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
        ._btnLoginSns, .btn_sns, ._btnLoginEmail {
            background: var(--wt-bg-elev2) !important;
            color: var(--wt-text) !important;
            border: 1px solid var(--wt-border) !important;
        }
        ._btnLoginSns:hover, .btn_sns:hover, ._btnLoginEmail:hover {
            background: var(--wt-bg-hover) !important;
        }
        ._btnLoginLayerClose { color: var(--wt-text) !important; }

        /* ---------- Series detail page (e.g. /<lang>/<genre>/<slug>/list?title_no=...) ---------- */

        /* === Detail page elevation ===
           Three-level hierarchy: page (--wt-bg) → episode list + sidebar cards
           (--wt-bg-elev) → episode rows (--wt-bg-elev2). */

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
        /* Episode rows: li.detail_list_item > a.detail_list_link (flex row:
           thumb · title · date · likes · #N). Base CSS draws #f5f5f5 row
           dividers and a #fbfbfb hover — both white on dark. Rows stay flat
           on the card (no per-row background) — the list card is the only
           elevation; hover adds a tint plus an accent bar on the left edge. */
        .detail_body .detail_list_area .detail_list_item,
        .detail_body .detail_list_area .detail_list_item:first-child {
            background: transparent !important;
            border-color: rgba(255,255,255,.07) !important;
            transition: background-color .15s ease, box-shadow .15s ease !important;
        }
        .detail_body .detail_list_area .detail_list_item:hover {
            background: var(--wt-bg-hover) !important;
            box-shadow: inset 3px 0 0 var(--wt-accent) !important;
        }
        .detail_body .detail_list_area .detail_list_item .thmb img {
            border-radius: 4px !important;
            transition: filter .15s ease !important;
        }
        .detail_body .detail_list_area .detail_list_item:hover .thmb img {
            filter: brightness(1.08) !important;
        }

        /* Row typography — title > date > likes > episode number. Base CSS
           paints title / #N #3c3c3c and date / likes #666 (unreadable on
           dark), so every column is restated at the base selector's
           specificity. */
        .detail_body .detail_list_area .subj span {
            color: var(--wt-text) !important;
            font-size: 16px !important;
            font-weight: 500 !important;
            letter-spacing: .01em !important;
            transition: color .15s ease !important;
        }
        .detail_body .detail_list_area .date {
            color: var(--wt-text-dim) !important;
            font-size: 13px !important;
            font-variant-numeric: tabular-nums !important;
        }
        .detail_body .detail_list_area .like_area {
            color: var(--wt-text-dim) !important;
            font-size: 13px !important;
            font-variant-numeric: tabular-nums !important;
        }
        .detail_body .detail_list_area .tx {
            color: var(--wt-text-mute) !important;
            font-size: 13px !important;
            font-weight: 600 !important;
            font-variant-numeric: tabular-nums !important;
            padding-right: 12px !important;
        }
        .detail_body .detail_list_area .tx_up { color: var(--wt-accent) !important; }
        /* Heart sprite is a dark outline — tint it to the like colour. */
        .detail_body .detail_list_area .ico_like {
            filter: brightness(0) saturate(100%) invert(47%) sepia(89%) saturate(505%) hue-rotate(314deg) brightness(95%) contrast(92%) !important;
        }
        .detail_body .detail_list_area .detail_list_item:hover .subj span {
            color: var(--wt-accent) !important;
        }
        .detail_body .detail_list_area .detail_list_item:hover .date,
        .detail_body .detail_list_area .detail_list_item:hover .like_area {
            color: var(--wt-text) !important;
        }

        /* Already-read episodes. Base CSS greys every column of a :visited
           row to #c4c4c4 — on white that reads as "done", on dark it made
           the whole list look washed out. Keep the "read" signal but make it
           a clearly readable muted tone (~5.8:1 on --wt-bg-elev); unread
           rows stay full brightness so the next episode stands out. */
        .detail_body .detail_list_area .detail_list_link:visited .subj span {
            color: var(--wt-text-read) !important;
        }
        .detail_body .detail_list_area .detail_list_link:visited .date,
        .detail_body .detail_list_area .detail_list_link:visited .like_area,
        .detail_body .detail_list_area .detail_list_link:visited .tx {
            color: var(--wt-text-mute) !important;
        }
        .detail_body .detail_list_area .detail_list_item:hover .detail_list_link:visited .subj span {
            color: var(--wt-accent) !important;
        }

        /* Paywall "NOTE" strip and "Read N new episodes on the app" QR strip
           at the top of the episode list. Base CSS: #f5f5f5 top border and
           inherited text; both sit on the (now dark) list card. */
        .detail_body .detail_paywall, .detail_body .detail_install_app {
            border-top-color: rgba(255,255,255,.07) !important;
            color: var(--wt-text-dim) !important;
        }
        .detail_body .detail_install_app strong { color: var(--wt-text) !important; }
        .detail_body .detail_install_app em,
        .detail_body .detail_paywall .lk_more { color: var(--wt-accent) !important; }
        .detail_body .detail_install_app .img_qrcode { border-radius: 4px !important; }
        .detail_body .detail_paywall .ico_note {
            filter: brightness(0) invert(1) opacity(.7) !important;
        }

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

        /* Episode sort dropdown — "Latest / Oldest" selector above the
           episode list on detail pages. Scoped to .detail_body so it
           doesn't clobber the /canvas .sort_box rules above (which set
           the elevated panel + border-radius + open animation). */
        .detail_body .sort_box {
            background: var(--wt-bg-elev) !important;
            border-color: var(--wt-border) !important;
            color: var(--wt-text) !important;
            box-shadow: 0 4px 12px rgba(0,0,0,.5) !important;
        }
        .detail_body .sort_box a, .detail_body .sort_box button { color: var(--wt-text-dim) !important; background: transparent !important; }
        .detail_body .sort_box a:hover, .detail_body .sort_box button:hover,
        .detail_body .sort_box .on, .detail_body .sort_box [aria-current="true"] { color: var(--wt-text) !important; }

        /* "You may also like" recommendation card items (.other_card_item) —
           base CSS: background:#fff. They sit inside .detail_other which has
           no background set, so overriding the item itself is enough. */
        .other_card_item {
            background: var(--wt-bg-elev) !important;
            color: var(--wt-text) !important;
        }
        .other_card_item:hover { background: var(--wt-bg-elev2) !important; }

        /* Scoped to .detail_other so it doesn't paint .lst_type1 rows
           inside elevated viewer/canvas sidebar cards (those should
           stay flat — see the shared sidebar-card rule above). */
        .detail_other .lst_type1 li {
            background: var(--wt-bg-elev) !important;
            border-color: var(--wt-border) !important;
            border-radius: 6px;
        }
        .detail_other .lst_type1 li:hover { background: var(--wt-bg-elev2) !important; }
        .detail_other .lst_type1 .subj   { color: var(--wt-text) !important; }
        .detail_other .lst_type1 .author { color: var(--wt-text-dim) !important; }
        .detail_other .lst_type1 .grade_num, .detail_other .lst_type1 .grade_area { color: var(--wt-text-mute) !important; }
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
           color:#070707 on both .paginate a and strong — invisible on dark.
           On detail pages the base places .paginate inside the floated
           .detail_lst column at a position the floated children paint around,
           so it renders between episode rows. Force normal flow unconditionally
           — gating on body.wt-detail (set by JS) caused a visible flash where
           pagination painted mid-list before the class was applied. /canvas
           pagination is already in normal flow, so position/clear are no-ops
           there. */
        /* Base .paginate is display:flex with a fixed 32px height. Keep it a
           flex row (display:block turned the prev arrow into a full-width
           block line and pushed the numbers below the card's clip edge);
           allow wrapping so 10+ pages never overflow the column. */
        .paginate:not(.v2):not(.episode_lst *) {
            position: static !important;
            display: flex !important;
            flex-wrap: wrap !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 4px !important;
            height: auto !important;
            clear: both !important;
            margin: 24px 0 4px !important;
        }
        .paginate:not(.v2):not(.episode_lst *) .pg_page + .pg_page,
        .detail_body .paginate .pg_prev { margin-left: 0 !important; }
        .paginate a, .paginate strong, .paginate span,
        .paginate.v2 [class^="pg_"] {
            color: var(--wt-text) !important;
        }
        .paginate a span { color: inherit !important; }
        /* Pagination pills: explicit centered dimensions so both the link
           and the active <strong> render as the same shape. The base CSS
           sizes .paginate .on with a sprite background and fixed width
           which, when combined with naive padding, produces a giant green
           box with a tiny clipped "1". inline-flex with min-width + height
           gives a consistent pill regardless of base markup. */
        .paginate a,
        .paginate strong,
        .paginate .on,
        .paginate [aria-current="true"] {
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
        .paginate a:hover {
            color: var(--wt-text) !important;
            background-color: var(--wt-bg-hover) !important;
            box-shadow: inset 0 0 0 1px var(--wt-accent-soft) !important;
        }
        .paginate .on,
        .paginate [aria-current="true"],
        .paginate strong {
            color: var(--wt-text-on-accent) !important;
            background-color: var(--wt-accent) !important;
        }
        /* The next/prev arrows are sprite-backed with a dark fill that
           disappears on the dark surface. Instead of filter-inverting (which
           also inverts the hover background, producing a stark white pill),
           kill the sprite and draw the chevron with text content. The inner
           icon span is hidden so we don't get a double glyph. */
        .paginate .pg_next, .paginate .pg_prev,
        .paginate a[class*="next"], .paginate a[class*="prev"] {
            background-image: none !important;
            text-indent: 0 !important;
            color: var(--wt-text) !important;
        }
        .paginate .pg_next > *, .paginate .pg_prev > *,
        .paginate [class*="ico_arr"] {
            display: none !important;
        }
        /* Base CSS draws the arrow sprite on ::before (both prev AND next)
           as a display:block 20px box. Neutralise that box on both sides,
           then draw text chevrons: ‹ on prev::before, › on next::after. */
        .paginate:not(.v2):not(.episode_lst *) .pg_prev::before, .paginate:not(.v2):not(.episode_lst *) .pg_next::before {
            display: inline !important;
            background: none !important;
            width: auto !important;
            height: auto !important;
            margin: 0 !important;
        }
        .paginate:not(.v2):not(.episode_lst *) .pg_next::before { content: none !important; }
        .paginate .pg_next::after, .paginate a[class*="next"]::after { content: '\\203A' !important; font-size: 20px !important; line-height: 1 !important; }
        .paginate .pg_prev::before, .paginate a[class*="prev"]::before { content: '\\2039' !important; font-size: 20px !important; line-height: 1 !important; }
        .paginate:not(.v2):not(.episode_lst *) .pg_prev, .paginate:not(.v2):not(.episode_lst *) .pg_next {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            width: 32px !important;
            height: 28px !important;
            margin: 0 !important;
            border-radius: 6px !important;
        }
        /* Disabled first/last-page arrows (<span class="pg_prev off">). */
        .paginate .pg_prev.off, .paginate .pg_next.off {
            opacity: .3 !important;
            pointer-events: none !important;
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
           3. Replace the thin ‹ › guillemets the generic .paginate rule
              injects with the heavy chevron ornaments ❮ ❯ (same as the
              snb scroll arrows), and absolutely-position the pseudo
              inside the button — centering becomes bulletproof regardless
              of font metrics. Specificity beats the generic rule. */
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
        .viewer_lst img, ._images img, .viewer_img img {
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
    // The vignette lives in the theme CSS, gated on this attribute, so it
    // follows the theme on/off state without a separate <style>.
    const applyVignette = (on) => {
        document.documentElement.dataset.wtVignette = on ? 'on' : 'off';
    };

    // First-run default follows the OS preference — once the user toggles, their
    // choice persists and OS changes are ignored.
    const themeDefault = !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);

    // Cached state — avoids GM IPC calls in the hot MutationObserver path.
    let darkOn = GM_getValue(KEY_THEME, themeDefault);
    let dimOn = GM_getValue(KEY_DIM, false);
    let vignetteOn = GM_getValue(KEY_VIGNETTE, true);

    applyTheme(darkOn);
    applyDim(dimOn);
    applyVignette(vignetteOn);

    // SPA / late-loading bundle defense: if our <style> ever gets removed
    // (Webtoons swaps stylesheets on some chapter transitions), put it back.
    // Cheap — only fires on direct childList changes to <head>.
    function watchHead() {
        if (!document.head) return;
        new MutationObserver(() => {
            if (darkOn && !document.getElementById('wt-dark-style')) applyTheme(true);
            if (dimOn && !document.getElementById('wt-dim-style')) applyDim(true);
            // NOTE: do NOT call syncViewerClass() here — head mutations fire during
            // SPA stylesheet swaps while the OLD page's #content.viewer is still in
            // the DOM, which would re-add wt-viewer right after pushState removed it.
            // scheduleViewerSync() on pushState handles re-adding the class when needed.
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
    function toggleVignette() {
        vignetteOn = !vignetteOn;
        GM_setValue(KEY_VIGNETTE, vignetteOn);
        applyVignette(vignetteOn);
        console.info('[webtoons-dark-mode] edge vignette →', vignetteOn ? 'on' : 'off');
    }

    if (typeof GM_registerMenuCommand === 'function') {
        GM_registerMenuCommand('Toggle Webtoons dark mode', toggleTheme);
        GM_registerMenuCommand('Toggle reader dim', toggleDim);
        GM_registerMenuCommand('Toggle edge shading (vignette)', toggleVignette);
    }

    // Keyboard shortcuts. Multiple combos so the user can use whichever doesn't
    // conflict with their OS / browser / keyboard-layout switcher:
    //   - Alt+Shift+T  OR  Ctrl+Alt+D       → toggle theme
    //   - Alt+Shift+N  OR  Ctrl+Alt+Shift+D → toggle reader dim
    //   - Alt+Shift+V  OR  Ctrl+Alt+Shift+V → toggle edge vignette
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
        const vigAltShiftV = matchCombo(e, { alt: true, shift: true, ctrl: false, code: 'KeyV', letter: 'V' });
        const vigCtrlAltShV = matchCombo(e, { alt: true, shift: true, ctrl: true, code: 'KeyV', letter: 'V' });

        let handled = false;
        try {
            if (themeAltShiftT || themeCtrlAltD) {
                toggleTheme();
                handled = true;
            } else if (dimAltShiftN || dimCtrlAltShD) {
                toggleDim();
                handled = true;
            } else if (vigAltShiftV || vigCtrlAltShV) {
                toggleVignette();
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

    // Sync vignette body classes for all three page types. JS is the only gate —
    // no CSS :has() fallbacks (they cause false positives during SPA transitions).
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
    syncBodyClasses();
    document.addEventListener('DOMContentLoaded', syncBodyClasses);

    // SPA generation token: every navigation bumps _navGen so that timers
    // scheduled for the previous route early-out instead of mutating DOM that
    // belongs to a page the user already navigated away from.
    let _navGen = 0;
    function scheduleSpa(fn) {
        const gen = _navGen;
        SPA_RETRY_DELAYS.forEach(d => setTimeout(() => {
            if (gen !== _navGen) return;
            fn();
        }, d));
    }
    function scheduleViewerSync() { scheduleSpa(syncBodyClasses); }
    function scheduleViewerBanners() { scheduleSpa(fixViewerBanners); }
    function scheduleCarouselArrows() { scheduleSpa(styleCarouselArrows); }

    function onSpaNav() {
        _navGen++;
        if (document.body) document.body.classList.remove('wt-viewer', 'wt-detail', 'wt-home');
        scheduleViewerSync();
        scheduleViewerBanners();
        scheduleCarouselArrows();
    }
    // Navigation API: its events reach every JS world, so this fires even
    // when the manager runs us in an isolated world (Tampermonkey MV3) where
    // the page's own history.pushState calls never hit the wrapper below.
    // The wrapper + popstate stay as the fallback for browsers without it.
    // A duplicate call is harmless: onSpaNav just bumps _navGen again.
    if (window.navigation && typeof window.navigation.addEventListener === 'function') {
        window.navigation.addEventListener('navigatesuccess', onSpaNav);
    }
    ['pushState', 'replaceState'].forEach(fn => {
        const orig = history[fn];
        history[fn] = function () {
            orig.apply(this, arguments);
            onSpaNav();
        };
    });
    window.addEventListener('popstate', onSpaNav);

    // Inject centered chevron spans into the carousel prev/next buttons.
    // CSS pseudo-elements proved impossible to center reliably due to Webtoons'
    // own !important rules winning; inline styles on a real DOM node cannot be
    // overridden by any stylesheet.
    function styleCarouselArrows() {
        document.querySelectorAll(
            '.discover_spot .paging .btn_prev, .discover_spot .paging .btn_next'
        ).forEach(btn => {
            if (btn.dataset.wtArrow) return;
            btn.dataset.wtArrow = '1';
            const span = document.createElement('span');
            span.setAttribute('aria-hidden', 'true');
            span.style.cssText =
                'position:absolute;top:0;left:0;right:0;bottom:0;' +
                'display:flex;align-items:center;justify-content:center;' +
                'pointer-events:none;';
            // SVG chevron: pixel-perfect centering independent of font metrics.
            // btn_next has scaleX(-1) on the button which mirrors the SVG to face right.
            span.innerHTML =
                '<svg width="40" height="40" viewBox="0 0 24 24" fill="none"' +
                ' stroke="#e6e6e6" stroke-width="2.5"' +
                ' stroke-linecap="round" stroke-linejoin="round"' +
                ' style="display:block;filter:drop-shadow(0 0 6px rgba(255,255,255,.7))">' +
                '<polyline points="15,18 9,12 15,6"/></svg>';
            btn.appendChild(span);
        });
    }
    document.addEventListener('DOMContentLoaded', styleCarouselArrows);
    scheduleCarouselArrows();

    // Force uniform background throughout the viewer area. All blocks inside
    // #_viewerBox use var(--wt-bg) so there are no rogue gray/brownish strips.
    // Only the episode_area card and comic panel images are exempted.
    function fixViewerBanners() {
        const box = document.querySelector('#_viewerBox');
        if (!box) return;

        const clearBg = (el) => {
            el.style.setProperty('background-color', 'transparent', 'important');
            el.style.setProperty('color', 'var(--wt-text)', 'important');
        };

        // 1. Direct non-structural children of #_viewerBox
        for (const child of Array.from(box.children)) {
            if (child.matches('.aside, .aside.viewer, .comment_area')) continue;
            if (!child.matches('.viewer_lst')) clearBg(child);
        }

        // 2. viewer_lst children — transparent so the body gradient shows through.
        //    Only the comic panel wrapper is exempt (images must not be touched).
        const lst = box.querySelector('.viewer_lst');
        if (lst) {
            for (const child of Array.from(lst.children)) {
                if (child.matches('.viewer_img, ._img_viewer_area, #_imageList')) continue;
                clearBg(child);
                for (const gc of Array.from(child.children)) {
                    const gcBg = window.getComputedStyle(gc).backgroundColor;
                    if (gcBg && gcBg !== 'transparent' && gcBg !== 'rgba(0, 0, 0, 0)') {
                        gc.style.setProperty('background-color', 'transparent', 'important');
                    }
                }
            }
        }
    }
    document.addEventListener('DOMContentLoaded', fixViewerBanners);
    scheduleViewerBanners();

    console.info(`[webtoons-dark-mode] v${VERSION} fully loaded — Alt+Shift+T / Ctrl+Alt+D: theme | Alt+Shift+N / Ctrl+Alt+Shift+D: dim | Alt+Shift+V / Ctrl+Alt+Shift+V: vignette`);
})();
