import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetchJson } from "../Api/Client.js";
import { formatDate } from "../utils/date.js";

const PIPELINE_STATUS_ORDER = ["APPLIED", "INTERVIEW", "OFFER", "REJECTED"];

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

function startOfWeek(date) {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  const day = normalized.getDay();
  const diff = (day + 6) % 7;
  normalized.setDate(normalized.getDate() - diff);
  return normalized;
}

function weekLabel(date) {
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const metrics = useMemo(() => {
    const counts = {
      APPLIED: 0,
      INTERVIEW: 0,
      OFFER: 0,
      REJECTED: 0,
    };
    let activeCount = 0;
    let staleCount = 0;

    for (const app of applications) {
      const status = String(app.status || "").toUpperCase();
      const daysSinceActivity = getDaysSince(getLastActivityTimestamp(app));

      if (counts[status] !== undefined) counts[status] += 1;
      if (status !== "REJECTED" && status !== "OFFER") activeCount += 1;
      if (daysSinceActivity !== null && daysSinceActivity >= 14 && status !== "REJECTED" && status !== "OFFER") {
        staleCount += 1;
      }
    }

    const total = applications.length;
    const responseRate = total > 0 ? Math.round((counts.INTERVIEW / total) * 100) : 0;
    const offerRate = total > 0 ? Math.round((counts.OFFER / total) * 100) : 0;

    return {
      total,
      activeCount,
      staleCount,
      counts,
      responseRate,
      offerRate,
    };
  }, [applications]);

  const dashboardCards = useMemo(
    () => [
      {
        label: "Total applications",
        value: metrics.total,
        detail: `${metrics.activeCount} still active in the pipeline`,
        tone: "default",
      },
      {
        label: "Interview rate",
        value: `${metrics.responseRate}%`,
        detail: `${metrics.counts.INTERVIEW} reached interview stage`,
        tone: "warm",
      },
      {
        label: "Offer rate",
        value: `${metrics.offerRate}%`,
        detail: `${metrics.counts.OFFER} offer${metrics.counts.OFFER === 1 ? "" : "s"} received`,
        tone: "success",
      },
      {
        label: "Needs follow-up",
        value: metrics.staleCount,
        detail: "No activity in the last 14 days",
        tone: "cool",
      },
    ],
    [metrics]
  );

  const stageBreakdown = useMemo(() => {
    return PIPELINE_STATUS_ORDER.map((status) => {
      const count = metrics.counts[status] || 0;
      const share = metrics.total > 0 ? Math.round((count / metrics.total) * 100) : 0;
      return { status, count, share };
    });
  }, [metrics]);

  const recentApplications = useMemo(() => {
    return [...applications]
      .sort((a, b) => getLastActivityTimestamp(b) - getLastActivityTimestamp(a))
      .slice(0, 6);
  }, [applications]);

  const staleApplications = useMemo(() => {
    return [...applications]
      .filter((app) => {
        const status = String(app.status || "").toUpperCase();
        const daysSinceActivity = getDaysSince(getLastActivityTimestamp(app));
        return (
          daysSinceActivity !== null &&
          daysSinceActivity >= 14 &&
          status !== "REJECTED" &&
          status !== "OFFER"
        );
      })
      .sort((a, b) => getLastActivityTimestamp(a) - getLastActivityTimestamp(b))
      .slice(0, 4);
  }, [applications]);

  const weeklyTrend = useMemo(() => {
    const buckets = [];
    const now = startOfWeek(new Date());

    for (let index = 5; index >= 0; index -= 1) {
      const bucketDate = new Date(now);
      bucketDate.setDate(bucketDate.getDate() - index * 7);
      buckets.push({
        key: bucketDate.toISOString(),
        label: weekLabel(bucketDate),
        count: 0,
        interviews: 0,
      });
    }

    for (const app of applications) {
      const createdAt = new Date(app.appliedDate || app.createdAt || 0);
      if (Number.isNaN(createdAt.getTime())) continue;
      const createdWeek = startOfWeek(createdAt).getTime();
      const match = buckets.find((bucket) => startOfWeek(bucket.key).getTime() === createdWeek);
      if (!match) continue;
      match.count += 1;
      if (String(app.status || "").toUpperCase() === "INTERVIEW") {
        match.interviews += 1;
      }
    }

    const maxCount = Math.max(...buckets.map((bucket) => bucket.count), 1);
    return buckets.map((bucket) => ({
      ...bucket,
      height: `${Math.max((bucket.count / maxCount) * 100, bucket.count > 0 ? 18 : 6)}%`,
    }));
  }, [applications]);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Keep your pipeline moving with clearer conversion signals, stale follow-ups, and recent activity.
          </p>
        </div>
        <div className="form-actions">
          <Link className="btn-outline" to="/applications">
            View Pipeline
          </Link>
          <Link className="btn-primary" to="/applications/new">
            New Application
          </Link>
        </div>
      </header>

      <section className="dashboard-metrics-grid">
        {dashboardCards.map((card) => (
          <article key={card.label} className={`dashboard-metric-card ${card.tone}`}>
            <p className="dashboard-metric-label">{card.label}</p>
            <p className="dashboard-metric-value">{card.value}</p>
            <p className="dashboard-metric-detail">{card.detail}</p>
          </article>
        ))}
      </section>

      <section className="dashboard-insight-grid">
        <article className="card dashboard-stage-card">
          <div className="table-header">
            <div>
              <h2 className="section-title">Pipeline breakdown</h2>
              <p className="dashboard-section-copy">See where your applications are clustering right now.</p>
            </div>
          </div>

          <div className="dashboard-stage-list">
            {stageBreakdown.map((item) => (
              <div key={item.status} className="dashboard-stage-row">
                <div className="dashboard-stage-meta">
                  <span className={`status-badge ${item.status.toLowerCase()}`}>{item.status}</span>
                  <span className="dashboard-stage-count">{item.count}</span>
                </div>
                <div className="dashboard-stage-bar">
                  <span
                    className={`dashboard-stage-fill ${item.status.toLowerCase()}`}
                    style={{ width: `${Math.max(item.share, item.count > 0 ? 8 : 0)}%` }}
                  />
                </div>
                <span className="dashboard-stage-share">{item.share}%</span>
              </div>
            ))}
          </div>
        </article>

        <article className="card dashboard-followup-card">
          <div className="table-header">
            <div>
              <h2 className="section-title">Follow-up queue</h2>
              <p className="dashboard-section-copy">Roles that have gone quiet and deserve the next touchpoint.</p>
            </div>
          </div>

          {staleApplications.length === 0 ? (
            <div className="dashboard-empty-panel">
              <h3 className="section-title">No stale applications</h3>
              <p className="page-subtitle">Your current pipeline does not have any follow-ups overdue.</p>
            </div>
          ) : (
            <div className="dashboard-followup-list">
              {staleApplications.map((app) => {
                const lastActivity = getLastActivityTimestamp(app);
                const daysSinceActivity = getDaysSince(lastActivity);

                return (
                  <button
                    key={app.id}
                    type="button"
                    className="dashboard-followup-item"
                    onClick={() => navigate(`/applications/${app.id}`)}
                  >
                    <div>
                      <p className="dashboard-followup-name">{app.fullName || "Unnamed"}</p>
                      <p className="dashboard-followup-role">{app.position || "Untitled role"}</p>
                    </div>
                    <div className="dashboard-followup-meta">
                      <span className={`status-badge ${String(app.status || "").toLowerCase()}`}>
                        {app.status || "Unknown"}
                      </span>
                      <span className="dashboard-followup-age">
                        {daysSinceActivity} day{daysSinceActivity === 1 ? "" : "s"} idle
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </article>
      </section>

      <section className="dashboard-visual-grid">
        <article className="card dashboard-trend-card">
          <div className="table-header">
            <div>
              <h2 className="section-title">6-week momentum</h2>
              <p className="dashboard-section-copy">A quick visual on new applications entering the pipeline.</p>
            </div>
          </div>
          <div className="dashboard-trend-chart">
            {weeklyTrend.map((bucket) => (
              <div key={bucket.key} className="dashboard-trend-column">
                <div className="dashboard-trend-bar-wrap">
                  <div className="dashboard-trend-bar" style={{ height: bucket.height }} />
                </div>
                <p className="dashboard-trend-value">{bucket.count}</p>
                <p className="dashboard-trend-label">{bucket.label}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="card dashboard-spotlight-card">
          <div className="table-header">
            <div>
              <h2 className="section-title">Portfolio spotlight</h2>
              <p className="dashboard-section-copy">This screen is designed to communicate product thinking quickly.</p>
            </div>
          </div>
          <div className="dashboard-spotlight-list">
            <div className="dashboard-spotlight-item">
              <p className="dashboard-spotlight-label">Conversion signal</p>
              <p className="dashboard-spotlight-value">{metrics.responseRate}% reached interview</p>
            </div>
            <div className="dashboard-spotlight-item">
              <p className="dashboard-spotlight-label">Stale queue</p>
              <p className="dashboard-spotlight-value">{metrics.staleCount} need follow-up attention</p>
            </div>
            <div className="dashboard-spotlight-item">
              <p className="dashboard-spotlight-label">Next focus</p>
              <p className="dashboard-spotlight-value">
                {metrics.staleCount > 0 ? "Push the follow-up queue" : "Keep feeding the top of funnel"}
              </p>
            </div>
          </div>
        </article>
      </section>

      <section className="card table-card">
        <div className="table-header">
          <div>
            <h2 className="section-title">Recent activity</h2>
            <p className="dashboard-section-copy">The latest changes across your tracked applications.</p>
          </div>
          <Link className="link-button" to="/applications">
            View all
          </Link>
        </div>

        <div className="table-wrap">
          {loading && (
            <div className="card">
              <div className="skeleton skeleton-title" />
              <div className="skeleton skeleton-row" />
              <div className="skeleton skeleton-row" />
              <div className="skeleton skeleton-row" />
            </div>
          )}

          {error && !loading && <p className="form-error">{error}</p>}

          {!loading && !error && recentApplications.length > 0 && (
            <table className="table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Applied</th>
                  <th>Last activity</th>
                </tr>
              </thead>
              <tbody>
                {recentApplications.map((app) => {
                  const lastActivity = getLastActivityTimestamp(app);
                  const daysSinceActivity = getDaysSince(lastActivity);

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
                          <span className="applications-secondary-text">{app.workType || "—"}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${String(app.status || "").toLowerCase()}`}>
                          {app.status || "Unknown"}
                        </span>
                      </td>
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
          )}
        </div>
      </section>

      {!loading && !error && applications.length === 0 && (
        <section className="card empty-state-card">
          <div className="empty-state-copy">
            <h3 className="section-title">No applications yet</h3>
            <p className="page-subtitle">
              Create your first application to unlock analytics, follow-up tracking, and activity history.
            </p>
          </div>
          <Link className="btn-primary" to="/applications/new">
            Create Application
          </Link>
        </section>
      )}
    </div>
  );
}
