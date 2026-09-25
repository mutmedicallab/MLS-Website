import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { API_BASE_URL } from "../config/api";
import { getCurrentPeriodId } from "../utils/periodId";


const WEEK_ID = getCurrentPeriodId(2); 
const ROUND_SECONDS = 60;
const QUESTIONS_PER_ROUND = 12;

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
  { term: "Erythrocyte", options: ["Another name for a red blood cell", "Another name for a white blood cell", "Another name for a platelet", "Another name for plasma"], correctIndex: 0 },
  { term: "Leukocyte", options: ["Another name for a white blood cell", "Another name for a red blood cell", "Another name for a platelet", "Another name for serum"], correctIndex: 0 },
  { term: "Plasma", options: ["The liquid portion of blood before clotting", "The liquid portion of blood after clotting", "A type of white cell", "A clotting factor"], correctIndex: 0 },
  { term: "Serum", options: ["The liquid portion of blood after clotting", "The liquid portion of blood before clotting", "Whole blood with anticoagulant", "A type of stain"], correctIndex: 0 },
  { term: "Autoclave", options: ["A device that sterilizes using pressurized steam", "A device that counts cells", "A device that separates plasma", "A device used only for staining"], correctIndex: 0 },
  { term: "Pipette", options: ["A tool for measuring and transferring liquid", "A tool for cutting tissue", "A tool for staining slides", "A tool for centrifuging samples"], correctIndex: 0 },
  { term: "Turbidity", options: ["Cloudiness of a liquid sample", "The color of a liquid sample", "The temperature of a sample", "The pH of a sample"], correctIndex: 0 },
  { term: "Calibration", options: ["Adjusting equipment against a known standard", "Cleaning equipment after use", "Storing equipment safely", "Repairing broken equipment"], correctIndex: 0 },
  { term: "Quality control (QC)", options: ["Ongoing checks to ensure test results are accurate", "The final report given to a patient", "A type of blood tube", "A method of drawing blood"], correctIndex: 0 },
  { term: "Hemoglobin", options: ["The oxygen-carrying protein in red blood cells", "A type of white blood cell", "A clotting factor", "A plasma protein unrelated to oxygen"], correctIndex: 0 },
  { term: "Differential count", options: ["Breakdown of the different types of white blood cells", "Total red blood cell count", "Total platelet count", "Measurement of plasma volume"], correctIndex: 0 },
  { term: "Anemia", options: ["A reduction in red blood cells or hemoglobin", "An increase in white blood cells", "A clotting disorder", "An infection of the blood"], correctIndex: 0 },
  { term: "Thrombosis", options: ["Formation of a blood clot inside a vessel", "Destruction of red blood cells", "A type of anemia", "A bacterial infection"], correctIndex: 0 },
  { term: "Hemoconcentration", options: ["A falsely elevated result from prolonged tourniquet use", "A method of diluting a sample", "A type of stain", "A rare blood disorder"], correctIndex: 0 },
  { term: "Chain of custody", options: ["Documentation tracking a sample from collection to result", "The order tubes are drawn in", "A type of centrifuge setting", "A staining sequence"], correctIndex: 0 },
  { term: "Nosocomial infection", options: ["An infection acquired in a healthcare setting", "An infection acquired at home", "A genetic blood disorder", "A type of allergic reaction"], correctIndex: 0 },
  { term: "Coagulation", options: ["The process of blood clotting", "The process of red cell destruction", "The process of plasma separation", "The process of bacterial growth"], correctIndex: 0 },
  { term: "Fibrinogen", options: ["A plasma protein that converts to fibrin during clotting", "A type of white blood cell", "An antibody", "A red blood cell enzyme"], correctIndex: 0 },
  { term: "Microbiology", options: ["The study of microorganisms", "The study of blood cells", "The study of tissues", "The study of hormones"], correctIndex: 0 },
  { term: "Histopathology", options: ["The study of diseased tissue under a microscope", "The study of blood clotting", "The study of urine composition", "The study of bacteria culturing"], correctIndex: 0 },
  { term: "Cytology", options: ["The study of individual cells", "The study of whole organs", "The study of bones", "The study of the nervous system"], correctIndex: 0 },
  { term: "Immunology", options: ["The study of the immune system", "The study of bacteria", "The study of blood clotting only", "The study of hormones only"], correctIndex: 0 },
  { term: "Clinical chemistry", options: ["Lab testing of chemical components in body fluids", "The study of bacteria under a microscope", "The study of blood cell shapes", "The study of genetics"], correctIndex: 0 },
  { term: "Hemolyzed sample", options: ["A sample where red cells have ruptured, affecting results", "A sample that has clotted normally", "A perfectly usable sample", "A sample diluted with saline"], correctIndex: 0 },
  { term: "Point-of-care testing", options: ["Testing performed near the patient rather than in a central lab", "Testing only done in research labs", "A type of blood tube", "A method of staining"], correctIndex: 0 },
  { term: "Reference range", options: ["The expected normal range of values for a test", "The exact result every patient should have", "A type of anticoagulant", "A brand of lab equipment"], correctIndex: 0 },
  { term: "Antibody", options: ["A protein made by the immune system to fight antigens", "A type of white blood cell", "A clotting factor", "A plasma electrolyte"], correctIndex: 0 },
  { term: "Agglutination", options: ["Clumping of cells or particles, often antigen-antibody reactions", "The dissolving of red blood cells", "The formation of a fibrin clot", "The staining of bacteria"], correctIndex: 0 },
  { term: "Sterilization", options: ["The complete destruction of all microorganisms", "Reducing microorganisms to a safe level", "Cleaning visible dirt only", "Freezing a sample for storage"], correctIndex: 0 },
  { term: "Disinfection", options: ["Reducing microorganisms to a safe level, not total elimination", "Complete destruction of all microorganisms including spores", "Freezing a sample", "Diluting a reagent"], correctIndex: 0 },
  { term: "Pathogen", options: ["A microorganism capable of causing disease", "Any microorganism, harmful or not", "A type of white blood cell", "A laboratory reagent"], correctIndex: 0 },
  { term: "Culture and sensitivity", options: ["Growing an organism and testing which antibiotics work against it", "Staining a slide for viewing", "Counting blood cells", "Measuring plasma electrolytes"], correctIndex: 0 },
  { term: "Hemocytometer", options: ["A device used to manually count blood cells", "A device used to spin samples", "A device used to sterilize equipment", "A device used to measure pH"], correctIndex: 0 },
  { term: "Electrolytes", options: ["Charged minerals in the blood such as sodium and potassium", "A type of white blood cell", "A clotting protein", "A stain used in microbiology"], correctIndex: 0 },
  { term: "Glucose tolerance test", options: ["A test measuring how the body processes sugar over time", "A test measuring hemoglobin levels", "A test measuring white cell count", "A test measuring clotting time"], correctIndex: 0 },
  { term: "Prothrombin time (PT)", options: ["A test measuring how long it takes blood to clot via one pathway", "A test measuring red cell count", "A test measuring hemoglobin concentration", "A test measuring bacterial growth"], correctIndex: 0 },
  { term: "Urinalysis", options: ["Laboratory examination of urine", "Laboratory examination of blood only", "Laboratory examination of tissue", "Laboratory examination of sputum"], correctIndex: 0 },
  { term: "Cross-matching", options: ["Testing donor and recipient blood compatibility before transfusion", "Testing for bacterial infection", "Testing for glucose levels", "Testing for hormone levels"], correctIndex: 0 },
  { term: "Biohazard", options: ["Biological material that poses a risk to health", "Any laboratory chemical", "A type of blood tube", "A staining reagent"], correctIndex: 0 },
  { term: "Specimen labeling", options: ["Identifying a sample correctly to prevent mix-ups", "The color-coding of tube caps only", "A step only done after testing", "An optional step in busy labs"], correctIndex: 0 },
  { term: "Hemolytic anemia", options: ["Anemia caused by premature destruction of red blood cells", "Anemia caused by low iron intake only", "Anemia caused by vitamin excess", "A clotting disorder unrelated to red cells"], correctIndex: 0 },
  { term: "Bilirubin", options: ["A breakdown product of hemoglobin, linked to jaundice", "A clotting factor", "A type of white blood cell", "An electrolyte"], correctIndex: 0 },
  { term: "Creatinine", options: ["A waste product used to assess kidney function", "A protein used to assess liver function only", "A clotting factor", "A type of antibody"], correctIndex: 0 },
  { term: "Fasting sample", options: ["A specimen collected after a period of not eating, for accurate results", "Any specimen collected in the morning", "A specimen collected after exercise", "A specimen collected without informing the patient"], correctIndex: 0 },
  { term: "External quality assessment (EQA)", options: ["A program where labs test samples to compare accuracy against other labs", "A daily internal cleaning checklist", "A patient satisfaction survey", "A type of staining kit"], correctIndex: 0 },
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
  const [phase, setPhase] = useState("intro");
  const [round, setRound] = useState([]);
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [leaderboard, setLeaderboard] = useState([]);
  const [existingAttempt, setExistingAttempt] = useState(null);
  const [checking, setChecking] = useState(false);
  const timerRef = useRef(null);
  const [periods, setPeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [showAllLeaderboard, setShowAllLeaderboard] = useState(false);

useEffect(() => {
  loadLeaderboard();
  loadPeriods();
}, []);
  

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  function loadLeaderboard(full = false) {
  fetch(`${API_BASE_URL}/api/quiz/leaderboard?week=${encodeURIComponent(WEEK_ID)}${full ? "&full=true" : ""}`)
    .then((res) => res.json())
    .then((data) => setLeaderboard(data.leaderboard || []));
}

  function loadPeriods() {
  fetch(`${API_BASE_URL}/api/quiz/champions-by-period`)
    .then((res) => res.json())
    .then((data) => {
      setPeriods(data.periods || []);
      if (data.periods?.length) setSelectedPeriod(data.periods[0].period);
    });
}

function toggleLeaderboardView() {
  const next = !showAllLeaderboard;
  setShowAllLeaderboard(next);
  loadLeaderboard(next);
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
          Match each term to its correct definition before the clock runs out — {QUESTIONS_PER_ROUND} terms,
          drawn at random from a much larger pool each time. One attempt per person per week.
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

        {periods.length > 0 && (
  <div className="mt-4 rounded-sm border border-ink/10 bg-lab-50/50 p-4 dark:border-dark-border dark:bg-dark-surface/40">
    <div className="flex items-center justify-between">
      <p className="label-tag text-lab-700 dark:text-lab-500">Champions</p>
      <select
        value={selectedPeriod || ""}
        onChange={(e) => setSelectedPeriod(e.target.value)}
        className="rounded-sm border border-ink/15 bg-transparent px-2 py-1 text-xs dark:border-dark-border dark:text-dark-ink"
      >
        {periods.map((p) => (
          <option key={p.period} value={p.period}>{p.label}</option>
        ))}
      </select>
    </div>
    <div className="mt-2 space-y-1">
      {periods
        .find((p) => p.period === selectedPeriod)
        ?.top.map((entry, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <span className="text-ink-soft dark:text-dark-ink-soft">
              {["🥇", "🥈", "🥉"][i]} {entry.name}
            </span>
            <span className="font-semibold text-lab-800 dark:text-dark-ink">
              {entry.score}/{entry.total}
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



