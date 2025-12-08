import React from 'react';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Target,
  BarChart3,
  Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface TaskAssignment {
  userId: string;
  userName: string;
  instanceLabel?: string;
  status: 'pending' | 'in_progress' | 'pending_review' | 'completed' | 'rejected';
  timeSpentMinutes?: number;
}

interface Task {
  id: string;
  title: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'annual' | 'occasional';
  assignmentType: 'individual' | 'shared';
  assignments: TaskAssignment[];
  estimatedTime: number;
  dueDate?: string;
  verticalId?: string;
  managementId?: string;
  departmentId?: string;
}

interface TasksBirdEyeViewProps {
  tasks: Task[];
  onDrillDown?: (filter: { type: string; value: string }) => void;
}

const frequencyConfig = {
  daily: { label: 'Diarias', color: 'bg-primary/10 text-primary', borderColor: 'border-primary' },
  weekly: { label: 'Semanales', color: 'bg-warning/10 text-warning', borderColor: 'border-warning' },
  monthly: { label: 'Mensuales', color: 'bg-success/10 text-success', borderColor: 'border-success' },
  annual: { label: 'Anuales', color: 'bg-purple-500/10 text-purple-500', borderColor: 'border-purple-500' },
  occasional: { label: 'Ocasionales', color: 'bg-muted text-muted-foreground', borderColor: 'border-muted' },
};

const statusConfig = {
  pending: { label: 'Pendientes', color: 'text-muted-foreground' },
  in_progress: { label: 'En progreso', color: 'text-primary' },
  pending_review: { label: 'Por revisar', color: 'text-warning' },
  completed: { label: 'Completadas', color: 'text-success' },
  rejected: { label: 'Rechazadas', color: 'text-destructive' },
};

const getTrendIcon = (rate: number) => {
  if (rate >= 80) return <TrendingUp className="w-4 h-4 text-success" />;
  if (rate >= 50) return <Minus className="w-4 h-4 text-warning" />;
  return <TrendingDown className="w-4 h-4 text-destructive" />;
};

