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
  MessageCircle,
  UserPlus,
} from 'lucide-react';
import { OwnerSidebar } from '@/components/layout/OwnerSidebar';
import { KPICard } from '@/components/dashboard/KPICard';
import { ProcessHealthCard } from '@/components/dashboard/ProcessHealthCard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Import admin pages (reused for owner)
import AdminProcesses from '../admin/AdminProcesses';
import AdminTeam from '../admin/AdminTeam';
import AdminAnalytics from '../admin/AdminAnalytics';
import AdminReports from '../admin/AdminReports';
import AdminSettings from '../admin/AdminSettings';
import AdminErrors from '../admin/AdminErrors';
import AdminOnboardings from '../admin/AdminOnboardings';
import AdminTasks from '../admin/AdminTasks';
import AdminHierarchy from '../admin/AdminHierarchy';
import VisionLeadership from '../admin/VisionLeadership';

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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Vista general de tu operación
          </p>
        </div>
        <Button variant="hero" className="gap-2" onClick={() => navigate('/owner/processes')}>
          <Plus className="w-4 h-4" />
          Nuevo Proceso
        </Button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="kpi-card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">
                Salud de Procesos
              </h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/owner/processes')}>
                Ver más
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mockProcessHealth.map((process) => (
                <ProcessHealthCard key={process.name} {...process} />
              ))}
            </div>
          </div>
        </div>

        {/* Quick Stats & Invite Code */}
        <div className="space-y-6">
          <div className="kpi-card">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Resumen Rápido
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Empleados activos</span>
                <span className="font-semibold text-foreground">24</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Procesos publicados</span>
                <span className="font-semibold text-foreground">12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Completados hoy</span>
                <span className="font-semibold text-foreground">89</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tareas pendientes</span>
                <span className="font-semibold text-foreground">7</span>
              </div>
            </div>
          </div>

          {/* Invite Code Card */}
          <div className="kpi-card bg-primary/5 border-primary/20">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Código de Invitación
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Comparte este código con nuevos empleados
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-4 py-3 rounded-lg bg-background border border-border font-mono text-lg text-center tracking-wider">
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleSupport = () => {
    toast.info('Función de soporte próximamente disponible');
  };

  return (
    <div className="min-h-screen bg-background flex">
      <OwnerSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <main
        className={cn(
          'flex-1 p-6 lg:p-8 transition-all duration-300',
          sidebarCollapsed ? 'ml-[72px]' : 'ml-64'
        )}
      >
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/processes/*" element={<AdminProcesses />} />
          <Route path="/tasks" element={<AdminTasks />} />
          <Route path="/team/*" element={<AdminTeam />} />
          <Route path="/hierarchy" element={<AdminHierarchy />} />
          <Route path="/vision" element={<VisionLeadership />} />
          <Route path="/analytics" element={<AdminAnalytics />} />
          <Route path="/reports" element={<AdminReports />} />
          <Route path="/settings" element={<AdminSettings />} />
          <Route path="/errors" element={<AdminErrors />} />
          <Route path="/onboardings" element={<AdminOnboardings />} />
        </Routes>

        {/* Floating Support Button */}
        <button
          onClick={handleSupport}
          className="fixed bottom-6 right-6 p-4 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:scale-105 z-40"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      </main>
    </div>
  );
};

export default OwnerDashboard;