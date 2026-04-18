USE `4413_Project_Website`;

SET SQL_SAFE_UPDATES = 0;
-- DELETE FROM products;
-- DELETE FROM categories;
SET SQL_SAFE_UPDATES = 1;

INSERT INTO categories (category_id, category_name, description) VALUES
(1, 'Room & Setup', 'A curated selection of room and desk essentials designed to create a clean, functional, and modern space. Thoughtfully selected items that transform your room into a version of yourself you haven’t fully become yet. Guests will assume you have routines. You don’t need to have your life together—just your setup. Sometimes, a well-designed room is enough to feel like you''re getting somewhere.'),
(2, 'Coffee & Drinkware', 'A curated collection of drinkware for those who treat coffee less as a beverage and more as a coping mechanism. Built to maintain temperature, routine, and a fragile sense of stability throughout the day. Designed for early mornings, late nights, and the undefined hours in between. Each item supports the belief that one more cup might fix everything. Spoiler: it won''t, but it helps. Clean aesthetics ensure your breakdown looks organized. Because hydration is important, but caffeine is essential.'),
(3, 'Laptop Accessories', 'High-quality tech essentials designed to improve focus, comfort, and performance. From mechanical keyboards to precision accessories, each product is built for reliability and a satisfying user experience. These tools support long work sessions, creative tasks, and everything in between. Over time, the small details start to make a big difference in how you work. Or at least, they make it feel like you''re working better.'),
(4, 'IT Geek Hacker Zone', 'A specialized collection of tools for learning, experimentation, and hands-on exploration in tech. Designed for enthusiasts, students, and builders, these products support deeper understanding of systems, networks, and hardware. Whether you''re testing ideas or building projects, they offer powerful capabilities in compact forms. Along the way, you may find yourself exploring more than you initially planned. Because curiosity tends to grow the moment you realize how much there is to uncover.');


INSERT INTO users (user_id,first_name,last_name,email,username,password,phone,role,is_active)
VALUES
('9f3c2a7e-6b4d-4f91-8c2a-5e7b1d9a3c44','Nadeen','H','nadeen@example.com','nadeenrh','nadeenPass','6470000000','admin',TRUE),
('d2a8e1b5-3c6f-47ad-b9e2-0f4c8a7d6e91','Test','User','testuser@example.com','testuser1','testPass','6471111111','customer',TRUE);

-- SELECT * FROM categories;
-- SELECT * FROM products;
-- SELECT * FROM users;
-- SET SQL_SAFE_UPDATES = 0;
-- DELETE FROM products;
-- SET SQL_SAFE_UPDATES = 1;

-- SELECT * FROM products;

INSERT INTO products
(category_id, name, brand, model, short_tagline, description, price, stock_quantity, image_url, is_featured, is_active)
VALUES
-- Category 1: Room & Setup (10)
(1, 'Gaming Desk', 'Generic', 'GD-01', 'Full setup ready', 'Spacious desk with lighting and outlets. Makes your setup look productive even when you are not.', 199.99, 10, NULL, 1, 1),
(1, 'Ergonomic Chair', 'Generic', 'EC-02', 'Comfort support', 'Designed for long sessions and better posture. Supports your back through questionable life choices.', 149.99, 15, NULL, 1, 1),
(1, 'LED Light Strip', 'Generic', 'LS-03', 'Custom lighting', 'App-controlled lighting for any mood. Mainly used to feel something.', 18.99, 40, NULL, 0, 1),
(1, 'Smart Desk Lamp', 'Generic', 'DL-04', 'Adaptive lighting', 'Adjustable brightness and tone for focus. Or pretending to focus.', 39.99, 25, NULL, 0, 1),
(1, 'Bedside Table', 'Generic', 'BT-05', 'Charge and store', 'Compact table with charging ports. Keeps essentials and bad decisions within reach.', 59.99, 20, NULL, 0, 1),
(1, 'Monitor Arm Mount', 'Generic', 'MA-06', 'Flexible positioning', 'Adjustable mount for better ergonomics. Small changes that feel like big progress.', 42.99, 18, NULL, 0, 1),
(1, 'Cable Management Kit', 'Generic', 'CM-07', 'Clean setup', 'Hides messy cables neatly. The only thing in your life that stays organized.', 17.99, 35, NULL, 0, 1),
(1, 'Pegboard Organizer', 'Generic', 'PO-08', 'Wall storage', 'Aesthetic wall organizer for setups. Turns chaos into decor.', 29.99, 22, NULL, 0, 1),
(1, 'Standing Desk Converter', 'Generic', 'SD-09', 'Sit or stand', 'Switch between sitting and standing. Movement without real change.', 89.99, 12, NULL, 1, 1),
(1, 'Mini Fridge', 'Generic', 'MF-10', 'Snacks nearby', 'Compact fridge for drinks and snacks. Minimizes effort required to function.', 79.99, 14, NULL, 0, 1),

