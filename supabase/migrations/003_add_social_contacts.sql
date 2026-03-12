-- Add social media and messaging contact fields to facilities

ALTER TABLE facilities ADD COLUMN messenger_url TEXT;
ALTER TABLE facilities ADD COLUMN whatsapp TEXT;
ALTER TABLE facilities ADD COLUMN viber TEXT;
ALTER TABLE facilities ADD COLUMN telegram TEXT;
ALTER TABLE facilities ADD COLUMN facebook_url TEXT;
ALTER TABLE facilities ADD COLUMN instagram_url TEXT;
ALTER TABLE facilities ADD COLUMN linkedin_url TEXT;
