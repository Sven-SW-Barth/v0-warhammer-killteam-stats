-- Insert critops (critical operations) data
INSERT INTO critops (id, name) VALUES
(1, '1 - Secure'),
(2, '2 - Loot'),
(3, '3 - Transmission'),
(4, '4 - Orb'),
(5, '5 - Stake Claim'),
(6, '6 - Energy Cells'),
(7, '7 - Download'),
(8, '8 - Data'),
(9, '9 - Reboot');

-- Update sequence
SELECT setval('critops_id_seq', (SELECT MAX(id) FROM critops));
