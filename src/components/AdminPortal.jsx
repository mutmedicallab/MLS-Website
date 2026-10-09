import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { API_BASE_URL } from "../config/api";
import { exportToCSV, exportToExcel, exportToPDF } from "../utils/exportData";
import { isValidRegNumber } from "../utils/regNumber";

const CURRENT_PERIOD = { academicYear: "2026/2027", semester: "Sem 1" };
const YEAR_ORDER = ["Y1", "Y2", "Y3", "Y4"];

const TABS = [
  { key: "applications", label: "Applications" },
  { key: "members", label: "Members" },
  { key: "subscribers", label: "Subscribers" },
  { key: "events", label: "Events" },
  { key: "notify", label: "Notify" },
];

function toWhatsAppNumber(phone) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) return "254" + digits.slice(1);
  if (digits.startsWith("254")) return digits;
  return digits;
}

function CountUp({ value }) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    const from = prevRef.current;
    const to = value;
    if (from === to) return;

    const duration = 500;
    const start = performance.now();

    let frame;
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
      else prevRef.current = to;
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <>{display}</>;
}

function SkeletonBlock() {
  return (
    <div className="space-y-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.15 }}
          className="h-12 rounded-sm bg-lab-100 dark:bg-dark-surface/60"
        />
      ))}
    </div>
  );
}

function Tile({ children, flash, className = "", ...props }) {
  return (
    <motion.div style={{ perspective: 700 }} className={className}>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{
          opacity: 1,
          y: 0,
          backgroundColor: flash ? "rgba(34,197,94,0.15)" : "rgba(0,0,0,0)",
        }}
        whileHover={{ rotateX: 4, rotateY: -4, scale: 1.015, y: -2 }}
        whileTap={{ scale: 0.98, rotateX: 0, rotateY: 0 }}
        transition={{
          opacity: { duration: 0.2 },
          y: { duration: 0.2 },
          rotateX: { type: "spring", stiffness: 250, damping: 18 },
          rotateY: { type: "spring", stiffness: 250, damping: 18 },
          backgroundColor: { duration: 0.6 },
        }}
        style={{ transformStyle: "preserve-3d" }}
        className="rounded-sm border border-ink/10 bg-paper p-3 shadow-sm transition-shadow hover:shadow-lg dark:border-dark-border dark:bg-dark-bg"
        {...props}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function ExportButtons({ onCSV, onExcel, onPDF }) {
  const cls = "label-tag rounded-sm border border-ink/15 px-3 py-1.5 dark:border-dark-border";
  return (
    <div className="mt-3 flex gap-2">
      <button type="button" onClick={onCSV} className={cls}>Export CSV</button>
      <button type="button" onClick={onExcel} className={cls}>Export Excel</button>
      <button type="button" onClick={onPDF} className={cls}>Export PDF</button>
    </div>
  );
}

const sectionVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function AdminPortal() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState("");

  const [applications, setApplications] = useState([]);
  const [members, setMembers] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [confirmingId, setConfirmingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [subscriberSearch, setSubscriberSearch] = useState("");
  const [flashId, setFlashId] = useState(null);

  const [events, setEvents] = useState([]);
  const [eventForm, setEventForm] = useState({ dateLabel: "", tag: "", title: "", description: "", sortOrder: 0 });
  const [editingEventId, setEditingEventId] = useState(null);
  const [selectedEventForRsvps, setSelectedEventForRsvps] = useState(null);
  const [eventRsvps, setEventRsvps] = useState([]);
  const [loadingRsvps, setLoadingRsvps] = useState(false);

  const [notifyTitle, setNotifyTitle] = useState("");
  const [notifyBody, setNotifyBody] = useState("");
  const [notifyImage, setNotifyImage] = useState("");
  const [notifySending, setNotifySending] = useState(false);
  const [notifyResult, setNotifyResult] = useState("");

  const [activeAdminTab, setActiveAdminTab] = useState("applications");

  async function authedFetch(path, options = {}) {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...options.headers,
        "x-admin-password": password,
        "Content-Type": "application/json",
      },
    });
   if (res.status === 401) throw new Error("Wrong admin password.");
