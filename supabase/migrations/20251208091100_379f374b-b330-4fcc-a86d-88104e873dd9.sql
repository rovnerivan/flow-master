-- Add new status enum type for processes
CREATE TYPE public.process_status AS ENUM ('draft', 'published', 'under_review', 'discontinued');

-- Add new columns to processes table
ALTER TABLE public.processes 
ADD COLUMN status public.process_status DEFAULT 'draft'::process_status,
ADD COLUMN review_description text,
ADD COLUMN review_reason text,
ADD COLUMN review_risks text,
ADD COLUMN review_started_at timestamp with time zone,
ADD COLUMN review_started_by uuid REFERENCES public.profiles(id),
ADD COLUMN discontinued_at timestamp with time zone,
ADD COLUMN discontinued_by uuid REFERENCES public.profiles(id),
ADD COLUMN discontinued_reason text;

-- Create process_versions table for version history
CREATE TABLE public.process_versions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  process_id uuid NOT NULL REFERENCES public.processes(id) ON DELETE CASCADE,
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  version_number text NOT NULL,
  name text NOT NULL,
  description text,
  steps_snapshot jsonb, -- snapshot of all steps at this version
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  change_summary text, -- what changed in this version
  UNIQUE(process_id, version_number)
);

-- Enable RLS on process_versions
ALTER TABLE public.process_versions ENABLE ROW LEVEL SECURITY;

-- RLS policies for process_versions
CREATE POLICY "Users can view versions in their team"
ON public.process_versions
FOR SELECT
USING (team_id = get_user_team_id(auth.uid()));

CREATE POLICY "Admins can manage versions in their team"
ON public.process_versions
FOR ALL
USING (team_id = get_user_team_id(auth.uid()) AND is_team_admin_or_supervisor(auth.uid()));

-- Create index for faster lookups
CREATE INDEX idx_process_versions_process_id ON public.process_versions(process_id);
CREATE INDEX idx_process_versions_team_id ON public.process_versions(team_id);