-- PriceIt Barcelona - Supabase Schema
-- Executa aquest SQL al teu projecte Supabase (SQL Editor)

-- Extensió per a arrays i cerques
create extension if not exists "unaccent";

-- ============================================================
-- TAULA: venues
-- ============================================================
create table if not exists public.venues (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  type        text not null check (type in ('discoteca', 'bar', 'restaurant', 'previa')),
  description text not null default '',
  address     text not null,
  neighborhood text not null,
  lat         double precision not null,
  lng         double precision not null,
  ambients    text[] not null default '{}',
  min_age     int not null default 18,
  image_url   text,
  website     text,
  instagram   text,
  phone       text,
  opening_hours jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

-- Index per cerques per ambient
create index if not exists venues_ambients_idx on public.venues using gin(ambients);
create index if not exists venues_type_idx on public.venues(type);
create index if not exists venues_neighborhood_idx on public.venues(neighborhood);

-- ============================================================
-- TAULA: prices
-- ============================================================
create table if not exists public.prices (
  id          uuid primary key default gen_random_uuid(),
  venue_id    uuid not null references public.venues(id) on delete cascade,
  label       text not null,
  amount      numeric(8,2) not null default 0,
  currency    text not null default 'EUR',
  includes    text,
  is_current  boolean not null default true,
  valid_from  date not null default current_date,
  valid_to    date,
  source      text not null default 'manual' check (source in ('manual','ticketmaster','fever','residentadvisor','scraping')),
  created_at  timestamptz not null default now()
);

create index if not exists prices_venue_idx on public.prices(venue_id);
create index if not exists prices_current_idx on public.prices(venue_id, is_current) where is_current = true;

-- ============================================================
-- TAULA: ratings
-- ============================================================
create table if not exists public.ratings (
  id          uuid primary key default gen_random_uuid(),
  venue_id    uuid not null references public.venues(id) on delete cascade,
  user_id     uuid references auth.users(id) on delete set null,
  score       int not null check (score between 1 and 5),
  comment     text,
  ambients    text[] not null default '{}',
  created_at  timestamptz not null default now()
);

create index if not exists ratings_venue_idx on public.ratings(venue_id);

-- ============================================================
-- TAULA: events
-- ============================================================
create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  venue_id    uuid not null references public.venues(id) on delete cascade,
  name        text not null,
  date        date not null,
  doors_open  time,
  price_min   numeric(8,2),
  price_max   numeric(8,2),
  currency    text not null default 'EUR',
  ticket_url  text,
  artists     text[] not null default '{}',
  genre       text,
  source_id   text,
  source      text not null default 'manual' check (source in ('ticketmaster','fever','residentadvisor','manual')),
  created_at  timestamptz not null default now()
);

create index if not exists events_venue_idx on public.events(venue_id);
create index if not exists events_date_idx on public.events(date);
-- Evita duplicats per source extern
create unique index if not exists events_source_unique on public.events(source, source_id)
  where source_id is not null;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.venues   enable row level security;
alter table public.prices   enable row level security;
alter table public.ratings  enable row level security;
alter table public.events   enable row level security;

-- Tothom pot llegir
create policy "venues_public_read"  on public.venues  for select using (true);
create policy "prices_public_read"  on public.prices  for select using (true);
create policy "ratings_public_read" on public.ratings for select using (true);
create policy "events_public_read"  on public.events  for select using (true);

-- Només usuaris autenticats poden escriure valoracions
create policy "ratings_auth_insert" on public.ratings
  for insert with check (auth.uid() is not null);

-- Service role pot escriure tot (per a scraping/sync via API route)
create policy "venues_service_all"  on public.venues  for all using (auth.role() = 'service_role');
create policy "prices_service_all"  on public.prices  for all using (auth.role() = 'service_role');
create policy "events_service_all"  on public.events  for all using (auth.role() = 'service_role');

-- ============================================================
-- VISTA: venues amb estadístiques
-- ============================================================
create or replace view public.venues_with_stats as
select
  v.*,
  coalesce(avg(r.score), 0)::numeric(3,1) as avg_rating,
  count(r.id)::int                        as rating_count,
  min(case when p.is_current then p.amount end) as min_price
from public.venues v
left join public.ratings r on r.venue_id = v.id
left join public.prices  p on p.venue_id = v.id
group by v.id;

