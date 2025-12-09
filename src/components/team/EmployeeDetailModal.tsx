import React, { useState } from 'react';
import { 
  X, LayoutDashboard, CheckSquare, History, BookOpen, BarChart3,
  Mail, MessageSquare, CalendarPlus, MoreVertical, UserCog
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import type { EmployeeData } from './EmployeeProfileCard';
import EmployeePerformanceSnapshot from './EmployeePerformanceSnapshot';
import EmployeeTasksTimeline from './EmployeeTasksTimeline';
import EmployeeHistoryView from './EmployeeHistoryView';
import EmployeeTrainingProgress from './EmployeeTrainingProgress';
import EmployeeMetricsComparison from './EmployeeMetricsComparison';

interface EmployeeDetailModalProps {
  employee: EmployeeData;
  onClose: () => void;
}

type TabKey = 'resumen' | 'tareas' | 'historial' | 'capacitacion' | 'metricas';

const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: 'resumen', label: 'Resumen', icon: LayoutDashboard },
  { key: 'tareas', label: 'Tareas', icon: CheckSquare },
  { key: 'historial', label: 'Historial', icon: History },
  { key: 'capacitacion', label: 'Capacitación', icon: BookOpen },
  { key: 'metricas', label: 'Métricas', icon: BarChart3 },
];

// Mock data generators
const generateMockTasks = () => [
  { id: '1', title: 'Verificar inventario matutino', status: 'completed' as const, scheduledTime: '08:00', completedTime: '08:15', estimatedMinutes: 10, actualMinutes: 15, linkedProcess: { id: 'p1', name: 'Apertura de Tienda' } },
  { id: '2', title: 'Preparar pedidos zona A', status: 'completed' as const, scheduledTime: '09:00', completedTime: '09:45', estimatedMinutes: 30, actualMinutes: 45 },
  { id: '3', title: 'Revisión de calidad lote B', status: 'in_progress' as const, scheduledTime: '10:00', estimatedMinutes: 20, actualMinutes: 25, linkedProcess: { id: 'p2', name: 'Control de Calidad' }, corrections: 1, reviewNote: 'Faltó revisar sección de lácteos', reviewer: 'María García' },
  { id: '4', title: 'Atención al cliente mostrador', status: 'pending' as const, scheduledTime: '11:00', estimatedMinutes: 60 },
  { id: '5', title: 'Reposición de estantes', status: 'pending' as const, scheduledTime: '14:00', estimatedMinutes: 45 },
  { id: '6', title: 'Cierre de caja', status: 'pending' as const, scheduledTime: '18:00', estimatedMinutes: 20, linkedProcess: { id: 'p3', name: 'Cierre de Caja' } },
];

const generateMockDailyHistory = () => {
  const history = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const completed = Math.floor(Math.random() * 2) + 4;
    const total = completed + Math.floor(Math.random() * 2);
    history.push({
      date,
      tasksCompleted: completed,
      tasksTotal: total,
      efficiency: 70 + Math.floor(Math.random() * 25),
      timeWorked: 400 + Math.floor(Math.random() * 100),
      corrections: Math.random() > 0.7 ? 1 : 0,
      rejections: 0,
      isPerfectDay: Math.random() > 0.6,
    });
  }
  return history;
};

const generateMockWeeklySummary = () => ({
  weekStart: new Date(),
  avgEfficiency: 87,
  efficiencyChange: 5,
  totalTasks: 35,
  completedTasks: 32,
  totalTime: 2700, // minutes
  totalCorrections: 2,
  highlights: ['0 errores en 3 días consecutivos', 'Completó certificación de "Cierre de Caja"'],
});

const generateMockCertifications = () => [
  { id: '1', processName: 'Cierre de Caja', certifiedAt: new Date(2024, 0, 12), learningDays: 4, averageDays: 7, score: 95 },
  { id: '2', processName: 'Apertura de Tienda', certifiedAt: new Date(2023, 11, 20), learningDays: 3, averageDays: 5, score: 88 },
  { id: '3', processName: 'Control de Inventario', certifiedAt: new Date(2023, 10, 15), learningDays: 6, averageDays: 6, score: 92 },
];

const generateMockInProgress = () => [
  { id: '1', processName: 'Atención al Cliente Avanzada', currentStep: 8, totalSteps: 10, startedAt: new Date(2024, 0, 10), estimatedDaysToComplete: 2, lastActivityAt: new Date() },
  { id: '2', processName: 'Gestión de Devoluciones', currentStep: 3, totalSteps: 8, startedAt: new Date(2024, 0, 14), estimatedDaysToComplete: 5, lastActivityAt: new Date() },
];

const generateMockPending = () => [
  { id: '1', processName: 'Manejo de Productos Frescos', priority: 'high' as const, assignedAt: new Date(), dueDate: new Date(2024, 1, 1) },
  { id: '2', processName: 'Protocolo de Emergencias', priority: 'medium' as const, assignedAt: new Date() },
  { id: '3', processName: 'Atención de Reclamos', priority: 'low' as const, assignedAt: new Date() },
];

