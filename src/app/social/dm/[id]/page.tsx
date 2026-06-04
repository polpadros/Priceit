'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Send, Loader2, MapPin } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useSocial, type Message } from '@/contexts/SocialContext'
import { getSupabase } from '@/lib/supabase'
import { mockVenues } from '@/lib/mock-data'

export default function ChatPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { conversations } = useSocial()
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const conv = conversations.find(c => c.id === id)

  useEffect(() => {
    if (!id || !user) return
    loadMessages()

    // Real-time subscription
    const supabase = getSupabase()
    const sub = supabase
      .channel(`chat-${id}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `conversation_id=eq.${id}`
      }, (payload) => {
        setMessages(prev => {
          // Avoid duplicates
          if (prev.find(m => m.id === payload.new.id)) return prev
          return [...prev, payload.new as Message]
        })
      })
      .subscribe()

    // Polling fallback every 3s in case realtime is slow
    const poll = setInterval(() => loadMessages(), 3000)

    return () => {
      sub.unsubscribe()
      clearInterval(poll)
    }
  }, [id, user])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function loadMessages() {
    const { data } = await getSupabase().from('messages').select('*')
      .eq('conversation_id', id).order('created_at', { ascending: true }).limit(100)
    if (data) setMessages(data as Message[])
    // Mark as read
    await getSupabase().from('messages').update({ read_at: new Date().toISOString() })
      .eq('conversation_id', id).neq('sender_id', user!.id).is('read_at', null)
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() || !user || sending) return
    setSending(true)
    const content = text.trim()
    setText('')
    // Optimistic update — show message immediately
    const optimistic: Message = {
      id: `temp-${Date.now()}`, conversation_id: id, sender_id: user.id,
      content, type: 'text', metadata: null, read_at: null, created_at: new Date().toISOString()
    }
    setMessages(prev => [...prev, optimistic])
    const { data } = await getSupabase().from('messages')
      .insert({ conversation_id: id, sender_id: user.id, content }).select().single()
    if (data) setMessages(prev => prev.map(m => m.id === optimistic.id ? data as Message : m))
    await getSupabase().from('conversations').update({ last_message: content, last_message_at: new Date().toISOString() }).eq('id', id)
    setSending(false)
  }

  if (!user) return <main className="min-h-screen bg-zinc-950 flex items-center justify-center"><p className="text-zinc-500">Sign in required</p></main>

  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Header */}
      <div className="sticky top-14 z-40 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/social/dm" className="text-zinc-500 hover:text-pink-400 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold shrink-0 overflow-hidden">
            {conv?.other_avatar
              ? <img src={conv.other_avatar} className="w-full h-full object-cover" alt="" />
              : (conv?.other_username?.[0] ?? '?').toUpperCase()}
          </div>
          <p className="font-bold text-white">{conv?.other_username ?? 'Chat'}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 max-w-lg w-full mx-auto px-4 py-4 space-y-3 overflow-y-auto">
        {messages.length === 0 && (
          <div className="text-center py-12 text-zinc-600 text-sm">Start the conversation!</div>
        )}
        {messages.map(msg => {
          const isMe = msg.sender_id === user.id
          // Venue invite card
          if (msg.type === 'venue_invite' && msg.metadata?.venue_id) {
            const v = mockVenues.find(x => x.id === msg.metadata.venue_id)
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <Link href={`/venues/${msg.metadata.venue_id}`}
                  className="bg-zinc-800 border border-pink-500/30 rounded-2xl p-4 max-w-[280px] hover:border-pink-500/60 transition-colors">
                  {v?.image_url && <img src={v.image_url} className="w-full h-28 object-cover rounded-xl mb-3" alt="" />}
                  <p className="text-pink-400 text-xs font-bold mb-1">🎉 Night out invite</p>
                  <p className="text-white font-bold">{v?.name ?? msg.metadata.venue_name}</p>
                  <p className="text-zinc-500 text-xs flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" />{v?.neighborhood}
                  </p>
                  <p className="text-zinc-400 text-sm mt-2 italic">&ldquo;{msg.content}&rdquo;</p>
                </Link>
              </div>
            )
          }
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                isMe ? 'bg-pink-500 text-white rounded-br-sm' : 'bg-zinc-800 text-zinc-200 rounded-bl-sm'
              }`}>
                <p>{msg.content}</p>
                <p className={`text-xs mt-1 ${isMe ? 'text-pink-200' : 'text-zinc-500'}`}>
                  {new Date(msg.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-zinc-950 border-t border-zinc-800">
        <form onSubmit={sendMessage} className="max-w-lg mx-auto px-4 py-3 flex gap-3">
          <input value={text} onChange={e => setText(e.target.value)}
            placeholder="Message..."
            className="flex-1 bg-zinc-800 border border-zinc-700 focus:border-pink-500/50 text-white rounded-2xl px-4 py-2.5 text-sm outline-none placeholder:text-zinc-600" />
          <button type="submit" disabled={!text.trim() || sending}
            className="bg-pink-500 hover:bg-pink-400 text-white rounded-2xl px-4 py-2.5 transition-colors disabled:opacity-40">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </main>
  )
}
