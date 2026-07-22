import HeroSection from '@/components/hero/HeroSection'
import Navbar from '@/components/shared/Navbar'
import CustomCursor from '@/components/shared/CustomCursor'
import Capabilities from '@/components/capabilities/Capabilities'
import ExperienceSection from '@/components/experience/ExperienceSection'
import EducationSection from '@/components/experience/EducationSection'
import ProjectsStack from '@/components/projects/ProjectsStack'
import ContactSection from '@/components/contact/ContactSection'

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#040407] text-white overflow-x-hidden selection:bg-cyan-400 selection:text-black">
      <CustomCursor />
      <Navbar />
      <HeroSection />
      <Capabilities />
      <ExperienceSection />
      <ProjectsStack />
      <EducationSection />
      <ContactSection />
    </main>
  )
}
