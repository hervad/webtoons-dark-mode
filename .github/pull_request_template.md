## What and why

<!-- What the change does, which pages it affects, and what looked wrong before. -->

## Screenshots

<!-- Before / after, for any visual change. -->

## Checklist

- [ ] Tested on the pages it touches, with the theme on and off (Alt + Shift + T)
- [ ] Every override has `!important`, and the comment above a new rule says why it exists
- [ ] No new page-level `:has()` gates or `[class*=]` patterns where a plain class works (see CONTRIBUTING.md)
- [ ] `@version` and the `VERSION` constant are left alone (the maintainer bumps them on release)
