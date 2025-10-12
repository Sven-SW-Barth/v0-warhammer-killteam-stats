-- Make map_layout column nullable since it's optional
ALTER TABLE games ALTER COLUMN map_layout DROP NOT NULL;
