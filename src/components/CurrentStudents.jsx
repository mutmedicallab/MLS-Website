import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Reveal from "./Reveal";
import Slideshow from "./Slideshow";

//Year 1 pictures
import Pic1 from "../assets/currentStudents/Y1/01.jpeg";

//Year 3
import Pic3 from "../assets/currentStudents/Y3/01.jpeg";
import Pic4 from "../assets/currentStudents/Y3/02.jpeg";

// Add `type: "slideshow"` to a year to show its photos as a slideshow.
// Photos can be plain imports, or { src, label } objects if you want a
// caption (like a student's name) to show over each photo.
const CURRENT_STUDENTS = [
  {
    yearLabel: "Y1",
    yearName: "Year 1",
    entries: [
      { caption: "2026/2027 Y1 Cohort", tagline: "The newest additions to the bench", photos: [Pic1] },
    ],
  },
  {
    yearLabel: "Y2",
    yearName: "Year 2",
    entries: [
      { caption: "Y2 Cohort", tagline: "Settled in, stepping up", photos: [] },
    ],
  },
  {
    yearLabel: "Y3",
    yearName: "Year 3",
    type: "slideshow",
    entries: [
      { caption: "Y3 Cohort", tagline: "Past the halfway mark and not slowing down", photos: [Pic3, Pic4] },
    ],
  },
  {
    yearLabel: "Y4",
    yearName: "Year 4",
    entries: [
      { caption: "Y4 Cohort", tagline: "Years of training, one big graduation", photos: [] },
    ],
  },
];

export default function CurrentStudents() {
  const [selectedYear, setSelectedYear] = useState(() => {
  const match = window.location.hash.match(/^#students-y([1-4])$/);
  return match ? Number(match[1]) - 1 : 0;
});
  const [openEntry, setOpenEntry] = useState(null);
  const year = CURRENT_STUDENTS[selectedYear];
  const isSlideshowYear = year.type === "slideshow";

  return (
    <section id="students" className="border-t border-ink/10 py-20 dark:border-dark-border md:py-28">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <span className="label-tag text-lab-700 dark:text-lab-500">The bench today</span>
        <h2 className="mt-3 font-display text-3xl font-semibold text-lab-900 md:text-4xl dark:text-dark-ink">
          Current students
        </h2>
        <p className="mt-3 max-w-xl text-ink-soft dark:text-dark-ink-soft">
          Every cohort currently working through the program, from
          orientation to final-year attachments.
        </p>

        <div className="mt-8 flex flex-wrap gap-2">
          {CURRENT_STUDENTS.map((y, i) => (
            <button
              key={y.yearLabel}
              type="button"
              onClick={() => {
                setSelectedYear(i);
                setOpenEntry(null);
              }}
              className={`label-tag rounded-sm px-3 py-1.5 transition-colors ${
                i === selectedYear
                  ? "bg-lab-900 text-lab-100 dark:bg-lab-600"
                  : "bg-lab-50 text-ink-soft hover:bg-lab-100 dark:bg-dark-surface/40 dark:text-dark-ink-soft"
              }`}
            >
              {y.yearName}
            </button>
          ))}
        </div>

        {year.entries.length > 0 ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {year.entries.map((e, i) => (
              <Reveal key={e.caption} delay={i * 0.08}>
                <EntryTile
                  entry={e}
                  seed={i}
                  isSlideshow={isSlideshowYear}
                  onOpen={() => setOpenEntry(i)}
                />
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-sm border border-dashed border-ink/15 py-12 text-center dark:border-dark-border">
            <p className="label-tag text-ink-soft dark:text-dark-ink-soft">
              Nothing archived here yet
            </p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {openEntry !== null && (
          <EntryLightbox
            entry={year.entries[openEntry]}
            isSlideshow={isSlideshowYear}
            onClose={() => setOpenEntry(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

function EntryTile({ entry, seed, isSlideshow, onOpen }) {
  const hasPhotos = entry.photos.length > 0;
  const showSlideshow = isSlideshow && entry.photos.length > 1;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={hasPhotos ? onOpen : undefined}
      onKeyDown={(e) => {
        if (hasPhotos && (e.key === "Enter" || e.key === " ")) onOpen();
      }}
      className={`group overflow-hidden rounded-sm border border-ink/10 dark:border-dark-border ${
        hasPhotos ? "cursor-pointer transition-transform hover:-translate-y-0.5" : ""
      }`}
    >
      <div className="relative flex aspect-[4/3] items-center justify-center bg-lab-900">
        {hasPhotos ? (
          showSlideshow ? (
            <Slideshow photos={entry.photos} seed={seed} interactive={false} />
          ) : (
            <img
              src={typeof entry.photos[0] === "string" ? entry.photos[0] : entry.photos[0].src}
              alt={entry.caption}
              className="h-full w-full object-cover"
            />
          )
        ) : (
          <span className="label-tag text-lab-500/60">Photo coming soon</span>
        )}
      </div>
      <div className="bg-lab-50/50 p-4 dark:bg-dark-surface/40">
        <p className="font-display text-sm font-semibold text-lab-900 dark:text-dark-ink">
          {entry.caption}
        </p>
        {entry.tagline && (
          <p className="mt-1 text-xs italic text-ink-soft dark:text-dark-ink-soft">
            {entry.tagline}
          </p>
        )}
      </div>
    </div>
  );
}

function EntryLightbox({ entry, isSlideshow, onClose }) {
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const showSlideshow = isSlideshow && entry.photos.length > 1;

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-lab-900/90 p-5 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative w-full max-w-2xl overflow-hidden rounded-sm bg-lab-900"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-paper/90 text-lab-900"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="max-h-[75vh] w-full overflow-y-auto bg-lab-900">
          {showSlideshow ? (
            <Slideshow photos={entry.photos} seed={0} interactive natural />
          ) : (
            <div className="space-y-2 p-2">
              {entry.photos.map((p, i) => (
                <img
                  key={i}
                  src={typeof p === "string" ? p : p.src}
                  alt={`${entry.caption} ${i + 1}`}
                  className="w-full rounded-sm object-contain"
                />
              ))}
            </div>
          )}
        </div>

        <div className="p-5">
          <p className="font-display text-lg font-semibold text-paper">{entry.caption}</p>
          {entry.tagline && (
            <p className="mt-1 text-sm italic text-paper/70">{entry.tagline}</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}