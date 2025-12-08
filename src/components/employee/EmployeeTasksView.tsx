import React, { useState } from 'react';
import { 
  Clock, 
  CheckCircle, 
  Eye, 
  Pencil, 
  Ban, 
  MessageSquare, 
  ChevronDown, 
  ChevronRight,
  AlertCircle,
  Send,
  FileText,
  Play,
  Pause,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

// Shared interfaces - should match AdminTasks
interface ReviewHistoryEntry {
  type: 'correction' | 'rejection' | 'approval';
  reviewerUserId: string;
  reviewerName: string;
  notes: string;
  timestamp: string;
  wasResolved?: boolean;
}

interface TaskAssignment {
  userId: string;
  userName: string;
  instanceLabel?: string;
  status: 'pending' | 'in_progress' | 'pending_review' | 'completed' | 'rejected';
  timeSpentMinutes?: number;
  correctionCount?: number;
  lastReviewNotes?: string;
}

interface EmployeeTask {
  id: string;
  title: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'annual' | 'occasional';
  assignmentType: 'individual' | 'shared';
  assignments: TaskAssignment[];
  linkedProcesses?: { id: string; name: string }[];
  estimatedTime: number;
  dueDate?: string;
  needsReview?: boolean;
  reviewHistory?: ReviewHistoryEntry[];
}

// Mock current user
const currentUserId = 'u1';

// Mock tasks assigned to current employee
const mockEmployeeTasks: EmployeeTask[] = [
  {
    id: '1',
    title: 'Verificar inventario de caja',
    description: 'Contar y registrar el efectivo inicial',
    frequency: 'daily',
    assignmentType: 'individual',
    assignments: [
      { userId: 'u1', userName: 'Carlos López', instanceLabel: 'Caja 1', status: 'completed' },
    ],
    linkedProcesses: [
      { id: 'p1', name: 'Cierre de Caja' },
    ],
    estimatedTime: 10,
  },
  {
    id: '2',
    title: 'Cierre de caja nocturno',
    description: 'Conteo final y cuadre de caja del turno noche',
    frequency: 'daily',
    assignmentType: 'individual',
    needsReview: true,
    assignments: [
      { 
        userId: 'u1', 
        userName: 'Carlos López', 
        status: 'pending_review', 
        timeSpentMinutes: 25,
      },
    ],
    estimatedTime: 20,
  },
  {
    id: '3',
    title: 'Auditoría de productos vencidos',
    description: 'Revisar fechas de vencimiento en góndolas',
    frequency: 'weekly',
    assignmentType: 'individual',
    needsReview: true,
    assignments: [
      { 
        userId: 'u1', 
        userName: 'Carlos López', 
        status: 'in_progress',
        correctionCount: 1,
        lastReviewNotes: 'Faltó revisar la sección de lácteos. Por favor completar esa área.',
      },
    ],
    reviewHistory: [
      {
        type: 'correction',
        reviewerUserId: 'sup1',
        reviewerName: 'María García',
        notes: 'Faltó revisar la sección de lácteos. Por favor completar esa área.',
        timestamp: '2024-01-15T10:30:00Z',
      },
    ],
    estimatedTime: 30,
  },
  {
    id: '4',
    title: 'Reporte de incidencias',
    description: 'Documentar cualquier incidencia del turno',
    frequency: 'daily',
    assignmentType: 'individual',
    needsReview: true,
    assignments: [
      { 
        userId: 'u1', 
        userName: 'Carlos López', 
        status: 'rejected',
        correctionCount: 2,
        lastReviewNotes: 'El reporte no cumple con el formato requerido y falta información crítica. No se puede recuperar, se requiere nuevo reporte.',
      },
    ],
    reviewHistory: [
      {
        type: 'correction',
        reviewerUserId: 'sup1',
        reviewerName: 'María García',
        notes: 'Falta incluir el número de incidencias por categoría.',
        timestamp: '2024-01-14T14:00:00Z',
      },
      {
        type: 'rejection',
        reviewerUserId: 'sup1',
        reviewerName: 'María García',
        notes: 'El reporte no cumple con el formato requerido y falta información crítica. No se puede recuperar, se requiere nuevo reporte.',
        timestamp: '2024-01-15T09:00:00Z',
      },
    ],
    estimatedTime: 15,
  },
  {
    id: '5',
    title: 'Limpieza general de tienda',
    description: 'Limpieza profunda de todas las áreas',
    frequency: 'daily',
    assignmentType: 'shared',
    assignments: [
      { userId: 'u1', userName: 'Carlos López', status: 'in_progress', timeSpentMinutes: 20 },
      { userId: 'u2', userName: 'Ana Martínez', status: 'in_progress', timeSpentMinutes: 15 },
    ],
    estimatedTime: 30,
  },
];

const statusLabels: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Pendiente', color: 'bg-secondary text-muted-foreground', icon: Clock },
  in_progress: { label: 'En progreso', color: 'bg-primary/20 text-primary', icon: Play },
  pending_review: { label: 'En revisión', color: 'bg-warning/20 text-warning', icon: Eye },
  completed: { label: 'Completada', color: 'bg-success/20 text-success', icon: CheckCircle },
  rejected: { label: 'Rechazada', color: 'bg-destructive/20 text-destructive', icon: Ban },
};

