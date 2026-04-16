import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetchJson } from "../Api/Client.js";
import { formatDate } from "../utils/date.js";

const STATUS_OPTIONS = ["ALL", "APPLIED", "INTERVIEW", "OFFER", "REJECTED"];
const WORK_TYPE_OPTIONS = ["ALL", "Remote", "Hybrid", "Onsite"];
const SORT_OPTIONS = [
  { value: "activity-desc", label: "Latest activity" },
  { value: "created-desc", label: "Newest created" },
  { value: "created-asc", label: "Oldest created" },
  { value: "name-asc", label: "Name A-Z" },
  { value: "position-asc", label: "Role A-Z" },
];

function getLastActivityTimestamp(application) {
  const created = new Date(application.createdAt || 0).getTime();
  const resume = new Date(application.resumeUploadedAt || 0).getTime();
  return Math.max(created, resume);
}

function getDaysSince(value) {
  const timestamp = new Date(value || 0).getTime();
  if (!timestamp) return null;
  const diff = Date.now() - timestamp;
  if (diff < 0) return 0;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export default function ApplicationsList() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [workTypeFilter, setWorkTypeFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("activity-desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError("");

    apiFetchJson("/api/applications")
      .then((data) => {
        if (!ignore) {
          setApplications(data || []);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.message || "Failed to load applications");
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const overviewStats = useMemo(() => {
    const counts = {
      total: applications.length,
      interviews: 0,
      offers: 0,
      followUps: 0,
    };

    for (const app of applications) {
      const status = String(app.status || "").toUpperCase();
      const daysSinceActivity = getDaysSince(getLastActivityTimestamp(app));

      if (status === "INTERVIEW") counts.interviews += 1;
      if (status === "OFFER") counts.offers += 1;
      if (daysSinceActivity !== null && daysSinceActivity >= 14 && status !== "REJECTED" && status !== "OFFER") {
        counts.followUps += 1;
      }
    }

    return [
      { label: "Total pipeline", value: counts.total, tone: "default" },
      { label: "Interview stage", value: counts.interviews, tone: "warm" },
      { label: "Offers", value: counts.offers, tone: "success" },
      { label: "Needs follow-up", value: counts.followUps, tone: "cool" },
    ];
  }, [applications]);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return applications.filter((app) => {
      const status = String(app.status || "").toUpperCase();
      const workType = String(app.workType || "").toLowerCase();
      const matchesStatus = statusFilter === "ALL" || status === statusFilter;
      const matchesWorkType =
        workTypeFilter === "ALL" || workType === workTypeFilter.toLowerCase();
      const matchesQuery =
        !normalizedQuery ||
        String(app.fullName || "").toLowerCase().includes(normalizedQuery) ||
        String(app.position || "").toLowerCase().includes(normalizedQuery) ||
        String(app.email || "").toLowerCase().includes(normalizedQuery) ||
        String(app.phone || "").toLowerCase().includes(normalizedQuery);

      return matchesStatus && matchesWorkType && matchesQuery;
    });
  }, [applications, query, statusFilter, workTypeFilter]);

  const sorted = useMemo(() => {
    const items = [...filtered];

    items.sort((a, b) => {
      switch (sortBy) {
        case "created-desc":
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case "created-asc":
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        case "name-asc":
          return String(a.fullName || "").localeCompare(String(b.fullName || ""));
        case "position-asc":
          return String(a.position || "").localeCompare(String(b.position || ""));
        case "activity-desc":
        default:
          return getLastActivityTimestamp(b) - getLastActivityTimestamp(a);
      }
    });

    return items;
  }, [filtered, sortBy]);

  useEffect(() => {
    setPage(1);
  }, [query, statusFilter, workTypeFilter, sortBy, pageSize]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const pageNumbers = useMemo(() => {
    const numbers = [];
    const maxButtons = 5;
    let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let end = Math.min(totalPages, start + maxButtons - 1);

    if (end - start < maxButtons - 1) {
      start = Math.max(1, end - maxButtons + 1);
    }

    for (let value = start; value <= end; value += 1) {
      numbers.push(value);
    }

    return numbers;
  }, [currentPage, totalPages]);

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, currentPage, pageSize]);

  const filtersApplied =
    query.trim() !== "" || statusFilter !== "ALL" || workTypeFilter !== "ALL";

  function clearFilters() {
    setQuery("");
    setStatusFilter("ALL");
    setWorkTypeFilter("ALL");
    setSortBy("activity-desc");
  }

  function exportCsv() {
    const rows = sorted.map((app) => ({
      id: app.id ?? "",
      fullName: app.fullName ?? "",
      email: app.email ?? "",
      phone: app.phone ?? "",
      position: app.position ?? "",
      workType: app.workType ?? "",
      status: app.status ?? "",
      appliedDate: formatDate(app.appliedDate),
      createdAt: formatDate(app.createdAt),
    }));
    const headers = [
      "id",
      "fullName",
      "email",
      "phone",
      "position",
      "workType",
      "status",
      "appliedDate",
      "createdAt",
    ];

    const escape = (value) => {
      const normalized = String(value ?? "");
      if (normalized.includes('"') || normalized.includes(",") || normalized.includes("\n")) {
        return `"${normalized.replace(/"/g, '""')}"`;
      }
      return normalized;
    };

    const csv = [
      headers.join(","),
      ...rows.map((row) => headers.map((key) => escape(row[key])).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "applications.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Applications</h1>
          <p className="page-subtitle">
            Manage your pipeline with search, follow-up visibility, and cleaner decision-making.
          </p>
        </div>
        <div className="form-actions">
          <button
            className="btn-outline"
            type="button"
            onClick={exportCsv}
            disabled={sorted.length === 0}
          >
            Export CSV
          </button>
          <Link className="btn-primary" to="/applications/new">
            New Application
          </Link>
        </div>
      </header>

      <section className="applications-overview-grid">
        {overviewStats.map((stat) => (
          <article key={stat.label} className={`applications-overview-card ${stat.tone}`}>
            <p className="applications-overview-label">{stat.label}</p>
            <p className="applications-overview-value">{stat.value}</p>
          </article>
        ))}
      </section>

      <section className="card applications-toolbar-card">
        <div className="applications-toolbar-top">
          <div>
            <h2 className="section-title">Pipeline controls</h2>
            <p className="page-subtitle applications-toolbar-copy">
              Filter the list, review activity, and export a cleaner snapshot.
            </p>
          </div>
          <div className="applications-results-meta">
            <span className="applications-results-count">
              {sorted.length} result{sorted.length === 1 ? "" : "s"}
            </span>
            {filtersApplied && (
              <button className="link-button" type="button" onClick={clearFilters}>
                Clear filters
              </button>
            )}
          </div>
        </div>

        <div className="applications-filter-grid">
          <div className="field">
            <label className="label">Search</label>
            <input
              type="search"
              className="input"
              placeholder="Search by name, role, email, or phone"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <div className="field">
            <label className="label">Status</label>
            <select
              className="input"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option === "ALL" ? "All statuses" : option}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label className="label">Work type</label>
            <select
              className="input"
              value={workTypeFilter}
              onChange={(event) => setWorkTypeFilter(event.target.value)}
            >
              {WORK_TYPE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option === "ALL" ? "All work types" : option}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label className="label">Sort by</label>
            <select
              className="input"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {loading && (
        <div className="card">
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-row" />
          <div className="skeleton skeleton-row" />
          <div className="skeleton skeleton-row" />
        </div>
      )}

      {error && !loading && <p className="form-error">{error}</p>}

      {!loading && !error && applications.length === 0 && (
        <section className="card empty-state-card">
          <div className="empty-state-copy">
            <h3 className="section-title">No applications yet</h3>
            <p className="page-subtitle">
              Start your pipeline with the first role you want to track.
            </p>
          </div>
          <Link className="btn-primary" to="/applications/new">
            Create Application
          </Link>
        </section>
      )}

      {!loading && !error && applications.length > 0 && pageItems.length === 0 && (
        <section className="card empty-state-card">
          <div className="empty-state-copy">
            <h3 className="section-title">No matches for this view</h3>
            <p className="page-subtitle">
              Adjust search or filters to widen the list again.
            </p>
          </div>
          <button className="btn-outline" type="button" onClick={clearFilters}>
            Reset filters
          </button>
        </section>
      )}

      {!loading && !error && pageItems.length > 0 && (
        <section className="card table-card">
          <div className="table-header">
            <div>
              <h2 className="section-title">Application pipeline</h2>
              <p className="applications-table-caption">
                Sorted by {SORT_OPTIONS.find((option) => option.value === sortBy)?.label.toLowerCase()}.
              </p>
            </div>
            <div className="field applications-page-size">
              <label className="label">Page size</label>
              <select
                className="input"
                value={pageSize}
                onChange={(event) => setPageSize(Number(event.target.value))}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="table-wrap">
            <table className="table applications-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Work type</th>
                  <th>Applied</th>
                  <th>Last activity</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((app) => {
                  const lastActivity = getLastActivityTimestamp(app);
                  const daysSinceActivity = getDaysSince(lastActivity);
                  const needsFollowUp =
                    daysSinceActivity !== null &&
                    daysSinceActivity >= 14 &&
                    !["REJECTED", "OFFER"].includes(String(app.status || "").toUpperCase());

                  return (
                    <tr
                      key={app.id}
                      className="table-row-click"
                      onClick={() => navigate(`/applications/${app.id}`)}
                    >
                      <td>
                        <div className="applications-primary-cell">
                          <Link to={`/applications/${app.id}`} className="link applications-primary-link">
                            {app.fullName || "Unnamed"}
                          </Link>
                          <span className="applications-secondary-text">
                            {app.email || "No email provided"}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="applications-primary-cell">
                          <span className="applications-role">{app.position || "Untitled role"}</span>
                          <span className="applications-secondary-text">
                            {app.phone || "No phone on file"}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="applications-status-stack">
                          <span className={`status-badge ${String(app.status || "").toLowerCase()}`}>
                            {app.status || "Unknown"}
                          </span>
                          {needsFollowUp && (
                            <span className="applications-inline-flag">Follow up</span>
                          )}
                        </div>
                      </td>
                      <td>{app.workType || "—"}</td>
                      <td>{formatDate(app.appliedDate || app.createdAt)}</td>
                      <td>
                        <div className="applications-primary-cell">
                          <span className="applications-role">
                            {lastActivity > 0 ? formatDate(new Date(lastActivity)) : "—"}
                          </span>
                          <span className="applications-secondary-text">
                            {daysSinceActivity === null
                              ? "No recent activity"
                              : `${daysSinceActivity} day${daysSinceActivity === 1 ? "" : "s"} ago`}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="applications-pagination">
            <p className="applications-pagination-copy">
              Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, sorted.length)} of{" "}
              {sorted.length}
            </p>
            <div className="pagination-controls">
              <button
                className="btn-outline"
                type="button"
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>

              <div className="pagination-pages">
                {pageNumbers.map((number) => (
                  <button
                    key={number}
                    type="button"
                    className={`pagination-page${number === currentPage ? " is-active" : ""}`}
                    onClick={() => setPage(number)}
                  >
                    {number}
                  </button>
                ))}
              </div>

              <button
                className="btn-outline"
                type="button"
                onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
