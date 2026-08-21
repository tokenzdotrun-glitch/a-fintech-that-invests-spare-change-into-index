# 🌱 Sprout — Invest Your Spare Change

Sprout is a fintech demo that automatically **rounds up your everyday purchases**
and invests the spare change into a **diversified basket of low-cost index funds**.
Small change, serious long-term growth.

Built with **Vite + React + TypeScript + Tailwind CSS**. It runs entirely in the
browser and persists to `localStorage` — no backend or real money involved.

## Features

- **Round-ups on autopilot** — every purchase rounds up to the next dollar
  (with a 1×–10× multiplier) and auto-invests once it crosses the threshold.
- **Index-fund portfolios** — Conservative, Moderate, Aggressive and Sustainable
  plans, each a weighted blend of real-world-style index funds (VTI, VXUS, BND, …).
- **Live dashboard** — total balance, all-time gain, an interactive value chart
  with 1W/1M/3M/ALL ranges, and weekly round-up stats.
- **Activity feed** — filterable spending + round-ups, plus a full investment log
  (round-ups, recurring deposits, one-time boosts, bonuses).
- **Portfolio breakdown** — allocation donut, holdings table, blended fees, and
  fund detail cards.
- **Growth projections** — an interactive compound-growth calculator with a
  likely-range band, plus one-time investment boosts.
- **Realistic simulation** — new accounts are seeded with ~4 months of believable
  history so the dashboard is alive from the first second. Everything is driven by
  a deterministic, seeded market-return model.

## Getting started

```bash
npm install
npm run dev        # start the dev server
npm run build      # type-check + production build
```

## Single-file preview

A fully self-contained `index.html` (all JS/CSS inlined, zero external requests)
can be produced with:

```bash
npm run build:preview   # emits dist-single/index.html
```

## Disclaimer

Sprout is a demonstration. All balances, returns and projections are **simulated**
and are **not** financial advice.
