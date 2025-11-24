-- Índice para busca rápida por token fixo
CREATE INDEX IF NOT EXISTS idx_profiles_fixed_token ON profiles(fixed_token) WHERE fixed_token IS NOT NULL;

-- Índice para limpeza de códigos expirados
CREATE INDEX IF NOT EXISTS idx_auth_codes_expires_at ON auth_codes(expires_at);

-- Índices adicionais para performance
CREATE INDEX IF NOT EXISTS idx_cars_status ON cars(status);
CREATE INDEX IF NOT EXISTS idx_cars_brand ON cars(brand);
CREATE INDEX IF NOT EXISTS idx_cars_year ON cars(year);
CREATE INDEX IF NOT EXISTS idx_cars_created_at ON cars(created_at);
CREATE INDEX IF NOT EXISTS idx_car_images_car_id ON car_images(car_id);

