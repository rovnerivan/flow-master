import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronDown, 
  ChevronRight,
  ChevronUp,
  PlayCircle,
  PauseCircle,
  BookOpen,
  Target,
  AlertTriangle,
  Send,
  RotateCcw,
  Circle,
  Check,
  Timer,
  Square,
  Play,
  Pause,
  X,
  Edit3,
  History
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ProcessViewerModal } from '@/components/employee/ProcessViewerModal';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';

// Types
interface LinkedProcess {
  id: string;
  name: string;
}

interface StrategicContext {
  objectiveName: string;
  contribution: string;
}

interface TimeEntry {
  id: string;
  minutes: number;
  type: 'timer' | 'manual';
  createdAt: Date;
}

interface TaskItem {
  id: string;
  name: string;
  description?: string;
  estimatedMinutes: number;
  dueTime?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'needs_correction' | 'rejected';
  linkedProcesses?: LinkedProcess[];
  strategicContext?: StrategicContext;
  correctionNotes?: string;
  timeSpent?: number;
  timeEntries?: TimeEntry[];
}

interface ActiveTimer {
  taskId: string;
  taskName: string;
  startTime: number;
  pausedTime: number;
  isPaused: boolean;
  accumulatedSeconds: number;
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

const formatTimerDisplay = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// Task Action Modal Component
interface TaskActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskName: string;
  onStartTimer: () => void;
  onManualTime: () => void;
  onMarkComplete: () => void;
}

