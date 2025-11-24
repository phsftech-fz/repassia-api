-- Tabela: cars
CREATE TABLE IF NOT EXISTS cars (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  price NUMERIC NOT NULL,
  mileage INTEGER NULL DEFAULT 0,
  color TEXT NULL,
  fuel_type TEXT NULL,
  transmission TEXT NULL,
  description TEXT NULL,
  status TEXT NULL DEFAULT 'disponível',
  license_plate TEXT NULL,
  chassis TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
  CONSTRAINT cars_pkey PRIMARY KEY (id)
);

-- Tabela: car_images
CREATE TABLE IF NOT EXISTS car_images (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  car_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
  is_primary BOOLEAN NULL DEFAULT FALSE,
  CONSTRAINT car_images_pkey PRIMARY KEY (id),
  CONSTRAINT car_images_car_id_fkey FOREIGN KEY (car_id) 
    REFERENCES cars (id) ON DELETE CASCADE
);

-- Tabela: profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  fixed_token TEXT NULL UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE NULL,
  CONSTRAINT profiles_pkey PRIMARY KEY (id)
);

-- Tabela: auth_codes
CREATE TABLE IF NOT EXISTS auth_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
  CONSTRAINT auth_codes_pkey PRIMARY KEY (id)
);

