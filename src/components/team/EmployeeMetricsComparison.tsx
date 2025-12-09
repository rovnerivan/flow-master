import React from 'react';
import { 
  BarChart3, Clock, AlertCircle, Zap, Target, Users,
  TrendingUp, TrendingDown, CheckCircle2, XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from 'recharts';

interface MetricComparison {
  label: string;
  employeeValue: number;
  teamValue: number;
  unit: string;
  higherIsBetter: boolean;
}

interface ErrorBreakdown {
  type: string;
  count: number;
  color: string;
}

interface EmployeeMetricsComparisonProps {
  employeeName: string;
  tenureDays: number;
  metrics: MetricComparison[];
  monthlyErrors: number;
  previousMonthErrors: number;
  errorBreakdown: ErrorBreakdown[];
  avgTimePerTask: number;
  targetTimePerTask: number;
  tasksPerHour: number;
  teamTasksPerHour: number;
  weeklyHours: number;
  capacityHours: number;
  corrections: number;
  rejections: number;
}

const getTenureGroup = (days: number): { label: string; description: string } => {
  if (days <= 30) return { label: 'Nuevos (<30d)', description: 'Comparado con empleados de 0-30 días de antigüedad' };
  if (days <= 90) return { label: 'En Desarrollo (30-90d)', description: 'Comparado con empleados de 30-90 días' };
  if (days <= 180) return { label: 'Consolidados (90-180d)', description: 'Comparado con empleados de 90-180 días' };
  return { label: 'Veteranos (+180d)', description: 'Comparado con empleados de más de 180 días' };
};

const EmployeeMetricsComparison: React.FC<EmployeeMetricsComparisonProps> = ({
  employeeName,
  tenureDays,
  metrics,
  monthlyErrors,
  previousMonthErrors,
  errorBreakdown,
  avgTimePerTask,
  targetTimePerTask,
  tasksPerHour,
  teamTasksPerHour,
  weeklyHours,
  capacityHours,
  corrections,
  rejections,
}) => {
  const tenureGroup = getTenureGroup(tenureDays);
  const errorsTrend = monthlyErrors <= previousMonthErrors ? 'down' : 'up';
  const errorsChange = previousMonthErrors > 0 
    ? Math.round(((previousMonthErrors - monthlyErrors) / previousMonthErrors) * 100)
    : 0;

  const timeOnTarget = avgTimePerTask <= targetTimePerTask;
  const productivityAboveTeam = tasksPerHour >= teamTasksPerHour;

  return (
    <div className="space-y-6">
      {/* Tenure Context Banner */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
        <Users className="w-5 h-5 text-primary" />
        <div>
          <p className="text-sm font-medium text-foreground">
            Comparación con grupo: <span className="text-primary">{tenureGroup.label}</span>
          </p>
          <p className="text-xs text-muted-foreground">{tenureGroup.description}</p>
        </div>
      </div>

      {/* Metrics Comparison */}
      <div className="kpi-card p-4">
        <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          Comparación con Equipo
        </h4>
        
        <div className="space-y-4">
          {metrics.map((metric, idx) => {
            const diff = metric.employeeValue - metric.teamValue;
            const isPositive = metric.higherIsBetter ? diff >= 0 : diff <= 0;
            const percentDiff = metric.teamValue > 0 
              ? Math.round((Math.abs(diff) / metric.teamValue) * 100) 
              : 0;
            
            return (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{metric.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">
                      {metric.employeeValue}{metric.unit}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      (Equipo: {metric.teamValue}{metric.unit})
                    </span>
                    <span className={cn(
                      "text-xs font-medium",
                      isPositive ? 'text-success' : 'text-destructive'
                    )}>
                      {isPositive ? '+' : '-'}{percentDiff}%
                    </span>
                  </div>
                </div>
                
                <div className="relative h-3 rounded-full bg-secondary overflow-hidden">
                  {/* Team average marker */}
                  <div 
                    className="absolute top-0 bottom-0 w-0.5 bg-muted-foreground/50 z-10"
                    style={{ left: `${Math.min((metric.teamValue / 100) * 100, 100)}%` }}
                  />
                  {/* Employee bar */}
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all",
                      isPositive ? 'bg-success' : 'bg-destructive'
                    )}
                    style={{ width: `${Math.min((metric.employeeValue / 100) * 100, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Errors and Corrections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Error Summary */}
        <div className="kpi-card p-4">
          <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-warning" />
            Errores y Correcciones
          </h4>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-foreground">{monthlyErrors}</p>
                <p className="text-xs text-muted-foreground">errores este mes</p>
              </div>
              <div className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium",
                errorsTrend === 'down' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
              )}>
                {errorsTrend === 'down' ? (
                  <TrendingDown className="w-4 h-4" />
                ) : (
                  <TrendingUp className="w-4 h-4" />
                )}
                <span>{errorsChange}% vs anterior</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-warning/10 text-center">
                <p className="text-lg font-bold text-warning">{corrections}</p>
                <p className="text-xs text-muted-foreground">Correcciones</p>
              </div>
              <div className="p-3 rounded-lg bg-destructive/10 text-center">
                <p className="text-lg font-bold text-destructive">{rejections}</p>
                <p className="text-xs text-muted-foreground">Rechazos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Breakdown */}
        <div className="kpi-card p-4">
          <h4 className="font-semibold text-foreground mb-4">Por Tipo de Error</h4>
          
          {errorBreakdown.length > 0 ? (
            <div className="space-y-2">
              {errorBreakdown.map((error, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: error.color }}
                  />
                  <span className="flex-1 text-sm text-foreground">{error.type}</span>
                  <span className="text-sm font-medium text-foreground">{error.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-success flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Sin errores este período
            </p>
          )}
        </div>
      </div>

      {/* Productivity Metrics */}
      <div className="kpi-card p-4">
        <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          Tiempo y Productividad
        </h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Avg Time per Task */}
          <div className="p-4 rounded-xl bg-secondary/30">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-medium">Tiempo por tarea</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-foreground">{avgTimePerTask}min</span>
              <span className="text-xs text-muted-foreground">(meta: {targetTimePerTask}min)</span>
            </div>
            <div className={cn(
              "flex items-center gap-1 text-xs mt-1",
              timeOnTarget ? 'text-success' : 'text-warning'
            )}>
              {timeOnTarget ? (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  <span>En meta</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3" />
                  <span>+{avgTimePerTask - targetTimePerTask}min sobre meta</span>
                </>
              )}
            </div>
          </div>

          {/* Tasks per Hour */}
          <div className="p-4 rounded-xl bg-secondary/30">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Target className="w-4 h-4" />
              <span className="text-xs font-medium">Tareas por hora</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-foreground">{tasksPerHour}</span>
              <span className="text-xs text-muted-foreground">(equipo: {teamTasksPerHour})</span>
            </div>
            <div className={cn(
              "flex items-center gap-1 text-xs mt-1",
              productivityAboveTeam ? 'text-success' : 'text-muted-foreground'
            )}>
              {productivityAboveTeam ? (
                <>
                  <TrendingUp className="w-3 h-3" />
                  <span>Sobre promedio</span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-3 h-3" />
                  <span>Bajo promedio</span>
                </>
              )}
            </div>
          </div>

          {/* Weekly Hours */}
          <div className="p-4 rounded-xl bg-secondary/30">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <BarChart3 className="w-4 h-4" />
              <span className="text-xs font-medium">Horas/semana</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-foreground">{weeklyHours}h</span>
              <span className="text-xs text-muted-foreground">(cap: {capacityHours}h)</span>
            </div>
            <div className="mt-2">
              <Progress 
                value={(weeklyHours / capacityHours) * 100} 
                className="h-1.5"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeMetricsComparison;
