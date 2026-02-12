-- Add competitive_play and notes columns to games table
ALTER TABLE games ADD COLUMN IF NOT EXISTS competitive_play boolean DEFAULT false;
ALTER TABLE games ADD COLUMN IF NOT EXISTS notes text DEFAULT NULL;
