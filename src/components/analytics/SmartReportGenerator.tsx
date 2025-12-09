import React, { useState } from 'react';
import { 
  FileText, Download, TrendingUp, TrendingDown, AlertTriangle, 
  CheckCircle2, Lightbulb, Calendar, Send, Clock, Users,
  Target, Award, XCircle, BarChart3, ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ReportData {
  period: {
    start: string;
    end: string;
    label: string;
  };
  previousPeriod?: {
    start: string;
    end: string;
    label: string;
  };
  metrics: {
    efficiency: number;
    previousEfficiency?: number;
    tasksCompleted: number;
    previousTasksCompleted?: number;
    errorsDetected: number;
    previousErrors?: number;
    timeSaved: number;
    previousTimeSaved?: number;
    onboardingsActive: number;
    certifications: number;
  };
  highlights: {
    achievements: Achievement[];
    problems: Problem[];
  };
  recommendations: Recommendation[];
  teamPerformance: TeamMemberSummary[];
  processHealth: ProcessHealthSummary[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  metric?: string;
}

interface Problem {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  affectedArea: string;
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: 'process' | 'team' | 'training' | 'efficiency';
  expectedImpact: string;
}

interface TeamMemberSummary {
  name: string;
  efficiency: number;
  trend: 'up' | 'down' | 'stable';
  tasksCompleted: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
}

interface ProcessHealthSummary {
  name: string;
  healthScore: number;
  confusionRate: number;
  errorCount: number;
  trend: 'improving' | 'declining' | 'stable';
}

interface SmartReportGeneratorProps {
  data?: ReportData;
}

// Mock data for demonstration
const mockReportData: ReportData = {
  period: {
    start: '2024-01-01',
    end: '2024-01-31',
    label: 'Enero 2024'
  },
  previousPeriod: {
    start: '2023-12-01',
    end: '2023-12-31',
    label: 'Diciembre 2023'
  },
  metrics: {
    efficiency: 87,
    previousEfficiency: 82,
    tasksCompleted: 342,
    previousTasksCompleted: 298,
    errorsDetected: 15,
    previousErrors: 23,
    timeSaved: 48,
    previousTimeSaved: 32,
    onboardingsActive: 3,
    certifications: 12
  },
  highlights: {
    achievements: [
      {
        id: '1',
        title: '0 errores en Cierre de Caja',
        description: 'Por primera vez en 6 meses, el proceso de cierre se ejecutó sin errores durante todo el mes.',
        impact: 'high',
        metric: '-100% errores'
      },
      {
        id: '2',
        title: 'María García completó certificación avanzada',
        description: 'Certificación en procesos críticos de inventario, reduciendo dependencia del equipo.',
        impact: 'medium',
        metric: '+1 certificación'
      },
      {
        id: '3',
        title: 'Onboarding de Pedro en 18 días',
        description: 'Nuevo récord de tiempo de onboarding, 40% más rápido que el promedio de 30 días.',
        impact: 'high',
        metric: '-40% tiempo'
      }
    ],
    problems: [
      {
        id: '1',
        title: 'Proceso Inventario: 45% confusión',
        description: 'El proceso de inventario semanal tiene alta tasa de confusión, especialmente en pasos 3-5.',
        severity: 'critical',
        affectedArea: 'Inventario'
      },
      {
        id: '2',
        title: '3 tareas críticas vencidas',
        description: 'Tareas de mantenimiento de equipos no completadas a tiempo.',
        severity: 'warning',
        affectedArea: 'Mantenimiento'
      },
      {
        id: '3',
        title: 'Carlos: tendencia negativa 3 semanas',
        description: 'Eficiencia ha bajado de 92% a 78% en las últimas 3 semanas.',
        severity: 'warning',
        affectedArea: 'Equipo'
      }
    ]
  },
  recommendations: [
    {
      id: '1',
      title: 'Revisar proceso de Inventario',
      description: 'Programar sesión de revisión con el equipo para simplificar los pasos 3-5 que generan confusión.',
      priority: 'high',
      category: 'process',
      expectedImpact: '-30% errores inventario'
    },
    {
      id: '2',
      title: 'Reunión 1:1 con Carlos',
      description: 'Identificar causas de la baja en rendimiento. Posible sobrecarga o necesidad de capacitación.',
      priority: 'high',
      category: 'team',
      expectedImpact: 'Recuperar 14% eficiencia'
    },
    {
      id: '3',
      title: 'Celebrar logro de María',
      description: 'Reconocimiento público de la certificación para motivar al equipo.',
      priority: 'medium',
      category: 'team',
      expectedImpact: '+10% engagement'
    },
    {
      id: '4',
      title: 'Implementar recordatorios de mantenimiento',
      description: 'Configurar alertas automáticas 48h antes del vencimiento de tareas de mantenimiento.',
      priority: 'medium',
      category: 'efficiency',
      expectedImpact: '-80% tareas vencidas'
    }
  ],
  teamPerformance: [
    { name: 'María García', efficiency: 95, trend: 'up', tasksCompleted: 48, status: 'excellent' },
    { name: 'Juan López', efficiency: 88, trend: 'stable', tasksCompleted: 42, status: 'good' },
    { name: 'Ana Martínez', efficiency: 82, trend: 'up', tasksCompleted: 38, status: 'good' },
    { name: 'Carlos Ruiz', efficiency: 78, trend: 'down', tasksCompleted: 35, status: 'warning' },
    { name: 'Pedro Sánchez', efficiency: 67, trend: 'up', tasksCompleted: 22, status: 'warning' }
  ],
  processHealth: [
    { name: 'Cierre de Caja', healthScore: 95, confusionRate: 5, errorCount: 0, trend: 'improving' },
    { name: 'Preparación Pedidos', healthScore: 88, confusionRate: 12, errorCount: 4, trend: 'stable' },
    { name: 'Atención Cliente', healthScore: 82, confusionRate: 18, errorCount: 6, trend: 'stable' },
    { name: 'Inventario Semanal', healthScore: 45, confusionRate: 45, errorCount: 12, trend: 'declining' }
  ]
};

const SmartReportGenerator: React.FC<SmartReportGeneratorProps> = ({ data = mockReportData }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const generateNarrative = () => {
    const efficiencyChange = data.metrics.efficiency - (data.metrics.previousEfficiency || 0);
    const errorChange = (data.metrics.previousErrors || 0) - data.metrics.errorsDetected;
    
    let sentiment = 'positiva';
    if (efficiencyChange < 0 && errorChange < 0) sentiment = 'desafiante';
    else if (efficiencyChange > 5) sentiment = 'excelente';
    
    return `${data.period.label} fue una ${sentiment === 'excelente' ? 'excelente' : sentiment === 'positiva' ? 'positiva' : 'desafiante'} ${sentiment === 'desafiante' ? 'período' : 'semana/mes'} para el equipo. La eficiencia global alcanzó ${data.metrics.efficiency}% ${efficiencyChange >= 0 ? `(+${efficiencyChange}% vs ${data.previousPeriod?.label})` : `(${efficiencyChange}% vs ${data.previousPeriod?.label})`}. ${errorChange > 0 ? `Se logró reducir los errores en ${errorChange} casos comparado con el período anterior.` : 'Se requiere atención en la reducción de errores.'} ${data.highlights.achievements.length > 0 ? `Destaca especialmente: ${data.highlights.achievements[0].title}.` : ''}`;
  };

  const handleExport = async () => {
    setIsExporting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Create PDF-like text content
    const content = `
REPORTE EJECUTIVO - ${data.period.label}
========================================

RESUMEN EJECUTIVO
${generateNarrative()}

MÉTRICAS CLAVE
- Eficiencia Global: ${data.metrics.efficiency}%
- Tareas Completadas: ${data.metrics.tasksCompleted}
- Errores Detectados: ${data.metrics.errorsDetected}
- Tiempo Ahorrado: ${data.metrics.timeSaved}h

TOP LOGROS
${data.highlights.achievements.map((a, i) => `${i + 1}. ${a.title}`).join('\n')}

PROBLEMAS IDENTIFICADOS
${data.highlights.problems.map((p, i) => `${i + 1}. ${p.title}`).join('\n')}

RECOMENDACIONES
${data.recommendations.map((r, i) => `${i + 1}. ${r.title} - ${r.expectedImpact}`).join('\n')}
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Reporte_Ejecutivo_${data.period.label.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setIsExporting(false);
    toast.success('Reporte exportado exitosamente');
  };

  const handleSendEmail = async () => {
    setIsSending(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSending(false);
    toast.success('Reporte enviado por email');
  };

  const getChangeIndicator = (current: number, previous?: number) => {
    if (!previous) return null;
    const change = current - previous;
    const percentage = ((change / previous) * 100).toFixed(1);
    
    if (change > 0) {
      return (
        <span className="flex items-center gap-1 text-sm text-emerald-500">
          <TrendingUp className="w-3 h-3" />
          +{percentage}%
        </span>
      );
    } else if (change < 0) {
      return (
        <span className="flex items-center gap-1 text-sm text-red-500">
          <TrendingDown className="w-3 h-3" />
          {percentage}%
        </span>
      );
    }
    return <span className="text-sm text-muted-foreground">Sin cambio</span>;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-emerald-500 bg-emerald-500/10';
      case 'good': return 'text-blue-500 bg-blue-500/10';
      case 'warning': return 'text-amber-500 bg-amber-500/10';
      case 'critical': return 'text-red-500 bg-red-500/10';
      default: return 'text-muted-foreground bg-secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'medium': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'low': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-secondary text-muted-foreground';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'process': return <BarChart3 className="w-4 h-4" />;
      case 'team': return <Users className="w-4 h-4" />;
      case 'training': return <Award className="w-4 h-4" />;
      case 'efficiency': return <Target className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Reporte Ejecutivo</CardTitle>
                <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4" />
                  {data.period.label}
                  {data.previousPeriod && (
                    <span className="text-xs">vs {data.previousPeriod.label}</span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={handleSendEmail}
                disabled={isSending}
              >
                <Send className="w-4 h-4" />
                {isSending ? 'Enviando...' : 'Enviar por Email'}
              </Button>
              <Button 
                variant="hero" 
                size="sm" 
                className="gap-2"
                onClick={handleExport}
                disabled={isExporting}
              >
                <Download className="w-4 h-4" />
                {isExporting ? 'Exportando...' : 'Exportar PDF'}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {/* Executive Narrative */}
        <CardContent>
          <div className="p-4 rounded-lg bg-background/50 border border-border">
            <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Resumen Ejecutivo (30 segundos)
            </h4>
            <p className="text-foreground leading-relaxed">
              {generateNarrative()}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Comparison */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">Eficiencia Global</div>
            <div className="flex items-end justify-between mt-2">
              <span className="text-2xl font-bold text-foreground">{data.metrics.efficiency}%</span>
              {getChangeIndicator(data.metrics.efficiency, data.metrics.previousEfficiency)}
            </div>
            <Progress value={data.metrics.efficiency} className="mt-2 h-1.5" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">Tareas Completadas</div>
            <div className="flex items-end justify-between mt-2">
              <span className="text-2xl font-bold text-foreground">{data.metrics.tasksCompleted}</span>
              {getChangeIndicator(data.metrics.tasksCompleted, data.metrics.previousTasksCompleted)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">Errores Detectados</div>
            <div className="flex items-end justify-between mt-2">
              <span className="text-2xl font-bold text-foreground">{data.metrics.errorsDetected}</span>
              {data.metrics.previousErrors && (
                <span className={cn(
                  "flex items-center gap-1 text-sm",
                  data.metrics.errorsDetected < data.metrics.previousErrors 
                    ? "text-emerald-500" 
                    : "text-red-500"
                )}>
                  {data.metrics.errorsDetected < data.metrics.previousErrors ? (
                    <TrendingDown className="w-3 h-3" />
                  ) : (
                    <TrendingUp className="w-3 h-3" />
                  )}
                  {Math.abs(data.metrics.errorsDetected - data.metrics.previousErrors)}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">Tiempo Ahorrado</div>
            <div className="flex items-end justify-between mt-2">
              <span className="text-2xl font-bold text-foreground">{data.metrics.timeSaved}h</span>
              {getChangeIndicator(data.metrics.timeSaved, data.metrics.previousTimeSaved)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Highlights: Achievements & Problems */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Top {data.highlights.achievements.length} Logros
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.highlights.achievements.map((achievement, index) => (
              <div 
                key={achievement.id}
                className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 text-xs font-bold shrink-0">
                      {index + 1}
                    </span>
                    <div>
                      <h4 className="font-medium text-foreground text-sm">{achievement.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
                    </div>
                  </div>
                  {achievement.metric && (
                    <Badge variant="outline" className="shrink-0 text-emerald-500 border-emerald-500/30">
                      {achievement.metric}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Problems */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Top {data.highlights.problems.length} Problemas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.highlights.problems.map((problem, index) => (
              <div 
                key={problem.id}
                className={cn(
                  "p-3 rounded-lg border",
                  problem.severity === 'critical' 
                    ? "border-red-500/20 bg-red-500/5" 
                    : "border-amber-500/20 bg-amber-500/5"
                )}
              >
                <div className="flex items-start gap-2">
                  <span className={cn(
                    "flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold shrink-0",
                    problem.severity === 'critical' 
                      ? "bg-red-500/20 text-red-500" 
                      : "bg-amber-500/20 text-amber-500"
                  )}>
                    {index + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-foreground text-sm">{problem.title}</h4>
                      {problem.severity === 'critical' && (
                        <Badge variant="outline" className="text-red-500 border-red-500/30 text-xs">
                          Crítico
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{problem.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Actionable Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            Recomendaciones Accionables
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {data.recommendations.map((rec) => (
              <div 
                key={rec.id}
                className="p-4 rounded-lg border border-border hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className={cn("p-1.5 rounded-lg", getPriorityColor(rec.priority))}>
                      {getCategoryIcon(rec.category)}
                    </div>
                    <Badge variant="outline" className={cn("text-xs", getPriorityColor(rec.priority))}>
                      {rec.priority === 'high' ? 'Alta' : rec.priority === 'medium' ? 'Media' : 'Baja'}
                    </Badge>
                  </div>
                </div>
                <h4 className="font-medium text-foreground mb-1">{rec.title}</h4>
                <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-primary flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    Impacto: {rec.expectedImpact}
                  </span>
                  <Button variant="ghost" size="sm" className="text-xs gap-1 h-7">
                    Tomar acción
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Team Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Resumen de Rendimiento del Equipo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-muted-foreground border-b border-border">
                  <th className="pb-3 font-medium">Colaborador</th>
                  <th className="pb-3 font-medium text-center">Eficiencia</th>
                  <th className="pb-3 font-medium text-center">Tendencia</th>
                  <th className="pb-3 font-medium text-center">Tareas</th>
                  <th className="pb-3 font-medium text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.teamPerformance.map((member) => (
                  <tr key={member.name} className="text-sm">
                    <td className="py-3 font-medium text-foreground">{member.name}</td>
                    <td className="py-3 text-center">
                      <span className={cn(
                        "font-medium",
                        member.efficiency >= 85 ? "text-emerald-500" : 
                        member.efficiency >= 70 ? "text-amber-500" : "text-red-500"
                      )}>
                        {member.efficiency}%
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      {member.trend === 'up' && <TrendingUp className="w-4 h-4 text-emerald-500 mx-auto" />}
                      {member.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500 mx-auto" />}
                      {member.trend === 'stable' && <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="py-3 text-center text-muted-foreground">{member.tasksCompleted}</td>
                    <td className="py-3 text-center">
                      <Badge className={cn("text-xs", getStatusColor(member.status))}>
                        {member.status === 'excellent' ? 'Excelente' : 
                         member.status === 'good' ? 'Bien' : 
                         member.status === 'warning' ? 'Atención' : 'Crítico'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Process Health Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Salud de Procesos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.processHealth.map((process) => (
              <div key={process.name} className="flex items-center gap-4">
                <div className="w-36 truncate text-sm font-medium text-foreground">
                  {process.name}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={process.healthScore} 
                      className={cn(
                        "h-2 flex-1",
                        process.healthScore >= 80 ? "[&>div]:bg-emerald-500" :
                        process.healthScore >= 60 ? "[&>div]:bg-amber-500" : "[&>div]:bg-red-500"
                      )}
                    />
                    <span className={cn(
                      "text-sm font-medium w-10 text-right",
                      process.healthScore >= 80 ? "text-emerald-500" :
                      process.healthScore >= 60 ? "text-amber-500" : "text-red-500"
                    )}>
                      {process.healthScore}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {process.confusionRate}% confusión
                  </span>
                  <span className="flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    {process.errorCount} errores
                  </span>
                  {process.trend === 'improving' && (
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                  )}
                  {process.trend === 'declining' && (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartReportGenerator;
