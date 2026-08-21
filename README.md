# Acol — invest your spare change

Acol is a fintech demo that automatically rounds up your everyday purchases to
the nearest dollar and invests the spare change into a diversified mix of
low‑cost index funds.

Built with **Vite + React + TypeScript + Tailwind CSS**. All data is simulated
and persisted locally in your browser (`localStorage`) — no backend required.

## Features

- **Round-up engine** — every purchase is rounded up (with a 1×–10× multiplier)
  and the spare change accumulates in a wallet.
- **Automatic investing** — once the wallet crosses a threshold it's swept into
  your portfolio; toggle auto-invest or invest on demand.
- **Index-fund portfolios** — Conservative, Moderate, and Aggressive mixes of
  US total market, international, bonds, and real-estate index funds.
- **Live-simulated prices** — deterministic price series drive holdings values,
  per-fund returns, and sparklines.
- **Dashboard** — portfolio value, all-time gain, money-weighted (Modified
  Dietz) period returns, allocation donut, and recent activity.
- **Growth projections** — compound-interest projections with adjustable monthly
  contribution and time horizon, including a low/expected/high band.
- **Simulate purchases** — add random or custom transactions to watch round-ups
  flow into the portfolio.

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check + production build
```

### Single-file preview

```bash
npm run build:preview   # emits a fully self-contained dist-preview/index.html
```

## Disclaimer

Balances, prices, and returns are simulated for illustration only and are not
investment advice.
