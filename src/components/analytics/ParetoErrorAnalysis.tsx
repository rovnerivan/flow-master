import React, { useMemo, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Line,
  ComposedChart,
  Cell,
} from 'recharts';
import { 
  AlertTriangle, 
  DollarSign, 
  Clock, 
  TrendingDown,
  Filter,
  Calendar,
  User,
  Layers,
  ChevronDown,
  Lightbulb,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ErrorData {
  id: string;
  type: string;
  process: string;
  employee: string;
  date: string;
  dayOfWeek: number; // 0-6
  hourOfDay: number; // 0-23
  estimatedCost: number;
  isAvoidable: boolean;
  employeeTenure: number; // days
}

interface ParetoErrorAnalysisProps {
  errors: ErrorData[];
  hourlyRate?: number;
  reworkMultiplier?: number;
}

type GroupBy = 'process' | 'type' | 'employee';
type ViewMode = 'pareto' | 'patterns' | 'insights';

const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const ParetoErrorAnalysis: React.FC<ParetoErrorAnalysisProps> = ({
  errors,
  hourlyRate = 15, // USD per hour
  reworkMultiplier = 2.5, // Time spent fixing vs doing correctly
}) => {
  const [groupBy, setGroupBy] = useState<GroupBy>('process');
  const [viewMode, setViewMode] = useState<ViewMode>('pareto');

  // Calculate Pareto data
  const paretoData = useMemo(() => {
    const grouped = errors.reduce((acc, err) => {
      const key = groupBy === 'process' ? err.process : 
                  groupBy === 'type' ? err.type : err.employee;
      if (!acc[key]) {
        acc[key] = { name: key, count: 0, cost: 0 };
      }
      acc[key].count++;
      acc[key].cost += err.estimatedCost;
      return acc;
    }, {} as Record<string, { name: string; count: number; cost: number }>);

    const sorted = Object.values(grouped).sort((a, b) => b.cost - a.cost);
    const totalCost = sorted.reduce((sum, d) => sum + d.cost, 0);
    
    let cumulative = 0;
    return sorted.map(item => {
      cumulative += item.cost;
      return {
        ...item,
        percentage: (item.cost / totalCost) * 100,
        cumulativePercentage: (cumulative / totalCost) * 100,
      };
    });
  }, [errors, groupBy]);

  // Calculate temporal patterns
  const temporalPatterns = useMemo(() => {
    const byDay = Array(7).fill(0).map((_, i) => ({ day: dayNames[i], count: 0 }));
    const byHour: Record<string, number> = {};
    
    errors.forEach(err => {
      byDay[err.dayOfWeek].count++;
      const hourKey = err.hourOfDay < 12 ? 'Mañana' : err.hourOfDay < 17 ? 'Tarde' : 'Noche';
      byHour[hourKey] = (byHour[hourKey] || 0) + 1;
    });

    return { byDay, byHour };
  }, [errors]);

  // Calculate insights
  const insights = useMemo(() => {
    const results: { type: 'warning' | 'info' | 'success'; title: string; description: string }[] = [];
    
    // 80/20 Analysis
    const topErrors = paretoData.filter(d => d.cumulativePercentage <= 80);
    if (topErrors.length > 0) {
      results.push({
        type: 'warning',
        title: `80% de pérdidas en ${topErrors.length} ${groupBy === 'process' ? 'procesos' : groupBy === 'type' ? 'tipos' : 'empleados'}`,
        description: `Enfocarse en: ${topErrors.map(d => d.name).join(', ')}`,
      });
    }

    // New employee pattern
    const newEmployeeErrors = errors.filter(e => e.employeeTenure < 30);
    if (newEmployeeErrors.length > errors.length * 0.4) {
      results.push({
        type: 'info',
        title: `${Math.round((newEmployeeErrors.length / errors.length) * 100)}% de errores son de empleados nuevos (<30 días)`,
        description: 'Considere reforzar el onboarding y mentoring inicial',
      });
    }

    // Avoidable vs systemic
    const avoidableErrors = errors.filter(e => e.isAvoidable);
    const avoidablePercentage = (avoidableErrors.length / errors.length) * 100;
    results.push({
      type: avoidablePercentage > 60 ? 'warning' : 'info',
      title: `${avoidablePercentage.toFixed(0)}% de errores son evitables`,
      description: avoidablePercentage > 60 
        ? 'Oportunidad de mejora con capacitación' 
        : 'Considere revisar los procesos sistémicos',
    });

    // Day pattern
    const maxDay = temporalPatterns.byDay.reduce((max, d) => d.count > max.count ? d : max, temporalPatterns.byDay[0]);
    if (maxDay.count > (errors.length / 7) * 1.5) {
      results.push({
        type: 'info',
        title: `Los ${maxDay.day} tienen ${Math.round((maxDay.count / (errors.length / 7) - 1) * 100)}% más errores`,
        description: 'Considere reforzar supervisión o revisar carga de trabajo',
      });
    }

    return results;
  }, [errors, paretoData, groupBy, temporalPatterns]);

  // Economic summary
  const economicSummary = useMemo(() => {
    const totalCost = errors.reduce((sum, e) => sum + e.estimatedCost, 0);
    const avgCostPerError = totalCost / errors.length;
    const reworkHours = errors.length * reworkMultiplier * 0.5; // Assuming 30 min avg per error
    const reworkCost = reworkHours * hourlyRate;
    
    return {
      totalCost,
      avgCostPerError,
      reworkHours,
      reworkCost,
      totalImpact: totalCost + reworkCost,
    };
  }, [errors, hourlyRate, reworkMultiplier]);

  const groupByLabels: Record<GroupBy, { label: string; icon: typeof Layers }> = {
    process: { label: 'Por Proceso', icon: Layers },
    type: { label: 'Por Tipo', icon: Filter },
    employee: { label: 'Por Empleado', icon: User },
  };

  return (
    <div className="space-y-6">
      {/* Header with Economic Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/5">
          <div className="flex items-center gap-2 text-destructive mb-1">
            <DollarSign className="w-4 h-4" />
            <span className="text-xs font-medium">Impacto Total</span>
          </div>
          <p className="text-2xl font-bold text-destructive">
            ${economicSummary.totalImpact.toFixed(0)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">este período</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 text-warning mb-1">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs font-medium">Costo Directo</span>
          </div>
          <p className="text-2xl font-bold">
            ${economicSummary.totalCost.toFixed(0)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            ~${economicSummary.avgCostPerError.toFixed(0)}/error
          </p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 text-primary mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-medium">Tiempo Reproceso</span>
          </div>
          <p className="text-2xl font-bold">
            {economicSummary.reworkHours.toFixed(0)}h
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            ${economicSummary.reworkCost.toFixed(0)} en salarios
          </p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <TrendingDown className="w-4 h-4" />
            <span className="text-xs font-medium">Total Errores</span>
          </div>
          <p className="text-2xl font-bold">{errors.length}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {errors.filter(e => e.isAvoidable).length} evitables
          </p>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex rounded-lg border border-border p-1 bg-secondary/50">
          {(['pareto', 'patterns', 'insights'] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={cn(
                "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                viewMode === mode 
                  ? "bg-card text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {mode === 'pareto' ? 'Pareto 80/20' : mode === 'patterns' ? 'Patrones' : 'Insights'}
            </button>
          ))}
        </div>

        {viewMode === 'pareto' && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                {React.createElement(groupByLabels[groupBy].icon, { className: "w-4 h-4" })}
                {groupByLabels[groupBy].label}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {(Object.keys(groupByLabels) as GroupBy[]).map((key) => (
                <DropdownMenuItem key={key} onClick={() => setGroupBy(key)}>
                  {groupByLabels[key].label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Pareto Chart */}
      {viewMode === 'pareto' && (
        <div className="kpi-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Diagrama de Pareto - Impacto por {groupByLabels[groupBy].label.toLowerCase()}
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={paretoData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  yAxisId="left"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickFormatter={(v) => `$${v}`}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickFormatter={(v) => `${v}%`}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number, name: string) => [
                    name === 'cost' ? `$${value.toFixed(0)}` : 
                    name === 'cumulativePercentage' ? `${value.toFixed(1)}%` : value,
                    name === 'cost' ? 'Costo' : 
                    name === 'cumulativePercentage' ? 'Acumulado' : 'Cantidad'
                  ]}
                />
                <Bar yAxisId="left" dataKey="cost" radius={[4, 4, 0, 0]}>
                  {paretoData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.cumulativePercentage <= 80 
                        ? 'hsl(var(--destructive))' 
                        : 'hsl(var(--muted-foreground))'
                      } 
                    />
                  ))}
                </Bar>
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="cumulativePercentage" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-destructive" />
              <span className="text-muted-foreground">80% del impacto</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-muted-foreground" />
              <span className="text-muted-foreground">20% restante</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-muted-foreground">% Acumulado</span>
            </div>
          </div>
        </div>
      )}

      {/* Temporal Patterns */}
      {viewMode === 'patterns' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="kpi-card">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Errores por Día de Semana
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={temporalPatterns.byDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <YAxis 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="kpi-card">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Errores por Turno
            </h3>
            <div className="space-y-4">
              {Object.entries(temporalPatterns.byHour).map(([shift, count]) => {
                const percentage = (count / errors.length) * 100;
                return (
                  <div key={shift}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{shift}</span>
                      <span className="text-sm text-muted-foreground">{count} ({percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="h-3 rounded-full bg-secondary overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Heatmap placeholder - simplified version */}
          <div className="kpi-card md:col-span-2">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Mapa de Calor: Proceso × Tipo de Error
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left p-2 text-muted-foreground">Proceso</th>
                    {['Procedimiento', 'Registro', 'Comunicación', 'Técnico'].map(type => (
                      <th key={type} className="p-2 text-muted-foreground text-center">{type}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from(new Set(errors.map(e => e.process))).slice(0, 5).map(process => {
                    const processErrors = errors.filter(e => e.process === process);
                    return (
                      <tr key={process} className="border-t border-border">
                        <td className="p-2 font-medium">{process}</td>
                        {['Procedimiento incorrecto', 'Error de registro', 'Comunicación fallida', 'Error técnico'].map(type => {
                          const count = processErrors.filter(e => e.type === type).length;
                          const intensity = count / Math.max(...errors.map(() => 1)); // Normalize
                          return (
                            <td key={type} className="p-2 text-center">
                              <div 
                                className={cn(
                                  "w-8 h-8 rounded-lg flex items-center justify-center mx-auto text-xs font-medium",
                                  count === 0 ? "bg-secondary text-muted-foreground" :
                                  count <= 2 ? "bg-warning/30 text-warning" :
                                  "bg-destructive/30 text-destructive"
                                )}
                              >
                                {count}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Insights */}
      {viewMode === 'insights' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-warning" />
            Análisis y Recomendaciones
          </h3>
          {insights.map((insight, idx) => (
            <div 
              key={idx}
              className={cn(
                "p-4 rounded-xl border",
                insight.type === 'warning' ? "border-warning/30 bg-warning/5" :
                insight.type === 'success' ? "border-success/30 bg-success/5" :
                "border-primary/30 bg-primary/5"
              )}
            >
              <p className={cn(
                "font-medium",
                insight.type === 'warning' ? "text-warning" :
                insight.type === 'success' ? "text-success" :
                "text-primary"
              )}>
                {insight.title}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {insight.description}
              </p>
            </div>
          ))}

          {/* Recommendations */}
          <div className="kpi-card mt-6">
            <h4 className="font-semibold text-foreground mb-4">🎯 Acciones Recomendadas</h4>
            <div className="space-y-3">
              {paretoData.slice(0, 3).map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="font-medium">
                      Revisar {groupBy === 'process' ? 'proceso' : groupBy === 'type' ? 'errores de tipo' : 'capacitación de'} "{item.name}"
                    </p>
                    <p className="text-muted-foreground">
                      Representa ${item.cost.toFixed(0)} ({item.percentage.toFixed(0)}% del impacto)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParetoErrorAnalysis;
