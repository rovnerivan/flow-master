import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
  Building2,
  Users,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Activity,
  MessageCircle,
} from 'lucide-react';
import { Logo } from '@/components/icons/Logo';
import { KPICard } from '@/components/dashboard/KPICard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import SuperAdminCompanies from './SuperAdminCompanies';
import SuperAdminUsers from './SuperAdminUsers';

// Mock data for companies/teams
const mockCompanies = [
  {
    id: '1',
    name: 'Empresa Demo S.A.',
    employees: 24,
    processes: 12,
    compliance: 87,
    plan: 'Pro',
    status: 'active',
    createdAt: '2024-01-05',
  },
  {
    id: '2',
    name: 'Tech Solutions',
    employees: 45,
    processes: 28,
    compliance: 92,
    plan: 'Enterprise',
    status: 'active',
    createdAt: '2024-01-10',
  },
  {
    id: '3',
    name: 'Retail Corp',
    employees: 18,
    processes: 8,
    compliance: 75,
    plan: 'Basic',
    status: 'active',
    createdAt: '2024-01-12',
  },
];

const SuperAdminHome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Panel de Control SaaS</h1>
        <p className="text-muted-foreground">
          Vista general de todas las empresas y métricas del sistema
        </p>
      </div>

      {/* Global KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Empresas Activas"
          value={mockCompanies.length.toString()}
          subtitle="total registradas"
          icon={Building2}
          trend={{ value: 2, isPositive: true }}
        />
        <KPICard
          title="Usuarios Totales"
          value="87"
          subtitle="en todas las empresas"
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
        <KPICard
          title="Ingresos Mensuales"
          value="$4,250"
          subtitle="MRR actual"
          icon={DollarSign}
          trend={{ value: 18, isPositive: true }}
          variant="success"
        />
        <KPICard
          title="Salud del Sistema"
          value="99.9%"
          subtitle="uptime este mes"
          icon={Activity}
          trend={{ value: 0.1, isPositive: true }}
        />
      </div>

      {/* Companies Table */}
      <div className="kpi-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">
            Empresas Registradas
          </h2>
          <Button variant="outline" size="sm">
            Exportar
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Empresa</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Plan</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Empleados</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Procesos</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Cumplimiento</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Estado</th>
              </tr>
            </thead>
            <tbody>
              {mockCompanies.map((company) => (
                <tr
                  key={company.id}
                  className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors cursor-pointer"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{company.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Desde {company.createdAt}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium',
                      company.plan === 'Enterprise' && 'bg-purple-500/20 text-purple-500',
                      company.plan === 'Pro' && 'bg-primary/20 text-primary',
                      company.plan === 'Basic' && 'bg-secondary text-muted-foreground'
                    )}>
                      {company.plan}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-foreground">{company.employees}</td>
                  <td className="py-3 px-4 text-sm text-foreground">{company.processes}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${company.compliance}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-foreground">{company.compliance}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-success/20 text-success">
                      Activo
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Alerts */}
      <div className="kpi-card">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Alertas del Sistema
        </h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-warning/10 border border-warning/20">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                Retail Corp tiene bajo cumplimiento (75%)
              </p>
              <p className="text-xs text-muted-foreground">Hace 2 horas</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
            <TrendingUp className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                Tech Solutions alcanzó 92% de cumplimiento
              </p>
              <p className="text-xs text-muted-foreground">Hace 1 día</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SuperAdminSidebar: React.FC<{ collapsed: boolean; onToggle: () => void }> = ({
  collapsed,
  onToggle,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: BarChart3, label: 'Dashboard', path: '/superadmin' },
    { icon: Building2, label: 'Empresas', path: '/superadmin/companies' },
    { icon: Users, label: 'Usuarios', path: '/superadmin/users' },
    { icon: Activity, label: 'Sistema', path: '/superadmin/system' },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/superadmin') return location.pathname === '/superadmin';
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 z-40',
        collapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
              SUPER
            </span>
          </div>
        )}
        <Button variant="ghost" size="icon" onClick={onToggle} className="shrink-0 ml-auto">
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map(({ icon: Icon, label, path }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all',
                collapsed && 'justify-center',
                isActive(path) && 'bg-sidebar-accent text-sidebar-primary font-medium'
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="text-sm">{label}</span>}
            </button>
          ))}
        </div>
      </nav>

      <div className="p-3 border-t border-sidebar-border space-y-1">
        <button
          onClick={() => navigate('/superadmin/settings')}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-sidebar-foreground/70 hover:bg-sidebar-accent transition-all',
            collapsed && 'justify-center'
          )}
        >
          <Settings className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="text-sm">Configuración</span>}
        </button>
        <button
          onClick={handleLogout}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-destructive/70 hover:bg-destructive/10 hover:text-destructive transition-all',
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

const SuperAdminDashboard: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      <SuperAdminSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <main
        className={cn(
          'flex-1 p-6 lg:p-8 transition-all duration-300',
          sidebarCollapsed ? 'ml-[72px]' : 'ml-64'
        )}
      >
        <Routes>
          <Route path="/" element={<SuperAdminHome />} />
          <Route path="/companies" element={<SuperAdminCompanies />} />
          <Route path="/users" element={<SuperAdminUsers />} />
          <Route path="/system" element={<div className="text-foreground">Estado del Sistema (próximamente)</div>} />
          <Route path="/settings" element={<div className="text-foreground">Configuración SuperAdmin (próximamente)</div>} />
        </Routes>

        <button
          onClick={() => toast.info('Soporte próximamente')}
          className="fixed bottom-6 right-6 p-4 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:scale-105 z-40"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      </main>
    </div>
  );
};

export default SuperAdminDashboard;
