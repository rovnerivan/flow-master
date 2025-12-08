// Metric Types and Configuration

export type MetricType = 
  | 'quantity' 
  | 'monetary' 
  | 'percentage' 
  | 'time' 
  | 'weight' 
  | 'distance' 
  | 'rating' 
  | 'boolean' 
  | 'custom';

export type AggregationType = 
  | 'per_instance' 
  | 'cumulative_daily' 
  | 'cumulative_weekly' 
  | 'cumulative_monthly';

export interface TaskMetric {
  id: string;
  taskId: string;
  teamId: string;
  name: string;
  metricType: MetricType;
  unit: string;
  customUnitLabel?: string;
  targetValue: number;
  minimumAcceptable?: number;
  excellenceThreshold?: number;
  isRequired: boolean;
  allowDecimal: boolean;
  aggregationType: AggregationType;
  orderIndex: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface MetricResult {
  id: string;
  metricId: string;
  assignmentId: string;
  userId: string;
  teamId: string;
  actualValue: number;
  targetValue: number;
  efficiencyPercentage?: number;
  notes?: string;
  registeredAt: string;
}

// Predefined units by metric type
export const METRIC_UNITS: Record<MetricType, string[]> = {
  quantity: ['Unidades', 'Piezas', 'Llamadas', 'Clientes', 'Transacciones', 'Pedidos', 'Tickets', 'Items', 'Artículos'],
  monetary: ['$', '€', '£', 'MXN', 'ARS', 'COP', 'PEN', 'CLP', 'USD'],
  percentage: ['%'],
  time: ['Segundos', 'Minutos', 'Horas', 'Días'],
  weight: ['Gramos', 'Kilogramos', 'Libras', 'Toneladas', 'Onzas'],
  distance: ['Metros', 'Kilómetros', 'Millas', 'M²', 'M³', 'Hectáreas'],
  rating: ['1-5', '1-10', '1-100', 'NPS (-100 a 100)'],
  boolean: ['Sí/No', 'Cumple/No cumple', 'Aprobado/Rechazado'],
  custom: [],
};

// Display labels for metric types
export const METRIC_TYPE_LABELS: Record<MetricType, { label: string; icon: string; description: string }> = {
  quantity: { label: 'Cantidad', icon: 'Hash', description: 'Conteo de items, llamadas, clientes, etc.' },
  monetary: { label: 'Monetario', icon: 'DollarSign', description: 'Valores en dinero' },
  percentage: { label: 'Porcentaje', icon: 'Percent', description: 'Tasas, ratios, cumplimiento' },
  time: { label: 'Tiempo', icon: 'Clock', description: 'Duración, tiempo de respuesta' },
  weight: { label: 'Peso/Volumen', icon: 'Scale', description: 'Producción, despacho' },
  distance: { label: 'Distancia/Área', icon: 'MapPin', description: 'Rutas, áreas cubiertas' },
  rating: { label: 'Calificación', icon: 'Star', description: 'Scores, evaluaciones' },
  boolean: { label: 'Sí/No', icon: 'CheckCircle', description: 'Cumplimiento, inspecciones' },
  custom: { label: 'Personalizado', icon: 'Settings', description: 'Define tu propia unidad' },
};

// Aggregation type labels
export const AGGREGATION_LABELS: Record<AggregationType, string> = {
  per_instance: 'Por instancia (cada ejecución)',
  cumulative_daily: 'Acumulado diario',
  cumulative_weekly: 'Acumulado semanal',
  cumulative_monthly: 'Acumulado mensual',
};

// Helper function to get efficiency status
export function getEfficiencyStatus(actual: number, target: number, minimum?: number, excellence?: number): {
  status: 'excellent' | 'good' | 'warning' | 'critical';
  percentage: number;
  color: string;
  bgColor: string;
} {
  const percentage = target > 0 ? (actual / target) * 100 : 0;
  
  if (excellence && actual >= excellence) {
    return { 
      status: 'excellent', 
      percentage, 
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/20' 
    };
  }
  
  if (actual >= target) {
    return { 
      status: 'good', 
      percentage, 
      color: 'text-success',
      bgColor: 'bg-success/20' 
    };
  }
  
  if (minimum && actual >= minimum) {
    return { 
      status: 'warning', 
      percentage, 
      color: 'text-warning',
      bgColor: 'bg-warning/20' 
    };
  }
  
  return { 
    status: 'critical', 
    percentage, 
    color: 'text-destructive',
    bgColor: 'bg-destructive/20' 
  };
}

// Format metric value with unit
export function formatMetricValue(value: number, unit: string, metricType: MetricType, allowDecimal: boolean = false): string {
  const formattedValue = allowDecimal ? value.toFixed(2) : Math.round(value).toString();
  
  // For monetary, put symbol before
  if (metricType === 'monetary') {
    return `${unit}${formattedValue}`;
  }
  
  // For percentage
  if (metricType === 'percentage') {
    return `${formattedValue}%`;
  }
  
  // For boolean
  if (metricType === 'boolean') {
    return value >= 1 ? unit.split('/')[0] : unit.split('/')[1] || 'No';
  }
  
  return `${formattedValue} ${unit}`;
}

// Calculate overall efficiency from multiple metrics
export function calculateOverallEfficiency(results: { actual: number; target: number }[]): number {
  if (results.length === 0) return 0;
  
  const totalEfficiency = results.reduce((sum, r) => {
    const eff = r.target > 0 ? (r.actual / r.target) * 100 : 0;
    return sum + Math.min(eff, 150); // Cap at 150% to prevent outliers
  }, 0);
  
  return totalEfficiency / results.length;
}
