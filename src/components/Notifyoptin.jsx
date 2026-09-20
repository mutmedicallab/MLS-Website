import { useState } from "react";
import { subscribeToPush, isPushSupported } from "../utils/pushNotifications";

// A small opt-in prompt — drop this into the Get Involved tab, near the
// games. Keeps things simple: one button, no persistent nagging if
// they've already subscribed or dismissed it once this session.
export default function NotifyOptIn({ playerName }) {
  const [status, setStatus] = useState("idle"); // idle | subscribing | subscribed | error | unsupported
  const [error, setError] = useState("");

  async function handleEnable() {
    setStatus("subscribing");
    setError("");
    try {
      if (!(await isPushSupported())) {
        setStatus("unsupported");
        return;
      }
      await subscribeToPush(playerName || "");
      setStatus("subscribed");
    } catch (err) {
      setError(err.message || "Could not enable notifications.");
      setStatus("error");
    }
  }

  if (status === "subscribed") {
    return (
      <p className="mt-3 text-sm text-lab-700 dark:text-lab-500">
        You're set — we'll notify you about new games and leaderboard changes.
      </p>
    );
  }

  if (status === "unsupported") {
    return null; // silently skip on browsers/devices that don't support push
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={handleEnable}
        disabled={status === "subscribing"}
        className="rounded-sm border border-lab-700 px-3 py-1.5 text-xs font-semibold text-lab-700 disabled:opacity-50 dark:border-lab-500 dark:text-lab-500"
      >
        {status === "subscribing" ? "Enabling…" : "Notify me about new games"}
      </button>
      {status === "error" && (
        <p className="mt-1 text-xs text-coral-600">{error}</p>
      )}
    </div>
  );
}