const generateMockMetrics = () => [
  { label: 'Eficiencia', employeeValue: 92, teamValue: 82, unit: '%', higherIsBetter: true },
  { label: 'Volumen', employeeValue: 45, teamValue: 38, unit: '', higherIsBetter: true },
  { label: 'Precisión', employeeValue: 96, teamValue: 91, unit: '%', higherIsBetter: true },
];

const generateMockErrorBreakdown = () => [
  { type: 'Proceso incompleto', count: 1, color: 'hsl(var(--warning))' },
  { type: 'Error de registro', count: 1, color: 'hsl(var(--destructive))' },
];

const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({ employee, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('resumen');

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getTenureLabel = (days: number): string => {
    if (days <= 30) return 'Nuevo';
    if (days <= 90) return 'En Desarrollo';
    if (days <= 180) return 'Consolidado';
    return 'Veterano';
  };

  // Mock data
  const mockTasks = generateMockTasks();
  const mockDailyHistory = generateMockDailyHistory();
  const mockWeeklySummary = generateMockWeeklySummary();
  const mockCertifications = generateMockCertifications();
  const mockInProgress = generateMockInProgress();
  const mockPending = generateMockPending();
  const mockMetrics = generateMockMetrics();
  const mockErrorBreakdown = generateMockErrorBreakdown();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl bg-card border border-border rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-border bg-gradient-to-r from-card to-secondary/20">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-16 w-16 ring-2 ring-primary/20">
                <AvatarImage src={employee.avatarUrl} />
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                  {getInitials(employee.name)}
                </AvatarFallback>
              </Avatar>
              <div className={cn(
                "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card",
                employee.status === 'active' ? 'bg-success' : 'bg-warning'
              )} />
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-foreground">{employee.name}</h2>
              <p className="text-sm text-muted-foreground">{employee.jobTitle}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-medium",
                  employee.status === 'active' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                )}>
                  {employee.status === 'active' ? 'Activo' : 'En onboarding'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {getTenureLabel(employee.tenureDays)} ({employee.tenureDays}d)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Actions */}
            <Button variant="outline" size="sm" className="hidden sm:flex gap-1" onClick={() => toast.info('Función próximamente')}>
              <CalendarPlus className="w-4 h-4" />
              Agendar 1:1
            </Button>
            <Button variant="outline" size="sm" className="hidden sm:flex gap-1" onClick={() => toast.info('Función próximamente')}>
              <MessageSquare className="w-4 h-4" />
              Mensaje
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => toast.info('Función próximamente')}>
                  <UserCog className="w-4 h-4 mr-2" />
                  Editar rol
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info('Función próximamente')}>
                  <Mail className="w-4 h-4 mr-2" />
                  Enviar email
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info('Función próximamente')}>
                  <CalendarPlus className="w-4 h-4 mr-2" />
                  Asignar tarea
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <button 
              onClick={onClose} 
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border px-4 overflow-x-auto">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                activeTab === key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'resumen' && (
            <EmployeePerformanceSnapshot
              employee={employee}
              teamAverageEfficiency={82}
              teamAverageVolume={38}
              weeklyHistory={[75, 78, 82, 85, 88, 90, 92, employee.efficiency]}
            />
          )}

          {activeTab === 'tareas' && (
            <EmployeeTasksTimeline
              employeeName={employee.name}
              date={new Date()}
              tasks={mockTasks}
              totalCompleted={2}
              totalTasks={6}
              totalTimeSpent={85}
              totalEstimated={185}
            />
          )}

          {activeTab === 'historial' && (
            <EmployeeHistoryView
              employeeName={employee.name}
              dailyHistory={mockDailyHistory}
              weeklySummary={mockWeeklySummary}
              onDayClick={(date) => {
                toast.info(`Ver detalle de ${date.toLocaleDateString()}`);
              }}
            />
          )}

          {activeTab === 'capacitacion' && (
            <EmployeeTrainingProgress
              employeeName={employee.name}
              certifications={mockCertifications}
              inProgress={mockInProgress}
              pending={mockPending}
              totalLearningHours={24}
              averageLearningHoursTeam={18}
            />
          )}

          {activeTab === 'metricas' && (
            <EmployeeMetricsComparison
              employeeName={employee.name}
              tenureDays={employee.tenureDays}
              metrics={mockMetrics}
              monthlyErrors={2}
              previousMonthErrors={5}
              errorBreakdown={mockErrorBreakdown}
              avgTimePerTask={22}
              targetTimePerTask={25}
              tasksPerHour={2.7}
              teamTasksPerHour={2.3}
              weeklyHours={38}
              capacityHours={40}
              corrections={1}
              rejections={0}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetailModal;
