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
