-- Create Balance Dataslate table
-- A Balance Dataslate represents a point in time when Kill Team rules are updated

CREATE TABLE IF NOT EXISTS balance_dataslates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  release_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add some initial balance dataslates (you can modify these)
INSERT INTO balance_dataslates (name, release_date) VALUES
  ('Launch', '2024-07-01'),
  ('Q3/24', '2024-09-15'),
  ('Q4/24', '2024-12-15'),
  ('Q1/25', '2025-03-15');

-- Create index for faster date-based queries
CREATE INDEX idx_balance_dataslates_release_date ON balance_dataslates(release_date);
