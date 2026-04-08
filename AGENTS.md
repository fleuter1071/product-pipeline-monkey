# Product Pipeline Monkey

## Repo Intent
This repo is for a lightweight product workflow app that supports:
- request submission with submitter priority
- PM RICE scoring
- roadmap placement into a quarter or backlog

## Structure
- `client/` contains the React frontend
- `server/` contains the API and data-access layer

## Working Defaults
- Keep the v1 intentionally lightweight
- Prefer simple CRUD and workflow transitions over advanced collaboration features
- Treat `submitterPriority`, `riceScore`, `placement`, and `status` as separate concepts

## New Repo Files
- Keep `PROJECT_MEMORY.md` current after meaningful milestones
