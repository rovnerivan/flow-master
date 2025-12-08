import React, { useState } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronDown, 
  ChevronRight,
  PlayCircle,
  PauseCircle,
  BookOpen,
  Target,
  AlertTriangle,
  Send,
  RotateCcw,
  Circle,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ProcessViewerModal } from '@/components/employee/ProcessViewerModal';
import { toast } from '@/hooks/use-toast';

// Types
interface LinkedProcess {
  id: string;
  name: string;
}

interface StrategicContext {
  objectiveName: string;
  contribution: string;
}

interface TaskItem {
  id: string;
  name: string;
  description?: string;
  estimatedMinutes: number;
  dueTime?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'needs_correction' | 'rejected';
  linkedProcesses?: LinkedProcess[]; // Support for multiple processes
  strategicContext?: StrategicContext;
  correctionNotes?: string;
  timeSpent?: number;
}

// Mock data with multiple linked processes
const mockTasks: TaskItem[] = [
  {
    id: '1',
    name: 'Auditoría de productos',
    description: 'Verificar inventario de productos en exhibición',
    estimatedMinutes: 45,
    dueTime: '10:00',
    status: 'needs_correction',
    correctionNotes: 'Faltó verificar la sección de electrónicos',
    linkedProcesses: [
      { id: 'p1', name: 'Control de Inventario' },
      { id: 'p4', name: 'Verificación de Precios' }
    ],
    strategicContext: { 
      objectiveName: 'Reducir diferencias de inventario en 30%',
      contribution: 'Cada auditoría correcta reduce discrepancias'
    }
  },
  {
    id: '2',
    name: 'Cierre de caja',
    description: 'Cuadre de efectivo y cierre del día',
    estimatedMinutes: 15,
    dueTime: '18:00',
    status: 'pending',
    linkedProcesses: [{ id: 'p2', name: 'Proceso de Cierre' }],
    strategicContext: { 
      objectiveName: 'Reducir diferencias de caja en 50%',
      contribution: 'Tu precisión impacta directamente este objetivo'
    }
  },
  {
    id: '3',
    name: 'Reporte semanal de ventas',
    description: 'Compilar datos de ventas de la semana',
    estimatedMinutes: 30,
    dueTime: '17:00',
    status: 'pending',
  },
  {
    id: '4',
    name: 'Verificar inventario de caja',
    description: 'Conteo inicial de efectivo',
    estimatedMinutes: 10,
    dueTime: '09:00',
    status: 'completed',
    timeSpent: 8,
  },
  {
    id: '5',
    name: 'Apertura de tienda',
    description: 'Preparar área de trabajo',
    estimatedMinutes: 15,
    dueTime: '08:30',
    status: 'completed',
    timeSpent: 12,
  },
  {
    id: '6',
    name: 'Atender proveedores',
    estimatedMinutes: 20,
    dueTime: '11:00',
    status: 'completed',
    timeSpent: 25,
    linkedProcesses: [
      { id: 'p3', name: 'Recepción de Mercancía' },
      { id: 'p5', name: 'Documentación de Entregas' },
      { id: 'p6', name: 'Verificación de Calidad' }
    ],
  },
];

const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

