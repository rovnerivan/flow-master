import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RecurrenceRule {
  id: string;
  task_id: string;
  team_id: string;
  pattern_type: string;
  days_of_week: number[] | null;
  day_of_month: number | null;
  week_of_month: number | null;
  month_of_year: number | null;
  default_due_time: string | null;
  starts_on: string | null;
  ends_on: string | null;
  auto_generate: boolean;
  is_active: boolean;
}

interface Task {
  id: string;
  name: string;
  team_id: string;
  estimated_duration_min: number | null;
}

// Check if a date matches the recurrence pattern
function matchesPattern(date: Date, rule: RecurrenceRule): boolean {
  const dayOfWeek = date.getDay();
  const dayOfMonth = date.getDate();
  const month = date.getMonth() + 1;

  switch (rule.pattern_type) {
    case 'daily':
      return true;

    case 'specific_days':
      return rule.days_of_week?.includes(dayOfWeek) ?? false;

    case 'weekly':
      return dayOfWeek === (rule.days_of_week?.[0] ?? 1);

    case 'biweekly':
      if (!rule.days_of_week?.includes(dayOfWeek)) return false;
      const weekNumber = Math.floor(date.getTime() / (7 * 24 * 60 * 60 * 1000));
      return weekNumber % 2 === 0;

    case 'monthly':
      if (rule.day_of_month) {
        return dayOfMonth === rule.day_of_month;
      }
      if (rule.week_of_month && rule.days_of_week?.length) {
        const targetDay = rule.days_of_week[0];
        const weekOfMonth = Math.ceil(dayOfMonth / 7);
        return dayOfWeek === targetDay && weekOfMonth === rule.week_of_month;
      }
      return false;

    case 'quarterly':
      if (![1, 4, 7, 10].includes(month)) return false;
      return rule.day_of_month ? dayOfMonth === rule.day_of_month : dayOfMonth === 1;

    case 'annual':
      if (rule.month_of_year && month !== rule.month_of_year) return false;
      return rule.day_of_month ? dayOfMonth === rule.day_of_month : dayOfMonth === 1;

    default:
      return false;
  }
}

// Format date as YYYY-MM-DD
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Add days to a date
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const { team_id, days_ahead = 7, task_id } = await req.json().catch(() => ({}));

    console.log(`Generating task instances for team: ${team_id}, days_ahead: ${days_ahead}, task_id: ${task_id || 'all'}`);

    // Build query for recurrence rules
    let rulesQuery = supabase
      .from('task_recurrence_rules')
      .select(`
        *,
        tasks!inner (
          id,
          name,
          team_id,
          estimated_duration_min
        )
      `)
      .eq('is_active', true)
      .eq('auto_generate', true);

    if (team_id) {
      rulesQuery = rulesQuery.eq('team_id', team_id);
    }
    if (task_id) {
      rulesQuery = rulesQuery.eq('task_id', task_id);
    }

    const { data: rules, error: rulesError } = await rulesQuery;

    if (rulesError) {
      console.error('Error fetching recurrence rules:', rulesError);
      throw new Error(`Failed to fetch recurrence rules: ${rulesError.message}`);
    }

    console.log(`Found ${rules?.length || 0} active auto-generate rules`);

    if (!rules || rules.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No active rules found',
          generated: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = addDays(today, days_ahead);
    
    let totalGenerated = 0;
    const errors: string[] = [];

    // Process each rule
    for (const rule of rules) {
      const task = rule.tasks as Task;
      
      console.log(`Processing rule ${rule.id} for task: ${task.name}`);

      // Get existing assignments for this task in the date range
      const { data: existingAssignments, error: assignmentsError } = await supabase
        .from('task_assignments')
        .select('scheduled_date')
        .eq('task_id', task.id)
        .gte('scheduled_date', formatDate(today))
        .lte('scheduled_date', formatDate(endDate));

      if (assignmentsError) {
        console.error(`Error fetching existing assignments for task ${task.id}:`, assignmentsError);
        errors.push(`Task ${task.id}: ${assignmentsError.message}`);
        continue;
      }

      const existingDates = new Set(existingAssignments?.map(a => a.scheduled_date) || []);

      // Generate instances for each day in the range
      let currentDate = new Date(today);
      const instancesToCreate: any[] = [];

      while (currentDate <= endDate) {
        const dateStr = formatDate(currentDate);
        
        // Check if within rule's active period
        if (rule.starts_on && dateStr < rule.starts_on) {
          currentDate = addDays(currentDate, 1);
          continue;
        }
        if (rule.ends_on && dateStr > rule.ends_on) {
          break;
        }

        // Check if instance already exists for this date
        if (existingDates.has(dateStr)) {
          currentDate = addDays(currentDate, 1);
          continue;
        }

        // Check if date matches the pattern
        if (matchesPattern(currentDate, rule)) {
          instancesToCreate.push({
            task_id: task.id,
            team_id: task.team_id,
            scheduled_date: dateStr,
            due_date: dateStr,
            due_time: rule.default_due_time,
            status: 'pending',
            is_from_template: true,
            recurrence_rule_id: rule.id,
          });
        }

        currentDate = addDays(currentDate, 1);
      }

      // Insert new instances
      if (instancesToCreate.length > 0) {
        console.log(`Creating ${instancesToCreate.length} instances for task: ${task.name}`);
        
        const { data: created, error: insertError } = await supabase
          .from('task_assignments')
          .insert(instancesToCreate)
          .select();

        if (insertError) {
          console.error(`Error creating instances for task ${task.id}:`, insertError);
          errors.push(`Task ${task.id}: ${insertError.message}`);
        } else {
          totalGenerated += created?.length || 0;
          console.log(`Successfully created ${created?.length || 0} instances`);
        }
      }
    }

    console.log(`Total instances generated: ${totalGenerated}`);

    return new Response(
      JSON.stringify({
        success: true,
        generated: totalGenerated,
        errors: errors.length > 0 ? errors : undefined,
        message: `Generated ${totalGenerated} task instances`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-task-instances:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
