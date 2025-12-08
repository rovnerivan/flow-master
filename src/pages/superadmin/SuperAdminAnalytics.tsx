import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Building2,
  DollarSign,
  Activity,
  BarChart3,
  PieChart,
  Calendar,
  Target,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  XCircle,
  Zap,
  Layers,
  RefreshCw,
  Download,
  Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DateRangeFilter, useDateRangeFilter } from '@/components/filters/DateRangeFilter';

// ============ MOCK DATA ============

// Revenue & Business Metrics
const revenueMetrics = {
  mrr: 12450,
  mrrGrowth: 8.5,
  arr: 149400,
  arrGrowth: 12.3,
  ltv: 2840,
  cac: 380,
  ltvCacRatio: 7.47,
  arpu: 156,
  arpuGrowth: 4.2,
};

// Customer Metrics
const customerMetrics = {
  totalCompanies: 82,
  newThisMonth: 8,
  churnedThisMonth: 2,
  netGrowth: 6,
  churnRate: 2.4,
  retentionRate: 97.6,
  expansionRevenue: 1250,
  contractionRevenue: 320,
};

// Product Usage Metrics
const usageMetrics = {
  dau: 342,
  dauGrowth: 5.2,
  wau: 856,
  wauGrowth: 3.8,
  mau: 1245,
  mauGrowth: 7.1,
  dauMauRatio: 27.5, // Stickiness
  avgSessionDuration: 24, // minutes
  sessionsPerUser: 4.2,
  totalProcesses: 428,
  totalTasks: 1856,
  completionRate: 78.5,
};

// Feature Adoption
const featureAdoption = [
  { name: 'Procesos', adoption: 94, trend: 2.1, users: 1170 },
  { name: 'Tareas', adoption: 88, trend: 5.3, users: 1095 },
  { name: 'Gestión Estratégica', adoption: 42, trend: 12.5, users: 523 },
  { name: 'Checklists Diarios', adoption: 76, trend: 3.2, users: 946 },
  { name: 'Cultura/Visión', adoption: 35, trend: 8.7, users: 436 },
  { name: 'Métricas de Tareas', adoption: 58, trend: 6.4, users: 722 },
  { name: 'Micro-Aprendizajes', adoption: 28, trend: -2.1, users: 349 },
];

// Cohort Retention Data (simplified)
const cohortData = [
  { cohort: 'Ene 2024', m0: 100, m1: 92, m2: 88, m3: 85, m4: 82, m5: 80 },
  { cohort: 'Feb 2024', m0: 100, m1: 94, m2: 90, m3: 87, m4: 84, m5: null },
  { cohort: 'Mar 2024', m0: 100, m1: 91, m2: 86, m3: 83, m4: null, m5: null },
  { cohort: 'Abr 2024', m0: 100, m1: 95, m2: 91, m3: null, m4: null, m5: null },
  { cohort: 'May 2024', m0: 100, m1: 93, m2: null, m3: null, m4: null, m5: null },
  { cohort: 'Jun 2024', m0: 100, m1: null, m2: null, m3: null, m4: null, m5: null },
];

// Customer Health Scores
const customerHealth = [
  { name: 'Tech Solutions', health: 95, mrr: 890, users: 45, riskLevel: 'healthy' },
  { name: 'Empresa Demo S.A.', health: 87, mrr: 450, users: 24, riskLevel: 'healthy' },
  { name: 'Innovatech', health: 78, mrr: 320, users: 18, riskLevel: 'monitor' },
  { name: 'Retail Corp', health: 45, mrr: 250, users: 18, riskLevel: 'at_risk' },
  { name: 'StartUp Labs', health: 32, mrr: 150, users: 8, riskLevel: 'critical' },
];

// Plan Distribution
const planDistribution = [
  { plan: 'Enterprise', companies: 12, revenue: 5400, percentage: 14.6 },
  { plan: 'Pro', companies: 38, revenue: 4940, percentage: 46.3 },
  { plan: 'Basic', companies: 28, revenue: 1960, percentage: 34.1 },
  { plan: 'Trial', companies: 4, revenue: 0, percentage: 4.9 },
];

// Growth Over Time (last 6 months)
const growthTrend = [
  { month: 'Ene', companies: 58, users: 892, mrr: 9200 },
  { month: 'Feb', companies: 62, users: 956, mrr: 9800 },
  { month: 'Mar', companies: 68, users: 1024, mrr: 10500 },
  { month: 'Abr', companies: 72, users: 1098, mrr: 11200 },
  { month: 'May', companies: 76, users: 1167, mrr: 11800 },
  { month: 'Jun', companies: 82, users: 1245, mrr: 12450 },
];

// ============ HELPER COMPONENTS ============

const MetricCard: React.FC<{
  title: string;
  value: string;
  subtitle?: string;
  trend?: number;
  icon: React.ElementType;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}> = ({ title, value, subtitle, trend, icon: Icon, variant = 'default' }) => {
  const variantStyles = {
    default: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    danger: 'bg-destructive/10 text-destructive',
  };

  return (
    <div className="kpi-card">
      <div className="flex items-start justify-between">
        <div className={cn('p-2.5 rounded-xl', variantStyles[variant])}>
          <Icon className="w-5 h-5" />
        </div>
        {trend !== undefined && (
          <div className={cn(
            'flex items-center gap-1 text-sm font-medium',
            trend >= 0 ? 'text-success' : 'text-destructive'
          )}>
            {trend >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{title}</p>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </div>
    </div>
  );
};

const MiniBarChart: React.FC<{ data: number[]; height?: number }> = ({ data, height = 40 }) => {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-1" style={{ height }}>
      {data.map((value, i) => (
        <div
          key={i}
          className="flex-1 bg-primary/20 rounded-t hover:bg-primary/40 transition-colors"
          style={{ height: `${(value / max) * 100}%` }}
        />
      ))}
    </div>
  );
};

const getRiskBadge = (level: string) => {
  const styles = {
    healthy: 'bg-success/10 text-success',
    monitor: 'bg-warning/10 text-warning',
    at_risk: 'bg-orange-500/10 text-orange-500',
    critical: 'bg-destructive/10 text-destructive',
  };
  const labels = {
    healthy: 'Saludable',
    monitor: 'Monitorear',
    at_risk: 'En riesgo',
    critical: 'Crítico',
  };
  return (
    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', styles[level as keyof typeof styles])}>
      {labels[level as keyof typeof labels]}
    </span>
  );
};

// ============ MAIN COMPONENT ============

const SuperAdminAnalytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('30d');
  const { dateRange } = useDateRangeFilter();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Analíticas SaaS</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Métricas de negocio, producto y salud de clientes
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[130px] sm:w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 días</SelectItem>
              <SelectItem value="30d">Últimos 30 días</SelectItem>
              <SelectItem value="90d">Últimos 90 días</SelectItem>
              <SelectItem value="12m">Últimos 12 meses</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" className="shrink-0">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button variant="outline" className="gap-2 hidden sm:flex">
            <Download className="w-4 h-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-4 h-auto">
          <TabsTrigger value="overview" className="text-xs sm:text-sm py-2">Resumen</TabsTrigger>
          <TabsTrigger value="revenue" className="text-xs sm:text-sm py-2">Ingresos</TabsTrigger>
          <TabsTrigger value="product" className="text-xs sm:text-sm py-2">Producto</TabsTrigger>
          <TabsTrigger value="customers" className="text-xs sm:text-sm py-2">Clientes</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Key Business Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="MRR"
              value={`$${revenueMetrics.mrr.toLocaleString()}`}
              trend={revenueMetrics.mrrGrowth}
              icon={DollarSign}
              variant="success"
            />
            <MetricCard
              title="Empresas Activas"
              value={customerMetrics.totalCompanies.toString()}
              subtitle={`+${customerMetrics.newThisMonth} este mes`}
              trend={((customerMetrics.newThisMonth / customerMetrics.totalCompanies) * 100)}
              icon={Building2}
            />
            <MetricCard
              title="Usuarios Activos (MAU)"
              value={usageMetrics.mau.toLocaleString()}
              trend={usageMetrics.mauGrowth}
              icon={Users}
            />
            <MetricCard
              title="Tasa de Retención"
              value={`${customerMetrics.retentionRate}%`}
              trend={0.5}
              icon={Target}
              variant="success"
            />
          </div>

          {/* Growth Trend */}
          <div className="kpi-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Tendencia de Crecimiento</h3>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-muted-foreground">MRR</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-success" />
                  <span className="text-muted-foreground">Usuarios</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {growthTrend.map((month, i) => (
                <div key={month.month} className="text-center">
                  <div className="h-24 flex flex-col justify-end gap-1">
                    <div 
                      className="bg-success/30 rounded-t transition-all"
                      style={{ height: `${(month.users / 1300) * 100}%` }}
                    />
                    <div 
                      className="bg-primary rounded-t transition-all"
                      style={{ height: `${(month.mrr / 13000) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{month.month}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Plan Distribution */}
            <div className="kpi-card">
              <h3 className="font-semibold text-foreground mb-4">Distribución por Plan</h3>
              <div className="space-y-3">
                {planDistribution.map(plan => (
                  <div key={plan.plan} className="flex items-center gap-3">
                    <div className="w-24 text-sm font-medium text-foreground">{plan.plan}</div>
                    <div className="flex-1">
                      <Progress value={plan.percentage} className="h-2" />
                    </div>
                    <div className="text-right min-w-[80px]">
                      <p className="text-sm font-semibold text-foreground">{plan.companies}</p>
                      <p className="text-xs text-muted-foreground">${plan.revenue}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Health Overview */}
            <div className="kpi-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Salud de Clientes</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {customerHealth.filter(c => c.riskLevel === 'at_risk' || c.riskLevel === 'critical').length} en riesgo
                  </span>
                  <AlertTriangle className="w-4 h-4 text-warning" />
                </div>
              </div>
              <div className="space-y-2">
                {customerHealth.slice(0, 5).map(customer => (
                  <div key={customer.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                        customer.health >= 70 ? "bg-success/20 text-success" :
                        customer.health >= 50 ? "bg-warning/20 text-warning" :
                        "bg-destructive/20 text-destructive"
                      )}>
                        {customer.health}
                      </div>
                      <span className="text-sm font-medium text-foreground">{customer.name}</span>
                    </div>
                    {getRiskBadge(customer.riskLevel)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* REVENUE TAB */}
        <TabsContent value="revenue" className="space-y-6 mt-6">
          {/* Revenue KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="MRR"
              value={`$${revenueMetrics.mrr.toLocaleString()}`}
              subtitle="Ingresos recurrentes mensuales"
              trend={revenueMetrics.mrrGrowth}
              icon={DollarSign}
              variant="success"
            />
            <MetricCard
              title="ARR"
              value={`$${revenueMetrics.arr.toLocaleString()}`}
              subtitle="Ingresos recurrentes anuales"
              trend={revenueMetrics.arrGrowth}
              icon={Calendar}
              variant="success"
            />
            <MetricCard
              title="ARPU"
              value={`$${revenueMetrics.arpu}`}
              subtitle="Ingreso promedio por usuario"
              trend={revenueMetrics.arpuGrowth}
              icon={Users}
            />
            <MetricCard
              title="LTV:CAC"
              value={`${revenueMetrics.ltvCacRatio}:1`}
              subtitle={`LTV $${revenueMetrics.ltv} / CAC $${revenueMetrics.cac}`}
              icon={Target}
              variant="success"
            />
          </div>

          {/* Revenue Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="kpi-card">
              <h3 className="font-semibold text-foreground mb-4">Movimientos de MRR</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ArrowUpRight className="w-4 h-4 text-success" />
                    <span className="text-sm text-foreground">Nuevos clientes</span>
                  </div>
                  <span className="font-semibold text-success">+$1,200</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="text-sm text-foreground">Expansión</span>
                  </div>
                  <span className="font-semibold text-primary">+${customerMetrics.expansionRevenue}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-warning" />
                    <span className="text-sm text-foreground">Contracción</span>
                  </div>
                  <span className="font-semibold text-warning">-${customerMetrics.contractionRevenue}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-destructive" />
                    <span className="text-sm text-foreground">Churn</span>
                  </div>
                  <span className="font-semibold text-destructive">-$400</span>
                </div>
                <div className="border-t border-border pt-3 flex items-center justify-between">
                  <span className="font-medium text-foreground">Cambio neto MRR</span>
                  <span className="font-bold text-success">+$1,730</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 kpi-card">
              <h3 className="font-semibold text-foreground mb-4">Ingresos por Plan</h3>
              <div className="space-y-4">
                {planDistribution.map(plan => {
                  const revenueShare = (plan.revenue / revenueMetrics.mrr) * 100;
                  return (
                    <div key={plan.plan}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-foreground">{plan.plan}</span>
                        <div className="text-right">
                          <span className="font-semibold text-foreground">${plan.revenue.toLocaleString()}</span>
                          <span className="text-xs text-muted-foreground ml-2">({revenueShare.toFixed(1)}%)</span>
                        </div>
                      </div>
                      <Progress value={revenueShare} className="h-3" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* PRODUCT TAB */}
        <TabsContent value="product" className="space-y-6 mt-6">
          {/* Engagement KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="DAU"
              value={usageMetrics.dau.toString()}
              subtitle="Usuarios activos diarios"
              trend={usageMetrics.dauGrowth}
              icon={Activity}
            />
            <MetricCard
              title="MAU"
              value={usageMetrics.mau.toString()}
              subtitle="Usuarios activos mensuales"
              trend={usageMetrics.mauGrowth}
              icon={Users}
            />
            <MetricCard
              title="Stickiness"
              value={`${usageMetrics.dauMauRatio}%`}
              subtitle="Ratio DAU/MAU"
              icon={Zap}
            />
            <MetricCard
              title="Sesión Promedio"
              value={`${usageMetrics.avgSessionDuration}m`}
              subtitle={`${usageMetrics.sessionsPerUser} sesiones/usuario`}
              icon={Clock}
            />
          </div>

          {/* Feature Adoption */}
          <div className="kpi-card">
            <h3 className="font-semibold text-foreground mb-4">Adopción de Funcionalidades</h3>
            <div className="space-y-4">
              {featureAdoption.map(feature => (
                <div key={feature.name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-foreground">{feature.name}</span>
                      <div className={cn(
                        "flex items-center gap-1 text-xs",
                        feature.trend >= 0 ? "text-success" : "text-destructive"
                      )}>
                        {feature.trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {Math.abs(feature.trend)}%
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-foreground">{feature.adoption}%</span>
                      <span className="text-xs text-muted-foreground ml-2">({feature.users} usuarios)</span>
                    </div>
                  </div>
                  <Progress value={feature.adoption} className="h-2" />
                </div>
              ))}
            </div>
          </div>

          {/* Product Health */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="kpi-card">
              <h3 className="font-semibold text-foreground mb-4">Volumen de Uso</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary" />
                    <span className="text-sm text-foreground">Procesos creados</span>
                  </div>
                  <span className="font-bold text-foreground">{usageMetrics.totalProcesses}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="text-sm text-foreground">Tareas totales</span>
                  </div>
                  <span className="font-bold text-foreground">{usageMetrics.totalTasks}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-warning" />
                    <span className="text-sm text-foreground">Tasa de completado</span>
                  </div>
                  <span className="font-bold text-foreground">{usageMetrics.completionRate}%</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 kpi-card">
              <h3 className="font-semibold text-foreground mb-4">Retención por Cohorte</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-muted-foreground font-medium">Cohorte</th>
                      <th className="text-center py-2 text-muted-foreground font-medium">M0</th>
                      <th className="text-center py-2 text-muted-foreground font-medium">M1</th>
                      <th className="text-center py-2 text-muted-foreground font-medium">M2</th>
                      <th className="text-center py-2 text-muted-foreground font-medium">M3</th>
                      <th className="text-center py-2 text-muted-foreground font-medium">M4</th>
                      <th className="text-center py-2 text-muted-foreground font-medium">M5</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cohortData.map(row => (
                      <tr key={row.cohort} className="border-b border-border/50">
                        <td className="py-2 font-medium text-foreground">{row.cohort}</td>
                        {[row.m0, row.m1, row.m2, row.m3, row.m4, row.m5].map((val, i) => (
                          <td key={i} className="text-center py-2">
                            {val !== null ? (
                              <span className={cn(
                                "px-2 py-1 rounded text-xs font-medium",
                                val >= 90 ? "bg-success/20 text-success" :
                                val >= 80 ? "bg-primary/20 text-primary" :
                                val >= 70 ? "bg-warning/20 text-warning" :
                                "bg-destructive/20 text-destructive"
                              )}>
                                {val}%
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* CUSTOMERS TAB */}
        <TabsContent value="customers" className="space-y-6 mt-6">
          {/* Customer KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Empresas"
              value={customerMetrics.totalCompanies.toString()}
              subtitle={`+${customerMetrics.netGrowth} neto este mes`}
              trend={((customerMetrics.netGrowth / customerMetrics.totalCompanies) * 100)}
              icon={Building2}
            />
            <MetricCard
              title="Tasa de Churn"
              value={`${customerMetrics.churnRate}%`}
              subtitle={`${customerMetrics.churnedThisMonth} empresas`}
              icon={XCircle}
              variant={customerMetrics.churnRate > 5 ? 'danger' : 'success'}
            />
            <MetricCard
              title="NRR"
              value="108%"
              subtitle="Net Revenue Retention"
              icon={TrendingUp}
              variant="success"
            />
            <MetricCard
              title="LTV"
              value={`$${revenueMetrics.ltv.toLocaleString()}`}
              subtitle="Valor de vida del cliente"
              icon={DollarSign}
            />
          </div>

          {/* Customer Health Table */}
          <div className="kpi-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Monitoreo de Salud de Clientes</h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="w-4 h-4" />
                  Filtrar
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Empresa</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Health Score</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">MRR</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Usuarios</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Estado</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {customerHealth.map(customer => (
                    <tr key={customer.name} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-primary" />
                          </div>
                          <span className="font-medium text-foreground">{customer.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <Progress value={customer.health} className="w-16 h-2" />
                          <span className={cn(
                            "text-sm font-semibold",
                            customer.health >= 70 ? "text-success" :
                            customer.health >= 50 ? "text-warning" :
                            "text-destructive"
                          )}>
                            {customer.health}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-foreground">${customer.mrr}</td>
                      <td className="py-3 px-4 text-right text-foreground">{customer.users}</td>
                      <td className="py-3 px-4 text-center">{getRiskBadge(customer.riskLevel)}</td>
                      <td className="py-3 px-4 text-right">
                        <Button variant="ghost" size="sm">Ver detalles</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Customer Segments */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="kpi-card">
              <h3 className="font-semibold text-foreground mb-4">Segmentación por Riesgo</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-success/10 border border-success/20">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-success" />
                    <span className="font-medium text-success">Saludables</span>
                  </div>
                  <p className="text-3xl font-bold text-foreground">
                    {customerHealth.filter(c => c.riskLevel === 'healthy').length}
                  </p>
                  <p className="text-sm text-muted-foreground">empresas</p>
                </div>
                <div className="p-4 rounded-xl bg-warning/10 border border-warning/20">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-warning" />
                    <span className="font-medium text-warning">Monitorear</span>
                  </div>
                  <p className="text-3xl font-bold text-foreground">
                    {customerHealth.filter(c => c.riskLevel === 'monitor').length}
                  </p>
                  <p className="text-sm text-muted-foreground">empresas</p>
                </div>
                <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    <span className="font-medium text-orange-500">En riesgo</span>
                  </div>
                  <p className="text-3xl font-bold text-foreground">
                    {customerHealth.filter(c => c.riskLevel === 'at_risk').length}
                  </p>
                  <p className="text-sm text-muted-foreground">empresas</p>
                </div>
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="w-5 h-5 text-destructive" />
                    <span className="font-medium text-destructive">Crítico</span>
                  </div>
                  <p className="text-3xl font-bold text-foreground">
                    {customerHealth.filter(c => c.riskLevel === 'critical').length}
                  </p>
                  <p className="text-sm text-muted-foreground">empresas</p>
                </div>
              </div>
            </div>

            <div className="kpi-card">
              <h3 className="font-semibold text-foreground mb-4">Acciones Recomendadas</h3>
              <div className="space-y-3">
                {customerHealth
                  .filter(c => c.riskLevel === 'at_risk' || c.riskLevel === 'critical')
                  .map(customer => (
                    <div key={customer.name} className="flex items-center gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                      <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{customer.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Health score: {customer.health} • MRR en riesgo: ${customer.mrr}
                        </p>
                      </div>
                      <Button size="sm" variant="destructive">
                        Intervenir
                      </Button>
                    </div>
                  ))}
                {customerHealth.filter(c => c.riskLevel === 'at_risk' || c.riskLevel === 'critical').length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-success" />
                    <p>No hay clientes en estado crítico</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SuperAdminAnalytics;
