import type { CSSProperties, ReactNode } from 'react'
import { FaArrowRight, FaCodeBranch, FaGithub } from 'react-icons/fa'
import Reveal from '@/components/ui/Reveal'
import TiltCard from '@/components/ui/TiltCard'
import type { Work } from '@/content/site'

const linkIcon = { live: FaArrowRight, code: FaGithub, pr: FaCodeBranch }

export default function WorkSection({ item, demo }: { item: Work; demo?: ReactNode }) {
  const column = item.side === 'right' ? 'lg:col-start-2' : 'lg:col-start-1'

  return (
    <section
      id={item.id}
      data-stage={item.stage}
      aria-labelledby={`${item.id}-title`}
      className="pass-through relative flex min-h-[100svh] items-center py-24 lg:py-32"
      style={{ '--accent': item.accent } as CSSProperties}
    >
      <div className="container-x grid w-full lg:grid-cols-2">
        <div className={`${column} panel`}>
          <Reveal>
            <p className="eyebrow">
              <span className="text-[var(--accent)]">{item.layer}</span>
              <span className="eyebrow-rule" aria-hidden="true" />
              {item.kicker}
            </p>
          </Reveal>

          <Reveal delay={0.05}>
            <h2 id={`${item.id}-title`} className="section-title">
              {item.title}
            </h2>
            <p className="tagline">{item.tagline}</p>
            {item.org && <p className="org">{item.org}</p>}
          </Reveal>

          <Reveal delay={0.1}>
            <p className="body mt-5">{item.summary}</p>
          </Reveal>

          {item.metrics.length > 0 && (
            <Reveal delay={0.12}>
              <dl className="mt-7 grid grid-cols-2 gap-3">
                {item.metrics.map((metric) => (
                  <TiltCard key={metric.label} className="metric" max={9}>
                    <dt className="metric-label">{metric.label}</dt>
                    <dd className="metric-value">{metric.value}</dd>
                  </TiltCard>
                ))}
              </dl>
            </Reveal>
          )}

          {item.points.length > 0 && (
            <ul className="points mt-7">
              {item.points.map((point, i) => (
                <Reveal as="li" key={point} delay={0.04 * i}>
                  {point}
                </Reveal>
              ))}
            </ul>
          )}

          {demo && (
            <Reveal delay={0.08} className="mt-8">
              {demo}
            </Reveal>
          )}

          <Reveal delay={0.1}>
            <ul className="mt-7 flex flex-wrap gap-2" aria-label="Technologies">
              {item.tags.map((tag) => (
                <li key={tag} className="chip">
                  {tag}
                </li>
              ))}
            </ul>
            <div className="mt-7 flex flex-wrap gap-3">
              {item.links.map((link, i) => {
                const Icon = linkIcon[link.kind]
                return (
                  <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className={i === 0 ? 'btn-primary' : 'btn-ghost'}>
                    <Icon aria-hidden="true" /> {link.label}
                  </a>
                )
              })}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
