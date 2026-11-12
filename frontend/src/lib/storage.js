import { expiresAt } from "./utils";

const STORAGE_KEY = "linkshrink.links.v1";
const MAX_LINKS = 200;
const SHORT_CODE = /^[A-Za-z0-9_-]{7}$/;

const toDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const normalizeLink = (link) => {
  if (!link || typeof link !== "object") return null;
  if (typeof link.shortCode !== "string" || !SHORT_CODE.test(link.shortCode)) {
    return null;
  }
  if (typeof link.longUrl !== "string" || !/^https?:\/\//.test(link.longUrl)) {
    return null;
  }

  const createdAt = toDate(link.createdAt);
  if (!createdAt) return null;

  const expires = toDate(link.expiresAt) || expiresAt(link);

  return {
    shortUrl: typeof link.shortUrl === "string" ? link.shortUrl : "",
    shortCode: link.shortCode,
    longUrl: link.longUrl,
    title: typeof link.title === "string" ? link.title : "",
    clicks: Number.isInteger(link.clicks) && link.clicks >= 0 ? link.clicks : 0,
    createdAt: createdAt.toISOString(),
    expiresAt: expires.toISOString(),
  };
};

export const loadLinks = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!Array.isArray(stored)) return [];
    return stored.map(normalizeLink).filter(Boolean).slice(0, MAX_LINKS);
  } catch {
    return [];
  }
};

export const saveLinks = (links) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(links.slice(0, MAX_LINKS)));
  } catch {
    //
  }
};
