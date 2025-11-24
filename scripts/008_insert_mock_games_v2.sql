-- Insert mock game data for testing
-- This script uses subqueries to look up IDs dynamically

-- First, insert some test players (using ON CONFLICT to avoid duplicates)
INSERT INTO players (playertag) VALUES
  ('ShadowHunter'),
  ('IronFist'),
  ('StormBringer'),
  ('DarkReaper'),
  ('SwiftBlade'),
  ('ThunderStrike'),
  ('CrimsonWolf'),
  ('SteelGuard'),
  ('VoidWalker'),
  ('PhantomKnight'),
  ('BlazeRunner'),
  ('FrostBite')
ON CONFLICT (playertag) DO NOTHING;

-- Insert mock games with dynamic ID lookups
-- Game 1: Close match
INSERT INTO games (
  country_id, killzone_id, map_layout, critop_id,
  player1_id, player1_killteam_id, player1_tacop_id, player1_tacop_score, player1_critop_score, player1_killop_score, player1_primary_op, player1_primary_op_score,
  player2_id, player2_killteam_id, player2_tacop_id, player2_tacop_score, player2_critop_score, player2_killop_score, player2_primary_op, player2_primary_op_score,
  created_at
) VALUES (
  (SELECT id FROM countries WHERE name = 'Germany' LIMIT 1),
  (SELECT id FROM killzones WHERE name = 'Volkus' LIMIT 1),
  '1',
  (SELECT id FROM critops WHERE name = '1 - Secure' LIMIT 1),
  (SELECT id FROM players WHERE playertag = 'ShadowHunter' LIMIT 1),
  (SELECT id FROM killteams WHERE name = 'Kommandos' LIMIT 1),
  (SELECT id FROM tacops WHERE name = 'Flank' LIMIT 1),
  5, 4, 6, 'TacOp', 3,
  (SELECT id FROM players WHERE playertag = 'IronFist' LIMIT 1),
  (SELECT id FROM killteams WHERE name = 'Kasrkin' LIMIT 1),
  (SELECT id FROM tacops WHERE name = 'Sweep & Clear' LIMIT 1),
  4, 5, 5, 'CritOp', 3,
  NOW() - INTERVAL '2 days'
);

-- Game 2: Decisive victory
INSERT INTO games (
  country_id, killzone_id, map_layout, critop_id,
  player1_id, player1_killteam_id, player1_tacop_id, player1_tacop_score, player1_critop_score, player1_killop_score, player1_primary_op, player1_primary_op_score,
  player2_id, player2_killteam_id, player2_tacop_id, player2_tacop_score, player2_critop_score, player2_killop_score, player2_primary_op, player2_primary_op_score,
  created_at
) VALUES (
  (SELECT id FROM countries WHERE name = 'United Kingdom' LIMIT 1),
  (SELECT id FROM killzones WHERE name = 'Into the Dark' LIMIT 1),
  '2',
  (SELECT id FROM critops WHERE name = '2 - Loot' LIMIT 1),
  (SELECT id FROM players WHERE playertag = 'StormBringer' LIMIT 1),
  (SELECT id FROM killteams WHERE name = 'Phobos Strike Team' LIMIT 1),
  (SELECT id FROM tacops WHERE name = 'Scout Enemy Movement' LIMIT 1),
  6, 6, 5, 'TacOp', 3,
  (SELECT id FROM players WHERE playertag = 'DarkReaper' LIMIT 1),
  (SELECT id FROM killteams WHERE name = 'Legionary' LIMIT 1),
  (SELECT id FROM tacops WHERE name = 'Rout' LIMIT 1),
  2, 3, 2, 'KillOp', 1,
  NOW() - INTERVAL '5 days'
);

