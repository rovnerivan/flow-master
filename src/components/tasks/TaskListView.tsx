import React, { useState } from 'react';
import { 
  Clock, 
  User, 
  Users, 
  Link2, 
  ChevronDown, 
  ChevronRight,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  Eye,
  MessageSquare,
  Play,
  Pause,
  ThumbsUp,
  Pencil,
  Ban,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Task, 
  TaskAssignment,
  frequencyLabels, 
  statusLabels, 
  getOverallStatus,
  getTotalTimeSpent,
  formatTime,
  isOverdue,
} from '@/lib/taskTypes';

interface TaskListViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onStatusChange?: (taskId: string, newStatus: string, userId?: string) => void;
  onReviewAction?: (taskId: string, action: 'approve' | 'correct' | 'reject') => void;
  onTimeAction?: (task: Task) => void;
  onCompleteAction?: (task: Task) => void;
  isAdminView?: boolean;
}

const TaskCard: React.FC<{
  task: Task;
  onClick: () => void;
  onStatusChange?: (newStatus: string, userId?: string) => void;
  onReviewAction?: (action: 'approve' | 'correct' | 'reject') => void;
  onTimeAction?: () => void;
  onCompleteAction?: () => void;
  isAdminView?: boolean;
}> = ({ 
  task, 
  onClick, 
  onStatusChange, 
  onReviewAction,
  onTimeAction,
  onCompleteAction,
  isAdminView = false,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [showProcesses, setShowProcesses] = useState(false);
  
  const overallStatus = getOverallStatus(task.assignments);
  const statusInfo = statusLabels[overallStatus];
  const freqInfo = frequencyLabels[task.frequency];
  const overdue = isOverdue(task);
  const totalTime = getTotalTimeSpent(task.assignments);
  const hasCorrections = task.assignments.some(a => (a.correctionCount || 0) > 0);
  
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };
  
  return (
    <div className={cn(
      "bg-card border border-border rounded-xl overflow-hidden transition-all",
      overdue && "border-destructive/50",
      overallStatus === 'rejected' && "border-destructive/30 bg-destructive/5"
    )}>
      {/* Main row */}
      <div 
        className="p-4 cursor-pointer hover:bg-secondary/30 transition-colors"
        onClick={onClick}
      >
        <div className="flex items-start gap-3">
          {/* Expand button */}
          <button
            onClick={handleToggle}
            className="p-1 hover:bg-secondary rounded mt-0.5"
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className="font-medium text-foreground line-clamp-1">
                  {task.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                  {task.description}
                </p>
              </div>
              
              {/* Badges */}
              <div className="flex items-center gap-2 shrink-0">
                <span className={cn("text-xs px-2 py-0.5 rounded", freqInfo.color)}>
                  {freqInfo.label}
                </span>
                <span className={cn("text-xs px-2 py-0.5 rounded", statusInfo.color)}>
                  {statusInfo.label}
                </span>
              </div>
            </div>
            
            {/* Alert badges */}
            <div className="flex flex-wrap gap-2 mt-2">
              {overdue && (
                <span className="text-xs bg-destructive/20 text-destructive px-2 py-0.5 rounded flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Vencida
                </span>
              )}
              {hasCorrections && (
                <span className="text-xs bg-warning/20 text-warning px-2 py-0.5 rounded flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {task.assignments.reduce((sum, a) => sum + (a.correctionCount || 0), 0)} correcciones
                </span>
              )}
              {task.needsReview && overallStatus !== 'completed' && (
                <span className="text-xs bg-purple-500/20 text-purple-500 px-2 py-0.5 rounded">
                  Requiere revisión
                </span>
              )}
            </div>
            
            {/* Meta info */}
            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              {task.assignmentType === 'shared' ? (
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {task.assignments.length} personas
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {task.assignments.map(a => a.userName).join(', ')}
                </span>
              )}
              
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Est: {formatTime(task.estimatedTime)}
                {totalTime > 0 && ` / Real: ${formatTime(totalTime)}`}
              </span>
              
              {task.linkedProcesses && task.linkedProcesses.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowProcesses(!showProcesses);
                  }}
                  className="flex items-center gap-1 hover:text-primary transition-colors"
                >
                  <Link2 className="h-4 w-4" />
                  {task.linkedProcesses.length} procesos
                </button>
              )}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            {/* Quick action button */}
            {overallStatus === 'pending_review' && isAdminView && (
              <Button
                size="sm"
                variant="outline"
                className="text-success border-success/50 hover:bg-success/10"
                onClick={() => onReviewAction?.('approve')}
              >
                <ThumbsUp className="h-4 w-4 mr-1" />
                Aprobar
              </Button>
            )}
            
            {overallStatus === 'in_progress' && !isAdminView && (
              <Button
                size="sm"
                variant="outline"
                onClick={onCompleteAction}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Completar
              </Button>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isAdminView ? (
                  <>
                    {overallStatus === 'pending_review' && (
                      <>
                        <DropdownMenuItem onClick={() => onReviewAction?.('approve')}>
                          <ThumbsUp className="h-4 w-4 mr-2 text-success" />
                          Aprobar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onReviewAction?.('correct')}>
                          <Pencil className="h-4 w-4 mr-2 text-warning" />
                          Enviar a corregir
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onReviewAction?.('reject')}>
                          <Ban className="h-4 w-4 mr-2 text-destructive" />
                          Rechazar (no salvable)
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem onClick={onTimeAction}>
                      <Clock className="h-4 w-4 mr-2" />
                      Registrar tiempo
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onStatusChange?.('pending')}>
                      <Play className="h-4 w-4 mr-2" />
                      Marcar pendiente
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onStatusChange?.('in_progress')}>
                      <Clock className="h-4 w-4 mr-2" />
                      Marcar en progreso
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onCompleteAction}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Marcar completada
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    {overallStatus === 'pending' && (
                      <DropdownMenuItem onClick={() => onStatusChange?.('in_progress')}>
                        <Play className="h-4 w-4 mr-2" />
                        Iniciar tarea
                      </DropdownMenuItem>
                    )}
                    {overallStatus === 'in_progress' && (
                      <>
                        <DropdownMenuItem onClick={onTimeAction}>
                          <Clock className="h-4 w-4 mr-2" />
                          Registrar tiempo
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onCompleteAction}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {task.needsReview ? 'Enviar a revisión' : 'Completar'}
                        </DropdownMenuItem>
                      </>
                    )}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      
      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-border p-4 bg-secondary/20">
          {/* Linked processes */}
          {showProcesses && task.linkedProcesses && task.linkedProcesses.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Procesos asociados</h4>
              <div className="flex flex-wrap gap-2">
                {task.linkedProcesses.map(process => (
                  <span 
                    key={process.id}
                    className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full cursor-pointer hover:bg-primary/20"
                  >
                    {process.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Assignments detail */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              {task.assignmentType === 'shared' ? 'Equipo asignado' : 'Asignaciones'}
            </h4>
            <div className="space-y-2">
              {task.assignments.map((assignment, index) => {
                const assignStatus = statusLabels[assignment.status];
                return (
                  <div 
                    key={`${assignment.userId}-${index}`}
                    className="flex items-center justify-between p-2 bg-card rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{assignment.userName}</span>
                      {assignment.instanceLabel && (
                        <span className="text-xs text-muted-foreground">
                          ({assignment.instanceLabel})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {assignment.timeSpentMinutes && assignment.timeSpentMinutes > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {formatTime(assignment.timeSpentMinutes)}
                        </span>
                      )}
                      <span className={cn("text-xs px-2 py-0.5 rounded", assignStatus.color)}>
                        {assignStatus.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Review notes */}
          {task.assignments.some(a => a.lastReviewNotes) && (
            <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
              <h4 className="text-sm font-medium text-warning mb-1 flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                Notas del supervisor
              </h4>
              <p className="text-sm text-muted-foreground">
                {task.assignments.find(a => a.lastReviewNotes)?.lastReviewNotes}
              </p>
            </div>
          )}
          
          {/* Review history */}
          {task.reviewHistory && task.reviewHistory.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Historial de revisiones</h4>
              <div className="space-y-2">
                {task.reviewHistory.map((entry, index) => (
                  <div 
                    key={index}
                    className={cn(
                      "p-2 rounded-lg text-sm",
                      entry.type === 'approval' ? "bg-success/10" :
                      entry.type === 'rejection' ? "bg-destructive/10" :
                      "bg-warning/10"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">
                        {entry.type === 'approval' ? '✓ Aprobada' :
                         entry.type === 'rejection' ? '✕ Rechazada' :
                         '↩ Corrección solicitada'}
                        {entry.wasResolved && ' (error resuelto)'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(entry.timestamp).toLocaleDateString('es', { 
                          day: 'numeric', 
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    {entry.notes && (
                      <p className="text-muted-foreground">{entry.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const TaskListView: React.FC<TaskListViewProps> = ({
  tasks,
  onTaskClick,
  onStatusChange,
  onReviewAction,
  onTimeAction,
  onCompleteAction,
  isAdminView = false,
}) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 bg-card border border-border rounded-xl">
        <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium text-foreground mb-2">Sin tareas</h3>
        <p className="text-muted-foreground">No hay tareas que coincidan con los filtros seleccionados</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {tasks.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          onClick={() => onTaskClick(task)}
          onStatusChange={(status, userId) => onStatusChange?.(task.id, status, userId)}
          onReviewAction={(action) => onReviewAction?.(task.id, action)}
          onTimeAction={() => onTimeAction?.(task)}
          onCompleteAction={() => onCompleteAction?.(task)}
          isAdminView={isAdminView}
        />
      ))}
    </div>
  );
};

export default TaskListView;
