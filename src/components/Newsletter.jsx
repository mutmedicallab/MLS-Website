import { useState } from "react";
import { API_BASE_URL } from "../config/api";
import AmbientField from "./AmbientField";

export default function Newsletter() {
  const [form, setForm] = useState({ fullName: "", email: "" });
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setStatus("success");
      setForm({ fullName: "", email: "" });
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    }
  }

  return (
    <section id="newsletter" className="relative overflow-hidden border-t border-ink/10 py-20 dark:border-dark-border md:py-28">
      <AmbientField redCells={2} whiteCells={1} />

      <div className="relative mx-auto max-w-6xl px-5 md:px-8">
        <div className="mx-auto max-w-xl text-center">
          <span className="label-tag text-lab-700 dark:text-lab-500">Stay in the loop</span>
          <h2 className="mt-3 font-display text-3xl font-semibold text-lab-900 md:text-4xl dark:text-dark-ink">
            Get MUTMLSA updates
          </h2>
          <p className="mt-3 text-ink-soft dark:text-dark-ink-soft">
            Event announcements, opportunities, and association news — straight
            to your inbox.
          </p>

          {status === "success" ? (
            <div className="mt-8 rounded-sm border border-lab-500/40 bg-lab-50/60 p-6 dark:border-dark-border dark:bg-dark-surface/40">
              <p className="label-tag text-lab-700 dark:text-lab-500">You're subscribed</p>
              <p className="mt-2 text-sm text-ink-soft dark:text-dark-ink-soft">
                Thanks — we'll keep you posted.
              </p>
              <button
                type="button"
                onClick={() => setStatus("idle")}
                className="label-tag mt-4 text-lab-700 underline underline-offset-4 dark:text-lab-500"
              >
                Subscribe another email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Your name"
                className="rounded-sm border border-ink/15 bg-transparent px-3 py-2.5 text-sm dark:border-dark-border dark:text-dark-ink"
              />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Your email"
                required
                className="rounded-sm border border-ink/15 bg-transparent px-3 py-2.5 text-sm dark:border-dark-border dark:text-dark-ink"
              />
              <button
                type="submit"
                disabled={status === "submitting"}
                className="rounded-sm bg-coral-500 px-5 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-coral-600 disabled:opacity-60"
              >
                {status === "submitting" ? "…" : "Subscribe"}
              </button>
            </form>
          )}

          {status === "error" && (
            <p className="mt-3 text-sm text-coral-600">{errorMsg}</p>
          )}
        </div>
      </div>
    </section>
  );
}