-- Set the elo_needs_recalc flag to true since we have 563 unprocessed games
UPDATE system_settings 
SET value = 'true', updated_at = NOW() 
WHERE key = 'elo_needs_recalc';
