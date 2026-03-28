insert into public.market_products (id, name, category, points, description, image, is_active)
values
  (1, 'Pull Coton Recycle', 'Vetements', 780, 'Pull eco-concu en coton recycle, doux et respirant.', 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&auto=format&fit=crop&q=60', true),
  (2, 'Veste Pluie Recyclee', 'Vetements', 1800, 'Impermeable en plastique oceanique recycle.', 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&auto=format', true),
  (3, 'Lanterne Solaire LED', 'Outils', 450, 'Autonomie 12h, recharge solaire.', 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=500&auto=format', true),
  (4, 'Hachette de Camp', 'Outils', 900, 'Manche frene, forgee main.', 'https://images.unsplash.com/photo-1502126324834-38f8e02d7160?w=500&auto=format', true),
  (5, 'Clavier Sans Fil Bluetooth', 'Tech', 1200, 'Compact, rechargeable, multi-appareils.', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=60', true),
  (6, 'Enceinte Bois BT', 'Tech', 1400, 'Enceinte bluetooth avec coque en bois durable.', 'https://images.unsplash.com/photo-1589003077984-894e133dabab?w=500&auto=format', true),
  (7, 'Brosses Dents Bambou', 'Zero Dechet', 100, 'Lot de 4 brosses biodegradables.', 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=500&auto=format', true),
  (8, 'Composteur Appartement', 'Zero Dechet', 1300, 'Systeme Bokashi compact sans odeur.', 'https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?w=500&auto=format', true)
on conflict (id) do update set
  name = excluded.name,
  category = excluded.category,
  points = excluded.points,
  description = excluded.description,
  image = excluded.image,
  is_active = excluded.is_active;