const TaskActionModal: React.FC<TaskActionModalProps> = ({
  isOpen,
  onClose,
  taskName,
  onStartTimer,
  onManualTime,
  onMarkComplete
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">{taskName}</DialogTitle>
          <DialogDescription>
            ¿Cómo quieres registrar esta tarea?
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 pt-2">
          <Button 
            variant="outline" 
            className="w-full justify-start gap-3 h-12"
            onClick={() => {
              onStartTimer();
              onClose();
            }}
          >
            <Timer className="w-5 h-5 text-primary" />
            <div className="text-left">
              <p className="font-medium text-sm">Iniciar contador de tiempo</p>
              <p className="text-xs text-muted-foreground">Mide el tiempo mientras trabajas</p>
            </div>
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start gap-3 h-12"
            onClick={() => {
              onManualTime();
              onClose();
            }}
          >
            <Edit3 className="w-5 h-5 text-amber-500" />
            <div className="text-left">
              <p className="font-medium text-sm">Registrar tiempo manualmente</p>
              <p className="text-xs text-muted-foreground">Ingresa los minutos trabajados</p>
            </div>
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start gap-3 h-12"
            onClick={() => {
              onMarkComplete();
              onClose();
            }}
          >
            <CheckCircle2 className="w-5 h-5 text-success" />
            <div className="text-left">
              <p className="font-medium text-sm">Dar por completada</p>
              <p className="text-xs text-muted-foreground">Sin registrar tiempo</p>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Manual Time Entry Modal
interface ManualTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskName: string;
  onSave: (minutes: number, markComplete: boolean) => void;
}

const ManualTimeModal: React.FC<ManualTimeModalProps> = ({
  isOpen,
  onClose,
  taskName,
  onSave
}) => {
  const [minutes, setMinutes] = useState('');
  
  const handleSave = (markComplete: boolean) => {
    const mins = parseInt(minutes) || 0;
    if (mins > 0) {
      onSave(mins, markComplete);
      setMinutes('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base">Registrar tiempo</DialogTitle>
          <DialogDescription>{taskName}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Minutos trabajados</label>
            <Input 
              type="number" 
              placeholder="Ej: 30"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              min="1"
            />
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => handleSave(false)}
              disabled={!minutes || parseInt(minutes) <= 0}
            >
              Solo registrar tiempo
            </Button>
            <Button 
              className="flex-1"
              onClick={() => handleSave(true)}
              disabled={!minutes || parseInt(minutes) <= 0}
            >
              Registrar y completar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Stop Timer Confirmation Modal
interface StopTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskName: string;
  timeSpent: number;
  onConfirmComplete: () => void;
  onKeepWorking: () => void;
}

const StopTimerModal: React.FC<StopTimerModalProps> = ({
  isOpen,
  onClose,
  taskName,
  timeSpent,
  onConfirmComplete,
  onKeepWorking
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base">¿Dar por completada?</DialogTitle>
          <DialogDescription>
            {taskName} - Tiempo registrado: {formatTimerDisplay(timeSpent)}
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => {
              onKeepWorking();
              onClose();
            }}
          >
            Aún no
          </Button>
          <Button 
            className="flex-1 bg-success hover:bg-success/90"
            onClick={() => {
              onConfirmComplete();
              onClose();
            }}
          >
            Sí, completar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Floating Timer Component - More prominent with minimize
interface FloatingTimerProps {
  timer: ActiveTimer;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  isMinimized: boolean;
  onToggleMinimize: () => void;
}

const FloatingTimer: React.FC<FloatingTimerProps> = ({
  timer,
  onPause,
  onResume,
  onStop,
  isMinimized,
  onToggleMinimize
}) => {
  const [displaySeconds, setDisplaySeconds] = useState(0);
  
  useEffect(() => {
    if (timer.isPaused) {
      setDisplaySeconds(timer.accumulatedSeconds);
      return;
    }
    
    const updateDisplay = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - timer.startTime) / 1000);
      setDisplaySeconds(timer.accumulatedSeconds + elapsed);
    };
    
    updateDisplay();
    const interval = setInterval(updateDisplay, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Minimized version - small floating badge
  if (isMinimized) {
    return (
      <button
        onClick={onToggleMinimize}
        className="fixed bottom-4 right-4 z-[100] bg-primary text-primary-foreground rounded-full px-4 py-2 shadow-lg flex items-center gap-2 animate-pulse hover:animate-none hover:scale-105 transition-transform"
      >
        <Timer className="w-4 h-4" />
        <span className="font-mono font-bold">{formatTimerDisplay(displaySeconds)}</span>
        <ChevronUp className="w-4 h-4" />
      </button>
    );
  }

  // Full version - prominent floating card
  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] pointer-events-none">
      <div className="max-w-lg mx-auto p-4 pointer-events-auto">
        <div className="bg-card border-2 border-primary rounded-2xl shadow-2xl overflow-hidden">
          {/* Header with task name and minimize */}
          <div className="bg-primary/10 px-4 py-2 flex items-center justify-between border-b border-primary/20">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-xs font-medium text-primary">En progreso</span>
            </div>
            <button
              onClick={onToggleMinimize}
              className="p-1 hover:bg-primary/10 rounded-lg transition-colors"
            >
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          
          <div className="p-4">
            <p className="text-sm font-medium text-foreground mb-3 truncate">{timer.taskName}</p>
            
            {/* Timer display - large and prominent */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="flex items-center gap-3 bg-primary/10 px-6 py-3 rounded-xl">
                <Timer className="w-6 h-6 text-primary" />
                <span className="font-mono text-3xl font-bold text-primary">
                  {formatTimerDisplay(displaySeconds)}
                </span>
              </div>
            </div>
            
            {/* Controls */}
            <div className="flex items-center justify-center gap-3">
              {timer.isPaused ? (
                <Button 
                  size="lg"
                  variant="outline"
                  className="gap-2 flex-1 border-primary text-primary hover:bg-primary/10"
                  onClick={onResume}
                >
                  <Play className="w-5 h-5" />
                  Continuar
                </Button>
              ) : (
                <Button 
                  size="lg"
                  variant="outline"
                  className="gap-2 flex-1 border-amber-500 text-amber-500 hover:bg-amber-500/10"
                  onClick={onPause}
                >
                  <Pause className="w-5 h-5" />
                  Pausar
                </Button>
              )}
              <Button 
                size="lg"
                variant="destructive"
                className="gap-2 flex-1"
                onClick={onStop}
              >
                <Square className="w-4 h-4" />
                Detener
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Time Log Modal - View and edit time entries
interface TimeLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: TaskItem | null;
  onUpdateEntry: (taskId: string, entryId: string, newMinutes: number) => void;
  onDeleteEntry: (taskId: string, entryId: string) => void;
}

const TimeLogModal: React.FC<TimeLogModalProps> = ({
  isOpen,
  onClose,
  task,
  onUpdateEntry,
  onDeleteEntry
}) => {
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  if (!task) return null;

  const entries = task.timeEntries || [];
  const totalMinutes = entries.reduce((sum, e) => sum + e.minutes, 0);

  const handleSaveEdit = (entryId: string) => {
    const newMinutes = parseInt(editValue);
    if (newMinutes > 0) {
      onUpdateEntry(task.id, entryId, newMinutes);
    }
    setEditingEntry(null);
    setEditValue('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Registro de tiempo</DialogTitle>
          <DialogDescription>{task.name}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 pt-2">
          {/* Summary */}
          <div className="p-3 rounded-lg bg-primary/10 flex items-center justify-between">
            <span className="text-sm font-medium">Total registrado</span>
            <span className="text-lg font-bold text-primary">{totalMinutes} min</span>
          </div>

          {/* Entries list */}
          {entries.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {entries.map((entry) => (
                <div 
                  key={entry.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border"
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    entry.type === 'timer' ? "bg-primary/10" : "bg-amber-500/10"
                  )}>
                    {entry.type === 'timer' ? (
                      <Timer className="w-4 h-4 text-primary" />
                    ) : (
                      <Edit3 className="w-4 h-4 text-amber-500" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    {editingEntry === entry.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="h-8 w-20"
                          min="1"
                        />
                        <span className="text-xs text-muted-foreground">min</span>
                        <Button size="sm" className="h-7" onClick={() => handleSaveEdit(entry.id)}>
                          Guardar
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7" onClick={() => setEditingEntry(null)}>
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-medium">{entry.minutes} minutos</p>
                        <p className="text-xs text-muted-foreground">
                          {entry.type === 'timer' ? 'Cronómetro' : 'Manual'} • {entry.createdAt.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </>
                    )}
                  </div>
                  
                  {editingEntry !== entry.id && (
                    <div className="flex items-center gap-1">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8"
                        onClick={() => {
                          setEditingEntry(entry.id);
                          setEditValue(String(entry.minutes));
                        }}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => onDeleteEntry(task.id, entry.id)}
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No hay registros de tiempo</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface TaskCardProps {
  task: TaskItem;
  onViewProcess?: (processId: string) => void;
  onTaskAction?: (taskId: string) => void;
  onStartTask?: (taskId: string) => void;
  onCompleteTask?: (taskId: string) => void;
  onCorrectTask?: (taskId: string) => void;
  onViewTimeLog?: (taskId: string) => void;
  hasActiveTimer?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onViewProcess, 
  onTaskAction,
  onStartTask, 
  onCompleteTask,
  onCorrectTask,
  onViewTimeLog,
  hasActiveTimer
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

  // Handle clicking the status icon to show action modal
  const handleStatusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (task.status === 'pending' || task.status === 'in_progress') {
      onTaskAction?.(task.id);
    }
  };

  return (
    <Collapsible open={expanded} onOpenChange={setExpanded}>
      <div className={cn(
        "rounded-xl border transition-all",
        config.bg,
        config.border,
        expanded && "ring-1 ring-primary/20",
        hasActiveTimer && task.status === 'in_progress' && "ring-2 ring-primary"
      )}>
        <CollapsibleTrigger className="w-full">
          <div className="p-3 flex items-start gap-3">
            {/* Clickable status icon */}
            <button
              onClick={handleStatusClick}
              className={cn(
                "mt-0.5 flex-shrink-0 transition-all",
                (task.status === 'pending' || task.status === 'in_progress') && "hover:scale-110"
              )}
            >
              {task.status === 'pending' && (
                <Circle className="w-5 h-5 text-muted-foreground hover:text-primary" />
              )}
              {task.status === 'in_progress' && (
                <div className="relative">
                  <PlayCircle className="w-5 h-5 text-primary animate-pulse" />
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
                {task.timeSpent && task.status === 'completed' && (
                  <>
                    <span>•</span>
                    <span className="text-success">✓ {task.timeSpent}m</span>
                  </>
                )}
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
                    onTaskAction?.(task.id);
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
              {task.status === 'in_progress' && !hasActiveTimer && (
                <Button 
                  size="sm" 
                  className="gap-1.5 h-8 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTaskAction?.(task.id);
                  }}
                >
                  <Timer className="w-3.5 h-3.5" />
                  Registrar tiempo
                </Button>
              )}
              {/* Time log button - show if task has time spent */}
              {(task.timeSpent && task.timeSpent > 0) && (
                <Button 
                  size="sm"
                  variant="ghost"
                  className="gap-1.5 h-8 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewTimeLog?.(task.id);
                  }}
                >
                  <History className="w-3.5 h-3.5" />
                  {task.timeSpent}m
                </Button>
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
  
  // Task action modal state
  const [actionModalTask, setActionModalTask] = useState<TaskItem | null>(null);
  const [manualTimeTask, setManualTimeTask] = useState<TaskItem | null>(null);
  const [stopTimerModal, setStopTimerModal] = useState(false);
  const [timeLogTask, setTimeLogTask] = useState<TaskItem | null>(null);
  
  // Active timer state
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null);
  const [timerMinimized, setTimerMinimized] = useState(false);
  
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

  // Handle task action click (opens modal)
  const handleTaskAction = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setActionModalTask(task);
    }
  };

  // Start timer for task
  const handleStartTimer = () => {
    if (!actionModalTask) return;
    
    // Set task to in_progress
    setTasks(prev => prev.map(t => 
      t.id === actionModalTask.id ? { ...t, status: 'in_progress' as const } : t
    ));
    
    // Start the timer
    setActiveTimer({
      taskId: actionModalTask.id,
      taskName: actionModalTask.name,
      startTime: Date.now(),
      pausedTime: 0,
      isPaused: false,
      accumulatedSeconds: 0
    });
    
    toast({
      title: "Cronómetro iniciado",
      description: "El tiempo se está registrando"
    });
  };

  // Open manual time entry modal
  const handleOpenManualTime = () => {
    if (!actionModalTask) return;
    
    // Set task to in_progress first
    setTasks(prev => prev.map(t => 
      t.id === actionModalTask.id ? { ...t, status: 'in_progress' as const } : t
    ));
    
    setManualTimeTask(actionModalTask);
  };

  // Save manual time entry
  const handleSaveManualTime = (minutes: number, markComplete: boolean) => {
    if (!manualTimeTask) return;
    
    setTasks(prev => prev.map(t => 
      t.id === manualTimeTask.id 
        ? { 
            ...t, 
            status: markComplete ? 'completed' as const : 'in_progress' as const,
            timeSpent: (t.timeSpent || 0) + minutes,
            timeEntries: [
              ...(t.timeEntries || []),
              {
                id: `te-${Date.now()}`,
                minutes,
                type: 'manual' as const,
                createdAt: new Date()
              }
            ]
          } 
        : t
    ));
    
    toast({
      title: markComplete ? "¡Tarea completada!" : "Tiempo registrado",
      description: `Se registraron ${minutes} minutos`
    });
  };

  // Mark task as complete directly (no time)
  const handleMarkComplete = () => {
    if (!actionModalTask) return;
    
    setTasks(prev => prev.map(t => 
      t.id === actionModalTask.id ? { ...t, status: 'completed' as const } : t
    ));
    
    toast({
      title: "¡Tarea completada!",
      description: "La tarea ha sido marcada como completada"
    });
  };

  // Timer controls
  const handlePauseTimer = () => {
    if (!activeTimer || activeTimer.isPaused) return;
    
    const now = Date.now();
    const elapsed = Math.floor((now - activeTimer.startTime) / 1000);
    
    setActiveTimer({
      ...activeTimer,
      isPaused: true,
      pausedTime: now,
      accumulatedSeconds: activeTimer.accumulatedSeconds + elapsed
    });
  };

  const handleResumeTimer = () => {
    if (!activeTimer || !activeTimer.isPaused) return;
    
    setActiveTimer({
      ...activeTimer,
      isPaused: false,
      startTime: Date.now()
    });
  };

  const handleStopTimer = () => {
    setStopTimerModal(true);
  };

  const getTimerElapsedSeconds = (): number => {
    if (!activeTimer) return 0;
    
    if (activeTimer.isPaused) {
      return activeTimer.accumulatedSeconds;
    }
    
    const now = Date.now();
    const elapsed = Math.floor((now - activeTimer.startTime) / 1000);
    return activeTimer.accumulatedSeconds + elapsed;
  };

  const handleConfirmComplete = () => {
    if (!activeTimer) return;
    
    const totalSeconds = getTimerElapsedSeconds();
    const totalMinutes = Math.ceil(totalSeconds / 60);
    
    setTasks(prev => prev.map(t => 
      t.id === activeTimer.taskId 
        ? { 
            ...t, 
            status: 'completed' as const, 
            timeSpent: (t.timeSpent || 0) + totalMinutes,
            timeEntries: [
              ...(t.timeEntries || []),
              {
                id: `te-${Date.now()}`,
                minutes: totalMinutes,
                type: 'timer' as const,
                createdAt: new Date()
              }
            ]
          } 
        : t
    ));
    
    setActiveTimer(null);
    
    toast({
      title: "¡Tarea completada!",
      description: `Tiempo registrado: ${totalMinutes} minutos`
    });
  };

  // "Aún no" - Save time but DON'T complete, close timer
  const handleKeepWorking = () => {
    if (!activeTimer) return;
    
    // Get elapsed time and save it
    const totalSeconds = getTimerElapsedSeconds();
    const totalMinutes = Math.ceil(totalSeconds / 60);
    
    if (totalMinutes > 0) {
      // Save time entry but keep task in_progress
      setTasks(prev => prev.map(t => 
        t.id === activeTimer.taskId 
          ? { 
              ...t, 
              timeSpent: (t.timeSpent || 0) + totalMinutes,
              timeEntries: [
                ...(t.timeEntries || []),
                {
                  id: `te-${Date.now()}`,
                  minutes: totalMinutes,
                  type: 'timer' as const,
                  createdAt: new Date()
                }
              ]
            } 
          : t
      ));
      
      toast({
        title: "Tiempo registrado",
        description: `Se guardaron ${totalMinutes} minutos. La tarea sigue en progreso.`
      });
    }
    
    // Close timer
    setActiveTimer(null);
  };

  // Handle time entry updates
  const handleUpdateTimeEntry = (taskId: string, entryId: string, newMinutes: number) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      const entries = t.timeEntries || [];
      const oldEntry = entries.find(e => e.id === entryId);
      const diff = oldEntry ? newMinutes - oldEntry.minutes : 0;
      return {
        ...t,
        timeSpent: (t.timeSpent || 0) + diff,
        timeEntries: entries.map(e => 
          e.id === entryId ? { ...e, minutes: newMinutes } : e
        )
      };
    }));
    toast({ title: "Tiempo actualizado" });
  };

  const handleDeleteTimeEntry = (taskId: string, entryId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      const entries = t.timeEntries || [];
      const entry = entries.find(e => e.id === entryId);
      return {
        ...t,
        timeSpent: Math.max(0, (t.timeSpent || 0) - (entry?.minutes || 0)),
        timeEntries: entries.filter(e => e.id !== entryId)
      };
    }));
    toast({ title: "Registro eliminado" });
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

  // Handle viewing time log
  const handleViewTimeLog = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setTimeLogTask(task);
    }
  };

  return (
    <div className={cn("space-y-4", className, activeTimer && "pb-20")}>
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
            <AlertCircle className="w-4 h-4 text-destructive" />
            <h2 className="text-sm font-semibold text-destructive">
              Requieren atención ({urgentTasks.length})
            </h2>
          </div>
          <div className="space-y-2">
            {urgentTasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onViewProcess={handleViewProcess}
                onTaskAction={handleTaskAction}
                onCorrectTask={handleCorrectTask}
                onViewTimeLog={handleViewTimeLog}
                hasActiveTimer={activeTimer?.taskId === task.id}
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
                onTaskAction={handleTaskAction}
                onCorrectTask={handleCorrectTask}
                onViewTimeLog={handleViewTimeLog}
                hasActiveTimer={activeTimer?.taskId === task.id}
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

      {/* Task Action Modal */}
      <TaskActionModal
        isOpen={!!actionModalTask}
        onClose={() => setActionModalTask(null)}
        taskName={actionModalTask?.name || ''}
        onStartTimer={handleStartTimer}
        onManualTime={handleOpenManualTime}
        onMarkComplete={handleMarkComplete}
      />

      {/* Manual Time Entry Modal */}
      <ManualTimeModal
        isOpen={!!manualTimeTask}
        onClose={() => setManualTimeTask(null)}
        taskName={manualTimeTask?.name || ''}
        onSave={handleSaveManualTime}
      />

      {/* Stop Timer Confirmation Modal */}
      <StopTimerModal
        isOpen={stopTimerModal}
        onClose={() => setStopTimerModal(false)}
        taskName={activeTimer?.taskName || ''}
        timeSpent={getTimerElapsedSeconds()}
        onConfirmComplete={handleConfirmComplete}
        onKeepWorking={handleKeepWorking}
      />

      {/* Floating Timer */}
      {activeTimer && (
        <FloatingTimer
          timer={activeTimer}
          onPause={handlePauseTimer}
          onResume={handleResumeTimer}
          onStop={handleStopTimer}
          isMinimized={timerMinimized}
          onToggleMinimize={() => setTimerMinimized(!timerMinimized)}
        />
      )}

      {/* Time Log Modal */}
      <TimeLogModal
        isOpen={!!timeLogTask}
        onClose={() => setTimeLogTask(null)}
        task={timeLogTask}
        onUpdateEntry={handleUpdateTimeEntry}
        onDeleteEntry={handleDeleteTimeEntry}
      />
    </div>
  );
};

export default MyDayIntegrated;
