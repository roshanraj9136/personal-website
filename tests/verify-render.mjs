// Loads the site in Chromium and checks the 4D scene genuinely renders and
// genuinely navigates: no shader errors, light in the canvas at every one of
// the eight cells, the rotation advancing, and the text version present in the
// HTML for crawlers and screen readers.
//
//   node tests/verify-render.mjs
//   VERIFY_URL=https://example.vercel.app node tests/verify-render.mjs
//
// Screenshots land in tests/shots for eyeballing.

import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import { spawn, spawnSync } from 'node:child_process'

const PORT = 4321
const REMOTE = process.env.VERIFY_URL
const BASE = REMOTE ?? `http://127.0.0.1:${PORT}`
const SHOTS = 'tests/shots'
const CELLS = 8

/** Kills whatever holds the port.
 *
 *  `next start` runs through a shell, so killing the returned process kills the
 *  npx wrapper and leaves the real server alive. The orphan keeps the port,
 *  answers the next run's health check instantly, and serves a .next directory
 *  the next build has already replaced, which looks like blanket 500s. */
function freePort() {
  spawnSync(
    'cmd',
    ['/c', `for /f "tokens=5" %a in ('netstat -ano ^| findstr LISTENING ^| findstr :${PORT}') do taskkill /F /PID %a`],
    { stdio: 'ignore' },
  )
}

function waitForServer(url, timeoutMs = 90000) {
  const started = Date.now()
  return new Promise((resolve, reject) => {
    const attempt = () => {
      fetch(url)
        .then((r) => (r.status < 500 ? resolve() : Promise.reject(new Error(`status ${r.status}`))))
        .catch(() => {
          if (Date.now() - started > timeoutMs) reject(new Error('server did not start cleanly'))
          else setTimeout(attempt, 500)
        })
    }
    attempt()
  })
}

/** Direct evidence that a page drew: read the canvas back and measure it.
 *  Retries, because the first readback after a change can land before the
 *  compositor has presented a frame. Needs preserveDrawingBuffer, which the
 *  scene enables under ?debug. */
async function canvasStats(target, attempts = 25) {
  let last = null
  for (let i = 0; i < attempts; i++) {
    last = await target.evaluate(() => {
      const canvas = document.querySelector('.stage__canvas canvas')
      if (!canvas) return null
      const flat = document.createElement('canvas')
      flat.width = 400
      flat.height = 250
      const ctx = flat.getContext('2d')
      ctx.drawImage(canvas, 0, 0, flat.width, flat.height)
      const { data } = ctx.getImageData(0, 0, flat.width, flat.height)
      let sum = 0
      let lit = 0
      let max = 0
      for (let p = 0; p < data.length; p += 4) {
        const v = (data[p] + data[p + 1] + data[p + 2]) / 3
        sum += v
        if (v > max) max = v
        if (v > 20) lit++
      }
      const count = data.length / 4
      return { mean: +(sum / count).toFixed(2), max, lit: +((lit / count) * 100).toFixed(1) }
    })
    if (last && last.max > 40 && last.lit > 0.5) return last
    await target.waitForTimeout(300)
  }
  return last
}

const failures = []
const notes = []

function check(label, ok, detail = '') {
  const line = `${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`
  console.log(line)
  if (!ok) failures.push(line)
}

await mkdir(SHOTS, { recursive: true })

let server = null
if (REMOTE) {
  console.log(`verifying deployed site: ${REMOTE}\n`)
} else {
  freePort()
  console.log('starting production server...')
  server = spawn('npx', ['next', 'start', '-p', String(PORT)], { cwd: process.cwd(), shell: true, stdio: 'ignore' })
}

