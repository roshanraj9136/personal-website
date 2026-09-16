import { FaExternalLinkAlt, FaGraduationCap, FaTrophy } from 'react-icons/fa'
import Reveal from '@/components/ui/Reveal'
import TiltCard from '@/components/ui/TiltCard'
import { achievements, education } from '@/content/site'

export default function About() {
  return (
    <section id="about" data-stage={6} aria-labelledby="about-title" className="pass-through relative py-24 lg:py-32">
      <div className="container-x">
        <div className="lg:w-1/2 lg:pr-4">
        <Reveal className="hero-copy">
          <h2 id="about-title" className="section-title">
            Education & achievements
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-4">
          <Reveal>
            <TiltCard className="skill-card h-full" max={5}>
              <p className="flex items-center gap-2 text-sm text-[var(--muted)]">
                <FaGraduationCap aria-hidden="true" /> {education.period}
              </p>
              <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight">{education.school}</h3>
              <p className="mt-1 text-[var(--muted)]">{education.degree}</p>
              <p className="mt-6 text-xs uppercase tracking-[0.18em] text-[var(--faint)]">Relevant coursework</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {education.coursework.map((course) => (
                  <li key={course} className="chip">
                    {course}
                  </li>
                ))}
              </ul>
            </TiltCard>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2">
            {achievements.map((item, i) => (
              <Reveal key={item.title} delay={0.08 * (i + 1)}>
                <TiltCard className="skill-card h-full" max={7}>
                  <p className="flex items-center gap-2 text-sm text-[var(--muted)]">
                    <FaTrophy aria-hidden="true" /> {item.title}
                  </p>
                  <p className="mt-3 font-display text-5xl font-semibold tracking-tight text-white">{item.value}</p>
                  <p className="mt-2 text-[var(--muted)]">{item.detail}</p>
                  {item.href && (
                    <a href={item.href} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm text-cyan-300 hover:text-cyan-200">
                      View profile <FaExternalLinkAlt aria-hidden="true" className="text-xs" />
                    </a>
                  )}
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
        </div>
      </div>
    </section>
  )
}
