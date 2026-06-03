import type { DistanceInfo } from '@/types'

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function getDistanceInfo(lat1: number, lng1: number, lat2: number, lng2: number): DistanceInfo {
  const km = haversineKm(lat1, lng1, lat2, lng2)
  // City speeds: walk 5km/h, bike 15km/h, car 25km/h (with traffic)
  return {
    km: Math.round(km * 10) / 10,
    walkMin: Math.round(km / 5 * 60),
    bikeMin: Math.round(km / 15 * 60),
    carMin: Math.round(km / 25 * 60),
  }
}

export function formatDistance(d: DistanceInfo): string {
  if (d.km < 0.1) return 'Same area'
  return `${d.km} km`
}
