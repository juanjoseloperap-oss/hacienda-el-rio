CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin','operario','tecnico')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lots (
  id SERIAL PRIMARY KEY,
  code VARCHAR(30) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS locations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  location_type VARCHAR(20) NOT NULL CHECK (location_type IN ('potrero','corral','sala','otro')),
  capacity INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS animals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_code VARCHAR(40) NOT NULL UNIQUE,
  animal_name VARCHAR(80),
  sex VARCHAR(10) NOT NULL CHECK (sex IN ('female','male')),
  birth_date DATE NOT NULL,
  identification_type VARCHAR(20) NOT NULL CHECK (identification_type IN ('individual','lot')),
  lot_id INTEGER REFERENCES lots(id) ON DELETE SET NULL,
  current_location_id INTEGER REFERENCES locations(id) ON DELETE SET NULL,
  current_category VARCHAR(20) NOT NULL CHECK (current_category IN ('cow','bull','heifer','calf','steer')),
  breed VARCHAR(60),
  mother_code VARCHAR(40),
  father_code VARCHAR(40),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active','sold','dead','inactive')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_animals_category ON animals(current_category);
CREATE INDEX IF NOT EXISTS idx_animals_status ON animals(status);
CREATE INDEX IF NOT EXISTS idx_animals_location ON animals(current_location_id);

CREATE TABLE IF NOT EXISTS animal_movements (
  id BIGSERIAL PRIMARY KEY,
  animal_code VARCHAR(40) NOT NULL REFERENCES animals(animal_code) ON DELETE CASCADE,
  from_location_id INTEGER REFERENCES locations(id) ON DELETE SET NULL,
  to_location_id INTEGER NOT NULL REFERENCES locations(id),
  moved_at DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_movements_animal_date ON animal_movements(animal_code, moved_at DESC);

CREATE TABLE IF NOT EXISTS health_records (
  id BIGSERIAL PRIMARY KEY,
  animal_code VARCHAR(40) NOT NULL REFERENCES animals(animal_code) ON DELETE CASCADE,
  event_type VARCHAR(20) NOT NULL CHECK (event_type IN ('vaccine','treatment','disease','procedure')),
  diagnosis VARCHAR(120),
  treatment VARCHAR(120),
  medicine_name VARCHAR(120),
  dose VARCHAR(60),
  event_date DATE NOT NULL,
  next_due_date DATE,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_health_animal_date ON health_records(animal_code, event_date DESC);

CREATE TABLE IF NOT EXISTS reproduction_records (
  id BIGSERIAL PRIMARY KEY,
  event_type VARCHAR(30) NOT NULL CHECK (event_type IN ('mating','pregnancy_check','birth')),
  female_code VARCHAR(40) NOT NULL REFERENCES animals(animal_code) ON DELETE CASCADE,
  male_code VARCHAR(40) REFERENCES animals(animal_code) ON DELETE SET NULL,
  calf_code VARCHAR(40) REFERENCES animals(animal_code) ON DELETE SET NULL,
  event_date DATE NOT NULL,
  expected_birth_date DATE,
  result VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_repro_female_date ON reproduction_records(female_code, event_date DESC);

CREATE TABLE IF NOT EXISTS weights (
  id BIGSERIAL PRIMARY KEY,
  animal_code VARCHAR(40) NOT NULL REFERENCES animals(animal_code) ON DELETE CASCADE,
  weight_kg NUMERIC(10,2) NOT NULL CHECK (weight_kg > 0),
  average_daily_gain NUMERIC(10,3),
  weighed_at DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_weights_animal_date ON weights(animal_code, weighed_at DESC);

CREATE TABLE IF NOT EXISTS transactions (
  id BIGSERIAL PRIMARY KEY,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('purchase','sale','internal')),
  animal_code VARCHAR(40) REFERENCES animals(animal_code) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  transaction_date DATE NOT NULL,
  counterpart VARCHAR(150),
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_transactions_type_date ON transactions(transaction_type, transaction_date DESC);

CREATE TABLE IF NOT EXISTS supplies (
  id BIGSERIAL PRIMARY KEY,
  item_name VARCHAR(120) NOT NULL UNIQUE,
  item_type VARCHAR(20) NOT NULL CHECK (item_type IN ('feed','medicine','material','other')),
  unit VARCHAR(30) NOT NULL,
  current_stock NUMERIC(12,2) NOT NULL DEFAULT 0,
  reorder_level NUMERIC(12,2) NOT NULL DEFAULT 0,
  unit_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_supplies_low_stock ON supplies(current_stock, reorder_level);

CREATE TABLE IF NOT EXISTS supply_movements (
  id BIGSERIAL PRIMARY KEY,
  supply_id BIGINT NOT NULL REFERENCES supplies(id) ON DELETE CASCADE,
  movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('in','out','adjustment')),
  quantity NUMERIC(12,2) NOT NULL,
  movement_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS operational_costs (
  id BIGSERIAL PRIMARY KEY,
  category VARCHAR(30) NOT NULL CHECK (category IN ('feeding','medicine','labor','maintenance','other')),
  description VARCHAR(150) NOT NULL,
  amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  expense_date DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_costs_date ON operational_costs(expense_date DESC);

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(30) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id TEXT,
  details JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_logs(created_at DESC);
