-- RLS Policy untuk Storage Bucket: avatars
-- Jalankan di Supabase Dashboard → SQL Editor

-- 1. Policy untuk INSERT (Upload)
CREATE POLICY "Allow authenticated users to upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- 2. Policy untuk UPDATE (Update file)
CREATE POLICY "Allow authenticated users to update avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars');

-- 3. Policy untuk DELETE (Hapus file)
CREATE POLICY "Allow authenticated users to delete avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');

-- 4. Policy untuk SELECT (Read/Download) - Public
CREATE POLICY "Allow public read access to avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
