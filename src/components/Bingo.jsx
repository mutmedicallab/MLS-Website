import { useState, useEffect } from "react";
import { API_BASE_URL } from "../config/api";

const POINTS_PER_SQUARE = 10;

const SQUARES = [
  "Attend a Thursday meeting",
  "Talk to someone from a different year",
  "Visit the Moments section",
  "Meet a committee member",
  "Attend Game Night",
  "Ask the chatbot a question",
  "Share the site with a classmate",
  "Read the MUTMLSA constitution highlights",
  "Visit the Alumni gallery",
  "Subscribe to the newsletter",
  "Follow @mut_mlsa on Instagram",
  "Attend a screening camp / outreach event",
  "Learn one thing about Haematology",
  "Learn one thing about Microbiology",
  "Take a photo at a MUTMLSA event",
  "Message the committee on WhatsApp",
  "Toggle dark mode on the site",
  "Meet a Y4 student",
  "Attend the Recruitment Drive",
  "Find your name in the admin roster",
  "Learn about the KEMELSA Conference",
  "Ask a debate question at a meeting",
  "Watch the Game Night video in Moments",
  "Recommend MUTMLSA to a friend",
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
    setActiveSquare(index);
    setInputValue(card.filled_squares[index] || "");
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

  const filledCount = card ? Object.keys(card.filled_squares).length : 0;
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
          square is worth {POINTS_PER_SQUARE} points.
        </p>

        {leaderboard.length > 0 && (
          <div className="mt-6 rounded-sm border border-ink/10 bg-lab-50/50 p-4 dark:border-dark-border dark:bg-dark-surface/40">
            <p className="label-tag text-lab-700 dark:text-lab-500">Leaderboard</p>
            <div className="mt-2 space-y-1">
              {leaderboard.map((entry, i) => (
                <div key={entry.id} className="flex items-center justify-between text-sm">
                  <span className="text-ink-soft dark:text-dark-ink-soft">
                    {i + 1}. {entry.name}
                  </span>
                  <span className="font-semibold text-lab-800 dark:text-dark-ink">
                    {entry.score} pts
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

            <div className="mt-4 divide-y divide-ink/10 overflow-hidden rounded-sm border border-ink/10 dark:divide-dark-border dark:border-dark-border">
              {SQUARES.map((sq, i) => {
                const filledName = card.filled_squares[i];
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => openSquare(i)}
                    className={`flex w-full flex-col gap-1 px-4 py-4 text-left transition-colors ${
                      filledName
                        ? "bg-lab-600 text-paper"
                        : "bg-lab-50/50 text-ink hover:bg-lab-100/60 dark:bg-dark-surface/40 dark:text-dark-ink dark:hover:bg-dark-surface/70"
                    }`}
                  >
                    <span className="text-sm leading-snug">{sq}</span>
                    {filledName ? (
                      <span className="text-xs font-semibold text-paper/90">
                        — {filledName}
                      </span>
                    ) : (
                      <span className="label-tag text-ink-soft dark:text-dark-ink-soft">
                        Tap to add
                      </span>
                    )}
                  </button>
                );
              })}
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
                    {card.filled_squares[activeSquare] && (
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
          </div>
        )}
      </div>
    </section>
  );
}