import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { API_BASE_URL } from "../config/api";

// Update this every week you publish new questions — it's what separates
// one week's leaderboard/attempts from the next.
const WEEK_ID = "2026-W39";

// Mix of "image_id" and "case_study" questions. Edit this array weekly,
// same pattern as Bingo's SQUARES list.
const QUESTIONS = [
  {
    type: "image_id",
    imageUrl: "/quiz/plasmodium-falciparum.jpg",
    prompt: "What organism is shown in this blood smear?",
    options: [
      "Plasmodium falciparum",
      "Plasmodium vivax",
      "Trypanosoma brucei",
      "Leishmania donovani",
    ],
    correctIndex: 0,
  },
  {
    type: "case_study",
    prompt:
      "A 24-year-old presents with intermittent fever, chills, and headache after returning from a trip to a malaria-endemic region two weeks ago. A blood film shows ring-form trophozoites with multiple infections per cell and no schizonts seen. Which organism best fits this picture?",
    options: [
      "Plasmodium falciparum",
      "Plasmodium malariae",
      "Plasmodium ovale",
      "Plasmodium knowlesi",
    ],
    correctIndex: 0,
  },
  {
    type: "case_study",
    prompt:
      "A venipuncture sample is collected into the wrong order of tubes, and a coagulation (citrate) tube is drawn after an EDTA tube using the same needle without discarding a clear tube first. What is the most likely consequence for the coagulation results?",
    options: [
      "Falsely prolonged clotting times due to EDTA contamination",
      "No effect on results",
      "Falsely shortened clotting times",
      "Hemolysis only, coagulation results unaffected",
    ],
    correctIndex: 0,
  },
];

export default function Quiz() {
  const [name, setName] = useState("");
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null); // { score, total }
  const [leaderboard, setLeaderboard] = useState([]);
  const [existingAttempt, setExistingAttempt] = useState(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  function loadLeaderboard() {
    fetch(`${API_BASE_URL}/api/quiz/leaderboard?week=${encodeURIComponent(WEEK_ID)}`)
      .then((res) => res.json())
      .then((data) => setLeaderboard(data.leaderboard || []));
  }

  async function checkExistingAndStart(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setChecking(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/quiz/attempt?week=${encodeURIComponent(WEEK_ID)}&name=${encodeURIComponent(name.trim())}`
      );
      const data = await res.json();
      if (data.attempt) {
        setExistingAttempt(data.attempt);
      } else {
        setStarted(true);
      }
    } finally {
      setChecking(false);
    }
  }

  function selectAnswer(optionIndex) {
    setAnswers((prev) => ({ ...prev, [step]: optionIndex }));
  }

  function nextQuestion() {
    if (step < QUESTIONS.length - 1) {
      setStep((s) => s + 1);
    } else {
      finishQuiz();
    }
  }

  async function finishQuiz() {
    const score = QUESTIONS.reduce(
      (acc, q, i) => acc + (answers[i] === q.correctIndex ? 1 : 0),
      0
    );
    const total = QUESTIONS.length;
    setResult({ score, total });
    setSubmitted(true);

    if (score === total) {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
    }

    await fetch(`${API_BASE_URL}/api/quiz/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ week: WEEK_ID, name: name.trim(), score, total }),
    });
    loadLeaderboard();
  }

  const currentQuestion = QUESTIONS[step];
  const currentAnswer = answers[step];

  return (
    <section id="quiz" className="border-t border-ink/10 py-20 dark:border-dark-border md:py-28">
      <div className="mx-auto max-w-2xl px-5 md:px-8">
        <span className="label-tag text-lab-700 dark:text-lab-500">This week's quiz</span>
        <h2 className="mt-3 font-display text-3xl font-semibold text-lab-900 md:text-4xl dark:text-dark-ink">
          Lab Science Quiz
        </h2>
        <p className="mt-3 max-w-xl text-ink-soft dark:text-dark-ink-soft">
          {QUESTIONS.length} questions — identification and case-based reasoning.
          One attempt per person per week.
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
                    {entry.score}/{entry.total}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!started && !submitted && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mt-8 max-w-sm"
          >
            <form onSubmit={checkExistingAndStart} className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name or nickname"
                className="flex-1 rounded-sm border border-ink/15 bg-transparent px-3 py-2 text-sm dark:border-dark-border dark:text-dark-ink"
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={checking}
                className="rounded-sm bg-coral-500 px-4 py-2 text-sm font-semibold text-paper disabled:opacity-50"
              >
                {checking ? "Checking…" : "Start"}
              </motion.button>
            </form>

            {existingAttempt && (
              <p className="mt-3 text-sm text-coral-600">
                You've already played this week's quiz — scored {existingAttempt.score}/
                {existingAttempt.total}. Come back next week for a new one.
              </p>
            )}
          </motion.div>
        )}

        {started && !submitted && (
          <div className="mt-8">
            <p className="label-tag text-lab-700 dark:text-lab-500">
              Question {step + 1} of {QUESTIONS.length}
            </p>

            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-lab-100 dark:bg-dark-surface">
              <motion.div
                className="h-full bg-coral-500"
                animate={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25 }}
                className="mt-5 rounded-sm border border-ink/10 bg-lab-50/50 p-5 dark:border-dark-border dark:bg-dark-surface/40"
              >
                {currentQuestion.type === "image_id" && currentQuestion.imageUrl && (
                  <img
                    src={currentQuestion.imageUrl}
                    alt="Identify this"
                    className="mb-4 aspect-video w-full rounded-sm object-cover"
                  />
                )}
                <p className="text-sm text-ink dark:text-dark-ink">{currentQuestion.prompt}</p>

                <div className="mt-4 space-y-2">
                  {currentQuestion.options.map((opt, i) => {
                    const isSelected = currentAnswer === i;
                    return (
                      <motion.button
                        key={i}
                        type="button"
                        whileTap={{ scale: 0.98 }}
                        onClick={() => selectAnswer(i)}
                        className={`block w-full rounded-sm border px-3 py-2 text-left text-sm transition-colors ${
                          isSelected
                            ? "border-coral-500 bg-coral-500 text-paper"
                            : "border-ink/15 text-ink hover:bg-lab-100/60 dark:border-dark-border dark:text-dark-ink dark:hover:bg-dark-surface/70"
                        }`}
                      >
                        {opt}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>

            <motion.button
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={nextQuestion}
              disabled={currentAnswer === undefined}
              className="mt-5 rounded-sm bg-lab-800 px-4 py-2 text-sm font-semibold text-paper disabled:opacity-40 dark:bg-lab-600"
            >
              {step < QUESTIONS.length - 1 ? "Next question" : "Finish quiz"}
            </motion.button>
          </div>
        )}

        <AnimatePresence>
          {submitted && result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 240, damping: 18 }}
              className="mt-8 rounded-sm border border-ink/10 bg-lab-50/50 p-6 text-center dark:border-dark-border dark:bg-dark-surface/40"
            >
              <p className="font-display text-3xl font-bold text-lab-900 dark:text-dark-ink">
                {result.score}/{result.total}
              </p>
              <p className="mt-2 text-sm text-ink-soft dark:text-dark-ink-soft">
                {result.score === result.total
                  ? "Perfect score — nicely done."
                  : "Good effort — see the leaderboard above, and try again next week."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}