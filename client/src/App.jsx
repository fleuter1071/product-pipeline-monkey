const workflowSteps = [
  {
    id: "submit",
    label: "Submit",
    title: "Capture product requests",
    description:
      "Requesters add an enhancement title, description, and their own urgency signal.",
  },
  {
    id: "score",
    label: "Score",
    title: "Apply RICE consistently",
    description:
      "Product management reviews the request, enters RICE inputs, and saves the calculated score.",
  },
  {
    id: "plan",
    label: "Plan",
    title: "Place work on the roadmap",
    description:
      "Planned items move into Q1 through Q4, while lower-priority work can stay in backlog.",
  },
];

const statuses = ["Submitted", "Scored", "Planned"];
const placements = ["Unassigned", "Q1", "Q2", "Q3", "Q4", "Backlog"];

export default function App() {
  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">Lightweight product workflow</p>
        <h1>Product Pipeline Monkey</h1>
        <p className="hero-copy">
          Take enhancement ideas from request intake through scoring and quarterly roadmap placement.
        </p>
      </section>

      <section className="workflow-grid" aria-label="Core workflow">
        {workflowSteps.map((step, index) => (
          <article className="workflow-card" key={step.id}>
            <span className="step-chip">
              {index + 1}. {step.label}
            </span>
            <h2>{step.title}</h2>
            <p>{step.description}</p>
          </article>
        ))}
      </section>

      <section className="overview-grid">
        <article className="panel">
          <div className="panel-header">
            <p className="panel-label">Workflow states</p>
            <h2>Requests move through clear product decisions</h2>
          </div>
          <div className="token-row">
            {statuses.map((status) => (
              <span className="token" key={status}>
                {status}
              </span>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <p className="panel-label">Roadmap outcomes</p>
            <h2>Every request ends up on a roadmap or in backlog</h2>
          </div>
          <div className="token-row">
            {placements.map((placement) => (
              <span className="token token-muted" key={placement}>
                {placement}
              </span>
            ))}
          </div>
        </article>
      </section>

      <section className="notes-panel">
        <p className="panel-label">V1 focus</p>
        <ul>
          <li>Request submission form</li>
          <li>Inbox list</li>
          <li>Request detail with RICE scoring</li>
          <li>Quarterly roadmap placement</li>
          <li>PM notes field for evaluation context</li>
        </ul>
      </section>
    </main>
  );
}
