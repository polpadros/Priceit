import type { Ambient } from '@/types'

const AMBIENT_COLORS: Record<Ambient, string> = {
  pijo: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  indie: 'bg-purple-600 text-white border-purple-500',
  reggaeton: 'bg-green-100 text-green-800 border-green-200',
  electronica: 'bg-blue-100 text-blue-800 border-blue-200',
  techno: 'bg-gray-100 text-gray-800 border-gray-200',
  latin: 'bg-orange-100 text-orange-800 border-orange-200',
  hiphop: 'bg-red-100 text-red-800 border-red-200',
  pop: 'bg-pink-100 text-pink-800 border-pink-200',
  rock: 'bg-zinc-100 text-zinc-800 border-zinc-200',
  casual: 'bg-teal-100 text-teal-800 border-teal-200',
  soul: 'bg-amber-100 text-amber-800 border-amber-200',
  jazz: 'bg-lime-100 text-lime-800 border-lime-200',
  kpop: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200',
  rnb: 'bg-rose-100 text-rose-800 border-rose-200',
  house: 'bg-cyan-100 text-cyan-800 border-cyan-200',
}

export const AMBIENT_LABELS: Record<Ambient, string> = {
  pijo: '💎 Upper-Class',
  indie: '🎸 Indie',
  reggaeton: '🎵 Reggaeton',
  electronica: '⚡ Electronic',
  techno: '🔊 Techno',
  latin: '🌴 Latin',
  hiphop: '🎤 Hip-Hop',
  pop: '✨ Pop',
  rock: '🤘 Rock',
  casual: '😎 Casual',
  soul: '🎷 Soul',
  jazz: '🎺 Jazz',
  kpop: '🌸 K-Pop',
  rnb: '🎶 R&B',
  house: '🏠 House',
}

export function AmbientBadge({ ambient, size = 'sm' }: { ambient: Ambient; size?: 'sm' | 'md' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 font-medium ${AMBIENT_COLORS[ambient]} ${size === 'md' ? 'text-sm' : 'text-xs'}`}
    >
      {AMBIENT_LABELS[ambient]}
    </span>
  )
}
