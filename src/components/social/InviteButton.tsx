'use client'
import { useState } from 'react'
import { Send, Users, X, Loader2, Check } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useSocial } from '@/contexts/SocialContext'
import { getSupabase } from '@/lib/supabase'

export function InviteButton({ venueId, venueName }: { venueId: string; venueName: string }) {
  const { user } = useAuth()
  const { following, conversations, getOrCreateConversation } = useSocial()
  const [open, setOpen] = useState(false)
  const [profiles, setProfiles] = useState<any[]>([])
  const [sending, setSending] = useState<string | null>(null)
  const [sent, setSent] = useState<Set<string>>(new Set())

  async function loadFriends() {
    if (following.size === 0) { setProfiles([]); return }
    const { data } = await getSupabase().from('profiles').select('id, username, avatar_url')
      .in('id', [...following])
    setProfiles(data ?? [])
  }

  async function invite(friendId: string, friendName: string) {
    if (!user) return
    setSending(friendId)
    const username = user.email?.split('@')[0] ?? 'Someone'
    const convId = await getOrCreateConversation(friendId)
    if (convId) {
      const msg = `${username} is inviting you to go out tonight at ${venueName}! 🎉`
      await getSupabase().from('messages').insert({
        conversation_id: convId, sender_id: user.id,
        content: msg, type: 'venue_invite',
        metadata: { venue_id: venueId, venue_name: venueName },
      })
      await getSupabase().from('conversations').update({ last_message: msg, last_message_at: new Date().toISOString() }).eq('id', convId)
      // Notification
      await getSupabase().from('notifications').insert({
        user_id: friendId, sender_id: user.id, type: 'invite',
        content: `${username} is inviting you to ${venueName} tonight! 🎉`,
        metadata: { venue_id: venueId },
      })
    }
    setSent(prev => new Set([...prev, friendId]))
    setSending(null)
  }

  function handleOpen() {
    setOpen(true); loadFriends()
  }

  if (!user) return null

  return (
    <>
      <button onClick={handleOpen}
        className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 font-semibold px-4 py-2 rounded-xl text-sm transition-colors">
        <Send className="w-4 h-4" /> Invite friends
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white">Invite to {venueName}</h3>
              <button onClick={() => setOpen(false)} className="text-zinc-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            {profiles.length === 0 ? (
              <div className="text-center py-8 text-zinc-500">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Follow people first to invite them</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {profiles.map(p => (
                  <div key={p.id} className="flex items-center gap-3 p-3 bg-zinc-800 rounded-xl">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold shrink-0 overflow-hidden">
                      {p.avatar_url ? <img src={p.avatar_url} className="w-full h-full object-cover" alt="" /> : (p.username?.[0] ?? '?').toUpperCase()}
                    </div>
                    <p className="flex-1 text-white font-medium text-sm">{p.username ?? 'User'}</p>
                    <button onClick={() => invite(p.id, p.username ?? 'User')} disabled={!!sending || sent.has(p.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                        sent.has(p.id) ? 'bg-green-600 text-white' : 'bg-pink-500 hover:bg-pink-400 text-white'
                      } disabled:opacity-50`}>
                      {sending === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
                        sent.has(p.id) ? <><Check className="w-3.5 h-3.5" />Sent!</> : <><Send className="w-3.5 h-3.5" />Invite</>}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
