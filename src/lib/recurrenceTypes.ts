// Recurrence pattern types matching the database enum
export type RecurrencePatternType = 
  | 'daily'
  | 'specific_days'
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'quarterly'
  | 'annual'
  | 'one_time';

export interface RecurrenceRule {
  id: string;
  task_id: string;
  team_id: string;
  pattern_type: RecurrencePatternType;
  days_of_week: number[]; // 1=Monday, 7=Sunday
  day_of_month: number | null;
  week_of_month: number | null;
  month_of_year: number | null;
  default_due_time: string;
  starts_on: string;
  ends_on: string | null;
  auto_generate: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const patternTypeLabels: Record<RecurrencePatternType, { label: string; description: string }> = {
  daily: { label: 'Diaria', description: 'Todos los días' },
  specific_days: { label: 'Días específicos', description: 'Días seleccionados de la semana' },
  weekly: { label: 'Semanal', description: 'Una vez por semana' },
  biweekly: { label: 'Quincenal', description: 'Cada dos semanas' },
  monthly: { label: 'Mensual', description: 'Una vez al mes' },
  quarterly: { label: 'Trimestral', description: 'Cada tres meses' },
  annual: { label: 'Anual', description: 'Una vez al año' },
  one_time: { label: 'Única', description: 'Solo una vez' },
};

export const dayOfWeekLabels: Record<number, { short: string; full: string }> = {
  1: { short: 'L', full: 'Lunes' },
  2: { short: 'M', full: 'Martes' },
  3: { short: 'X', full: 'Miércoles' },
  4: { short: 'J', full: 'Jueves' },
  5: { short: 'V', full: 'Viernes' },
  6: { short: 'S', full: 'Sábado' },
  7: { short: 'D', full: 'Domingo' },
};

// Calculate next occurrences based on recurrence rule
export function calculateNextOccurrences(
  rule: RecurrenceRule,
  count: number = 5,
  fromDate: Date = new Date()
): Date[] {
  const occurrences: Date[] = [];
  const startDate = new Date(rule.starts_on);
  const endDate = rule.ends_on ? new Date(rule.ends_on) : null;
  let currentDate = new Date(Math.max(startDate.getTime(), fromDate.getTime()));

  while (occurrences.length < count) {
    if (endDate && currentDate > endDate) break;

    const dayOfWeek = currentDate.getDay() === 0 ? 7 : currentDate.getDay(); // Convert Sunday from 0 to 7

    switch (rule.pattern_type) {
      case 'daily':
        occurrences.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
        break;

      case 'specific_days':
        if (rule.days_of_week.includes(dayOfWeek)) {
          occurrences.push(new Date(currentDate));
        }
        currentDate.setDate(currentDate.getDate() + 1);
        break;

      case 'weekly':
        // Weekly on the same day as starts_on
        const startDayOfWeek = new Date(rule.starts_on).getDay() || 7;
        if (dayOfWeek === startDayOfWeek) {
          occurrences.push(new Date(currentDate));
        }
        currentDate.setDate(currentDate.getDate() + 1);
        break;

      case 'biweekly':
        const startWeek = getWeekNumber(new Date(rule.starts_on));
        const currentWeek = getWeekNumber(currentDate);
        const weekDiff = currentWeek - startWeek;
        const startDayBiweekly = new Date(rule.starts_on).getDay() || 7;
        if (weekDiff >= 0 && weekDiff % 2 === 0 && dayOfWeek === startDayBiweekly) {
          occurrences.push(new Date(currentDate));
        }
        currentDate.setDate(currentDate.getDate() + 1);
        break;

      case 'monthly':
        if (rule.day_of_month && currentDate.getDate() === rule.day_of_month) {
          occurrences.push(new Date(currentDate));
          currentDate.setMonth(currentDate.getMonth() + 1);
          currentDate.setDate(1);
        } else {
          currentDate.setDate(currentDate.getDate() + 1);
        }
        break;

      case 'quarterly':
        const quarterMonths = [1, 4, 7, 10]; // Jan, Apr, Jul, Oct
        if (quarterMonths.includes(currentDate.getMonth() + 1) && 
            rule.day_of_month && currentDate.getDate() === rule.day_of_month) {
          occurrences.push(new Date(currentDate));
          currentDate.setMonth(currentDate.getMonth() + 3);
          currentDate.setDate(1);
        } else {
          currentDate.setDate(currentDate.getDate() + 1);
        }
        break;

      case 'annual':
        if (rule.month_of_year && 
            currentDate.getMonth() + 1 === rule.month_of_year &&
            rule.day_of_month && currentDate.getDate() === rule.day_of_month) {
          occurrences.push(new Date(currentDate));
          currentDate.setFullYear(currentDate.getFullYear() + 1);
        } else {
          currentDate.setDate(currentDate.getDate() + 1);
        }
        break;

      case 'one_time':
        if (currentDate.getTime() === startDate.getTime()) {
          occurrences.push(new Date(currentDate));
        }
        return occurrences;
    }

    // Safety limit to prevent infinite loops
    if (currentDate.getFullYear() - fromDate.getFullYear() > 5) break;
  }

  return occurrences;
}

function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

// Format time for display
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}
