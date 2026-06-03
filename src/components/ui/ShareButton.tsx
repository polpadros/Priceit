'use client'
import { useState } from 'react'
import { Share2, Check, Copy } from 'lucide-react'

export function ShareButton({
  title,
  text,
  url,
  label = 'Share',
  variant = 'default',
}: {
  title: string
  text: string
  url?: string
  label?: string
  variant?: 'default' | 'pink' | 'whatsapp'
}) {
  const [copied, setCopied] = useState(false)
  const shareUrl = url ?? (typeof window !== 'undefined' ? window.location.href : '')

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: shareUrl })
        return
      } catch {}
    }
    // Fallback: copy to clipboard
    await navigator.clipboard.writeText(`${text}\n${shareUrl}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleWhatsApp() {
    const msg = encodeURIComponent(`${text}\n${shareUrl}`)
    window.open(`https://wa.me/?text=${msg}`, '_blank')
  }

  if (variant === 'whatsapp') {
    return (
      <button
        onClick={handleWhatsApp}
        className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors"
      >
        <span>📲</span> WhatsApp
      </button>
    )
  }

  return (
    <button
      onClick={handleShare}
      className={`flex items-center gap-2 font-semibold px-4 py-2 rounded-xl text-sm transition-colors ${
        variant === 'pink'
          ? 'bg-pink-500 hover:bg-pink-400 text-white'
          : 'bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300'
      }`}
    >
      {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
      {copied ? 'Copied!' : label}
    </button>
  )
}
