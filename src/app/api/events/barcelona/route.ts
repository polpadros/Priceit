import { NextRequest, NextResponse } from 'next/server'

const TM_API = 'https://app.ticketmaster.com/discovery/v2'

export async function GET(req: NextRequest) {
  const apiKey = process.env.TICKETMASTER_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'No API key' }, { status: 500 })
  }

  const { searchParams } = new URL(req.url)
  const keyword = searchParams.get('keyword') ?? ''
  const size = searchParams.get('size') ?? '10'

  try {
    const url = new URL(`${TM_API}/events.json`)
    url.searchParams.set('apikey', apiKey)
    url.searchParams.set('city', 'Barcelona')
    url.searchParams.set('countryCode', 'ES')
    url.searchParams.set('classificationName', 'music')
    url.searchParams.set('size', size)
    url.searchParams.set('sort', 'date,asc')
    if (keyword) url.searchParams.set('keyword', keyword)

    const res = await fetch(url.toString(), {
      next: { revalidate: 3600 }, // cache 1h
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Ticketmaster error', status: res.status }, { status: 502 })
    }

    const data = await res.json()
    const events = data._embedded?.events ?? []

    const parsed = events.map((e: any) => ({
      id: e.id,
      name: e.name,
      date: e.dates?.start?.localDate,
      time: e.dates?.start?.localTime,
      venue_name: e._embedded?.venues?.[0]?.name,
      venue_address: e._embedded?.venues?.[0]?.address?.line1,
      price_min: e.priceRanges?.[0]?.min ?? null,
      price_max: e.priceRanges?.[0]?.max ?? null,
      currency: e.priceRanges?.[0]?.currency ?? 'EUR',
      ticket_url: e.url,
      image: e.images?.find((i: any) => i.ratio === '16_9' && i.width > 500)?.url ?? e.images?.[0]?.url,
      artists: e._embedded?.attractions?.map((a: any) => a.name) ?? [],
      genre: e.classifications?.[0]?.genre?.name,
    }))

    return NextResponse.json({
      events: parsed,
      total: data.page?.totalElements ?? parsed.length,
      updatedAt: new Date().toISOString(),
    })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}
