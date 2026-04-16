import { Link } from "react-router-dom";

const FEATURE_CARDS = [
  {
    title: "Pipeline Visibility",
    copy: "Track every application with status, work type, resume state, and follow-up visibility in one workflow.",
  },
  {
    title: "Portfolio-Grade UX",
    copy: "Animated auth flow, analytics dashboard, timeline detail views, and responsive product-style layouts.",
  },
  {
    title: "Backend Engineering",
    copy: "JWT auth, Flyway migrations, Swagger docs, demo seed data, and Dockerized backend setup.",
  },
];

const STACK_ITEMS = [
  "Spring Boot",
  "Spring Security",
  "JWT",
  "MySQL",
  "Flyway",
  "Swagger",
  "React",
  "Vite",
];

const SHOWCASE_ITEMS = [
  { label: "Auth flow", value: "JWT + guarded routes" },
  { label: "Analytics", value: "response + offer tracking" },
  { label: "Workflow", value: "timeline + follow-up queue" },
];

const ABOUT_ITEMS = [
  "Feature-first Spring Boot package structure",
  "Flyway migrations instead of ad hoc schema drift",
  "Dockerized backend setup with MySQL",
  "Seeded demo data for screenshot-ready local runs",
];

export default function LandingPage() {
  const apiBase = import.meta.env.VITE_API_BASE || "http://localhost:8080";

  return (
    <div className="page landing-page">
      <section className="landing-hero">
        <div className="landing-copy">
          <p className="landing-kicker">Portfolio project</p>
          <h1 className="landing-title">
            A polished application tracker with real product workflows.
          </h1>
          <p className="landing-subtitle">
            ApplicationTracker combines a professional frontend, authenticated user flows, analytics,
            timelines, file uploads, and production-style backend setup in one full-stack project.
          </p>

          <div className="landing-actions">
            <Link className="btn-primary" to="/login">
              Explore the app
            </Link>
            <a
              className="btn-outline"
              href={`${apiBase}/swagger-ui.html`}
              target="_blank"
              rel="noreferrer"
            >
              View API docs
            </a>
          </div>

          <div className="landing-demo-card">
            <p className="landing-demo-label">Local demo account</p>
            <p className="landing-demo-value">demo@applicationtracker.dev</p>
            <p className="landing-demo-value">password123</p>
          </div>
        </div>

        <div className="landing-visual">
          <div className="landing-panel landing-panel-primary">
            <p className="landing-panel-kicker">Overview</p>
            <p className="landing-panel-value">Interview rate: 33%</p>
            <p className="landing-panel-copy">Analytics and follow-up insight surface the next best action.</p>
          </div>
          <div className="landing-panel landing-panel-secondary">
            <p className="landing-panel-kicker">Workflow</p>
            <p className="landing-panel-list">Auth to Dashboard to Pipeline to Detail Timeline</p>
          </div>
          <div className="landing-stack">
            {STACK_ITEMS.map((item) => (
              <span key={item} className="landing-stack-chip">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-feature-grid">
        {FEATURE_CARDS.map((card) => (
          <article key={card.title} className="landing-feature-card">
            <h2 className="section-title">{card.title}</h2>
            <p className="page-subtitle">{card.copy}</p>
          </article>
        ))}
      </section>

      <section className="landing-showcase-grid">
        <article className="landing-showcase-card">
          <div className="landing-showcase-header">
            <div>
              <p className="landing-kicker">Demo-ready views</p>
              <h2 className="section-title">Built to present well in screenshots</h2>
            </div>
          </div>
          <div className="landing-showcase-strip">
            {SHOWCASE_ITEMS.map((item) => (
              <div key={item.label} className="landing-showcase-item">
                <p className="landing-showcase-label">{item.label}</p>
                <p className="landing-showcase-value">{item.value}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="landing-about-card">
          <p className="landing-kicker">About this project</p>
          <h2 className="section-title">A portfolio project with product and engineering depth.</h2>
          <p className="page-subtitle">
            The goal was not just to CRUD data. It was to build something that looks like a real
            product, supports a believable workflow, and shows decisions across frontend UX and
            backend architecture.
          </p>
          <div className="landing-about-list">
            {ABOUT_ITEMS.map((item) => (
              <div key={item} className="landing-about-item">
                {item}
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
