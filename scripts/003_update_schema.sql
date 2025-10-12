-- Drop existing tables to recreate with new schema
DROP TABLE IF EXISTS games CASCADE;
DROP TABLE IF EXISTS players CASCADE;
DROP TABLE IF EXISTS factions CASCADE;

-- Create reference tables for dropdown values
CREATE TABLE IF NOT EXISTS countries (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS killzones (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS critops (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS tacops (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  archetype TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS killteams (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

-- Create players table
CREATE TABLE IF NOT EXISTS players (
  id SERIAL PRIMARY KEY,
  playertag TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create games table with all required fields
CREATE TABLE IF NOT EXISTS games (
  id SERIAL PRIMARY KEY,
  
  -- Game-level data
  country_id INTEGER REFERENCES countries(id) NOT NULL,
  killzone_id INTEGER REFERENCES killzones(id) NOT NULL,
  map_layout TEXT NOT NULL, -- "1", "2", "3", "4", "5", "6", or custom text
  critop_id INTEGER REFERENCES critops(id) NOT NULL,
  
  -- Player 1 data
  player1_id INTEGER REFERENCES players(id) NOT NULL,
  player1_killteam_id INTEGER REFERENCES killteams(id) NOT NULL,
  player1_tacop_id INTEGER REFERENCES tacops(id) NOT NULL,
  player1_tacop_score INTEGER CHECK (player1_tacop_score >= 1 AND player1_tacop_score <= 6),
  player1_critop_score INTEGER CHECK (player1_critop_score >= 1 AND player1_critop_score <= 6),
  player1_killop_score INTEGER CHECK (player1_killop_score >= 1 AND player1_killop_score <= 6),
  
  -- Player 2 data
  player2_id INTEGER REFERENCES players(id) NOT NULL,
  player2_killteam_id INTEGER REFERENCES killteams(id) NOT NULL,
  player2_tacop_id INTEGER REFERENCES tacops(id) NOT NULL,
  player2_tacop_score INTEGER CHECK (player2_tacop_score >= 1 AND player2_tacop_score <= 6),
  player2_critop_score INTEGER CHECK (player2_critop_score >= 1 AND player2_critop_score <= 6),
  player2_killop_score INTEGER CHECK (player2_killop_score >= 1 AND player2_killop_score <= 6),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE killzones ENABLE ROW LEVEL SECURITY;
ALTER TABLE critops ENABLE ROW LEVEL SECURITY;
ALTER TABLE tacops ENABLE ROW LEVEL SECURITY;
ALTER TABLE killteams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no auth required)
CREATE POLICY "Allow public read access" ON countries FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON killzones FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON critops FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON tacops FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON killteams FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON players FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read access" ON games FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON games FOR INSERT WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX idx_games_player1 ON games(player1_id);
CREATE INDEX idx_games_player2 ON games(player2_id);
CREATE INDEX idx_games_player1_killteam ON games(player1_killteam_id);
CREATE INDEX idx_games_player2_killteam ON games(player2_killteam_id);
CREATE INDEX idx_games_country ON games(country_id);
CREATE INDEX idx_games_created_at ON games(created_at DESC);
