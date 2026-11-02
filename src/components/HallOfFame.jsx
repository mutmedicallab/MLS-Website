import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { API_BASE_URL } from "../config/api";

const TABS = [
  { id: "week", label: "This week" },
  { id: "month", label: "This month" },
  { id: "semester", label: "Semester" },
];
const COHORTS = [
  { id: "all", label: "Everyone" },
  { id: "1", label: "Year 1" },
  { id: "2", label: "Year 2" },
  { id: "3", label: "Year 3" },
  { id: "4", label: "Year 4" },
];
const MEDALS = ["🥇", "🥈", "🥉"];
const CLAIM_KEY = "mutmlsa_hof_claim";

function daysUntil(iso) {
  const ms = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86400000));
}

function readClaim() {
  try {
    return JSON.parse(localStorage.getItem(CLAIM_KEY) || "null");
  } catch {
    return null;
  }
}

function readLastName() {
  try {
    return localStorage.getItem("mutmlsa_bingo_last_name") || "";
  } catch {
    return "";
  }
}

export default function HallOfFame() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [tab, setTab] = useState("week");
  const [cohort, setCohort] = useState("all");
  const [showPast, setShowPast] = useState(false);

  const [claim, setClaim] = useState(() => readClaim());
  const [claimName, setClaimName] = useState(() => (readClaim() ? readClaim().name : readLastName()));
  const [claimYear, setClaimYear] = useState("");
  const [claimMsg, setClaimMsg] = useState(null);
  const [claiming, setClaiming] = useState(false);

  function load() {
    fetch(`${API_BASE_URL}/api/hall-of-fame`)
      .then((res) => res.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setData(d);
      })
      .catch(() => setError(true));
  }

  useEffect(() => {
    load();
  }, []);

  async function submitClaim(e) {
    e.preventDefault();
    if (!claimName.trim() || !claimYear) {
      setClaimMsg({ ok: false, text: "Enter your name and pick your year." });
      return;
    }
    setClaiming(true);
    setClaimMsg(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/hall-of-fame/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: claimName.trim(), year: Number(claimYear) }),
      });
      const body = await res.json();
      if (!res.ok) {
        setClaimMsg({ ok: false, text: body.error || "Could not save your year." });
      } else {
        const saved = { name: claimName.trim(), year: body.year };
        try {
          localStorage.setItem(CLAIM_KEY, JSON.stringify(saved));
        } catch {
          /* ignore */
        }
        setClaim(saved);
        setClaimMsg({
          ok: true,
          text:
            body.known === false
              ? `Saved — you're in Year ${body.year}. Heads up: we haven't seen "${saved.name}" play yet, so make sure it matches the exact name you use in the games.`
              : `Saved — you're now on the Year ${body.year} boards.`,
        });
        load();
      }
    } catch {
      setClaimMsg({ ok: false, text: "Could not reach the server — try again." });
    } finally {
      setClaiming(false);
    }
  }

  if (error) {
    return (
      <section id="hall-of-fame" className="border-t border-ink/10 py-20 dark:border-dark-border md:py-28">
        <div className="mx-auto max-w-2xl px-5 md:px-8">
          <span className="label-tag text-lab-700 dark:text-lab-500">Hall of Fame</span>
          <p className="mt-3 text-sm text-ink-soft dark:text-dark-ink-soft">
            The Hall of Fame couldn't load right now — please try again in a moment.
          </p>
        </div>
      </section>
    );
  }

  if (!data) return null;

  const panel = data[tab];
  const leaders = cohort === "all" ? panel.leaders || [] : (panel.cohorts && panel.cohorts[cohort]) || [];
  const isSemester = tab === "semester";
  const hasPast =
    data.past &&
    (data.past.weeks.length > 0 || data.past.months.length > 0 || data.past.semesters.length > 0);
  const cohortLabel = COHORTS.find((c) => c.id === cohort).label;

  return (
    <section id="hall-of-fame" className="border-t border-ink/10 py-20 dark:border-dark-border md:py-28">
      <div className="mx-auto max-w-2xl px-5 md:px-8">
        <span className="label-tag text-lab-700 dark:text-lab-500">Hall of Fame</span>
        <h2 className="mt-3 font-display text-3xl font-semibold text-lab-900 md:text-4xl dark:text-dark-ink">
          Who's on top?
        </h2>
        <p className="mt-3 max-w-xl text-ink-soft dark:text-dark-ink-soft">
          Every Quiz, Speed Round and Bingo card you play earns up to 100 points, based on how much of it
          you get right. Your points add up across the week, the month and the semester. There's an overall
          champion and a champion for each year of study.
        </p>

        {data.lastWeek && data.lastWeek.winner && (
          <div className="mt-6 rounded-sm border border-coral-500/30 bg-coral-500/5 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <span className="label-tag text-coral-600">Last week's champion · {data.lastWeek.label}</span>
              <span className="text-right text-sm font-semibold text-lab-900 dark:text-dark-ink">
                🏆 {data.lastWeek.winner.name} · {data.lastWeek.winner.points} pts
              </span>
            </div>
            {data.lastWeek.note && (
              <p className="mt-1 text-xs text-ink-soft dark:text-dark-ink-soft">{data.lastWeek.note}</p>
            )}
          </div>
        )}

        <div className="mt-6 grid grid-cols-3 overflow-hidden rounded-sm border border-ink/10 dark:border-dark-border">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`py-2 text-center text-sm font-semibold transition-colors ${
                tab === t.id
                  ? "bg-lab-900 text-paper dark:bg-lab-600"
                  : "bg-transparent text-ink-soft hover:bg-lab-100/60 dark:text-dark-ink-soft dark:hover:bg-dark-surface/70"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {COHORTS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCohort(c.id)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                cohort === c.id
                  ? "border-coral-500 bg-coral-500 text-paper"
                  : "border-ink/15 text-ink-soft hover:bg-lab-100/60 dark:border-dark-border dark:text-dark-ink-soft dark:hover:bg-dark-surface/70"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-sm border border-ink/10 bg-lab-50/50 p-4 dark:border-dark-border dark:bg-dark-surface/40">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="label-tag text-lab-700 dark:text-lab-500">
              {panel.label} · {cohortLabel}
            </p>
            {isSemester && (
              <p className="label-tag text-ink-soft dark:text-dark-ink-soft">
                {data.semester.finished
                  ? "Semester finished"
                  : `${daysUntil(data.semester.endsAt)} days left`}
              </p>
            )}
          </div>

          {isSemester && (
            <p className="mt-2 text-xs text-ink-soft dark:text-dark-ink-soft">
              To win the semester you need to have played in at least {data.semester.minWeeks} different weeks.
            </p>
          )}

          {tab === "week" && cohort === "all" && panel.defending && (
            <p className="mt-2 text-xs text-ink-soft dark:text-dark-ink-soft">
              🛡️ {panel.defending} is the defending champion and is leading again — the weekly prize passes
              to the next best player.
            </p>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={`${tab}-${cohort}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-3 space-y-1"
            >
              {leaders.length === 0 && (
                <p className="py-3 text-sm text-ink-soft dark:text-dark-ink-soft">
                  {cohort === "all"
                    ? "No scores yet for this period — play a game and be the first on the board!"
                    : `No ${cohortLabel} players on this board yet. Claim your year below to appear here.`}
                </p>
              )}

              {leaders.map((entry, i) => {
                const notQualified = isSemester && entry.qualified === false;
                const isDefender =
                  tab === "week" && cohort === "all" && panel.defending && entry.name === panel.defending;
                return (
                  <div
                    key={`${entry.name}-${i}`}
                    className={`flex items-center justify-between gap-3 rounded-sm px-2 py-1.5 text-sm ${
                      i === 0 && !notQualified && !isDefender ? "bg-coral-500/10 ring-1 ring-coral-500/30" : ""
                    } ${notQualified ? "opacity-60" : ""}`}
                  >
                    <span className="flex min-w-0 items-center gap-2 text-ink-soft dark:text-dark-ink-soft">
                      <span className="w-6 shrink-0 text-center">
                        {i < 3 && !notQualified ? MEDALS[i] : `${entry.rank}.`}
                      </span>
                      <span className="truncate">{entry.name}</span>
                      {isDefender && <span className="label-tag shrink-0">🛡️ Defending champion</span>}
                      {notQualified && (
                        <span className="label-tag shrink-0">
                          {data.semester.minWeeks - entry.activeWeeks} more active wk
                          {data.semester.minWeeks - entry.activeWeeks === 1 ? "" : "s"} to qualify
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="font-semibold text-lab-800 dark:text-dark-ink">{entry.points} pts</span>
                      <span className="label-tag ml-2 text-ink-soft dark:text-dark-ink-soft">
                        {entry.rounds} played
                      </span>
                    </span>
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-4 rounded-sm border border-ink/10 p-4 dark:border-dark-border">
          <p className="label-tag text-lab-700 dark:text-lab-500">Claim your year</p>
          {claim ? (
            <p className="mt-2 text-sm text-ink-soft dark:text-dark-ink-soft">
              You're set as <span className="font-semibold">{claim.name}</span> · Year {claim.year}. Need to
              change it? Ask a committee member.
            </p>
          ) : (
            <>
              <p className="mt-2 text-xs text-ink-soft dark:text-dark-ink-soft">
                Type the exact name you use in the games and pick your year of study — you can do this any
                time, and the points you've already earned will count for your year's board. You can only
                set it once.
              </p>
              <form onSubmit={submitClaim} className="mt-3 flex flex-wrap gap-2">
                <input
                  type="text"
                  value={claimName}
                  onChange={(e) => setClaimName(e.target.value)}
                  placeholder="Your name in the games"
                  className="min-w-0 flex-1 rounded-sm border border-ink/15 bg-transparent px-3 py-2 text-sm dark:border-dark-border dark:text-dark-ink"
                />
                <select
                  value={claimYear}
                  onChange={(e) => setClaimYear(e.target.value)}
                  className="rounded-sm border border-ink/15 bg-transparent px-2 py-2 text-sm dark:border-dark-border dark:bg-dark-bg dark:text-dark-ink"
                >
                  <option value="">Year…</option>
                  <option value="1">Year 1</option>
                  <option value="2">Year 2</option>
                  <option value="3">Year 3</option>
                  <option value="4">Year 4</option>
                </select>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={claiming}
                  className="rounded-sm bg-coral-500 px-4 py-2 text-sm font-semibold text-paper disabled:opacity-50"
                >
                  {claiming ? "Saving…" : "Claim"}
                </motion.button>
              </form>
            </>
          )}
          {claimMsg && (
            <p className={`mt-2 text-xs ${claimMsg.ok ? "text-lab-700 dark:text-lab-500" : "text-coral-600"}`}>
              {claimMsg.text}
            </p>
          )}
        </div>

        {hasPast && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowPast(!showPast)}
              className="label-tag text-lab-700 underline underline-offset-4 dark:text-lab-500"
            >
              {showPast ? "Hide past winners" : "See past winners"}
            </button>

            <AnimatePresence>
              {showPast && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 space-y-5 rounded-sm border border-ink/10 bg-lab-50/50 p-4 dark:border-dark-border dark:bg-dark-surface/40">
                    {[
                      { title: "Semester champions", list: data.past.semesters },
                      { title: "Monthly champions", list: data.past.months },
                      { title: "Weekly champions", list: data.past.weeks },
                    ]
                      .filter((g) => g.list.length > 0)
                      .map((g) => (
                        <div key={g.title}>
                          <p className="label-tag text-lab-700 dark:text-lab-500">{g.title}</p>
                          <div className="mt-2 space-y-4">
                            {g.list.map((p) => (
                              <div key={p.key}>
                                <p className="label-tag text-ink-soft dark:text-dark-ink-soft">{p.label}</p>
                                <div className="mt-1 space-y-0.5">
                                  {p.winners.map((w) => (
                                    <div key={w.place} className="flex items-center justify-between text-sm">
                                      <span className="text-ink-soft dark:text-dark-ink-soft">
                                        {MEDALS[w.place - 1]} {w.name}
                                      </span>
                                      <span className="font-semibold text-lab-800 dark:text-dark-ink">
                                        {w.points} pts
                                      </span>
                                    </div>
                                  ))}
                                </div>
                                {p.note && (
                                  <p className="mt-1 text-xs text-ink-soft dark:text-dark-ink-soft">{p.note}</p>
                                )}
                                {p.cohorts && Object.keys(p.cohorts).length > 0 && (
                                  <p className="mt-1 text-xs text-ink-soft dark:text-dark-ink-soft">
                                    {["1", "2", "3", "4"]
                                      .filter((y) => p.cohorts[y] && p.cohorts[y][0])
                                      .map((y) => `Y${y}: ${p.cohorts[y][0].name} (${p.cohorts[y][0].points})`)
                                      .join(" · ")}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
}