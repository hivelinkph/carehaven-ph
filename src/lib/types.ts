export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  avatar_url: string | null;
  address: string | null;
  city: string | null;
  region: string | null;
  role: 'user' | 'provider' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: string;
  name: string;
  region: string;
  latitude: number | null;
  longitude: number | null;
  is_active: boolean;
  created_at: string;
}

export interface Patient {
  id: string;
  user_id: string;
  full_name: string;
  date_of_birth: string | null;
  gender: string | null;
  photo_url: string | null;
  medical_conditions: string[];
  allergies: string[];
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  facility_id: string | null;
  admission_date: string | null;
  created_at: string;
  updated_at: string;
  facility?: Facility;
}

export interface Facility {
  id: string;
  name: string;
  description: string | null;
  region: string | null;
  city: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  image_urls: string[];
  video_urls: string[];
  owner_id: string | null;
  facility_types: string[];
  services: string[];
  amenities: string[];
  capacity: number | null;
  price_range_min: number | null;
  price_range_max: number | null;
  rating: number | null;
  latitude: number | null;
  longitude: number | null;
  messenger_url: string | null;
  whatsapp: string | null;
  viber: string | null;
  telegram: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HealthRecord {
  id: string;
  patient_id: string;
  facility_id: string | null;
  recorded_by: string | null;
  record_date: string;
  record_time: string | null;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  heart_rate: number | null;
  temperature: number | null;
  oxygen_saturation: number | null;
  respiratory_rate: number | null;
  weight: number | null;
  blood_sugar_level: number | null;
  blood_sugar_type: 'fasting' | 'random' | 'post_meal' | null;
  hemoglobin: number | null;
  white_blood_cell_count: number | null;
  red_blood_cell_count: number | null;
  platelet_count: number | null;
  cholesterol_total: number | null;
  cholesterol_hdl: number | null;
  cholesterol_ldl: number | null;
  creatinine: number | null;
  notes: string | null;
  created_at: string;
}

export interface PhilippineRegion {
  id: string;
  name: string;
  shortName: string;
  facilityCount: number;
  majorCities: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  quote: string;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type VitalStatus = 'normal' | 'warning' | 'critical';

export interface VitalReading {
  label: string;
  value: string;
  unit: string;
  status: VitalStatus;
  icon: string;
}
