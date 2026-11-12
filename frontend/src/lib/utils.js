export const LIFETIME_DAYS = 30;

const DAY_MS = 86_400_000;
const dateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });

export const copyText = (text) => navigator.clipboard.writeText(text);

export const expiresAt = (link) => {
  const server = link.expiresAt ? new Date(link.expiresAt) : null;
  if (server && !Number.isNaN(server.getTime())) return server;
  return new Date(new Date(link.createdAt).getTime() + LIFETIME_DAYS * DAY_MS);
};

export const linkStatus = (link, now = Date.now()) => {
  const remaining = expiresAt(link).getTime() - now;
  if (Number.isNaN(remaining) || remaining <= 0) return "expired";
  if (remaining < 7 * DAY_MS) return "expiring";
  return "active";
};

export const isExpired = (link) => linkStatus(link) === "expired";

export const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
};

export const hostname = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

export const displayTitle = (link) => link.title?.trim() || hostname(link.longUrl);

export const mergeLinks = (localLinks, serverLinks) => {
  const serverByCode = new Map(serverLinks.map((link) => [link.shortCode, link]));
  return localLinks
    .map((link) => serverByCode.get(link.shortCode) ?? link)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};