interface TaskCardProps {
  task: TaskItem;
  onViewProcess?: (processId: string) => void;
  onStartTask?: (taskId: string) => void;
  onCompleteTask?: (taskId: string) => void;
  onCorrectTask?: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onViewProcess, 
  onStartTask, 
  onCompleteTask,
  onCorrectTask 
}) => {
  const [expanded, setExpanded] = useState(false);
  const [showProcesses, setShowProcesses] = useState(false);
  
  const statusConfig = {
    pending: { bg: 'bg-muted', border: 'border-border', icon: Circle, iconColor: 'text-muted-foreground' },
    in_progress: { bg: 'bg-primary/5', border: 'border-primary/30', icon: PlayCircle, iconColor: 'text-primary' },
    completed: { bg: 'bg-success/5', border: 'border-success/30', icon: CheckCircle2, iconColor: 'text-success' },
    needs_correction: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: AlertTriangle, iconColor: 'text-amber-500' },
    rejected: { bg: 'bg-destructive/10', border: 'border-destructive/30', icon: AlertCircle, iconColor: 'text-destructive' },
  };

  const config = statusConfig[task.status];
  const StatusIcon = config.icon;
  const hasMultipleProcesses = task.linkedProcesses && task.linkedProcesses.length > 1;

  // Handle clicking the status icon to complete task
  const handleStatusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (task.status === 'pending') {
      onStartTask?.(task.id);
    } else if (task.status === 'in_progress') {
      onCompleteTask?.(task.id);
    }
  };

  return (
    <Collapsible open={expanded} onOpenChange={setExpanded}>
      <div className={cn(
        "rounded-xl border transition-all",
        config.bg,
        config.border,
        expanded && "ring-1 ring-primary/20"
      )}>
        <CollapsibleTrigger className="w-full">
          <div className="p-3 flex items-start gap-3">
            {/* Clickable status icon for quick complete */}
            <button
              onClick={handleStatusClick}
              className={cn(
                "mt-0.5 flex-shrink-0 transition-all",
                task.status === 'pending' && "hover:text-primary",
                task.status === 'in_progress' && "hover:text-success"
              )}
            >
              {task.status === 'pending' && (
                <Circle className="w-5 h-5 text-muted-foreground hover:text-primary" />
              )}
              {task.status === 'in_progress' && (
                <div className="relative">
                  <Circle className="w-5 h-5 text-primary" />
                  <Check className="w-3 h-3 text-primary absolute top-1 left-1 opacity-0 hover:opacity-100 transition-opacity" />
                </div>
              )}
              {task.status === 'completed' && (
                <CheckCircle2 className="w-5 h-5 text-success" />
              )}
              {task.status === 'needs_correction' && (
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              )}
              {task.status === 'rejected' && (
                <AlertCircle className="w-5 h-5 text-destructive" />
              )}
            </button>
            
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-start justify-between gap-2">
                <p className={cn(
                  "font-medium text-sm",
                  task.status === 'completed' && "line-through text-muted-foreground"
                )}>
                  {task.name}
                </p>
                <ChevronDown className={cn(
                  "w-4 h-4 text-muted-foreground transition-transform flex-shrink-0",
                  expanded && "rotate-180"
                )} />
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                {task.dueTime && <span>{task.dueTime}</span>}
                <span>•</span>
                <span>{formatDuration(task.estimatedMinutes)}</span>
                {task.linkedProcesses && task.linkedProcesses.length > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-primary">
                      {hasMultipleProcesses 
                        ? `${task.linkedProcesses.length} procesos`
                        : task.linkedProcesses[0].name
                      }
                    </span>
                  </>
                )}
              </div>
              {task.status === 'needs_correction' && task.correctionNotes && (
                <p className="text-xs text-amber-600 mt-1 bg-amber-500/10 px-2 py-1 rounded">
                  {task.correctionNotes}
                </p>
              )}
            </div>
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="px-3 pb-3 space-y-3 border-t border-border/50 pt-3 ml-8">
            {task.description && (
              <p className="text-sm text-muted-foreground">{task.description}</p>
            )}
            
            {/* Strategic Context */}
            {task.strategicContext && (
              <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/10">
                <div className="flex items-start gap-2">
                  <Target className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-primary">
                      Parte de: {task.strategicContext.objectiveName}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {task.strategicContext.contribution}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Linked Processes - Expandable list for multiple */}
            {task.linkedProcesses && task.linkedProcesses.length > 0 && (
              <div className="space-y-2">
                {hasMultipleProcesses ? (
                  <Collapsible open={showProcesses} onOpenChange={setShowProcesses}>
                    <CollapsibleTrigger className="w-full">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-primary" />
                          <span className="text-xs font-medium">
                            {task.linkedProcesses.length} procesos asociados
                          </span>
                        </div>
                        <ChevronRight className={cn(
                          "w-4 h-4 text-muted-foreground transition-transform",
                          showProcesses && "rotate-90"
                        )} />
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="space-y-1 mt-2">
                        {task.linkedProcesses.map(process => (
                          <button
                            key={process.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewProcess?.(process.id);
                            }}
                            className="w-full flex items-center justify-between p-2 rounded-lg bg-background border border-border hover:border-primary/50 transition-all text-left"
                          >
                            <span className="text-xs font-medium truncate">{process.name}</span>
                            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                          </button>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1.5 h-8 text-xs w-full justify-start"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewProcess?.(task.linkedProcesses![0].id);
                    }}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    Ver proceso: {task.linkedProcesses[0].name}
                  </Button>
                )}
              </div>
            )}
            
            {/* Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              {task.status === 'pending' && (
                <Button 
                  size="sm" 
                  className="gap-1.5 h-8 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartTask?.(task.id);
                  }}
                >
                  <PlayCircle className="w-3.5 h-3.5" />
                  Iniciar
                </Button>
              )}
              {task.status === 'needs_correction' && (
                <Button 
                  size="sm" 
                  className="gap-1.5 h-8 text-xs bg-amber-500 hover:bg-amber-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCorrectTask?.(task.id);
                  }}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Corregir
                </Button>
              )}
              {task.status === 'in_progress' && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1.5 h-8 text-xs"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <PauseCircle className="w-3.5 h-3.5" />
                    Pausar
                  </Button>
                  <Button 
                    size="sm" 
                    className="gap-1.5 h-8 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCompleteTask?.(task.id);
                    }}
                  >
                    <Send className="w-3.5 h-3.5" />
                    Completar
                  </Button>
                </>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

interface MyDayIntegratedProps {
  userName?: string;
  className?: string;
}

export const MyDayIntegrated: React.FC<MyDayIntegratedProps> = ({ 
  userName = 'Carlos',
  className 
}) => {
  const [selectedProcess, setSelectedProcess] = useState<string | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>(mockTasks);
  
  // Group tasks by status - keep completed tasks visible in main list
  const urgentTasks = tasks.filter(t => t.status === 'needs_correction' || t.status === 'rejected');
  // Include completed tasks in the main list, sorted by dueTime
  const mainTasks = tasks
    .filter(t => t.status === 'pending' || t.status === 'in_progress' || t.status === 'completed')
    .sort((a, b) => {
      // Sort by dueTime, completed tasks stay in their time position
      if (a.dueTime && b.dueTime) {
        return a.dueTime.localeCompare(b.dueTime);
      }
      return 0;
    });
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const pendingCount = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length;
  
  // Calculate progress
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
  
  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  // Handle starting a task
  const handleStartTask = (taskId: string) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, status: 'in_progress' as const } : t
    ));
    toast({
      title: "Tarea iniciada",
      description: "El cronómetro ha comenzado. ¡Buena suerte!"
    });
  };

  // Handle completing a task
  const handleCompleteTask = (taskId: string) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, status: 'completed' as const, timeSpent: t.estimatedMinutes } : t
    ));
    toast({
      title: "¡Tarea completada!",
      description: "Buen trabajo. La tarea ha sido marcada como completada."
    });
  };

  // Handle correcting a task
  const handleCorrectTask = (taskId: string) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, status: 'in_progress' as const } : t
    ));
    toast({
      title: "Corrección iniciada",
      description: "Revisa las notas del supervisor y realiza los ajustes necesarios."
    });
  };

  // Handle viewing a process
  const handleViewProcess = (processId: string) => {
    setSelectedProcess(processId);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="space-y-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            👋 {getGreeting()}, {userName}
          </h1>
          <p className="text-muted-foreground text-sm">
            Tienes {pendingCount + urgentTasks.length} tareas pendientes para hoy
          </p>
        </div>
        
        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progreso del día</span>
            <span className="font-semibold text-foreground">{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2.5" />
          <p className="text-xs text-muted-foreground">
            {completedCount} de {totalTasks} tareas completadas
          </p>
        </div>
      </div>

      {/* Urgent Section */}
      {urgentTasks.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-semibold text-amber-500">
              Requiere corrección ({urgentTasks.length})
            </h2>
          </div>
          <div className="space-y-2">
            {urgentTasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onViewProcess={handleViewProcess}
                onStartTask={handleStartTask}
                onCompleteTask={handleCompleteTask}
                onCorrectTask={handleCorrectTask}
              />
            ))}
          </div>
        </div>
      )}

      {/* Main Tasks Section - includes pending and completed */}
      {mainTasks.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">
              Hoy ({mainTasks.length})
            </h2>
            <span className="text-xs text-muted-foreground ml-auto">
              {completedCount} completadas
            </span>
          </div>
          <div className="space-y-2">
            {mainTasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onViewProcess={handleViewProcess}
                onStartTask={handleStartTask}
                onCompleteTask={handleCompleteTask}
                onCorrectTask={handleCorrectTask}
              />
            ))}
          </div>
        </div>
      )}

      {/* Process Viewer Modal */}
      {selectedProcess && (
        <ProcessViewerModal 
          processId={selectedProcess} 
          onClose={() => setSelectedProcess(null)} 
        />
      )}
    </div>
  );
};

export default MyDayIntegrated;
