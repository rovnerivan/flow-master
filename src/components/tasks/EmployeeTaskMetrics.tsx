import React from 'react';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Target,
  ThumbsUp,
  Ban,
  BookOpen,
  Lightbulb,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Task, calculateMetrics } from '@/lib/taskTypes';
import { ProgressRing } from '@/components/dashboard/ProgressRing';

interface EmployeeTaskMetricsProps {
  tasks: Task[];
  userId: string;
  lessonsCount?: number;
}

const EmployeeTaskMetrics: React.FC<EmployeeTaskMetricsProps> = ({
  tasks,
  userId,
  lessonsCount = 0,
}) => {
  // Filter tasks for this employee
  const myTasks = tasks.filter(t => 
    t.assignments.some(a => a.userId === userId)
  );
  
  const metrics = calculateMetrics(myTasks);
  
  // Calculate personal stats
  const myAssignments = myTasks.flatMap(t => 
    t.assignments.filter(a => a.userId === userId)
  );
  
  const totalCorrections = myAssignments.reduce(
    (sum, a) => sum + (a.correctionCount || 0), 
    0
  );
  
  const totalTimeSpent = myAssignments.reduce(
    (sum, a) => sum + (a.timeSpentMinutes || 0),
    0
  );
  
  return (
    <div className="space-y-6">
      {/* Main progress ring */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-6">
          <ProgressRing 
            progress={Math.round(metrics.completionRate)} 
            size={100} 
            strokeWidth={8}
          />
          <div>
            <h3 className="text-2xl font-bold text-foreground">
              {Math.round(metrics.completionRate)}%
            </h3>
            <p className="text-muted-foreground">Tasa de completitud</p>
            <p className="text-sm text-muted-foreground mt-1">
              {metrics.completedTasks} de {metrics.totalTasks} tareas
            </p>
          </div>
        </div>
      </div>
      
      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-success" />
            <span className="text-sm text-muted-foreground">Completadas</span>
          </div>
          <div className="text-2xl font-bold">{metrics.completedTasks}</div>
        </div>
        
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">En progreso</span>
          </div>
          <div className="text-2xl font-bold">{metrics.inProgressTasks}</div>
        </div>
        
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Tiempo total</span>
          </div>
          <div className="text-2xl font-bold">
            {Math.floor(totalTimeSpent / 60)}h {totalTimeSpent % 60}m
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <span className="text-sm text-muted-foreground">Correcciones</span>
          </div>
          <div className="text-2xl font-bold">{totalCorrections}</div>
        </div>
      </div>
      
      {/* Learning section */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Tu aprendizaje
        </h4>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ThumbsUp className="h-4 w-4 text-success" />
              <span className="text-sm">Errores resueltos</span>
            </div>
            <span className="font-medium">{metrics.errorsResolved}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ban className="h-4 w-4 text-destructive" />
              <span className="text-sm">Errores no salvables</span>
            </div>
            <span className="font-medium">{metrics.errorsUnresolved}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-warning" />
              <span className="text-sm">Lecciones aprendidas</span>
            </div>
            <span className="font-medium">{lessonsCount}</span>
          </div>
        </div>
      </div>
      
      {/* Motivational tip */}
      {metrics.completionRate >= 80 && (
        <div className="bg-success/10 border border-success/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-5 w-5 text-success" />
            <span className="font-medium text-success">¡Excelente trabajo!</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Tu tasa de completitud está por encima del 80%. Sigue así.
          </p>
        </div>
      )}
      
      {metrics.pendingReviewTasks > 0 && (
        <div className="bg-warning/10 border border-warning/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-5 w-5 text-warning" />
            <span className="font-medium text-warning">Tareas en revisión</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Tienes {metrics.pendingReviewTasks} tarea(s) esperando revisión del supervisor.
          </p>
        </div>
      )}
    </div>
  );
};

export default EmployeeTaskMetrics;
