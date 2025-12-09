import React from 'react';
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  CheckCircle,
  Clock,
  Target,
  Zap,
  Users,
  ArrowRight,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

type OperationStatus = 'green' | 'yellow' | 'red';

interface PriorityAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  action?: {
    label: string;
    path: string;
  };
}

interface Prediction {
  area: string;
  riskLevel: 'high' | 'medium' | 'low';
  reason: string;
}

interface ExecutiveDashboardProps {
  operationStatus: OperationStatus;
  globalEfficiency: number;
  efficiencyTrend: number;
  efficiencyTarget: number;
  priorityAlerts: PriorityAlert[];
  predictions: Prediction[];
  quickStats?: {
    tasksCompleted: number;
    tasksTotal: number;
    errorsToday: number;
    employeesActive: number;
  };
}

const statusConfig = {
  green: {
    label: 'OPERACIÓN ESTABLE',
    color: 'text-success',
    bg: 'bg-success/10',
    border: 'border-success/30',
    icon: CheckCircle,
    glow: 'shadow-success/20',
  },
  yellow: {
    label: 'ATENCIÓN REQUERIDA',
    color: 'text-warning',
    bg: 'bg-warning/10',
    border: 'border-warning/30',
    icon: AlertTriangle,
    glow: 'shadow-warning/20',
  },
  red: {
    label: 'ACCIÓN URGENTE',
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    border: 'border-destructive/30',
    icon: AlertTriangle,
    glow: 'shadow-destructive/20',
  },
};

const alertTypeConfig = {
  critical: {
    icon: AlertTriangle,
    bg: 'bg-destructive/10',
    border: 'border-destructive/30',
    color: 'text-destructive',
    badge: 'bg-destructive text-destructive-foreground',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-warning/10',
    border: 'border-warning/30',
    color: 'text-warning',
    badge: 'bg-warning text-warning-foreground',
  },
  info: {
    icon: Activity,
    bg: 'bg-primary/10',
    border: 'border-primary/30',
    color: 'text-primary',
    badge: 'bg-primary text-primary-foreground',
  },
};

const riskConfig = {
  high: { color: 'text-destructive', bg: 'bg-destructive/10', label: 'Alto' },
  medium: { color: 'text-warning', bg: 'bg-warning/10', label: 'Medio' },
  low: { color: 'text-muted-foreground', bg: 'bg-secondary', label: 'Bajo' },
};

const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  operationStatus,
  globalEfficiency,
  efficiencyTrend,
  efficiencyTarget,
  priorityAlerts,
  predictions,
  quickStats,
}) => {
  const navigate = useNavigate();
  const config = statusConfig[operationStatus];
  const StatusIcon = config.icon;
  const isOnTarget = globalEfficiency >= efficiencyTarget;

  return (
    <div className="space-y-6">
      {/* Traffic Light Header */}
      <div className={cn(
        "p-6 rounded-2xl border-2 transition-all",
        config.bg,
        config.border,
        "shadow-lg",
        config.glow
      )}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Traffic Light */}
            <div className="flex flex-col gap-1.5">
              <div className={cn(
                "w-4 h-4 rounded-full transition-all",
                operationStatus === 'red' ? 'bg-destructive animate-pulse' : 'bg-destructive/20'
              )} />
              <div className={cn(
                "w-4 h-4 rounded-full transition-all",
                operationStatus === 'yellow' ? 'bg-warning animate-pulse' : 'bg-warning/20'
              )} />
              <div className={cn(
                "w-4 h-4 rounded-full transition-all",
                operationStatus === 'green' ? 'bg-success animate-pulse' : 'bg-success/20'
              )} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <StatusIcon className={cn("w-5 h-5", config.color)} />
                <span className={cn("font-bold text-lg", config.color)}>
                  {config.label}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
          </div>

          {/* Global Efficiency */}
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-4xl font-bold",
                  isOnTarget ? 'text-success' : 'text-warning'
                )}>
                  {globalEfficiency}%
                </span>
                <div className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                  efficiencyTrend >= 0 ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
                )}>
                  {efficiencyTrend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {efficiencyTrend >= 0 ? '+' : ''}{efficiencyTrend}%
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Eficiencia Global • Meta: {efficiencyTarget}% {isOnTarget ? '✓' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      {quickStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2 text-primary mb-1">
              <Target className="w-4 h-4" />
              <span className="text-xs font-medium">Tareas Hoy</span>
            </div>
            <p className="text-2xl font-bold">
              {quickStats.tasksCompleted}/{quickStats.tasksTotal}
            </p>
            <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${(quickStats.tasksCompleted / quickStats.tasksTotal) * 100}%` }}
              />
            </div>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2 text-warning mb-1">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs font-medium">Errores Hoy</span>
            </div>
            <p className={cn(
              "text-2xl font-bold",
              quickStats.errorsToday > 0 ? 'text-warning' : 'text-success'
            )}>
              {quickStats.errorsToday}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2 text-success mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs font-medium">Equipo Activo</span>
            </div>
            <p className="text-2xl font-bold text-success">
              {quickStats.employeesActive}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2 text-primary mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-medium">Productividad</span>
            </div>
            <p className="text-2xl font-bold">
              {((quickStats.tasksCompleted / quickStats.employeesActive) || 0).toFixed(1)}
            </p>
            <p className="text-xs text-muted-foreground">tareas/persona</p>
          </div>
        </div>
      )}

      {/* Priority Alerts */}
      {priorityAlerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Zap className="w-4 h-4 text-warning" />
            Acciones Prioritarias ({priorityAlerts.length})
          </h3>
          <div className="space-y-2">
            {priorityAlerts.slice(0, 3).map((alert) => {
              const alertConfig = alertTypeConfig[alert.type];
              const AlertIcon = alertConfig.icon;
              return (
                <div
                  key={alert.id}
                  className={cn(
                    "p-4 rounded-xl border transition-all hover:shadow-md",
                    alertConfig.bg,
                    alertConfig.border
                  )}
                >
                  <div className="flex items-start gap-3">
                    <AlertIcon className={cn("w-5 h-5 mt-0.5", alertConfig.color)} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-medium",
                          alertConfig.badge
                        )}>
                          {alert.type === 'critical' ? 'Crítico' : alert.type === 'warning' ? 'Atención' : 'Info'}
                        </span>
                      </div>
                      <p className="font-medium text-foreground">{alert.title}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{alert.description}</p>
                    </div>
                    {alert.action && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="shrink-0"
                        onClick={() => navigate(alert.action!.path)}
                      >
                        {alert.action.label}
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Predictions */}
      {predictions.length > 0 && (
        <div className="p-4 rounded-xl border border-primary/20 bg-primary/5">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-primary" />
            Predicción de Riesgos
          </h3>
          <div className="space-y-2">
            {predictions.map((pred, idx) => {
              const risk = riskConfig[pred.riskLevel];
              return (
                <div key={idx} className="flex items-center gap-3 text-sm">
                  <span className={cn(
                    "px-2 py-0.5 rounded text-xs font-medium",
                    risk.bg,
                    risk.color
                  )}>
                    {risk.label}
                  </span>
                  <span className="font-medium">{pred.area}</span>
                  <span className="text-muted-foreground">— {pred.reason}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExecutiveDashboard;
