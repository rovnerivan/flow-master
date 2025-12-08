import React from 'react';
import { Clock, User, Users, Link2, AlertCircle, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  Task, 
  TaskStatus,
  frequencyLabels, 
  statusLabels, 
  getOverallStatus,
  getTotalTimeSpent,
  formatTime,
  isOverdue,
} from '@/lib/taskTypes';

interface TaskKanbanViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => void;
}

const columns: { status: TaskStatus; title: string }[] = [
  { status: 'pending', title: 'Pendientes' },
  { status: 'in_progress', title: 'En Progreso' },
  { status: 'pending_review', title: 'En Revisión' },
  { status: 'completed', title: 'Completadas' },
  { status: 'rejected', title: 'Rechazadas' },
];

const KanbanCard: React.FC<{ 
  task: Task; 
  onClick: () => void;
}> = ({ task, onClick }) => {
  const freqInfo = frequencyLabels[task.frequency];
  const overdue = isOverdue(task);
  const totalTime = getTotalTimeSpent(task.assignments);
  const hasCorrections = task.assignments.some(a => (a.correctionCount || 0) > 0);
  
  return (
    <div
      className={cn(
        "bg-card border border-border rounded-lg p-3 cursor-pointer",
        "hover:border-primary/50 transition-all hover:shadow-md",
        overdue && "border-destructive/50"
      )}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-medium text-sm text-foreground line-clamp-2">
          {task.title}
        </h4>
        <span className={cn("text-xs px-1.5 py-0.5 rounded shrink-0", freqInfo.color)}>
          {freqInfo.shortLabel}
        </span>
      </div>
      
      {/* Badges */}
      <div className="flex flex-wrap gap-1 mb-2">
        {overdue && (
          <span className="text-xs bg-destructive/20 text-destructive px-1.5 py-0.5 rounded flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Vencida
          </span>
        )}
        {hasCorrections && (
          <span className="text-xs bg-warning/20 text-warning px-1.5 py-0.5 rounded flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            Correcciones
          </span>
        )}
        {task.needsReview && (
          <span className="text-xs bg-purple-500/20 text-purple-500 px-1.5 py-0.5 rounded">
            Req. revisión
          </span>
        )}
      </div>
      
      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          {task.assignmentType === 'shared' ? (
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {task.assignments.length}
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {task.assignments[0]?.userName.split(' ')[0]}
            </span>
          )}
          
          {task.linkedProcesses && task.linkedProcesses.length > 0 && (
            <span className="flex items-center gap-1">
              <Link2 className="h-3 w-3" />
              {task.linkedProcesses.length}
            </span>
          )}
        </div>
        
        {totalTime > 0 && (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatTime(totalTime)}
          </span>
        )}
      </div>
    </div>
  );
};

const TaskKanbanView: React.FC<TaskKanbanViewProps> = ({
  tasks,
  onTaskClick,
}) => {
  const getTasksByStatus = (status: TaskStatus): Task[] => {
    return tasks.filter(task => getOverallStatus(task.assignments) === status);
  };
  
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map(column => {
        const columnTasks = getTasksByStatus(column.status);
        const statusInfo = statusLabels[column.status];
        
        return (
          <div
            key={column.status}
            className="flex-shrink-0 w-72 bg-secondary/30 rounded-xl"
          >
            {/* Column header */}
            <div className="p-3 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={cn("w-2 h-2 rounded-full", statusInfo.color.replace('text-', 'bg-').replace('/20', ''))} />
                  <h3 className="font-medium text-sm">{column.title}</h3>
                </div>
                <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                  {columnTasks.length}
                </span>
              </div>
            </div>
            
            {/* Column content */}
            <div className="p-2 space-y-2 max-h-[600px] overflow-y-auto">
              {columnTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Sin tareas
                </div>
              ) : (
                columnTasks.map(task => (
                  <KanbanCard
                    key={task.id}
                    task={task}
                    onClick={() => onTaskClick(task)}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TaskKanbanView;
