import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ListTodo, 
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/icons/Logo';
import { Button } from '@/components/ui/button';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Mock data
const mockMyTasks = [
  { id: '1', title: 'Revisar reportes del equipo', status: 'in_progress', dueTime: '10:00' },
  { id: '2', title: 'Aprobar solicitudes pendientes', status: 'pending', dueTime: '12:00' },
  { id: '3', title: 'Reunión de seguimiento', status: 'pending', dueTime: '15:00' },
  { id: '4', title: 'Verificar cumplimiento diario', status: 'completed', dueTime: '09:00' },
];

const mockTeamStats = {
  totalMembers: 8,
  tasksCompleted: 45,
  tasksTotal: 52,
  avgCompliance: 87,
};

const mockTeamMembers = [
  { id: '1', name: 'Carlos López', tasksToday: 5, completed: 4, compliance: 92 },
  { id: '2', name: 'Ana Martínez', tasksToday: 4, completed: 3, compliance: 85 },
  { id: '3', name: 'Pedro Sánchez', tasksToday: 3, completed: 3, compliance: 100 },
  { id: '4', name: 'Luis Ramírez', tasksToday: 6, completed: 4, compliance: 78 },
];

// Supervisor Dashboard Home
const SupervisorHome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mi Panel de Supervisor</h1>
        <p className="text-muted-foreground">Vista general de tu equipo y tareas</p>
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
            <div className="p-2 rounded-lg bg-primary/10">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">4</p>
              <p className="text-sm text-muted-foreground">Mis tareas hoy</p>
            </div>
          </div>
        </div>
      </div>

      {/* My Tasks Today */}
      <div className="kpi-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Mis Tareas de Hoy</h3>
          <Button variant="ghost" size="sm" onClick={() => navigate('/supervisor/my-tasks')}>
            Ver todas
          </Button>
        </div>
        <div className="space-y-2">
          {mockMyTasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  task.status === 'completed' ? 'bg-success' :
                  task.status === 'in_progress' ? 'bg-primary' : 'bg-muted'
                )} />
                <span className="text-foreground">{task.title}</span>
              </div>
              <span className="text-sm text-muted-foreground">{task.dueTime}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Team Overview */}
      <div className="kpi-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Estado del Equipo Hoy</h3>
          <Button variant="ghost" size="sm" onClick={() => navigate('/supervisor/team')}>
            Ver equipo
          </Button>
        </div>
        <div className="space-y-3">
          {mockTeamMembers.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div>
                <p className="font-medium text-foreground">{member.name}</p>
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
        <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate('/employee')}>
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

// My Tasks Page
const MyTasksPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mis Tareas</h1>
        <p className="text-muted-foreground">Gestiona tus tareas personales</p>
      </div>

      <div className="space-y-4">
        {mockMyTasks.map((task) => (
          <div key={task.id} className="kpi-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-3 h-3 rounded-full',
                  task.status === 'completed' ? 'bg-success' :
                  task.status === 'in_progress' ? 'bg-primary' : 'bg-muted'
                )} />
                <div>
                  <p className="font-medium text-foreground">{task.title}</p>
                  <p className="text-sm text-muted-foreground">Vence a las {task.dueTime}</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                {task.status === 'completed' ? 'Completada' : 'Marcar lista'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Team Page
const SupervisorTeamPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mi Equipo</h1>
        <p className="text-muted-foreground">Supervisa las tareas de tu equipo</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockTeamMembers.map((member) => (
          <div key={member.id} className="kpi-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-semibold text-foreground">{member.name}</p>
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
            </div>
          </div>
        ))}
      </div>
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
                <span className="font-medium text-foreground">{member.name}</span>
              </div>
              <span className="font-semibold text-primary">{member.compliance}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Sidebar
const SupervisorSidebar: React.FC<{ collapsed: boolean; onToggle: () => void }> = ({ collapsed, onToggle }) => {
  const navigate = useNavigate();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/supervisor' },
    { icon: ListTodo, label: 'Mis Tareas', path: '/supervisor/my-tasks' },
    { icon: Users, label: 'Mi Equipo', path: '/supervisor/team' },
    { icon: BarChart3, label: 'Desempeño', path: '/supervisor/performance' },
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
              onClick={() => navigate('/employee')}
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
          <h2 className="font-semibold text-foreground">Panel de Supervisor</h2>
          <NotificationBell />
        </header>

        <main className="p-6">
          <Routes>
            <Route index element={<SupervisorHome />} />
            <Route path="my-tasks" element={<MyTasksPage />} />
            <Route path="team" element={<SupervisorTeamPage />} />
            <Route path="performance" element={<PerformancePage />} />
            <Route path="*" element={<SupervisorHome />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default SupervisorDashboard;