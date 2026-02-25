alter table public.stations
add column if not exists code text;

create unique index if not exists ux_stations_code
on public.stations (code);
