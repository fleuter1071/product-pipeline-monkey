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

## 2026-04-12 00:00 EDT

### Feature / Work
- Added permanent delete for requests from the detail panel
- Introduced a confirmation modal before deletion
- Shipped a small detail-panel polish by hiding the scoring-rubric copy and reducing the visible RICE score size
- Ran a QA pass and pushed the delete milestone to production

### Value Provided
- PMs can now fully remove unwanted, duplicate, or test requests regardless of status, roadmap placement, or archive state
- The request detail panel now supports the full maintenance workflow: edit, score, place, archive, restore, and delete
- The destructive action is available without cluttering inbox rows or roadmap cards
- The score panel feels more balanced visually and less dominated by the score value itself

### Files Changed
- `client/src/App.jsx`
- `client/src/api.js`
- `client/src/styles.css`
- `server/src/index.js`
- `server/src/requestStore.js`

### Technical Architecture / Key Decisions
- Added a new backend `DELETE /api/requests/:id` route and wired both the Supabase store and memory fallback store to support permanent deletion
- Added a client-side `deleteRequest` API helper instead of overloading archive behavior, keeping archive and delete as separate lifecycle concepts
- Surfaced `Delete request` only in the detail view and styled it as a quiet destructive action, with the real visual emphasis happening in the confirmation modal
- Kept delete out of inbox rows and roadmap cards so the primary planning surfaces stay focused and uncluttered
- Reused the existing request selection model after deletion by automatically moving focus to the next remaining request when available

### Assumptions
- Permanent delete is a legitimate product need for duplicates, testing artifacts, and truly unwanted requests
- Delete should be available regardless of whether a request is active, archived, or already planned
- A confirmation modal provides sufficient safety for an irreversible action in this v1 workflow
- It is acceptable for post-delete selection to choose from the full request set rather than the currently filtered visible list for now

### Known Limitations
- If filters are active, the next selected request after deletion may come from the full request list rather than the currently visible filtered subset
- The confirmation modal does not yet implement explicit keyboard escape handling or focus trapping
- Delete is permanent; there is no undo or soft-delete recovery path once confirmed

### Key Learnings
- Destructive actions should stay contextual and low-emphasis until the exact moment of confirmation
- Archive and delete serve different product needs: archive preserves history, while delete removes noise permanently
- A planning app benefits from keeping maintenance actions in the detail workspace instead of spreading them across list and board views
- Small typography adjustments in dense decision panels can noticeably improve balance without changing product behavior

### Remaining TODOs
- Consider improving post-delete selection so it respects the current filtered inbox view
- Decide whether the confirmation modal needs stronger accessibility support such as escape-to-close and focus management
- Evaluate whether delete should later support an undo pattern or remain permanently destructive

### Next Steps
- Confirm the Render deployment looks correct in production with the new delete flow
- Watch for any confusion between archive and delete in real usage
- Continue refining PM workflow ergonomics, especially around destructive and maintenance actions

## 2026-04-12 00:00 EDT

### Feature / Work
- Added a lightweight Delivery section to the request detail view
- Extended the request model with execution-tracking fields
- Refined the Delivery panel layout to use a compact summary strip, single-column primary fields, and a bottom accordion for secondary context
- Ran QA, applied the required Supabase schema update, and pushed the feature to production

### Value Provided
- The app now supports lightweight execution tracking in the same place where PMs already score and plan work
- PMs can capture who owns delivery, what state execution is in, what the target date is, and whether anything is blocked
- The delivery panel adds “command center” flavor without turning the page into a crowded operations dashboard
- The bottom accordion pattern keeps richer delivery context available without forcing it on the user by default

### Files Changed
- `client/src/App.jsx`
- `client/src/styles.css`
- `server/src/index.js`
- `server/src/requestStore.js`
- `server/src/sampleRequests.js`
- `server/supabase-schema.sql`

### Technical Architecture / Key Decisions
- Extended the flat `requests` data model rather than introducing a separate initiative or delivery entity, keeping the change lightweight
- Added new delivery fields end to end across client state, backend request mapping, sample fallback data, and Supabase schema
- Kept the Delivery section as a secondary panel below scoring so the right-column hierarchy remains: planning first, execution second
- Used progressive disclosure: summary strip first, core editable delivery fields second, and secondary context/checklist behind an accordion
- Tightened validation lightly on the backend for `deliveryStatus` and `targetDate` so saved delivery data stays structurally coherent
- Updated the schema file with `alter table ... add column if not exists ...` so the migration could be applied safely to the existing production table

### Assumptions
- A lightweight execution layer is more useful right now than a full initiative/workstream re-architecture
- Delivery signals are most valuable in the detail view first; Inbox and Roadmap do not need to surface them yet
- The new delivery fields can live on the existing request record without causing conceptual overload for the current product stage
- It is acceptable to keep using the existing `Save changes` flow rather than introducing a separate delivery save action

