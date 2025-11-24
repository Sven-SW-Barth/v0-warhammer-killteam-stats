-- Create a special "Anonymous" player for anonymous opponents
-- This player will be used when users check the "anonymous opponent" checkbox

INSERT INTO players (playertag, elo_rating)
VALUES ('Anonymous', 1200)
ON CONFLICT DO NOTHING;
