export const LIFETIME_DAYS = 30;

const DAY_MS = 86_400_000;
const dateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });

export const copyText = (text) => navigator.clipboard.writeText(text);

export const expiresAt = (link) =>
  new Date(new Date(link.createdAt).getTime() + LIFETIME_DAYS * DAY_MS);

export const linkStatus = (link, now = Date.now()) => {
  const remaining = expiresAt(link).getTime() - now;
  if (remaining <= 0) return "expired";
  if (remaining < 7 * DAY_MS) return "expiring";
  return "active";
};

export const isExpired = (link) => linkStatus(link) === "expired";

export const formatDate = (value) => dateFormatter.format(new Date(value));

export const hostname = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

export const displayTitle = (link) => link.title?.trim() || hostname(link.longUrl);
