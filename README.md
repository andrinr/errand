# Humanity’s Last Errand

State-of-the-art models. State-of-the-printer: offline.

A Windows 95-inspired parody benchmark for frontier AI and ordinary humans. **All leaderboard results and incident reports are invented. No evaluations have been conducted.** Model names are fictional archetypes, not claims about real products.

## Website

https://andrinr.github.io/errand/

The static site lives in `site/`: no build step, runtime dependencies, external fonts, analytics, or backend. The optional development test suite uses jsdom. Serve that folder with any static web server. For example, `python3 -m http.server 8000 --directory site`.

Includes a filterable fictional leaderboard, eight incident reports, and five playable mini-games inspired by interactive reasoning benchmarks. Unaffiliated with ARC Prize or ARC-AGI-3.

## Games

1. **Just Print It:** match the sticky note’s exact settings, avoid PDF and remote printers, diagnose misleading driver settings, recover a crash loop, clear a physical jam, release the held job with a PIN, and collect the page.
2. **Present Your Screen:** explore the cable drawer, identify a directional powered adapter, route HDMI 2, and negotiate native 1080p/60/RGB. Automatic input switching can steal the signal; changes invalidate the handshake. Open the shutter, duplicate the display, calibrate four corners without overscan, and share the correct slide without frozen frames or notifications. Sleeping the source or accepting a driver update requires recovery. Both modes allow 120 seconds, starting on the first action.
3. **Stop the Emails:** turn off recommendation sabotage, interpret negative wording, chase Save, avoid the double-negative trap, locate the confirmation email in Spam, and apply the change account-wide.
4. **Fix the Blue Screen:** a four-stage adventure with a desk to search, collectible items, item-use puzzles, a boot code, a driver vault, a clue notebook, and a final update trap.
5. **Remove the Virus:** a complete simulated desktop with draggable/minimizable windows, Start menu, taskbar, process management, startup persistence, disguised executables, fake antivirus alerts, quarantine, and a final verification scan. All processes and files are fictional.

Games load immediately. **The clock starts on the first game action**, including selecting an option or collecting an item. There is no separate Start screen. Retry and switching games prepare a new attempt without starting the timer. Hints and optional sound controls do not start it.

**Cursed office** adds tighter timers and interruptions: 75 seconds for printer and email, 120 for HDMI and the blue-screen adventure, and 150 for the infected desktop. **Practice** gives 120 seconds (180 for the infected desktop) and fewer interruptions. Every game is solvable in both modes.

Shared feedback includes optional synthesized sound, animated errors, progress bars, shaking mistakes, trap/action counts, hints, receipts, and next-game navigation. Wins are tracked separately per difficulty for the current page visit. No real printers, accounts, files, or operating-system settings are touched.

## Cost vs. performance

The interactive scatter plot uses hand-authored fictional costs and scores. It marks the nondominated cost/score Pareto frontier. The leaderboard and plot share one invoice: compute, accidental subscription charges, and consumables are always included, including failed attempts. Triggered subscription charges count in full; consumables include paper, ink, power, and coffee. Labor and hardware are excluded. Fictional AI participants complete more tasks than every human participant; ranking uses the combined level-and-speed score followed by lowest total cost. Point selection shows an invoice breakdown; an accessible data table includes all values. This is parody data, not real model pricing or performance.

## Validation

Run `npm ci` then `npm test`. The tests use an isolated DOM and controlled animation clock to exercise all five win paths, selected traps, inventory gates, timer arming, retries, closing, and separate scores. Run `npm run check` for JavaScript syntax checks. No test dependencies are shipped with the site.

## Publishing

GitHub Actions deploys `site/` to GitHub Pages on pushes to `main` or a manual workflow run. Repository Pages settings must use **GitHub Actions** as the build source.

## Editing

- `site/index.html`: page structure and methodology
- `site/style.css`: responsive retro desktop styling
- `site/app.js`: fictional participants, task catalog, and page interactions
- `site/games.js`: five games, timers, difficulty modes, and session scoring
- `site/chart.js`: synthetic cost plot, invoices, and Pareto-frontier calculation

## Future real benchmark

Real evaluation would need reproducible environments, permitted actions, fixed time limits, repeated trials, verified outcomes, documented model versions, and separate human baselines. None of those exist yet. Synthetic results must remain labeled until replaced by measured data.

Company satire uses real company names with explicitly invented model names, effort presets, and results. 32 fictional AI entries span eight company parodies and four effort variants each, alongside four humans. All eight effort ladders include a regression. An invoice picker keeps crowded chart points accessible. The single cursed cost scale changes its mapping across three labeled segments. Full invoices and raw-data Pareto membership never change.

Six fictional executives and managers join the four other humans. Their luxury goods, travel, retreats, consulting purchases, and subscriptions count in full; salaries and hardware remain excluded. Management has a dedicated filter and purple diamond chart markers. The cost axis expands to fit every full invoice.

Each model family has a colored line connecting its four presets in increasing effort order. Lines follow the cursed axis transform; selecting a model highlights its series. The dashed green Pareto frontier remains separate.

The current ranking uses a 0–1000 errand score: 180 × completed levels + (levels / 5) × 100 / (1 + average attempt seconds / 120). Speed separates equal completion counts; zero completion gives zero score. Chart and Pareto use this same score. The axis selector has been replaced by a continuous cost axis: linear $0–1, logarithmic $1–100, and normalized exponential above $100. All invoices remain fully included.
