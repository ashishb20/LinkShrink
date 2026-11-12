import { useEffect, useState } from "react";
import { LinkIcon } from "./Icons";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

const useApiStatus = () => {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    const controller = new AbortController();

    fetch(`${API_BASE}/health`, { signal: controller.signal })
      .then((res) => setStatus(res.ok ? "online" : "offline"))
      .catch(() => {
        if (!controller.signal.aborted) setStatus("offline");
      });

    return () => controller.abort();
  }, []);

  return status;
};

const STATUS_TEXT = {
  checking: "Checking API",
  online: "API online",
  offline: "API offline",
};

const Navbar = () => {
  const status = useApiStatus();

  return (
    <header className="nav">
      <div className="container nav-inner">
        <a className="brand" href="#top" aria-label="LinkShrink dashboard">
          <span className="brand-mark">
            <LinkIcon size={15} />
          </span>
          <span className="brand-name">LinkShrink</span>
        </a>

        <nav className="nav-links" aria-label="Primary">
          <a className="nav-link active" href="#top">
            Overview
          </a>
          <a className="nav-link" href="#links">
            Links
          </a>
          <a className="nav-link" href="#stats">
            Analytics
          </a>
        </nav>

        <div className="nav-right">
          <span className={`status-pill ${status}`} title={STATUS_TEXT[status]}>
            <span className="status-dot" />
            <span className="status-label">{STATUS_TEXT[status]}</span>
          </span>
          <a className="btn btn-primary btn-sm" href="#shorten">
            New link
          </a>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
