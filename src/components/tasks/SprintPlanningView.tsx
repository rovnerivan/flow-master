import React, { useState } from 'react';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  GripVertical, 
  Clock, 
  User, 
  ChevronLeft, 
  ChevronRight,
  ArrowDown,
  Users,
  Plus,
  X,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

// Types
interface TaskTemplate {
  id: string;
  name: string;
  description?: string;
  estimatedDurationMin: number;
  frequency: string;
  isActive: boolean;
}

interface TeamMember {
  id: string;
  name: string;
  avatarUrl?: string;
  availableHoursPerDay: number;
  role?: string;
}

interface PlannedTask {
  id: string;
  taskTemplateId: string;
  taskName: string;
  assigneeId: string;
  assigneeName: string;
  scheduledDate: string;
  dueTime?: string;
  estimatedDurationMin: number;
  instanceLabel?: string;
}

interface SprintPlanningViewProps {
  className?: string;
}

// Mock data
const mockTaskTemplates: TaskTemplate[] = [
  { id: 't1', name: 'Verificar inventario de caja', description: 'Conteo inicial de efectivo', estimatedDurationMin: 15, frequency: 'daily', isActive: true },
  { id: 't2', name: 'Revisar stock de productos', description: 'Verificar niveles de inventario', estimatedDurationMin: 30, frequency: 'daily', isActive: true },
  { id: 't3', name: 'Limpieza general', description: 'Limpieza de todas las áreas', estimatedDurationMin: 45, frequency: 'daily', isActive: true },
  { id: 't4', name: 'Reporte de ventas', description: 'Generar reporte consolidado', estimatedDurationMin: 60, frequency: 'weekly', isActive: true },
  { id: 't5', name: 'Auditoría de procesos', description: 'Revisar cumplimiento operativo', estimatedDurationMin: 120, frequency: 'monthly', isActive: true },
  { id: 't6', name: 'Capacitación mensual', description: 'Sesión de actualización', estimatedDurationMin: 90, frequency: 'monthly', isActive: true },
  { id: 't7', name: 'Cierre de caja nocturno', description: 'Cuadre final del día', estimatedDurationMin: 20, frequency: 'daily', isActive: true },
  { id: 't8', name: 'Atención de proveedores', description: 'Recepción y verificación de pedidos', estimatedDurationMin: 45, frequency: 'weekly', isActive: true },
];

const mockTeamMembers: TeamMember[] = [
  { id: 'u1', name: 'Carlos López', availableHoursPerDay: 8, role: 'Cajero' },
  { id: 'u2', name: 'Ana Martínez', availableHoursPerDay: 8, role: 'Vendedora' },
  { id: 'u3', name: 'María García', availableHoursPerDay: 6, role: 'Supervisor' },
  { id: 'u4', name: 'Roberto Díaz', availableHoursPerDay: 8, role: 'Almacenista' },
  { id: 'u5', name: 'Sofia Ruiz', availableHoursPerDay: 4, role: 'Part-time' },
];

const frequencyColors: Record<string, string> = {
  daily: 'bg-primary/20 text-primary border-primary/30',
  weekly: 'bg-warning/20 text-warning border-warning/30',
  monthly: 'bg-success/20 text-success border-success/30',
  annual: 'bg-purple-500/20 text-purple-500 border-purple-500/30',
  occasional: 'bg-muted text-muted-foreground border-border',
};

const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

