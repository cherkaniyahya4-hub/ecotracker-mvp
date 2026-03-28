-- Ensure newly created profiles start with 0 points.
alter table public.profiles
alter column points set default 0;

-- Seed initial market catalog (admin can still manage/edit/delete these).
do $$
begin
  if not exists (
    select 1
    from public.market_products
    where lower(name) = lower('Brosses Dents Bambou')
  ) then
    insert into public.market_products (name, category, points, description, image, is_active)
    values (
      'Brosses Dents Bambou',
      'Zero Dechet',
      100,
      'Lot de 4 brosses biodegradables.',
      'https://picsum.photos/seed/brosses-dents-bambou/640/420',
      true
    );
  end if;

  if not exists (
    select 1
    from public.market_products
    where lower(name) = lower('Lanterne Solaire LED')
  ) then
    insert into public.market_products (name, category, points, description, image, is_active)
    values (
      'Lanterne Solaire LED',
      'Outils',
      450,
      'Autonomie 12h, recharge solaire.',
      'https://picsum.photos/seed/lanterne-solaire-led/640/420',
      true
    );
  end if;

  if not exists (
    select 1
    from public.market_products
    where lower(name) = lower('Pull Coton Recycle')
  ) then
    insert into public.market_products (name, category, points, description, image, is_active)
    values (
      'Pull Coton Recycle',
      'Vetements',
      780,
      'Pull eco-concu en coton recycle, doux et respirant.',
      'https://picsum.photos/seed/pull-coton-recycle/640/420',
      true
    );
  end if;

  if not exists (
    select 1
    from public.market_products
    where lower(name) = lower('Hachette de Camp')
  ) then
    insert into public.market_products (name, category, points, description, image, is_active)
    values (
      'Hachette de Camp',
      'Outils',
      900,
      'Manche frene, forgee main.',
      'https://picsum.photos/seed/hachette-camp/640/420',
      true
    );
  end if;

  if not exists (
    select 1
    from public.market_products
    where lower(name) = lower('Clavier Sans Fil Bluetooth')
  ) then
    insert into public.market_products (name, category, points, description, image, is_active)
    values (
      'Clavier Sans Fil Bluetooth',
      'Tech',
      1200,
      'Compact, rechargeable, multi-appareils.',
      'https://picsum.photos/seed/clavier-bluetooth/640/420',
      true
    );
  end if;

  if not exists (
    select 1
    from public.market_products
    where lower(name) = lower('Composteur Appartement')
  ) then
    insert into public.market_products (name, category, points, description, image, is_active)
    values (
      'Composteur Appartement',
      'Zero Dechet',
      1300,
      'Systeme Bokashi compact sans odeur.',
      'https://picsum.photos/seed/composteur-appartement/640/420',
      true
    );
  end if;

  if not exists (
    select 1
    from public.market_products
    where lower(name) = lower('Enceinte Bois BT')
  ) then
    insert into public.market_products (name, category, points, description, image, is_active)
    values (
      'Enceinte Bois BT',
      'Tech',
      1400,
      'Enceinte bluetooth avec coque en bois durable.',
      'https://picsum.photos/seed/enceinte-bois-bt/640/420',
      true
    );
  end if;

  if not exists (
    select 1
    from public.market_products
    where lower(name) = lower('Veste Pluie Recyclee')
  ) then
    insert into public.market_products (name, category, points, description, image, is_active)
    values (
      'Veste Pluie Recyclee',
      'Vetements',
      1800,
      'Impermeable en plastique oceanique recycle.',
      'https://picsum.photos/seed/veste-pluie-recyclee/640/420',
      true
    );
  end if;
end $$;
