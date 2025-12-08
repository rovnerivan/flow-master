import React, { useState } from 'react';
import { 
  Plus, 
  X, 
  GripVertical, 
  Hash, 
  DollarSign, 
  Percent, 
  Clock, 
  Scale, 
  MapPin, 
  Star, 
  CheckCircle, 
  Settings,
  Target,
  AlertTriangle,
  Trophy,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  TaskMetric,
  MetricType,
  AggregationType,
  METRIC_UNITS,
  METRIC_TYPE_LABELS,
  AGGREGATION_LABELS,
} from '@/lib/metricTypes';

interface MetricConfigEditorProps {
  metrics: Partial<TaskMetric>[];
  onChange: (metrics: Partial<TaskMetric>[]) => void;
  readOnly?: boolean;
}

const ICONS: Record<string, React.ElementType> = {
  Hash, DollarSign, Percent, Clock, Scale, MapPin, Star, CheckCircle, Settings
};

const MetricConfigEditor: React.FC<MetricConfigEditorProps> = ({ metrics, onChange, readOnly = false }) => {
  const [expandedMetric, setExpandedMetric] = useState<number | null>(null);

  const addMetric = () => {
    const newMetric: Partial<TaskMetric> = {
      name: '',
      metricType: 'quantity',
      unit: 'Unidades',
      targetValue: 0,
      isRequired: true,
      allowDecimal: false,
      aggregationType: 'per_instance',
      orderIndex: metrics.length,
    };
    onChange([...metrics, newMetric]);
    setExpandedMetric(metrics.length);
  };

  const updateMetric = (index: number, updates: Partial<TaskMetric>) => {
    const updated = [...metrics];
    updated[index] = { ...updated[index], ...updates };
    
    // If type changed, reset unit to first of that type
    if (updates.metricType && updates.metricType !== metrics[index].metricType) {
      const units = METRIC_UNITS[updates.metricType];
      updated[index].unit = units[0] || '';
    }
    
    onChange(updated);
  };

  const removeMetric = (index: number) => {
    const updated = metrics.filter((_, i) => i !== index);
    onChange(updated.map((m, i) => ({ ...m, orderIndex: i })));
    if (expandedMetric === index) setExpandedMetric(null);
  };

  const moveMetric = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= metrics.length) return;
    
    const updated = [...metrics];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onChange(updated.map((m, i) => ({ ...m, orderIndex: i })));
  };

  if (readOnly && metrics.length === 0) {
    return (
      <div className="text-sm text-muted-foreground p-4 text-center border border-dashed rounded-lg">
        No hay métricas configuradas
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm">Métricas y Objetivos</span>
          {metrics.length > 0 && (
            <span className="px-1.5 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
              {metrics.length}
            </span>
          )}
        </div>
        {!readOnly && (
          <Button variant="outline" size="sm" onClick={addMetric} className="gap-1">
            <Plus className="w-3 h-3" />
            Agregar métrica
          </Button>
        )}
      </div>

      {/* Metrics list */}
      <div className="space-y-2">
        {metrics.map((metric, index) => {
          const TypeIcon = ICONS[METRIC_TYPE_LABELS[metric.metricType || 'quantity'].icon] || Hash;
          const isExpanded = expandedMetric === index;
          const units = METRIC_UNITS[metric.metricType || 'quantity'];

          return (
            <div 
              key={index}
              className={cn(
                "border rounded-lg transition-all",
                isExpanded ? "border-primary bg-card" : "border-border bg-secondary/30"
              )}
            >
              {/* Collapsed header */}
              <div 
                className="flex items-center gap-2 p-3 cursor-pointer"
                onClick={() => !readOnly && setExpandedMetric(isExpanded ? null : index)}
              >
                {!readOnly && (
                  <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                )}
                <div className={cn("p-1.5 rounded", METRIC_TYPE_LABELS[metric.metricType || 'quantity'].icon === 'Hash' ? 'bg-primary/10' : 'bg-secondary')}>
                  <TypeIcon className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {metric.name || 'Nueva métrica'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Objetivo: {metric.targetValue} {metric.unit}
                    {metric.isRequired && <span className="text-destructive ml-1">*</span>}
                  </p>
                </div>
                {!readOnly && (
                  <>
                    <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", isExpanded && "rotate-180")} />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeMetric(index);
                      }}
                      className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

              {/* Expanded content */}
              {isExpanded && !readOnly && (
                <div className="p-4 pt-0 space-y-4 border-t border-border">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Nombre de la métrica *</label>
                    <Input
                      value={metric.name || ''}
                      onChange={(e) => updateMetric(index, { name: e.target.value })}
                      placeholder="Ej: Clientes atendidos, Ventas realizadas..."
                      className="h-9"
                    />
                  </div>

                  {/* Type selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Tipo de métrica</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(Object.keys(METRIC_TYPE_LABELS) as MetricType[]).map((type) => {
                        const Icon = ICONS[METRIC_TYPE_LABELS[type].icon] || Hash;
                        const isSelected = metric.metricType === type;
                        return (
                          <button
                            key={type}
                            onClick={() => updateMetric(index, { metricType: type })}
                            className={cn(
                              "p-2 rounded-lg border text-left transition-all",
                              isSelected 
                                ? "border-primary bg-primary/10" 
                                : "border-border bg-card hover:border-primary/50"
                            )}
                          >
                            <Icon className={cn("w-4 h-4 mb-1", isSelected ? "text-primary" : "text-muted-foreground")} />
                            <p className="text-xs font-medium">{METRIC_TYPE_LABELS[type].label}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Unit */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Unidad de medida</label>
                    {metric.metricType === 'custom' ? (
                      <Input
                        value={metric.customUnitLabel || ''}
                        onChange={(e) => updateMetric(index, { customUnitLabel: e.target.value, unit: e.target.value })}
                        placeholder="Define tu unidad..."
                        className="h-9"
                      />
                    ) : (
                      <select
                        value={metric.unit || units[0]}
                        onChange={(e) => updateMetric(index, { unit: e.target.value })}
                        className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                      >
                        {units.map((unit) => (
                          <option key={unit} value={unit}>{unit}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Targets */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium flex items-center gap-1">
                        <Target className="w-3 h-3 text-primary" />
                        Objetivo *
                      </label>
                      <Input
                        type="number"
                        value={metric.targetValue || ''}
                        onChange={(e) => updateMetric(index, { targetValue: parseFloat(e.target.value) || 0 })}
                        placeholder="0"
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-warning" />
                        Mínimo
                      </label>
                      <Input
                        type="number"
                        value={metric.minimumAcceptable || ''}
                        onChange={(e) => updateMetric(index, { minimumAcceptable: parseFloat(e.target.value) || undefined })}
                        placeholder="—"
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium flex items-center gap-1">
                        <Trophy className="w-3 h-3 text-emerald-500" />
                        Excelencia
                      </label>
                      <Input
                        type="number"
                        value={metric.excellenceThreshold || ''}
                        onChange={(e) => updateMetric(index, { excellenceThreshold: parseFloat(e.target.value) || undefined })}
                        placeholder="—"
                        className="h-9"
                      />
                    </div>
                  </div>

                  {/* Visual gauge preview */}
                  <div className="p-3 rounded-lg bg-secondary/50">
                    <p className="text-xs text-muted-foreground mb-2">Vista previa de rangos:</p>
                    <div className="h-3 rounded-full overflow-hidden flex">
                      <div className="bg-destructive/50 flex-1" />
                      {metric.minimumAcceptable && <div className="bg-warning/50 flex-1" />}
                      <div className="bg-success/50 flex-1" />
                      {metric.excellenceThreshold && <div className="bg-emerald-500/50 flex-1" />}
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>0</span>
                      {metric.minimumAcceptable && <span>{metric.minimumAcceptable}</span>}
                      <span className="text-primary font-medium">{metric.targetValue || 0}</span>
                      {metric.excellenceThreshold && <span className="text-emerald-500">{metric.excellenceThreshold}</span>}
                    </div>
                  </div>

                  {/* Options */}
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={metric.isRequired ?? true}
                        onChange={(e) => updateMetric(index, { isRequired: e.target.checked })}
                        className="rounded border-input"
                      />
                      Obligatorio
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={metric.allowDecimal ?? false}
                        onChange={(e) => updateMetric(index, { allowDecimal: e.target.checked })}
                        className="rounded border-input"
                      />
                      Permitir decimales
                    </label>
                  </div>

                  {/* Aggregation */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Agregación (para recurrentes)</label>
                    <select
                      value={metric.aggregationType || 'per_instance'}
                      onChange={(e) => updateMetric(index, { aggregationType: e.target.value as AggregationType })}
                      className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      {(Object.keys(AGGREGATION_LABELS) as AggregationType[]).map((type) => (
                        <option key={type} value={type}>{AGGREGATION_LABELS[type]}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {metrics.length === 0 && !readOnly && (
        <div 
          onClick={addMetric}
          className="p-6 border-2 border-dashed rounded-lg text-center cursor-pointer hover:border-primary/50 transition-colors"
        >
          <Target className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Agrega métricas para medir el desempeño en esta tarea
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Ej: Clientes atendidos, ventas realizadas, tiempo de respuesta...
          </p>
        </div>
      )}
    </div>
  );
};

export default MetricConfigEditor;
