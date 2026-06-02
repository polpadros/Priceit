import { NextRequest, NextResponse } from 'next/server'

// Ticketmaster API - actualitza preus per a events de discoteques de Barcelona
async function fetchTicketmaster(venueId: string) {
  const apiKey = process.env.TICKETMASTER_API_KEY
  if (!apiKey) return null

  try {
    const res = await fetch(
      `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${apiKey}&city=Barcelona&classificationName=music&venueId=${venueId}&size=5`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return null
    const data = await res.json()
    return data._embedded?.events ?? []
  } catch {
    return null
  }
}

// Fever API - events i preus en temps real
async function fetchFever(venueName: string) {
  const apiKey = process.env.FEVER_API_KEY
  if (!apiKey) return null

  try {
    const res = await fetch(
      `https://api.feverup.com/api/discovery/v1/events?city=barcelona&q=${encodeURIComponent(venueName)}&limit=5`,
      {
        headers: { Authorization: `Bearer ${apiKey}` },
        next: { revalidate: 3600 },
      }
    )
    if (!res.ok) return null
    const data = await res.json()
    return data.data ?? []
  } catch {
    return null
  }
}

// Resident Advisor (scraping públic via embed)
async function fetchResidentAdvisor(venueName: string) {
  try {
    const searchUrl = `https://ra.co/clubs/barcelona`
    // RA no té API pública; caldria scraping amb Puppeteer o Cheerio
    // Aquí retornem null — implementar amb scraping propi si es necessita
    return null
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const venueId = searchParams.get('venueId')
  const venueName = searchParams.get('venueName') ?? ''

  if (!venueId) {
    return NextResponse.json({ error: 'venueId required' }, { status: 400 })
  }

  const [ticketmasterEvents, feverEvents] = await Promise.all([
    fetchTicketmaster(venueId),
    fetchFever(venueName),
  ])

  const prices: Array<{
    label: string
    amount: number
    source: string
    eventName?: string
    eventDate?: string
    ticketUrl?: string
  }> = []

  if (ticketmasterEvents) {
    for (const event of ticketmasterEvents) {
      const minPrice = event.priceRanges?.[0]?.min
      if (minPrice) {
        prices.push({
          label: `Entrada - ${event.name}`,
          amount: minPrice,
          source: 'ticketmaster',
          eventName: event.name,
          eventDate: event.dates?.start?.localDate,
          ticketUrl: event.url,
        })
      }
    }
  }

  if (feverEvents) {
    for (const event of feverEvents) {
      const price = event.price ?? event.min_price
      if (price) {
        prices.push({
          label: `Entrada - ${event.title ?? event.name}`,
          amount: price,
          source: 'fever',
          eventName: event.title ?? event.name,
          eventDate: event.start_date,
          ticketUrl: event.url,
        })
      }
    }
  }

  return NextResponse.json({
    venueId,
    prices,
    updatedAt: new Date().toISOString(),
  })
}

export async function POST(req: NextRequest) {
  // Endpoint per a webhook de Ticketmaster o Fever que actualitza la BD
  try {
    const body = await req.json()
    // Aquí connectaries amb Supabase per actualitzar preus
    // await supabase.from('prices').upsert({ ... })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }
}
