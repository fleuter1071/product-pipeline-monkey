# Project Memory

## 2026-04-08 12:00 EDT

### Feature / Work
- Initial repository scaffold for `Product Pipeline Monkey`
- Defined the repo as a lightweight workflow app for product enhancement intake, RICE scoring, and quarterly roadmap placement

### Value Provided
- Established a clean starting point that matches the real product workflow instead of extending the older visual prototype
- Separated frontend and backend concerns early so the app can grow without a structural reset

### Files Changed
- `AGENTS.md`
- `PROJECT_MEMORY.md`
- `README.md`
- `.gitignore`
- `package.json`
- `client/package.json`
- `client/index.html`
- `client/src/main.jsx`
- `client/src/App.jsx`
- `client/src/styles.css`
- `server/package.json`
- `server/src/index.js`
- `server/.env.example`

### Technical Architecture / Key Decisions
- Use one repo with `client/` and `server/` folders
- Plan for React on the frontend and Express on the backend
- Plan for Supabase/Postgres for both development and production environments
- Keep the v1 feature set focused on intake, scoring, and roadmap placement

### Assumptions
- One primary PM user and lightweight internal usage for v1
- No authentication or multi-team workflow in the initial release
- The first build should optimize for clarity and maintainability over completeness

### Known Limitations
- This is scaffold-only; no live database integration yet
- No installed dependencies yet
- No production configuration yet

### Key Learnings
- The new product needs a stronger record-based workflow model than `Sorting Fun`
- Repo structure and deployment structure should stay separate in decision-making
- Using the same database family in dev and prod avoids avoidable migration friction

### Remaining TODOs
- Add client and server dependencies
- Implement the request data model and API routes
- Build the intake form, inbox, scoring view, and roadmap view
- Add Supabase integration and environment wiring

### Next Steps
- Install dependencies
- Build the initial API and UI skeleton
- Connect the app to a Supabase development project

## 2026-04-08 16:55 EDT

### Feature / Work
- Implemented the first real Product Pipeline Monkey workflow milestone
- Replaced the initial placeholder client with the real app shell: sidebar navigation, Inbox, Submit Request, request detail/RICE scoring, and Roadmap views
- Added archive/restore behavior as a quiet maintenance action in the detail panel
- Wired the app to a real backend/API path and connected the backend to Supabase

### Value Provided
- The product is now a real workflow app rather than a visual scaffold
- Requests can be created, loaded, updated, planned, archived, and restored through a persistent database-backed flow
- The UX is now strong enough to evaluate the real product workflow, not just the concept

### Files Changed
- `client/src/App.jsx`
- `client/src/styles.css`
- `client/src/api.js`
- `server/package.json`
- `server/.env.example`
- `server/src/index.js`
- `server/src/requestStore.js`
- `server/src/sampleRequests.js`
- `server/supabase-schema.sql`
- `package-lock.json`

### Technical Architecture / Key Decisions
- Kept one repo with `client/` and `server/`
- Added a server-side request store abstraction so the API can use Supabase when credentials exist and fall back to in-memory data otherwise
- Standardized the request model across client, API, and database:
  - `submitterPriority`
  - `riceScore`
  - `placement`
  - `status`
  - `isArchived`
- Chose archive over delete for v1 to preserve workflow history and reduce accidental data loss
- Added a SQL schema file for the Supabase `requests` table
- Kept the backend as the source of truth so the frontend no longer owns persistent workflow state

### Assumptions
- v1 remains single-team and lightweight
- Archive is sufficient for now and permanent delete is not needed yet
- PMs will use a simple numeric RICE model before a stricter scoring rubric is introduced

### Known Limitations
- No authentication yet
- No comments, collaboration, or notifications
- No permanent delete flow
- RICE scoring still accepts flexible numeric inputs rather than a governed rubric
- The backend `.env` is local-only and not represented in source control

### Key Learnings
- The workflow became much clearer once the detail panel was treated as the primary decision surface
- Archive needed to be a contextual detail action rather than a list-level control to avoid UI clutter
- A real backend/data path changes the quality bar for UX review because the interface starts feeling truthful instead of simulated
- When switching from fallback memory mode to Supabase, restarting the backend process matters because environment changes do not apply to already-running servers

### Remaining TODOs
- Decide whether to clean up test rows currently in Supabase
- Add a stronger RICE scoring rubric and helper guidance
- Consider richer filters/sorting once real request volume grows
- Decide on the next deployment step for this new app

### Next Steps
- Push project memory update to GitHub
- Optionally clean up Supabase test data
- Prepare Render deployment or continue product refinement
