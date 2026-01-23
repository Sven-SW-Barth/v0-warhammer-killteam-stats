-- Create system_settings table for tracking application state
CREATE TABLE IF NOT EXISTS system_settings (
  key VARCHAR(255) PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial elo_needs_recalc setting (false by default)
INSERT INTO system_settings (key, value) 
VALUES ('elo_needs_recalc', 'false')
ON CONFLICT (key) DO NOTHING;

-- Enable RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON system_settings
  FOR SELECT USING (true);

-- Allow public update access (admin functions will use this)
CREATE POLICY "Allow public update access" ON system_settings
  FOR UPDATE USING (true);
