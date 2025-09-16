-- Add teacher workload management fields to teachers table
ALTER TABLE public.teachers 
ADD COLUMN max_lectures INTEGER DEFAULT 10,
ADD COLUMN max_labs INTEGER DEFAULT 5,
ADD COLUMN max_tutorials INTEGER DEFAULT 8;

-- Update existing teachers to have default values
UPDATE public.teachers 
SET max_lectures = 10, max_labs = 5, max_tutorials = 8 
WHERE max_lectures IS NULL OR max_labs IS NULL OR max_tutorials IS NULL;