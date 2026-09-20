import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { API_BASE_URL } from "../config/api";

const POINTS_PER_SQUARE = 10;
const HEADER_LETTERS = ["B", "I", "N", "G", "O"];

const SQUARES = [
  "Attended this week's Thursday meeting",
  "Talked to someone from a different year this week",
  "Visited the Moments section this week",
  "Met a committee member this week",
  "Attended last semester's Game Night",
  "Asked the chatbot a question this week",
  "Share the website with a classmate this week",
  "Read the MUTMLSA constitution highlights",
  "Visited the Alumni gallery",
  "Subscribed to the newsletter",
  "Followed @mut_mlsa on Instagram",
  "Attended a screening camp / outreach event this year",
  "FREE SPACE",
  "Learned one thing about Microbiology this week",
  "Taken a photo at a MUTMLSA event this year",
  "Knows how to play a musical instrument",
  "Knows someone who can crotchet or knit",
  "Met a Y4 student",
  "Find someone who knows the Father of Genetics",
  "Knows someone in MUT who has travelled abroad this year",
  "Knows someone who has a pet at home",
  "Find someone who can recite the Kenyan National Anthem",
  "Watched the Game Night video in Moments",
  "Learned one thing about Haematology this week",
  "Recommended MUTMLSA to a friend this week",
];

const MAX_POINTS = SQUARES.length * POINTS_PER_SQUARE;

// Fires a confetti burst. Blackout gets a bigger, longer, two-sided burst;
// Bingo gets a single centered pop.
function fireConfetti(kind) {
  const colors = ["#ef6351", "#1f3b33", "#f4ede0", "#a8c3b8"]; // coral / lab / paper / soft accents — swap for your real palette if different

  if (kind === "blackout") {
    const duration = 2200;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 65,
        origin: { x: 0, y: 0.6 },
        colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 65,
        origin: { x: 1, y: 0.6 },
        colors,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();

    confetti({
      particleCount: 120,
      spread: 100,
      origin: { y: 0.5 },
      colors,
    });
  } else {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.5 },
      colors,
    });
  }
}

