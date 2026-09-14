import { useState } from "react";
import { API_BASE_URL } from "../config/api";

const CURRENT_PERIOD = { academicYear: "2026/2027", semester: "Sem 1" };
const YEAR_ORDER = ["Y1", "Y2", "Y3", "Y4"];

// Normalizes a Kenyan phone number into the international format WhatsApp
// needs: strips non-digits, then converts a leading 0 to 254 if present.
function toWhatsAppNumber(phone) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) {
    return "254" + digits.slice(1);
  }
  if (digits.startsWith("254")) {
    return digits;
  }
  // Already has some other country code, or is unusually formatted —
  // pass through as-is rather than guessing further.
  return digits;
}

export default function AdminPortal() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState("");

  const [applications, setApplications] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmingId, setConfirmingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

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
      const [appsRes, membersRes] = await Promise.all([
        authedFetch("/api/admin/members/pending-applications"),
        authedFetch(
          `/api/admin/members?academicYear=${encodeURIComponent(CURRENT_PERIOD.academicYear)}&semester=${encodeURIComponent(CURRENT_PERIOD.semester)}`
        ),
      ]);
      const appsData = await appsRes.json();
      const membersData = await membersRes.json();
      setApplications(appsData.applications || []);
      setMembers(membersData.members || []);
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

  if (!authed) {
    return (
      <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-5">
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
        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="mt-3 rounded-sm bg-lab-800 px-4 py-2 text-sm font-semibold text-paper disabled:opacity-50"
        >
          {loading ? "Checking…" : "Enter"}
        </button>
        {error && <p className="mt-3 text-sm text-coral-600">{error}</p>}
      </div>
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

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <h1 className="font-display text-2xl font-semibold text-lab-900 dark:text-dark-ink">
        Admin Portal
      </h1>
      <p className="mt-1 text-sm text-ink-soft dark:text-dark-ink-soft">
        Tracking {CURRENT_PERIOD.semester} · {CURRENT_PERIOD.academicYear}
      </p>

      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold text-lab-900 dark:text-dark-ink">
          Pending Applications ({applications.length})
        </h2>
        <div className="mt-3 space-y-2">
          {applications.length === 0 && (
            <p className="text-sm text-ink-soft dark:text-dark-ink-soft">No pending applications.</p>
          )}
          {applications.map((app) => (
            <div
              key={app.id}
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
              <button
                type="button"
                onClick={() => confirmApplication(app)}
                disabled={confirmingId === app.id}
                className="rounded-sm bg-lab-800 px-3 py-1.5 text-xs font-semibold text-paper disabled:opacity-50"
              >
                {confirmingId === app.id ? "Confirming…" : "Confirm as member"}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
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
      </section>
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
          <div
            key={m.id}
            className="flex flex-col gap-2 rounded-sm border border-ink/10 p-3 dark:border-dark-border sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-sm font-semibold text-lab-900 dark:text-dark-ink">{m.full_name}</p>
              <p className="text-xs text-ink-soft dark:text-dark-ink-soft">
                {m.year_of_study || "Year unknown"}
                {m.phone && (
                  <>
                    {" · "}
                    
                     <a  href={`https://wa.me/${toWhatsAppNumber(m.phone)}`}
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
              <button
                type="button"
                onClick={() => onToggleRegistration(m)}
                className={`rounded-sm px-3 py-1.5 text-xs font-semibold ${
                  m.registration_paid
                    ? "bg-lab-600 text-paper"
                    : "border border-coral-500 text-coral-600"
                }`}
              >
                {m.registration_paid ? "Registration ✓" : "Registration unpaid"}
              </button>
              <button
                type="button"
                onClick={() => onTogglePayment(m)}
                className={`rounded-sm px-3 py-1.5 text-xs font-semibold ${
                  m.paidThisPeriod
                    ? "bg-lab-600 text-paper"
                    : "border border-coral-500 text-coral-600"
                }`}
              >
                {m.paidThisPeriod ? "Semester Paid ✓" : "Mark semester paid"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}