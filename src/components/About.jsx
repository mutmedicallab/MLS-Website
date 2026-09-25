import AmbientField from "./AmbientField";

export default function About() {
  return (
    <section id="about" className="relative overflow-hidden border-t border-ink/10 bg-lab-50/60 dark:border-dark-border dark:bg-dark-surface/40 py-20 md:py-28">
      <AmbientField redCells={2} whiteCells={1} foreign={{ type: "parasite" }} />

      <div className="relative mx-auto max-w-6xl px-5 md:px-8">
        <div className="grid gap-12 md:grid-cols-[0.4fr_0.6fr]">
          <div>
            <span className="label-tag text-lab-700 dark:text-lab-500"> / Overview</span>
            <h2 className="mt-3 font-display text-3xl font-semibold text-lab-900 md:text-4xl dark:text-dark-ink">
              Who we are
            </h2>
          </div>
          <div className="space-y-5 text-lg leading-relaxed text-ink-soft dark:text-dark-ink-soft">
            <p>
              MUTMLSA is the official student association of
              the Medical Laboratory Sciences students at Murang'a University of
              Technology. We exist to complement classroom learning with
              hands-on exposure, mentorship, and a genuine sense of
              community among lab science students.
            </p>
            <p>
              From haematology to microbiology, histopathology to clinical
              chemistry, our members support one another through practicals,
              exams, attachments, and the long road to certification —
              because good diagnostics start with people who look out for
              each other first.
            </p>
          </div>
        </div>

        <div className="mt-16 grid gap-px overflow-hidden rounded-sm border border-ink/10 bg-ink/10 dark:border-dark-border dark:bg-dark-border sm:grid-cols-3">
          {[
            { k: "Mission", v: "To promote and maintain high standards of professionalism and excellence in Medical Laboratory service delivery in Murang'a University of Technology and beyond." },
            { k: "Vision", v: "Promote cohesion and collaboration, linking competent medical technologists to opportunities." },
            { k: "Objectives", v: "Unite medical laboratory students, expose members to the wider medical field through community-based service, and create public awareness on health matters." },
          ].map((item) => (
            <div key={item.k} className="bg-paper p-7 dark:bg-dark-bg">
              <h3 className="label-tag text-coral-600 dark:text-coral-500">{item.k}</h3>
              <p className="mt-3 text-ink-soft dark:text-dark-ink-soft">{item.v}</p>
            </div>
          ))}
        </div>

        <p className="mt-8 label-tag text-ink-soft dark:text-dark-ink-soft">
          Matron · Dr. Esther Muitta
        </p>
      </div>
    </section>
  );
}