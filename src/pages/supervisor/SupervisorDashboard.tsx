import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BarChart3,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Settings,
  LogOut,
  Shield,
  Play,
  Pause,
  MoreVertical,
  Edit,
  Briefcase,
  User,
  Plus,
  Search,
  Filter,
  Eye,
  Trash2,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/icons/Logo';
import { Button } from '@/components/ui/button';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ProcessCreatorModal } from '@/components/admin/ProcessCreatorModal';
import { ProcessEditorModal } from '@/components/admin/ProcessEditorModal';
import { ProcessViewerModal } from '@/components/employee/ProcessViewerModal';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Mock data
const mockSupervisor = {
  name: 'María García',
  cargo: 'Supervisora de Operaciones',
  team: 'Equipo Ventas Norte',
};

const mockTeamTasks = [
  { id: '1', title: 'Verificar inventario de caja', assignedTo: 'Carlos López', status: 'completed', dueTime: '10:00' },
  { id: '2', title: 'Revisar stock de productos', assignedTo: 'Ana Martínez', status: 'in_progress', dueTime: '11:00' },
  { id: '3', title: 'Limpieza área de ventas', assignedTo: 'Pedro Sánchez', status: 'pending', dueTime: '12:00' },
  { id: '4', title: 'Atender cliente especial', assignedTo: 'Luis Ramírez', status: 'pending', dueTime: '14:00' },
  { id: '5', title: 'Reporte de incidencias', assignedTo: 'Carlos López', status: 'in_progress', dueTime: '16:00' },
];

const mockTeamStats = {
  totalMembers: 8,
  tasksCompleted: 45,
  tasksTotal: 52,
  avgCompliance: 87,
};

const mockTeamMembers = [
  { id: '1', name: 'Carlos López', cargo: 'Operador de Caja', tasksToday: 5, completed: 4, compliance: 92 },
  { id: '2', name: 'Ana Martínez', cargo: 'Vendedora', tasksToday: 4, completed: 3, compliance: 85 },
  { id: '3', name: 'Pedro Sánchez', cargo: 'Almacenista', tasksToday: 3, completed: 3, compliance: 100 },
  { id: '4', name: 'Luis Ramírez', cargo: 'Vendedor', tasksToday: 6, completed: 4, compliance: 78 },
];

// Mock processes
const mockProcesses = [
  {
    id: '1',
    name: 'Preparación de Pedidos',
    description: 'Proceso completo para preparar y empacar pedidos',
    steps: 8,
    compliance: 92,
    status: 'published' as const,
    lastUpdated: '2024-01-15',
  },
  {
    id: '2',
    name: 'Atención al Cliente',
    description: 'Protocolo de atención y resolución de consultas',
    steps: 5,
    compliance: 78,
    status: 'published' as const,
    lastUpdated: '2024-01-10',
  },
  {
    id: '3',
    name: 'Cierre de Caja',
    description: 'Procedimiento para el cierre diario de caja',
    steps: 6,
    compliance: 95,
    status: 'published' as const,
    lastUpdated: '2024-01-08',
  },
  {
    id: '4',
    name: 'Inventario Semanal',
    description: 'Control y registro de inventario',
    steps: 10,
    compliance: 65,
    status: 'draft' as const,
    lastUpdated: '2024-01-05',
  },
];

