import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Reveal from "./Reveal";
import TiltCard from "./TiltCard";

import chairPerson from "../assets/committee/Cherrily.jpeg";
import viceChairperson from "../assets/committee/brianlore.jpeg";
import secretaryGeneral from "../assets/committee/Tonia.jpeg";
import viceSecretary from "../assets/committee/Shariff.jpeg";
import treasurer from "../assets/committee/James.jpeg";
import organizingSecretary from "../assets/committee/Japheth.jpeg";
import sargentAtArm from "../assets/committee/Joseph.jpg";
import publicRelationsOfficer from "../assets/committee/parapanda.jpeg";
import fourthYearRepresentative from "../assets/committee/Ibrahim.jpeg";
import thirdYearRepresentative from "../assets/committee/Anna.jpeg";
//import secondYearRepresentative from "../assets/committee/Sharon.jpeg";
import firstYearRepresentative from "../assets/committee/Gloria.jpeg";
import secondFirstYearRepresentative from "../assets/committee/Stephen.jpeg";

const SLIDE_MS = 4500; // how long each person stays on screen

const MEMBERS = [
  { role: "Chairperson", name: "Cherrily Ochieng", initials: "CP", photo: chairPerson },
  { role: "Vice Chairperson", name: "Brian Otieno", initials: "VC", photo: viceChairperson },
  { role: "Secretary General", name: "Antonia Muthoni", initials: "SG", photo: secretaryGeneral },
  { role: "Vice Secretary", name: "Kelvin Masha", initials: "VS", photo: viceSecretary },
  { role: "Treasurer", name: "James Gitahi", initials: "TR", photo: treasurer },
  { role: "Organizing Secretary", name: "Japheth Mambo", initials: "OS", photo: organizingSecretary },
  { role: "Sargent-At-Arm", name: "Joseph Macharia", initials: "SA", photo: sargentAtArm },
  { role: "Public Relations Officer", name: "Julius Kimani", initials: "PR", photo: publicRelationsOfficer },
  { role: "Fourth Year Representative", name: "Ibrahim Mbugua", initials: "4th Yr Rep", photo: fourthYearRepresentative },
  { role: "Third Year Representative", name: "Anna Kendy", initials: "3rd Yr Rep", photo: thirdYearRepresentative },
  { role: "Second Year Representative", name: "Sharon Akinyi", initials: "2nd Yr Rep", photo: null },
  {
    // Both first-year representatives share one card. The photo AND the name change together.
    // Put Stephen's full name in place of "Stephen".
    role: "First Year Representatives",
    initials: "1st Yr Reps",
    slides: [
      { name: "Gloria Amukuje", photo: firstYearRepresentative },
      { name: "Stephen Dume Karisa", photo: secondFirstYearRepresentative },
    ],
  },
];

function MemberCard({ m }) {
  const slides = m.slides || null;
  const [index, setIndex] = useState(0);

  // Move to the next person every few seconds
  useEffect(() => {
    if (!slides || slides.length < 2) return undefined;
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), SLIDE_MS);
    return () => clearInterval(timer);
  }, [slides]);

  const current = slides ? slides[index] : null;
  const photo = current ? current.photo : m.photo;
  const name = current ? current.name : m.name;

  return (
    <TiltCard className="overflow-hidden rounded-sm border border-ink/10 bg-lab-50/50 dark:border-dark-border dark:bg-dark-surface/40">
      <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-lab-800 dark:bg-lab-700">
        {photo ? (
          <AnimatePresence mode="wait" initial={false}>
            <motion.img
              key={photo}
              src={photo}
              alt={name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
              className="absolute inset-0 h-full w-full object-cover object-top"
            />
          </AnimatePresence>
        ) : (
          <span className="font-display text-4xl font-semibold text-lab-100">{m.initials}</span>
        )}

        {slides && slides.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {slides.map((s, i) => (
              <button
                key={s.name}
                type="button"
                aria-label={`Show ${s.name}`}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-5 bg-paper" : "w-1.5 bg-paper/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="p-5">
        <p className="label-tag text-coral-600 dark:text-coral-500">{m.role}</p>
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={name}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="mt-1 font-display text-lg font-medium text-lab-900 dark:text-dark-ink"
          >
            {name}
          </motion.p>
        </AnimatePresence>
      </div>
    </TiltCard>
  );
}

export default function Committee() {
  return (
    <section id="committee" className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <span className="label-tag text-lab-700 dark:text-lab-500">Board of Members</span>
        <h2 className="mt-3 font-display text-3xl font-semibold text-lab-900 md:text-4xl dark:text-dark-ink">
          Executive committee
        </h2>
        <p className="mt-3 max-w-md text-ink-soft dark:text-dark-ink-soft">
          Meet the board steering MUTMLSA this year.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {MEMBERS.map((m, i) => (
            <Reveal key={m.role} delay={i * 0.06}>
              <MemberCard m={m} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}