### Known Limitations
- Delivery state is currently only visible in the request detail view, not summarized yet in Inbox or Roadmap
- The new feature required a Supabase schema update; if environments drift later, delivery saves could fail until schemas are aligned
- The panel is intentionally modest and does not yet support linked dependencies, workstreams, or automated updates
- The accordion state is local UI state only and resets when a different request is selected

### Key Learnings
- New workflow depth is easier to absorb when added as a new visual tier rather than more fields mixed into existing panels
- Side-panel components need side-panel layout rules; wide dashboard patterns break quickly when squeezed into a narrower column
- A summary-first pattern is one of the best ways to add operational detail without overwhelming users
- Database schema changes are part of feature completion whenever new persistent fields are introduced

### Remaining TODOs
- Consider surfacing a small subset of delivery signals in Inbox and/or Roadmap later, such as blocked state or owner
- Decide whether the Delivery section needs further polish around target date formatting or blocker visibility
- Revisit whether any delivery fields should become required later once real usage patterns are clearer
- Continue monitoring whether the current request-based model is enough or whether a future initiative layer becomes necessary

### Next Steps
- Confirm the production Delivery section looks correct after the Render redeploy
- Watch how often PMs actually use the expanded secondary delivery context
- Decide whether the next delivery-oriented improvement should be better status visibility elsewhere or a modest decision/risk surfacing enhancement

## 2026-05-03 00:00 EDT

### Feature / Work
- Improved Inbox orientation and selected-state clarity
- Added Roadmap drag-and-drop so requests can move directly between Q1, Q2, Q3, Q4, and Backlog
- Removed the always-visible Roadmap `Move to` dropdown from each card body and replaced it with a compact fallback move control
- Fixed long Roadmap card title/description overflow so cards stay inside their columns
- Ran QA, built the client, and pushed the Roadmap milestone to GitHub `main`

### Value Provided
- The Inbox now makes the relationship clearer between the selected request in the queue and the detail panel on the right
- The Roadmap now behaves more like a real planning board instead of a read-only board with form controls inside every card
- PMs can reschedule work spatially by dragging cards across planning horizons
- Roadmap cards are more compact and easier to scan because the visible dropdown no longer consumes vertical space
- Long titles and descriptions are contained inside their cards, preventing cross-column visual overlap

### Files Changed
- `client/src/App.jsx`
- `client/src/styles.css`

### Technical Architecture / Key Decisions
- Kept the change frontend-only and reused the existing request update path
- Used the existing `placement` field for Roadmap movement instead of adding a new data model
- Added local drag state in `App.jsx` with `draggedRequestId` and `activeDropColumn`
- Added native browser drag-and-drop handlers for Roadmap cards and columns
- Kept a compact fallback move select for keyboard/mobile/non-drag usage
- Separated the Roadmap card's open-detail action from the fallback move select so the card remains keyboard-friendly
- Added CSS containment rules such as `min-width: 0`, `overflow-wrap: anywhere`, and `word-break: break-word` to prevent long text overflow in narrow columns

### Assumptions
- Desktop users will prefer dragging cards between quarters/backlog for planning work
- Mobile and keyboard users still need a fallback move control because drag-and-drop alone is not enough
- The existing backend update behavior is sufficient for persisting Roadmap placement changes
- Render production deploys from GitHub `main` when auto-deploy is enabled

### Known Limitations
- Native drag-and-drop behavior can vary slightly across browsers and devices
- The fallback move select is intentionally subtle on desktop and may need further polish if users do not discover it
- There is no automated browser drag-and-drop test coverage yet
- Roadmap card movement still depends on the existing global `isSaving` state rather than a fully local per-card save state

### Key Learnings
- Planning surfaces should let users make planning changes directly where they see the plan
- Always-visible per-card controls can make a board feel crowded and form-like; progressive disclosure keeps scan speed higher
- Narrow grid cards need explicit text containment rules so long product titles do not bleed into adjacent columns
- When adding drag-and-drop, keeping a fallback control protects accessibility and mobile usability

### Remaining TODOs
- Manually verify production after Render finishes deploying from commit `bcd1b9d`
- Consider adding a clearer drag affordance or onboarding hint if users do not discover drag-and-drop naturally
- Consider a more local saving indicator for individual Roadmap card moves
- Consider automated interaction coverage for Roadmap movement later

### Next Steps
- Confirm the production Roadmap page shows compact cards, clean wrapping, and drag/drop movement
- Test moving a card between Q4 and Backlog in production and refresh to confirm persistence
- Continue refining Roadmap card density and delivery/status signals once real planning usage is observed
