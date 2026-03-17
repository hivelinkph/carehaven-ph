-- Add facility_types column to facilities table
-- Stores categories like 'Independent Living', 'Assisted Living', 'Memory Care Facility'
ALTER TABLE facilities
ADD COLUMN IF NOT EXISTS facility_types TEXT[] DEFAULT '{}';
