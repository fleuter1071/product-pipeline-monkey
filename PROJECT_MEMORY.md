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

## 2026-04-08 20:27 EDT

### Feature / Work
- Extended the latest planning milestone by making the roadmap directly editable
- Tightened the RICE rubric in the product experience and then improved the roadmap so PMs can reassign quarter/backlog placement without leaving the roadmap view
- Added a subtle Monkey-inspired cat brand mark to the sidebar header and refined its placement after an initial layout issue

### Value Provided
- The roadmap now behaves like a real planning surface instead of a mostly read-only visibility board
- PMs can reschedule work in context, which removes an unnecessary jump back to Inbox and keeps planning flow intact
- The scoring model is now more governed and consistent, which improves trust in the RICE process
- The app keeps a bit more product personality without compromising the visual hierarchy

### Files Changed
- `client/src/App.jsx`
- `client/src/styles.css`
- `server/src/index.js`
- `server/src/requestStore.js`
- `server/src/sampleRequests.js`

### Technical Architecture / Key Decisions
- Constrained `Reach`, `Impact`, and `Effort` to a `0-5` rubric in the client UI and validated the same ranges in the backend
- Kept `Confidence` on its separate `0-100` percentage-style scale
- Added a visible scoring guidance block in the score panel so the rubric is part of the workflow, not hidden knowledge
- Refactored request updates in the client so roadmap cards can update placement inline through the existing API path
- Chose an inline `Move to` selector on roadmap cards instead of drag-and-drop for a lighter, clearer v1 planning interaction
- Moved the cat brand mark into the metadata row above the title after the first version disrupted the title wrapping

### Assumptions
- PMs prefer simple, governed scoring inputs over flexible free-entry values for most RICE fields
- Roadmap placement changes are frequent enough that they should happen directly from the roadmap view
- A compact inline selector is a better v1 control than drag-and-drop for clarity and reliability

### Known Limitations
- Existing Supabase rows with legacy `Reach` values above `5` may still need normalization to avoid validation conflicts on future edits
- The roadmap placement save state is still a bit broader than ideal because the app uses a global `isSaving` flag
- `Confidence` remains numeric rather than a governed option set, so the overall rubric is still partially flexible
- The cat brand mark is intentionally subtle; if the product branding grows later, it may deserve a more formal asset

### Key Learnings
- A view that represents a planning decision should usually let the user make that decision there
- Governing scoring inputs at the form level is better than only validating them at save time
- Decorative brand accents should support the hierarchy and may need iteration after seeing them in the real layout
- Inline controls can add real workflow value without clutter when they are scoped tightly and kept secondary to the main content

### Remaining TODOs
- Normalize any legacy Supabase requests that still use pre-rubric `Reach` values
- Decide whether to tighten the `Confidence` rubric further
- Consider whether the roadmap inline move control should get a more local loading state instead of relying on the broader save state
- Continue refining planning ergonomics and decide the next workflow feature to prioritize

### Next Steps
- Verify the latest Render deployment behavior in production
- Clean up or migrate any legacy Supabase rows if validation issues appear
- Continue product refinement with the next planning, scoring, or filtering improvement

## 2026-04-08 20:55 EDT

### Feature / Work
- Made the core request intake fields editable from the request detail view
- Added editing support for request title, request description, and submitter name directly in the PM workspace
- Updated the save action copy to better match the broader responsibility of the detail panel

### Value Provided
- PMs can now clean up and refine request quality without leaving the evaluation workflow
- The detail panel is more complete as the main decision surface because it now supports both intake refinement and scoring/planning work
- Reduced friction in the real product-management flow by avoiding separate edit steps for basic request metadata

### Files Changed
- `client/src/App.jsx`
- `client/src/styles.css`

### Technical Architecture / Key Decisions
- Reused the existing client-side request update flow instead of introducing a separate edit mode or separate save endpoint
- Kept title, description, and submitter name inside the detail panel so request refinement stays close to scoring and placement decisions
- Renamed the button from `Save score` to `Save changes` because the save action now persists broader request edits
- Preserved the existing backend API path, so this was a UI/workflow expansion rather than a data-model change

### Assumptions
- PMs are expected to clean up request wording and metadata as part of evaluation
- It is acceptable for `Place on roadmap` to continue persisting the current edited request state as part of the same save path
- Request priority remains requester-owned in this flow, so only title, description, and submitter name were added to the editable set

### Known Limitations
- `Save changes` and `Place on roadmap` still overlap a bit in meaning because both persist current request edits
- No separate unsaved-changes indicator exists yet in the detail panel
- Submitter priority is still not directly editable from the detail panel

### Key Learnings
- If the detail panel is the main PM workspace, it should support lightweight intake cleanup as well as scoring
- Reusing an existing save path is often the simplest way to expand workflow capability without creating extra state complexity
- Button labels need to evolve when the scope of an action expands, or the UI starts misleading users

### Remaining TODOs
- Decide whether submitter priority should also become editable in the detail panel
- Consider whether the detail panel needs an explicit unsaved-changes cue
- Revisit the split between `Save changes` and `Place on roadmap` if users find the overlap confusing

### Next Steps
- Verify the production deployment behavior for the new editable request fields
- Decide whether to extend editability to submitter priority or keep that field requester-owned
- Continue refining PM ergonomics in the detail workspace

## 2026-04-09 13:20 EDT

### Feature / Work
- Extended the PM workspace by making core request intake fields editable
- Simplified the topbar/header treatment across Submit, Inbox, and Roadmap by removing low-value helper text
- Shipped both changes to production after targeted QA passes

### Value Provided
- PMs can now refine request quality directly in the detail view instead of treating the original intake copy as fixed
- The detail panel is a more complete evaluation surface because it supports request cleanup, scoring, planning, and archiving in one place
- The app header is now quieter and less repetitive, which makes the main workspace feel more focused

### Files Changed
- `client/src/App.jsx`
- `client/src/styles.css`

### Technical Architecture / Key Decisions
- Reused the existing client update path so title, description, and submitter name edits persist through the same API flow as scoring and placement
- Renamed the save action from `Save score` to `Save changes` because the detail view now saves broader request updates
- Kept the change client-side only because the backend request model already supported these fields
- Removed low-information helper copy from the topbar rather than replacing it with new text, based on the decision that the views were self-explanatory enough without extra narration

### Assumptions
- PMs should be able to clean up request metadata as part of evaluation
- Extra header explanation was adding more reading load than value at this stage of the product
- Inbox and Roadmap counts remain useful enough to keep, while the submit-view helper metrics were not

### Known Limitations
- `Save changes` and `Place on roadmap` still overlap in meaning because both persist the current request state
- Submitter priority is still not editable from the detail panel
- The header now depends mostly on titles and metrics for orientation, so future complexity should be watched to avoid reintroducing clutter elsewhere

### Key Learnings
- If the detail panel is the primary PM workspace, it should support both evaluation and lightweight request cleanup
- Header copy often feels useful while building, but once the workflow is clear it can become visual noise
- Simplifying by removal is often better than replacing one explanatory sentence with another

### Remaining TODOs
- Decide whether submitter priority should become editable in the detail view
- Consider whether the detail panel needs an unsaved-changes indicator
- Revisit the overlap between `Save changes` and `Place on roadmap` if it starts confusing users

### Next Steps
- Confirm the latest Render deployment looks right in production
- Keep refining PM workflow ergonomics based on real usage
- Prioritize the next workflow improvement or data/UX refinement