-- Game 3: Draw
INSERT INTO games (
  country_id, killzone_id, map_layout, critop_id,
  player1_id, player1_killteam_id, player1_tacop_id, player1_tacop_score, player1_critop_score, player1_killop_score, player1_primary_op, player1_primary_op_score,
  player2_id, player2_killteam_id, player2_tacop_id, player2_tacop_score, player2_critop_score, player2_killop_score, player2_primary_op, player2_primary_op_score,
  created_at
) VALUES (
  (SELECT id FROM countries WHERE name = 'United States' LIMIT 1),
  (SELECT id FROM killzones WHERE name = 'Tombworld' LIMIT 1),
  NULL,
  (SELECT id FROM critops WHERE name = '3 - Transmission' LIMIT 1),
  (SELECT id FROM players WHERE playertag = 'SwiftBlade' LIMIT 1),
  (SELECT id FROM killteams WHERE name = 'Pathfinders' LIMIT 1),
  (SELECT id FROM tacops WHERE name = 'Retrieval' LIMIT 1),
  4, 4, 4, 'CritOp', 2,
  (SELECT id FROM players WHERE playertag = 'ThunderStrike' LIMIT 1),
  (SELECT id FROM killteams WHERE name = 'Hunter Clade' LIMIT 1),
  (SELECT id FROM tacops WHERE name = 'Envoy' LIMIT 1),
  4, 4, 4, 'TacOp', 2,
  NOW() - INTERVAL '1 day'
);

-- Game 4: Another match
INSERT INTO games (
  country_id, killzone_id, map_layout, critop_id,
  player1_id, player1_killteam_id, player1_tacop_id, player1_tacop_score, player1_critop_score, player1_killop_score, player1_primary_op, player1_primary_op_score,
  player2_id, player2_killteam_id, player2_tacop_id, player2_tacop_score, player2_critop_score, player2_killop_score, player2_primary_op, player2_primary_op_score,
  created_at
) VALUES (
  (SELECT id FROM countries WHERE name = 'Spain' LIMIT 1),
  (SELECT id FROM killzones WHERE name = 'Bheta Decima' LIMIT 1),
  '3',
  (SELECT id FROM critops WHERE name = '4 - Orb' LIMIT 1),
  (SELECT id FROM players WHERE playertag = 'CrimsonWolf' LIMIT 1),
  (SELECT id FROM killteams WHERE name = 'Corsair Voidscarred' LIMIT 1),
  (SELECT id FROM tacops WHERE name = 'Plant Banner' LIMIT 1),
  3, 5, 4, 'KillOp', 2,
  (SELECT id FROM players WHERE playertag = 'SteelGuard' LIMIT 1),
  (SELECT id FROM killteams WHERE name = 'Death Korps' LIMIT 1),
  (SELECT id FROM tacops WHERE name = 'Dominate' LIMIT 1),
  5, 3, 3, 'TacOp', 3,
  NOW() - INTERVAL '3 days'
);

-- Game 5: High scoring game
INSERT INTO games (
  country_id, killzone_id, map_layout, critop_id,
  player1_id, player1_killteam_id, player1_tacop_id, player1_tacop_score, player1_critop_score, player1_killop_score, player1_primary_op, player1_primary_op_score,
  player2_id, player2_killteam_id, player2_tacop_id, player2_tacop_score, player2_critop_score, player2_killop_score, player2_primary_op, player2_primary_op_score,
  created_at
) VALUES (
  (SELECT id FROM countries WHERE name = 'France' LIMIT 1),
  (SELECT id FROM killzones WHERE name = 'WTC Bandua' LIMIT 1),
  '4',
  (SELECT id FROM critops WHERE name = '5 - Stake Claim' LIMIT 1),
  (SELECT id FROM players WHERE playertag = 'VoidWalker' LIMIT 1),
  (SELECT id FROM killteams WHERE name = 'Wyrmblade' LIMIT 1),
  (SELECT id FROM tacops WHERE name = 'Track Enemy' LIMIT 1),
  6, 6, 6, 'TacOp', 3,
  (SELECT id FROM players WHERE playertag = 'PhantomKnight' LIMIT 1),
  (SELECT id FROM killteams WHERE name = 'Novitiates' LIMIT 1),
  (SELECT id FROM tacops WHERE name = 'Martyrs' LIMIT 1),
  5, 5, 4, 'CritOp', 3,
  NOW() - INTERVAL '7 days'
);

