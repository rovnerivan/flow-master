import React, { useState } from 'react';
import { 
  Calendar, CheckCircle2, Clock, TrendingUp, TrendingDown, Minus,
  Award, AlertCircle, ChevronRight, BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from 'recharts';

interface DayHistory {
  date: Date;
  tasksCompleted: number;
  tasksTotal: number;
  efficiency: number;
  timeWorked: number; // minutes
  corrections: number;
  rejections: number;
  isPerfectDay: boolean;
}

interface WeeklySummary {
  weekStart: Date;
  avgEfficiency: number;
  efficiencyChange: number;
  totalTasks: number;
  completedTasks: number;
  totalTime: number;
  totalCorrections: number;
  highlights: string[];
}

interface EmployeeHistoryViewProps {
  employeeName: string;
  dailyHistory: DayHistory[];
  weeklySummary: WeeklySummary;
  onDayClick?: (date: Date) => void;
}

const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}min`;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
};

const EmployeeHistoryView: React.FC<EmployeeHistoryViewProps> = ({
  employeeName,
  dailyHistory,
  weeklySummary,
  onDayClick,
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'chart'>('list');

  // Chart data
  const chartData = dailyHistory.map(day => ({
    date: formatDate(day.date),
    efficiency: day.efficiency,
    tasks: day.tasksCompleted,
    color: day.efficiency >= 90 ? 'hsl(var(--success))' : 
           day.efficiency >= 70 ? 'hsl(var(--primary))' : 
           day.efficiency >= 50 ? 'hsl(var(--warning))' : 'hsl(var(--destructive))'
  }));

  const TrendIcon = weeklySummary.efficiencyChange >= 0 ? TrendingUp : TrendingDown;
  const trendColor = weeklySummary.efficiencyChange >= 0 ? 'text-success' : 'text-destructive';

  return (
    <div className="space-y-6">
      {/* Weekly Summary Card */}
      <div className="kpi-card p-4">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          Resumen Semanal
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-xs text-muted-foreground">Promedio Eficiencia</p>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-foreground">{weeklySummary.avgEfficiency}%</span>
              <div className={cn("flex items-center gap-0.5 text-xs", trendColor)}>
                <TrendIcon className="w-3 h-3" />
                <span>{weeklySummary.efficiencyChange > 0 ? '+' : ''}{weeklySummary.efficiencyChange}%</span>
              </div>
            </div>
          </div>
          
          <div>
            <p className="text-xs text-muted-foreground">Tareas Completadas</p>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-foreground">{weeklySummary.completedTasks}</span>
              <span className="text-sm text-muted-foreground">/{weeklySummary.totalTasks}</span>
            </div>
          </div>
          
          <div>
            <p className="text-xs text-muted-foreground">Tiempo Trabajado</p>
            <span className="text-xl font-bold text-foreground">{formatTime(weeklySummary.totalTime)}</span>
          </div>
          
          <div>
            <p className="text-xs text-muted-foreground">Correcciones</p>
            <span className={cn(
              "text-xl font-bold",
              weeklySummary.totalCorrections === 0 ? 'text-success' : 'text-warning'
            )}>
              {weeklySummary.totalCorrections}
            </span>
          </div>
        </div>

        {/* Highlights */}
        {weeklySummary.highlights.length > 0 && (
          <div className="space-y-1.5 pt-3 border-t border-border/50">
            {weeklySummary.highlights.map((highlight, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm text-success">
                <Award className="w-4 h-4" />
                <span>{highlight}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Últimos 7 Días</h3>
        <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-lg">
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              viewMode === 'list' ? 'bg-background text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Lista
          </button>
          <button
            onClick={() => setViewMode('chart')}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              viewMode === 'chart' ? 'bg-background text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Gráfico
          </button>
        </div>
      </div>

      {/* Chart View */}
      {viewMode === 'chart' && (
        <div className="kpi-card p-4">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                />
                <YAxis 
                  domain={[0, 100]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  width={30}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  formatter={(value: number, name: string) => [
                    name === 'efficiency' ? `${value}%` : value,
                    name === 'efficiency' ? 'Eficiencia' : 'Tareas'
                  ]}
                />
                <Bar 
                  dataKey="efficiency" 
                  radius={[4, 4, 0, 0]}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-2">
          {dailyHistory.map((day, idx) => {
            const completionRate = day.tasksTotal > 0 ? Math.round((day.tasksCompleted / day.tasksTotal) * 100) : 0;
            
            return (
              <div 
                key={idx}
                onClick={() => onDayClick?.(day.date)}
                className={cn(
                  "group flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer",
                  "bg-card border-border hover:border-primary/30",
                  day.isPerfectDay && "ring-1 ring-success/20 border-success/30"
                )}
              >
                {/* Date */}
                <div className="w-20 text-center">
                  <p className="text-xs text-muted-foreground uppercase">
                    {day.date.toLocaleDateString('es-ES', { weekday: 'short' })}
                  </p>
                  <p className="text-lg font-bold text-foreground">
                    {day.date.getDate()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {day.date.toLocaleDateString('es-ES', { month: 'short' })}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Eficiencia</p>
                    <p className={cn(
                      "font-semibold",
                      day.efficiency >= 90 ? 'text-success' :
                      day.efficiency >= 70 ? 'text-foreground' :
                      day.efficiency >= 50 ? 'text-warning' : 'text-destructive'
                    )}>
                      {day.efficiency}%
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-muted-foreground">Tareas</p>
                    <p className="font-semibold text-foreground">
                      {day.tasksCompleted}/{day.tasksTotal}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-muted-foreground">Tiempo</p>
                    <p className="font-semibold text-foreground">{formatTime(day.timeWorked)}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-muted-foreground">Observaciones</p>
                    <p className={cn(
                      "font-semibold",
                      day.corrections + day.rejections === 0 ? 'text-success' : 'text-warning'
                    )}>
                      {day.corrections + day.rejections === 0 ? '✓ Sin obs.' : `${day.corrections} corr.`}
                    </p>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2">
                  {day.isPerfectDay && (
                    <div className="px-2 py-1 rounded-full bg-success/10 text-success text-xs font-medium flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      <span className="hidden sm:inline">Día Perfecto</span>
                    </div>
                  )}
                  
                  {day.corrections > 0 && (
                    <div className="px-2 py-1 rounded-full bg-warning/10 text-warning text-xs font-medium">
                      {day.corrections} corr.
                    </div>
                  )}

                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EmployeeHistoryView;
