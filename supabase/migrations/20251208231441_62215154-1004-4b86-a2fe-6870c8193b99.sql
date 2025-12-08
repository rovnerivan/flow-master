-- Add columns for employee task scheduling autonomy
ALTER TABLE public.task_assignments 
ADD COLUMN IF NOT EXISTS is_fixed_by_supervisor boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS scheduled_by uuid REFERENCES public.profiles(id);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_task_assignments_scheduled_by ON public.task_assignments(scheduled_by);

-- Update RLS policy to allow employees to update their own task's scheduled_date (if not fixed)
CREATE POLICY "Employees can update their own task scheduling"
ON public.task_assignments
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.task_assignees ta
    WHERE ta.assignment_id = task_assignments.id
    AND ta.user_id = auth.uid()
  )
  AND (is_fixed_by_supervisor = false OR is_fixed_by_supervisor IS NULL)
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.task_assignees ta
    WHERE ta.assignment_id = task_assignments.id
    AND ta.user_id = auth.uid()
  )
  AND (is_fixed_by_supervisor = false OR is_fixed_by_supervisor IS NULL)
);

-- Add comment for documentation
COMMENT ON COLUMN public.task_assignments.is_fixed_by_supervisor IS 'When true, employee cannot modify the scheduled_date';
COMMENT ON COLUMN public.task_assignments.scheduled_by IS 'UUID of user who scheduled/moved this task to a specific date';