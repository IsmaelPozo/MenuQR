-- Enable Row Level Security on all tables
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for restaurants
-- Restaurant owners can view and update their own restaurant
CREATE POLICY "restaurants_select_own" ON public.restaurants
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "restaurants_update_own" ON public.restaurants
    FOR UPDATE USING (auth.uid()::text = id::text);

-- RLS Policies for tables
-- Restaurant owners can manage their tables
CREATE POLICY "tables_select_own" ON public.tables
    FOR SELECT USING (
        restaurant_id IN (SELECT id FROM public.restaurants WHERE auth.uid()::text = id::text)
    );

CREATE POLICY "tables_insert_own" ON public.tables
    FOR INSERT WITH CHECK (
        restaurant_id IN (SELECT id FROM public.restaurants WHERE auth.uid()::text = id::text)
    );

CREATE POLICY "tables_update_own" ON public.tables
    FOR UPDATE USING (
        restaurant_id IN (SELECT id FROM public.restaurants WHERE auth.uid()::text = id::text)
    );

CREATE POLICY "tables_delete_own" ON public.tables
    FOR DELETE USING (
        restaurant_id IN (SELECT id FROM public.restaurants WHERE auth.uid()::text = id::text)
    );

-- Public can view tables by QR code
CREATE POLICY "tables_select_by_qr" ON public.tables
    FOR SELECT USING (true);

-- RLS Policies for menu_categories
CREATE POLICY "menu_categories_select_own" ON public.menu_categories
    FOR SELECT USING (
        restaurant_id IN (SELECT id FROM public.restaurants WHERE auth.uid()::text = id::text)
        OR true -- Allow public to view menu categories
    );

CREATE POLICY "menu_categories_insert_own" ON public.menu_categories
    FOR INSERT WITH CHECK (
        restaurant_id IN (SELECT id FROM public.restaurants WHERE auth.uid()::text = id::text)
    );

CREATE POLICY "menu_categories_update_own" ON public.menu_categories
    FOR UPDATE USING (
        restaurant_id IN (SELECT id FROM public.restaurants WHERE auth.uid()::text = id::text)
    );

CREATE POLICY "menu_categories_delete_own" ON public.menu_categories
    FOR DELETE USING (
        restaurant_id IN (SELECT id FROM public.restaurants WHERE auth.uid()::text = id::text)
    );

-- RLS Policies for menu_items
CREATE POLICY "menu_items_select_public" ON public.menu_items
    FOR SELECT USING (true); -- Allow public to view menu items

CREATE POLICY "menu_items_insert_own" ON public.menu_items
    FOR INSERT WITH CHECK (
        restaurant_id IN (SELECT id FROM public.restaurants WHERE auth.uid()::text = id::text)
    );

CREATE POLICY "menu_items_update_own" ON public.menu_items
    FOR UPDATE USING (
        restaurant_id IN (SELECT id FROM public.restaurants WHERE auth.uid()::text = id::text)
    );

CREATE POLICY "menu_items_delete_own" ON public.menu_items
    FOR DELETE USING (
        restaurant_id IN (SELECT id FROM public.restaurants WHERE auth.uid()::text = id::text)
    );

-- RLS Policies for orders
CREATE POLICY "orders_select_own" ON public.orders
    FOR SELECT USING (
        restaurant_id IN (SELECT id FROM public.restaurants WHERE auth.uid()::text = id::text)
        OR true -- Allow customers to view orders
    );

CREATE POLICY "orders_insert_public" ON public.orders
    FOR INSERT WITH CHECK (true); -- Allow customers to create orders

CREATE POLICY "orders_update_own" ON public.orders
    FOR UPDATE USING (
        restaurant_id IN (SELECT id FROM public.restaurants WHERE auth.uid()::text = id::text)
    );

-- RLS Policies for order_items
CREATE POLICY "order_items_select_public" ON public.order_items
    FOR SELECT USING (true);

CREATE POLICY "order_items_insert_public" ON public.order_items
    FOR INSERT WITH CHECK (true);

CREATE POLICY "order_items_update_own" ON public.order_items
    FOR UPDATE USING (
        order_id IN (
            SELECT o.id FROM public.orders o
            JOIN public.restaurants r ON o.restaurant_id = r.id
            WHERE auth.uid()::text = r.id::text
        )
    );
