import { useEffect, useState } from "react";
import { apiFetchJson } from "../Api/Client.js";

const FALLBACK_JOBS = [
  {
    title: "Senior Backend Engineer",
    company_name: "Northstar Cloud",
    location: "Remote / United States",
    tags: ["Backend", "Distributed Systems", "Java"],
    url: "https://www.arbeitnow.com",
    created_at: "2026-04-12T09:00:00.000Z",
  },
  {
    title: "Frontend Engineer",
    company_name: "Atlas Product Studio",
    location: "New York, NY",
    tags: ["Frontend", "React", "TypeScript"],
    url: "https://www.arbeitnow.com",
    created_at: "2026-04-13T11:30:00.000Z",
  },
  {
    title: "Platform Engineer",
    company_name: "Helio Infrastructure",
    location: "Austin, TX",
    tags: ["Platform", "Cloud", "Kubernetes"],
    url: "https://www.arbeitnow.com",
    created_at: "2026-04-11T16:15:00.000Z",
  },
  {
    title: "Software Engineer",
    company_name: "SignalPath",
    location: "Seattle, WA",
    tags: ["Engineering", "APIs", "Product"],
    url: "https://www.usajobs.gov/",
    created_at: "2026-04-10T14:45:00.000Z",
  },
  {
    title: "Data Engineer",
    company_name: "Clearbeam",
    location: "Chicago, IL",
    tags: ["Data", "Python", "ETL"],
    url: "https://www.arbeitnow.com",
    created_at: "2026-04-09T08:20:00.000Z",
  },
  {
    title: "Product Engineer",
    company_name: "Meridian Health Tech",
    location: "Remote / United States",
    tags: ["Product", "Full Stack", "React"],
    url: "https://www.usajobs.gov/",
    created_at: "2026-04-08T10:10:00.000Z",
  },
];

const DEFAULT_SEARCH_TERMS = ["Software Engineer", "Backend Engineer", "Frontend Engineer"];
const US_STATE_CODES = new Set([
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
  "DC",
]);

function normalizeJobs(payload) {
  const rawJobs = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload?.jobs)
      ? payload.jobs
      : [];

  return rawJobs
    .map((job) => ({
      title: String(job?.title || "").trim(),
      company_name: String(job?.company_name || job?.company || "Unknown company").trim(),
      location: String(job?.location || "Location not specified").trim(),
      tags: Array.isArray(job?.tags) ? job.tags.filter(Boolean).slice(0, 4) : [],
      url: job?.url || job?.job_url || job?.apply_url || "https://www.arbeitnow.com",
      created_at: job?.created_at || job?.published_at || job?.publication_date || null,
    }))
    .filter((job) => job.title);
}

function isTargetRole(job) {
  const searchable = `${job.title} ${(job.tags || []).join(" ")}`.toLowerCase();
  return DEFAULT_SEARCH_TERMS.some((term) => searchable.includes(term.toLowerCase().split(" ")[0])) ||
    /engineer|developer|frontend|backend|platform|software|data|full stack|product/.test(searchable);
}

function isUnitedStatesRole(job) {
  const location = String(job.location || "").trim();
  const normalized = location.toLowerCase();

  if (!location) return false;
  if (/remote\s*\/\s*(united states|usa|us)/i.test(location)) return true;
  if (/\b(united states|usa|u\.s\.|us-only|us only)\b/i.test(location)) return true;

  const parts = location.split(",").map((part) => part.trim()).filter(Boolean);
  const trailingToken = parts[parts.length - 1]?.toUpperCase();
  if (trailingToken && US_STATE_CODES.has(trailingToken)) return true;

  if (/remote/i.test(normalized) && /(new york|california|texas|illinois|washington|florida|massachusetts|colorado)/i.test(normalized)) {
    return true;
  }

  return false;
}

