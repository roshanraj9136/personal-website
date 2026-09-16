import SceneMount from '@/components/three/SceneMount'
import About from '@/components/sections/About'
import Contact from '@/components/sections/Contact'
import Hero from '@/components/sections/Hero'
import Skills from '@/components/sections/Skills'
import WorkSection from '@/components/sections/WorkSection'
import CompilerDemo from '@/components/sections/demos/CompilerDemo'
import IncidentReport from '@/components/sections/demos/IncidentReport'
import LiveSimulation from '@/components/sections/demos/LiveSimulation'
import PullRequests from '@/components/sections/demos/PullRequests'
import RaceHud from '@/components/sections/demos/RaceHud'
import SignalPipeline from '@/components/sections/demos/SignalPipeline'
import Nav from '@/components/ui/Nav'
import SmoothScroll from '@/components/ui/SmoothScroll'
import StageRail from '@/components/ui/StageRail'
import StageTracker from '@/components/ui/StageTracker'
import { work } from '@/content/site'

const demos: Record<string, React.ReactNode> = {
  nishad: <SignalPipeline />,
  minilang: <CompilerDemo />,
  'load-balancer': (
    <div className="grid gap-4">
      <LiveSimulation />
      <IncidentReport />
    </div>
  ),
  algorace: <RaceHud />,
  'open-source': <PullRequests />,
}

export default function Home() {
  return (
    <>
      <SceneMount />
      <div className="vignette" aria-hidden="true" />
      <SmoothScroll />
      <StageTracker />
      <Nav />
      <StageRail />
      <main className="relative z-10">
        <Hero />
        {work.map((item) => (
          <WorkSection key={item.id} item={item} demo={demos[item.id]} />
        ))}
        <Skills />
        <About />
        <Contact />
      </main>
    </>
  )
}
