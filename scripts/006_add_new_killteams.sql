-- Add new killteams: Canoptek Circle and Deathwatch
-- These will get new auto-incremented IDs, preserving existing IDs
INSERT INTO killteams (name) VALUES
  ('Canoptek Circle'),
  ('Deathwatch')
ON CONFLICT (name) DO NOTHING;
