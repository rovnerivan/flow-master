import React from 'react';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Target,
  ThumbsUp,
  Ban,
  Eye,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Task, TaskMetrics, calculateMetrics, frequencyLabels, TaskFrequency } from '@/lib/taskTypes';
import { ProgressRing } from '@/components/dashboard/ProgressRing';

interface TaskMetricsDashboardProps {
  tasks: Task[];
  showEmployeeBreakdown?: boolean;
  title?: string;
}

const MetricCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  color?: string;
  trend?: { value: number; positive: boolean };
}> = ({ title, value, subtitle, icon: Icon, color = 'text-primary', trend }) => (
  <div className="bg-card border border-border rounded-xl p-4">
    <div className="flex items-start justify-between mb-2">
      <div className={cn("p-2 rounded-lg bg-secondary", color.replace('text-', 'bg-').replace('-500', '-500/20'))}>
        <Icon className={cn("h-5 w-5", color)} />
      </div>
      {trend && (
        <span className={cn(
          "text-xs px-2 py-0.5 rounded-full flex items-center gap-1",
          trend.positive ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"
        )}>
          <TrendingUp className={cn("h-3 w-3", !trend.positive && "rotate-180")} />
          {trend.value}%
        </span>
      )}
    </div>
    <div className="text-2xl font-bold text-foreground">{value}</div>
    <div className="text-sm text-muted-foreground">{title}</div>
    {subtitle && <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>}
  </div>
);

const TaskMetricsDashboard: React.FC<TaskMetricsDashboardProps> = ({
  tasks,
  showEmployeeBreakdown = false,
  title = "Métricas de Tareas",
}) => {
  const metrics = calculateMetrics(tasks);
  
  // Calculate by frequency
  const byFrequency: Record<TaskFrequency, { total: number; completed: number }> = {
    daily: { total: 0, completed: 0 },
    weekly: { total: 0, completed: 0 },
    monthly: { total: 0, completed: 0 },
    annual: { total: 0, completed: 0 },
    occasional: { total: 0, completed: 0 },
  };
  
  tasks.forEach(task => {
    byFrequency[task.frequency].total++;
    if (task.assignments.every(a => a.status === 'completed')) {
      byFrequency[task.frequency].completed++;
    }
  });
  
  // Calculate by employee
  const employeeStats: Record<string, { name: string; total: number; completed: number; pendingReview: number }> = {};
  tasks.forEach(task => {
    task.assignments.forEach(assignment => {
      if (!employeeStats[assignment.userId]) {
        employeeStats[assignment.userId] = {
          name: assignment.userName,
          total: 0,
          completed: 0,
          pendingReview: 0,
        };
      }
      employeeStats[assignment.userId].total++;
      if (assignment.status === 'completed') {
        employeeStats[assignment.userId].completed++;
      }
      if (assignment.status === 'pending_review') {
        employeeStats[assignment.userId].pendingReview++;
      }
    });
  });
  
  const topPerformers = Object.entries(employeeStats)
    .map(([id, stats]) => ({
      userId: id,
      ...stats,
      rate: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0,
    }))
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 5);
  
  const needsAttention = Object.entries(employeeStats)
    .filter(([, stats]) => stats.pendingReview > 0)
    .map(([id, stats]) => ({ userId: id, ...stats }))
    .sort((a, b) => b.pendingReview - a.pendingReview);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      </div>
      
      {/* Main KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <MetricCard
          title="Total Tareas"
          value={metrics.totalTasks}
          icon={Target}
        />
        <MetricCard
          title="Completadas"
          value={metrics.completedTasks}
          icon={CheckCircle}
          color="text-success"
        />
        <MetricCard
          title="En Progreso"
          value={metrics.inProgressTasks}
          icon={Clock}
          color="text-primary"
        />
        <MetricCard
          title="En Revisión"
          value={metrics.pendingReviewTasks}
          icon={Eye}
          color="text-warning"
        />
        <MetricCard
          title="Errores Resueltos"
          value={metrics.errorsResolved}
          icon={ThumbsUp}
          color="text-success"
        />
        <MetricCard
          title="Errores No Salvables"
          value={metrics.errorsUnresolved}
          icon={Ban}
          color="text-destructive"
        />
      </div>
      
      {/* Completion rate ring */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Completion Rate */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Tasa de Completitud</h3>
          <div className="flex items-center justify-center">
            <ProgressRing 
              progress={Math.round(metrics.completionRate)} 
              size={120} 
              strokeWidth={10}
            />
          </div>
          <div className="text-center mt-4">
            <div className="text-2xl font-bold">{Math.round(metrics.completionRate)}%</div>
            <div className="text-sm text-muted-foreground">de tareas completadas</div>
          </div>
        </div>
        
        {/* By Frequency */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Por Frecuencia</h3>
          <div className="space-y-3">
            {(Object.entries(byFrequency) as [TaskFrequency, { total: number; completed: number }][]).map(([freq, stats]) => {
              const info = frequencyLabels[freq];
              const rate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
              
              return (
                <div key={freq} className="flex items-center gap-3">
                  <span className={cn("text-xs px-2 py-0.5 rounded", info.color)}>
                    {info.label}
                  </span>
                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all"
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-20 text-right">
                    {stats.completed}/{stats.total}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Overdue & On-Time */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Puntualidad</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span className="text-sm">A tiempo</span>
              </div>
              <span className="text-lg font-semibold">{Math.round(metrics.onTimeCompletion)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="text-sm">Vencidas</span>
              </div>
              <span className="text-lg font-semibold text-destructive">{metrics.overdueCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Tiempo promedio</span>
              </div>
              <span className="text-lg font-semibold">
                {Math.round(metrics.averageTimeSpent)} min
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Employee breakdown */}
      {showEmployeeBreakdown && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Top Performers */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-success" />
              <h3 className="text-sm font-medium text-muted-foreground">Top Performers</h3>
            </div>
            <div className="space-y-3">
              {topPerformers.map((performer, index) => (
                <div key={performer.userId} className="flex items-center gap-3">
                  <span className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                    index === 0 ? "bg-warning text-warning-foreground" :
                    index === 1 ? "bg-muted text-muted-foreground" :
                    index === 2 ? "bg-orange-500/20 text-orange-500" :
                    "bg-secondary text-muted-foreground"
                  )}>
                    {index + 1}
                  </span>
                  <span className="flex-1 text-sm">{performer.name}</span>
                  <span className="text-sm font-medium">{Math.round(performer.rate)}%</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Needs Attention */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="h-4 w-4 text-warning" />
              <h3 className="text-sm font-medium text-muted-foreground">Pendientes de Revisión</h3>
            </div>
            {needsAttention.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground text-sm">
                No hay tareas pendientes de revisión
              </div>
            ) : (
              <div className="space-y-3">
                {needsAttention.map(employee => (
                  <div key={employee.userId} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{employee.name}</span>
                    </div>
                    <span className="text-sm font-medium bg-warning/20 text-warning px-2 py-0.5 rounded">
                      {employee.pendingReview} en revisión
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskMetricsDashboard;
