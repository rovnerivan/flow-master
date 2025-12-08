
-- Create enum for recurrence pattern types
CREATE TYPE public.recurrence_pattern_type AS ENUM (
  'daily',
  'specific_days',
  'weekly',
  'biweekly',
  'monthly',
  'quarterly',
  'annual',
  'one_time'
);

-- Create task_recurrence_rules table
CREATE TABLE public.task_recurrence_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  pattern_type recurrence_pattern_type NOT NULL DEFAULT 'daily',
  days_of_week INTEGER[] DEFAULT '{}'::INTEGER[], -- 1=Monday, 7=Sunday
  day_of_month INTEGER, -- For monthly recurrence (1-31)
  week_of_month INTEGER, -- For "second week of month" patterns (1-5)
  month_of_year INTEGER, -- For annual recurrence (1-12)
  default_due_time TIME WITHOUT TIME ZONE DEFAULT '17:00:00',
  starts_on DATE DEFAULT CURRENT_DATE,
  ends_on DATE, -- NULL means indefinite
  auto_generate BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(task_id) -- One recurrence rule per task
);

-- Add columns to task_assignments for instance tracking
ALTER TABLE public.task_assignments 
ADD COLUMN IF NOT EXISTS scheduled_date DATE,
ADD COLUMN IF NOT EXISTS is_from_template BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS recurrence_rule_id UUID REFERENCES public.task_recurrence_rules(id) ON DELETE SET NULL;

-- Enable RLS on task_recurrence_rules
ALTER TABLE public.task_recurrence_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for task_recurrence_rules
CREATE POLICY "Admins can manage recurrence rules in their team"
ON public.task_recurrence_rules
FOR ALL
USING (
  (team_id = get_user_team_id(auth.uid())) 
  AND is_team_admin_or_supervisor(auth.uid())
);

CREATE POLICY "Users can view recurrence rules in their team"
ON public.task_recurrence_rules
FOR SELECT
USING (team_id = get_user_team_id(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_task_recurrence_rules_updated_at
BEFORE UPDATE ON public.task_recurrence_rules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_task_recurrence_rules_task_id ON public.task_recurrence_rules(task_id);
CREATE INDEX idx_task_recurrence_rules_team_id ON public.task_recurrence_rules(team_id);
CREATE INDEX idx_task_assignments_scheduled_date ON public.task_assignments(scheduled_date);
