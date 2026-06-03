'use client'
import { useState } from 'react'
import { LogOut, User, Settings } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { LoginModal } from './LoginModal'

export function AuthButton() {
  const { user, signOut } = useAuth()
  const [showLogin, setShowLogin] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  if (user) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-pink-500/30 hover:border-pink-500/60 transition-colors"
        >
          <div className="w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-black" />
          </div>
          <span className="text-sm text-pink-400 font-medium max-w-[120px] truncate">
            {user.email?.split('@')[0]}
          </span>
        </button>

        {showMenu && (
          <div className="absolute right-0 top-full mt-2 bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl p-1 min-w-[160px] z-50">
            <Link href="/profile" onClick={() => setShowMenu(false)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
              <Settings className="w-4 h-4" />
              My profile
            </Link>
            <button
              onClick={async () => { await signOut(); setShowMenu(false) }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setShowLogin(true)}
        className="px-4 py-1.5 text-sm font-bold text-black bg-pink-500 hover:bg-pink-400 rounded-xl transition-colors"
      >
        Sign in
      </button>
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  )
}
