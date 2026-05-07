-- Gallery images managed by admins, displayed in the home page gallery carousel.

CREATE TABLE IF NOT EXISTS gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS gallery_images_sort_idx
  ON gallery_images (is_active, sort_order, created_at);

ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active gallery images" ON gallery_images;
CREATE POLICY "Public can view active gallery images"
  ON gallery_images FOR SELECT
  USING (is_active = TRUE);

DROP POLICY IF EXISTS "Admins can view all gallery images" ON gallery_images;
CREATE POLICY "Admins can view all gallery images"
  ON gallery_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can insert gallery images" ON gallery_images;
CREATE POLICY "Admins can insert gallery images"
  ON gallery_images FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update gallery images" ON gallery_images;
CREATE POLICY "Admins can update gallery images"
  ON gallery_images FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can delete gallery images" ON gallery_images;
CREATE POLICY "Admins can delete gallery images"
  ON gallery_images FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Storage bucket for gallery image files
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery-images', 'gallery-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public can view gallery image files" ON storage.objects;
CREATE POLICY "Public can view gallery image files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'gallery-images');

DROP POLICY IF EXISTS "Admins can upload gallery image files" ON storage.objects;
CREATE POLICY "Admins can upload gallery image files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'gallery-images'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can delete gallery image files" ON storage.objects;
CREATE POLICY "Admins can delete gallery image files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'gallery-images'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
