import React, { useState } from 'react';
import { 
  BookOpen, 
  CalendarDays, 
  LayoutGrid, 
  List, 
  Users, 
  Clock,
  GanttChart,
  History,
  Play,
  Search,
  Plus,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HierarchyFilter, HierarchySelection, matchesHierarchyFilter } from '@/components/admin/HierarchyFilter';
import { DateRangeFilter, useDateRangeFilter } from '@/components/filters/DateRangeFilter';

// Import task management views
import { TaskCatalog } from '@/components/tasks/TaskCatalog';
import SprintPlanningView from '@/components/tasks/SprintPlanningView';
import TeamWorkloadView from '@/components/tasks/TeamWorkloadView';
import IndividualCalendarView from '@/components/tasks/IndividualCalendarView';
import OperationsTimelineView from '@/components/tasks/OperationsTimelineView';
import TaskCalendarView from '@/components/tasks/TaskCalendarView';
import TaskKanbanView from '@/components/tasks/TaskKanbanView';
import TaskListView from './TaskListView';
import TaskMetricsDashboard from '@/components/tasks/TaskMetricsDashboard';

// Types
type MainTab = 'catalog' | 'planning' | 'today' | 'calendar' | 'kanban' | 'timeline' | 'history';

interface AdminTasksRefactoredProps {
  className?: string;
}

const tabConfig: { id: MainTab; label: string; icon: React.ReactNode; description: string }[] = [
  { id: 'catalog', label: 'Catálogo', icon: <BookOpen className="h-4 w-4" />, description: 'Definiciones de tareas y recurrencia' },
  { id: 'planning', label: 'Planificación', icon: <CalendarDays className="h-4 w-4" />, description: 'Sprint planning y carga de trabajo' },
  { id: 'today', label: 'Hoy', icon: <Play className="h-4 w-4" />, description: 'Tareas del día actual' },
  { id: 'calendar', label: 'Calendario', icon: <Clock className="h-4 w-4" />, description: 'Vista mensual de tareas' },
  { id: 'kanban', label: 'Tablero', icon: <LayoutGrid className="h-4 w-4" />, description: 'Vista Kanban por estado' },
  { id: 'timeline', label: 'Timeline', icon: <GanttChart className="h-4 w-4" />, description: 'Gantt de operaciones' },
  { id: 'history', label: 'Historial', icon: <History className="h-4 w-4" />, description: 'Tareas completadas y métricas' },
];

const AdminTasksRefactored: React.FC<AdminTasksRefactoredProps> = ({ className }) => {
  const [activeTab, setActiveTab] = useState<MainTab>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [hierarchyFilter, setHierarchyFilter] = useState<HierarchySelection>({ level: 'all' });
  const [showMetrics, setShowMetrics] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  
  // Date range filter
  const { dateRange, setDateRange, isInRange } = useDateRangeFilter(30);
  
  // Planning sub-view: sprint or workload
  const [planningView, setPlanningView] = useState<'sprint' | 'workload' | 'individual'>('sprint');

  // Handle member click from workload view
  const handleMemberClick = (memberId: string) => {
    setSelectedMemberId(memberId);
    setPlanningView('individual');
  };

  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'catalog':
        return (
          <TaskCatalog 
            onSelectTask={(task) => console.log('Selected task:', task)}
            onCreateTask={() => console.log('Create task')}
          />
        );
        
      case 'planning':
        return (
          <div className="space-y-4">
            {/* Planning Sub-tabs */}
            <div className="flex items-center gap-2 pb-4 border-b border-border">
              <Button
                variant={planningView === 'sprint' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPlanningView('sprint')}
                className="gap-2"
              >
                <CalendarDays className="h-4 w-4" />
                Sprint Planning
              </Button>
              <Button
                variant={planningView === 'workload' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPlanningView('workload')}
                className="gap-2"
              >
                <Users className="h-4 w-4" />
                Carga de Trabajo
              </Button>
              {planningView === 'individual' && (
                <Button
                  variant="default"
                  size="sm"
                  className="gap-2"
                >
                  <Clock className="h-4 w-4" />
                  Calendario Individual
                </Button>
              )}
            </div>
            
            {/* Planning Content */}
            {planningView === 'sprint' && <SprintPlanningView />}
            {planningView === 'workload' && (
              <TeamWorkloadView onMemberClick={handleMemberClick} />
            )}
            {planningView === 'individual' && selectedMemberId && (
              <IndividualCalendarView 
                memberId={selectedMemberId}
                onBack={() => setPlanningView('workload')}
              />
            )}
          </div>
        );
        
      case 'today':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Quick stats for today */}
              <div className="p-4 bg-card border border-border rounded-lg">
                <p className="text-sm text-muted-foreground">Tareas pendientes</p>
                <p className="text-3xl font-bold text-foreground">12</p>
              </div>
              <div className="p-4 bg-card border border-border rounded-lg">
                <p className="text-sm text-muted-foreground">En progreso</p>
                <p className="text-3xl font-bold text-primary">5</p>
              </div>
              <div className="p-4 bg-card border border-border rounded-lg">
                <p className="text-sm text-muted-foreground">Completadas hoy</p>
                <p className="text-3xl font-bold text-success">8</p>
              </div>
            </div>
            
            <TaskListView 
              tasks={[]}
              onTaskClick={(task) => console.log('Task clicked:', task)}
            />
          </div>
        );
        
      case 'calendar':
        return (
          <TaskCalendarView 
            tasks={[]}
            onTaskClick={(task) => console.log('Task clicked:', task)}
          />
        );
        
      case 'kanban':
        return (
          <TaskKanbanView 
            tasks={[]}
            onTaskClick={(task) => console.log('Task clicked:', task)}
          />
        );
        
      case 'timeline':
        return <OperationsTimelineView />;
        
      case 'history':
        return (
          <div className="space-y-6">
            {/* History filters */}
            <div className="flex flex-wrap items-center gap-3">
              <DateRangeFilter
                value={dateRange}
                onChange={setDateRange}
                showComparison={true}
              />
              <HierarchyFilter 
                value={hierarchyFilter}
                onChange={setHierarchyFilter}
              />
            </div>
            
            {/* Metrics Dashboard */}
            <TaskMetricsDashboard 
              tasks={[]}
              showEmployeeBreakdown={true}
              title="Historial y Métricas"
            />
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestión de Tareas</h1>
          <p className="text-muted-foreground">
            {tabConfig.find(t => t.id === activeTab)?.description}
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
          <Button variant="hero" className="gap-2">
            <Plus className="w-4 h-4" />
            Nueva Tarea
          </Button>
        </div>
      </div>

      {/* Quick Metrics */}
      {showMetrics && (
        <TaskMetricsDashboard 
          tasks={[]}
          showEmployeeBreakdown={false}
          title="Resumen Rápido"
        />
      )}

      {/* Main Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as MainTab)}>
        <div className="overflow-x-auto -mx-4 px-4 pb-2">
          <TabsList className="inline-flex w-auto min-w-full bg-muted/50">
            {tabConfig.map((tab) => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id}
                className="gap-2 whitespace-nowrap data-[state=active]:bg-background"
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Search bar for applicable tabs */}
        {['catalog', 'today', 'history'].includes(activeTab) && (
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar tareas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {activeTab !== 'catalog' && (
              <HierarchyFilter 
                value={hierarchyFilter}
                onChange={setHierarchyFilter}
              />
            )}
          </div>
        )}

        {/* Tab Content */}
        <div className="mt-6">
          {renderTabContent()}
        </div>
      </Tabs>
    </div>
  );
};

export default AdminTasksRefactored;
