-- Recalculate all Elo ratings and return results
-- Step 1: Reset all player Elo ratings to 1200
UPDATE players SET elo_rating = 1200;

-- Step 2: Clear existing Elo data from games
UPDATE games SET 
    player1_elo_before = NULL,
    player1_elo_after = NULL,
    player2_elo_before = NULL,
    player2_elo_after = NULL;

-- Step 3: Process each game in chronological order
DO $$
DECLARE
    game_record RECORD;
    player1_current_elo INTEGER;
    player2_current_elo INTEGER;
    player1_expected NUMERIC;
    player2_expected NUMERIC;
    player1_actual NUMERIC;
    player2_actual NUMERIC;
    player1_k_factor INTEGER := 32;
    player2_k_factor INTEGER := 32;
    player1_new_elo INTEGER;
    player2_new_elo INTEGER;
    player1_total_score INTEGER;
    player2_total_score INTEGER;
BEGIN
    -- Process each game in chronological order
    FOR game_record IN 
        SELECT * FROM games 
        WHERE player1_id IS NOT NULL AND player2_id IS NOT NULL
        ORDER BY created_at ASC, id ASC
    LOOP
        -- Get current Elo ratings for both players
        SELECT elo_rating INTO player1_current_elo 
        FROM players WHERE id = game_record.player1_id;
        
        SELECT elo_rating INTO player2_current_elo 
        FROM players WHERE id = game_record.player2_id;
        
        -- Calculate expected scores using Elo formula
        player1_expected := 1.0 / (1.0 + POWER(10.0, (player2_current_elo - player1_current_elo) / 400.0));
        player2_expected := 1.0 / (1.0 + POWER(10.0, (player1_current_elo - player2_current_elo) / 400.0));
        
        -- Calculate total scores for each player
        player1_total_score := COALESCE(game_record.player1_primary_op_score, 0) + 
                              COALESCE(game_record.player1_tacop_score, 0) + 
                              COALESCE(game_record.player1_critop_score, 0) + 
                              COALESCE(game_record.player1_killop_score, 0);
        
        player2_total_score := COALESCE(game_record.player2_primary_op_score, 0) + 
                              COALESCE(game_record.player2_tacop_score, 0) + 
                              COALESCE(game_record.player2_critop_score, 0) + 
                              COALESCE(game_record.player2_killop_score, 0);
        
        -- Determine actual scores based on game outcome
        IF player1_total_score > player2_total_score THEN
            player1_actual := 1.0;  -- Win
            player2_actual := 0.0;  -- Loss
        ELSIF player1_total_score < player2_total_score THEN
            player1_actual := 0.0;  -- Loss
            player2_actual := 1.0;  -- Win
        ELSE
            player1_actual := 0.5;  -- Draw
            player2_actual := 0.5;  -- Draw
        END IF;
        
        -- Calculate new Elo ratings (using K-factor of 32 for all players)
        player1_new_elo := player1_current_elo + ROUND(player1_k_factor * (player1_actual - player1_expected));
        player2_new_elo := player2_current_elo + ROUND(player2_k_factor * (player2_actual - player2_expected));
        
        -- Update game record with Elo data
        UPDATE games SET
            player1_elo_before = player1_current_elo,
            player1_elo_after = player1_new_elo,
            player2_elo_before = player2_current_elo,
            player2_elo_after = player2_new_elo
        WHERE id = game_record.id;
        
        -- Update player Elo ratings
        UPDATE players SET elo_rating = player1_new_elo WHERE id = game_record.player1_id;
        UPDATE players SET elo_rating = player2_new_elo WHERE id = game_record.player2_id;
    END LOOP;
END $$;

-- Step 4: Return results to verify the recalculation worked
SELECT 
    'Recalculation Complete' as status,
    COUNT(*) as total_games_processed
FROM games 
WHERE player1_elo_after IS NOT NULL;

-- Show top 10 players by Elo
SELECT 
    playertag,
    elo_rating,
    (SELECT COUNT(*) FROM games WHERE player1_id = players.id OR player2_id = players.id) as games_played
FROM players 
ORDER BY elo_rating DESC 
LIMIT 10;
