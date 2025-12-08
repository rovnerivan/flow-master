import React from 'react';
import { 
  CalendarDays, 
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface DayData {
  date: Date;
  taskCount: number;
  totalMinutes: number;
  hasUrgent: boolean;
}

interface WeekPreviewWidgetProps {
  className?: string;
}

export const WeekPreviewWidget: React.FC<WeekPreviewWidgetProps> = ({ className }) => {
  const navigate = useNavigate();
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  
  // Mock data - would come from Supabase
  const mockWeekData: DayData[] = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    const isWeekend = i >= 5;
    return {
      date,
      taskCount: isWeekend ? 0 : Math.floor(Math.random() * 5) + 2,
      totalMinutes: isWeekend ? 0 : Math.floor(Math.random() * 180) + 60,
      hasUrgent: !isWeekend && Math.random() > 0.8,
    };
  });

  const formatDuration = (minutes: number): string => {
    if (minutes === 0) return '-';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h${mins}m` : `${hours}h`;
  };

  const getLoadColor = (minutes: number): string => {
    if (minutes === 0) return 'bg-muted/30';
    if (minutes > 240) return 'bg-destructive/60';
    if (minutes > 180) return 'bg-amber-500/60';
    if (minutes > 120) return 'bg-primary/60';
    return 'bg-success/60';
  };

  const getLoadHeight = (minutes: number): string => {
    if (minutes === 0) return 'h-1';
    const maxMinutes = 300;
    const percentage = Math.min((minutes / maxMinutes) * 100, 100);
    if (percentage > 80) return 'h-8';
    if (percentage > 60) return 'h-6';
    if (percentage > 40) return 'h-4';
    if (percentage > 20) return 'h-3';
    return 'h-2';
  };

  // Today's tasks preview
  const todayData = mockWeekData.find(d => isSameDay(d.date, today));
  const todayTasks = [
    { time: '09:00', name: 'Cierre de caja' },
    { time: '14:00', name: 'Auditoría productos' },
    { time: '17:00', name: 'Reporte semanal' },
  ];

  return (
    <Card className={cn("border-border", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            Mi Semana
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-1 h-7 text-xs text-primary"
            onClick={() => navigate('/employee/calendar')}
          >
            Ver más
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Week Days */}
        <div className="grid grid-cols-7 gap-1">
          {mockWeekData.map((day, idx) => {
            const isToday = isSameDay(day.date, today);
            const dayName = format(day.date, 'EEE', { locale: es }).slice(0, 2);
            const dayNum = format(day.date, 'd');
            
            return (
              <div 
                key={idx}
                className={cn(
                  "flex flex-col items-center py-2 rounded-lg transition-colors",
                  isToday && "bg-primary/10 ring-1 ring-primary/30"
                )}
              >
                <span className={cn(
                  "text-[10px] uppercase font-medium",
                  isToday ? "text-primary" : "text-muted-foreground"
                )}>
                  {dayName}
                </span>
                <span className={cn(
                  "text-sm font-semibold",
                  isToday ? "text-primary" : "text-foreground"
                )}>
                  {dayNum}
                </span>
                <span className="text-[10px] text-muted-foreground mt-0.5">
                  {formatDuration(day.totalMinutes)}
                </span>
                
                {/* Load indicator bar */}
                <div className="w-full px-1 mt-1">
                  <div className={cn(
                    "w-full rounded-full transition-all",
                    getLoadColor(day.totalMinutes),
                    getLoadHeight(day.totalMinutes)
                  )} />
                </div>
                
                {day.hasUrgent && (
                  <AlertTriangle className="w-3 h-3 text-amber-500 mt-1" />
                )}
              </div>
            );
          })}
        </div>

        {/* Today's Tasks List */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            Hoy ({format(today, "EEEE", { locale: es })}):
          </p>
          <div className="space-y-1">
            {todayTasks.map((task, idx) => (
              <div 
                key={idx}
                className="flex items-center gap-2 text-sm"
              >
                <span className="text-muted-foreground font-mono text-xs w-12">
                  {task.time}
                </span>
                <span className="text-foreground">{task.name}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeekPreviewWidget;
