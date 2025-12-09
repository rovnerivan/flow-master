import React, { useState } from 'react';
import { 
  CheckCircle2, Clock, AlertCircle, Play, Pause, FileText, 
  MessageSquare, TrendingUp, TrendingDown, Filter, ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface TaskItem {
  id: string;
  title: string;
  status: 'completed' | 'in_progress' | 'pending' | 'pending_review' | 'corrected';
  scheduledTime: string;
  completedTime?: string;
  estimatedMinutes: number;
  actualMinutes?: number;
  linkedProcess?: { id: string; name: string };
  corrections?: number;
  reviewNote?: string;
  reviewer?: string;
}

interface EmployeeTasksTimelineProps {
  employeeName: string;
  date: Date;
  tasks: TaskItem[];
  totalCompleted: number;
  totalTasks: number;
  totalTimeSpent: number;
  totalEstimated: number;
}

const statusConfig = {
  completed: { 
    icon: CheckCircle2, 
    color: 'text-success', 
    bg: 'bg-success/10',
    label: 'Completada' 
  },
  in_progress: { 
    icon: Play, 
    color: 'text-primary', 
    bg: 'bg-primary/10',
    label: 'En progreso' 
  },
  pending: { 
    icon: Clock, 
    color: 'text-muted-foreground', 
    bg: 'bg-muted/30',
    label: 'Pendiente' 
  },
  pending_review: { 
    icon: Pause, 
    color: 'text-warning', 
    bg: 'bg-warning/10',
    label: 'En revisión' 
  },
  corrected: { 
    icon: AlertCircle, 
    color: 'text-warning', 
    bg: 'bg-warning/10',
    label: 'Corregida' 
  },
};

const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}min`;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
};

const EmployeeTasksTimeline: React.FC<EmployeeTasksTimelineProps> = ({
  employeeName,
  date,
  tasks,
  totalCompleted,
  totalTasks,
  totalTimeSpent,
  totalEstimated,
}) => {
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'issues'>('all');
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'completed') return task.status === 'completed';
    if (filter === 'pending') return ['pending', 'in_progress'].includes(task.status);
    if (filter === 'issues') return ['pending_review', 'corrected'].includes(task.status) || (task.corrections && task.corrections > 0);
    return true;
  });

  const timeDiff = totalTimeSpent - totalEstimated;
  const timeStatus = timeDiff <= 0 ? 'on-time' : 'over-time';
  const completionRate = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  const formatDate = (d: Date) => {
    return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  return (
    <div className="space-y-4">
      {/* Summary Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h3 className="font-semibold text-foreground capitalize">{formatDate(date)}</h3>
          <p className="text-sm text-muted-foreground">
            {totalCompleted}/{totalTasks} completadas • {formatTime(totalTimeSpent)} trabajadas
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Time Status Badge */}
          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium",
            timeStatus === 'on-time' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
          )}>
            {timeStatus === 'on-time' ? (
              <>
                <TrendingDown className="w-3 h-3" />
                <span>{formatTime(Math.abs(timeDiff))} bajo estimado</span>
              </>
            ) : (
              <>
                <TrendingUp className="w-3 h-3" />
                <span>+{formatTime(timeDiff)} sobre estimado</span>
              </>
            )}
          </div>
          
          {/* Completion Rate */}
          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium",
            completionRate >= 80 ? 'bg-success/10 text-success' :
            completionRate >= 50 ? 'bg-warning/10 text-warning' :
            'bg-destructive/10 text-destructive'
          )}>
            <CheckCircle2 className="w-3 h-3" />
            <span>{completionRate}%</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {[
          { key: 'all', label: 'Todas' },
          { key: 'completed', label: 'Completadas' },
          { key: 'pending', label: 'Pendientes' },
          { key: 'issues', label: 'Con observaciones' },
        ].map(({ key, label }) => (
          <Button
            key={key}
            variant={filter === key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(key as typeof filter)}
            className="text-xs whitespace-nowrap"
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="space-y-2">
        {filteredTasks.map((task) => {
          const config = statusConfig[task.status];
          const StatusIcon = config.icon;
          const isExpanded = expandedTask === task.id;
          const hasTimeIssue = task.actualMinutes && task.actualMinutes > task.estimatedMinutes * 1.2;

          return (
            <div 
              key={task.id}
              className={cn(
                "rounded-xl border transition-all overflow-hidden",
                "bg-card border-border hover:border-primary/30",
                isExpanded && "ring-1 ring-primary/20"
              )}
            >
              <div 
                className="flex items-center gap-3 p-3 cursor-pointer"
                onClick={() => setExpandedTask(isExpanded ? null : task.id)}
              >
                {/* Status Icon */}
                <div className={cn("p-2 rounded-lg", config.bg)}>
                  <StatusIcon className={cn("w-4 h-4", config.color)} />
                </div>

                {/* Task Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-foreground truncate">{task.title}</h4>
                    {task.corrections && task.corrections > 0 && (
                      <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-warning/10 text-warning">
                        {task.corrections} corrección{task.corrections > 1 ? 'es' : ''}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <span>{task.scheduledTime}</span>
                    {task.completedTime && (
                      <>
                        <span>→</span>
                        <span>{task.completedTime}</span>
                      </>
                    )}
                    {task.linkedProcess && (
                      <>
                        <span>•</span>
                        <span className="text-primary">{task.linkedProcess.name}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Time Info */}
                <div className="text-right hidden sm:block">
                  <div className={cn(
                    "text-sm font-medium",
                    hasTimeIssue ? 'text-warning' : 'text-foreground'
                  )}>
                    {task.actualMinutes ? formatTime(task.actualMinutes) : '-'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    est: {formatTime(task.estimatedMinutes)}
                  </div>
                </div>

                {/* Expand indicator */}
                <ChevronDown className={cn(
                  "w-4 h-4 text-muted-foreground transition-transform",
                  isExpanded && "rotate-180"
                )} />
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-3 pb-3 pt-0 space-y-3 border-t border-border/50 mt-0">
                  <div className="pt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Estado</p>
                      <p className={cn("font-medium", config.color)}>{config.label}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Tiempo real</p>
                      <p className="font-medium text-foreground">
                        {task.actualMinutes ? formatTime(task.actualMinutes) : 'Sin registrar'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Estimado</p>
                      <p className="font-medium text-foreground">{formatTime(task.estimatedMinutes)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Diferencia</p>
                      <p className={cn(
                        "font-medium",
                        !task.actualMinutes ? 'text-muted-foreground' :
                        task.actualMinutes <= task.estimatedMinutes ? 'text-success' : 'text-warning'
                      )}>
                        {task.actualMinutes ? (
                          task.actualMinutes <= task.estimatedMinutes
                            ? `−${formatTime(task.estimatedMinutes - task.actualMinutes)}`
                            : `+${formatTime(task.actualMinutes - task.estimatedMinutes)}`
                        ) : '-'}
                      </p>
                    </div>
                  </div>

                  {task.linkedProcess && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/20">
                      <FileText className="w-4 h-4 text-primary" />
                      <span className="text-sm text-foreground">Proceso: </span>
                      <span className="text-sm text-primary font-medium">{task.linkedProcess.name}</span>
                    </div>
                  )}

                  {task.reviewNote && (
                    <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-warning/5 border border-warning/20">
                      <MessageSquare className="w-4 h-4 text-warning mt-0.5" />
                      <div>
                        <p className="text-sm text-foreground">{task.reviewNote}</p>
                        {task.reviewer && (
                          <p className="text-xs text-muted-foreground mt-1">— {task.reviewer}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No hay tareas que coincidan con el filtro</p>
        </div>
      )}
    </div>
  );
};

export default EmployeeTasksTimeline;
