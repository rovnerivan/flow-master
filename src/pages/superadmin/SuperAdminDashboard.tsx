import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import {
  Building2,
  Users,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Activity,
} from 'lucide-react';
import { KPICard } from '@/components/dashboard/KPICard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import SuperAdminCompanies from './SuperAdminCompanies';
import SuperAdminUsers from './SuperAdminUsers';
import SuperAdminAnalytics from './SuperAdminAnalytics';

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

const superAdminNavItems = [
  { icon: BarChart3, label: 'Dashboard', path: '/superadmin' },
  { icon: Building2, label: 'Empresas', path: '/superadmin/companies' },
  { icon: Users, label: 'Usuarios', path: '/superadmin/users' },
  { icon: TrendingUp, label: 'Analíticas', path: '/superadmin/analytics' },
  { icon: Activity, label: 'Sistema', path: '/superadmin/system' },
];

const SuperAdminHome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Panel de Control SaaS</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Vista general de todas las empresas y métricas del sistema
        </p>
      </div>

      {/* Global KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-semibold text-foreground">
            Empresas Registradas
          </h2>
          <Button variant="outline" size="sm">
            Exportar
          </Button>
        </div>

        {/* Mobile Card View */}
        <div className="space-y-3 lg:hidden">
          {mockCompanies.map((company) => (
            <div
              key={company.id}
              className="p-4 rounded-lg border border-border hover:bg-secondary/30 transition-colors"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{company.name}</p>
                  <p className="text-xs text-muted-foreground">Desde {company.createdAt}</p>
                </div>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-success/20 text-success shrink-0">
                  Activo
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Plan</p>
                  <span className={cn(
                    'px-2 py-0.5 rounded-full text-xs font-medium inline-block mt-1',
                    company.plan === 'Enterprise' && 'bg-purple-500/20 text-purple-500',
                    company.plan === 'Pro' && 'bg-primary/20 text-primary',
                    company.plan === 'Basic' && 'bg-secondary text-muted-foreground'
                  )}>
                    {company.plan}
                  </span>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Empleados</p>
                  <p className="font-medium text-foreground">{company.employees}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Cumplimiento</p>
                  <p className="font-medium text-foreground">{company.compliance}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
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
        <h2 className="text-base sm:text-lg font-semibold text-foreground mb-4">
          Alertas del Sistema
        </h2>
        <div className="space-y-3">
          <div className="flex items-start sm:items-center gap-3 p-3 rounded-lg bg-warning/10 border border-warning/20">
            <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5 sm:mt-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                Retail Corp tiene bajo cumplimiento (75%)
              </p>
              <p className="text-xs text-muted-foreground">Hace 2 horas</p>
            </div>
          </div>
          <div className="flex items-start sm:items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
            <TrendingUp className="w-5 h-5 text-primary shrink-0 mt-0.5 sm:mt-0" />
            <div className="flex-1 min-w-0">
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

const SuperAdminDashboard: React.FC = () => {
  return (
    <DashboardLayout
      navItems={superAdminNavItems}
      basePath="/superadmin"
      roleIndicator={{
        icon: BarChart3,
        label: 'SUPER ADMIN',
        className: 'bg-primary/10 text-primary',
      }}
    >
      <Routes>
        <Route path="/" element={<SuperAdminHome />} />
        <Route path="/companies" element={<SuperAdminCompanies />} />
        <Route path="/users" element={<SuperAdminUsers />} />
        <Route path="/analytics" element={<SuperAdminAnalytics />} />
        <Route path="/system" element={<div className="text-foreground">Estado del Sistema (próximamente)</div>} />
        <Route path="/settings" element={<div className="text-foreground">Configuración SuperAdmin (próximamente)</div>} />
      </Routes>
    </DashboardLayout>
  );
};

export default SuperAdminDashboard;