try {
  await waitForServer(BASE)
  if (!REMOTE) console.log('server up\n')

  const browser = await chromium.launch({
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
  })
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

  const consoleErrors = []
  const pageErrors = []
  const badResponses = []
  page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()))
  page.on('pageerror', (e) => pageErrors.push(String(e)))
  page.on('response', (r) => r.status() >= 400 && badResponses.push(`${r.status()} ${r.url()}`))

  // --- the text version must be in the HTML, before any JS runs ---------
  const rawHtml = await (await fetch(`${BASE}/`)).text()
  check('server HTML contains the full text version', rawHtml.includes('id="document"'))
  check(
    'every project is in the server HTML, so crawlers see it',
    ['NISHAD', 'MiniLang', 'Load Balancer', 'AlgoRace', 'RateMyCourse'].every((name) => rawHtml.includes(name)),
    'all 5 projects',
  )
  check('contact details are in the server HTML', rawHtml.includes('roshanr@iitbhilai.ac.in'))

  await page.goto(`${BASE}/?debug`, { waitUntil: 'load' })
  await page.waitForTimeout(3000)

  check('the 4D stage is present', await page.evaluate(() => Boolean(document.querySelector('.stage'))))
  check('the canvas mounted', await page.evaluate(() => Boolean(document.querySelector('.stage__canvas canvas'))))
  check(
    'the page itself does not scroll in 4D mode',
    await page.evaluate(() => document.documentElement.dataset.reading === 'off' && getComputedStyle(document.body).overflow === 'hidden'),
  )

  // --- walk the eight cells --------------------------------------------
  const samples = []
  for (let cell = 0; cell < CELLS; cell++) {
    await page.evaluate((c) => window.__hyper.goTo(c), cell)
    await page
      .waitForFunction(
        (expected) => {
          const state = window.__hyper?.state
          return state && Math.abs(state.current - expected) < 0.08
        },
        cell,
        { timeout: 20000 },
      )
      .catch(() => notes.push(`cell ${cell} did not converge in 20s`))

    const probe = await page.evaluate(() => window.__hyper?.state ?? null)
    const pixels = await canvasStats(page)
    samples.push({ cell, probe, pixels })
    await page.screenshot({ path: `${SHOTS}/cell-${cell}.png` })
  }

  check(
    'every cell becomes the active cell in turn',
    JSON.stringify(samples.map((s) => s.probe?.cell ?? -1)) === JSON.stringify([0, 1, 2, 3, 4, 5, 6, 7]),
    `cells ${samples.map((s) => s.probe?.cell ?? -1).join(',')}`,
  )
  check(
    'shader programs compiled',
    Math.max(...samples.map((s) => s.probe?.programs ?? 0)) > 0 ||
      (await page.evaluate(() => window.__hyper?.programs ?? 0)) > 0,
    `${await page.evaluate(() => window.__hyper?.programs ?? 0)} programs`,
  )
  check(
    'the canvas contains the scene at every cell',
    samples.every((s) => s.pixels && s.pixels.max > 40 && s.pixels.lit > 0.5),
    samples.map((s) => (s.pixels ? `${s.pixels.lit}%` : 'null')).join(' '),
  )
  check(
    'brightness stays in range, not blown out',
    samples.every((s) => s.pixels && s.pixels.mean > 0.5 && s.pixels.mean < 130),
    samples.map((s) => (s.pixels ? s.pixels.mean.toFixed(1) : 'null')).join(' '),
  )
  const accents = samples.map((s) => (s.probe?.accent ?? []).join(','))
  check('accent colour follows the active project', new Set(accents).size >= 6, `${new Set(accents).size} distinct of 8`)
  notes.push(`fps under software GL: ${samples.map((s) => s.probe?.fps ?? 0).join(',')}`)

  // --- the rotation readout --------------------------------------------
  const readout = await page.evaluate(() =>
    Array.from(document.querySelectorAll('[data-plane]')).map((el) => ({
      plane: el.dataset.plane,
      text: el.textContent,
      live: el.dataset.live,
    })),
  )
  const live = readout.filter((r) => r.live === 'on')
  check('the plane readout shows a live angle', live.length > 0, readout.map((r) => `${r.plane}=${r.text}`).join(' '))
  check(
    'navigation happens in the w-planes, so it is motion through the 4th dimension',
    live.length > 0 && live.every((r) => r.plane.includes('w')),
    live.map((r) => r.plane).join(','),
  )

  // --- labels are positioned by the projection -------------------------
  const labels = await page.evaluate(() =>
    Array.from(document.querySelectorAll('.labels__item')).map((el) => ({
      transform: el.style.transform,
      opacity: el.style.opacity,
    })),
  )
  check('all 8 cell labels exist', labels.length === 8, `${labels.length} labels`)
  check(
    'labels are placed from the 4D projection',
    labels.every((l) => l.transform.includes('translate3d')) && labels.some((l) => Number(l.opacity) > 0.4),
    'positioned and visible',
  )

  // --- the rail navigates ----------------------------------------------
  await page.evaluate(() => window.__hyper.goTo(0))
  await page.waitForTimeout(600)
  await page.click('.rail__item:nth-child(1)').catch(() => {})
  const railButtons = await page.evaluate(() => document.querySelectorAll('.rail__item').length)
  check('the rail offers all 8 cells as buttons', railButtons === 8, `${railButtons} buttons`)

  await page.evaluate(() => document.querySelectorAll('.rail__item')[5].click())
  await page.waitForTimeout(2200)
  check(
    'clicking the rail rotates to that cell',
    (await page.evaluate(() => window.__hyper?.state?.cell)) === 5,
    `cell ${await page.evaluate(() => window.__hyper?.state?.cell)}`,
  )

  // --- keyboard --------------------------------------------------------
  await page.evaluate(() => window.__hyper.goTo(0))
  await page.waitForTimeout(500)
  await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(1600)
  check(
    'arrow keys turn the hypercube',
    (await page.evaluate(() => window.__hyper?.state?.cell)) === 1,
    `cell ${await page.evaluate(() => window.__hyper?.state?.cell)}`,
  )
  await page.keyboard.press('4')
  await page.waitForTimeout(2000)
  check(
    'number keys jump to a cell',
    (await page.evaluate(() => window.__hyper?.state?.cell)) === 3,
    `cell ${await page.evaluate(() => window.__hyper?.state?.cell)}`,
  )

  // --- reading mode ----------------------------------------------------
  await page.keyboard.press('r')
  await page.waitForTimeout(700)
  const readingOn = await page.evaluate(() => ({
    flag: document.documentElement.dataset.reading,
    scrolls: getComputedStyle(document.body).overflow !== 'hidden',
    docVisible: document.querySelector('#document').getBoundingClientRect().height > 200,
  }))
  check('pressing R switches to the readable document', readingOn.flag === 'on' && readingOn.docVisible, JSON.stringify(readingOn))
  check('the page scrolls again in reading mode', readingOn.scrolls)
  await page.screenshot({ path: `${SHOTS}/reading.png`, fullPage: false })
  await page.keyboard.press('Escape')
  await page.waitForTimeout(500)
  check(
    'Escape returns to the 4D scene',
    (await page.evaluate(() => document.documentElement.dataset.reading)) === 'off',
  )

  // --- errors ----------------------------------------------------------
  const shaderErrors = consoleErrors.filter((t) => /shader|glsl|webgl|program|compile/i.test(t))
  check('no shader or WebGL errors', shaderErrors.length === 0, shaderErrors.slice(0, 3).join(' | ') || 'clean')
  check('no uncaught page errors', pageErrors.length === 0, pageErrors.slice(0, 3).join(' | ') || 'clean')
  check('every request succeeded', badResponses.length === 0, badResponses.slice(0, 4).join(' | ') || 'clean')
  if (consoleErrors.length) notes.push(`console errors: ${consoleErrors.slice(0, 4).join(' | ')}`)

  // --- reduced motion --------------------------------------------------
  const calm = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
  const calmErrors = []
  calm.on('pageerror', (e) => calmErrors.push(String(e)))
  await calm.goto(`${BASE}/?debug`, { waitUntil: 'load' })
  await calm.waitForTimeout(2600)
  await calm.evaluate(() => window.__hyper.goTo(3))
  await calm.waitForTimeout(1200)
  const calmPixels = await canvasStats(calm)
  check(
    'renders with prefers-reduced-motion',
    Boolean(calmPixels) && calmPixels.max > 40 && calmPixels.lit > 0.5,
    calmPixels ? `lit=${calmPixels.lit}% mean=${calmPixels.mean}` : 'no canvas',
  )
  check(
    'reduced motion jumps straight to the cell, with no drift',
    (await calm.evaluate(() => window.__hyper?.state?.cell)) === 3,
  )
  check('no errors under reduced motion', calmErrors.length === 0, calmErrors.slice(0, 2).join(' | ') || 'clean')
  await calm.screenshot({ path: `${SHOTS}/reduced-motion.png` })

  // --- phone -----------------------------------------------------------
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
  const mobileErrors = []
  mobile.on('pageerror', (e) => mobileErrors.push(String(e)))
  await mobile.goto(`${BASE}/?debug`, { waitUntil: 'load' })
  await mobile.waitForTimeout(2600)
  await mobile.evaluate(() => window.__hyper.goTo(2))
  await mobile.waitForTimeout(1600)
  const mobilePixels = await canvasStats(mobile)
  check(
    'renders on a phone viewport',
    Boolean(mobilePixels) && mobilePixels.max > 40 && mobilePixels.lit > 0.5,
    mobilePixels ? `lit=${mobilePixels.lit}% mean=${mobilePixels.mean}` : 'no canvas',
  )
  check('no errors on mobile', mobileErrors.length === 0, mobileErrors.slice(0, 2).join(' | ') || 'clean')
  await mobile.screenshot({ path: `${SHOTS}/mobile.png` })

  await writeFile(`${SHOTS}/report.json`, JSON.stringify({ samples, readout, labels, consoleErrors, pageErrors, badResponses, notes }, null, 2))
  await browser.close()
} finally {
  if (server) {
    if (server.pid) spawnSync('taskkill', ['/F', '/T', '/PID', String(server.pid)], { stdio: 'ignore' })
    freePort()
  }
}

console.log('\nnotes:')
for (const note of notes) console.log(`  ${note}`)

if (failures.length) {
  console.log(`\n${failures.length} CHECK(S) FAILED`)
  process.exit(1)
}
console.log('\nAll render checks passed.')
