import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Check, 
  ChevronRight,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { TaskMetric, MetricResult, formatMetricValue, getEfficiencyStatus } from '@/lib/metricTypes';

interface MetricWithResult {
  metric: TaskMetric;
  result?: number;
}

interface QuickMetricModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskName: string;
  metrics: MetricWithResult[];
  onSave: (results: { metricId: string; value: number }[]) => void;
  onSkip: () => void;
  isCompletionFlow?: boolean;
}

export const QuickMetricModal: React.FC<QuickMetricModalProps> = ({
  isOpen,
  onClose,
  taskName,
  metrics,
  onSave,
  onSkip,
  isCompletionFlow = false
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [values, setValues] = useState<Record<string, number>>({});

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      // Pre-fill with existing results
      const initialValues: Record<string, number> = {};
      metrics.forEach(m => {
        if (m.result !== undefined) {
          initialValues[m.metric.id] = m.result;
        }
      });
      setValues(initialValues);
    }
  }, [isOpen, metrics]);

  const currentMetric = metrics[currentIndex];
  const isLastMetric = currentIndex === metrics.length - 1;
  const currentValue = values[currentMetric?.metric.id] ?? '';

  const handleValueChange = (value: string) => {
    const numValue = currentMetric.metric.allowDecimal 
      ? parseFloat(value) || 0
      : parseInt(value) || 0;
    setValues(prev => ({
      ...prev,
      [currentMetric.metric.id]: numValue
    }));
  };

  const handleNext = () => {
    if (isLastMetric) {
      // Save all results
      const results = Object.entries(values).map(([metricId, value]) => ({
        metricId,
        value
      }));
      onSave(results);
      onClose();
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleSkip = () => {
    onSkip();
    onClose();
  };

  if (!currentMetric) return null;

  const { metric } = currentMetric;
  const numValue = typeof currentValue === 'number' ? currentValue : 0;
  const efficiency = metric.targetValue > 0 ? (numValue / metric.targetValue) * 100 : 0;
  const status = getEfficiencyStatus(numValue, metric.targetValue, metric.minimumAcceptable, metric.excellenceThreshold);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            {isCompletionFlow ? '¿Registrar resultados?' : 'Registrar resultados'}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {taskName} • {currentIndex + 1}/{metrics.length}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 pt-2">
          {/* Current metric */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{metric.name}</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Target className="w-3 h-3" />
                {formatMetricValue(metric.targetValue, metric.unit, metric.metricType)}
              </span>
            </div>
            
            {/* Input */}
            <div className="relative">
              <Input
                type="number"
                placeholder={`Ej: ${metric.targetValue}`}
                value={currentValue === '' ? '' : currentValue}
                onChange={(e) => handleValueChange(e.target.value)}
                className="text-lg font-medium pr-16"
                step={metric.allowDecimal ? '0.01' : '1'}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                {metric.unit}
              </span>
            </div>
            
            {/* Progress bar */}
            {numValue > 0 && (
              <div className="space-y-1.5">
                <Progress 
                  value={Math.min(efficiency, 100)} 
                  className={cn("h-2", status.bgColor)}
                />
                <div className="flex items-center justify-between text-xs">
                  <span className={cn("font-medium", status.color)}>
                    {efficiency.toFixed(0)}%
                  </span>
                  {efficiency >= 100 && (
                    <span className="text-success flex items-center gap-1">
                      <Check className="w-3 h-3" /> Meta alcanzada
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Navigation dots */}
          {metrics.length > 1 && (
            <div className="flex justify-center gap-1.5">
              {metrics.map((_, idx) => (
                <div 
                  key={idx}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    idx === currentIndex ? "bg-primary" : "bg-muted"
                  )}
                />
              ))}
            </div>
          )}
          
          {/* Actions */}
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              className="flex-1"
              onClick={handleSkip}
            >
              Omitir
            </Button>
            <Button 
              className="flex-1 gap-1"
              onClick={handleNext}
              disabled={numValue <= 0}
            >
              {isLastMetric ? (
                <>
                  <Check className="w-4 h-4" />
                  Guardar
                </>
              ) : (
                <>
                  Siguiente
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Simple metric indicator badge for TaskCard
interface MetricIndicatorProps {
  metricsCount: number;
  hasResults: boolean;
  efficiency?: number;
  onClick?: () => void;
}

export const MetricIndicator: React.FC<MetricIndicatorProps> = ({
  metricsCount,
  hasResults,
  efficiency,
  onClick
}) => {
  if (metricsCount === 0) return null;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs transition-colors",
        hasResults 
          ? "bg-primary/10 text-primary hover:bg-primary/20"
          : "bg-muted text-muted-foreground hover:bg-muted/80"
      )}
      title={hasResults ? `Eficiencia: ${efficiency?.toFixed(0)}%` : `${metricsCount} métricas`}
    >
      <BarChart3 className="w-3 h-3" />
      {hasResults ? `${efficiency?.toFixed(0)}%` : metricsCount}
    </button>
  );
};

// Read-only results view
interface MetricResultsViewProps {
  isOpen: boolean;
  onClose: () => void;
  taskName: string;
  metrics: MetricWithResult[];
}

export const MetricResultsView: React.FC<MetricResultsViewProps> = ({
  isOpen,
  onClose,
  taskName,
  metrics
}) => {
  const registeredMetrics = metrics.filter(m => m.result !== undefined);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            Resultados registrados
          </DialogTitle>
          <DialogDescription className="text-xs">{taskName}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 pt-2">
          {registeredMetrics.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-4">
              No hay resultados registrados
            </p>
          ) : (
            registeredMetrics.map(({ metric, result }) => {
              const efficiency = metric.targetValue > 0 ? ((result || 0) / metric.targetValue) * 100 : 0;
              const status = getEfficiencyStatus(result || 0, metric.targetValue, metric.minimumAcceptable, metric.excellenceThreshold);
              
              return (
                <div key={metric.id} className="p-3 rounded-lg bg-muted/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{metric.name}</span>
                    <span className={cn("text-xs font-medium", status.color)}>
                      {efficiency.toFixed(0)}%
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(efficiency, 100)} 
                    className="h-1.5"
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {formatMetricValue(result || 0, metric.unit, metric.metricType)}
                    </span>
                    <span>
                      Meta: {formatMetricValue(metric.targetValue, metric.unit, metric.metricType)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        <Button variant="outline" className="w-full mt-2" onClick={onClose}>
          Cerrar
        </Button>
      </DialogContent>
    </Dialog>
  );
};
