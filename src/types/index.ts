export type VenueType = 'discoteca' | 'bar' | 'restaurant' | 'previa'

export type Ambient =
  | 'pijo'
  | 'indie'
  | 'reggaeton'
  | 'electronica'
  | 'techno'
  | 'latin'
  | 'hiphop'
  | 'pop'
  | 'rock'
  | 'casual'
  | 'soul'
  | 'jazz'
  | 'kpop'
  | 'rnb'
  | 'house'

// 'fixed'     = always the same price
// 'dynamic'   = changes per night/event — updated via scraping/API
// 'free_list' = free with guest-list, paid at door
export type EntradaTipus = 'fixed' | 'dynamic' | 'free_list' | 'free'

export interface Venue {
  id: string
  name: string
  type: VenueType
  description: string
  address: string
  neighborhood: string
  lat: number
  lng: number
  ambients: Ambient[]
  min_age: number
  dress_code: string | null
  image_url: string | null
  website: string | null
  instagram: string | null
  phone: string | null
  opening_hours: Record<string, string>
  price_sync_url: string | null       // URL used for auto-scraping prices
  price_sync_source: 'manual' | 'fever' | 'fourvenues' | 'scraping' | null
  created_at: string
}

export interface Price {
  id: string
  venue_id: string
  label: string
  amount: number
  amount_max: number | null           // for ranges like 10–20€
  currency: string
  includes: string | null
  entrada_tipus: EntradaTipus
  is_current: boolean
  valid_from: string
  valid_to: string | null
  last_synced_at: string | null       // when price was last auto-updated
  source: 'manual' | 'ticketmaster' | 'fever' | 'residentadvisor' | 'fourvenues' | 'scraping'
  created_at: string
}

export interface Rating {
  id: string
  venue_id: string
  user_id: string | null
  score: number
  comment: string | null
  ambients: Ambient[]
  created_at: string
}

export interface Event {
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
  source: 'ticketmaster' | 'fever' | 'residentadvisor' | 'manual'
  created_at: string
}

export interface VenueWithDetails extends Venue {
  prices: Price[]
  ratings: Rating[]
  events: Event[]
  avg_rating: number
  rating_count: number
}

export interface NightPlanFilters {
  budget: number
  ambients: Ambient[]
  day: string
  neighborhood: string | null
  includeRestaurant: boolean
  includePrevia: boolean
}

export interface NightRoute {
  restaurant: VenueWithDetails | null
  previa: VenueWithDetails | null
  disco: VenueWithDetails
  totalEstimatedCost: number
}