-- Game 6: Low scoring defensive game
INSERT INTO games (
  country_id, killzone_id, map_layout, critop_id,
  player1_id, player1_killteam_id, player1_tacop_id, player1_tacop_score, player1_critop_score, player1_killop_score, player1_primary_op, player1_primary_op_score,
  player2_id, player2_killteam_id, player2_tacop_id, player2_tacop_score, player2_critop_score, player2_killop_score, player2_primary_op, player2_primary_op_score,
  created_at
) VALUES (
  (SELECT id FROM countries WHERE name = 'Poland' LIMIT 1),
  (SELECT id FROM killzones WHERE name = 'Custom' LIMIT 1),
  '5',
  (SELECT id FROM critops WHERE name = '6 - Energy Cells' LIMIT 1),
  (SELECT id FROM players WHERE playertag = 'BlazeRunner' LIMIT 1),
  (SELECT id FROM killteams WHERE name = 'Blooded' LIMIT 1),
  (SELECT id FROM tacops WHERE name = 'Plant Devices' LIMIT 1),
  2, 3, 2, 'CritOp', 2,
  (SELECT id FROM players WHERE playertag = 'FrostBite' LIMIT 1),
  (SELECT id FROM killteams WHERE name = 'Brood Brothers' LIMIT 1),
  (SELECT id FROM tacops WHERE name = 'Steal Intelligence' LIMIT 1),
  1, 2, 3, 'KillOp', 2,
  NOW() - INTERVAL '4 days'
);

-- Game 7: Rematch
INSERT INTO games (
  country_id, killzone_id, map_layout, critop_id,
  player1_id, player1_killteam_id, player1_tacop_id, player1_tacop_score, player1_critop_score, player1_killop_score, player1_primary_op, player1_primary_op_score,
  player2_id, player2_killteam_id, player2_tacop_id, player2_tacop_score, player2_critop_score, player2_killop_score, player2_primary_op, player2_primary_op_score,
  created_at
) VALUES (
  (SELECT id FROM countries WHERE name = 'Germany' LIMIT 1),
  (SELECT id FROM killzones WHERE name = 'Volkus' LIMIT 1),
  '6',
  (SELECT id FROM critops WHERE name = '7 - Download' LIMIT 1),
  (SELECT id FROM players WHERE playertag = 'IronFist' LIMIT 1),
  (SELECT id FROM killteams WHERE name = 'Kasrkin' LIMIT 1),
  (SELECT id FROM tacops WHERE name = 'Sweep & Clear' LIMIT 1),
  5, 5, 6, 'KillOp', 3,
  (SELECT id FROM players WHERE playertag = 'ShadowHunter' LIMIT 1),
  (SELECT id FROM killteams WHERE name = 'Kommandos' LIMIT 1),
  (SELECT id FROM tacops WHERE name = 'Flank' LIMIT 1),
  4, 4, 4, 'TacOp', 2,
  NOW() - INTERVAL '6 hours'
);

