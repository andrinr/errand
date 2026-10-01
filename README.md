# Humanity’s Last Errand

Passed the bar exam. Failed to print the certificate.

A Windows 95-inspired parody benchmark for frontier AI and ordinary humans. **All leaderboard results and incident reports are invented. No evaluations have been conducted.** Model names are fictional archetypes, not claims about real products.

## Website

https://andrinr.github.io/errand/

The static site lives in `site/`: no build step, external fonts, dependencies, analytics, or backend. Serve that folder with any static web server. For example, `python3 -m http.server 8000 --directory site`.

Includes a filterable fictional leaderboard, eight incident reports, and eight playable mini-games inspired by interactive reasoning benchmarks. Unaffiliated with ARC Prize or ARC-AGI-3.

## Games

1. **Just Print It:** close multiplying error windows, then print.
2. **Cancel My Gym:** survive six deliberately confusing cancellation steps.
3. **Present Your Screen:** move a cable slowly and stop inside a narrow socket.
4. **Stop the Emails:** clear every checkbox and catch a moving Save button.
5. **Return the Parcel:** hold to dispatch a painfully slow parcel. Cursed mode gives you 8 seconds for a minimum 25-second journey, making it deliberately impossible.
6. **Make It One Page:** click tiny paragraph marks; misses add pages and reset progress.
7. **Find the Attachment:** inspect nearly identical files to find Linda’s approved version.
8. **Fix the Blue Screen:** enter recovery, disable three conflicting settings, clear a recovery error, and restart past the 99% progress stall. Cursed mode re-enables settings and gives you 28 seconds.

**Cursed office** is intentionally frustrating and sometimes impossible. **Practice** gives 60 seconds, larger targets or fewer obstacles, and a solvable version of every task. All games have timers, action counts, retries, and session-only completion tracking. Closing or changing the game stops its active loop. Nothing touches real printers, accounts, memberships, or files.

## Publishing

GitHub Actions deploys `site/` to GitHub Pages on pushes to `main` or a manual workflow run. Repository Pages settings must use **GitHub Actions** as the build source.

## Editing

- `site/index.html`: page structure and methodology
- `site/style.css`: responsive retro desktop styling
- `site/app.js`: fictional participants, task catalog, and page interactions
- `site/games.js`: eight games, timers, difficulty modes, and session scoring

## Future real benchmark

Real evaluation would need reproducible environments, permitted actions, fixed time limits, repeated trials, verified outcomes, documented model versions, and separate human baselines. None of those exist yet. Synthetic results must remain labeled until replaced by measured data.
