-- Remove all mock data that was inserted for development purposes
-- This script removes mock players and their associated games

BEGIN;

-- List of mock player tags to remove
-- These are the players that were inserted via mock data scripts
WITH mock_players AS (
  SELECT id FROM players WHERE playertag IN (
    'ShadowHunter',
    'IronFist',
    'StormBringer',
    'DarkReaper',
    'PhoenixRising',
    'VoidWalker',
    'CrimsonBlade',
    'SilverFang',
    'ThunderStrike',
    'NightStalker',
    'FrostBite',
    'BlazeFury',
    'SilverWolf',
    'GoldenEagle',
    -- Added missing mock players
    'BattleForge',
    'SteelRain',
    'WarHawk'
  )
)

-- Delete all games where either player is a mock player
DELETE FROM games
WHERE player1_id IN (SELECT id FROM mock_players)
   OR player2_id IN (SELECT id FROM mock_players);

-- Delete the mock players themselves
DELETE FROM players
WHERE playertag IN (
  'ShadowHunter',
  'IronFist',
  'StormBringer',
  'DarkReaper',
  'PhoenixRising',
  'VoidWalker',
  'CrimsonBlade',
  'SilverFang',
  'ThunderStrike',
  'NightStalker',
  'FrostBite',
  'BlazeFury',
  'SilverWolf',
  'GoldenEagle',
  -- Added missing mock players
  'BattleForge',
  'SteelRain',
  'WarHawk'
);

COMMIT;

-- Display summary of what was removed
SELECT 
  'Mock data cleanup complete' AS status,
  (SELECT COUNT(*) FROM players) AS remaining_players,
  (SELECT COUNT(*) FROM games) AS remaining_games;
