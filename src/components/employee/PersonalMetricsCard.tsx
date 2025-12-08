import React from 'react';
import { 
  Trophy, 
  CheckCircle2, 
  ThumbsUp, 
  AlertTriangle, 
  Flame,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MetricItem {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

interface PersonalMetricsCardProps {
  className?: string;
}

export const PersonalMetricsCard: React.FC<PersonalMetricsCardProps> = ({ className }) => {
  // Mock data - would come from Supabase
  const weeklyMetrics = {
    completed: 12,
    approvalRate: 98,
    errors: 0,
    streak: 5,
  };

  const previousWeek = {
    completed: 10,
    approvalRate: 95,
    errors: 1,
    streak: 3,
  };

  const getMotivationalMessage = () => {
    if (weeklyMetrics.approvalRate >= 95 && weeklyMetrics.errors === 0) {
      return "¡Excelente semana! Tu tasa de aprobación está sobre el promedio del equipo.";
    }
    if (weeklyMetrics.streak >= 5) {
      return `¡${weeklyMetrics.streak} días seguidos sin errores! Sigue así.`;
    }
    if (weeklyMetrics.completed > previousWeek.completed) {
      return "Estás completando más tareas que la semana pasada. ¡Buen ritmo!";
    }
    return "Cada tarea bien hecha nos acerca a nuestros objetivos.";
  };

  const getTrend = (current: number, previous: number): 'up' | 'down' | 'neutral' => {
    if (current > previous) return 'up';
    if (current < previous) return 'down';
    return 'neutral';
  };

  const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'neutral' }) => {
    if (trend === 'up') return <TrendingUp className="w-3 h-3 text-success" />;
    if (trend === 'down') return <TrendingDown className="w-3 h-3 text-destructive" />;
    return <Minus className="w-3 h-3 text-muted-foreground" />;
  };

  const metrics: MetricItem[] = [
    {
      label: 'Completadas',
      value: weeklyMetrics.completed,
      icon: <CheckCircle2 className="w-5 h-5 text-success" />,
      trend: getTrend(weeklyMetrics.completed, previousWeek.completed),
      trendValue: weeklyMetrics.completed > previousWeek.completed 
        ? `+${weeklyMetrics.completed - previousWeek.completed}` 
        : undefined
    },
    {
      label: 'Aprobación',
      value: `${weeklyMetrics.approvalRate}%`,
      icon: <ThumbsUp className="w-5 h-5 text-primary" />,
      trend: getTrend(weeklyMetrics.approvalRate, previousWeek.approvalRate),
    },
    {
      label: 'Errores',
      value: weeklyMetrics.errors,
      icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
      trend: weeklyMetrics.errors < previousWeek.errors ? 'up' : 
             weeklyMetrics.errors > previousWeek.errors ? 'down' : 'neutral',
    },
    {
      label: 'Racha',
      value: weeklyMetrics.streak,
      icon: <Flame className="w-5 h-5 text-orange-500" />,
      trend: getTrend(weeklyMetrics.streak, previousWeek.streak),
    },
  ];

  return (
    <Card className={cn("border-border", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          Esta Semana
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Metrics Grid */}
        <div className="grid grid-cols-4 gap-2">
          {metrics.map((metric, idx) => (
            <div 
              key={idx}
              className="flex flex-col items-center p-2 rounded-lg bg-muted/50"
            >
              <div className="mb-1">{metric.icon}</div>
              <span className="text-lg font-bold text-foreground">{metric.value}</span>
              <span className="text-[10px] text-muted-foreground text-center leading-tight">
                {metric.label}
              </span>
              {metric.trend && (
                <div className="flex items-center gap-0.5 mt-0.5">
                  <TrendIcon trend={metric.trend} />
                  {metric.trendValue && (
                    <span className="text-[10px] text-success">{metric.trendValue}</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Motivational Message */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
          <span className="text-lg">💪</span>
          <p className="text-sm text-foreground/80">
            {getMotivationalMessage()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalMetricsCard;
