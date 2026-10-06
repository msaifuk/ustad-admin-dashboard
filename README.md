# Ustad — Admin Dashboard

Web dashboard for operating **Ustad**, a home-services marketplace for Pakistan. It gives the admin a live view of the platform: workers, customers, bookings and revenue.

## Demo

- Demo video: _add link here_
- Screenshot: _add `screenshots/dashboard.png`_

## What it shows

- **Stat cards:** total workers, total customers, total bookings, completed, pending, and total revenue
- **Recent bookings table:** customer, service, assigned worker, amount, and status
- **Workers table:** name, trade, level badge (Hunarmand to Legend), completed jobs, average rating, and online status
- Refresh button and live indicator

## Tech stack

- React (Create React App)
- Fetches data from the Ustad REST API (Node.js / Express / PostgreSQL on Railway; separate private repo)

## Project structure

```
src/
  App.js
  pages/Dashboard.js
  utils/api.js          API base URL (the Railway backend)
```

## Run locally

```bash
npm install
npm start
```

The dashboard opens at `http://localhost:3000` and reads from the production API configured in `src/utils/api.js`. Change `BASE_URL` there to use a local backend.

## Build for production

```bash
npm run build
```

## Current limitations

- Read-only: the admin cannot yet verify workers or edit bookings from the dashboard
- No admin login screen yet
- Single dashboard page

## Related repositories

- [ustad-customer-app](https://github.com/msaifuk/ustad-customer-app) — app for customers
- [ustad-worker-app](https://github.com/msaifuk/ustad-worker-app) — app for tradespeople
- ustad-backend — Node.js API (private; available on request)

Built by [@msaifuk](https://github.com/msaifuk).
