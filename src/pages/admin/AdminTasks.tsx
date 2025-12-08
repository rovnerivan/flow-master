import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Filter, Calendar, Clock, User, MoreVertical, Play, Pause, CheckCircle, Square, Link2, ChevronDown, ChevronLeft, ChevronRight, X, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface Task {
  id: string;
  title: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'annual' | 'occasional';
  assignedTo: string[];
  linkedProcesses?: { id: string; name: string }[];
  estimatedTime: number;
  trackedTime?: number;
  status: 'pending' | 'in_progress' | 'completed';
  dueDate?: string;
}

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Verificar inventario de caja',
    description: 'Contar y registrar el efectivo inicial',
    frequency: 'daily',
    assignedTo: ['Carlos López', 'Ana Martínez'],
    linkedProcesses: [
      { id: 'p1', name: 'Cierre de Caja' },
      { id: 'p2', name: 'Apertura de Tienda' },
    ],
    estimatedTime: 10,
    trackedTime: 8,
    status: 'completed',
  },
  {
    id: '2',
    title: 'Revisar stock de productos',
    description: 'Verificar niveles de inventario',
    frequency: 'daily',
    assignedTo: ['María García'],
    linkedProcesses: [{ id: 'p3', name: 'Inventario Semanal' }],
    estimatedTime: 15,
    status: 'pending',
  },
  {
    id: '3',
    title: 'Reporte de ventas semanal',
    description: 'Generar y enviar reporte de ventas',
    frequency: 'weekly',
    assignedTo: ['María García'],
    estimatedTime: 30,
    trackedTime: 25,
    status: 'in_progress',
    dueDate: '2024-01-19',
  },
  {
    id: '4',
    title: 'Auditoría de procesos',
    description: 'Revisar cumplimiento de procesos operativos',
    frequency: 'monthly',
    assignedTo: ['Supervisor'],
    estimatedTime: 120,
    status: 'pending',
    dueDate: '2024-01-31',
  },
  {
    id: '5',
    title: 'Capacitación anual de seguridad',
    description: 'Renovación de certificación de seguridad',
    frequency: 'annual',
    assignedTo: ['Todos'],
    estimatedTime: 240,
    status: 'pending',
    dueDate: '2024-06-15',
  },
  {
    id: '6',
    title: 'Preparar evento especial',
    description: 'Organizar promoción de fin de año',
    frequency: 'occasional',
    assignedTo: ['Carlos López'],
    estimatedTime: 60,
    status: 'pending',
    dueDate: '2024-12-20',
  },
];

const frequencyLabels: Record<string, { label: string; color: string }> = {
  daily: { label: 'Diaria', color: 'bg-primary/20 text-primary' },
  weekly: { label: 'Semanal', color: 'bg-warning/20 text-warning' },
  monthly: { label: 'Mensual', color: 'bg-success/20 text-success' },
  annual: { label: 'Anual', color: 'bg-purple-500/20 text-purple-500' },
  occasional: { label: 'Ocasional', color: 'bg-muted text-muted-foreground' },
};

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendiente', color: 'bg-secondary text-muted-foreground' },
  in_progress: { label: 'En progreso', color: 'bg-primary/20 text-primary' },
  completed: { label: 'Completada', color: 'bg-success/20 text-success' },
};

