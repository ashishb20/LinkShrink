import { useEffect, useRef, useState } from "react";
import {
  copyText,
  displayTitle,
  expiresAt,
  formatDate,
} from "../lib/utils";
import { CheckIcon, CopyIcon, ExternalLinkIcon, XIcon } from "./Icons";
import StatusBadge from "./StatusBadge";

const LinkDetail = ({ link, onClose, onRemove }) => {
  const dialogRef = useRef(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const close = () => dialogRef.current?.close();

  const handleCopy = async () => {
    try {
      await copyText(link.shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard access can be blocked; the link stays selectable.
    }
  };

  return (
    <dialog
      className="detail-dialog"
      ref={dialogRef}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) close();
      }}
    >
      <div className="detail-header">
        <div>
          <p className="eyebrow">Link details</p>
          <h2 className="detail-title">{displayTitle(link)}</h2>
        </div>
        <button
          className="icon-btn"
          type="button"
          aria-label="Close details"
          onClick={close}
        >
          <XIcon size={16} />
        </button>
      </div>

      <div className="detail-body">
        <div className="detail-url-row">
          <a
            className="detail-url"
            href={link.shortUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {link.shortUrl}
          </a>
          <button
            className="btn btn-secondary btn-sm"
            type="button"
            onClick={handleCopy}
          >
            {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        <div className="detail-grid">
          <div className="detail-item">
            <span>Status</span>
            <div>
              <StatusBadge link={link} />
            </div>
          </div>
          <div className="detail-item">
            <span>Short code</span>
            <strong className="mono">{link.shortCode}</strong>
          </div>
          <div className="detail-item">
            <span>Created</span>
            <strong>{formatDate(link.createdAt)}</strong>
          </div>
          <div className="detail-item">
            <span>Expires</span>
            <strong>{formatDate(expiresAt(link))}</strong>
          </div>
        </div>

        <div className="detail-item">
          <span>Destination</span>
          <a
            className="detail-dest"
            href={link.longUrl}
            title={link.longUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {link.longUrl}
          </a>
        </div>

        <div className="analytics-note">
          <strong>Click analytics</strong>
          <p>
            {Number(link.clicks) || 0} clicks recorded. Counts update every 10
            seconds while the dashboard is open.
          </p>
        </div>
      </div>

      <div className="detail-footer">
        <button
          className="btn btn-ghost btn-sm danger-text"
          type="button"
          onClick={() => onRemove(link.shortCode)}
        >
          Remove from history
        </button>
        <a
          className="btn btn-primary btn-sm"
          href={link.shortUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open link
          <ExternalLinkIcon size={14} />
        </a>
      </div>
    </dialog>
  );
};

export default LinkDetail;
