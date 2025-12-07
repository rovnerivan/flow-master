import React, { useState } from 'react';
import {
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Users,
  BookOpen,
  Plus,
} from 'lucide-react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { KPICard } from '@/components/dashboard/KPICard';
import { ProcessHealthCard } from '@/components/dashboard/ProcessHealthCard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const mockProcessHealth = [
  {
    name: 'Onboarding de Cajeros',
    completionRate: 92,
    confusionRate: 8,
    status: 'healthy' as const,
    lastUpdated: 'Hace 2 días',
  },
  {
    name: 'Protocolo de Cierre de Caja',
    completionRate: 78,
    confusionRate: 35,
    status: 'warning' as const,
    lastUpdated: 'Hace 1 semana',
  },
  {
    name: 'Atención al Cliente',
    completionRate: 45,
    confusionRate: 52,
    status: 'critical' as const,
    lastUpdated: 'Hace 3 días',
  },
  {
    name: 'Inventario y Stock',
    completionRate: 88,
    confusionRate: 12,
    status: 'healthy' as const,
    lastUpdated: 'Hace 5 días',
  },
];

const AdminDashboard: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <main
        className={cn(
          'transition-all duration-300 min-h-screen',
          sidebarCollapsed ? 'ml-[72px]' : 'ml-64'
        )}
      >
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground">
                Vista general del rendimiento de tu equipo
              </p>
            </div>
            <Button variant="hero" className="gap-2">
              <Plus className="w-4 h-4" />
              Nuevo Proceso
            </Button>
          </div>

          {/* KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger-children">
            <KPICard
              title="Tiempo de Onboarding"
              value="4.2 días"
              subtitle="vs. 12 días benchmark"
              icon={Clock}
              trend={{ value: 65, isPositive: true }}
              variant="primary"
            />
            <KPICard
              title="Ahorro Estimado/Mes"
              value="$8,450"
              subtitle="Basado en eficiencia"
              icon={DollarSign}
              trend={{ value: 23, isPositive: true }}
              variant="success"
            />
            <KPICard
              title="Errores Evitados"
              value="34"
              subtitle="Este mes"
              icon={AlertTriangle}
              trend={{ value: 18, isPositive: true }}
              variant="warning"
            />
            <KPICard
              title="Compliance General"
              value="87%"
              subtitle="24 de 28 empleados"
              icon={CheckCircle}
              trend={{ value: 5, isPositive: true }}
              variant="default"
            />
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Process Health - Takes 2 columns */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  Salud de Procesos
                </h2>
                <Button variant="ghost" size="sm">
                  Ver todos
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {mockProcessHealth.map((process) => (
                  <ProcessHealthCard key={process.name} {...process} />
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">
                Resumen Rápido
              </h2>

              <div className="kpi-card space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Users className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Empleados activos
                    </span>
                  </div>
                  <span className="text-lg font-semibold">28</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-success/10">
                      <BookOpen className="w-4 h-4 text-success" />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Procesos activos
                    </span>
                  </div>
                  <span className="text-lg font-semibold">12</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-warning/10">
                      <TrendingUp className="w-4 h-4 text-warning" />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Completados hoy
                    </span>
                  </div>
                  <span className="text-lg font-semibold">47</span>
                </div>
              </div>

              {/* Invite Code Card */}
              <div className="kpi-card">
                <h3 className="font-semibold text-foreground mb-2">
                  Código de Invitación
                </h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Comparte este código con nuevos empleados
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-4 py-2 rounded-lg bg-secondary font-mono text-lg text-center tracking-wider">
                    FLOW12345
                  </code>
                  <Button variant="outline" size="sm">
                    Copiar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
