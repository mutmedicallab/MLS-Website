import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { API_BASE_URL } from "../config/api";
import { getCurrentPeriodId } from "../utils/periodId";

const WEEK_ID = getCurrentPeriodId(2); 
const QUESTIONS_PER_ATTEMPT = 5;

const QUESTION_POOL = [
  {
    type: "image_id",
    imageUrl: "/quiz/plasmodium-falciparum.jpg",
    prompt: "What organism is shown in this blood smear?",
    options: ["Plasmodium falciparum", "Plasmodium vivax", "Trypanosoma brucei", "Leishmania donovani"],
    correctIndex: 0,
  },
  {
    type: "case_study",
    prompt: "A 24-year-old presents with intermittent fever, chills, and headache after returning from a trip to a malaria-endemic region two weeks ago. A blood film shows ring-form trophozoites with multiple infections per cell and no schizonts seen. Which organism best fits this picture?",
    options: ["Plasmodium falciparum", "Plasmodium malariae", "Plasmodium ovale", "Plasmodium knowlesi"],
    correctIndex: 0,
  },
  {
    type: "case_study",
    prompt: "A venipuncture sample is collected into the wrong order of tubes, and a coagulation (citrate) tube is drawn after an EDTA tube using the same needle without discarding a clear tube first. What is the most likely consequence for the coagulation results?",
    options: ["Falsely prolonged clotting times due to EDTA contamination", "No effect on results", "Falsely shortened clotting times", "Hemolysis only, coagulation results unaffected"],
    correctIndex: 0,
  },
  {
    type: "case_study",
    prompt: "A hemolyzed serum sample is received for a potassium test. What effect does hemolysis typically have on the reported potassium level?",
    options: ["Falsely elevated, since potassium leaks out of ruptured red cells", "Falsely decreased", "No effect on potassium specifically", "Result becomes unmeasurable"],
    correctIndex: 0,
  },
  {
    type: "case_study",
    prompt: "A Gram stain of a sputum sample shows gram-positive cocci in chains. Which organism group does this description best fit?",
    options: ["Streptococcus species", "Staphylococcus species", "Neisseria species", "Escherichia coli"],
    correctIndex: 0,
  },
  {
    type: "case_study",
    prompt: "A CBC shows a markedly elevated white cell count with a predominance of immature granulocytes ('left shift'). This pattern is most classically associated with which of the following?",
    options: ["An acute bacterial infection", "A viral infection", "Iron deficiency anemia", "A normal healthy adult"],
    correctIndex: 0,
  },
  {
    type: "case_study",
    prompt: "A patient's blood sample shows rouleaux formation (red cells stacking like coins) on the peripheral smear. This finding is often associated with which of the following?",
    options: ["Elevated plasma protein levels (e.g. multiple myeloma)", "Iron deficiency", "A normal finding with no clinical significance", "Acute blood loss"],
    correctIndex: 0,
  },
  {
    type: "case_study",
    prompt: "A patient's stool sample is requested for ova and parasite examination. Which of the following best describes the purpose of this test?",
    options: ["To detect parasitic worms or their eggs in the digestive tract", "To measure blood glucose levels", "To assess kidney function", "To test for a bacterial throat infection"],
    correctIndex: 0,
  },
  {
    type: "case_study",
    prompt: "A blood sample is collected and, due to a delay in processing, is left standing uncentrifuged at room temperature for several hours before glucose testing. What is the most likely effect on the glucose result?",
    options: ["Falsely decreased, since red and white cells continue to consume glucose", "Falsely increased", "No effect at all", "The sample becomes impossible to test"],
    correctIndex: 0,
  },
  {
    type: "case_study",
    prompt: "A urinalysis dipstick shows a strongly positive result for nitrites. This finding is most suggestive of which of the following?",
    options: ["A bacterial urinary tract infection", "Diabetes", "Kidney stones", "Dehydration only"],
    correctIndex: 0,
  },
  {
    type: "case_study",
    prompt: "A patient's coagulation panel shows a prolonged bleeding time but a normal platelet count. Which of the following is a more likely explanation than a low platelet count?",
    options: ["A platelet function disorder rather than a platelet number problem", "Anemia", "A bacterial infection", "Elevated white cell count"],
    correctIndex: 0,
  },
  {
    type: "case_study",
    prompt: "A patient's ESR (erythrocyte sedimentation rate) comes back markedly elevated. This finding is generally most consistent with which of the following?",
    options: ["Ongoing inflammation or infection somewhere in the body", "A perfectly healthy result", "Dehydration", "A clotting factor deficiency"],
    correctIndex: 0,
  },
  {
    type: "case_study",
    prompt: "A blood culture bottle is inoculated and flagged as 'positive' by the automated system after overnight incubation. What is the appropriate next laboratory step?",
    options: ["Perform a Gram stain and subculture to identify the organism", "Report the result immediately without further testing", "Discard the bottle, since a positive flag is often an error", "Repeat the same blood culture from the same bottle only"],
    correctIndex: 0,
  },
  {
    type: "case_study",
    prompt: "A liver function panel shows markedly elevated ALT and AST, with a normal bilirubin. This pattern is most consistent with which of the following?",
    options: ["Hepatocellular (liver cell) damage", "A bile duct obstruction as the primary cause", "A kidney function problem", "A clotting disorder"],
    correctIndex: 0,
  },
  {
    type: "case_study",
    prompt: "A patient's blood group is being determined, and their red cells agglutinate with both anti-A and anti-B reagents. What blood group does this indicate?",
    options: ["AB", "O", "A", "B"],
    correctIndex: 0,
  },
  {
    type: "case_study",
    prompt: "A histology lab receives a tissue biopsy for diagnosis. Before sectioning and staining, the tissue must first be fixed. What is the main purpose of fixation?",
    options: ["To preserve tissue structure and prevent decomposition", "To stain the tissue for viewing", "To dissolve unwanted fat from the sample", "To sterilize the tissue for storage"],
    correctIndex: 0,
  },
  {
    type: "case_study",
    prompt: "A Pap smear result is reported as showing 'atypical squamous cells.' What does this result generally indicate?",
    options: ["Cell changes that need further evaluation, not necessarily cancer", "A confirmed diagnosis of cervical cancer", "A completely normal result", "A bacterial infection only"],
    correctIndex: 0,
  },
  {
    type: "case_study",
    prompt: "A newborn is tested for bilirubin due to visible jaundice. Why is monitoring bilirubin especially important in newborns?",
    options: ["Very high levels can be toxic to the developing brain", "It has no real clinical significance in newborns", "It only matters for adults with liver disease", "It's tested purely for research purposes"],
    correctIndex: 0,
  },
  {
    type: "case_study",
    prompt: "A patient on long-term anticoagulant therapy (e.g. warfarin) has their PT/INR checked regularly. Why is this monitoring necessary?",
    options: ["To ensure the dose keeps clotting time in a safe therapeutic range", "Because the test has no real clinical use", "To measure red blood cell count instead", "Because anticoagulants affect glucose levels"],
    correctIndex: 0,
  },
  {
    type: "case_study",
    prompt: "A stool sample for occult blood testing comes back positive. What does this result most directly suggest?",
    options: ["The possible presence of hidden (non-visible) bleeding in the digestive tract", "A confirmed parasitic infection", "Normal healthy digestion", "A kidney function problem"],
    correctIndex: 0,
  },
];

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function Quiz() {
  const [name, setName] = useState("");
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
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
        setQuestions(shuffle(QUESTION_POOL).slice(0, QUESTIONS_PER_ATTEMPT));
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
    if (step < questions.length - 1) {
      setStep((s) => s + 1);
    } else {
      finishQuiz();
    }
  }

  async function finishQuiz() {
    const score = questions.reduce(
      (acc, q, i) => acc + (answers[i] === q.correctIndex ? 1 : 0),
      0
    );
    const total = questions.length;
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

  const currentQuestion = questions[step];
  const currentAnswer = answers[step];

  return (
    <section id="quiz" className="border-t border-ink/10 py-20 dark:border-dark-border md:py-28">
      <div className="mx-auto max-w-2xl px-5 md:px-8">
        <span className="label-tag text-lab-700 dark:text-lab-500">This week's quiz</span>
        <h2 className="mt-3 font-display text-3xl font-semibold text-lab-900 md:text-4xl dark:text-dark-ink">
          Lab Science Quiz
        </h2>
        <p className="mt-3 max-w-xl text-ink-soft dark:text-dark-ink-soft">
          {QUESTIONS_PER_ATTEMPT} questions, drawn at random from a much larger pool — identification
          and case-based reasoning. One attempt per person per week.
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

        {started && !submitted && currentQuestion && (
          <div className="mt-8">
            <p className="label-tag text-lab-700 dark:text-lab-500">
              Question {step + 1} of {questions.length}
            </p>

            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-lab-100 dark:bg-dark-surface">
              <motion.div
                className="h-full bg-coral-500"
                animate={{ width: `${((step + 1) / questions.length) * 100}%` }}
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
              {step < questions.length - 1 ? "Next question" : "Finish quiz"}
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