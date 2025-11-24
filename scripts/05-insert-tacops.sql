-- Insert tacops (tactical operations) data
INSERT INTO tacops (id, name, archetype) VALUES
(1, 'Flank', 'Recon'),
(2, 'Retrieval', 'Recon'),
(3, 'Scout Enemy Movement', 'Recon'),
(4, 'Envoy', 'Security'),
(5, 'Plant Banner', 'Security'),
(6, 'Martyrs', 'Security'),
(7, 'Rout', 'Seek & Destroy'),
(8, 'Sweep & Clear', 'Seek & Destroy'),
(9, 'Dominate', 'Seek & Destroy'),
(10, 'Track Enemy', 'Infiltration'),
(11, 'Plant Devices', 'Infiltration'),
(12, 'Steal Intelligence', 'Infiltration');

-- Update sequence
SELECT setval('tacops_id_seq', (SELECT MAX(id) FROM tacops));
