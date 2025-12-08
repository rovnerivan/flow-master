import React, { useState } from 'react';
import { Plus, Search, Filter, Calendar, Clock, User, MoreVertical, CheckCircle, Square, Link2, ChevronDown, ChevronLeft, ChevronRight, X, Edit, RotateCcw, Eye, AlertCircle, ThumbsUp, ThumbsDown, MessageSquare, Ban, Pencil, BarChart3, List, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HierarchyFilter, HierarchySelection, matchesHierarchyFilter } from '@/components/admin/HierarchyFilter';
import { toast } from 'sonner';
import TaskViewToggle from '@/components/tasks/TaskViewToggle';
import TaskCalendarView from '@/components/tasks/TaskCalendarView';
import TaskKanbanView from '@/components/tasks/TaskKanbanView';
import TaskMetricsDashboard from '@/components/tasks/TaskMetricsDashboard';
import TasksBirdEyeView from '@/components/tasks/TasksBirdEyeView';
import MetricConfigEditor from '@/components/metrics/MetricConfigEditor';
import { TaskMetric } from '@/lib/metricTypes';
import { ViewMode, Task as SharedTask } from '@/lib/taskTypes';
import { DateRangeFilter, useDateRangeFilter } from '@/components/filters/DateRangeFilter';

// Review history entry for tracking corrections and rejections
interface ReviewHistoryEntry {
  type: 'correction' | 'rejection' | 'approval';
  reviewerUserId: string;
  reviewerName: string;
  notes: string;
  timestamp: string;
  // For corrections that were later approved = resolved error
  wasResolved?: boolean;
}

interface TaskAssignment {
  userId: string;
  userName: string;
  instanceLabel?: string;
  status: 'pending' | 'in_progress' | 'pending_review' | 'completed' | 'rejected';
  timeSpentMinutes?: number; // Individual time contribution
  // Review workflow tracking
  correctionCount?: number; // Times sent back for corrections
  lastReviewNotes?: string; // Most recent review notes for employee
}

interface Task {
  id: string;
  title: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'annual' | 'occasional';
  assignmentType: 'individual' | 'shared';
  assignments: TaskAssignment[];
  linkedProcesses?: { id: string; name: string }[];
  estimatedTime: number;
  dueDate?: string;
  // Review workflow
  needsReview?: boolean; // Supervisor marks task as requiring review before completion
  reviewHistory?: ReviewHistoryEntry[]; // Full history of reviews
  // For shared tasks: who closed/completed the task
  completedByUserId?: string;
  completedByUserName?: string;
  completedAt?: string;
  // Hierarchy info
  verticalId?: string;
  managementId?: string;
  departmentId?: string;
  // Planning hierarchy links
  linkedPlanningItemId?: string;
  linkedPlanningLevel?: 'strategy' | 'objective' | 'initiative' | 'action';
  linkedPlanningName?: string;
}

// Strategic items for bird's eye view grouping
interface StrategicItem {
  id: string;
  name: string;
  level: 'strategy' | 'objective' | 'initiative' | 'action';
  parentId?: string;
  ownerId?: string;
  ownerName?: string;
}

// Mock strategic items hierarchy
const mockStrategicItems: StrategicItem[] = [
  // Strategies
  { id: 'str1', name: 'Expansión de Mercado 2024', level: 'strategy', ownerName: 'Director General' },
  { id: 'str2', name: 'Excelencia Operacional', level: 'strategy', ownerName: 'Director de Operaciones' },
  { id: 'str3', name: 'Transformación Digital', level: 'strategy', ownerName: 'Director de Tecnología' },
  // Objectives
  { id: 'obj1', name: 'Aumentar ventas 20%', level: 'objective', parentId: 'str1', ownerName: 'Gerente Comercial' },
  { id: 'obj2', name: 'Reducir costos operativos', level: 'objective', parentId: 'str2', ownerName: 'Gerente de Operaciones' },
  { id: 'obj3', name: 'Mejorar experiencia cliente', level: 'objective', parentId: 'str1', ownerName: 'Gerente de Servicio' },
  { id: 'obj4', name: 'Digitalizar procesos core', level: 'objective', parentId: 'str3', ownerName: 'Líder de Proyectos' },
  // Initiatives
  { id: 'ini1', name: 'Campaña de fidelización', level: 'initiative', parentId: 'obj1', ownerName: 'Coord. Marketing' },
  { id: 'ini2', name: 'Optimización de inventarios', level: 'initiative', parentId: 'obj2', ownerName: 'Supervisor Almacén' },
  { id: 'ini3', name: 'Capacitación en servicio', level: 'initiative', parentId: 'obj3', ownerName: 'Coord. Capacitación' },
  { id: 'ini4', name: 'Automatización de reportes', level: 'initiative', parentId: 'obj4', ownerName: 'Analista TI' },
  // Actions
  { id: 'act1', name: 'Lanzar programa puntos', level: 'action', parentId: 'ini1', ownerName: 'Analista Marketing' },
  { id: 'act2', name: 'Auditar procesos caja', level: 'action', parentId: 'ini2', ownerName: 'Supervisor Caja' },
  { id: 'act3', name: 'Taller atención cliente', level: 'action', parentId: 'ini3', ownerName: 'Capacitador' },
  { id: 'act4', name: 'Dashboard ventas', level: 'action', parentId: 'ini4', ownerName: 'Desarrollador' },
];

