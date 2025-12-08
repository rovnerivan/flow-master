import React from 'react';
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  BarChart3,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  TaskMetric, 
  MetricResult, 
  getEfficiencyStatus, 
  formatMetricValue,
  calculateOverallEfficiency,
} from '@/lib/metricTypes';

interface MetricWithResult {
  metric: TaskMetric;
  result?: MetricResult;
}

interface MetricsSummaryCardProps {
  metrics: MetricWithResult[];
  compact?: boolean;
  onClick?: () => void;
  showPendingIndicator?: boolean;
}

const MetricsSummaryCard: React.FC<MetricsSummaryCardProps> = ({ 
  metrics, 
  compact = false,
  onClick,
  showPendingIndicator = true,
}) => {
  const registeredMetrics = metrics.filter(m => m.result);
  const pendingMetrics = metrics.filter(m => !m.result && m.metric.isRequired);
  
  const overallEfficiency = calculateOverallEfficiency(
    registeredMetrics.map(m => ({
      actual: m.result!.actualValue,
      target: m.metric.targetValue,
    }))
  );

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

  if (metrics.length === 0) {
    return null;
  }

  // Compact view for task cards
  if (compact) {
    return (
      <div 
        className={cn(
          "flex items-center gap-2 p-2 rounded-lg bg-secondary/30",
          onClick && "cursor-pointer hover:bg-secondary/50 transition-colors"
        )}
        onClick={onClick}
      >
        <BarChart3 className="w-4 h-4 text-primary" />
        <div className="flex-1 min-w-0">
          {registeredMetrics.length > 0 ? (
            <div className="flex items-center gap-2">
              <span className={cn("text-sm font-medium", getEfficiencyColor(overallEfficiency))}>
                {overallEfficiency.toFixed(0)}% eficiencia
              </span>
              <span className="text-xs text-muted-foreground">
                ({registeredMetrics.length}/{metrics.length} métricas)
              </span>
            </div>
          ) : pendingMetrics.length > 0 ? (
            <span className="text-sm text-warning">
              {pendingMetrics.length} métrica(s) pendiente(s)
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">
              Sin métricas registradas
            </span>
          )}
        </div>
        {onClick && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
      </div>
    );
  }

  // Full view
  return (
    <div className="space-y-3">
      {/* Header with overall efficiency */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Métricas</span>
        </div>
        {registeredMetrics.length > 0 && (
          <div className={cn(
            "px-2 py-1 rounded-full text-xs font-medium",
            getEfficiencyBg(overallEfficiency),
            getEfficiencyColor(overallEfficiency)
          )}>
            Eficiencia: {overallEfficiency.toFixed(0)}%
          </div>
        )}
      </div>

      {/* Pending indicator */}
      {showPendingIndicator && pendingMetrics.length > 0 && (
        <div className="p-2 rounded-lg bg-warning/10 border border-warning/20 text-xs text-warning flex items-center gap-2">
          <Target className="w-4 h-4" />
          {pendingMetrics.length} métrica(s) requerida(s) sin registrar
        </div>
      )}

      {/* Metrics list */}
      <div className="space-y-2">
        {metrics.map(({ metric, result }) => {
          const efficiency = result 
            ? getEfficiencyStatus(result.actualValue, metric.targetValue, metric.minimumAcceptable, metric.excellenceThreshold)
            : null;

          return (
            <div 
              key={metric.id}
              className={cn(
                "flex items-center gap-3 p-2 rounded-lg",
                result ? efficiency?.bgColor : "bg-secondary/30"
              )}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{metric.name}</p>
                <div className="flex items-center gap-2 text-xs">
                  {result ? (
                    <>
                      <span className={efficiency?.color}>
                        {formatMetricValue(result.actualValue, metric.unit, metric.metricType, metric.allowDecimal)}
                      </span>
                      <span className="text-muted-foreground">/</span>
                      <span className="text-muted-foreground">
                        {formatMetricValue(metric.targetValue, metric.unit, metric.metricType, metric.allowDecimal)}
                      </span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">
                      Objetivo: {formatMetricValue(metric.targetValue, metric.unit, metric.metricType, metric.allowDecimal)}
                      {metric.isRequired && <span className="text-destructive ml-1">*</span>}
                    </span>
                  )}
                </div>
              </div>
              
              {result && efficiency && (
                <div className={cn("flex items-center gap-1 text-sm font-medium", efficiency.color)}>
                  {efficiency.percentage >= 100 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : efficiency.percentage >= 80 ? (
                    <Minus className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {efficiency.percentage.toFixed(0)}%
                </div>
              )}
              
              {!result && metric.isRequired && (
                <span className="px-2 py-0.5 rounded-full text-xs bg-warning/20 text-warning">
                  Pendiente
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MetricsSummaryCard;
