import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import { AuthProvider } from '@/contexts/AuthContext'
import { FavoritesProvider } from '@/contexts/FavoritesContext'
import { AuthButton } from '@/components/auth/AuthButton'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Priceit Barcelona',
  description: 'Compare clubs, bars and restaurants in Barcelona. Plan your perfect night out.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-zinc-950">
        <AuthProvider>
          <FavoritesProvider>
          {/* Nav — black/gold */}
          <nav className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur-md border-b border-pink-500/10">
            <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <span className="font-black text-pink-400 text-xl tracking-tight">Priceit</span>
                <span className="text-xs text-zinc-600 font-medium">Barcelona</span>
              </Link>
              <div className="flex items-center gap-1 sm:gap-2">
                <Link href="/" className="px-3 py-1.5 text-sm font-medium text-zinc-400 hover:text-pink-400 rounded-lg transition-colors">
                  🎉 Party
                </Link>
                <Link href="/search" className="px-3 py-1.5 text-sm font-medium text-zinc-400 hover:text-pink-400 rounded-lg transition-colors">
                  🔍 Search
                </Link>
                <Link href="/social" className="px-3 py-1.5 text-sm font-medium text-zinc-400 hover:text-pink-400 rounded-lg transition-colors">
                  👥 Social
                </Link>
                <Link href="/night-planner" className="px-3 py-1.5 text-sm font-bold text-white bg-pink-500 hover:bg-pink-400 rounded-xl transition-colors">
                  🗺️ Plan
                </Link>
                <AuthButton />
              </div>
            </div>
          </nav>

          {children}

          </FavoritesProvider>
          <footer className="border-t border-zinc-800 bg-zinc-950 mt-auto">
            <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-600">
              <span className="text-pink-400/60 font-bold">Priceit Barcelona</span>
              <span>Prices auto-updated via Ticketmaster · Fever · Resident Advisor</span>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  )
}
