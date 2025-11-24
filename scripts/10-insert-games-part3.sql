-- Insert games data (Part 3 of 3 - remaining games)
INSERT INTO games (id, country_id, killzone_id, map_layout, critop_id, player1_id, player1_killteam_id, player1_tacop_id, player1_tacop_score, player1_critop_score, player1_killop_score, player2_id, player2_killteam_id, player2_tacop_id, player2_tacop_score, player2_critop_score, player2_killop_score, created_at, player1_primary_op, player1_primary_op_score, player2_primary_op, player2_primary_op_score, player1_elo_before, player1_elo_after, player2_elo_before, player2_elo_after) VALUES
(137, 18, 2, '4', 7, 55, 25, 11, 5, 3, 4, 113, 25, 9, 3, 2, 6, '2025-10-31 10:14:01.36774+00', 'TacOp', 3, 'KillOp', 3, 1218, 1233, 1200, 1185),
(138, 5, 1, '4', 8, 107, 5, 11, 4, 6, 5, 71, 40, 9, 3, 4, 3, '2025-10-31 12:32:31.014794+00', 'CritOp', 3, 'TacOp', 2, NULL, NULL, NULL, NULL),
(139, 5, 1, '1', 8, 3, 24, 2, 3, 4, 3, 1, 20, 3, 1, 5, 3, '2025-10-31 20:04:54.377557+00', 'TacOp', 2, 'CritOp', 3, 1123, 1130, 1296, 1290),
(142, 5, 1, '6', 2, 114, 18, 5, 4, 4, 5, 71, 40, 9, 4, 3, 3, '2025-10-01 20:00:00+00', 'KillOp', 3, 'TacOp', 2, NULL, NULL, NULL, NULL),
(147, 5, 5, '3', 9, 114, 40, 7, 6, 6, 6, 123, 29, 4, 0, 1, 1, '2025-10-05 00:00:00+00', 'KillOp', 3, 'CritOp', 1, 1273, 1286, 1200, 1187),
(148, 5, 1, '2', 1, 103, 39, 2, 4, 5, 2, 83, 19, 2, 4, 4, 0, '2025-10-31 22:06:05.404546+00', 'TacOp', 2, 'TacOp', 2, 1186, 1202, 1183, 1167),
(152, 5, 1, '4', 1, 114, 29, 9, 2, 5, 4, 115, 33, 2, 4, 4, 2, '2025-10-21 21:00:00+00', 'KillOp', 2, 'KillOp', 1, 1304, 1316, 1223, 1211),
(153, 5, 2, '2', 4, 114, 14, 7, 4, 5, 3, 115, 33, 2, 3, 1, 5, '2025-10-22 21:00:00+00', 'TacOp', 2, 'TacOp', 2, 1316, 1327, 1211, 1200),
(155, 5, 4, '4', 5, 114, 14, 7, 2, 5, 6, 115, 33, 2, 2, 2, 1, '2025-10-25 21:00:00+00', 'TacOp', 1, 'KillOp', 1, 1327, 1337, 1200, 1190),
(157, 5, 2, 'Squad Games Layout 6 (Double Volkus)', 3, 114, 22, 11, 5, 2, 5, 115, 33, 2, 4, 1, 3, '2025-10-31 20:00:00+00', 'TacOp', 3, 'KillOp', 2, 1357, 1366, 1206, 1197),
(158, 5, 5, NULL, 5, 116, 23, 9, 4, 2, 3, 117, 35, 1, 5, 5, 5, '2025-10-31 22:49:18.469153+00', 'KillOp', 2, 'KillOp', 3, 1200, 1184, 1200, 1216);

-- Update sequence to highest ID
SELECT setval('games_id_seq', (SELECT MAX(id) FROM games));
