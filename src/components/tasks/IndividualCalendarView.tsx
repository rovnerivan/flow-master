import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, startOfWeek, endOfWeek, isSameMonth, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  User, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Calendar as CalendarIcon,
  ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';

// Types
interface TeamMember {
  id: string;
  name: string;
  avatarUrl?: string;
  role?: string;
  availableHoursPerDay: number;
  department?: string;
}

interface AssignedTask {
  id: string;
  name: string;
  description?: string;
  assigneeId: string;
  scheduledDate: string;
  dueTime?: string;
  estimatedDurationMin: number;
  status: 'pending' | 'in_progress' | 'completed';
  linkedProcess?: { id: string; name: string };
}

interface IndividualCalendarViewProps {
  memberId: string;
  className?: string;
  onBack?: () => void;
}

// Mock data
const mockTeamMembers: TeamMember[] = [
  { id: 'u1', name: 'Carlos López', availableHoursPerDay: 8, role: 'Cajero', department: 'Ventas' },
  { id: 'u2', name: 'Ana Martínez', availableHoursPerDay: 8, role: 'Vendedora', department: 'Ventas' },
  { id: 'u3', name: 'María García', availableHoursPerDay: 6, role: 'Supervisor', department: 'Operaciones' },
];

// Generate mock tasks for a member
const generateMockTasksForMember = (memberId: string, month: Date): AssignedTask[] => {
  const tasks: AssignedTask[] = [];
  const days = eachDayOfInterval({ 
    start: startOfMonth(month), 
    end: endOfMonth(month) 
  });
  
  const taskNames = [
    { name: 'Verificar inventario de caja', description: 'Conteo inicial de efectivo' },
    { name: 'Revisar stock de productos', description: 'Verificar niveles de inventario' },
    { name: 'Atender proveedores', description: 'Recepción de pedidos' },
    { name: 'Limpieza de área', description: 'Limpieza y organización' },
    { name: 'Reporte diario', description: 'Generar informe de actividades' },
    { name: 'Cierre de caja', description: 'Cuadre final del día' },
  ];
  
  const times = ['09:00', '10:30', '12:00', '14:00', '15:30', '17:00'];
  
  days.forEach((day) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const isWeekend = day.getDay() === 0 || day.getDay() === 6;
    
    if (!isWeekend) {
      const taskCount = Math.floor(Math.random() * 4) + 2;
      const usedTasks = new Set<number>();
      
      for (let i = 0; i < taskCount; i++) {
        let taskIdx: number;
        do {
          taskIdx = Math.floor(Math.random() * taskNames.length);
        } while (usedTasks.has(taskIdx) && usedTasks.size < taskNames.length);
        usedTasks.add(taskIdx);
        
        const isPast = new Date(dateStr) < new Date();
        
        tasks.push({
          id: `task-${memberId}-${dateStr}-${i}`,
          name: taskNames[taskIdx].name,
          description: taskNames[taskIdx].description,
          assigneeId: memberId,
          scheduledDate: dateStr,
          dueTime: times[Math.floor(Math.random() * times.length)],
          estimatedDurationMin: [15, 30, 45, 60][Math.floor(Math.random() * 4)],
          status: isPast 
            ? ['completed', 'completed', 'completed', 'in_progress'][Math.floor(Math.random() * 4)] as 'completed' | 'in_progress'
            : 'pending',
          linkedProcess: Math.random() > 0.5 ? { id: 'p1', name: 'Proceso Operativo' } : undefined,
        });
      }
    }
  });
  
  return tasks;
};

const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

const statusConfig = {
  pending: { label: 'Pendiente', color: 'bg-muted text-muted-foreground', icon: Circle },
  in_progress: { label: 'En progreso', color: 'bg-primary/20 text-primary', icon: Clock },
  completed: { label: 'Completada', color: 'bg-success/20 text-success', icon: CheckCircle2 },
};

