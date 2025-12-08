-- Add manual time entry settings to teams table (company-wide default)
ALTER TABLE public.teams 
ADD COLUMN allow_manual_time_entry boolean NOT NULL DEFAULT false;

-- Add override setting to profiles for supervisors
-- null = use team setting, true = allow, false = deny (override team setting)
ALTER TABLE public.profiles 
ADD COLUMN manual_time_entry_override boolean DEFAULT null;

-- Comment explaining the logic
COMMENT ON COLUMN public.teams.allow_manual_time_entry IS 'Company-wide default: whether employees can manually input time instead of using timer';
COMMENT ON COLUMN public.profiles.manual_time_entry_override IS 'Supervisor override: null=use team setting, true=allow, false=deny for their subordinates';