import { useEffect, useState } from "react";
import LinkDetail from "../components/LinkDetail";
import LinkTable from "../components/LinkTable";
import Navbar from "../components/Navbar";
import ShortenForm from "../components/ShortenForm";
import {
  ActivityIcon,
  BarChartIcon,
  ClockIcon,
  LinkIcon,
  SearchIcon,
} from "../components/Icons";
import api from "../api/url.api";
import { loadLinks, saveLinks } from "../lib/storage";
import { isExpired, linkStatus, mergeLinks } from "../lib/utils";

const REFRESH_MS = 10000;

const Home = () => {
  const [links, setLinks] = useState(loadLinks);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  const codesKey = links.map((link) => link.shortCode).join(",");

  useEffect(() => {
    saveLinks(links);
  }, [links]);

  useEffect(() => {
    if (!codesKey) return;

    let cancelled = false;
    const controller = new AbortController();

    const refresh = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const { data } = await api.get("/", {
          params: { codes: codesKey },
          signal: controller.signal,
        });
        if (!cancelled) {
          setLinks((current) => mergeLinks(current, data.links ?? []));
        }
      } catch {
        // Keep the last known values when the API is unreachable.
      }
    };

    refresh();
    const timer = setInterval(refresh, REFRESH_MS);
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", refresh);

    return () => {
      cancelled = true;
      controller.abort();
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("focus", refresh);
    };
  }, [codesKey]);

  const handleCreated = (link) => {
    setLinks((current) => {
      const existing = current.find((item) => item.shortCode === link.shortCode);
      const rest = current.filter((item) => item.shortCode !== link.shortCode);
      return [{ ...link, createdAt: existing?.createdAt ?? link.createdAt }, ...rest];
    });
  };

  const handleRemove = (shortCode) => {
    setLinks((current) => current.filter((link) => link.shortCode !== shortCode));
    setSelected(null);
  };

  const activeCount = links.filter((link) => !isExpired(link)).length;
  const expiringCount = links.filter(
    (link) => linkStatus(link) === "expiring",
  ).length;
  const totalClicks = links.reduce(
    (sum, link) => sum + (Number(link.clicks) || 0),
    0,
  );

  const term = query.trim().toLowerCase();
  const visibleLinks = links.filter((link) => {
    const matchesQuery =
      !term ||
      [link.title, link.longUrl, link.shortUrl].some((value) =>
        value?.toLowerCase().includes(term),
      );
    const matchesFilter =
      filter === "all" ||
      (filter === "active" ? !isExpired(link) : linkStatus(link) === filter);

    return matchesQuery && matchesFilter;
  });

  const hasFilters = query.trim() !== "" || filter !== "all";

  return (
    <div className="app-shell" id="top">
      <Navbar />

      <main className="page">
        <div className="container">
          <div className="page-header">
            <div>
              <h1 className="page-title">Dashboard</h1>
              <p className="page-subtitle">
                Create short links and review everything you have shared from
                this browser.
              </p>
            </div>
          </div>

          <div className="stats" id="stats">
            <div className="stat-card">
              <span className="stat-label">
                <LinkIcon size={12} /> Total links
              </span>
              <div className="stat-value">{links.length}</div>
              <div className="stat-hint">Saved in this browser</div>
            </div>
            <div className="stat-card">
              <span className="stat-label">
                <ActivityIcon size={12} /> Active links
              </span>
              <div className="stat-value">{activeCount}</div>
              <div className="stat-hint">Not expired</div>
            </div>
            <div className="stat-card">
              <span className="stat-label">
                <ClockIcon size={12} /> Expiring soon
              </span>
              <div className="stat-value">{expiringCount}</div>
              <div className="stat-hint">Within 7 days</div>
            </div>
            <div className="stat-card">
              <span className="stat-label">
                <BarChartIcon size={12} /> Total clicks
              </span>
              <div className="stat-value">{totalClicks}</div>
              <div className="stat-hint">Auto-refresh every 10s</div>
            </div>
          </div>

          <ShortenForm onCreated={handleCreated} />

          <section className="card links-card" id="links">
            <div className="card-header">
              <div>
                <h2 className="card-title">Your links</h2>
                <p className="card-subtitle">
                  {links.length} {links.length === 1 ? "link" : "links"} in local
                  history
                </p>
              </div>
              <span className="local-badge">history</span>
            </div>

            <div className="table-toolbar">
              <div className="search-wrap">
                <SearchIcon size={15} className="search-icon" />
                <input
                  className="input search-input"
                  type="search"
                  placeholder="Search title, short link, or destination…"
                  aria-label="Search links"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>
              <select
                className="input select"
                aria-label="Filter links by status"
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="expiring">Expiring soon</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            {links.length === 0 ? (
              <div className="empty">
                <span className="empty-icon">
                  <LinkIcon size={18} />
                </span>
                <h3 className="empty-title">No links yet</h3>
                <p className="empty-text">
                  Shorten your first link above. It will appear here with copy,
                  QR, and status controls.
                </p>
                <a className="btn btn-secondary btn-sm" href="#shorten">
                  Create a link
                </a>
              </div>
            ) : visibleLinks.length === 0 ? (
              <div className="empty">
                <span className="empty-icon">
                  <SearchIcon size={18} />
                </span>
                <h3 className="empty-title">No matching links</h3>
                <p className="empty-text">
                  Try a different search term or status filter.
                </p>
                {hasFilters && (
                  <button
                    className="btn btn-secondary btn-sm"
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setFilter("all");
                    }}
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <LinkTable
                links={visibleLinks}
                onSelect={setSelected}
                onRemove={handleRemove}
              />
            )}

            <div className="table-footer">
              Click counts refresh every 10 seconds. Links expire 30 days after
              creation.
            </div>
          </section>
        </div>
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          <span>LinkShrink</span>
          <span>Built by Ashish Bairwa</span>
        </div>
      </footer>

      {selected && (
        <LinkDetail
          link={links.find((link) => link.shortCode === selected.shortCode) ?? selected}
          onClose={() => setSelected(null)}
          onRemove={handleRemove}
        />
      )}
    </div>
  );
};

export default Home;
