-- Reset all games to elo_processed = false
UPDATE games SET elo_processed = false;

-- Reset all player ELOs to 1200
UPDATE players SET elo_rating = 1200;

-- Set the recalc flag
UPDATE system_settings SET value = 'true' WHERE key = 'elo_needs_recalc';
