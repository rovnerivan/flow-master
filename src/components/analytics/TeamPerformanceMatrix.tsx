import React, { useMemo, useState } from 'react';
import { 
  Star, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  Award,
  Users,
  Calendar,
  ChevronDown,
  Minus,
  Clock,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface EmployeePerformance {
  id: string;
  name: string;
  avatarUrl?: string;
  efficiency: number; // 0-100+
  volume: number; // tasks completed
  trend: 'up' | 'down' | 'stable';
  trendValue: number; // percentage change
  weeklyHistory: number[]; // Last 4 weeks efficiency
  tenureDays: number;
  workloadHours: number;
  capacityHours: number;
  alertLevel?: 'none' | 'warning' | 'critical';
  alertReason?: string;
}

interface TeamPerformanceMatrixProps {
  employees: EmployeePerformance[];
  averageEfficiency: number;
  averageVolume: number;
}

type TenureFilter = 'all' | 'new' | 'established' | 'veteran';
type ViewMode = 'matrix' | 'list' | 'alerts';

const tenureFilters: Record<TenureFilter, { label: string; range: [number, number] }> = {
  all: { label: 'Todos', range: [0, Infinity] },
  new: { label: 'Nuevos (<30 días)', range: [0, 30] },
  established: { label: 'En desarrollo (30-90 días)', range: [30, 90] },
  veteran: { label: 'Veteranos (>90 días)', range: [90, Infinity] },
};

const quadrantConfig = {
  star: {
    label: 'Estrellas',
    icon: Star,
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    description: 'Alto rendimiento, alto volumen',
  },
  potential: {
    label: 'Alto Potencial',
    icon: TrendingUp,
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/30',
    description: 'Alto rendimiento, volumen moderado',
  },
  coaching: {
    label: 'Necesita Coaching',
    icon: Users,
    color: 'text-warning',
    bg: 'bg-warning/10',
    border: 'border-warning/30',
    description: 'Rendimiento mejorable, alto volumen',
  },
  attention: {
    label: 'Atención Urgente',
    icon: AlertTriangle,
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    border: 'border-destructive/30',
    description: 'Bajo rendimiento, bajo volumen',
  },
};

const getQuadrant = (
  efficiency: number, 
  volume: number, 
  avgEfficiency: number, 
  avgVolume: number
): keyof typeof quadrantConfig => {
  const highEff = efficiency >= avgEfficiency;
  const highVol = volume >= avgVolume;
  
  if (highEff && highVol) return 'star';
  if (highEff && !highVol) return 'potential';
  if (!highEff && highVol) return 'coaching';
  return 'attention';
};

const TeamPerformanceMatrix: React.FC<TeamPerformanceMatrixProps> = ({
  employees,
  averageEfficiency,
  averageVolume,
}) => {
  const [tenureFilter, setTenureFilter] = useState<TenureFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('matrix');
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);

  // Filter employees by tenure
  const filteredEmployees = useMemo(() => {
    const range = tenureFilters[tenureFilter].range;
    return employees.filter(e => e.tenureDays >= range[0] && e.tenureDays < range[1]);
  }, [employees, tenureFilter]);

  // Calculate tenure-adjusted averages for fair comparison
  const tenureAdjustedAverages = useMemo(() => {
    if (filteredEmployees.length === 0) return { efficiency: averageEfficiency, volume: averageVolume };
    return {
      efficiency: filteredEmployees.reduce((sum, e) => sum + e.efficiency, 0) / filteredEmployees.length,
      volume: filteredEmployees.reduce((sum, e) => sum + e.volume, 0) / filteredEmployees.length,
    };
  }, [filteredEmployees, averageEfficiency, averageVolume]);

  // Group employees by quadrant
  const quadrants = useMemo(() => {
    const result: Record<keyof typeof quadrantConfig, EmployeePerformance[]> = {
      star: [],
      potential: [],
      coaching: [],
      attention: [],
    };
    
    filteredEmployees.forEach(emp => {
      const quadrant = getQuadrant(
        emp.efficiency, 
        emp.volume, 
        tenureAdjustedAverages.efficiency, 
        tenureAdjustedAverages.volume
      );
      result[quadrant].push(emp);
    });
    
    return result;
  }, [filteredEmployees, tenureAdjustedAverages]);

  // Detect alerts
  const alerts = useMemo(() => {
    return employees.filter(e => {
      // 2+ weeks declining trend
      if (e.weeklyHistory.length >= 2) {
        const recentDecline = e.weeklyHistory.slice(-2).every((val, idx, arr) => 
          idx === 0 || val < arr[idx - 1]
        );
        if (recentDecline && e.trendValue < -10) return true;
      }
      // Below 70% efficiency
      if (e.efficiency < 70) return true;
      // Overloaded
      if (e.workloadHours > e.capacityHours * 1.2) return true;
      return false;
    }).map(e => ({
      ...e,
      alertLevel: e.efficiency < 60 ? 'critical' as const : 'warning' as const,
      alertReason: e.efficiency < 70 
        ? `Eficiencia por debajo del mínimo (${e.efficiency}%)`
        : e.trendValue < -10 
        ? `Tendencia negativa por ${Math.abs(e.trendValue)}% en 2 semanas`
        : `Sobrecargado (${Math.round((e.workloadHours / e.capacityHours) * 100)}% de capacidad)`,
    }));
  }, [employees]);

  const EmployeeCard: React.FC<{ employee: EmployeePerformance; compact?: boolean }> = ({ 
    employee, 
    compact = false 
  }) => {
    const isSelected = selectedEmployee === employee.id;
    const tenureLabel = employee.tenureDays < 30 ? 'Nuevo' : 
                        employee.tenureDays < 90 ? 'En desarrollo' : 'Veterano';
    
    return (
      <div 
        className={cn(
          "p-3 rounded-xl border transition-all cursor-pointer",
          isSelected ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/30"
        )}
        onClick={() => setSelectedEmployee(isSelected ? null : employee.id)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-medium">
            {employee.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{employee.name}</p>
            <p className="text-xs text-muted-foreground">{tenureLabel}</p>
          </div>
          <div className="text-right">
            <p className={cn(
              "text-lg font-bold",
              employee.efficiency >= 90 ? 'text-success' :
              employee.efficiency >= 70 ? 'text-foreground' :
              'text-destructive'
            )}>
              {employee.efficiency}%
            </p>
            <div className={cn(
              "flex items-center gap-1 text-xs justify-end",
              employee.trend === 'up' ? 'text-success' :
              employee.trend === 'down' ? 'text-destructive' :
              'text-muted-foreground'
            )}>
              {employee.trend === 'up' && <TrendingUp className="w-3 h-3" />}
              {employee.trend === 'down' && <TrendingDown className="w-3 h-3" />}
              {employee.trend === 'stable' && <Minus className="w-3 h-3" />}
              {employee.trendValue > 0 ? '+' : ''}{employee.trendValue}%
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        {isSelected && !compact && (
          <div className="mt-4 pt-4 border-t border-border space-y-3">
            {/* Weekly Trend */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Últimas 4 semanas</p>
              <div className="flex items-end gap-1 h-12">
                {employee.weeklyHistory.map((val, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                    <div 
                      className={cn(
                        "w-full rounded-t transition-all",
                        val >= 80 ? 'bg-success' : val >= 60 ? 'bg-warning' : 'bg-destructive'
                      )}
                      style={{ height: `${(val / 100) * 40}px` }}
                    />
                    <span className="text-[10px] text-muted-foreground">S{idx + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Workload */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Carga de trabajo
                </span>
                <span className={cn(
                  employee.workloadHours > employee.capacityHours ? 'text-destructive' : 'text-foreground'
                )}>
                  {employee.workloadHours}h / {employee.capacityHours}h
                </span>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all",
                    employee.workloadHours > employee.capacityHours ? 'bg-destructive' :
                    employee.workloadHours > employee.capacityHours * 0.8 ? 'bg-warning' :
                    'bg-success'
                  )}
                  style={{ width: `${Math.min((employee.workloadHours / employee.capacityHours) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Volume */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1">
                <Target className="w-3 h-3" />
                Tareas completadas
              </span>
              <span className="font-medium">{employee.volume}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-border p-1 bg-secondary/50">
          {(['matrix', 'list', 'alerts'] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={cn(
                "px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                viewMode === mode 
                  ? "bg-card text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {mode === 'matrix' && <Users className="w-4 h-4" />}
              {mode === 'list' && <Award className="w-4 h-4" />}
              {mode === 'alerts' && (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  {alerts.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-destructive text-destructive-foreground text-xs">
                      {alerts.length}
                    </span>
                  )}
                </>
              )}
              {mode === 'matrix' ? 'Matriz' : mode === 'list' ? 'Ranking' : 'Alertas'}
            </button>
          ))}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Calendar className="w-4 h-4" />
              {tenureFilters[tenureFilter].label}
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {(Object.keys(tenureFilters) as TenureFilter[]).map((key) => (
              <DropdownMenuItem key={key} onClick={() => setTenureFilter(key)}>
                {tenureFilters[key].label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {tenureFilter !== 'all' && (
          <p className="text-xs text-muted-foreground">
            Comparando con promedio del grupo: {tenureAdjustedAverages.efficiency.toFixed(0)}% eficiencia
          </p>
        )}
      </div>

      {/* Matrix View */}
      {viewMode === 'matrix' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(Object.keys(quadrantConfig) as (keyof typeof quadrantConfig)[]).map((quadrant) => {
            const config = quadrantConfig[quadrant];
            const Icon = config.icon;
            const emps = quadrants[quadrant];
            
            return (
              <div 
                key={quadrant}
                className={cn("p-4 rounded-xl border", config.bg, config.border)}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Icon className={cn("w-5 h-5", config.color)} />
                  <div>
                    <h4 className="font-semibold text-sm">{config.label}</h4>
                    <p className="text-xs text-muted-foreground">{config.description}</p>
                  </div>
                  <span className={cn(
                    "ml-auto px-2 py-0.5 rounded-full text-xs font-medium",
                    config.bg, config.color
                  )}>
                    {emps.length}
                  </span>
                </div>
                
                {emps.length > 0 ? (
                  <div className="space-y-2">
                    {emps.slice(0, 3).map((emp) => (
                      <EmployeeCard key={emp.id} employee={emp} compact />
                    ))}
                    {emps.length > 3 && (
                      <p className="text-xs text-muted-foreground text-center pt-2">
                        +{emps.length - 3} más
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Ningún empleado
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* List/Ranking View */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {filteredEmployees
            .sort((a, b) => b.efficiency - a.efficiency)
            .map((emp, idx) => (
              <div key={emp.id} className="flex items-center gap-3">
                <span className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
                  idx === 0 ? "bg-yellow-500/20 text-yellow-500" :
                  idx === 1 ? "bg-gray-300/20 text-gray-400" :
                  idx === 2 ? "bg-amber-600/20 text-amber-600" :
                  "bg-secondary text-muted-foreground"
                )}>
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <EmployeeCard employee={emp} />
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Alerts View */}
      {viewMode === 'alerts' && (
        <div className="space-y-4">
          {alerts.length === 0 ? (
            <div className="p-8 rounded-xl border border-success/30 bg-success/5 text-center">
              <Award className="w-12 h-12 text-success mx-auto mb-3" />
              <h4 className="font-semibold text-success">Sin alertas</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Todo el equipo está rindiendo dentro de los parámetros esperados
              </p>
            </div>
          ) : (
            <>
              <div className="p-4 rounded-xl border border-warning/30 bg-warning/5">
                <p className="text-sm text-warning font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  {alerts.length} empleado(s) requieren atención
                </p>
              </div>
              
              {alerts.map((emp) => (
                <div 
                  key={emp.id}
                  className={cn(
                    "p-4 rounded-xl border",
                    emp.alertLevel === 'critical' 
                      ? "border-destructive/30 bg-destructive/5" 
                      : "border-warning/30 bg-warning/5"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle className={cn(
                      "w-5 h-5 mt-0.5",
                      emp.alertLevel === 'critical' ? 'text-destructive' : 'text-warning'
                    )} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-medium",
                          emp.alertLevel === 'critical' 
                            ? 'bg-destructive text-destructive-foreground'
                            : 'bg-warning text-warning-foreground'
                        )}>
                          {emp.alertLevel === 'critical' ? 'Crítico' : 'Atención'}
                        </span>
                      </div>
                      <p className="font-medium">{emp.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">{emp.alertReason}</p>
                      
                      {/* Mini trend chart */}
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-xs text-muted-foreground">Tendencia:</span>
                        <div className="flex items-end gap-0.5 h-4">
                          {emp.weeklyHistory.map((val, idx) => (
                            <div 
                              key={idx}
                              className={cn(
                                "w-2 rounded-t",
                                val >= 80 ? 'bg-success' : val >= 60 ? 'bg-warning' : 'bg-destructive'
                              )}
                              style={{ height: `${(val / 100) * 16}px` }}
                            />
                          ))}
                        </div>
                        <span className={cn(
                          "text-xs font-medium",
                          emp.trend === 'down' ? 'text-destructive' : 'text-muted-foreground'
                        )}>
                          {emp.trendValue > 0 ? '+' : ''}{emp.trendValue}%
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Ver perfil
                    </Button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TeamPerformanceMatrix;
