import React from 'react';
import { TrendingUp, TrendingDown, Minus, Clock, CheckCircle2, AlertTriangle, Star, Target, Zap, Award } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export interface EmployeeData {
  id: string;
  name: string;
  email: string;
  role: string;
  jobTitle: string;
  avatarUrl?: string;
  tenureDays: number;
  efficiency: number;
  efficiencyTrend: 'up' | 'down' | 'stable';
  efficiencyChange: number;
  volume: number;
  tasksToday: { completed: number; total: number };
  workloadHours: number;
  capacityHours: number;
  status: 'active' | 'onboarding';
  quadrant: 'star' | 'potential' | 'coaching' | 'attention';
  alerts: Array<{ type: 'critical' | 'warning' | 'info'; message: string }>;
  achievements: string[];
}

interface EmployeeProfileCardProps {
  employee: EmployeeData;
  onClick: () => void;
  isSelected?: boolean;
}

const quadrantConfig = {
  star: { 
    label: 'Estrella', 
    icon: Star, 
    color: 'text-warning', 
    bg: 'bg-warning/10',
    border: 'border-warning/30'
  },
  potential: { 
    label: 'Alto Potencial', 
    icon: Zap, 
    color: 'text-primary', 
    bg: 'bg-primary/10',
    border: 'border-primary/30'
  },
  coaching: { 
    label: 'Coaching', 
    icon: Target, 
    color: 'text-muted-foreground', 
    bg: 'bg-muted/30',
    border: 'border-muted/30'
  },
  attention: { 
    label: 'Atención', 
    icon: AlertTriangle, 
    color: 'text-destructive', 
    bg: 'bg-destructive/10',
    border: 'border-destructive/30'
  },
};

const getTenureLabel = (days: number): { label: string; color: string } => {
  if (days <= 30) return { label: 'Nuevo', color: 'text-primary' };
  if (days <= 90) return { label: 'En Desarrollo', color: 'text-warning' };
  if (days <= 180) return { label: 'Consolidado', color: 'text-success' };
  return { label: 'Veterano', color: 'text-success' };
};

const EmployeeProfileCard: React.FC<EmployeeProfileCardProps> = ({ 
  employee, 
  onClick,
  isSelected = false 
}) => {
  const quadrant = quadrantConfig[employee.quadrant];
  const QuadrantIcon = quadrant.icon;
  const tenure = getTenureLabel(employee.tenureDays);
  const workloadPercent = Math.min((employee.workloadHours / employee.capacityHours) * 100, 100);
  const taskPercent = employee.tasksToday.total > 0 
    ? (employee.tasksToday.completed / employee.tasksToday.total) * 100 
    : 0;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const TrendIcon = employee.efficiencyTrend === 'up' ? TrendingUp 
    : employee.efficiencyTrend === 'down' ? TrendingDown 
    : Minus;

  const trendColor = employee.efficiencyTrend === 'up' ? 'text-success' 
    : employee.efficiencyTrend === 'down' ? 'text-destructive' 
    : 'text-muted-foreground';

  const hasAlerts = employee.alerts.length > 0;
  const criticalAlerts = employee.alerts.filter(a => a.type === 'critical').length;

  return (
    <div 
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-xl border transition-all duration-300 cursor-pointer",
        "bg-card hover:bg-card/80",
        isSelected ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/50",
        hasAlerts && criticalAlerts > 0 && "border-destructive/50"
      )}
    >
      {/* Top accent line based on quadrant */}
      <div className={cn("absolute top-0 left-0 right-0 h-0.5", quadrant.bg.replace('/10', ''))} />
      
      <div className="p-4 space-y-4">
        {/* Header Row */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-12 w-12 ring-2 ring-border">
                <AvatarImage src={employee.avatarUrl} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {getInitials(employee.name)}
                </AvatarFallback>
              </Avatar>
              {/* Status indicator */}
              <div className={cn(
                "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-card",
                employee.status === 'active' ? 'bg-success' : 'bg-warning'
              )} />
            </div>
            <div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {employee.name}
              </h3>
              <p className="text-sm text-muted-foreground">{employee.jobTitle}</p>
            </div>
          </div>
          
          {/* Quadrant Badge */}
          <div className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
            quadrant.bg, quadrant.color
          )}>
            <QuadrantIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{quadrant.label}</span>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-3 gap-3">
          {/* Efficiency */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Zap className="w-3 h-3" />
              <span>Eficiencia</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold text-foreground">{employee.efficiency}%</span>
              <div className={cn("flex items-center gap-0.5 text-xs", trendColor)}>
                <TrendIcon className="w-3 h-3" />
                <span>{employee.efficiencyChange > 0 ? '+' : ''}{employee.efficiencyChange}%</span>
              </div>
            </div>
          </div>

          {/* Tasks Today */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <CheckCircle2 className="w-3 h-3" />
              <span>Tareas</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-foreground">
                {employee.tasksToday.completed}/{employee.tasksToday.total}
              </span>
            </div>
          </div>

          {/* Workload */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>Carga</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-foreground">
                {employee.workloadHours}h
              </span>
              <span className="text-xs text-muted-foreground">/{employee.capacityHours}h</span>
            </div>
          </div>
        </div>

        {/* Progress Bars */}
        <div className="space-y-2">
          {/* Efficiency bar */}
          <div className="space-y-1">
            <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  employee.efficiency >= 80 ? 'bg-success' : 
                  employee.efficiency >= 60 ? 'bg-warning' : 'bg-destructive'
                )}
                style={{ width: `${employee.efficiency}%` }}
              />
            </div>
          </div>
          
          {/* Task progress bar */}
          <div className="space-y-1">
            <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
              <div 
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${taskPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Footer with tenure and alerts */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-2">
            <span className={cn("text-xs font-medium", tenure.color)}>
              {tenure.label}
            </span>
            <span className="text-xs text-muted-foreground">
              ({employee.tenureDays}d)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Achievements */}
            {employee.achievements.length > 0 && (
              <div className="flex items-center gap-1 text-warning">
                <Award className="w-4 h-4" />
                <span className="text-xs font-medium">{employee.achievements.length}</span>
              </div>
            )}
            
            {/* Alerts */}
            {hasAlerts && (
              <div className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                criticalAlerts > 0 
                  ? "bg-destructive/10 text-destructive" 
                  : "bg-warning/10 text-warning"
              )}>
                <AlertTriangle className="w-3 h-3" />
                <span>{employee.alerts.length}</span>
              </div>
            )}

            <span className="text-xs text-primary group-hover:underline">
              Ver perfil →
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfileCard;
