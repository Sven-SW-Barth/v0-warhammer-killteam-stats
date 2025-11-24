-- Insert countries data
INSERT INTO countries (id, name, code) VALUES
(1, 'Spain', 'ES'),
(2, 'United Kingdom', 'GB'),
(3, 'United States', 'US'),
(4, 'Australia', 'AU'),
(5, 'Germany', 'DE'),
(6, 'Poland', 'PL'),
(7, 'Canada', 'CA'),
(8, 'France', 'FR'),
(9, 'Sweden', 'SE'),
(10, 'Ireland', 'IE'),
(11, 'Singapore', 'SG'),
(12, 'Taiwan', 'TW'),
(13, 'Ukraine', 'UA'),
(14, 'South Africa', 'ZA'),
(15, 'Argentina', 'AR'),
(16, 'Netherlands', 'NL'),
(17, 'International', 'INT'),
(18, 'Denmark', 'DNK'),
(19, 'Russia', 'RU');

-- Update sequence
SELECT setval('countries_id_seq', (SELECT MAX(id) FROM countries));
