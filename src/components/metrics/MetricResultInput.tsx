import React, { useState } from 'react';
import { 
  Target, 
  AlertTriangle, 
  Trophy, 
  CheckCircle, 
  XCircle,
  Hash,
  DollarSign,
  Percent,
  Clock,
  Scale,
  MapPin,
  Star,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  TaskMetric,
  MetricResult,
  getEfficiencyStatus,
  formatMetricValue,
  METRIC_TYPE_LABELS,
} from '@/lib/metricTypes';

interface MetricResultInputProps {
  metric: TaskMetric;
  value?: number;
  notes?: string;
  onChange: (value: number, notes?: string) => void;
  readOnly?: boolean;
  showComparison?: boolean;
}

const ICONS: Record<string, React.ElementType> = {
  Hash, DollarSign, Percent, Clock, Scale, MapPin, Star, CheckCircle, Settings
};

const MetricResultInput: React.FC<MetricResultInputProps> = ({ 
  metric, 
  value, 
  notes = '',
  onChange, 
  readOnly = false,
  showComparison = true,
}) => {
  const [localValue, setLocalValue] = useState<string>(value?.toString() || '');
  const [localNotes, setLocalNotes] = useState(notes);
  const [showNotes, setShowNotes] = useState(!!notes);

  const numValue = parseFloat(localValue) || 0;
  const efficiency = getEfficiencyStatus(
    numValue,
    metric.targetValue,
    metric.minimumAcceptable,
    metric.excellenceThreshold
  );

  const TypeIcon = ICONS[METRIC_TYPE_LABELS[metric.metricType].icon] || Hash;

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!metric.allowDecimal && val.includes('.')) return;
    setLocalValue(val);
    onChange(parseFloat(val) || 0, localNotes);
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalNotes(e.target.value);
    onChange(numValue, e.target.value);
  };

  // For boolean type, show toggle instead of input
  if (metric.metricType === 'boolean') {
    const isPositive = numValue >= 1;
    const [positiveLabel, negativeLabel] = metric.unit.split('/');
    
    return (
      <div className="p-4 rounded-lg border border-border bg-card space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-primary/10">
            <TypeIcon className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{metric.name}</p>
            {metric.isRequired && <span className="text-xs text-destructive">* Obligatorio</span>}
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            disabled={readOnly}
            onClick={() => onChange(1, localNotes)}
            className={cn(
              "flex-1 p-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2",
              isPositive 
                ? "border-success bg-success/10 text-success" 
                : "border-border bg-card hover:border-success/50"
            )}
          >
            <CheckCircle className="w-5 h-5" />
            {positiveLabel || 'Sí'}
          </button>
          <button
            disabled={readOnly}
            onClick={() => onChange(0, localNotes)}
            className={cn(
              "flex-1 p-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2",
              !isPositive && localValue !== '' 
                ? "border-destructive bg-destructive/10 text-destructive" 
                : "border-border bg-card hover:border-destructive/50"
            )}
          >
            <XCircle className="w-5 h-5" />
            {negativeLabel || 'No'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-lg border border-border bg-card space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded bg-primary/10">
          <TypeIcon className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">{metric.name}</p>
          <p className="text-xs text-muted-foreground">
            Objetivo: {formatMetricValue(metric.targetValue, metric.unit, metric.metricType, metric.allowDecimal)}
            {metric.isRequired && <span className="text-destructive ml-1">*</span>}
          </p>
        </div>
      </div>

      {/* Input */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Input
            type="number"
            value={localValue}
            onChange={handleValueChange}
            disabled={readOnly}
            placeholder="0"
            step={metric.allowDecimal ? "0.01" : "1"}
            className={cn(
              "pr-16 text-lg font-semibold",
              localValue && efficiency.bgColor
            )}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {metric.unit}
          </span>
        </div>
        
        {showComparison && localValue && (
          <div className={cn(
            "px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap",
            efficiency.bgColor,
            efficiency.color
          )}>
            {efficiency.percentage.toFixed(0)}%
          </div>
        )}
      </div>

      {/* Comparison bar */}
      {showComparison && (
        <div className="space-y-1">
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all",
                efficiency.status === 'excellent' && 'bg-emerald-500',
                efficiency.status === 'good' && 'bg-success',
                efficiency.status === 'warning' && 'bg-warning',
                efficiency.status === 'critical' && 'bg-destructive',
              )}
              style={{ width: `${Math.min(efficiency.percentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              {metric.minimumAcceptable && (
                <>
                  <AlertTriangle className="w-3 h-3 text-warning" />
                  Mín: {metric.minimumAcceptable}
                </>
              )}
            </span>
            <span className="flex items-center gap-1">
              <Target className="w-3 h-3 text-primary" />
              Obj: {metric.targetValue}
            </span>
            <span className="flex items-center gap-1">
              {metric.excellenceThreshold && (
                <>
                  <Trophy className="w-3 h-3 text-emerald-500" />
                  Exc: {metric.excellenceThreshold}
                </>
              )}
            </span>
          </div>
        </div>
      )}

      {/* Status indicator */}
      {localValue && (
        <div className={cn("p-2 rounded-lg text-xs flex items-center gap-2", efficiency.bgColor)}>
          {efficiency.status === 'excellent' && <Trophy className="w-4 h-4 text-emerald-500" />}
          {efficiency.status === 'good' && <CheckCircle className="w-4 h-4 text-success" />}
          {efficiency.status === 'warning' && <AlertTriangle className="w-4 h-4 text-warning" />}
          {efficiency.status === 'critical' && <XCircle className="w-4 h-4 text-destructive" />}
          <span className={efficiency.color}>
            {efficiency.status === 'excellent' && '¡Excelente! Superaste las expectativas'}
            {efficiency.status === 'good' && 'Objetivo alcanzado'}
            {efficiency.status === 'warning' && 'Bajo objetivo, pero aceptable'}
            {efficiency.status === 'critical' && 'Por debajo del mínimo aceptable'}
          </span>
        </div>
      )}

      {/* Notes toggle and input */}
      {!readOnly && (
        <div>
          {!showNotes ? (
            <button
              onClick={() => setShowNotes(true)}
              className="text-xs text-primary hover:underline"
            >
              + Agregar nota
            </button>
          ) : (
            <Textarea
              value={localNotes}
              onChange={handleNotesChange}
              placeholder="Notas u observaciones..."
              rows={2}
              className="text-sm"
            />
          )}
        </div>
      )}

      {readOnly && notes && (
        <p className="text-xs text-muted-foreground italic">{notes}</p>
      )}
    </div>
  );
};

export default MetricResultInput;