const frequencyLabels: Record<string, string> = {
  daily: 'Diaria',
  weekly: 'Semanal',
  monthly: 'Mensual',
  annual: 'Anual',
  occasional: 'Ocasional',
};

const formatTime = (minutes: number) => {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

const EmployeeTasksView: React.FC = () => {
  const [tasks, setTasks] = useState(mockEmployeeTasks);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [activeTimers, setActiveTimers] = useState<Record<string, boolean>>({});
  const [timerSeconds, setTimerSeconds] = useState<Record<string, number>>({});
  const [expandedProcesses, setExpandedProcesses] = useState<Record<string, boolean>>({});

  // Timer effect
  React.useEffect(() => {
    const interval = setInterval(() => {
      setTimerSeconds(prev => {
        const updated = { ...prev };
        Object.keys(activeTimers).forEach(taskId => {
          if (activeTimers[taskId]) {
            updated[taskId] = (updated[taskId] || 0) + 1;
          }
        });
        return updated;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeTimers]);

  const formatTimerTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get my assignment from a task
  const getMyAssignment = (task: EmployeeTask): TaskAssignment | undefined => {
    return task.assignments.find(a => a.userId === currentUserId);
  };

  const toggleTimer = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const myAssignment = getMyAssignment(task);
    if (!myAssignment) return;

    // Start timer and set to in_progress if pending
    if (!activeTimers[taskId] && myAssignment.status === 'pending') {
      setTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            assignments: t.assignments.map(a => 
              a.userId === currentUserId ? { ...a, status: 'in_progress' as const } : a
            )
          };
        }
        return t;
      }));
    }

    setActiveTimers(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const sendForReview = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    if (task.needsReview) {
      setTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            assignments: t.assignments.map(a => 
              a.userId === currentUserId ? { ...a, status: 'pending_review' as const } : a
            )
          };
        }
        return t;
      }));
      setActiveTimers(prev => ({ ...prev, [taskId]: false }));
      toast.info('Tarea enviada para revisión del supervisor');
    } else {
      setTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            assignments: t.assignments.map(a => 
              a.userId === currentUserId ? { ...a, status: 'completed' as const } : a
            )
          };
        }
        return t;
      }));
      setActiveTimers(prev => ({ ...prev, [taskId]: false }));
      toast.success('Tarea completada');
    }
  };

  // Filter only tasks assigned to current user
  const myTasks = tasks.filter(t => t.assignments.some(a => a.userId === currentUserId));

  // Group tasks by status
  const pendingReviewTasks = myTasks.filter(t => getMyAssignment(t)?.status === 'pending_review');
  const correctionTasks = myTasks.filter(t => {
    const a = getMyAssignment(t);
    return a?.status === 'in_progress' && (a.correctionCount || 0) > 0;
  });
  const rejectedTasks = myTasks.filter(t => getMyAssignment(t)?.status === 'rejected');
  const activeTasks = myTasks.filter(t => {
    const a = getMyAssignment(t);
    return a?.status === 'pending' || (a?.status === 'in_progress' && !(a.correctionCount || 0));
  });
  const completedTasks = myTasks.filter(t => getMyAssignment(t)?.status === 'completed');

  const TaskCard = ({ task }: { task: EmployeeTask }) => {
    const myAssignment = getMyAssignment(task);
    if (!myAssignment) return null;

    const status = myAssignment.status;
    const StatusIcon = statusLabels[status]?.icon || Clock;
    const hasCorrections = (myAssignment.correctionCount || 0) > 0;
    const isExpanded = expandedTask === task.id;

    return (
      <div 
        className={cn(
          "mobile-card transition-all",
          status === 'rejected' && "border-destructive/30 bg-destructive/5",
          hasCorrections && status !== 'rejected' && "border-warning/30 bg-warning/5",
        )}
      >
        <div 
          className="cursor-pointer"
          onClick={() => setExpandedTask(isExpanded ? null : task.id)}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1", statusLabels[status].color)}>
                  <StatusIcon className="w-3 h-3" />
                  {statusLabels[status].label}
                </span>
                <span className="text-xs text-muted-foreground">{frequencyLabels[task.frequency]}</span>
                {task.needsReview && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400 flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    Requiere revisión
                  </span>
                )}
                {hasCorrections && status !== 'rejected' && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-warning/20 text-warning flex items-center gap-1">
                    <Pencil className="w-3 h-3" />
                    {myAssignment.correctionCount} corrección(es)
                  </span>
                )}
              </div>
              <h4 className="font-medium text-foreground">{task.title}</h4>
              <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
            </div>
            <ChevronDown className={cn("w-5 h-5 text-muted-foreground transition-transform", isExpanded && "rotate-180")} />
          </div>

          {/* Quick info */}
          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Est: {formatTime(task.estimatedTime)}
            </span>
            {myAssignment.timeSpentMinutes && (
              <span className="flex items-center gap-1 text-primary">
                <Clock className="w-3 h-3" />
                Usado: {formatTime(myAssignment.timeSpentMinutes)}
              </span>
            )}
            {activeTimers[task.id] && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-warning/20 text-warning">
                {formatTimerTime(timerSeconds[task.id] || 0)}
              </span>
            )}
          </div>

          {/* Supervisor notes preview (always visible if has corrections or rejection) */}
          {myAssignment.lastReviewNotes && (
            <div className={cn(
              "mt-3 p-3 rounded-lg text-sm",
              status === 'rejected' 
                ? "bg-destructive/10 border border-destructive/20" 
                : "bg-warning/10 border border-warning/20"
            )}>
              <div className="flex items-start gap-2">
                <MessageSquare className={cn(
                  "w-4 h-4 mt-0.5 flex-shrink-0",
                  status === 'rejected' ? 'text-destructive' : 'text-warning'
                )} />
                <div>
                  <span className={cn(
                    "font-medium text-xs",
                    status === 'rejected' ? 'text-destructive' : 'text-warning'
                  )}>
                    {status === 'rejected' ? 'Motivo de rechazo:' : 'Notas del supervisor:'}
                  </span>
                  <p className="text-foreground mt-1">{myAssignment.lastReviewNotes}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Expanded content */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-border space-y-4">
            {/* Review History */}
            {task.reviewHistory && task.reviewHistory.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-foreground mb-2">Historial de revisiones</h5>
                <div className="space-y-2">
                  {task.reviewHistory.map((entry, idx) => (
                    <div 
                      key={idx} 
                      className={cn(
                        "p-2 rounded-lg text-sm border",
                        entry.type === 'rejection' 
                          ? "bg-destructive/5 border-destructive/20" 
                          : entry.type === 'approval'
                            ? "bg-success/5 border-success/20"
                            : "bg-warning/5 border-warning/20"
                      )}
                    >
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        {entry.type === 'rejection' && <Ban className="w-3 h-3 text-destructive" />}
                        {entry.type === 'correction' && <Pencil className="w-3 h-3 text-warning" />}
                        {entry.type === 'approval' && <CheckCircle className="w-3 h-3 text-success" />}
                        <span className="font-medium">
                          {entry.type === 'rejection' ? 'Rechazada' : entry.type === 'correction' ? 'Corrección solicitada' : 'Aprobada'}
                        </span>
                        <span>por {entry.reviewerName}</span>
                        <span>• {new Date(entry.timestamp).toLocaleDateString()}</span>
                      </div>
                      <p className="text-foreground">{entry.notes}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Linked Processes */}
            {task.linkedProcesses && task.linkedProcesses.length > 0 && (
              <div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedProcesses(prev => ({ ...prev, [task.id]: !prev[task.id] }));
                  }}
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <FileText className="w-4 h-4" />
                  Ver procesos asociados ({task.linkedProcesses.length})
                  <ChevronRight className={cn('w-4 h-4 transition-transform', expandedProcesses[task.id] && 'rotate-90')} />
                </button>
                {expandedProcesses[task.id] && (
                  <div className="mt-2 space-y-1 pl-6 border-l-2 border-primary/20">
                    {task.linkedProcesses.map(process => (
                      <button
                        key={process.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          toast.info(`Abriendo proceso: ${process.name}`);
                        }}
                        className="flex items-center gap-2 text-sm text-foreground hover:text-primary w-full text-left p-2 rounded-lg hover:bg-secondary/50"
                      >
                        <Eye className="w-4 h-4" />
                        {process.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            {status !== 'completed' && status !== 'rejected' && status !== 'pending_review' && (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTimer(task.id);
                  }}
                  className="gap-1"
                >
                  {activeTimers[task.id] ? (
                    <>
                      <Pause className="w-4 h-4 text-warning" />
                      Pausar
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 text-success" />
                      {status === 'pending' ? 'Iniciar' : 'Continuar'}
                    </>
                  )}
                </Button>
                <Button 
                  variant="hero" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    sendForReview(task.id);
                  }}
                  className="gap-1"
                >
                  {task.needsReview ? (
                    <>
                      <Send className="w-4 h-4" />
                      Enviar a revisión
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Completar
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Info for pending_review */}
            {status === 'pending_review' && (
              <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 text-sm">
                <p className="text-warning font-medium flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Esta tarea está siendo revisada por tu supervisor
                </p>
                <p className="text-muted-foreground mt-1">
                  Recibirás una notificación cuando sea aprobada o si necesita correcciones.
                </p>
              </div>
            )}

            {/* Info for rejected */}
            {status === 'rejected' && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm">
                <p className="text-destructive font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Esta tarea fue rechazada y no puede completarse
                </p>
                <p className="text-muted-foreground mt-1">
                  Lee las notas del supervisor para entender qué ocurrió. Este error quedará registrado para análisis.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const TaskSection = ({ title, tasks, emptyMessage, variant }: { 
    title: string; 
    tasks: EmployeeTask[]; 
    emptyMessage: string;
    variant?: 'warning' | 'destructive' | 'default';
  }) => {
    if (tasks.length === 0) return null;
    
    return (
      <div>
        <h3 className={cn(
          "font-semibold mb-3 flex items-center gap-2",
          variant === 'warning' && "text-warning",
          variant === 'destructive' && "text-destructive",
          !variant && "text-foreground"
        )}>
          {variant === 'warning' && <AlertCircle className="w-4 h-4" />}
          {variant === 'destructive' && <Ban className="w-4 h-4" />}
          {title}
          <span className="text-muted-foreground font-normal">({tasks.length})</span>
        </h3>
        <div className="space-y-3">
          {tasks.map(task => <TaskCard key={task.id} task={task} />)}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mis Tareas</h1>
        <p className="text-muted-foreground">Tareas asignadas a ti</p>
      </div>

      {/* Priority sections */}
      <TaskSection 
        title="Requieren corrección" 
        tasks={correctionTasks} 
        emptyMessage="" 
        variant="warning"
      />
      
      <TaskSection 
        title="Rechazadas" 
        tasks={rejectedTasks} 
        emptyMessage="" 
        variant="destructive"
      />

      <TaskSection 
        title="En revisión" 
        tasks={pendingReviewTasks} 
        emptyMessage=""
      />

      <TaskSection 
        title="Tareas activas" 
        tasks={activeTasks} 
        emptyMessage="No tienes tareas pendientes"
      />

      <TaskSection 
        title="Completadas" 
        tasks={completedTasks} 
        emptyMessage=""
      />

      {myTasks.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No tienes tareas asignadas</p>
        </div>
      )}
    </div>
  );
};

export default EmployeeTasksView;
