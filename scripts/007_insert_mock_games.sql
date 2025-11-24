-- Insert mock players
INSERT INTO players (playertag) VALUES
  ('ShadowHunter'),
  ('IronFist'),
  ('StormBringer'),
  ('DarkReaper'),
  ('PhoenixRising'),
  ('VoidWalker'),
  ('CrimsonBlade'),
  ('SilverFang'),
  ('ThunderStrike'),
  ('NightStalker'),
  ('FrostBite'),
  ('BlazeFury')
ON CONFLICT (playertag) DO NOTHING;

-- Insert mock games with realistic data
-- Game 1: Recent game, Player 1 wins
INSERT INTO games (
  country_id, killzone_id, map_layout, critop_id,
  player1_id, player1_killteam_id, player1_tacop_id, player1_tacop_score, player1_critop_score, player1_killop_score, player1_primary_op, player1_primary_op_score,
  player2_id, player2_killteam_id, player2_tacop_id, player2_tacop_score, player2_critop_score, player2_killop_score, player2_primary_op, player2_primary_op_score,
  created_at
) VALUES
  -- Game 1: ShadowHunter (Angels of Death) vs IronFist (Kommandos) - ShadowHunter wins
  (
    (SELECT id FROM countries WHERE name = 'Germany'),
    (SELECT id FROM killzones WHERE name = 'Tombworld'),
    '1',
    (SELECT id FROM critops WHERE name = '1 - Secure'),
    (SELECT id FROM players WHERE playertag = 'ShadowHunter'),
    (SELECT id FROM killteams WHERE name = 'Angels of Death'),
    (SELECT id FROM tacops WHERE name = 'Flank'),
    5, 4, 6, 'TacOp', 3,
    (SELECT id FROM players WHERE playertag = 'IronFist'),
    (SELECT id FROM killteams WHERE name = 'Kommandos'),
    (SELECT id FROM tacops WHERE name = 'Rout'),
    3, 3, 4, 'KillOp', 2,
    NOW() - INTERVAL '2 hours'
  ),
  
  -- Game 2: StormBringer (Pathfinders) vs DarkReaper (Legionary) - Draw
  (
    (SELECT id FROM countries WHERE name = 'United Kingdom'),
    (SELECT id FROM killzones WHERE name = 'Volkus'),
    '2',
    (SELECT id FROM critops WHERE name = '2 - Loot'),
    (SELECT id FROM players WHERE playertag = 'StormBringer'),
    (SELECT id FROM killteams WHERE name = 'Pathfinders'),
    (SELECT id FROM tacops WHERE name = 'Scout Enemy Movement'),
    4, 4, 4, 'CritOp', 2,
    (SELECT id FROM players WHERE playertag = 'DarkReaper'),
    (SELECT id FROM killteams WHERE name = 'Legionary'),
    (SELECT id FROM tacops WHERE name = 'Dominate'),
    4, 4, 4, 'CritOp', 2,
    NOW() - INTERVAL '1 day'
  ),
  
  -- Game 3: PhoenixRising (Kasrkin) vs VoidWalker (Brood Brothers) - VoidWalker wins
  (
    (SELECT id FROM countries WHERE name = 'United States'),
    (SELECT id FROM killzones WHERE name = 'Bheta Decima'),
    '3',
    (SELECT id FROM critops WHERE name = '3 - Transmission'),
    (SELECT id FROM players WHERE playertag = 'PhoenixRising'),
    (SELECT id FROM killteams WHERE name = 'Kasrkin'),
    (SELECT id FROM tacops WHERE name = 'Envoy'),
    2, 3, 3, 'KillOp', 2,
    (SELECT id FROM players WHERE playertag = 'VoidWalker'),
    (SELECT id FROM killteams WHERE name = 'Brood Brothers'),
    (SELECT id FROM tacops WHERE name = 'Plant Banner'),
    5, 5, 4, 'TacOp', 3,
    NOW() - INTERVAL '2 days'
  ),
  
  -- Game 4: CrimsonBlade (Phobos Strike Team) vs SilverFang (Corsair Voidscarred)
  (
    (SELECT id FROM countries WHERE name = 'Spain'),
    (SELECT id FROM killzones WHERE name = 'Into the Dark'),
    '4',
    (SELECT id FROM critops WHERE name = '4 - Orb'),
    (SELECT id FROM players WHERE playertag = 'CrimsonBlade'),
    (SELECT id FROM killteams WHERE name = 'Phobos Strike Team'),
    (SELECT id FROM tacops WHERE name = 'Retrieval'),
    6, 5, 5, 'TacOp', 3,
    (SELECT id FROM players WHERE playertag = 'SilverFang'),
    (SELECT id FROM killteams WHERE name = 'Corsair Voidscarred'),
    (SELECT id FROM tacops WHERE name = 'Sweep & Clear'),
    4, 4, 3, 'CritOp', 2,
    NOW() - INTERVAL '3 days'
  ),
  
  -- Game 5: ThunderStrike (Death Korps) vs NightStalker (Plague Marines)
  (
    (SELECT id FROM countries WHERE name = 'Australia'),
    (SELECT id FROM killzones WHERE name = 'WTC Bandua'),
    '5',
    (SELECT id FROM critops WHERE name = '5 - Stake Claim'),
    (SELECT id FROM players WHERE playertag = 'ThunderStrike'),
    (SELECT id FROM killteams WHERE name = 'Death Korps'),
    (SELECT id FROM tacops WHERE name = 'Track Enemy'),
    3, 4, 5, 'KillOp', 3,
    (SELECT id FROM players WHERE playertag = 'NightStalker'),
    (SELECT id FROM killteams WHERE name = 'Plague Marines'),
    (SELECT id FROM tacops WHERE name = 'Martyrs'),
    5, 3, 4, 'TacOp', 3,
    NOW() - INTERVAL '4 days'
  ),
  
  -- Game 6: FrostBite (Hearthkyn Salvagers) vs BlazeFury (Wyrmblade)
  (
    (SELECT id FROM countries WHERE name = 'Canada'),
    (SELECT id FROM killzones WHERE name = 'Custom'),
    '6',
    (SELECT id FROM critops WHERE name = '6 - Energy Cells'),
    (SELECT id FROM players WHERE playertag = 'FrostBite'),
    (SELECT id FROM killteams WHERE name = 'Hearthkyn Salvagers'),
    (SELECT id FROM tacops WHERE name = 'Plant Devices'),
    4, 6, 4, 'CritOp', 3,
    (SELECT id FROM players WHERE playertag = 'BlazeFury'),
    (SELECT id FROM killteams WHERE name = 'Wyrmblade'),
    (SELECT id FROM tacops WHERE name = 'Steal Intelligence'),
    3, 3, 5, 'KillOp', 3,
    NOW() - INTERVAL '5 days'
  ),
  
  -- Game 7: ShadowHunter vs StormBringer - rematch
  (
    (SELECT id FROM countries WHERE name = 'Germany'),
    (SELECT id FROM killzones WHERE name = 'Tombworld'),
    NULL, -- Optional map layout not specified
    (SELECT id FROM critops WHERE name = '7 - Download'),
    (SELECT id FROM players WHERE playertag = 'ShadowHunter'),
    (SELECT id FROM killteams WHERE name = 'Angels of Death'),
    (SELECT id FROM tacops WHERE name = 'Flank'),
    6, 6, 5, 'TacOp', 3,
    (SELECT id FROM players WHERE playertag = 'StormBringer'),
    (SELECT id FROM killteams WHERE name = 'Pathfinders'),
    (SELECT id FROM tacops WHERE name = 'Scout Enemy Movement'),
    4, 5, 4, 'CritOp', 3,
    NOW() - INTERVAL '6 days'
  ),
  
  -- Game 8: IronFist vs DarkReaper
  (
    (SELECT id FROM countries WHERE name = 'France'),
    (SELECT id FROM killzones WHERE name = 'Volkus'),
    '1',
    (SELECT id FROM critops WHERE name = '8 - Data'),
    (SELECT id FROM players WHERE playertag = 'IronFist'),
    (SELECT id FROM killteams WHERE name = 'Kommandos'),
    (SELECT id FROM tacops WHERE name = 'Rout'),
    5, 4, 6, 'KillOp', 3,
    (SELECT id FROM players WHERE playertag = 'DarkReaper'),
    (SELECT id FROM killteams WHERE name = 'Legionary'),
    (SELECT id FROM tacops WHERE name = 'Dominate'),
    3, 4, 5, 'TacOp', 2,
    NOW() - INTERVAL '7 days'
  ),
  
  -- Game 9: PhoenixRising vs CrimsonBlade
  (
    (SELECT id FROM countries WHERE name = 'Poland'),
    (SELECT id FROM killzones WHERE name = 'Bheta Decima'),
    '2',
    (SELECT id FROM critops WHERE name = '9 - Reboot'),
    (SELECT id FROM players WHERE playertag = 'PhoenixRising'),
    (SELECT id FROM killteams WHERE name = 'Kasrkin'),
    (SELECT id FROM tacops WHERE name = 'Envoy'),
    4, 5, 4, 'CritOp', 3,
    (SELECT id FROM players WHERE playertag = 'CrimsonBlade'),
    (SELECT id FROM killteams WHERE name = 'Phobos Strike Team'),
    (SELECT id FROM tacops WHERE name = 'Retrieval'),
    5, 4, 5, 'TacOp', 3,
    NOW() - INTERVAL '8 days'
  ),
  
  -- Game 10: VoidWalker vs SilverFang
  (
    (SELECT id FROM countries WHERE name = 'Sweden'),
    (SELECT id FROM killzones WHERE name = 'Into the Dark'),
    '3',
    (SELECT id FROM critops WHERE name = '1 - Secure'),
    (SELECT id FROM players WHERE playertag = 'VoidWalker'),
    (SELECT id FROM killteams WHERE name = 'Brood Brothers'),
    (SELECT id FROM tacops WHERE name = 'Plant Banner'),
    6, 5, 6, 'TacOp', 3,
    (SELECT id FROM players WHERE playertag = 'SilverFang'),
    (SELECT id FROM killteams WHERE name = 'Corsair Voidscarred'),
    (SELECT id FROM tacops WHERE name = 'Sweep & Clear'),
    2, 3, 3, 'KillOp', 2,
    NOW() - INTERVAL '9 days'
  ),
  
  -- Game 11: ThunderStrike vs FrostBite
  (
    (SELECT id FROM countries WHERE name = 'Ireland'),
    (SELECT id FROM killzones WHERE name = 'WTC Bandua'),
    NULL, -- Optional map layout
    (SELECT id FROM critops WHERE name = '2 - Loot'),
    (SELECT id FROM players WHERE playertag = 'ThunderStrike'),
    (SELECT id FROM killteams WHERE name = 'Death Korps'),
    (SELECT id FROM tacops WHERE name = 'Track Enemy'),
    3, 3, 4, 'CritOp', 2,
    (SELECT id FROM players WHERE playertag = 'FrostBite'),
    (SELECT id FROM killteams WHERE name = 'Hearthkyn Salvagers'),
    (SELECT id FROM tacops WHERE name = 'Plant Devices'),
    4, 4, 5, 'CritOp', 2,
    NOW() - INTERVAL '10 days'
  ),
  
  -- Game 12: NightStalker vs BlazeFury
  (
    (SELECT id FROM countries WHERE name = 'Singapore'),
    (SELECT id FROM killzones WHERE name = 'Custom'),
    '4',
    (SELECT id FROM critops WHERE name = '3 - Transmission'),
    (SELECT id FROM players WHERE playertag = 'NightStalker'),
    (SELECT id FROM killteams WHERE name = 'Plague Marines'),
    (SELECT id FROM tacops WHERE name = 'Martyrs'),
    5, 5, 5, 'TacOp', 3,
    (SELECT id FROM players WHERE playertag = 'BlazeFury'),
    (SELECT id FROM killteams WHERE name = 'Wyrmblade'),
    (SELECT id FROM tacops WHERE name = 'Steal Intelligence'),
    4, 4, 4, 'KillOp', 2,
    NOW() - INTERVAL '11 days'
  ),
  
  -- Game 13: ShadowHunter vs PhoenixRising - high scoring game
  (
    (SELECT id FROM countries WHERE name = 'Germany'),
    (SELECT id FROM killzones WHERE name = 'Tombworld'),
    '5',
    (SELECT id FROM critops WHERE name = '4 - Orb'),
    (SELECT id FROM players WHERE playertag = 'ShadowHunter'),
    (SELECT id FROM killteams WHERE name = 'Angels of Death'),
    (SELECT id FROM tacops WHERE name = 'Flank'),
    6, 6, 6, 'TacOp', 3,
    (SELECT id FROM players WHERE playertag = 'PhoenixRising'),
    (SELECT id FROM killteams WHERE name = 'Kasrkin'),
    (SELECT id FROM tacops WHERE name = 'Envoy'),
    5, 5, 5, 'CritOp', 3,
    NOW() - INTERVAL '12 days'
  ),
  
  -- Game 14: IronFist vs VoidWalker - low scoring game
  (
    (SELECT id FROM countries WHERE name = 'United Kingdom'),
    (SELECT id FROM killzones WHERE name = 'Volkus'),
    '6',
    (SELECT id FROM critops WHERE name = '5 - Stake Claim'),
    (SELECT id FROM players WHERE playertag = 'IronFist'),
    (SELECT id FROM killteams WHERE name = 'Kommandos'),
    (SELECT id FROM tacops WHERE name = 'Rout'),
    2, 2, 3, 'KillOp', 2,
    (SELECT id FROM players WHERE playertag = 'VoidWalker'),
    (SELECT id FROM killteams WHERE name = 'Brood Brothers'),
    (SELECT id FROM tacops WHERE name = 'Plant Banner'),
    1, 2, 2, 'TacOp', 1,
    NOW() - INTERVAL '13 days'
  ),
  
  -- Game 15: StormBringer vs CrimsonBlade
  (
    (SELECT id FROM countries WHERE name = 'United States'),
    (SELECT id FROM killzones WHERE name = 'Bheta Decima'),
    '1',
    (SELECT id FROM critops WHERE name = '6 - Energy Cells'),
    (SELECT id FROM players WHERE playertag = 'StormBringer'),
    (SELECT id FROM killteams WHERE name = 'Pathfinders'),
    (SELECT id FROM tacops WHERE name = 'Scout Enemy Movement'),
    5, 4, 5, 'TacOp', 3,
    (SELECT id FROM players WHERE playertag = 'CrimsonBlade'),
    (SELECT id FROM killteams WHERE name = 'Phobos Strike Team'),
    (SELECT id FROM tacops WHERE name = 'Retrieval'),
    4, 5, 4, 'CritOp', 3,
    NOW() - INTERVAL '14 days'
  );