-- Category 2: Coffee & Drinkware (10)
(2, 'Insulated Travel Mug', 'Generic', 'TM-11', 'Hot for hours', 'Keeps drinks warm for hours. Like holding onto routines that barely hold you together.', 29.99, 30, NULL, 1, 1),
(2, 'Smart Temperature Mug', 'Generic', 'STM-12', 'Perfect temperature', 'Maintains exact temperature. Control where it actually matters.', 89.99, 12, NULL, 1, 1),
(2, 'Cold Brew Bottle', 'Generic', 'CB-13', 'Smooth cold brew', 'Easy overnight brewing. Effort delayed, results still acceptable.', 24.99, 28, NULL, 1, 0),
(2, 'French Press Set', 'Generic', 'FP-14', 'Classic brewing', 'Simple coffee brewing method. Makes mornings feel intentional.', 34.99, 20, NULL, 0, 1),
(2, 'Electric Milk Frother', 'Generic', 'MF-15', 'Creamy foam fast', 'Café-style drinks at home. Adds unnecessary sophistication to survival.', 27.99, 26, NULL, 0, 1),
(2, 'Portable Espresso Maker', 'Generic', 'PE-16', 'Espresso anywhere', 'Compact espresso maker. Stability not included.', 59.99, 10, NULL, 1, 1),
(2, 'Leak-Proof Flask', 'Generic', 'LF-17', 'No spills', 'Secure and portable. Unlike your schedule.', 22.99, 33, NULL, 0, 1),
(2, 'Glass Coffee Cups', 'Generic', 'GC-18', 'Clean aesthetic', 'Minimal glass cups. Makes chaos look curated.', 19.99, 40, NULL, 0, 1),
(2, 'Coffee Starter Kit', 'Generic', 'CSK-19', 'Everything included', 'Starter bundle for people entering their coffee era.', 74.99, 9, NULL, 1, 1),
(2, 'Self-Heating Plate', 'Generic', 'SHP-20', 'Warm mug spot', 'Keeps your mug warm on your desk while life stays cold.', 21.99, 16, NULL, 0, 1),

