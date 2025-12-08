import { addDays, addWeeks, addMonths, addYears, format, parseISO, startOfDay, isBefore, isAfter, isSameDay } from 'date-fns';

// Types for instance generation
export interface RecurrenceRule {
  id: string;
  taskId: string;
  teamId: string;
  patternType: 'daily' | 'specific_days' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annual' | 'one_time';
  daysOfWeek?: number[]; // 0-6 for weekly patterns
  dayOfMonth?: number; // 1-31 for monthly
  weekOfMonth?: number; // 1-4 for monthly patterns
  monthOfYear?: number; // 1-12 for annual
  defaultDueTime?: string; // HH:mm format
  startsOn?: string; // ISO date
  endsOn?: string; // ISO date
  autoGenerate: boolean;
  isActive: boolean;
}

export interface TaskInstance {
  id: string;
  taskId: string;
  taskName: string;
  scheduledDate: string;
  dueTime?: string;
  status: 'pending' | 'in_progress' | 'completed';
  assigneeIds: string[];
  instanceLabel?: string;
  isFromTemplate: boolean;
  recurrenceRuleId?: string;
  estimatedDurationMin: number;
  createdAt: string;
}

export interface GenerationResult {
  generatedCount: number;
  instances: TaskInstance[];
  skippedDates: string[];
  errors: string[];
}

/**
 * Calculate next occurrence dates based on recurrence rule
 */
export function calculateNextOccurrences(
  rule: RecurrenceRule,
  fromDate: Date,
  count: number = 10
): Date[] {
  const occurrences: Date[] = [];
  let currentDate = startOfDay(fromDate);
  
  const startsOn = rule.startsOn ? parseISO(rule.startsOn) : null;
  const endsOn = rule.endsOn ? parseISO(rule.endsOn) : null;
  
  // Ensure we start from startsOn if it's in the future
  if (startsOn && isAfter(startsOn, currentDate)) {
    currentDate = startsOn;
  }
  
  let iterations = 0;
  const maxIterations = 365; // Safety limit
  
  while (occurrences.length < count && iterations < maxIterations) {
    iterations++;
    
    // Check if we've passed the end date
    if (endsOn && isAfter(currentDate, endsOn)) {
      break;
    }
    
    // Check if date matches the pattern
    if (matchesPattern(currentDate, rule)) {
      // Check if it's on or after start date
      if (!startsOn || !isBefore(currentDate, startsOn)) {
        occurrences.push(new Date(currentDate));
      }
    }
    
    // Move to next candidate date based on pattern type
    currentDate = getNextCandidateDate(currentDate, rule);
  }
  
  return occurrences;
}

/**
 * Check if a date matches the recurrence pattern
 */
function matchesPattern(date: Date, rule: RecurrenceRule): boolean {
  const dayOfWeek = date.getDay();
  const dayOfMonth = date.getDate();
  const month = date.getMonth() + 1;
  
  switch (rule.patternType) {
    case 'daily':
      return true;
      
    case 'specific_days':
      return rule.daysOfWeek?.includes(dayOfWeek) ?? false;
      
    case 'weekly':
      // Default to Monday if no day specified
      return dayOfWeek === (rule.daysOfWeek?.[0] ?? 1);
      
    case 'biweekly':
      // Check if it's the correct day and week
      if (!rule.daysOfWeek?.includes(dayOfWeek)) return false;
      // Simple biweekly check based on week number
      const weekNumber = Math.floor(date.getTime() / (7 * 24 * 60 * 60 * 1000));
      return weekNumber % 2 === 0;
      
    case 'monthly':
      if (rule.dayOfMonth) {
        return dayOfMonth === rule.dayOfMonth;
      }
      if (rule.weekOfMonth && rule.daysOfWeek?.length) {
        // e.g., "first Monday of month"
        const targetDay = rule.daysOfWeek[0];
        const weekOfMonth = Math.ceil(dayOfMonth / 7);
        return dayOfWeek === targetDay && weekOfMonth === rule.weekOfMonth;
      }
      return false;
      
    case 'quarterly':
      if (![1, 4, 7, 10].includes(month)) return false;
      return rule.dayOfMonth ? dayOfMonth === rule.dayOfMonth : dayOfMonth === 1;
      
    case 'annual':
      if (rule.monthOfYear && month !== rule.monthOfYear) return false;
      return rule.dayOfMonth ? dayOfMonth === rule.dayOfMonth : dayOfMonth === 1;
      
    case 'one_time':
      // One-time should only match the start date
      if (rule.startsOn) {
        return isSameDay(date, parseISO(rule.startsOn));
      }
      return false;
      
    default:
      return false;
  }
}

/**
 * Get the next candidate date to check based on pattern type
 */
