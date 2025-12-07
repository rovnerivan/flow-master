
-- =============================================
-- PROCESSFLOW: COMPLETE DATABASE SCHEMA
-- Multi-tenant with team_id filtering
-- =============================================

-- 1. Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('super_admin', 'business_admin', 'supervisor', 'employee');

-- 2. Create enum for process status
CREATE TYPE public.assignment_status AS ENUM ('pending', 'in_progress', 'completed');

-- 3. Create enum for content types
CREATE TYPE public.content_type AS ENUM ('video', 'text', 'checklist');

-- 4. Create enum for priority
CREATE TYPE public.priority_level AS ENUM ('high', 'medium', 'low');

-- 5. Create enum for feed content types
CREATE TYPE public.feed_content_type AS ENUM ('tip', 'achievement', 'certification');

-- =============================================
-- CORE TABLES
-- =============================================

-- Teams table (Tenants/Clients)
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subscription_plan TEXT DEFAULT 'free',
  invite_code TEXT UNIQUE NOT NULL DEFAULT upper(substring(md5(random()::text) from 1 for 8)),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Profiles table (User data, NO role stored here)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  reports_to_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  job_title TEXT,
  hire_date DATE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- User roles table (CRITICAL: Roles stored separately for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'employee',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, role)
);

-- =============================================
-- SECURITY DEFINER FUNCTIONS
-- =============================================

-- Function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get user's team_id
CREATE OR REPLACE FUNCTION public.get_user_team_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT team_id
  FROM public.profiles
  WHERE id = _user_id
$$;

-- Function to check if user belongs to a team
CREATE OR REPLACE FUNCTION public.is_team_member(_user_id UUID, _team_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = _user_id
      AND team_id = _team_id
  )
$$;

-- Function to check if user is admin or supervisor of a team
CREATE OR REPLACE FUNCTION public.is_team_admin_or_supervisor(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('business_admin', 'supervisor', 'super_admin')
  )
$$;

-- =============================================
-- PROCESS MANAGEMENT TABLES
-- =============================================

-- Processes table
CREATE TABLE public.processes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  current_version TEXT DEFAULT '1.0',
  benchmark_time_min INTEGER DEFAULT 10,
  creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Process steps table
