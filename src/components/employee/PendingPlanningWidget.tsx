import React from 'react';
import { CalendarDays, AlertTriangle, Clock, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface PendingTask {
  id: string;
  name: string;
  estimatedMinutes: number;
  deadline: Date | null;
  frequency: string;
}

// Mock data - will be replaced with real data
const mockPendingTasks: PendingTask[] = [
  { id: '1', name: 'Inventario mensual', estimatedMinutes: 120, deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), frequency: 'monthly' },
  { id: '2', name: 'Reporte de ventas', estimatedMinutes: 45, deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), frequency: 'weekly' },
  { id: '3', name: 'Auditoría de caja', estimatedMinutes: 60, deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), frequency: 'monthly' },
];

const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

const getDeadlineUrgency = (deadline: Date | null): 'urgent' | 'soon' | 'normal' => {
  if (!deadline) return 'normal';
  const daysUntil = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (daysUntil <= 2) return 'urgent';
  if (daysUntil <= 5) return 'soon';
  return 'normal';
};

interface PendingPlanningWidgetProps {
  className?: string;
}

export const PendingPlanningWidget: React.FC<PendingPlanningWidgetProps> = ({ className }) => {
  const navigate = useNavigate();
  const pendingTasks = mockPendingTasks;
  
  if (pendingTasks.length === 0) return null;

  const urgentCount = pendingTasks.filter(t => getDeadlineUrgency(t.deadline) === 'urgent').length;
  const totalMinutes = pendingTasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);

  return (
    <Card className={cn("border-primary/20 bg-primary/5", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            Tareas por planificar
          </CardTitle>
          <Badge variant="secondary" className="font-semibold">
            {pendingTasks.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {urgentCount > 0 && (
          <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-500/10 px-3 py-2 rounded-lg">
            <AlertTriangle className="w-4 h-4" />
            <span>{urgentCount} {urgentCount === 1 ? 'tarea tiene' : 'tareas tienen'} deadline próximo</span>
          </div>
        )}

        <div className="space-y-2">
          {pendingTasks.slice(0, 3).map(task => {
            const urgency = getDeadlineUrgency(task.deadline);
            return (
              <div 
                key={task.id}
                className="flex items-center justify-between p-2 rounded-lg bg-background/60"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{task.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <Clock className="w-3 h-3" />
                    <span>{formatDuration(task.estimatedMinutes)}</span>
                    {task.deadline && (
                      <span className={cn(
                        urgency === 'urgent' && "text-destructive font-medium",
                        urgency === 'soon' && "text-amber-600"
                      )}>
                        • Límite: {format(task.deadline, "d MMM", { locale: es })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {pendingTasks.length > 3 && (
          <p className="text-xs text-muted-foreground text-center">
            +{pendingTasks.length - 3} tareas más
          </p>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="text-xs text-muted-foreground">
            Total estimado: <span className="font-medium">{formatDuration(totalMinutes)}</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-1 text-primary h-8"
            onClick={() => navigate('/employee/calendar')}
          >
            Planificar
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PendingPlanningWidget;
