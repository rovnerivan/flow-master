-- Create enum for targeting types
CREATE TYPE public.culture_target_type AS ENUM (
  'all_organization',      -- All members of the organization
  'direct_reports',        -- Only direct reports
  'all_subordinates',      -- All subordinates (direct and indirect)
  'specific_users',        -- Specific selected users
  'specific_levels',       -- Specific hierarchy levels
  'specific_branches'      -- Specific hierarchy branches (departments/areas)
);

-- Create enum for hierarchy levels
CREATE TYPE public.hierarchy_level AS ENUM (
  'owner',
  'admin',
  'supervisor',
  'employee'
);

-- Create culture_content table
CREATE TABLE public.culture_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL,
  title TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('video', 'audio', 'text', 'link')),
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Visión',
  
  -- Targeting options
  target_type culture_target_type NOT NULL DEFAULT 'direct_reports',
  target_user_ids UUID[] DEFAULT '{}',           -- For specific_users
  target_levels hierarchy_level[] DEFAULT '{}',   -- For specific_levels (e.g., only supervisors, only employees)
  target_branch_user_ids UUID[] DEFAULT '{}',     -- For specific_branches (root users of branches)
  include_indirect_subordinates BOOLEAN DEFAULT true,
  
  -- Metadata
  is_active BOOLEAN DEFAULT false,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.culture_content ENABLE ROW LEVEL SECURITY;

-- Create function to check if user is subordinate of creator
CREATE OR REPLACE FUNCTION public.is_subordinate_of(subordinate_id UUID, superior_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := subordinate_id;
  max_depth INTEGER := 10;
  depth INTEGER := 0;
BEGIN
  -- Check if they're the same user
  IF subordinate_id = superior_id THEN
    RETURN FALSE;
  END IF;
  
  -- Walk up the hierarchy
  WHILE current_user_id IS NOT NULL AND depth < max_depth LOOP
    SELECT reports_to_id INTO current_user_id
    FROM public.profiles
    WHERE id = current_user_id;
    
    IF current_user_id = superior_id THEN
      RETURN TRUE;
    END IF;
    
    depth := depth + 1;
  END LOOP;
  
  RETURN FALSE;
END;
$$;

-- Create function to check if user is direct subordinate
CREATE OR REPLACE FUNCTION public.is_direct_subordinate_of(subordinate_id UUID, superior_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = subordinate_id
      AND reports_to_id = superior_id
  )
$$;

-- Create function to get user hierarchy level
CREATE OR REPLACE FUNCTION public.get_user_hierarchy_level(user_id UUID)
RETURNS hierarchy_level
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    CASE 
      WHEN has_role(user_id, 'super_admin') THEN 'owner'::hierarchy_level
      WHEN has_role(user_id, 'business_admin') THEN 'admin'::hierarchy_level
      WHEN has_role(user_id, 'supervisor') THEN 'supervisor'::hierarchy_level
      ELSE 'employee'::hierarchy_level
    END
$$;

-- Create function to check if user can see content based on targeting
CREATE OR REPLACE FUNCTION public.can_view_culture_content(viewer_id UUID, content_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  content_record RECORD;
  viewer_level hierarchy_level;
  branch_root UUID;
BEGIN
  -- Get content details
  SELECT * INTO content_record
  FROM public.culture_content
  WHERE id = content_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Creator can always see their own content
  IF content_record.creator_id = viewer_id THEN
    RETURN TRUE;
  END IF;
  
  -- Check based on target type
  CASE content_record.target_type
    WHEN 'all_organization' THEN
      -- All members in the same team can see
      RETURN is_team_member(viewer_id, content_record.team_id);
      
    WHEN 'direct_reports' THEN
      -- Only direct subordinates of creator
      RETURN is_direct_subordinate_of(viewer_id, content_record.creator_id);
      
    WHEN 'all_subordinates' THEN
      -- All subordinates (direct and indirect) of creator
      RETURN is_subordinate_of(viewer_id, content_record.creator_id);
      
    WHEN 'specific_users' THEN
      -- Specific selected users (must be subordinates)
      RETURN viewer_id = ANY(content_record.target_user_ids) 
             AND is_subordinate_of(viewer_id, content_record.creator_id);
      
    WHEN 'specific_levels' THEN
      -- Specific hierarchy levels (only subordinates at those levels)
      viewer_level := get_user_hierarchy_level(viewer_id);
      RETURN viewer_level = ANY(content_record.target_levels)
             AND is_subordinate_of(viewer_id, content_record.creator_id);
      
    WHEN 'specific_branches' THEN
      -- Specific branches (subordinates under specific branch roots)
      -- Check if viewer is a subordinate of any of the branch roots
      FOREACH branch_root IN ARRAY content_record.target_branch_user_ids LOOP
        IF branch_root = viewer_id OR 
           (content_record.include_indirect_subordinates AND is_subordinate_of(viewer_id, branch_root)) OR
           (NOT content_record.include_indirect_subordinates AND is_direct_subordinate_of(viewer_id, branch_root)) THEN
          -- Also verify branch root is subordinate of creator (security)
          IF branch_root = content_record.creator_id OR is_subordinate_of(branch_root, content_record.creator_id) THEN
            RETURN TRUE;
          END IF;
        END IF;
      END LOOP;
      RETURN FALSE;
      
    ELSE
      RETURN FALSE;
  END CASE;
END;
$$;

-- RLS Policies

-- Admins and supervisors can create content for their team (must be able to target subordinates)
CREATE POLICY "Users can create culture content in their team"
ON public.culture_content
FOR INSERT
WITH CHECK (
  team_id = get_user_team_id(auth.uid()) 
  AND creator_id = auth.uid()
  AND is_team_admin_or_supervisor(auth.uid())
);

-- Creators can update their own content
CREATE POLICY "Creators can update their own content"
ON public.culture_content
FOR UPDATE
USING (creator_id = auth.uid());

-- Creators can delete their own content
CREATE POLICY "Creators can delete their own content"
ON public.culture_content
FOR DELETE
USING (creator_id = auth.uid());

-- Users can view content they're allowed to see
CREATE POLICY "Users can view allowed culture content"
ON public.culture_content
FOR SELECT
USING (
  team_id = get_user_team_id(auth.uid()) 
  AND can_view_culture_content(auth.uid(), id)
);

-- Create trigger for updated_at
CREATE TRIGGER update_culture_content_updated_at
BEFORE UPDATE ON public.culture_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_culture_content_team_id ON public.culture_content(team_id);
CREATE INDEX idx_culture_content_creator_id ON public.culture_content(creator_id);
CREATE INDEX idx_culture_content_is_active ON public.culture_content(is_active);