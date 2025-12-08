-- Add 'not_achieved' status to planning_status enum
ALTER TYPE public.planning_status ADD VALUE IF NOT EXISTS 'not_achieved';