// Supervisor Dashboard Home
const SupervisorHome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">¡Hola, {mockSupervisor.name}!</h1>
        <p className="text-primary font-medium">{mockSupervisor.cargo}</p>
        <p className="text-muted-foreground text-sm mt-1">Vista general de tu equipo</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kpi-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{mockTeamStats.totalMembers}</p>
              <p className="text-sm text-muted-foreground">Mi equipo</p>
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{mockTeamStats.tasksCompleted}/{mockTeamStats.tasksTotal}</p>
              <p className="text-sm text-muted-foreground">Tareas hoy</p>
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10">
              <BarChart3 className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{mockTeamStats.avgCompliance}%</p>
              <p className="text-sm text-muted-foreground">Cumplimiento</p>
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">2</p>
              <p className="text-sm text-muted-foreground">Alertas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Tasks Today */}
      <div className="kpi-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Tareas del Equipo Hoy</h3>
          <Button variant="ghost" size="sm" onClick={() => navigate('/supervisor/team-tasks')}>
            Ver todas
          </Button>
        </div>
        <div className="space-y-2">
          {mockTeamTasks.slice(0, 5).map((task) => (
            <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  task.status === 'completed' ? 'bg-success' :
                  task.status === 'in_progress' ? 'bg-primary' : 'bg-muted'
                )} />
                <div>
                  <span className="text-foreground">{task.title}</span>
                  <p className="text-xs text-muted-foreground">{task.assignedTo}</p>
                </div>
              </div>
              <span className="text-sm text-muted-foreground">{task.dueTime}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Team Overview */}
      <div className="kpi-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Estado del Equipo</h3>
          <Button variant="ghost" size="sm" onClick={() => navigate('/supervisor/team')}>
            Ver equipo
          </Button>
        </div>
        <div className="space-y-3">
          {mockTeamMembers.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div>
                <p className="font-medium text-foreground">{member.name}</p>
                <p className="text-xs text-muted-foreground">{member.cargo}</p>
                <p className="text-sm text-muted-foreground">
                  {member.completed}/{member.tasksToday} tareas
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-16 h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${member.compliance}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-foreground w-10">{member.compliance}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate('/employee', { state: { fromSupervisor: true } })}>
          <LayoutDashboard className="w-5 h-5" />
          <span>Mi Vista Colaborador</span>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate('/supervisor/performance')}>
          <BarChart3 className="w-5 h-5" />
          <span>Ver Desempeño</span>
        </Button>
      </div>
    </div>
  );
};

