export default function Playground() {
    return (
        <div className="page playground-grid">
            <section className="card">
                <h2 className="section-title">Input Lab</h2>
                <div className="form-stack">
                    <div className="field">
                        <label className="label">Text</label>
                        <input className="input" />
                    </div>

                    <div className="field">
                        <label className="label">Email</label>
                        <input type="email" className="input" />
                    </div>

                    <div className="field">
                        <label className="label">Date</label>
                        <input type="date" className="input" />
                    </div>

                    <div className="field">
                        <label className="label">Range</label>
                        <input type="range" className="range" />
                    </div>

                    <div className="field">
                        <label className="label">Color</label>
                        <input type="color" className="color-input" />
                    </div>

                    <div className="field">
                        <label className="label">Textarea</label>
                        <textarea rows="3" className="input" />
                    </div>
                </div>
            </section>

            <section className="card">
                <h2 className="section-title">Preview Panel</h2>
                <div className="preview-panel">
                    <div className="stats-grid">
                        {[
                            { label: "Total", value: "24" },
                            { label: "Applied", value: "10" },
                            { label: "Interview", value: "6" },
                            { label: "Offer", value: "2" },
                        ].map((stat) => (
                            <div key={stat.label} className="stat-card">
                                <p className="stat-label">{stat.label}</p>
                                <p className="stat-value">{stat.value}</p>
                            </div>
                        ))}
                    </div>

                    <div className="card table-card" style={{ marginTop: 16 }}>
                        <div className="table-header">
                            <h3 className="section-title">Recent Applications</h3>
                        </div>
                        <div className="table-wrap">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Full Name</th>
                                        <th>Position</th>
                                        <th>Status</th>
                                        <th>Created</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        {
                                            name: "Alicia Long",
                                            role: "Frontend Engineer",
                                            status: "APPLIED",
                                            date: "2026-01-18",
                                        },
                                        {
                                            name: "Marcus Hale",
                                            role: "Backend Engineer",
                                            status: "INTERVIEW",
                                            date: "2026-01-20",
                                        },
                                        {
                                            name: "Noah Singh",
                                            role: "Platform Engineer",
                                            status: "OFFER",
                                            date: "2026-01-21",
                                        },
                                    ].map((row) => (
                                        <tr key={row.name}>
                                            <td>{row.name}</td>
                                            <td>{row.role}</td>
                                            <td>
                                                <span
                                                    className={`status-badge ${row.status.toLowerCase()}`}
                                                >
                                                    {row.status}
                                                </span>
                                            </td>
                                            <td>{row.date}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
