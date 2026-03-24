# Accessibility Notes

This file documents the current accessibility approach for the site and is intended for maintainers.

## Goals

- Improve usability for keyboard, screen reader, zoom, and mobile users.
- Use WCAG as a guide for ongoing improvements.
- Avoid making blanket compliance claims that the codebase or testing process cannot fully support.

## Current patterns in the site

- Skip links are available near the top of pages.
- Core pages use semantic landmarks such as `nav` and `main`.
- Interactive elements have visible focus styles.
- The mobile navigation exposes `aria-expanded` and is kept in sync with its visual state.
- Informative images include `alt` text.
- Decorative icons are hidden from assistive technology where appropriate.
- The recent-projects modal uses dialog semantics and keyboard support.
- The embedded Google Form includes a descriptive `title`.
- CSS respects `prefers-reduced-motion` and includes additional support for higher-contrast preferences where available.

## Important limitations

- Automated checks are helpful, but they are not proof of WCAG or ADA compliance.
- Third-party embeds, including Google Forms, may introduce behavior we do not fully control.
- Color contrast, screen reader announcements, focus order, and keyboard interaction still need manual verification after significant design changes.

## Development helper

`accessibility-checker.js` is now a lightweight development helper only.

- It runs automatically on `localhost`, `127.0.0.1`, or `file:` URLs.
- It can also be enabled manually with the `?a11y-debug=1` query parameter.
- It reports only simple heuristics in the browser console.
- It should not be described as a full accessibility audit.

## Recommended review checklist

- Tab through each page and confirm skip links, navigation, forms, and dialogs behave correctly.
- Verify all meaningful images and iframes have appropriate accessible text.
- Confirm headings are in a logical order.
- Check focus visibility on desktop and mobile breakpoints.
- Review the embedded form experience and provide an alternate contact method.
- Re-test after any layout, color, navigation, or content changes.
