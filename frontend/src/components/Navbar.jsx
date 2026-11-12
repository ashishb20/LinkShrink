import { LinkIcon } from "./Icons";

const Navbar = () => (
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
        <a className="btn btn-primary btn-sm" href="#shorten">
          New link
        </a>
      </div>
    </div>
  </header>
);

export default Navbar;
