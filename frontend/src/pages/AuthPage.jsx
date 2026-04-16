import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiFetch, setToken } from "../Api/Client.js";

const COPY_BY_MODE = {
  login: {
    eyebrow: "Focused search",
    title: "Track Every Application.",
    accent: "Win More Offers.",
    body: "Organize your job hunt, upload resumes, and generate reports in seconds.",
    statValue: "4x",
    statLabel: "Faster follow-up rhythm",
    insightTitle: "Built for momentum",
    insightBody: "Keep resumes, notes, and interview progress aligned so every next step feels ready.",
    quickStats: [
      { value: "1 hub", label: "resume, notes, and status" },
      { value: "Zero noise", label: "only the next actions that matter" },
    ],
    cardTitle: "Welcome back",
    cardSubtitle: "Sign in to manage your applications",
    submitLabel: "Login",
    switchLabel: "New here?",
    switchAction: "Create an account",
    nextRoute: "/register",
    visualClassName: "",
  },
  register: {
    eyebrow: "Career command center",
    title: "Build Momentum With",
    accent: "Every New Opportunity.",
    body: "Create your account to track progress, upload resumes, and stay ready for the next move.",
    statValue: "24/7",
    statLabel: "Clear view of every application",
    insightTitle: "Designed for consistency",
    insightBody: "Move from first application to final offer with one place for every update, document, and detail.",
    quickStats: [
      { value: "Fast setup", label: "be ready in under a minute" },
      { value: "Clear pipeline", label: "track every stage from day one" },
    ],
    cardTitle: "Create account",
    cardSubtitle: "Start tracking your applications",
    submitLabel: "Register",
    switchLabel: "Already have an account?",
    switchAction: "Sign in",
    nextRoute: "/login",
    visualClassName: " alt",
  },
};