export default function Bingo() {
  const [card, setCard] = useState(null);
  const [name, setName] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeSquare, setActiveSquare] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [celebration, setCelebration] = useState(null); // "bingo" | "blackout" | null
  const [justFilledIndex, setJustFilledIndex] = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const savedId = localStorage.getItem("mutmlsa_bingo_card_id");
    if (savedId) {
      fetch(`${API_BASE_URL}/api/bingo/${savedId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.card) setCard(data.card);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
    loadLeaderboard();
  }, []);

  useEffect(() => {
    if (celebration) {
      fireConfetti(celebration);
      const t = setTimeout(() => setCelebration(null), celebration === "blackout" ? 4500 : 3200);
      return () => clearTimeout(t);
    }
  }, [celebration]);

  useEffect(() => {
    if (justFilledIndex !== null) {
      const t = setTimeout(() => setJustFilledIndex(null), 600);
      return () => clearTimeout(t);
    }
  }, [justFilledIndex]);

  useEffect(() => {
  if (!card || leaderboard.length === 0) return;

  const myIndex = leaderboard.findIndex((e) => e.id === card.id);
  if (myIndex === -1) return;

  const myRank = myIndex + 1;
  const key = `mutmlsa_bingo_last_rank_${card.id}`;
  const lastRank = localStorage.getItem(key);

  if (lastRank && Number(lastRank) < myRank) {
    setToast("You've been overtaken on the leaderboard — jump back in!");
  }
  localStorage.setItem(key, myRank);
}, [leaderboard, card]);

useEffect(() => {
  if (toast) {
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }
}, [toast]);

  function loadLeaderboard() {
    fetch(`${API_BASE_URL}/api/bingo/leaderboard`)
      .then((res) => res.json())
      .then((data) => setLeaderboard(data.leaderboard || []));
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) return;
    const res = await fetch(`${API_BASE_URL}/api/bingo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (data.card) {
      setCard(data.card);
      localStorage.setItem("mutmlsa_bingo_card_id", data.card.id);
      loadLeaderboard();
    }
  }

  function openSquare(index) {
    if (index === 12) return;
    setActiveSquare(index);
    setInputValue((card.filled_squares || {})[index] || "");
  }

  async function submitSquare(e) {
    e.preventDefault();
    const res = await fetch(`${API_BASE_URL}/api/bingo/${card.id}/fill`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ squareIndex: activeSquare, personName: inputValue.trim() }),
    });
    const data = await res.json();
    if (data.card) {
      setCard(data.card);
      setJustFilledIndex(activeSquare);
      setActiveSquare(null);
      loadLeaderboard();
      if (data.justGotBlackout) {
        setCelebration("blackout");
      } else if (data.justGotBingo) {
        setCelebration("bingo");
      }
    }
  }

  async function clearSquare() {
    const res = await fetch(`${API_BASE_URL}/api/bingo/${card.id}/fill`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ squareIndex: activeSquare, personName: "" }),
    });
    const data = await res.json();
    if (data.card) {
      setCard(data.card);
      setActiveSquare(null);
      loadLeaderboard();
    }
  }

  async function handleFind(e) {
    e.preventDefault();
    if (!searchName.trim()) return;
    const res = await fetch(`${API_BASE_URL}/api/bingo/find?name=${encodeURIComponent(searchName)}`);
    const data = await res.json();
    setSearchResults(data.cards || []);
  }

  function selectFoundCard(foundCard) {
    setCard(foundCard);
    localStorage.setItem("mutmlsa_bingo_card_id", foundCard.id);
    setSearchResults([]);
  }

  async function submitRename(e) {
    e.preventDefault();
    if (!nameInput.trim()) return;
    const res = await fetch(`${API_BASE_URL}/api/bingo/${card.id}/name`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: nameInput.trim() }),
    });
    const data = await res.json();
    if (data.card) {
      setCard(data.card);
      setEditingName(false);
      loadLeaderboard();
    }
  }

  if (loading) return null;

  const filledCount = card ? Object.keys(card.filled_squares || {}).length : 0;
  const points = filledCount * POINTS_PER_SQUARE;

  return (
  <section id="bingo" className="border-t border-ink/10 py-20 dark:border-dark-border md:py-28">
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="fixed left-1/2 top-4 z-[120] -translate-x-1/2 rounded-sm bg-lab-900 px-4 py-2 text-sm text-paper shadow-lg"
        >
          {toast}
        </motion.div>
      )}
    </AnimatePresence>
    <button
  type="button"
  onClick={async () => {
    const { subscribeToPush } = await import("../utils/pushNotifications");
    try {
      await subscribeToPush("Test Name");
      alert("Subscribed!");
    } catch (err) {
      alert("Error: " + err.message);
    }
  }}
>
  Test Push Subscribe