CREATE TABLE public.process_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  process_id UUID NOT NULL REFERENCES public.processes(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  content_type content_type DEFAULT 'video',
  video_url TEXT,
  script_text TEXT,
  duration_seconds INTEGER DEFAULT 60,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Process assignments table
CREATE TABLE public.process_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  process_id UUID NOT NULL REFERENCES public.processes(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  assigned_by_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status assignment_status DEFAULT 'pending',
  assigned_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  completed_at TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  UNIQUE(user_id, process_id)
);

-- Step completions table
CREATE TABLE public.step_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  process_id UUID NOT NULL REFERENCES public.processes(id) ON DELETE CASCADE,
  step_id UUID NOT NULL REFERENCES public.process_steps(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  time_spent_seconds INTEGER DEFAULT 0,
  UNIQUE(user_id, step_id)
);

-- Step feedback table
CREATE TABLE public.step_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  process_id UUID NOT NULL REFERENCES public.processes(id) ON DELETE CASCADE,
  step_id UUID NOT NULL REFERENCES public.process_steps(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  is_confused BOOLEAN DEFAULT false,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =============================================
-- DAILY CHECKLIST TABLES
-- =============================================

-- Daily checklists table
CREATE TABLE public.daily_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Checklist items table
CREATE TABLE public.checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id UUID NOT NULL REFERENCES public.daily_checklists(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  linked_process_id UUID REFERENCES public.processes(id) ON DELETE SET NULL,
  priority priority_level DEFAULT 'medium',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Checklist completions table
CREATE TABLE public.checklist_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  checklist_item_id UUID NOT NULL REFERENCES public.checklist_items(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  completion_date DATE DEFAULT CURRENT_DATE NOT NULL,
  UNIQUE(user_id, checklist_item_id, completion_date)
);

-- =============================================
-- ENGAGEMENT & GAMIFICATION TABLES
-- =============================================

-- Micro learnings table
CREATE TABLE public.micro_learnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT,
  script_text TEXT,
  video_url TEXT,
  duration_seconds INTEGER DEFAULT 45,
  scheduled_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Certifications table
CREATE TABLE public.certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  process_id UUID NOT NULL REFERENCES public.processes(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  certified_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  certificate_url TEXT,
  UNIQUE(user_id, process_id)
);

-- Team feed table
CREATE TABLE public.team_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  content_type feed_content_type DEFAULT 'tip',
  content_text TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Error logs table
CREATE TABLE public.error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  process_id UUID REFERENCES public.processes(id) ON DELETE SET NULL,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  error_type TEXT,
  description TEXT,
  estimated_loss_value DECIMAL(10,2),
  reported_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.process_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.process_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.step_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.step_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.micro_learnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================

-- TEAMS policies
CREATE POLICY "Super admins can view all teams" ON public.teams
  FOR SELECT USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can view their own team" ON public.teams
  FOR SELECT USING (public.is_team_member(auth.uid(), id));

CREATE POLICY "Super admins can manage all teams" ON public.teams
  FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- PROFILES policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view profiles in their team" ON public.profiles
  FOR SELECT USING (team_id = public.get_user_team_id(auth.uid()));

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Super admins can manage all profiles" ON public.profiles
  FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- USER_ROLES policies
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view roles in their team" ON public.user_roles
  FOR SELECT USING (
    public.is_team_admin_or_supervisor(auth.uid()) 
    AND public.is_team_member(user_id, public.get_user_team_id(auth.uid()))
  );

CREATE POLICY "Business admins can manage roles in their team" ON public.user_roles
  FOR ALL USING (
    public.has_role(auth.uid(), 'business_admin')
    AND public.is_team_member(user_id, public.get_user_team_id(auth.uid()))
  );

CREATE POLICY "Super admins can manage all roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- PROCESSES policies
CREATE POLICY "Users can view published processes in their team" ON public.processes
  FOR SELECT USING (
    team_id = public.get_user_team_id(auth.uid())
    AND (is_published = true OR public.is_team_admin_or_supervisor(auth.uid()))
  );

CREATE POLICY "Admins can manage processes in their team" ON public.processes
  FOR ALL USING (
    team_id = public.get_user_team_id(auth.uid())
    AND public.is_team_admin_or_supervisor(auth.uid())
  );

-- PROCESS_STEPS policies
CREATE POLICY "Users can view steps in their team" ON public.process_steps
  FOR SELECT USING (team_id = public.get_user_team_id(auth.uid()));

CREATE POLICY "Admins can manage steps in their team" ON public.process_steps
  FOR ALL USING (
    team_id = public.get_user_team_id(auth.uid())
    AND public.is_team_admin_or_supervisor(auth.uid())
  );

-- PROCESS_ASSIGNMENTS policies
CREATE POLICY "Users can view their own assignments" ON public.process_assignments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view assignments in their team" ON public.process_assignments
  FOR SELECT USING (
    team_id = public.get_user_team_id(auth.uid())
    AND public.is_team_admin_or_supervisor(auth.uid())
  );

CREATE POLICY "Admins can manage assignments in their team" ON public.process_assignments
  FOR ALL USING (
    team_id = public.get_user_team_id(auth.uid())
    AND public.is_team_admin_or_supervisor(auth.uid())
  );

CREATE POLICY "Users can update their own assignment status" ON public.process_assignments
  FOR UPDATE USING (auth.uid() = user_id);

-- STEP_COMPLETIONS policies
CREATE POLICY "Users can view their own completions" ON public.step_completions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view completions in their team" ON public.step_completions
  FOR SELECT USING (
    team_id = public.get_user_team_id(auth.uid())
    AND public.is_team_admin_or_supervisor(auth.uid())
  );

CREATE POLICY "Users can insert their own completions" ON public.step_completions
  FOR INSERT WITH CHECK (auth.uid() = user_id AND team_id = public.get_user_team_id(auth.uid()));

-- STEP_FEEDBACK policies
CREATE POLICY "Users can manage their own feedback" ON public.step_feedback
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view feedback in their team" ON public.step_feedback
  FOR SELECT USING (
    team_id = public.get_user_team_id(auth.uid())
    AND public.is_team_admin_or_supervisor(auth.uid())
  );

-- DAILY_CHECKLISTS policies
CREATE POLICY "Users can view checklists in their team" ON public.daily_checklists
  FOR SELECT USING (team_id = public.get_user_team_id(auth.uid()));

CREATE POLICY "Admins can manage checklists in their team" ON public.daily_checklists
  FOR ALL USING (
    team_id = public.get_user_team_id(auth.uid())
    AND public.is_team_admin_or_supervisor(auth.uid())
  );

-- CHECKLIST_ITEMS policies
CREATE POLICY "Users can view items in their team" ON public.checklist_items
  FOR SELECT USING (team_id = public.get_user_team_id(auth.uid()));

CREATE POLICY "Admins can manage items in their team" ON public.checklist_items
  FOR ALL USING (
    team_id = public.get_user_team_id(auth.uid())
    AND public.is_team_admin_or_supervisor(auth.uid())
  );

-- CHECKLIST_COMPLETIONS policies
CREATE POLICY "Users can manage their own completions" ON public.checklist_completions
  FOR ALL USING (auth.uid() = user_id AND team_id = public.get_user_team_id(auth.uid()));

CREATE POLICY "Admins can view completions in their team" ON public.checklist_completions
  FOR SELECT USING (
    team_id = public.get_user_team_id(auth.uid())
    AND public.is_team_admin_or_supervisor(auth.uid())
  );

-- MICRO_LEARNINGS policies
CREATE POLICY "Users can view active micro learnings" ON public.micro_learnings
  FOR SELECT USING (
    is_active = true 
    AND (team_id IS NULL OR team_id = public.get_user_team_id(auth.uid()))
  );

CREATE POLICY "Admins can manage micro learnings in their team" ON public.micro_learnings
  FOR ALL USING (
    team_id = public.get_user_team_id(auth.uid())
    AND public.is_team_admin_or_supervisor(auth.uid())
  );

-- CERTIFICATIONS policies
CREATE POLICY "Users can view their own certifications" ON public.certifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view certifications in their team" ON public.certifications
  FOR SELECT USING (team_id = public.get_user_team_id(auth.uid()));

CREATE POLICY "System can insert certifications" ON public.certifications
  FOR INSERT WITH CHECK (team_id = public.get_user_team_id(auth.uid()));

-- TEAM_FEED policies
CREATE POLICY "Users can view feed in their team" ON public.team_feed
  FOR SELECT USING (team_id = public.get_user_team_id(auth.uid()));

CREATE POLICY "Users can post to their team feed" ON public.team_feed
  FOR INSERT WITH CHECK (
    auth.uid() = user_id 
    AND team_id = public.get_user_team_id(auth.uid())
  );

CREATE POLICY "Users can delete their own posts" ON public.team_feed
  FOR DELETE USING (auth.uid() = user_id);

-- ERROR_LOGS policies
CREATE POLICY "Admins can view error logs in their team" ON public.error_logs
  FOR SELECT USING (
    team_id = public.get_user_team_id(auth.uid())
    AND public.is_team_admin_or_supervisor(auth.uid())
  );

CREATE POLICY "Users can report errors in their team" ON public.error_logs
  FOR INSERT WITH CHECK (team_id = public.get_user_team_id(auth.uid()));

-- =============================================
-- TRIGGERS FOR AUTO-UPDATES
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_processes_updated_at
  BEFORE UPDATE ON public.processes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_process_steps_updated_at
  BEFORE UPDATE ON public.process_steps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_daily_checklists_updated_at
  BEFORE UPDATE ON public.daily_checklists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- FUNCTION TO CREATE PROFILE ON SIGNUP
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  _team_id UUID;
  _invite_code TEXT;
BEGIN
  -- Get invite code from metadata if provided
  _invite_code := NEW.raw_user_meta_data ->> 'invite_code';
  
  -- If invite code provided, find the team
  IF _invite_code IS NOT NULL AND _invite_code != '' THEN
    SELECT id INTO _team_id FROM public.teams WHERE invite_code = _invite_code;
  END IF;
  
  -- Create profile
  INSERT INTO public.profiles (id, email, full_name, team_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    _team_id
  );
  
  -- Assign default role (employee if joining team, business_admin if no team - creating new)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    CASE WHEN _team_id IS NOT NULL THEN 'employee'::app_role ELSE 'business_admin'::app_role END
  );
  
  -- If no team and no invite code, create a new team for this user
  IF _team_id IS NULL AND (_invite_code IS NULL OR _invite_code = '') THEN
    INSERT INTO public.teams (name)
    VALUES (COALESCE(NEW.raw_user_meta_data ->> 'company_name', 'Mi Empresa'))
    RETURNING id INTO _team_id;
    
    -- Update profile with new team
    UPDATE public.profiles SET team_id = _team_id WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_profiles_team_id ON public.profiles(team_id);
CREATE INDEX idx_processes_team_id ON public.processes(team_id);
CREATE INDEX idx_process_steps_process_id ON public.process_steps(process_id);
CREATE INDEX idx_process_assignments_user_id ON public.process_assignments(user_id);
CREATE INDEX idx_process_assignments_team_id ON public.process_assignments(team_id);
CREATE INDEX idx_step_completions_user_id ON public.step_completions(user_id);
CREATE INDEX idx_checklist_completions_user_id ON public.checklist_completions(user_id);
CREATE INDEX idx_certifications_user_id ON public.certifications(user_id);
CREATE INDEX idx_team_feed_team_id ON public.team_feed(team_id);
CREATE INDEX idx_teams_invite_code ON public.teams(invite_code);
