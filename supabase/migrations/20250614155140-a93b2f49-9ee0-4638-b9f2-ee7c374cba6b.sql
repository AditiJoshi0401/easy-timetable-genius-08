
-- Update the streams table to use semesters instead of years
ALTER TABLE streams RENAME COLUMN years TO semesters;

-- Update the subjects table to use semester instead of year
ALTER TABLE subjects RENAME COLUMN year TO semester;

-- Update the divisions table to use semester instead of year
ALTER TABLE divisions RENAME COLUMN year TO semester;

-- Update any existing data if needed (this assumes your current data is valid)
-- The actual values will remain the same, just the column names change
