import test from "node:test";
import assert from "node:assert/strict";
import {
  displayTitle,
  expiresAt,
  formatDate,
  hostname,
  isExpired,
  linkStatus,
  mergeLinks,
} from "./utils.js";

const DAY = 86_400_000;
const NOW = Date.parse("2026-06-01T12:00:00Z");
const makeLink = (daysAgo) => ({
  createdAt: new Date(NOW - daysAgo * DAY).toISOString(),
  longUrl: "https://www.example.com/path",
  title: "",
});

test("links expire 30 days after creation", () => {
  assert.equal(expiresAt(makeLink(0)).getTime() - NOW, 30 * DAY);
  assert.equal(linkStatus(makeLink(20), NOW), "active");
  assert.equal(linkStatus(makeLink(26), NOW), "expiring");
  assert.equal(linkStatus(makeLink(31), NOW), "expired");
});

test("isExpired uses the current clock", () => {
  assert.equal(isExpired({ createdAt: new Date(Date.now() - 31 * DAY).toISOString() }), true);
  assert.equal(isExpired({ createdAt: new Date().toISOString() }), false);
});

test("display helpers strip www and fall back to the hostname", () => {
  assert.equal(hostname("https://www.example.com/path"), "example.com");
  assert.equal(displayTitle(makeLink(0)), "example.com");
  assert.equal(displayTitle({ ...makeLink(0), title: "Docs" }), "Docs");
});

test("expiresAt prefers the server value", () => {
  const link = {
    ...makeLink(0),
    expiresAt: "2026-06-10T12:00:00.000Z",
  };
  assert.equal(expiresAt(link).toISOString(), "2026-06-10T12:00:00.000Z");
});

test("formatDate never throws on invalid input", () => {
  assert.equal(formatDate("not-a-date"), "—");
  assert.equal(formatDate(undefined), "—");
});

test("mergeLinks replaces known rows with server data and keeps the rest", () => {
  const local = [
    { shortCode: "aaaaaaa", createdAt: "2026-06-01T00:00:00.000Z", clicks: 0 },
    { shortCode: "bbbbbbb", createdAt: "2026-06-02T00:00:00.000Z", clicks: 5 },
  ];
  const server = [
    { shortCode: "aaaaaaa", createdAt: "2026-06-01T00:00:00.000Z", clicks: 9 },
  ];

  const merged = mergeLinks(local, server);

  assert.deepEqual(
    merged.map((link) => [link.shortCode, link.clicks]),
    [
      ["bbbbbbb", 5],
      ["aaaaaaa", 9],
    ],
  );
});
