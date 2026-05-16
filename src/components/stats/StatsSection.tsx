'use client'

import SectionWrapper from '../shared/SectionWrapper'
import CounterItem from './CounterItem'

export default function StatsSection() {
  return (
    <SectionWrapper id="stats" className="py-16">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <CounterItem title="LeetCode Problems" value={500} suffix="+" />
        <CounterItem title="Projects Shipped" value={6} suffix="+" />
        <CounterItem title="Lines of Code" value={50} suffix="k+" />
        <CounterItem title="Codeforces Rating" value={1400} />
      </div>
    </SectionWrapper>
  )
}