-- Category 3: Laptop Accessories (20)
(3, 'Portable Monitor', 'Generic', 'PM-21', 'Second screen', 'Lightweight external monitor for work, school, or pretending to multitask.', 149.99, 12, NULL, 1, 1),
(3, 'Laptop Sleeve', 'Generic', 'LS-22', 'Safe carry', 'Protective sleeve for your laptop with a soft interior.', 24.99, 30, NULL, 0, 0),
(3, 'USB-C Dock', 'Generic', 'UD-23', 'More ports', 'Docking station with multiple ports for modern laptop chaos.', 64.99, 20, NULL, 0, 1),
(3, 'Cooling Pad', 'Generic', 'CP-24', 'Cool airflow', 'Laptop cooling pad to help with heat and questionable thermal design.', 32.99, 25, NULL, 0, 1),
(3, 'Laptop Stand', 'Generic', 'LS-25', 'Raise your screen', 'Metal stand for better posture and airflow.', 28.99, 22, NULL, 1, 0),
(3, 'External SSD', 'Generic', 'ESD-26', 'Fast storage', 'Portable SSD for backups, projects, and digital clutter.', 99.99, 14, NULL, 1, 1),
(3, 'Wireless Keyboard', 'Generic', 'WK-27', 'Type freely', 'Wireless keyboard for flexible setups and cleaner desks.', 39.99, 18, NULL, 0, 1),
(3, 'Bluetooth Keyboard', 'Generic', 'BK-28', 'Compact typing', 'Slim Bluetooth keyboard for tablets, laptops, and tiny desk energy.', 34.99, 17, NULL, 0, 1),
(3, 'Privacy Screen', 'Generic', 'PS-29', 'Eyes off', 'Screen protector that limits side viewing for privacy.', 26.99, 19, NULL, 0, 1),
(3, 'Laptop Riser', 'Generic', 'LR-30', 'Simple height boost', 'Portable riser that improves angle and airflow.', 23.99, 21, NULL, 0, 1),
(3, 'Mechanical Keyboard', 'Generic', 'MK-31', 'Clicky build', 'Mechanical keyboard with satisfying switches and zero promise of better code.', 79.99, 15, NULL, 1, 1),
(3, 'Keycap Set', 'Generic', 'KS-32', 'Customize keys', 'Decorative and replacement keycap set for mechanical keyboards.', 29.99, 24, NULL, 0, 1),
(3, 'Gaming Mouse', 'Generic', 'GM-33', 'Precise movement', 'Responsive mouse for work and gaming. Skill sold separately.', 35.99, 27, NULL, 0, 1),
(3, 'XXL Desk Mat', 'Generic', 'DM-34', 'Desk coverage', 'Large desk mat for keyboard, mouse, and the illusion of control.', 19.99, 29, NULL, 0, 1),
(3, 'Monitor Light Bar', 'Generic', 'MLB-35', 'Soft screen lighting', 'Mounted monitor light to reduce eye strain during long sessions.', 44.99, 13, NULL, 0, 1),
(3, 'USB-C Adapter', 'Generic', 'UA-36', 'Small but useful', 'Compact adapter for ports your laptop refuses to include.', 14.99, 40, NULL, 1, 0),
(3, 'Wireless Charger', 'Generic', 'WC-37', 'Drop and charge', 'Simple wireless charging pad for your desk setup.', 25.99, 20, NULL, 0, 1),
(3, 'Cable Organizer', 'Generic', 'CO-38', 'Tidy cables', 'Small organizer set to keep cables from becoming spaghetti.', 12.99, 32, NULL, 0, 1),
(3, 'Noise Cancel Headphones', 'Generic', 'NCH-39', 'Block the world', 'Over-ear headphones with noise cancellation for focus and peace.', 129.99, 11, NULL, 1, 1),
(3, 'Stream Deck', 'Generic', 'SD-40', 'Shortcut buttons', 'Programmable macro pad for productivity, streaming, or peak laziness.', 109.99, 10, NULL, 0, 1),

-- Category 4: IT Geek Hacker Zone (10)
(4, 'Raspberry Pi 5 Kit', 'Generic', 'RP5-41', 'Mini project beast', 'Starter kit for building side projects and opening too many tabs.', 119.99, 10, NULL, 1, 1),
(4, 'Flipper Zero', 'Generic', 'FZ-42', 'Pocket chaos', 'Portable multi-tool for hardware exploration and testing.', 199.99, 6, NULL, 1, 1),
(4, 'Proxmark3', 'Generic', 'PM3-43', 'RFID research', 'Advanced RFID research tool for learning and experimentation.', 249.99, 5, NULL, 0, 1),
(4, 'HackRF One', 'Generic', 'HRF-44', 'Signal playground', 'Software-defined radio device for wireless experimentation.', 299.99, 4, NULL, 0, 1),
(4, 'WiFi Pineapple', 'Generic', 'WFP-45', 'Network testing', 'Wireless auditing device used for network security learning.', 219.99, 3, NULL, 0, 0),
(4, 'Rubber Ducky', 'Generic', 'RD-46', 'Tiny attack script goblin', 'Programmable USB keystroke injection tool for demos and testing.', 69.99, 12, NULL, 0, 1),
(4, 'ESP32 Kit', 'Generic', 'ESP-47', 'IoT starter', 'Microcontroller kit for wireless and embedded projects.', 18.99, 25, NULL, 1, 0),
(4, 'Arduino Kit', 'Generic', 'AK-48', 'Build random stuff', 'Electronics starter kit for sensors, coding, and experiments.', 49.99, 16, NULL, 0, 1),
(4, 'PenTesting Toolkit', 'Generic', 'PTK-49', 'Security bundle', 'General toolkit with accessories for lab testing and learning.', 89.99, 8, NULL, 0, 1),
(4, 'NFC Cloner', 'Generic', 'NFC-50', 'Tap and test', 'Device used for NFC reading and lab experimentation.', 59.99, 7, NULL, 0, 1);

SELECT category_id, COUNT(*) AS product_count
FROM products
GROUP BY category_id
ORDER BY category_id;