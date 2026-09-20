import { AUDIT_VISIBLE_UNTIL, AUDIT_PDF_URL } from "../utils/auditContext";

// Shows a dismissible-by-time banner linking to the audit PDF. Renders
// nothing once AUDIT_VISIBLE_UNTIL has passed — no manual cleanup needed
// after the ~week window closes.
export default function AuditBanner() {
  if (new Date() > AUDIT_VISIBLE_UNTIL) return null;

  return (
    <div className="border-b border-ink/10 bg-lab-50/70 px-5 py-3 text-center text-sm dark:border-dark-border dark:bg-dark-surface/50">
      <span className="text-ink-soft dark:text-dark-ink-soft">
        Our 2025/2026 Financial Audit Report is now public.{" "}
      </span>
      <a
        href={AUDIT_PDF_URL}
        target="_blank"
        rel="noopener noreferrer"
        download
        className="font-semibold text-coral-600 underline underline-offset-2"
      >
        Download the PDF
      </a>
    </div>
  );
}