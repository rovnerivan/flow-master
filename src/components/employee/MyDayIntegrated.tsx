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
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ProcessViewerModal } from '@/components/employee/ProcessViewerModal';

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
  linkedProcess?: LinkedProcess;
  strategicContext?: StrategicContext;
  correctionNotes?: string;
  timeSpent?: number;
}

// Mock data
const mockTasks: TaskItem[] = [
  {
    id: '1',
    name: 'Auditoría de productos',
    description: 'Verificar inventario de productos en exhibición',
    estimatedMinutes: 45,
    dueTime: '10:00',
    status: 'needs_correction',
    correctionNotes: 'Faltó verificar la sección de electrónicos',
    linkedProcess: { id: 'p1', name: 'Control de Inventario' },
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
    linkedProcess: { id: 'p2', name: 'Proceso de Cierre' },
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
    linkedProcess: { id: 'p3', name: 'Recepción de Mercancía' },
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
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onViewProcess, onStartTask }) => {
  const [expanded, setExpanded] = useState(false);
  
  const statusConfig = {
    pending: { bg: 'bg-muted', border: 'border-border', icon: Clock, iconColor: 'text-muted-foreground' },
    in_progress: { bg: 'bg-primary/5', border: 'border-primary/30', icon: PlayCircle, iconColor: 'text-primary' },
    completed: { bg: 'bg-success/5', border: 'border-success/30', icon: CheckCircle2, iconColor: 'text-success' },
    needs_correction: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: AlertTriangle, iconColor: 'text-amber-500' },
    rejected: { bg: 'bg-destructive/10', border: 'border-destructive/30', icon: AlertCircle, iconColor: 'text-destructive' },
  };

  const config = statusConfig[task.status];
  const StatusIcon = config.icon;

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
            <StatusIcon className={cn("w-5 h-5 mt-0.5 flex-shrink-0", config.iconColor)} />
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
                {task.linkedProcess && (
                  <>
                    <span>•</span>
                    <span className="text-primary">{task.linkedProcess.name}</span>
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
            
            {/* Actions */}
            <div className="flex items-center gap-2">
              {task.linkedProcess && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1.5 h-8 text-xs"
                  onClick={() => onViewProcess?.(task.linkedProcess!.id)}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Ver proceso
                </Button>
              )}
              {task.status === 'pending' && (
                <Button 
                  size="sm" 
                  className="gap-1.5 h-8 text-xs"
                  onClick={() => onStartTask?.(task.id)}
                >
                  <PlayCircle className="w-3.5 h-3.5" />
                  Iniciar
                </Button>
              )}
              {task.status === 'needs_correction' && (
                <Button 
                  size="sm" 
                  className="gap-1.5 h-8 text-xs bg-amber-500 hover:bg-amber-600"
                  onClick={() => onStartTask?.(task.id)}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Corregir
                </Button>
              )}
              {task.status === 'in_progress' && (
                <>
                  <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
                    <PauseCircle className="w-3.5 h-3.5" />
                    Pausar
                  </Button>
                  <Button size="sm" className="gap-1.5 h-8 text-xs">
                    <Send className="w-3.5 h-3.5" />
                    Enviar
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
  const [showCompleted, setShowCompleted] = useState(false);
  
  const tasks = mockTasks;
  
  // Group tasks by status
  const urgentTasks = tasks.filter(t => t.status === 'needs_correction' || t.status === 'rejected');
  const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  
  // Calculate progress
  const totalTasks = tasks.length;
  const completedCount = completedTasks.length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
  
  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
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
            Tienes {pendingTasks.length + urgentTasks.length} tareas pendientes para hoy
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
                onViewProcess={setSelectedProcess}
              />
            ))}
          </div>
        </div>
      )}

      {/* Pending Section */}
      {pendingTasks.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">
              Próximas ({pendingTasks.length})
            </h2>
          </div>
          <div className="space-y-2">
            {pendingTasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onViewProcess={setSelectedProcess}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed Section */}
      {completedTasks.length > 0 && (
        <div className="space-y-2">
          <button 
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <CheckCircle2 className="w-4 h-4 text-success" />
            <span className="font-medium">Completadas hoy ({completedTasks.length})</span>
            <ChevronRight className={cn(
              "w-4 h-4 transition-transform",
              showCompleted && "rotate-90"
            )} />
          </button>
          
          {showCompleted && (
            <div className="space-y-2 animate-slide-up">
              {completedTasks.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onViewProcess={setSelectedProcess}
                />
              ))}
            </div>
          )}
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
