-- Update subjects table to support multiple streams
-- Change stream column from text to text array to support multiple streams
ALTER TABLE public.subjects 
DROP COLUMN stream;

ALTER TABLE public.subjects 
ADD COLUMN streams text[] NOT NULL DEFAULT ARRAY[]::text[];