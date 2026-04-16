import { useState } from "react";
import { apiFetchJson, getToken } from "../Api/Client.js";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/ToastProvider.jsx";

export default function ApplicationForm() {
    const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";
    const [form, setForm] = useState({
        fullName: "",
        email: "",
        phone: "",
        position: "",
        appliedDate: "",
        workType: "Onsite",
        status: "APPLIED",
        coverLetter: "",
        yearsExperience: "",
        availableFrom: "",
        salaryExpectation: "",
        notes: "",
        portfolioUrl: "",
        linkedinUrl: "",
        remoteOk: false,
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [resumeFile, setResumeFile] = useState(null);
    const [resumeCategory, setResumeCategory] = useState("");
    const [resumeSubcategory, setResumeSubcategory] = useState("");
    const navigate = useNavigate();
    const { addToast } = useToast();

    function resetForm() {
        setForm({
            fullName: "",
            email: "",
            phone: "",
            position: "",
            appliedDate: "",
            workType: "Onsite",
            status: "APPLIED",
            coverLetter: "",
            yearsExperience: "",
            availableFrom: "",
            salaryExpectation: "",
            notes: "",
            portfolioUrl: "",
            linkedinUrl: "",
            remoteOk: false,
        });
        setResumeFile(null);
        setResumeCategory("");
        setResumeSubcategory("");
        setError("");
    }

    function updateField(name, value) {
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setLoading(true);
        try {
            if (!form.fullName.trim()) {
                throw new Error("Full name is required");
            }
            if (!form.email.trim()) {
                throw new Error("Email is required");
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
                throw new Error("Enter a valid email address");
            }
            if (!form.phone.trim()) {
                throw new Error("Phone is required");
            }
            if (!form.position.trim()) {
                throw new Error("Position is required");
            }
            if (form.yearsExperience === "" || Number.isNaN(Number(form.yearsExperience))) {
                throw new Error("Years of experience is required");
            }
            const payload = {
                fullName: form.fullName.trim(),
                email: form.email.trim(),
                phone: form.phone.trim(),
                position: form.position.trim(),
                appliedDate: form.appliedDate || null,
                workType: form.workType || null,
                status: form.status || "APPLIED",
                coverLetter: form.coverLetter.trim(),
                yearsExperience:
                    form.yearsExperience === "" ? 0 : Number(form.yearsExperience),
                availableFrom: form.availableFrom || null,
                salaryExpectation:
                    form.salaryExpectation === "" ? null : Number(form.salaryExpectation),
                notes: form.notes.trim(),
                portfolioUrl: form.portfolioUrl.trim(),
                linkedinUrl: form.linkedinUrl.trim(),
                remoteOk: Boolean(form.remoteOk),
            };
            const created = await apiFetchJson("/api/applications", {
                method: "POST",
                body: JSON.stringify(payload),
            });
            if (resumeFile && created?.id) {
                const formData = new FormData();
                formData.append("file", resumeFile);
                if (resumeCategory) formData.append("category", resumeCategory);
                if (resumeSubcategory) formData.append("subcategory", resumeSubcategory);

                const resumeRes = await fetch(
                    `${API_BASE}/api/applications/${created.id}/resume`,
                    {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${getToken()}`,
                        },
                        body: formData,
                    }
                );
                if (!resumeRes.ok) {
                    const resumeError = await resumeRes.json().catch(() => ({}));
                    throw new Error(
                        resumeError.message || "Failed to upload resume"
                    );
                }
            }
            addToast("Application created.", "success");
            if (created?.id) {
                navigate(`/applications/${created.id}`);
            } else {
                navigate("/dashboard");
            }
        } catch (err) {
            setError(err.message || "Failed to create application");
            addToast("Failed to create application.", "error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form className="page" onSubmit={handleSubmit}>
            <header className="page-header page-header--stack">
                <div>
                    <h1 className="page-title">New Application</h1>
                    <p className="page-subtitle">
                        Fill out the sections below to submit your application.
                    </p>
                </div>
            </header>

            {error && <p className="form-error">{error}</p>}

            <section className="card form-section">
                <h2 className="section-title">Applicant Info</h2>
                <div className="form-grid">
                    <div className="field">
                        <label className="label">Full Name</label>
                        <input
                            type="text"
                            placeholder="Jane Doe"
                            className="input"
                            value={form.fullName}
                            onChange={(event) =>
                                updateField("fullName", event.target.value)
                            }
                            required
                        />
                    </div>

                    <div className="field">
                        <label className="label">Email</label>
                        <input
                            type="email"
                            placeholder="jane@example.com"
                            className="input"
                            value={form.email}
                            onChange={(event) =>
                                updateField("email", event.target.value)
                            }
                            required
                        />
                    </div>

                    <div className="field">
                        <label className="label">Phone</label>
                        <input
                            type="tel"
                            placeholder="+1 555 123 4567"
                            className="input"
                            value={form.phone}
                            onChange={(event) =>
                                updateField("phone", event.target.value)
                            }
                            required
                        />
                    </div>

                    <div className="field">
                        <label className="label">Portfolio URL</label>
                        <input
                            type="url"
                            placeholder="https://portfolio.com"
                            className="input"
                            value={form.portfolioUrl}
                            onChange={(event) =>
                                updateField("portfolioUrl", event.target.value)
                            }
                        />
                    </div>

                    <div className="field span-2">
                        <label className="label">LinkedIn</label>
                        <input
                            type="url"
                            placeholder="https://linkedin.com/in/username"
                            className="input"
                            value={form.linkedinUrl}
                            onChange={(event) =>
                                updateField("linkedinUrl", event.target.value)
                            }
                        />
                    </div>

                </div>
            </section>

            <section className="card form-section">
                <h2 className="section-title">Job Details</h2>
                <div className="form-grid">
                    <div className="field">
                        <label className="label">Position</label>
                        <input
                            type="text"
                            placeholder="Frontend Engineer"
                            className="input"
                            value={form.position}
                            onChange={(event) =>
                                updateField("position", event.target.value)
                            }
                            required
                        />
                    </div>

                    <div className="field">
                        <label className="label">Applied Date</label>
                        <input
                            type="date"
                            className="input"
                            value={form.appliedDate}
                            onChange={(event) =>
                                updateField("appliedDate", event.target.value)
                            }
                        />
                    </div>

                    <div className="field">
                        <label className="label">Available From</label>
                        <input
                            type="date"
                            className="input"
                            value={form.availableFrom}
                            onChange={(event) =>
                                updateField("availableFrom", event.target.value)
                            }
                        />
                    </div>

                    <div className="field">
                        <label className="label">Work Type</label>
                        <select
                            className="input"
                            value={form.workType}
                            onChange={(event) =>
                                updateField("workType", event.target.value)
                            }
                        >
                            <option value="Onsite">Onsite</option>
                            <option value="Hybrid">Hybrid</option>
                            <option value="Remote">Remote</option>
                        </select>
                    </div>

                    <div className="field span-2">
                        <label className="label">Status</label>
                        <div className="option-group">
                            {["APPLIED", "INTERVIEW", "OFFER", "REJECTED"].map(
                                (status) => (
                                    <label key={status} className="option">
                                        <input
                                            type="radio"
                                            name="status"
                                            value={status}
                                            checked={form.status === status}
                                            onChange={(event) =>
                                                updateField("status", event.target.value)
                                            }
                                        />
                                        {status}
                                    </label>
                                )
                            )}
                        </div>
                    </div>

                    <div className="field span-2">
                        <label className="option option-inline">
                            <input
                                type="checkbox"
                                checked={form.remoteOk}
                                onChange={(event) =>
                                    updateField("remoteOk", event.target.checked)
                                }
                            />
                            Remote OK
                        </label>
                    </div>

                    <div className="field span-2">
                        <label className="label">Cover Letter</label>
                        <textarea
                            rows="4"
                            placeholder="Add a short cover letter..."
                            className="input"
                            value={form.coverLetter}
                            onChange={(event) =>
                                updateField("coverLetter", event.target.value)
                            }
                        />
                    </div>

                </div>
            </section>

            <section className="card form-section">
                <h2 className="section-title">Experience & Preferences</h2>
                <div className="form-grid">
                    <div className="field">
                        <label className="label">Years Experience</label>
                        <input
                            type="number"
                            min="0"
                            placeholder="3"
                            className="input"
                            value={form.yearsExperience}
                            onChange={(event) =>
                                updateField("yearsExperience", event.target.value)
                            }
                            required
                        />
                    </div>

                    <div className="field">
                        <label className="label">Preferred Start Time</label>
                        <input
                            type="time"
                            className="input"
                        />
                    </div>

                    <div className="field">
                        <label className="label">Notice Period (week)</label>
                        <input
                            type="week"
                            className="input"
                        />
                    </div>

                    <div className="field">
                        <label className="label">Preferred Start Month</label>
                        <input
                            type="month"
                            className="input"
                        />
                    </div>

                    <div className="field span-2">
                        <label className="label">Salary Expectation</label>
                        <input
                            type="range"
                            min="30000"
                            max="150000"
                            step="5000"
                            className="range"
                            value={form.salaryExpectation || 30000}
                            onChange={(event) =>
                                updateField("salaryExpectation", event.target.value)
                            }
                        />
                        <p className="helper-text">Use slider to set expected salary.</p>
                    </div>

                    <div className="field span-2">
                        <label className="label">Notes</label>
                        <textarea
                            rows="4"
                            placeholder="Any additional notes..."
                            className="input"
                            value={form.notes}
                            onChange={(event) =>
                                updateField("notes", event.target.value)
                            }
                        />
                    </div>

                </div>
            </section>

            <section className="card form-section">
                <h2 className="section-title">Resume Upload</h2>
                <div className="form-grid">
                    <div className="field">
                        <label className="label">Resume File</label>
                        <input
                            type="file"
                            className="input"
                            onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                        />
                        {resumeFile && (
                            <p className="page-subtitle">
                                Selected: {resumeFile.name} (
                                {Math.round(resumeFile.size / 1024)} KB)
                            </p>
                        )}
                    </div>

                    <div className="field">
                        <label className="label">Category</label>
                        <select className="input"
                        value={resumeCategory}
                        onChange={(e) => setResumeCategory(e.target.value)}>
                            <optgroup label="Engineering">
                                <option>Frontend</option>
                                <option>Backend</option>
                                <option>Platform Engineer</option>
                            </optgroup>
                            <optgroup label="Design">
                                <option>UI/UX</option>
                                <option>Graphic</option>
                            </optgroup>
                            <optgroup label="Management">
                                <option>Product</option>
                                <option>Project</option>
                            </optgroup>
                        </select>
                    </div>

                    <div className="field span-2">
                        <label className="label">Subcategory</label>
                        <input
                            type="text"
                            list="subcategory-list"
                            placeholder="Pick or type a subcategory"
                            className="input"
                            value={resumeSubcategory}
                            onChange={(e) => setResumeSubcategory(e.target.value)}
                        />
                        <datalist id="subcategory-list">
                            <option value="React"/>
                            <option value="Spring Boot"/>
                            <option value="DevOps"/>
                            <option value="Data Engineer"/>
                        </datalist>
                    </div>

                </div>
            </section>

            <section className="card form-section">
                <h2 className="section-title">Extras (Practice)</h2>
                <div className="form-grid">
                    <div className="field">
                        <label className="label">Theme Color</label>
                        <input type="color" className="color-input"/>
                    </div>

                    <div className="field">
                        <label className="label">Search Keyword</label>
                        <input
                            type="search"
                            placeholder="Search..."
                            className="input"
                        />
                    </div>

                    <div className="field">
                        <label className="label">Read‑only Example</label>
                        <input
                            type="text"
                            value="Read only field"
                            readOnly
                            className="input input-muted"
                        />
                    </div>

                    <div className="field">
                        <label className="label">Disabled Example</label>
                        <input
                            type="text"
                            value="Disabled field"
                            disabled
                            className="input input-muted"
                        />
                    </div>

                    <input type="hidden" value="hidden-value"/>

                </div>
            </section>

            <section className="form-actions">
                <button className="btn-primary" type="submit" disabled={loading}>
                    {loading ? "Submitting..." : "Submit"}
                </button>
                <button className="btn-outline" type="button">
                    Save Draft
                </button>
                <button className="btn-outline" type="button" onClick={resetForm}>
                    Reset
                </button>

            </section>
        </form>
    );
}