const IndividualCalendarView: React.FC<IndividualCalendarViewProps> = ({ 
  memberId, 
  className,
  onBack 
}) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  
  const member = mockTeamMembers.find(m => m.id === memberId) || mockTeamMembers[0];
  const tasks = generateMockTasksForMember(memberId, currentMonth);
  
  // Navigation
  const goToPreviousMonth = () => setCurrentMonth(prev => addMonths(prev, -1));
  const goToNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));
  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };

  // Get calendar days
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Get tasks for a day
  const getTasksForDay = (day: Date): AssignedTask[] => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return tasks.filter(t => t.scheduledDate === dateStr);
  };

  // Calculate daily load
  const getDayLoad = (day: Date): { assigned: number; available: number; percentage: number } => {
    const dayTasks = getTasksForDay(day);
    const assigned = dayTasks.reduce((sum, t) => sum + t.estimatedDurationMin, 0);
    const available = member.availableHoursPerDay * 60;
    return { assigned, available, percentage: (assigned / available) * 100 };
  };

  // Selected day tasks
  const selectedDayTasks = selectedDate ? getTasksForDay(selectedDate) : [];
  const selectedDayLoad = selectedDate ? getDayLoad(selectedDate) : { assigned: 0, available: 0, percentage: 0 };

  // Monthly stats
  const monthlyStats = tasks.reduce((acc, task) => ({
    total: acc.total + 1,
    completed: acc.completed + (task.status === 'completed' ? 1 : 0),
    totalMinutes: acc.totalMinutes + task.estimatedDurationMin,
    completedMinutes: acc.completedMinutes + (task.status === 'completed' ? task.estimatedDurationMin : 0),
  }), { total: 0, completed: 0, totalMinutes: 0, completedMinutes: 0 });

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-lg text-foreground">{member.name}</h2>
              <p className="text-sm text-muted-foreground">{member.role} • {member.department}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Hoy
          </Button>
          <Button variant="outline" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Month Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-card border border-border rounded-lg">
          <p className="text-sm text-muted-foreground">Tareas del mes</p>
          <p className="text-2xl font-bold text-foreground">{monthlyStats.total}</p>
        </div>
        <div className="p-4 bg-card border border-border rounded-lg">
          <p className="text-sm text-muted-foreground">Completadas</p>
          <p className="text-2xl font-bold text-success">{monthlyStats.completed}</p>
          <p className="text-xs text-muted-foreground">
            {monthlyStats.total > 0 ? Math.round((monthlyStats.completed / monthlyStats.total) * 100) : 0}% del total
          </p>
        </div>
        <div className="p-4 bg-card border border-border rounded-lg">
          <p className="text-sm text-muted-foreground">Tiempo asignado</p>
          <p className="text-2xl font-bold text-foreground">{formatDuration(monthlyStats.totalMinutes)}</p>
        </div>
        <div className="p-4 bg-card border border-border rounded-lg">
          <p className="text-sm text-muted-foreground">Tiempo invertido</p>
          <p className="text-2xl font-bold text-primary">{formatDuration(monthlyStats.completedMinutes)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-card border border-border rounded-lg overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/30">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              {format(currentMonth, 'MMMM yyyy', { locale: es })}
            </h3>
          </div>
          
          {/* Days Header */}
          <div className="grid grid-cols-7 border-b border-border">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
              <div key={day} className="p-2 text-center text-xs font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, idx) => {
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isToday = isSameDay(day, new Date());
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const dayTasks = getTasksForDay(day);
              const dayLoad = getDayLoad(day);
              const hasOverload = dayLoad.percentage > 100;
              
              return (
                <div
                  key={idx}
                  className={cn(
                    'min-h-[80px] p-1 border-b border-r border-border cursor-pointer transition-colors',
                    !isCurrentMonth && 'bg-muted/30',
                    isToday && 'bg-primary/5',
                    isSelected && 'ring-2 ring-primary ring-inset',
                    'hover:bg-muted/50'
                  )}
                  onClick={() => setSelectedDate(day)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn(
                      'text-sm font-medium',
                      !isCurrentMonth && 'text-muted-foreground',
                      isToday && 'text-primary'
                    )}>
                      {format(day, 'd')}
                    </span>
                    {hasOverload && (
                      <AlertTriangle className="h-3 w-3 text-destructive" />
                    )}
                  </div>
                  
                  {dayTasks.length > 0 && (
                    <>
                      {/* Mini load bar */}
                      <div className="h-1 bg-muted rounded-full mb-1 overflow-hidden">
                        <div 
                          className={cn(
                            'h-full',
                            hasOverload ? 'bg-destructive' : dayLoad.percentage > 80 ? 'bg-warning' : 'bg-success'
                          )}
                          style={{ width: `${Math.min(dayLoad.percentage, 100)}%` }}
                        />
                      </div>
                      
                      {/* Task indicators */}
                      <div className="flex flex-wrap gap-0.5">
                        {dayTasks.slice(0, 4).map((task, i) => (
                          <div
                            key={i}
                            className={cn(
                              'h-1.5 w-1.5 rounded-full',
                              task.status === 'completed' ? 'bg-success' :
                              task.status === 'in_progress' ? 'bg-primary' : 'bg-muted-foreground'
                            )}
                          />
                        ))}
                        {dayTasks.length > 4 && (
                          <span className="text-[8px] text-muted-foreground">+{dayTasks.length - 4}</span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Detail */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/30">
            <h3 className="font-semibold text-foreground">
              {selectedDate ? format(selectedDate, "EEEE d 'de' MMMM", { locale: es }) : 'Selecciona un día'}
            </h3>
            {selectedDate && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Carga del día</span>
                  <span className={cn(
                    'font-medium',
                    selectedDayLoad.percentage > 100 ? 'text-destructive' :
                    selectedDayLoad.percentage > 80 ? 'text-warning' : 'text-success'
                  )}>
                    {Math.round(selectedDayLoad.percentage)}%
                  </span>
                </div>
                <Progress 
                  value={Math.min(selectedDayLoad.percentage, 100)} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDuration(selectedDayLoad.assigned)} de {formatDuration(selectedDayLoad.available)} disponibles
                </p>
              </div>
            )}
          </div>
          
          <ScrollArea className="h-[400px]">
            {selectedDayTasks.length > 0 ? (
              <div className="divide-y divide-border">
                {selectedDayTasks
                  .sort((a, b) => (a.dueTime || '').localeCompare(b.dueTime || ''))
                  .map((task) => {
                    const StatusIcon = statusConfig[task.status].icon;
                    return (
                      <div key={task.id} className="p-3 hover:bg-muted/30 transition-colors">
                        <div className="flex items-start gap-3">
                          <StatusIcon className={cn(
                            'h-4 w-4 mt-0.5',
                            task.status === 'completed' && 'text-success',
                            task.status === 'in_progress' && 'text-primary',
                            task.status === 'pending' && 'text-muted-foreground'
                          )} />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{task.name}</p>
                            {task.description && (
                              <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              {task.dueTime && (
                                <Badge variant="outline" className="text-xs">
                                  {task.dueTime}
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                {formatDuration(task.estimatedDurationMin)}
                              </Badge>
                              {task.linkedProcess && (
                                <Badge variant="secondary" className="text-xs">
                                  {task.linkedProcess.name}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <CalendarIcon className="h-12 w-12 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">
                  {selectedDate ? 'No hay tareas para este día' : 'Selecciona un día para ver las tareas'}
                </p>
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default IndividualCalendarView;
