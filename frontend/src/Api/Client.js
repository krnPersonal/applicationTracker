const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

export function getToken() {
    const token = localStorage.getItem("token");
    if (!token || token === "undefined" || token === "null") {
        return null;
    }
    return token;
}

export function setToken(token) {
    if (!token) {
        localStorage.removeItem("token");
        return;
    }
    localStorage.setItem("token", token);
}

export function clearToken() {
    localStorage.removeItem("token");
}

function withAuthHeaders(options = {}, { json = true } = {}) {
    const token = getToken();
    const headers = {
        ...(json ? { "Content-Type": "application/json" } : {}),
        ...(options.headers || {}),
    };
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    return { ...options, headers };
}

async function handleErrors(res) {
    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Request failed");
    }
}

export async function apiFetchJson(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, withAuthHeaders(options));
    await handleErrors(res);
    if (res.status === 204) return null;
    return res.json();
}

export async function apiFetchBlob(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, withAuthHeaders(options, { json: false }));
    await handleErrors(res);
    return res.blob();
}

// Optional: keep backwards compatibility
export function apiFetch(path, options = {}) {
    return apiFetchJson(path, options);
}
