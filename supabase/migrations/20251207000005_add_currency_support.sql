-- Create currency enum
CREATE TYPE public.currency_code AS ENUM ('INR', 'USD', 'EUR', 'RMB');

-- Add currency column to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS currency currency_code NOT NULL DEFAULT 'INR';
