import { useRef, useState } from "react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import api from "../api/url.api";
import { copyText } from "../lib/utils";
import { CheckIcon, CopyIcon } from "./Icons";

const isValidHttpUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const ShortenForm = ({ onCreated }) => {
  const [longUrl, setLongUrl] = useState("");
  const [title, setTitle] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const svgRef = useRef(null);
  const canvasRef = useRef(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const destination = longUrl.trim();

    if (!isValidHttpUrl(destination)) {
      setError("Enter a valid http(s) URL.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/shorten", {
        longUrl: destination,
        title: title.trim(),
      });

      const link = {
        shortUrl: data.shortUrl,
        shortCode: data.shortCode,
        longUrl: data.longUrl ?? destination,
        title: data.title ?? title.trim(),
        clicks: data.clicks ?? 0,
        createdAt: data.createdAt,
        expiresAt: data.expiresAt,
      };

      setResult(link);
      setTitle("");
      onCreated(link);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not shorten that link. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await copyText(result.shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setError("Copy failed. Select the short link and copy it manually.");
    }
  };

  const downloadImage = (format) => {
    const canvas = canvasRef.current?.querySelector("canvas");
    if (!canvas) return;

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `linkshrink-qr.${format}`;
        anchor.click();
        URL.revokeObjectURL(url);
      },
      `image/${format}`,
      1,
    );
  };

  const downloadSvg = () => {
    const svg = svgRef.current?.querySelector("svg");
    if (!svg) return;

    const blob = new Blob([new XMLSerializer().serializeToString(svg)], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "linkshrink-qr.svg";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="card shorten-card" id="shorten">
      <div className="shorten-head">
        <p className="eyebrow">Create</p>
        <h2 className="card-title">Shorten a link</h2>
        <p className="card-subtitle">
          Paste a destination, add an optional title, and share the short link.
        </p>
      </div>

      <form className="shorten-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="long-url">Destination URL</label>
          <input
            id="long-url"
            className="input"
            type="url"
            inputMode="url"
            placeholder="https://example.com/a/very/long/path"
            value={longUrl}
            onChange={(event) => setLongUrl(event.target.value)}
            autoComplete="off"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="link-title">
            Title <span className="optional">optional</span>
          </label>
          <input
            id="link-title"
            className="input"
            type="text"
            placeholder="Campaign, doc, or page name"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={100}
          />
        </div>

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading && <span className="spinner" />}
          {loading ? "Shortening…" : "Shorten"}
        </button>
      </form>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      {result && (
        <div className="result">
          <div>
            <p className="eyebrow">Link ready</p>
            <div className="result-url-row">
              <a
                className="result-url"
                href={result.shortUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {result.shortUrl}
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
            <p className="result-meta" title={result.longUrl}>
              Points to {result.longUrl}
            </p>
          </div>

          <div className="qr-block">
            <div className="qr-frame" ref={svgRef}>
              <QRCodeSVG value={result.shortUrl} size={104} level="H" />
            </div>
            <div
              className="qr-actions"
              role="group"
              aria-label="Download QR code"
            >
              <button
                className="link-btn"
                type="button"
                onClick={() => downloadImage("png")}
              >
                PNG
              </button>
              <button
                className="link-btn"
                type="button"
                onClick={() => downloadImage("jpeg")}
              >
                JPEG
              </button>
              <button className="link-btn" type="button" onClick={downloadSvg}>
                SVG
              </button>
            </div>
            <div className="qr-canvas" ref={canvasRef} aria-hidden="true">
              <QRCodeCanvas value={result.shortUrl} size={800} level="H" />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ShortenForm;
