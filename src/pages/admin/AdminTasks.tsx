import React, { useState } from 'react';
import { Plus, Search, Filter, Calendar, Clock, User, MoreVertical, Play, Pause, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  linkedProcess?: string;
  estimatedTime: number; // in minutes
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
    linkedProcess: 'Cierre de Caja',
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
    linkedProcess: 'Inventario Semanal',
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

const AdminTasks: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFrequency, setSelectedFrequency] = useState<string>('all');

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

  const TaskCard = ({ task }: { task: Task }) => (
    <div className="kpi-card hover:border-primary/30 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
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

          {task.linkedProcess && (
            <div className="mt-3 pt-3 border-t border-border">
              <span className="text-xs text-muted-foreground">
                Proceso asociado: <span className="text-primary">{task.linkedProcess}</span>
              </span>
            </div>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 rounded hover:bg-secondary">
              <MoreVertical className="w-4 h-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => toast.info('Iniciar temporizador')}>
              <Play className="w-4 h-4 mr-2" />
              Iniciar tiempo
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info('Pausar temporizador')}>
              <Pause className="w-4 h-4 mr-2" />
              Pausar tiempo
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.success('Tarea completada')}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Marcar completada
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

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
        <Button variant="hero" className="gap-2" onClick={() => toast.info('Crear nueva tarea')}>
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
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="daily">Diarias</TabsTrigger>
          <TabsTrigger value="weekly">Semanales</TabsTrigger>
          <TabsTrigger value="monthly">Mensuales</TabsTrigger>
          <TabsTrigger value="annual">Anuales</TabsTrigger>
          <TabsTrigger value="occasional">Ocasionales</TabsTrigger>
        </TabsList>

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
    </div>
  );
};

export default AdminTasks;
