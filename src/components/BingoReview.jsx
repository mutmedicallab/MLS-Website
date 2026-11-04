// src/components/BingoReview.jsx
// Admin Portal tab: lets the committee review Bingo cards and clear or delete suspicious ones.
import { useState, useEffect } from "react";

function fmtTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "Africa/Nairobi" });
}

function fmtSpan(sec) {
  if (sec === null || sec === undefined) return null;
  if (sec < 90) return `${sec}s`;
  return `${Math.round(sec / 60)} min`;
}

export default function BingoReview({ authedFetch }) {
  const [round, setRound] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [openId, setOpenId] = useState(null);
  const [busyId, setBusyId] = useState(null);

  async function load(r = round) {
    setLoading(true);
    setError("");
    try {
      const res = await authedFetch(`/api/bingo/admin/cards${r ? `?round=${encodeURIComponent(r)}` : ""}`);
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Could not load the cards.");
      setData(body);
      setRound(body.round);
    } catch (err) {
      setError(err.message || "Could not load the cards.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function act(card, action) {
    const msg =
      action === "clear"
        ? `Clear ${card.name}'s card? They keep the card but all boxes are emptied, so they start again.`
        : `Delete ${card.name}'s card completely? Their points for this week are removed.`;
    if (!window.confirm(msg)) return;
    setBusyId(card.id);
    try {
      const res = await authedFetch(
        action === "clear" ? `/api/bingo/admin/cards/${card.id}/clear` : `/api/bingo/admin/cards/${card.id}`,
        { method: action === "clear" ? "POST" : "DELETE" }
      );
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "That didn't work.");
      await load(round);
    } catch (err) {
      setError(err.message || "That didn't work.");
    } finally {
      setBusyId(null);
    }
  }

  const cards = (data ? data.cards : []).filter((c) => !flaggedOnly || c.flags.length > 0);
  const flaggedCount = data ? data.cards.filter((c) => c.flags.length > 0).length : 0;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-lg font-semibold text-lab-900 dark:text-dark-ink">Bingo card review</h2>
        <button
          type="button"
          onClick={() => load(round)}
          className="label-tag rounded-sm border border-ink/15 px-3 py-1.5 text-ink-soft dark:border-dark-border dark:text-dark-ink-soft"
        >
          Refresh
        </button>
      </div>
      <p className="mt-1 text-xs text-ink-soft dark:text-dark-ink-soft">
        Cards with warning signs are listed first. Open a card to see every name and how fast it was filled.
      </p>

      {data && (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <select
            value={round}
            onChange={(e) => load(e.target.value)}
            className="rounded-sm border border-ink/15 bg-transparent px-3 py-1.5 text-sm text-ink dark:border-dark-border dark:bg-dark-surface dark:text-dark-ink"
          >
            {data.rounds.map((r) => (
              <option key={r.round} value={r.round}>
                {r.label}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm text-ink-soft dark:text-dark-ink-soft">
            <input type="checkbox" checked={flaggedOnly} onChange={(e) => setFlaggedOnly(e.target.checked)} />
            Only show flagged ({flaggedCount})
          </label>
        </div>
      )}

      {error && <p className="mt-3 text-sm text-coral-600">{error}</p>}
      {loading && <p className="mt-4 text-sm text-ink-soft dark:text-dark-ink-soft">Loading cards…</p>}
      {!loading && data && cards.length === 0 && (
        <p className="mt-4 text-sm text-ink-soft dark:text-dark-ink-soft">
          {flaggedOnly ? "No flagged cards this week." : "No cards this week yet."}
        </p>
      )}

      <div className="mt-4 space-y-2">
        {cards.map((c) => {
          const open = openId === c.id;
          return (
            <div key={c.id} className="rounded-sm border border-ink/10 p-3 dark:border-dark-border">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <button type="button" onClick={() => setOpenId(open ? null : c.id)} className="text-left">
                  <span className="text-sm font-semibold text-lab-900 dark:text-dark-ink">{c.name}</span>
                  <span className="ml-2 text-xs text-ink-soft dark:text-dark-ink-soft">
                    {c.filledCount}/24 boxes
                    {fmtSpan(c.spanSec) && ` · filled over ${fmtSpan(c.spanSec)}`}
                    {!c.hasTiming && c.filledCount > 0 && " · no timing recorded"}
                  </span>
                  <span className="ml-2 text-xs text-ink-soft dark:text-dark-ink-soft">{open ? "▲" : "▼"}</span>
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={busyId === c.id}
                    onClick={() => act(c, "clear")}
                    className="rounded-sm border border-coral-500 px-3 py-1 text-xs font-semibold text-coral-600 disabled:opacity-50"
                  >
                    Clear card
                  </button>
                  <button
                    type="button"
                    disabled={busyId === c.id}
                    onClick={() => act(c, "delete")}
                    className="rounded-sm bg-coral-500 px-3 py-1 text-xs font-semibold text-paper disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {c.flags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {c.flags.map((f) => (
                    <span key={f} className="rounded-sm bg-coral-500/10 px-2 py-0.5 text-xs text-coral-600">
                      ⚠ {f}
                    </span>
                  ))}
                </div>
              )}

              {open && (
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-ink-soft dark:text-dark-ink-soft">
                        <th className="py-1 pr-3">Name entered</th>
                        <th className="py-1 pr-3">Box</th>
                        <th className="py-1 pr-3">Time</th>
                        <th className="py-1">Since previous</th>
                      </tr>
                    </thead>
                    <tbody>
                      {c.squares.map((s) => (
                        <tr key={s.index} className="border-t border-ink/5 dark:border-dark-border">
                          <td className="py-1 pr-3 text-lab-900 dark:text-dark-ink">{s.name}</td>
                          <td className="py-1 pr-3 text-ink-soft dark:text-dark-ink-soft">#{s.index + 1}</td>
                          <td className="py-1 pr-3 text-ink-soft dark:text-dark-ink-soft">{fmtTime(s.at)}</td>
                          <td
                            className={`py-1 ${
                              s.gapSec !== undefined && s.gapSec < 30 ? "font-semibold text-coral-600" : "text-ink-soft dark:text-dark-ink-soft"
                            }`}
                          >
                            {s.gapSec !== undefined ? `${s.gapSec}s` : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}