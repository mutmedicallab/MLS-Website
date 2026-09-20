import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { API_BASE_URL } from "../config/api";

// Same week identifier convention as Bingo/Quiz — update weekly.
const WEEK_ID = "2026-W39";
const ROUND_SECONDS = 60;
const QUESTIONS_PER_ROUND = 15; // drawn randomly from the pool below each attempt

// A bigger pool than one round needs, so each attempt feels a little
// different. Edit/expand this list whenever — no need to keep it in sync
// with a specific week, unlike Quiz's QUESTIONS.
const TERM_POOL = [
  { term: "Hemolysis", options: ["Destruction of red blood cells", "Clotting of blood", "White cell increase", "Platelet clumping"], correctIndex: 0 },
  { term: "Leukocytosis", options: ["Low white cell count", "High white cell count", "Low platelet count", "High red cell count"], correctIndex: 1 },
  { term: "Anticoagulant", options: ["Speeds up clotting", "Prevents clotting", "Destroys red cells", "Increases platelets"], correctIndex: 1 },
  { term: "EDTA tube color", options: ["Red", "Lavender", "Green", "Light blue"], correctIndex: 1 },
  { term: "Citrate tube color", options: ["Light blue", "Yellow", "Gray", "Red"], correctIndex: 0 },
  { term: "Hematocrit", options: ["Percentage of plasma in blood", "Percentage of RBCs in blood", "White cell differential", "Platelet count"], correctIndex: 1 },
  { term: "Aseptic technique", options: ["Cleaning after the draw", "Methods to prevent contamination", "A type of centrifuge", "A staining method"], correctIndex: 1 },
  { term: "Reticulocyte", options: ["Mature red blood cell", "Immature red blood cell", "A type of white cell", "A platelet precursor"], correctIndex: 1 },
  { term: "Serology", options: ["Study of urine", "Study of serum/antibodies", "Study of bacteria growth", "Study of tissue"], correctIndex: 1 },
  { term: "Centrifugation", options: ["Heating a sample", "Spinning to separate components", "Freezing a sample", "Diluting a sample"], correctIndex: 1 },
  { term: "Gram stain", options: ["Used to classify bacteria", "Used to count platelets", "Used to measure glucose", "Used to detect antibodies"], correctIndex: 0 },
  { term: "Venipuncture", options: ["Drawing blood from a vein", "Drawing blood from an artery", "A type of stain", "A type of centrifuge"], correctIndex: 0 },
  { term: "Hemostasis", options: ["Process of stopping bleeding", "Process of red cell production", "Process of infection", "Process of digestion"], correctIndex: 0 },
  { term: "Thrombocyte", options: ["Another name for platelet", "Another name for red cell", "Another name for white cell", "Another name for plasma"], correctIndex: 0 },
  { term: "Sedimentation rate", options: ["Speed of clot formation", "Rate RBCs settle in a tube", "Rate of hemolysis", "Rate of infection spread"], correctIndex: 1 },
  { term: "Culture medium", options: ["A stain for slides", "A substance for growing microorganisms", "A type of tube", "A centrifuge setting"], correctIndex: 1 },
  { term: "Antigen", options: ["A substance triggering an immune response", "A type of white cell", "A clotting factor", "A stain reagent"], correctIndex: 0 },
  { term: "Phlebotomy", options: ["Study of bacteria", "The practice of drawing blood", "The study of urine", "A staining technique"], correctIndex: 1 },
];

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function SpeedRound() {
  const [name, setName] = useState("");
  const [phase, setPhase] = useState("intro"); // intro | playing | done
  const [round, setRound] = useState([]);
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [leaderboard, setLeaderboard] = useState([]);
  const [existingAttempt, setExistingAttempt] = useState(null);
  const [checking, setChecking] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  function loadLeaderboard() {
    fetch(`${API_BASE_URL}/api/sprint/leaderboard?week=${encodeURIComponent(WEEK_ID)}`)
      .then((res) => res.json())
      .then((data) => setLeaderboard(data.leaderboard || []));
  }

  const endRound = useCallback(
    async (finalScore) => {
      clearInterval(timerRef.current);
      setPhase("done");

      if (finalScore >= QUESTIONS_PER_ROUND - 1) {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
      }

      await fetch(`${API_BASE_URL}/api/sprint/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ week: WEEK_ID, name: name.trim(), score: finalScore }),
      });
      loadLeaderboard();
    },
    [name]
  );

  async function checkExistingAndStart(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setChecking(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/sprint/attempt?week=${encodeURIComponent(WEEK_ID)}&name=${encodeURIComponent(name.trim())}`
      );
      const data = await res.json();
      if (data.attempt) {
        setExistingAttempt(data.attempt);
        return;
      }
      startRound();
    } finally {
      setChecking(false);
    }
  }

  function startRound() {
    const picked = shuffle(TERM_POOL).slice(0, QUESTIONS_PER_ROUND);
    setRound(picked);
    setStep(0);
    setScore(0);
    setTimeLeft(ROUND_SECONDS);
    setPhase("playing");

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  // Time ran out mid-round.
  useEffect(() => {
    if (phase === "playing" && timeLeft === 0) {
      endRound(score);
    }
  }, [timeLeft, phase, score, endRound]);

  function answer(optionIndex) {
    const isCorrect = optionIndex === round[step].correctIndex;
    const newScore = isCorrect ? score + 1 : score;
    if (isCorrect) setScore(newScore);

    if (step < round.length - 1) {
      setStep((s) => s + 1);
    } else {
      endRound(newScore);
    }
  }

  const current = round[step];

  return (
    <section id="speed-round" className="border-t border-ink/10 py-20 dark:border-dark-border md:py-28">
      <div className="mx-auto max-w-2xl px-5 md:px-8">
        <span className="label-tag text-lab-700 dark:text-lab-500">This week's speed round</span>
        <h2 className="mt-3 font-display text-3xl font-semibold text-lab-900 md:text-4xl dark:text-dark-ink">
          60-Second Term Sprint
        </h2>
        <p className="mt-3 max-w-xl text-ink-soft dark:text-dark-ink-soft">
          Match each term to its correct definition before the clock runs out. One attempt per person per week.
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
                    {entry.score} correct
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {phase === "intro" && (
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
                You've already run this week's sprint — scored {existingAttempt.score} correct.
                Come back next week for a new round.
              </p>
            )}
          </motion.div>
        )}

        {phase === "playing" && current && (
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <p className="label-tag text-lab-700 dark:text-lab-500">
                {step + 1}/{round.length} · Score: {score}
              </p>
              <motion.p
                key={timeLeft}
                initial={{ scale: 1.15 }}
                animate={{ scale: 1 }}
                className={`font-display text-2xl font-bold ${
                  timeLeft <= 10 ? "text-coral-600" : "text-lab-800 dark:text-dark-ink"
                }`}
              >
                {timeLeft}s
              </motion.p>
            </div>

            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-lab-100 dark:bg-dark-surface">
              <motion.div
                className={`h-full ${timeLeft <= 10 ? "bg-coral-600" : "bg-coral-500"}`}
                animate={{ width: `${(timeLeft / ROUND_SECONDS) * 100}%` }}
                transition={{ duration: 0.9, ease: "linear" }}
              />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="mt-5 rounded-sm border border-ink/10 bg-lab-50/50 p-5 dark:border-dark-border dark:bg-dark-surface/40"
              >
                <p className="font-display text-xl font-semibold text-lab-900 dark:text-dark-ink">
                  {current.term}
                </p>
                <div className="mt-4 space-y-2">
                  {current.options.map((opt, i) => (
                    <motion.button
                      key={i}
                      type="button"
                      whileTap={{ scale: 0.98 }}
                      onClick={() => answer(i)}
                      className="block w-full rounded-sm border border-ink/15 px-3 py-2 text-left text-sm text-ink transition-colors hover:bg-lab-100/60 dark:border-dark-border dark:text-dark-ink dark:hover:bg-dark-surface/70"
                    >
                      {opt}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        <AnimatePresence>
          {phase === "done" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 240, damping: 18 }}
              className="mt-8 rounded-sm border border-ink/10 bg-lab-50/50 p-6 text-center dark:border-dark-border dark:bg-dark-surface/40"
            >
              <p className="font-display text-3xl font-bold text-lab-900 dark:text-dark-ink">
                {score} correct
              </p>
              <p className="mt-2 text-sm text-ink-soft dark:text-dark-ink-soft">
                Time's up — check the leaderboard above and come back next week.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}