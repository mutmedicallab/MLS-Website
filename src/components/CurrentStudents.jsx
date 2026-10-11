import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import Reveal from "./Reveal";

//Year 1 pictures
import Pic1 from "../assets/currentStudents/Y1/01.jpeg";

//Year 3
import Pic3 from "../assets/currentStudents/Y3/01.jpeg";
import Pic4 from "../assets/currentStudents/Y3/02.jpeg";

// Each year holds several "entries". Add `type: "slideshow"` to a year to
// show its photos as an auto-advancing slideshow instead of a single tile.
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
      { caption: "Y2 Cohort", tagline: "", photos: [] },
    ],
  },
  {
    yearLabel: "Y3",
    yearName: "Year 3",
    type: "slideshow",
    entries: [
      { caption: "Y3 Cohort", tagline: "", photos: [Pic3, Pic4] },
    ],
  },
  {
    yearLabel: "Y4",
    yearName: "Year 4",
    entries: [
      { caption: "Y4 Cohort", tagline: "", photos: [] },
    ],
  },
];

const SLIDE_INTERVAL_MS = 4000;

export default function CurrentStudents() {
  const [selectedYear, setSelectedYear] = useState(0);
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
          <div
            className={
              isSlideshowYear
                ? "mt-8 grid max-w-2xl gap-4"
                : "mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            }
          >
            {year.entries.map((e, i) => (
              <Reveal key={e.caption} delay={i * 0.08}>
                {isSlideshowYear && e.photos.length > 1 ? (
                  <SlideshowTile entry={e} onOpen={() => setOpenEntry(i)} />
                ) : (
                  <EntryTile entry={e} onOpen={() => setOpenEntry(i)} />
                )}
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
            onClose={() => setOpenEntry(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

function SlideshowTile({ entry, onOpen }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef(null);
  const count = entry.photos.length;

  useEffect(() => {
    if (paused || count < 2) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [paused, count]);

  function go(delta) {
    setIndex((i) => (i + delta + count) % count);
  }

  function handleTouchEnd(e) {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 40) go(diff < 0 ? 1 : -1);
    touchStartX.current = null;
    setPaused(false);
  }

  return (
    <div className="overflow-hidden rounded-sm border border-ink/10 dark:border-dark-border">
      <div
        className="relative aspect-[4/3] cursor-pointer bg-lab-900"
        onClick={onOpen}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX;
          setPaused(true);
        }}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={index}
            src={entry.photos[index]}
            alt={`${entry.caption} ${index + 1}`}
            className="absolute inset-0 h-full w-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          />
        </AnimatePresence>

        <button
          type="button"
          aria-label="Previous photo"
          onClick={(e) => {
            e.stopPropagation();
            go(-1);
          }}
          className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-paper/80 text-lab-900"
        >
          ‹
        </button>
        <button
          type="button"
          aria-label="Next photo"
          onClick={(e) => {
            e.stopPropagation();
            go(1);
          }}
          className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-paper/80 text-lab-900"
        >
          ›
        </button>

        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
          {entry.photos.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to photo ${i + 1}`}
              onClick={(e) => {
                e.stopPropagation();
                setIndex(i);
              }}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-5 bg-paper" : "w-1.5 bg-paper/50"
              }`}
            />
          ))}
        </div>
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

function EntryTile({ entry, onOpen }) {
  const hasPhotos = entry.photos.length > 0;

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
      <div className="flex aspect-[4/3] items-center justify-center bg-lab-900">
        {hasPhotos ? (
          <img src={entry.photos[0]} alt={entry.caption} className="h-full w-full object-cover" />
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

function EntryLightbox({ entry, onClose }) {
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
        <div className="max-h-[75vh] w-full space-y-2 overflow-y-auto bg-lab-900 p-2">
          {entry.photos.map((src, i) => (
            <img key={i} src={src} alt={`${entry.caption} ${i + 1}`} className="w-full rounded-sm object-contain" />
          ))}
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