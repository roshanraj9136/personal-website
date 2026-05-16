import HeroSection from '@/components/hero/HeroSection'
import Navbar from '@/components/shared/Navbar'
import CustomCursor from '@/components/shared/CustomCursor'
import Capabilities from '@/components/capabilities/Capabilities'
import ExperienceSection from '@/components/experience/ExperienceSection'
import EducationSection from '@/components/experience/EducationSection'
import ProjectsStack from '@/components/projects/ProjectsStack'
import Methodology from '@/components/methodology/Methodology'
import ContactSection from '@/components/contact/ContactSection'

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#0a0a0f] text-slate-200 overflow-x-hidden">
      <CustomCursor />
      <Navbar />
      <HeroSection />
      <Capabilities />
      <Methodology />
      <ExperienceSection />
      <EducationSection />
      <ProjectsStack />
      <ContactSection />
    </main>
  )
}
