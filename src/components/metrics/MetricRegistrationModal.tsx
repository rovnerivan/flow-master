import React, { useState } from 'react';
import { 
  X, 
  Target, 
  CheckCircle,
  AlertTriangle,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  TaskMetric, 
  MetricResult,
  calculateOverallEfficiency,
} from '@/lib/metricTypes';
import MetricResultInput from './MetricResultInput';

interface MetricRegistrationModalProps {
  open: boolean;
  onClose: () => void;
  taskTitle: string;
  metrics: TaskMetric[];
  existingResults?: Map<string, MetricResult>;
  onSubmit: (results: { metricId: string; value: number; notes?: string }[]) => void;
  isCompletionFlow?: boolean; // True when registering as part of task completion
}

const MetricRegistrationModal: React.FC<MetricRegistrationModalProps> = ({
  open,
  onClose,
  taskTitle,
  metrics,
  existingResults = new Map(),
  onSubmit,
  isCompletionFlow = false,
}) => {
  const [values, setValues] = useState<Record<string, { value: number; notes?: string }>>(
    () => {
      const initial: Record<string, { value: number; notes?: string }> = {};
      metrics.forEach(m => {
        const existing = existingResults.get(m.id);
        if (existing) {
          initial[m.id] = { value: existing.actualValue, notes: existing.notes };
        }
      });
      return initial;
    }
  );

  if (!open) return null;

  const handleValueChange = (metricId: string, value: number, notes?: string) => {
    setValues(prev => ({
      ...prev,
      [metricId]: { value, notes },
    }));
  };

  const requiredMetrics = metrics.filter(m => m.isRequired);
  const allRequiredFilled = requiredMetrics.every(m => values[m.id]?.value !== undefined);

  const filledMetrics = Object.entries(values).filter(([_, v]) => v.value !== undefined);
  const overallEfficiency = calculateOverallEfficiency(
    filledMetrics.map(([id, v]) => {
      const metric = metrics.find(m => m.id === id);
      return {
        actual: v.value,
        target: metric?.targetValue || 1,
      };
    })
  );

  const handleSubmit = () => {
    const results = Object.entries(values)
      .filter(([_, v]) => v.value !== undefined)
      .map(([metricId, v]) => ({
        metricId,
        value: v.value,
        notes: v.notes,
      }));
    
    onSubmit(results);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Registrar Resultados
            </h2>
            <p className="text-sm text-muted-foreground">{taskTitle}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* Efficiency summary */}
          {filledMetrics.length > 0 && (
            <div className={cn(
              "p-3 rounded-lg flex items-center justify-between",
              overallEfficiency >= 100 ? "bg-success/10" : overallEfficiency >= 80 ? "bg-warning/10" : "bg-destructive/10"
            )}>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Eficiencia Global</span>
              </div>
              <span className={cn(
                "text-xl font-bold",
                overallEfficiency >= 100 ? "text-success" : overallEfficiency >= 80 ? "text-warning" : "text-destructive"
              )}>
                {overallEfficiency.toFixed(0)}%
              </span>
            </div>
          )}

          {/* Required indicator */}
          {!allRequiredFilled && requiredMetrics.length > 0 && (
            <div className="p-2 rounded-lg bg-warning/10 border border-warning/20 text-xs text-warning flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Completa las métricas obligatorias (*) para continuar
            </div>
          )}

          {/* Metrics inputs */}
          <div className="space-y-3">
            {metrics.map(metric => (
              <MetricResultInput
                key={metric.id}
                metric={metric}
                value={values[metric.id]?.value}
                notes={values[metric.id]?.notes}
                onChange={(value, notes) => handleValueChange(metric.id, value, notes)}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex gap-3 shrink-0">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button 
            variant="hero" 
            onClick={handleSubmit}
            disabled={isCompletionFlow && !allRequiredFilled}
            className="flex-1 gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            {isCompletionFlow ? 'Registrar y Completar' : 'Guardar Resultados'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MetricRegistrationModal;