// Team Tasks Page - Gestión de tareas del equipo
const TeamTasksPage: React.FC = () => {
  const [activeTimers, setActiveTimers] = useState<Record<string, boolean>>({});

  const toggleTimer = (taskId: string) => {
    setActiveTimers(prev => ({ ...prev, [taskId]: !prev[taskId] }));
    toast.success(activeTimers[taskId] ? 'Temporizador pausado' : 'Temporizador iniciado');
  };

  const markComplete = (taskId: string) => {
    toast.success('Tarea marcada como completada');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Tareas del Equipo</h1>
        <p className="text-muted-foreground">Gestiona y supervisa las tareas de tu equipo</p>
      </div>

      <div className="space-y-4">
        {mockTeamTasks.map((task) => (
          <div key={task.id} className="kpi-card">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={cn(
                    'px-2 py-0.5 rounded-full text-xs font-medium',
                    task.status === 'completed' ? 'bg-success/20 text-success' :
                    task.status === 'in_progress' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                  )}>
                    {task.status === 'completed' ? 'Completada' : task.status === 'in_progress' ? 'En progreso' : 'Pendiente'}
                  </span>
                </div>
                <h4 className="font-medium text-foreground">{task.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">Asignado a: {task.assignedTo}</p>
                <p className="text-sm text-muted-foreground">Vence: {task.dueTime}</p>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => toggleTimer(task.id)}
                  className="h-8 w-8"
                >
                  {activeTimers[task.id] ? (
                    <Pause className="w-4 h-4 text-warning" />
                  ) : (
                    <Play className="w-4 h-4 text-success" />
                  )}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => markComplete(task.id)}
                  className="h-8 w-8"
                >
                  <CheckCircle className="w-4 h-4 text-primary" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-card border border-border">
                    <DropdownMenuItem>
                      <Edit className="w-4 h-4 mr-2" />
                      Editar tarea
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Calendar className="w-4 h-4 mr-2" />
                      Ver historial
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <User className="w-4 h-4 mr-2" />
                      Reasignar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Team Page
const SupervisorTeamPage: React.FC = () => {
  const [showCargoModal, setShowCargoModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<typeof mockTeamMembers[0] | null>(null);

  const openCargoModal = (member: typeof mockTeamMembers[0]) => {
    setSelectedMember(member);
    setShowCargoModal(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mi Equipo</h1>
        <p className="text-muted-foreground">Supervisa y gestiona a tu equipo</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockTeamMembers.map((member) => (
          <div key={member.id} className="kpi-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-semibold text-foreground">{member.name}</p>
                <p className="text-sm text-primary">{member.cargo}</p>
                <p className="text-sm text-muted-foreground">
                  {member.completed}/{member.tasksToday} tareas completadas
                </p>
              </div>
              <span className={cn(
                'px-2 py-1 rounded-full text-xs font-medium',
                member.compliance >= 90 ? 'bg-success/20 text-success' :
                member.compliance >= 70 ? 'bg-warning/20 text-warning' : 'bg-destructive/20 text-destructive'
              )}>
                {member.compliance}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${(member.completed / member.tasksToday) * 100}%` }}
              />
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">Ver tareas</Button>
              <Button variant="outline" size="sm" className="flex-1">Historial</Button>
              <Button variant="outline" size="sm" onClick={() => openCargoModal(member)}>
                <Briefcase className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Cargo Modal */}
      {showCargoModal && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowCargoModal(false)} />
          <div className="relative w-full max-w-lg mx-4 bg-card border border-border rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Editar Cargo</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Empleado</label>
                <p className="text-foreground">{selectedMember.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Cargo actual</label>
                <input 
                  type="text" 
                  defaultValue={selectedMember.cargo}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Descripción del cargo</label>
                <textarea 
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background"
                  rows={3}
                  placeholder="Describe las responsabilidades..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowCargoModal(false)} className="flex-1">Cancelar</Button>
              <Button variant="hero" onClick={() => { toast.success('Cargo actualizado'); setShowCargoModal(false); }} className="flex-1">Guardar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Performance Page
const PerformancePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Desempeño del Equipo</h1>
        <p className="text-muted-foreground">Métricas y KPIs de tu equipo</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="kpi-card">
          <p className="text-sm text-muted-foreground">Cumplimiento Promedio</p>
          <p className="text-3xl font-bold text-foreground">87%</p>
        </div>
        <div className="kpi-card">
          <p className="text-sm text-muted-foreground">Errores Esta Semana</p>
          <p className="text-3xl font-bold text-foreground">3</p>
        </div>
        <div className="kpi-card">
          <p className="text-sm text-muted-foreground">Tareas Completadas</p>
          <p className="text-3xl font-bold text-foreground">156</p>
        </div>
        <div className="kpi-card">
          <p className="text-sm text-muted-foreground">Tiempo Promedio</p>
          <p className="text-3xl font-bold text-foreground">23min</p>
        </div>
      </div>

      <div className="kpi-card">
        <h3 className="font-semibold text-foreground mb-4">Ranking del Equipo</h3>
        <div className="space-y-3">
          {mockTeamMembers.sort((a, b) => b.compliance - a.compliance).map((member, index) => (
            <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
              <div className="flex items-center gap-3">
                <span className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold',
                  index === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                  index === 1 ? 'bg-gray-400/20 text-gray-400' :
                  index === 2 ? 'bg-orange-500/20 text-orange-500' : 'bg-muted text-muted-foreground'
                )}>
                  {index + 1}
                </span>
                <div>
                  <span className="font-medium text-foreground">{member.name}</span>
                  <p className="text-xs text-muted-foreground">{member.cargo}</p>
                </div>
              </div>
              <span className="font-semibold text-primary">{member.compliance}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Mi Cargo Page
const MyCargoPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mi Cargo</h1>
        <p className="text-muted-foreground">Información sobre tu rol y responsabilidades</p>
      </div>

      <div className="kpi-card">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Briefcase className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{mockSupervisor.cargo}</h2>
            <p className="text-muted-foreground">{mockSupervisor.team}</p>
          </div>
        </div>
      </div>

      <div className="kpi-card">
        <h3 className="font-semibold text-foreground mb-3">Descripción del Cargo</h3>
        <p className="text-muted-foreground">
          Responsable de supervisar y coordinar las actividades del equipo de ventas, 
          asegurando el cumplimiento de los procesos operativos y metas establecidas.
        </p>
      </div>

      <div className="kpi-card">
        <h3 className="font-semibold text-foreground mb-3">Responsabilidades Principales</h3>
        <ul className="space-y-2">
          <li className="flex items-center gap-2 text-muted-foreground">
            <CheckCircle className="w-4 h-4 text-success" />
            Supervisar tareas diarias del equipo
          </li>
          <li className="flex items-center gap-2 text-muted-foreground">
            <CheckCircle className="w-4 h-4 text-success" />
            Revisar y aprobar reportes
          </li>
          <li className="flex items-center gap-2 text-muted-foreground">
            <CheckCircle className="w-4 h-4 text-success" />
            Capacitar nuevos empleados
          </li>
          <li className="flex items-center gap-2 text-muted-foreground">
            <CheckCircle className="w-4 h-4 text-success" />
            Gestionar incidencias
          </li>
        </ul>
      </div>

      <div className="kpi-card">
        <h3 className="font-semibold text-foreground mb-3">Organigrama</h3>
        <div className="space-y-3">
          <div className="p-3 rounded-lg border border-border">
            <p className="text-xs text-muted-foreground">Reporto a:</p>
            <p className="font-medium text-foreground">Director de Operaciones</p>
          </div>
          <div className="p-3 rounded-lg border border-border">
            <p className="text-xs text-muted-foreground">Equipo a mi cargo:</p>
            <p className="font-medium text-foreground">{mockTeamStats.totalMembers} colaboradores</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Processes Page
const ProcessesPage: React.FC = () => {
  const [showCreator, setShowCreator] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProcess, setSelectedProcess] = useState<typeof mockProcesses[0] | null>(null);
  const [showViewer, setShowViewer] = useState(false);
  const [showEditor, setShowEditor] = useState(false);

  const filteredProcesses = mockProcesses.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewProcess = (process: typeof mockProcesses[0]) => {
    setSelectedProcess(process);
    setShowViewer(true);
  };

  const handleEditProcess = (process: typeof mockProcesses[0]) => {
    setSelectedProcess(process);
    setShowEditor(true);
  };

  const handleDeleteProcess = (process: typeof mockProcesses[0]) => {
    toast.success(`Proceso "${process.name}" eliminado`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Procesos</h1>
          <p className="text-muted-foreground">
            Gestiona y crea nuevos procesos de capacitación
          </p>
        </div>
        <Button variant="hero" className="gap-2" onClick={() => setShowCreator(true)}>
          <Plus className="w-4 h-4" />
          Nuevo Proceso
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar procesos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Filtrar
        </Button>
      </div>

      {/* Processes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProcesses.map((process) => (
          <div
            key={process.id}
            className="kpi-card hover:border-primary/30 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-foreground">{process.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {process.description}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1 rounded hover:bg-secondary">
                    <MoreVertical className="w-4 h-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card border border-border">
                  <DropdownMenuItem onClick={() => handleViewProcess(process)}>
                    <Eye className="w-4 h-4 mr-2" />
                    Ver proceso
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleEditProcess(process)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={() => handleDeleteProcess(process)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">
                {process.steps} pasos
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  process.status === 'published'
                    ? 'bg-success/20 text-success'
                    : 'bg-warning/20 text-warning'
                }`}
              >
                {process.status === 'published' ? 'Publicado' : 'Borrador'}
              </span>
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Cumplimiento</span>
                <span className="font-semibold text-foreground">
                  {process.compliance}%
                </span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${process.compliance}%` }}
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-4 flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 gap-1"
                onClick={() => handleViewProcess(process)}
              >
                <Eye className="w-3 h-3" />
                Ver
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 gap-1"
                onClick={() => handleEditProcess(process)}
              >
                <Edit className="w-3 h-3" />
                Editar
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Process Creator Modal */}
      <ProcessCreatorModal
        open={showCreator}
        onClose={() => setShowCreator(false)}
      />

      {/* Process Viewer Modal */}
      {showViewer && selectedProcess && (
        <ProcessViewerModal 
          processId={selectedProcess.id}
          onClose={() => {
            setShowViewer(false);
            setSelectedProcess(null);
          }}
        />
      )}

      {/* Process Editor Modal */}
      {showEditor && selectedProcess && (
        <ProcessEditorModal
          process={selectedProcess}
          onClose={() => {
            setShowEditor(false);
            setSelectedProcess(null);
          }}
          onSave={(updatedProcess) => {
            toast.success(`Proceso "${updatedProcess.name}" actualizado`);
            setShowEditor(false);
            setSelectedProcess(null);
          }}
        />
      )}
    </div>
  );
};

// Sidebar
const SupervisorSidebar: React.FC<{ collapsed: boolean; onToggle: () => void }> = ({ collapsed, onToggle }) => {
  const navigate = useNavigate();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/supervisor' },
    { icon: FileText, label: 'Procesos', path: '/supervisor/processes' },
    { icon: Calendar, label: 'Tareas del Equipo', path: '/supervisor/team-tasks' },
    { icon: Users, label: 'Mi Equipo', path: '/supervisor/team' },
    { icon: BarChart3, label: 'Desempeño', path: '/supervisor/performance' },
    { icon: Briefcase, label: 'Mi Cargo', path: '/supervisor/my-cargo' },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Sesión cerrada');
    navigate('/login');
  };

  return (
    <aside className={cn(
      'fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 z-40',
      collapsed ? 'w-[72px]' : 'w-64'
    )}>
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        {!collapsed && <Logo size="sm" />}
        <Button variant="ghost" size="icon" onClick={onToggle} className="ml-auto">
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {!collapsed && (
        <div className="px-4 py-2 border-b border-sidebar-border">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-warning/10">
            <Shield className="w-4 h-4 text-warning" />
            <span className="text-sm font-medium text-warning">Supervisor</span>
          </div>
        </div>
      )}

      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map(({ icon: Icon, label, path }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-sidebar-foreground/70 hover:bg-sidebar-accent transition-colors',
                collapsed && 'justify-center'
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="text-sm">{label}</span>}
            </button>
          ))}
        </div>

        {!collapsed && (
          <div className="mt-6 pt-4 border-t border-sidebar-border">
            <p className="text-xs text-sidebar-foreground/50 px-3 mb-2">Vista Colaborador</p>
            <button
              onClick={() => navigate('/employee', { state: { fromSupervisor: true } })}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-sidebar-foreground/70 hover:bg-sidebar-accent"
            >
              <LayoutDashboard className="w-5 h-5 shrink-0" />
              <span className="text-sm">Mi Espacio</span>
            </button>
          </div>
        )}
      </nav>

      <div className="p-3 border-t border-sidebar-border space-y-1">
        <button
          onClick={() => navigate('/supervisor/settings')}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-sidebar-foreground/70 hover:bg-sidebar-accent',
            collapsed && 'justify-center'
          )}
        >
          <Settings className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="text-sm">Configuración</span>}
        </button>
        <button
          onClick={handleLogout}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-destructive/70 hover:bg-destructive/10 w-full',
            collapsed && 'justify-center'
          )}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="text-sm">Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
};

// Main Supervisor Dashboard
const SupervisorDashboard: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <SupervisorSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />

      <div className={cn(
        'transition-all duration-300',
        sidebarCollapsed ? 'ml-[72px]' : 'ml-64'
      )}>
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card sticky top-0 z-30">
          <div>
            <h2 className="font-semibold text-foreground">Panel de Supervisor</h2>
          </div>
          <NotificationBell />
        </header>

        <main className="p-6">
          <Routes>
            <Route index element={<SupervisorHome />} />
            <Route path="processes" element={<ProcessesPage />} />
            <Route path="team-tasks" element={<TeamTasksPage />} />
            <Route path="team" element={<SupervisorTeamPage />} />
            <Route path="performance" element={<PerformancePage />} />
            <Route path="my-cargo" element={<MyCargoPage />} />
            <Route path="*" element={<SupervisorHome />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default SupervisorDashboard;