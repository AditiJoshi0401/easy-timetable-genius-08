-- Enable RLS on roles table
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for roles (since it's reference data)
CREATE POLICY "Allow all operations on roles" 
ON public.roles 
FOR ALL 
USING (true) 
WITH CHECK (true);