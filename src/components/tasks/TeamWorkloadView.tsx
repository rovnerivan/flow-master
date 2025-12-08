import React, { useState } from 'react';
import { format, startOfWeek, endOfWeek, addWeeks, eachDayOfInterval, startOfMonth, endOfMonth, addMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  User, 
  ChevronLeft, 
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar as CalendarIcon,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Types
interface TeamMember {
  id: string;
  name: string;
  avatarUrl?: string;
  role?: string;
  availableHoursPerDay: number;
  department?: string;
}

interface AssignedTask {
  id: string;
  name: string;
  assigneeId: string;
  scheduledDate: string;
  estimatedDurationMin: number;
  status: 'pending' | 'in_progress' | 'completed';
}

interface TeamWorkloadViewProps {
  className?: string;
  onMemberClick?: (memberId: string) => void;
}

// Mock data
const mockTeamMembers: TeamMember[] = [
  { id: 'u1', name: 'Carlos López', availableHoursPerDay: 8, role: 'Cajero', department: 'Ventas' },
  { id: 'u2', name: 'Ana Martínez', availableHoursPerDay: 8, role: 'Vendedora', department: 'Ventas' },
  { id: 'u3', name: 'María García', availableHoursPerDay: 6, role: 'Supervisor', department: 'Operaciones' },
  { id: 'u4', name: 'Roberto Díaz', availableHoursPerDay: 8, role: 'Almacenista', department: 'Logística' },
  { id: 'u5', name: 'Sofia Ruiz', availableHoursPerDay: 4, role: 'Part-time', department: 'Ventas' },
  { id: 'u6', name: 'Pedro Sánchez', availableHoursPerDay: 8, role: 'Técnico', department: 'Mantenimiento' },
];

// Generate mock tasks for a period
const generateMockTasks = (startDate: Date, endDate: Date): AssignedTask[] => {
  const tasks: AssignedTask[] = [];
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  
  days.forEach((day) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    
    // Random tasks per day per person
    mockTeamMembers.forEach((member) => {
      const taskCount = Math.floor(Math.random() * 4) + 1;
      for (let i = 0; i < taskCount; i++) {
        tasks.push({
          id: `task-${member.id}-${dateStr}-${i}`,
          name: ['Verificar caja', 'Revisar stock', 'Atender cliente', 'Limpieza', 'Reporte'][Math.floor(Math.random() * 5)],
          assigneeId: member.id,
          scheduledDate: dateStr,
          estimatedDurationMin: [15, 30, 45, 60, 90, 120][Math.floor(Math.random() * 6)],
          status: ['pending', 'in_progress', 'completed'][Math.floor(Math.random() * 3)] as 'pending' | 'in_progress' | 'completed',
        });
      }
    });
  });
  
  return tasks;
};

const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

type ViewPeriod = 'week' | 'month';

