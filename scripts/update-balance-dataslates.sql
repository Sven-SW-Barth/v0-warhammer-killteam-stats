-- Clear existing data and insert correct balance dataslates
DELETE FROM balance_dataslates;

-- Insert all balance dataslates based on the provided timeline
INSERT INTO balance_dataslates (name, release_date) VALUES
  ('Hivestorm Launch', '2024-10-05'),
  ('Balance Dataslate Jan ''25', '2025-01-29'),
  ('Balance Dataslate Juli ''25', '2025-07-22'),
  ('August Emergency Patch', '2025-08-01'),
  ('Balance Dataslate Okt ''25', '2025-10-29'),
  ('Stealth Errata', '2025-12-01'),
  ('Balance Dataslate Jan ''26', '2026-01-01');
