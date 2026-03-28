INSERT INTO users (full_name, email, password_hash, role)
VALUES
  ('Administrador El Río', 'admin@elrio.com', crypt('Admin123*', gen_salt('bf')), 'admin'),
  ('Capataz Campo', 'capataz@elrio.com', crypt('Admin123*', gen_salt('bf')), 'operario')
ON CONFLICT (email) DO NOTHING;

INSERT INTO lots (code, name, description) VALUES
  ('L-01', 'Lote Norte', 'Lote de crecimiento'),
  ('L-02', 'Lote Crías', 'Lote de becerros')
ON CONFLICT (code) DO NOTHING;

INSERT INTO locations (name, location_type, capacity) VALUES
  ('Potrero 1', 'potrero', 50),
  ('Potrero 2', 'potrero', 40),
  ('Corral Central', 'corral', 25)
ON CONFLICT (name) DO NOTHING;

INSERT INTO animals (animal_code, animal_name, sex, birth_date, identification_type, lot_id, current_location_id, current_category, breed, mother_code, father_code)
VALUES
  ('ER-001', 'Luna', 'female', '2024-05-12', 'individual', 1, 1, 'heifer', 'Brahman', NULL, NULL),
  ('ER-002', 'Titan', 'male', '2023-09-01', 'individual', 1, 3, 'bull', 'Angus', NULL, NULL),
  ('ER-003', 'Nube', 'female', '2025-01-21', 'individual', 2, 2, 'calf', 'Brahman', 'ER-001', 'ER-002')
ON CONFLICT (animal_code) DO NOTHING;

INSERT INTO weights (animal_code, weight_kg, average_daily_gain, weighed_at, notes) VALUES
  ('ER-001', 280, NULL, CURRENT_DATE - INTERVAL '14 days', 'Ingreso inicial'),
  ('ER-001', 292, 0.857, CURRENT_DATE - INTERVAL '1 day', 'Buen desempeño'),
  ('ER-003', 85, NULL, CURRENT_DATE - INTERVAL '1 day', 'Peso de rutina');

INSERT INTO health_records (animal_code, event_type, diagnosis, treatment, medicine_name, dose, event_date, next_due_date, notes) VALUES
  ('ER-001', 'vaccine', NULL, 'Vacuna anual', 'Clostridial', '5 ml', CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE + INTERVAL '358 days', 'Aplicación sin novedad'),
  ('ER-003', 'treatment', 'Desparasitación preventiva', 'Control interno', 'Ivermectina', '2 ml', CURRENT_DATE - INTERVAL '2 days', NULL, 'Seguimiento normal');

INSERT INTO animal_movements (animal_code, from_location_id, to_location_id, moved_at, reason) VALUES
  ('ER-001', 3, 1, CURRENT_DATE - INTERVAL '3 days', 'Retorno a pastoreo'),
  ('ER-003', 2, 2, CURRENT_DATE - INTERVAL '1 day', 'Control rutinario');

INSERT INTO transactions (transaction_type, animal_code, quantity, unit_price, total_amount, transaction_date, counterpart, notes) VALUES
  ('sale', 'ER-001', 1, 0, 0, CURRENT_DATE - INTERVAL '20 days', 'Registro histórico', 'Ejemplo de trazabilidad');

UPDATE animals SET status='active' WHERE animal_code='ER-001';

INSERT INTO reproduction_records (event_type, female_code, male_code, calf_code, event_date, expected_birth_date, result, notes) VALUES
  ('mating', 'ER-001', 'ER-002', NULL, CURRENT_DATE - INTERVAL '280 days', CURRENT_DATE - INTERVAL '10 days', 'Servicio efectivo', 'Monta controlada'),
  ('birth', 'ER-001', 'ER-002', 'ER-003', CURRENT_DATE - INTERVAL '66 days', NULL, 'Parto vivo', 'Cría sana');

INSERT INTO supplies (item_name, item_type, unit, current_stock, reorder_level, unit_cost) VALUES
  ('Concentrado 18%', 'feed', 'kg', 120, 80, 1.8),
  ('Ivermectina', 'medicine', 'frascos', 2, 3, 45),
  ('Sal mineralizada', 'feed', 'kg', 60, 40, 1.2)
ON CONFLICT (item_name) DO NOTHING;

INSERT INTO operational_costs (category, description, amount, expense_date) VALUES
  ('feeding', 'Compra de concentrado', 320, CURRENT_DATE - INTERVAL '4 days'),
  ('medicine', 'Compra ivermectina', 90, CURRENT_DATE - INTERVAL '2 days'),
  ('labor', 'Jornal semanal', 250, CURRENT_DATE - INTERVAL '1 day');