const initialMockTasks: Task[] = [
  {
    id: '1',
    title: 'Verificar inventario de caja',
    description: 'Contar y registrar el efectivo inicial',
    frequency: 'daily',
    assignmentType: 'individual',
    assignments: [
      { userId: 'u1', userName: 'Carlos López', instanceLabel: 'Caja 1', status: 'completed', timeSpentMinutes: 12 },
      { userId: 'u2', userName: 'Ana Martínez', instanceLabel: 'Caja 2', status: 'in_progress', timeSpentMinutes: 5 },
    ],
    linkedProcesses: [
      { id: 'p1', name: 'Cierre de Caja' },
      { id: 'p2', name: 'Apertura de Tienda' },
    ],
    estimatedTime: 10,
    verticalId: 'v3',
    managementId: 'm5',
    departmentId: 'd6',
    linkedPlanningItemId: 'act2',
    linkedPlanningLevel: 'action',
    linkedPlanningName: 'Auditar procesos caja',
  },
  {
    id: '2',
    title: 'Revisar stock de productos',
    description: 'Verificar niveles de inventario',
    frequency: 'daily',
    assignmentType: 'individual',
    assignments: [
      { userId: 'u3', userName: 'María García', status: 'pending' },
    ],
    linkedProcesses: [{ id: 'p3', name: 'Inventario Semanal' }],
    estimatedTime: 15,
    verticalId: 'v1',
    managementId: 'm1',
    departmentId: 'd1',
    linkedPlanningItemId: 'ini2',
    linkedPlanningLevel: 'initiative',
    linkedPlanningName: 'Optimización de inventarios',
  },
  {
    id: '3',
    title: 'Limpieza general de tienda',
    description: 'Limpieza profunda de todas las áreas',
    frequency: 'daily',
    assignmentType: 'shared',
    assignments: [
      { userId: 'u1', userName: 'Carlos López', status: 'in_progress' },
      { userId: 'u2', userName: 'Ana Martínez', status: 'in_progress' },
      { userId: 'u3', userName: 'María García', status: 'in_progress' },
    ],
    estimatedTime: 30,
    verticalId: 'v1',
    managementId: 'm1',
    departmentId: 'd1',
  },
  {
    id: '4',
    title: 'Reporte de ventas semanal',
    description: 'Generar y enviar reporte de ventas',
    frequency: 'weekly',
    assignmentType: 'individual',
    assignments: [
      { userId: 'u3', userName: 'María García', status: 'in_progress', timeSpentMinutes: 45 },
    ],
    estimatedTime: 30,
    dueDate: '2024-01-19',
    verticalId: 'v2',
    managementId: 'm3',
    departmentId: 'd4',
    linkedPlanningItemId: 'act4',
    linkedPlanningLevel: 'action',
    linkedPlanningName: 'Dashboard ventas',
  },
  {
    id: '5',
    title: 'Auditoría de procesos',
    description: 'Revisar cumplimiento de procesos operativos',
    frequency: 'monthly',
    assignmentType: 'shared',
    needsReview: true,
    assignments: [
      { userId: 'sup1', userName: 'Supervisor', status: 'pending' },
      { userId: 'u1', userName: 'Carlos López', status: 'pending' },
    ],
    estimatedTime: 120,
    dueDate: '2024-01-31',
    verticalId: 'v1',
    managementId: 'm2',
    departmentId: 'd3',
  },
  {
    id: '8',
    title: 'Cierre de caja nocturno',
    description: 'Conteo final y cuadre de caja del turno noche',
    frequency: 'daily',
    assignmentType: 'individual',
    needsReview: true,
    assignments: [
      { userId: 'u2', userName: 'Ana Martínez', status: 'pending_review', timeSpentMinutes: 25 },
    ],
    estimatedTime: 20,
    verticalId: 'v3',
    managementId: 'm5',
    departmentId: 'd6',
    linkedPlanningItemId: 'act2',
    linkedPlanningLevel: 'action',
    linkedPlanningName: 'Auditar procesos caja',
  },
  {
    id: '6',
    title: 'Capacitación anual de seguridad',
    description: 'Renovación de certificación de seguridad',
    frequency: 'annual',
    assignmentType: 'shared',
    assignments: [
      { userId: 'all', userName: 'Todos', status: 'pending' },
    ],
    estimatedTime: 240,
    dueDate: '2024-06-15',
    verticalId: 'v1',
    managementId: 'm1',
  },
  {
    id: '7',
    title: 'Campaña de marketing digital',
    description: 'Preparar campaña de redes sociales',
    frequency: 'occasional',
    assignmentType: 'individual',
    assignments: [
      { userId: 'u8', userName: 'Sofia Ruiz', status: 'pending' },
    ],
    estimatedTime: 60,
    dueDate: '2024-12-20',
    verticalId: 'v2',
    managementId: 'm4',
    departmentId: 'd5',
    linkedPlanningItemId: 'act1',
    linkedPlanningLevel: 'action',
    linkedPlanningName: 'Lanzar programa puntos',
  },
  {
    id: '9',
    title: 'Taller de atención al cliente',
    description: 'Sesión de capacitación en servicio al cliente',
    frequency: 'monthly',
    assignmentType: 'shared',
    assignments: [
      { userId: 'u1', userName: 'Carlos López', status: 'completed', timeSpentMinutes: 60 },
      { userId: 'u2', userName: 'Ana Martínez', status: 'completed', timeSpentMinutes: 60 },
      { userId: 'u3', userName: 'María García', status: 'in_progress', timeSpentMinutes: 30 },
    ],
    estimatedTime: 60,
    verticalId: 'v1',
    managementId: 'm1',
    linkedPlanningItemId: 'act3',
    linkedPlanningLevel: 'action',
    linkedPlanningName: 'Taller atención cliente',
  },
  {
    id: '10',
    title: 'Análisis de competencia',
    description: 'Investigar estrategias de competidores',
    frequency: 'monthly',
    assignmentType: 'individual',
    assignments: [
      { userId: 'u4', userName: 'Roberto Díaz', status: 'in_progress', timeSpentMinutes: 120 },
    ],
    estimatedTime: 180,
    verticalId: 'v2',
    managementId: 'm3',
    linkedPlanningItemId: 'obj1',
    linkedPlanningLevel: 'objective',
    linkedPlanningName: 'Aumentar ventas 20%',
  },
  {
    id: '11',
    title: 'Planificación estratégica Q1',
    description: 'Definir metas y KPIs del trimestre',
    frequency: 'annual',
    assignmentType: 'shared',
    assignments: [
      { userId: 'u5', userName: 'Director Comercial', status: 'completed', timeSpentMinutes: 180 },
      { userId: 'u6', userName: 'Director Operaciones', status: 'completed', timeSpentMinutes: 180 },
    ],
    estimatedTime: 240,
    verticalId: 'v1',
    linkedPlanningItemId: 'str1',
    linkedPlanningLevel: 'strategy',
    linkedPlanningName: 'Expansión de Mercado 2024',
  },
];

const frequencyLabels: Record<string, { label: string; color: string }> = {
  daily: { label: 'Diaria', color: 'bg-primary/20 text-primary' },
  weekly: { label: 'Semanal', color: 'bg-warning/20 text-warning' },
  monthly: { label: 'Mensual', color: 'bg-success/20 text-success' },
  annual: { label: 'Anual', color: 'bg-purple-500/20 text-purple-500' },
  occasional: { label: 'Ocasional', color: 'bg-muted text-muted-foreground' },
};

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendiente', color: 'bg-secondary text-muted-foreground' },
  in_progress: { label: 'En progreso', color: 'bg-primary/20 text-primary' },
  pending_review: { label: 'Lista para revisar', color: 'bg-warning/20 text-warning' },
  completed: { label: 'Completada', color: 'bg-success/20 text-success' },
  rejected: { label: 'Rechazada', color: 'bg-destructive/20 text-destructive' },
};

const formatTime = (minutes: number) => {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};


