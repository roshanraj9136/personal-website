'use client'

import SectionWrapper from '../shared/SectionWrapper'
import ProjectCard from './ProjectCard'
import { projects } from '@/data/projects'

export default function ProjectsSection() {
  return (
    <SectionWrapper id="projects">
      <h2 className="text-3xl md:text-5xl font-bold mb-16 flex items-center">
        <span className="text-indigo-500 mr-4 font-mono text-2xl md:text-4xl">02.</span> Featured Projects
        <div className="h-px bg-white/10 flex-grow ml-8 max-w-sm"></div>
      </h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project, idx) => (
          <ProjectCard key={idx} {...project} />
        ))}
      </div>
    </SectionWrapper>
  )
}
