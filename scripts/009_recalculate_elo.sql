-- Recalculate all Elo ratings from scratch based on game history
-- Run this script whenever you need to refresh Elo calculations

DO $$
DECLARE
    game_record RECORD;
    player1_elo INTEGER;
    player2_elo INTEGER;
    player1_games_played INTEGER;
    player2_games_played INTEGER;
    player1_expected NUMERIC;
    player2_expected NUMERIC;
    player1_actual NUMERIC;
    player2_actual NUMERIC;
    player1_k_factor INTEGER;
    player2_k_factor INTEGER;
    player1_new_elo INTEGER;
    player2_new_elo INTEGER;
    player1_total INTEGER;
    player2_total INTEGER;
BEGIN
    RAISE NOTICE 'Starting Elo recalculation...';
    
    -- Reset all player Elos to starting rating of 1200
    UPDATE players SET elo_rating = 1200;
    RAISE NOTICE 'Reset all player Elo ratings to 1200';
    
    -- Clear existing Elo tracking in games
    UPDATE games SET 
        player1_elo_before = NULL,
        player1_elo_after = NULL,
        player2_elo_before = NULL,
        player2_elo_after = NULL;
    RAISE NOTICE 'Cleared existing Elo data from games';
    
    -- Process all games in chronological order
    FOR game_record IN 
        SELECT * FROM games ORDER BY created_at ASC
    LOOP
        -- Get current Elo ratings
        SELECT elo_rating INTO player1_elo FROM players WHERE id = game_record.player1_id;
        SELECT elo_rating INTO player2_elo FROM players WHERE id = game_record.player2_id;
        
        -- Count games played before this game (for adaptive K-factor)
        SELECT COUNT(*) INTO player1_games_played 
        FROM games 
        WHERE (player1_id = game_record.player1_id OR player2_id = game_record.player1_id)
        AND created_at < game_record.created_at;
        
        SELECT COUNT(*) INTO player2_games_played 
        FROM games 
        WHERE (player1_id = game_record.player2_id OR player2_id = game_record.player2_id)
        AND created_at < game_record.created_at;
        
        -- Determine adaptive K-factor based on experience
        -- K=32 for first 20 games (high volatility for new players)
        -- K=24 for 20-50 games (medium volatility)
        -- K=16 for 50+ games (low volatility for experienced players)
        IF player1_games_played < 20 THEN
            player1_k_factor := 32;
        ELSIF player1_games_played < 50 THEN
            player1_k_factor := 24;
        ELSE
            player1_k_factor := 16;
        END IF;
        
        IF player2_games_played < 20 THEN
            player2_k_factor := 32;
        ELSIF player2_games_played < 50 THEN
            player2_k_factor := 24;
        ELSE
            player2_k_factor := 16;
        END IF;
        
        -- Calculate total scores for each player
        player1_total := game_record.player1_tacop_score + 
                        game_record.player1_critop_score + 
                        game_record.player1_killop_score + 
                        COALESCE(game_record.player1_primary_op_score, 0);
        
        player2_total := game_record.player2_tacop_score + 
                        game_record.player2_critop_score + 
                        game_record.player2_killop_score + 
                        COALESCE(game_record.player2_primary_op_score, 0);
        
        -- Calculate expected scores using standard Elo formula
        -- E = 1 / (1 + 10^((opponent_elo - player_elo) / 400))
        player1_expected := 1.0 / (1.0 + POWER(10, (player2_elo - player1_elo)::NUMERIC / 400.0));
        player2_expected := 1.0 / (1.0 + POWER(10, (player1_elo - player2_elo)::NUMERIC / 400.0));
        
        -- Determine actual scores (1 for win, 0 for loss, 0.5 for draw)
        IF player1_total > player2_total THEN
            player1_actual := 1.0;
            player2_actual := 0.0;
        ELSIF player2_total > player1_total THEN
            player1_actual := 0.0;
            player2_actual := 1.0;
        ELSE
            player1_actual := 0.5;
            player2_actual := 0.5;
        END IF;
        
        -- Calculate new Elo ratings
        -- new_elo = old_elo + K * (actual - expected)
        player1_new_elo := player1_elo + ROUND(player1_k_factor * (player1_actual - player1_expected));
        player2_new_elo := player2_elo + ROUND(player2_k_factor * (player2_actual - player2_expected));
        
        -- Update game record with Elo changes
        UPDATE games SET
            player1_elo_before = player1_elo,
            player1_elo_after = player1_new_elo,
            player2_elo_before = player2_elo,
            player2_elo_after = player2_new_elo
        WHERE id = game_record.id;
        
        -- Update player Elo ratings
        UPDATE players SET elo_rating = player1_new_elo WHERE id = game_record.player1_id;
        UPDATE players SET elo_rating = player2_new_elo WHERE id = game_record.player2_id;
        
    END LOOP;
    
    RAISE NOTICE 'Elo ratings recalculated successfully for all games';
    RAISE NOTICE 'All player ratings and game history updated';
END $$;
