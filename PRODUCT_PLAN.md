# Product Pipeline Monkey Plan

## Product Intent

Product Pipeline Monkey is a lightweight workflow app for taking product enhancement requests from intake through scoring and roadmap placement.

The product is meant to support a simple, practical PM workflow:

1. A requester submits a product enhancement and gives it a priority
2. Product management evaluates the request using a RICE score
3. Product places the enhancement into a roadmap quarter or backlog

The app should feel like a clear decision-making workspace, not a sticky-note toy and not a heavy enterprise planning tool.

## Original V1 Product Shape

### Core Workflow

1. Submit
- requester adds:
  - title
  - description
  - submitter name
  - submitter priority

2. Score
- PM reviews request and adds:
  - reach
  - impact
  - confidence
  - effort
  - PM notes
- app calculates `RICE = (Reach x Impact x Confidence) / Effort`

3. Plan
- PM assigns request to:
  - `Q1`
  - `Q2`
  - `Q3`
  - `Q4`
  - `Backlog`

### Core Product Concepts

These are intentionally separate:

- `submitterPriority`: what the requester thinks
- `riceScore`: what product calculates
- `placement`: where the request lands
- `status`: where the request sits in the workflow
- `isArchived`: whether it has been retired from the active workflow

### Status Model

- `submitted`
- `scored`
- `planned`

### Placement Model

- `unassigned`
- `q1`
- `q2`
- `q3`
- `q4`
- `backlog`

## Current UX Direction

### Design Intent

The app should feel:
- calm
- structured
- warm-neutral
- editorial but practical

### Layout Model

Desktop:
- left sidebar navigation
- main content area with view-specific panels

Primary views:
- `Inbox`
- `Roadmap`
- `Submit request`

### UX Principles

- Inbox should optimize for scan speed
- Detail panel should be the main evaluation surface
- Roadmap should optimize for planning visibility
- Archive should stay a quiet maintenance action, not a primary workflow action

## Current Implemented Product Behavior

As of the latest milestone, the app supports:

- request submission
- inbox list with filters
- request detail panel
- RICE scoring inputs
- live score updates
- roadmap placement
- archive and restore
- roadmap view by quarter and backlog
- Supabase-backed persistence through the backend API

## Current Technical Architecture

### Repo Structure

- `client/` = React frontend
- `server/` = Express backend

### Infrastructure Model

- GitHub = source control
- Render = hosting
- Supabase = database

### Backend/Data Flow

Frontend -> Express API -> Supabase

The frontend no longer owns persistent workflow state.

### Important Files

- `client/src/App.jsx`
- `client/src/styles.css`
- `client/src/api.js`
- `server/src/index.js`
- `server/src/requestStore.js`
- `server/src/sampleRequests.js`
- `server/supabase-schema.sql`
- `render.yaml`
- `PROJECT_MEMORY.md`

## Supabase Notes

The `requests` table schema is defined in:
- `server/supabase-schema.sql`

The backend uses:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_REQUESTS_TABLE`

Important:
- the service role key must remain backend-only
- do not expose it to the client
- do not commit the real `.env`

## Render Notes

The repo has a Render Blueprint:
- `render.yaml`

It defines:
- `product-pipeline-monkey-api` as the backend service
- `product-pipeline-monkey` as the frontend static site

The frontend expects the backend service URL to remain:
- `https://product-pipeline-monkey-api.onrender.com`

If the backend Render service name changes, update the frontend API base URL in `render.yaml`.

## Important Product Decisions Already Made

### 1. New app instead of extending Sorting Fun

Reason:
- this product is a structured workflow system, not just a visual prioritization surface

### 2. One repo with `client/` and `server/`

Reason:
- simpler for a solo builder
- clean separation without multi-repo overhead

### 3. Supabase for real persistence

Reason:
- this app is record-based and needs a real source of truth
- better long-term fit than staying local-only

### 4. Archive over delete for v1

Reason:
- safer workflow behavior
- preserves history
- reduces accidental loss

## Current Known Limitations

- no authentication
- no collaboration or comments
- no notifications
- no permanent delete flow
- no formal RICE rubric yet
- no advanced sorting/filtering beyond the current basics

## Recommended Next Steps

### Best likely next product steps

1. Introduce a clearer RICE scoring rubric
- especially for `Reach`
- current numeric fields are flexible but not governed

2. Improve filtering/sorting
- sort by RICE score
- sort by created date
- filter more cleanly by active vs archived

3. Add request detail polish
- stronger PM review ergonomics
- clearer save state or unsaved-state cues if needed

4. Consider lightweight status visibility improvements
- make it easier to understand what is new vs already evaluated

5. Decide whether to add delete later
- likely keep archive as default
- delete only if there is a strong user need

## QA / Continuity Notes

Recent milestone included:
- Supabase-backed create/read/update behavior
- archive workflow
- roadmap polish
- archive-count bug fix

Key bug lesson already discovered:
- archived requests should not count toward active `submitted`, `scored`, or `planned` totals

Key environment lesson already discovered:
- if backend env vars change, restart the backend process
- old running server instances will continue using old config until restarted

## How To Pick Up Quickly Next Time

1. Read:
- `PRODUCT_PLAN.md`
- `PROJECT_MEMORY.md`
- `README.md`

2. Confirm:
- backend is running
- client is running
- backend `/health` reports the expected storage mode

3. Review current app behavior in:
- Inbox
- Detail scoring panel
- Roadmap

4. Decide whether the next task is:
- product feature work
- design polish
- data/model refinement
- deployment/configuration

## Durable Product Lesson

The core success of this app depends on preserving a clean separation between:
- what the requester wants
- how product evaluates it
- where product plans it
- whether it is still active

That separation is what keeps the workflow trustworthy as the app grows.
