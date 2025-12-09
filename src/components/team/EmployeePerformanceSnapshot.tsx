import React from 'react';
import { TrendingUp, TrendingDown, Minus, Zap, BarChart3, AlertCircle, Award, Target, Star, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { EmployeeData } from './EmployeeProfileCard';

interface EmployeePerformanceSnapshotProps {
  employee: EmployeeData;
  teamAverageEfficiency: number;
  teamAverageVolume: number;
  weeklyHistory: number[];
}

const quadrantConfig = {
  star: { 
    label: 'Estrella', 
    description: 'Alto rendimiento y alto volumen. Considerar para mentor o líder de proyecto.',
    icon: Star, 
    color: 'text-warning', 
    bg: 'bg-warning/10',
  },
  potential: { 
    label: 'Alto Potencial', 
    description: 'Buen rendimiento con margen de crecimiento en volumen. Oportunidad de asignar más responsabilidades.',
    icon: Zap, 
    color: 'text-primary', 
    bg: 'bg-primary/10',
  },
  coaching: { 
    label: 'Coaching', 
    description: 'Buen volumen pero necesita apoyo en eficiencia. Programar sesiones de coaching.',
    icon: Target, 
    color: 'text-muted-foreground', 
    bg: 'bg-muted/30',
  },
  attention: { 
    label: 'Requiere Atención', 
    description: 'Bajo rendimiento en ambas métricas. Requiere plan de desarrollo inmediato.',
    icon: AlertCircle, 
    color: 'text-destructive', 
    bg: 'bg-destructive/10',
  },
};

const EmployeePerformanceSnapshot: React.FC<EmployeePerformanceSnapshotProps> = ({
  employee,
  teamAverageEfficiency,
  teamAverageVolume,
  weeklyHistory,
}) => {
  const quadrant = quadrantConfig[employee.quadrant];
  const QuadrantIcon = quadrant.icon;

  const TrendIcon = employee.efficiencyTrend === 'up' ? TrendingUp 
    : employee.efficiencyTrend === 'down' ? TrendingDown 
    : Minus;

  const trendColor = employee.efficiencyTrend === 'up' ? 'text-success' 
    : employee.efficiencyTrend === 'down' ? 'text-destructive' 
    : 'text-muted-foreground';

  // Prepare chart data
  const chartData = weeklyHistory.map((value, index) => ({
    week: `S${index + 1}`,
    efficiency: value,
    average: teamAverageEfficiency,
  }));

  // Calculate comparison to team
  const efficiencyVsTeam = employee.efficiency - teamAverageEfficiency;
  const volumeVsTeam = employee.volume - teamAverageVolume;

  // Mock additional data
  const monthlyErrors = 2;
  const previousMonthErrors = 5;
  const errorsTrend = monthlyErrors < previousMonthErrors ? 'down' : 'up';

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="kpi-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Zap className="w-4 h-4" />
            <span className="text-xs font-medium">Eficiencia</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{employee.efficiency}%</span>
            <div className={cn("flex items-center gap-0.5 text-xs", trendColor)}>
              <TrendIcon className="w-3 h-3" />
              <span>{employee.efficiencyChange > 0 ? '+' : ''}{employee.efficiencyChange}%</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">vs semana anterior</p>
        </div>

        <div className="kpi-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <BarChart3 className="w-4 h-4" />
            <span className="text-xs font-medium">Volumen</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{employee.volume}</span>
            <span className="text-xs text-muted-foreground">tareas/mes</span>
          </div>
          <p className={cn(
            "text-xs mt-1",
            volumeVsTeam >= 0 ? 'text-success' : 'text-destructive'
          )}>
            {volumeVsTeam >= 0 ? '+' : ''}{volumeVsTeam} vs equipo
          </p>
        </div>

        <div className="kpi-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <AlertCircle className="w-4 h-4" />
            <span className="text-xs font-medium">Errores</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{monthlyErrors}</span>
            <span className="text-xs text-muted-foreground">este mes</span>
          </div>
          <p className={cn(
            "text-xs mt-1",
            errorsTrend === 'down' ? 'text-success' : 'text-destructive'
          )}>
            {errorsTrend === 'down' ? '↓' : '↑'} vs {previousMonthErrors} anterior
          </p>
        </div>

        <div className="kpi-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-medium">Carga</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{employee.workloadHours}h</span>
            <span className="text-xs text-muted-foreground">/{employee.capacityHours}h</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-secondary mt-2 overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all",
                employee.workloadHours > employee.capacityHours ? 'bg-destructive' : 'bg-primary'
              )}
              style={{ width: `${Math.min((employee.workloadHours / employee.capacityHours) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="kpi-card p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-foreground">Tendencia Últimas 8 Semanas</h4>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-primary rounded" />
              <span className="text-muted-foreground">Eficiencia</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-muted-foreground/50 rounded" />
              <span className="text-muted-foreground">Promedio equipo</span>
            </div>
          </div>
        </div>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis 
                dataKey="week" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              />
              <YAxis 
                domain={[0, 100]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Line 
                type="monotone" 
                dataKey="average" 
                stroke="hsl(var(--muted-foreground) / 0.5)" 
                strokeWidth={1}
                strokeDasharray="4 4"
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="efficiency" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2, fill: 'hsl(var(--card))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quadrant Status */}
      <div className={cn("rounded-xl p-4 border", quadrant.bg, `border-${employee.quadrant === 'attention' ? 'destructive' : employee.quadrant === 'star' ? 'warning' : 'primary'}/20`)}>
        <div className="flex items-start gap-3">
          <div className={cn("p-2 rounded-lg", quadrant.bg)}>
            <QuadrantIcon className={cn("w-5 h-5", quadrant.color)} />
          </div>
          <div>
            <h4 className={cn("font-semibold", quadrant.color)}>
              Cuadrante: {quadrant.label}
            </h4>
            <p className="text-sm text-muted-foreground mt-1">
              {quadrant.description}
            </p>
          </div>
        </div>
      </div>

      {/* Alerts and Achievements */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Active Alerts */}
        <div className="kpi-card p-4">
          <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-warning" />
            Alertas Activas
          </h4>
          {employee.alerts.length > 0 ? (
            <div className="space-y-2">
              {employee.alerts.map((alert, idx) => (
                <div 
                  key={idx}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
                    alert.type === 'critical' ? 'bg-destructive/10 text-destructive' :
                    alert.type === 'warning' ? 'bg-warning/10 text-warning' :
                    'bg-primary/10 text-primary'
                  )}
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{alert.message}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              Sin alertas activas
            </p>
          )}
        </div>

        {/* Recent Achievements */}
        <div className="kpi-card p-4">
          <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-warning" />
            Logros Recientes
          </h4>
          {employee.achievements.length > 0 ? (
            <div className="space-y-2">
              {employee.achievements.map((achievement, idx) => (
                <div 
                  key={idx}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-warning/10 text-sm text-warning"
                >
                  <Star className="w-4 h-4 flex-shrink-0" />
                  <span>{achievement}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Aún sin logros registrados este período
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeePerformanceSnapshot;
