import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      venues: {
        Row: {
          id: string
          name: string
          type: string
          description: string
          address: string
          neighborhood: string
          lat: number
          lng: number
          ambients: string[]
          min_age: number
          image_url: string | null
          website: string | null
          instagram: string | null
          phone: string | null
          opening_hours: Record<string, string>
          created_at: string
        }
      }
      prices: {
        Row: {
          id: string
          venue_id: string
          label: string
          amount: number
          currency: string
          includes: string | null
          is_current: boolean
          valid_from: string
          valid_to: string | null
          source: string
          created_at: string
        }
      }
      ratings: {
        Row: {
          id: string
          venue_id: string
          user_id: string | null
          score: number
          comment: string | null
          ambients: string[]
          created_at: string
        }
      }
      events: {
        Row: {
          id: string
          venue_id: string
          name: string
          date: string
          doors_open: string | null
          price_min: number | null
          price_max: number | null
          currency: string
          ticket_url: string | null
          artists: string[]
          genre: string | null
          source_id: string | null
          source: string
          created_at: string
        }
      }
    }
  }
}
