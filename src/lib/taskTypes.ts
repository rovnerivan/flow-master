// Shared task types for the operational management system

export type TaskFrequency = 'daily' | 'weekly' | 'monthly' | 'annual' | 'occasional';
export type TaskStatus = 'pending' | 'in_progress' | 'pending_review' | 'completed' | 'rejected';
export type AssignmentType = 'individual' | 'shared';
export type ViewMode = 'list' | 'calendar' | 'kanban';

export interface ReviewHistoryEntry {
  type: 'correction' | 'rejection' | 'approval';
  reviewerUserId: string;
  reviewerName: string;
  notes: string;
  timestamp: string;
  wasResolved?: boolean;
}

export interface TaskAssignment {
  userId: string;
  userName: string;
  instanceLabel?: string;
  status: TaskStatus;
  timeSpentMinutes?: number;
  correctionCount?: number;
  lastReviewNotes?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface LinkedProcess {
  id: string;
  name: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  frequency: TaskFrequency;
  assignmentType: AssignmentType;
  assignments: TaskAssignment[];
  linkedProcesses?: LinkedProcess[];
  estimatedTime: number;
  dueDate?: string;
  dueTime?: string;
  needsReview?: boolean;
  reviewHistory?: ReviewHistoryEntry[];
  completedByUserId?: string;
  completedByUserName?: string;
  completedAt?: string;
  createdAt?: string;
  // Hierarchy info
  verticalId?: string;
  managementId?: string;
  departmentId?: string;
  // Recurrence
  recurrencePattern?: RecurrencePattern;
  nextOccurrence?: string;
  lastCompleted?: string;
}

export interface RecurrencePattern {
  type: TaskFrequency;
  interval?: number; // Every X days/weeks/months
  daysOfWeek?: number[]; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  monthOfYear?: number; // 1-12 for annual
  time?: string; // HH:mm format
}

export interface TaskMetrics {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  pendingReviewTasks: number;
  rejectedTasks: number;
  completionRate: number;
  averageTimeSpent: number;
  errorsResolved: number;
  errorsUnresolved: number;
  onTimeCompletion: number;
  overdueCount: number;
}

export interface EmployeeMetrics extends TaskMetrics {
  userId: string;
  userName: string;
  lessonsLearned: number;
}

export interface TeamMetrics extends TaskMetrics {
  teamId?: string;
  byFrequency: Record<TaskFrequency, { total: number; completed: number }>;
  byEmployee: EmployeeMetrics[];
  topPerformers: { userId: string; userName: string; completionRate: number }[];
  needsAttention: { userId: string; userName: string; pendingReviewCount: number }[];
}

// Labels and colors
export const frequencyLabels: Record<TaskFrequency, { label: string; color: string; shortLabel: string }> = {
  daily: { label: 'Diaria', color: 'bg-primary/20 text-primary', shortLabel: 'D' },
  weekly: { label: 'Semanal', color: 'bg-warning/20 text-warning', shortLabel: 'S' },
  monthly: { label: 'Mensual', color: 'bg-success/20 text-success', shortLabel: 'M' },
  annual: { label: 'Anual', color: 'bg-purple-500/20 text-purple-500', shortLabel: 'A' },
  occasional: { label: 'Ocasional', color: 'bg-muted text-muted-foreground', shortLabel: 'O' },
};

export const statusLabels: Record<TaskStatus, { label: string; color: string }> = {
  pending: { label: 'Pendiente', color: 'bg-secondary text-muted-foreground' },
  in_progress: { label: 'En progreso', color: 'bg-primary/20 text-primary' },
  pending_review: { label: 'En revisión', color: 'bg-warning/20 text-warning' },
  completed: { label: 'Completada', color: 'bg-success/20 text-success' },
  rejected: { label: 'Rechazada', color: 'bg-destructive/20 text-destructive' },
};

// Utility functions
export const formatTime = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

export const getOverallStatus = (assignments: TaskAssignment[]): TaskStatus => {
  if (assignments.every(a => a.status === 'completed')) return 'completed';
  if (assignments.some(a => a.status === 'rejected')) return 'rejected';
  if (assignments.some(a => a.status === 'pending_review')) return 'pending_review';
  if (assignments.some(a => a.status === 'in_progress')) return 'in_progress';
  return 'pending';
};

export const getTotalTimeSpent = (assignments: TaskAssignment[]): number => {
  return assignments.reduce((sum, a) => sum + (a.timeSpentMinutes || 0), 0);
};

export const isOverdue = (task: Task): boolean => {
  if (!task.dueDate) return false;
  const now = new Date();
  const due = new Date(task.dueDate);
  if (task.dueTime) {
    const [hours, minutes] = task.dueTime.split(':').map(Number);
    due.setHours(hours, minutes);
  }
  return now > due && getOverallStatus(task.assignments) !== 'completed';
};

export const calculateMetrics = (tasks: Task[]): TaskMetrics => {
  const completed = tasks.filter(t => getOverallStatus(t.assignments) === 'completed');
  const pending = tasks.filter(t => getOverallStatus(t.assignments) === 'pending');
  const inProgress = tasks.filter(t => getOverallStatus(t.assignments) === 'in_progress');
  const pendingReview = tasks.filter(t => getOverallStatus(t.assignments) === 'pending_review');
  const rejected = tasks.filter(t => getOverallStatus(t.assignments) === 'rejected');
  
  const errorsResolved = tasks.filter(t => 
    t.reviewHistory?.some(r => r.type === 'approval' && r.wasResolved)
  ).length;
  
  const errorsUnresolved = tasks.filter(t => 
    getOverallStatus(t.assignments) === 'rejected'
  ).length;
  
  const overdue = tasks.filter(isOverdue);
  
  const totalTime = tasks.reduce((sum, t) => sum + getTotalTimeSpent(t.assignments), 0);
  
  return {
    totalTasks: tasks.length,
    completedTasks: completed.length,
    pendingTasks: pending.length,
    inProgressTasks: inProgress.length,
    pendingReviewTasks: pendingReview.length,
    rejectedTasks: rejected.length,
    completionRate: tasks.length > 0 ? (completed.length / tasks.length) * 100 : 0,
    averageTimeSpent: completed.length > 0 ? totalTime / completed.length : 0,
    errorsResolved,
    errorsUnresolved,
    onTimeCompletion: completed.length > 0 
      ? ((completed.length - overdue.filter(t => getOverallStatus(t.assignments) === 'completed').length) / completed.length) * 100 
      : 0,
    overdueCount: overdue.length,
  };
};

// Date helpers for calendar view
export const getWeekDays = (date: Date): Date[] => {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    return day;
  });
};

export const getMonthDays = (date: Date): (Date | null)[][] => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPadding = firstDay.getDay();
  
  const weeks: (Date | null)[][] = [];
  let currentWeek: (Date | null)[] = [];
  
  // Add padding for days before first of month
  for (let i = 0; i < startPadding; i++) {
    currentWeek.push(null);
  }
  
  // Add all days of month
  for (let day = 1; day <= lastDay.getDate(); day++) {
    currentWeek.push(new Date(year, month, day));
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  
  // Fill remaining week with nulls
  while (currentWeek.length < 7 && currentWeek.length > 0) {
    currentWeek.push(null);
  }
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }
  
  return weeks;
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();
};

export const formatDateShort = (date: Date): string => {
  return date.toLocaleDateString('es', { day: 'numeric', month: 'short' });
};
