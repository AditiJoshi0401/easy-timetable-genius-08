
-- Update subjects table to store stream code instead of UUID
ALTER TABLE subjects ALTER COLUMN stream TYPE text;

-- Update existing subjects to use stream codes instead of UUIDs
UPDATE subjects 
SET stream = (
  SELECT code 
  FROM streams 
  WHERE streams.id = subjects.stream::uuid
) 
WHERE EXISTS (
  SELECT 1 
  FROM streams 
  WHERE streams.id = subjects.stream::uuid
);

-- Update teachers table to store roles as array of role names instead of single UUID
-- First rename the column to avoid conflicts
ALTER TABLE teachers RENAME COLUMN role TO old_role;

-- Add new roles column as text array
ALTER TABLE teachers ADD COLUMN roles text[] NOT NULL DEFAULT ARRAY[]::text[];

-- Update existing teachers to convert role UUID to role name array
UPDATE teachers 
SET roles = ARRAY[(
  SELECT name 
  FROM roles 
  WHERE roles.id = old_role::uuid
)]
WHERE old_role IS NOT NULL AND EXISTS (
  SELECT 1 
  FROM roles 
  WHERE roles.id = old_role::uuid
);

-- Drop the old role column
ALTER TABLE teachers DROP COLUMN old_role;
