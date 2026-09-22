import { useState, useEffect } from "react";
import { subscribeToPush, isPushSupported, isAlreadySubscribed } from "../utils/pushNotifications";

export default function NotifyOptIn({ playerName }) {
  const [status, setStatus] = useState("checking");
  const [error, setError] = useState("");

  useEffect(() => {
    isAlreadySubscribed().then((subscribed) => {
      setStatus(subscribed ? "subscribed" : "idle");
    });
  }, []);

 

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
        You're set — we'll notify you about updates, leaderboard changes, and more.
      </p>
    );
  }

  if (status === "unsupported") {
    return null;
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={handleEnable}
        disabled={status === "subscribing"}
        className="rounded-sm border border-lab-700 px-3 py-1.5 text-xs font-semibold text-lab-700 disabled:opacity-50 dark:border-lab-500 dark:text-lab-500"
      >
        {status === "subscribing" ? "Enabling…" : "Turn on notifications"}
      </button>
      {status === "error" && (
        <p className="mt-1 text-xs text-coral-600">{error}</p>
      )}
    </div>
  );
}
if (status === "checking") return null;