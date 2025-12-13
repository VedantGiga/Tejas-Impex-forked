-- Step 1: Add finance role to app_role enum
-- This MUST be run separately first
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'finance';
