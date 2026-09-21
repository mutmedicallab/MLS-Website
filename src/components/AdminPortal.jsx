import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { API_BASE_URL } from "../config/api";

const CURRENT_PERIOD = { academicYear: "2026/2027", semester: "Sem 1" };
const YEAR_ORDER = ["Y1", "Y2", "Y3", "Y4"];

function toWhatsAppNumber(phone) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) {
    return "254" + digits.slice(1);
  }
  if (digits.startsWith("254")) {
    return digits;
  }
  return digits;
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
  const [confirmingId, setConfirmingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [subscriberSearch, setSubscriberSearch] = useState("");

  const [notifyTitle, setNotifyTitle] = useState("");
  const [notifyBody, setNotifyBody] = useState("");
  const [notifyImage, setNotifyImage] = useState("");
  const [notifySending, setNotifySending] = useState(false);
  const [notifyResult, setNotifyResult] = useState("");

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

  async function loadData() {
    setLoading(true);
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
      await loadData();
    } finally {
      setConfirmingId(null);
    }
  }

  async function togglePayment(member) {
    await authedFetch(`/api/admin/members/${member.id}/payment`, {
      method: "PATCH",
      body: JSON.stringify({
        ...CURRENT_PERIOD,
        paid: !member.paidThisPeriod,
      }),
    });
    loadData();
  }

  async function toggleRegistration(member) {
    await authedFetch(`/api/admin/members/${member.id}/registration`, {
      method: "PATCH",
      body: JSON.stringify({ paid: !member.registration_paid }),
    });
    loadData();
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
          onClick={loadData}
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

  const otherMembers = filteredMembers.filter(
    (m) => !YEAR_ORDER.includes(m.year_of_study)
  );

  const sortedSubscribers = [...subscribers].sort((a, b) => {
    const nameA = a.full_name || a.email;
    const nameB = b.full_name || b.email;
    return nameA.localeCompare(nameB);
  });

  const filteredSubscribers = sortedSubscribers.filter((s) => {
    const term = subscriberSearch.toLowerCase();
    return (
      (s.full_name || "").toLowerCase().includes(term) ||
      s.email.toLowerCase().includes(term)
    );
  });

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <motion.div initial="hidden" animate="visible" variants={sectionVariants}>
        <h1 className="font-display text-2xl font-semibold text-lab-900 dark:text-dark-ink">
          Admin Portal
        </h1>
        <p className="mt-1 text-sm text-ink-soft dark:text-dark-ink-soft">
          Tracking {CURRENT_PERIOD.semester} · {CURRENT_PERIOD.academicYear}
        </p>
      </motion.div>

      <motion.section
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        transition={{ delay: 0.05 }}
        className="mt-10"
      >
        <h2 className="font-display text-lg font-semibold text-lab-900 dark:text-dark-ink">
          Pending Applications ({applications.length})
        </h2>
        <div className="mt-3 space-y-2">
          {applications.length === 0 && (
            <p className="text-sm text-ink-soft dark:text-dark-ink-soft">No pending applications.</p>
          )}
          <AnimatePresence>
            {applications.map((app) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                className="flex items-center justify-between rounded-sm border border-ink/10 p-3 dark:border-dark-border"
              >
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
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.section>

      <motion.section
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        transition={{ delay: 0.1 }}
        className="mt-10"
      >
        <h2 className="font-display text-lg font-semibold text-lab-900 dark:text-dark-ink">
          Members ({members.length})
        </h2>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name…"
          className="mt-3 w-full max-w-xs rounded-sm border border-ink/15 bg-transparent px-3 py-2 text-sm dark:border-dark-border dark:text-dark-ink"
        />

        <div className="mt-3 space-y-6">
          {filteredMembers.length === 0 && (
            <p className="text-sm text-ink-soft dark:text-dark-ink-soft">No members match that search.</p>
          )}

          {YEAR_ORDER.map((year) =>
            groupedMembers[year].length > 0 ? (
              <MemberYearGroup
                key={year}
                label={year}
                members={groupedMembers[year]}
                onToggleRegistration={toggleRegistration}
                onTogglePayment={togglePayment}
              />
            ) : null
          )}

          {otherMembers.length > 0 && (
            <MemberYearGroup
              label="Other / Unspecified"
              members={otherMembers}
              onToggleRegistration={toggleRegistration}
              onTogglePayment={togglePayment}
            />
          )}
        </div>
      </motion.section>

      <motion.section
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        transition={{ delay: 0.15 }}
        className="mt-10"
      >
        <h2 className="font-display text-lg font-semibold text-lab-900 dark:text-dark-ink">
          Newsletter Subscribers ({subscribers.length})
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
              loadData();
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
              loadData();
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

        <div className="mt-3 overflow-hidden rounded-sm border border-ink/10 dark:border-dark-border">
          {filteredSubscribers.length === 0 ? (
            <p className="p-4 text-sm text-ink-soft dark:text-dark-ink-soft">
              {subscribers.length === 0 ? "No subscribers yet." : "No subscribers match that search."}
            </p>
          ) : (
            <div className="divide-y divide-ink/10 dark:divide-dark-border">
              {filteredSubscribers.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: Math.min(i * 0.015, 0.3) }}
                  className={`flex flex-col gap-0.5 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between ${
                    i % 2 === 0 ? "bg-lab-50/40 dark:bg-dark-surface/30" : ""
                  }`}
                >
                  <span className="text-sm font-medium text-lab-900 dark:text-dark-ink">
                    {s.full_name || "—"}
                  </span>
                  <span className="text-xs text-ink-soft dark:text-dark-ink-soft">{s.email}</span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.section>

      <motion.section
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        transition={{ delay: 0.2 }}
        className="mt-10"
      >
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
      </motion.section>
    </div>
  );
}

function MemberYearGroup({ label, members, onToggleRegistration, onTogglePayment }) {
  return (
    <div>
      <h3 className="label-tag mb-2 text-lab-700 dark:text-lab-500">
        {label} ({members.length})
      </h3>
      <div className="space-y-2">
        {members.map((m) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-2 rounded-sm border border-ink/10 p-3 dark:border-dark-border sm:flex-row sm:items-center sm:justify-between"
          >
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
          </motion.div>
        ))}
      </div>
    </div>
  );
}