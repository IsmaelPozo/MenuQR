-- Crear base de datos
CREATE DATABASE IF NOT EXISTS qr_menu_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE qr_menu_app;

-- Tabla de restaurantes
CREATE TABLE restaurants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    logo_url TEXT,
    default_language ENUM('es', 'en', 'fr', 'de') DEFAULT 'es',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de mesas
CREATE TABLE tables (
    id INT PRIMARY KEY AUTO_INCREMENT,
    restaurant_id INT NOT NULL,
    table_number INT NOT NULL,
    qr_code VARCHAR(255) UNIQUE NOT NULL,
    status ENUM('available', 'occupied', 'reserved') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    UNIQUE KEY unique_table_per_restaurant (restaurant_id, table_number)
);

-- Tabla de categorías de menú
CREATE TABLE menu_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    restaurant_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- Tabla de elementos del menú
CREATE TABLE menu_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    restaurant_id INT NOT NULL,
    category_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES menu_categories(id) ON DELETE CASCADE
);

-- Tabla de pedidos
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    restaurant_id INT NOT NULL,
    table_id INT NOT NULL,
    customer_name VARCHAR(255),
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('received', 'preparing', 'ready', 'served', 'paid') DEFAULT 'received',
    payment_status ENUM('pending', 'individual', 'table_complete') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE CASCADE
);

-- Tabla de elementos de pedido
CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    menu_item_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE
);

-- Insertar datos de ejemplo
INSERT INTO restaurants (name, email, password, address, phone, default_language) VALUES
('Ristorante La Nonna', 'admin@lanonna.com', '$2b$10$rQZ9QmjytWIeVqb.vKF5/.K4CtNtoeGm5FUKY.grSf.58aXBn4PSi', 'Calle Mayor 123, Madrid', '+34 91 123 4567', 'es');

SET @restaurant_id = LAST_INSERT_ID();

-- Insertar mesas
INSERT INTO tables (restaurant_id, table_number, qr_code) VALUES
(@restaurant_id, 1, CONCAT('table_', @restaurant_id, '_1')),
(@restaurant_id, 2, CONCAT('table_', @restaurant_id, '_2')),
(@restaurant_id, 3, CONCAT('table_', @restaurant_id, '_3')),
(@restaurant_id, 4, CONCAT('table_', @restaurant_id, '_4')),
(@restaurant_id, 5, CONCAT('table_', @restaurant_id, '_5'));

-- Insertar categorías
INSERT INTO menu_categories (restaurant_id, name, sort_order) VALUES
(@restaurant_id, 'Antipasti', 'Appetizers', 'Entrées', 'Vorspeisen', 1),
(@restaurant_id, 'Primi Piatti', 'First Courses', 'Premiers Plats', 'Erste Gänge', 2),
(@restaurant_id, 'Secondi Piatti', 'Main Courses', 'Plats Principaux', 'Hauptgerichte', 3),
(@restaurant_id, 'Dolci', 'Desserts', 'Desserts', 'Nachspeisen', 4),
(@restaurant_id, 'Bevande', 'Beverages', 'Boissons', 'Getränke', 5);

-- Insertar elementos del menú
INSERT INTO menu_items (restaurant_id, category_id, name, description, price, sort_order) VALUES
-- Antipasti
(@restaurant_id, 1, 'Bruschetta Classica', 'Pan tostado con tomate fresco, albahaca y aceite de oliva', 8.50, 1),
(@restaurant_id, 1, 'Antipasto Misto', 'Selección de embutidos, quesos y verduras marinadas', 12.90, 2),

-- Primi Piatti
(@restaurant_id, 2, 'Spaghetti Carbonara', 'Pasta con huevo, panceta, queso pecorino y pimienta negra', 13.50, 1),
(@restaurant_id, 2, 'Risotto ai Funghi', 'Arroz cremoso con setas variadas y parmesano', 15.90, 2),

-- Secondi Piatti
(@restaurant_id, 3, 'Pollo alla Parmigiana', 'Pechuga de pollo empanada con mozzarella y tomate', 18.50, 1),

-- Dolci
(@restaurant_id, 4, 'Tiramisu', 'Postre tradicional con café, mascarpone y cacao', 6.50, 1),

-- Bevande
(@restaurant_id, 5, 'Agua Mineral', 'Agua con o sin gas', 2.50, 1),
(@restaurant_id, 5, 'Vino de la Casa', 'Tinto o blanco - copa', 4.50, 2);