function formatDateLabel(value) {
  if (!value) return "Date unavailable";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Date unavailable";
  return parsed.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function daysSince(value) {
  if (!value) return 999;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 999;
  return Math.floor((Date.now() - parsed.getTime()) / (1000 * 60 * 60 * 24));
}

export default function Market() {
  const [jobs, setJobs] = useState(FALLBACK_JOBS);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadMarketFeed() {
      try {
        setLoading(true);
        const payload = await apiFetchJson("/api/market/us-jobs");
        const normalized = normalizeJobs({ jobs: payload?.jobs })
          .filter(isTargetRole)
          .filter(isUnitedStatesRole)
          .slice(0, 18);

        if (!normalized.length) {
          throw new Error("USAJOBS feed returned no matching US engineering roles");
        }

        if (!ignore) {
          setJobs(normalized);
          setUsingFallback(Boolean(payload?.usingFallback));
          setErrorMessage(payload?.message || "");
        }
      } catch (error) {
        if (!ignore) {
          setJobs(FALLBACK_JOBS);
          setUsingFallback(true);
          setErrorMessage(error instanceof Error ? error.message : "USAJOBS feed unavailable");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadMarketFeed();
    return () => {
      ignore = true;
    };
  }, []);

  const totalOpenings = jobs.length;
  const remoteOpenings = jobs.filter((job) => /remote/i.test(job.location)).length;
  const freshOpenings = jobs.filter((job) => daysSince(job.created_at) <= 7).length;
  const uniqueCompanies = new Set(jobs.map((job) => job.company_name)).size;

  const locationMap = jobs.reduce((acc, job) => {
    const key = /remote/i.test(job.location) ? "Remote" : job.location.split(",")[0].trim();
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const hotspotEntries = Object.entries(locationMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const tagMap = jobs.reduce((acc, job) => {
    for (const tag of job.tags || []) {
      acc[tag] = (acc[tag] || 0) + 1;
    }
    return acc;
  }, {});

  const topTags = Object.entries(tagMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const signalCards = [
    {
      label: "Tracked openings",
      value: totalOpenings,
      detail: "engineering-focused roles from the current sample",
    },
    {
      label: "Remote-friendly",
      value: remoteOpenings,
      detail: "roles mentioning remote or distributed work",
    },
    {
      label: "Fresh postings",
      value: freshOpenings,
      detail: "roles posted within the last 7 days",
    },
    {
      label: "Active companies",
      value: uniqueCompanies,
      detail: "distinct employers in the current feed",
    },
  ];

  return (
    <div className="page market-page">
      <section className="page-header">
        <div>
          <p className="landing-kicker">External market intelligence</p>
          <h1 className="page-title">Market</h1>
          <p className="page-subtitle">
            Blend your personal application data with US-only hiring signals so the app feels like a real search command center.
          </p>
        </div>
        <div className="market-status-panel">
          <p className="market-status-label">{loading ? "Refreshing feed" : usingFallback ? "Snapshot mode" : "Live feed"}</p>
          <p className="market-status-value">{usingFallback ? "Using curated US engineering sample" : "USAJOBS federal market feed connected"}</p>
          <p className="market-status-copy">
            Source:{" "}
            <a href="https://developer.usajobs.gov/api-reference/get-api-search" target="_blank" rel="noreferrer">
              USAJOBS Search API
            </a>
          </p>
        </div>
      </section>

      {usingFallback && (
        <section className="market-alert">
          <strong>Live USAJOBS feed unavailable.</strong> {errorMessage || "Showing a curated US engineering sample so the page remains useful in demos and screenshots."}
        </section>
      )}

      <section className="market-signal-grid">
        {signalCards.map((card) => (
          <article key={card.label} className="market-signal-card">
            <p className="market-signal-label">{card.label}</p>
            <p className="market-signal-value">{card.value}</p>
            <p className="market-signal-detail">{card.detail}</p>
          </article>
        ))}
      </section>

      <section className="market-content-grid">
        <article className="card market-panel">
          <div className="market-panel-header">
            <div>
              <p className="landing-kicker">Hiring hotspots</p>
              <h2 className="section-title">Where the activity is concentrated</h2>
            </div>
          </div>
          <div className="market-hotspot-list">
            {hotspotEntries.map(([location, count]) => (
              <div key={location} className="market-hotspot-item">
                <div>
                  <p className="market-hotspot-name">{location}</p>
                  <p className="market-hotspot-copy">Current roles in this sample</p>
                </div>
                <span className="market-hotspot-count">{count}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="card market-panel">
          <div className="market-panel-header">
            <div>
              <p className="landing-kicker">Skill demand</p>
              <h2 className="section-title">Common tags across current roles</h2>
            </div>
          </div>
          <div className="market-tag-cloud">
            {topTags.map(([tag, count]) => (
              <span key={tag} className="market-tag-chip">
                {tag}
                <strong>{count}</strong>
              </span>
            ))}
          </div>
          <p className="market-footnote">
            Use these tags to guide resume keywords, targeted applications, and the roles you prioritize next.
          </p>
        </article>
      </section>

      <section className="card market-list-card">
        <div className="market-list-header">
          <div>
            <p className="landing-kicker">Live openings</p>
            <h2 className="section-title">US engineering roles to benchmark against</h2>
          </div>
          <p className="market-footnote">
            Focused on US engineering-adjacent roles that complement your tracked pipeline.
          </p>
        </div>

        <div className="market-opening-list">
          {jobs.slice(0, 8).map((job) => (
            <article key={`${job.company_name}-${job.title}-${job.created_at || job.location}`} className="market-opening-item">
              <div className="market-opening-main">
                <p className="market-opening-title">{job.title}</p>
                <p className="market-opening-meta">
                  <span>{job.company_name}</span>
                  <span>{job.location}</span>
                  <span>Posted {formatDateLabel(job.created_at)}</span>
                </p>
                <div className="market-opening-tags">
                  {(job.tags || []).slice(0, 4).map((tag) => (
                    <span key={tag} className="market-mini-chip">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <a className="btn-outline market-opening-link" href={job.url} target="_blank" rel="noreferrer">
                View role
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="market-note-grid">
        <article className="card market-note-card">
          <p className="landing-kicker">How to use this page</p>
          <h2 className="section-title">Turn market signals into better applications</h2>
          <div className="market-guidance-list">
            <div className="market-guidance-item">
              Prioritize roles that match repeated tags and locations instead of applying blindly.
            </div>
            <div className="market-guidance-item">
              Update your resume language when you see recurring skills across fresh postings.
            </div>
            <div className="market-guidance-item">
              Compare your own pipeline against external demand to spot missing role types or underused markets.
            </div>
          </div>
        </article>

        <article className="card market-note-card market-note-card-accent">
          <p className="landing-kicker">Professional framing</p>
          <h2 className="section-title">Why this belongs in the product</h2>
          <p className="page-subtitle">
            A portfolio app feels more credible when every navigation item supports the core workflow. Market data adds context and planning value instead of feeling experimental.
          </p>
        </article>
      </section>
    </div>
  );
}
