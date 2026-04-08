import React, { useEffect, useMemo, useState } from "react";
import { createRequest, fetchRequests, updateRequest } from "./api";

const submitterPriorityOptions = ["Very High", "High", "Medium", "Low"];
const statusOptions = ["submitted", "scored", "planned"];
const placementOptions = ["unassigned", "q1", "q2", "q3", "q4", "backlog"];
const roadmapColumns = ["q1", "q2", "q3", "q4", "backlog"];
const roadmapDescriptions = {
  q1: "Committed soonest",
  q2: "Next planning horizon",
  q3: "Later candidate work",
  q4: "Future roadmap bets",
  backlog: "Held without commitment",
};

const initialDraft = {
  title: "",
  description: "",
  submitterName: "",
  submitterPriority: "High",
};

const navigation = [
  { id: "inbox", label: "Inbox", description: "Review incoming requests" },
  { id: "roadmap", label: "Roadmap", description: "See planned work by quarter" },
  { id: "submit", label: "Submit request", description: "Capture a new enhancement" },
];

function formatStatus(status) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatPlacement(placement) {
  if (placement === "unassigned") return "Unassigned";
  if (placement === "backlog") return "Backlog";
  return placement.toUpperCase();
}

function formatDate(value) {
  if (!value) return "Unknown";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function computeRiceScore({ reach, impact, confidence, effort }) {
  if (!reach || !impact || !confidence || !effort) return null;
  const score = (reach * impact * confidence) / 100 / effort;
  return Math.round(score * 10) / 10;
}

function todayStamp() {
  return new Date().toISOString().slice(0, 10);
}

function priorityClass(priority) {
  return priority.toLowerCase().replace(/\s+/g, "-");
}

export default function App() {
  const [currentView, setCurrentView] = useState("inbox");
  const [requests, setRequests] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [filters, setFilters] = useState({
    status: "all",
    placement: "all",
    priority: "all",
    includeArchived: false,
  });
  const [draft, setDraft] = useState(initialDraft);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [apiError, setApiError] = useState("");

  const selectedRequest =
    requests.find((request) => request.id === selectedId) ?? requests[0] ?? null;

  useEffect(() => {
    let isMounted = true;

    async function loadRequests() {
      try {
        setIsLoading(true);
        const items = await fetchRequests();

        if (!isMounted) return;

        setRequests(items);
        setSelectedId((current) => current ?? items[0]?.id ?? null);
        setApiError("");
      } catch (error) {
        if (!isMounted) return;
        setApiError(error.message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadRequests();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!requests.length) {
      setSelectedId(null);
      return;
    }

    if (!requests.some((request) => request.id === selectedId)) {
      setSelectedId(requests[0].id);
    }
  }, [requests, selectedId]);

  const filteredRequests = useMemo(
    () =>
      requests.filter((request) => {
        if (!filters.includeArchived && request.isArchived) return false;
        if (filters.status !== "all" && request.status !== filters.status) return false;
        if (filters.placement !== "all" && request.placement !== filters.placement) return false;
        if (filters.priority !== "all" && request.submitterPriority !== filters.priority) {
          return false;
        }
        return true;
      }),
    [filters, requests],
  );

  const roadmapItems = useMemo(
    () =>
      roadmapColumns.reduce((grouped, column) => {
        grouped[column] = requests.filter(
          (request) => request.placement === column && !request.isArchived,
        );
        return grouped;
      }, {}),
    [requests],
  );

  function handleDraftChange(event) {
    const { name, value } = event.target;
    setDraft((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmitRequest(event) {
    event.preventDefault();
    try {
      setIsSaving(true);
      const nextRequest = await createRequest({
        title: draft.title.trim(),
        description: draft.description.trim(),
        submitterName: draft.submitterName.trim(),
        submitterPriority: draft.submitterPriority,
      });

      setRequests((current) => [nextRequest, ...current]);
      setSelectedId(nextRequest.id);
      setCurrentView("inbox");
      setDraft(initialDraft);
      setApiError("");
    } catch (error) {
      setApiError(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  function handleSelectRequest(id) {
    setSelectedId(id);
    setCurrentView("inbox");
  }

  function handleRequestFieldChange(field, value) {
    setRequests((current) =>
      current.map((request) => {
        if (request.id !== selectedId) return request;

        const updatedRequest = { ...request, [field]: value, updatedAt: todayStamp() };
        updatedRequest.riceScore = computeRiceScore(updatedRequest);

        if (
          updatedRequest.reach &&
          updatedRequest.impact &&
          updatedRequest.confidence &&
          updatedRequest.effort &&
          updatedRequest.status === "submitted"
        ) {
          updatedRequest.status = "scored";
        }

        return updatedRequest;
      }),
    );
  }

  async function persistSelectedRequest(overrides = {}, options = {}) {
    if (!selectedRequest) return null;

    const payload = {
      ...selectedRequest,
      ...overrides,
      updatedAt: todayStamp(),
    };

    try {
      setIsSaving(true);
      const updatedItem = await updateRequest(selectedRequest.id, payload);
      setRequests((current) =>
        current.map((request) => (request.id === updatedItem.id ? updatedItem : request)),
      );
      setApiError("");
      return updatedItem;
    } catch (error) {
      setApiError(error.message);
      if (!options.silent) {
        throw error;
      }
      return null;
    } finally {
      setIsSaving(false);
    }
  }

  async function handleScoreSave() {
    if (!selectedRequest) return;

    const nextStatus =
      selectedRequest.reach &&
      selectedRequest.impact &&
      selectedRequest.confidence &&
      selectedRequest.effort
        ? selectedRequest.placement === "unassigned"
          ? "scored"
          : "planned"
        : selectedRequest.status;

    await persistSelectedRequest({
      riceScore: computeRiceScore(selectedRequest),
      status: nextStatus,
    });
  }

  async function handlePlacementPlace() {
    if (!selectedRequest || selectedRequest.placement === "unassigned") return;

    const updatedItem = await persistSelectedRequest({
      status: "planned",
    });

    if (updatedItem) {
      setCurrentView("roadmap");
    }
  }

  async function handleArchiveToggle() {
    if (!selectedRequest) return;

    const updatedItem = await persistSelectedRequest(
      {
        isArchived: !selectedRequest.isArchived,
      },
      { silent: true },
    );

    if (!updatedItem) return;

    if (updatedItem.isArchived) {
      const nextVisibleRequest = requests.find(
        (request) => request.id !== updatedItem.id && !request.isArchived,
      );
      setSelectedId(nextVisibleRequest?.id ?? null);
    }
  }

  const submittedCount = requests.filter(
    (request) => request.status === "submitted" && !request.isArchived,
  ).length;
  const scoredCount = requests.filter(
    (request) => request.status === "scored" && !request.isArchived,
  ).length;
  const plannedCount = requests.filter(
    (request) => request.status === "planned" && !request.isArchived,
  ).length;
  const roadmapCount = requests.filter(
    (request) => !request.isArchived && request.placement !== "unassigned",
  ).length;
  const backlogCount = requests.filter(
    (request) => !request.isArchived && request.placement === "backlog",
  ).length;
  const canPlaceSelectedRequest =
    selectedRequest && selectedRequest.placement !== "unassigned";
  const visibleInboxCount = filteredRequests.length;

  return (
    <div className="workspace-shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">Product planning workspace</p>
          <h1>Product Pipeline Monkey</h1>
          <p className="sidebar-copy">
            Move enhancement ideas from intake to scoring to roadmap decisions without losing context.
          </p>
        </div>

        <nav className="nav-list" aria-label="Primary">
          {navigation.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                type="button"
                key={item.id}
                className={`nav-item${isActive ? " is-active" : ""}`}
                onClick={() => setCurrentView(item.id)}
              >
                <span className="nav-title">{item.label}</span>
                <span className="nav-description">{item.description}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-summary">
          <div className="summary-card">
            <span className="summary-label">Submitted</span>
            <strong>{submittedCount}</strong>
          </div>
          <div className="summary-card">
            <span className="summary-label">Scored</span>
            <strong>{scoredCount}</strong>
          </div>
          <div className="summary-card">
            <span className="summary-label">Planned</span>
            <strong>{plannedCount}</strong>
          </div>
        </div>
      </aside>

      <main className="main-shell">
        <header className="topbar">
          <div>
            <p className="eyebrow">
              {currentView === "submit" ? "Capture" : currentView === "roadmap" ? "Planning" : "Inbox"}
            </p>
            <h2>
              {currentView === "submit"
                ? "Submit request"
                : currentView === "roadmap"
                ? "Quarterly roadmap"
                  : "Inbox"}
            </h2>
          </div>
          <div className="topbar-side">
            <div className="topbar-note">
              {currentView === "submit"
                ? "New requests start as submitted and unassigned so product can evaluate them later."
                : currentView === "roadmap"
                  ? "Use the roadmap as a visibility layer for planned work and backlog decisions."
                  : "Review requests, score them, and place them with confidence."}
            </div>
            <div className="topbar-metrics">
              {currentView === "submit" ? (
                <>
                  <span className="mini-metric">
                    <strong>1</strong>
                    <span>Quick intake form</span>
                  </span>
                  <span className="mini-metric">
                    <strong>PM</strong>
                    <span>Notes supported later</span>
                  </span>
                </>
              ) : null}

              {currentView === "inbox" ? (
                <>
                  <span className="mini-metric">
                    <strong>{submittedCount}</strong>
                    <span>Submitted</span>
                  </span>
                  <span className="mini-metric">
                    <strong>{scoredCount}</strong>
                    <span>Scored</span>
                  </span>
                  <span className="mini-metric">
                    <strong>{plannedCount}</strong>
                    <span>Planned</span>
                  </span>
                </>
              ) : null}

              {currentView === "roadmap" ? (
                <>
                  <span className="mini-metric">
                    <strong>{roadmapCount}</strong>
                    <span>Placed</span>
                  </span>
                  <span className="mini-metric">
                    <strong>{backlogCount}</strong>
                    <span>Backlog</span>
                  </span>
                </>
              ) : null}
            </div>
          </div>
        </header>

        {apiError ? <div className="api-banner">{apiError}</div> : null}

        {currentView === "submit" ? (
          <section className="submit-layout">
            <article className="submit-panel">
              <div className="panel-header">
                <p className="panel-label">New enhancement</p>
                <h3>Capture a request in one quick form</h3>
              </div>
              <form className="request-form" onSubmit={handleSubmitRequest}>
                <label className="field">
                  <span>Title</span>
                  <input
                    name="title"
                    value={draft.title}
                    onChange={handleDraftChange}
                    placeholder="Ex: Add self-serve export of roadmap decisions"
                    required
                  />
                </label>
                <label className="field">
                  <span>Description</span>
                  <textarea
                    name="description"
                    value={draft.description}
                    onChange={handleDraftChange}
                    placeholder="Summarize the problem, user need, and why it matters."
                    rows="6"
                    required
                  />
                </label>
                <div className="field-row">
                  <label className="field">
                    <span>Submitter name</span>
                    <input
                      name="submitterName"
                      value={draft.submitterName}
                      onChange={handleDraftChange}
                      placeholder="Ex: Rachel Kim"
                      required
                    />
                  </label>
                  <label className="field">
                    <span>Submitter priority</span>
                    <select
                      name="submitterPriority"
                      value={draft.submitterPriority}
                      onChange={handleDraftChange}
                    >
                      {submitterPriorityOptions.map((option) => (
                        <option value={option} key={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="form-actions">
                  <button type="submit" className="primary-button" disabled={isSaving}>
                    Submit request
                  </button>
                </div>
              </form>
            </article>

            <article className="support-panel">
              <div className="panel-header">
                <p className="panel-label">What happens next</p>
                <h3>Requests move through a simple product workflow</h3>
              </div>
              <ol className="timeline-list">
                <li>
                  <strong>Submitted</strong>
                  <span>The request lands in the inbox with the submitter&apos;s urgency signal.</span>
                </li>
                <li>
                  <strong>Scored</strong>
                  <span>Product adds RICE inputs and captures PM notes for context.</span>
                </li>
                <li>
                  <strong>Planned</strong>
                  <span>The request is placed into a quarter or backlog when ready.</span>
                </li>
              </ol>
            </article>
          </section>
        ) : null}

        {currentView === "inbox" ? (
          <section className="inbox-layout">
            <article className="list-panel">
              <div className="panel-header">
                <p className="panel-label">Request queue</p>
                <h3>Scan incoming work and pick the next request to evaluate</h3>
              </div>
              <div className="filter-row">
                <label className="filter-field">
                  <span>Status</span>
                  <select
                    value={filters.status}
                    onChange={(event) =>
                      setFilters((current) => ({ ...current, status: event.target.value }))
                    }
                  >
                    <option value="all">All</option>
                    {statusOptions.map((option) => (
                      <option value={option} key={option}>
                        {formatStatus(option)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="filter-field">
                  <span>Placement</span>
                  <select
                    value={filters.placement}
                    onChange={(event) =>
                      setFilters((current) => ({ ...current, placement: event.target.value }))
                    }
                  >
                    <option value="all">All</option>
                    {placementOptions.map((option) => (
                      <option value={option} key={option}>
                        {formatPlacement(option)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="filter-field">
                  <span>Submitter priority</span>
                  <select
                    value={filters.priority}
                    onChange={(event) =>
                      setFilters((current) => ({ ...current, priority: event.target.value }))
                    }
                  >
                    <option value="all">All</option>
                    {submitterPriorityOptions.map((option) => (
                      <option value={option} key={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="list-toolbar">
                <span className="toolbar-count">{visibleInboxCount} requests shown</span>
                <label className="toggle-field">
                  <input
                    type="checkbox"
                    checked={filters.includeArchived}
                    onChange={(event) =>
                      setFilters((current) => ({
                        ...current,
                        includeArchived: event.target.checked,
                      }))
                    }
                  />
                  <span>Show archived</span>
                </label>
              </div>
              {isLoading ? <div className="loading-state">Loading requests...</div> : null}
              <div className="request-list" role="list">
                {filteredRequests.map((request) => {
                  const isSelected = request.id === selectedId;
                  return (
                    <button
                      type="button"
                      key={request.id}
                      className={`request-row${isSelected ? " is-selected" : ""}`}
                      onClick={() => handleSelectRequest(request.id)}
                    >
                      <div className="row-heading">
                        <strong>{request.title}</strong>
                        {request.riceScore ? <span className="score-pill">{request.riceScore}</span> : null}
                      </div>
                      <p className="request-snippet">{request.description}</p>
                      <div className="row-meta">
                        <span>{request.submitterName}</span>
                        <span className={`priority-pill ${priorityClass(request.submitterPriority)}`}>
                          {request.submitterPriority}
                        </span>
                        <span className="status-pill">{formatStatus(request.status)}</span>
                        <span>{formatPlacement(request.placement)}</span>
                        {request.isArchived ? (
                          <span className="status-pill status-pill-muted">Archived</span>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
                {!isLoading && !filteredRequests.length ? (
                  <div className="empty-state">
                    <h3>No requests match these filters</h3>
                    <p>Try changing the filters or submit a new request.</p>
                  </div>
                ) : null}
              </div>
            </article>

            <article className="detail-panel">
              {selectedRequest ? (
                <>
                  <div className="panel-header">
                    <p className="panel-label">Request detail</p>
                    <h3>{selectedRequest.title}</h3>
                    <div className="detail-subhead">
                      <span>Submitted {formatDate(selectedRequest.createdAt)}</span>
                      <span>Last updated {formatDate(selectedRequest.updatedAt)}</span>
                    </div>
                  </div>
                  <div className="detail-grid">
                    <section className="detail-section">
                      <div className="meta-grid">
                        <div>
                          <span className="meta-label">Submitter</span>
                          <strong>{selectedRequest.submitterName}</strong>
                        </div>
                        <div>
                          <span className="meta-label">Priority</span>
                          <span className={`priority-pill ${priorityClass(selectedRequest.submitterPriority)}`}>
                            {selectedRequest.submitterPriority}
                          </span>
                        </div>
                        <div>
                          <span className="meta-label">Status</span>
                          <span className="status-pill">{formatStatus(selectedRequest.status)}</span>
                        </div>
                        <div>
                          <span className="meta-label">Placement</span>
                          <strong>{formatPlacement(selectedRequest.placement)}</strong>
                        </div>
                        <div>
                          <span className="meta-label">Lifecycle</span>
                          <span
                            className={`status-pill${
                              selectedRequest.isArchived ? " status-pill-muted" : ""
                            }`}
                          >
                            {selectedRequest.isArchived ? "Archived" : "Active"}
                          </span>
                        </div>
                      </div>

                      <div className="content-block">
                        <span className="meta-label">Description</span>
                        <p>{selectedRequest.description}</p>
                      </div>

                      <label className="field">
                        <span>PM notes</span>
                        <textarea
                          rows="6"
                          value={selectedRequest.notes}
                          onChange={(event) => handleRequestFieldChange("notes", event.target.value)}
                          placeholder="Capture evaluation notes, tradeoffs, or context for later roadmap review."
                        />
                      </label>
                    </section>

                    <section className="score-panel">
                      <div className="score-shell">
                        <div className="score-header">
                          <span className="meta-label">RICE score</span>
                          <strong>{selectedRequest.riceScore ?? "Not scored yet"}</strong>
                        </div>
                        <div className="score-grid">
                          {[
                            ["reach", "Reach"],
                            ["impact", "Impact"],
                            ["confidence", "Confidence"],
                            ["effort", "Effort"],
                          ].map(([field, label]) => (
                            <label className="field" key={field}>
                              <span>{label}</span>
                              <input
                                type="number"
                                min="0"
                                step="0.1"
                                value={selectedRequest[field] ?? ""}
                                onChange={(event) =>
                                  handleRequestFieldChange(
                                    field,
                                    event.target.value === "" ? null : Number(event.target.value),
                                  )
                                }
                              />
                            </label>
                          ))}
                        </div>
                        <label className="field">
                          <span>Placement</span>
                          <select
                            value={selectedRequest.placement}
                            onChange={(event) => handleRequestFieldChange("placement", event.target.value)}
                          >
                            {placementOptions.map((option) => (
                              <option value={option} key={option}>
                                {formatPlacement(option)}
                              </option>
                            ))}
                          </select>
                        </label>
                        <p className="field-help">
                          Choose Q1, Q2, Q3, Q4, or Backlog before placing this request on the roadmap.
                        </p>
                        <div className="form-actions score-actions">
                          <button
                            type="button"
                            className="secondary-button"
                            onClick={handleScoreSave}
                            disabled={isSaving}
                          >
                            Save score
                          </button>
                          <button
                            type="button"
                            className="secondary-button subtle-button"
                            onClick={handleArchiveToggle}
                            disabled={isSaving}
                          >
                            {selectedRequest.isArchived ? "Restore request" : "Archive request"}
                          </button>
                          <button
                            type="button"
                            className="primary-button"
                            onClick={handlePlacementPlace}
                            disabled={!canPlaceSelectedRequest || isSaving}
                          >
                            Place on roadmap
                          </button>
                        </div>
                      </div>
                    </section>
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  <h3>No requests yet</h3>
                  <p>Submit the first enhancement request to start the workflow.</p>
                </div>
              )}
            </article>
          </section>
        ) : null}

        {currentView === "roadmap" ? (
          <section className="roadmap-layout">
            <article className="roadmap-hero">
              <div>
                <p className="panel-label">Roadmap view</p>
                <h3>See what is committed now and what stays in backlog</h3>
              </div>
              <p>
                In v1, planning happens from the request detail view. This board is for visibility and quick review.
              </p>
            </article>
            <div className="roadmap-summary">
              <span className="roadmap-summary-pill">
                <strong>{roadmapCount}</strong>
                <span>Placed requests</span>
              </span>
              <span className="roadmap-summary-pill">
                <strong>{backlogCount}</strong>
                <span>Backlog items</span>
              </span>
              <span className="roadmap-summary-pill">
                <strong>{plannedCount}</strong>
                <span>Planned total</span>
              </span>
            </div>
            <div className="roadmap-grid">
              {roadmapColumns.map((column) => (
                <section className={`roadmap-column roadmap-column-${column}`} key={column}>
                  <header className="roadmap-column-header">
                    <div className="roadmap-column-titles">
                      <strong>{formatPlacement(column)}</strong>
                      <span>{roadmapDescriptions[column]}</span>
                    </div>
                    <span className="roadmap-count">{roadmapItems[column].length}</span>
                  </header>
                  <div className="roadmap-cards">
                    {roadmapItems[column].length ? (
                      roadmapItems[column].map((request) => (
                        <button
                          type="button"
                          className="roadmap-card"
                          key={request.id}
                          onClick={() => handleSelectRequest(request.id)}
                        >
                          <strong>{request.title}</strong>
                          <p className="request-snippet roadmap-snippet">{request.description}</p>
                          <div className="row-meta">
                            <span className={`priority-pill ${priorityClass(request.submitterPriority)}`}>
                              {request.submitterPriority}
                            </span>
                            {request.riceScore ? <span className="score-pill">{request.riceScore}</span> : null}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="roadmap-empty">
                        <strong>Nothing here yet</strong>
                        <span>
                          Assign a request to {formatPlacement(column)} from the detail panel to populate this lane.
                        </span>
                      </div>
                    )}
                  </div>
                </section>
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
