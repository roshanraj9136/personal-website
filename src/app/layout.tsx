import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google'
import 'lenis/dist/lenis.css'
import './globals.css'
import { profile } from '@/content/site'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const grotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-grotesk', display: 'swap' })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains', display: 'swap' })

const title = 'Roshan Raj · Systems, Full-Stack & ML'
const description =
  'Roshan Raj, B.Tech CSE at IIT Bhilai (2027). A compiler and bytecode VM in C++, a fault-tolerant load balancer in Go, a real-time coding race platform, and machine learning for an anemia-screening device.'

export const metadata: Metadata = {
  metadataBase: new URL(profile.siteUrl),
  title,
  description,
  alternates: { canonical: '/' },
  openGraph: { type: 'website', url: '/', siteName: 'Roshan Raj', title, description },
  twitter: { card: 'summary_large_image', title, description },
}

export const viewport: Viewport = {
  themeColor: '#04050a',
  colorScheme: 'dark',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${grotesk.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
