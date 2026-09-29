import { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import api from "../api/url.api";
import "../styles/UrlForm.css";
import { QRCodeSVG } from 'qrcode.react';

const pingServer = () => {
  fetch(import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL}/api/url/health`
    : '/api/url/health'
  ).catch(() => { });
};

const UrlForm = () => {
  const [longUrl, setLongUrl] = useState("");
  const [title, setTitle] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    pingServer();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setShortUrl("");
    setCopied(false);
    setLoading(true);

    try {
      new URL(longUrl);
    } catch {
      setError("Please enter a valid URL");
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("/shorten", { longUrl, title });
      setShortUrl(res.data.shortUrl);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
        "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadImage = async (format) => {
    const { QRCodeCanvas } = await import('qrcode.react');
    const container = document.createElement('div');
    container.style.cssText = 'position:absolute;visibility:hidden;';
    document.body.appendChild(container);
    const root = createRoot(container);
    root.render(<QRCodeCanvas value={shortUrl} size={800} level="H" />);
    await new Promise((r) => setTimeout(r, 100));
    const canvas = container.querySelector('canvas');
    if (canvas) {
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.download = `qrcode.${format}`;
        a.href = url;
        a.click();
        URL.revokeObjectURL(url);
        root.unmount();
        container.remove();
      }, `image/${format}`, 1.0);
    }
  };

  const downloadSVG = () => {
    const svg = document.querySelector("#qr-svg-container svg");
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([svgData], { type: "image/svg+xml:charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.download = "qrcode.svg";
      a.href = url;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="url-form-container">
      <form onSubmit={handleSubmit} className="url-form">
        <div className="input-group">
          <input
            type="text"
            placeholder="Paste your long link here..."
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            className="url-input"
          />
          <input
            type="text"
            placeholder="Website Title (Optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="url-input alias-input"
          />
          <button type="submit" disabled={loading} className="shorten-btn">
            {loading ? "shortening..." : "Shorten URL"}
          </button>
        </div>
      </form>

      {error && <p className="error-msg">{error}</p>}

      {shortUrl && (
        <div className="result-container">
          <p className="success-label">Shortened URL</p>
          <div className="short-url-box">
            <a href={shortUrl} target="_blank" rel="noopener noreferrer">
              {shortUrl}
            </a>
            <button onClick={handleCopy} className="copy-btn">
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <div className="qr-code-section">
            <h3 className="qr-title">QR Code</h3>
            <div id="qr-svg-container" className="qr-svg-container">
              <QRCodeSVG value={shortUrl} size={150} level={"H"} />
            </div>
            <div className="download-buttons">
              <button onClick={() => downloadImage('png')} className="download-btn">Download PNG</button>
              <button onClick={() => downloadImage('jpeg')} className="download-btn">Download JPEG</button>
              <button onClick={downloadSVG} className="download-btn">Download SVG</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UrlForm;