const TeamWorkloadView: React.FC<TeamWorkloadViewProps> = ({ className, onMemberClick }) => {
  const [viewPeriod, setViewPeriod] = useState<ViewPeriod>('week');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  
  // Calculate period bounds
  const periodStart = viewPeriod === 'week' 
    ? startOfWeek(currentDate, { weekStartsOn: 1 })
    : startOfMonth(currentDate);
  const periodEnd = viewPeriod === 'week'
    ? endOfWeek(currentDate, { weekStartsOn: 1 })
    : endOfMonth(currentDate);
  
  // Get mock tasks for current period
  const [tasks] = useState<AssignedTask[]>(() => generateMockTasks(periodStart, periodEnd));

  // Navigation
  const goToPrevious = () => {
    setCurrentDate(prev => viewPeriod === 'week' ? addWeeks(prev, -1) : addMonths(prev, -1));
  };
  const goToNext = () => {
    setCurrentDate(prev => viewPeriod === 'week' ? addWeeks(prev, 1) : addMonths(prev, 1));
  };
  const goToToday = () => setCurrentDate(new Date());

  // Calculate workload per member
  const calculateMemberWorkload = (memberId: string) => {
    const memberTasks = tasks.filter(t => t.assigneeId === memberId);
    const member = mockTeamMembers.find(m => m.id === memberId);
    
    const totalAssigned = memberTasks.reduce((sum, t) => sum + t.estimatedDurationMin, 0);
    const completedMinutes = memberTasks
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.estimatedDurationMin, 0);
    
    const daysInPeriod = eachDayOfInterval({ start: periodStart, end: periodEnd }).length;
    const totalAvailable = (member?.availableHoursPerDay || 8) * 60 * daysInPeriod;
    
    const loadPercentage = (totalAssigned / totalAvailable) * 100;
    const completionPercentage = memberTasks.length > 0 
      ? (memberTasks.filter(t => t.status === 'completed').length / memberTasks.length) * 100
      : 0;
    
    return {
      totalAssigned,
      totalAvailable,
      loadPercentage,
      completedMinutes,
      completionPercentage,
      taskCount: memberTasks.length,
      completedCount: memberTasks.filter(t => t.status === 'completed').length,
      pendingCount: memberTasks.filter(t => t.status === 'pending').length,
      inProgressCount: memberTasks.filter(t => t.status === 'in_progress').length,
    };
  };

  // Get load status
  const getLoadStatus = (percentage: number): { label: string; color: string; icon: React.ReactNode } => {
    if (percentage > 100) {
      return { 
        label: 'Sobrecargado', 
        color: 'text-destructive',
        icon: <AlertTriangle className="h-4 w-4 text-destructive" />
      };
    }
    if (percentage > 80) {
      return { 
        label: 'Alta carga', 
        color: 'text-warning',
        icon: <TrendingUp className="h-4 w-4 text-warning" />
      };
    }
    if (percentage > 50) {
      return { 
        label: 'Carga normal', 
        color: 'text-success',
        icon: <Minus className="h-4 w-4 text-success" />
      };
    }
    return { 
      label: 'Baja carga', 
      color: 'text-muted-foreground',
      icon: <TrendingDown className="h-4 w-4 text-muted-foreground" />
    };
  };

  // Period label
  const periodLabel = viewPeriod === 'week'
    ? `Semana del ${format(periodStart, 'd', { locale: es })} al ${format(periodEnd, 'd MMM yyyy', { locale: es })}`
    : format(periodStart, 'MMMM yyyy', { locale: es });

  // Team summary
  const teamSummary = mockTeamMembers.reduce((acc, member) => {
    const workload = calculateMemberWorkload(member.id);
    return {
      totalAssigned: acc.totalAssigned + workload.totalAssigned,
      totalAvailable: acc.totalAvailable + workload.totalAvailable,
      overloaded: acc.overloaded + (workload.loadPercentage > 100 ? 1 : 0),
      highLoad: acc.highLoad + (workload.loadPercentage > 80 && workload.loadPercentage <= 100 ? 1 : 0),
    };
  }, { totalAssigned: 0, totalAvailable: 0, overloaded: 0, highLoad: 0 });

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goToPrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Hoy
          </Button>
          <Button variant="outline" size="icon" onClick={goToNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="ml-2 font-medium text-foreground">{periodLabel}</span>
        </div>
        
        <div className="flex items-center gap-4">
          <Tabs value={viewPeriod} onValueChange={(v) => setViewPeriod(v as ViewPeriod)}>
            <TabsList>
              <TabsTrigger value="week" className="gap-1">
                <CalendarIcon className="h-4 w-4" />
                Semana
              </TabsTrigger>
              <TabsTrigger value="month" className="gap-1">
                <CalendarIcon className="h-4 w-4" />
                Mes
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Team Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-card border border-border rounded-lg">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Clock className="h-4 w-4" />
            Horas asignadas
          </div>
          <p className="text-2xl font-bold text-foreground">
            {formatDuration(teamSummary.totalAssigned)}
          </p>
          <p className="text-xs text-muted-foreground">
            de {formatDuration(teamSummary.totalAvailable)} disponibles
          </p>
        </div>
        
        <div className="p-4 bg-card border border-border rounded-lg">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <TrendingUp className="h-4 w-4" />
            Utilización promedio
          </div>
          <p className="text-2xl font-bold text-foreground">
            {Math.round((teamSummary.totalAssigned / teamSummary.totalAvailable) * 100)}%
          </p>
        </div>
        
        <div className="p-4 bg-card border border-border rounded-lg">
          <div className="flex items-center gap-2 text-sm text-destructive mb-1">
            <AlertTriangle className="h-4 w-4" />
            Sobrecargados
          </div>
          <p className="text-2xl font-bold text-destructive">
            {teamSummary.overloaded}
          </p>
          <p className="text-xs text-muted-foreground">
            de {mockTeamMembers.length} personas
          </p>
        </div>
        
        <div className="p-4 bg-card border border-border rounded-lg">
          <div className="flex items-center gap-2 text-sm text-warning mb-1">
            <TrendingUp className="h-4 w-4" />
            Alta carga
          </div>
          <p className="text-2xl font-bold text-warning">
            {teamSummary.highLoad}
          </p>
          <p className="text-xs text-muted-foreground">
            &gt;80% capacidad
          </p>
        </div>
      </div>

      {/* Team Members List */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30">
          <h3 className="font-semibold text-foreground">Carga de trabajo por persona</h3>
        </div>
        
        <ScrollArea className="max-h-[500px]">
          <div className="divide-y divide-border">
            {mockTeamMembers.map((member) => {
              const workload = calculateMemberWorkload(member.id);
              const status = getLoadStatus(workload.loadPercentage);
              
              return (
                <div
                  key={member.id}
                  className={cn(
                    'p-4 hover:bg-muted/30 transition-colors cursor-pointer',
                    workload.loadPercentage > 100 && 'bg-destructive/5'
                  )}
                  onClick={() => onMemberClick?.(member.id)}
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium text-foreground">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.role} • {member.department}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {status.icon}
                          <Badge 
                            variant={workload.loadPercentage > 100 ? 'destructive' : 'outline'}
                            className={cn(
                              workload.loadPercentage > 100 && 'animate-pulse'
                            )}
                          >
                            {Math.round(workload.loadPercentage)}%
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              'absolute inset-y-0 left-0 transition-all',
                              workload.loadPercentage > 100 ? 'bg-destructive' :
                              workload.loadPercentage > 80 ? 'bg-warning' : 'bg-success'
                            )}
                            style={{ width: `${Math.min(workload.loadPercentage, 100)}%` }}
                          />
                          {workload.loadPercentage > 100 && (
                            <div 
                              className="absolute inset-y-0 bg-destructive/50 animate-pulse"
                              style={{ 
                                left: '100%',
                                width: `${Math.min(workload.loadPercentage - 100, 50)}%`
                              }}
                            />
                          )}
                        </div>
                        
                        {/* Stats */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            {formatDuration(workload.totalAssigned)} asignadas / {formatDuration(workload.totalAvailable)} disponibles
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-success" />
                              {workload.completedCount} completadas
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-primary" />
                              {workload.inProgressCount} en progreso
                            </span>
                            <span>
                              {workload.pendingCount} pendientes
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default TeamWorkloadView;
