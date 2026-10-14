// Every fact on the site lives here. Numbers match the resume and were checked
// against the project repositories; keep them in sync if either changes.

export const profile = {
  name: 'Roshan Raj',
  email: 'roshanr@iitbhilai.ac.in',
  github: 'https://github.com/roshanraj9136',
  linkedin: 'https://www.linkedin.com/in/roshan-raj-36a449374',
  leetcode: 'https://leetcode.com/u/leave_the_past/',
  resume: '/roshan-resume.pdf',
  siteUrl: 'https://personal-website-ashy-ten-66.vercel.app',
}

export type Metric = { value: string; label: string }
export type LinkItem = { label: string; href: string; kind: 'live' | 'code' | 'pr' }

export type Work = {
  id: string
  /** Short name, used for the rail and the floating 4D labels. */
  navLabel: string
  kicker: string
  title: string
  tagline: string
  org?: string
  summary: string
  metrics: Metric[]
  points: string[]
  tags: string[]
  links: LinkItem[]
  accent: string
}

export const work: Work[] = [
  {
    id: 'nishad',
    navLabel: 'NISHAD',
    kicker: 'Summer Research Intern · Jun – Aug 2026',
    title: 'NISHAD',
    tagline: 'Screening for anemia from a fingertip video',
    org: 'S3 Summer Labs, IIT Bhilai · in collaboration with AIIMS Raipur',
    summary:
      'A low-cost, non-invasive device that estimates hemoglobin from fingertip videos lit by three LED wavelengths. I built its machine learning and embedded software.',
    metrics: [
      { value: '481', label: 'patients in the dataset' },
      { value: '91.4%', label: 'anemia sensitivity' },
      { value: '2.09 g/dL', label: 'mean absolute error' },
      { value: '3', label: 'LED wavelengths' },
    ],
    points: [
      'Programmed the Raspberry Pi device in Python: GPIO/PWM LED sequencing during 30 fps video capture, and output to an I2C LCD.',
      'On-device PyTorch inference with a 3-branch residual network, one branch per wavelength.',
      'Trained models with patient-grouped cross-validation, so no patient appears in both training and validation folds.',
      'Best model: a Random Forest + LightGBM + XGBoost ensemble on 1,060 features (820 color-histogram and 240 PPG pulse features).',
    ],
    tags: ['Python', 'PyTorch', 'scikit-learn', 'XGBoost', 'LightGBM', 'OpenCV', 'Raspberry Pi', 'Signal Processing'],
    links: [{ label: 'Device code', href: 'https://github.com/roshanraj9136/hb-meter', kind: 'code' }],
    accent: '#ff8a1f',
  },
  {
    id: 'minilang',
    navLabel: 'MiniLang',
    kicker: 'Compilers · Virtual machines · WebAssembly',
    title: 'MiniLang',
    tagline: 'A compiler, bytecode VM, and browser IDE, built from scratch',
    summary:
      'A statically typed, C++-style language with functions, recursion, pointers, and vector/queue/stack containers. It compiles to bytecode for my own stack VM, which also runs in the browser through WebAssembly.',
    metrics: [
      { value: '7,000+', label: 'lines of C++17' },
      { value: '60', label: 'VM opcodes' },
      { value: '13', label: 'precedence levels' },
      { value: '14', label: 'end-to-end tests in CI' },
    ],
    points: [
      'Hand-written lexer and recursive-descent parser with panic-mode error recovery.',
      'Semantic analyzer with scoped symbol tables and type checking.',
      'AST optimizer: constant folding, constant propagation, and dead-code elimination.',
      'Stack VM with call frames, compiled to WebAssembly for a Monaco-based IDE with a step-through debugger for bytecode, stack, and locals.',
    ],
    tags: ['C++17', 'WebAssembly', 'Emscripten', 'JavaScript', 'Monaco', 'GitHub Actions'],
    links: [
      { label: 'Open the IDE', href: 'https://minilang-one.vercel.app/', kind: 'live' },
      { label: 'Source', href: 'https://github.com/roshanraj9136/minilang', kind: 'code' },
    ],
    accent: '#818cf8',
  },
  {
    id: 'load-balancer',
    navLabel: 'Load Balancer',
    kicker: 'Distributed Systems Lab · IIT Bhilai',
    title: 'Fault-Tolerant Load Balancer',
    tagline: 'Zero errors at 2,500 concurrent users on 1 CPU and 512 MiB',
    summary:
      'A reverse-proxy load balancer in Go, in front of three replicated Go backends and PostgreSQL, running on four containers each capped at 1 CPU and 512 MiB.',
    metrics: [
      { value: '0', label: 'errors over 60,000 requests' },
      { value: '2,500', label: 'concurrent users' },
      { value: '18% → 0%', label: 'error rate, before → after' },
      { value: '364 MB', label: 'peak LB memory of 512 MB' },
    ],
    points: [
      'Least-connections routing: each request goes to the backend with the fewest in-flight requests, and equal loads take turns.',
      'Active health checks: a backend is marked down after 3 failed probes and back up on the next success.',
      'If a backend errors or returns a 5xx before any bytes reach the client, the request is retried on a backend it has not tried yet.',
      'Backends batch writes to PostgreSQL and pull peer updates every 300 ms using sequence numbers.',
    ],
    tags: ['Go', 'PostgreSQL', 'Docker', 'Linux', 'cgroups', 'Concurrency'],
    links: [{ label: 'Source & write-up', href: 'https://github.com/roshanraj9136/fault-tolerant-load-balancer', kind: 'code' }],
    accent: '#34d399',
  },
  {
    id: 'algorace',
    navLabel: 'AlgoRace',
    kicker: 'Full-stack · Real-time',
    title: 'AlgoRace',
    tagline: 'Live 1v1 coding races',
    summary:
      'Two players are paired by ELO rating, get the same problem, and watch each other’s progress live. The first to pass every test case wins.',
    metrics: [
      { value: '102', label: 'problems' },
      { value: '1,020', label: 'test cases' },
      { value: '30', label: 'REST endpoints' },
      { value: '10 s', label: 'reconnect grace' },
    ],
    points: [
      'Live opponent progress over Socket.IO rooms.',
      'REST API defined in OpenAPI, with generated type-safe React Query hooks and Zod validators.',
      'Grading runs generated C++ and Java test harnesses on the Wandbox API.',
      'Wins and ELO changes settle in one database transaction that allows only one winner; JWT, bcrypt, and rate limiting protect the API.',
    ],
    tags: ['React', 'TypeScript', 'Express', 'PostgreSQL', 'Drizzle ORM', 'Socket.IO', 'OpenAPI'],
    links: [
      { label: 'Play it live', href: 'https://algorace-omega.vercel.app/', kind: 'live' },
      { label: 'Source', href: 'https://github.com/roshanraj9136/Algorace', kind: 'code' },
    ],
    accent: '#fb923c',
  },
  {
    id: 'open-source',
    navLabel: 'Open Source',
    kicker: 'Open Source Contributor · Jun 2026',
    title: 'RateMyCourse',
    tagline: '5 merged security and privacy fixes',
    org: 'OpenLake, IIT Bhilai · Next.js, TypeScript, Supabase',
    summary:
      'OpenLake’s course-review platform for IIT Bhilai students. I found security and privacy problems and fixed them.',
    metrics: [],
    points: [],
    tags: ['Next.js', 'TypeScript', 'Supabase', 'Web Security'],
    links: [
      {
        label: 'My merged PRs',
        href: 'https://github.com/OpenLake/RateMyCourse/pulls?q=is%3Apr+author%3Aroshanraj9136+is%3Amerged',
        kind: 'pr',
      },
    ],
    accent: '#a78bfa',
  },
]

