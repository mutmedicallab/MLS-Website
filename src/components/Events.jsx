import { useState, useEffect } from "react";
import { motion } from "motion/react";
import AmbientField from "./AmbientField";
import { API_BASE_URL } from "../config/api";



const EVENTS = [
  { id: "welcome-recruitment-2026-09-01", date: "01 Sep 2026", tag: "Freshers", title: "Welcome & Recruitment Drive", desc: "Meet the board, learn what MUTMLSA does, and sign up on the spot — first-years welcome." },
  { id: "meet-the-tribe-2026-09-07", date: "07 Sep 2026", tag: "Meet the Tribe", title: "Together from the very first step", desc: "Welcome to day one—come meet your fellow classmates, find your community, and start this exciting journey together." },
  { id: "kemelsa-blood-drive-2026-09-21", date: "TBA", tag: "KeMelSa Blood Drive", title: "Saving Lives", desc: "Every drop counts, every donor matters." },
  { id: "team-building-hike-2026-10-10", date: "10 Oct 2026", tag: "Team-Building Hike", title: "Details to be announced", desc: "Climbing higher, connecting closer." },
  { id: "interclub-game-night-2026-10-17", date: "17 Oct 2026", tag: "InterClub Game night", title: "Interdisciplinary Fun", desc: "Get ready for a night of fun and delights!" },
];

export default function Events() {
  const [counts, setCounts] = useState({});
  const [name, setName] = useState(() => localStorage.getItem("mutmlsa_rsvp_name") || "");
  const [rsvpedEvents, setRsvpedEvents] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("mutmlsa_rsvped_events") || "[]");
    } catch {
      return [];
    }
  });
  const [busyEventId, setBusyEventId] = useState(null);
  const [notRegisteredNudge, setNotRegisteredNudge] = useState(false);

  useEffect(() => {
    loadCounts();
  }, []);

  function loadCounts() {
    fetch(`${API_BASE_URL}/api/events/counts`)
      .then((res) => res.json())
      .then((data) => setCounts(data.counts || {}));
  }

  function saveRsvpedEvents(next) {
    setRsvpedEvents(next);
    localStorage.setItem("mutmlsa_rsvped_events", JSON.stringify(next));
  }

  

async function toggleRsvp(eventId) {
  if (!name.trim()) {
    alert("Enter your name first so we know who's coming.");
    return;
  }
  localStorage.setItem("mutmlsa_rsvp_name", name.trim());
  setBusyEventId(eventId);

  const isGoing = rsvpedEvents.includes(eventId);
  try {
    if (isGoing) {
      await fetch(`${API_BASE_URL}/api/events/${eventId}/rsvp`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      saveRsvpedEvents(rsvpedEvents.filter((id) => id !== eventId));
    } else {
      const res = await fetch(`${API_BASE_URL}/api/events/${eventId}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      saveRsvpedEvents([...rsvpedEvents, eventId]);
      if (!data.recognized) setNotRegisteredNudge(true);
    }
    loadCounts();
  } finally {
    setBusyEventId(null);
  }
}

  return (
    <section id="calendar" className="relative overflow-hidden border-t border-ink/10 bg-lab-900 py-20 text-paper md:py-28">
      <AmbientField redCells={3} whiteCells={1} />

      <div className="relative mx-auto max-w-6xl px-5 md:px-8">
        <span className="label-tag text-lab-500"> Schedule</span>
        <h2 className="mt-3 font-display text-3xl font-semibold md:text-4xl">
          Upcoming on the calendar
        </h2>

        <div className="mt-4 max-w-xs">
  <input
    type="text"
    value={name}
    onChange={(e) => setName(e.target.value)}
    placeholder="Your name (for RSVPs)"
    className="w-full rounded-sm border border-paper/15 bg-transparent px-3 py-2 text-sm text-paper placeholder:text-paper/40"
  />
</div>

{notRegisteredNudge && (
  <div className="mt-3 flex items-center gap-2 rounded-sm border border-coral-500/40 bg-coral-500/10 px-4 py-2.5 text-sm text-paper/90">
    <span>Looks like you're not registered with us yet.</span>
    <a href="#join" className="font-semibold text-coral-500 underline">
      Join MUTMLSA →
    </a>
  </div>
)}

<div className="mt-8 divide-y divide-paper/10 border-y border-paper/10">
          {EVENTS.map((e) => {
            const isGoing = rsvpedEvents.includes(e.id);
            const count = counts[e.id] || 0;
            return (
              <div key={e.id} className="grid gap-3 py-6 sm:grid-cols-[110px_100px_1fr_auto] sm:items-center sm:gap-6">
                <span className="font-mono text-sm text-lab-500">{e.date}</span>
                <span className="label-tag w-fit rounded-sm bg-paper/10 px-2 py-1 text-coral-500">{e.tag}</span>
                <div>
                  <h3 className="font-display text-lg font-semibold text-paper">{e.title}</h3>
                  <p className="mt-1 text-sm text-paper/60">{e.desc}</p>
                  <p className="mt-1 text-xs text-lab-500">
                    {count} {count === 1 ? "person" : "people"} going
                  </p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => toggleRsvp(e.id)}
                  disabled={busyEventId === e.id}
                  className={`rounded-sm px-3 py-1.5 text-xs font-semibold disabled:opacity-50 ${
                    isGoing
                      ? "bg-lab-600 text-paper"
                      : "border border-coral-500 text-coral-500"
                  }`}
                >
                  {busyEventId === e.id ? "…" : isGoing ? "Going ✓" : "I'm going"}
                </motion.button>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex items-center gap-3 rounded-sm border border-paper/10 bg-paper/5 px-5 py-4">
          <span className="label-tag rounded-sm bg-paper/10 px-2 py-1 text-lab-500">Weekly</span>
          <p className="text-sm text-paper/70">
            General meetings every <span className="text-paper">Thursday, 5:00 PM</span> —BLOOD TRANSFUSION LAB, Science <Complex></Complex>
          </p>
        </div>
      </div>
    </section>
  );
}