import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, Reorder, useDragControls } from "motion/react";
import { API_BASE_URL } from "../config/api";

const CURRENT_PERIOD = { academicYear: "2026/2027", semester: "Sem 1" };
const YEAR_ORDER = ["Y1", "Y2", "Y3", "Y4"];

function toWhatsAppNumber(phone) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) return "254" + digits.slice(1);
  if (digits.startsWith("254")) return digits;
  return digits;
}

// Animates a number counting up from its previous value to the new one
// whenever `value` changes — used for the section headline counts.
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

// A "physical tile" hover/tap effect: slight 3D tilt + lift + shadow,
// used to wrap every name row (Applications, Members, Subscribers) so
// they all feel like tiles you can pick up rather than flat list rows.
function Tile({ children, flash, className = "", ...props }) {
  return (
    <motion.div
      style={{ perspective: 700 }}
      className={className}
    >
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

// Drag handle isolated from the rest of the tile, so dragging to reorder
// sections never intercepts a normal vertical scroll on mobile.
function DraggableSection({ value, children }) {
  const controls = useDragControls();
  return (
    <Reorder.Item
      value={value}
      dragListener={false}
      dragControls={controls}
      whileDrag={{ scale: 1.02, boxShadow: "0 8px 24px rgba(0,0,0,0.18)", zIndex: 10 }}
      className="rounded-sm border border-ink/10 bg-paper p-5 dark:border-dark-border dark:bg-dark-bg"
    >
      <div className="mb-3 flex justify-end">
        <span
          onPointerDown={(e) => controls.start(e)}
          className="cursor-grab select-none touch-none text-ink-soft/50 active:cursor-grabbing dark:text-dark-ink-soft/50"
        >
          ⠿ drag
        </span>
      </div>
      {children}
    </Reorder.Item>
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

  const [notifyTitle, setNotifyTitle] = useState("");
  const [notifyBody, setNotifyBody] = useState("");
  const [notifyImage, setNotifyImage] = useState("");
  const [notifySending, setNotifySending] = useState(false);
  const [notifyResult, setNotifyResult] = useState("");

  const [sectionOrder, setSectionOrder] = useState([
    "applications",
    "members",
    "subscribers",
    "notify",
  ]);

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
    return res;
  }

  async function loadData(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const [appsRes, membersRes, subsRes] = await Promise.all([
        authedFetch("/api/admin/members/pending-applications"),
        authedFetch(
          `/api/admin/members?academicYear=${encodeURIComponent(CURRENT_PERIOD.academicYear)}&semester=${encodeURIComponent(CURRENT_PERIOD.semester)}`
        ),
        authedFetch("/api/newsletter"),
      ]);
      const appsData = await appsRes.json();
      const membersData = await membersRes.json();
      const subsData = await subsRes.json();
      setApplications(appsData.applications || []);
      setMembers(membersData.members || []);
      setSubscribers(subsData.subscribers || []);
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

  const sections = {
    applications: (
      <div>
        <h2 className="font-display text-lg font-semibold text-lab-900 dark:text-dark-ink">
          Pending Applications (<CountUp value={applications.length} />)
        </h2>
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

      <p className="mt-6 label-tag text-ink-soft dark:text-dark-ink-soft">
        Drag a section by its handle to reorder — your layout, your call.
      </p>

      <Reorder.Group
        axis="y"
        values={sectionOrder}
        onReorder={setSectionOrder}
        className="mt-3 space-y-4"
      >
        {sectionOrder.map((key) => (
          <DraggableSection key={key} value={key}>
            {sections[key]}
          </DraggableSection>
        ))}
      </Reorder.Group>
    </div>
  );
}

function MemberYearGroup({ label, members, flashId, onToggleRegistration, onTogglePayment }) {
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