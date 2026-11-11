// src/components/BingoReview.jsx
// Admin Portal tab: confirm finished Bingo cards (which gives the player their next card),
// and review, clear or delete suspicious ones.
import { useState, useEffect } from "react";

function fmtTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "Africa/Nairobi" });
}

function fmtDay(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "Africa/Nairobi" });
}

function fmtSpan(sec) {
  if (sec === null || sec === undefined) return null;
  if (sec < 90) return `${sec}s`;
  if (sec < 5400) return `${Math.round(sec / 60)} min`;
  return `${Math.round(sec / 3600)} hr`;
}

const SECTIONS = [
  { status: "pending", title: "Waiting for your confirmation", hint: "Full cards. Check the names, then confirm to give the player their next card." },
  { status: "active", title: "In progress", hint: "Cards still being filled." },
  { status: "confirmed", title: "Recently confirmed (last 14 days)", hint: "" },
];

export default function BingoReview({ authedFetch }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [openId, setOpenId] = useState(null);
  const [busyId, setBusyId] = useState(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await authedFetch("/api/bingo/admin/cards");
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Could not load the cards.");
      setCards(body.cards || []);
    } catch (err) {
      setError(err.message || "Could not load the cards.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function act(card, action) {
    let msg;
    if (action === "confirm") {
      msg = card.flags.length
        ? `This card has warning signs (${card.flags.join("; ")}). Confirm ${card.name}'s card anyway?`
        : `Confirm ${card.name}'s card? They will be able to start their next card.`;
    } else if (action === "clear") {
      msg = `Clear ${card.name}'s card? All boxes are emptied, so they start this card again.`;
    } else {
      msg = `Delete ${card.name}'s card completely? Its points are removed.`;
    }
    if (!window.confirm(msg)) return;

    setBusyId(card.id);
    setError("");
    try {
      const url =
        action === "delete" ? `/api/bingo/admin/cards/${card.id}` : `/api/bingo/admin/cards/${card.id}/${action}`;
      const res = await authedFetch(url, { method: action === "delete" ? "DELETE" : "POST" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "That didn't work.");
      await load();
    } catch (err) {
      setError(err.message || "That didn't work.");
    } finally {
      setBusyId(null);
    }
  }

  const flaggedCount = cards.filter((c) => c.flags.length > 0).length;
  const pendingCount = cards.filter((c) => c.status === "pending").length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-lg font-semibold text-lab-900 dark:text-dark-ink">
          Bingo cards{pendingCount > 0 ? ` · ${pendingCount} waiting` : ""}
        </h2>
        <button
          type="button"
          onClick={load}
          className="label-tag rounded-sm border border-ink/15 px-3 py-1.5 text-ink-soft dark:border-dark-border dark:text-dark-ink-soft"
        >
          Refresh
        </button>
      </div>
      <p className="mt-1 text-xs text-ink-soft dark:text-dark-ink-soft">
        A player keeps their card until it is full and you confirm it. Open a card to see every name and how fast it
        was filled.
      </p>

      <label className="mt-3 flex items-center gap-2 text-sm text-ink-soft dark:text-dark-ink-soft">
        <input type="checkbox" checked={flaggedOnly} onChange={(e) => setFlaggedOnly(e.target.checked)} />
        Only show flagged ({flaggedCount})
      </label>

      {error && <p className="mt-3 text-sm text-coral-600">{error}</p>}
      {loading && <p className="mt-4 text-sm text-ink-soft dark:text-dark-ink-soft">Loading cards…</p>}

      {!loading &&
        SECTIONS.map((sec) => {
          const list = cards.filter((c) => c.status === sec.status && (!flaggedOnly || c.flags.length > 0));
          if (list.length === 0) return null;
          return (
            <div key={sec.status} className="mt-5">
              <p className="label-tag text-lab-700 dark:text-lab-500">{sec.title}</p>
              {sec.hint && <p className="mt-1 text-xs text-ink-soft dark:text-dark-ink-soft">{sec.hint}</p>}

              <div className="mt-2 space-y-2">
                {list.map((c) => {
                  const open = openId === c.id;
                  return (
                    <div key={c.id} className="rounded-sm border border-ink/10 p-3 dark:border-dark-border">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <button type="button" onClick={() => setOpenId(open ? null : c.id)} className="text-left">
                          <span className="text-sm font-semibold text-lab-900 dark:text-dark-ink">{c.name}</span>
                          <span className="ml-2 text-xs text-ink-soft dark:text-dark-ink-soft">
                            {c.cardNo ? `Card ${c.cardNo} · ` : ""}
                            {c.filledCount}/24 boxes
                            {fmtSpan(c.spanSec) && ` · filled over ${fmtSpan(c.spanSec)}`}
                            {c.status === "pending" && c.completedAt && ` · completed ${fmtDay(c.completedAt)}`}
                            {c.status === "confirmed" && c.confirmedAt && ` · confirmed ${fmtDay(c.confirmedAt)}`}
                            {!c.hasTiming && c.filledCount > 0 && " · no timing recorded"}
                          </span>
                          <span className="ml-2 text-xs text-ink-soft dark:text-dark-ink-soft">{open ? "▲" : "▼"}</span>
                        </button>
                        <div className="flex gap-2">
                          {c.status === "pending" && (
                            <button
                              type="button"
                              disabled={busyId === c.id}
                              onClick={() => act(c, "confirm")}
                              className="rounded-sm bg-lab-800 px-3 py-1 text-xs font-semibold text-paper disabled:opacity-50 dark:bg-lab-600"
                            >
                              Confirm
                            </button>
                          )}
                          {c.status !== "confirmed" && (
                            <button
                              type="button"
                              disabled={busyId === c.id}
                              onClick={() => act(c, "clear")}
                              className="rounded-sm border border-coral-500 px-3 py-1 text-xs font-semibold text-coral-600 disabled:opacity-50"
                            >
                              Clear card
                            </button>
                          )}
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
                                      s.gapSec !== undefined && s.gapSec < 30
                                        ? "font-semibold text-coral-600"
                                        : "text-ink-soft dark:text-dark-ink-soft"
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
        })}

      {!loading && cards.length === 0 && (
        <p className="mt-4 text-sm text-ink-soft dark:text-dark-ink-soft">No cards yet.</p>
      )}
    </div>
  );
}