-- Game 8: Tournament match
INSERT INTO games (
  country_id, killzone_id, map_layout, critop_id,
  player1_id, player1_killteam_id, player1_tacop_id, player1_tacop_score, player1_critop_score, player1_killop_score, player1_primary_op, player1_primary_op_score,
  player2_id, player2_killteam_id, player2_tacop_id, player2_tacop_score, player2_critop_score, player2_killop_score, player2_primary_op, player2_primary_op_score,
  created_at
) VALUES (
  (SELECT id FROM countries WHERE name = 'Canada' LIMIT 1),
  (SELECT id FROM killzones WHERE name = 'Into the Dark' LIMIT 1),
  NULL,
  (SELECT id FROM critops WHERE name = '8 - Data' LIMIT 1),
  (SELECT id FROM players WHERE playertag = 'DarkReaper' LIMIT 1),
  (SELECT id FROM killteams WHERE name = 'Legionary' LIMIT 1),
  (SELECT id FROM tacops WHERE name = 'Rout' LIMIT 1),
  4, 6, 5, 'CritOp', 3,
  (SELECT id FROM players WHERE playertag = 'StormBringer' LIMIT 1),
  (SELECT id FROM killteams WHERE name = 'Phobos Strike Team' LIMIT 1),
  (SELECT id FROM tacops WHERE name = 'Scout Enemy Movement' LIMIT 1),
  3, 4, 3, 'TacOp', 2,
  NOW() - INTERVAL '8 days'
);

-- Game 9: Tactical showdown
INSERT INTO games (
  country_id, killzone_id, map_layout, critop_id,
  player1_id, player1_killteam_id, player1_tacop_id, player1_tacop_score, player1_critop_score, player1_killop_score, player1_primary_op, player1_primary_op_score,
  player2_id, player2_killteam_id, player2_tacop_id, player2_tacop_score, player2_critop_score, player2_killop_score, player2_primary_op, player2_primary_op_score,
  created_at
) VALUES (
  (SELECT id FROM countries WHERE name = 'Australia' LIMIT 1),
  (SELECT id FROM killzones WHERE name = 'Tombworld' LIMIT 1),
  '1',
  (SELECT id FROM critops WHERE name = '9 - Reboot' LIMIT 1),
  (SELECT id FROM players WHERE playertag = 'ThunderStrike' LIMIT 1),
  (SELECT id FROM killteams WHERE name = 'Hunter Clade' LIMIT 1),
  (SELECT id FROM tacops WHERE name = 'Envoy' LIMIT 1),
  5, 4, 5, 'TacOp', 3,
  (SELECT id FROM players WHERE playertag = 'SwiftBlade' LIMIT 1),
  (SELECT id FROM killteams WHERE name = 'Pathfinders' LIMIT 1),
  (SELECT id FROM tacops WHERE name = 'Retrieval' LIMIT 1),
  6, 5, 3, 'CritOp', 3,
  NOW() - INTERVAL '10 days'
);

-- Game 10: Balanced match
INSERT INTO games (
  country_id, killzone_id, map_layout, critop_id,
  player1_id, player1_killteam_id, player1_tacop_id, player1_tacop_score, player1_critop_score, player1_killop_score, player1_primary_op, player1_primary_op_score,
  player2_id, player2_killteam_id, player2_tacop_id, player2_tacop_score, player2_critop_score, player2_killop_score, player2_primary_op, player2_primary_op_score,
  created_at
) VALUES (
  (SELECT id FROM countries WHERE name = 'Sweden' LIMIT 1),
  (SELECT id FROM killzones WHERE name = 'Bheta Decima' LIMIT 1),
  '2',
  (SELECT id FROM critops WHERE name = '1 - Secure' LIMIT 1),
  (SELECT id FROM players WHERE playertag = 'SteelGuard' LIMIT 1),
  (SELECT id FROM killteams WHERE name = 'Death Korps' LIMIT 1),
  (SELECT id FROM tacops WHERE name = 'Dominate' LIMIT 1),
  4, 5, 4, 'KillOp', 2,
  (SELECT id FROM players WHERE playertag = 'CrimsonWolf' LIMIT 1),
  (SELECT id FROM killteams WHERE name = 'Corsair Voidscarred' LIMIT 1),
  (SELECT id FROM tacops WHERE name = 'Plant Banner' LIMIT 1),
  5, 4, 4, 'TacOp', 3,
  NOW() - INTERVAL '12 hours'
);
