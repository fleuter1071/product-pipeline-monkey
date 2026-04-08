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

## Render Deployment

This repo includes a Render Blueprint in [render.yaml](C:\Users\dougs\product-pipeline-monkey\render.yaml).

### What the Blueprint Creates

- `product-pipeline-monkey-api` as the backend web service
- `product-pipeline-monkey` as the frontend static site

### Required Render Environment Variables

For the backend service, set:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_REQUESTS_TABLE=requests`

### Deployment Flow

1. In Render, choose `New +`
2. Select `Blueprint`
3. Connect the `product-pipeline-monkey` GitHub repo
4. Let Render read `render.yaml`
5. Fill in the missing Supabase environment variables for the backend
6. Deploy both services

### Important Note

The frontend blueprint points to:

- `https://product-pipeline-monkey-api.onrender.com`

If you rename the backend service in Render, update the frontend `VITE_API_BASE_URL` value in `render.yaml` to match.