</button>
<button
  type="button"
  onClick={async () => {
    const res = await fetch(`${API_BASE_URL}/api/notify/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": "YOUR_ADMIN_PASSWORD",
      },
      body: JSON.stringify({
        title: "Test notification",
        body: "If you see this, push works!",
        url: "/",
      }),
    });
    const data = await res.json();
    alert(JSON.stringify(data));
  }}
  className="mx-5 mt-2 rounded-sm border border-coral-500 px-3 py-1.5 text-xs font-semibold text-coral-600"
>
  Test Send Notification
</button>

    
      <div className="mx-auto max-w-2xl px-5 md:px-8">
        <span className="label-tag text-lab-700 dark:text-lab-500">This week's challenge</span>
        <h2 className="mt-3 font-display text-3xl font-semibold text-lab-900 md:text-4xl dark:text-dark-ink">
          MUTMLSA Bingo
        </h2>
        <p className="mt-3 max-w-xl text-ink-soft dark:text-dark-ink-soft">
          Find someone who fits each square and write their name in — each
          square is worth {POINTS_PER_SQUARE} points, {MAX_POINTS} total.
        </p>

        {leaderboard.length > 0 && (
          <div className="mt-6 rounded-sm border border-ink/10 bg-lab-50/50 p-4 dark:border-dark-border dark:bg-dark-surface/40">
            <p className="label-tag text-lab-700 dark:text-lab-500">Leaderboard</p>
            <div className="mt-2 space-y-1">
              {leaderboard.map((entry, i) => {
  const isYou = card && entry.id === card.id;
  return (
    <div
      key={entry.id}
      className={`flex items-center justify-between rounded-sm px-2 py-1 text-sm transition-colors ${
        isYou ? "bg-coral-500/10 ring-1 ring-coral-500/40" : ""
      }`}
    >
      <span className="flex items-center gap-2 text-ink-soft dark:text-dark-ink-soft">
        {i + 1}. {entry.name}
        {isYou && (
          <span className="label-tag rounded-sm bg-coral-500 px-1.5 py-0.5 text-paper">
            You
          </span>
        )}
        {entry.blackout && (
          <span className="label-tag rounded-sm bg-coral-500 px-1.5 py-0.5 text-paper">
            Blackout
          </span>
        )}
        {!entry.blackout && entry.bingo && (
          <span className="label-tag rounded-sm bg-lab-600 px-1.5 py-0.5 text-paper">
            Bingo
          </span>
        )}
      </span>
      <span className="font-semibold text-lab-800 dark:text-dark-ink">
        {entry.score * POINTS_PER_SQUARE} pts
      </span>
    </div>
  );
})}
            </div>
          </div>
        )}

        {!card ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mt-8 max-w-sm"
          >
            <p className="mb-1 label-tag text-ink-soft dark:text-dark-ink-soft">
              Use your real name or a nickname others will recognize
            </p>
            <form onSubmit={handleCreate} className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Joseph or Jose M."
                className="flex-1 rounded-sm border border-ink/15 bg-transparent px-3 py-2 text-sm dark:border-dark-border dark:text-dark-ink"
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="rounded-sm bg-coral-500 px-4 py-2 text-sm font-semibold text-paper"
              >
                Start
              </motion.button>
            </form>

            <p className="mt-4 label-tag text-ink-soft dark:text-dark-ink-soft">
              Already started on another device?
            </p>
            <form onSubmit={handleFind} className="mt-2 flex gap-2">
              <input
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="Find your card by name"
                className="flex-1 rounded-sm border border-ink/15 bg-transparent px-3 py-2 text-sm dark:border-dark-border dark:text-dark-ink"
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="rounded-sm border border-lab-700 px-4 py-2 text-sm font-semibold text-lab-700 dark:border-lab-500 dark:text-lab-500"
              >
                Find
              </motion.button>
            </form>
            {searchResults.map((c) => (
              <motion.button
                key={c.id}
                type="button"
                whileHover={{ x: 2 }}
                onClick={() => selectFoundCard(c)}
                className="mt-2 block w-full rounded-sm border border-ink/10 p-2 text-left text-sm dark:border-dark-border"
              >
                {c.name} — started {new Date(c.created_at).toLocaleDateString()}
              </motion.button>
            ))}
          </motion.div>
        ) : (
          <div className="mt-8">
            {editingName ? (
              <form onSubmit={submitRename} className="flex items-center gap-2">
                <input
                  type="text"
                  autoFocus
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="rounded-sm border border-ink/15 bg-transparent px-2 py-1 text-sm dark:border-dark-border dark:text-dark-ink"
                />
                <button type="submit" className="label-tag text-lab-700 underline dark:text-lab-500">
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditingName(false)}
                  className="label-tag text-ink-soft dark:text-dark-ink-soft"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <p className="label-tag flex flex-wrap items-center gap-2 text-lab-700 dark:text-lab-500">
                Playing as {card.name} · {filledCount}/{SQUARES.length} squares · {points}/{MAX_POINTS} pts
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-lab-100 dark:bg-dark-surface">
  <motion.div
    className="h-full bg-coral-500"
    initial={{ width: 0 }}
    animate={{ width: `${(filledCount / SQUARES.length) * 100}%` }}
    transition={{ duration: 0.5, ease: "easeOut" }}
  />
</div>
                <button
                  type="button"
                  onClick={() => {
                    setNameInput(card.name);
                    setEditingName(true);
                  }}
                  className="text-ink-soft underline dark:text-dark-ink-soft"
                >
                  Edit
                </button>
              </p>
            )}

            <div className="mt-4 overflow-hidden rounded-sm border border-ink/10 dark:border-dark-border">
              <div className="grid grid-cols-5 bg-lab-900">
                {HEADER_LETTERS.map((letter) => (
                  <div
                    key={letter}
                    className="py-3 text-center font-display text-lg font-bold text-lab-100"
                  >
                    {letter}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-5">
                {SQUARES.map((sq, i) => {
                  const filledName = (card.filled_squares || {})[i];
                  const isFree = i === 12;
                  const justFilled = justFilledIndex === i;
                  return (
                    <motion.button
                      key={i}
                      type="button"
                      onClick={() => openSquare(i)}
                      disabled={isFree}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={
                        justFilled
                          ? { opacity: 1, scale: [1, 1.12, 1] }
                          : { opacity: 1, scale: 1 }
                      }
                      transition={
                        justFilled
                          ? { duration: 0.45, ease: "easeOut" }
                          : { duration: 0.25, delay: i * 0.01 }
                      }
                      whileTap={!isFree ? { scale: 0.94 } : {}}
                      className={`flex min-h-[110px] flex-col justify-between border border-ink/10 p-2 text-left transition-colors dark:border-dark-border sm:min-h-[130px] ${
                        isFree
                          ? "bg-coral-500 text-paper"
                          : filledName
                          ? "bg-lab-600 text-paper"
                          : "bg-lab-50/60 text-ink hover:bg-lab-100/70 dark:bg-dark-surface/40 dark:text-dark-ink dark:hover:bg-dark-surface/70"
                      }`}
                    >
                      <span className="text-[10px] leading-tight sm:text-xs">
                        {isFree ? "FREE SPACE" : sq}
                      </span>
                      {!isFree && (
                        <span
                          className={`label-tag mt-1 truncate ${
                            filledName ? "text-paper/90" : "text-ink-soft dark:text-dark-ink-soft"
                          }`}
                        >
                          {filledName ? filledName : "Tap to add"}
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <AnimatePresence>
              {activeSquare !== null && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[100] flex items-center justify-center bg-lab-900/80 p-5"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="w-full max-w-sm rounded-sm bg-paper p-5 dark:bg-dark-bg"
                  >
                    <p className="text-sm text-ink dark:text-dark-ink">{SQUARES[activeSquare]}</p>
                    <form onSubmit={submitSquare} className="mt-4 flex gap-2">
                      <input
                        type="text"
                        autoFocus
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Their name"
                        className="flex-1 rounded-sm border border-ink/15 bg-transparent px-3 py-2 text-sm dark:border-dark-border dark:text-dark-ink"
                      />
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        className="rounded-sm bg-coral-500 px-4 py-2 text-sm font-semibold text-paper"
                      >
                        Save
                      </motion.button>
                    </form>
                    <div className="mt-3 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setActiveSquare(null)}
                        className="label-tag text-ink-soft dark:text-dark-ink-soft"
                      >
                        Cancel
                      </button>
                      {(card.filled_squares || {})[activeSquare] && (
                        <button
                          type="button"
                          onClick={clearSquare}
                          className="label-tag text-coral-600"
                        >
                          Clear this square
                        </button>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {celebration && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[110] flex items-center justify-center bg-lab-900/85 p-5"
                  onClick={() => setCelebration(null)}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.6, rotate: -4 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      rotate: 0,
                      transition: { type: "spring", stiffness: 260, damping: 16 },
                    }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    className="rounded-sm bg-paper px-10 py-8 text-center shadow-2xl dark:bg-dark-bg"
                  >
                    <motion.p
                      animate={{ scale: [1, 1.08, 1] }}
                      transition={{ duration: 0.6, repeat: 2, ease: "easeInOut" }}
                      className="font-display text-5xl font-bold tracking-tight text-coral-600"
                    >
                      {celebration === "blackout" ? "BLACKOUT!" : "BINGO!"}
                    </motion.p>
                    <p className="mt-2 text-sm text-ink-soft dark:text-dark-ink-soft">
                      {celebration === "blackout"
                        ? "You've filled every square. Legendary."
                        : "You've completed a line — keep going for the full board."}
                    </p>
                    <button
                      type="button"
                      onClick={() => setCelebration(null)}
                      className="label-tag mt-4 text-lab-700 underline underline-offset-4 dark:text-lab-500"
                    >
                      Continue
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
}