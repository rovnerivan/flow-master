import React from 'react';
import { 
  Award, BookOpen, Clock, CheckCircle2, Play, AlertCircle,
  TrendingUp, ChevronRight, FileText, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface Certification {
  id: string;
  processName: string;
  certifiedAt: Date;
  learningDays: number;
  averageDays: number;
  score?: number;
}

interface InProgressProcess {
  id: string;
  processName: string;
  currentStep: number;
  totalSteps: number;
  startedAt: Date;
  estimatedDaysToComplete: number;
  lastActivityAt: Date;
}

interface PendingProcess {
  id: string;
  processName: string;
  priority: 'high' | 'medium' | 'low';
  assignedAt: Date;
  dueDate?: Date;
}

interface EmployeeTrainingProgressProps {
  employeeName: string;
  certifications: Certification[];
  inProgress: InProgressProcess[];
  pending: PendingProcess[];
  totalLearningHours: number;
  averageLearningHoursTeam: number;
}

const priorityConfig = {
  high: { label: 'Alta', color: 'text-destructive', bg: 'bg-destructive/10' },
  medium: { label: 'Media', color: 'text-warning', bg: 'bg-warning/10' },
  low: { label: 'Baja', color: 'text-muted-foreground', bg: 'bg-muted/30' },
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
};

const EmployeeTrainingProgress: React.FC<EmployeeTrainingProgressProps> = ({
  employeeName,
  certifications,
  inProgress,
  pending,
  totalLearningHours,
  averageLearningHoursTeam,
}) => {
  const learningComparison = totalLearningHours - averageLearningHoursTeam;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="kpi-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Award className="w-4 h-4" />
            <span className="text-xs font-medium">Certificados</span>
          </div>
          <span className="text-2xl font-bold text-foreground">{certifications.length}</span>
        </div>
        
        <div className="kpi-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Play className="w-4 h-4" />
            <span className="text-xs font-medium">En Progreso</span>
          </div>
          <span className="text-2xl font-bold text-foreground">{inProgress.length}</span>
        </div>
        
        <div className="kpi-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <BookOpen className="w-4 h-4" />
            <span className="text-xs font-medium">Pendientes</span>
          </div>
          <span className="text-2xl font-bold text-foreground">{pending.length}</span>
        </div>
        
        <div className="kpi-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-medium">Hrs. Aprendizaje</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{totalLearningHours}</span>
            <span className={cn(
              "text-xs",
              learningComparison >= 0 ? 'text-success' : 'text-muted-foreground'
            )}>
              {learningComparison >= 0 ? '+' : ''}{learningComparison}h vs equipo
            </span>
          </div>
        </div>
      </div>

      {/* Certifications */}
      <div className="space-y-3">
        <h4 className="font-semibold text-foreground flex items-center gap-2">
          <Award className="w-4 h-4 text-warning" />
          Certificados ({certifications.length})
        </h4>
        
        {certifications.length > 0 ? (
          <div className="space-y-2">
            {certifications.map((cert) => {
              const speedBonus = cert.learningDays < cert.averageDays;
              const speedPercent = Math.round(((cert.averageDays - cert.learningDays) / cert.averageDays) * 100);
              
              return (
                <div 
                  key={cert.id}
                  className="group flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-success/30 transition-all cursor-pointer"
                >
                  <div className="p-2 rounded-lg bg-success/10">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h5 className="font-medium text-foreground truncate">{cert.processName}</h5>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
                        Certificado
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Completado el {formatDate(cert.certifiedAt)} • {cert.learningDays} días de aprendizaje
                    </p>
                  </div>
                  
                  {speedBonus && (
                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/10 text-success text-xs font-medium">
                      <Zap className="w-3 h-3" />
                      <span>{speedPercent}% más rápido</span>
                    </div>
                  )}
                  
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-success" />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 rounded-xl border border-border bg-card/50 text-center">
            <p className="text-sm text-muted-foreground">Aún sin certificaciones completadas</p>
          </div>
        )}
      </div>

      {/* In Progress */}
      <div className="space-y-3">
        <h4 className="font-semibold text-foreground flex items-center gap-2">
          <Play className="w-4 h-4 text-primary" />
          En Progreso ({inProgress.length})
        </h4>
        
        {inProgress.length > 0 ? (
          <div className="space-y-2">
            {inProgress.map((process) => {
              const progressPercent = Math.round((process.currentStep / process.totalSteps) * 100);
              const daysSinceStart = Math.floor((Date.now() - process.startedAt.getTime()) / (1000 * 60 * 60 * 24));
              
              return (
                <div 
                  key={process.id}
                  className="group p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <BookOpen className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h5 className="font-medium text-foreground">{process.processName}</h5>
                        <p className="text-xs text-muted-foreground">
                          Iniciado hace {daysSinceStart} días • Est. {process.estimatedDaysToComplete} días restantes
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Paso {process.currentStep} de {process.totalSteps}</span>
                      <span className="font-medium text-foreground">{progressPercent}%</span>
                    </div>
                    <Progress value={progressPercent} className="h-2" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 rounded-xl border border-border bg-card/50 text-center">
            <p className="text-sm text-muted-foreground">No hay procesos en progreso</p>
          </div>
        )}
      </div>

      {/* Pending */}
      <div className="space-y-3">
        <h4 className="font-semibold text-foreground flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-muted-foreground" />
          Pendientes ({pending.length})
        </h4>
        
        {pending.length > 0 ? (
          <div className="space-y-2">
            {pending.slice(0, 5).map((process) => {
              const priority = priorityConfig[process.priority];
              const isOverdue = process.dueDate && new Date() > process.dueDate;
              
              return (
                <div 
                  key={process.id}
                  className={cn(
                    "group flex items-center gap-4 p-3 rounded-xl border transition-all cursor-pointer",
                    "bg-card border-border hover:border-muted-foreground/30",
                    isOverdue && "border-destructive/30"
                  )}
                >
                  <div className={cn("p-1.5 rounded-lg", priority.bg)}>
                    <FileText className={cn("w-4 h-4", priority.color)} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium text-foreground truncate">{process.processName}</h5>
                    {process.dueDate && (
                      <p className={cn(
                        "text-xs",
                        isOverdue ? 'text-destructive' : 'text-muted-foreground'
                      )}>
                        {isOverdue ? 'Vencido: ' : 'Vence: '}{formatDate(process.dueDate)}
                      </p>
                    )}
                  </div>
                  
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-medium",
                    priority.bg, priority.color
                  )}>
                    {priority.label}
                  </span>
                </div>
              );
            })}
            
            {pending.length > 5 && (
              <button className="w-full py-2 text-sm text-primary hover:underline">
                Ver {pending.length - 5} más →
              </button>
            )}
          </div>
        ) : (
          <div className="p-4 rounded-xl border border-border bg-card/50 text-center">
            <p className="text-sm text-success flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Todos los procesos asignados completados
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeTrainingProgress;
