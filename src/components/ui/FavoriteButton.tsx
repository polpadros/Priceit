'use client'
import { Heart } from 'lucide-react'
import { useFavorites } from '@/contexts/FavoritesContext'
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

export function FavoriteButton({ venueId, size = 'md' }: { venueId: string; size?: 'sm' | 'md' }) {
  const { isFavorite, toggle } = useFavorites()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const fav = isFavorite(venueId)

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!user) return
    setLoading(true)
    await toggle(venueId)
    setLoading(false)
  }

  if (!user) return null

  const sz = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
  const btn = size === 'sm'
    ? 'p-1.5 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60'
    : 'p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700'

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`${btn} transition-colors ${loading ? 'opacity-50' : ''}`}
      title={fav ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart className={`${sz} transition-colors ${fav ? 'fill-pink-500 text-pink-500' : 'text-zinc-400'}`} />
    </button>
  )
}
