import { useState } from "react";

const BASELINE_SALARY = 133080;

const EXPERIENCE_OPTIONS = [
  { value: "0-1", label: "0-1 years", multiplier: 0.82, marketLabel: "Entry-level" },
  { value: "2-4", label: "2-4 years", multiplier: 0.96, marketLabel: "Early career" },
  { value: "5-7", label: "5-7 years", multiplier: 1.08, marketLabel: "Mid-level" },
  { value: "8-10", label: "8-10 years", multiplier: 1.2, marketLabel: "Senior" },
  { value: "10+", label: "10+ years", multiplier: 1.34, marketLabel: "Staff / lead" },
];

const SKILL_GROUPS = [
  {
    title: "Languages",
    items: [
      { label: "Java", impact: 0.04 },
      { label: "Python", impact: 0.04 },
      { label: "JavaScript", impact: 0.02 },
      { label: "TypeScript", impact: 0.03 },
      { label: "Go", impact: 0.05 },
    ],
  },
  {
    title: "Databases",
    items: [
      { label: "PostgreSQL", impact: 0.02 },
      { label: "MySQL", impact: 0.015 },
      { label: "MongoDB", impact: 0.02 },
      { label: "Redis", impact: 0.02 },
    ],
  },
  {
    title: "Frameworks",
    items: [
      { label: "Spring Boot", impact: 0.04 },
      { label: "React", impact: 0.03 },
      { label: "Node.js", impact: 0.025 },
      { label: "Next.js", impact: 0.025 },
      { label: "Docker", impact: 0.03 },
      { label: "Kubernetes", impact: 0.05 },
    ],
  },
];

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function Salary() {
  const [experienceBand, setExperienceBand] = useState("5-7");
  const [selectedSkills, setSelectedSkills] = useState(["Java", "Spring Boot", "React", "PostgreSQL"]);

  const selectedExperience = EXPERIENCE_OPTIONS.find((option) => option.value === experienceBand) || EXPERIENCE_OPTIONS[2];
  const skillImpact = SKILL_GROUPS.flatMap((group) => group.items)
    .filter((item) => selectedSkills.includes(item.label))
    .reduce((total, item) => total + item.impact, 0);

  const adjustedSkillImpact = Math.min(skillImpact, 0.22);
  const estimate = Math.round(BASELINE_SALARY * selectedExperience.multiplier * (1 + adjustedSkillImpact));
  const lowerBound = Math.round(estimate * 0.9);
  const upperBound = Math.round(estimate * 1.12);

  const selectedCount = selectedSkills.length;

  function toggleSkill(label) {
    setSelectedSkills((current) =>
      current.includes(label)
        ? current.filter((item) => item !== label)
        : [...current, label]
    );
  }

  return (
    <div className="page salary-page">
      <section className="page-header">
        <div>
          <p className="landing-kicker">US salary benchmark</p>
          <h1 className="page-title">Salary</h1>
          <p className="page-subtitle">
            Estimate a current US developer salary range using experience and stack signals. This is a guided benchmark, not a compensation guarantee.
          </p>
        </div>
        <div className="salary-source-panel">
          <p className="salary-source-label">Baseline</p>
          <p className="salary-source-value">{formatCurrency(BASELINE_SALARY)}</p>
          <p className="salary-source-copy">
            Based on the recent US software developer pay baseline from the Bureau of Labor Statistics, then adjusted by experience and selected skills.
          </p>
          <a
            className="salary-source-link"
            href="https://www.bls.gov/ooh/computer-and-information-technology/software-developers.htm"
            target="_blank"
            rel="noreferrer"
          >
            View BLS reference
          </a>
        </div>
      </section>

      <section className="salary-layout">
        <article className="card salary-config-card">
          <div className="salary-config-header">
            <div>
              <p className="landing-kicker">Estimator inputs</p>
              <h2 className="section-title">Shape the profile</h2>
            </div>
          </div>

          <div className="field">
            <label className="label" htmlFor="experience-band">Years of experience</label>
            <select
              id="experience-band"
              className="input"
              value={experienceBand}
              onChange={(event) => setExperienceBand(event.target.value)}
            >
              {EXPERIENCE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="salary-skill-groups">
            {SKILL_GROUPS.map((group) => (
              <section key={group.title} className="salary-skill-group">
                <div className="salary-skill-group-header">
                  <p className="salary-skill-group-title">{group.title}</p>
                  <p className="salary-skill-group-copy">Choose every stack area that fits the target role.</p>
                </div>
                <div className="salary-chip-grid">
                  {group.items.map((item) => {
                    const isActive = selectedSkills.includes(item.label);
                    return (
                      <button
                        key={item.label}
                        type="button"
                        className={`salary-chip${isActive ? " is-active" : ""}`}
                        onClick={() => toggleSkill(item.label)}
                      >
                        <span>{item.label}</span>
                        <strong>+{Math.round(item.impact * 100)}%</strong>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </article>

        <aside className="salary-results-stack">
          <article className="salary-estimate-card">
            <p className="salary-estimate-label">Estimated US salary</p>
            <p className="salary-estimate-value">{formatCurrency(estimate)}</p>
            <p className="salary-estimate-range">
              Typical range: {formatCurrency(lowerBound)} to {formatCurrency(upperBound)}
            </p>
          </article>

          <article className="card salary-breakdown-card">
            <div className="salary-breakdown-grid">
              <div className="salary-breakdown-item">
                <p className="salary-breakdown-label">Experience band</p>
                <p className="salary-breakdown-value">{selectedExperience.marketLabel}</p>
              </div>
              <div className="salary-breakdown-item">
                <p className="salary-breakdown-label">Selected skills</p>
                <p className="salary-breakdown-value">{selectedCount}</p>
              </div>
              <div className="salary-breakdown-item">
                <p className="salary-breakdown-label">Skill uplift</p>
                <p className="salary-breakdown-value">+{Math.round(adjustedSkillImpact * 100)}%</p>
              </div>
              <div className="salary-breakdown-item">
                <p className="salary-breakdown-label">Benchmark model</p>
                <p className="salary-breakdown-value">US developer baseline</p>
              </div>
            </div>
          </article>

          <article className="card salary-guidance-card">
            <p className="landing-kicker">How to use it</p>
            <h2 className="section-title">Use this as a benchmark, not a promise</h2>
            <div className="salary-guidance-list">
              <div className="salary-guidance-item">
                Compare the estimate to the salary fields in your tracked applications.
              </div>
              <div className="salary-guidance-item">
                Adjust the selected stack to reflect the role you are targeting, not just your resume.
              </div>
              <div className="salary-guidance-item">
                Use the range to decide whether a posting is below-market, on-market, or stretch compensation.
              </div>
            </div>
          </article>
        </aside>
      </section>
    </div>
  );
}
