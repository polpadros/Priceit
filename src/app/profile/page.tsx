'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft, Camera, Save, Loader2, Heart } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { useAuth } from '@/contexts/AuthContext'
import { useFavorites } from '@/contexts/FavoritesContext'
import { useCity } from '@/contexts/CityContext'
import { CITY_LABELS, type City } from '@/types'
import { getSupabase } from '@/lib/supabase'
import { mockVenues } from '@/lib/mock-data'
import { VenueCard } from '@/components/venue/VenueCard'

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const { favorites } = useFavorites()
  const { city, setCity } = useCity()
  const [username, setUsername] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [imgError, setImgError] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const favoriteVenues = mockVenues.filter(v => favorites.has(v.id))

  useEffect(() => {
    if (!user) return
    async function loadProfile() {
      const { data } = await getSupabase()
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', user!.id)
        .single()
      if (data) {
        setUsername(data.username ?? '')
        setAvatarUrl(data.avatar_url)
      }
    }
    loadProfile()
  }, [user])

  async function handleAvatarUpload(file: File) {
    if (!user) return
    setUploading(true)
    try {
      const supabase = getSupabase()
      // Always use .jpg as extension for consistency
      const path = `avatars/${user.id}.jpg`

      const { error: uploadError } = await supabase.storage
        .from('venue-photos')
        .upload(path, file, { upsert: true, contentType: 'image/jpeg' })

      if (uploadError) {
        alert(`Upload error: ${uploadError.message}`)
        throw uploadError
      }

      const { data: { publicUrl } } = supabase.storage.from('venue-photos').getPublicUrl(path)

      // Show immediately in UI with cache bust
      setAvatarUrl(`${publicUrl}?t=${Date.now()}`)

      // Save clean URL to DB
      await supabase.from('profiles').upsert({
        id: user.id,
        username: username || null,
        avatar_url: publicUrl,
      })

      window.dispatchEvent(new Event('profile-updated'))
    } catch (e: any) {
      console.error('Avatar upload error:', e?.message)
    }
    setUploading(false)
  }

  async function handleSave() {
    if (!user) return
    setSaving(true)
    // Strip cache-busting before saving
    const cleanUrl = avatarUrl ? avatarUrl.split('?')[0] : null
    await getSupabase().from('profiles').upsert({
      id: user.id,
      username: username || null,
      avatar_url: cleanUrl,
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    // Notify navbar to refresh profile
    window.dispatchEvent(new Event('profile-updated'))
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl font-bold mb-4">Sign in to view your profile</p>
          <Link href="/" className="text-pink-400 hover:underline">← Back to home</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-zinc-950">
      <div className="relative overflow-hidden bg-black border-b border-pink-500/20">
        <div className="relative max-w-3xl mx-auto px-4 py-10">
          <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-pink-400 mb-6 transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" />Back
          </Link>
          <h1 className="text-4xl font-black text-pink-400 mb-1">My Profile</h1>
          <p className="text-zinc-500 text-sm">{user.email}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* Avatar + username */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="font-bold text-white mb-5">Edit profile</h2>
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              <Avatar
                src={avatarUrl}
                name={username || user.email}
                size="xl"
                className="border-2 border-pink-500/40"
              />
              <button
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-1 -right-1 bg-pink-500 hover:bg-pink-400 text-white rounded-full p-1.5 transition-colors"
              >
                {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
              </button>
              <input ref={inputRef} type="file" accept="image/*" className="hidden"
                onChange={e => e.target.files?.[0] && handleAvatarUpload(e.target.files[0])} />
            </div>

            {/* Username */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-zinc-400 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="@yourname"
                maxLength={30}
                className="w-full bg-zinc-800 border border-zinc-700 focus:border-pink-500/50 text-white rounded-xl px-4 py-2.5 outline-none placeholder:text-zinc-600 text-sm"
              />
              <p className="text-zinc-600 text-xs mt-1">This is how others will see you</p>

              {/* Default city */}
              <div className="mt-4">
                <label className="block text-sm font-semibold text-zinc-400 mb-2">Default city</label>
                <div className="flex gap-2">
                  {(Object.entries(CITY_LABELS) as [City, string][]).map(([key, label]) => (
                    <button key={key} onClick={() => setCity(key)}
                      className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                        city === key
                          ? 'bg-pink-500 text-white border-pink-500'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-pink-500/50'
                      }`}>
                      {label}
                    </button>
                  ))}
                </div>
                <p className="text-zinc-600 text-xs mt-1">The app will open on your default city</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-5 flex items-center gap-2 bg-pink-500 hover:bg-pink-400 text-white font-bold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50 text-sm"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saved ? '✅ Saved!' : 'Save changes'}
          </button>
        </div>

        {/* Favourite venues */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="font-bold text-white mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-400 fill-pink-400" />
            My favourites ({favoriteVenues.length})
          </h2>
          {favoriteVenues.length === 0 ? (
            <p className="text-zinc-500 text-sm">No favourites yet — tap ❤️ on any venue to save it.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {favoriteVenues.map(v => <VenueCard key={v.id} venue={v} />)}
            </div>
          )}
        </div>

        {/* Sign out */}
        <button
          onClick={signOut}
          className="w-full border border-zinc-700 hover:border-red-500/50 text-zinc-500 hover:text-red-400 font-semibold py-3 rounded-xl transition-colors text-sm"
        >
          Sign out
        </button>
      </div>
    </main>
  )
}
