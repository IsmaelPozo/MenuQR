-- Add translation support and allergen fields to menu tables

-- First, backup existing data by creating temporary columns
ALTER TABLE public.menu_categories 
ADD COLUMN IF NOT EXISTS name_backup VARCHAR(255);

ALTER TABLE public.menu_items 
ADD COLUMN IF NOT EXISTS name_backup VARCHAR(255),
ADD COLUMN IF NOT EXISTS description_backup TEXT;

-- Copy existing data to backup columns
UPDATE public.menu_categories SET name_backup = name WHERE name_backup IS NULL;
UPDATE public.menu_items SET name_backup = name WHERE name_backup IS NULL;
UPDATE public.menu_items SET description_backup = description WHERE description_backup IS NULL;

-- Drop old columns and create new JSONB columns for translations
ALTER TABLE public.menu_categories 
DROP COLUMN IF EXISTS name CASCADE,
ADD COLUMN name JSONB DEFAULT '{}'::jsonb;

ALTER TABLE public.menu_items 
DROP COLUMN IF EXISTS name CASCADE,
DROP COLUMN IF EXISTS description CASCADE,
ADD COLUMN name JSONB DEFAULT '{}'::jsonb,
ADD COLUMN description JSONB DEFAULT '{}'::jsonb,
ADD COLUMN ingredients JSONB DEFAULT '{}'::jsonb,
ADD COLUMN allergens JSONB DEFAULT '{}'::jsonb,
ADD COLUMN traces JSONB DEFAULT '{}'::jsonb;

-- Migrate backup data to new JSONB format (assuming Spanish as default)
UPDATE public.menu_categories 
SET name = jsonb_build_object('es', name_backup)
WHERE name_backup IS NOT NULL AND name_backup != '';

UPDATE public.menu_items 
SET name = jsonb_build_object('es', name_backup)
WHERE name_backup IS NOT NULL AND name_backup != '';

UPDATE public.menu_items 
SET description = jsonb_build_object('es', description_backup)
WHERE description_backup IS NOT NULL AND description_backup != '';

-- Drop backup columns
ALTER TABLE public.menu_categories DROP COLUMN IF EXISTS name_backup;
ALTER TABLE public.menu_items DROP COLUMN IF EXISTS name_backup, DROP COLUMN IF EXISTS description_backup;

-- Add indexes for JSONB fields for better performance
CREATE INDEX IF NOT EXISTS idx_menu_categories_name_gin ON public.menu_categories USING gin(name);
CREATE INDEX IF NOT EXISTS idx_menu_items_name_gin ON public.menu_items USING gin(name);
CREATE INDEX IF NOT EXISTS idx_menu_items_description_gin ON public.menu_items USING gin(description);

-- Add comment explaining the JSONB structure
COMMENT ON COLUMN public.menu_categories.name IS 'Translations in format: {"es": "Entrantes", "en": "Starters", "fr": "Entrées"}';
COMMENT ON COLUMN public.menu_items.name IS 'Translations in format: {"es": "Paella", "en": "Paella", "fr": "Paella"}';
COMMENT ON COLUMN public.menu_items.description IS 'Translations in format: {"es": "Arroz con mariscos", "en": "Rice with seafood"}';
COMMENT ON COLUMN public.menu_items.ingredients IS 'Translations in format: {"es": "Arroz, gambas, mejillones", "en": "Rice, prawns, mussels"}';
COMMENT ON COLUMN public.menu_items.allergens IS 'Translations in format: {"es": "Mariscos, gluten", "en": "Shellfish, gluten"}';
COMMENT ON COLUMN public.menu_items.traces IS 'Translations in format: {"es": "Frutos secos", "en": "Nuts"}';
