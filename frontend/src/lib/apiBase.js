const raw = import.meta.env.VITE_API_BASE_URL || "";

export const API_BASE = raw.replace(/\/+$/, "");
export const API_URL = `${API_BASE}/api/url`;
