-- Create storage bucket for testimonial avatar images
INSERT INTO storage.buckets (id, name, public)
VALUES ('testimonial-avatars', 'testimonial-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "Public can view testimonial avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'testimonial-avatars');

-- Allow authenticated admins to upload/delete
CREATE POLICY "Admins can upload testimonial avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'testimonial-avatars'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete testimonial avatars"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'testimonial-avatars'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
