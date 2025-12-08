import React, { useState } from 'react';
import { 
  Clock, 
  AlertTriangle, 
  Users, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  Target,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProcessAnalytics, StepAnalytics, EmployeeProcessStats } from '@/lib/processTypes';

interface ProcessAnalyticsDashboardProps {
  processId: string;
  processName: string;
}

// Mock analytics data
const mockAnalytics: ProcessAnalytics = {
  processId: '1',
  processName: 'Preparación de Pedidos',
  totalCompletions: 156,
  averageTotalTime: 1080, // 18 min in seconds
  estimatedTotalTime: 900, // 15 min
  timeEfficiency: 83.3,
  overallConfusionRate: 12.5,
  stepAnalytics: [
    { stepId: 's1', stepTitle: 'Recibir y revisar la orden', averageTime: 150, estimatedTime: 120, confusionRate: 5, completionCount: 156, confusionCount: 8 },
    { stepId: 's2', stepTitle: 'Localizar productos', averageTime: 240, estimatedTime: 180, confusionRate: 8, completionCount: 154, confusionCount: 12 },
    { stepId: 's3', stepTitle: 'Verificar cantidades', averageTime: 180, estimatedTime: 120, confusionRate: 25, completionCount: 152, confusionCount: 38 },
    { stepId: 's4', stepTitle: 'Inspección de calidad', averageTime: 200, estimatedTime: 120, confusionRate: 18, completionCount: 150, confusionCount: 27 },
    { stepId: 's5', stepTitle: 'Empacar productos', averageTime: 180, estimatedTime: 180, confusionRate: 4, completionCount: 148, confusionCount: 6 },
    { stepId: 's6', stepTitle: 'Generar etiqueta', averageTime: 90, estimatedTime: 120, confusionRate: 2, completionCount: 147, confusionCount: 3 },
  ],
  completionsByEmployee: [
    { employeeId: 'e1', employeeName: 'Carlos Martínez', completions: 45, averageTime: 960, confusionRate: 8, lastCompleted: '2024-01-15' },
    { employeeId: 'e2', employeeName: 'Ana García', completions: 38, averageTime: 1020, confusionRate: 10, lastCompleted: '2024-01-15' },
    { employeeId: 'e3', employeeName: 'Luis Rodríguez', completions: 32, averageTime: 1200, confusionRate: 18, lastCompleted: '2024-01-14' },
    { employeeId: 'e4', employeeName: 'María López', completions: 28, averageTime: 1080, confusionRate: 12, lastCompleted: '2024-01-15' },
    { employeeId: 'e5', employeeName: 'Pedro Sánchez', completions: 13, averageTime: 1320, confusionRate: 22, lastCompleted: '2024-01-13' },
  ],
};

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
};

const TimeComparisonBar: React.FC<{ actual: number; estimated: number; label: string }> = ({ 
  actual, 
  estimated, 
  label 
}) => {
  const efficiency = (estimated / actual) * 100;
  const isOverTime = actual > estimated;
  const maxTime = Math.max(actual, estimated);
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn(
          "font-medium",
          isOverTime ? "text-warning" : "text-success"
        )}>
          {formatTime(actual)} / {formatTime(estimated)}
        </span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden relative">
        <div 
          className="absolute inset-y-0 left-0 bg-muted-foreground/30 rounded-full"
          style={{ width: `${(estimated / maxTime) * 100}%` }}
        />
        <div 
          className={cn(
            "absolute inset-y-0 left-0 rounded-full transition-all",
            isOverTime ? "bg-warning" : "bg-success"
          )}
          style={{ width: `${(actual / maxTime) * 100}%` }}
        />
      </div>
    </div>
  );
};

const ConfusionIndicator: React.FC<{ rate: number; count?: number }> = ({ rate, count }) => {
  const getColor = () => {
    if (rate <= 5) return 'text-success bg-success/10';
    if (rate <= 15) return 'text-warning bg-warning/10';
    return 'text-destructive bg-destructive/10';
  };

  return (
    <div className={cn("px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1", getColor())}>
      <HelpCircle className="w-3 h-3" />
      {rate.toFixed(1)}%
      {count !== undefined && <span className="text-muted-foreground">({count})</span>}
    </div>
  );
};

