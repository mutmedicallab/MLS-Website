import AmbientField from "./AmbientField";

const EVENTS = [
  { date: "01 Sep 2026", tag: "Freshers", title: "Welcome & Recruitment Drive", desc: "Meet the board, learn what MUTMLSA does, and sign up on the spot — first-years welcome." },
  { date: "07 Sep 2026", tag: "Meet the Tribe", title: "Together from the very first step", desc: "Welcome to day one—come meet your fellow classmates, find your community, and start this exciting journey together." },
  //{ date: "19 Sep 2026", tag: "Academic Symposium", title: "Exploring New Frontiers", desc: "Uncovering the laboratory science and innovations shaping the future of medicine." },
  { date: "21 Sep 2026 - 27 Sep 2026", tag: "KeMelSa Blood Drive", title: "Saving Lives", desc: "Every drop counts, every donor matters." },
  { date: "10 Oct 2026", tag: "Team-Building Hike", title: "Details to be announced", desc: "Climbing higher, connecting closer." },
  {date: "17 Oct 2026", tag: "InterClub Game night", title: "Interdisciplinary Fun", desc: "Get ready for a night of fun and  delights!"},
];

export default function Events() {
  return (
    <section id="events" className="relative overflow-hidden border-t border-ink/10 bg-lab-900 py-20 text-paper md:py-28">
      <AmbientField redCells={3} whiteCells={1}/>

      <div className="relative mx-auto max-w-6xl px-5 md:px-8">
        <span className="label-tag text-lab-500"> Schedule</span>
        <h2 className="mt-3 font-display text-3xl font-semibold md:text-4xl">
          Upcoming on the calendar
        </h2>

        <div className="mt-12 divide-y divide-paper/10 border-y border-paper/10">
          {EVENTS.map((e) => (
            <div key={e.title} className="grid gap-3 py-6 sm:grid-cols-[110px_100px_1fr] sm:items-baseline sm:gap-6">
              <span className="font-mono text-sm text-lab-500">{e.date}</span>
              <span className="label-tag w-fit rounded-sm bg-paper/10 px-2 py-1 text-coral-500">{e.tag}</span>
              <div>
                <h3 className="font-display text-lg font-semibold text-paper">{e.title}</h3>
                <p className="mt-1 text-sm text-paper/60">{e.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center gap-3 rounded-sm border border-paper/10 bg-paper/5 px-5 py-4">
          <span className="label-tag rounded-sm bg-paper/10 px-2 py-1 text-lab-500">Weekly</span>
          <p className="text-sm text-paper/70">
            General meetings every <span className="text-paper">Thursday, 5:00 PM</span> — TBA.
          </p>
        </div>
      </div>
    </section>
  );
}