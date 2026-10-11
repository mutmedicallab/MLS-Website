import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Slideshow from "./Slideshow";

import kemelsa1 from "../assets/moments/2025-2026/sem 2/kemelsa/01.jpeg";
import kemelsa2 from "../assets/moments/2025-2026/sem 2/kemelsa/02.jpeg";
import kemelsa3 from "../assets/moments/2025-2026/sem 2/kemelsa/03.jpeg";
import kemelsa4 from "../assets/moments/2025-2026/sem 2/kemelsa/04.jpeg";
import kemelsa5 from "../assets/moments/2025-2026/sem 2/kemelsa/05.jpeg";
import kemelsa6 from "../assets/moments/2025-2026/sem 2/kemelsa/06.jpeg";
import kemelsa7 from "../assets/moments/2025-2026/sem 2/kemelsa/07.jpeg";
import kemelsa8 from "../assets/moments/2025-2026/sem 2/kemelsa/08.jpeg";
import kemelsa9 from "../assets/moments/2025-2026/sem 2/kemelsa/09.jpeg";
import kemelsa10 from "../assets/moments/2025-2026/sem 2/kemelsa/010.jpeg";
import kemelsa11 from "../assets/moments/2025-2026/sem 2/kemelsa/011.jpeg";
import kemelsa12 from "../assets/moments/2025-2026/sem 2/kemelsa/012.jpeg";

import symposium1 from "../assets/moments/2025-2026/sem 2/symposium/01.jpeg";
import symposium2 from "../assets/moments/2025-2026/sem 2/symposium/02.jpeg";
import symposium3 from "../assets/moments/2025-2026/sem 2/symposium/03.jpeg";
import symposium4 from "../assets/moments/2025-2026/sem 2/symposium/04.jpeg";
import symposium5 from "../assets/moments/2025-2026/sem 2/symposium/05.jpeg";
import symposium6 from "../assets/moments/2025-2026/sem 2/symposium/06.jpeg";
import symposium7 from "../assets/moments/2025-2026/sem 2/symposium/07.jpeg";
import symposium8 from "../assets/moments/2025-2026/sem 2/symposium/08.jpeg";

import bloodDrive1 from "../assets/moments/2025-2026/sem 1/blood drive/01.jpeg";
import bloodDrive2 from "../assets/moments/2025-2026/sem 1/blood drive/02.jpeg";
import bloodDrive3 from "../assets/moments/2025-2026/sem 1/blood drive/03.jpeg";
import bloodDrive from "../assets/moments/2025-2026/sem 1/blood drive/04.jpeg";

import handoverEsipila1 from "../assets/moments/2025-2026/sem 2/handover/01.jpeg";
import handoverEsipila2 from "../assets/moments/2025-2026/sem 2/handover/02.jpeg";
import handoverEsipila3 from "../assets/moments/2025-2026/sem 2/handover/03.jpeg";
import handoverEsipila4 from "../assets/moments/2025-2026/sem 2/handover/04.jpeg";
import handoverEsipila5 from "../assets/moments/2025-2026/sem 2/handover/05.jpeg";
import handoverEsipila6 from "../assets/moments/2025-2026/sem 2/handover/06.jpeg";
import handoverEsipila7 from "../assets/moments/2025-2026/sem 2/handover/07.jpeg";

import handoverZandria from "../assets/moments/2024-2025/sem 2/handover/01.jpeg";
import handoverZandria2 from "../assets/moments/2024-2025/sem 2/handover/02.jpeg";
import handoverZandria3 from "../assets/moments/2024-2025/sem 2/handover/03.jpeg";
import handoverZandria4 from "../assets/moments/2024-2025/sem 2/handover/04.jpeg";
import handoverZandria5 from "../assets/moments/2024-2025/sem 2/handover/05.jpeg";
import handoverZandria6 from "../assets/moments/2024-2025/sem 2/handover/06.jpeg";
import handoverZandria7 from "../assets/moments/2024-2025/sem 2/handover/07.jpeg";

import handoverAlvin from "../assets/moments/2023-2024/sem 2/handover/01.jpeg";
import handoverAlvin1 from "../assets/moments/2023-2024/sem 2/handover/02.jpeg";
import handoverAlvin2 from "../assets/moments/2023-2024/sem 2/handover/03.jpeg";
import handoverAlvin3 from "../assets/moments/2023-2024/sem 2/handover/04.jpeg";
import handoverAlvin4 from "../assets/moments/2023-2024/sem 2/handover/06.jpg";

import professionalExchange from "../assets/moments/2024-2025/sem 2/JKUAT-professional-exchange/01.jpeg";
import professionalExchange1 from "../assets/moments/2024-2025/sem 2/JKUAT-professional-exchange/02.jpeg";
import professionalExchange2 from "../assets/moments/2024-2025/sem 2/JKUAT-professional-exchange/03.jpeg";

import kemelsaElections from "../assets/moments/2024-2025/sem 2/kemelsa-elections/01.jpg";
import kemelsaElections1 from "../assets/moments/2024-2025/sem 2/kemelsa-elections/02.jpg";
import kemelsaElections2 from "../assets/moments/2024-2025/sem 2/kemelsa-elections/03.jpg";

//Committee 2023/2024
import committee2023_1 from "../assets/moments/2023-2024/committee/01.jpeg";
import committee2023_2 from "../assets/moments/2023-2024/sem 2/Launch/05.jpg";


import committee2024_1 from "../assets/moments/2024-2025/committee/Zandria.jpeg";
import committee2024_2 from "../assets/moments/2024-2025/committee/Felix.jpeg";
import committee2024_3 from "../assets/moments/2024-2025/committee/Secretary General.jpeg";
import committee2024_4 from "../assets/moments/2024-2025/committee/4 th Year Rep.jpeg";

import committee2025_1 from "../assets/moments/2025-2026/committee/Esipila.jpeg";
import committee2025_2 from "../assets/committee/Cherrily.jpeg";
import committee2025_3 from "../assets/committee/Tonia.jpeg";
import committee2025_4 from "../assets/committee/James.jpeg";
import committee2025_5 from "../assets/moments/2025-2026/committee/Kendy.jpeg";
import committee2025_6 from "../assets/committee/brianlore.jpeg";
import committee2025_7 from "../assets/moments/2025-2026/committee/Cynthia.jpeg";
import committee2025_8 from "../assets/committee/Ibrahim.jpeg";
//import committee2025_8 from "../assets/committee/Racheal.jpeg";
//import committee2025_9 from "../assets/moments/2025-2026/committee/.jpeg"

import Launch1 from "../assets/moments/2023-2024/sem 2/Launch/03.jpg";
import Launch2 from "../assets/moments/2023-2024/sem 2/Launch/06.jpg";
import Launch3 from "../assets/moments/2023-2024/sem 2/Launch/05.jpg";
import Launch4 from "../assets/moments/2023-2024/sem 2/Launch/04.jpg";
import Launch5 from "../assets/moments/2023-2024/sem 2/Launch/07.jpg";
import Launch6 from "../assets/moments/2023-2024/sem 2/Launch/08.jpg";
import Launch7 from "../assets/moments/2023-2024/sem 2/Launch/01.jpg";
import Launch8 from "../assets/moments/2023-2024/sem 2/Launch/02.jpg";





import gameNightVideo from "../assets/moments/2025-2026/sem 2/game-night/game-night video.mp4";

// Grouped by academic year (since semesters span two calendar years),
// then by semester, then individual events. Most recent first — add
// new academic years/semesters/events here as photos come in. Empty
// `events: []` arrays are placeholders for years not yet populated.

const MOMENTS_BY_PERIOD = [
  {
    academicYear: "2025/2026",
    semester: "Sem 2",
    events: [
      {
        caption: "Handover Ceremony",
        tagline: "New board, same chaos, better spirit",
        type: "slideshow",
        photos: [handoverEsipila2, handoverEsipila4, handoverEsipila5, handoverEsipila1, handoverEsipila3, handoverEsipila6],
      },
      {
        caption: "MUTMLSA at KeMELSA Scientific Conference",
        tagline: "Where we pretended to understand everyone's research",
        type: "slideshow",
        photos: [kemelsa9, kemelsa1, kemelsa2, kemelsa3, kemelsa4, kemelsa5, kemelsa10, kemelsa6, kemelsa7],
      },
      {
        caption: "Club Symposium",
        tagline: "Big words, bigger group photos",
        type: "slideshow",
        photos: [symposium1, symposium6, symposium3, symposium8, symposium5, symposium2, symposium7, symposium4],
        objectPosition: "center 30%",
      },
      {
        caption: "Game Night",
        tagline: "The night strategy, skills and Kahoot! met competitive chaos",
        type: "video",
        video: gameNightVideo,
      },
      {
        caption: "2025/2026 Committee",
        tagline: "Proof that leadership and lab coats go hand in hand",
        type: "slideshow",
        photos: [
          { src: committee2025_1, label: "Brian Esipila - Chairperson"},
          { src: committee2025_2, label: "Cherrily Ochieng' — Vice Chairperson" },
          { src: committee2025_3, label: "Antonia Muthoni— Secretary General" },
          {src : committee2025_4, label: "James Gitahi - Treasurer"},
          {src: committee2025_5, label: "Anna Kendy - Sargent at Arms"},
          {src: committee2025_6, label: "Brian Otieno - Public Relations Officer"},
          {src: committee2025_7, label: "Cynthia - Fourth Year Representative"},
          {src: committee2025_8, label: "Ibrahim Mbugua - Third Year Representative"},
          //{src: committee2025_8, label: "Rachael - Second Year Representative"},
          //{src: committee2025_9, label: " Michelle Mumbua - First Year Representative"}
        ],
      },
    ],
  },
  {
    academicYear: "2025/2026",
    semester: "Sem 1",
    events: [
      {
        caption: "Blood Drive",
        tagline: "Giving blood, saving lives, complaining about the pinch",
        date: "November 29th",
        type: "slideshow",
        photos: [bloodDrive, bloodDrive1, bloodDrive2, bloodDrive3],
      },
    ],
  },
  {
    academicYear: "2024/2025",
    semester: "Sem 2",
    events: [
      {
        caption: "Handover Ceremony",
        tagline: "Out with the old cohort, in with the ambitious",
        type: "slideshow",
        photos: [handoverZandria7, handoverZandria2, handoverZandria3, handoverZandria4, handoverZandria5, handoverZandria6, handoverZandria],
      },
      {
        caption: "KeMELSA Elections 2025 hosted by MUTMLSA",
        date: "March 22nd 2025",
        type: "slideshow",
        photos: [kemelsaElections, kemelsaElections1, kemelsaElections2],
      },
      {
        caption: "JKUAT Professional Exchange",
        date: "March 8th 2025",
        type: "slideshow",
        photos: [professionalExchange2, professionalExchange1, professionalExchange],
      },
      {
        caption: "2024/2025 Committee",
        tagline: "The board that kept things running",
        type: "slideshow",
        photos: [
          { src: committee2024_1, label: "Zandria Adema — Chairperson" },
          { src: committee2024_2, label: "Felix Oyugi — Vice Chairperson" },
          { src: committee2024_3, label: "Alubaka Brian — Secretary General" },
          { src: committee2024_4, label: "Mary Mwangi — 4th Year Representative" },
        ],
      },
    ],
  },
  {
    academicYear: "2024/2025",
    semester: "Sem 1",
    events: [
      { caption: "Soon to be uploaded..", type: "placeholder" },
      { caption: "Soon to be uploaded..", type: "placeholder" },
    ],
  },
  {
    academicYear: "2023/2024",
    semester: "Sem 2",
    events: [

      
      {
        caption: "MUTMLSA Launch",
        tagline: "The heroes,visionaries and champions we remember to this day",
        type: "slideshow",
        photos:[Launch1, Launch2, Launch3, Launch4, Launch5,Launch6, Launch7, Launch8]

      },
      {
        caption: "Handover Ceremony",
        tagline: "Same association, freshly re-calibrated",
        type: "slideshow",
        photos: [handoverAlvin, handoverAlvin1, handoverAlvin2, handoverAlvin3, handoverAlvin4],
      },
      {
        caption: "2023/2024 Committee",
        tagline: "Where it all started",
        type: "slideshow",
        photos: [
          {src: committee2023_1, label : "Alvin - Chairperson"},
          {src: committee2023_2, label :"From the Right we have Joanna the vice Chairperson and in the middle we have Lucy who was the Secretary"}
        ],
      },
      { caption: "Careers Beyond the Bench Talk", type: "placeholder" },
    ],
  },
  {
    academicYear: "2023/2024",
    semester: "Sem 1",
    events: [
      { caption: "Soon to be uploaded..", type: "placeholder" },
    ],
  },
];

