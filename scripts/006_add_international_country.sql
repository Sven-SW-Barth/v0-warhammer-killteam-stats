-- Add International as a special country option
-- First, alter the code column to allow 3 characters instead of 2
ALTER TABLE countries ALTER COLUMN code TYPE varchar(3);

-- Then insert International with code 'INT'
INSERT INTO countries (name, code) 
VALUES ('International', 'INT')
ON CONFLICT (name) DO UPDATE 
SET code = 'INT';
