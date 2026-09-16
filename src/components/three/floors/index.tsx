'use client'

import Application from './Application'
import Community from './Community'
import Compiler from './Compiler'
import Hardware from './Hardware'
import Network from './Network'
import SkillsGraph from './SkillsGraph'

export type FloorProps = { hover: boolean; reducedMotion: boolean }

export default function Floors({ hover }: FloorProps) {
  return (
    <>
      <Hardware />
      <Compiler />
      <Network hover={hover} />
      <Application />
      <Community />
      <SkillsGraph hover={hover} />
    </>
  )
}
