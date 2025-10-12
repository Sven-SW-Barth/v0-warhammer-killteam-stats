-- Add Elo rating system to the database

-- Add elo_rating column to players table
ALTER TABLE players
ADD COLUMN IF NOT EXISTS elo_rating INTEGER DEFAULT 1200;

-- Add Elo tracking columns to games table
ALTER TABLE games
ADD COLUMN IF NOT EXISTS player1_elo_before INTEGER,
ADD COLUMN IF NOT EXISTS player1_elo_after INTEGER,
ADD COLUMN IF NOT EXISTS player2_elo_before INTEGER,
ADD COLUMN IF NOT EXISTS player2_elo_after INTEGER;

-- Create index on elo_rating for faster sorting
CREATE INDEX IF NOT EXISTS idx_players_elo_rating ON players(elo_rating DESC);
