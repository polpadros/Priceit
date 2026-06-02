import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Link from 'next/link'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PriceIt Barcelona',
  description: 'Compara preus de discoteques, bars i restaurants de Barcelona. Planifica la teva nit perfecta.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ca" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {/* Nav */}
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-black text-violet-700 text-lg">
              🎉 PriceIt
            </Link>
            <div className="flex items-center gap-1">
              <Link href="/" className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-violet-700 rounded-lg hover:bg-violet-50 transition-colors">
                Locals
              </Link>
              <Link href="/night-planner" className="px-3 py-1.5 text-sm font-bold text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors">
                🗺️ Night Planner
              </Link>
            </div>
          </div>
        </nav>

        {children}

        <footer className="border-t border-gray-100 bg-white mt-auto">
          <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
            <span>© 2026 PriceIt Barcelona</span>
            <span>Preus actualitzats via Ticketmaster · Fever · Resident Advisor</span>
          </div>
        </footer>
      </body>
    </html>
  )
}
