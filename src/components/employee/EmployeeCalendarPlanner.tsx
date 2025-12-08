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
  Target
} from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek, isSameDay, isAfter, isBefore, addWeeks, subWeeks } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

// Types
interface PendingTask {
  id: string;
  name: string;
  estimatedMinutes: number;
  deadline: Date | null;
  frequency: 'weekly' | 'monthly' | 'annual' | 'occasional';
  isFixed: boolean;
  linkedProcessId?: string;
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
}

// Mock data for demonstration
const mockPendingTasks: PendingTask[] = [
  { id: '1', name: 'Inventario mensual', estimatedMinutes: 120, deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), frequency: 'monthly', isFixed: false },
  { id: '2', name: 'Reporte de ventas', estimatedMinutes: 45, deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), frequency: 'weekly', isFixed: false },
  { id: '3', name: 'Auditoría de caja', estimatedMinutes: 60, deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), frequency: 'monthly', isFixed: false },
  { id: '4', name: 'Capacitación trimestral', estimatedMinutes: 180, deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), frequency: 'occasional', isFixed: false },
];

const generateMockScheduledTasks = (weekStart: Date): ScheduledTask[] => {
  const tasks: ScheduledTask[] = [];
  const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  
  // Fixed daily tasks
  for (let i = 0; i < 5; i++) {
    tasks.push({
      id: `daily-${i}`,
      assignmentId: `assign-daily-${i}`,
      name: 'Apertura de tienda',
      scheduledDate: addDays(weekStart, i),
      estimatedMinutes: 30,
      deadline: null,
      frequency: 'daily',
      isFixed: true,
      status: i < 2 ? 'completed' : 'pending',
      scheduledBy: 'supervisor'
    });
    tasks.push({
      id: `daily-close-${i}`,
      assignmentId: `assign-close-${i}`,
      name: 'Cierre de caja',
      scheduledDate: addDays(weekStart, i),
      estimatedMinutes: 20,
      deadline: null,
      frequency: 'daily',
      isFixed: true,
      status: i < 2 ? 'completed' : 'pending',
      scheduledBy: 'supervisor'
    });
  }
  
  // Employee-scheduled tasks
  tasks.push({
    id: 'weekly-1',
    assignmentId: 'assign-weekly-1',
    name: 'Revisión de inventario',
    scheduledDate: addDays(weekStart, 2),
    estimatedMinutes: 60,
    deadline: addDays(weekStart, 4),
    frequency: 'weekly',
    isFixed: false,
    status: 'pending',
    scheduledBy: 'employee'
  });
  
  return tasks;
};

const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

const getDeadlineStatus = (deadline: Date | null): 'urgent' | 'soon' | 'normal' => {
  if (!deadline) return 'normal';
  const daysUntil = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (daysUntil <= 2) return 'urgent';
  if (daysUntil <= 5) return 'soon';
  return 'normal';
};

const frequencyLabels: Record<string, { label: string; color: string }> = {
  daily: { label: 'Diaria', color: 'bg-blue-500/10 text-blue-600' },
  weekly: { label: 'Semanal', color: 'bg-green-500/10 text-green-600' },
  monthly: { label: 'Mensual', color: 'bg-purple-500/10 text-purple-600' },
  annual: { label: 'Anual', color: 'bg-amber-500/10 text-amber-600' },
  occasional: { label: 'Ocasional', color: 'bg-gray-500/10 text-gray-600' },
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
  const [draggedTask, setDraggedTask] = useState<PendingTask | null>(null);
  const [dragOverDay, setDragOverDay] = useState<Date | null>(null);

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
    const maxHoursPerDay = 8 * 60; // 8 hours in minutes
    
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

  const handleDragStart = (task: PendingTask) => {
    setDraggedTask(task);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDragOverDay(null);
  };

  const handleDragOver = (e: React.DragEvent, day: Date) => {
    e.preventDefault();
    setDragOverDay(day);
  };

  const handleDrop = (e: React.DragEvent, day: Date) => {
    e.preventDefault();
    
    if (!draggedTask) return;
    
    // Check if day is in the past
    if (isBefore(day, new Date()) && !isSameDay(day, new Date())) {
      toast({
        title: "No puedes programar en el pasado",
        description: "Selecciona una fecha de hoy en adelante.",
        variant: "destructive"
      });
      handleDragEnd();
      return;
    }

    // Check if deadline would be exceeded
    if (draggedTask.deadline && isAfter(day, draggedTask.deadline)) {
      toast({
        title: "Fecha límite excedida",
        description: `Esta tarea tiene fecha límite el ${format(draggedTask.deadline, "d 'de' MMMM", { locale: es })}.`,
        variant: "destructive"
      });
      handleDragEnd();
      return;
    }

    // Create new scheduled task
    const newScheduledTask: ScheduledTask = {
      id: `scheduled-${draggedTask.id}`,
      assignmentId: `assign-${draggedTask.id}`,
      name: draggedTask.name,
      scheduledDate: day,
      estimatedMinutes: draggedTask.estimatedMinutes,
      deadline: draggedTask.deadline,
      frequency: draggedTask.frequency,
      isFixed: false,
      status: 'pending',
      scheduledBy: 'employee'
    };

    setScheduledTasks(prev => [...prev, newScheduledTask]);
    setPendingTasks(prev => prev.filter(t => t.id !== draggedTask.id));
    
    toast({
      title: "Tarea programada",
      description: `"${draggedTask.name}" programada para el ${format(day, "EEEE d 'de' MMMM", { locale: es })}.`
    });

    handleDragEnd();
  };

  const handleMoveTask = (task: ScheduledTask, newDay: Date) => {
    if (task.isFixed) {
      toast({
        title: "Tarea fijada",
        description: "Esta tarea fue programada por tu supervisor y no puede moverse.",
        variant: "destructive"
      });
      return;
    }

    setScheduledTasks(prev => prev.map(t => 
      t.id === task.id 
        ? { ...t, scheduledDate: newDay, scheduledBy: 'employee' }
        : t
    ));

    toast({
      title: "Tarea movida",
      description: `"${task.name}" movida al ${format(newDay, "EEEE d", { locale: es })}.`
    });
  };

  const isToday = (date: Date) => isSameDay(date, new Date());
  const isPast = (date: Date) => isBefore(date, new Date()) && !isSameDay(date, new Date());

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Mi Calendario</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigateWeek('prev')}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Hoy
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigateWeek('next')}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Week label */}
      <div className="px-4 py-2 bg-muted/30 border-b border-border">
        <span className="text-sm text-muted-foreground">
          {format(weekStart, "d 'de' MMMM", { locale: es })} - {format(weekEnd, "d 'de' MMMM yyyy", { locale: es })}
        </span>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Pending tasks sidebar */}
        <div className="w-64 border-r border-border bg-muted/20 flex flex-col">
          <div className="p-3 border-b border-border">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4 text-muted-foreground" />
              Pendientes de planificar
              {pendingTasks.length > 0 && (
                <Badge variant="secondary" className="ml-auto">
                  {pendingTasks.length}
                </Badge>
              )}
            </h3>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-2">
              {pendingTasks.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>¡Todo planificado!</p>
                </div>
              ) : (
                pendingTasks.map(task => {
                  const deadlineStatus = getDeadlineStatus(task.deadline);
                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => handleDragStart(task)}
                      onDragEnd={handleDragEnd}
                      className={cn(
                        "p-3 rounded-lg bg-background border border-border cursor-grab active:cursor-grabbing",
                        "hover:border-primary/50 hover:shadow-sm transition-all",
                        draggedTask?.id === task.id && "opacity-50 border-primary"
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <GripVertical className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{task.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDuration(task.estimatedMinutes)}
                            </span>
                            <Badge variant="outline" className={cn("text-xs", frequencyLabels[task.frequency].color)}>
                              {frequencyLabels[task.frequency].label}
                            </Badge>
                          </div>
                          {task.deadline && (
                            <div className={cn(
                              "flex items-center gap-1 mt-1 text-xs",
                              deadlineStatus === 'urgent' && "text-destructive",
                              deadlineStatus === 'soon' && "text-amber-600",
                              deadlineStatus === 'normal' && "text-muted-foreground"
                            )}>
                              {deadlineStatus !== 'normal' && <AlertTriangle className="w-3 h-3" />}
                              <span>Límite: {format(task.deadline, "d MMM", { locale: es })}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Calendar grid */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Days header */}
          <div className="grid grid-cols-7 border-b border-border">
            {weekDays.map(day => (
              <div 
                key={day.toISOString()} 
                className={cn(
                  "p-2 text-center border-r border-border last:border-r-0",
                  isToday(day) && "bg-primary/5",
                  isPast(day) && "opacity-50"
                )}
              >
                <div className="text-xs text-muted-foreground uppercase">
                  {format(day, 'EEE', { locale: es })}
                </div>
                <div className={cn(
                  "text-lg font-semibold mt-0.5",
                  isToday(day) && "text-primary"
                )}>
                  {format(day, 'd')}
                </div>
              </div>
            ))}
          </div>

          {/* Workload indicators */}
          <div className="grid grid-cols-7 border-b border-border bg-muted/20">
            {weekDays.map(day => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const workload = dailyWorkload[dateKey];
              return (
                <div 
                  key={`workload-${day.toISOString()}`}
                  className="p-1.5 border-r border-border last:border-r-0"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{formatDuration(workload.minutes)}</span>
                    {workload.percentage > 90 && (
                      <AlertTriangle className="w-3 h-3 text-amber-500" />
                    )}
                  </div>
                  <Progress 
                    value={workload.percentage} 
                    className={cn(
                      "h-1.5",
                      workload.percentage > 100 && "[&>div]:bg-destructive",
                      workload.percentage > 80 && workload.percentage <= 100 && "[&>div]:bg-amber-500"
                    )}
                  />
                </div>
              );
            })}
          </div>

          {/* Tasks grid */}
          <div className="flex-1 grid grid-cols-7 overflow-hidden">
            {weekDays.map(day => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const dayTasks = tasksPerDay[dateKey] || [];
              const isDropTarget = dragOverDay && isSameDay(dragOverDay, day);
              
              return (
                <div
                  key={`col-${day.toISOString()}`}
                  onDragOver={(e) => handleDragOver(e, day)}
                  onDragLeave={() => setDragOverDay(null)}
                  onDrop={(e) => handleDrop(e, day)}
                  className={cn(
                    "border-r border-border last:border-r-0 overflow-y-auto",
                    isDropTarget && !isPast(day) && "bg-primary/5",
                    isPast(day) && "bg-muted/30"
                  )}
                >
                  <div className="p-1.5 space-y-1">
                    {dayTasks.map(task => (
                      <div
                        key={task.id}
                        className={cn(
                          "p-2 rounded-md text-xs transition-all",
                          task.isFixed 
                            ? "bg-muted border border-border" 
                            : "bg-primary/10 border border-primary/20 cursor-grab hover:shadow-sm",
                          task.status === 'completed' && "opacity-60 line-through"
                        )}
                      >
                        <div className="flex items-start gap-1">
                          {task.isFixed && (
                            <Lock className="w-3 h-3 text-muted-foreground flex-shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{task.name}</p>
                            <div className="flex items-center gap-1 mt-0.5 text-muted-foreground">
                              <Clock className="w-2.5 h-2.5" />
                              <span>{formatDuration(task.estimatedMinutes)}</span>
                            </div>
                          </div>
                        </div>
                        {!task.isFixed && task.scheduledBy === 'employee' && (
                          <div className="mt-1">
                            <Badge variant="outline" className="text-[10px] h-4 bg-primary/5">
                              Yo lo programé
                            </Badge>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 p-3 border-t border-border bg-muted/20 text-xs">
        <div className="flex items-center gap-1.5">
          <Lock className="w-3 h-3 text-muted-foreground" />
          <span className="text-muted-foreground">Fijado por supervisor</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-primary/20 border border-primary/30" />
          <span className="text-muted-foreground">Programado por mí</span>
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <AlertTriangle className="w-3 h-3 text-amber-500" />
          <span className="text-muted-foreground">Carga alta</span>
        </div>
      </div>
    </div>
  );
};

export default EmployeeCalendarPlanner;
