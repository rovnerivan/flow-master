-- Create enum for strategic planning levels
CREATE TYPE public.planning_level AS ENUM ('strategy', 'objective', 'initiative', 'action');

-- Create enum for planning item status
CREATE TYPE public.planning_status AS ENUM ('draft', 'active', 'completed', 'on_hold', 'cancelled');

-- Create the main planning_items table (unified tree structure)
CREATE TABLE public.planning_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.planning_items(id) ON DELETE CASCADE,
  level planning_level NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status planning_status NOT NULL DEFAULT 'draft',
  
  -- Ownership and timeline
  owner_id UUID REFERENCES public.profiles(id),
  start_date DATE,
  end_date DATE,
  
  -- Progress tracking
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  target_value NUMERIC,
  current_value NUMERIC,
  unit TEXT,
  
  -- Visual/organizational
  color TEXT,
  order_index INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Create index for tree traversal
CREATE INDEX idx_planning_items_parent ON public.planning_items(parent_id);
CREATE INDEX idx_planning_items_team_level ON public.planning_items(team_id, level);
CREATE INDEX idx_planning_items_owner ON public.planning_items(owner_id);

-- Link planning items to tasks
CREATE TABLE public.planning_task_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  planning_item_id UUID NOT NULL REFERENCES public.planning_items(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(planning_item_id, task_id)
);

-- Link planning items to processes
CREATE TABLE public.planning_process_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  planning_item_id UUID NOT NULL REFERENCES public.planning_items(id) ON DELETE CASCADE,
  process_id UUID NOT NULL REFERENCES public.processes(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(planning_item_id, process_id)
);

-- Enable RLS
ALTER TABLE public.planning_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planning_task_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planning_process_links ENABLE ROW LEVEL SECURITY;

-- RLS Policies for planning_items
CREATE POLICY "Users can view planning items in their team"
ON public.planning_items FOR SELECT
USING (team_id = get_user_team_id(auth.uid()));

CREATE POLICY "Admins can manage all planning items"
ON public.planning_items FOR ALL
USING (
  team_id = get_user_team_id(auth.uid()) 
  AND is_team_admin_or_supervisor(auth.uid())
);

-- RLS Policies for planning_task_links
CREATE POLICY "Users can view planning task links in their team"
ON public.planning_task_links FOR SELECT
USING (team_id = get_user_team_id(auth.uid()));

CREATE POLICY "Admins can manage planning task links"
ON public.planning_task_links FOR ALL
USING (
  team_id = get_user_team_id(auth.uid()) 
  AND is_team_admin_or_supervisor(auth.uid())
);

-- RLS Policies for planning_process_links
CREATE POLICY "Users can view planning process links in their team"
ON public.planning_process_links FOR SELECT
USING (team_id = get_user_team_id(auth.uid()));

CREATE POLICY "Admins can manage planning process links"
ON public.planning_process_links FOR ALL
USING (
  team_id = get_user_team_id(auth.uid()) 
  AND is_team_admin_or_supervisor(auth.uid())
);

-- Trigger for updated_at
CREATE TRIGGER update_planning_items_updated_at
BEFORE UPDATE ON public.planning_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();