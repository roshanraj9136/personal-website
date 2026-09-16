import { FaArrowDown, FaEnvelope, FaFileAlt, FaGithub, FaLinkedin } from 'react-icons/fa'
import { SiLeetcode } from 'react-icons/si'
import Reveal from '@/components/ui/Reveal'
import TiltCard from '@/components/ui/TiltCard'
import { heroStats, profile } from '@/content/site'

export default function Hero() {
  return (
    <section id="top" data-stage={0} className="pass-through relative flex min-h-[100svh] items-end pb-20 pt-32 lg:items-center lg:pb-0">
      <div className="container-x grid w-full lg:grid-cols-2">
        <div className="hero-copy">
          <Reveal>
            <p className="eyebrow">
              <span className="live-dot" aria-hidden="true" /> IIT Bhilai · B.Tech CSE 2027 · Scroll to climb
            </p>
          </Reveal>

          <Reveal delay={0.06}>
            <h1 className="hero-title">
              Roshan
              <br />
              <span className="hero-gradient">Raj</span>
            </h1>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="lead mt-6 max-w-xl">
              I build systems end to end: a compiler and bytecode VM in C++, a fault-tolerant load balancer in Go, a real-time coding
              race platform, and machine learning for a medical screening device.
            </p>
          </Reveal>

          <Reveal delay={0.18}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#nishad" className="btn-primary">
                Explore my work <FaArrowDown aria-hidden="true" />
              </a>
              <a href={profile.resume} target="_blank" rel="noreferrer" className="btn-ghost">
                <FaFileAlt aria-hidden="true" /> Resume
              </a>
              <div className="ml-1 flex items-center gap-1">
                <a href={profile.github} target="_blank" rel="noreferrer" className="icon-link" aria-label="GitHub">
                  <FaGithub />
                </a>
                <a href={profile.linkedin} target="_blank" rel="noreferrer" className="icon-link" aria-label="LinkedIn">
                  <FaLinkedin />
                </a>
                <a href={profile.leetcode} target="_blank" rel="noreferrer" className="icon-link" aria-label="LeetCode">
                  <SiLeetcode />
                </a>
                <a href={`mailto:${profile.email}`} className="icon-link" aria-label="Email">
                  <FaEnvelope />
                </a>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.24}>
            <dl className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:max-w-xl">
              {heroStats.map((stat) => (
                <TiltCard key={stat.label} className="stat-card" max={10}>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd>
                    <span className="stat-value">{stat.value}</span>
                    <span className="stat-label">{stat.label}</span>
                  </dd>
                </TiltCard>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>

      <a href="#nishad" className="scroll-cue" aria-label="Scroll to projects">
        <span>scroll</span>
        <span className="scroll-line" aria-hidden="true" />
      </a>
    </section>
  )
}
