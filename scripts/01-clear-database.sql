-- Clear all existing data from tables in correct order (respecting foreign keys)
-- Delete games first (has foreign keys to other tables)
DELETE FROM games;

-- Delete players
DELETE FROM players;

-- Delete killteams
DELETE FROM killteams;

-- Delete countries
DELETE FROM countries;

-- Delete killzones
DELETE FROM killzones;

-- Delete critops
DELETE FROM critops;

-- Delete tacops
DELETE FROM tacops;

-- Reset sequences to start from the correct ID
SELECT setval('countries_id_seq', 1, false);
SELECT setval('critops_id_seq', 1, false);
SELECT setval('killteams_id_seq', 1, false);
SELECT setval('killzones_id_seq', 1, false);
SELECT setval('players_id_seq', 1, false);
SELECT setval('tacops_id_seq', 1, false);
SELECT setval('games_id_seq', 1, false);
