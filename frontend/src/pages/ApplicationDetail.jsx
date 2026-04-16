import {useEffect, useMemo, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import { apiFetchBlob, apiFetchJson, getToken } from "../Api/Client.js";
import { formatDate, formatDateInput, formatDateTime } from "../utils/date.js";
import { useToast } from "../components/ToastProvider.jsx";

export default function ApplicationDetail() {
    const {id} = useParams();
    const navigate = useNavigate();
    const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";
    const [application, setApplication] = useState(null);
    const [form, setForm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    const [resumeUploading, setResumeUploading] = useState(false);
    const [resumeFile, setResumeFile] = useState(null);
    const [resumeMessage, setResumeMessage] = useState("");
    const [saveMessage, setSaveMessage] = useState("");
    const { addToast } = useToast();
    useEffect(() => {
        let ignore = false;
        setLoading(true);
        apiFetchJson(`/api/applications/${id}`)
            .then((data) => {
                if (!ignore) {
                    setApplication(data);
                    setForm({
                        fullName: data.fullName || "",
                        email: data.email || "",
                        phone: data.phone || "",
                        position: data.position || "",
                        portfolioUrl: data.portfolioUrl || "",
                        linkedinUrl: data.linkedinUrl || "",
                        appliedDate: data.appliedDate || "",
                        workType: data.workType || "",
                        status: data.status || "APPLIED",
                        coverLetter: data.coverLetter || "",
                        notes: data.notes || "",
                        yearsExperience: data.yearsExperience ?? "",
                        availableFrom: data.availableFrom || "",
                        salaryExpectation: data.salaryExpectation ?? "",
                    });
                }
            })
            .catch((err) => {
                if (!ignore) setError(err.message);
            })
            .finally(() => {
                if (!ignore) setLoading(false);
            });
        return () => {
            ignore = true;
        };
    }, [id]);

    function updateField(name, value) {
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    useEffect(() => {
        if (!saveMessage && !resumeMessage) return;
        const timeout = setTimeout(() => {
            setSaveMessage("");
            setResumeMessage("");
        }, 3000);
        return () => clearTimeout(timeout);
    }, [saveMessage, resumeMessage]);

    const timelineItems = useMemo(() => {
        if (!application) return [];

        const items = [];
        const normalizedStatus = String(application.status || "").toUpperCase();
        const statusCopy = {
            APPLIED: {
                title: "Application submitted",
                detail: "The opportunity is now in your active pipeline.",
            },
            INTERVIEW: {
                title: "Interview stage reached",
                detail: "This role has moved beyond the initial application stage.",
            },
            OFFER: {
                title: "Offer received",
                detail: "This application resulted in an offer.",
            },
            REJECTED: {
                title: "Application closed",
                detail: "This role is marked as rejected.",
            },
        };

        if (application.createdAt) {
            items.push({
                key: "created",
                tone: "default",
                date: application.createdAt,
                title: "Application record created",
                detail: "This entry was added to your tracker.",
            });
        }

        if (application.appliedDate) {
            items.push({
                key: "applied",
                tone: "applied",
                date: application.appliedDate,
                title: "Applied to role",
                detail: application.position
                    ? `Application submitted for ${application.position}.`
                    : "Application submitted.",
            });
        }

        if (application.resumeUploadedAt) {
            items.push({
                key: "resume",
                tone: "cool",
                date: application.resumeUploadedAt,
                title: "Resume uploaded",
                detail: application.resumeFileName
                    ? `${application.resumeFileName} attached to this application.`
                    : "Resume attached to this application.",
            });
        }

        if (normalizedStatus && statusCopy[normalizedStatus]) {
            items.push({
                key: "status",
                tone: normalizedStatus.toLowerCase(),
                date: application.resumeUploadedAt || application.appliedDate || application.createdAt,
                title: statusCopy[normalizedStatus].title,
                detail: statusCopy[normalizedStatus].detail,
            });
        }

        return items.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
    }, [application]);

    const detailInsights = useMemo(() => {
        if (!application) return [];

        const lastActivityTimestamp = Math.max(
            new Date(application.createdAt || 0).getTime(),
            new Date(application.resumeUploadedAt || 0).getTime()
        );
        const daysSinceActivity = lastActivityTimestamp
            ? Math.floor((Date.now() - lastActivityTimestamp) / (1000 * 60 * 60 * 24))
            : null;

        return [
            {
                label: "Current status",
                value: application.status || "—",
                accent: true,
            },
            {
                label: "Work type",
                value: application.workType || "—",
            },
            {
                label: "Last activity",
                value: lastActivityTimestamp ? formatDate(lastActivityTimestamp) : "—",
            },
            {
                label: "Next action",
                value:
                    daysSinceActivity !== null && daysSinceActivity >= 14
                        ? "Send follow-up"
                        : "Keep monitoring",
            },
        ];
    }, [application]);

    const isDirty = useMemo(() => {
        if (!application || !form) return false;
        const normalizeNumber = (value) =>
            value === "" || value === null || value === undefined
                ? ""
                : Number(value);
        return (
            (form.fullName || "") !== (application.fullName || "") ||
            (form.email || "") !== (application.email || "") ||
            (form.phone || "") !== (application.phone || "") ||
            (form.position || "") !== (application.position || "") ||
            (form.portfolioUrl || "") !== (application.portfolioUrl || "") ||
            (form.linkedinUrl || "") !== (application.linkedinUrl || "") ||
            formatDateInput(form.appliedDate) !==
                formatDateInput(application.appliedDate) ||
            (form.workType || "") !== (application.workType || "") ||
            (form.status || "APPLIED") !== (application.status || "APPLIED") ||
            (form.coverLetter || "") !== (application.coverLetter || "") ||
            (form.notes || "") !== (application.notes || "") ||
            normalizeNumber(form.yearsExperience) !==
                normalizeNumber(application.yearsExperience) ||
            formatDateInput(form.availableFrom) !==
                formatDateInput(application.availableFrom) ||
            normalizeNumber(form.salaryExpectation) !==
                normalizeNumber(application.salaryExpectation)
        );
    }, [application, form]);

    async function handleSave() {
        if (!form) return;
        setSaving(true);
        setError("");
        setSaveMessage("");
        try {
            if (!form.fullName?.trim()) {
                throw new Error("Full name is required");
            }
            if (!form.email?.trim()) {
                throw new Error("Email is required");
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
                throw new Error("Enter a valid email address");
            }
            if (!form.phone?.trim()) {
                throw new Error("Phone is required");
            }
            if (!form.position?.trim()) {
                throw new Error("Position is required");
            }
            if (
                form.yearsExperience === "" ||
                Number.isNaN(Number(form.yearsExperience))
            ) {
                throw new Error("Years of experience is required");
            }
            const payload = {
                fullName: form.fullName?.trim() || "",
                email: form.email?.trim() || "",
                phone: form.phone?.trim() || "",
                position: form.position?.trim() || "",
                portfolioUrl: form.portfolioUrl?.trim() || "",
                linkedinUrl: form.linkedinUrl?.trim() || "",
                appliedDate: form.appliedDate || null,
                workType: form.workType || null,
                status: form.status || "APPLIED",
                coverLetter: form.coverLetter?.trim() || "",
                notes: form.notes?.trim() || "",
                yearsExperience:
                    form.yearsExperience === "" ? 0 : Number(form.yearsExperience),
                availableFrom: form.availableFrom || null,
                salaryExpectation:
                    form.salaryExpectation === "" ? null : Number(form.salaryExpectation),
            };
            const updated = await apiFetchJson(`/api/applications/${id}`, {
                method: "PUT",
                body: JSON.stringify(payload),
            });
            setApplication(updated);
            setForm({
                fullName: updated.fullName || "",
                email: updated.email || "",
                phone: updated.phone || "",
                position: updated.position || "",
                portfolioUrl: updated.portfolioUrl || "",
                linkedinUrl: updated.linkedinUrl || "",
                appliedDate: updated.appliedDate || "",
                workType: updated.workType || "",
                status: updated.status || "APPLIED",
                coverLetter: updated.coverLetter || "",
                notes: updated.notes || "",
                yearsExperience: updated.yearsExperience ?? "",
                availableFrom: updated.availableFrom || "",
                salaryExpectation: updated.salaryExpectation ?? "",
            });
            setSaveMessage("Changes saved.");
            addToast("Changes saved.", "success");
        } catch (err) {
            setError(err.message || "Failed to update application");
            addToast("Failed to update application.", "error");
        } finally {
            setSaving(false);
        }
    }

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    async function handleDelete() {
        if (!id) return;
        setError("");
        setSaveMessage("");
        setResumeMessage("");
        setLoading(true);
        const fallbackPath = `/applications/${id}`;
        try {
            navigate("/dashboard");
            await apiFetchJson(`/api/applications/${id}`, {
                method: "DELETE",
            });
            addToast("Application deleted.", "success");
        } catch (err) {
            setError(err.message || "Failed to delete application");
            addToast("Failed to delete application.", "error");
            navigate(fallbackPath);
            setLoading(false);
        }
    }

    async function handleResumeDownload() {
        if (!id) return;
        setError("");
        setResumeMessage("");
        try {
            const blob = await apiFetchBlob(`/api/applications/${id}/resume`);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = application?.resumeFileName || "resume";
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            setResumeMessage("Resume download started.");
            addToast("Resume download started.", "success");
        } catch (err) {
            setError(err.message || "Failed to download resume");
            addToast("Failed to download resume.", "error");
        }
    }

    async function handleResumeUpload() {
        if (!resumeFile || !id) return;
        setResumeUploading(true);
        setError("");
        setResumeMessage("");
        try {
            const formData = new FormData();
            formData.append("file", resumeFile);

            const response = await fetch(`${API_BASE}/api/applications/${id}/resume`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                },
                body: formData,
            });
            if (!response.ok) {
                const resumeError = await response.json().catch(() => ({}));
                throw new Error(resumeError.message || "Failed to upload resume");
            }
            const updated = await response.json().catch(() => null);
            if (updated) {
                setApplication(updated);
            }
            setResumeFile(null);
            setResumeMessage("Resume uploaded successfully.");
            addToast("Resume uploaded successfully.", "success");
        } catch (err) {
            setError(err.message || "Failed to upload resume");
            addToast("Failed to upload resume.", "error");
        } finally {
            setResumeUploading(false);
        }
    }

    return (
        <div className="page">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Application Detail</h1>
                    <p className="page-subtitle">
                        Review and update your application.
                    </p>
                </div>
                <button
                    className="btn-primary"
                    onClick={handleSave}
                    disabled={saving || loading || !form || !isDirty}
                >
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </header>

            {loading && (
                <div className="card">
                    <div className="skeleton skeleton-title" />
                    <div className="skeleton skeleton-row" />
                    <div className="skeleton skeleton-row" />
                    <div className="skeleton skeleton-row" />
                </div>
            )}
            {error && !loading && <p className="form-error">{error}</p>}
            {saveMessage && !error && (
                <p className="form-success">{saveMessage}</p>
            )}
            {resumeMessage && !error && (
                <p className="form-success">{resumeMessage}</p>
            )}

            <section className="application-detail-grid">
                <article className="card">
                    <h2 className="section-title">Summary</h2>
                    <div className="summary-grid">
                        <div>
                            <p className="meta-label">Candidate</p>
                            <p className="meta-value">{application?.fullName || "—"}</p>
                        </div>
                        <div>
                            <p className="meta-label">Role</p>
                            <p className="meta-value">{application?.position || "—"}</p>
                        </div>
                        <div>
                            <p className="meta-label">Status</p>
                            <p className="meta-value">
                                <span
                                    className={`status-badge ${String(
                                        application?.status || ""
                                    ).toLowerCase()}`}
                                >
                                    {application?.status || "—"}
                                </span>
                            </p>
                        </div>
                        <div>
                            <p className="meta-label">Applied</p>
                            <p className="meta-value">
                                {formatDate(application?.appliedDate || application?.createdAt)}
                            </p>
                        </div>
                        <div>
                            <p className="meta-label">Resume</p>
                            <p className="meta-value">{application?.resumeFileName || "—"}</p>
                        </div>
                        <div>
                            <p className="meta-label">Resume Size</p>
                            <p className="meta-value">
                                {application?.resumeSize
                                    ? `${Math.round(application.resumeSize / 1024)} KB`
                                    : "—"}
                            </p>
                        </div>
                        <div>
                            <p className="meta-label">Resume Type</p>
                            <p className="meta-value">{application?.resumeContentType || "—"}</p>
                        </div>
                        <div>
                            <p className="meta-label">Uploaded</p>
                            <p className="meta-value">
                                {formatDate(application?.resumeUploadedAt)}
                            </p>
                        </div>
                    </div>

                    <div className="application-insight-grid">
                        {detailInsights.map((item) => (
                            <div key={item.label} className="application-insight-card">
                                <p className="meta-label">{item.label}</p>
                                <p className={`meta-value${item.accent ? " accent" : ""}`}>
                                    {item.value}
                                </p>
                            </div>
                        ))}
                    </div>
                </article>

                <article className="card application-timeline-card">
                    <div className="table-header">
                        <div>
                            <h2 className="section-title">Activity Timeline</h2>
                            <p className="dashboard-section-copy">
                                A quick history of how this application has moved through your workflow.
                            </p>
                        </div>
                    </div>

                    <div className="application-timeline">
                        {timelineItems.map((item) => (
                            <div key={item.key} className="application-timeline-item">
                                <div className={`application-timeline-dot ${item.tone}`} />
                                <div className="application-timeline-content">
                                    <p className="application-timeline-date">
                                        {formatDateTime(item.date)}
                                    </p>
                                    <p className="application-timeline-title">{item.title}</p>
                                    <p className="application-timeline-copy">{item.detail}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </article>
            </section>

            <section className="card form-section">
                <h2 className="section-title">Update Application</h2>
                <div className="form-grid">
                    <div className="field">
                        <label className="label">Full Name</label>
                        <input
                            type="text"
                            className="input"
                            value={form?.fullName || ""}
                            onChange={(e) => updateField("fullName", e.target.value)}
                        />
                    </div>
                    <div className="field">
                        <label className="label">Email</label>
                        <input
                            type="email"
                            className="input"
                            value={form?.email || ""}
                            onChange={(e) => updateField("email", e.target.value)}
                        />
                    </div>
                    <div className="field">
                        <label className="label">Phone</label>
                        <input
                            type="tel"
                            className="input"
                            value={form?.phone || ""}
                            onChange={(e) => updateField("phone", e.target.value)}
                        />
                    </div>
                    <div className="field">
                        <label className="label">Portfolio URL</label>
                        <input
                            type="url"
                            className="input"
                            value={form?.portfolioUrl || ""}
                            onChange={(e) => updateField("portfolioUrl", e.target.value)}
                        />
                    </div>
                    <div className="field">
                        <label className="label">LinkedIn</label>
                        <input
                            type="url"
                            className="input"
                            value={form?.linkedinUrl || ""}
                            onChange={(e) => updateField("linkedinUrl", e.target.value)}
                        />
                    </div>
                    <div className="field">
                        <label className="label">Position</label>
                        <input
                            type="text"
                            className="input"
                            value={form?.position || ""}
                            onChange={(e) => updateField("position", e.target.value)}
                        />
                    </div>
                    <div className="field">
                        <label className="label">Applied Date</label>
                        <input
                            type="date"
                            className="input"
                            value={formatDateInput(form?.appliedDate)}
                            onChange={(e) => updateField("appliedDate", e.target.value)}
                        />
                    </div>
                    <div className="field">
                        <label className="label">Work Type</label>
                        <select
                            className="input"
                            value={form?.workType || ""}
                            onChange={(e) => updateField("workType", e.target.value)}
                        >
                            <option value="">Select work type</option>
                            <option value="Onsite">Onsite</option>
                            <option value="Hybrid">Hybrid</option>
                            <option value="Remote">Remote</option>
                        </select>
                    </div>
                    <div className="field">
                        <label className="label">Status</label>
                        <select
                            className="input"
                            value={form?.status || "APPLIED"}
                            onChange={(e) => updateField("status", e.target.value)}
                        >
                            <option value="APPLIED">Applied</option>
                            <option value="INTERVIEW">Interview</option>
                            <option value="OFFER">Offer</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                        <span
                            className={`status-badge ${String(
                                form?.status || ""
                            ).toLowerCase()}`}
                        >
                            {form?.status || "APPLIED"}
                        </span>
                    </div>
                    <div className="field">
                        <label className="label">Years Experience</label>
                        <input
                            type="number"
                            min="0"
                            className="input"
                            value={form?.yearsExperience ?? ""}
                            onChange={(e) => updateField("yearsExperience", e.target.value)}
                        />
                    </div>
                    <div className="field">
                        <label className="label">Salary Expectation</label>
                        <input
                            type="number"
                            min="0"
                            className="input"
                            value={form?.salaryExpectation ?? ""}
                            onChange={(e) =>
                                updateField("salaryExpectation", e.target.value)
                            }
                        />
                    </div>
                    <div className="field">
                        <label className="label">Available From</label>
                        <input
                            type="date"
                            className="input"
                            value={formatDateInput(form?.availableFrom)}
                            onChange={(e) => updateField("availableFrom", e.target.value)}
                        />
                    </div>
                    <div className="field span-2">
                        <label className="label">Cover Letter</label>
                        <textarea
                            rows="4"
                            className="input"
                            value={form?.coverLetter || ""}
                            onChange={(e) => updateField("coverLetter", e.target.value)}
                        />
                    </div>
                    <div className="field span-2">
                        <label className="label">Notes</label>
                        <textarea
                            rows="4"
                            className="input"
                            value={form?.notes || ""}
                            onChange={(e) => updateField("notes", e.target.value)}
                        />
                    </div>
                </div>
            </section>

            <section className="form-actions">
                <button
                    className="btn-outline"
                    onClick={handleResumeDownload}
                    disabled={loading || !application?.resumeFileName}
                >
                    Download Resume
                </button>
                <label className="btn-outline">
                    <input
                        type="file"
                        className="sr-only"
                        onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                    />
                    Choose Resume
                </label>
                <button
                    className="btn-outline"
                    onClick={handleResumeUpload}
                    disabled={!resumeFile || resumeUploading}
                >
                    {resumeUploading ? "Uploading..." : "Upload New Resume"}
                </button>
                <button className="btn-danger" onClick={() => setShowDeleteConfirm(true)}>
                    Delete Application
                </button>
            </section>

            {showDeleteConfirm && (
                <div className="modal-overlay" role="dialog" aria-modal="true">
                    <div className="modal">
                        <h3 className="section-title">Delete application?</h3>
                        <p className="page-subtitle">
                            This action cannot be undone.
                        </p>
                        <div className="form-actions">
                            <button
                                className="btn-outline"
                                type="button"
                                onClick={() => setShowDeleteConfirm(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn-danger"
                                type="button"
                                onClick={() => {
                                    setShowDeleteConfirm(false);
                                    handleDelete();
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
