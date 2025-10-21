-- Create deletion_reports table
CREATE TABLE IF NOT EXISTS deletion_reports (
  id SERIAL PRIMARY KEY,
  game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  reporter_name TEXT NOT NULL,
  reason TEXT NOT NULL,
  explanation TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create edit_reports table
CREATE TABLE IF NOT EXISTS edit_reports (
  id SERIAL PRIMARY KEY,
  game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  reporter_name TEXT NOT NULL,
  proposed_changes JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_deletion_reports_status ON deletion_reports(status);
CREATE INDEX IF NOT EXISTS idx_deletion_reports_game_id ON deletion_reports(game_id);
CREATE INDEX IF NOT EXISTS idx_edit_reports_status ON edit_reports(status);
CREATE INDEX IF NOT EXISTS idx_edit_reports_game_id ON edit_reports(game_id);
