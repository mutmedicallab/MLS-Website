import { useState, useEffect } from "react";
import { API_BASE_URL } from "../config/api";

const POINTS_PER_SQUARE = 10;
const HEADER_LETTERS = ["B", "I", "N", "G", "O"];

const SQUARES = [
  "Attended this week'sThursday meeting",
  "Has talked to someone from a different year",
  "Visited the Moments section",
  "Met a committee member",
  "Attended Game Night last semester",
  "Has asked the chatbot a question",
  "Shared the site with a classmate",
  "Read the MUTMLSA constitution highlights",
  "Visited the Alumni gallery",
  "Subscribed to the newsletter",
  "Follow @mut_mlsa on Instagram",
  "Attended a screening camp / outreach event this year",
  "FREE SPACE",
  "Learned one thing about Microbiology",
  "Learned a new thing about Haematology",
  "Find someone who can play a Musical Instrument",
  "Knows someone who has travelled abroad in School",
  "Met a Y4 student this week",
  "Find someone who can play chess like a pro",
  "Knows the Father of Genetics",
  "Knows the two people in the Kemelsa Council at MUT",
  "Knows the name of Our School President",
  "Watched the Game Night video in Moments",
  "Recommended MUTMLSA to a friend this week",
  "Knows the name of the MUTMLSA Secretary General",
];

const MAX_POINTS = SQUARES.length * POINTS_PER_SQUARE;

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

  if (loading) return null;

  const filledCount = card ? Object.keys(card.filled_squares || {}).length : 0;
  const points = filledCount * POINTS_PER_SQUARE;

  return (
    <section id="bingo" className="border-t border-ink/10 py-20 dark:border-dark-border md:py-28">
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
              {leaderboard.map((entry, i) => (
                <div key={entry.id} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-ink-soft dark:text-dark-ink-soft">
                    {i + 1}. {entry.name}
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
              ))}
            </div>
          </div>
        )}

        {!card ? (
          <div className="mt-8 max-w-sm">
            <form onSubmit={handleCreate} className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="flex-1 rounded-sm border border-ink/15 bg-transparent px-3 py-2 text-sm dark:border-dark-border dark:text-dark-ink"
              />
              <button
                type="submit"
                className="rounded-sm bg-coral-500 px-4 py-2 text-sm font-semibold text-paper"
              >
                Start
              </button>
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
              <button
                type="submit"
                className="rounded-sm border border-lab-700 px-4 py-2 text-sm font-semibold text-lab-700 dark:border-lab-500 dark:text-lab-500"
              >
                Find
              </button>
            </form>
            {searchResults.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => selectFoundCard(c)}
                className="mt-2 block w-full rounded-sm border border-ink/10 p-2 text-left text-sm dark:border-dark-border"
              >
                {c.name} — started {new Date(c.created_at).toLocaleDateString()}
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-8">
            <p className="label-tag text-lab-700 dark:text-lab-500">
              Playing as {card.name} · {filledCount}/{SQUARES.length} squares · {points}/{MAX_POINTS} pts
            </p>

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
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => openSquare(i)}
                      disabled={isFree}
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
                    </button>
                  );
                })}
              </div>
            </div>

            {activeSquare !== null && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-lab-900/80 p-5">
                <div className="w-full max-w-sm rounded-sm bg-paper p-5 dark:bg-dark-bg">
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
                    <button
                      type="submit"
                      className="rounded-sm bg-coral-500 px-4 py-2 text-sm font-semibold text-paper"
                    >
                      Save
                    </button>
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
                </div>
              </div>
            )}

            {celebration && (
              <div
                className="fixed inset-0 z-[110] flex items-center justify-center bg-lab-900/85 p-5"
                onClick={() => setCelebration(null)}
              >
                <div className="rounded-sm bg-paper px-10 py-8 text-center shadow-2xl dark:bg-dark-bg">
                  <p className="font-display text-5xl font-bold tracking-tight text-coral-600">
                    {celebration === "blackout" ? "BLACKOUT!" : "BINGO!"}
                  </p>
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
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}