export default function Moments() {
  const [selectedPeriod, setSelectedPeriod] = useState(0);
  const [openIndex, setOpenIndex] = useState(null);
  const period = MOMENTS_BY_PERIOD[selectedPeriod];

  return (
    <section id="moments" className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <span className="label-tag text-lab-700 dark:text-lab-500">The archive</span>
        <h2 className="mt-3 font-display text-3xl font-semibold text-lab-900 md:text-4xl dark:text-dark-ink">
          Moments from past semesters
        </h2>
        <p className="mt-3 max-w-xl text-ink-soft dark:text-dark-ink-soft">
          Photos and clips from what we've been up to — tap a tile to view it
          on its own.
        </p>

        <div className="mt-8 flex flex-wrap gap-2">
          {MOMENTS_BY_PERIOD.map((p, i) => (
            <button
              key={`${p.academicYear}-${p.semester}`}
              type="button"
              onClick={() => {
                setSelectedPeriod(i);
                setOpenIndex(null);
              }}
              className={`label-tag rounded-sm px-3 py-1.5 transition-colors ${
                i === selectedPeriod
                  ? "bg-lab-900 text-lab-100 dark:bg-lab-600"
                  : "bg-lab-50 text-ink-soft hover:bg-lab-100 dark:bg-dark-surface/40 dark:text-dark-ink-soft"
              }`}
            >
              {p.semester} · {p.academicYear}
            </button>
          ))}
        </div>

        {period.events.length > 0 ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {period.events.map((m, i) => (
              <MomentTile
                key={`${selectedPeriod}-${m.caption}`}
                moment={m}
                seed={i}
                onOpen={() => setOpenIndex(i)}
              />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-sm border border-dashed border-ink/15 py-12 text-center dark:border-dark-border">
            <p className="label-tag text-ink-soft dark:text-dark-ink-soft">
              No photos archived for this semester yet
            </p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {openIndex !== null && (
          <Lightbox
            moment={period.events[openIndex]}
            onClose={() => setOpenIndex(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

function MomentTile({ moment, seed, onOpen }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onOpen();
      }}
      className="group cursor-pointer text-left overflow-hidden rounded-sm border border-ink/10 transition-transform hover:-translate-y-0.5 dark:border-dark-border"
    >
      <div className="relative flex aspect-[4/3] items-center justify-center bg-lab-900">
        {moment.type === "slideshow" && (
          <Slideshow photos={moment.photos} seed={seed} interactive={false} objectPosition={moment.objectPosition} />
        )}
        {moment.type === "image" && (
          <img src={moment.photo} alt={moment.caption} className="h-full w-full object-cover" />
        )}
        {moment.type === "video" && (
          <video
            src={moment.video}
            className="h-full w-full object-cover"
            muted
            playsInline
            preload="metadata"
          />
        )}
        {moment.type === "placeholder" && (
          <span className="label-tag text-lab-500/60">Photo coming soon</span>
        )}

        <div className="absolute inset-0 flex items-center justify-center bg-lab-900/0 opacity-0 transition-all group-hover:bg-lab-900/20 group-hover:opacity-100">
          <span className="label-tag rounded-sm bg-paper/90 px-2 py-1 text-lab-900">
            View
          </span>
        </div>
      </div>
      <div className="bg-lab-50/50 p-4 dark:bg-dark-surface/40">
        <p className="font-display text-sm font-semibold text-lab-900 dark:text-dark-ink">
          {moment.caption}
        </p>
        {moment.tagline && (
          <p className="mt-1 text-xs italic text-ink-soft dark:text-dark-ink-soft">
            {moment.tagline}
          </p>
        )}
        {moment.date && (
          <p className="label-tag mt-1 text-ink-soft dark:text-dark-ink-soft">
            {moment.date}
          </p>
        )}
      </div>
    </div>
  );
}



function Lightbox({ moment, onClose }) {
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

        <div className="max-h-[75vh] w-full bg-lab-900">
          {moment.type === "slideshow" && (
            <Slideshow photos={moment.photos} seed={0} interactive natural />
          )}
          {moment.type === "image" && (
            <img
              src={moment.photo}
              alt={moment.caption}
              className="max-h-[75vh] w-full object-contain"
            />
          )}
          {moment.type === "video" && (
            <video
              src={moment.video}
              className="max-h-[75vh] w-full"
              controls
              autoPlay
              playsInline
            />
          )}
        </div>

        <div className="p-5">
          <p className="font-display text-lg font-semibold text-paper">{moment.caption}</p>
          {moment.tagline && (
            <p className="mt-1 text-sm italic text-paper/70">{moment.tagline}</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
