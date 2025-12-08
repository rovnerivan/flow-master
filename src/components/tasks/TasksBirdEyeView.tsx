import React, { useState } from 'react';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Target,
  BarChart3,
  Layers,
  ChevronDown,
  ChevronRight,
  Compass,
  Flag,
  Rocket,
  Zap,
  Building2,
  GitBranch
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface TaskAssignment {
  userId: string;
  userName: string;
  instanceLabel?: string;
  status: 'pending' | 'in_progress' | 'pending_review' | 'completed' | 'rejected';
  timeSpentMinutes?: number;
}

interface Task {
  id: string;
  title: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'annual' | 'occasional';
  assignmentType: 'individual' | 'shared';
  assignments: TaskAssignment[];
  estimatedTime: number;
  dueDate?: string;
  verticalId?: string;
  managementId?: string;
  departmentId?: string;
  // Planning hierarchy links
  linkedPlanningItemId?: string;
  linkedPlanningLevel?: 'strategy' | 'objective' | 'initiative' | 'action';
  linkedPlanningName?: string;
}

// Strategic hierarchy configuration
interface StrategicItem {
  id: string;
  name: string;
  level: 'strategy' | 'objective' | 'initiative' | 'action';
  parentId?: string;
  ownerId?: string;
  ownerName?: string;
}

interface TasksBirdEyeViewProps {
  tasks: Task[];
  strategicItems?: StrategicItem[];
  onDrillDown?: (filter: { type: string; value: string }) => void;
}

type ViewMode = 'frequency' | 'strategic';

const strategicLevelConfig = {
  strategy: { 
    label: 'Estrategias', 
    icon: Compass, 
    color: 'bg-purple-500/10 text-purple-500', 
    borderColor: 'border-purple-500',
    bgGradient: 'from-purple-500/5 to-transparent'
  },
  objective: { 
    label: 'Objetivos', 
    icon: Flag, 
    color: 'bg-blue-500/10 text-blue-500', 
    borderColor: 'border-blue-500',
    bgGradient: 'from-blue-500/5 to-transparent'
  },
  initiative: { 
    label: 'Iniciativas', 
    icon: Rocket, 
    color: 'bg-orange-500/10 text-orange-500', 
    borderColor: 'border-orange-500',
    bgGradient: 'from-orange-500/5 to-transparent'
  },
  action: { 
    label: 'Acciones', 
    icon: Zap, 
    color: 'bg-green-500/10 text-green-500', 
    borderColor: 'border-green-500',
    bgGradient: 'from-green-500/5 to-transparent'
  },
};

const frequencyConfig = {
  daily: { label: 'Diarias', color: 'bg-primary/10 text-primary', borderColor: 'border-primary' },
  weekly: { label: 'Semanales', color: 'bg-warning/10 text-warning', borderColor: 'border-warning' },
  monthly: { label: 'Mensuales', color: 'bg-success/10 text-success', borderColor: 'border-success' },
  annual: { label: 'Anuales', color: 'bg-purple-500/10 text-purple-500', borderColor: 'border-purple-500' },
  occasional: { label: 'Ocasionales', color: 'bg-muted text-muted-foreground', borderColor: 'border-muted' },
};

const statusConfig = {
  pending: { label: 'Pendientes', color: 'text-muted-foreground' },
  in_progress: { label: 'En progreso', color: 'text-primary' },
  pending_review: { label: 'Por revisar', color: 'text-warning' },
  completed: { label: 'Completadas', color: 'text-success' },
  rejected: { label: 'Rechazadas', color: 'text-destructive' },
};

const getTrendIcon = (rate: number) => {
  if (rate >= 80) return <TrendingUp className="w-4 h-4 text-success" />;
  if (rate >= 50) return <Minus className="w-4 h-4 text-warning" />;
  return <TrendingDown className="w-4 h-4 text-destructive" />;
};

const FrequencyCard: React.FC<{
  frequency: keyof typeof frequencyConfig;
  tasks: Task[];
  onDrillDown?: (filter: { type: string; value: string }) => void;
}> = ({ frequency, tasks, onDrillDown }) => {
  const config = frequencyConfig[frequency];
  
  // Calculate stats
  const allAssignments = tasks.flatMap(t => t.assignments);
  const totalAssignments = allAssignments.length;
  const completedAssignments = allAssignments.filter(a => a.status === 'completed').length;
  const inProgressAssignments = allAssignments.filter(a => a.status === 'in_progress').length;
  const pendingReviewAssignments = allAssignments.filter(a => a.status === 'pending_review').length;
  const pendingAssignments = allAssignments.filter(a => a.status === 'pending').length;
  const rejectedAssignments = allAssignments.filter(a => a.status === 'rejected').length;
  
  const completionRate = totalAssignments > 0 
    ? Math.round((completedAssignments / totalAssignments) * 100) 
    : 0;

  const totalTimeSpent = allAssignments.reduce((sum, a) => sum + (a.timeSpentMinutes || 0), 0);
  const totalEstimatedTime = tasks.reduce((sum, t) => sum + (t.estimatedTime * t.assignments.length), 0);
  const timeEfficiency = totalEstimatedTime > 0 
    ? Math.round((totalTimeSpent / totalEstimatedTime) * 100) 
    : 0;

  // Get unique assignees
  const uniqueAssignees = new Set(allAssignments.map(a => a.userId)).size;

  if (tasks.length === 0) return null;

  return (
    <div 
      className={cn(
        "kpi-card border-l-4 hover:shadow-lg transition-all cursor-pointer",
        config.borderColor
      )}
      onClick={() => onDrillDown?.({ type: 'frequency', value: frequency })}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn("p-2.5 rounded-xl", config.color)}>
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-lg">{config.label}</h3>
            <p className="text-sm text-muted-foreground">{tasks.length} tareas</p>
          </div>
        </div>
        {getTrendIcon(completionRate)}
      </div>

      {/* Main Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">Tasa de completado</span>
          <span className="font-semibold text-foreground">{completionRate}%</span>
        </div>
        <Progress value={completionRate} className="h-3" />
      </div>

      {/* Status Distribution */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-success/10">
          <CheckCircle className="w-4 h-4 text-success" />
          <div>
            <p className="text-lg font-bold text-success">{completedAssignments}</p>
            <p className="text-xs text-muted-foreground">Completadas</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/10">
          <Clock className="w-4 h-4 text-primary" />
          <div>
            <p className="text-lg font-bold text-primary">{inProgressAssignments}</p>
            <p className="text-xs text-muted-foreground">En progreso</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-lg bg-warning/10">
          <AlertCircle className="w-4 h-4 text-warning" />
          <div>
            <p className="text-lg font-bold text-warning">{pendingReviewAssignments}</p>
            <p className="text-xs text-muted-foreground">Por revisar</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary">
          <Layers className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="text-lg font-bold text-foreground">{pendingAssignments}</p>
            <p className="text-xs text-muted-foreground">Pendientes</p>
          </div>
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="flex items-center justify-between text-sm border-t border-border pt-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">{uniqueAssignees} personas</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            {Math.round(totalTimeSpent / 60)}h invertidas
          </span>
        </div>
        {rejectedAssignments > 0 && (
          <div className="flex items-center gap-1 text-destructive">
            <AlertCircle className="w-4 h-4" />
            <span>{rejectedAssignments} errores</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Strategic Level Card Component
const StrategicLevelCard: React.FC<{
  level: keyof typeof strategicLevelConfig;
  items: Array<{ item: StrategicItem; tasks: Task[] }>;
  onDrillDown?: (filter: { type: string; value: string }) => void;
}> = ({ level, items, onDrillDown }) => {
  const config = strategicLevelConfig[level];
  const Icon = config.icon;
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  // Calculate total stats for this level
  const allTasks = items.flatMap(i => i.tasks);
  const allAssignments = allTasks.flatMap(t => t.assignments);
  const totalAssignments = allAssignments.length;
  const completedAssignments = allAssignments.filter(a => a.status === 'completed').length;
  const inProgressAssignments = allAssignments.filter(a => a.status === 'in_progress').length;
  
  const completionRate = totalAssignments > 0 
    ? Math.round((completedAssignments / totalAssignments) * 100) 
    : 0;

  if (items.length === 0) return null;

  return (
    <div className={cn(
      "kpi-card border-l-4",
      config.borderColor
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn("p-2.5 rounded-xl", config.color)}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-lg">{config.label}</h3>
            <p className="text-sm text-muted-foreground">
              {items.length} {items.length === 1 ? 'elemento' : 'elementos'} • {allTasks.length} tareas
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-foreground">{completionRate}%</span>
          {getTrendIcon(completionRate)}
        </div>
      </div>

      {/* Progress Bar */}
      <Progress value={completionRate} className="h-2 mb-4" />

      {/* Items List */}
      <div className="space-y-2">
        {items.map(({ item, tasks: itemTasks }) => {
          const itemAssignments = itemTasks.flatMap(t => t.assignments);
          const itemCompleted = itemAssignments.filter(a => a.status === 'completed').length;
          const itemTotal = itemAssignments.length;
          const itemRate = itemTotal > 0 ? Math.round((itemCompleted / itemTotal) * 100) : 0;
          const isExpanded = expandedItems.has(item.id);

          return (
            <Collapsible key={item.id} open={isExpanded} onOpenChange={() => toggleItem(item.id)}>
              <CollapsibleTrigger className="w-full">
                <div className={cn(
                  "flex items-center justify-between p-3 rounded-lg transition-colors cursor-pointer",
                  "bg-secondary/50 hover:bg-secondary"
                )}>
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                    <div className="text-left">
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {itemTasks.length} tareas • {item.ownerName || 'Sin responsable'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress value={itemRate} className="w-20 h-2" />
                    <span className={cn(
                      "text-sm font-semibold",
                      itemRate >= 80 ? "text-success" : itemRate >= 50 ? "text-warning" : "text-destructive"
                    )}>
                      {itemRate}%
                    </span>
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="pl-10 pr-3 py-2 space-y-1">
                  {itemTasks.map(task => {
                    const taskAssignments = task.assignments;
                    const taskCompleted = taskAssignments.filter(a => a.status === 'completed').length;
                    const taskTotal = taskAssignments.length;
                    
                    return (
                      <div 
                        key={task.id}
                        className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => onDrillDown?.({ type: 'task', value: task.id })}
                      >
                        <div className="flex items-center gap-2">
                          {taskCompleted === taskTotal ? (
                            <CheckCircle className="w-4 h-4 text-success" />
                          ) : taskAssignments.some(a => a.status === 'in_progress') ? (
                            <Clock className="w-4 h-4 text-primary" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />
                          )}
                          <span className="text-sm text-foreground">{task.title}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {taskCompleted}/{taskTotal}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
};

// Unlinked Tasks Card
const UnlinkedTasksCard: React.FC<{
  tasks: Task[];
  onDrillDown?: (filter: { type: string; value: string }) => void;
}> = ({ tasks, onDrillDown }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const allAssignments = tasks.flatMap(t => t.assignments);
  const completedAssignments = allAssignments.filter(a => a.status === 'completed').length;
  const totalAssignments = allAssignments.length;
  const completionRate = totalAssignments > 0 
    ? Math.round((completedAssignments / totalAssignments) * 100) 
    : 0;

  if (tasks.length === 0) return null;

  return (
    <div className="kpi-card border-l-4 border-muted">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-muted">
                <Layers className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-foreground">Sin vinculación estratégica</h3>
                <p className="text-sm text-muted-foreground">{tasks.length} tareas operativas</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-foreground">{completionRate}%</span>
              {isExpanded ? (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-4 space-y-1">
            {tasks.slice(0, 10).map(task => {
              const taskAssignments = task.assignments;
              const taskCompleted = taskAssignments.filter(a => a.status === 'completed').length;
              const taskTotal = taskAssignments.length;
              
              return (
                <div 
                  key={task.id}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => onDrillDown?.({ type: 'task', value: task.id })}
                >
                  <div className="flex items-center gap-2">
                    {taskCompleted === taskTotal ? (
                      <CheckCircle className="w-4 h-4 text-success" />
                    ) : taskAssignments.some(a => a.status === 'in_progress') ? (
                      <Clock className="w-4 h-4 text-primary" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />
                    )}
                    <span className="text-sm text-foreground">{task.title}</span>
                    <span className={cn(
                      "px-1.5 py-0.5 rounded text-xs",
                      frequencyConfig[task.frequency].color
                    )}>
                      {frequencyConfig[task.frequency].label}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {taskCompleted}/{taskTotal}
                  </span>
                </div>
              );
            })}
            {tasks.length > 10 && (
              <p className="text-xs text-muted-foreground text-center pt-2">
                +{tasks.length - 10} tareas más
              </p>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export const TasksBirdEyeView: React.FC<TasksBirdEyeViewProps> = ({ tasks, strategicItems = [], onDrillDown }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('strategic');

  // Group tasks by frequency
  const tasksByFrequency = {
    daily: tasks.filter(t => t.frequency === 'daily'),
    weekly: tasks.filter(t => t.frequency === 'weekly'),
    monthly: tasks.filter(t => t.frequency === 'monthly'),
    annual: tasks.filter(t => t.frequency === 'annual'),
    occasional: tasks.filter(t => t.frequency === 'occasional'),
  };

  // Group tasks by strategic level
  const getTasksByStrategicLevel = (level: keyof typeof strategicLevelConfig) => {
    const levelItems = strategicItems.filter(i => i.level === level);
    return levelItems.map(item => ({
      item,
      tasks: tasks.filter(t => t.linkedPlanningItemId === item.id)
    })).filter(group => group.tasks.length > 0);
  };

  const tasksByStrategy = getTasksByStrategicLevel('strategy');
  const tasksByObjective = getTasksByStrategicLevel('objective');
  const tasksByInitiative = getTasksByStrategicLevel('initiative');
  const tasksByAction = getTasksByStrategicLevel('action');
  
  // Unlinked tasks (no planning hierarchy)
  const linkedTaskIds = new Set(
    [...tasksByStrategy, ...tasksByObjective, ...tasksByInitiative, ...tasksByAction]
      .flatMap(g => g.tasks.map(t => t.id))
  );
  const unlinkedTasks = tasks.filter(t => !linkedTaskIds.has(t.id));

  // Global stats
  const allAssignments = tasks.flatMap(t => t.assignments);
  const totalAssignments = allAssignments.length;
  const completedCount = allAssignments.filter(a => a.status === 'completed').length;
  const inProgressCount = allAssignments.filter(a => a.status === 'in_progress').length;
  const pendingReviewCount = allAssignments.filter(a => a.status === 'pending_review').length;
  const pendingCount = allAssignments.filter(a => a.status === 'pending').length;
  const rejectedCount = allAssignments.filter(a => a.status === 'rejected').length;
  
  const globalCompletionRate = totalAssignments > 0 
    ? Math.round((completedCount / totalAssignments) * 100) 
    : 0;

  const uniqueAssignees = new Set(allAssignments.map(a => a.userId)).size;
  const totalTimeSpent = allAssignments.reduce((sum, a) => sum + (a.timeSpentMinutes || 0), 0);

  // Find bottlenecks (tasks with most pending or rejected)
  const bottlenecks = tasks
    .map(t => ({
      task: t,
      pendingRate: t.assignments.filter(a => a.status === 'pending' || a.status === 'rejected').length / t.assignments.length
    }))
    .filter(b => b.pendingRate > 0.5)
    .sort((a, b) => b.pendingRate - a.pendingRate)
    .slice(0, 3);

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="p-4 rounded-full bg-primary/10 mb-4">
          <BarChart3 className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Sin tareas para mostrar
        </h3>
        <p className="text-muted-foreground max-w-md">
          No hay tareas que coincidan con los filtros seleccionados.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
          <TabsList>
            <TabsTrigger value="strategic" className="flex items-center gap-2">
              <GitBranch className="w-4 h-4" />
              Por Jerarquía Estratégica
            </TabsTrigger>
            <TabsTrigger value="frequency" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Por Frecuencia
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Global Summary */}
      <div className="kpi-card bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{globalCompletionRate}%</p>
                <p className="text-sm text-muted-foreground">Completado global</p>
              </div>
            </div>
            <div className="h-12 w-px bg-border hidden lg:block" />
            <div className="grid grid-cols-2 lg:flex lg:gap-6 gap-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-success" />
                <div>
                  <span className="font-semibold text-foreground">{completedCount}</span>
                  <span className="text-muted-foreground ml-1 text-sm">completadas</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <div>
                  <span className="font-semibold text-foreground">{inProgressCount}</span>
                  <span className="text-muted-foreground ml-1 text-sm">en progreso</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-warning" />
                <div>
                  <span className="font-semibold text-foreground">{pendingReviewCount}</span>
                  <span className="text-muted-foreground ml-1 text-sm">por revisar</span>
                </div>
              </div>
              {rejectedCount > 0 && (
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  <div>
                    <span className="font-semibold text-destructive">{rejectedCount}</span>
                    <span className="text-muted-foreground ml-1 text-sm">errores</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span>{tasks.length} tareas</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{uniqueAssignees} personas</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{Math.round(totalTimeSpent / 60)}h invertidas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Strategic Hierarchy View */}
      {viewMode === 'strategic' && (
        <div className="space-y-6">
          {/* Strategic Level Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {(['strategy', 'objective', 'initiative', 'action'] as const).map(level => {
              const levelData = level === 'strategy' ? tasksByStrategy :
                               level === 'objective' ? tasksByObjective :
                               level === 'initiative' ? tasksByInitiative : tasksByAction;
              const levelTasks = levelData.flatMap(d => d.tasks);
              const levelAssignments = levelTasks.flatMap(t => t.assignments);
              const levelCompleted = levelAssignments.filter(a => a.status === 'completed').length;
              const levelTotal = levelAssignments.length;
              const levelRate = levelTotal > 0 ? Math.round((levelCompleted / levelTotal) * 100) : 0;
              const config = strategicLevelConfig[level];
              const Icon = config.icon;

              return (
                <div key={level} className={cn(
                  "p-4 rounded-xl border bg-gradient-to-br",
                  config.bgGradient
                )}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={cn("w-5 h-5", config.color.split(' ')[1])} />
                    <span className="font-medium text-foreground">{config.label}</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-bold text-foreground">{levelRate}%</p>
                      <p className="text-xs text-muted-foreground">{levelData.length} elementos</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{levelTasks.length} tareas</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Strategic Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StrategicLevelCard level="strategy" items={tasksByStrategy} onDrillDown={onDrillDown} />
            <StrategicLevelCard level="objective" items={tasksByObjective} onDrillDown={onDrillDown} />
            <StrategicLevelCard level="initiative" items={tasksByInitiative} onDrillDown={onDrillDown} />
            <StrategicLevelCard level="action" items={tasksByAction} onDrillDown={onDrillDown} />
          </div>

          {/* Unlinked Tasks */}
          <UnlinkedTasksCard tasks={unlinkedTasks} onDrillDown={onDrillDown} />
        </div>
      )}

      {/* Frequency View */}
      {viewMode === 'frequency' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {(Object.keys(tasksByFrequency) as Array<keyof typeof tasksByFrequency>).map(frequency => (
            <FrequencyCard
              key={frequency}
              frequency={frequency}
              tasks={tasksByFrequency[frequency]}
              onDrillDown={onDrillDown}
            />
          ))}
        </div>
      )}

      {/* Bottlenecks Alert */}
      {bottlenecks.length > 0 && (
        <div className="kpi-card border-warning/50 bg-warning/5">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-warning" />
            <h3 className="font-semibold text-foreground">Atención requerida</h3>
          </div>
          <div className="space-y-2">
            {bottlenecks.map(({ task, pendingRate }) => (
              <div 
                key={task.id}
                className="flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-background transition-colors cursor-pointer"
                onClick={() => onDrillDown?.({ type: 'task', value: task.id })}
              >
                <div>
                  <p className="font-medium text-foreground">{task.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {frequencyConfig[task.frequency].label} • {task.assignments.length} asignaciones
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-warning">{Math.round(pendingRate * 100)}%</p>
                  <p className="text-xs text-muted-foreground">sin completar</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksBirdEyeView;