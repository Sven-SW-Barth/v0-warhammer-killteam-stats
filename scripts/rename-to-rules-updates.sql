-- Rename table from balance_dataslates to rules_updates
ALTER TABLE balance_dataslates RENAME TO rules_updates;

-- Clear and re-insert all entries including box releases
DELETE FROM rules_updates;

INSERT INTO rules_updates (name, release_date) VALUES
  ('Hivestorm (Launch-Box)', '2024-10-05'),
  ('Balance Dataslate Jan ''25', '2025-01-29'),
  ('Blood and Zeal', '2025-03-22'),
  ('Typhon', '2025-06-14'),
  ('Balance Dataslate Juli ''25', '2025-07-22'),
  ('August Emergency Patch', '2025-08-01'),
  ('Tomb World', '2025-08-30'),
  ('Balance Dataslate Okt ''25', '2025-10-29'),
  ('Dead Silence', '2025-11-22'),
  ('Stealth Errata', '2025-12-01'),
  ('Balance Dataslate Jan ''26', '2026-01-01');
