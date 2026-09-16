import { FaEnvelope, FaFileAlt, FaGithub, FaLinkedin } from 'react-icons/fa'
import { SiLeetcode } from 'react-icons/si'
import Reveal from '@/components/ui/Reveal'
import { profile } from '@/content/site'

const channels = [
  { label: 'Email', value: profile.email, href: `mailto:${profile.email}`, icon: FaEnvelope },
  { label: 'LinkedIn', value: 'roshan-raj-36a449374', href: profile.linkedin, icon: FaLinkedin },
  { label: 'GitHub', value: 'roshanraj9136', href: profile.github, icon: FaGithub },
  { label: 'LeetCode', value: 'leave_the_past', href: profile.leetcode, icon: SiLeetcode },
]

export default function Contact() {
  return (
    <section id="contact" data-stage={7} aria-labelledby="contact-title" className="relative flex min-h-[100svh] items-center py-28">
      <div className="container-x w-full text-center">
        <Reveal>
          <p className="eyebrow justify-center">
            <span className="text-cyan-300">07</span>
            <span className="eyebrow-rule" aria-hidden="true" />
            Contact
          </p>
          <h2 id="contact-title" className="hero-title mx-auto max-w-4xl text-[clamp(2.6rem,7vw,5.5rem)]">
            Let’s build something <span className="hero-gradient">that runs.</span>
          </h2>
          <p className="lead mx-auto mt-6 max-w-2xl">Open to software engineering roles. The fastest way to reach me is email.</p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <a href={`mailto:${profile.email}`} className="btn-primary">
              <FaEnvelope aria-hidden="true" /> Say hello
            </a>
            <a href={profile.resume} target="_blank" rel="noreferrer" className="btn-ghost">
              <FaFileAlt aria-hidden="true" /> Download resume
            </a>
          </div>
        </Reveal>

        <Reveal delay={0.16}>
          <ul className="mx-auto mt-14 grid max-w-3xl gap-3 sm:grid-cols-2">
            {channels.map(({ label, value, href, icon: Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target={href.startsWith('mailto:') ? undefined : '_blank'}
                  rel="noreferrer"
                  className="contact-row"
                >
                  <Icon aria-hidden="true" className="text-lg" />
                  <span className="text-[var(--muted)]">{label}</span>
                  <span className="ml-auto truncate font-mono text-sm">{value}</span>
                </a>
              </li>
            ))}
          </ul>
        </Reveal>

        <footer className="mt-20 text-sm text-[var(--faint)]">
          <p>© 2026 Roshan Raj · Built with Next.js, React Three Fiber, and custom GLSL shaders.</p>
        </footer>
      </div>
    </section>
  )
}
