import { supabase } from './supabase'
import type { Ambient, NightPlanFilters, NightRoute, VenueType, VenueWithDetails } from '@/types'

export async function getVenues(filters?: {
  type?: VenueType
  ambients?: Ambient[]
  neighborhood?: string
}): Promise<VenueWithDetails[]> {
  let query = supabase.from('venues').select(`
    *,
    prices(*),
    ratings(*),
    events(*)
  `)

  if (filters?.type) query = query.eq('type', filters.type)
  if (filters?.neighborhood) query = query.eq('neighborhood', filters.neighborhood)
  if (filters?.ambients?.length) query = query.overlaps('ambients', filters.ambients)

  const { data, error } = await query.order('name')
  if (error) throw error

  return (data || []).map(enrichVenue)
}

export async function getVenue(id: string): Promise<VenueWithDetails | null> {
  const { data, error } = await supabase
    .from('venues')
    .select(`*, prices(*), ratings(*), events(*)`)
    .eq('id', id)
    .single()

  if (error) return null
  return enrichVenue(data)
}

function enrichVenue(v: any): VenueWithDetails {
  const ratings = v.ratings || []
  const avg_rating = ratings.length
    ? ratings.reduce((s: number, r: any) => s + r.score, 0) / ratings.length
    : 0
  return { ...v, avg_rating, rating_count: ratings.length }
}

export async function addRating(
  venueId: string,
  score: number,
  comment: string,
  ambients: Ambient[]
) {
  const { error } = await supabase.from('ratings').insert({
    venue_id: venueId,
    score,
    comment,
    ambients,
  })
  if (error) throw error
}

export async function getNightPlan(filters: NightPlanFilters): Promise<NightRoute[]> {
  const venues = await getVenues({ ambients: filters.ambients })

  const discos = venues.filter(
    (v) =>
      v.type === 'discoteca' &&
      v.ambients.some((a) => filters.ambients.includes(a as Ambient))
  )

  const previes = venues.filter(
    (v) =>
      (v.type === 'previa' || v.type === 'bar') &&
      v.ambients.some((a) => filters.ambients.includes(a as Ambient))
  )

  const restaurants = venues.filter((v) => v.type === 'restaurant')

  const routes: NightRoute[] = []

  for (const disco of discos.slice(0, 3)) {
    const discoPrice = disco.prices.find((p) => p.is_current)?.amount || 0
    const remaining = filters.budget - discoPrice

    const previa = filters.includePrevia
      ? previes.find((p) => {
          const price = p.prices.find((pr) => pr.is_current)?.amount || 15
          return price <= remaining * 0.3
        }) || null
      : null

    const previaPrice = previa?.prices.find((p) => p.is_current)?.amount || 0
    const remainingForFood = remaining - previaPrice

    const restaurant = filters.includeRestaurant
      ? restaurants.find((r) => {
          const price = r.prices.find((p) => p.is_current)?.amount || 20
          return price <= remainingForFood * 0.6
        }) || null
      : null

    const restaurantPrice = restaurant?.prices.find((p) => p.is_current)?.amount || 0
    const totalEstimatedCost = discoPrice + previaPrice + restaurantPrice

    if (totalEstimatedCost <= filters.budget) {
      routes.push({ disco, previa, restaurant, totalEstimatedCost })
    }
  }

  return routes
}
