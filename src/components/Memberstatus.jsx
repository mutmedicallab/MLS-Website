import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { API_BASE_URL } from "../config/api";

export default function MemberStatus() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  async function handleCheck(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setChecking(true);
    setError("");
    setStatus(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/members/status?email=${encodeURIComponent(email.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        setStatus(data);
      }
    } catch (err) {
      setError("Could not check status right now — try again shortly.");
    } finally {
      setChecking(false);
    }
  }

  return (
    <section id="member-status" className="border-t border-ink/10 py-20 dark:border-dark-border md:py-28">
      <div className="mx-auto max-w-md px-5 md:px-8">
        <span className="label-tag text-lab-700 dark:text-lab-500">Membership</span>
        <h2 className="mt-3 font-display text-3xl font-semibold text-lab-900 dark:text-dark-ink">
          Check your status
        </h2>
        <p className="mt-3 text-ink-soft dark:text-dark-ink-soft">
          Enter the email you registered with to see your registration and semester payment status.
        </p>

        <form onSubmit={handleCheck} className="mt-6 flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@example.com"
            required
            className="flex-1 rounded-sm border border-ink/15 bg-transparent px-3 py-2 text-sm dark:border-dark-border dark:text-dark-ink"
          />
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={checking}
            className="rounded-sm bg-coral-500 px-4 py-2 text-sm font-semibold text-paper disabled:opacity-50"
          >
            {checking ? "Checking…" : "Check"}
          </motion.button>
        </form>

        {error && <p className="mt-3 text-sm text-coral-600">{error}</p>}

        <AnimatePresence>
          {status && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 rounded-sm border border-ink/10 bg-lab-50/50 p-5 dark:border-dark-border dark:bg-dark-surface/40"
            >
              <p className="font-semibold text-lab-900 dark:text-dark-ink">{status.fullName}</p>
              <p className="mt-1 text-xs text-ink-soft dark:text-dark-ink-soft">
                {status.semester} · {status.academicYear}
              </p>
              <div className="mt-3 space-y-1.5 text-sm">
                <p className={status.registrationPaid ? "text-lab-700 dark:text-lab-500" : "text-coral-600"}>
                  Registration: {status.registrationPaid ? "Paid ✓" : "Unpaid"}
                </p>
                <p className={status.semesterPaid ? "text-lab-700 dark:text-lab-500" : "text-coral-600"}>
                  This semester: {status.semesterPaid ? "Paid ✓" : "Unpaid"}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}