-- RaktSetu Database Schema for Supabase (PostgreSQL)
-- 100% Free Plan Compatible

-- Optional PostGIS extension (if enabled in your project)
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Blood Requests Table
CREATE TABLE IF NOT EXISTS blood_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 0 AND age <= 120),
  blood_group TEXT NOT NULL,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  address TEXT NOT NULL,
  requester_phone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS blood_requests_status_idx ON blood_requests(status);

-- 2. Blood Banks Table
CREATE TABLE IF NOT EXISTS blood_banks (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  city TEXT,
  state TEXT,
  source TEXT DEFAULT 'e-RaktKosh',
  last_verified TIMESTAMPTZ DEFAULT now()
);

-- Universal spatial B-Tree coordinates index (No extra extension needed)
CREATE INDEX IF NOT EXISTS blood_banks_lat_lng_idx ON blood_banks(lat, lng);

-- 3. Donors Table
CREATE TABLE IF NOT EXISTS donors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 18 AND age <= 65),
  blood_group TEXT NOT NULL,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  address TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  telegram_chat_id TEXT,
  verification_code TEXT,
  phone_verified BOOLEAN NOT NULL DEFAULT false,
  consent_whatsapp BOOLEAN NOT NULL DEFAULT false,
  consent_share BOOLEAN NOT NULL DEFAULT false,
  last_donated_at DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for distance queries and active status
CREATE INDEX IF NOT EXISTS donors_lat_lng_idx ON donors(lat, lng);
CREATE INDEX IF NOT EXISTS donors_active_verified_idx ON donors(is_active, phone_verified, blood_group);

-- 4. Donor Searches Table
CREATE TABLE IF NOT EXISTS donor_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES blood_requests(id) ON DELETE CASCADE,
  radius_km DOUBLE PRECISION NOT NULL DEFAULT 15,
  round INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Donor Requests Table (Tracks outreach messages sent to each donor)
CREATE TABLE IF NOT EXISTS donor_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  search_id UUID NOT NULL REFERENCES donor_searches(id) ON DELETE CASCADE,
  donor_id UUID NOT NULL REFERENCES donors(id) ON DELETE CASCADE,
  donor_name TEXT,
  donor_phone TEXT,
  donor_blood_group TEXT,
  distance_km DOUBLE PRECISION,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'yes', 'no', 'no_response', 'failed')),
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  responded_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS donor_requests_search_status_idx ON donor_requests(search_id, status);

