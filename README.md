# Computer Use Benchmark

State-of-the-art models. State-of-the-printer: offline.

A Windows 95-inspired parody benchmark for frontier AI and ordinary humans. **All leaderboard results and incident reports are invented. No evaluations have been conducted.** Real model names are used satirically; scores and effort presets are not measured performance or documented API configurations.

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

The interactive scatter plot uses hand-authored fictional costs and scores. It marks the nondominated cost/score Pareto frontier. The leaderboard and plot share one invoice: compute, accidental subscription charges, and consumables are always included, including failed attempts. Triggered subscription charges count in full; consumables include paper, ink, power, and coffee. Labor and hardware are excluded. Two AI-assisted engineers share the leading completion and speed results; ranking uses the combined level-and-speed score followed by lowest total cost. Point selection shows an invoice breakdown; an accessible data table includes all values. This is parody data, not real model pricing or performance.

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

Company satire uses real company names and real model names with invented effort presets and results. 32 fictional AI entries span eight company parodies and four effort variants each, alongside four humans. All eight effort ladders include a regression. An invoice picker keeps crowded chart points accessible. The single cursed cost scale changes its mapping across three labeled segments. Full invoices and raw-data Pareto membership never change.

Six fictional executives and managers join the four other humans. Their luxury goods, travel, retreats, consulting purchases, and subscriptions count in full; salaries and hardware remain excluded. Management has a dedicated filter and purple diamond chart markers. The cost axis expands to fit every full invoice.

Each model family has a colored line connecting its four presets in increasing effort order. Lines follow the cursed axis transform; selecting a model highlights its series. The dashed green Pareto frontier remains separate.

The current ranking uses a 0–1000 errand score: 1000 × (completed levels / 5) / (1 + average attempt seconds / 120). Completion is weighted by elapsed time, so speed materially separates results; zero completion gives zero score. Chart and Pareto use this same score. The axis selector has been replaced by a continuous cost axis: linear $0–1, logarithmic $1–100, and normalized exponential above $100. All invoices remain fully included.

All human entries use job titles. Only the three hands-on engineers complete tasks; two use AI and one relies on archived documentation. Product and management entries receive no completion credit for delegation or generated plans. Eight humans use AI directly, with inference charges included in compute costs.

Printer and HDMI start with minimal controls and progressively disclose troubleshooting. Printer properties reveal document details; a crash reveals driver controls and diagnostics; diagnostics or a jam reveals hardware. HDMI reveals the cable drawer after Present, signal controls after connection, and audience verification after a successful handshake. Retry resets these reveals.

Le Chaton-fat, Le Chaton-slim, and Le Chaton-mid add three meme entries. Fat finishes in one second; slim and mid take longer and rank below other frontier models. The roster now contains 35 model configurations, three engineers, and seven management roles. Company icons are bundled from [Lobe Icons](https://github.com/lobehub/lobe-icons) with their license in `site/assets/companies/LICENSE`; pixel portraits are original SVG artwork.

## Model-name sources (checked 2026-10-01)

Names only are sourced here; benchmark scores, costs, and effort variants remain authored satire.

- [GPT-6.1 Sol](https://developers.openai.com/api/docs/models/gpt-6.1-sol)
- [Claude Opus 5.5](https://www.anthropic.com/claude/opus)
- [Gemini 4 Argon](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-argon/) — limited-access release.
- [Grok 4.7](https://docs.x.ai/developers/models)
- [Muse Spark 1.3](https://research.meta.ai/blog/introducing-muse-spark-1-3)
- [DeepSeek-V4-Pro](https://api-docs.deepseek.com/updates/)
- [Qwen3.8-Max](https://www.alibabacloud.com/en/press-room/alibaba-unveils-qwen3-8-max?_p_lc=1)
- [Mistral Medium 3.5](https://docs.mistral.ai/models/mistral-medium-3-5-26-04)

Le Chaton remains a separate meme entry, not a verified release.

Neuron column: all humans use a rounded whole-brain reference of ≈86B biological neurons ([Azevedo et al., 2009](https://pubmed.ncbi.nlm.nih.gov/19226510/)), never a job-dependent or individual measurement. AI counts use an explicitly hypothetical FFN-unit proxy: assumed total parameters × 0.8 / (3 × 8192). The assumptions are 80% FFN weights, gated three-matrix MLPs, and width 8192; attention units and token reuse are excluded. These are not biological equivalents or verified model architectures. The parameter scenarios (0.128–3.2T for frontier entries) are author assumptions, retained in `assumedParameters` and disclosed on hover. All effort variants share the same estimate. Le Chaton-fat dynamically gets exactly 1,000× the maximum non-Chaton model estimate (about 104.2B artificial units); slim and mid use 128B and 1T parameter scenarios. Table and chart share the count, and counts do not affect scoring.

## Bonus arcade

The original five environments remain the scored leaderboard suite. Three extra games are playable from the catalog and selector: Plug In a USB (orientation, dust, power, disguised executable), Save Past the Goose (peas, nest, bell, save), and Finish the Update (an intentionally unwinnable sandbox with endless phases and an End session button). Local wins count the seven solvable games only. All timers start on the first action; retry clears game state.
