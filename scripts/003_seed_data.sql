-- Insert sample restaurant
INSERT INTO public.restaurants (id, name, email, address, phone, default_language)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Ristorante La Nonna',
    'admin@lanonna.com',
    'Calle Mayor 123, Madrid',
    '+34 91 123 4567',
    'es'
) ON CONFLICT (email) DO NOTHING;

-- Insert sample tables
INSERT INTO public.tables (restaurant_id, table_number, qr_code, status) VALUES
('00000000-0000-0000-0000-000000000001', 1, 'table_1_qr', 'available'),
('00000000-0000-0000-0000-000000000001', 2, 'table_2_qr', 'available'),
('00000000-0000-0000-0000-000000000001', 3, 'table_3_qr', 'available'),
('00000000-0000-0000-0000-000000000001', 4, 'table_4_qr', 'available'),
('00000000-0000-0000-0000-000000000001', 5, 'table_5_qr', 'available')
ON CONFLICT (qr_code) DO NOTHING;

-- Insert sample menu categories
INSERT INTO public.menu_categories (id, restaurant_id, name, sort_order) VALUES
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Antipasti', 1),
('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Primi Piatti', 2),
('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Secondi Piatti', 3),
('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Dolci', 4),
('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Bevande', 5)
ON CONFLICT DO NOTHING;

-- Insert sample menu items
INSERT INTO public.menu_items (restaurant_id, category_id, name, description, price, is_available, sort_order) VALUES
-- Antipasti
('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Bruschetta Classica', 'Pan tostado con tomate fresco, albahaca y aceite de oliva', 8.50, true, 1),
('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Antipasto Misto', 'Selección de embutidos, quesos y verduras marinadas', 12.90, true, 2),
-- Primi Piatti
('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'Spaghetti Carbonara', 'Pasta con huevo, panceta, queso pecorino y pimienta negra', 13.50, true, 1),
('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'Risotto ai Funghi', 'Arroz cremoso con setas variadas y parmesano', 15.90, true, 2),
-- Secondi Piatti
('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'Pollo alla Parmigiana', 'Pechuga de pollo empanada con mozzarella y tomate', 18.50, true, 1),
-- Dolci
('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 'Tiramisu', 'Postre tradicional con café, mascarpone y cacao', 6.50, true, 1),
-- Bevande
('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000005', 'Agua Mineral', 'Agua con o sin gas', 2.50, true, 1),
('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000005', 'Vino de la Casa', 'Tinto o blanco - copa', 4.50, true, 2);