export default function AuthPage({ mode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const copy = COPY_BY_MODE[mode];
  const redirectTo = location.state?.from?.pathname || "/dashboard";
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });
  const [registerForm, setRegisterForm] = useState({
    email: "",
    firstName: "",
    middleName: "",
    lastName: "",
    password: "",
  });

  const transitionClassName = useMemo(() => {
    const transition = location.state?.authTransition;
    if (transition === "to-register") return " auth-layout--animate-right";
    if (transition === "to-login") return " auth-layout--animate-left";
    return "";
  }, [location.state]);

  async function handleLoginSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(loginForm),
      });
      setToken(response.token);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || "Failed to sign in");
    } finally {
      setSaving(false);
    }
  }

  async function handleRegisterSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(registerForm),
      });
      setToken(response.token);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || "Failed to create account");
    } finally {
      setSaving(false);
    }
  }

  function handleSwitch() {
    navigate(copy.nextRoute, {
      state: {
        from: location.state?.from,
        authTransition: mode === "login" ? "to-register" : "to-login",
      },
    });
  }

  return (
    <div className={`auth-layout auth-layout--${mode}${transitionClassName}`}>
      <section className={`auth-visual${copy.visualClassName}`}>
        <div className="auth-visual-inner">
          <p className="auth-kicker">{copy.eyebrow}</p>
          <h1 className="auth-title">
            {copy.title}
            <span>{copy.accent}</span>
          </h1>
          <p className="auth-copy">{copy.body}</p>
          <div className="auth-quick-stats" aria-label="ApplicationTracker highlights">
            {copy.quickStats.map((item) => (
              <div className="auth-quick-stat" key={item.label}>
                <p className="auth-quick-stat-value">{item.value}</p>
                <p className="auth-quick-stat-label">{item.label}</p>
              </div>
            ))}
          </div>
          <div className="auth-visual-stack">
            <div className="auth-insight-card">
              <p className="auth-insight-value">{copy.statValue}</p>
              <p className="auth-insight-label">{copy.statLabel}</p>
            </div>
            <div className="auth-floating-note">
              <p className="auth-floating-title">{copy.insightTitle}</p>
              <p className="auth-floating-body">{copy.insightBody}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <div className="auth-mode-toggle" aria-label="Authentication mode switch">
            <button
              type="button"
              className={`auth-mode-pill${mode === "login" ? " is-active" : ""}`}
              onClick={() => {
                if (mode !== "login") {
                  navigate("/login", {
                    state: {
                      from: location.state?.from,
                      authTransition: "to-login",
                    },
                  });
                }
              }}
            >
              Sign in
            </button>
            <button
              type="button"
              className={`auth-mode-pill${mode === "register" ? " is-active" : ""}`}
              onClick={() => {
                if (mode !== "register") {
                  navigate("/register", {
                    state: {
                      from: location.state?.from,
                      authTransition: "to-register",
                    },
                  });
                }
              }}
            >
              Create account
            </button>
          </div>
          <h2 className="auth-card-title">{copy.cardTitle}</h2>
          <p className="auth-card-subtitle">{copy.cardSubtitle}</p>

          {mode === "login" ? (
            <form className="form" onSubmit={handleLoginSubmit}>
              <div className="field">
                <label className="label">Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="input"
                  value={loginForm.email}
                  onChange={(event) =>
                    setLoginForm((prev) => ({ ...prev, email: event.target.value }))
                  }
                  required
                />
              </div>

              <div className="field">
                <label className="label">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="input"
                  value={loginForm.password}
                  onChange={(event) =>
                    setLoginForm((prev) => ({ ...prev, password: event.target.value }))
                  }
                  required
                />
              </div>

              {error && <p className="form-error">{error}</p>}

              <button className="btn-primary btn-block" disabled={saving}>
                {saving ? "Signing in..." : copy.submitLabel}
              </button>

              <p className="form-footer">
                <span>{copy.switchLabel}</span>
                <button className="auth-switch-link" type="button" onClick={handleSwitch}>
                  {copy.switchAction}
                </button>
              </p>
            </form>
          ) : (
            <form className="form" onSubmit={handleRegisterSubmit}>
              <div className="field">
                <label className="label">First Name</label>
                <input
                  type="text"
                  placeholder="Jane"
                  className="input"
                  value={registerForm.firstName}
                  onChange={(event) =>
                    setRegisterForm((prev) => ({ ...prev, firstName: event.target.value }))
                  }
                  required
                />
              </div>

              <div className="field">
                <label className="label">Middle Name (optional)</label>
                <input
                  type="text"
                  placeholder="A."
                  className="input"
                  value={registerForm.middleName}
                  onChange={(event) =>
                    setRegisterForm((prev) => ({ ...prev, middleName: event.target.value }))
                  }
                />
              </div>

              <div className="field">
                <label className="label">Last Name</label>
                <input
                  type="text"
                  placeholder="Doe"
                  className="input"
                  value={registerForm.lastName}
                  onChange={(event) =>
                    setRegisterForm((prev) => ({ ...prev, lastName: event.target.value }))
                  }
                  required
                />
              </div>

              <div className="field">
                <label className="label">Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="input"
                  value={registerForm.email}
                  onChange={(event) =>
                    setRegisterForm((prev) => ({ ...prev, email: event.target.value }))
                  }
                  required
                />
              </div>

              <div className="field">
                <label className="label">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="input"
                  value={registerForm.password}
                  onChange={(event) =>
                    setRegisterForm((prev) => ({ ...prev, password: event.target.value }))
                  }
                  required
                />
              </div>

              {error && <p className="form-error">{error}</p>}

              <button className="btn-primary btn-block" disabled={saving}>
                {saving ? "Creating account..." : copy.submitLabel}
              </button>

              <p className="form-footer">
                <span>{copy.switchLabel}</span>
                <button className="auth-switch-link" type="button" onClick={handleSwitch}>
                  {copy.switchAction}
                </button>
              </p>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