const AdminTasks: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFrequency, setSelectedFrequency] = useState<string>('all');
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [expandedProcess, setExpandedProcess] = useState<string | null>(null);
  const [showProcessViewer, setShowProcessViewer] = useState<{ taskId: string; processId: string; allProcesses: { id: string; name: string }[] } | null>(null);
  const [hierarchyFilter, setHierarchyFilter] = useState<HierarchySelection>({ level: 'all' });
  const [tasks, setTasks] = useState<Task[]>(initialMockTasks);
  const [showTimeInputModal, setShowTimeInputModal] = useState<{ taskId: string; task?: Task } | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<TaskAssignment | null>(null);
  const [showAssignmentSelector, setShowAssignmentSelector] = useState<{ taskId: string; task: Task; action: 'time' | 'complete' } | null>(null);
  const [manualTimeInput, setManualTimeInput] = useState({ hours: 0, minutes: 0 });
  
  // View mode state (list, calendar, kanban)
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showMetrics, setShowMetrics] = useState(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | undefined>();
  
  // Date range filter
  const { dateRange, setDateRange, isInRange } = useDateRangeFilter(30);
  
  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState<{ taskId: string; task: Task; action: 'approve' | 'correct' | 'reject' } | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  const filterTasks = (frequency: string) => {
    let filtered = tasks;
    
    // Frequency filter
    if (frequency !== 'all') {
      filtered = filtered.filter((t) => t.frequency === frequency);
    }
    
    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Hierarchy filter
    filtered = filtered.filter((t) => 
      matchesHierarchyFilter(hierarchyFilter, {
        verticalId: t.verticalId,
        managementId: t.managementId,
        departmentId: t.departmentId,
      })
    );
    
    // Date range filter - filter by dueDate if available
    filtered = filtered.filter((t) => {
      if (!t.dueDate) return true; // Include tasks without due date
      return isInRange(t.dueDate, dateRange.primary);
    });
    
    return filtered;
  };

  const updateTaskStatus = (taskId: string, newStatus: 'pending' | 'in_progress' | 'pending_review' | 'completed', assignmentUserId?: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          assignments: task.assignments.map(a => {
            // If specific assignment, only update that one
            if (assignmentUserId) {
              return a.userId === assignmentUserId ? { ...a, status: newStatus } : a;
            }
            // Otherwise update all
            return { ...a, status: newStatus };
          })
        };
      }
      return task;
    }));
  };

  // Complete task - respects needsReview flag
  const completeTask = (taskId: string, assignmentUserId?: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // If task needs review, go to pending_review instead of completed
    if (task.needsReview) {
      updateTaskStatus(taskId, 'pending_review', assignmentUserId);
      toast.info('Tarea lista para revisión del supervisor');
    } else {
      updateTaskStatus(taskId, 'completed', assignmentUserId);
      toast.success('Tarea marcada como completada');
    }
  };

  // Supervisor approves task after review (may resolve previous corrections = error resuelto)
  const approveTask = (taskId: string, notes: string = '') => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const hadCorrections = task.assignments.some(a => (a.correctionCount || 0) > 0);
        const newHistoryEntry: ReviewHistoryEntry = {
          type: 'approval',
          reviewerUserId: 'current-supervisor', // In real app, get from auth
          reviewerName: 'Supervisor',
          notes,
          timestamp: new Date().toISOString(),
          wasResolved: hadCorrections, // If there were corrections, this approval resolves them
        };
        
        return {
          ...task,
          reviewHistory: [...(task.reviewHistory || []), newHistoryEntry],
          assignments: task.assignments.map(a => ({ 
            ...a, 
            status: 'completed' as const,
            lastReviewNotes: notes || undefined,
          })),
        };
      }
      return task;
    }));
    
    const task = tasks.find(t => t.id === taskId);
    const hadCorrections = task?.assignments.some(a => (a.correctionCount || 0) > 0);
    
    if (hadCorrections) {
      toast.success('Tarea aprobada - Error resuelto registrado');
    } else {
      toast.success('Tarea aprobada y completada');
    }
  };

  // Supervisor sends task back for corrections (error salvable)
  const correctTask = (taskId: string, notes: string) => {
    if (!notes.trim()) {
      toast.error('Debes indicar qué debe corregirse');
      return;
    }
    
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const newHistoryEntry: ReviewHistoryEntry = {
          type: 'correction',
          reviewerUserId: 'current-supervisor',
          reviewerName: 'Supervisor',
          notes,
          timestamp: new Date().toISOString(),
        };
        
        return {
          ...task,
          reviewHistory: [...(task.reviewHistory || []), newHistoryEntry],
          assignments: task.assignments.map(a => ({ 
            ...a, 
            status: 'in_progress' as const,
            correctionCount: (a.correctionCount || 0) + 1,
            lastReviewNotes: notes,
          })),
        };
      }
      return task;
    }));
    
    toast.info('Tarea enviada para corrección');
  };

  // Supervisor rejects task completely (error no salvable)
  const rejectTask = (taskId: string, notes: string) => {
    if (!notes.trim()) {
      toast.error('Debes indicar el motivo del rechazo');
      return;
    }
    
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const newHistoryEntry: ReviewHistoryEntry = {
          type: 'rejection',
          reviewerUserId: 'current-supervisor',
          reviewerName: 'Supervisor',
          notes,
          timestamp: new Date().toISOString(),
        };
        
        return {
          ...task,
          reviewHistory: [...(task.reviewHistory || []), newHistoryEntry],
          assignments: task.assignments.map(a => ({ 
            ...a, 
            status: 'rejected' as const,
            lastReviewNotes: notes,
          })),
        };
      }
      return task;
    }));
    
    // TODO: In real implementation, log to error_logs table as unsalvageable error
    toast.error('Tarea rechazada - Error no salvable registrado');
  };

  // Handle review action submission
  const handleReviewSubmit = () => {
    if (!showReviewModal) return;
    
    const { taskId, action } = showReviewModal;
    
    switch (action) {
      case 'approve':
        approveTask(taskId, reviewNotes);
        break;
      case 'correct':
        correctTask(taskId, reviewNotes);
        break;
      case 'reject':
        rejectTask(taskId, reviewNotes);
        break;
    }
    
    setShowReviewModal(null);
    setReviewNotes('');
  };

  const setTaskPending = (taskId: string, assignmentUserId?: string) => {
    updateTaskStatus(taskId, 'pending', assignmentUserId);
    toast.info('Tarea marcada como pendiente');
  };

  const setTaskInProgress = (taskId: string, assignmentUserId?: string) => {
    updateTaskStatus(taskId, 'in_progress', assignmentUserId);
    toast.info('Tarea marcada en progreso');
  };

  // Handle time/complete actions - check if we need to ask which assignment
  const handleTimeAction = (task: Task) => {
    if (task.assignments.length > 1) {
      // Multiple assignments - need to ask which one
      setShowAssignmentSelector({ taskId: task.id, task, action: 'time' });
    } else {
      // Single assignment - go directly to time input
      setSelectedAssignment(task.assignments[0]);
      setManualTimeInput({ hours: 0, minutes: 0 });
      setShowTimeInputModal({ taskId: task.id, task });
    }
  };

  const handleCompleteAction = (task: Task) => {
    if (task.assignmentType === 'shared') {
      // Shared task - need to ask who is completing/closing the task
      setShowAssignmentSelector({ taskId: task.id, task, action: 'complete' });
    } else if (task.assignments.length > 1) {
      // Individual with multiple assignments - need to ask which one(s)
      setShowAssignmentSelector({ taskId: task.id, task, action: 'complete' });
    } else {
      // Single individual assignment - complete directly
      completeTask(task.id, task.assignments[0].userId);
    }
  };

  const selectAssignmentForTime = (assignment: TaskAssignment) => {
    setSelectedAssignment(assignment);
    setManualTimeInput({ hours: 0, minutes: 0 });
    setShowTimeInputModal({ taskId: showAssignmentSelector!.taskId, task: showAssignmentSelector!.task });
    setShowAssignmentSelector(null);
  };

  const selectAssignmentForComplete = (assignment: TaskAssignment) => {
    const task = showAssignmentSelector!.task;
    
    if (task.assignmentType === 'shared') {
      // For shared tasks: mark ALL assignments as completed and record who closed it
      setTasks(prev => prev.map(t => {
        if (t.id === task.id) {
          return {
            ...t,
            completedByUserId: assignment.userId,
            completedByUserName: assignment.userName,
            completedAt: new Date().toISOString(),
            assignments: t.assignments.map(a => ({ ...a, status: 'completed' as const }))
          };
        }
        return t;
      }));
      toast.success(`Tarea completada por ${assignment.userName}`);
    } else {
      // For individual tasks: only complete the selected assignment
      completeTask(task.id, assignment.userId);
    }
    
    setShowAssignmentSelector(null);
  };

  const saveManualTime = () => {
    if (!showTimeInputModal || !selectedAssignment) return;
    
    const totalMinutes = (manualTimeInput.hours * 60) + manualTimeInput.minutes;
    const { taskId } = showTimeInputModal;
    
    // Add time to the assignment and set status to in_progress if pending
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          assignments: task.assignments.map(a => {
            if (a.userId === selectedAssignment.userId) {
              const newTimeSpent = (a.timeSpentMinutes || 0) + totalMinutes;
              // Only change to in_progress if currently pending
              const newStatus = a.status === 'pending' ? 'in_progress' : a.status;
              return { ...a, timeSpentMinutes: newTimeSpent, status: newStatus };
            }
            return a;
          })
        };
      }
      return task;
    }));
    
    toast.success(`Tiempo registrado: ${formatTime(totalMinutes)} para ${selectedAssignment.userName}`);
    setShowTimeInputModal(null);
    setSelectedAssignment(null);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setShowEditTaskModal(true);
  };

  const openProcessViewer = (taskId: string, processId: string, allProcesses: { id: string; name: string }[]) => {
    setShowProcessViewer({ taskId, processId, allProcesses });
  };

  const TaskCard = ({ task }: { task: Task }) => {
    // Calculate overall task status based on assignments
    const completedCount = task.assignments.filter(a => a.status === 'completed').length;
    const inProgressCount = task.assignments.filter(a => a.status === 'in_progress').length;
    const pendingReviewCount = task.assignments.filter(a => a.status === 'pending_review').length;
    const rejectedCount = task.assignments.filter(a => a.status === 'rejected').length;
    const totalAssignments = task.assignments.length;
    
    const overallStatus = rejectedCount > 0 ? 'rejected'
                        : completedCount === totalAssignments ? 'completed' 
                        : pendingReviewCount > 0 ? 'pending_review'
                        : inProgressCount > 0 || completedCount > 0 ? 'in_progress' 
                        : 'pending';

    // Group individual assignments for display (X2, X3)
    const displayLabel = task.assignmentType === 'individual' && totalAssignments > 1
      ? `x${totalAssignments}`
      : null;
    
    return (
      <div className="kpi-card hover:border-primary/30 transition-colors">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${frequencyLabels[task.frequency].color}`}>
                {frequencyLabels[task.frequency].label}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusLabels[overallStatus].color}`}>
                {statusLabels[overallStatus].label}
              </span>
              {/* Needs review badge */}
              {task.needsReview && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400 flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  Requiere revisión
                </span>
              )}
              {/* Correction count badge */}
              {task.assignments.some(a => (a.correctionCount || 0) > 0) && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-warning/20 text-warning flex items-center gap-1">
                  <Pencil className="w-3 h-3" />
                  {task.assignments[0]?.correctionCount || 0} corrección(es)
                </span>
              )}
              {/* Rejected badge */}
              {overallStatus === 'rejected' && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-destructive/20 text-destructive flex items-center gap-1">
                  <Ban className="w-3 h-3" />
                  Error no salvable
                </span>
              )}
              {/* Assignment type badge */}
              {task.assignmentType === 'shared' ? (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <User className="w-3 h-3 -ml-2" />
                  Compartida
                </span>
              ) : displayLabel && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-400">
                  {displayLabel} asignaciones
                </span>
              )}
            </div>
            <h4 className="font-medium text-foreground mb-1">{task.title}</h4>
            <p className="text-sm text-muted-foreground mb-3">{task.description}</p>

            {/* Assignments detail */}
            <div className="mb-3 space-y-1.5">
              {task.assignmentType === 'individual' ? (
                // Individual: show each assignment with its status and time
                task.assignments.map((assignment, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      assignment.status === 'completed' ? 'bg-success' 
                        : assignment.status === 'rejected' ? 'bg-destructive'
                        : assignment.status === 'pending_review' ? 'bg-warning'
                        : assignment.status === 'in_progress' ? 'bg-primary' 
                        : 'bg-muted-foreground'
                    )} />
                    <User className="w-3 h-3 text-muted-foreground" />
                    <span className="text-foreground">{assignment.userName}</span>
                    {assignment.instanceLabel && (
                      <span className="text-muted-foreground">({assignment.instanceLabel})</span>
                    )}
                    <span className={cn(
                      "text-xs",
                      assignment.status === 'completed' ? 'text-success' 
                        : assignment.status === 'rejected' ? 'text-destructive'
                        : assignment.status === 'pending_review' ? 'text-warning'
                        : assignment.status === 'in_progress' ? 'text-primary' 
                        : 'text-muted-foreground'
                    )}>
                      • {statusLabels[assignment.status]?.label || 'Pendiente'}
                    </span>
                    {assignment.timeSpentMinutes && assignment.timeSpentMinutes > 0 && (
                      <span className="text-xs text-primary ml-auto">
                        ⏱ {formatTime(assignment.timeSpentMinutes)}
                      </span>
                    )}
                  </div>
                ))
              ) : (
                // Shared: show all assignees with individual time contributions
                <div className="space-y-1">
                  {task.assignments.map((assignment, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <User className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{assignment.userName}</span>
                      {assignment.timeSpentMinutes && assignment.timeSpentMinutes > 0 && (
                        <span className="text-xs text-primary ml-auto">
                          ⏱ {formatTime(assignment.timeSpentMinutes)}
                        </span>
                      )}
                    </div>
                  ))}
                  {/* Total time for shared task */}
                  {task.assignments.some(a => a.timeSpentMinutes && a.timeSpentMinutes > 0) && (
                    <div className="flex items-center gap-2 text-sm pt-1 border-t border-border/50 mt-1">
                      <Clock className="w-3 h-3 text-primary" />
                      <span className="text-primary font-medium">
                        Total: {formatTime(task.assignments.reduce((sum, a) => sum + (a.timeSpentMinutes || 0), 0))}
                      </span>
                    </div>
                  )}
                  {/* Show who completed/closed the shared task */}
                  {task.completedByUserName && overallStatus === 'completed' && (
                    <div className="flex items-center gap-2 text-sm pt-1 border-t border-border/50 mt-1">
                      <CheckCircle className="w-3 h-3 text-success" />
                      <span className="text-success text-xs">
                        Cerrada por: <span className="font-medium">{task.completedByUserName}</span>
                      </span>
                </div>
              )}
              
              {/* Show last review notes if exists */}
              {task.assignments.some(a => a.lastReviewNotes) && (
                <div className={cn(
                  "mt-2 p-2 rounded-lg text-xs",
                  overallStatus === 'rejected' 
                    ? "bg-destructive/10 border border-destructive/20" 
                    : "bg-warning/10 border border-warning/20"
                )}>
                  <div className="flex items-start gap-2">
                    <MessageSquare className={cn(
                      "w-3 h-3 mt-0.5 flex-shrink-0",
                      overallStatus === 'rejected' ? 'text-destructive' : 'text-warning'
                    )} />
                    <div>
                      <span className={cn(
                        "font-medium",
                        overallStatus === 'rejected' ? 'text-destructive' : 'text-warning'
                      )}>
                        {overallStatus === 'rejected' ? 'Motivo de rechazo: ' : 'Notas del supervisor: '}
                      </span>
                      <span className="text-foreground">{task.assignments[0]?.lastReviewNotes}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-sm">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-3 h-3" />
                Est: {formatTime(task.estimatedTime)}
              </span>
              {task.dueDate && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {task.dueDate}
                </span>
              )}
            </div>

            {/* Linked Processes - Dropdown */}
            {task.linkedProcesses && task.linkedProcesses.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border">
                <div className="relative">
                  <button
                    onClick={() => setExpandedProcess(expandedProcess === task.id ? null : task.id)}
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Link2 className="w-3 h-3" />
                    <span>{task.linkedProcesses.length} proceso(s) asociado(s)</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${expandedProcess === task.id ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {expandedProcess === task.id && (
                    <div className="absolute left-0 top-full mt-1 z-10 w-64 p-2 rounded-lg border border-border bg-card shadow-lg">
                      <p className="text-xs text-muted-foreground mb-2 px-2">Procesos asociados:</p>
                      {task.linkedProcesses.map((proc) => (
                        <button
                          key={proc.id}
                          onClick={() => openProcessViewer(task.id, proc.id, task.linkedProcesses || [])}
                          className="w-full text-left px-3 py-2 text-sm rounded hover:bg-secondary transition-colors"
                        >
                          {proc.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 rounded hover:bg-secondary">
                  <MoreVertical className="w-4 h-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEditTask(task)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Editar tarea
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleTimeAction(task)}>
                  <Clock className="w-4 h-4 mr-2" />
                  Registrar tiempo
                </DropdownMenuItem>
                <div className="h-px bg-border my-1" />
                
                {/* Review actions for pending_review status */}
                {overallStatus === 'pending_review' && (
                  <>
                    <DropdownMenuItem 
                      onClick={() => setShowReviewModal({ taskId: task.id, task, action: 'approve' })}
                      className="text-success focus:text-success"
                    >
                      <ThumbsUp className="w-4 h-4 mr-2" />
                      Aprobar
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setShowReviewModal({ taskId: task.id, task, action: 'correct' })}
                      className="text-warning focus:text-warning"
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      Corregir
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setShowReviewModal({ taskId: task.id, task, action: 'reject' })}
                      className="text-destructive focus:text-destructive"
                    >
                      <Ban className="w-4 h-4 mr-2" />
                      Rechazar (no salvable)
                    </DropdownMenuItem>
                    <div className="h-px bg-border my-1" />
                  </>
                )}
                
                {overallStatus !== 'pending' && (
                  <DropdownMenuItem onClick={() => setTaskPending(task.id)}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Volver a pendiente
                  </DropdownMenuItem>
                )}
                {overallStatus !== 'in_progress' && overallStatus !== 'pending_review' && (
                  <DropdownMenuItem onClick={() => setTaskInProgress(task.id)}>
                    <Clock className="w-4 h-4 mr-2" />
                    Marcar en progreso
                  </DropdownMenuItem>
                )}
                {overallStatus !== 'completed' && overallStatus !== 'pending_review' && (
                  <DropdownMenuItem onClick={() => handleCompleteAction(task)}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {task.needsReview ? 'Enviar a revisión' : 'Marcar completada'}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Quick action button - context-aware */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={() => {
                if (overallStatus === 'completed') {
                  setTaskPending(task.id);
                } else if (overallStatus === 'pending_review') {
                  setShowReviewModal({ taskId: task.id, task, action: 'approve' });
                } else {
                  handleCompleteAction(task);
                }
              }}
              title={
                overallStatus === 'completed' ? 'Volver a pendiente' 
                : overallStatus === 'pending_review' ? 'Revisar tarea'
                : task.needsReview ? 'Enviar a revisión' : 'Marcar completada'
              }
            >
              {overallStatus === 'completed' ? (
                <RotateCcw className="w-4 h-4 text-muted-foreground" />
              ) : overallStatus === 'pending_review' ? (
                <Eye className="w-4 h-4 text-warning" />
              ) : (
                <CheckCircle className="w-4 h-4 text-primary" />
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Convert tasks to shared format for new components
  const convertToSharedTask = (task: Task): SharedTask => ({
    ...task,
    assignments: task.assignments.map(a => ({
      ...a,
      status: a.status as any,
    })),
    frequency: task.frequency as any,
    assignmentType: task.assignmentType as any,
  });

  const handleTaskClickFromView = (task: SharedTask) => {
    const originalTask = tasks.find(t => t.id === task.id);
    if (originalTask) {
      setSelectedTask(originalTask);
      setShowEditTaskModal(true);
    }
  };

  const handleReviewFromView = (taskId: string, action: 'approve' | 'correct' | 'reject') => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setShowReviewModal({ taskId, task, action });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestión de Tareas</h1>
          <p className="text-muted-foreground">
            Administra tareas por frecuencia y asignación
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant={showMetrics ? "default" : "outline"} 
            size="sm" 
            onClick={() => setShowMetrics(!showMetrics)}
            className="gap-1"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Métricas</span>
          </Button>
          <Button variant="hero" className="gap-2" onClick={() => setShowNewTaskModal(true)}>
            <Plus className="w-4 h-4" />
            Nueva Tarea
          </Button>
        </div>
      </div>

      {/* Metrics Dashboard */}
      {showMetrics && (
        <TaskMetricsDashboard 
          tasks={filterTasks('all').map(convertToSharedTask)} 
          showEmployeeBreakdown={true}
          title="Métricas del Equipo"
        />
      )}

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3">
        <DateRangeFilter
          value={dateRange}
          onChange={setDateRange}
          showComparison={false}
        />
        <HierarchyFilter 
          value={hierarchyFilter}
          onChange={setHierarchyFilter}
        />
      </div>

      {/* Search and View Toggle */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tareas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <TaskViewToggle currentView={viewMode} onViewChange={setViewMode} />
      </div>

      {/* View modes */}
      {viewMode === 'birdeye' ? (
        <TasksBirdEyeView
          tasks={filterTasks('all')}
          strategicItems={mockStrategicItems}
          onDrillDown={(filter) => {
            if (filter.type === 'frequency') {
              setSelectedFrequency(filter.value);
              setViewMode('list');
            }
          }}
        />
      ) : viewMode === 'calendar' ? (
        <TaskCalendarView
          tasks={filterTasks('all').map(convertToSharedTask)}
          onTaskClick={handleTaskClickFromView}
          selectedDate={selectedCalendarDate}
          onDateSelect={setSelectedCalendarDate}
        />
      ) : viewMode === 'kanban' ? (
        <TaskKanbanView
          tasks={filterTasks('all').map(convertToSharedTask)}
          onTaskClick={handleTaskClickFromView}
        />
      ) : (
        /* List view with frequency tabs */
        <Tabs defaultValue="all" onValueChange={setSelectedFrequency}>
          <div className="overflow-x-auto -mx-4 px-4">
            <TabsList className="inline-flex w-auto min-w-full sm:grid sm:grid-cols-6">
              <TabsTrigger value="all" className="whitespace-nowrap">Todas</TabsTrigger>
              <TabsTrigger value="daily" className="whitespace-nowrap">Diarias</TabsTrigger>
              <TabsTrigger value="weekly" className="whitespace-nowrap">Semanales</TabsTrigger>
              <TabsTrigger value="monthly" className="whitespace-nowrap">Mensuales</TabsTrigger>
              <TabsTrigger value="annual" className="whitespace-nowrap">Anuales</TabsTrigger>
              <TabsTrigger value="occasional" className="whitespace-nowrap">Ocasionales</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="mt-6">
            <div className="space-y-4">
              {filterTasks('all').map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
              {filterTasks('all').length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No hay tareas que coincidan con los filtros
                </div>
              )}
            </div>
          </TabsContent>

          {['daily', 'weekly', 'monthly', 'annual', 'occasional'].map((freq) => (
            <TabsContent key={freq} value={freq} className="mt-6">
              <div className="space-y-4">
                {filterTasks(freq).map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
                {filterTasks(freq).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay tareas {frequencyLabels[freq].label.toLowerCase()}s
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* New Task Modal */}
      <NewTaskModal open={showNewTaskModal} onClose={() => setShowNewTaskModal(false)} />

      {/* Edit Task Modal */}
      {selectedTask && (
        <EditTaskModal 
          open={showEditTaskModal} 
          task={selectedTask}
          onClose={() => {
            setShowEditTaskModal(false);
            setSelectedTask(null);
          }} 
        />
      )}

      {/* Assignment Selector Modal */}
      {showAssignmentSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {showAssignmentSelector.action === 'time' ? '¿Para quién registrar tiempo?' : '¿Quién completó la tarea?'}
              </h3>
              <button 
                onClick={() => setShowAssignmentSelector(null)}
                className="p-1 rounded hover:bg-secondary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              {showAssignmentSelector.task.title}
            </p>
            
            <div className="space-y-2">
              {showAssignmentSelector.task.assignments.map((assignment) => (
                <button
                  key={assignment.userId}
                  onClick={() => showAssignmentSelector.action === 'time' 
                    ? selectAssignmentForTime(assignment) 
                    : selectAssignmentForComplete(assignment)
                  }
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left",
                    assignment.status === 'completed' 
                      ? "border-success/30 bg-success/5" 
                      : "border-border hover:border-primary/50 hover:bg-primary/5"
                  )}
                >
                  <div className={cn(
                    "w-3 h-3 rounded-full",
                    assignment.status === 'completed' ? 'bg-success' 
                      : assignment.status === 'pending_review' ? 'bg-warning'
                      : assignment.status === 'in_progress' ? 'bg-primary' 
                      : 'bg-muted-foreground'
                  )} />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{assignment.userName}</p>
                    {assignment.instanceLabel && (
                      <p className="text-xs text-muted-foreground">{assignment.instanceLabel}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={cn(
                      "text-xs",
                      assignment.status === 'completed' ? 'text-success' 
                        : assignment.status === 'pending_review' ? 'text-warning'
                        : assignment.status === 'in_progress' ? 'text-primary' 
                        : 'text-muted-foreground'
                    )}>
                      {statusLabels[assignment.status].label}
                    </span>
                    {assignment.timeSpentMinutes && assignment.timeSpentMinutes > 0 && (
                      <p className="text-xs text-primary">⏱ {formatTime(assignment.timeSpentMinutes)}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-border">
              <Button variant="outline" className="w-full" onClick={() => setShowAssignmentSelector(null)}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Time Input Modal */}
      {showTimeInputModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Registrar Tiempo</h3>
              <button 
                onClick={() => setShowTimeInputModal(null)}
                className="p-1 rounded hover:bg-secondary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {selectedAssignment && (
              <p className="text-sm text-muted-foreground mb-4">
                Para: <span className="text-foreground">{selectedAssignment.userName}</span>
                {selectedAssignment.instanceLabel && <span className="text-muted-foreground"> ({selectedAssignment.instanceLabel})</span>}
              </p>
            )}
            
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <label className="text-sm text-muted-foreground mb-1 block">Horas</label>
                <Input
                  type="number"
                  min="0"
                  max="24"
                  value={manualTimeInput.hours}
                  onChange={(e) => setManualTimeInput(prev => ({ ...prev, hours: parseInt(e.target.value) || 0 }))}
                  className="text-center"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm text-muted-foreground mb-1 block">Minutos</label>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  value={manualTimeInput.minutes}
                  onChange={(e) => setManualTimeInput(prev => ({ ...prev, minutes: parseInt(e.target.value) || 0 }))}
                  className="text-center"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowTimeInputModal(null)}>
                Cancelar
              </Button>
              <Button variant="hero" className="flex-1" onClick={saveManualTime}>
                Guardar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {showReviewModal.action === 'approve' && (
                  <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                    <ThumbsUp className="w-5 h-5 text-success" />
                  </div>
                )}
                {showReviewModal.action === 'correct' && (
                  <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
                    <Pencil className="w-5 h-5 text-warning" />
                  </div>
                )}
                {showReviewModal.action === 'reject' && (
                  <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
                    <Ban className="w-5 h-5 text-destructive" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold">
                    {showReviewModal.action === 'approve' && 'Aprobar Tarea'}
                    {showReviewModal.action === 'correct' && 'Enviar a Corrección'}
                    {showReviewModal.action === 'reject' && 'Rechazar Tarea'}
                  </h3>
                  <p className="text-sm text-muted-foreground">{showReviewModal.task.title}</p>
                </div>
              </div>
              <button 
                onClick={() => { setShowReviewModal(null); setReviewNotes(''); }}
                className="p-1 rounded hover:bg-secondary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Show correction history if exists */}
            {showReviewModal.task.assignments.some(a => (a.correctionCount || 0) > 0) && (
              <div className="mb-4 p-3 rounded-lg bg-warning/10 border border-warning/20">
                <p className="text-xs text-warning font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Esta tarea ya fue enviada a corrección {showReviewModal.task.assignments[0]?.correctionCount || 0} vez(es)
                </p>
              </div>
            )}
            
            {/* Context for each action */}
            <div className="mb-4 p-3 rounded-lg bg-secondary/50">
              {showReviewModal.action === 'approve' && (
                <p className="text-sm text-muted-foreground">
                  La tarea será marcada como completada.
                  {showReviewModal.task.assignments.some(a => (a.correctionCount || 0) > 0) && (
                    <span className="text-success"> Se registrará como error resuelto.</span>
                  )}
                </p>
              )}
              {showReviewModal.action === 'correct' && (
                <p className="text-sm text-muted-foreground">
                  La tarea volverá al empleado para que realice las correcciones indicadas. 
                  <span className="text-warning"> Esto se registra como error potencialmente salvable.</span>
                </p>
              )}
              {showReviewModal.action === 'reject' && (
                <p className="text-sm text-destructive">
                  La tarea será rechazada definitivamente. 
                  <span className="font-medium"> Esto se registrará como error no salvable.</span>
                </p>
              )}
            </div>
            
            {/* Notes input */}
            <div className="space-y-2 mb-6">
              <label className="text-sm font-medium">
                {showReviewModal.action === 'approve' && 'Notas (opcional)'}
                {showReviewModal.action === 'correct' && 'Qué debe corregirse *'}
                {showReviewModal.action === 'reject' && 'Motivo del rechazo *'}
              </label>
              <Textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder={
                  showReviewModal.action === 'approve' 
                    ? 'Comentarios adicionales...' 
                    : showReviewModal.action === 'correct'
                    ? 'Describe qué debe corregir el empleado...'
                    : 'Explica por qué no se puede salvar esta tarea...'
                }
                rows={3}
                className={cn(
                  showReviewModal.action === 'reject' && 'border-destructive/50 focus:border-destructive'
                )}
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={() => { setShowReviewModal(null); setReviewNotes(''); }}
              >
                Cancelar
              </Button>
              <Button 
                variant={
                  showReviewModal.action === 'approve' ? 'default' 
                  : showReviewModal.action === 'correct' ? 'outline'
                  : 'destructive'
                }
                className={cn(
                  "flex-1",
                  showReviewModal.action === 'approve' && 'bg-success hover:bg-success/90',
                  showReviewModal.action === 'correct' && 'border-warning text-warning hover:bg-warning/10'
                )}
                onClick={handleReviewSubmit}
              >
                {showReviewModal.action === 'approve' && 'Aprobar'}
                {showReviewModal.action === 'correct' && 'Enviar a corrección'}
                {showReviewModal.action === 'reject' && 'Rechazar'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Process Viewer Overlay */}
      {showProcessViewer && (
        <ProcessViewerOverlay
          taskId={showProcessViewer.taskId}
          processId={showProcessViewer.processId}
          allProcesses={showProcessViewer.allProcesses}
          onClose={() => setShowProcessViewer(null)}
          onSwitchProcess={(newProcessId) => setShowProcessViewer({ ...showProcessViewer, processId: newProcessId })}
        />
      )}
    </div>
  );
};

// New Task Modal
const NewTaskModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    frequency: 'daily',
    estimatedTime: '15',
    dueDate: '',
    needsReview: false,
    // Expected metrics
    targetQuality: '95', // % expected quality
    maxTimeMinutes: '', // Maximum time expected (optional stricter than estimated)
    errorTolerance: '0', // Number of acceptable errors
    qualityDescription: '', // What defines quality for this task
  });
  const [assignmentType, setAssignmentType] = useState<'individual' | 'shared'>('individual');
  const [assignments, setAssignments] = useState<{ userId: string; userName: string; instanceLabel: string }[]>([]);
  const [sharedAssignees, setSharedAssignees] = useState<{ userId: string; userName: string }[]>([]);
  const [showAssigneeSelector, setShowAssigneeSelector] = useState(false);
  const [taskMetrics, setTaskMetrics] = useState<Partial<TaskMetric>[]>([]);

  // Mock team members - in real implementation, fetch from Supabase
  const teamMembers = [
    { id: 'u1', name: 'Carlos López', role: 'Cajero' },
    { id: 'u2', name: 'Ana Martínez', role: 'Cajera' },
    { id: 'u3', name: 'María García', role: 'Almacén' },
    { id: 'u4', name: 'Pedro Sánchez', role: 'Ventas' },
  ];

  if (!open) return null;

  const addIndividualAssignment = (userId: string, userName: string) => {
    if (assignments.some(a => a.userId === userId)) {
      toast.error('Este empleado ya tiene asignación');
      return;
    }
    setAssignments([...assignments, { userId, userName, instanceLabel: '' }]);
  };

  const removeIndividualAssignment = (userId: string) => {
    setAssignments(assignments.filter(a => a.userId !== userId));
  };

  const updateInstanceLabel = (userId: string, label: string) => {
    setAssignments(assignments.map(a => 
      a.userId === userId ? { ...a, instanceLabel: label } : a
    ));
  };

  const toggleSharedAssignee = (userId: string, userName: string) => {
    if (sharedAssignees.some(a => a.userId === userId)) {
      setSharedAssignees(sharedAssignees.filter(a => a.userId !== userId));
    } else {
      setSharedAssignees([...sharedAssignees, { userId, userName }]);
    }
  };

  const handleSubmit = () => {
    if (!formData.title) {
      toast.error('El título es requerido');
      return;
    }
    if (assignmentType === 'individual' && assignments.length === 0) {
      toast.error('Asigna al menos a un empleado');
      return;
    }
    if (assignmentType === 'shared' && sharedAssignees.length === 0) {
      toast.error('Selecciona al menos un responsable');
      return;
    }

    // In real implementation, save to Supabase
    toast.success(
      assignmentType === 'individual' 
        ? `Tarea creada con ${assignments.length} asignación(es) individual(es)` 
        : `Tarea compartida creada con ${sharedAssignees.length} responsable(s)`
    );
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setFormData({ 
      title: '', 
      description: '', 
      frequency: 'daily', 
      estimatedTime: '15', 
      dueDate: '', 
      needsReview: false,
      targetQuality: '95',
      maxTimeMinutes: '',
      errorTolerance: '0',
      qualityDescription: '',
    });
    setAssignmentType('individual');
    setAssignments([]);
    setSharedAssignees([]);
    setTaskMetrics([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl mx-4 bg-card border border-border rounded-2xl shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Nueva Tarea</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Título de la tarea *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ej: Contar caja, Verificar inventario..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Descripción</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción de la tarea"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Frecuencia</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="daily">Diaria</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensual</option>
                  <option value="annual">Anual</option>
                  <option value="occasional">Ocasional</option>
                  <option value="one_time">Única vez</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tiempo est. (min)</label>
                <Input
                  type="number"
                  value={formData.estimatedTime}
                  onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha límite</label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
            </div>

            {/* Expected Metrics Section */}
            <div className="p-4 rounded-lg border border-border bg-secondary/20 space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <BarChart3 className="w-4 h-4" />
                <span className="text-sm font-semibold">Métricas Esperadas</span>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Calidad objetivo (%)</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.targetQuality}
                    onChange={(e) => setFormData({ ...formData, targetQuality: e.target.value })}
                    placeholder="95"
                  />
                  <p className="text-xs text-muted-foreground">% mínimo aceptable</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tiempo máximo (min)</label>
                  <Input
                    type="number"
                    value={formData.maxTimeMinutes}
                    onChange={(e) => setFormData({ ...formData, maxTimeMinutes: e.target.value })}
                    placeholder={formData.estimatedTime || "—"}
                  />
                  <p className="text-xs text-muted-foreground">Límite estricto</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tolerancia errores</label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.errorTolerance}
                    onChange={(e) => setFormData({ ...formData, errorTolerance: e.target.value })}
                    placeholder="0"
                  />
                  <p className="text-xs text-muted-foreground"># errores OK</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">¿Qué define calidad en esta tarea?</label>
                <Textarea
                  value={formData.qualityDescription}
                  onChange={(e) => setFormData({ ...formData, qualityDescription: e.target.value })}
                  placeholder="Ej: El conteo debe coincidir con el sistema, sin diferencias mayores a $10..."
                  rows={2}
                />
              </div>
            </div>

            {/* Needs Review Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-secondary/30">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-orange-400" />
                  <span className="text-sm font-medium">Requiere revisión del supervisor</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Cuando el empleado complete la tarea, quedará "lista para revisar" hasta que el supervisor la apruebe
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, needsReview: !formData.needsReview })}
                className={cn(
                  "relative w-11 h-6 rounded-full transition-colors",
                  formData.needsReview ? "bg-orange-500" : "bg-muted"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform",
                  formData.needsReview ? "translate-x-6" : "translate-x-1"
                )} />
              </button>
            </div>
          </div>

          {/* Assignment Type */}
          <div className="space-y-4">
            <label className="text-sm font-medium">Tipo de asignación</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAssignmentType('individual')}
                className={cn(
                  "p-4 rounded-xl border text-left transition-all",
                  assignmentType === 'individual'
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-primary/50"
                )}
              >
                <div className="flex items-center gap-3 mb-2">
                  <User className="w-5 h-5 text-primary" />
                  <span className="font-medium">Individual</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Cada persona tiene su propia instancia de la tarea. Ej: "Contar Caja 1" y "Contar Caja 2" son tareas separadas.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setAssignmentType('shared')}
                className={cn(
                  "p-4 rounded-xl border text-left transition-all",
                  assignmentType === 'shared'
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-primary/50"
                )}
              >
                <div className="flex items-center gap-3 mb-2">
                  <User className="w-5 h-5 text-primary" />
                  <User className="w-5 h-5 text-primary -ml-4" />
                  <span className="font-medium">Compartida</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Una sola tarea con múltiples responsables. Cuando se completa, se completa para todos.
                </p>
              </button>
            </div>
          </div>

          {/* Individual Assignments */}
          {assignmentType === 'individual' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Asignaciones individuales</label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAssigneeSelector(!showAssigneeSelector)}
                  className="gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Agregar persona
                </Button>
              </div>

              {showAssigneeSelector && (
                <div className="p-3 rounded-lg border border-border bg-secondary/30 space-y-2">
                  <p className="text-xs text-muted-foreground">Selecciona empleados:</p>
                  <div className="flex flex-wrap gap-2">
                    {teamMembers.map(member => (
                      <button
                        key={member.id}
                        onClick={() => addIndividualAssignment(member.id, member.name)}
                        disabled={assignments.some(a => a.userId === member.id)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-sm transition-colors",
                          assignments.some(a => a.userId === member.id)
                            ? "bg-muted text-muted-foreground cursor-not-allowed"
                            : "bg-card border border-border hover:border-primary"
                        )}
                      >
                        {member.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {assignments.length > 0 && (
                <div className="space-y-2">
                  {assignments.map((assignment, idx) => (
                    <div key={assignment.userId} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
                      <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                        {idx + 1}
                      </span>
                      <span className="font-medium text-sm flex-shrink-0">{assignment.userName}</span>
                      <Input
                        value={assignment.instanceLabel}
                        onChange={(e) => updateInstanceLabel(assignment.userId, e.target.value)}
                        placeholder="Etiqueta (ej: Caja 1, Zona Norte...)"
                        className="flex-1 h-8 text-sm"
                      />
                      <button
                        onClick={() => removeIndividualAssignment(assignment.userId)}
                        className="p-1.5 rounded hover:bg-destructive/10 text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground">
                    La etiqueta ayuda a diferenciar instancias de la misma tarea (ej: "Caja 1", "Caja 2")
                  </p>
                </div>
              )}

              {assignments.length === 0 && (
                <div className="text-center py-6 text-muted-foreground border border-dashed border-border rounded-lg">
                  <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Agrega empleados para asignar instancias individuales</p>
                </div>
              )}
            </div>
          )}

          {/* Shared Assignment */}
          {assignmentType === 'shared' && (
            <div className="space-y-4">
              <label className="text-sm font-medium">Responsables de la tarea compartida</label>
              <div className="p-3 rounded-lg border border-border bg-secondary/30">
                <p className="text-xs text-muted-foreground mb-3">Selecciona todos los responsables:</p>
                <div className="flex flex-wrap gap-2">
                  {teamMembers.map(member => (
                    <button
                      key={member.id}
                      onClick={() => toggleSharedAssignee(member.id, member.name)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-sm transition-colors",
                        sharedAssignees.some(a => a.userId === member.id)
                          ? "bg-primary text-primary-foreground"
                          : "bg-card border border-border hover:border-primary"
                      )}
                    >
                      {member.name}
                    </button>
                  ))}
                </div>
              </div>

              {sharedAssignees.length > 0 && (
                <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                  <p className="text-sm text-success font-medium mb-1">
                    Tarea compartida entre {sharedAssignees.length} persona(s)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {sharedAssignees.map(a => a.userName).join(', ')} trabajarán juntos en esta tarea. 
                    Cuando cualquiera la marque como completada, se completará para todos.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Metrics Section */}
          <div className="pt-4 border-t border-border">
            <MetricConfigEditor 
              metrics={taskMetrics}
              onChange={setTaskMetrics}
            />
          </div>
        </div>

        <div className="p-6 border-t border-border flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button variant="hero" onClick={handleSubmit} className="flex-1">Crear Tarea</Button>
        </div>
      </div>
    </div>
  );
};

// Edit Task Modal
const EditTaskModal: React.FC<{ open: boolean; task: Task; onClose: () => void }> = ({ open, task, onClose }) => {
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description,
    frequency: task.frequency as string,
    estimatedTime: task.estimatedTime.toString(),
    assignedTo: task.assignments.map(a => a.userName).join(', '),
    dueDate: task.dueDate || '',
    needsReview: task.needsReview || false,
    // Expected metrics
    targetQuality: '95',
    maxTimeMinutes: '',
    errorTolerance: '0',
    qualityDescription: '',
  });

  if (!open) return null;

  const handleSubmit = () => {
    if (!formData.title) {
      toast.error('El título es requerido');
      return;
    }
    toast.success('Tarea actualizada. Se notificará a los involucrados.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg mx-4 bg-card border border-border rounded-2xl shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Editar Tarea</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-2">
            <label className="text-sm font-medium">Título *</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Descripción</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Frecuencia</label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="daily">Diaria</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensual</option>
                <option value="annual">Anual</option>
                <option value="occasional">Ocasional</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tiempo estimado (min)</label>
              <Input
                type="number"
                value={formData.estimatedTime}
                onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Asignar a</label>
            <Input
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Fecha límite</label>
            <Input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
          </div>

          {/* Expected Metrics Section */}
          <div className="p-4 rounded-lg border border-border bg-secondary/20 space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <BarChart3 className="w-4 h-4" />
              <span className="text-sm font-semibold">Métricas Esperadas</span>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Calidad (%)</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.targetQuality}
                  onChange={(e) => setFormData({ ...formData, targetQuality: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Tiempo máx (min)</label>
                <Input
                  type="number"
                  value={formData.maxTimeMinutes}
                  onChange={(e) => setFormData({ ...formData, maxTimeMinutes: e.target.value })}
                  placeholder={formData.estimatedTime}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Tolerancia err.</label>
                <Input
                  type="number"
                  min="0"
                  value={formData.errorTolerance}
                  onChange={(e) => setFormData({ ...formData, errorTolerance: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Criterios de calidad</label>
              <Textarea
                value={formData.qualityDescription}
                onChange={(e) => setFormData({ ...formData, qualityDescription: e.target.value })}
                placeholder="¿Qué define éxito en esta tarea?"
                rows={2}
              />
            </div>
          </div>

          {/* Needs Review Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-secondary/30">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-medium">Requiere revisión</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                El empleado enviará la tarea a revisión antes de completarla
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, needsReview: !formData.needsReview })}
              className={cn(
                "relative w-11 h-6 rounded-full transition-colors",
                formData.needsReview ? "bg-orange-500" : "bg-muted"
              )}
            >
              <div className={cn(
                "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform",
                formData.needsReview ? "translate-x-6" : "translate-x-1"
              )} />
            </button>
          </div>
        </div>

        <div className="p-6 border-t border-border flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button variant="hero" onClick={handleSubmit} className="flex-1">Guardar Cambios</Button>
        </div>
      </div>
    </div>
  );
};

// Process Viewer Overlay (dentro de tareas) - Full featured
const ProcessViewerOverlay: React.FC<{ taskId: string; processId: string; allProcesses: { id: string; name: string }[]; onClose: () => void; onSwitchProcess: (processId: string) => void }> = ({ taskId, processId, allProcesses, onClose, onSwitchProcess }) => {
  const [view, setView] = useState<'list' | 'detail'>('detail');
  const [currentStep, setCurrentStep] = useState(0);
  
  const mockProcessDetail = {
    id: processId,
    name: allProcesses.find(p => p.id === processId)?.name || 'Proceso',
    description: 'Este proceso define los pasos correctos para completar esta tarea.',
    steps: [
      { id: 's1', number: 1, title: 'Paso inicial', description: 'Descripción del paso inicial.', duration: '2 min' },
      { id: 's2', number: 2, title: 'Verificación', description: 'Verifica que todo esté correcto.', duration: '3 min' },
      { id: 's3', number: 3, title: 'Ejecución', description: 'Ejecuta la acción principal.', duration: '5 min' },
      { id: 's4', number: 4, title: 'Cierre', description: 'Finaliza y registra.', duration: '2 min' },
    ],
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Header with task context */}
      <header className="flex items-center justify-between p-4 border-b border-border shrink-0">
        <div className="flex items-center gap-4">
          {view === 'detail' && allProcesses.length > 1 && (
            <Button variant="ghost" size="sm" onClick={() => setView('list')} className="gap-1">
              <ChevronLeft className="w-4 h-4" />
              Ver procesos
            </Button>
          )}
          <div>
            <p className="text-xs text-muted-foreground">Viendo proceso de la tarea</p>
            <h1 className="font-semibold text-foreground">{mockProcessDetail.name}</h1>
          </div>
        </div>
        <Button variant="outline" onClick={onClose}>
          Cerrar proceso
        </Button>
      </header>

      {view === 'list' ? (
        // List of associated processes
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-bold mb-4">Procesos Asociados a esta Tarea</h2>
            <div className="space-y-3">
              {allProcesses.map((proc) => (
                <button
                  key={proc.id}
                  onClick={() => { onSwitchProcess(proc.id); setView('detail'); }}
                  className={cn(
                    'w-full text-left p-4 rounded-lg border transition-colors',
                    proc.id === processId ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  )}
                >
                  <p className="font-medium text-foreground">{proc.name}</p>
                  {proc.id === processId && <span className="text-xs text-primary">Viendo actualmente</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        // Process detail view
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center">
              <p className="text-muted-foreground">Diagrama del proceso</p>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold mb-2">{mockProcessDetail.name}</h2>
              <p className="text-muted-foreground">{mockProcessDetail.description}</p>
            </div>

            <div className="space-y-2">
              {mockProcessDetail.steps.map((step, index) => (
                <div 
                  key={step.id} 
                  className={cn(
                    'p-4 rounded-lg border transition-colors cursor-pointer',
                    index === currentStep ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
                  )}
                  onClick={() => setCurrentStep(index)}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                      {step.number}
                    </span>
                    <div className="flex-1">
                      <span className="text-foreground font-medium">{step.title}</span>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{step.duration}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-4 border-t border-border">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Paso anterior
              </Button>
              <Button 
                variant="hero" 
                onClick={() => setCurrentStep(Math.min(mockProcessDetail.steps.length - 1, currentStep + 1))}
                disabled={currentStep === mockProcessDetail.steps.length - 1}
              >
                Siguiente
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTasks;