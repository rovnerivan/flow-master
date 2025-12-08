import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  AlertTriangle,
  Lock,
  GripVertical,
  CheckCircle2,
  Target,
  Undo2,
  ArrowLeftRight,
  Maximize2,
  X
} from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek, isSameDay, isAfter, isBefore, addWeeks, subWeeks } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Types
interface PendingTask {
  id: string;
  name: string;
  estimatedMinutes: number;
  deadline: Date | null;
  frequency: 'weekly' | 'monthly' | 'annual' | 'occasional';
  isFixed: boolean;
  linkedProcessId?: string;
  description?: string;
}

interface ScheduledTask {
  id: string;
  assignmentId: string;
  name: string;
  scheduledDate: Date;
  estimatedMinutes: number;
  deadline: Date | null;
  frequency: 'daily' | 'weekly' | 'monthly' | 'annual' | 'occasional';
  isFixed: boolean;
  status: 'pending' | 'in_progress' | 'completed';
  scheduledBy: 'employee' | 'supervisor';
  originalPendingId?: string;
  description?: string;
}

// Mock data
const mockPendingTasks: PendingTask[] = [
  { id: '1', name: 'Inventario mensual', estimatedMinutes: 120, deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), frequency: 'monthly', isFixed: false, description: 'Realizar conteo completo de productos en almacén y exhibición' },
  { id: '2', name: 'Reporte de ventas', estimatedMinutes: 45, deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), frequency: 'weekly', isFixed: false, description: 'Compilar y analizar datos de ventas semanales' },
  { id: '3', name: 'Auditoría de caja', estimatedMinutes: 60, deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), frequency: 'monthly', isFixed: false, description: 'Verificar cuadre de caja y documentación' },
  { id: '4', name: 'Capacitación trimestral', estimatedMinutes: 180, deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), frequency: 'occasional', isFixed: false, description: 'Sesión de capacitación sobre nuevos procedimientos' },
];

const generateMockScheduledTasks = (weekStart: Date): ScheduledTask[] => {
  const tasks: ScheduledTask[] = [];
  
  for (let i = 0; i < 5; i++) {
    tasks.push({
      id: `daily-${i}`,
      assignmentId: `assign-daily-${i}`,
      name: 'Apertura',
      scheduledDate: addDays(weekStart, i),
      estimatedMinutes: 30,
      deadline: null,
      frequency: 'daily',
      isFixed: true,
      status: i < 2 ? 'completed' : 'pending',
      scheduledBy: 'supervisor',
      description: 'Preparar área de trabajo y verificar sistemas'
    });
    tasks.push({
      id: `daily-close-${i}`,
      assignmentId: `assign-close-${i}`,
      name: 'Cierre',
      scheduledDate: addDays(weekStart, i),
      estimatedMinutes: 20,
      deadline: null,
      frequency: 'daily',
      isFixed: true,
      status: i < 2 ? 'completed' : 'pending',
      scheduledBy: 'supervisor',
      description: 'Cuadre de caja y cierre de sistemas'
    });
  }
  
  tasks.push({
    id: 'weekly-1',
    assignmentId: 'assign-weekly-1',
    name: 'Rev. inventario',
    scheduledDate: addDays(weekStart, 2),
    estimatedMinutes: 60,
    deadline: addDays(weekStart, 4),
    frequency: 'weekly',
    isFixed: false,
    status: 'pending',
    scheduledBy: 'employee',
    originalPendingId: 'sample-1',
    description: 'Revisión parcial de inventario en sección asignada'
  });
  
  return tasks;
};

const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h${mins}m` : `${hours}h`;
};

const getDeadlineStatus = (deadline: Date | null): 'urgent' | 'soon' | 'normal' => {
  if (!deadline) return 'normal';
  const daysUntil = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (daysUntil <= 2) return 'urgent';
  if (daysUntil <= 5) return 'soon';
  return 'normal';
};

const frequencyColors: Record<string, string> = {
  daily: 'bg-blue-500',
  weekly: 'bg-green-500',
  monthly: 'bg-purple-500',
  annual: 'bg-amber-500',
  occasional: 'bg-gray-500',
};

type DragItem = 
  | { type: 'pending'; task: PendingTask }
  | { type: 'scheduled'; task: ScheduledTask };

interface TaskDetailModalProps {
  task: PendingTask | ScheduledTask | null;
  onClose: () => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, onClose }) => {
  if (!task) return null;
  
  const isPending = !('scheduledDate' in task);
  const deadlineStatus = getDeadlineStatus(task.deadline);
  
  return (
    <Dialog open={!!task} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-lg">{task.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {task.description && (
            <p className="text-sm text-muted-foreground">{task.description}</p>
          )}
          
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">Duración</p>
              <p className="text-sm font-medium">{formatDuration(task.estimatedMinutes)}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">Frecuencia</p>
              <p className="text-sm font-medium capitalize">{task.frequency}</p>
            </div>
          </div>
          
          {task.deadline && (
            <div className={cn(
              "p-3 rounded-lg",
              deadlineStatus === 'urgent' && "bg-destructive/10",
              deadlineStatus === 'soon' && "bg-amber-500/10",
              deadlineStatus === 'normal' && "bg-muted/50"
            )}>
              <p className="text-xs text-muted-foreground mb-1">Fecha límite</p>
              <p className={cn(
                "text-sm font-medium",
                deadlineStatus === 'urgent' && "text-destructive",
                deadlineStatus === 'soon' && "text-amber-600"
              )}>
                {format(task.deadline, "EEEE d 'de' MMMM", { locale: es })}
              </p>
            </div>
          )}
          
          {!isPending && 'scheduledBy' in task && (
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-xs text-muted-foreground mb-1">Programado por</p>
              <p className="text-sm font-medium">
                {task.scheduledBy === 'employee' ? 'Tú' : 'Supervisor'}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface EmployeeCalendarPlannerProps {
  className?: string;
}

export const EmployeeCalendarPlanner: React.FC<EmployeeCalendarPlannerProps> = ({ className }) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [pendingTasks, setPendingTasks] = useState<PendingTask[]>(mockPendingTasks);
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>(() => 
    generateMockScheduledTasks(startOfWeek(new Date(), { weekStartsOn: 1 }))
  );
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<'pending' | Date | null>(null);
  const [selectedTask, setSelectedTask] = useState<PendingTask | ScheduledTask | null>(null);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  
  const weekDays = useMemo(() => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(weekStart, i));
    }
    return days;
  }, [weekStart]);

  const tasksPerDay = useMemo(() => {
    const map: Record<string, ScheduledTask[]> = {};
    weekDays.forEach(day => {
      const dateKey = format(day, 'yyyy-MM-dd');
      map[dateKey] = scheduledTasks.filter(task => 
        isSameDay(task.scheduledDate, day)
      );
    });
    return map;
  }, [scheduledTasks, weekDays]);

  const dailyWorkload = useMemo(() => {
    const map: Record<string, { minutes: number; percentage: number }> = {};
    const maxHoursPerDay = 8 * 60;
    
    weekDays.forEach(day => {
      const dateKey = format(day, 'yyyy-MM-dd');
      const tasks = tasksPerDay[dateKey] || [];
      const totalMinutes = tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);
      map[dateKey] = {
        minutes: totalMinutes,
        percentage: Math.min(100, (totalMinutes / maxHoursPerDay) * 100)
      };
    });
    return map;
  }, [tasksPerDay, weekDays]);

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeek(prev => direction === 'next' ? addWeeks(prev, 1) : subWeeks(prev, 1));
  };

  const goToToday = () => {
    setCurrentWeek(new Date());
  };

  const handleDragStartPending = (task: PendingTask) => {
    setDraggedItem({ type: 'pending', task });
  };

  const handleDragStartScheduled = (task: ScheduledTask) => {
    if (task.isFixed) return;
    setDraggedItem({ type: 'scheduled', task });
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverTarget(null);
  };

  const handleDragOverDay = (e: React.DragEvent, day: Date) => {
    e.preventDefault();
    setDragOverTarget(day);
  };

  const handleDragOverPending = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverTarget('pending');
  };

  const handleDropOnDay = (e: React.DragEvent, day: Date) => {
    e.preventDefault();
    
    if (!draggedItem) return;
    
    if (isBefore(day, new Date()) && !isSameDay(day, new Date())) {
      toast({
        title: "No puedes programar en el pasado",
        variant: "destructive"
      });
      handleDragEnd();
      return;
    }

    if (draggedItem.type === 'pending') {
      const task = draggedItem.task;
      
      if (task.deadline && isAfter(day, task.deadline)) {
        toast({
          title: "Fecha límite excedida",
          variant: "destructive"
        });
        handleDragEnd();
        return;
      }

      const newScheduledTask: ScheduledTask = {
        id: `scheduled-${task.id}-${Date.now()}`,
        assignmentId: `assign-${task.id}`,
        name: task.name,
        scheduledDate: day,
        estimatedMinutes: task.estimatedMinutes,
        deadline: task.deadline,
        frequency: task.frequency,
        isFixed: false,
        status: 'pending',
        scheduledBy: 'employee',
        originalPendingId: task.id,
        description: task.description
      };

      setScheduledTasks(prev => [...prev, newScheduledTask]);
      setPendingTasks(prev => prev.filter(t => t.id !== task.id));
      
      toast({
        title: "Tarea programada",
        description: format(day, "EEEE d", { locale: es })
      });
    } else if (draggedItem.type === 'scheduled') {
      const task = draggedItem.task;
      
      if (task.isFixed) {
        handleDragEnd();
        return;
      }

      if (task.deadline && isAfter(day, task.deadline)) {
        toast({
          title: "Fecha límite excedida",
          variant: "destructive"
        });
        handleDragEnd();
        return;
      }

      setScheduledTasks(prev => prev.map(t => 
        t.id === task.id ? { ...t, scheduledDate: day, scheduledBy: 'employee' } : t
      ));

      toast({ title: "Tarea movida" });
    }

    handleDragEnd();
  };

  const handleDropOnPending = (e: React.DragEvent) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem.type !== 'scheduled') {
      handleDragEnd();
      return;
    }

    const task = draggedItem.task;

    if (task.isFixed || task.scheduledBy !== 'employee') {
      toast({
        title: "No se puede devolver",
        variant: "destructive"
      });
      handleDragEnd();
      return;
    }

    const restoredPendingTask: PendingTask = {
      id: task.originalPendingId || task.id,
      name: task.name,
      estimatedMinutes: task.estimatedMinutes,
      deadline: task.deadline,
      frequency: task.frequency as PendingTask['frequency'],
      isFixed: false,
      description: task.description
    };

    setScheduledTasks(prev => prev.filter(t => t.id !== task.id));
    setPendingTasks(prev => [...prev, restoredPendingTask]);

    toast({ title: "Tarea devuelta" });
    handleDragEnd();
  };

  const isToday = (date: Date) => isSameDay(date, new Date());
  const isPast = (date: Date) => isBefore(date, new Date()) && !isSameDay(date, new Date());

  return (
    <div className={cn("flex flex-col h-full min-h-0", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-2 md:p-3 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 md:w-5 md:h-5 text-primary" />
          <h2 className="text-sm md:text-base font-semibold">Mi Calendario</h2>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigateWeek('prev')}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-xs px-2" onClick={goToToday}>
            Hoy
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigateWeek('next')}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Week label */}
      <div className="px-2 md:px-3 py-1.5 bg-muted/30 border-b border-border shrink-0">
        <span className="text-xs text-muted-foreground">
          {format(weekStart, "d MMM", { locale: es })} - {format(weekEnd, "d MMM", { locale: es })}
        </span>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        {/* Pending tasks panel - more compact */}
        <div 
          className={cn(
            "lg:w-56 border-b lg:border-b-0 lg:border-r border-border bg-muted/20 flex flex-col shrink-0",
            "h-32 lg:h-auto"
          )}
          onDragOver={handleDragOverPending}
          onDragLeave={() => setDragOverTarget(null)}
          onDrop={handleDropOnPending}
        >
          <div className="p-2 border-b border-border shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-medium">Pendientes</span>
            </div>
            {pendingTasks.length > 0 && (
              <Badge variant="secondary" className="h-5 text-[10px] px-1.5">
                {pendingTasks.length}
              </Badge>
            )}
          </div>
          
          <ScrollArea 
            className={cn(
              "flex-1",
              dragOverTarget === 'pending' && draggedItem?.type === 'scheduled' && "bg-primary/5"
            )}
          >
            <div className="p-1.5 space-y-1">
              {draggedItem?.type === 'scheduled' && (
                <div className="p-2 rounded border border-dashed border-primary/50 bg-primary/5 text-center">
                  <Undo2 className="w-4 h-4 mx-auto text-primary" />
                  <p className="text-[10px] text-primary mt-0.5">Soltar aquí</p>
                </div>
              )}
              
              {pendingTasks.length === 0 && !draggedItem ? (
                <div className="p-3 text-center text-muted-foreground">
                  <CheckCircle2 className="w-6 h-6 mx-auto mb-1 opacity-50" />
                  <p className="text-[10px]">¡Todo listo!</p>
                </div>
              ) : (
                pendingTasks.map(task => {
                  const deadlineStatus = getDeadlineStatus(task.deadline);
                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => handleDragStartPending(task)}
                      onDragEnd={handleDragEnd}
                      className={cn(
                        "p-1.5 rounded-md bg-background border border-border cursor-grab active:cursor-grabbing group",
                        "hover:border-primary/50 transition-all",
                        draggedItem?.type === 'pending' && draggedItem.task.id === task.id && "opacity-50"
                      )}
                    >
                      <div className="flex items-center gap-1.5">
                        <GripVertical className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-medium truncate">{task.name}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Clock className="w-2.5 h-2.5 text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground">{formatDuration(task.estimatedMinutes)}</span>
                            {deadlineStatus !== 'normal' && (
                              <AlertTriangle className={cn(
                                "w-2.5 h-2.5 ml-auto",
                                deadlineStatus === 'urgent' ? "text-destructive" : "text-amber-500"
                              )} />
                            )}
                          </div>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedTask(task); }}
                          className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-muted rounded transition-opacity"
                        >
                          <Maximize2 className="w-3 h-3 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Calendar grid */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          {/* Days header + workload combined */}
          <div className="grid grid-cols-7 border-b border-border shrink-0">
            {weekDays.map(day => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const workload = dailyWorkload[dateKey];
              return (
                <div 
                  key={day.toISOString()} 
                  className={cn(
                    "p-1 md:p-1.5 border-r border-border last:border-r-0",
                    isToday(day) && "bg-primary/5",
                    isPast(day) && "opacity-50"
                  )}
                >
                  <div className="text-center">
                    <div className="text-[10px] text-muted-foreground uppercase">
                      {format(day, 'EEEEE', { locale: es })}
                    </div>
                    <div className={cn(
                      "text-sm font-semibold",
                      isToday(day) && "text-primary"
                    )}>
                      {format(day, 'd')}
                    </div>
                  </div>
                  <div className="mt-1">
                    <div className="flex items-center justify-between text-[9px] mb-0.5 px-0.5">
                      <span className="text-muted-foreground">{formatDuration(workload.minutes)}</span>
                      {workload.percentage > 90 && (
                        <AlertTriangle className="w-2.5 h-2.5 text-amber-500" />
                      )}
                    </div>
                    <Progress 
                      value={workload.percentage} 
                      className={cn(
                        "h-1",
                        workload.percentage > 100 && "[&>div]:bg-destructive",
                        workload.percentage > 80 && workload.percentage <= 100 && "[&>div]:bg-amber-500"
                      )}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tasks grid */}
          <div className="flex-1 grid grid-cols-7 overflow-hidden min-h-0">
            {weekDays.map(day => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const dayTasks = tasksPerDay[dateKey] || [];
              const isDropTarget = dragOverTarget instanceof Date && isSameDay(dragOverTarget, day);
              
              return (
                <div
                  key={`col-${day.toISOString()}`}
                  onDragOver={(e) => handleDragOverDay(e, day)}
                  onDragLeave={() => setDragOverTarget(null)}
                  onDrop={(e) => handleDropOnDay(e, day)}
                  className={cn(
                    "border-r border-border last:border-r-0 overflow-y-auto",
                    isDropTarget && !isPast(day) && "bg-primary/10",
                    isPast(day) && "bg-muted/30"
                  )}
                >
                  <div className="p-0.5 md:p-1 space-y-0.5">
                    {dayTasks.map(task => (
                      <div
                        key={task.id}
                        draggable={!task.isFixed}
                        onDragStart={() => handleDragStartScheduled(task)}
                        onDragEnd={handleDragEnd}
                        onClick={() => setSelectedTask(task)}
                        className={cn(
                          "p-1 md:p-1.5 rounded text-[9px] md:text-[10px] transition-all cursor-pointer group",
                          task.isFixed 
                            ? "bg-muted/80 border border-border/50" 
                            : "bg-primary/10 border border-primary/20 cursor-grab active:cursor-grabbing",
                          task.status === 'completed' && "opacity-50",
                          draggedItem?.type === 'scheduled' && draggedItem.task.id === task.id && "opacity-30"
                        )}
                      >
                        <div className="flex items-start gap-0.5">
                          {task.isFixed ? (
                            <Lock className="w-2.5 h-2.5 text-muted-foreground flex-shrink-0" />
                          ) : (
                            <div className={cn("w-1.5 h-1.5 rounded-full mt-0.5 flex-shrink-0", frequencyColors[task.frequency])} />
                          )}
                          <span className={cn(
                            "font-medium leading-tight truncate flex-1",
                            task.status === 'completed' && "line-through"
                          )}>
                            {task.name}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-0.5 pl-2">
                          <span className="text-muted-foreground">{formatDuration(task.estimatedMinutes)}</span>
                          <Maximize2 className="w-2.5 h-2.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ))}
                    
                    {dayTasks.length === 0 && !isPast(day) && draggedItem && (
                      <div className="h-8 flex items-center justify-center text-muted-foreground/40">
                        <span className="text-[9px]">Soltar</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Compact legend */}
      <div className="flex items-center gap-3 px-2 py-1.5 border-t border-border bg-muted/20 text-[10px] shrink-0">
        <div className="flex items-center gap-1">
          <Lock className="w-2.5 h-2.5 text-muted-foreground" />
          <span className="text-muted-foreground">Fijo</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-sm bg-primary/20 border border-primary/30" />
          <span className="text-muted-foreground">Movible</span>
        </div>
        <div className="flex items-center gap-1 ml-auto">
          <Maximize2 className="w-2.5 h-2.5 text-muted-foreground" />
          <span className="text-muted-foreground">Click para detalles</span>
        </div>
      </div>

      {/* Task detail modal */}
      <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} />
    </div>
  );
};

export default EmployeeCalendarPlanner;
