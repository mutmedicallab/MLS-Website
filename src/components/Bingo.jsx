import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { API_BASE_URL } from "../config/api";
import { getCurrentWeekId, getWeekLabel } from "../utils/periodId";
import NotifyOptIn from "./Notifyoptin";

const POINTS_PER_SQUARE = 10;
const HEADER_LETTERS = ["B", "I", "N", "G", "O"];
const CARD_KEY = "mutmlsa_bingo_card_id";
const NAME_KEY = "mutmlsa_bingo_last_name";

// ---------------------------------------------------------------------------
// SQUARE POOL — the board for each week is drawn from this list automatically.
// 24 squares per board. With this many squares you get several full weeks with
// no repeated square, then the order is reshuffled and it starts a fresh cycle.
// Keep every square evergreen (nothing tied to one specific event or date).
// ---------------------------------------------------------------------------
const SQUARE_POOL = [
  "Find a MUTMLSA committee member",
  "Find someone who has asked the MUTMLSA chatbot a question",
  "Find someone who has opened the Moments section",
  "Find someone who follows @mut_mlsa on Instagram",
  "Find someone subscribed to the MUTMLSA newsletter",
  "Find someone who has RSVPed to a MUTMLSA event",
  "Find someone who has played the Speed Round",
  "Find someone who has taken the Lab Science Quiz",
  "Find someone who has turned on MUTMLSA notifications",
  "Find someone who attended a MUTMLSA meeting this semester",
  "Find someone who has been to a screening camp or outreach",
  "Find someone who has shared the site with a friend",
  "Find someone who has visited the Archive tab",
  "Find a first-year student",
  "Find a second-year student",
  "Find a third-year student",
  "Find a fourth-year student",
  "Find someone from a different year of study",
  "Find someone studying a different programme at MUT",
  "Find someone who has read the MUTMLSA constitution",
  "Find someone who knows the MUTMLSA motto",
  "Find someone who has volunteered at a health event",
  "Find someone who has given a presentation this semester",
  "Find someone who can name the tube colour used for an FBC",
  "Find someone who has done a venipuncture on a real person",
  "Find someone who can name three anticoagulants",
  "Find someone who can spell Schistosoma haematobium",
  "Find someone who has seen malaria parasites on a slide",
  "Find someone who can outline the malaria life cycle",
  "Find someone who can explain the Gram stain simply",
  "Find someone who knows what a Howell-Jolly body is",
  "Find someone who knows their own blood group",
  "Find someone who has donated blood",
  "Find someone who can recite the order of draw",
  "Find someone who has used an autoclave",
  "Find someone who has made a blood smear",
  "Find someone who knows what QC stands for in a lab",
  "Find someone who can name the stain used for TB",
  "Find someone who can name a parasite found in stool",
  "Find someone who can name a tumour marker",
  "Find someone who knows a normal haemoglobin range",
  "Find someone who has used a micropipette",
  "Find someone who can name the five hepatitis viruses",
  "Find someone who knows what ELISA stands for",
  "Find someone who can name a Gram-negative bacterium",
  "Find someone who knows what PCR stands for",
  "Find someone who can name the vector of malaria",
  "Find someone who has seen a Reed-Sternberg cell",
  "Find someone who can name the three types of granulocytes",
  "Find someone who can explain serum versus plasma",
  "Find someone who can name a clotting factor",
  "Find someone who knows what HbA1c measures",
  "Find someone who can name a vector-borne disease",
  "Find someone who has studied in the library this week",
  "Find someone who can name a sexually transmitted infection",
  "Find someone who has worked a bench practical this week",
  "Find someone who can name a lab safety rule",
  "Find someone who knows what a biohazard symbol looks like",
  "Find someone who can name a type of anaemia",
  "Find someone who knows what ALT and AST test for",
  "Find someone who has handled a centrifuge",
  "Find someone who can name a culture medium",
  "Find someone who has used a haemocytometer",
  "Find someone who can name a disease caused by a virus",
  "Find someone who can name a fungal infection",
  "Find someone who has read a journal article this month",
  "Find someone who can name a cell organelle and its job",
  "Find someone who can define test sensitivity",
  "Find someone who has revised with a group this week",
  "Find someone who plays a musical instrument",
  "Find someone who can crochet or knit",
  "Find someone who can recite the Kenyan National Anthem",
  "Find someone who has a pet at home",
  "Find someone who has travelled abroad",
  "Find someone who speaks three or more languages",
  "Find someone who shares your birth month",
  "Find someone who can cook chapati",
  "Find someone who plays football or volleyball",
  "Find someone who can juggle",
  "Find someone who is left-handed",
  "Find someone who can whistle a tune",
  "Find someone whose favourite colour matches yours",
  "Find someone who walked to campus this week",
  "Find someone wearing something green this week",
  "Find someone who wears glasses",
  "Find someone who has a business or side hustle",
  "Find someone who writes poetry",
  "Find someone who can draw a cell from memory",
  "Find someone who has climbed a mountain",
  "Find someone who has been to the coast",
  "Find someone who drinks tea without sugar",
  "Find someone who can do a cartwheel",
  "Find someone who knows who discovered penicillin",
  "Find someone who knows the Father of Genetics",
  "Find someone who knows who discovered blood groups",
  "Find someone who can name the bacterium that causes TB",
  "Find someone who has a birthday this month",
  "Find someone who has been to a hospital lab visit",
  "Find someone who has a sibling studying at MUT",
  "Find someone who can sing a gospel song",
  "Find someone who has never missed a lecture this week",
  "Find someone who enjoys cooking",
  "Find someone who owns a stethoscope",
  "Find someone who prefers mornings to evenings",
  "Find someone who has used a microscope this week",
  "Find someone who can speak a language you cannot",
  "Find someone who has met a lab technologist in the field",
  "Find someone who has been on attachment or practicals",
  "Find someone who can name a Kenyan public health programme",
  "Find someone who has used the university library this week",
  "Find someone who can touch their toes",
  "Find someone who can name a famous scientist",
  "Find someone who has read a book this month",
  "Find someone who prefers tea over coffee",
  "Find someone who has a lab coat with their name on it",
  "Find someone who has helped a junior with notes",
  "Find someone who can name a vaccine-preventable disease",
  "Find someone who can name a bacterial STI",
  "Find someone who knows what a titre is",
  "Find someone who can name a common cause of a false result",
  "Find someone who knows what sterilisation means",
  "Find someone who has swabbed a bench with disinfectant",
  "Find someone who can name a type of centrifuge tube",
  "Find someone who has seen a sickle cell on a film",
  "Find someone who has seen a trypanosome on a slide",
  "Find someone who knows what Hb electrophoresis shows",
  "Find someone who has ever stained a slide",
  "Find someone who has read a package insert for a test kit",
  "Find someone who has heard of Kato-Katz"
];

const SQUARES_PER_BOARD = 24;
const BOARDS_PER_CYCLE = Math.floor(SQUARE_POOL.length / SQUARES_PER_BOARD);

// Small seeded random generator so everyone gets the SAME board in the same week.
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle(arr, seed) {
  const copy = [...arr];
  const rand = mulberry32(seed);
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Builds the 25-square board for a round id like "week-42".
function buildBoard(roundId) {
  const match = /^week-(-?\d+)$/.exec(roundId || "");
  const weekNumber = match ? Number(match[1]) : 0;
  const cycle = Math.floor(weekNumber / BOARDS_PER_CYCLE);
  const slot = ((weekNumber % BOARDS_PER_CYCLE) + BOARDS_PER_CYCLE) % BOARDS_PER_CYCLE;

  // A fresh shuffle every cycle, so the second run through is in a different order
  const order = seededShuffle(SQUARE_POOL, 1000 + cycle);
  const picked = order.slice(slot * SQUARES_PER_BOARD, (slot + 1) * SQUARES_PER_BOARD);

  // Put the FREE SPACE in the middle (index 12)
  return [...picked.slice(0, 12), "FREE SPACE", ...picked.slice(12)];
}

// Fires a confetti burst. Blackout gets a bigger, longer, two-sided burst;
// Bingo gets a single centered pop.
function fireConfetti(kind) {
  const colors = ["#ef6351", "#1f3b33", "#f4ede0", "#a8c3b8"]; // coral / lab / paper / soft accents

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
  const [name, setName] = useState(() => {
    try {
      return localStorage.getItem(NAME_KEY) || "";
    } catch {
      return "";
    }
  });
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
  const [showAllLeaderboard, setShowAllLeaderboard] = useState(false);
  // The server decides which week it is, so a wrong phone clock can't show the wrong board.
  const [roundId, setRoundId] = useState(() => getCurrentWeekId());

  const SQUARES = buildBoard(roundId);
  const MAX_POINTS = SQUARES.length * POINTS_PER_SQUARE;

  // Called when a saved card belongs to a finished week
  function retireOldCard(message) {
    try {
      localStorage.removeItem(CARD_KEY);
    } catch {
      /* ignore */
    }
    setCard(null);
    setActiveSquare(null);
    if (message) setToast(message);
  }

  useEffect(() => {
    let savedId = null;
    try {
      savedId = localStorage.getItem(CARD_KEY);
    } catch {
      /* ignore */
    }

    if (savedId) {
      fetch(`${API_BASE_URL}/api/bingo/${savedId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.currentRound) setRoundId(data.currentRound);
          if (!data.card) return;
          if (data.currentRound && data.card.round !== data.currentRound) {
            // Last week's card: keep the name so starting a new one is one tap
            try {
              localStorage.setItem(NAME_KEY, data.card.name);
            } catch {
              /* ignore */
            }
            setName(data.card.name);
            retireOldCard("New week, new Bingo board! Tap Start to begin your fresh card.");
          } else {
            setCard(data.card);
          }
        })
        .catch(() => {})
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

  function loadLeaderboard(full = false) {
    fetch(`${API_BASE_URL}/api/bingo/leaderboard${full ? "?full=true" : ""}`)
      .then((res) => res.json())
      .then((data) => {
        setLeaderboard(data.leaderboard || []);
        if (data.currentRound) setRoundId(data.currentRound);
      })
      .catch(() => {});
  }

  function toggleLeaderboardView() {
    const next = !showAllLeaderboard;
    setShowAllLeaderboard(next);
    loadLeaderboard(next);
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
      try {
        localStorage.setItem(CARD_KEY, data.card.id);
        localStorage.setItem(NAME_KEY, data.card.name);
      } catch {
        /* ignore */
      }
      if (data.card.round) setRoundId(data.card.round);
      loadLeaderboard();
    }
  }

  function openSquare(index) {
    if (index === 12) return;
    setActiveSquare(index);
    setInputValue((card.filled_squares || {})[index] || "");
  }

  async function saveSquare(personName) {
    const res = await fetch(`${API_BASE_URL}/api/bingo/${card.id}/fill`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ squareIndex: activeSquare, personName }),
    });
    const data = await res.json();

    // The week rolled over while this card was open
    if (res.status === 409 || data.expired) {
      retireOldCard("This week's board has ended — a new one is live. Tap Start for a fresh card.");
      loadLeaderboard();
      return null;
    }
    return data;
  }

  async function submitSquare(e) {
    e.preventDefault();
    const data = await saveSquare(inputValue.trim());
    if (data && data.card) {
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
    const data = await saveSquare("");
    if (data && data.card) {
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
    try {
      localStorage.setItem(CARD_KEY, foundCard.id);
      localStorage.setItem(NAME_KEY, foundCard.name);
    } catch {
      /* ignore */
    }
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
      try {
        localStorage.setItem(NAME_KEY, data.card.name);
      } catch {
        /* ignore */
      }
      loadLeaderboard();
    }
  }

  if (loading) return null;

  const filledCount = card ? Object.keys(card.filled_squares || {}).length : 0;
  const points = filledCount * POINTS_PER_SQUARE;
  const weekLabel = getWeekLabel(roundId);

  return (
    <section id="bingo" className="border-t border-ink/10 py-20 dark:border-dark-border md:py-28">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="fixed left-1/2 top-4 z-[120] w-[90%] max-w-md -translate-x-1/2 rounded-sm bg-lab-900 px-4 py-2 text-center text-sm text-paper shadow-lg"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-2xl px-5 md:px-8">
        <span className="label-tag text-lab-700 dark:text-lab-500">
          This week's challenge{weekLabel ? ` · ${weekLabel}` : ""}
        </span>
        <h2 className="mt-3 font-display text-3xl font-semibold text-lab-900 md:text-4xl dark:text-dark-ink">
          MUTMLSA Bingo
        </h2>
        <p className="mt-3 max-w-xl text-ink-soft dark:text-dark-ink-soft">
          Find someone who fits each square and write their name in — each
          square is worth {POINTS_PER_SQUARE} points, {MAX_POINTS} total. A brand-new board goes live
          every Monday, so you get a fresh card each week.
        </p>

        {leaderboard.length > 0 && (
          <div className="mt-6 rounded-sm border border-ink/10 bg-lab-50/50 p-4 dark:border-dark-border dark:bg-dark-surface/40">
            <p className="label-tag text-lab-700 dark:text-lab-500">This week's leaderboard</p>
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

              {leaderboard.length >= 10 && (
                <button
                  type="button"
                  onClick={toggleLeaderboardView}
                  className="label-tag mt-2 text-lab-700 underline underline-offset-4 dark:text-lab-500"
                >
                  {showAllLeaderboard ? "Show top 10 only" : "Show everyone"}
                </button>
              )}
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
              Already started this week on another device?
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
              <div>
                <p className="label-tag flex flex-wrap items-center gap-2 text-lab-700 dark:text-lab-500">
                  Playing as {card.name} · {filledCount}/{SQUARES.length} squares · {points}/{MAX_POINTS} pts
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
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-lab-100 dark:bg-dark-surface">
                  <motion.div
                    className="h-full bg-coral-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${(filledCount / SQUARES.length) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>
            )}
            <NotifyOptIn playerName={card.name} />
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
                      key={`${roundId}-${i}`}
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