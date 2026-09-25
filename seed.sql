-- The golden rows: what the demo's database holds after `demo reset` (every
-- night at 04:10). Testaurant is fictional: the menu it has always had, now
-- rows in `products` (prices in cents) and its hours in `hours` (0 = Sunday).
-- Closed Sundays, so "we're open Sundays 12 to 6 now" is a real change.
INSERT INTO products (name, category, price_cents, description, sort) VALUES
  ('Beef pho', 'Pho', 1300, 'Brisket and eye of round, broth started the night before.', 1),
  ('Chicken pho', 'Pho', 1200, 'Poached chicken, ginger, scallion.', 2),
  ('Grilled pork banh mi', 'Banh mi', 900, 'Lemongrass pork, pickled carrot and daikon, cilantro, bread baked this morning.', 3),
  ('Tofu banh mi', 'Banh mi', 800, 'Crisp tofu, the same pickles, chili mayo.', 4),
  ('Lemongrass chicken rice plate', 'Rice plates', 1400, 'Charred chicken thigh, broken rice, fried egg, nuoc cham.', 5),
  ('Spring rolls (2)', 'On the side', 600, 'Shrimp, herbs and vermicelli, peanut sauce.', 6),
  ('Iced Vietnamese coffee', 'Drinks', 500, 'Dark roast over condensed milk.', 7);
INSERT INTO hours (weekday, opens, closes) VALUES
  (1, '11:00', '21:00'), (2, '11:00', '21:00'), (3, '11:00', '21:00'), (4, '11:00', '21:00'),
  (5, '11:00', '22:00'), (6, '11:00', '22:00');