if (res.status === 429) throw new Error("Too many requests — wait a few minutes and try again.");
if (!res.ok) throw new Error("Something went wrong loading data.");
return res;
  }

  async function loadData(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const [appsRes, membersRes, subsRes, eventsRes] = await Promise.all([
        authedFetch("/api/admin/members/pending-applications"),
        authedFetch(
          `/api/admin/members?academicYear=${encodeURIComponent(CURRENT_PERIOD.academicYear)}&semester=${encodeURIComponent(CURRENT_PERIOD.semester)}`
        ),
        authedFetch("/api/newsletter"),
        authedFetch("/api/events"),
      ]);
      const appsData = await appsRes.json();
      const membersData = await membersRes.json();
      const subsData = await subsRes.json();
      const eventsData = await eventsRes.json();
      setApplications(appsData.applications || []);
      setMembers(membersData.members || []);
      setSubscribers(subsData.subscribers || []);
      setEvents(eventsData.events || []);
      setAuthed(true);
    } catch (err) {
      setError(err.message || "Failed to load data.");
      setAuthed(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function confirmApplication(app) {
    if (confirmingId) return;
    setConfirmingId(app.id);
    try {
      await authedFetch("/api/admin/members", {
        method: "POST",
        body: JSON.stringify({
  fullName: app.full_name,
  email: app.email,
  phone: app.phone,
  yearOfStudy: app.year_of_study,
  registrationNumber: app.registration_number,
  applicationId: app.id,
}),
      });
      await loadData(true);
    } finally {
      setConfirmingId(null);
    }
  }

  function flash(id) {
    setFlashId(id);
    setTimeout(() => setFlashId(null), 800);
  }

  async function saveEvent(e) {
    e.preventDefault();
    const path = editingEventId ? `/api/events/${editingEventId}` : "/api/events";
    await authedFetch(path, {
      method: editingEventId ? "PATCH" : "POST",
      body: JSON.stringify({
        ...eventForm,
        sortOrder: Number(eventForm.sortOrder) || 0,
      }),
    });
    setEventForm({ dateLabel: "", tag: "", title: "", description: "", sortOrder: 0 });
    setEditingEventId(null);
    loadData(true);
  }

  function editEvent(ev) {
    setEditingEventId(ev.id);
    setEventForm({
      dateLabel: ev.date_label,
      tag: ev.tag || "",
      title: ev.title,
      description: ev.description || "",
      sortOrder: ev.sort_order,
    });
  }

  function cancelEditEvent() {
    setEditingEventId(null);
    setEventForm({ dateLabel: "", tag: "", title: "", description: "", sortOrder: 0 });
  }

  async function deleteEventRow(id) {
    if (!confirm("Delete this event?")) return;
    await authedFetch(`/api/events/${id}`, { method: "DELETE" });
    if (selectedEventForRsvps === id) {
      setSelectedEventForRsvps(null);
      setEventRsvps([]);
    }
    loadData(true);
  }

  async function loadEventRsvps(eventId) {
    setSelectedEventForRsvps(eventId);
    setLoadingRsvps(true);
    try {
      const res = await authedFetch(`/api/events/${eventId}/rsvps`);
      const data = await res.json();
      setEventRsvps(data.rsvps || []);
    } finally {
      setLoadingRsvps(false);
    }
  }

  async function togglePayment(member) {
    await authedFetch(`/api/admin/members/${member.id}/payment`, {
      method: "PATCH",
      body: JSON.stringify({ ...CURRENT_PERIOD, paid: !member.paidThisPeriod }),
    });
    flash(member.id);
    loadData(true);
  }

  async function toggleRegistration(member) {
    await authedFetch(`/api/admin/members/${member.id}/registration`, {
      method: "PATCH",
      body: JSON.stringify({ paid: !member.registration_paid }),
    });
    flash(member.id);
    loadData(true);
  }

  async function saveRegNumber(memberId, value) {
  const res = await authedFetch(`/api/admin/members/${memberId}/registration-number`, {
    method: "PATCH",
    body: JSON.stringify({ registrationNumber: value }),
  });
  const data = await res.json();
  if (!res.ok) {
    alert(data.error || "Could not save.");
    return;
  }
  flash(memberId);
  loadData(true);
}

  async function sendNotification(e) {
    e.preventDefault();
    if (!notifyTitle.trim() || !notifyBody.trim()) return;
    setNotifySending(true);
    setNotifyResult("");
    try {
      const res = await authedFetch("/api/notify/send", {
        method: "POST",
        body: JSON.stringify({
          title: notifyTitle.trim(),
          body: notifyBody.trim(),
          image: notifyImage.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setNotifyResult("Sent!");
        setNotifyTitle("");
        setNotifyBody("");
        setNotifyImage("");
      } else {
        setNotifyResult(data.error || "Failed to send.");
      }
    } catch (err) {
      setNotifyResult(err.message || "Failed to send.");
    } finally {
      setNotifySending(false);
    }
  }

  if (!authed) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-5"
      >
        <h1 className="font-display text-2xl font-semibold text-lab-900 dark:text-dark-ink">
          Admin Portal
        </h1>
        <p className="mt-2 text-sm text-ink-soft dark:text-dark-ink-soft">
          Enter the admin password to continue.
        </p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-4 rounded-sm border border-ink/15 bg-transparent px-3 py-2 text-sm dark:border-dark-border dark:text-dark-ink"
          placeholder="Admin password"
        />
        <motion.button
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={() => loadData(false)}
          disabled={loading}
          className="mt-3 rounded-sm bg-lab-800 px-4 py-2 text-sm font-semibold text-paper disabled:opacity-50"
        >
          {loading ? "Checking…" : "Enter"}
        </motion.button>
        {error && <p className="mt-3 text-sm text-coral-600">{error}</p>}
      </motion.div>
    );
  }

  const filteredMembers = members.filter((m) =>
    m.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const groupedMembers = YEAR_ORDER.reduce((acc, year) => {
    acc[year] = filteredMembers.filter((m) => m.year_of_study === year);
    return acc;
  }, {});
  const otherMembers = filteredMembers.filter((m) => !YEAR_ORDER.includes(m.year_of_study));

  const sortedSubscribers = [...subscribers].sort((a, b) =>
    (a.full_name || a.email).localeCompare(b.full_name || b.email)
  );
  const filteredSubscribers = sortedSubscribers.filter((s) => {
    const term = subscriberSearch.toLowerCase();
    return (
      (s.full_name || "").toLowerCase().includes(term) ||
      s.email.toLowerCase().includes(term)
    );
  });

  const applicationRows = applications.map((a) => ({
    Name: a.full_name,
    Email: a.email,
    Year: a.year_of_study || "",
    Phone: a.phone || "",
    "Registration No.": a.registration_number || "",
  }));

  const memberRows = filteredMembers.map((m) => ({
    Name: m.full_name,
    Year: m.year_of_study || "",
    Phone: m.phone || "",
    "Registration Paid": m.registration_paid ? "Yes" : "No",
    "Semester Paid": m.paidThisPeriod ? "Yes" : "No",
  }));

  const subscriberRows = filteredSubscribers.map((s) => ({
    Name: s.full_name || "",
    Email: s.email,
  }));

  const sections = {
    applications: (
      <div>
        <h2 className="font-display text-lg font-semibold text-lab-900 dark:text-dark-ink">
          Pending Applications (<CountUp value={applications.length} />)
        </h2>

        <ExportButtons
          onCSV={() => exportToCSV("mutmlsa-applications", applicationRows)}
          onExcel={() => exportToExcel("mutmlsa-applications", applicationRows)}
          onPDF={() => exportToPDF("mutmlsa-applications", "Pending Applications", applicationRows)}
        />

        <div className="mt-3 space-y-2">
          {refreshing ? (
            <SkeletonBlock />
          ) : (
            <>
              {applications.length === 0 && (
                <p className="text-sm text-ink-soft dark:text-dark-ink-soft">No pending applications.</p>
              )}
              <AnimatePresence>
                {applications.map((app) => (
                  <Tile key={app.id}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-lab-900 dark:text-dark-ink">{app.full_name}</p>
                        <p className="text-xs text-ink-soft dark:text-dark-ink-soft">
                          {app.email} · {app.year_of_study || "Year unknown"}
                          {app.phone && (
                            <>
                              {" · "}
                              <a
                                href={`https://wa.me/${toWhatsAppNumber(app.phone)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-lab-700 underline dark:text-lab-500"
                              >
                                {app.phone}
                              </a>
                            </>
                          )}
                          
                        </p>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => confirmApplication(app)}
                        disabled={confirmingId === app.id}
                        className="rounded-sm bg-lab-800 px-3 py-1.5 text-xs font-semibold text-paper disabled:opacity-50"
                      >
                        {confirmingId === app.id ? "Confirming…" : "Confirm as member"}
                      </motion.button>
                    </div>
                  </Tile>
                ))}
              </AnimatePresence>
            </>
          )}
        </div>
      </div>
    ),

    members: (
      <div>
        <h2 className="font-display text-lg font-semibold text-lab-900 dark:text-dark-ink">
          Members (<CountUp value={members.length} />)
        </h2>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name…"
          className="mt-3 w-full max-w-xs rounded-sm border border-ink/15 bg-transparent px-3 py-2 text-sm dark:border-dark-border dark:text-dark-ink"
        />

        <ExportButtons
          onCSV={() => exportToCSV("mutmlsa-members", memberRows)}
          onExcel={() => exportToExcel("mutmlsa-members", memberRows)}
          onPDF={() => exportToPDF("mutmlsa-members", "MUTMLSA Members", memberRows)}
        />

        <div className="mt-3 space-y-6">
          {refreshing ? (
            <SkeletonBlock />
          ) : (
            <>
              {filteredMembers.length === 0 && (
                <p className="text-sm text-ink-soft dark:text-dark-ink-soft">No members match that search.</p>
              )}
              {YEAR_ORDER.map((year) =>
                groupedMembers[year].length > 0 ? (
                  <MemberYearGroup
                    key={year}
                    label={year}
                    members={groupedMembers[year]}
                    flashId={flashId}
                    onToggleRegistration={toggleRegistration}
                    onTogglePayment={togglePayment}
                    onSaveRegNumber={saveRegNumber}
                  />
                ) : null
              )}
              {otherMembers.length > 0 && (
                <MemberYearGroup
                  label="Other / Unspecified"
                  members={otherMembers}
                  flashId={flashId}
                  onToggleRegistration={toggleRegistration}
                  onTogglePayment={togglePayment}
                  onSaveRegNumber={saveRegNumber}
                />
              )}
            </>
          )}
        </div>
      </div>
    ),

    subscribers: (
      <div>
        <h2 className="font-display text-lg font-semibold text-lab-900 dark:text-dark-ink">
          Newsletter Subscribers (<CountUp value={subscribers.length} />)
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={() => {
              const emails = subscribers.map((s) => s.email).join(", ");
              navigator.clipboard.writeText(emails);
              alert("All subscriber emails copied — paste into Gmail's BCC field.");
            }}
            className="rounded-sm bg-lab-800 px-4 py-2 text-sm font-semibold text-paper dark:bg-lab-600"
          >
            Copy all emails
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={async () => {
              const res = await authedFetch("/api/newsletter/backfill", { method: "POST" });
              const data = await res.json();
              alert(`Added ${data.added ?? 0} new subscribers from your members list.`);
              loadData(true);
            }}
            className="rounded-sm border border-lab-700 px-4 py-2 text-sm font-semibold text-lab-700 dark:border-lab-500 dark:text-lab-500"
          >
            Add all members to list
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={async () => {
              const res = await authedFetch("/api/newsletter/backfill-applications", { method: "POST" });
              const data = await res.json();
              alert(`Added ${data.added ?? 0} new subscribers from applications (including unconfirmed).`);
              loadData(true);
            }}
            className="rounded-sm border border-lab-700 px-4 py-2 text-sm font-semibold text-lab-700 dark:border-lab-500 dark:text-lab-500"
          >
            Add all applicants to list
          </motion.button>
        </div>

        <ExportButtons
          onCSV={() => exportToCSV("mutmlsa-subscribers", subscriberRows)}
          onExcel={() => exportToExcel("mutmlsa-subscribers", subscriberRows)}
          onPDF={() => exportToPDF("mutmlsa-subscribers", "Newsletter Subscribers", subscriberRows)}
        />

        <input
          type="text"
          value={subscriberSearch}
          onChange={(e) => setSubscriberSearch(e.target.value)}
          placeholder="Search subscribers by name or email…"
          className="mt-4 w-full max-w-xs rounded-sm border border-ink/15 bg-transparent px-3 py-2 text-sm dark:border-dark-border dark:text-dark-ink"
        />

        <div className="mt-3 space-y-1.5">
          {refreshing ? (
            <SkeletonBlock />
          ) : filteredSubscribers.length === 0 ? (
            <p className="text-sm text-ink-soft dark:text-dark-ink-soft">
              {subscribers.length === 0 ? "No subscribers yet." : "No subscribers match that search."}
            </p>
          ) : (
            filteredSubscribers.map((s) => (
              <Tile key={s.id}>
                <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm font-medium text-lab-900 dark:text-dark-ink">
                    {s.full_name || "—"}
                  </span>
                  <span className="text-xs text-ink-soft dark:text-dark-ink-soft">{s.email}</span>
                </div>
              </Tile>
            ))
          )}
        </div>
      </div>
    ),

    events: (
      <div>
        <h2 className="font-display text-lg font-semibold text-lab-900 dark:text-dark-ink">
          Events (<CountUp value={events.length} />)
        </h2>

        <form onSubmit={saveEvent} className="mt-3 max-w-md space-y-2 rounded-sm border border-ink/10 p-3 dark:border-dark-border">
          <p className="label-tag text-ink-soft dark:text-dark-ink-soft">
            {editingEventId ? "Editing event" : "Add new event"}
          </p>
          <input
            type="text"
            value={eventForm.dateLabel}
            onChange={(e) => setEventForm({ ...eventForm, dateLabel: e.target.value })}
            placeholder="Date label (e.g. 01 Sep 2026)"
            required
            className="w-full rounded-sm border border-ink/15 bg-transparent px-3 py-2 text-sm dark:border-dark-border dark:text-dark-ink"
          />
          <input
            type="text"
            value={eventForm.tag}
            onChange={(e) => setEventForm({ ...eventForm, tag: e.target.value })}
            placeholder="Tag (e.g. Freshers)"
            className="w-full rounded-sm border border-ink/15 bg-transparent px-3 py-2 text-sm dark:border-dark-border dark:text-dark-ink"
          />
          <input
            type="text"
            value={eventForm.title}
            onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
            placeholder="Title"
            required
            className="w-full rounded-sm border border-ink/15 bg-transparent px-3 py-2 text-sm dark:border-dark-border dark:text-dark-ink"
          />
          <textarea
            value={eventForm.description}
            onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
            placeholder="Description"
            rows={2}
            className="w-full rounded-sm border border-ink/15 bg-transparent px-3 py-2 text-sm dark:border-dark-border dark:text-dark-ink"
          />
          <input
            type="number"
            value={eventForm.sortOrder}
            onChange={(e) => setEventForm({ ...eventForm, sortOrder: e.target.value })}
            placeholder="Sort order (lower shows first)"
            className="w-full rounded-sm border border-ink/15 bg-transparent px-3 py-2 text-sm dark:border-dark-border dark:text-dark-ink"
          />
          <div className="flex gap-2">
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="rounded-sm bg-coral-500 px-4 py-2 text-sm font-semibold text-paper"
            >
              {editingEventId ? "Save changes" : "Add event"}
            </motion.button>
            {editingEventId && (
              <button
                type="button"
                onClick={cancelEditEvent}
                className="label-tag text-ink-soft dark:text-dark-ink-soft"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="mt-4 space-y-2">
          {refreshing ? (
            <SkeletonBlock />
          ) : events.length === 0 ? (
            <p className="text-sm text-ink-soft dark:text-dark-ink-soft">No events yet.</p>
          ) : (
            events.map((ev) => (
              <Tile key={ev.id}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-lab-900 dark:text-dark-ink">{ev.title}</p>
                    <p className="text-xs text-ink-soft dark:text-dark-ink-soft">
                      {ev.date_label} {ev.tag && `· ${ev.tag}`}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => loadEventRsvps(ev.id)}
                      className="rounded-sm border border-lab-700 px-3 py-1.5 text-xs font-semibold text-lab-700 dark:border-lab-500 dark:text-lab-500"
                    >
                      View RSVPs
                    </button>
                    <button
                      type="button"
                      onClick={() => editEvent(ev)}
                      className="rounded-sm border border-ink/15 px-3 py-1.5 text-xs font-semibold text-ink-soft dark:border-dark-border dark:text-dark-ink-soft"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteEventRow(ev.id)}
                      className="rounded-sm border border-coral-500 px-3 py-1.5 text-xs font-semibold text-coral-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {selectedEventForRsvps === ev.id && (
                  <div className="mt-3 border-t border-ink/10 pt-3 dark:border-dark-border">
                    {loadingRsvps ? (
                      <SkeletonBlock />
                    ) : eventRsvps.length === 0 ? (
                      <p className="text-xs text-ink-soft dark:text-dark-ink-soft">No RSVPs yet.</p>
                    ) : (
                      <>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="label-tag text-lab-700 dark:text-lab-500">
                            {eventRsvps.length} {eventRsvps.length === 1 ? "person" : "people"} going
                          </p>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const emails = eventRsvps.filter((r) => r.email).map((r) => r.email).join(", ");
                                if (!emails) {
                                  alert("No emails collected for this event yet.");
                                  return;
                                }
                                navigator.clipboard.writeText(emails);
                                alert("Attendee emails copied — paste into Gmail's BCC field.");
                              }}
                              className="label-tag text-lab-700 underline dark:text-lab-500"
                            >
                              Copy emails
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                exportToCSV(
                                  `mutmlsa-rsvps-${ev.title}`,
                                  eventRsvps.map((r) => ({ Name: r.name, Email: r.email || "" }))
                                )
                              }
                              className="label-tag text-lab-700 underline dark:text-lab-500"
                            >
                              CSV
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                exportToExcel(
                                  `mutmlsa-rsvps-${ev.title}`,
                                  eventRsvps.map((r) => ({ Name: r.name, Email: r.email || "" }))
                                )
                              }
                              className="label-tag text-lab-700 underline dark:text-lab-500"
                            >
                              Excel
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                exportToPDF(
                                  `mutmlsa-rsvps-${ev.title}`,
                                  `RSVPs — ${ev.title}`,
                                  eventRsvps.map((r) => ({ Name: r.name, Email: r.email || "" }))
                                )
                              }
                              className="label-tag text-lab-700 underline dark:text-lab-500"
                            >
                              PDF
                            </button>
                          </div>
                        </div>
                        <div className="mt-2 space-y-1">
                          {eventRsvps.map((r, i) => (
                            <p key={i} className="text-xs text-ink-soft dark:text-dark-ink-soft">
                              {r.name}{r.email ? ` — ${r.email}` : ""}
                            </p>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </Tile>
            ))
          )}
        </div>
      </div>
    ),

    notify: (
      <div>
        <h2 className="font-display text-lg font-semibold text-lab-900 dark:text-dark-ink">
          Send Push Notification
        </h2>
        <p className="mt-1 text-sm text-ink-soft dark:text-dark-ink-soft">
          Goes out immediately to everyone who's turned on notifications — games,
          events, new photos, or any other update.
        </p>
        <form onSubmit={sendNotification} className="mt-3 max-w-sm space-y-2">
          <input
            type="text"
            value={notifyTitle}
            onChange={(e) => setNotifyTitle(e.target.value)}
            placeholder="Title (e.g. New photos are up!)"
            className="w-full rounded-sm border border-ink/15 bg-transparent px-3 py-2 text-sm dark:border-dark-border dark:text-dark-ink"
          />
          <textarea
            value={notifyBody}
            onChange={(e) => setNotifyBody(e.target.value)}
            placeholder="Message body"
            rows={3}
            className="w-full rounded-sm border border-ink/15 bg-transparent px-3 py-2 text-sm dark:border-dark-border dark:text-dark-ink"
          />
          <input
            type="text"
            value={notifyImage}
            onChange={(e) => setNotifyImage(e.target.value)}
            placeholder="Image URL (optional — preview photo)"
            className="w-full rounded-sm border border-ink/15 bg-transparent px-3 py-2 text-sm dark:border-dark-border dark:text-dark-ink"
          />
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={notifySending}
            className="rounded-sm bg-coral-500 px-4 py-2 text-sm font-semibold text-paper disabled:opacity-50"
          >
            {notifySending ? "Sending…" : "Send to all subscribers"}
          </motion.button>
          {notifyResult && (
            <p className="text-sm text-lab-700 dark:text-lab-500">{notifyResult}</p>
          )}
        </form>
      </div>
    ),
  };

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="font-display text-2xl font-semibold text-lab-900 dark:text-dark-ink">
            Admin Portal
          </h1>
          <p className="mt-1 text-sm text-ink-soft dark:text-dark-ink-soft">
            Tracking {CURRENT_PERIOD.semester} · {CURRENT_PERIOD.academicYear}
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95, rotate: 180 }}
          type="button"
          onClick={() => loadData(true)}
          disabled={refreshing}
          className="label-tag rounded-sm border border-ink/15 px-3 py-1.5 text-ink-soft disabled:opacity-50 dark:border-dark-border dark:text-dark-ink-soft"
        >
          {refreshing ? "Refreshing…" : "Refresh"}
        </motion.button>
      </motion.div>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-ink/10 pb-3 dark:border-dark-border">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveAdminTab(tab.key)}
            className={`rounded-sm px-3 py-1.5 text-sm font-semibold transition-colors ${
              activeAdminTab === tab.key
                ? "bg-coral-500 text-paper"
                : "text-ink-soft hover:bg-lab-100/60 dark:text-dark-ink-soft dark:hover:bg-dark-surface/60"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeAdminTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="mt-4 rounded-sm border border-ink/10 bg-paper p-5 dark:border-dark-border dark:bg-dark-bg"
        >
          {sections[activeAdminTab]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function RegNumberEditor({ member, onSave }) {
  const [value, setValue] = useState(member.registration_number || "");
  const [saving, setSaving] = useState(false);

  const unchanged = value.trim().toUpperCase() === (member.registration_number || "");
  const invalid = value.trim() !== "" && !isValidRegNumber(value);

  async function handleSave() {
    setSaving(true);
    await onSave(member.id, value);
    setSaving(false);
  }

  return (
    <div className="mt-2 flex items-center gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Reg. no. e.g. MS200/2535/2023"
        className={`w-56 rounded-sm border bg-transparent px-2 py-1 text-xs dark:text-dark-ink ${
          invalid ? "border-coral-500" : "border-ink/15 dark:border-dark-border"
        }`}
      />
      <button
        type="button"
        onClick={handleSave}
        disabled={saving || unchanged || invalid}
        className="label-tag rounded-sm border border-lab-700 px-2 py-1 text-lab-700 disabled:opacity-40 dark:border-lab-500 dark:text-lab-500"
      >
        {saving ? "…" : "Save"}
      </button>
    </div>
  );
}

function MemberYearGroup({ label, members, flashId, onToggleRegistration, onTogglePayment, onSaveRegNumber }) {
  return (
    <div>
      <h3 className="label-tag mb-2 text-lab-700 dark:text-lab-500">
        {label} ({members.length})
      </h3>
      <div className="space-y-2">
        {members.map((m) => (
          <Tile key={m.id} flash={flashId === m.id}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-lab-900 dark:text-dark-ink">{m.full_name}</p>
                <p className="text-xs text-ink-soft dark:text-dark-ink-soft">
                  {m.year_of_study || "Year unknown"}
                  {m.phone && (
                    <>
                      {" · "}
                      <a
                        href={`https://wa.me/${toWhatsAppNumber(m.phone)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-lab-700 underline dark:text-lab-500"
                      >
                        {m.phone}
                      </a>
                    </>
                  )}
                </p>
                <RegNumberEditor member={m} onSave={onSaveRegNumber} />
              </div>
              <div className="flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => onToggleRegistration(m)}
                  className={`rounded-sm px-3 py-1.5 text-xs font-semibold ${
                    m.registration_paid
                      ? "bg-lab-600 text-paper"
                      : "border border-coral-500 text-coral-600"
                  }`}
                >
                  {m.registration_paid ? "Registration ✓" : "Registration unpaid"}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => onTogglePayment(m)}
                  className={`rounded-sm px-3 py-1.5 text-xs font-semibold ${
                    m.paidThisPeriod
                      ? "bg-lab-600 text-paper"
                      : "border border-coral-500 text-coral-600"
                  }`}
                >
                  {m.paidThisPeriod ? "Semester Paid ✓" : "Mark semester paid"}
                </motion.button>
              </div>
            </div>
          </Tile>
        ))}
      </div>
    </div>
  );
}