const formatTime = (minutes: number) => {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

const formatSeconds = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const AdminTasks: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFrequency, setSelectedFrequency] = useState<string>('all');
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeTimers, setActiveTimers] = useState<Record<string, { running: boolean; seconds: number }>>({});
  const [expandedProcess, setExpandedProcess] = useState<string | null>(null);
  const [showProcessViewer, setShowProcessViewer] = useState<{ taskId: string; processId: string; allProcesses: { id: string; name: string }[] } | null>(null);
  const timerRefs = useRef<Record<string, NodeJS.Timeout>>({});

  const filterTasks = (frequency: string) => {
    let filtered = mockTasks;
    if (frequency !== 'all') {
      filtered = filtered.filter((t) => t.frequency === frequency);
    }
    if (searchQuery) {
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  };

  const startTimer = (taskId: string) => {
    setActiveTimers(prev => ({
      ...prev,
      [taskId]: { running: true, seconds: prev[taskId]?.seconds || 0 }
    }));
    
    timerRefs.current[taskId] = setInterval(() => {
      setActiveTimers(prev => ({
        ...prev,
        [taskId]: { ...prev[taskId], seconds: (prev[taskId]?.seconds || 0) + 1 }
      }));
    }, 1000);
    
    toast.success('Temporizador iniciado');
  };

  const pauseTimer = (taskId: string) => {
    if (timerRefs.current[taskId]) {
      clearInterval(timerRefs.current[taskId]);
      delete timerRefs.current[taskId];
    }
    setActiveTimers(prev => ({
      ...prev,
      [taskId]: { ...prev[taskId], running: false }
    }));
    toast.info('Temporizador pausado');
  };

  const completeTask = (taskId: string) => {
    if (timerRefs.current[taskId]) {
      clearInterval(timerRefs.current[taskId]);
      delete timerRefs.current[taskId];
    }
    const timer = activeTimers[taskId];
    const timeSpent = timer ? Math.floor(timer.seconds / 60) : 0;
    toast.success(`Tarea completada. Tiempo registrado: ${formatTime(timeSpent)}`);
    setActiveTimers(prev => {
      const { [taskId]: _, ...rest } = prev;
      return rest;
    });
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setShowEditTaskModal(true);
  };

  const openProcessViewer = (taskId: string, processId: string, allProcesses: { id: string; name: string }[]) => {
    setShowProcessViewer({ taskId, processId, allProcesses });
  };

  useEffect(() => {
    return () => {
      Object.values(timerRefs.current).forEach(clearInterval);
    };
  }, []);

  const TaskCard = ({ task }: { task: Task }) => {
    const timer = activeTimers[task.id];
    const isRunning = timer?.running;
    
    return (
      <div className="kpi-card hover:border-primary/30 transition-colors">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${frequencyLabels[task.frequency].color}`}>
                {frequencyLabels[task.frequency].label}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusLabels[task.status].color}`}>
                {statusLabels[task.status].label}
              </span>
            </div>
            <h4 className="font-medium text-foreground mb-1">{task.title}</h4>
            <p className="text-sm text-muted-foreground mb-3">{task.description}</p>

            <div className="flex flex-wrap gap-4 text-sm">
              <span className="flex items-center gap-1 text-muted-foreground">
                <User className="w-3 h-3" />
                {task.assignedTo.join(', ')}
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-3 h-3" />
                Est: {formatTime(task.estimatedTime)}
                {task.trackedTime !== undefined && (
                  <span className="text-primary ml-1">
                    (Real: {formatTime(task.trackedTime)})
                  </span>
                )}
              </span>
              {task.dueDate && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {task.dueDate}
                </span>
              )}
            </div>

            {/* Timer display */}
            {timer && (
              <div className="mt-3 p-2 rounded-lg bg-primary/10 inline-flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span className="font-mono font-bold text-primary">
                  {formatSeconds(timer.seconds)}
                </span>
                {isRunning && <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
              </div>
            )}

            {/* Linked Processes - Dropdown */}
            {task.linkedProcesses && task.linkedProcesses.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border">
                <div className="relative">
                  <button
                    onClick={() => setExpandedProcess(expandedProcess === task.id ? null : task.id)}
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Link2 className="w-3 h-3" />
                    <span>{task.linkedProcesses.length} proceso(s) asociado(s)</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${expandedProcess === task.id ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {expandedProcess === task.id && (
                    <div className="absolute left-0 top-full mt-1 z-10 w-64 p-2 rounded-lg border border-border bg-card shadow-lg">
                      <p className="text-xs text-muted-foreground mb-2 px-2">Procesos asociados:</p>
                      {task.linkedProcesses.map((proc) => (
                        <button
                          key={proc.id}
                          onClick={() => openProcessViewer(task.id, proc.id, task.linkedProcesses || [])}
                          className="w-full text-left px-3 py-2 text-sm rounded hover:bg-secondary transition-colors"
                        >
                          {proc.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 rounded hover:bg-secondary">
                  <MoreVertical className="w-4 h-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEditTask(task)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Editar tarea
                </DropdownMenuItem>
                {!isRunning ? (
                  <DropdownMenuItem onClick={() => startTimer(task.id)}>
                    <Play className="w-4 h-4 mr-2" />
                    Iniciar tiempo
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => pauseTimer(task.id)}>
                    <Pause className="w-4 h-4 mr-2" />
                    Pausar tiempo
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => completeTask(task.id)}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Marcar completada
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Quick timer buttons */}
            <div className="flex flex-col gap-1">
              {!isRunning ? (
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startTimer(task.id)}>
                  <Play className="w-4 h-4 text-success" />
                </Button>
              ) : (
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => pauseTimer(task.id)}>
                  <Pause className="w-4 h-4 text-warning" />
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => completeTask(task.id)}>
                <CheckCircle className="w-4 h-4 text-primary" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestión de Tareas</h1>
          <p className="text-muted-foreground">
            Administra tareas por frecuencia y asignación
          </p>
        </div>
        <Button variant="hero" className="gap-2" onClick={() => setShowNewTaskModal(true)}>
          <Plus className="w-4 h-4" />
          Nueva Tarea
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar tareas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs by Frequency */}
      <Tabs defaultValue="all" onValueChange={setSelectedFrequency}>
        <div className="overflow-x-auto -mx-4 px-4">
          <TabsList className="inline-flex w-auto min-w-full sm:grid sm:grid-cols-6">
            <TabsTrigger value="all" className="whitespace-nowrap">Todas</TabsTrigger>
            <TabsTrigger value="daily" className="whitespace-nowrap">Diarias</TabsTrigger>
            <TabsTrigger value="weekly" className="whitespace-nowrap">Semanales</TabsTrigger>
            <TabsTrigger value="monthly" className="whitespace-nowrap">Mensuales</TabsTrigger>
            <TabsTrigger value="annual" className="whitespace-nowrap">Anuales</TabsTrigger>
            <TabsTrigger value="occasional" className="whitespace-nowrap">Ocasionales</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="mt-6">
          <div className="space-y-4">
            {filterTasks('all').map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </TabsContent>

        {['daily', 'weekly', 'monthly', 'annual', 'occasional'].map((freq) => (
          <TabsContent key={freq} value={freq} className="mt-6">
            <div className="space-y-4">
              {filterTasks(freq).map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
              {filterTasks(freq).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No hay tareas {frequencyLabels[freq].label.toLowerCase()}s
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* New Task Modal */}
      <NewTaskModal open={showNewTaskModal} onClose={() => setShowNewTaskModal(false)} />

      {/* Edit Task Modal */}
      {selectedTask && (
        <EditTaskModal 
          open={showEditTaskModal} 
          task={selectedTask}
          onClose={() => {
            setShowEditTaskModal(false);
            setSelectedTask(null);
          }} 
        />
      )}

      {/* Process Viewer Overlay */}
      {showProcessViewer && (
        <ProcessViewerOverlay
          taskId={showProcessViewer.taskId}
          processId={showProcessViewer.processId}
          allProcesses={showProcessViewer.allProcesses}
          onClose={() => setShowProcessViewer(null)}
          onSwitchProcess={(newProcessId) => setShowProcessViewer({ ...showProcessViewer, processId: newProcessId })}
        />
      )}
    </div>
  );
};

// New Task Modal
const NewTaskModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    frequency: 'daily',
    estimatedTime: '15',
    assignedTo: '',
    dueDate: '',
  });

  if (!open) return null;

  const handleSubmit = () => {
    if (!formData.title) {
      toast.error('El título es requerido');
      return;
    }
    toast.success('Tarea creada exitosamente');
    onClose();
    setFormData({ title: '', description: '', frequency: 'daily', estimatedTime: '15', assignedTo: '', dueDate: '' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg mx-4 bg-card border border-border rounded-2xl shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Nueva Tarea</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-2">
            <label className="text-sm font-medium">Título *</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Título de la tarea"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Descripción</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descripción de la tarea"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Frecuencia</label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="daily">Diaria</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensual</option>
                <option value="annual">Anual</option>
                <option value="occasional">Ocasional</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tiempo estimado (min)</label>
              <Input
                type="number"
                value={formData.estimatedTime}
                onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Asignar a</label>
            <Input
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              placeholder="Nombres separados por coma"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Fecha límite</label>
            <Input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
          </div>
        </div>

        <div className="p-6 border-t border-border flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button variant="hero" onClick={handleSubmit} className="flex-1">Crear Tarea</Button>
        </div>
      </div>
    </div>
  );
};

// Edit Task Modal
const EditTaskModal: React.FC<{ open: boolean; task: Task; onClose: () => void }> = ({ open, task, onClose }) => {
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description,
    frequency: task.frequency as string,
    estimatedTime: task.estimatedTime.toString(),
    assignedTo: task.assignedTo.join(', '),
    dueDate: task.dueDate || '',
  });

  if (!open) return null;

  const handleSubmit = () => {
    if (!formData.title) {
      toast.error('El título es requerido');
      return;
    }
    toast.success('Tarea actualizada. Se notificará a los involucrados.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg mx-4 bg-card border border-border rounded-2xl shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Editar Tarea</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-2">
            <label className="text-sm font-medium">Título *</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Descripción</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Frecuencia</label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="daily">Diaria</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensual</option>
                <option value="annual">Anual</option>
                <option value="occasional">Ocasional</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tiempo estimado (min)</label>
              <Input
                type="number"
                value={formData.estimatedTime}
                onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Asignar a</label>
            <Input
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Fecha límite</label>
            <Input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
          </div>
        </div>

        <div className="p-6 border-t border-border flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button variant="hero" onClick={handleSubmit} className="flex-1">Guardar Cambios</Button>
        </div>
      </div>
    </div>
  );
};

// Process Viewer Overlay (dentro de tareas) - Full featured
const ProcessViewerOverlay: React.FC<{ taskId: string; processId: string; allProcesses: { id: string; name: string }[]; onClose: () => void; onSwitchProcess: (processId: string) => void }> = ({ taskId, processId, allProcesses, onClose, onSwitchProcess }) => {
  const [view, setView] = useState<'list' | 'detail'>('detail');
  const [currentStep, setCurrentStep] = useState(0);
  
  const mockProcessDetail = {
    id: processId,
    name: allProcesses.find(p => p.id === processId)?.name || 'Proceso',
    description: 'Este proceso define los pasos correctos para completar esta tarea.',
    steps: [
      { id: 's1', number: 1, title: 'Paso inicial', description: 'Descripción del paso inicial.', duration: '2 min' },
      { id: 's2', number: 2, title: 'Verificación', description: 'Verifica que todo esté correcto.', duration: '3 min' },
      { id: 's3', number: 3, title: 'Ejecución', description: 'Ejecuta la acción principal.', duration: '5 min' },
      { id: 's4', number: 4, title: 'Cierre', description: 'Finaliza y registra.', duration: '2 min' },
    ],
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Header with task context */}
      <header className="flex items-center justify-between p-4 border-b border-border shrink-0">
        <div className="flex items-center gap-4">
          {view === 'detail' && allProcesses.length > 1 && (
            <Button variant="ghost" size="sm" onClick={() => setView('list')} className="gap-1">
              <ChevronLeft className="w-4 h-4" />
              Ver procesos
            </Button>
          )}
          <div>
            <p className="text-xs text-muted-foreground">Viendo proceso de la tarea</p>
            <h1 className="font-semibold text-foreground">{mockProcessDetail.name}</h1>
          </div>
        </div>
        <Button variant="outline" onClick={onClose}>
          Cerrar proceso
        </Button>
      </header>

      {view === 'list' ? (
        // List of associated processes
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-bold mb-4">Procesos Asociados a esta Tarea</h2>
            <div className="space-y-3">
              {allProcesses.map((proc) => (
                <button
                  key={proc.id}
                  onClick={() => { onSwitchProcess(proc.id); setView('detail'); }}
                  className={cn(
                    'w-full text-left p-4 rounded-lg border transition-colors',
                    proc.id === processId ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  )}
                >
                  <p className="font-medium text-foreground">{proc.name}</p>
                  {proc.id === processId && <span className="text-xs text-primary">Viendo actualmente</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        // Process detail view
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center">
              <p className="text-muted-foreground">Diagrama del proceso</p>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold mb-2">{mockProcessDetail.name}</h2>
              <p className="text-muted-foreground">{mockProcessDetail.description}</p>
            </div>

            <div className="space-y-2">
              {mockProcessDetail.steps.map((step, index) => (
                <div 
                  key={step.id} 
                  className={cn(
                    'p-4 rounded-lg border transition-colors cursor-pointer',
                    index === currentStep ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
                  )}
                  onClick={() => setCurrentStep(index)}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                      {step.number}
                    </span>
                    <div className="flex-1">
                      <span className="text-foreground font-medium">{step.title}</span>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{step.duration}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-4 border-t border-border">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Paso anterior
              </Button>
              <Button 
                variant="hero" 
                onClick={() => setCurrentStep(Math.min(mockProcessDetail.steps.length - 1, currentStep + 1))}
                disabled={currentStep === mockProcessDetail.steps.length - 1}
              >
                Siguiente
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTasks;