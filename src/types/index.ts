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

export type MusicGenre =
  | 'House'
  | 'Electronic'
  | 'Techno'
  | 'Pop'
  | 'R&B'
  | 'Hip-Hop'
  | 'Reggaeton'
  | 'Indie'
  | 'Jazz'
  | 'Soul'
  | 'Latin'
  | 'Deep House'
  | 'Tech House'
  | 'Rock'
  | 'K-Pop'
  | 'World Music'
  | 'Funk'
  | 'Blues'
  | 'Flamenco'
  | 'Experimental'
  | 'Minimal'
  | 'Salsa'

export interface UserProfile {
  id: string
  username: string | null
  avatar_url: string | null
  full_name: string | null
  created_at: string
}

export type City = 'barcelona' | 'girona'

export const CITY_LABELS: Record<City, string> = {
  barcelona: '🏙️ Barcelona',
  girona: '🏰 Girona',
}

export interface Venue {
  id: string
  name: string
  type: VenueType
  city?: City
  description: string
  address: string
  neighborhood: string
  lat: number
  lng: number
  ambients: Ambient[]
  music: MusicGenre[]
  google_rating: number | null
  min_age: number
  dress_code: string | null
  image_url: string | null
  website: string | null
  instagram: string | null
  phone: string | null
  opening_hours: Record<string, string>
  price_sync_url: string | null
  price_sync_source: 'manual' | 'fever' | 'fourvenues' | 'scraping' | null
  peak_days?: string[]
  created_at: string
}

export interface Price {
  id: string
  venue_id: string
  label: string
  amount: number
  amount_max: number | null
  currency: string
  includes: string | null
  entrada_tipus: EntradaTipus
  ticket_url: string | null           // direct buy-tickets link
  is_current: boolean
  valid_from: string
  valid_to: string | null
  last_synced_at: string | null
  source: 'manual' | 'ticketmaster' | 'fever' | 'residentadvisor' | 'fourvenues' | 'scraping'
  created_at: string
}

export interface VenuePhoto {
  id: string
  venue_id: string
  user_id: string
  user_email: string
  storage_path: string
  public_url: string
  caption: string | null
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
  music: MusicGenre[]
  day: string
  neighborhood: string | null
  includeRestaurant: boolean
  includePrevia: boolean
  customPrevia: string
  customRestaurant: string
  fixedDiscoId: string | null
  fixedPreviaId: string | null
  fixedRestaurantId: string | null
}

export interface DistanceInfo {
  km: number
  walkMin: number
  bikeMin: number
  carMin: number
}

export interface NightRoute {
  restaurant: VenueWithDetails | null
  previa: VenueWithDetails | null
  disco: VenueWithDetails
  totalEstimatedCost: number
}
