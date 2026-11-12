const STORAGE_KEY = "linkshrink.links.v1";
const MAX_LINKS = 200;

export const loadLinks = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(stored) ? stored : [];
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
