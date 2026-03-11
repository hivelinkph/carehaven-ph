-- Role and facility ownership additions

-- 1. Add role to profiles
ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('user', 'provider', 'admin'));

-- 2. Add owner_id to facilities
ALTER TABLE facilities ADD COLUMN owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE;

-- 3. Add video URLs to facilities
ALTER TABLE facilities ADD COLUMN video_urls TEXT[] DEFAULT '{}';

-- 4. Update facilities RLS
-- Drop the existing policy 
DROP POLICY IF EXISTS "Facilities are viewable by all" ON facilities;

-- Re-create view policy
CREATE POLICY "Facilities are viewable by all" ON facilities FOR SELECT USING (true);

-- Allow admins to insert, update, delete
CREATE POLICY "Admins can insert facilities" ON facilities FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update facilities" ON facilities FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can delete facilities" ON facilities FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Allow providers to insert and update their own facilities
CREATE POLICY "Providers can insert their own facilities" ON facilities FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'provider') AND
  owner_id = auth.uid()
);
CREATE POLICY "Providers can update their own facilities" ON facilities FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'provider') AND
  owner_id = auth.uid()
);