export const ProcessAnalyticsDashboard: React.FC<ProcessAnalyticsDashboardProps> = ({
  processId,
  processName,
}) => {
  const [showAllEmployees, setShowAllEmployees] = useState(false);
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  
  const analytics = mockAnalytics;
  const displayedEmployees = showAllEmployees 
    ? analytics.completionsByEmployee 
    : analytics.completionsByEmployee.slice(0, 3);

  // Find most problematic step
  const mostConfusingStep = [...analytics.stepAnalytics].sort((a, b) => b.confusionRate - a.confusionRate)[0];
  const slowestStep = [...analytics.stepAnalytics].sort((a, b) => 
    (b.averageTime / b.estimatedTime) - (a.averageTime / a.estimatedTime)
  )[0];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Target className="w-4 h-4" />
            Completados
          </div>
          <p className="text-2xl font-bold text-foreground">{analytics.totalCompletions}</p>
        </div>
        
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Clock className="w-4 h-4" />
            Eficiencia tiempo
          </div>
          <p className={cn(
            "text-2xl font-bold",
            analytics.timeEfficiency >= 90 ? "text-success" : 
            analytics.timeEfficiency >= 70 ? "text-warning" : "text-destructive"
          )}>
            {analytics.timeEfficiency.toFixed(0)}%
          </p>
        </div>
        
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <AlertTriangle className="w-4 h-4" />
            Tasa confusión
          </div>
          <p className={cn(
            "text-2xl font-bold",
            analytics.overallConfusionRate <= 10 ? "text-success" : 
            analytics.overallConfusionRate <= 20 ? "text-warning" : "text-destructive"
          )}>
            {analytics.overallConfusionRate.toFixed(1)}%
          </p>
        </div>
        
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Users className="w-4 h-4" />
            Empleados activos
          </div>
          <p className="text-2xl font-bold text-foreground">{analytics.completionsByEmployee.length}</p>
        </div>
      </div>

      {/* Alerts */}
      {(mostConfusingStep.confusionRate > 15 || slowestStep.averageTime > slowestStep.estimatedTime * 1.5) && (
        <div className="p-4 rounded-xl bg-warning/10 border border-warning/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium text-foreground">Puntos de atención detectados</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {mostConfusingStep.confusionRate > 15 && (
                  <li>• Paso "{mostConfusingStep.stepTitle}" tiene {mostConfusingStep.confusionRate.toFixed(0)}% de confusión</li>
                )}
                {slowestStep.averageTime > slowestStep.estimatedTime * 1.5 && (
                  <li>• Paso "{slowestStep.stepTitle}" toma {((slowestStep.averageTime / slowestStep.estimatedTime - 1) * 100).toFixed(0)}% más del tiempo estimado</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Time Analysis */}
      <div className="p-4 rounded-xl bg-card border border-border space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Tiempo Real vs Estimado
          </h3>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-muted-foreground/30" /> Estimado
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-success" /> Real (en tiempo)
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-warning" /> Real (excedido)
            </span>
          </div>
        </div>
        
        <TimeComparisonBar 
          actual={analytics.averageTotalTime} 
          estimated={analytics.estimatedTotalTime} 
          label="Tiempo total del proceso"
        />
        
        <div className="space-y-3 pt-2 border-t border-border">
          <p className="text-sm text-muted-foreground">Por paso:</p>
          {analytics.stepAnalytics.map((step) => (
            <TimeComparisonBar 
              key={step.stepId}
              actual={step.averageTime} 
              estimated={step.estimatedTime} 
              label={step.stepTitle}
            />
          ))}
        </div>
      </div>

      {/* Confusion Analysis */}
      <div className="p-4 rounded-xl bg-card border border-border space-y-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <HelpCircle className="w-4 h-4" />
          Análisis de Confusión por Paso
        </h3>
        
        <div className="space-y-2">
          {analytics.stepAnalytics
            .sort((a, b) => b.confusionRate - a.confusionRate)
            .map((step, index) => (
              <div 
                key={step.stepId}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer",
                  step.confusionRate > 15 
                    ? "border-warning/30 bg-warning/5 hover:border-warning/50" 
                    : "border-border hover:border-primary/30"
                )}
                onClick={() => setSelectedStep(selectedStep === step.stepId ? null : step.stepId)}
              >
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                    step.confusionRate > 15 
                      ? "bg-warning/20 text-warning" 
                      : "bg-primary/10 text-primary"
                  )}>
                    {index + 1}
                  </span>
                  <span className="text-sm text-foreground">{step.stepTitle}</span>
                </div>
                <ConfusionIndicator rate={step.confusionRate} count={step.confusionCount} />
              </div>
            ))}
        </div>
      </div>

      {/* Employee Comparison */}
      <div className="p-4 rounded-xl bg-card border border-border space-y-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Users className="w-4 h-4" />
          Comparativa entre Empleados
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-2 font-medium text-muted-foreground">Empleado</th>
                <th className="text-center py-2 px-2 font-medium text-muted-foreground">Completados</th>
                <th className="text-center py-2 px-2 font-medium text-muted-foreground">Tiempo prom.</th>
                <th className="text-center py-2 px-2 font-medium text-muted-foreground">Eficiencia</th>
                <th className="text-center py-2 px-2 font-medium text-muted-foreground">Confusión</th>
              </tr>
            </thead>
            <tbody>
              {displayedEmployees.map((emp, index) => {
                const efficiency = (analytics.estimatedTotalTime / emp.averageTime) * 100;
                const isTopPerformer = index === 0;
                
                return (
                  <tr key={emp.employeeId} className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{emp.employeeName}</p>
                          {isTopPerformer && (
                            <span className="text-xs text-success">⭐ Mejor desempeño</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="text-center py-3 px-2 font-medium">{emp.completions}</td>
                    <td className="text-center py-3 px-2">
                      <span className={cn(
                        emp.averageTime <= analytics.estimatedTotalTime ? "text-success" : "text-muted-foreground"
                      )}>
                        {formatTime(emp.averageTime)}
                      </span>
                    </td>
                    <td className="text-center py-3 px-2">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-medium",
                        efficiency >= 90 ? "bg-success/10 text-success" :
                        efficiency >= 70 ? "bg-warning/10 text-warning" :
                        "bg-destructive/10 text-destructive"
                      )}>
                        {efficiency.toFixed(0)}%
                      </span>
                    </td>
                    <td className="text-center py-3 px-2">
                      <ConfusionIndicator rate={emp.confusionRate} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {analytics.completionsByEmployee.length > 3 && (
          <button
            onClick={() => setShowAllEmployees(!showAllEmployees)}
            className="w-full py-2 text-sm text-primary hover:text-primary/80 flex items-center justify-center gap-1"
          >
            {showAllEmployees ? (
              <>Ver menos <ChevronUp className="w-4 h-4" /></>
            ) : (
              <>Ver todos ({analytics.completionsByEmployee.length}) <ChevronDown className="w-4 h-4" /></>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProcessAnalyticsDashboard;
