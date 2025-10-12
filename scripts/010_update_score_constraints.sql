-- Update score constraints to allow 0-6 range instead of 1-6
-- This matches the form validation that allows 0-6

ALTER TABLE games 
DROP CONSTRAINT IF EXISTS games_player1_tacop_score_check,
DROP CONSTRAINT IF EXISTS games_player1_critop_score_check,
DROP CONSTRAINT IF EXISTS games_player1_killop_score_check,
DROP CONSTRAINT IF EXISTS games_player2_tacop_score_check,
DROP CONSTRAINT IF EXISTS games_player2_critop_score_check,
DROP CONSTRAINT IF EXISTS games_player2_killop_score_check,
DROP CONSTRAINT IF EXISTS games_player1_primary_op_score_check,
DROP CONSTRAINT IF EXISTS games_player2_primary_op_score_check;

-- Add new constraints with 0-6 range for scoring
ALTER TABLE games 
ADD CONSTRAINT games_player1_tacop_score_check CHECK (player1_tacop_score >= 0 AND player1_tacop_score <= 6),
ADD CONSTRAINT games_player1_critop_score_check CHECK (player1_critop_score >= 0 AND player1_critop_score <= 6),
ADD CONSTRAINT games_player1_killop_score_check CHECK (player1_killop_score >= 0 AND player1_killop_score <= 6),
ADD CONSTRAINT games_player2_tacop_score_check CHECK (player2_tacop_score >= 0 AND player2_tacop_score <= 6),
ADD CONSTRAINT games_player2_critop_score_check CHECK (player2_critop_score >= 0 AND player2_critop_score <= 6),
ADD CONSTRAINT games_player2_killop_score_check CHECK (player2_killop_score >= 0 AND player2_killop_score <= 6),
ADD CONSTRAINT games_player1_primary_op_score_check CHECK (player1_primary_op_score >= 0 AND player1_primary_op_score <= 3),
ADD CONSTRAINT games_player2_primary_op_score_check CHECK (player2_primary_op_score >= 0 AND player2_primary_op_score <= 3);
