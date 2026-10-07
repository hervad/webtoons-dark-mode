# Accessibility

The theme aims to make WEBTOON comfortable to read for as many people as possible, in a dark room and with a keyboard, a screen reader or system accessibility settings.

## What it does

- **Contrast:** main and secondary text, the labels on green buttons and the keyboard focus ring meet WCAG 2.2 AA (4.5:1 for text, 3:1 for focus indicators and controls). The colours are checked against every surface the theme uses.
- **Keyboard:** a visible focus ring on links, buttons and form fields, which the site itself doesn't provide. Menus and popups the theme restyles keep the site's keyboard behaviour.
- **Reduced motion:** with "reduce motion" on in your system, the theme's own hover lifts, zooms and animations are switched off. The site's own timing is never changed, so nothing breaks.
- **High contrast / forced colours:** under Windows High Contrast the theme switches itself off, so your system colours apply.
- **Screen readers:** the theme changes only how the page looks. Text the site hides for screen readers stays available, the synopsis fold-out button has a label in the page's language and reports whether it's open, and the comic panels and their alt text are untouched.
- **Reading comfort:** larger, brighter text in comments and episode lists, and an optional reader dim (`Alt + Shift + N`) that lowers only the comic panels' brightness.

## Known limitations

- The comic panels are shown exactly as published; the theme can't add text descriptions the site doesn't provide.
- Webtoons sometimes changes its pages, which can leave an area in the light theme or with low contrast until the theme is updated.
- On `m.webtoons.com` the top bar keeps the site's own light look.
- Pages that need a login (account, coin and creator dashboard pages) are tested less often than public pages.

## Reporting a barrier

If something is hard to read or use, please [open an issue](https://github.com/hervad/webtoons-dark-mode/issues/new/choose) with the page URL, what you use (browser, screen reader, system settings) and, if you can, a screenshot. Accessibility problems are treated as bugs.
