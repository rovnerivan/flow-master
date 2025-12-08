-- Task Metrics Configuration Table
CREATE TABLE public.task_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('quantity', 'monetary', 'percentage', 'time', 'weight', 'distance', 'rating', 'boolean', 'custom')),
  unit TEXT NOT NULL,
  custom_unit_label TEXT,
  target_value NUMERIC NOT NULL,
  minimum_acceptable NUMERIC,
  excellence_threshold NUMERIC,
  is_required BOOLEAN DEFAULT true,
  allow_decimal BOOLEAN DEFAULT false,
  aggregation_type TEXT DEFAULT 'per_instance' CHECK (aggregation_type IN ('per_instance', 'cumulative_daily', 'cumulative_weekly', 'cumulative_monthly')),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Metric Results Table (actual values registered by employees)
CREATE TABLE public.metric_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_id UUID NOT NULL REFERENCES public.task_metrics(id) ON DELETE CASCADE,
  assignment_id UUID NOT NULL REFERENCES public.task_assignments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  actual_value NUMERIC NOT NULL,
  efficiency_percentage NUMERIC GENERATED ALWAYS AS (
    CASE WHEN target_value > 0 THEN (actual_value / target_value * 100) ELSE 0 END
  ) STORED,
  target_value NUMERIC NOT NULL, -- Snapshot of target at time of registration
  notes TEXT,
  registered_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.task_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metric_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for task_metrics
CREATE POLICY "Users can view metrics for tasks in their team"
ON public.task_metrics FOR SELECT
USING (team_id = get_user_team_id(auth.uid()));

CREATE POLICY "Admins can manage metrics in their team"
ON public.task_metrics FOR ALL
USING (team_id = get_user_team_id(auth.uid()) AND is_team_admin_or_supervisor(auth.uid()));

-- RLS Policies for metric_results
CREATE POLICY "Users can view metric results in their team"
ON public.metric_results FOR SELECT
USING (team_id = get_user_team_id(auth.uid()));

CREATE POLICY "Users can insert their own metric results"
ON public.metric_results FOR INSERT
WITH CHECK (user_id = auth.uid() AND team_id = get_user_team_id(auth.uid()));

CREATE POLICY "Admins can manage metric results in their team"
ON public.metric_results FOR ALL
USING (team_id = get_user_team_id(auth.uid()) AND is_team_admin_or_supervisor(auth.uid()));

-- Indexes for performance
CREATE INDEX idx_task_metrics_task_id ON public.task_metrics(task_id);
CREATE INDEX idx_task_metrics_team_id ON public.task_metrics(team_id);
CREATE INDEX idx_metric_results_metric_id ON public.metric_results(metric_id);
CREATE INDEX idx_metric_results_assignment_id ON public.metric_results(assignment_id);
CREATE INDEX idx_metric_results_user_id ON public.metric_results(user_id);
CREATE INDEX idx_metric_results_registered_at ON public.metric_results(registered_at);

-- Trigger for updated_at on task_metrics
CREATE TRIGGER update_task_metrics_updated_at
BEFORE UPDATE ON public.task_metrics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();