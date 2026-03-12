USE `4413_Project_Website`;

INSERT INTO categories (category_name, description)
VALUES
('Laptops', 'Portable computers'),
('Accessories', 'Computer accessories');

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