export const pullRequests = [
  { number: 74, title: 'Prevented an open redirect in the /auth/confirm callback', type: 'security' },
  { number: 73, title: 'Sanitized review comments before writing them to the database', type: 'privacy' },
  { number: 72, title: 'Moved PBKDF2 anonymization server-side and patched dependency CVEs', type: 'security' },
  { number: 71, title: 'Removed debug session logging from the browser Supabase client', type: 'privacy' },
  { number: 70, title: 'Redacted URLs in anonymized reviews with a placeholder', type: 'privacy' },
]

export const skills = [
  { group: 'Languages', items: ['C++', 'Python', 'Go', 'TypeScript', 'JavaScript', 'SQL', 'Bash', 'C'], usedIn: 'MiniLang · NISHAD · load balancer · AlgoRace' },
  { group: 'Core CS', items: ['Data Structures & Algorithms', 'OOP', 'Distributed Systems', 'System Design', 'Concurrency', 'Networking'], usedIn: 'Load balancer · MiniLang · LeetCode' },
  { group: 'Web & Backend', items: ['React', 'Next.js', 'Node.js', 'Express.js', 'REST APIs', 'WebSockets (Socket.IO)', 'TanStack Query', 'Tailwind CSS'], usedIn: 'AlgoRace · RateMyCourse · this site' },
  { group: 'Databases', items: ['PostgreSQL', 'MongoDB', 'Supabase', 'Drizzle ORM'], usedIn: 'AlgoRace · load balancer · RateMyCourse' },
  { group: 'Machine Learning', items: ['PyTorch', 'scikit-learn', 'XGBoost', 'LightGBM', 'OpenCV', 'NumPy', 'Pandas', 'Signal Processing'], usedIn: 'NISHAD' },
  { group: 'Systems & Tools', items: ['Linux', 'Docker', 'Git', 'GitHub Actions', 'WebAssembly (Emscripten)', 'Raspberry Pi', 'Vercel', 'Render'], usedIn: 'every project here' },
]

export const education = {
  school: 'Indian Institute of Technology (IIT) Bhilai',
  degree: 'B.Tech in Computer Science and Engineering',
  period: 'Expected May 2027',
  coursework: [
    'Data Structures & Algorithms',
    'Operating Systems',
    'Computer Networks',
    'Database Management Systems',
    'Machine Learning',
    'Probability & Statistics',
    'Linear Algebra',
    'Discrete Mathematics',
  ],
}