-- ============================================================
-- DADES DE PROVA (seed)
-- ============================================================
insert into public.venues (name, type, description, address, neighborhood, lat, lng, ambients, min_age, website, instagram, opening_hours)
values
  ('Opium Barcelona',   'discoteca', 'Club de platja icònic al Port Olímpic.', 'Passeig Marítim de la Barceloneta, 34', 'Barceloneta', 41.3854, 2.1974, ARRAY['pijo','pop'],                   18, 'https://www.opiumbarcelona.com', '@opiumbarcelona', '{"dj-ds":"23:00-06:00"}'),
  ('Razzmatazz',        'discoteca', '5 sales amb música diferent.',            'Carrer dels Almogàvers, 122',           'Poblenou',    41.4009, 2.1972, ARRAY['indie','electronica','rock'],   18, 'https://www.salarazzmatazz.com', '@razzmatazz',     '{"dj-ds":"01:00-06:00"}'),
  ('Sutton Club',       'discoteca', 'Club exclusiu a la Zona Alta.',           'Carrer de Tuset, 13',                   'Gràcia Alta', 41.3974, 2.1504, ARRAY['pijo','pop'],                   21, 'https://www.thesuttonclub.com',  '@suttonbcn',      '{"dj-ds":"00:00-06:00"}'),
  ('Input Dance Club',  'discoteca', 'Temple de la música techno underground.', 'Carrer de Gran Via, 235',               'Sants',       41.3748, 2.1378, ARRAY['techno','electronica'],         18, 'https://www.inputbcn.com',       '@inputbcn',       '{"ds-dg":"00:00-12:00"}'),
  ('Macarena Club',     'discoteca', 'Reggaeton i latin music tota la nit.',    'Carrer Nou de Sant Francesc, 5',        'Barri Gòtic', 41.3797, 2.1766, ARRAY['reggaeton','latin'],            18, null,                            '@macarenaclub',   '{"dl-dg":"00:00-05:00"}'),
  ('Bar Marsella',      'bar',       'El bar més antic de Barcelona (1820).',   'Carrer dels Escudellers Blancs, 3',     'Barri Gòtic', 41.3797, 2.1748, ARRAY['indie','casual'],               18, null,                            null,              '{"dl-ds":"22:00-02:00"}'),
  ('El Xampanyet',      'bar',       'Bar de tapes i cava típic del Born.',     'Carrer de Montcada, 22',                'El Born',     41.3843, 2.1811, ARRAY['casual','indie'],               18, null,                            null,              '{"dm-ds":"19:00-23:30"}'),
  ('Bodega Sepúlveda',  'previa',    'Bodega de vins naturals a l''Eixample.', 'Carrer de Sepúlveda, 180',              'Eixample',    41.3823, 2.1572, ARRAY['indie','casual'],               18, null,                            null,              '{"dl-ds":"18:00-01:00"}'),
  ('La Pepita BCN',     'restaurant','Braves i croquetes típiques barcelonines.','Carrer de Còrsega, 343',              'Eixample',    41.3984, 2.1631, ARRAY['casual','indie'],                0, null,                            null,              '{"dl-dg":"13:00-23:30"}')
on conflict do nothing;

-- ============================================================
-- TAULA: venue_photos (user-uploaded photos)
-- ============================================================
create table if not exists public.venue_photos (
  id           uuid primary key default gen_random_uuid(),
  venue_id     text not null,
  user_id      uuid references auth.users(id) on delete cascade,
  user_email   text,
  storage_path text not null,
  public_url   text not null,
  caption      text,
  created_at   timestamptz not null default now()
);

create index if not exists venue_photos_venue_idx on public.venue_photos(venue_id);

alter table public.venue_photos enable row level security;
create policy "photos_public_read"   on public.venue_photos for select using (true);
create policy "photos_auth_insert"   on public.venue_photos for insert with check (auth.uid() is not null);
create policy "photos_owner_delete"  on public.venue_photos for delete using (auth.uid() = user_id);

-- Storage bucket for photos (run via Supabase dashboard > Storage)
-- create bucket 'venue-photos' with public = true

-- ============================================================
-- TAULA: favorites
-- ============================================================
create table if not exists public.favorites (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  venue_id   text not null,
  created_at timestamptz not null default now(),
  unique(user_id, venue_id)
);

create index if not exists favorites_user_idx on public.favorites(user_id);

alter table public.favorites enable row level security;
create policy "favorites_owner_all" on public.favorites
  for all using (auth.uid() = user_id);
