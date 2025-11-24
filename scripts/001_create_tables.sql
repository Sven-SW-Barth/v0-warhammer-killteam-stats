-- Kill Team Game Tracking Database Schema

-- Factions table
CREATE TABLE IF NOT EXISTS factions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Players table (no auth required, just tracking names)
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Games table
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player1_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  player1_faction_id UUID NOT NULL REFERENCES factions(id),
  player1_score INTEGER NOT NULL CHECK (player1_score >= 0),
  player2_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  player2_faction_id UUID NOT NULL REFERENCES factions(id),
  player2_score INTEGER NOT NULL CHECK (player2_score >= 0),
  game_date TIMESTAMPTZ DEFAULT NOW(),
  mission_type TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_games_player1 ON games(player1_id);
CREATE INDEX IF NOT EXISTS idx_games_player2 ON games(player2_id);
CREATE INDEX IF NOT EXISTS idx_games_date ON games(game_date DESC);
CREATE INDEX IF NOT EXISTS idx_games_factions ON games(player1_faction_id, player2_faction_id);

-- Since no authentication is required, we'll make all tables publicly readable and writable
-- This allows anyone to submit game results
ALTER TABLE factions ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all tables
CREATE POLICY "Allow public read access to factions" ON factions FOR SELECT USING (true);
CREATE POLICY "Allow public insert to factions" ON factions FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to players" ON players FOR SELECT USING (true);
CREATE POLICY "Allow public insert to players" ON players FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to games" ON games FOR SELECT USING (true);
CREATE POLICY "Allow public insert to games" ON games FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to games" ON games FOR UPDATE USING (true);
CREATE POLICY "Allow public delete to games" ON games FOR DELETE USING (true);
