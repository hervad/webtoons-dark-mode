# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Version numbers follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html) from 1.3.0 on; before that, new features sometimes shipped in patch versions.

Builds 1.0.17–1.0.34 and 1.0.52–1.0.57 were published without an entry here; the [commit history](https://github.com/hervad/webtoons-dark-mode/commits/main) describes them. Some 1.1.x versions were never published on their own, and their links point to the release that included them.

## [Unreleased]

## [1.8.3] - 2026-10-07

### Changed

- **Creator profiles:** the Series and Followers counts are violet, so they stand apart from the amber Follow / Following button; the social link button (Instagram, X, …) is filled with the network's colour; the ⋮ menu on posts is brighter and easier to spot.

## [1.8.2] - 2026-10-07

### Changed

- **Creator profiles:** the Series and Followers counts are amber, matching the Follow button.
- **END badges** on covers (CANVAS lists, creator profiles) are brighter.

## [1.8.1] - 2026-10-07

### Changed

- **Page numbers are easier to spot:** every page number and arrow is now a button with bright text; the current page is a clearer green.
- **Top CANVAS and Up & Coming** (CANVAS lists) match the rest of the theme: headings with the green bar, each series on its own tile, the rank on the cover's corner, and titles on up to two lines.
- **My Comments** shows your comments as tiles, two to a row, instead of long rows with mostly empty space.

### Fixed

- **CANVAS "more" button** (Popular By Category): the arrow sat low and touched the label; it's now a pill like "View all".
- **Top CANVAS:** a long genre in the filter (SUPERNATURAL, HEARTWARMING) no longer cuts the title to "Top CANVA". The "›" after the title is gone: the title isn't a link there.
- **CANVAS covers:** the END and "on hiatus" badges were white discs; they're dark now, like the rest of the cover badges.
- **Creator profiles:** a folded bio no longer ends mid-word ("Scholas... more"), and "... more" is a green link that can't slip out of view.
- **Creator profiles:** a long genre (SUPERHERO) is no longer cut off mid-word in the series list, and the Share / Report / Block menu is no wider than it needs to be.

## [1.8.0] - 2026-10-07

### Added

- **More pages are dark:**
  - creator profile pages and community feeds (`webtoons.com/p/community/…`), including posts, their comments, the share / report menu, the emoji reactions and the "Followed …" message;
  - the CANVAS Creator Dashboard (Series, Create Series and the other dashboard pages);
  - the login page, the sign-up consent card and e-mail sign-up form, the "e-mail verified" page, Account settings and Account Delete;
  - My Comments, followed creators (/mycreator) and Subscriptions (/favorite), including their edit mode;
  - the mature-content notice ("Proceed to view content?"), now a dialog with an amber warning badge and clear No / Yes buttons.
- **Works in Greasemonkey (Firefox) and Userscripts (Safari).** Before, the theme didn't load at all there. These managers have no menu for the script; the shortcuts work. Your manager may list two extra permissions with this update, `GM.getValue` and `GM.setValue`: the same settings storage, in the form these managers offer.
- **Windows High Contrast:** while a contrast theme is on, the theme steps aside so your system colours apply, and it comes back when you turn High Contrast off.
- **No LOG IN flash:** when you're logged in, the header no longer shows LOG IN for a moment before your name. The script remembers whether you were logged in on the last page to do this.
- **Long synopses fold up:** a series description longer than 8 lines shows its first 6 with a soft fade and a small arrow button; click the button or the text to read the rest. The button is labelled in the page's language for screen readers.

### Changed

- **Faster pages.** The theme was reworked so the browser does much less extra work: it no longer restyles the whole page each time a comment, menu or popup appears, nothing keeps animating in the background, and the script's page fixes run at most once per screen refresh.
  Measured in Chrome with the theme on, the browser's styling work while a page loads went down by about 50–85 % (home 124 → 21 ms, reader 199 → 61 ms), an idle Originals page no longer restyles itself 60 times a second, and scrolling the reader takes about half the drawing work.
- **Contrast:** the keyboard focus ring is brighter, the green buttons are a deeper green with white text (no button label is black on bright green any more), and small text on creator pages is lighter. The focus ring, main and secondary text and the button labels meet WCAG AA.
- **Reduced motion:** with "reduce motion" on in your system, the theme's own hover lifts, zooms and other motion are now reliably switched off (some were missed before); the burst of flames on Like only fades in place.
- **Edge shading** only darkens the empty margins beside the page on wide windows. Before, on windows narrower than about 1,670 px it also darkened page content, and below about 1,280 px the comic itself.
- **Comic strip:** still one card with 16 px rounded corners, now with a single, lighter drop shadow instead of a halo and an outline.
- **Text selection** is a soft blue with white text instead of neon green.
- **Header:**
  - The page you're on in the main menu (Originals / Categories / Rankings / Canvas) lights up like a green neon sign with a small green flower on each side. It flickers on when the page loads, then stays lit.
  - The main menu is back at the site's own size. Everything in the bar is the same height on one line: WEBTOON SHOP and CREATORS are quieter links, and DASHBOARD, Log In and search are matching dark buttons.
  - Logged in, your name is a matching header button, and its menu (Subscriptions … Logout) is a dark panel.
- **Day and category tabs:** hovering a tab shows a rounded highlight instead of a full-height grey block, and the ‹ › scroll arrows are round buttons with a centred chevron.
- **Home page section headers** (Trending & Popular, Popular by Category, Daily, More stories from indie creators): bigger titles, "View all" as a clear button, and larger filter tabs that light up on hover. The selected tab is a green-tinted pill.
- **Originals and Categories lists:** the sort (by Popularity / Likes / Date) is a full-width switch with three equal options, the current one green-tinted; the series count is a small note under it; the list starts a little below the tabs.
- **"New Series" badges** are gold on a dark chip, so they are easy to tell apart from the green "New Episode" badges.
- **Page numbers:** the current page is a green-outlined pill with bright green digits; the other pages are larger and light up on hover. The ‹ › arrows are centred in their pills.
- **CANVAS home:**
  - "Recommended series", Weekly HOT and Popular By Category are matching cards, 24 px apart. Recommended series' ‹ ›, and its page dots, are one small pager on the title row instead of arrows over the first and last covers.
  - Tiles are compact: a rounded cover that darkens on hover, then genre and likes on one line, then the title. The subscriber count is a small pill on the cover.
  - The category switch is a row of pills in each genre's colour, "more ›" is a small button inside the card, and promo banners are rounded cards without mismatched side strips.
- **CANVAS genre lists:**
  - The sort is a switch with all three options visible; choosing one reloads the list in that order, starting from page 1.
  - The grid is one rounded card of compact tiles (cover, genre and likes, title, author).
  - The banner, Top CANVAS and Up & Coming line up as one column of equal-width cards, 16 px apart. Top CANVAS and Up & Coming look the same.
  - Genre names use the same colour per genre as the CANVAS home page instead of grey, also in Top CANVAS and Up & Coming.
  - The Top CANVAS genre filter is a green chip with a chevron, and its menu covers the list behind it.
- **Series page:**
  - **Header:** the genre, title, authors and ⓘ sit right on the cover art over a soft, edgeless dark glow, so they stay readable on light covers without hiding the characters. The title is larger and bold, and the genre is a pill in its genre colour. The share buttons are dark round buttons that light up in each network's colour, and Subscribe is a matching pill that turns green on hover and shows a green tick once you've subscribed.
  - **CANVAS header:** the genres, subscriber count, title and author sit on a dark card beside the cover, readable on bright flat background colours.
  - **Creator info popup** (the ⓘ): a compact dark card with each role as a small green label over the name, round social buttons and a round ×.
  - **Sidebar:** views and subscribers are two equal tiles; the update day ("EVERY FRIDAY", "COMPLETED") is a full-width green band, amber for a series on hiatus. The synopsis is larger and brighter. **First episode** is a full-width green button with a ▶; when **Continue reading** shows, it takes the green and First episode becomes a smaller outline button.
  - **CANVAS sidebar:** "Become a Patron" is a tidy panel with the patron count and a coral button, and the age-rating note is a small amber callout.
  - **Episode list:** every episode is its own faint rounded tile. Unread episodes have a solid green dot and a bright release date; episodes you've read have a hollow grey ring, a muted title and a dimmed date. Titles are larger, and long ones end in "…" (hover to read them in full). Like counts have an orange flame (grey on episodes you've read). The episode number (#N) is a small badge on the thumbnail. Hovering a row lights its tile, shows a ▶ badge on the thumbnail and turns the title green.
  - **NOTE about free episodes:** an amber banner with a megaphone icon.
  - **"You may also like":** one card with three tiles (rounded cover, title, author, views).
- **Reader, under the last panel:**
  - **End card:** a filled card with the update day, the prompt as a heading and two large buttons that sink when pressed and spring back. Like has an orange flame that flickers on hover; once you've liked, it turns solid orange, and a burst of flames rises when you press it. Subscribe is the green button, and its "+" turns on hover. The share buttons are monochrome icons on their own row that light up in each network's colour; a network without its own icon shows a link icon.
  - **Report** is a small button in the end card's corner that turns red on hover.
  - **Patreon card** (CANVAS episodes): a card of the same width with the patron count on the left and a coral "Become a Patron" button on the right. A "$0" amount is hidden when the creator doesn't share earnings.
  - **Creator card:** a profile card with a ringed avatar, a green "Creator" label and the name in large type; a creator's note for the episode shows as a speech bubble.
  - **Episode strip:** a card lined up with the comments below, with rounded covers that lift on hover and titles on two lines. The episode you're reading has a green ring and a ▶ badge. The ‹ › arrows are round buttons in the card's margins; one with nothing to page to stays faint. Series with only a few episodes are centred.
  - **"Want more? … WEBTOON App" banner:** a dark card with the QR code on a white tile so it still scans.
  - **"CANVAS Weekly round-up":** a card with round ‹ › buttons and page dots; hovering a series zooms its cover and keeps its title visible.
  - **Rankings above the comments:** Trending & Popular and Top Originals are two cards side by side, each showing its top 5 as large covers with the same dark rank badge on every cover. The covers load in a sharper size.
- **Reader toolbar:** Subscribe and the share buttons are matching round buttons; the CANVAS age notice under the bar is an amber strip.
- **Comments:**
  - The comments use the full width of the page as one panel of flat rows, with larger, near-white text in a wider font. Names are white.
  - Votes are small grey icons under the text that tint green or red on hover; a vote you cast keeps its colour. "Replies N" is a light pill, and a reply thread hangs off one thin line, each reply on its own faint tile.
  - Top comments are amber blocks with a TOP chip after the name; their open reply thread stays inside the block on a fainter amber.
  - Top / Newest sit in the panel's header, "More" is a full-width bar at the bottom, and long comments are cut after five whole lines with a green "More".
  - The comment count next to COMMENTS is a light pill; the ⋮ menu is one rounded panel.
  - Logged out, the comment box is a bar with a chat icon and a round green arrow button. Logged in, it is a dark card with Spoiler (green when on), the emoji / sticker / GIF buttons and an amber send button in one bar. The emoji, GIF and series pickers are dark.
- **Popups:** "URL copied", "Subscribed" and similar messages are light text in a rounded dark box.
- **Login popup:** one dark card on a dimmed, blurred page. The Email, Apple and X icons are visible, the labels line up after their icons, and the e-mail step has clean fields, a visible show-password eye and a green Log In button.
- **Heads-up notes are amber:** the NOTICE bar above the footer, the age-rating notes and the status of a series on hiatus, so notices look different from buttons and links.
- **Footer:** links underline in green on hover, Facebook / Instagram / X / YouTube are round icon buttons in their brand colour on hover, and the app-store badges lift.
- **Mobile site (m.webtoons.com):** comments are laid out for a phone screen, and the top bar shows the site's own design instead of half-applied desktop styles.

### Fixed

- **Hiding the scroll-to-top button** now also works with dark mode off. In 1.7.0 the button came back when the theme was off.
- **With dark mode off,** the script no longer changes the page: in 1.7.0 it still cleared a few backgrounds in the reader and added an extra arrow to CANVAS carousels.
- **Edge shading and page-specific styles** are there from the first frame instead of popping in a moment after the page appears.
- **Keyboard shortcuts:** `Ctrl + Alt + D` no longer swallows a letter on layouts where it types one (such as Đ or ð); holding a shortcut down toggles once; shortcuts are ignored while you compose text with an input method.
- **Script icon:** userscript managers and Greasy Fork show the WEBTOON icon again (the old icon address no longer worked).
- **Series page:** the stray line along the top of the episode list is gone.
- **Search:** the clear button is a visible × instead of a plain grey circle, and results no longer show a stray space after the highlighted part of a title.
- **Footer** links now react to hovering (they ignored it), and the Facebook icon is no longer a blank disc.
- **Mobile site (m.webtoons.com):** the reader toolbar's ◀ #N ▶ stay inside the bar, the share icons show again, the MY tab is back on screen, section titles no longer overlap their carousels, the home category strip is one row, the comments are no longer squeezed into a narrow column, and the login buttons are dark.

### Removed

- **Coloured commenter names, the coloured edge on each comment card and the curved reply elbows** (from 1.5.1–1.6.3): comments are now flat rows with white names and one thread line.
- **The narrow rankings column beside the comments** in the reader: the rankings now sit in a row above the comments.

## [1.7.0] - 2026-10-06

### Added

- **Option to hide the scroll-to-top button while reading** ([#2](https://github.com/hervad/webtoons-dark-mode/issues/2)). Pick **Hide scroll-to-top button in reader** in the Tampermonkey / Violentmonkey menu to hide the round arrow button on episode pages. The entry then reads **Show scroll-to-top button in reader**, so it always says how to bring the button back. The choice is remembered. The button stays visible by default, and other pages are unaffected. You can still jump to the top with the `Home` key.

### Changed

- **Menu entries say what they'll do.** Instead of "Toggle …", each Tampermonkey / Violentmonkey menu entry shows the action a click performs and updates after every change, including changes made with the keyboard shortcuts: **Turn off dark mode** / **Turn on dark mode**, **Turn off reader dim** / **Turn on reader dim**, **Hide edge shading** / **Show edge shading**. Your userscript manager may ask you to approve one new permission (`GM_unregisterMenuCommand`) with this update.

## [1.6.4] - 2026-09-26

### Changed

- **Reply votes belong to their reply.** In an opened thread, each reply's 👍 / 👎 now sits directly under that reply's text, instead of floating at the far right edge between replies. Hovering a reply tints the whole row, text and votes together, so it's always clear which reply the votes belong to.

## [1.6.3] - 2026-09-26

### Changed

- **Replies are a connected thread** (asurascans-style). One line drops from the parent comment's avatar, and each reply branches off it with a curved elbow into its own avatar. Replies are plain rows rather than separate cards, so the thread reads as one conversation.
- **"Please log in to leave a comment / reply"** is now an inviting call-to-action: a compact green-tinted box with a bold green prompt and an arrow, and a glow on hover. The Spoiler switch and the emoji / GIF / send buttons, which do nothing while logged out, are hidden. The reply box's built-in 9.75rem minimum height is removed, so it's no longer a big empty box. Nothing changes once you're logged in.

## [1.6.2] - 2026-09-26

### Changed

- **Comment votes are back on the right edge** of each card. **Reply / Replies N** is now a soft blue-tinted pill with a speech-bubble icon, so it clearly looks clickable without competing with the content.

## [1.6.1] - 2026-09-26

### Changed

- **Comment cards are more distinct.** Each card's left edge takes the author's avatar colour, and cards have a soft shadow and more space between them. Replies are now nested mini-cards, a step lighter than the parent card and with their author's colour on the edge, instead of plain rows on a rail.

## [1.6.0] - 2026-09-26

### Changed

- **Comments redesigned in the style of asurascans.com:**
  - **Separate cards:** every comment is its own card, so comments are easy to tell apart.
  - **Avatars:** each comment shows a coloured avatar with the author's initial. The widget has no profile pictures, so `tagCommentAvatars()` gives each name a stable colour, and the same person always gets the same colour.
  - **Layout:** name and date are on one line.
  - **Votes:** they sit under the text as coloured icons with counts (green up, red down), without boxes.
  - **Replies:** "Reply" / "Replies N" is a quiet text button with a speech-bubble icon.
  - **Reply threads:** they get smaller avatars on the thread rail.

## [1.5.4] - 2026-09-26

### Changed

- **Series page like counts** are brand green, and the heart beside them is now a **filled** rose-pink heart (`--wt-heart: #ff5c8d`) instead of the site's thin outline sprite. The reader's end-of-chapter **Like** button uses the same heart. The heart is drawn from an inline SVG mask (`--wt-heart-mask`), so there's no image request and its colour is a single palette variable.

## [1.5.3] - 2026-09-26

### Changed

- **Redesigned the ranking sidebar cards** (reader: Trending & Popular, Top Originals; /canvas: Top CANVAS, Up & Coming) as one shared component. The header has a single, vertically centred chevron, and a hairline separates it from the list. Each row reads rank · rounded thumbnail · genre / title / author, the top 3 ranks are accent green, and hovering a row gives a rounded highlight.

### Fixed

- **Double ">›" next to "Top CANVAS":** an older rule scoped to the card's ID outranked the new header styling and brought back the site's own ">" text. The ID-scoped rules are removed. "Up & Coming" is now `#rateRanking` in the site's markup.
- **Page-pager ‹ › sat low in their pills:** they are now CSS-drawn chevrons, centred exactly.
- **/canvas "Make money with WEBTOON" banner** had grey side strips and a near-black, dimmed creative. The banner keeps the site's own background, which matches each rotating creative, so the strip is seamless. Only light creatives are dimmed, and the image and strip dim together.

## [1.5.2] - 2026-09-26

### Changed

- **Comment votes:** the upvote (icon and count) is green and the downvote is red, each on a lightly tinted pill. A comment you've voted on shows a solid green or red pill. The two buttons share a class, so they're told apart by their icon with `:has(.wcc_UpvoteIcon / .wcc_DownvoteIcon)`.
- **Reply threads** (opened with "Replies N") are an indented thread with a thin rail on the left, on the parent comment's surface. Before, they sat in a lighter box with a second card nested inside, because the top-level comment-list card style also applied to the nested list. The "└" corner glyphs are hidden, and "Show less" is a small pill button.
- **Series page like counts** use the heart's red on every row. Already-read episodes are now marked on the title only; date, likes and episode number keep the same colours on read and unread rows, so the numbers no longer switch between bright and dim.

## [1.5.1] - 2026-09-26

### Fixed

- **Episode strip:** the previous-arrow chevron sat off-centre in its circle. The glyph inherited the site's `text-indent: 100%` hidden-label trick; it's now `text-indent: 0` on the strip and toolbar arrow glyphs. The arrows also moved into the card's side padding, clear of the first and last thumbnail, and the strip height now centres the thumbnails and titles vertically in the card.
- **Sidebar headers** ("Trending & Popular ›", "Top Originals ›"): the plain-text ">" sat low beside the larger title. The title and a proper › chevron now share one centre line, and the whole header gets a hover state.

### Changed

- **Commenter names** use a soft blue (`--wt-name`, bold) instead of body-text white, so each comment's author stands out.

## [1.5.0] - 2026-09-26

### Changed

- **Redesigned everything below the last comic panel** in the reader. It now uses one card style, matching the sidebar:
  - **End of chapter:** a centred card with a schedule chip, a green **Subscribe** as the main action, a secondary **Like**, and share icons that are muted until you hover them.
  - **Episode strip:** sits on a card with rounded thumbnails and round arrow buttons.
  - **Creator note:** gets an accent edge.
  - **Comments:** one card with hairline dividers instead of a stack of bordered boxes. Commenter names are in regular text colour rather than link blue, body text is easier to read, the TOP / NEWEST tabs are underline tabs, the reply and like buttons are ghost pills, and **More** is a proper pill button.
  - **CANVAS Weekly round-up:** rounded tiles with a bottom gradient, so titles stay readable on bright covers.

### Fixed

- **Episode-strip thumbnails stayed grey** (never lazy-loaded) for anyone whose OS asks for reduced motion, for example Windows with "Animation effects" off. This was a regression in 1.3.0: a global `prefers-reduced-motion` rule shortened *every* transition on the page, including the ones the site's own JavaScript waits on. Reduced motion now only disables the motion this script adds.
- **Episode-strip arrows** were drawn as small, empty or tiny-chevron boxes. The page-pagination rules from 1.3.0 also matched the strip's arrows. The strip is now excluded from them, and the arrows render as round buttons with ❮ ❯.
- **Reader toolbar "previous episode" arrow** showed a dark sprite behind a squashed glyph ("<‹"). The site's arrow sprite and its fixed 20 × 20 box are now cleared.

## [1.4.0] - 2026-09-26

### Added

- The dark edge shading (the vignette on the left and right screen edges) can now be turned off. Use `Alt + Shift + V` (backup: `Ctrl + Alt + Shift + V`) or the new **Toggle edge shading (vignette)** menu entry. The choice is remembered, and it stays on by default. ([#1](https://github.com/hervad/webtoons-dark-mode/issues/1))

### Fixed

- The reader's top toolbar was dimmed at both ends: the edge shading painted over the WEBTOON logo and the subscribe / share icons. `#container` (`z-index: 10`) formed a stacking context that capped the toolbar below the shading. In the reader it is now `z-index: auto`, and the toolbar sits above the shading.

## [1.3.1] - 2026-09-26

### Changed

- Rewrote the `@description` metadata in plain language. This is the summary shown on Greasy Fork and in userscript managers. No code changes.
- Added `greasyfork.md`, the Greasy Fork "Additional info" text, so it can be synced from this repository.

## [1.3.0] - 2026-09-26

### Fixed

- **Series detail page was white again.** Webtoons renamed the episode-list markup from `.detail_lst` to `.detail_list_area > ul.detail_list > li.detail_list_item > a.detail_list_link`, so none of our rules matched. The list panel, the "Read N new episodes on the app" strip, and the NOTE strip were all white, and episode titles were the site's `#3c3c3c` on our dark rows. Retargeted every rule to the new classes.
- **Washed-out episode titles.** The base CSS greys every column of an already-read (`:visited`) row to `#c4c4c4`. Read episodes now use a dedicated muted-but-readable tone (`--wt-text-read`, ~5.8:1 on the list card), while unread episodes stay full brightness so the next one to read stands out.
- **Viewer sidebar showed a card inside a card** (Trending & Popular, Top Originals). `buildViewerCards()` wrapped each `.lst_area` in a JS-injected card, and `.lst_area` was already a card via CSS. Removed the JS wrapper entirely; the sidebar is now pure CSS, one card per section. The genre filter pill now sits on the title row instead of overlapping the first ranking.
- **Detail-page pagination clipped.** Forcing `.paginate` to `display: block` dropped the prev-arrow onto its own line and pushed the page numbers under the card's clip edge. The pager is now a wrapping flex row of pills; disabled first/last arrows are dimmed.
- **Search dropdown drew stacked frames**, and the recent-search row highlighted white. `.search_cont` (the button wrapper) and `.ly_autocomplete` no longer get their own box. The input pill shows focus with an accent ring via `:focus-within`. Recent-search (`.lst_history`) rows and autocomplete rows highlight dark.
- **Scroll-to-top button** was a white disc on `/canvas`. It had only looked dark elsewhere because the vignette layer covered it. It is now an inverted dark disc placed above the vignette.

### Changed

- Comments: TOP / NEWEST are underline tabs instead of boxed buttons; like / dislike / Reply are rounded pills; the editor toolbar and kebab-menu icons lost their square boxes.
- Comments: the WCC widget's own `--wcc-*` / `--wte-*` design tokens are re-declared with its dark set (greys remapped to our palette), so every icon fill, divider, loader and popover the per-element rules don't name also renders dark.
- Sidebar cards (viewer + `/canvas` right rail) use a softer top-lit hairline border instead of a 40 %-white outline.
- Episode rows: flat on the card with an accent left-edge bar on hover, tabular numerals for dates / likes / episode numbers.
- `color-scheme: dark` on `:root`, so browser-painted UI (scrollbars, `<select>` popups, autofill, the load-time canvas) is dark too. `accent-color` gives native checkboxes and radios the brand green.
- `prefers-reduced-motion` is honoured: hover lifts and transitions are dropped for users who ask for less motion.
- SPA route changes are also detected through the Navigation API (`navigatesuccess`). This works even when the userscript manager runs the script in an isolated world, where the `history.pushState` wrapper never sees the page's calls.

### Removed

- Removed selectors for markup Webtoons no longer ships: `.detail_lst`, the legacy `u_cbox` comment widget block, `.card_lst` / `.daily_lst` / `.genre_lst` / `._popularList` / `._dailyList` / `.spot_lst`, `#gnbWrap` / `.gnb_wrap` / `.header_bn`, `.search_box`, `._listInfo`, `.layer_popup` / `.pop_layer` / `.tooltip` / `.balloon`, `.viewer_header` / `.viewer_footer` / `._toolBox` / `.ly_episode`, `.viewer_dsc_area` / `.viewer_bnr` / `._patronArea`, `.aside_item` / `.aside_wrap` / `.section_wrap` / `.ranking_wrap`, and a few others. Each was checked against the live desktop and mobile bundles before removal.
- Removed `buildViewerCards()` and its SPA re-wrap bookkeeping.

## [1.2.4] - 2026-05-13

### Fixed

- Duplicate `.sort_box` rule block: the second definition (intended for the detail-page "Latest / Oldest" episode sort) was clobbering the canvas filter dropdown's elevated styling. Both sets now coexist — the detail-page block is scoped to `.detail_body .sort_box`.
- `--wt-text-mute` raised from `#7b828d` to `#878e99` so comment dates, episode numbers, and other muted text clear the WCAG AA 4.5:1 contrast floor on `--wt-bg-elev2`. (Correction: `#878e99` clears 4.5:1 on the page and card backgrounds, but measures about 4.0:1 on `--wt-bg-elev2`.)
- Hard-coded `#e05252` heart-count red replaced with a new palette token `--wt-accent-like: #f06868` — slightly brighter, themeable, and reused for the heart sprite filter target.
- Panel-strip text-metrics reset: anything Webtoons injects between comic panels (ads, chapter links) was rendering invisible because `font-size: 0` cascaded from the strip wrapper. Added a `> :not(img)` rule that restores normal text metrics on non-image children.
- `[class*="cta" i]` / `[class*="Continue" i]` substring traps replaced with tighter selectors (`a[class~="cta"]`, `a.lk_continue`, `a._btn_enter`, `a[class*="_cta_" i]`). Prevents the button-hover override from firing on unrelated classes that happen to contain the substring "cta" (e.g. `tactical`, `practical`).
- Canvas filter dropdown z-index lifted from `9999` to `10001` so the panel always paints above the vignette gradient (`body::before` at `9999`) at the right viewport edge.
- Generic `.lst_type1 li` background scoped to `.detail_other` — viewer/canvas sidebars no longer get a double-elevation row inside their already-elevated card.

### Changed

- Removed dead JS hooks that the current Webtoons bundle no longer ships: `._btnMore`, `._monthSelect`, `._loginComponentParent`, `.emailLoginComponent`, `._emailLoginButton`, `._backToDefaultLoginButton`. The `.lk_more` / `.lk_month` replacements remain.
- Collapsed the duplicate `.spi_area .bx` selector list (`.viewer_lst .spi_area .bx, .spi_area .bx` → `.spi_area .bx`).
- Removed the redundant unprefixed `.gnb a[aria-current="true"]` alternative; the ID-prefixed `#header` / `#gnbWrap` variants are the load-bearing ones.
- Pagination chevrons in `.paginate` now use the same `\\203A` / `\\2039` unicode escapes as the rest of the file (was using literal glyphs).
- `padding-top: 0px` → `padding-top: 0`.

## [1.2.3] - 2026-05-13

### Fixed

- Viewer bottom episode-strip scroll arrows (`.episode_lst .pg_prev` / `.pg_next`) now render as 40×87 buttons with heavy chevrons (`❮ ❯`), aligned with the thumbnail row, instead of tiny mis-positioned sprite glyphs.
- Comment editor toolbar action icons (image / sticker / GIF / etc., under `TextEditor_*` CSS modules) are now visible at `--wt-text-dim` and brighten on hover. They render as inline SVGs with `stroke="currentColor"` / `fill="currentColor"`, so setting `color` on the parent button is enough — earlier filter-based attempts flattened them to solid white blobs.
- Viewer toolbar prev/next-episode buttons (`.paginate.v2`) refinement: parent is now `display: flex; align-items: center` so the chevrons and the `#N` text line up geometrically; the text span gets `transform: translateY(-5px)` to compensate for the digits' optical-vs-geometric center offset.

### Added

- Hover-darken extended to the viewer bottom episode-strip thumbnails and the viewer sidebar rankings (`.aside .ranking_lst li img`) — matches the homepage card behaviour.

## [1.2.2] - 2026-05-13

### Fixed

- Viewer toolbar prev/next-episode buttons (`.paginate.v2 .pg_prev` / `.pg_next` around the `#N` chapter number) no longer render as tiny mis-aligned chevrons. They now sit as 40×40 buttons with a centered 28px chevron, a green hover tint, and a visibly faded (`opacity: 0.35`) state when the button is disabled (`.dim`, e.g. on the first or last episode). The previous styling cascaded down from the bottom-of-list pagination rules: the prev anchor inherited a 28×28 pill from `.paginate a`, and the disabled next `<span>` matched no pill rule at all — making it invisible.

## [1.2.1] - 2026-05-13

### Fixed

- Age-verification screen (`.age_gate_container`) now fully dark-themed:
  - Month dropdown trigger (`.lk_month` / `._selectedMonth`) styled as a dark input matching the DD / YYYY fields — was rendering with a white background.
  - Open month list (`._month .link`) renders dark with `--wt-bg-elev` background and a `--wt-bg-hover` hover tint.
  - Continue button (`.btn_type9._btn_enter` inside `.btnarea`) renders as a centred green pill (`inline-flex` centring + `min-width: 160px`) with bold near-black text at idle (~9:1 contrast vs `#00d564`) and a smooth fade to white text + darker green + soft glow on hover.
  - "I'll stick with limited access" (`.lk_continue._skipAgeGate`) renders as plain white underlined text on transparent — previously was inheriting the global `a:hover → --wt-link` blue.
  - Privacy Policy inline link (`.dsc_terms a`) uses `--wt-link` with underline.
  - `::selection` inside the age gate uses `--wt-bg-hover` instead of brand green so text-selecting the limited-access link doesn't render as a green pill.
- Global `a:hover { color: var(--wt-link) }` no longer bleeds into button-styled anchors (`.btn_*`, `a[role="button"]`, `[class*="cta"]`, etc.) — those keep their own text color on hover instead of turning bright blue.

## [1.2.0] - 2026-05-13

Major pass over /canvas (genre tabs + sidebar), /rankings, pagination, and accessibility. Theme-audit-driven palette tightening with new tokens for soft accent and prominent borders.

### Fixed

- Pagination next/prev arrows are now visible against the dark surface. Replaced the sprite (which was a near-black fill, invisible on dark) with a CSS-generated chevron via `::after` / `::before` text content. Hover no longer inverts to a stark white pill — the previous `filter: invert(1)` approach was inverting our dark hover background too.
- Detail-page pagination ("1 2 3 … 10 ›") no longer renders inside the episode list. Scoped a position override to `body.wt-detail .paginate { position: static; clear: both; display: block }` so the row lands at the bottom; unscoped attempts broke /canvas layout, hence the `body.wt-detail` gate.
- /rankings page rank numbers (1–30) now render. The site only ships a sprite atlas for 1–10 and on dark theme the sprite was visually killed leaving no fallback. Replaced with CSS-generated text on `[class^="ranking_number_"]:before` for all 30 ranks (with `!important` on `content` to beat the base sprite-url declaration).
- /canvas genre pages (DRAMA, FANTASY, etc.) no longer render cards as raw thumbnails on the page background. The genre tabs use `.challenge_cont_area > .challenge_lst > ul > li > a.challenge_item` instead of `.discover_lst` / `.discover_item`, which our previous rules didn't target.
- Rightmost card column on /canvas grids no longer has its 1 px right border clipped. Added explicit `overflow: visible` on `.challenge_cont_area` / `.challenge_lst` / `ul` and split section padding asymmetrically (`16px 20px`) so the column has clearance.

### Added

- /canvas section card: `.challenge_cont_area` is now an elevated 12 px-radius card with border, drop shadow, and `box-sizing: border-box` so the inner grid stays inside the floated layout. Inner grid uses `display: grid` with `repeat(4, minmax(0, 1fr))` and a 14 px gap so cards have consistent breathing room and degrade gracefully when the section is narrower.
- Card depth: every `.challenge_item` now carries a two-layer drop shadow plus a 1 px inset top highlight (catches "light from above"). Hover state stays in place and darkens to `#0e1013` instead of lifting — matches the static-then-darken convention from other manhwa aggregators.
- Card thumbnails dim on hover (`filter: brightness(.7)`, 200 ms ease) across home / detail / canvas grids and the `.discover_spot` recommended-series carousel. Scoped strictly to card-container `li img` selectors — viewer panel images are untouched.
- Right-rail sidebar on /canvas (Top CANVAS, Up & Coming) gets parallel elevated section cards on each `.aside.challenge .lst_area`. Sidebar narrowed from 312 px → 280 px so the main grid gains 32 px of horizontal room. List items inside get a `--wt-border` hairline separator and a `--wt-bg-elev2` hover tint instead of floating on the page background.
- Pagination as soft pill buttons: every number is an `inline-flex` 28×28 px pill with hover (`--wt-bg-hover` + inset `--wt-accent-soft` ring) and active state (`--wt-accent` solid pill). Base markup ships no visible affordance.
- Global keyboard focus ring: `:focus-visible` on `a` / `button` / form controls / `[role="button"]` / `[tabindex]` draws a 2 px outline in the new `--wt-border-strong` with 2 px offset. The site ships no focus ring on most controls (WCAG 2.4.7).
- `--wt-border-strong: #5a6472` token for prominent outlines / focus / selected affordances.
- `--wt-accent-soft: #4ade80` token — desaturated companion to brand `#00d564`. Wired into hover states for `.snb_item .snb_tab` (sub-nav tabs), `.section_header .button_view_all`, `.paginate a`, and the pagination pill ring, so hover reads distinctly from the saturated active/selected green.

### Changed

- Palette tightened from a theme-audit pass:
  - `--wt-border` `#363b44` → `#4a5360` (raises non-text contrast above 3:1 per WCAG 1.4.11)
  - `--wt-bg-elev` `#1e2125` → `#22262b` and `--wt-bg-elev2` `#262a30` → `#2c313a` (wider elevation step so cards register as lifted without relying solely on shadow)
  - `--wt-text-dim` `#a0a4ab` → `#b5b9c0` (muted-text contrast 7.2:1 → 9.1:1)
- `[class^="ranking_number_"]:before` rule is no longer scoped to `.webtoon_list` — applies on every page that uses the same `<strong class="ranking_number_N">` markup (homepage trending + /rankings).

### Removed

- Dropped dead `.gnb .on a, .lnb .on a` selectors from the active-nav rule — the site has not used `.on` on the `<li>` for some time and the active state is driven entirely by `aria-current="true"` on the `<a>`.
- Merged duplicate `.discover_spot .paging .btn_prev/.btn_next` blocks (transition folded into the base rule; two separate `::before` blocks combined with `::after` into one suppression rule).

## [1.1.28] - 2026-05-12

### Fixed

- Sub-nav bottom separator now draws as one continuous 1 px line across the full viewport width. `snb_inner` (centred, 1200 px) has `position: relative` which paints above its parent's `border-bottom`, hiding the line in the middle section. Replaced the border with a full-width `snb_wrap::after` pseudo-element at `z-index: 10`.
- Active GNB link now shows accent-green text. The site sets `aria-current="true"` on the `<a>` (not `.on` on the `<li>`), so the previous `.gnb .on a` rule never fired. Switched to `[aria-current="true"]` with `#header`/`#gnbWrap` ID prefixes to beat the site's own colour rule by specificity.
- Active GNB link text no longer shrinks. Each GNB `<a>` wraps its label in an `<h1>`; our blanket `h1 { color: var(--wt-text) !important }` was overriding the inherited accent colour. Added `#header a[aria-current="true"] h1` with `font-size: inherit` and `font-weight: inherit`.
- Active SNB tab text no longer shrinks on selection. `font-size: inherit !important` was inheriting 12 px from the parent `<li>` instead of keeping the base 16 px on the `<a>` — removed it.
- Header, GNB, and sub-nav now appear above the page vignette gradient. `z-index: 10000` on `#header`/`.gnb_wrap` and `.snb_wrap` lifts them above the `body::before` vignette at `z-index: 9999`, which was dimming right-side sub-nav tabs.

### Changed

- Inactive SNB tab text changed from `--wt-text-dim` to `--wt-text` — all genre/category tabs are now fully white; the active tab is distinguished by accent green alone.

## [1.1.27] - 2026-05-12

### Fixed

- Carousel arrows on `/canvas` now centered in their circles — switched from unicode glyph `❮` (uneven em-square whitespace caused optical misalignment even with flexbox centering) to an inline SVG chevron which is always pixel-perfect.
- `font-size: 0 !important` on the carousel button was cascading into the injected `<span>`, collapsing the glyph. Fixed by using `element.style.setProperty('font-size', '44px', 'important')` which creates an inline `!important` declaration that wins the cascade.

### Changed

- Carousel button circle opacity lowered from `0.7` to `0.35` (more transparent, lets cover art show through).
- Carousel arrow SVG size increased from `28 px` to `40 px`.
- Carousel button vertical position changed from `top: 50%` to `top: calc(50% + 35px)` — the `.paging` container spans the full `.discover_spot` block including the section header, so plain `50%` landed above the card midpoint.
- Carousel button hover state: green tint background, green border, and soft green glow matching the site accent colour.

## [1.1.26] - 2026-05-12

### Changed

- Increased snb scroll arrow font-size from 24 px to 40 px and switched glyph from thin guillemets `‹›` to heavy angle quotation marks `❮❯` for better readability. Button surface now uses `--wt-bg-elev` (was `--wt-bg`) with a subtle inset highlight so it stands out from the page.
- Increased CANVAS recommended-series carousel arrow font-size from 28 px to 42 px; switched to the same heavy `❮❯` glyphs.
- Darkened the CANVAS creator-dashboard banner image filter from `brightness(.7) saturate(.85)` to `brightness(.35) saturate(.45)` so the mint-green PNG actually blends into the dark page rather than glowing through. Hover lightens to `brightness(.55) saturate(.65)`.

## [1.1.23] - 2026-05-11

### Changed

- Deduplicated `.viewer_lst img, ._images, ._images img, .viewer_img img { filter: none }` to just `._images` — the descendant selector covered itself and all child `<img>` already.
- Removed `._episodeItem` from the `._listInfo, .episode_lst, ._episodeItem` background rule. The element was set to `--wt-bg` in that block and immediately overridden to `--wt-bg-elev` two lines later; the first declaration was always wasted.
- Tightened the viewer-column reset: `.viewer_lst .on` was matching any active tab, sort pill, or nav item that happened to render inside the viewer column. Replaced with the explicit list of viewer-only surfaces.
- Removed `.search_area` from the input-block search rule — already covered by the dedicated search-dropdown rule earlier in the file (only `.search_box, ._searchBox` remain).
- Stripped redundant `!important` from `.ranking_number_N:before { content }` declarations — generated `content` has no competing source.
- Moved `.detail_bg + .cont_box { background-color: transparent }` from the generic Sections block into the Detail-page elevation block so the rule lives with the rest of the detail-page artwork handling.

## [1.1.22] - 2026-05-11

### Fixed

- `buildViewerCards` grouping: a leading `<ul>` (with no preceding header) was silently dropped from the groups list, leaving the first ranking section unwrapped. Grouping logic now starts a fresh group for an orphan leading UL and keeps subsequent ULs attached to the most recent header.
- SPA navigation now calls `scheduleViewerBanners()` (previously only invoked on `popstate` and initial load) so rogue light banners no longer leak into the viewer after listing→viewer `pushState` nav.
- `aside.dataset.wtCards` is now cleared on every SPA navigation. The viewer sidebar DOM node can survive viewer-to-viewer routes; without clearing the flag the new chapter's sidebar would never be re-wrapped into elevated cards.

### Changed

- All SPA-deferred work routed through a new `scheduleSpa(fn)` helper gated by a `_navGen` generation token. Rapid back-to-back navigation no longer queues stale DOM mutations from previous routes.
- `pushState`, `replaceState`, and `popstate` consolidated into a single `onSpaNav()` dispatcher.

### Removed

- Dead `applyPanelGlow` / `schedulePanelGlow` block, the `PANEL_GLOW_JS_ENABLED` flag, the unused `_panelGlowScroll` listener wiring (which also had a latent add/remove capture-flag mismatch), and the resize listener bound to it. Panel elevation has been pure CSS since v1.1.7 — the rollback fallback is no longer needed.
- Unread `box.dataset.wtBanners` flag from `fixViewerBanners` — set but never checked.

## [1.1.21] - 2026-05-11

### Changed

- Brought drop shadow back, on the container only: `0 0 60px rgba(0,0,0,.9)` (symmetric halo all sides) + `0 16px 40px rgba(0,0,0,.7)` (downward grounding). Safe to use here because shadow is on a single container element — no per-image boundaries means no internal seams possible.
- Extended `overflow: visible` to `.cont_box` and `body.wt-viewer #content` so the halo isn't clipped by parent wrappers.

## [1.1.20] - 2026-05-11

### Changed

- Stronger card lift via rim lighting (no drop shadows): brighter top-edge inset highlight (`inset 0 1px 0 rgba(255,255,255,.28)`) catches "light from above" at the panel strip's top edge, plus a thicker hairline outline (.14 opacity, was .1). Reads as a lifted card edge without using any directional shadow.

## [1.1.19] - 2026-05-11

### Changed

- Replaced container shadow with the homepage-card idiom: `border-radius: 16px` + `overflow: hidden` on the strip wrapper clips the first/last panel corners into a card shape, and a 1px white inset hairline outline defines the boundary. No drop shadows anywhere — the lift comes from corner rounding + edge highlight against the dark page bg.

## [1.1.18] - 2026-05-11

### Changed

- Moved panel shadow from per-image to the strip container (`.viewer_img._img_viewer_area` / `#_imageList`). All panels now render as ONE lifted card — no inter-panel seams possible because there's only one shadowed element. `width: fit-content` shrinks the container to image width so the shadow lands at the actual panel edge; `margin: 0 auto` re-centers.
- Shadow: 1px hairline outline + soft outer drop shadow on all sides (`0 24px 60px` + `0 8px 20px`, like the homepage cards).

## [1.1.17] - 2026-05-11

### Changed

- Widened panel side shadow: `±22 0 28 -28` → `±42 0 50 -50` so the falloff extends ~40px into the side margins instead of cutting off at 22px. Still single-layer with `spread = -blur` exactly — no inter-panel seams.

## [1.1.16] - 2026-05-11

### Fixed

- Still-visible inter-panel gaps after v1.1.14: zero out `font-size` and `line-height` on the panel container (`#_imageList`, `.viewer_img._img_viewer_area`) and set `vertical-align: top` on the images. Kills any leftover text-baseline whitespace that the inherited line-height was reserving between siblings.

## [1.1.15] - 2026-05-11

### Fixed

- `display: block` from v1.1.14 broke the inline auto-centering — comic panels shifted left of the column center. Restored centering with `margin: 0 auto`.
- Bumped shadow opacity to .95 and blur to 28 (spread=-28, still `spread = -blur` so no seams) to restore the depth that v1.1.12 had before the seam fix tightened it.

## [1.1.14] - 2026-05-11

### Fixed

- Inter-panel horizontal lines were actually inline whitespace gaps, not shadow bleed: the DOM has `<img class="_images">` siblings with text nodes between them, and default inline images sit on a baseline with a few px of gap below — page bg shows through there as a faint line. `display: block` on `img._images` packs them flush, eliminating the gap.

## [1.1.13] - 2026-05-11

### Fixed

- Hide horizontal separator lines below the comic strip: `.viewer_info_area`, `.viewer_ad_area`, `.viewer_patron_area`, `.viewer_dsc_area`, `.viewer_bnr` previously had their `border-top` tinted to `--wt-border` (visible faint lines). Switched to `border: none` so the viewer column reads as one continuous dark surface.

## [1.1.12] - 2026-05-11

### Fixed

- Truly eliminate inter-panel horizontal seams: v1.1.11 used `spread=-18, blur=22` which left a 4px y-bleed (visible as a faint line between stacked panels). Changed to `spread=-22` so `spread = -blur` exactly — vertical bleed is now zero, only side shadows render.
- v1.1.7→v1.1.11 changes (shadow refinement chain, JS panel-glow disable) were re-applied after the userscript file was truncated to 0 bytes by an external save.

## [1.1.11] - 2026-05-11

### Changed

- Replaced white side glow with dark side drop shadow on `img._images` (only DOM node that's exactly image-width). spread=-blur formula on left/right cancels y-axis bleed → shadow appears at the actual panel edge with no inter-panel seams. Reads as "the artwork edge darkens into the page" — card-lifted feel without any white glow.

## [1.1.10] - 2026-05-11

### Changed

- Moved panel shadow from the wrapper container (which was wider than the image, so the shadow landed far from the panel edge) back to `img._images` directly. Combined: 1px white hairline outline + side-only glow using spread=-blur (vertical bleed cancels → no inter-panel seams).

## [1.1.9] - 2026-05-11

### Changed

- Panel-strip shadow tightened to hug the edge: replaced `0 24px 60px -8px` with the homepage-card formula (`0 4px 16px` + `0 1px 4px`). Reads as elevation without bleeding far out into the side margins.

## [1.1.8] - 2026-05-11

### Changed

- Replaced per-image white side glow with container-level "card volume": `.viewer_img._img_viewer_area` / `#_imageList` get `display: inline-block` so the box matches image width, plus a 1px white hairline outline and a large soft dark drop shadow underneath. Treats the whole comic strip as one lifted card — no white side glow, no inter-panel seam artifacts.

## [1.1.7] - 2026-05-11

### Changed

- Comic panels now use per-image CSS `box-shadow` for edge elevation, replacing the JS fixed-position glow divs. Formula: `±22px 0 22px -22px` (spread = -blur) cancels y-axis bleed entirely, so stacked panels show no horizontal lines at panel-to-panel boundaries (the v1.0.97 trick). Adds a subtle white side-glow plus a soft bottom drop shadow that matches the homepage card treatment.
- `.viewer_lst` and `.viewer_img._img_viewer_area` set to `overflow: visible` so the shadow renders past the image bounds (was clipped by default).
- JS `applyPanelGlow()` disabled via `PANEL_GLOW_JS_ENABLED = false` constant; function body retained for quick rollback.

## [1.1.6] - 2026-05-11

### Changed

- Panel-edge glow softened: width 40 → 30 px, opacity .12 → .07. Still adds depth at the reading-column edges but no longer draws the eye away from the comic.

## [1.1.5] - 2026-05-11

### Changed

- Startup banner moved to first runtime statement in the IIFE so it logs before any code that could throw — end-of-IIFE banner now says "fully loaded" to distinguish "started but errored" from "ready" (the v1.0.16 intent, restored)
- Unified three SPA-navigation retry cohorts (`[100,600,1500]` / `[300,900,2000]` / `[400,1000,2200]`) into a single `SPA_RETRY_DELAYS = [200, 800, 2000]` constant — easier to tune, no unexplained variance
- `buildViewerCards` completion tracking inlined via the existing `aside.dataset.wtCards` flag; removed the `_bvc` wrapper and the `let aside_cards_done` declaration that sat below its use site (latent TDZ footgun on any reorder)

### Removed

- Dead selectors confirmed absent from the current Webtoons bundle: `#_viewerArea` (replaced by `body.wt-viewer` rules in v1.0.85), `.tab_lst` / `.sub_tab` (older markup), `.bnr_area` / `.ad_bnr` / `._bannerArea` / `.promotion_bnr` (speculative banners), and `._mobile_viewer` / `._scroll_view` from `dimCss` (legacy mobile selectors)
- Duplicate `.foot_app, .foot_cont, .foot_down_msg, .footapp_icon_cont` block — the second copy in the viewer section now only carries the viewer-scoped extras (`#_viewerBox .foot_app`, `[class*="dsc_down"]` …); the footer-block rule above already covers the base selectors

## [1.1.4] - 2026-05-11

### Fixed

- Panel glow now clips to the visible portion of the panel container via a scroll listener — glow disappears when scrolled below the comic panels into episode info / comments
- Reduced glow opacity from 0.18 to 0.12 for a subtler effect

## [1.1.3] - 2026-05-11

### Fixed

- Panel glow now measured from `img._images` (actual panel image) instead of the full-width container div — glow appears at the reading column edge, not far into the dark margins

## [1.1.2] - 2026-05-11

### Changed

- Panel edge glow reimplemented in JavaScript: two `position:fixed` divs measured from the actual panel container position replace per-image CSS `box-shadow`; fixed elements are immune to `overflow:hidden` clipping, don't interact with per-image boundaries, and produce a continuous glow with no gaps at panel junctions and no horizontal line artifacts

## [1.1.1] - 2026-05-11

### Fixed

- Panel edge glow now appears at the actual panel image edges: reverted to per-image shadow on `img._images` (container approach placed shadow at wrong location because Webtoons sets explicit dimensions on the container); used spread (-25px) > blur (20px) so the shadow source starts fully inside the image — guaranteed zero top/bottom bleed, no horizontal line artifacts

## [1.1.0] - 2026-05-11

### Fixed

- Panel edge glow is now continuous (no gaps between panels, no horizontal line artifacts): moved shadow to the full-height `.viewer_img._img_viewer_area` container instead of individual images; `display:inline-block` shrinks the container to image width so the glow falls at the reading column edge (inside the vignette's transparent zone); `overflow:visible` on `.viewer_lst` unclips the shadow

## [1.0.99] - 2026-05-11

### Fixed

- Panel edge glow now actually renders: moved box-shadow from full-width `.viewer_img._img_viewer_area` container to individual `img._images` elements so it stays inside `.viewer_lst`'s `overflow:hidden` boundary instead of being clipped

## [1.0.98] - 2026-05-11

### Changed

- Panel edge glow: increased to `30px 50%` (was `15px 18%`) so the white shadow is clearly visible against the dark page background

## [1.0.97] - 2026-05-11

### Fixed

- Panel edge shadow: use `spread = -blur` formula (`-15px 0 15px -15px`) so the blur's vertical spread exactly cancels — shadow is now visible only on left/right edges with zero top/bottom bleed

## [1.0.96] - 2026-05-11

### Changed

- Panel edge depth: replaced `::before` gradient overlay with an x-axis-only `box-shadow` on the panel strip container (`-1px 0 10px` and `1px 0 10px` rgba white glow); this is the only technique that creates visible vertical-edge depth against a dark background without any top/bottom effect — so zero horizontal-line artifacts between stacked panels

## [1.0.95] - 2026-05-11

### Changed

- Re-added subtle left/right edge shadow on comic panel container (`::before` gradient, 4% width, 28% opacity) — same technique as v1.0.93 but far more restrained, creating barely-perceptible depth without visibly dimming artwork; horizontal gradient means zero inter-panel line artifacts

## [1.0.94] - 2026-05-11

### Changed

- Removed side-shadow overlay on comic panels — the gradient darkened too much of the actual artwork; the viewport-level vignette (`body.wt-viewer::before`) already provides the depth effect without touching panel content; kept `border-radius:0` to prevent inter-panel line artifacts

## [1.0.93] - 2026-05-11

### Fixed

- Side shadow now actually renders: moved left/right gradient from `inset` box-shadow on `<img>` (doesn't work on replaced elements) to a `::before` pseudo-element on `.viewer_img._img_viewer_area` (the parent div); purely horizontal gradient creates no horizontal-line artifacts between stacked panels

## [1.0.92] - 2026-05-11

### Changed

- Comic panels: replaced outer dark glow with `inset` left/right side shadows (`inset ±28px 0 28px rgba(0,0,0,.5)`) — adds visible volume at panel edges without creating horizontal lines between stacked panels; removed `border-radius:2px` which was causing corner gap artifacts at panel boundaries

## [1.0.91] - 2026-05-11

### Fixed

- Removed white spread ring from comic panel shadow — it created visible white lines between adjacent panels; dark outer glow alone (`0 0 28px rgba(0,0,0,.8)`) provides depth without inter-panel artifacts

## [1.0.90] - 2026-05-11

### Changed

- Comic panel shadow: white ring increased to `2px rgba(255,255,255,.22)` (was 1px/7%) for consistent visibility across all panels on dark background

## [1.0.89] - 2026-05-11

### Fixed

- Comic panel shadow is now symmetric (`0 0 28px` instead of `0 6px 28px`) so it appears on all sides, not just below; removed `display:block` override that was left-shifting panels out of their centered container

## [1.0.88] - 2026-05-11

### Added

- Comic panels (`img._images`) now have a drop shadow (`0 6px 28px rgba(0,0,0,.7)`) and hairline edge highlight (`0 0 0 1px rgba(255,255,255,.07)`) so each panel lifts off the dark background; `box-shadow` is purely decorative and does not affect image colors

## [1.0.87] - 2026-05-11

### Added

- Left/right vignette gradient now applies to series detail pages (`body.wt-detail`) and home/genre listing pages (`body.wt-home`), matching the existing viewer-page gradient; all three classes are synced by a unified `syncBodyClasses()` function on every navigation

## [1.0.86] - 2026-05-11

### Fixed

- Detail page artwork now shows through the header area: `.detail_bg + .cont_box` makes the content box transparent on detail pages (sibling combinator scopes it safely without `:has()`), while `.detail_body`'s explicit background keeps the episode list dark

## [1.0.85] - 2026-05-11

### Fixed

- Removed `body:has(#content.viewer)` CSS fallback entirely — Webtoons briefly adds class `viewer` to `#content` during SPA transitions, causing false positives on detail pages; the `position:fixed; z-index:9999` overlay made this very visible. `body.wt-viewer` (JS-driven) is now the sole gate for all viewer vignette rules

## [1.0.84] - 2026-05-11

### Fixed

- Viewer vignette no longer bleeds onto detail pages after SPA navigation: removed `syncViewerClass()` call from the `watchHead` MutationObserver — head mutations fire during stylesheet swaps while the old `#content.viewer` is still in the DOM, causing `wt-viewer` to be re-added immediately after pushState removed it

## [1.0.83] - 2026-05-11

### Fixed

- Vignette overlay no longer bleeds onto detail pages after SPA navigation from viewer: `body.wt-viewer` is now removed immediately on `pushState`/`popstate` (optimistic removal), preventing the `::before` gradient from rendering during the ~100ms before the new page's DOM is ready

## [1.0.82] - 2026-05-11

### Fixed

- Viewer vignette gradient now persists at all scroll positions: replaced `background-attachment: fixed` on `body` with a `position: fixed; inset: 0` `::before` pseudo-element overlay, which stays locked to the viewport regardless of how far the page has scrolled

## [1.0.81] - 2026-05-11

### Fixed
- Viewer vignette gradient now persists through all scroll positions: added `fixed` to the `background` shorthand so the gradient uses `background-attachment: fixed` — it is positioned relative to the viewport and never scrolls away.

## [1.0.80] - 2026-05-11

### Fixed
- Viewer page vignette gradient now persists through the full scroll. Root cause: `.cont_box` and `.comment_area` had solid `var(--wt-bg)` backgrounds which covered the body gradient below the first panel. Fixed by adding `body.wt-viewer .cont_box` and `body.wt-viewer .comment_area` to the transparent overrides, and changing `fixViewerBanners()` to set `background-color: transparent` instead of `var(--wt-bg)` on viewer sub-sections.

## [1.0.79] - 2026-05-11

### Fixed
- Episode strip (`.episode_area`) now uses `var(--wt-bg)` instead of `var(--wt-bg-elev)` so it matches all other viewer sections (no visible shade difference); removed card styling (border-radius, box-shadow).
- Removed `.episode_area` exemption from `fixViewerBanners()` so JS also normalizes it.

## [1.0.78] - 2026-05-10

### Fixed
- `fixViewerBanners()` now scans inside `.viewer_lst` too (previously only scanned direct children of `#_viewerBox`, missing the "Want more?" banner which lives inside `viewer_lst`). All viewer_lst children except the comic panel wrapper and episode strip get forced to `var(--wt-bg)` for uniform background.

## [1.0.77] - 2026-05-10

### Fixed
- Viewer "Want more?" banner and other unknown cont_box children: added `fixViewerBanners()` JS function that scans direct children of `#_viewerBox`, skips known elements (viewer_lst, aside, comment_area), and forces `background-color: var(--wt-bg-elev)` via inline style on everything else. CSS `!important` alone was not reaching these elements because their class names are unknown and may be set via Webtoons' own JS.

## [1.0.76] - 2026-05-10

### Fixed
- Added `.cont_box` to the dark background selector — transparent viewer sub-elements were revealing the cont_box native gray background instead of the page dark color.
- Changed viewer sub-sections (`viewer_info_area`, `viewer_ad_area`, `viewer_patron_area`) from `background: transparent` to explicit `var(--wt-bg)`.
- Broadened the app download banner (`foot_app`) rule to cover all occurrences inside the viewer box.

## [1.0.75] - 2026-05-10

### Fixed
- Viewer page: dark overrides for sub-sections below the comic panels (`viewer_info_area`, `viewer_ad_area`, `viewer_patron_area`) and the "Want more?" app download banner that appeared with brownish/olive backgrounds.

## [1.0.74] - 2026-05-10

### Changed
- Viewer sidebar cards now built by JS (`buildViewerCards`) instead of CSS class guessing. Groups children of `.ranking_lst` by "non-UL header + following UL" and wraps each section in a `div.wt-viewer-card`, bypassing the need to know Webtoons' internal class names.

## [1.0.73] - 2026-05-10

### Fixed
- Viewer sidebar: card now targets `.aside_item` (which wraps both the section header and ranked list) instead of `.ranking_wrap` alone; `.ranking_wrap` kept as fallback in case the DOM uses that class as the section container.

## [1.0.72] - 2026-05-10

### Fixed
- Viewer sidebar cards: added `border: 1px solid var(--wt-border)` to match the visual style of the Creator and comment cards on the same page.

## [1.0.71] - 2026-05-10

### Fixed
- Viewer sidebar: removed bottom separator between the two section cards — `.lst_type1` border-bottom was drawing a line inside each `.ranking_wrap` card.

## [1.0.70] - 2026-05-10

### Fixed
- Viewer sidebar: target `.ranking_wrap` (not `> *`) as individual section cards — the two sections (Trending & Popular / Top Originals) are nested inside a single `.ranking_lst.viewer` wrapper, so `> *` only produced one card; now each `.ranking_wrap` gets its own elevated card.
- Viewer sidebar section header arrows (`.ico_arr1`) were invisible — they are sprite background-images, not text, so `color` had no effect; added `filter: invert` to make them visible.
- Scoped border rules on `.ranking_wrap` to non-viewer asides only, to avoid double-borders inside the new cards.

## [1.0.69] - 2026-05-10

### Changed
- Viewer sidebar: split into two separate cards (Trending & Popular / Top Originals) by making `.aside.viewer` a transparent flex-column container and styling each direct child as its own elevated card; added `height: fit-content` to stop the aside stretching to match the taller comment column.

## [1.0.68] - 2026-05-10

### Fixed
- Viewer sidebar: reverted width from 375px back to 330px; the wider value caused the aside to exceed the 1200px cont_box and wrap below the comic panels, misaligning it next to the comments instead of the full content column.

## [1.0.67] - 2026-05-10

### Fixed
- Viewer sidebar: width increased from 330px to 375px so longer titles aren't truncated.
- Viewer vignette SPA persistence: single 150ms retry replaced with three retries at 100ms / 600ms / 1500ms; `watchHead()` MutationObserver now also calls `syncViewerClass()` so head stylesheet swaps during SPA navigation re-trigger the check.

## [1.0.66] - 2026-05-10

### Fixed
- Viewer vignette: gradient now also driven by JS `body.wt-viewer` class (hooks `pushState`/`replaceState`/`popstate`) so it survives SPA episode navigation. CSS `:has()` kept as fallback.
- Viewer sidebar: `overflow: hidden` clips the "THRILLER ✓" filter button overflow at the `border-radius: 14px` boundary (`box-shadow` is unaffected by overflow clipping). Ranking list items now also have `border: none` to remove separator lines at card edges.

## [1.0.65] - 2026-05-10

### Fixed
- Viewer sidebar: ranking list items inside `.aside.viewer` were getting the generic `.ranking_lst li { background: --wt-bg-elev; border-radius: 6px }` rule, making them appear as nested cards-on-card. Reset to transparent + no border-radius within the sidebar.
- Viewer vignette: gradient edge changed from `#020304` to pure `#000000`, transition zone narrowed from 28% to 14% — creates a clearly visible dark border at screen edges.

## [1.0.64] - 2026-05-10

### Fixed
- Viewer sidebar layout: `padding: 16px` on `.aside.viewer` expanded it from 330px to 362px (content-box), causing float overflow beyond the 1200px container → sidebar wrapped below comments. Fixed with `box-sizing: border-box; width: 330px` to keep padding inside the original footprint.
- Viewer vignette: gradient edge color changed from `#0d1014` to `#020304` (near-black) for a visible depth effect on the sides.

## [1.0.63] - 2026-05-10

### Fixed
- Viewer depth: previous gradient on `#content.viewer` never reached the side dead zones (the ellipse was too narrow) and lightened the like/subscribe area. New approach: gradient on `body` scoped via `body:has(#content.viewer)`, with `#container` and `#content` transparent so the body shows in the side areas. Elements with own backgrounds (toolbar, sidebar, episode strip, comments) are unaffected.

## [1.0.62] - 2026-05-10

### Fixed
- Viewer depth: gradient ellipse height reduced to 25% so it fades before reaching the like/subscribe area; no box-shadow on `#_imageList` (y=0 + 70px blur bled vertically into sections below panels). `#content.viewer` correctly overrides the general `#content` background rule.

## [1.0.61] - 2026-05-10

### Fixed
- Reverted v1.0.60 viewer changes — `#content.viewer` gradient bled into the Like/Subscribe area and episode strip; `box-shadow` on `#_imageList` had unintended side effects. Viewer styling back to v1.0.59 baseline pending proper investigation.

## [1.0.60] - 2026-05-10

### Fixed
- Viewer page: gradient background was on `#_viewerArea` which doesn't exist in current Webtoons markup — moved to `#content.viewer` so it actually fires. Added horizontal `box-shadow` on the comic panel column to create depth on the flat side areas.

## [1.0.59] - 2026-05-10

### Fixed
- Detail page: `.detail_body` was height-0 (floated children collapsed it), so its background never painted — artwork bled through card corners. Fixed with `display: flow-root` (contains floats), `overflow: hidden` (clips artwork at boundary), `border-radius: 16px` (rounded outer shape), and `padding-top: 24px` (breathing room between header and cards).

## [1.0.58] - 2026-05-10

### Fixed
- Detail page: `.detail_body` background changed from `--wt-bg-elev` to `--wt-bg` so the container rectangle is invisible against the page — previously the elevated color showed as a visible box below the shorter sidebar card.

## [1.0.51] - 2026-05-10

### Fixed
- Detail page elevation now visible: removed `.detail_lst_wrap` from generic `--wt-bg` rule that was overriding it; added `overflow: visible` to `.detail_body` so shadows aren't clipped; added `1px rgba(255,255,255,.1)` border to episode list and sidebar cards for guaranteed visibility
- Viewer page: replaced flat `--wt-bg` with a radial gradient spotlight (`#1d2026` center → `--wt-bg` edges) that makes the comic column feel raised above dark side areas

## [1.0.50] - 2026-05-10

### Added
- Homepage card hover: Material Design white-overlay elevation — surface lightens to `#30363f` + inset rim-light + thin white outline; removed `filter: brightness` which was tinting comic artwork
- Detail page elevation: episode list column and sidebar become separate elevated cards (`--wt-bg-elev`) above the page background, matching the homepage section hierarchy
- Viewer page elevation: episode thumbnail strip gets border-radius + shadow; ranking sidebar becomes an elevated card

## [1.0.49] - 2026-05-10

### Added
- Homepage "Option B" three-level elevation design: page → section cards → comic cards with shadows and transitions
- Heart icon in Like/Subscribe viewer pills tinted red via CSS filter
- Episode list hover: accent border via `::after` pseudo-element, date/like count turn green, `.subj` width capped at 385px to prevent episode-number overflow
- Sidebar CTA buttons (Continue reading / First episode) with green ring hover
- Search Creators section: dark hover background
- Multiple white/light border fixes: sidebar `border-left`, CANVAS Weekly top separator, viewer/comment section dividers

## [1.0.48] - 2026-05-10

### Added
- Series detail page: full dark theme — episode list, paywall strip, sort dropdown, subscribe button, recommendation cards, author info tooltip, subscribe-tier popup
- Series detail page: `.detail_header` background left transparent so `.detail_bg` series artwork shows through correctly in the header area
- Series detail page: header typography — text-shadow on title/genre/author for legibility on any artwork; genre label uppercase with wide letter-spacing
- Series detail page: subscribe "+" icon (`ico_plus4`) inverted to white on dark background
- Episode list typography: 17px episode titles, accent hover, visible date color, red-tinted like area, muted episode-number column
- Homepage: carousel arrow glassmorphic buttons, ranking number sprite replaced with CSS text, tab pill overrides

### Fixed
- Navigation artifacts (ghost backgrounds on nav items) caused by applying `border-color`/`box-shadow` to `.gnb`/`.lnb` — moved to outer header shell only
- Dead CSS selectors (`.wrap`, `.container`, `.section`) that matched nothing — removed
- `#wrap` excluded from section background rule (caused nav artifacts)
- Recently-viewed panel white background and sprite icon
- Sort dropdown, subscribe popup, episode sort, recommendation cards — all had white backgrounds
- Author info icon (`.ico_info2`) showing dark rectangle over series artwork
- `.detail_header` was incorrectly given `background-color: var(--wt-bg)` which painted over the series artwork in the center; removed from section rule

## [1.0.16] - 2026-05-10

### Changed
- **Moved the console-info banner to the very first line of the IIFE** so it logs *before* any other code that could throw. Previously it was at the end — so a single error anywhere upstream would silently kill the banner, making it impossible to tell whether the script "wasn't running" vs "was running but errored out."
- The startup banner now also reports the type of `GM_getValue` / `GM_setValue` / `GM_registerMenuCommand` so we can see whether Tampermonkey is granting them.
- The end-of-IIFE banner now says "fully loaded" — if you only see "starting" but not "fully loaded", an error happened in between and we can see exactly which line in the console.

## [1.0.15] - 2026-05-10

### Added
- **Backup keyboard shortcuts** for users whose OS or keyboard layout swallows `Alt+Shift+T`. On Windows specifically, `Alt+Shift` is the default Switch Input Language hotkey on multi-language setups — that can intercept the keystroke before it reaches our handler. Now also accepts:
  - **`Ctrl + Alt + D`** → toggle theme (alongside `Alt + Shift + T`)
  - **`Ctrl + Alt + Shift + D`** → toggle reader dim (alongside `Alt + Shift + N`)
- **`console.info` startup banner** so you can confirm the script actually loaded and which version Tampermonkey is serving: open DevTools → Console and look for `[webtoons-dark-mode] v1.0.15 loaded …`. Each successful toggle also logs `theme toggled` / `reader dim toggled` so we can tell whether the handler is firing.

### Changed
- **Handler attached to four roots** (`window`, `document`, `<html>`, `<body>`) in capture phase. If a focus-stealing widget (WCC comment editor) somehow blocks one root, another will still see the event.

## [1.0.14] - 2026-05-10

### Fixed
- **`Alt + Shift + T` / `Alt + Shift + N` keyboard shortcuts stopped firing** on some pages. Most likely cause: a focused contenteditable in the WCC comment editor (added in v1.0.11) intercepts the keystroke before our window-level capture handler, OR a Webtoons handler calls `stopImmediatePropagation` ahead of ours. Hardened the keyboard handler:
  - Bound to **both `window` and `document`** capture phase so we catch the event regardless of which root Webtoons attaches to.
  - Matches both `e.code` (physical key, layout-independent) AND `e.key` (translated character) so non-QWERTY layouts also work.
  - Calls `e.stopImmediatePropagation()` + `e.stopPropagation()` after a successful toggle so Webtoons' own handlers can't undo or interfere.
  - Wraps `toggle()` calls in `try/catch` so a single `GM_setValue` failure doesn't silently kill the binding for the rest of the session — errors now log to the console with a `[webtoons-dark-mode]` prefix.

## [1.0.13] - 2026-05-10

### Fixed
- **Per-series artwork on the title banner appeared dim/muted** in dark mode (gold sparkles for *The Cup of Vengeance*, pink bubbles for *Sweet Romance*, sky/clouds for *Best Teacher Baek*, etc.). Root cause traced after the user pointed out a clear before/after comparison: `.detail_bg` carries the artwork via inline `style="background:url(...) repeat-x"`, but the `background:` shorthand also resets `background-color` to **transparent**. The artist designed the image assuming a **white** backdrop — gold-on-white, pink-on-white, etc. With our dark `#content` showing through the image's transparent regions, the artwork looked muted.
  - Removing the dim filter (v1.0.12) wasn't enough because the issue was compositing, not brightness.
  - The fix is to force `background-color: #fff` on `.detail_bg` so the inline image paints onto white the way the artist intended. Trade-off: the title banner area is a light strip in dark mode (~321px tall at the top of series detail pages). Net: the per-series identity is preserved exactly as in light mode.

## [1.0.12] - 2026-05-10

### Fixed
- **Brand-green stats icons turned grey** in "You may also like" recommendation cards (and elsewhere). The view eye, subscribe person, and grade star sprites have brand green baked in — my v1.0.5 filter (`brightness(0) invert(1)`) was bleaching them to white/grey, killing the brand identity. Removed `.ico_view`, `.ico_view2`, `.ico_subscribe`, `.ico_grade`, `.ico_grade2` from the filter list; they render natively now (brand green, fully visible against dark).
- **Author-info "i" icon rendered as a solid white blob** on series detail pages (e.g. *The Cup of Vengeance Is in Your Hands*). Same root cause: `brightness(0) invert(1)` bleaches the entire sprite area, not just the glyph. Removed `.ico_info2` from the filter; same as v1.0.11's `.detail_header.type_white .ico_info2` carve-out (now removed since the global rule is gone).

### Changed
- **Skin-image dimming removed entirely.** Earlier versions stepped from `.55` → `.7` → `.9`; v1.0.12 sets `filter: none` so the per-series artwork on the sides matches its light-mode brightness exactly. The artwork was designed by the artist for that brightness — there's no real reason to dim it for dark mode beyond initial caution that turned out to be unnecessary.

Unchanged filter scope:

- Filter is still applied to ranking-number digits (`.ico_n1` … `.ico_n10`) — those ARE plain dark glyphs designed for white bg.
- Footer brand social icons (`.btn_foot_*`) keep their separate `.75` opacity filter.

## [1.0.11] - 2026-05-10

### Fixed
- **Comments still had a white background** despite v1.0.9's WCC overhaul. Found the missing piece: WCC has a master container called `wcc_App__root` that wraps the entire comment widget. v1.0.9 covered the inner items (CommentItem / CommentBody / CommentHeader) but the outer App container itself stayed white. Now covered.
- **Comment editor (the input where you type a reply) was uncovered.** Added all the WCC `Editor__*` sub-classes: `root`, `content`, `editor` (the contenteditable area), `scrollArea`, `actionBar`, `toolbar`, `attachment`, `replyContainer`, `modifyContainer`, `spoilerWrapper`, etc. Caret color also set so it's visible against the dark input.
- **Spoiler toggle** in the comment editor (`wcc_Spoiler__*` and `wcc_SpoilerGuard__*`).
- **Kebab-case WCC loaders** (`wcc-comment-list-loader`, `wcc-sort-order-loader`) — these don't match `[class*="wcc_"]` because they use dashes, not underscores. Added separate selectors.
- **Notice popup buttons (Yes / No / OK / Cancel) were dark-on-dark** in v1.0.9. The buttons used `--wt-bg-elev2` which sat too close to the popup card's `--wt-bg-elev` — they disappeared into the surface. Switched to the lighter `--wt-bg-hover` with a visible border so they read as clickable pills. Hover lifts further to elev2 with a brighter border.
- **`.detail_header.type_white` series banners** (e.g. Sweet Romance / Spicy Roommates with the pink skin) had the title (`#000`), author (`#252525`), and info `i` icon hard-coded for light page bg. Author was nearly invisible, title was pure black-on-dark. All three retinted: title uses `--wt-text`, author uses `--wt-text-dim`, info icon bleached to white.

### Changed
- **Skin image brightness bumped from `.7` to `.9`.** v1.0.5 set it to `.55`, v1.0.8 raised to `.7`. The remaining dimming was making the per-series artwork on the sides too washed out — `.9` keeps the art vivid while still preventing the worst clashes with the dark chrome.

## [1.0.10] - 2026-05-10

### Fixed
- **Trending sidebar ranking numbers (1–10) invisible on dark.** They render as sprite digit glyphs (`.ico_n1` ... `.ico_n10`) designed for white bg — previously left untouched. Now bleached white via the same filter trick used on stats glyphs.
- **Search autocomplete result hover/select highlight went white.** When typing in the search box and getting autocomplete suggestions (e.g. "roman" → Selfish Romance / Sweet Romance / …), hovering or arrow-key-selecting an item set `.list_autocomplete li.on` and `.link:hover` to `background:#f3f3f3` — a near-white pill — and the title text underneath stayed `#000`. Hover/active bg now uses `--wt-bg-elev2`; title text uses `--wt-text`; author/info uses `--wt-text-dim`; the bold matched-substring (`<strong>roman</strong>` inside "Sweet Romance") uses `--wt-accent` (was `#03aa5a`, kept brand-green identity).

### Changed
- **Currently-viewing episode highlight is now visibly louder.** The base 3px green border on the active `.thmb` is preserved, but now sits inside a softer outer ring + a 14px green glow halo. The active episode title (`.subj`) is also bolded. Makes the "you are here" position obvious at a glance when scrubbing the thumbnail strip.

## [1.0.9] - 2026-05-10

### Fixed
- **Comments still white / nicknames invisible** (this was the big one). Webtoons replaced the legacy Naver `u_cbox` comment widget with a new in-house **WCC** ("Webtoon Comment Component") served from `ssl.pstatic.net/static/wcc/gw/prod-1.0/index.js`. WCC uses CSS-Module class names of the form `wcc_<Component>__<element>` (e.g. `wcc_CommentHeader__name` for nicknames, `wcc_CommentBody__root` for body text, `wcc_SortOrderTab__active` for the active TOP/NEWEST tab). The previous `.u_cbox_*` selectors matched *nothing* on this widget. Added a full `[class*="wcc_..."]` block covering: comment items (cards), header (name/createdAt/creator badge), body, reactions, best/super-like badges, sort tabs, reply-fold toggles, "more comments" loaders, alert/report/option-menu popups, and empty state. Legacy `.u_cbox_*` rules retained as a fallback.
- **Sub-nav underline broken / discontinuous** ("the line begins, disappears, and after the categories appears again"). Base CSS gives `.snb_wrap { border-bottom: .5px solid #e0e0e0 }` (invisible on dark). The scroll-arrow buttons (`.btn_snb_prev` / `.btn_snb_next`) had their own `border-bottom: .5px solid #e0e0e0` *plus* white background that broke the bottom edge into segments. Forced both to `--wt-border` so the line reads continuously across the strip.
- **Pagination numbers (2 / 3 / … / 10) not visible.** Base CSS hard-codes `.paginate a, .paginate strong { color: #070707 }`. Bumped from `--wt-text-dim` (set in v1.0.6) to full `--wt-text` for clearly readable numbers; hover now uses accent green to match the active page indicator.
- **Episode titles still dim grey** despite the v1.0.8 fix. Broadened the rule to also catch `.detail_lst li a` and any direct `<span>` children that aren't `.date`/`.tx`. Date column now uses `--wt-text-dim` instead of leaking the base `#b1b1b1`.
- **Top-right "Log In" hover went near-white**, hiding the white-glyph icon. Base CSS sets `.header_right .link_login:hover { background: #e0e0e0 }`. Now uses `--wt-bg-hover` like the search button next to it.
- **Footer Facebook icon "barely visible"** at v1.0.6's `opacity(.65)`. Bumped to `.75` (hover up to `1.0`) — readable while still even with the line-style Instagram/X/YouTube siblings.

## [1.0.8] - 2026-05-10

### Fixed
- **Search dropdown "still white" after v1.0.6.** v1.0.6 covered `.search_area` (outer panel) and `.input_search` (transparent `<input>`) but missed the *middle* layer: `.search_area .input_box` is the rounded grey pill that wraps the input (`background:#f3f3f3` in base CSS). Now styled with `--wt-bg-input` so the pill is dark; the inner `<input>` is forced transparent so the pill bg shows through. Also added `.ly_autocomplete .title` and `.autocomplete_foot` text colors and item hover state.
- **Episode titles "Episode 26 / 25 / 24" almost invisible.** Base CSS hard-codes `.detail_body .detail_lst .subj span { color: #3d3d3d }` — high specificity (3 classes + element) targeting the *inner* span. Our previous `.subj` rule only colored the outer span; the inner one inherited the dark grey from the more specific rule. Added matching-specificity overrides for `.detail_body .detail_lst .subj span` plus the date column.
- **Terms / Policy language pills** (English / Français / Indonesia / 中文 / ภาษาไทย at the top of `/<lang>/terms*`). Base: inactive `#f3f3f3` bg + `#666` text (invisible on dark); active `#000` bg + `#fff` text (off-theme). Now: inactive uses `--wt-bg-elev2` + `--wt-text-dim`; active uses `--wt-accent` + `--wt-text-on-accent`; inactive hover uses `--wt-bg-hover` + `--wt-text`.
- **White-circle social icons in title banner** (FB / X / Tumblr / Reddit / Copy / RSS next to the Subscribe button). v1.0.5 applied `filter: brightness(0) invert(1)` to all `.ico_*` selectors, but the sprite at those positions includes brand-colored disc backgrounds — the filter bleached the whole disc to a solid white circle, hiding the glyph. Filter is now scoped to **stats glyphs only** (`.ico_subscribe`, `.ico_view`, `.ico_view2`, `.ico_grade`, `.ico_grade2`). Brand social icons render in their native colors (FB blue, X dark, Tumblr indigo, Reddit orange, RSS orange) — visible on dark.
- The viewer-context filter override added in v1.0.7 is now redundant and removed — social icons are no longer filtered anywhere, and the viewer's `.ico_favorites` / `.ico_like2` / `.ico_plus3` were never affected by the v1.0.5 rule.

### Changed
- **Skin image less dimmed.** v1.0.5 used `filter: brightness(.55)` on `.detail_bg`, which made per-series artwork (sky/clouds for Best Teacher Baek, red cracks for A Cadet Becomes a Prophet) too dark on the sides. Bumped to `.7` — still tames the bright artwork next to dark chrome, but keeps the artist's image readable.
- **Sub-nav hover now uses accent green** instead of plain white. `.snb_item:hover .snb_tab` color changed from `--wt-text` to `--wt-accent` so hover affordance matches the active-tab indicator.

## [1.0.7] - 2026-05-10

### Fixed
- **Viewer top toolbar** (`.tool_area`, the fixed bar at the top of every chapter page). Was natively `#2f2f2f` — now uses `--wt-bg-elev` for theme consistency, with a `--wt-border` bottom edge.
- **Top-toolbar icons rendering as solid white circles.** The same `.ico_facebook` / `.ico_twitter` / `.ico_copy` / `.ico_favorites` classes are reused in the title banner (where v1.0.5's `filter: brightness(0) invert(1)` works well) and in the viewer toolbar (where the sprite picks up icons that have a colored circle background baked in — the filter then bleached the whole disc to solid white). Filter is now suppressed in the viewer-toolbar and viewer-share contexts; icons render in their native colors.
- **Episode thumbnail strip** above and below the comic (`.episode_area`). Base CSS hard-codes `background:#f5f5f5`. Now `--wt-bg-elev` with `--wt-border` outline.
- **"Trending & Popular" sidebar** on the viewer (`.aside.viewer`, `.ranking_lst.viewer`). Wrapper gets dark surface, headings + counts get proper text/dim colors.
- **"Share this series and show support for the creator!" prompt** (`.viewer_lst .dsc_encourage`). Was hard-coded to `color:#080808` — invisible on dark.
- **Like / Subscribe pill buttons** in the viewer footer (`.spi_area .bx`). Were `background:#ececec` `color:#585858` by default. Now elevated dark surface with hover state.
- **Creator-note card** at the top of the comments section (`.comment_area .creator_note`, `.creator_note .title`, `.author_area .author`). Title was `#3c3c3c`; now muted-dim. Author name is now full primary text.
- **Comments section header** (`.comment_head .title_comments`, `.count`).

### Added
- **Defensive cbox-widget catch-alls** for slightly different class variants (`[class*="cbox_nick"]`, `[class*="cbox_date"]`, `[class*="cbox_sort"]`). Addresses "user nicknames almost invisible" reports without changing the v1.0.2 rules that already work.

## [1.0.6] - 2026-05-10

### Fixed
- **Search button (top-right of header) was nearly invisible.** Base CSS sets `.header_right .btn_search { background: #f3f3f3 }` (light grey). Now uses `--wt-bg-elev2` background with a `--wt-border` outline; the magnifying-glass `:before` sprite is forced to white via `filter: brightness(0) invert(1) opacity(.85)`.
- **Search dropdown** (recent searches + autocomplete) was a white box. Targeted: `.search_cont`, `.search_area`, `._searchArea`, `.input_search`, `._txtKeyword`, `.ly_autocomplete`, `._searchLayer`, plus item hover state.
- **Notice list page** (`/<lang>/notice/list`). Base CSS gives `.notice_area2 .tb_notice tbody tr { color: #000 }` and `tr.special { background: #f8f8f8 }` — invisible/jarring on dark. Now: dark page surface, `--wt-bg-elev2` table headers, `--wt-bg-elev` for the highlighted "special" row, `--wt-border` row dividers, `--wt-text` cell text.
- **Terms and Privacy Policy pages** (`/<lang>/terms`, `/<lang>/terms/privacyPolicy`). Base CSS hard-codes `.terms_area { background: #fff; color: #858585 }`. Overridden along with `.terms_box`, `.terms_card`, `.terms_lang_area`, `.terms_lang_desc`, `.terms_list`. Headings (`h3`, `strong`) get full text color, dates get muted, links use the link blue.
- **About / Contact / Feedback / and similar static pages.** These are rendered by a **separate Next.js subapp** (bundle from `/static/wec/.../next/...`) and use Tailwind utility classes (`text-black`, `bg-white`, `bg-gray-100`, …) that ignore the body color cascade. Added a scoped override block — anything inside `section[class*="layout_container"]` gets dark background + dark-mode text colors. Limited to that wrapper so it can't leak into the main linewebtoon-rendered pages.
- **Facebook footer icon was visibly brighter than the other socials.** All the footer social icons go through `filter: brightness(0) invert(1)`, but the FB glyph fills more pixel area than the line-style Instagram / X / YouTube glyphs, so at high opacity it dominated the row. Lowered base opacity from `.85` to `.65` (hover from `1` to `.95`) to even out the visual weight.

### Added
- **Hover highlight on top-nav links** (Originals / Categories / Rankings / Canvas / Webtoon Shop / Creators 101). Were previously plain text with no hover affordance — now get an accent-green text + `--wt-bg-elev2` rounded background on hover. Same upgrade applied to sub-nav tabs (`.snb_item`, `.snb_tab`).

## [1.0.5] - 2026-05-10

### Fixed
- **White wrapper around the episode list on series detail pages** (e.g. `/en/action/best-teacher-baek/list?...`). The base CSS sets `background:#fff` on `.detail_body .detail_lst` directly — overridden with our dark surface.
- **"You may also like" recommendation cards** (`.detail_other .lst_type1 li`) were also explicitly white. Now styled as elevated dark cards with hover state, plus dark-mode-appropriate text colors for title (`.subj`), author, and stats.
- **Title-banner social icons** — Facebook, X, Tumblr, Reddit, Copy-link, RSS (`.ico_facebook`, `.ico_twitter`, `.ico_tumblr`, `.ico_reddit`, `.ico_copy`, `.ico_rss`). Same sprite-glyph fix used on the footer icons in v1.0.2: `filter: brightness(0) invert(1) opacity(.85)`.
- **Stats icons** in the title banner (view / subscribe / grade) were also invisible sprite glyphs — same treatment.
- **Pagination** at the bottom of the episode list (`.paginate`). Page numbers were hard-coded to `#070707` text in the base CSS, invisible on dark.

### Added
- **Skin-image preservation.** Each series has a unique skin image at the top of its detail page (sky/clouds for Best Teacher Baek, flames for Surviving the Game as a Barbarian, etc.) painted on `.detail_bg` via inline `background:url(...)`. Previous versions implicitly hid this with the chrome dark-out. Now the artist's image is kept visible, with `filter: brightness(.55)` applied so it doesn't clash with our dark chrome on the sides.

## [1.0.4] - 2026-05-10

### Added
- **`prefers-color-scheme` first-run default.** New installs now default to whatever the OS dark/light preference is (was: always on regardless of OS). Once the user toggles for the first time, that choice is persisted via `GM_setValue` and OS preference is ignored. Existing users with a stored preference are unaffected — only fresh installs see this.
- **`html[data-wt-dark]` hook.** When the theme is on, `<html>` gets `data-wt-dark="on"`; when off, `data-wt-dark="off"`. Power users can write personal CSS like `html[data-wt-dark="on"] .my-thing { ... }` and have it scoped to only the dark state.
- **SPA-resilience MutationObserver.** A small observer watches `<head>` for direct childList changes. If our `<style>` element is ever removed (Webtoons swaps stylesheets on some chapter transitions, and external bundles can race with our injection), it's re-applied. The observer only fires on direct head-child mutations, so its overhead is negligible.

Not done (intentional):

- The "split `theme` into named chunks" refactor item was reconsidered and skipped. The existing section comments already act as a TOC, the planned v1.1 preset switcher only swaps the palette (not the theme), and the diff churn (~330 lines moved) doesn't pay back. If we hit a real maintainability problem later, we can revisit.

## [1.0.3] - 2026-05-10

### Changed
- **Palette tuning** based on a contrast/perception review against Material 3, Apple HIG, GitHub Dark, Tailwind Slate and Catppuccin reference palettes:
  - `--wt-text-mute` lifted from `#6B7079` to `#7B828D`. The previous value computed to ~3.9:1 against the page background, failing WCAG AA for normal text. The new value is ~5:1 and still clearly muted.
  - `--wt-border` lifted from `#2C3036` to `#363B44`. The previous value was ~1.3:1 against the page background — card edges and table dividers were nearly invisible. The new value sits at ~2:1 so the elevation hierarchy reads.
- **Palette consolidated.** The two hard-coded colors that were sprinkled in the theme CSS (`#30353c` button-hover, `#0a0a0a` text on accent surfaces) are now the new variables `--wt-bg-hover` and `--wt-text-on-accent`. The whole theme is once again re-skinnable from a single block at the top of the file.

### Fixed
- `ensureStyle()` now updates the `<style>` element's `textContent` if it already exists. Previously a second call with the same `id` but different CSS would silently do nothing — a latent bug that would have surfaced the moment a preset switcher was added.

## [1.0.2] - 2026-05-10

### Fixed
- **"Recently viewed" floating bar** on the right edge of every page (`.recently_area`). The site paints a white PNG sprite (`bg_recently.png`) as the background — overridden with our dark surface, plus dark text/border colors for the inner thumbnails (`.t_recently`, `.t_recently2`, `.recently_cont .subj`, `.episode`, `.bar`).
- **Footer social icons** (Facebook / Instagram / Twitter / YouTube / Pinterest / LINE). They are CSS-sprite glyphs positioned out of a single dark-on-white SVG sheet. With our dark background they were nearly invisible. Forced to white via `filter: brightness(0) invert(1) opacity(.85)`, with full opacity on hover.
- **Footer language selector** — both the closed "English ▾" button (`.foot_menu .language .lk_lang`) and the dropdown (`.ly_lang`, items, dropdown arrow). Active language now uses the brand-green accent.
- **Login modal** ("Log in now and enjoy free comics") injected by `/static/bundle/common/gnb-*.js` on Log-In click. Targets the actual JS-hook classes: `._loginLayer`, `._loginDimLayer` (backdrop overlay), `._loginComponentParent`, `._defaultLoginComponent`, `.emailLoginComponent`, plus the SNS buttons (`._btnLoginSns`, `.btn_sns`, `._emailLoginButton`, `._btnLoginEmail`) and the close + back buttons.
- Added a defensive `[role="dialog"], [aria-modal="true"]` catch-all so any future Webtoons dialog inherits dark surfaces by default.

## [1.0.1] - 2026-05-10

### Fixed
- White sub-navigation strip on the daily-schedule page (MON/TUE/.../SAT/SUN/COMPLETED tabs). The site uses `.snb_wrap` / `.snb_inner` / `.snb` / `.snb_item` / `.snb_tab`, which v1.0.0 did not target.
- White genre-tabs strip on `/genres/*` pages (DRAMA / FANTASY / COMEDY / …) — same shared `.snb` component.
- White section-header strip above series listings showing "N series" + "by Popularity | by Likes | by Date" (`.section_header`, `.series_count`, `.sort_area`, `.sort_by`, `[aria-current="true"]` for the active sort).
- White "Notice" strip above the footer (`.notice_area`, `#noticeArea`).
- White "Download WEBTOON now!" promo band in the footer (`.foot_app`, `.foot_cont`, `.foot_down_msg`, `.footapp_icon_cont`, `.btn_google`, `.btn_ios`).
- QR code in the app-download strip is now placed on a small white tile so it remains scannable against the dark surrounding band.

### Changed
- Active tab indicators now follow the site's `aria-current="true"` / `aria-current="page"` and `.is_selected` class instead of the legacy `.on` class.

## [1.0.0] - 2026-05-10

### Added
- Initial release.
- Targeted dark theme for Webtoons covering header, navigation, cards, episode lists, viewer, comments (Naver `u_cbox` widget), popups, modals, footer, inputs, buttons, scrollbars.
- CSS-variable palette (`--wt-bg`, `--wt-text`, `--wt-accent`, …) for one-line re-skinning.
- Persistent toggle via `GM_setValue` / `GM_getValue` — state survives reloads and browser restarts.
- Userscript-manager menu commands: *Toggle Webtoons dark mode*, *Toggle reader dim*.
- Keyboard shortcuts: `Alt + Shift + T` (theme), `Alt + Shift + N` (reader dim).
- Optional reader-dim mode that lowers comic-panel brightness for late-night reading without tinting the rest of the page.
- Mobile site coverage (`m.webtoons.com`).
- `@updateURL` / `@downloadURL` for auto-updates from GitHub `main`.
- `@noframes` so the script doesn't re-run inside ad iframes.
- Style injection at `@run-at document-start` to avoid flash of light theme.

[Unreleased]: https://github.com/hervad/webtoons-dark-mode/compare/v1.8.3...HEAD
[1.8.3]: https://github.com/hervad/webtoons-dark-mode/compare/v1.8.2...v1.8.3
[1.8.2]: https://github.com/hervad/webtoons-dark-mode/compare/v1.8.1...v1.8.2
[1.8.1]: https://github.com/hervad/webtoons-dark-mode/compare/v1.8.0...v1.8.1
[1.8.0]: https://github.com/hervad/webtoons-dark-mode/compare/v1.7.0...v1.8.0
[1.7.0]: https://github.com/hervad/webtoons-dark-mode/compare/v1.6.4...v1.7.0
[1.6.4]: https://github.com/hervad/webtoons-dark-mode/compare/v1.6.3...v1.6.4
[1.6.3]: https://github.com/hervad/webtoons-dark-mode/compare/v1.6.2...v1.6.3
[1.6.2]: https://github.com/hervad/webtoons-dark-mode/compare/v1.6.1...v1.6.2
[1.6.1]: https://github.com/hervad/webtoons-dark-mode/compare/v1.6.0...v1.6.1
[1.6.0]: https://github.com/hervad/webtoons-dark-mode/compare/v1.5.4...v1.6.0
[1.5.4]: https://github.com/hervad/webtoons-dark-mode/compare/v1.5.3...v1.5.4
[1.5.3]: https://github.com/hervad/webtoons-dark-mode/compare/v1.5.2...v1.5.3
[1.5.2]: https://github.com/hervad/webtoons-dark-mode/compare/v1.5.1...v1.5.2
[1.5.1]: https://github.com/hervad/webtoons-dark-mode/compare/v1.5.0...v1.5.1
[1.5.0]: https://github.com/hervad/webtoons-dark-mode/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/hervad/webtoons-dark-mode/compare/v1.3.1...v1.4.0
[1.3.1]: https://github.com/hervad/webtoons-dark-mode/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/hervad/webtoons-dark-mode/compare/v1.2.4...v1.3.0
[1.2.4]: https://github.com/hervad/webtoons-dark-mode/compare/v1.2.3...v1.2.4
[1.2.3]: https://github.com/hervad/webtoons-dark-mode/compare/v1.2.2...v1.2.3
[1.2.2]: https://github.com/hervad/webtoons-dark-mode/compare/v1.2.1...v1.2.2
[1.2.1]: https://github.com/hervad/webtoons-dark-mode/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/hervad/webtoons-dark-mode/compare/v1.1.28...v1.2.0
[1.1.28]: https://github.com/hervad/webtoons-dark-mode/compare/v1.1.27...v1.1.28
[1.1.27]: https://github.com/hervad/webtoons-dark-mode/compare/14230d7...v1.1.27
[1.1.26]: https://github.com/hervad/webtoons-dark-mode/compare/14230d7...v1.1.27
[1.1.23]: https://github.com/hervad/webtoons-dark-mode/compare/v1.1.21...14230d7
[1.1.22]: https://github.com/hervad/webtoons-dark-mode/compare/v1.1.21...14230d7
[1.1.21]: https://github.com/hervad/webtoons-dark-mode/compare/14c82ba...v1.1.21
[1.1.20]: https://github.com/hervad/webtoons-dark-mode/compare/14c82ba...v1.1.21
[1.1.19]: https://github.com/hervad/webtoons-dark-mode/compare/14c82ba...v1.1.21
[1.1.18]: https://github.com/hervad/webtoons-dark-mode/compare/14c82ba...v1.1.21
[1.1.17]: https://github.com/hervad/webtoons-dark-mode/compare/14c82ba...v1.1.21
[1.1.16]: https://github.com/hervad/webtoons-dark-mode/compare/9a45ea5...14c82ba
[1.1.15]: https://github.com/hervad/webtoons-dark-mode/compare/9a45ea5...14c82ba
[1.1.14]: https://github.com/hervad/webtoons-dark-mode/compare/9a45ea5...14c82ba
[1.1.13]: https://github.com/hervad/webtoons-dark-mode/compare/9a45ea5...14c82ba
[1.1.12]: https://github.com/hervad/webtoons-dark-mode/compare/9a45ea5...14c82ba
[1.1.11]: https://github.com/hervad/webtoons-dark-mode/compare/9a45ea5...14c82ba
[1.1.10]: https://github.com/hervad/webtoons-dark-mode/compare/9a45ea5...14c82ba
[1.1.9]: https://github.com/hervad/webtoons-dark-mode/compare/9a45ea5...14c82ba
[1.1.8]: https://github.com/hervad/webtoons-dark-mode/compare/9a45ea5...14c82ba
[1.1.7]: https://github.com/hervad/webtoons-dark-mode/compare/9a45ea5...14c82ba
[1.1.6]: https://github.com/hervad/webtoons-dark-mode/compare/5618154...9a45ea5
[1.1.5]: https://github.com/hervad/webtoons-dark-mode/compare/5618154...9a45ea5
[1.1.4]: https://github.com/hervad/webtoons-dark-mode/compare/93c2eb1...5618154
[1.1.3]: https://github.com/hervad/webtoons-dark-mode/compare/9908090...93c2eb1
[1.1.2]: https://github.com/hervad/webtoons-dark-mode/compare/0fd0751...9908090
[1.1.1]: https://github.com/hervad/webtoons-dark-mode/compare/55135a7...0fd0751
[1.1.0]: https://github.com/hervad/webtoons-dark-mode/compare/0993edd...55135a7
[1.0.99]: https://github.com/hervad/webtoons-dark-mode/compare/374a09e...0993edd
[1.0.98]: https://github.com/hervad/webtoons-dark-mode/compare/8d742e6...374a09e
[1.0.97]: https://github.com/hervad/webtoons-dark-mode/compare/f95a956...8d742e6
[1.0.96]: https://github.com/hervad/webtoons-dark-mode/compare/fae8be7...f95a956
[1.0.95]: https://github.com/hervad/webtoons-dark-mode/compare/abebd2b...fae8be7
[1.0.94]: https://github.com/hervad/webtoons-dark-mode/compare/642e5eb...abebd2b
[1.0.93]: https://github.com/hervad/webtoons-dark-mode/compare/6a0e1e9...642e5eb
[1.0.92]: https://github.com/hervad/webtoons-dark-mode/compare/4ab87b4...6a0e1e9
[1.0.91]: https://github.com/hervad/webtoons-dark-mode/compare/2fd472a...4ab87b4
[1.0.90]: https://github.com/hervad/webtoons-dark-mode/compare/0b10061...2fd472a
[1.0.89]: https://github.com/hervad/webtoons-dark-mode/compare/e28253f...0b10061
[1.0.88]: https://github.com/hervad/webtoons-dark-mode/compare/8f50e97...e28253f
[1.0.87]: https://github.com/hervad/webtoons-dark-mode/compare/2b6e9d7...8f50e97
[1.0.86]: https://github.com/hervad/webtoons-dark-mode/compare/47b74aa...2b6e9d7
[1.0.85]: https://github.com/hervad/webtoons-dark-mode/compare/f934f6a...47b74aa
[1.0.84]: https://github.com/hervad/webtoons-dark-mode/compare/40359d3...f934f6a
[1.0.83]: https://github.com/hervad/webtoons-dark-mode/compare/c27007c...40359d3
[1.0.82]: https://github.com/hervad/webtoons-dark-mode/compare/2189599...c27007c
[1.0.81]: https://github.com/hervad/webtoons-dark-mode/compare/76c59da...2189599
[1.0.80]: https://github.com/hervad/webtoons-dark-mode/compare/3d34d6b...76c59da
[1.0.79]: https://github.com/hervad/webtoons-dark-mode/compare/6520765...3d34d6b
[1.0.78]: https://github.com/hervad/webtoons-dark-mode/compare/6904f9d...6520765
[1.0.77]: https://github.com/hervad/webtoons-dark-mode/compare/2b5b2b5...6904f9d
[1.0.76]: https://github.com/hervad/webtoons-dark-mode/compare/477344c...2b5b2b5
[1.0.75]: https://github.com/hervad/webtoons-dark-mode/compare/5beacf5...477344c
[1.0.74]: https://github.com/hervad/webtoons-dark-mode/compare/9e1b190...5beacf5
[1.0.73]: https://github.com/hervad/webtoons-dark-mode/compare/85fdd6d...9e1b190
[1.0.72]: https://github.com/hervad/webtoons-dark-mode/compare/c192816...85fdd6d
[1.0.71]: https://github.com/hervad/webtoons-dark-mode/compare/e9244b7...c192816
[1.0.70]: https://github.com/hervad/webtoons-dark-mode/compare/86d5f17...e9244b7
[1.0.69]: https://github.com/hervad/webtoons-dark-mode/compare/aafed46...86d5f17
[1.0.68]: https://github.com/hervad/webtoons-dark-mode/compare/38e4ef2...aafed46
[1.0.67]: https://github.com/hervad/webtoons-dark-mode/compare/b4b5a7f...38e4ef2
[1.0.66]: https://github.com/hervad/webtoons-dark-mode/compare/c54e39e...b4b5a7f
[1.0.65]: https://github.com/hervad/webtoons-dark-mode/compare/0baf522...c54e39e
[1.0.64]: https://github.com/hervad/webtoons-dark-mode/compare/433f220...0baf522
[1.0.63]: https://github.com/hervad/webtoons-dark-mode/compare/30a1fd7...433f220
[1.0.62]: https://github.com/hervad/webtoons-dark-mode/compare/a64ad7a...30a1fd7
[1.0.61]: https://github.com/hervad/webtoons-dark-mode/compare/b0a9cb4...a64ad7a
[1.0.60]: https://github.com/hervad/webtoons-dark-mode/compare/6be4aff...b0a9cb4
[1.0.59]: https://github.com/hervad/webtoons-dark-mode/compare/78f65e7...6be4aff
[1.0.58]: https://github.com/hervad/webtoons-dark-mode/compare/1fd9658...78f65e7
[1.0.51]: https://github.com/hervad/webtoons-dark-mode/compare/2b75e5a...afe0edd
[1.0.50]: https://github.com/hervad/webtoons-dark-mode/compare/5fb5abd...2b75e5a
[1.0.49]: https://github.com/hervad/webtoons-dark-mode/compare/c682b2b...5fb5abd
[1.0.48]: https://github.com/hervad/webtoons-dark-mode/compare/dd92d1c...c682b2b
[1.0.16]: https://github.com/hervad/webtoons-dark-mode/compare/v1.0.15...v1.0.16
[1.0.15]: https://github.com/hervad/webtoons-dark-mode/compare/v1.0.14...v1.0.15
[1.0.14]: https://github.com/hervad/webtoons-dark-mode/compare/v1.0.13...v1.0.14
[1.0.13]: https://github.com/hervad/webtoons-dark-mode/compare/v1.0.12...v1.0.13
[1.0.12]: https://github.com/hervad/webtoons-dark-mode/compare/v1.0.11...v1.0.12
[1.0.11]: https://github.com/hervad/webtoons-dark-mode/compare/v1.0.10...v1.0.11
[1.0.10]: https://github.com/hervad/webtoons-dark-mode/compare/v1.0.9...v1.0.10
[1.0.9]: https://github.com/hervad/webtoons-dark-mode/compare/v1.0.8...v1.0.9
[1.0.8]: https://github.com/hervad/webtoons-dark-mode/compare/v1.0.7...v1.0.8
[1.0.7]: https://github.com/hervad/webtoons-dark-mode/compare/v1.0.6...v1.0.7
[1.0.6]: https://github.com/hervad/webtoons-dark-mode/compare/v1.0.5...v1.0.6
[1.0.5]: https://github.com/hervad/webtoons-dark-mode/compare/v1.0.4...v1.0.5
[1.0.4]: https://github.com/hervad/webtoons-dark-mode/compare/v1.0.3...v1.0.4
[1.0.3]: https://github.com/hervad/webtoons-dark-mode/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/hervad/webtoons-dark-mode/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/hervad/webtoons-dark-mode/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/hervad/webtoons-dark-mode/releases/tag/v1.0.0
