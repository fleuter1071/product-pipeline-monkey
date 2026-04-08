# Product Pipeline Monkey

Product Pipeline Monkey is a lightweight workflow app for turning product enhancement requests into roadmap decisions.

## V1 Workflow

1. A requester submits an enhancement and gives it a priority
2. Product management adds RICE inputs and calculates a score
3. Product places the enhancement into `Q1`, `Q2`, `Q3`, `Q4`, or `Backlog`

## Repo Structure

- `client/` React frontend
- `server/` Express API

## Product Model

Each request keeps these concepts separate:
- `submitterPriority`: what the requester thinks
- `riceScore`: what product calculates
- `placement`: where the work lands
- `status`: where the request sits in the workflow

## Planned Stack

- Frontend: React + Vite
- Backend: Express
- Database: Supabase Postgres
- Hosting: GitHub + Render + Supabase

## Local Development

The app is scaffolded but dependencies are not installed yet.

Once dependencies are installed, the expected commands will be:

```bash
npm install
npm run dev:client
npm run dev:server
```

## Initial Build Priorities

1. Request submission form
2. Inbox view
3. Request detail with RICE scoring
4. Roadmap placement view
