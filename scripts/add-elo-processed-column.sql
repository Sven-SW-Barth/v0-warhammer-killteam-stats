-- Add elo_processed column to games table for incremental ELO calculation
ALTER TABLE games ADD COLUMN IF NOT EXISTS elo_processed BOOLEAN DEFAULT false;

-- Mark all existing games as processed (since they've been through the full recalculation)
UPDATE games SET elo_processed = true WHERE elo_processed IS NULL OR elo_processed = false;
