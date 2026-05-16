import type { Metadata } from 'next'
import { Outfit, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' })
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains' })

export const metadata: Metadata = {
  title: 'Roshan Raj | Portfolio',
  description: 'Full-stack developer, machine learning researcher, and competitive programmer portfolio.',
}

import LenisScroll from '@/components/shared/LenisScroll'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${outfit.variable} ${jetbrains.variable}`}>
      <body className="bg-[#0a0a0f] text-[#f1f5f9] font-sans antialiased selection:bg-indigo-500/30">
        <LenisScroll>
          {children}
        </LenisScroll>
      </body>
    </html>
  )
}
