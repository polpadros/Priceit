'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { getSupabase } from '@/lib/supabase'

export interface FeedPhoto {
  id: string
  user_id: string
  public_url: string
  storage_path: string
  caption: string | null
  venue_id: string | null
  likes_count: number
  created_at: string
  // joined
  username?: string | null
  avatar_url?: string | null
  is_liked?: boolean
}

export interface Conversation {
  id: string
  participant_1: string
  participant_2: string
  last_message: string | null
  last_message_at: string | null
  other_user_id: string
  other_username?: string | null
  other_avatar?: string | null
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  type: string
  metadata: any
  read_at: string | null
  created_at: string
}

interface SocialContextType {
  following: Set<string>
  followers: Set<string>
  follow: (userId: string) => Promise<void>
  unfollow: (userId: string) => Promise<void>
  isFollowing: (userId: string) => boolean
  feedPhotos: FeedPhoto[]
  loadFeed: () => Promise<void>
  likePhoto: (photoId: string) => Promise<void>
  conversations: Conversation[]
  loadConversations: () => Promise<void>
  getOrCreateConversation: (otherUserId: string) => Promise<string>
  unreadCount: number
}

const SocialContext = createContext<SocialContextType>({
  following: new Set(), followers: new Set(),
  follow: async () => {}, unfollow: async () => {}, isFollowing: () => false,
  feedPhotos: [], loadFeed: async () => {},
  likePhoto: async () => {},
  conversations: [], loadConversations: async () => {},
  getOrCreateConversation: async () => '',
  unreadCount: 0,
})

export function SocialProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [following, setFollowing] = useState<Set<string>>(new Set())
  const [followers, setFollowers] = useState<Set<string>>(new Set())
  const [feedPhotos, setFeedPhotos] = useState<FeedPhoto[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!user) {
      setFollowing(new Set()); setFollowers(new Set()); return
    }
    loadFollows()
    loadFeed()
    loadConversations()
  }, [user])

  async function loadFollows() {
    if (!user) return
    const supabase = getSupabase()
    const [fwRes, frRes] = await Promise.all([
      supabase.from('follows').select('following_id').eq('follower_id', user.id),
      supabase.from('follows').select('follower_id').eq('following_id', user.id),
    ])
    if (fwRes.data) setFollowing(new Set(fwRes.data.map((r: any) => r.following_id)))
    if (frRes.data) setFollowers(new Set(frRes.data.map((r: any) => r.follower_id)))
  }

  async function follow(userId: string) {
    if (!user) return
    setFollowing(prev => new Set([...prev, userId]))
    const supabase = getSupabase()
    await supabase.from('follows').upsert({ follower_id: user.id, following_id: userId })
    // send notification
    await supabase.from('notifications').insert({
      user_id: userId, sender_id: user.id, type: 'follow',
      content: 'started following you',
    })
  }

  async function unfollow(userId: string) {
    if (!user) return
    setFollowing(prev => { const s = new Set(prev); s.delete(userId); return s })
    await getSupabase().from('follows').delete()
      .eq('follower_id', user.id).eq('following_id', userId)
  }

  async function loadFeed() {
    try {
      const supabase = getSupabase()
      // Get all photos (own + following) with profile info
      let followingIds: string[] = []
      if (user) {
        const { data } = await supabase.from('follows').select('following_id').eq('follower_id', user.id)
        followingIds = data?.map((r: any) => r.following_id) ?? []
      }

      const userIds = user ? [user.id, ...followingIds] : []
      let query = supabase.from('feed_photos').select('*').order('created_at', { ascending: false }).limit(50)
      if (userIds.length > 0) query = query.in('user_id', userIds)

      const { data: photos } = await query
      if (!photos) return

      // Get profiles
      const profileIds = [...new Set(photos.map((p: any) => p.user_id))]
      const { data: profiles } = await supabase.from('profiles').select('id, username, avatar_url').in('id', profileIds)
      const profileMap = Object.fromEntries((profiles ?? []).map((p: any) => [p.id, p]))

      // Get likes
      let likedSet = new Set<string>()
      if (user) {
        const { data: likes } = await supabase.from('photo_likes').select('photo_id').eq('user_id', user.id)
        likedSet = new Set((likes ?? []).map((l: any) => l.photo_id))
      }

      setFeedPhotos(photos.map((p: any) => ({
        ...p,
        username: profileMap[p.user_id]?.username,
        avatar_url: profileMap[p.user_id]?.avatar_url,
        is_liked: likedSet.has(p.id),
      })))
    } catch {}
  }

  async function likePhoto(photoId: string) {
    if (!user) return
    const supabase = getSupabase()
    const isLiked = feedPhotos.find(p => p.id === photoId)?.is_liked
    if (isLiked) {
      await supabase.from('photo_likes').delete().eq('photo_id', photoId).eq('user_id', user.id)
      await supabase.from('feed_photos').update({ likes_count: Math.max(0, (feedPhotos.find(p=>p.id===photoId)?.likes_count??1)-1) }).eq('id', photoId)
    } else {
      await supabase.from('photo_likes').upsert({ photo_id: photoId, user_id: user.id })
      await supabase.from('feed_photos').update({ likes_count: (feedPhotos.find(p=>p.id===photoId)?.likes_count??0)+1 }).eq('id', photoId)
    }
    setFeedPhotos(prev => prev.map(p => p.id === photoId ? {
      ...p, is_liked: !isLiked, likes_count: isLiked ? p.likes_count - 1 : p.likes_count + 1
    } : p))
  }

  async function loadConversations() {
    if (!user) return
    try {
      const supabase = getSupabase()
      const { data } = await supabase.from('conversations').select('*')
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
        .order('last_message_at', { ascending: false })
      if (!data) return

      const otherIds = data.map((c: any) => c.participant_1 === user.id ? c.participant_2 : c.participant_1)
      const { data: profiles } = await supabase.from('profiles').select('id,username,avatar_url').in('id', otherIds)
      const profileMap = Object.fromEntries((profiles ?? []).map((p: any) => [p.id, p]))

      setConversations(data.map((c: any) => {
        const otherId = c.participant_1 === user.id ? c.participant_2 : c.participant_1
        return { ...c, other_user_id: otherId, other_username: profileMap[otherId]?.username, other_avatar: profileMap[otherId]?.avatar_url }
      }))

      // Count unread
      const { count } = await supabase.from('messages').select('*', { count: 'exact', head: true })
        .is('read_at', null).neq('sender_id', user.id)
      setUnreadCount(count ?? 0)
    } catch {}
  }

  async function getOrCreateConversation(otherUserId: string): Promise<string> {
    if (!user) return ''
    const supabase = getSupabase()
    // Check existing
    const { data } = await supabase.from('conversations').select('id')
      .or(`and(participant_1.eq.${user.id},participant_2.eq.${otherUserId}),and(participant_1.eq.${otherUserId},participant_2.eq.${user.id})`)
      .single()
    if (data) return data.id
    // Create new
    const { data: newConv } = await supabase.from('conversations')
      .insert({ participant_1: user.id, participant_2: otherUserId }).select('id').single()
    loadConversations()
    return newConv?.id ?? ''
  }

  return (
    <SocialContext.Provider value={{
      following, followers, follow, unfollow, isFollowing: (id) => following.has(id),
      feedPhotos, loadFeed, likePhoto,
      conversations, loadConversations, getOrCreateConversation,
      unreadCount,
    }}>
      {children}
    </SocialContext.Provider>
  )
}

export const useSocial = () => useContext(SocialContext)
