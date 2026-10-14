import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google'
import './globals.css'
import { profile } from '@/content/site'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const grotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-grotesk', display: 'swap' })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains', display: 'swap' })

const title = 'Roshan Raj · A portfolio in four dimensions'
const description =
  'Roshan Raj, B.Tech CSE at IIT Bhilai (2027). A portfolio built as a real 4-dimensional object: a tesseract rotated in R⁴ and projected to 3D, one cubic cell per project. A compiler and bytecode VM in C++, a fault-tolerant load balancer in Go, live 1v1 coding races, and ML for an anemia-screening device.'

export const metadata: Metadata = {
  metadataBase: new URL(profile.siteUrl),
  title,
  description,
  alternates: { canonical: '/' },
  openGraph: { type: 'website', url: '/', siteName: 'Roshan Raj', title, description },
  twitter: { card: 'summary_large_image', title, description },
}

export const viewport: Viewport = {
  themeColor: '#02030a',
  colorScheme: 'dark',
  // The scene is a fixed stage, so stop mobile browsers treating a drag on the
  // canvas as a pinch-zoom on the page.
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${grotesk.variable} ${mono.variable}`} data-reading="off">
      <body>{children}</body>
    </html>
  )
}
