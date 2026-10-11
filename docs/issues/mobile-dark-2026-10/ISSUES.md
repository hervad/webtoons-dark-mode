# Toonlight Dark Mode — mobile site (m.webtoons.com) issues

Captured 2026-10-10, ~22:59–23:01, on a phone (1080×2424), Toonlight: Dark Mode for WEBTOON active.
Every page here is the **mobile site `m.webtoons.com`**, not `www.webtoons.com`.

These 11 screenshots are **examples, not a complete list**. The same patterns almost certainly
appear on other mobile pages that were not captured.

## The recurring patterns

| ID | Pattern | Why it matters |
|----|---------|----------------|
| P1 | **Light text left on a light background** — the theme lightened the text, but the container kept the site's white / light-grey background | Text becomes unreadable (worst bug) |
| P2 | **Whole blocks left unthemed** — white or light-grey sections inside an otherwise dark page | Glaring flash of white, theme looks broken |
| P3 | **Dark icon / dark text on a dark surface** — the reverse of P1 | Controls become invisible |
| P4 | **Inverted text hierarchy** — primary text dimmer than secondary text | Hard to scan |

Shared elements appear on almost every page (header, app-promo banner, footer, "Get the app" pill).
Fixing them once should clear most of the screenshots.

## Shared elements (seen on most pages)

| Element | Screenshots | Problem | Pattern |
|---------|-------------|---------|---------|
| Top header bar (WEBTOON logo, search, menu) | 01, 04, 05 | White background, unthemed | P2 |
| Series/viewer sub-header (home icon, Subscribe, ⓘ, ⋮) | 06, 07 | White bar; the ⓘ and ⋮ buttons sit in dark-grey boxes with dark icons — barely visible | P2, P3 |
| App-promo banner ("Get the latest stories made just for WEBTOON" + Download + characters) | 02, 04, 05, 07, 10, 11 | White block; the sentence is very light grey on white | P1, P2 |
| Footer (social icons, ABOUT / FEEDBACK / HELP / TERMS / PRIVACY / PERSONAL DATA / ADVERTISE / CONTACT) | 02, 04, 05, 07, 11 | Light-grey background; link text near-invisible | P1, P2 |
| Footer copyright "© NAVER WEBTOON Ltd." | 11 | Near-invisible | P1 |
| Floating "Get the app" pill | 01, 02, 03, 05, 06, 07, 10 | White pill; "Get the app" text very light grey | P1, P2 |
| Notice bar ("Notice \| WEBTOON is coming to NYCC!") | 07 | Light text on light-grey — invisible | P1 |
| "TOP" scroll button | 02, 07 | White circle (low priority) | P2 |

## Per-page findings

### 01-home-top.png — `m.webtoons.com/en`
- Header bar with logo/search/menu is white (P2).
- Tab bar (HOME / ORIGINALS / CANVAS / MY) and Trending/Popular grid are dark — these look correct.

### 02-home-bottom-footer.png — `m.webtoons.com/en` (scrolled)
- Promo banner, footer, "Get the app" pill: see shared elements.
- "More stories from indie creators" section is fine.

### 03-search.png — `m.webtoons.com/en/search`
- Trending Series: **titles** (Osora, Superfish, Tears on a Withered Flower…) are dim grey while the
  **genre labels** above them are white — hierarchy inverted, titles hard to read (P4/P1).
- Category buttons are bright white circles on the dark page (P2 — lower priority, but glaring).

### 04-more-menu.png / 05-more-menu-login-cta.png — `m.webtoons.com/en/more`
- The whole content area is light grey, unthemed (P2).
- Grid tile labels (CATEGORIES, NEW RELEASES, RANKINGS, SETTINGS, WEBTOON SHOP, PROMO CODE) are very
  light grey on white tiles — near-invisible (P1).
- 05: "Enter the world of **WEBTOON!**" — the word "WEBTOON!" is near-white on light grey, invisible (P1).
- 05: The green "Log In" button is fine.

### 06-series-page-top.png — series page (`/en/action/...`)
- Sub-header bar white; ⓘ and ⋮ buttons in dark boxes with dark icons (P2, P3).
- Cover, title, synopsis, tags, "Read Episode 1" are fine.

### 07-series-episode-list-footer.png — series page (scrolled)
- Episode list is fine.
- Promo banner, notice bar, footer: see shared elements.

### 08-viewer-creator-subscribe.png — episode viewer (`/en/action/.../viewer...`)
- The creator area under the last panel ("REDICE STUDIO" logo) sits on white. The logo is probably an
  image — **must not be inverted**; decide whether the white strip is the image or a container.
- The "+ Subscribe" pill is light grey with **near-white "Subscribe" text** — invisible (P1).
- "Top Comments", the comment cards and the bottom app banner are fine.

### 09-viewer-comments-bottom.png — episode viewer (scrolled to end)
- "Wanna access your favorite comics offline?" is **dark text on the dark background** — invisible (P3).
- The "TOP" strip above the episode thumbnails is light grey with an invisible "TOP" label (P1, P2).
- Comments, the green Download button and the bottom toolbar are fine.

### 10-login.png — `m.webtoons.com/member/login...`
- "Log in" header bar: white with light-grey title — near-invisible (P1, P2).
- The email (envelope) icon in "Continue with Email" is dark on dark (P3).
- "See other options" select has a white-ish outline box — check it still looks intentional.
- Promo banner and "Get the app" pill: see shared elements.

### 11-email-login.png — `m.webtoons.com/member/email...`
- "Email Login" header: white bar, light-grey title (P1, P2).
- "EMAIL ADDRESS" / "PASSWORD" label strips are light grey (P2); "Forgot Password?" is near-invisible (P1).
- The input fields and the Log In button are dark and fine.
- Footer and copyright: see shared elements.

## What looks correct (don't break it)
Tab bar, Trending/Popular grid, indie-creators row, series cover/synopsis/tags, episode list,
comment cards, social-login buttons, the inputs on the email login page, bottom viewer toolbar,
all comic panel images and thumbnails.
