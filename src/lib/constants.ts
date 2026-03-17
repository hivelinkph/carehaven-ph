export const PHILIPPINE_REGIONS: Record<string, { name: string; shortName: string; majorCities: string[] }> = {
  'ncr': { name: 'National Capital Region', shortName: 'NCR', majorCities: ['Manila', 'Quezon City', 'Makati', 'Pasig', 'Taguig'] },
  'car': { name: 'Cordillera Administrative Region', shortName: 'CAR', majorCities: ['Baguio', 'Tabuk', 'La Trinidad'] },
  'region-1': { name: 'Ilocos Region', shortName: 'Region I', majorCities: ['Laoag', 'Vigan', 'San Fernando', 'Dagupan'] },
  'region-2': { name: 'Cagayan Valley', shortName: 'Region II', majorCities: ['Tuguegarao', 'Santiago', 'Cauayan'] },
  'region-3': { name: 'Central Luzon', shortName: 'Region III', majorCities: ['San Fernando', 'Angeles', 'Olongapo', 'Tarlac'] },
  'region-4a': { name: 'CALABARZON', shortName: 'Region IV-A', majorCities: ['Calamba', 'Antipolo', 'Batangas', 'Lucena'] },
  'region-4b': { name: 'MIMAROPA', shortName: 'Region IV-B', majorCities: ['Calapan', 'Puerto Princesa', 'Mamburao'] },
  'region-5': { name: 'Bicol Region', shortName: 'Region V', majorCities: ['Legazpi', 'Naga', 'Sorsogon'] },
  'region-6': { name: 'Western Visayas', shortName: 'Region VI', majorCities: ['Iloilo', 'Bacolod', 'Roxas'] },
  'region-7': { name: 'Central Visayas', shortName: 'Region VII', majorCities: ['Cebu', 'Mandaue', 'Lapu-Lapu'] },
  'region-8': { name: 'Eastern Visayas', shortName: 'Region VIII', majorCities: ['Tacloban', 'Ormoc', 'Catbalogan'] },
  'region-9': { name: 'Zamboanga Peninsula', shortName: 'Region IX', majorCities: ['Zamboanga', 'Dipolog', 'Pagadian'] },
  'region-10': { name: 'Northern Mindanao', shortName: 'Region X', majorCities: ['Cagayan de Oro', 'Iligan', 'Malaybalay'] },
  'region-11': { name: 'Davao Region', shortName: 'Region XI', majorCities: ['Davao', 'Tagum', 'Digos'] },
  'region-12': { name: 'SOCCSKSARGEN', shortName: 'Region XII', majorCities: ['General Santos', 'Koronadal', 'Kidapawan'] },
  'region-13': { name: 'Caraga', shortName: 'Region XIII', majorCities: ['Butuan', 'Surigao', 'Bislig'] },
  'barmm': { name: 'Bangsamoro', shortName: 'BARMM', majorCities: ['Cotabato', 'Marawi', 'Lamitan'] },
};

export const VITAL_RANGES = {
  blood_pressure_systolic: { normal: [90, 120], warning: [120, 140], unit: 'mmHg' },
  blood_pressure_diastolic: { normal: [60, 80], warning: [80, 90], unit: 'mmHg' },
  heart_rate: { normal: [60, 100], warning: [50, 110], unit: 'bpm' },
  temperature: { normal: [36.1, 37.2], warning: [37.2, 38.0], unit: '°C' },
  oxygen_saturation: { normal: [95, 100], warning: [90, 95], unit: '%' },
  blood_sugar_level: { normal: [70, 100], warning: [100, 126], unit: 'mg/dL' },
  respiratory_rate: { normal: [12, 20], warning: [20, 25], unit: '/min' },
  hemoglobin: { normal: [12.0, 17.5], warning: [10.0, 12.0], unit: 'g/dL' },
  white_blood_cell_count: { normal: [4.5, 11.0], warning: [3.0, 4.5], unit: 'K/µL' },
  platelet_count: { normal: [150000, 400000], warning: [100000, 150000], unit: '/µL' },
  cholesterol_total: { normal: [0, 200], warning: [200, 240], unit: 'mg/dL' },
  creatinine: { normal: [0.6, 1.2], warning: [1.2, 1.5], unit: 'mg/dL' },
} as const;

export function getVitalStatus(key: keyof typeof VITAL_RANGES, value: number): 'normal' | 'warning' | 'critical' {
  const range = VITAL_RANGES[key];
  if (value >= range.normal[0] && value <= range.normal[1]) return 'normal';
  if (value >= range.warning[0] && value <= range.warning[1]) return 'warning';
  return 'critical';
}

export const USER_ROLES = {
  USER: 'user',
  PROVIDER: 'provider',
  ADMIN: 'admin',
} as const;

export const FACILITY_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended',
} as const;

export const FACILITY_TYPES = [
  'Independent Living',
  'Assisted Living',
  'Memory Care Facility',
] as const;

export const SERVICES_LIST = [
  '24/7 Nursing Care',
  'Physical Therapy',
  'Occupational Therapy',
  'Memory Care',
  'Medication Management',
  'Daily Health Monitoring',
  'Meal Preparation',
  'Personal Care Assistance',
  'Social Activities',
  'Transportation Services',
  'Emergency Response',
  'Family Video Calls',
];
