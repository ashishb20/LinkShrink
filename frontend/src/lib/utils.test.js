import test from "node:test";
import assert from "node:assert/strict";
import {
  displayTitle,
  expiresAt,
  hostname,
  isExpired,
  linkStatus,
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
