-- Realtime is already enabled! Just verify:
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename = 'products';

-- Should return: public | products
-- If it returns a row, realtime is working! ✅