const SprintPlanningView: React.FC<SprintPlanningViewProps> = ({ className }) => {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [plannedTasks, setPlannedTasks] = useState<PlannedTask[]>([]);
  const [draggedTask, setDraggedTask] = useState<TaskTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [showMemberSelector, setShowMemberSelector] = useState<{ date: string; task: TaskTemplate } | null>(null);

  // Get week days
  const weekDays = eachDayOfInterval({
    start: currentWeekStart,
    end: endOfWeek(currentWeekStart, { weekStartsOn: 1 }),
  });

  // Navigate weeks
  const goToPreviousWeek = () => setCurrentWeekStart(prev => addDays(prev, -7));
  const goToNextWeek = () => setCurrentWeekStart(prev => addDays(prev, 7));
  const goToToday = () => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));

  // Filter templates
  const filteredTemplates = mockTaskTemplates.filter(t => 
    t.isActive && 
    (t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     t.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Calculate backlog count
  const backlogCount = filteredTemplates.length - plannedTasks.length;

  // Get tasks for a specific date and member
  const getTasksForDateAndMember = (date: Date, memberId: string): PlannedTask[] => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return plannedTasks.filter(t => t.scheduledDate === dateStr && t.assigneeId === memberId);
  };

  // Calculate member load for a date
  const getMemberLoadForDate = (date: Date, memberId: string): { assigned: number; available: number; percentage: number } => {
    const tasks = getTasksForDateAndMember(date, memberId);
    const member = mockTeamMembers.find(m => m.id === memberId);
    const assigned = tasks.reduce((sum, t) => sum + t.estimatedDurationMin, 0);
    const available = (member?.availableHoursPerDay || 8) * 60;
    return { assigned, available, percentage: (assigned / available) * 100 };
  };

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, task: TaskTemplate) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'copy';
  };

  // Handle drop on a cell
  const handleDrop = (e: React.DragEvent, date: Date, memberId: string) => {
    e.preventDefault();
    if (!draggedTask) return;

    const member = mockTeamMembers.find(m => m.id === memberId);
    if (!member) return;

    const newPlannedTask: PlannedTask = {
      id: `planned-${Date.now()}`,
      taskTemplateId: draggedTask.id,
      taskName: draggedTask.name,
      assigneeId: memberId,
      assigneeName: member.name,
      scheduledDate: format(date, 'yyyy-MM-dd'),
      estimatedDurationMin: draggedTask.estimatedDurationMin,
    };

    setPlannedTasks(prev => [...prev, newPlannedTask]);
    setDraggedTask(null);
    toast.success(`"${draggedTask.name}" asignada a ${member.name}`);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  // Remove planned task
  const removePlannedTask = (taskId: string) => {
    setPlannedTasks(prev => prev.filter(t => t.id !== taskId));
    toast.info('Tarea removida del plan');
  };

  // Assign task via modal
  const assignTaskFromModal = (memberId: string) => {
    if (!showMemberSelector) return;
    
    const member = mockTeamMembers.find(m => m.id === memberId);
    if (!member) return;

    const newPlannedTask: PlannedTask = {
      id: `planned-${Date.now()}`,
      taskTemplateId: showMemberSelector.task.id,
      taskName: showMemberSelector.task.name,
      assigneeId: memberId,
      assigneeName: member.name,
      scheduledDate: showMemberSelector.date,
      estimatedDurationMin: showMemberSelector.task.estimatedDurationMin,
    };

    setPlannedTasks(prev => [...prev, newPlannedTask]);
    setShowMemberSelector(null);
    toast.success(`"${showMemberSelector.task.name}" asignada a ${member.name}`);
  };

  return (
    <div className={cn('flex h-[calc(100vh-200px)] gap-4', className)}>
      {/* Left Panel - Task Catalog */}
      <div className="w-80 flex-shrink-0 border border-border rounded-lg bg-card flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">Catálogo de Tareas</h3>
            <Badge variant="outline" className="bg-primary/10 text-primary">
              {backlogCount} pendientes
            </Badge>
          </div>
          <Input
            placeholder="Buscar tareas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9"
          />
        </div>
        
        <ScrollArea className="flex-1 p-2">
          <div className="space-y-2">
            {filteredTemplates.map((task) => {
              const isPlanned = plannedTasks.some(p => p.taskTemplateId === task.id);
              return (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task)}
                  className={cn(
                    'p-3 rounded-lg border cursor-grab active:cursor-grabbing transition-all',
                    'hover:shadow-md hover:border-primary/50',
                    isPlanned ? 'opacity-50 bg-muted/50' : 'bg-background',
                    frequencyColors[task.frequency]
                  )}
                >
                  <div className="flex items-start gap-2">
                    <GripVertical className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{task.name}</p>
                      {task.description && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDuration(task.estimatedDurationMin)}
                        </span>
                        {isPlanned && (
                          <Badge variant="secondary" className="text-xs h-5">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Planificada
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {/* Backlog indicator */}
        <div className="p-3 border-t border-border bg-muted/30">
          <div className="flex items-center gap-2 text-sm">
            <ArrowDown className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">
              Arrastra tareas al calendario
            </span>
          </div>
        </div>
      </div>

      {/* Right Panel - Week Planning Grid */}
      <div className="flex-1 border border-border rounded-lg bg-card flex flex-col overflow-hidden">
        {/* Week Navigation */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Hoy
            </Button>
            <Button variant="outline" size="icon" onClick={goToNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <h3 className="font-semibold text-foreground">
            {format(currentWeekStart, "'Semana del' d 'de' MMMM", { locale: es })}
          </h3>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {plannedTasks.length} tareas planificadas
            </Badge>
          </div>
        </div>

        {/* Grid Header - Days */}
        <div className="grid grid-cols-8 border-b border-border bg-muted/30">
          <div className="p-2 border-r border-border">
            <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
              <Users className="h-4 w-4" />
              Equipo
            </div>
          </div>
          {weekDays.map((day, idx) => {
            const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
            return (
              <div
                key={idx}
                className={cn(
                  'p-2 text-center border-r border-border last:border-r-0',
                  isToday && 'bg-primary/10'
                )}
              >
                <div className="text-xs text-muted-foreground uppercase">
                  {format(day, 'EEE', { locale: es })}
                </div>
                <div className={cn(
                  'text-sm font-medium',
                  isToday && 'text-primary'
                )}>
                  {format(day, 'd')}
                </div>
              </div>
            );
          })}
        </div>

        {/* Grid Body - Team Members */}
        <ScrollArea className="flex-1">
          <div className="min-w-[800px]">
            {mockTeamMembers.map((member) => (
              <div key={member.id} className="grid grid-cols-8 border-b border-border last:border-b-0">
                {/* Member Info */}
                <div className="p-3 border-r border-border bg-muted/20">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                </div>

                {/* Day Cells */}
                {weekDays.map((day, dayIdx) => {
                  const dayTasks = getTasksForDateAndMember(day, member.id);
                  const load = getMemberLoadForDate(day, member.id);
                  const isOverloaded = load.percentage > 100;
                  const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

                  return (
                    <div
                      key={dayIdx}
                      className={cn(
                        'p-2 border-r border-border last:border-r-0 min-h-[100px] transition-colors',
                        isToday && 'bg-primary/5',
                        draggedTask && 'hover:bg-primary/10'
                      )}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, day, member.id)}
                    >
                      {/* Load indicator */}
                      {dayTasks.length > 0 && (
                        <div className="mb-2">
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={cn(
                                'h-full transition-all',
                                isOverloaded ? 'bg-destructive' : load.percentage > 80 ? 'bg-warning' : 'bg-success'
                              )}
                              style={{ width: `${Math.min(load.percentage, 100)}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-[10px] text-muted-foreground">
                              {formatDuration(load.assigned)}
                            </span>
                            {isOverloaded && (
                              <AlertTriangle className="h-3 w-3 text-destructive" />
                            )}
                          </div>
                        </div>
                      )}

                      {/* Planned Tasks */}
                      <div className="space-y-1">
                        {dayTasks.map((task) => (
                          <div
                            key={task.id}
                            className="group relative p-1.5 rounded bg-primary/10 border border-primary/20 text-xs"
                          >
                            <p className="font-medium truncate pr-5">{task.taskName}</p>
                            <span className="text-muted-foreground">
                              {formatDuration(task.estimatedDurationMin)}
                            </span>
                            <button
                              onClick={() => removePlannedTask(task.id)}
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Drop zone indicator */}
                      {draggedTask && (
                        <div className="mt-2 p-2 border-2 border-dashed border-primary/30 rounded text-center">
                          <Plus className="h-4 w-4 mx-auto text-primary/50" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Member Selector Modal */}
      {showMemberSelector && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-card border border-border rounded-lg p-4 w-80 shadow-lg">
            <h4 className="font-semibold mb-3">Asignar a...</h4>
            <p className="text-sm text-muted-foreground mb-4">
              {showMemberSelector.task.name} para el {format(new Date(showMemberSelector.date), 'd MMM', { locale: es })}
            </p>
            <div className="space-y-2">
              {mockTeamMembers.map((member) => (
                <button
                  key={member.id}
                  onClick={() => assignTaskFromModal(member.id)}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors text-left"
                >
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.role}</p>
                  </div>
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => setShowMemberSelector(null)}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SprintPlanningView;
