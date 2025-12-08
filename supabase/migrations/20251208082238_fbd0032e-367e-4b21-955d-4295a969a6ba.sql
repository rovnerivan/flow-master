-- Create storage bucket for process media files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'process-media',
  'process-media',
  true,
  52428800, -- 50MB limit
  ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'audio/mpeg', 'audio/wav', 'audio/webm', 'audio/ogg', 'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- Allow authenticated users to upload files to process-media bucket
CREATE POLICY "Team members can upload process media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'process-media' 
  AND auth.role() = 'authenticated'
);

-- Allow anyone to view process media (public bucket)
CREATE POLICY "Anyone can view process media"
ON storage.objects FOR SELECT
USING (bucket_id = 'process-media');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update process media"
ON storage.objects FOR UPDATE
USING (bucket_id = 'process-media' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated users can delete process media"
ON storage.objects FOR DELETE
USING (bucket_id = 'process-media' AND auth.role() = 'authenticated');