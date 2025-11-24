-- Insert killzones data
INSERT INTO killzones (id, name) VALUES
(1, 'Tombworld'),
(2, 'Volkus'),
(3, 'Bheta Decima'),
(4, 'Into the Dark'),
(5, 'WTC Bandua'),
(6, 'Custom');

-- Update sequence
SELECT setval('killzones_id_seq', (SELECT MAX(id) FROM killzones));
