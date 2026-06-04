'use client'
import { useState, useRef } from 'react'
import { Camera, X, Loader2, Upload, MapPin } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useSocial } from '@/contexts/SocialContext'
import { getSupabase } from '@/lib/supabase'
import { mockVenues } from '@/lib/mock-data'

export function FeedUpload({ onUploaded }: { onUploaded?: () => void }) {
  const { user } = useAuth()
  const { loadFeed } = useSocial()
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [caption, setCaption] = useState('')
  const [venueId, setVenueId] = useState('')
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const clubs = mockVenues.filter(v => v.type === 'discoteca' || v.type === 'bar' || v.type === 'previa')

  function handleFile(f: File) {
    if (!f.type.startsWith('image/')) return
    if (f.size > 8 * 1024 * 1024) return
    setFile(f); setPreview(URL.createObjectURL(f))
  }

  async function handleUpload() {
    if (!file || !user) return
    setUploading(true)
    try {
      const supabase = getSupabase()
      const ext = file.name.split('.').pop()
      const path = `feed/${user.id}/${Date.now()}.${ext}`
      await supabase.storage.from('venue-photos').upload(path, file, { contentType: file.type })
      const { data: { publicUrl } } = supabase.storage.from('venue-photos').getPublicUrl(path)
      await supabase.from('feed_photos').insert({
        user_id: user.id, public_url: publicUrl, storage_path: path,
        caption: caption || null, venue_id: venueId || null,
      })
      await loadFeed()
      setOpen(false); setFile(null); setPreview(null); setCaption(''); setVenueId('')
      onUploaded?.()
    } catch {}
    setUploading(false)
  }

  if (!user) return null

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-pink-500 hover:bg-pink-400 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors">
        <Camera className="w-4 h-4" /> Add photo
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-white text-lg">Share your night 🎉</h3>
              <button onClick={() => setOpen(false)} className="text-zinc-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            {preview ? (
              <div className="relative mb-4">
                <img src={preview} className="w-full h-56 object-cover rounded-xl" alt="" />
                <button onClick={() => { setFile(null); setPreview(null) }}
                  className="absolute top-2 right-2 bg-black/60 hover:bg-red-600 text-white rounded-full p-1.5 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button onClick={() => inputRef.current?.click()}
                className="w-full h-44 border-2 border-dashed border-zinc-700 hover:border-pink-500/50 rounded-xl flex flex-col items-center justify-center gap-3 text-zinc-500 hover:text-zinc-300 transition-colors mb-4">
                <Upload className="w-8 h-8" />
                <span className="text-sm">Click to upload (max 8MB)</span>
              </button>
            )}
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />

            <input type="text" placeholder="Add a caption..." value={caption} onChange={e => setCaption(e.target.value)}
              maxLength={150}
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-pink-500/50 placeholder:text-zinc-600 mb-3" />

            <div className="relative mb-4">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <select value={venueId} onChange={e => setVenueId(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-pink-500/50 appearance-none">
                <option value="">Tag a venue (optional)</option>
                {clubs.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>

            <button onClick={handleUpload} disabled={!file || uploading}
              className="w-full bg-pink-500 hover:bg-pink-400 text-white font-bold rounded-xl py-3 transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
              {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
              {uploading ? 'Uploading...' : 'Share to feed'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
