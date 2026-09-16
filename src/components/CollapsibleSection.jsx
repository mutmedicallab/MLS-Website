// src/components/CollapsibleSection.jsx
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export default function CollapsibleSection({ title, subtitle, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 rounded-sm border border-ink/10 bg-lab-50/50 px-5 py-4 text-left dark:border-dark-border dark:bg-dark-surface/40"
      >
        <div>
          <p className="font-display text-base font-semibold text-lab-900 dark:text-dark-ink">
            {title}
          </p>
          {subtitle && (
            <p className="mt-0.5 text-xs text-ink-soft dark:text-dark-ink-soft">{subtitle}</p>
          )}
        </div>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-lab-700 dark:text-lab-500"
        >
          ▾
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}