alter table public.dashboard_leaderboard
add column if not exists avatar_blob bytea;

alter table public.dashboard_leaderboard
add column if not exists avatar_mime_type text;

alter table public.market_products
add column if not exists image_blob bytea;

alter table public.market_products
add column if not exists image_mime_type text;

create index if not exists idx_dashboard_leaderboard_score
on public.dashboard_leaderboard(score desc);

-- Replace local-file avatar paths with DB blobs and keep mime metadata.
update public.dashboard_leaderboard as d
set
  avatar_blob = coalesce(
    d.avatar_blob,
    convert_to(
      format(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" rx="18" fill="#124328"/><circle cx="48" cy="48" r="30" fill="#1f5b36"/><text x="50%%" y="56%%" font-size="28" text-anchor="middle" fill="#e8fff1" font-family="Arial, sans-serif">%s</text></svg>',
        coalesce(
          nullif(
            upper(left(split_part(d.display_name, ' ', 1), 1) || left(split_part(d.display_name, ' ', 2), 1)),
            ''
          ),
          'ET'
        )
      ),
      'UTF8'
    )
  ),
  avatar_mime_type = coalesce(d.avatar_mime_type, 'image/svg+xml'),
  avatar_url = case
    when coalesce(d.avatar_url, '') like '../assets/%' then null
    else d.avatar_url
  end;

-- Ensure market images can be served from DB blobs instead of local paths.
update public.market_products as m
set
  image_blob = coalesce(
    m.image_blob,
    convert_to(
      format(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 420"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%%" stop-color="#1f5b36"/><stop offset="100%%" stop-color="#0d2d1d"/></linearGradient></defs><rect width="640" height="420" fill="url(#g)"/><text x="50%%" y="52%%" font-size="42" text-anchor="middle" fill="#e8fff1" font-family="Arial, sans-serif">%s</text></svg>',
        coalesce(nullif(left(m.name, 24), ''), 'Eco Item')
      ),
      'UTF8'
    )
  ),
  image_mime_type = coalesce(m.image_mime_type, 'image/svg+xml'),
  image = case
    when coalesce(m.image, '') like '../assets/%' then null
    else m.image
  end;