function getNextCandidateDate(date: Date, rule: RecurrenceRule): Date {
  switch (rule.patternType) {
    case 'daily':
    case 'specific_days':
      return addDays(date, 1);
      
    case 'weekly':
      return addWeeks(date, 1);
      
    case 'biweekly':
      return addDays(date, 1); // Check each day, the pattern will filter
      
    case 'monthly':
    case 'quarterly':
      return addMonths(date, rule.patternType === 'quarterly' ? 3 : 1);
      
    case 'annual':
      return addYears(date, 1);
      
    case 'one_time':
      return addDays(date, 1); // Move forward to exit loop
      
    default:
      return addDays(date, 1);
  }
}

/**
 * Generate task instances for a date range based on recurrence rules
 */
export function generateTaskInstances(
  task: { id: string; name: string; estimatedDurationMin: number; assigneeIds: string[] },
  rule: RecurrenceRule,
  fromDate: Date,
  toDate: Date,
  existingInstances: TaskInstance[] = []
): GenerationResult {
  const result: GenerationResult = {
    generatedCount: 0,
    instances: [],
    skippedDates: [],
    errors: [],
  };
  
  if (!rule.isActive) {
    result.errors.push('Recurrence rule is not active');
    return result;
  }
  
  try {
    // Calculate all occurrences in the date range
    const occurrences = calculateNextOccurrences(rule, fromDate, 100)
      .filter(date => !isAfter(date, toDate));
    
    occurrences.forEach(occurrenceDate => {
      const dateStr = format(occurrenceDate, 'yyyy-MM-dd');
      
      // Check if instance already exists for this date
      const exists = existingInstances.some(
        inst => inst.taskId === task.id && inst.scheduledDate === dateStr
      );
      
      if (exists) {
        result.skippedDates.push(dateStr);
        return;
      }
      
      // Create new instance
      const newInstance: TaskInstance = {
        id: `inst-${task.id}-${dateStr}-${Date.now()}`,
        taskId: task.id,
        taskName: task.name,
        scheduledDate: dateStr,
        dueTime: rule.defaultDueTime,
        status: 'pending',
        assigneeIds: task.assigneeIds,
        isFromTemplate: true,
        recurrenceRuleId: rule.id,
        estimatedDurationMin: task.estimatedDurationMin,
        createdAt: new Date().toISOString(),
      };
      
      result.instances.push(newInstance);
      result.generatedCount++;
    });
    
  } catch (error) {
    result.errors.push(error instanceof Error ? error.message : 'Unknown error');
  }
  
  return result;
}

/**
 * Validate a recurrence rule
 */
export function validateRecurrenceRule(rule: Partial<RecurrenceRule>): string[] {
  const errors: string[] = [];
  
  if (!rule.patternType) {
    errors.push('Pattern type is required');
  }
  
  if (rule.patternType === 'specific_days' && (!rule.daysOfWeek || rule.daysOfWeek.length === 0)) {
    errors.push('At least one day of week must be selected for specific days pattern');
  }
  
  if (rule.patternType === 'monthly' && !rule.dayOfMonth && !rule.weekOfMonth) {
    errors.push('Day of month or week of month must be specified for monthly pattern');
  }
  
  if (rule.startsOn && rule.endsOn) {
    const start = parseISO(rule.startsOn);
    const end = parseISO(rule.endsOn);
    if (isAfter(start, end)) {
      errors.push('End date must be after start date');
    }
  }
  
  return errors;
}

/**
 * Get a human-readable description of the recurrence pattern
 */
export function getRecurrenceDescription(rule: RecurrenceRule): string {
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  
  switch (rule.patternType) {
    case 'daily':
      return 'Todos los días';
      
    case 'specific_days':
      const days = rule.daysOfWeek?.map(d => dayNames[d]).join(', ') || '';
      return `Cada ${days}`;
      
    case 'weekly':
      const weekDay = rule.daysOfWeek?.[0] ?? 1;
      return `Cada semana el ${dayNames[weekDay]}`;
      
    case 'biweekly':
      const biweekDay = rule.daysOfWeek?.[0] ?? 1;
      return `Cada 2 semanas el ${dayNames[biweekDay]}`;
      
    case 'monthly':
      if (rule.dayOfMonth) {
        return `El día ${rule.dayOfMonth} de cada mes`;
      }
      if (rule.weekOfMonth && rule.daysOfWeek?.length) {
        const ordinals = ['primer', 'segundo', 'tercer', 'cuarto'];
        return `El ${ordinals[rule.weekOfMonth - 1]} ${dayNames[rule.daysOfWeek[0]]} de cada mes`;
      }
      return 'Mensualmente';
      
    case 'quarterly':
      return `Cada trimestre${rule.dayOfMonth ? ` el día ${rule.dayOfMonth}` : ''}`;
      
    case 'annual':
      const month = rule.monthOfYear ? monthNames[rule.monthOfYear - 1] : '';
      return `Anualmente${month ? ` en ${month}` : ''}${rule.dayOfMonth ? ` el día ${rule.dayOfMonth}` : ''}`;
      
    case 'one_time':
      return rule.startsOn ? `Una vez el ${format(parseISO(rule.startsOn), 'd MMM yyyy')}` : 'Una vez';
      
    default:
      return 'Sin recurrencia';
  }
}
