import { createStore } from './store'

// A small, visual model of the load balancer in
// github.com/roshanraj9136/fault-tolerant-load-balancer (loadbalancer/main.go):
//  - least-connections: pick the untried backend with the fewest in-flight requests,
//    scanning from a rotating start index so equal loads take turns;
//  - a backend the balancer believes is down is heavily deprioritised, not excluded;
//  - a failed attempt (connection refused) is retried on a backend not yet tried;
//  - health probes mark a backend down after 3 consecutive failures and up again on success.
// Times are stretched so the flow is visible; they are not measurements.

export const BACKENDS = 3
export const CLIENTS = 6

export type Phase =
  | 'inbound' // client -> load balancer
  | 'dispatch' // load balancer -> backend
  | 'refused' // backend refused the connection; travelling back to the balancer
  | 'processing' // backend is handling it (and writing to PostgreSQL)
  | 'response' // backend -> load balancer
  | 'outbound' // load balancer -> client (success)
  | 'error' // load balancer -> client (502: every backend failed)

export type Request = {
  id: number
  client: number
  phase: Phase
  /** 0..1 progress through the current phase */
  t: number
  duration: number
  backend: number
  tried: number[]
  retried: boolean
}

export type Probe = { backend: number; t: number }

const DURATION: Record<Phase, number> = {
  inbound: 0.9,
  dispatch: 0.8,
  refused: 0.55,
  processing: 0.9,
  response: 0.7,
  outbound: 0.9,
  error: 0.9,
}

export type LbSnapshot = {
  killed: boolean[]
  alive: boolean[]
  inFlight: number[]
  served: number
  retries: number
  failed: number
}

export class LoadBalancerSim {
  requests: Request[] = []
  probes: Probe[] = []
  killed = Array<boolean>(BACKENDS).fill(false)
  alive = Array<boolean>(BACKENDS).fill(true)
  inFlight = Array<number>(BACKENDS).fill(0)
  consecutiveErrors = Array<number>(BACKENDS).fill(0)
  served = 0
  retries = 0
  failed = 0

  private nextId = 1
  private rotation = 0
  private spawnTimer = 0
  private probeTimer = 0
  private lastNow = -1
  private publishTimer = 0

  constructor(private readonly onPublish: (snapshot: LbSnapshot) => void) {}

  toggleBackend(index: number) {
    this.killed[index] = !this.killed[index]
    this.publish()
  }

  /** Advance to wall-clock time `now` (ms). Safe to call from several render loops. */
  advance(now: number) {
    if (this.lastNow < 0) this.lastNow = now
    const dt = Math.min((now - this.lastNow) / 1000, 0.1)
    this.lastNow = now
    if (dt <= 0) return
    this.step(dt)
  }

  step(dt: number) {
    this.spawnTimer -= dt
    if (this.spawnTimer <= 0 && this.requests.length < 60) {
      this.spawn()
      this.spawnTimer = 0.28 + Math.random() * 0.3
    }

    this.probeTimer -= dt
    if (this.probeTimer <= 0) {
      for (let b = 0; b < BACKENDS; b++) this.probes.push({ backend: b, t: 0 })
      this.probeTimer = 1.4
    }

    for (const probe of this.probes) {
      probe.t += dt / 0.45
      if (probe.t >= 1) this.finishProbe(probe.backend)
    }
    this.probes = this.probes.filter((p) => p.t < 1)

    for (const request of this.requests) {
      request.t += dt / request.duration
      if (request.t >= 1) this.advancePhase(request)
    }
    this.requests = this.requests.filter((r) => r.t >= 0)

    this.publishTimer -= dt
    if (this.publishTimer <= 0) {
      this.publish()
      this.publishTimer = 0.2
    }
  }

  private spawn() {
    this.requests.push({
      id: this.nextId++,
      client: Math.floor(Math.random() * CLIENTS),
      phase: 'inbound',
      t: 0,
      duration: DURATION.inbound,
      backend: -1,
      tried: [],
      retried: false,
    })
  }

  // Mirrors selectBackendExcluding in loadbalancer/main.go.
  private select(tried: number[]) {
    this.rotation += 1
    const start = this.rotation
    let best = -1
    let bestLoad = Infinity
    for (let i = 0; i < BACKENDS; i++) {
      const b = (start + i) % BACKENDS
      if (tried.includes(b)) continue
      let load = this.inFlight[b]
      if (!this.alive[b]) load += 1 << 20
      if (best === -1 || load < bestLoad) {
        best = b
        bestLoad = load
      }
    }
    return best
  }

  private enter(request: Request, phase: Phase) {
    request.phase = phase
    request.t = 0
    request.duration = DURATION[phase] * (phase === 'processing' ? 0.7 + Math.random() * 0.6 : 1)
  }

  private advancePhase(request: Request) {
    switch (request.phase) {
      case 'inbound':
      case 'refused': {
        const backend = this.select(request.tried)
        if (backend === -1) {
          this.enter(request, 'error')
          return
        }
        request.backend = backend
        request.tried.push(backend)
        this.inFlight[backend] += 1
        this.enter(request, 'dispatch')
        return
      }
      case 'dispatch': {
        const b = request.backend
        if (this.killed[b]) {
          // Connection refused before any bytes reached the client: retry elsewhere.
          this.inFlight[b] -= 1
          this.consecutiveErrors[b] += 1
          this.retries += 1
          request.retried = true
          this.enter(request, 'refused')
          return
        }
        this.enter(request, 'processing')
        return
      }
      case 'processing':
        this.enter(request, 'response')
        return
      case 'response': {
        const b = request.backend
        this.inFlight[b] -= 1
        this.alive[b] = true
        this.consecutiveErrors[b] = 0
        this.enter(request, 'outbound')
        return
      }
      case 'outbound':
        this.served += 1
        request.t = -1
        return
      case 'error':
        this.failed += 1
        request.t = -1
        return
    }
  }

  private finishProbe(b: number) {
    if (this.killed[b]) {
      this.consecutiveErrors[b] += 1
      if (this.consecutiveErrors[b] >= 3) this.alive[b] = false
    } else {
      this.alive[b] = true
      this.consecutiveErrors[b] = 0
    }
  }

  snapshot(): LbSnapshot {
    return {
      killed: [...this.killed],
      alive: [...this.alive],
      inFlight: [...this.inFlight],
      served: this.served,
      retries: this.retries,
      failed: this.failed,
    }
  }

  private publish() {
    this.onPublish(this.snapshot())
  }
}

export const lbStore = createStore<LbSnapshot>({
  killed: [false, false, false],
  alive: [true, true, true],
  inFlight: [0, 0, 0],
  served: 0,
  retries: 0,
  failed: 0,
})

export const lbSim = new LoadBalancerSim((snapshot) => lbStore.set(snapshot))
