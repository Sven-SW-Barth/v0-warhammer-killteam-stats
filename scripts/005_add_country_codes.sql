-- Add code column to countries table
ALTER TABLE countries ADD COLUMN IF NOT EXISTS code VARCHAR(2);

-- Update existing countries with their ISO 3166-1 alpha-2 codes
UPDATE countries SET code = 'ES' WHERE name = 'Spain';
UPDATE countries SET code = 'GB' WHERE name = 'United Kingdom';
UPDATE countries SET code = 'US' WHERE name = 'United States';
UPDATE countries SET code = 'AU' WHERE name = 'Australia';
UPDATE countries SET code = 'DE' WHERE name = 'Germany';
UPDATE countries SET code = 'PL' WHERE name = 'Poland';
UPDATE countries SET code = 'CA' WHERE name = 'Canada';
UPDATE countries SET code = 'FR' WHERE name = 'France';
UPDATE countries SET code = 'SE' WHERE name = 'Sweden';
UPDATE countries SET code = 'IE' WHERE name = 'Ireland';
UPDATE countries SET code = 'SG' WHERE name = 'Singapore';
UPDATE countries SET code = 'TW' WHERE name = 'Taiwan';
UPDATE countries SET code = 'UA' WHERE name = 'Ukraine';
UPDATE countries SET code = 'ZA' WHERE name = 'South Africa';
UPDATE countries SET code = 'AR' WHERE name = 'Argentina';
UPDATE countries SET code = 'NL' WHERE name = 'Netherlands';
