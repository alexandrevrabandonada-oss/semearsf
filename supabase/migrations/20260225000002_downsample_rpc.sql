create or replace function public.get_measurements_downsampled(
  p_station_id uuid,
  p_range text default '24h'
)
returns table (
  bucket_ts timestamptz,
  pm25 real,
  pm10 real,
  temp real,
  humidity real,
  quality_flag text
)
language sql
stable
as $$
  with params as (
    select
      case
        when p_range = '7d' then interval '7 days'
        else interval '24 hours'
      end as time_window,
      case
        when p_range = '7d' then interval '15 minutes'
        else interval '1 minute'
      end as bucket_size
  ),
  source as (
    select
      date_bin(params.bucket_size, m.ts, '1970-01-01 00:00:00+00'::timestamptz) as bucket_ts,
      m.pm25,
      m.pm10,
      m.temp,
      m.humidity,
      m.quality_flag
    from public.measurements m
    cross join params
    where m.station_id = p_station_id
      and m.ts >= now() - params.time_window
  ),
  grouped as (
    select
      source.bucket_ts,
      avg(source.pm25)::real as pm25,
      avg(source.pm10)::real as pm10,
      avg(source.temp)::real as temp,
      avg(source.humidity)::real as humidity,
      max(
        case source.quality_flag
          when 'calibrating' then 4
          when 'missing' then 3
          when 'suspect' then 2
          when 'ok' then 1
          else 0
        end
      ) as quality_rank
    from source
    group by source.bucket_ts
  )
  select
    grouped.bucket_ts,
    grouped.pm25,
    grouped.pm10,
    grouped.temp,
    grouped.humidity,
    case grouped.quality_rank
      when 4 then 'calibrating'
      when 3 then 'missing'
      when 2 then 'suspect'
      when 1 then 'ok'
      else null
    end as quality_flag
  from grouped
  order by grouped.bucket_ts desc;
$$;

grant execute on function public.get_measurements_downsampled(uuid, text) to anon, authenticated;
