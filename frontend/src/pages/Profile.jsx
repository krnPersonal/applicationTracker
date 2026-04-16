import { useEffect, useState } from "react";
import { apiFetchBlob, apiFetchJson, getToken } from "../Api/Client.js";
import { useToast } from "../components/ToastProvider.jsx";
import { formatDateTime } from "../utils/date.js";

export default function Profile() {
    const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";
    const [me, setMe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [downloading, setDownloading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [showManage, setShowManage] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imageUploading, setImageUploading] = useState(false);
    const [profileImageUrl, setProfileImageUrl] = useState("");
    const { addToast } = useToast();
    const [profileForm, setProfileForm] = useState({
        firstName: "",
        lastName: "",
    });
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const displayName = [me?.firstName, me?.middleName, me?.lastName]
        .filter(Boolean)
        .join(" ") || me?.email?.split("@")[0] || "—";

    useEffect(() => {
        let ignore = false;
        setLoading(true);
        let objectUrl = "";
        apiFetchJson("/api/me")
            .then((data) => {
                if (!ignore) {
                    setMe(data);
                    setProfileForm({
                        firstName: data.firstName || "",
                        lastName: data.lastName || "",
                    });
                    if (data?.profileImageUrl) {
                        apiFetchBlob(data.profileImageUrl)
                            .then((blob) => {
                                objectUrl = URL.createObjectURL(blob);
                                setProfileImageUrl(objectUrl);
                            })
                            .catch(() => setProfileImageUrl(""));
                    } else {
                        setProfileImageUrl("");
                    }
                }
            })
            .catch((err) => {
                if (!ignore) setError(err.message || "Failed to load profile");
            })
            .finally(() => {
                if (!ignore) setLoading(false);
            });
        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
            ignore = true;
        };
    }, []);

    async function handleDownload() {
        setDownloading(true);
        setError("");
        setMessage("");
        try {
            const blob = await apiFetchBlob("/api/applications/report");
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "applications-report.pdf";
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            setError(err.message || "Failed to download report");
        } finally {
            setDownloading(false);
        }
    }

    async function handleProfileSave(event) {
        event.preventDefault();
        setSaving(true);
        setError("");
        setMessage("");
        try {
            const updated = await apiFetchJson("/api/me", {
                method: "PUT",
                body: JSON.stringify(profileForm),
            });
            setMe(updated);
            setMessage("Profile updated.");
            setLastUpdated(new Date().toISOString());
            addToast("Profile updated.", "success");
        } catch (err) {
            setError(err.message || "Failed to update profile");
            addToast("Failed to update profile.", "error");
        } finally {
            setSaving(false);
        }
    }

    async function handlePasswordChange(event) {
        event.preventDefault();
        setSaving(true);
        setError("");
        setMessage("");
        try {
            if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                throw new Error("Passwords do not match");
            }
            await apiFetchJson("/api/me/password", {
                method: "PUT",
                body: JSON.stringify({
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword,
                }),
            });
            setMessage("Password updated.");
            setLastUpdated(new Date().toISOString());
            addToast("Password updated.", "success");
            setPasswordForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        } catch (err) {
            setError(err.message || "Failed to update password");
            addToast("Failed to update password.", "error");
        } finally {
            setSaving(false);
        }
    }

    async function handleImageUpload(event) {
        event.preventDefault();
        if (!imageFile) return;
        setImageUploading(true);
        setError("");
        setMessage("");
        try {
            const formData = new FormData();
            formData.append("file", imageFile);
            const res = await fetch(`${API_BASE}/api/me/profile-image`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                },
                body: formData,
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || "Failed to upload profile image");
            }
            const updated = await res.json();
            setMe(updated);
            if (updated?.profileImageUrl) {
                const blob = await apiFetchBlob(updated.profileImageUrl);
                const url = URL.createObjectURL(blob);
                setProfileImageUrl(url);
            } else {
                setProfileImageUrl("");
            }
            setMessage("Profile image updated.");
            setImageFile(null);
            setLastUpdated(new Date().toISOString());
            addToast("Profile image updated.", "success");
        } catch (err) {
            setError(err.message || "Failed to upload profile image");
            addToast("Failed to upload profile image.", "error");
        } finally {
            setImageUploading(false);
        }
    }

    return (
        <div className="page">
            <header className="page-header page-header--stack">
                <div>
                    <h1 className="page-title">Profile</h1>
                    <p className="page-subtitle">
                        Manage your account and download reports.
                    </p>
                </div>
            </header>

            {loading && (
                <div className="card">
                    <div className="skeleton skeleton-title" />
                    <div className="skeleton skeleton-row" />
                    <div className="skeleton skeleton-row" />
                </div>
            )}
            {error && !loading && <p className="form-error">{error}</p>}
            {message && !error && <p className="form-success">{message}</p>}

            <section className="card">
                <h2 className="section-title">User Info</h2>
                <div className="summary-grid">
                    <div>
                        <p className="meta-label">Email</p>
                        <p className="meta-value">{me?.email || "—"}</p>
                    </div>
                    <div>
                        <p className="meta-label">Name</p>
                        <p className="meta-value">{displayName}</p>
                    </div>
                    <div>
                        <p className="meta-label">Role</p>
                        <p className="meta-value">{me?.role || "User"}</p>
                    </div>
                    <div>
                        <p className="meta-label">Member since</p>
                        <p className="meta-value">{me?.createdAt || "—"}</p>
                    </div>
                </div>
                <div className="form-actions" style={{ marginTop: 16 }}>
                    <button
                        className="btn-outline"
                        type="button"
                        onClick={() => setShowManage((prev) => !prev)}
                    >
                        {showManage ? "Hide Account Settings" : "Manage Account"}
                    </button>
                </div>
            </section>

            {lastUpdated && (
                <p className="page-subtitle">
                    Last updated: {formatDateTime(lastUpdated)}
                </p>
            )}

            {showManage && (
                <>
                    <section className="card form-section">
                        <h2 className="section-title">Profile Photo</h2>
                        <form className="form" onSubmit={handleImageUpload}>
                            <div className="field">
                                <label className="label">Upload Photo (optional)</label>
                                {profileImageUrl && (
                                    <img
                                        src={profileImageUrl}
                                        alt="Profile"
                                        className="avatar-image"
                                        style={{ width: 64, height: 64, marginBottom: 8 }}
                                    />
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="input"
                                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                                />
                                {imageFile && (
                                    <p className="page-subtitle">
                                        Selected: {imageFile.name} (
                                        {Math.round(imageFile.size / 1024)} KB)
                                    </p>
                                )}
                            </div>
                            <div className="form-actions">
                                <button
                                    className="btn-primary"
                                    type="submit"
                                    disabled={imageUploading || !imageFile}
                                >
                                    {imageUploading ? "Uploading..." : "Upload Photo"}
                                </button>
                            </div>
                        </form>
                    </section>

                    <section className="card form-section">
                        <h2 className="section-title">Profile Details</h2>
                        <form className="form" onSubmit={handleProfileSave}>
                            <div className="form-grid">
                                <div className="field">
                                    <label className="label">First Name</label>
                                    <input
                                        className="input"
                                        value={profileForm.firstName}
                                        onChange={(e) =>
                                            setProfileForm((prev) => ({
                                                ...prev,
                                                firstName: e.target.value,
                                            }))
                                        }
                                        required
                                    />
                                </div>
                                <div className="field">
                                    <label className="label">Last Name</label>
                                    <input
                                        className="input"
                                        value={profileForm.lastName}
                                onChange={(e) =>
                                    setProfileForm((prev) => ({
                                        ...prev,
                                        lastName: e.target.value,
                                    }))
                                }
                                required
                            />
                        </div>
                            </div>
                            <div className="form-actions">
                                <button className="btn-primary" type="submit" disabled={saving}>
                                    {saving ? "Saving..." : "Save Profile"}
                                </button>
                            </div>
                        </form>
                    </section>

                    <section className="card form-section">
                        <h2 className="section-title">Change Password</h2>
                        <form className="form" onSubmit={handlePasswordChange}>
                            <div className="form-grid">
                                <div className="field">
                                    <label className="label">Current Password</label>
                                    <input
                                        className="input"
                                        type="password"
                                        value={passwordForm.currentPassword}
                                        onChange={(e) =>
                                            setPasswordForm((prev) => ({
                                                ...prev,
                                                currentPassword: e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                                <div className="field">
                                    <label className="label">New Password</label>
                                    <input
                                        className="input"
                                        type="password"
                                        value={passwordForm.newPassword}
                                        onChange={(e) =>
                                            setPasswordForm((prev) => ({
                                                ...prev,
                                                newPassword: e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                                <div className="field">
                                    <label className="label">Confirm Password</label>
                                    <input
                                        className="input"
                                        type="password"
                                        value={passwordForm.confirmPassword}
                                        onChange={(e) =>
                                            setPasswordForm((prev) => ({
                                                ...prev,
                                                confirmPassword: e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                            </div>
                            <div className="form-actions">
                                <button className="btn-primary" type="submit" disabled={saving}>
                                    {saving ? "Saving..." : "Update Password"}
                                </button>
                            </div>
                        </form>
                    </section>
                </>
            )}

            <section className="card action-card">
                <div>
                    <h2 className="section-title">Applications Report</h2>
                    <p className="page-subtitle">
                        Download a PDF summary of your applications.
                    </p>
                </div>
                <button
                    className="btn-primary"
                    onClick={handleDownload}
                    disabled={downloading}
                >
                    {downloading ? "Downloading..." : "Download PDF"}
                </button>
            </section>
        </div>
    );
}
