import React from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Clock,
  Target,
  GraduationCap,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EconomicMetric {
  label: string;
  value: number;
  previousValue?: number;
  format: 'currency' | 'hours' | 'days' | 'percentage';
  description?: string;
  isPositiveGood?: boolean;
}

interface EconomicImpactCardProps {
  title: string;
  icon?: React.ElementType;
  metrics: EconomicMetric[];
  insights?: string[];
  variant?: 'default' | 'positive' | 'negative' | 'neutral';
}

const formatValue = (value: number, format: EconomicMetric['format']): string => {
  switch (format) {
    case 'currency':
      return `$${value.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    case 'hours':
      return `${value.toFixed(1)}h`;
    case 'days':
      return `${value.toFixed(0)} días`;
    case 'percentage':
      return `${value.toFixed(0)}%`;
    default:
      return value.toString();
  }
};

const EconomicImpactCard: React.FC<EconomicImpactCardProps> = ({
  title,
  icon: Icon = DollarSign,
  metrics,
  insights,
  variant = 'default',
}) => {
  const variantStyles = {
    default: 'border-border bg-card',
    positive: 'border-success/30 bg-success/5',
    negative: 'border-destructive/30 bg-destructive/5',
    neutral: 'border-primary/30 bg-primary/5',
  };

  const iconStyles = {
    default: 'text-foreground',
    positive: 'text-success',
    negative: 'text-destructive',
    neutral: 'text-primary',
  };

  return (
    <div className={cn("p-5 rounded-xl border", variantStyles[variant])}>
      <div className="flex items-center gap-3 mb-4">
        <div className={cn(
          "p-2 rounded-lg",
          variant === 'positive' ? 'bg-success/10' :
          variant === 'negative' ? 'bg-destructive/10' :
          variant === 'neutral' ? 'bg-primary/10' :
          'bg-secondary'
        )}>
          <Icon className={cn("w-5 h-5", iconStyles[variant])} />
        </div>
        <h3 className="font-semibold text-foreground">{title}</h3>
      </div>

      <div className="space-y-4">
        {metrics.map((metric, idx) => {
          const trend = metric.previousValue !== undefined 
            ? ((metric.value - metric.previousValue) / metric.previousValue) * 100 
            : undefined;
          const isPositive = metric.isPositiveGood !== false ? trend && trend > 0 : trend && trend < 0;

          return (
            <div key={idx} className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{metric.label}</p>
                {metric.description && (
                  <p className="text-xs text-muted-foreground/70">{metric.description}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">{formatValue(metric.value, metric.format)}</p>
                {trend !== undefined && (
                  <div className={cn(
                    "flex items-center gap-1 text-xs justify-end",
                    isPositive ? 'text-success' : 'text-destructive'
                  )}>
                    {trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {trend > 0 ? '+' : ''}{trend.toFixed(0)}%
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {insights && insights.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <Sparkles className="w-3 h-3" />
            Insights
          </div>
          <ul className="space-y-1">
            {insights.map((insight, idx) => (
              <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-primary">•</span>
                {insight}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Pre-configured cards for common use cases
export const TrainingROICard: React.FC<{
  hoursInvested: number;
  errorsReduced: number;
  costPerError: number;
  previousHoursInvested?: number;
}> = ({ hoursInvested, errorsReduced, costPerError, previousHoursInvested }) => {
  const savings = errorsReduced * costPerError;
  const trainingCost = hoursInvested * 15; // Assuming $15/hour
  const roi = ((savings - trainingCost) / trainingCost) * 100;
  const paybackMonths = trainingCost / (savings / 12);

  return (
    <EconomicImpactCard
      title="ROI de Capacitación"
      icon={GraduationCap}
      variant={roi > 100 ? 'positive' : roi > 0 ? 'neutral' : 'negative'}
      metrics={[
        { 
          label: 'Inversión', 
          value: hoursInvested, 
          previousValue: previousHoursInvested,
          format: 'hours', 
          description: `~$${trainingCost} en tiempo`,
          isPositiveGood: false,
        },
        { 
          label: 'Ahorro generado', 
          value: savings, 
          format: 'currency',
          description: `${errorsReduced} errores evitados`,
        },
        { 
          label: 'Retorno', 
          value: roi, 
          format: 'percentage',
        },
      ]}
      insights={[
        paybackMonths < 3 
          ? `Excelente: recuperas inversión en ${paybackMonths.toFixed(1)} meses`
          : `Payback estimado: ${paybackMonths.toFixed(1)} meses`,
      ]}
    />
  );
};

export const ReworkCostCard: React.FC<{
  reworkHours: number;
  hourlyRate: number;
  previousReworkHours?: number;
}> = ({ reworkHours, hourlyRate, previousReworkHours }) => {
  const cost = reworkHours * hourlyRate;
  const previousCost = previousReworkHours ? previousReworkHours * hourlyRate : undefined;

  return (
    <EconomicImpactCard
      title="Costo de Reproceso"
      icon={AlertTriangle}
      variant={reworkHours > 10 ? 'negative' : reworkHours > 5 ? 'neutral' : 'positive'}
      metrics={[
        { 
          label: 'Horas en correcciones', 
          value: reworkHours, 
          previousValue: previousReworkHours,
          format: 'hours',
          isPositiveGood: false,
        },
        { 
          label: 'Costo asociado', 
          value: cost, 
          previousValue: previousCost,
          format: 'currency',
          isPositiveGood: false,
        },
      ]}
      insights={
        reworkHours > 10 
          ? ['Alto tiempo de reproceso - considere revisar procesos críticos']
          : undefined
      }
    />
  );
};

export const ProductivityCard: React.FC<{
  tasksPerHour: number;
  previousTasksPerHour?: number;
  employeesActive: number;
  hoursWorked: number;
}> = ({ tasksPerHour, previousTasksPerHour, employeesActive, hoursWorked }) => {
  const totalTasks = tasksPerHour * hoursWorked * employeesActive;

  return (
    <EconomicImpactCard
      title="Productividad"
      icon={Target}
      variant={tasksPerHour >= 4 ? 'positive' : tasksPerHour >= 2 ? 'neutral' : 'negative'}
      metrics={[
        { 
          label: 'Tareas/hora/persona', 
          value: tasksPerHour, 
          previousValue: previousTasksPerHour,
          format: 'percentage',
          description: 'Promedio del equipo',
        },
        { 
          label: 'Total producido', 
          value: totalTasks, 
          format: 'percentage',
          description: `${employeesActive} personas × ${hoursWorked}h`,
        },
      ]}
    />
  );
};

export const OnboardingCostCard: React.FC<{
  avgDaysToProductivity: number;
  industryAverage: number;
  newEmployeesCount: number;
  dailyCost: number;
}> = ({ avgDaysToProductivity, industryAverage, newEmployeesCount, dailyCost }) => {
  const totalCost = avgDaysToProductivity * newEmployeesCount * dailyCost * 0.5; // 50% productivity during onboarding
  const savingsVsIndustry = (industryAverage - avgDaysToProductivity) * newEmployeesCount * dailyCost * 0.5;

  return (
    <EconomicImpactCard
      title="Costo de Onboarding"
      icon={Clock}
      variant={avgDaysToProductivity < industryAverage ? 'positive' : 'neutral'}
      metrics={[
        { 
          label: 'Tiempo a productividad', 
          value: avgDaysToProductivity, 
          format: 'days',
          description: `Industria: ${industryAverage} días`,
        },
        { 
          label: 'Inversión en nuevos', 
          value: totalCost, 
          format: 'currency',
          description: `${newEmployeesCount} empleados`,
        },
      ]}
      insights={
        savingsVsIndustry > 0 
          ? [`Ahorrando $${savingsVsIndustry.toFixed(0)} vs promedio industria`]
          : undefined
      }
    />
  );
};

export default EconomicImpactCard;