-- 6. Initial Seed Data for Certified Public Blood Banks (e-RaktKosh / OSM)
INSERT INTO blood_banks (id, name, address, phone, lat, lng, city, state, source)
VALUES
  ('bb-del-1', 'AIIMS Main Blood Bank', 'Ansari Nagar, New Delhi', '+91 11 2658 8500', 28.5672, 77.2100, 'New Delhi', 'Delhi', 'e-RaktKosh'),
  ('bb-del-2', 'Safdarjung Hospital Regional Blood Center', 'Ring Road, Opposite AIIMS, New Delhi', '+91 11 2616 5060', 28.5701, 77.2078, 'New Delhi', 'Delhi', 'e-RaktKosh'),
  ('bb-del-3', 'Red Cross Society Blood Bank', '1 Red Cross Road, New Delhi', '+91 11 2371 6441', 28.6219, 77.2114, 'New Delhi', 'Delhi', 'e-RaktKosh'),
  ('bb-del-4', 'Sir Ganga Ram Hospital Blood Bank', 'Rajinder Nagar, New Delhi', '+91 11 4225 1000', 28.6385, 77.1896, 'New Delhi', 'Delhi', 'e-RaktKosh'),
  ('bb-del-5', 'Max Super Speciality Blood Bank Saket', '1, 2 Press Enclave Road, Saket, New Delhi', '+91 11 2651 5050', 28.5284, 77.2126, 'New Delhi', 'Delhi', 'e-RaktKosh'),
  ('bb-blr-1', 'Victoria Hospital Blood Bank (BMCRI)', 'Fort Road, KR Market, Bengaluru', '+91 80 2670 1150', 12.9642, 77.5768, 'Bengaluru', 'Karnataka', 'e-RaktKosh'),
  ('bb-blr-2', 'Manipal Hospital Blood Centre', '98 HAL Old Airport Road, Kodihalli, Bengaluru', '+91 80 2502 4444', 12.9592, 77.6477, 'Bengaluru', 'Karnataka', 'e-RaktKosh'),
  ('bb-blr-3', 'Bowring & Lady Curzon Hospital Blood Bank', 'Lady Curzon Road, Shivajinagar, Bengaluru', '+91 80 2559 1325', 12.9830, 77.6033, 'Bengaluru', 'Karnataka', 'e-RaktKosh'),
  ('bb-blr-4', 'Lions Blood Bank Indira Nagar', '100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru', '+91 80 2525 2244', 12.9719, 77.6412, 'Bengaluru', 'Karnataka', 'e-RaktKosh'),
  ('bb-bom-1', 'KEM Hospital Blood Bank', 'Acharya Donde Marg, Parel, Mumbai', '+91 22 2410 7000', 19.0024, 72.8428, 'Mumbai', 'Maharashtra', 'e-RaktKosh'),
  ('bb-bom-2', 'Tata Memorial Centre Blood Bank', 'Dr. E Borges Road, Parel, Mumbai', '+91 22 2417 7000', 19.0048, 72.8432, 'Mumbai', 'Maharashtra', 'e-RaktKosh'),
  ('bb-bom-3', 'Lilavati Hospital Blood Bank', 'A-791 Bandra Reclamation, Bandra West, Mumbai', '+91 22 2675 1000', 19.0518, 72.8295, 'Mumbai', 'Maharashtra', 'e-RaktKosh'),
  ('bb-hyd-1', 'Osmania General Hospital Blood Bank', 'Afzal Gunj, Hyderabad', '+91 40 2460 0146', 17.3753, 78.4739, 'Hyderabad', 'Telangana', 'e-RaktKosh'),
  ('bb-hyd-2', 'NIMS Blood Bank (Nizams Institute)', 'Punjagutta, Hyderabad', '+91 40 2348 9000', 17.4225, 78.4528, 'Hyderabad', 'Telangana', 'e-RaktKosh'),
  ('bb-chn-1', 'Rajiv Gandhi Government General Hospital Blood Bank', 'EVR Periyar Salai, Park Town, Chennai', '+91 44 2530 5000', 13.0817, 80.2778, 'Chennai', 'Tamil Nadu', 'e-RaktKosh'),
  ('bb-ccu-1', 'Calcutta Medical College Blood Bank', '88 College Street, Bowbazar, Kolkata', '+91 33 2255 1621', 22.5735, 88.3639, 'Kolkata', 'West Bengal', 'e-RaktKosh'),
  ('bb-pun-1', 'Sassoon General Hospital Blood Bank', 'Near Pune Railway Station, Pune', '+91 20 2612 8000', 18.5284, 73.8739, 'Pune', 'Maharashtra', 'e-RaktKosh'),
  ('bb-jpr-1', 'SMS Hospital Blood Bank', 'JLN Marg, Jaipur', '+91 141 251 8242', 26.8967, 75.8152, 'Jaipur', 'Rajasthan', 'e-RaktKosh'),
  ('bb-lko-1', 'KGMU Blood Bank (King Georges Medical University)', 'Shah Mina Road, Chowk, Lucknow', '+91 522 225 7540', 26.8687, 80.9157, 'Lucknow', 'Uttar Pradesh', 'e-RaktKosh'),
  ('bb-chd-1', 'PGIMER Rotary Blood Bank', 'Sector 12, Chandigarh', '+91 172 275 6480', 30.7651, 76.7766, 'Chandigarh', 'Chandigarh', 'e-RaktKosh')
ON CONFLICT (id) DO NOTHING;
