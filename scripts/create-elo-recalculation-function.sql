-- Create a PostgreSQL function that recalculates ALL ELO ratings
-- This runs entirely on the database server, avoiding timeout/rate limit issues

CREATE OR REPLACE FUNCTION recalculate_all_elo()
RETURNS TABLE(games_processed INT, games_skipped INT, players_updated INT) AS $$
DECLARE
  game_record RECORD;
  player1_elo INT;
  player2_elo INT;
  player1_expected FLOAT;
  player2_expected FLOAT;
  player1_actual FLOAT;
  player2_actual FLOAT;
  player1_new_elo INT;
  player2_new_elo INT;
  player1_total INT;
  player2_total INT;
  k_factor INT := 32;
  v_games_processed INT := 0;
  v_games_skipped INT := 0;
  v_players_updated INT := 0;
  anonymous_id INT;
BEGIN
  -- Get the Anonymous player ID
  SELECT id INTO anonymous_id FROM players WHERE playertag = 'Anonymous' LIMIT 1;

  -- Step 1: Reset all player ELOs to 1200
  UPDATE players SET elo_rating = 1200 WHERE id IS NOT NULL;
  GET DIAGNOSTICS v_players_updated = ROW_COUNT;

  -- Step 2: Clear all game ELO data
  UPDATE games SET 
    player1_elo_before = NULL,
    player1_elo_after = NULL,
    player2_elo_before = NULL,
    player2_elo_after = NULL,
    elo_processed = FALSE
  WHERE id IS NOT NULL;

  -- Step 3: Create a temp table to track current player ELOs (faster than repeated lookups)
  CREATE TEMP TABLE IF NOT EXISTS temp_player_elos (
    player_id INT PRIMARY KEY,
    elo INT DEFAULT 1200
  ) ON COMMIT DROP;
  
  TRUNCATE temp_player_elos;
  INSERT INTO temp_player_elos (player_id, elo)
  SELECT id, 1200 FROM players;

  -- Step 4: Process each game in chronological order
  FOR game_record IN 
    SELECT g.*, p1.playertag as p1_tag, p2.playertag as p2_tag
    FROM games g
    LEFT JOIN players p1 ON g.player1_id = p1.id
    LEFT JOIN players p2 ON g.player2_id = p2.id
    ORDER BY g.created_at ASC
  LOOP
    -- Skip games with Anonymous players
    IF game_record.p1_tag = 'Anonymous' OR game_record.p2_tag = 'Anonymous' 
       OR game_record.player1_id = anonymous_id OR game_record.player2_id = anonymous_id THEN
      v_games_skipped := v_games_skipped + 1;
      
      -- Mark as processed but don't set ELO values
      UPDATE games SET elo_processed = TRUE WHERE id = game_record.id;
      CONTINUE;
    END IF;

    -- Get current ELOs from temp table
    SELECT COALESCE(elo, 1200) INTO player1_elo FROM temp_player_elos WHERE player_id = game_record.player1_id;
    SELECT COALESCE(elo, 1200) INTO player2_elo FROM temp_player_elos WHERE player_id = game_record.player2_id;
    
    -- Default to 1200 if not found
    player1_elo := COALESCE(player1_elo, 1200);
    player2_elo := COALESCE(player2_elo, 1200);

    -- Calculate total scores
    player1_total := COALESCE(game_record.player1_primary_op_score, 0) + 
                     COALESCE(game_record.player1_tacop_score, 0) + 
                     COALESCE(game_record.player1_critop_score, 0) + 
                     COALESCE(game_record.player1_killop_score, 0);
    player2_total := COALESCE(game_record.player2_primary_op_score, 0) + 
                     COALESCE(game_record.player2_tacop_score, 0) + 
                     COALESCE(game_record.player2_critop_score, 0) + 
                     COALESCE(game_record.player2_killop_score, 0);

    -- Calculate expected scores
    player1_expected := 1.0 / (1.0 + POWER(10, (player2_elo - player1_elo)::FLOAT / 400));
    player2_expected := 1.0 / (1.0 + POWER(10, (player1_elo - player2_elo)::FLOAT / 400));

    -- Determine actual scores
    IF player1_total > player2_total THEN
      player1_actual := 1;
      player2_actual := 0;
    ELSIF player2_total > player1_total THEN
      player1_actual := 0;
      player2_actual := 1;
    ELSE
      player1_actual := 0.5;
      player2_actual := 0.5;
    END IF;

    -- Calculate new ELOs
    player1_new_elo := ROUND(player1_elo + k_factor * (player1_actual - player1_expected));
    player2_new_elo := ROUND(player2_elo + k_factor * (player2_actual - player2_expected));

    -- Update game record with ELO data
    UPDATE games SET
      player1_elo_before = player1_elo,
      player1_elo_after = player1_new_elo,
      player2_elo_before = player2_elo,
      player2_elo_after = player2_new_elo,
      elo_processed = TRUE
    WHERE id = game_record.id;

    -- Update temp table with new ELOs
    INSERT INTO temp_player_elos (player_id, elo) VALUES (game_record.player1_id, player1_new_elo)
    ON CONFLICT (player_id) DO UPDATE SET elo = player1_new_elo;
    
    INSERT INTO temp_player_elos (player_id, elo) VALUES (game_record.player2_id, player2_new_elo)
    ON CONFLICT (player_id) DO UPDATE SET elo = player2_new_elo;

    v_games_processed := v_games_processed + 1;
  END LOOP;

  -- Step 5: Update all player ELOs from temp table
  UPDATE players p SET elo_rating = t.elo
  FROM temp_player_elos t
  WHERE p.id = t.player_id;

  -- Step 6: Clear the elo_needs_recalc flag
  UPDATE system_settings SET value = 'false', updated_at = NOW() WHERE key = 'elo_needs_recalc';

  -- Return results
  RETURN QUERY SELECT v_games_processed, v_games_skipped, v_players_updated;
END;
$$ LANGUAGE plpgsql;
