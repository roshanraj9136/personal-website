import Reveal from '@/components/ui/Reveal'
import TiltCard from '@/components/ui/TiltCard'
import { skills } from '@/content/site'

export default function Skills() {
  return (
    <section id="skills" data-stage={6} aria-labelledby="skills-title" className="pass-through relative py-28 lg:py-36">
      <div className="container-x">
        <div className="lg:w-1/2 lg:pr-4">
        <Reveal className="hero-copy">
          <p className="eyebrow">
            <span className="text-cyan-300">L6 · Skills</span>
            <span className="eyebrow-rule" aria-hidden="true" />
            Toolbox
          </p>
          <h2 id="skills-title" className="section-title">
            Skills
          </h2>
          <p className="body mt-4 max-w-2xl">Grouped by area, with the projects where I used them most.</p>
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {skills.map((group, i) => (
            <Reveal key={group.group} delay={0.05 * i}>
              <TiltCard className="skill-card h-full" max={6}>
                <h3 className="skill-title">{group.group}</h3>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {group.items.map((skill) => (
                    <li key={skill} className="chip">
                      {skill}
                    </li>
                  ))}
                </ul>
                <p className="skill-proof">Most used in: {group.usedIn}</p>
              </TiltCard>
            </Reveal>
          ))}
        </div>
        </div>
      </div>
    </section>
  )
}