export const achievements = [
  {
    title: 'LeetCode',
    value: '350+',
    detail: 'problems solved, including 200+ Medium and 20+ Hard, across dynamic programming, binary search, trees, and graphs.',
    href: 'https://leetcode.com/u/leave_the_past/',
  },
  {
    title: 'Ramanujan Mathematics Olympiad 2023',
    value: '2nd',
    detail: 'rank in Patna district in the Bihar state-level olympiad, among 1,000+ participants.',
  },
]

// --- the eight cells -------------------------------------------------------
// A tesseract is bounded by exactly eight cubes. The site has exactly eight
// things to say, so each one gets a cell and navigating is a 4D rotation.

export type Cell = {
  id: string
  /** Short name for the rail and the floating 4D labels, where the full title
   *  would overlap its neighbours. */
  label: string
  kicker: string
  title: string
  tagline: string
  body: string
  accent: string
  stats: Metric[]
  points: string[]
  tags: string[]
  links: LinkItem[]
}

const byId = (id: string) => work.find((item) => item.id === id)!

const fromWork = (id: string): Cell => {
  const item = byId(id)
  return {
    id: item.id,
    label: item.navLabel,
    kicker: item.org ? `${item.kicker} · ${item.org}` : item.kicker,
    title: item.title,
    tagline: item.tagline,
    body: item.summary,
    accent: item.accent,
    stats: item.metrics,
    points: item.points,
    tags: item.tags,
    links: item.links,
  }
}

export const cells: Cell[] = [
  {
    id: 'enter',
    label: 'Enter',
    kicker: 'Roshan Raj · B.Tech CSE, IIT Bhilai · expected May 2027',
    title: 'A portfolio in four dimensions',
    tagline: 'Eight cells, eight stories',
    body:
      'Everything here is one object in R⁴. Points are rotated in four dimensions and projected down to three before your screen flattens them to two, and the fourth coordinate is spent on thickness, colour and glow so you can actually see it. A tesseract has exactly eight cubic cells; there are exactly eight things worth telling you. Turn the hypercube to read them.',
    accent: '#67e8f9',
    stats: [
      { value: '16', label: 'vertices' },
      { value: '32', label: 'edges' },
      { value: '8', label: 'cubic cells' },
      { value: '6', label: 'planes of rotation' },
    ],
    points: [
      'Rotation in R⁴ happens in a plane, not about an axis, and there are six coordinate planes to choose from.',
      'A double rotation turns two completely orthogonal planes at once, which is something no 3D object can do.',
      'The glowing core is a quaternion Julia set: scrolling re-cuts the 3-space slice, so its surface changes topology.',
    ],
    tags: ['WebGL', 'GLSL', 'React Three Fiber', 'Linear algebra'],
    links: [{ label: 'Source for this site', href: 'https://github.com/roshanraj9136/personal-website', kind: 'code' }],
  },
  fromWork('nishad'),
  fromWork('minilang'),
  fromWork('load-balancer'),
  fromWork('algorace'),
  fromWork('open-source'),
  {
    id: 'skills',
    label: 'Skills',
    kicker: 'What I reach for',
    title: 'From GPIO pins to bytecode to load balancers',
    tagline: 'Chosen per problem, not per habit',
    body:
      'PyTorch on a Raspberry Pi when the model has to run on the device. Hand-written C++ when I want to own the whole pipeline from lexer to VM. Go when the thing has to stay up under load. The through-line is wanting to know how the layer below actually works.',
    accent: '#38bdf8',
    stats: [
      { value: '350+', label: 'LeetCode problems solved' },
      { value: '7,000+', label: 'lines of C++17 in MiniLang' },
      { value: '60', label: 'opcodes in my bytecode VM' },
      { value: '2nd', label: 'district, Ramanujan olympiad' },
    ],
    points: skills.map((group) => `${group.group}: ${group.items.join(', ')}.`),
    tags: skills.flatMap((group) => group.items).slice(0, 14),
    links: [{ label: 'LeetCode', href: profile.leetcode, kind: 'live' }],
  },
  {
    id: 'contact',
    label: 'Contact',
    kicker: 'Open to internships and new-grad roles from May 2027',
    title: 'Let us build something',
    tagline: 'Email is the fastest way to reach me',
    body:
      'I am most useful on systems that have to hold up under load: compilers, networked services, anything where the measurement matters as much as the feature. If that is what you are building, I would like to hear about it.',
    accent: '#f472b6',
    stats: [
      { value: 'IIT Bhilai', label: 'B.Tech Computer Science' },
      { value: 'May 2027', label: 'expected graduation' },
    ],
    points: education.coursework.map((course) => course),
    tags: ['Open to internships', 'Open to new-grad roles'],
    links: [
      { label: 'Email', href: `mailto:${profile.email}`, kind: 'live' },
      { label: 'GitHub', href: profile.github, kind: 'code' },
      { label: 'LinkedIn', href: profile.linkedin, kind: 'live' },
      { label: 'Resume', href: profile.resume, kind: 'live' },
    ],
  },
]
