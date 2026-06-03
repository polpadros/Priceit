'use client'
import { useState, useEffect, useRef } from 'react'
import { Camera, Upload, X, Loader2, ImageOff } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getSupabase } from '@/lib/supabase'
import type { VenuePhoto } from '@/types'

const MOCK_PHOTOS: VenuePhoto[] = [] // Empty — real photos come from Supabase

function PhotoGrid({ photos, onDelete, currentUserId }: {
  photos: VenuePhoto[]
  onDelete: (id: string, path: string) => void
  currentUserId?: string
}) {
  const [lightbox, setLightbox] = useState<VenuePhoto | null>(null)

  if (photos.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-500">
        <ImageOff className="w-10 h-10 mx-auto mb-3 opacity-40" />
        <p className="font-medium">No photos yet</p>
        <p className="text-sm mt-1">Be the first to share your night here!</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {photos.map(photo => (
          <div key={photo.id} className="relative group aspect-square rounded-xl overflow-hidden bg-zinc-900">
            <img
              src={photo.public_url}
              alt={photo.caption ?? 'Night out photo'}
              className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-300"
              onClick={() => setLightbox(photo)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
              {photo.caption && <p className="text-white text-xs line-clamp-2">{photo.caption}</p>}
            </div>
            {currentUserId === photo.user_id && (
              <button
                onClick={() => onDelete(photo.id, photo.storage_path)}
                className="absolute top-2 right-2 bg-black/60 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all"
              >
                <X className="w-3 h-3" />
              </button>
            )}
            <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-xs text-zinc-300 bg-black/50 rounded-full px-2 py-0.5">
                {photo.user_email?.split('@')[0]}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 text-white hover:text-pink-400" onClick={() => setLightbox(null)}>
            <X className="w-8 h-8" />
          </button>
          <img
            src={lightbox.public_url}
            alt={lightbox.caption ?? ''}
            className="max-w-full max-h-[90vh] rounded-2xl object-contain"
            onClick={e => e.stopPropagation()}
          />
          {lightbox.caption && (
            <p className="absolute bottom-8 text-white text-center bg-black/50 px-4 py-2 rounded-full">
              {lightbox.caption}
            </p>
          )}
        </div>
      )}
    </>
  )
}

function PhotoUploadForm({ venueId, onUploaded }: { venueId: string; onUploaded: (photo: VenuePhoto) => void }) {
  const { user } = useAuth()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [caption, setCaption] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(f: File) {
    if (!f.type.startsWith('image/')) return setError('Only image files allowed')
    if (f.size > 5 * 1024 * 1024) return setError('Max file size is 5MB')
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setError(null)
  }

  async function handleUpload() {
    if (!file || !user) return
    setUploading(true)
    setError(null)

    try {
      const supabase = getSupabase()
      const ext = file.name.split('.').pop()
      const path = `${venueId}/${user.id}/${Date.now()}.${ext}`

      const { error: uploadErr } = await supabase.storage
        .from('venue-photos')
        .upload(path, file, { contentType: file.type })

      if (uploadErr) throw uploadErr

      const { data: { publicUrl } } = supabase.storage
        .from('venue-photos')
        .getPublicUrl(path)

      const { data, error: dbErr } = await supabase
        .from('venue_photos')
        .insert({ venue_id: venueId, user_id: user.id, user_email: user.email, storage_path: path, public_url: publicUrl, caption: caption || null })
        .select()
        .single()

      if (dbErr) throw dbErr

      onUploaded(data as VenuePhoto)
      setFile(null)
      setPreview(null)
      setCaption('')
    } catch (e: any) {
      setError(e.message ?? 'Upload failed')
    }
    setUploading(false)
  }

  return (
    <div className="border border-zinc-700 rounded-2xl p-4 bg-zinc-950">
      <p className="font-semibold text-white mb-3 flex items-center gap-2">
        <Camera className="w-4 h-4 text-pink-400" />
        Share your night
      </p>

      {preview ? (
        <div className="relative mb-3">
          <img src={preview} className="w-full h-40 object-cover rounded-xl" alt="Preview" />
          <button onClick={() => { setFile(null); setPreview(null) }}
            className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-red-600 transition-colors">
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full h-28 border-2 border-dashed border-zinc-700 hover:border-pink-500/50 rounded-xl flex flex-col items-center justify-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors mb-3"
        >
          <Upload className="w-6 h-6" />
          <span className="text-sm">Click to upload (max 5MB)</span>
        </button>
      )}

      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />

      <input
        type="text"
        placeholder="Add a caption... (optional)"
        value={caption}
        onChange={e => setCaption(e.target.value)}
        maxLength={120}
        className="w-full bg-zinc-900 border border-zinc-700 text-white text-sm rounded-xl px-3 py-2 outline-none focus:border-pink-500/50 placeholder:text-zinc-600 mb-3"
      />

      {error && <p className="text-red-400 text-sm mb-2">{error}</p>}

      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="w-full bg-pink-500 hover:bg-pink-400 text-black font-bold rounded-xl py-2.5 text-sm transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
      >
        {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
        {uploading ? 'Uploading...' : 'Share photo'}
      </button>
    </div>
  )
}

export function PhotoGallery({ venueId }: { venueId: string }) {
  const { user } = useAuth()
  const [photos, setPhotos] = useState<VenuePhoto[]>(MOCK_PHOTOS)
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [supabaseOk, setSupabaseOk] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const supabase = getSupabase()
        const { data, error } = await supabase
          .from('venue_photos')
          .select('*')
          .eq('venue_id', venueId)
          .order('created_at', { ascending: false })

        if (!error && data) {
          setPhotos(data as VenuePhoto[])
          setSupabaseOk(true)
        }
      } catch { /* Supabase not configured yet */ }
      setLoading(false)
    }
    load()
  }, [venueId])

  async function handleDelete(id: string, path: string) {
    const supabase = getSupabase()
    await supabase.storage.from('venue-photos').remove([path])
    await supabase.from('venue_photos').delete().eq('id', id)
    setPhotos(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-bold text-white text-lg flex items-center gap-2">
          <Camera className="w-5 h-5 text-pink-400" />
          Community photos
          {photos.length > 0 && (
            <span className="text-sm font-normal text-zinc-500">({photos.length})</span>
          )}
        </h2>
        {user ? (
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="px-3 py-1.5 bg-pink-500 hover:bg-pink-400 text-black text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            Add photo
          </button>
        ) : (
          <p className="text-zinc-500 text-xs">Sign in to add photos</p>
        )}
      </div>

      {showUpload && user && (
        <div className="mb-5">
          <PhotoUploadForm
            venueId={venueId}
            onUploaded={photo => {
              setPhotos(prev => [photo, ...prev])
              setShowUpload(false)
            }}
          />
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-pink-400" />
        </div>
      ) : (
        <PhotoGrid
          photos={photos}
          onDelete={handleDelete}
          currentUserId={user?.id}
        />
      )}
    </div>
  )
}
