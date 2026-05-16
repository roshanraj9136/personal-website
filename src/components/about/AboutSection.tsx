'use client'

import SectionWrapper from '../shared/SectionWrapper'
import TechStack from './TechStack'

export default function AboutSection() {
  return (
    <SectionWrapper id="about">
      <h2 className="text-3xl md:text-5xl font-bold mb-12 flex items-center">
        <span className="text-indigo-500 mr-4 font-mono text-2xl md:text-4xl">01.</span> About Me
        <div className="h-px bg-white/10 flex-grow ml-8 max-w-sm"></div>
      </h2>

      <div className="grid lg:grid-cols-2 gap-12 items-start">
        <div className="p-8 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md shadow-xl text-slate-300 leading-relaxed space-y-6 text-lg">
          <p>
            Hello! My name is Roshan and I enjoy creating things that live on the internet. 
            My interest in development started when I was exploring basic scripting, which 
            quickly evolved into building complex full-stack applications.
          </p>
          <p>
            Currently, I am pursuing my B.Tech in Computer Science and Engineering at 
            <span className="text-indigo-400 font-semibold"> IIT Bhilai</span>. My core focus has been 
            bridging the gap between advanced algorithms, machine learning workflows, and robust web applications.
          </p>
          <p>
            Beyond traditional web development, I am heavily involved in competitive programming,
            having solved over 500+ data structure and algorithm challenges to constantly sharpen my problem-solving skills.
          </p>
        </div>

        <div>
          <h3 className="text-2xl font-bold mb-6 text-slate-200">Tech Arsenal</h3>
          <TechStack />
        </div>
      </div>
    </SectionWrapper>
  )
}
