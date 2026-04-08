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

## 2026-04-08 18:30 EDT

### Feature / Work
- Tightened the RICE rubric and added a small brand accent for Monkey
- Updated the scoring workflow so `Reach`, `Impact`, and `Effort` use a governed `0-5` scale while `Confidence` stays on its percentage-style scale
- Added visible rubric guidance in the score panel and refined the cat logo placement so it supports the header without disrupting the title layout

### Value Provided
- Made the scoring model more trustworthy and easier for PMs to use consistently
- Prevented users from selecting invalid `0-5` values in the UI instead of relying only on backend validation
- Added a bit of product personality tied to Monkey while preserving the app’s visual hierarchy

### Files Changed
- `client/src/App.jsx`
- `client/src/styles.css`
- `server/src/index.js`
- `server/src/requestStore.js`
- `server/src/sampleRequests.js`

### Technical Architecture / Key Decisions
- Introduced explicit front-end scoring constraints for `Reach`, `Impact`, and `Effort` by switching them to controlled `0-5` selection fields
- Added backend validation for RICE field ranges so create/update requests reject out-of-range values
- Updated memory-mode sample data to match the new rubric so fallback behavior stays consistent with production behavior
- Kept `Confidence` on a separate `0-100` percentage-style scale rather than forcing it into the same rubric as the other inputs
- Moved the cat mark into the brand metadata row so the title keeps its intended width and wrapping

### Assumptions
- PMs want a simple, lightweight rubric and do not need fractional or raw-count reach values right now
- The production value of consistency is higher than the flexibility of free-entry RICE fields
- The cat brand mark should stay subtle and secondary to the product name

### Known Limitations
- Older Supabase rows with legacy `Reach` values above `5` may fail updates until they are normalized to the new rubric
- Direct API requests with non-numeric RICE payloads still may not get perfectly classified as validation errors in every edge case
- The app still does not define a deeper semantic rubric for what each score level means beyond the numeric range itself

### Key Learnings
- A scoring model only becomes trustworthy once the inputs are governed consistently in both the UI and backend
- Form-level constraints are usually better than free-entry validation warnings for lightweight workflow tools
- Decorative brand elements should support hierarchy, not take layout width away from the primary heading

### Remaining TODOs
- Normalize any legacy Supabase requests that still use pre-rubric `Reach` values
- Decide whether to add written guidance for what `0`, `1`, `3`, and `5` mean for each RICE category
- Consider whether `Confidence` should eventually become a dropdown too, or remain a numeric percentage field

### Next Steps
- Verify production behavior after Render redeploy
- Decide whether to clean or migrate any legacy rows in Supabase
- Continue with the next product refinement or workflow feature once the new rubric is stable
