# Humanity’s Last Errand

Passed the bar exam. Failed to print the certificate.

A Windows 95-inspired parody benchmark for frontier AI and ordinary humans. **All leaderboard results and incident reports are invented. No evaluations have been conducted.** Model names are fictional archetypes, not claims about real products.

## Website

https://andrinr.github.io/errand/

The static site lives in `site/`: no build step, runtime dependencies, external fonts, analytics, or backend. The optional development test suite uses jsdom. Serve that folder with any static web server. For example, `python3 -m http.server 8000 --directory site`.

Includes a filterable fictional leaderboard, eight incident reports, and eight playable mini-games inspired by interactive reasoning benchmarks. Unaffiliated with ARC Prize or ARC-AGI-3.

## Games

1. **Just Print It:** match the sticky note’s exact settings, avoid PDF and remote printers, clear multiplying errors, and watch the paper emerge.
2. **Cancel My Gym:** reject a pause and retention offers, read renewal checkboxes, then hold to confirm cancellation.
3. **Present Your Screen:** align the cable with the right socket, choose HDMI 2, and duplicate instead of extending the display.
4. **Stop the Emails:** turn off recommendation sabotage, interpret negative wording, chase Save, and avoid the final double-negative trap.
5. **Return the Parcel:** choose the return address, stamp the label, and use the conveyor. “Express” delivers it back to you. Cursed mode deliberately gives only 8 seconds for at least 25 seconds of transit.
6. **Make It One Page:** reveal formatting, remove a page break, shrink the table’s mandatory paragraph, and undo accidental content deletion.
7. **Find the Attachment:** compare approver, version, page count, and file type against Linda’s note. Names and “APPROVED” badges can lie.
8. **Fix the Blue Screen:** a four-stage adventure with a desk to search, collectible items, item-use puzzles, a boot code, a driver vault, a clue notebook, and a final update trap.

Games load immediately. **The clock starts on the first game action**, including selecting an option or collecting an item. There is no separate Start screen. Retry and switching games prepare a new attempt without starting the timer. Hints and optional sound controls do not start it.

**Cursed office** adds tighter timers, interruptions, and the deliberately impossible parcel deadline. **Practice** gives 120 seconds and fewer interruptions. All games have a solvable Practice path. The blue-screen adventure also gets 120 seconds in Cursed mode. All other Cursed limits are 60–65 seconds, except the eight-second parcel.

Shared feedback includes optional synthesized sound, animated errors, progress bars, shaking mistakes, trap/action counts, hints, receipts, and next-game navigation. Wins are tracked separately per difficulty for the current page visit. No real printers, accounts, memberships, files, or operating-system settings are touched.

## Validation

Run `npm ci` then `npm test`. The tests use an isolated DOM and controlled animation clock to exercise all eight win paths, selected traps, hold/release behavior, inventory gates, timer arming, retries, closing, and separate scores. Run `npm run check` for JavaScript syntax checks. No test dependencies are shipped with the site.

## Publishing

GitHub Actions deploys `site/` to GitHub Pages on pushes to `main` or a manual workflow run. Repository Pages settings must use **GitHub Actions** as the build source.

## Editing

- `site/index.html`: page structure and methodology
- `site/style.css`: responsive retro desktop styling
- `site/app.js`: fictional participants, task catalog, and page interactions
- `site/games.js`: eight games, timers, difficulty modes, and session scoring

## Future real benchmark

Real evaluation would need reproducible environments, permitted actions, fixed time limits, repeated trials, verified outcomes, documented model versions, and separate human baselines. None of those exist yet. Synthetic results must remain labeled until replaced by measured data.
