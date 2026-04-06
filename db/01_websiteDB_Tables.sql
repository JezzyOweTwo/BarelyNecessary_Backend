DROP DATABASE IF EXISTS 4413_Project_Website;
CREATE DATABASE 4413_Project_Website;
USE 4413_Project_Website;

DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS carts;
DROP TABLE IF EXISTS payment_methods;
DROP TABLE IF EXISTS addresses;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    user_id VARCHAR(36) UNIQUE PRIMARY KEY NOT NULL, 
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,	
    email VARCHAR(150) NOT NULL UNIQUE,
    username VARCHAR(70) UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE addresses (
	address_id int auto_increment primary key, 
    user_id VARCHAR(36) not null,
    address_type enum('shipping', 'billing') not null,
    street varchar(300) not null,
    city varchar(100) not null,
    province varchar(100) not null,
    postal_code varchar(20) not null,
    country varchar(100) not null default 'Canada',
    is_default Boolean not null default false,
    created_at TIMESTAMP default current_timestamp,
    foreign key (user_id) references users(user_id)
		on delete cascade
        on update cascade
);
CREATE TABLE payment_methods (
    payment_id int auto_increment primary key,
    user_id varchar(36) not null,
    cardholder_name varchar(150) not null,
    card_last4 char(4) not null,
    card_brand varchar(50),
    expiry_month int not null,
    expiry_year int not null,
    is_default Boolean not null default false,
    created_at TIMESTAMP default current_timestamp,
    foreign key (user_id) references users(user_id)
		on delete cascade
        on update cascade
);
CREATE TABLE categories (
    category_id int auto_increment primary key,
    category_name varchar(100) not null unique,
    description varchar(300)
);
CREATE TABLE products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT,
    name VARCHAR(150) NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    short_tagline VARCHAR(255),
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    image_url VARCHAR(500),
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);
CREATE TABLE carts (
    cart_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
CREATE TABLE cart_items (
    cart_item_id INT AUTO_INCREMENT PRIMARY KEY,
    cart_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (cart_id, product_id),
    FOREIGN KEY (cart_id) REFERENCES carts(cart_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CHECK (quantity > 0)
);
CREATE TABLE orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    shipping_address_id INT,
    billing_address_id INT,
    payment_id INT,
    order_status ENUM('pending', 'paid', 'failed', 'cancelled', 'shipped', 'completed')
        NOT NULL DEFAULT 'pending',
    payment_status ENUM('pending', 'accepted', 'denied')
        NOT NULL DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (shipping_address_id) REFERENCES addresses(address_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    FOREIGN KEY (billing_address_id) REFERENCES addresses(address_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    FOREIGN KEY (payment_id) REFERENCES payment_methods(payment_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);
CREATE TABLE order_items (
    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT,
    quantity INT NOT NULL,
    price_at_purchase DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) GENERATED ALWAYS AS (quantity * price_at_purchase) STORED,
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    CHECK (quantity > 0)
);

SELECT * FROM categories;
SELECT * FROM products;
SELECT * FROM users;


