-- Performance Optimization: Add composite indexes for common query patterns
-- These indexes significantly speed up matchlog, leaderboards, and player statistics queries

-- ====================
-- GAMES TABLE INDEXES
-- ====================

-- Index for matchlog queries: ordered by date with optional country filter
-- Speeds up: Matchlog page with/without country filter
-- Query pattern: ORDER BY created_at DESC WHERE country_id = ?
CREATE INDEX IF NOT EXISTS idx_games_created_country 
ON games(created_at DESC, country_id);

-- Index for player-specific queries (player1)
-- Speeds up: Player details, player history, player statistics
-- Query pattern: WHERE player1_id = ? ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_games_player1_created 
ON games(player1_id, created_at DESC);

-- Index for player-specific queries (player2)
-- Speeds up: Player details, player history, player statistics
-- Query pattern: WHERE player2_id = ? ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_games_player2_created 
ON games(player2_id, created_at DESC);

-- Index for killteam-specific queries
-- Speeds up: Killteam statistics, faction analysis
-- Query pattern: WHERE player1_killteam_id = ? OR player2_killteam_id = ?
CREATE INDEX IF NOT EXISTS idx_games_killteams 
ON games(player1_killteam_id, player2_killteam_id);

-- Index for date range queries
-- Speeds up: Matchlog date filtering, statistics by time period
-- Query pattern: WHERE created_at BETWEEN ? AND ?
CREATE INDEX IF NOT EXISTS idx_games_created_at_range 
ON games(created_at DESC);

-- Index for ELO queries
-- Speeds up: Player ELO history, ELO progression charts
-- Query pattern: WHERE (player1_id = ? OR player2_id = ?) AND player1_elo_after IS NOT NULL
CREATE INDEX IF NOT EXISTS idx_games_player1_elo 
ON games(player1_id, created_at) 
WHERE player1_elo_after IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_games_player2_elo 
ON games(player2_id, created_at) 
WHERE player2_elo_after IS NOT NULL;

-- Composite index for leaderboards with country filter
-- Speeds up: Leaderboards page filtered by country
-- Query pattern: WHERE country_id = ? ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_games_country_created 
ON games(country_id, created_at DESC);

-- Index for killzone analysis
-- Speeds up: Statistics by killzone
-- Query pattern: WHERE killzone_id = ?
CREATE INDEX IF NOT EXISTS idx_games_killzone 
ON games(killzone_id);

-- Index for tactical operation analysis
-- Speeds up: Statistics by tacops
-- Query pattern: WHERE player1_tacop_id = ? OR player2_tacop_id = ?
CREATE INDEX IF NOT EXISTS idx_games_tacops 
ON games(player1_tacop_id, player2_tacop_id);

-- Index for critical operation analysis
-- Speeds up: Statistics by critops
-- Query pattern: WHERE critop_id = ?
CREATE INDEX IF NOT EXISTS idx_games_critop 
ON games(critop_id);

-- ====================
-- PLAYERS TABLE INDEXES
-- ====================

-- Index for player search by playertag
-- Speeds up: Player search, autocomplete
-- Query pattern: WHERE playertag ILIKE ?
CREATE INDEX IF NOT EXISTS idx_players_playertag 
ON players(playertag);

-- Index for case-insensitive player search
-- Speeds up: Player search with case-insensitive matching
CREATE INDEX IF NOT EXISTS idx_players_playertag_lower 
ON players(LOWER(playertag));

-- The ELO rating index already exists from script 007_add_elo_system.sql
-- CREATE INDEX IF NOT EXISTS idx_players_elo_rating ON players(elo_rating DESC);

-- ====================
-- REFERENCE TABLES
-- ====================

-- Index for killteam lookups by name
CREATE INDEX IF NOT EXISTS idx_killteams_name 
ON killteams(name);

-- Index for killteam season filtering
-- Speeds up: Statistics page when excluding declassified (season 1) killteams
-- Query pattern: WHERE seasons = 1 or WHERE seasons != 1
CREATE INDEX IF NOT EXISTS idx_killteams_seasons 
ON killteams(seasons);

-- Index for country lookups by code
CREATE INDEX IF NOT EXISTS idx_countries_code 
ON countries(code);

-- Index for killzone lookups
CREATE INDEX IF NOT EXISTS idx_killzones_name 
ON killzones(name);

-- Index for tacop lookups
CREATE INDEX IF NOT EXISTS idx_tacops_name 
ON tacops(name);

-- Index for critop lookups
CREATE INDEX IF NOT EXISTS idx_critops_name 
ON critops(name);

-- ====================
-- ANALYZE TABLES
-- ====================
-- Update table statistics for the query planner to make better decisions

ANALYZE games;
ANALYZE players;
ANALYZE killteams;
ANALYZE countries;
ANALYZE killzones;
ANALYZE tacops;
ANALYZE critops;
