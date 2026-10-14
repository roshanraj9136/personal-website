// Everything the 4D scene says, as a plain document.
//
// This is a server component and it is always in the HTML, not injected when a
// button is pressed. A portfolio whose content only exists once WebGL has
// started is a portfolio that is invisible to crawlers, unreadable by a screen
// reader, and useless to a recruiter on a locked-down laptop. The spectacle is
// the default view; this is the same information with nothing in the way.

import { achievements, cells, education, profile, pullRequests, skills } from '@/content/site'

export default function DocumentView() {
  return (
    <main id="document" className="doc">
      <header className="doc__head">
        <h1>{profile.name}</h1>
        <p className="doc__sub">
          {education.degree}, {education.school} · {education.period}
        </p>
        <ul className="doc__contact">
          <li>
            <a href={`mailto:${profile.email}`}>{profile.email}</a>
          </li>
          <li>
            <a href={profile.github}>GitHub</a>
          </li>
          <li>
            <a href={profile.linkedin}>LinkedIn</a>
          </li>
          <li>
            <a href={profile.leetcode}>LeetCode</a>
          </li>
          <li>
            <a href={profile.resume}>Resume (PDF)</a>
          </li>
        </ul>
      </header>

      {cells.map((cell) => (
        <section key={cell.id} className="doc__section" aria-labelledby={`doc-${cell.id}`}>
          <p className="doc__kicker">{cell.kicker}</p>
          <h2 id={`doc-${cell.id}`}>{cell.title}</h2>
          <p className="doc__tagline">{cell.tagline}</p>
          <p>{cell.body}</p>

          {cell.stats.length > 0 && (
            <dl className="doc__stats">
              {cell.stats.map((stat) => (
                <div key={stat.label}>
                  <dt>{stat.value}</dt>
                  <dd>{stat.label}</dd>
                </div>
              ))}
            </dl>
          )}

          {cell.points.length > 0 && (
            <ul className="doc__points">
              {cell.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          )}

          {cell.id === 'open-source' && (
            <ul className="doc__points">
              {pullRequests.map((pr) => (
                <li key={pr.number}>
                  #{pr.number} · {pr.title} ({pr.type})
                </li>
              ))}
            </ul>
          )}

          {cell.tags.length > 0 && (
            <ul className="doc__tags">
              {cell.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          )}

          {cell.links.length > 0 && (
            <ul className="doc__links">
              {cell.links.map((link) => (
                <li key={link.href}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}

      <section className="doc__section" aria-labelledby="doc-stack">
        <h2 id="doc-stack">Technical skills</h2>
        <dl className="doc__skills">
          {skills.map((group) => (
            <div key={group.group}>
              <dt>{group.group}</dt>
              <dd>{group.items.join(', ')}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="doc__section" aria-labelledby="doc-education">
        <h2 id="doc-education">Education</h2>
        <p>
          {education.degree}, {education.school}. {education.period}.
        </p>
        <p className="doc__course">Coursework: {education.coursework.join(', ')}.</p>
      </section>

      <section className="doc__section" aria-labelledby="doc-achievements">
        <h2 id="doc-achievements">Achievements</h2>
        <ul className="doc__points">
          {achievements.map((item) => (
            <li key={item.title}>
              <strong>{item.value}</strong> — {item.title}. {item.detail}
            </li>
          ))}
        </ul>
      </section>

      <footer className="doc__foot">
        <p>
          This page also exists as a four-dimensional scene. If your browser supports WebGL2, press{' '}
          <kbd>R</kbd> or use the button to switch between them.
        </p>
      </footer>
    </main>
  )
}
