-- Add color column to killteams table
ALTER TABLE killteams ADD COLUMN IF NOT EXISTS color VARCHAR(7) DEFAULT '#808080';

-- Update each killteam with a unique color
-- Using visually distinct hex colors that work well on dark backgrounds

UPDATE killteams SET color = '#FF6B6B' WHERE name = 'Angels of Death';
UPDATE killteams SET color = '#4ECDC4' WHERE name = 'Battleclade Servitors';
UPDATE killteams SET color = '#FFE66D' WHERE name = 'Blades of Khaine';
UPDATE killteams SET color = '#A8E6CF' WHERE name = 'Blooded';
UPDATE killteams SET color = '#FF8B94' WHERE name = 'Brood Brothers';
UPDATE killteams SET color = '#C7CEEA' WHERE name = 'Chaos Cults';
UPDATE killteams SET color = '#FFDAC1' WHERE name = 'Corsair Voidscarred';
UPDATE killteams SET color = '#B4A7D6' WHERE name = 'Death Korps';
UPDATE killteams SET color = '#FFB6B9' WHERE name = 'Elucidian Starstriders';
UPDATE killteams SET color = '#BAE1FF' WHERE name = 'Exaction Squad';
UPDATE killteams SET color = '#95E1D3' WHERE name = 'Farstalker Kinband';
UPDATE killteams SET color = '#F38181' WHERE name = 'Fellgor Ravagers';
UPDATE killteams SET color = '#AA96DA' WHERE name = 'Gellerpox Infected';
UPDATE killteams SET color = '#FCBAD3' WHERE name = 'Goremongers';
UPDATE killteams SET color = '#A8D8EA' WHERE name = 'Hand of the Archon';
UPDATE killteams SET color = '#FFD93D' WHERE name = 'Hearthkyn Salvagers';
UPDATE killteams SET color = '#6BCF7F' WHERE name = 'Hernkyn Yaegirs';
UPDATE killteams SET color = '#FF9A8B' WHERE name = 'Hierotek Circle';
UPDATE killteams SET color = '#A8DADC' WHERE name = 'Hunter Clade';
UPDATE killteams SET color = '#F4A261' WHERE name = 'Inquisitorial Agents';
UPDATE killteams SET color = '#E76F51' WHERE name = 'Kasrkin';
UPDATE killteams SET color = '#2A9D8F' WHERE name = 'Kommandos';
UPDATE killteams SET color = '#E63946' WHERE name = 'Legionary';
UPDATE killteams SET color = '#457B9D' WHERE name = 'Mandrakes';
UPDATE killteams SET color = '#A8C686' WHERE name = 'Nemesis Claw';
UPDATE killteams SET color = '#F1FAEE' WHERE name = 'Novitiates';
UPDATE killteams SET color = '#FFB703' WHERE name = 'Pathfinders';
UPDATE killteams SET color = '#8ECAE6' WHERE name = 'Phobos Strike Team';
UPDATE killteams SET color = '#219EBC' WHERE name = 'Plague Marines';
UPDATE killteams SET color = '#FFD166' WHERE name = 'Ratlings';
UPDATE killteams SET color = '#EF476F' WHERE name = 'Raveners';
UPDATE killteams SET color = '#06FFA5' WHERE name = 'Sanctifiers';
UPDATE killteams SET color = '#118AB2' WHERE name = 'Scout Squad';
UPDATE killteams SET color = '#073B4C' WHERE name = 'Tempestus Aquilon';
UPDATE killteams SET color = '#FFD23F' WHERE name = 'Vespid Stingwings';
UPDATE killteams SET color = '#EE4266' WHERE name = 'Void-Dancer-Troupe';
UPDATE killteams SET color = '#3BCEAC' WHERE name = 'Wrecka Crew';
UPDATE killteams SET color = '#0EAD69' WHERE name = 'Wyrmblade';
UPDATE killteams SET color = '#00D9FF' WHERE name = 'Canoptek Circle';
UPDATE killteams SET color = '#C96A3A' WHERE name = 'Deathwatch';

-- Make color column NOT NULL after setting all values
ALTER TABLE killteams ALTER COLUMN color SET NOT NULL;