const FrequencyCard: React.FC<{
  frequency: keyof typeof frequencyConfig;
  tasks: Task[];
  onDrillDown?: (filter: { type: string; value: string }) => void;
}> = ({ frequency, tasks, onDrillDown }) => {
  const config = frequencyConfig[frequency];
  
  // Calculate stats
  const allAssignments = tasks.flatMap(t => t.assignments);
  const totalAssignments = allAssignments.length;
  const completedAssignments = allAssignments.filter(a => a.status === 'completed').length;
  const inProgressAssignments = allAssignments.filter(a => a.status === 'in_progress').length;
  const pendingReviewAssignments = allAssignments.filter(a => a.status === 'pending_review').length;
  const pendingAssignments = allAssignments.filter(a => a.status === 'pending').length;
  const rejectedAssignments = allAssignments.filter(a => a.status === 'rejected').length;
  
  const completionRate = totalAssignments > 0 
    ? Math.round((completedAssignments / totalAssignments) * 100) 
    : 0;

  const totalTimeSpent = allAssignments.reduce((sum, a) => sum + (a.timeSpentMinutes || 0), 0);
  const totalEstimatedTime = tasks.reduce((sum, t) => sum + (t.estimatedTime * t.assignments.length), 0);
  const timeEfficiency = totalEstimatedTime > 0 
    ? Math.round((totalTimeSpent / totalEstimatedTime) * 100) 
    : 0;

  // Get unique assignees
  const uniqueAssignees = new Set(allAssignments.map(a => a.userId)).size;

  if (tasks.length === 0) return null;

  return (
    <div 
      className={cn(
        "kpi-card border-l-4 hover:shadow-lg transition-all cursor-pointer",
        config.borderColor
      )}
      onClick={() => onDrillDown?.({ type: 'frequency', value: frequency })}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn("p-2.5 rounded-xl", config.color)}>
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-lg">{config.label}</h3>
            <p className="text-sm text-muted-foreground">{tasks.length} tareas</p>
          </div>
        </div>
        {getTrendIcon(completionRate)}
      </div>

      {/* Main Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">Tasa de completado</span>
          <span className="font-semibold text-foreground">{completionRate}%</span>
        </div>
        <Progress value={completionRate} className="h-3" />
      </div>

      {/* Status Distribution */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-success/10">
          <CheckCircle className="w-4 h-4 text-success" />
          <div>
            <p className="text-lg font-bold text-success">{completedAssignments}</p>
            <p className="text-xs text-muted-foreground">Completadas</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/10">
          <Clock className="w-4 h-4 text-primary" />
          <div>
            <p className="text-lg font-bold text-primary">{inProgressAssignments}</p>
            <p className="text-xs text-muted-foreground">En progreso</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-lg bg-warning/10">
          <AlertCircle className="w-4 h-4 text-warning" />
          <div>
            <p className="text-lg font-bold text-warning">{pendingReviewAssignments}</p>
            <p className="text-xs text-muted-foreground">Por revisar</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary">
          <Layers className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="text-lg font-bold text-foreground">{pendingAssignments}</p>
            <p className="text-xs text-muted-foreground">Pendientes</p>
          </div>
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="flex items-center justify-between text-sm border-t border-border pt-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">{uniqueAssignees} personas</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            {Math.round(totalTimeSpent / 60)}h invertidas
          </span>
        </div>
        {rejectedAssignments > 0 && (
          <div className="flex items-center gap-1 text-destructive">
            <AlertCircle className="w-4 h-4" />
            <span>{rejectedAssignments} errores</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const TasksBirdEyeView: React.FC<TasksBirdEyeViewProps> = ({ tasks, onDrillDown }) => {
  // Group tasks by frequency
  const tasksByFrequency = {
    daily: tasks.filter(t => t.frequency === 'daily'),
    weekly: tasks.filter(t => t.frequency === 'weekly'),
    monthly: tasks.filter(t => t.frequency === 'monthly'),
    annual: tasks.filter(t => t.frequency === 'annual'),
    occasional: tasks.filter(t => t.frequency === 'occasional'),
  };

  // Global stats
  const allAssignments = tasks.flatMap(t => t.assignments);
  const totalAssignments = allAssignments.length;
  const completedCount = allAssignments.filter(a => a.status === 'completed').length;
  const inProgressCount = allAssignments.filter(a => a.status === 'in_progress').length;
  const pendingReviewCount = allAssignments.filter(a => a.status === 'pending_review').length;
  const pendingCount = allAssignments.filter(a => a.status === 'pending').length;
  const rejectedCount = allAssignments.filter(a => a.status === 'rejected').length;
  
  const globalCompletionRate = totalAssignments > 0 
    ? Math.round((completedCount / totalAssignments) * 100) 
    : 0;

  const uniqueAssignees = new Set(allAssignments.map(a => a.userId)).size;
  const totalTimeSpent = allAssignments.reduce((sum, a) => sum + (a.timeSpentMinutes || 0), 0);

  // Find bottlenecks (tasks with most pending or rejected)
  const bottlenecks = tasks
    .map(t => ({
      task: t,
      pendingRate: t.assignments.filter(a => a.status === 'pending' || a.status === 'rejected').length / t.assignments.length
    }))
    .filter(b => b.pendingRate > 0.5)
    .sort((a, b) => b.pendingRate - a.pendingRate)
    .slice(0, 3);

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="p-4 rounded-full bg-primary/10 mb-4">
          <BarChart3 className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Sin tareas para mostrar
        </h3>
        <p className="text-muted-foreground max-w-md">
          No hay tareas que coincidan con los filtros seleccionados.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Global Summary */}
      <div className="kpi-card bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{globalCompletionRate}%</p>
                <p className="text-sm text-muted-foreground">Completado global</p>
              </div>
            </div>
            <div className="h-12 w-px bg-border hidden lg:block" />
            <div className="grid grid-cols-2 lg:flex lg:gap-6 gap-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-success" />
                <div>
                  <span className="font-semibold text-foreground">{completedCount}</span>
                  <span className="text-muted-foreground ml-1 text-sm">completadas</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <div>
                  <span className="font-semibold text-foreground">{inProgressCount}</span>
                  <span className="text-muted-foreground ml-1 text-sm">en progreso</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-warning" />
                <div>
                  <span className="font-semibold text-foreground">{pendingReviewCount}</span>
                  <span className="text-muted-foreground ml-1 text-sm">por revisar</span>
                </div>
              </div>
              {rejectedCount > 0 && (
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  <div>
                    <span className="font-semibold text-destructive">{rejectedCount}</span>
                    <span className="text-muted-foreground ml-1 text-sm">errores</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span>{tasks.length} tareas</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{uniqueAssignees} personas</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{Math.round(totalTimeSpent / 60)}h invertidas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Frequency Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {(Object.keys(tasksByFrequency) as Array<keyof typeof tasksByFrequency>).map(frequency => (
          <FrequencyCard
            key={frequency}
            frequency={frequency}
            tasks={tasksByFrequency[frequency]}
            onDrillDown={onDrillDown}
          />
        ))}
      </div>

      {/* Bottlenecks Alert */}
      {bottlenecks.length > 0 && (
        <div className="kpi-card border-warning/50 bg-warning/5">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-warning" />
            <h3 className="font-semibold text-foreground">Atención requerida</h3>
          </div>
          <div className="space-y-2">
            {bottlenecks.map(({ task, pendingRate }) => (
              <div 
                key={task.id}
                className="flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-background transition-colors cursor-pointer"
                onClick={() => onDrillDown?.({ type: 'task', value: task.id })}
              >
                <div>
                  <p className="font-medium text-foreground">{task.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {frequencyConfig[task.frequency].label} • {task.assignments.length} asignaciones
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-warning">{Math.round(pendingRate * 100)}%</p>
                  <p className="text-xs text-muted-foreground">sin completar</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksBirdEyeView;