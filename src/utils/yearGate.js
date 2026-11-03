// src/utils/yearGate.js
// Makes players pick their year of study before they can start a game.
// The pick is saved once per name through the Hall of Fame "claim" endpoint,
// and remembered on this device so they are not asked again.
import { API_BASE_URL } from "../config/api";

const CLAIM_KEY = "mutmlsa_hof_claim";

export function readClaim() {
  try {
    return JSON.parse(localStorage.getItem(CLAIM_KEY) || "null");
  } catch {
    return null;
  }
}

function saveClaim(name, year) {
  try {
    localStorage.setItem(CLAIM_KEY, JSON.stringify({ name: name.trim(), year }));
  } catch {
    /* storage unavailable – ignore */
  }
}

// True when this device already has a saved year for exactly this name
export function claimMatches(name) {
  const c = readClaim();
  const y = Number(c && c.year);
  return (
    !!c &&
    y >= 1 &&
    y <= 4 &&
    String(c.name || "").trim().toLowerCase() === String(name || "").trim().toLowerCase()
  );
}

// Call before starting a game. Resolves to { ok: true } or { ok: false, error }.
export async function ensureYear(name, yearPick) {
  if (claimMatches(name)) return { ok: true };

  const year = Number(yearPick);
  if (!year) return { ok: false, error: "Pick your year of study to continue." };

  try {
    const res = await fetch(`${API_BASE_URL}/api/hall-of-fame/claim`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), year }),
    });
    const body = await res.json().catch(() => ({}));

    if (res.ok) {
      saveClaim(name, body.year || year);
      return { ok: true };
    }
    // This name already has a year on record: use that one
    if (res.status === 409 && body.year) {
      saveClaim(name, body.year);
      return { ok: true };
    }
    return { ok: false, error: body.error || "Could not save your year. Please try again." };
  } catch {
    return { ok: false, error: "Could not reach the server — please try again." };
  }
}