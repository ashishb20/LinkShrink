import { useState } from "react";
import { copyText, displayTitle, formatDate } from "../lib/utils";
import {
  BarChartIcon,
  CheckIcon,
  CopyIcon,
  ExternalLinkIcon,
  TrashIcon,
} from "./Icons";
import StatusBadge from "./StatusBadge";

const LinkTable = ({ links, onSelect, onRemove }) => {
  const [copiedCode, setCopiedCode] = useState(null);

  const handleCopy = async (link) => {
    try {
      await copyText(link.shortUrl);
      setCopiedCode(link.shortCode);
      setTimeout(() => setCopiedCode(null), 1600);
    } catch {
      // Clipboard access can be blocked; opening the link still works.
    }
  };

  return (
    <div className="table-scroll">
      <table className="links-table">
        <thead>
          <tr>
            <th scope="col">Link</th>
            <th scope="col">Destination</th>
            <th scope="col">Created</th>
            <th scope="col">Clicks</th>
            <th scope="col">Status</th>
            <th scope="col">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {links.map((link) => (
            <tr key={link.shortCode}>
              <td className="cell-link">
                <div className="link-cell">
                  <span className="link-title" title={displayTitle(link)}>
                    {displayTitle(link)}
                  </span>
                  <a
                    className="link-short"
                    href={link.shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.shortUrl.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              </td>

              <td className="cell-dest">
                <a
                  className="dest"
                  href={link.longUrl}
                  title={link.longUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.longUrl}
                </a>
              </td>

              <td className="cell-created">{formatDate(link.createdAt)}</td>

              <td className="cell-clicks">{Number(link.clicks) || 0}</td>

              <td className="cell-status">
                <StatusBadge link={link} />
              </td>

              <td className="cell-actions">
                <div className="row-actions">
                  <button
                    className="icon-btn"
                    type="button"
                    title="Copy short link"
                    aria-label={`Copy short link for ${displayTitle(link)}`}
                    onClick={() => handleCopy(link)}
                  >
                    {copiedCode === link.shortCode ? (
                      <CheckIcon size={15} />
                    ) : (
                      <CopyIcon size={15} />
                    )}
                  </button>
                  <a
                    className="icon-btn"
                    href={link.shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Open short link"
                    aria-label={`Open short link for ${displayTitle(link)}`}
                  >
                    <ExternalLinkIcon size={15} />
                  </a>
                  <button
                    className="icon-btn"
                    type="button"
                    title="View details"
                    aria-label={`View details for ${displayTitle(link)}`}
                    onClick={() => onSelect(link)}
                  >
                    <BarChartIcon size={15} />
                  </button>
                  <button
                    className="icon-btn danger"
                    type="button"
                    title="Remove from history"
                    aria-label={`Remove ${displayTitle(link)} from history`}
                    onClick={() => onRemove(link.shortCode)}
                  >
                    <TrashIcon size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LinkTable;
