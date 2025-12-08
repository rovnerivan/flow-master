-- Task templates/definitions
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'monthly', 'annual', 'occasional', 'one_time')) DEFAULT 'daily',
  estimated_duration_min INTEGER DEFAULT 15,
  linked_process_id UUID REFERENCES processes(id) ON DELETE SET NULL,
  created_by UUID,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Task assignments (actual instances assigned to users)
CREATE TABLE public.task_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  is_shared BOOLEAN DEFAULT false,
  -- For individual tasks: label to differentiate instances (e.g., "Caja 1", "Caja 2")
  instance_label TEXT,
  due_date DATE,
  due_time TIME,
  -- For shared tasks: shared status. For individual: ignored, use task_assignees.status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  completed_at TIMESTAMPTZ,
  completed_by UUID,
  assigned_by UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Task assignees (links users to assignments)
CREATE TABLE public.task_assignees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES task_assignments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  -- For individual tasks: personal completion tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  time_spent_seconds INTEGER DEFAULT 0,
  UNIQUE(assignment_id, user_id)
);

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_assignees ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tasks
CREATE POLICY "Admins can manage tasks in their team"
ON public.tasks FOR ALL
USING (team_id = get_user_team_id(auth.uid()) AND is_team_admin_or_supervisor(auth.uid()));

CREATE POLICY "Users can view tasks in their team"
ON public.tasks FOR SELECT
USING (team_id = get_user_team_id(auth.uid()));

-- RLS Policies for task_assignments
CREATE POLICY "Admins can manage task assignments in their team"
ON public.task_assignments FOR ALL
USING (team_id = get_user_team_id(auth.uid()) AND is_team_admin_or_supervisor(auth.uid()));

CREATE POLICY "Users can view task assignments in their team"
ON public.task_assignments FOR SELECT
USING (team_id = get_user_team_id(auth.uid()));

-- RLS Policies for task_assignees
CREATE POLICY "Admins can manage task assignees in their team"
ON public.task_assignees FOR ALL
USING (team_id = get_user_team_id(auth.uid()) AND is_team_admin_or_supervisor(auth.uid()));

CREATE POLICY "Users can view their own assignments"
ON public.task_assignees FOR SELECT
USING (user_id = auth.uid() OR (team_id = get_user_team_id(auth.uid()) AND is_team_admin_or_supervisor(auth.uid())));

CREATE POLICY "Users can update their own assignment status"
ON public.task_assignees FOR UPDATE
USING (user_id = auth.uid());

-- Indexes
CREATE INDEX idx_tasks_team_id ON public.tasks(team_id);
CREATE INDEX idx_task_assignments_team_id ON public.task_assignments(team_id);
CREATE INDEX idx_task_assignments_task_id ON public.task_assignments(task_id);
CREATE INDEX idx_task_assignees_user_id ON public.task_assignees(user_id);
CREATE INDEX idx_task_assignees_assignment_id ON public.task_assignees(assignment_id);

-- Trigger for updated_at
CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();