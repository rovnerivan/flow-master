import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import {
  Users,
  AlertTriangle,
  Clock,
  TrendingUp,
  Copy,
  Check,
  Plus,
  UserPlus,
  LayoutDashboard,
  Layers,
  ListTodo,
  Network,
  Heart,
  BarChart3,
  FileText,
  Crown,
  Compass,
  Bell,
} from 'lucide-react';
import { KPICard } from '@/components/dashboard/KPICard';
import { ProcessHealthCard } from '@/components/dashboard/ProcessHealthCard';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

// Import admin pages (reused for owner)
import AdminProcesses from '../admin/AdminProcesses';
import AdminTeam from '../admin/AdminTeam';
import AdminAnalytics from '../admin/AdminAnalytics';
import AdminReports from '../admin/AdminReports';
import AdminSettings from '../admin/AdminSettings';
import AdminErrors from '../admin/AdminErrors';
import AdminOnboardings from '../admin/AdminOnboardings';
import AdminTasksRefactored from '@/components/tasks/AdminTasksRefactored';
import AdminHierarchy from '../admin/AdminHierarchy';
import VisionLeadership from '../admin/VisionLeadership';
import AdminPlanning from '../admin/AdminPlanning';
import AdminAlerts from '../admin/AdminAlerts';

const mockProcessHealth = [
  {
    name: 'Preparación de Pedidos',
    completionRate: 92,
    confusionRate: 8,
    status: 'healthy' as const,
    lastUpdated: 'Hace 2 días',
  },
  {
    name: 'Atención al Cliente',
    completionRate: 78,
    confusionRate: 35,
    status: 'warning' as const,
    lastUpdated: 'Hace 1 semana',
  },
  {
    name: 'Cierre de Caja',
    completionRate: 95,
    confusionRate: 5,
    status: 'healthy' as const,
    lastUpdated: 'Hace 3 días',
  },
  {
    name: 'Inventario Semanal',
    completionRate: 65,
    confusionRate: 45,
    status: 'critical' as const,
    lastUpdated: 'Hace 5 días',
  },
];

const ownerNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/owner' },
  { icon: Compass, label: 'Gestión', path: '/owner/planning' },
  { icon: Layers, label: 'Procesos', path: '/owner/processes' },
  { icon: ListTodo, label: 'Tareas', path: '/owner/tasks' },
  { icon: Users, label: 'Equipo', path: '/owner/team' },
  { icon: Network, label: 'Jerarquía', path: '/owner/hierarchy' },
  { icon: Heart, label: 'Visión y Liderazgo', path: '/owner/vision' },
  { icon: UserPlus, label: 'Onboardings', path: '/owner/onboardings' },
  { icon: AlertTriangle, label: 'Errores', path: '/owner/errors' },
  { icon: Bell, label: 'Alertas', path: '/owner/alerts' },
  { icon: BarChart3, label: 'Analytics', path: '/owner/analytics' },
  { icon: FileText, label: 'Reportes', path: '/owner/reports' },
];

const DashboardHome: React.FC = () => {
  const navigate = useNavigate();
  const [codeCopied, setCodeCopied] = useState(false);
  const inviteCode = 'FLOW12345';

  const copyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCodeCopied(true);
    toast.success('Código copiado');
    setTimeout(() => setCodeCopied(false), 2000);
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Vista general de tu operación
          </p>
        </div>
        <Button variant="hero" className="gap-2 w-full sm:w-auto" onClick={() => navigate('/owner/processes')}>
          <Plus className="w-4 h-4" />
          Nuevo Proceso
        </Button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div onClick={() => navigate('/owner/onboardings')} className="cursor-pointer">
          <KPICard
            title="Onboardings Activos"
            value="5"
            subtitle="3 nuevos esta semana"
            icon={UserPlus}
            trend={{ value: 2, isPositive: true }}
          />
        </div>
        <div onClick={() => navigate('/owner/errors')} className="cursor-pointer">
          <KPICard
            title="Errores Detectados"
            value="24"
            subtitle="este mes"
            icon={AlertTriangle}
            trend={{ value: 15, isPositive: false }}
            variant="warning"
          />
        </div>
        <KPICard
          title="Tiempo Salvado"
          value="47h"
          subtitle="vs mes anterior"
          icon={Clock}
          trend={{ value: 23, isPositive: true }}
          variant="success"
        />
        <KPICard
          title="Cumplimiento"
          value="87%"
          subtitle="promedio del equipo"
          icon={TrendingUp}
          trend={{ value: 5, isPositive: true }}
        />
      </div>

      {/* Process Health Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="lg:col-span-2">
          <div className="kpi-card">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-base sm:text-lg font-semibold text-foreground">
                Salud de Procesos
              </h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/owner/processes')}>
                Ver más
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {mockProcessHealth.map((process) => (
                <ProcessHealthCard key={process.name} {...process} />
              ))}
            </div>
          </div>
        </div>

        {/* Quick Stats & Invite Code */}
        <div className="space-y-4 lg:space-y-6">
          <div className="kpi-card">
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">
              Resumen Rápido
            </h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Empleados activos</span>
                <span className="font-semibold text-foreground">24</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Procesos publicados</span>
                <span className="font-semibold text-foreground">12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Completados hoy</span>
                <span className="font-semibold text-foreground">89</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tareas pendientes</span>
                <span className="font-semibold text-foreground">7</span>
              </div>
            </div>
          </div>

          {/* Invite Code Card */}
          <div className="kpi-card bg-primary/5 border-primary/20">
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
              Código de Invitación
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-4">
              Comparte este código con nuevos empleados
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-background border border-border font-mono text-base sm:text-lg text-center tracking-wider">
                {inviteCode}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={copyCode}
                className="flex-shrink-0"
              >
                {codeCopied ? (
                  <Check className="w-4 h-4 text-success" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const OwnerDashboard: React.FC = () => {
  return (
    <DashboardLayout
      navItems={ownerNavItems}
      basePath="/owner"
      roleIndicator={{
        icon: Crown,
        label: 'Dueño / Socio',
        className: 'bg-violet-500/10 text-violet-400',
      }}
    >
      <Routes>
        <Route path="/" element={<DashboardHome />} />
        <Route path="/planning" element={<AdminPlanning />} />
        <Route path="/processes/*" element={<AdminProcesses />} />
        <Route path="/tasks" element={<AdminTasksRefactored />} />
        <Route path="/team/*" element={<AdminTeam />} />
        <Route path="/hierarchy" element={<AdminHierarchy />} />
        <Route path="/vision" element={<VisionLeadership />} />
        <Route path="/analytics" element={<AdminAnalytics />} />
        <Route path="/reports" element={<AdminReports />} />
        <Route path="/settings" element={<AdminSettings />} />
        <Route path="/errors" element={<AdminErrors />} />
        <Route path="/onboardings" element={<AdminOnboardings />} />
        <Route path="/alerts" element={<AdminAlerts />} />
      </Routes>
    </DashboardLayout>
  );
};

export default OwnerDashboard;
