import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRequest, deleteRequest, fetchRequests, updateRequest } from "./api";

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
const riceFieldConfig = {
  reach: { label: "Reach", type: "scale" },
  impact: { label: "Impact", type: "scale" },
  confidence: { label: "Confidence", min: 0, max: 100, step: 5 },
  effort: { label: "Effort", type: "scale" },
};
const deliveryStatusOptions = [
  "clarifying",
  "ready",
  "in_progress",
  "blocked",
  "ready_to_launch",
  "launched",
];
const deliveryChecklistFields = [
  { field: "launchQaComplete", label: "QA complete" },
  { field: "launchStakeholdersInformed", label: "Stakeholders informed" },
  { field: "launchDateConfirmed", label: "Release date confirmed" },
  { field: "launchMonitoringReady", label: "Monitoring ready" },
];
const scaleOptions = [0, 1, 2, 3, 4, 5];

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

function formatDeliveryStatus(status) {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
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
  const [activePlacementUpdateId, setActivePlacementUpdateId] = useState(null);
  const [apiError, setApiError] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeliveryExpanded, setIsDeliveryExpanded] = useState(false);
  const [draggedRequestId, setDraggedRequestId] = useState(null);
  const [activeDropColumn, setActiveDropColumn] = useState(null);
  const didDragRoadmapRef = useRef(false);

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

  useEffect(() => {
    setIsDeliveryExpanded(false);
  }, [selectedId]);

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

  async function updateRequestById(id, overrides = {}, options = {}) {
    const baseRequest = requests.find((request) => request.id === id);
    if (!baseRequest) return null;

    const payload = {
      ...baseRequest,
      ...overrides,
      updatedAt: todayStamp(),
    };

    try {
      setIsSaving(true);
      const updatedItem = await updateRequest(id, payload);
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

  async function persistSelectedRequest(overrides = {}, options = {}) {
    if (!selectedRequest) return null;
    return updateRequestById(selectedRequest.id, overrides, options);
  }

  async function handleDeleteRequest() {
    if (!selectedRequest) return;

    const deletedId = selectedRequest.id;

    try {
      setIsSaving(true);
      await deleteRequest(deletedId);

      let nextSelectedId = null;
      setRequests((current) => {
        const remaining = current.filter((request) => request.id !== deletedId);
        nextSelectedId = remaining[0]?.id ?? null;
        return remaining;
      });
      setSelectedId((current) => (current === deletedId ? nextSelectedId : current));
      setApiError("");
      setIsDeleteDialogOpen(false);
    } catch (error) {
      setApiError(error.message);
      throw error;
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

  async function handleRoadmapPlacementChange(requestId, placement) {
    const previousRequest = requests.find((request) => request.id === requestId);
    if (!previousRequest || previousRequest.placement === placement) return;

    try {
      setActivePlacementUpdateId(requestId);
      setRequests((current) =>
        current.map((request) =>
          request.id === requestId
            ? {
                ...request,
                placement,
                status: "planned",
                updatedAt: todayStamp(),
              }
            : request,
        ),
      );
      await updateRequestById(requestId, {
        placement,
        status: "planned",
      });
    } catch (error) {
      setRequests((current) =>
        current.map((request) => (request.id === requestId ? previousRequest : request)),
      );
    } finally {
      setActivePlacementUpdateId(null);
    }
  }

  function handleRoadmapDragStart(event, requestId) {
    didDragRoadmapRef.current = true;
    setDraggedRequestId(requestId);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", requestId);
  }

  function handleRoadmapDragOver(event, column) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setActiveDropColumn(column);
  }

  function handleRoadmapDragLeave(event, column) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setActiveDropColumn((current) => (current === column ? null : current));
    }
  }

  async function handleRoadmapDrop(event, column) {
    event.preventDefault();
    const requestId = draggedRequestId || event.dataTransfer.getData("text/plain");
    setActiveDropColumn(null);

    if (!requestId) return;

    const request = requests.find((item) => item.id === requestId);
    if (!request || request.placement === column) {
      setDraggedRequestId(null);
      return;
    }

    setDraggedRequestId(null);
    await handleRoadmapPlacementChange(requestId, column);
  }

  function handleRoadmapDragEnd() {
    setDraggedRequestId(null);
    setActiveDropColumn(null);
    window.setTimeout(() => {
      didDragRoadmapRef.current = false;
    }, 0);
  }

  function handleRoadmapCardOpen(requestId) {
    if (didDragRoadmapRef.current) {
      didDragRoadmapRef.current = false;
      return;
    }

    handleSelectRequest(requestId);
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
          <h1 className="sidebar-title">
            <span>Product</span>
            <span>Workspace</span>
          </h1>
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
                aria-current={isActive ? "page" : undefined}
              >
                {isActive ? <span className="nav-active-marker">Current section</span> : null}
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
            <div className="topbar-metrics">
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
                <p className="panel-label">1. Choose from queue</p>
                <h3>Choose a request</h3>
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
                      aria-current={isSelected ? "true" : undefined}
                    >
                      <div className="row-heading">
                        <strong>{request.title}</strong>
                        <span className="row-heading-meta">
                          {isSelected ? <span className="selected-pill">Selected</span> : null}
                          {request.riceScore ? <span className="score-pill">{request.riceScore}</span> : null}
                        </span>
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
                    <p className="panel-label">2. Selected request</p>
                    <h3>{selectedRequest.title}</h3>
                    <div className="detail-subhead">
                      <span>Submitted {formatDate(selectedRequest.createdAt)}</span>
                      <span>Last updated {formatDate(selectedRequest.updatedAt)}</span>
                    </div>
                  </div>
                  <div className="detail-grid">
                    <section className="detail-section">
                      <div className="detail-edit-grid">
                        <label className="field detail-title-field">
                          <span>Request title</span>
                          <input
                            value={selectedRequest.title}
                            onChange={(event) => handleRequestFieldChange("title", event.target.value)}
                            placeholder="Summarize the enhancement request"
                          />
                        </label>

                        <label className="field">
                          <span>Submitter name</span>
                          <input
                            value={selectedRequest.submitterName}
                            onChange={(event) =>
                              handleRequestFieldChange("submitterName", event.target.value)
                            }
                            placeholder="Who submitted this request?"
                          />
                        </label>

                        <label className="field">
                          <span>Priority</span>
                          <select
                            value={selectedRequest.submitterPriority}
                            onChange={(event) =>
                              handleRequestFieldChange("submitterPriority", event.target.value)
                            }
                          >
                            {submitterPriorityOptions.map((option) => (
                              <option value={option} key={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>

                      <div className="meta-grid">
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

                      <label className="field">
                        <span>Request description</span>
                        <textarea
                          rows="5"
                          value={selectedRequest.description}
                          onChange={(event) => handleRequestFieldChange("description", event.target.value)}
                          placeholder="Capture the problem, need, and why it matters."
                        />
                      </label>

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
                          {Object.entries(riceFieldConfig).map(([field, config]) => (
                            <label className="field" key={field}>
                              <span>
                                {config.label}
                                {field === "confidence" ? " (0-100)" : " (0-5)"}
                              </span>
                              {config.type === "scale" ? (
                                <select
                                  value={selectedRequest[field] ?? ""}
                                  onChange={(event) =>
                                    handleRequestFieldChange(
                                      field,
                                      event.target.value === "" ? null : Number(event.target.value),
                                    )
                                  }
                                >
                                  <option value="">Select</option>
                                  {scaleOptions.map((option) => (
                                    <option value={option} key={option}>
                                      {option}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  type="number"
                                  min={config.min}
                                  max={config.max}
                                  step={config.step}
                                  value={selectedRequest[field] ?? ""}
                                  onChange={(event) =>
                                    handleRequestFieldChange(
                                      field,
                                      event.target.value === "" ? null : Number(event.target.value),
                                    )
                                  }
                                />
                              )}
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
                            Save changes
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
                        <div className="destructive-action-row">
                          <button
                            type="button"
                            className="danger-button"
                            onClick={() => setIsDeleteDialogOpen(true)}
                            disabled={isSaving}
                          >
                            Delete request
                          </button>
                        </div>
                      </div>

                      <div className="delivery-shell">
                        <div className="delivery-header">
                          <div>
                            <span className="meta-label">Delivery</span>
                            <strong>Execution snapshot</strong>
                          </div>
                        </div>

                        <div className="delivery-summary">
                          <div className="delivery-summary-card">
                            <span className="meta-label">Status</span>
                            <strong>{formatDeliveryStatus(selectedRequest.deliveryStatus)}</strong>
                          </div>
                          <div className="delivery-summary-card">
                            <span className="meta-label">Owner</span>
                            <strong>{selectedRequest.deliveryOwner || "Unassigned"}</strong>
                          </div>
                          <div className="delivery-summary-card">
                            <span className="meta-label">Target</span>
                            <strong>
                              {selectedRequest.targetDate ? formatDate(selectedRequest.targetDate) : "No target"}
                            </strong>
                          </div>
                          <div className="delivery-summary-card">
                            <span className="meta-label">Blocker</span>
                            <strong>{selectedRequest.currentBlocker?.trim() ? "Active" : "None"}</strong>
                          </div>
                        </div>

                        <div className="delivery-grid">
                          <label className="field">
                            <span>Execution status</span>
                            <select
                              value={selectedRequest.deliveryStatus}
                              onChange={(event) => handleRequestFieldChange("deliveryStatus", event.target.value)}
                            >
                              {deliveryStatusOptions.map((option) => (
                                <option value={option} key={option}>
                                  {formatDeliveryStatus(option)}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="field">
                            <span>Owner</span>
                            <input
                              value={selectedRequest.deliveryOwner}
                              onChange={(event) => handleRequestFieldChange("deliveryOwner", event.target.value)}
                              placeholder="Who owns delivery?"
                            />
                          </label>
                          <label className="field">
                            <span>Target date</span>
                            <input
                              type="date"
                              value={selectedRequest.targetDate || ""}
                              onChange={(event) => handleRequestFieldChange("targetDate", event.target.value)}
                            />
                          </label>
                          <label className="field">
                            <span>Current blocker</span>
                            <input
                              value={selectedRequest.currentBlocker}
                              onChange={(event) => handleRequestFieldChange("currentBlocker", event.target.value)}
                              placeholder="What is this waiting on?"
                            />
                          </label>
                        </div>

                        {isDeliveryExpanded ? (
                          <div className="delivery-secondary">
                            <label className="field">
                              <span>Main risk</span>
                              <textarea
                                rows="3"
                                value={selectedRequest.mainRisk}
                                onChange={(event) => handleRequestFieldChange("mainRisk", event.target.value)}
                                placeholder="What could delay or damage delivery?"
                              />
                            </label>
                            <label className="field">
                              <span>Open decision</span>
                              <textarea
                                rows="3"
                                value={selectedRequest.openDecision}
                                onChange={(event) => handleRequestFieldChange("openDecision", event.target.value)}
                                placeholder="What decision still needs to be made?"
                              />
                            </label>
                            <label className="field">
                              <span>Latest update</span>
                              <textarea
                                rows="3"
                                value={selectedRequest.latestUpdate}
                                onChange={(event) => handleRequestFieldChange("latestUpdate", event.target.value)}
                                placeholder="What changed most recently?"
                              />
                            </label>
                            <div className="delivery-checklist">
                              <span className="meta-label">Launch readiness</span>
                              <div className="delivery-checklist-grid">
                                {deliveryChecklistFields.map((item) => (
                                  <label className="delivery-checklist-item" key={item.field}>
                                    <input
                                      type="checkbox"
                                      checked={selectedRequest[item.field]}
                                      onChange={(event) =>
                                        handleRequestFieldChange(item.field, event.target.checked)
                                      }
                                    />
                                    <span>{item.label}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : null}

                        <button
                          type="button"
                          className="delivery-toggle"
                          onClick={() => setIsDeliveryExpanded((current) => !current)}
                          aria-expanded={isDeliveryExpanded}
                        >
                          <span>{isDeliveryExpanded ? "Hide details" : "See more details"}</span>
                          <span className={`delivery-toggle-caret${isDeliveryExpanded ? " is-open" : ""}`}>
                            ▾
                          </span>
                        </button>
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
                <section
                  className={`roadmap-column roadmap-column-${column}${
                    draggedRequestId ? " is-drop-ready" : ""
                  }${activeDropColumn === column ? " is-drop-active" : ""}`}
                  key={column}
                  onDragOver={(event) => handleRoadmapDragOver(event, column)}
                  onDragLeave={(event) => handleRoadmapDragLeave(event, column)}
                  onDrop={(event) => handleRoadmapDrop(event, column)}
                >
                  <header className="roadmap-column-header">
                    <div className="roadmap-column-titles">
                      <strong>{formatPlacement(column)}</strong>
                      <span>{roadmapDescriptions[column]}</span>
                    </div>
                    <span className="roadmap-count">{roadmapItems[column].length}</span>
                  </header>
                  <div className="roadmap-cards">
                    {roadmapItems[column].length ? (
                      <>
                        {roadmapItems[column].map((request) => (
                          <article
                            draggable={!isSaving}
                            className={`roadmap-card${
                              draggedRequestId === request.id ? " is-dragging" : ""
                            }${activePlacementUpdateId === request.id ? " is-saving" : ""}`}
                            key={request.id}
                            onDragStart={(event) => handleRoadmapDragStart(event, request.id)}
                            onDragEnd={handleRoadmapDragEnd}
                          >
                            <button
                              type="button"
                              className="roadmap-card-main"
                              onClick={() => handleRoadmapCardOpen(request.id)}
                            >
                              <div className="roadmap-card-header">
                                <strong>{request.title}</strong>
                                <span className="roadmap-grip" aria-hidden="true"></span>
                              </div>
                              <p className="request-snippet roadmap-snippet">{request.description}</p>
                              <div className="row-meta">
                                <span className={`priority-pill ${priorityClass(request.submitterPriority)}`}>
                                  {request.submitterPriority}
                                </span>
                                {request.riceScore ? <span className="score-pill">{request.riceScore}</span> : null}
                                {activePlacementUpdateId === request.id ? (
                                  <span className="status-pill status-pill-saving">Moving...</span>
                                ) : null}
                              </div>
                            </button>
                            <div
                              className="roadmap-card-actions"
                              onClick={(event) => event.stopPropagation()}
                              onKeyDown={(event) => event.stopPropagation()}
                            >
                              <label className="roadmap-move-field">
                                <span className="sr-only">Move request</span>
                                <select
                                  aria-label={`Move ${request.title}`}
                                  value={request.placement}
                                  disabled={isSaving || activePlacementUpdateId === request.id}
                                  onChange={(event) => {
                                    event.stopPropagation();
                                    handleRoadmapPlacementChange(request.id, event.target.value);
                                  }}
                                >
                                  {roadmapColumns.map((option) => (
                                    <option value={option} key={option}>
                                      {formatPlacement(option)}
                                    </option>
                                  ))}
                                </select>
                              </label>
                            </div>
                          </article>
                        ))}
                        {draggedRequestId && activeDropColumn === column ? (
                          <div className="roadmap-drop-placeholder" aria-hidden="true">
                            Drop to move into {formatPlacement(column)}
                          </div>
                        ) : null}
                      </>
                    ) : (
                      <div className="roadmap-empty">
                        <strong>{draggedRequestId ? "Drop request here" : "Nothing here yet"}</strong>
                        <span>
                          {draggedRequestId
                            ? `Move the selected card into ${formatPlacement(column)}.`
                            : `Assign a request to ${formatPlacement(
                                column,
                              )} from the detail panel to populate this lane.`}
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

        {isDeleteDialogOpen && selectedRequest ? (
          <div className="modal-overlay" role="presentation" onClick={() => setIsDeleteDialogOpen(false)}>
            <div
              className="confirm-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-request-title"
              onClick={(event) => event.stopPropagation()}
            >
              <p className="panel-label">Delete request</p>
              <h3 id="delete-request-title">Delete this request?</h3>
              <p className="modal-copy">
                This will permanently remove it from the inbox, roadmap, and history.
              </p>
              <div className="form-actions modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setIsDeleteDialogOpen(false)}
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="danger-button"
                  onClick={handleDeleteRequest}
                  disabled={isSaving}
                >
                  Delete request
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  }
