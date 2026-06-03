'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { getSupabase } from '@/lib/supabase'

interface FavoritesContextType {
  favorites: Set<string>
  toggle: (venueId: string) => Promise<void>
  isFavorite: (venueId: string) => boolean
}

const FavoritesContext = createContext<FavoritesContextType>({
  favorites: new Set(),
  toggle: async () => {},
  isFavorite: () => false,
})

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!user) { setFavorites(new Set()); return }
    async function load() {
      try {
        const { data } = await getSupabase()
          .from('favorites')
          .select('venue_id')
          .eq('user_id', user!.id)
        if (data) setFavorites(new Set(data.map((r: any) => r.venue_id)))
      } catch {}
    }
    load()
  }, [user])

  async function toggle(venueId: string) {
    if (!user) return
    const supabase = getSupabase()
    if (favorites.has(venueId)) {
      setFavorites(prev => { const s = new Set(prev); s.delete(venueId); return s })
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('venue_id', venueId)
    } else {
      setFavorites(prev => new Set([...prev, venueId]))
      await supabase.from('favorites').upsert({ user_id: user.id, venue_id: venueId })
    }
  }

  return (
    <FavoritesContext.Provider value={{ favorites, toggle, isFavorite: (id) => favorites.has(id) }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export const useFavorites = () => useContext(FavoritesContext)
