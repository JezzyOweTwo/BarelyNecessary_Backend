USE `4413_Project_Website`;

INSERT INTO categories (category_id, category_name, description) VALUES
(1, 'Room & Setup', 'A curated selection of room and desk essentials designed to upgrade your study and gaming environment.'),
(2, 'Mugs & Coffee', 'A curated collection of drinkware and coffee essentials for students and work-from-home setups.'),
(3, 'Laptop Accessories', 'High-quality accessories designed to improve laptop productivity, portability, and setup flexibility.'),
(4, 'IT Geek / Hacker Zone', 'A specialized collection of tools and devices for tech enthusiasts, cybersecurity learners, and developers.'),
(5, 'IT Geek Essentials', 'Useful and premium setup tools, peripherals, and workspace gear for programmers and tech users.');

INSERT INTO products (
  category_id,
  name,
  brand,
  model,
  short_tagline,
  description,
  price,
  stock_quantity,
  image_url,
  is_featured,
  is_active
)
VALUES
(
  1,
  'Vivobook Pro',
  'ASUS',
  'K3502ZA',
  'Fast and sleek',
  'A solid laptop for school and work.',
  999.99,
  10,
  'https://example.com/laptop.jpg',
  TRUE,
  TRUE
),
(
  2,
  'Wireless Mouse',
  'Logitech',
  'M185',
  'Simple and reliable',
  'Compact wireless mouse.',
  24.99,
  30,
  'https://example.com/mouse.jpg',
  FALSE,
  TRUE
);

INSERT INTO users (
  first_name,
  last_name,
  email,
  username,
  password,
  phone,
  role,
  is_active
)
VALUES
(
  'Nadeen',
  'H',
  'nadeen@example.com',
  'nadeenrh',
  'nadeenPass',
  '6470000000',
  'admin',
  TRUE
),
(
  'Test',
  'User',
  'testuser@example.com',
  'testuser1',
  'testPass',
  '6471111111',
  'customer',
  TRUE
);

SELECT * FROM categories;
SELECT * FROM products;
SELECT * FROM users;
SET SQL_SAFE_UPDATES = 0;
DELETE FROM products;
SET SQL_SAFE_UPDATES = 1;

SELECT * FROM products;

INSERT INTO products 
(category_id, name, brand, model, short_tagline, description, price, stock_quantity, image_url, is_featured, is_active)
VALUES
-- Room & Setup (category_id = 1)
(1, 'Gaming Desk with LED & Power Hub', 'BarelyNecessary', 'BN-Desk-X1', 'Your life will not change, but your setup will look insane.', 'Spacious gaming desk with built-in RGB lighting and integrated power outlets for a clean, aesthetic setup.', 249.99, 10, NULL, 1, 1),
(1, 'Ergonomic Office Chair (Lumbar Support)', 'BarelyNecessary', 'BN-Chair-Pro', 'Sit longer, regret less.', 'Comfortable ergonomic chair with adjustable lumbar support designed for long study or work sessions.', 179.99, 15, NULL, 0, 1),
(1, 'RGB LED Light Strip Kit (App Controlled)', 'BarelyNecessary', 'BN-RGB-Strip', 'Soft lighting fixes everything.', 'Customizable LED light strips with mobile app control, perfect for room ambiance and desk setups.', 39.99, 25, NULL, 1, 1),
(1, 'Adjustable Monitor Arm Mount', 'BarelyNecessary', 'BN-Arm-01', 'One monitor is never enough.', 'Fully adjustable monitor arm to improve desk space and ergonomics.', 89.99, 12, NULL, 0, 1),

-- Coffee & Drinkware (category_id = 2)
(2, 'Insulated Travel Mug (Heat Retention)', 'BarelyNecessary', 'BN-Mug-Heat', 'Still warm, unlike your motivation.', 'Double-wall insulated mug that keeps beverages hot for hours, perfect for long days.', 29.99, 30, NULL, 1, 1),
(2, 'Portable Espresso Maker (Battery Powered)', 'BarelyNecessary', 'BN-Espresso-Go', 'Caffeine anywhere, excuses nowhere.', 'Compact portable espresso machine powered by battery for on-the-go coffee.', 119.99, 8, NULL, 1, 1),
(2, 'Electric Milk Frother', 'BarelyNecessary', 'BN-Froth-X', 'Because plain coffee is too honest.', 'Automatic milk frother for making café-style drinks at home.', 49.99, 20, NULL, 0, 1),

-- Laptop Accessories (category_id = 3)
(3, 'Portable Monitor (USB-C, Ultra Slim)', 'BarelyNecessary', 'BN-Monitor-Go', 'Double your screen, not your productivity.', 'Lightweight portable monitor for dual-screen setups anywhere.', 199.99, 10, NULL, 1, 1),
(3, 'USB-C Docking Station (Multi-Port)', 'BarelyNecessary', 'BN-Dock-Pro', 'This will fix your setup. Probably.', 'Multi-port USB-C dock supporting HDMI, USB, and power delivery.', 89.99, 18, NULL, 0, 1),
(3, 'Aluminum Laptop Stand (Foldable)', 'BarelyNecessary', 'BN-Stand-Air', 'Better posture, same problems.', 'Foldable aluminum stand for improved ergonomics and airflow.', 34.99, 25, NULL, 0, 1),
(3, 'External SSD 1TB (High Speed)', 'BarelyNecessary', 'BN-SSD-1TB', 'For files you swear are important.', 'Portable high-speed SSD for backups and large file storage.', 129.99, 14, NULL, 1, 1),

-- 🧠 IT Geek / Hacker Zone (category_id = 4)
(4, 'Raspberry Pi 5 Starter Kit', 'BarelyNecessary', 'BN-Pi-5', 'I will build something cool. Eventually.', 'Complete Raspberry Pi kit including board, power supply, and accessories.', 149.99, 10, NULL, 1, 1),
(4, 'Flipper Zero Multi-Tool Device', 'BarelyNecessary', 'BN-Flipper', 'Definitely not for causing problems.', 'Multi-functional portable device for hardware exploration and testing.', 199.99, 6, NULL, 1, 1),
(4, 'WiFi Pineapple (Pentesting Tool)', 'BarelyNecessary', 'BN-Pineapple', 'Learn security by breaking things.', 'Professional WiFi auditing and penetration testing device.', 249.99, 5, NULL, 0, 1),
(4, 'HackRF One SDR', 'BarelyNecessary', 'BN-HackRF', 'Signals everywhere, now you can see them.', 'Software-defined radio platform for RF experimentation and research.', 299.99, 4, NULL, 0, 1),

-- 🧪 IT Geek Essentials (category_id = 5)
(5, 'Mechanical Keyboard (Hot-Swappable)', 'BarelyNecessary', 'BN-Key-Pro', 'Typing faster won’t fix your code.', 'Premium mechanical keyboard with customizable switches.', 129.99, 20, NULL, 1, 1),
(5, 'Gaming Mouse (Ultra Lightweight)', 'BarelyNecessary', 'BN-Mouse-X', 'Precision won’t fix your aim.', 'High DPI lightweight gaming mouse for performance and comfort.', 69.99, 25, NULL, 0, 1),
(5, 'Monitor Light Bar (No Glare)', 'BarelyNecessary', 'BN-LightBar', 'Lighting that actually makes sense.', 'Screen-mounted light bar that reduces eye strain.', 59.99, 18, NULL, 0, 1),
(5, 'Stream Deck (Programmable Keys)', 'BarelyNecessary', 'BN-StreamDeck', 'One button, infinite shortcuts.', 'Customizable macro pad for productivity and streaming.', 149.99, 10, NULL, 1, 1);