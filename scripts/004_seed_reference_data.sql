-- Seed countries
INSERT INTO countries (name) VALUES
  ('Spain'),
  ('United Kingdom'),
  ('United States'),
  ('Australia'),
  ('Germany'),
  ('Poland'),
  ('Canada'),
  ('France'),
  ('Sweden'),
  ('Ireland'),
  ('Singapore'),
  ('Taiwan'),
  ('Ukraine'),
  ('South Africa'),
  ('Argentina'),
  ('Netherlands')
ON CONFLICT (name) DO NOTHING;

-- Seed killzones
INSERT INTO killzones (name) VALUES
  ('Tombworld'),
  ('Volkus'),
  ('Bheta Decima'),
  ('Into the Dark'),
  ('WTC Bandua'),
  ('Custom')
ON CONFLICT (name) DO NOTHING;

-- Seed critops
INSERT INTO critops (name) VALUES
  ('1 - Secure'),
  ('2 - Loot'),
  ('3 - Transmission'),
  ('4 - Orb'),
  ('5 - Stake Claim'),
  ('6 - Energy Cells'),
  ('7 - Download'),
  ('8 - Data'),
  ('9 - Reboot')
ON CONFLICT (name) DO NOTHING;

-- Seed tacops
INSERT INTO tacops (name, archetype) VALUES
  ('Flank', 'Recon'),
  ('Retrieval', 'Recon'),
  ('Scout Enemy Movement', 'Recon'),
  ('Envoy', 'Security'),
  ('Plant Banner', 'Security'),
  ('Martyrs', 'Security'),
  ('Rout', 'Seek & Destroy'),
  ('Sweep & Clear', 'Seek & Destroy'),
  ('Dominate', 'Seek & Destroy'),
  ('Track Enemy', 'Infiltration'),
  ('Plant Devices', 'Infiltration'),
  ('Steal Intelligence', 'Infiltration')
ON CONFLICT (name) DO NOTHING;

-- Seed killteams
INSERT INTO killteams (name) VALUES
  ('Angels of Death'),
  ('Battleclade Servitors'),
  ('Blades of Khaine'),
  ('Blooded'),
  ('Brood Brothers'),
  ('Chaos Cults'),
  ('Corsair Voidscarred'),
  ('Death Korps'),
  ('Elucidian Starstriders'),
  ('Exaction Squad'),
  ('Farstalker Kinband'),
  ('Fellgor Ravagers'),
  ('Gellerpox Infected'),
  ('Goremongers'),
  ('Hand of the Archon'),
  ('Hearthkyn Salvagers'),
  ('Hernkyn Yaegirs'),
  ('Hierotek Circle'),
  ('Hunter Clade'),
  ('Inquisitorial Agents'),
  ('Kasrkin'),
  ('Kommandos'),
  ('Legionary'),
  ('Mandrakes'),
  ('Nemesis Claw'),
  ('Novitiates'),
  ('Pathfinders'),
  ('Phobos Strike Team'),
  ('Plague Marines'),
  ('Ratlings'),
  ('Raveners'),
  ('Sanctifiers'),
  ('Scout Squad'),
  ('Tempestus Aquilon'),
  ('Vespid Stingwings'),
  ('Void-Dancer-Troupe'),
  ('Wrecka Crew'),
  ('Wyrmblade')
ON CONFLICT (name) DO NOTHING;
