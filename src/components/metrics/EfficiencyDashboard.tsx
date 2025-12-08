import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Users, 
  Calendar,
  AlertTriangle,
  Trophy,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EfficiencyData {
  taskId: string;
  taskName: string;
  userId?: string;
  userName?: string;
  metricsCount: number;
  averageEfficiency: number;
  belowMinimum: number;
  atTarget: number;
  excellent: number;
}

interface EmployeeEfficiency {
  userId: string;
  userName: string;
  tasksCompleted: number;
  averageEfficiency: number;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
}

interface EfficiencyDashboardProps {
  taskEfficiency?: EfficiencyData[];
  employeeEfficiency?: EmployeeEfficiency[];
  overallEfficiency: number;
  period?: string;
  alertsCount?: number;
}

const EfficiencyDashboard: React.FC<EfficiencyDashboardProps> = ({
  taskEfficiency = [],
  employeeEfficiency = [],
  overallEfficiency,
  period = 'Esta semana',
  alertsCount = 0,
}) => {
  const getEfficiencyColor = (eff: number) => {
    if (eff >= 100) return 'text-success';
    if (eff >= 80) return 'text-warning';
    return 'text-destructive';
  };

  const getEfficiencyBg = (eff: number) => {
    if (eff >= 100) return 'bg-success/20';
    if (eff >= 80) return 'bg-warning/20';
    return 'bg-destructive/20';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Panel de Eficiencia
          </h2>
          <p className="text-sm text-muted-foreground">{period}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Eficiencia Global</span>
          </div>
          <p className={cn("text-2xl font-bold", getEfficiencyColor(overallEfficiency))}>
            {overallEfficiency.toFixed(0)}%
          </p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-muted-foreground">Excelentes</span>
          </div>
          <p className="text-2xl font-bold text-emerald-500">
            {taskEfficiency.reduce((sum, t) => sum + t.excellent, 0)}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">En Objetivo</span>
          </div>
          <p className="text-2xl font-bold text-success">
            {taskEfficiency.reduce((sum, t) => sum + t.atTarget, 0)}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <span className="text-xs text-muted-foreground">Bajo Mínimo</span>
          </div>
          <p className="text-2xl font-bold text-destructive">
            {taskEfficiency.reduce((sum, t) => sum + t.belowMinimum, 0)}
          </p>
        </div>
      </div>

      {/* Alerts Section */}
      {alertsCount > 0 && (
        <div className="p-4 rounded-xl border border-warning/30 bg-warning/5">
          <div className="flex items-center gap-2 text-warning">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">{alertsCount} alerta(s) de eficiencia</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Hay métricas por debajo del mínimo aceptable que requieren atención.
          </p>
        </div>
      )}

      {/* Task Efficiency Table */}
      {taskEfficiency.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Eficiencia por Tarea
          </h3>
          <div className="border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="text-left text-xs font-medium text-muted-foreground p-3">Tarea</th>
                  <th className="text-center text-xs font-medium text-muted-foreground p-3">Métricas</th>
                  <th className="text-center text-xs font-medium text-muted-foreground p-3">Eficiencia</th>
                  <th className="text-center text-xs font-medium text-muted-foreground p-3">Estado</th>
                </tr>
              </thead>
              <tbody>
                {taskEfficiency.map((task, idx) => (
                  <tr key={task.taskId} className={cn(idx % 2 === 0 ? 'bg-card' : 'bg-secondary/20')}>
                    <td className="p-3">
                      <p className="text-sm font-medium">{task.taskName}</p>
                      {task.userName && (
                        <p className="text-xs text-muted-foreground">{task.userName}</p>
                      )}
                    </td>
                    <td className="p-3 text-center text-sm">{task.metricsCount}</td>
                    <td className="p-3 text-center">
                      <span className={cn("text-sm font-medium", getEfficiencyColor(task.averageEfficiency))}>
                        {task.averageEfficiency.toFixed(0)}%
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center gap-1">
                        {task.excellent > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-500/20 text-emerald-500">
                            {task.excellent} exc
                          </span>
                        )}
                        {task.atTarget > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-success/20 text-success">
                            {task.atTarget} ok
                          </span>
                        )}
                        {task.belowMinimum > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-destructive/20 text-destructive">
                            {task.belowMinimum} bajo
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Employee Ranking */}
      {employeeEfficiency.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Users className="w-4 h-4" />
            Ranking de Empleados
          </h3>
          <div className="space-y-2">
            {employeeEfficiency
              .sort((a, b) => b.averageEfficiency - a.averageEfficiency)
              .map((emp, idx) => (
                <div 
                  key={emp.userId}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card"
                >
                  <span className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                    idx === 0 ? "bg-yellow-500/20 text-yellow-500" :
                    idx === 1 ? "bg-gray-300/20 text-gray-400" :
                    idx === 2 ? "bg-amber-600/20 text-amber-600" :
                    "bg-secondary text-muted-foreground"
                  )}>
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{emp.userName}</p>
                    <p className="text-xs text-muted-foreground">
                      {emp.tasksCompleted} tareas completadas
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={cn("text-lg font-bold", getEfficiencyColor(emp.averageEfficiency))}>
                      {emp.averageEfficiency.toFixed(0)}%
                    </p>
                    <div className={cn(
                      "flex items-center gap-1 text-xs",
                      emp.trend === 'up' ? "text-success" :
                      emp.trend === 'down' ? "text-destructive" :
                      "text-muted-foreground"
                    )}>
                      {emp.trend === 'up' && <TrendingUp className="w-3 h-3" />}
                      {emp.trend === 'down' && <TrendingDown className="w-3 h-3" />}
                      {emp.trend === 'stable' && <span>—</span>}
                      {emp.trendValue > 0 ? '+' : ''}{emp.trendValue}%
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EfficiencyDashboard;
