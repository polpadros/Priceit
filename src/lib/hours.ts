// Helper to check if a venue is open now or today
// Opening hours format: { 'Thu–Sun': '23:00–06:00', 'Daily': 'from 23:00', ... }

const DAY_MAP: Record<string, number[]> = {
  mon: [1], tue: [2], wed: [3], thu: [4], fri: [5], sat: [6], sun: [0],
  monday: [1], tuesday: [2], wednesday: [3], thursday: [4], friday: [5], saturday: [6], sunday: [0],
  daily: [0,1,2,3,4,5,6], every: [0,1,2,3,4,5,6],
}

function parseDays(key: string): number[] {
  const k = key.toLowerCase().replace(/[^a-z–\-,\s]/g, '')
  if (k.includes('daily') || k.includes('every')) return [0,1,2,3,4,5,6]

  const days: number[] = []
  // Split by comma first
  const parts = k.split(',')
  for (const part of parts) {
    const trimmed = part.trim()
    // Check for range like 'thu–sun' or 'thu-sun'
    const rangeMatch = trimmed.match(/(\w+)\s*[–\-]\s*(\w+)/)
    if (rangeMatch) {
      const start = DAY_MAP[rangeMatch[1]]?.[0]
      const end = DAY_MAP[rangeMatch[2]]?.[0]
      if (start !== undefined && end !== undefined) {
        // Handle wrap-around like Sat(6)–Sun(0)
        let d = start
        while (true) {
          days.push(d)
          if (d === end) break
          d = (d + 1) % 7
          if (days.length > 7) break // safety
        }
      }
    } else {
      // Single day
      for (const [abbr, nums] of Object.entries(DAY_MAP)) {
        if (trimmed.startsWith(abbr)) {
          days.push(...nums)
          break
        }
      }
    }
  }
  return [...new Set(days)]
}

function parseTime(t: string): number {
  const match = t.match(/(\d{1,2}):(\d{2})/)
  if (!match) return -1
  return parseInt(match[1]) * 60 + parseInt(match[2])
}

export function isOpenNow(openingHours: Record<string, string>): boolean {
  const now = new Date()
  const todayNum = now.getDay() // 0=Sun,1=Mon,...,6=Sat
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  for (const [dayKey, timeVal] of Object.entries(openingHours)) {
    const days = parseDays(dayKey)
    if (!days.includes(todayNum)) continue

    const tv = timeVal.toLowerCase()
    if (tv.includes('until')) {
      const closeMatch = tv.match(/until\s+(\d{1,2}:\d{2})/)
      if (closeMatch) {
        const close = parseTime(closeMatch[1])
        // venues closing early morning — treat as open if past midnight
        if (close < 600 && currentMinutes < close) return true
        if (currentMinutes >= 0 && currentMinutes < close) return true
      }
    } else {
      // Parse 'HH:MM–HH:MM' or 'from HH:MM'
      const times = tv.match(/(\d{1,2}:\d{2})/g)
      if (times && times.length >= 1) {
        const open = parseTime(times[0])
        const close = times.length >= 2 ? parseTime(times[1]) : 24 * 60

        if (close < open) {
          // Crosses midnight: open if after opening OR before closing
          if (currentMinutes >= open || currentMinutes < close) return true
        } else {
          if (currentMinutes >= open && currentMinutes < close) return true
        }
      } else if (tv.includes('from') || tv.includes('evenings') || tv.includes('night')) {
        // Late night venues — assume open from 22:00 to 06:00
        if (currentMinutes >= 22 * 60 || currentMinutes < 6 * 60) return true
      }
    }
  }
  return false
}

export function isOpenToday(openingHours: Record<string, string>): boolean {
  const todayNum = new Date().getDay()
  for (const dayKey of Object.keys(openingHours)) {
    const days = parseDays(dayKey)
    if (days.includes(todayNum)) return true
  }
  return false
}

export function getOpeningTimeToday(openingHours: Record<string, string>): string | null {
  const todayNum = new Date().getDay()
  for (const [dayKey, timeVal] of Object.entries(openingHours)) {
    const days = parseDays(dayKey)
    if (days.includes(todayNum)) return timeVal
  }
  return null
}
