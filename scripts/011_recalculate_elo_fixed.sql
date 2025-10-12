-- Recalculate all Elo ratings from scratch
-- This script processes all games in chronological order and updates Elo ratings

DO $$
DECLARE
    game_record RECORD;
    player1_current_elo INTEGER;
    player2_current_elo INTEGER;
    player1_expected NUMERIC;
    player2_expected NUMERIC;
    player1_actual NUMERIC;
    player2_actual NUMERIC;
    player1_k_factor INTEGER;
    player2_k_factor INTEGER;
    player1_new_elo INTEGER;
    player2_new_elo INTEGER;
    player1_game_count INTEGER;
    player2_game_count INTEGER;
    total_games INTEGER;
    processed_games INTEGER := 0;
BEGIN
    RAISE NOTICE 'Starting Elo recalculation...';
    
    -- Step 1: Reset all player Elo ratings to starting value (1200)
    RAISE NOTICE 'Resetting all player Elo ratings to 1200...';
    UPDATE players SET elo_rating = 1200;
    
    -- Step 2: Clear existing Elo data from games
    RAISE NOTICE 'Clearing existing Elo data from games...';
    UPDATE games SET 
        player1_elo_before = NULL,
        player1_elo_after = NULL,
        player2_elo_before = NULL,
        player2_elo_after = NULL;
    
    -- Get total number of games
    SELECT COUNT(*) INTO total_games FROM games;
    RAISE NOTICE 'Processing % games...', total_games;
    
    -- Step 3: Process each game in chronological order
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
        
        -- Count games played by each player (for K-factor calculation)
        SELECT COUNT(*) INTO player1_game_count
        FROM games 
        WHERE (player1_id = game_record.player1_id OR player2_id = game_record.player1_id)
            AND created_at < game_record.created_at;
            
        SELECT COUNT(*) INTO player2_game_count
        FROM games 
        WHERE (player1_id = game_record.player2_id OR player2_id = game_record.player2_id)
            AND created_at < game_record.created_at;
        
        -- Determine K-factor based on experience (adaptive K-factor)
        -- New players (0-19 games): K=32
        -- Intermediate (20-49 games): K=24
        -- Experienced (50+ games): K=16
        IF player1_game_count < 20 THEN
            player1_k_factor := 32;
        ELSIF player1_game_count < 50 THEN
            player1_k_factor := 24;
        ELSE
            player1_k_factor := 16;
        END IF;
        
        IF player2_game_count < 20 THEN
            player2_k_factor := 32;
        ELSIF player2_game_count < 50 THEN
            player2_k_factor := 24;
        ELSE
            player2_k_factor := 16;
        END IF;
        
        -- Calculate expected scores using Elo formula
        player1_expected := 1.0 / (1.0 + POWER(10.0, (player2_current_elo - player1_current_elo) / 400.0));
        player2_expected := 1.0 / (1.0 + POWER(10.0, (player1_current_elo - player2_current_elo) / 400.0));
        
        -- Determine actual scores based on game outcome
        -- Calculate total scores for each player
        DECLARE
            player1_total_score INTEGER;
            player2_total_score INTEGER;
        BEGIN
            player1_total_score := COALESCE(game_record.player1_primary_op_score, 0) + 
                                  COALESCE(game_record.player1_tacop_score, 0) + 
                                  COALESCE(game_record.player1_critop_score, 0) + 
                                  COALESCE(game_record.player1_killop_score, 0);
            
            player2_total_score := COALESCE(game_record.player2_primary_op_score, 0) + 
                                  COALESCE(game_record.player2_tacop_score, 0) + 
                                  COALESCE(game_record.player2_critop_score, 0) + 
                                  COALESCE(game_record.player2_killop_score, 0);
            
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
        END;
        
        -- Calculate new Elo ratings
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
        
        processed_games := processed_games + 1;
        
        -- Progress update every 10 games
        IF processed_games % 10 = 0 THEN
            RAISE NOTICE 'Processed % / % games...', processed_games, total_games;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Elo recalculation complete! Processed % games.', processed_games;
    RAISE NOTICE '---';
    RAISE NOTICE 'Top 10 players by Elo:';
    
    -- Display top players for verification
    FOR game_record IN 
        SELECT playertag, elo_rating 
        FROM players 
        ORDER BY elo_rating DESC 
        LIMIT 10
    LOOP
        RAISE NOTICE '  % - Elo: %', game_record.playertag, game_record.elo_rating;
    END LOOP;
    
END $$;
