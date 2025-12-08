import React, { useState, useMemo } from 'react';
import { format, differenceInDays, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  ChevronLeft, 
  ChevronRight,
  Target,
  Rocket,
  CheckSquare,
  Compass,
  ChevronDown,
  ChevronUp,
  Calendar as CalendarIcon,
  Clock,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  PlanningLevel, 
  PlanningStatus, 
  planningLevelConfig, 
  planningStatusConfig 
} from '@/lib/planningTypes';

// Types
interface LinkedTask {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'in_progress' | 'completed';
  assigneeName?: string;
  estimatedDurationMin?: number;
}

interface TimelineItem {
  id: string;
  name: string;
  description?: string;
  level: PlanningLevel;
  status: PlanningStatus;
  startDate: string;
  endDate: string;
  progress: number;
  ownerId?: string;
  ownerName?: string;
  parentId?: string;
  linkedTasks: LinkedTask[];
  children?: TimelineItem[];
}

interface OperationsTimelineViewProps {
  className?: string;
}

// Mock data
const mockTimelineData: TimelineItem[] = [
  {
    id: 'str1',
    name: 'Expansión de Mercado 2024',
    description: 'Estrategia de crecimiento para el año fiscal',
    level: 'strategy',
    status: 'active',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    progress: 45,
    ownerName: 'Director General',
    linkedTasks: [],
    children: [
      {
        id: 'obj1',
        name: 'Aumentar ventas 20%',
        level: 'objective',
        status: 'active',
        startDate: '2024-01-01',
        endDate: '2024-06-30',
        progress: 60,
        parentId: 'str1',
        ownerName: 'Gerente Comercial',
        linkedTasks: [],
        children: [
          {
            id: 'ini1',
            name: 'Campaña de fidelización',
            level: 'initiative',
            status: 'active',
            startDate: '2024-02-01',
            endDate: '2024-04-30',
            progress: 75,
            parentId: 'obj1',
            ownerName: 'Coord. Marketing',
            linkedTasks: [
              { id: 't1', name: 'Diseño de programa', startDate: '2024-02-01', endDate: '2024-02-15', status: 'completed', assigneeName: 'Ana M.' },
              { id: 't2', name: 'Desarrollo de app', startDate: '2024-02-15', endDate: '2024-03-15', status: 'completed', assigneeName: 'Pedro S.' },
              { id: 't3', name: 'Lanzamiento piloto', startDate: '2024-03-15', endDate: '2024-04-01', status: 'in_progress', assigneeName: 'Carlos L.' },
              { id: 't4', name: 'Evaluación resultados', startDate: '2024-04-01', endDate: '2024-04-30', status: 'pending', assigneeName: 'María G.' },
            ],
          },
        ],
      },
      {
        id: 'obj2',
        name: 'Reducir costos operativos 15%',
        level: 'objective',
        status: 'active',
        startDate: '2024-01-01',
        endDate: '2024-09-30',
        progress: 30,
        parentId: 'str1',
        ownerName: 'Gerente Operaciones',
        linkedTasks: [],
        children: [
          {
            id: 'ini2',
            name: 'Optimización de inventarios',
            level: 'initiative',
            status: 'active',
            startDate: '2024-03-01',
            endDate: '2024-06-30',
            progress: 40,
            parentId: 'obj2',
            ownerName: 'Supervisor Almacén',
            linkedTasks: [
              { id: 't5', name: 'Auditoría de stock', startDate: '2024-03-01', endDate: '2024-03-31', status: 'completed', assigneeName: 'Roberto D.' },
              { id: 't6', name: 'Implementar sistema ABC', startDate: '2024-04-01', endDate: '2024-05-15', status: 'in_progress', assigneeName: 'Sofia R.' },
              { id: 't7', name: 'Capacitación equipo', startDate: '2024-05-15', endDate: '2024-06-15', status: 'pending', assigneeName: 'María G.' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'str2',
    name: 'Transformación Digital',
    description: 'Digitalización de procesos core',
    level: 'strategy',
    status: 'active',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    progress: 25,
    ownerName: 'Director TI',
    linkedTasks: [],
    children: [
      {
        id: 'obj3',
        name: 'Automatizar reportes',
        level: 'objective',
        status: 'on_hold',
        startDate: '2024-04-01',
        endDate: '2024-08-31',
        progress: 10,
        parentId: 'str2',
        ownerName: 'Líder Proyectos',
        linkedTasks: [
          { id: 't8', name: 'Análisis de requerimientos', startDate: '2024-04-01', endDate: '2024-04-30', status: 'completed', assigneeName: 'Ana M.' },
          { id: 't9', name: 'Desarrollo dashboard', startDate: '2024-05-01', endDate: '2024-07-31', status: 'pending', assigneeName: 'Pedro S.' },
        ],
      },
    ],
  },
];

const levelIcons: Record<PlanningLevel, React.ReactNode> = {
  strategy: <Compass className="h-4 w-4" />,
  objective: <Target className="h-4 w-4" />,
  initiative: <Rocket className="h-4 w-4" />,
  action: <CheckSquare className="h-4 w-4" />,
};

const getStatusColor = (status: PlanningStatus): string => {
  switch (status) {
    case 'completed': return 'bg-success';
    case 'active': return 'bg-primary';
    case 'on_hold': return 'bg-warning';
    case 'cancelled':
    case 'not_achieved': return 'bg-destructive';
    default: return 'bg-muted';
  }
};

const getTaskStatusColor = (status: 'pending' | 'in_progress' | 'completed'): string => {
  switch (status) {
    case 'completed': return 'bg-success';
    case 'in_progress': return 'bg-primary';
    default: return 'bg-muted-foreground';
  }
};

const OperationsTimelineView: React.FC<OperationsTimelineViewProps> = ({ className }) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['str1', 'obj1', 'ini1']));
  const [selectedItem, setSelectedItem] = useState<TimelineItem | null>(null);

  // Get visible date range (3 months)
  const visibleStart = startOfMonth(addDays(currentMonth, -30));
  const visibleEnd = endOfMonth(addDays(currentMonth, 60));
  const visibleDays = eachDayOfInterval({ start: visibleStart, end: visibleEnd });
  const totalDays = visibleDays.length;

  // Navigation
  const goToPreviousMonth = () => setCurrentMonth(prev => addDays(prev, -30));
  const goToNextMonth = () => setCurrentMonth(prev => addDays(prev, 30));
  const goToToday = () => setCurrentMonth(new Date());

  // Toggle item expansion
  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Calculate bar position and width
  const getBarStyle = (startDate: string, endDate: string) => {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    
    const startOffset = differenceInDays(start, visibleStart);
    const duration = differenceInDays(end, start) + 1;
    
    const leftPercent = Math.max(0, (startOffset / totalDays) * 100);
    const widthPercent = Math.min(100 - leftPercent, (duration / totalDays) * 100);
    
    return {
      left: `${leftPercent}%`,
      width: `${Math.max(widthPercent, 2)}%`,
    };
  };

  // Check if date is in visible range
  const isVisible = (startDate: string, endDate: string) => {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    return isWithinInterval(visibleStart, { start, end }) ||
           isWithinInterval(visibleEnd, { start, end }) ||
           isWithinInterval(start, { start: visibleStart, end: visibleEnd }) ||
           isWithinInterval(end, { start: visibleStart, end: visibleEnd });
  };

  // Render timeline row
  const renderTimelineRow = (item: TimelineItem, depth: number = 0) => {
    const isExpanded = expandedItems.has(item.id);
    const hasChildren = item.children && item.children.length > 0;
    const hasTasks = item.linkedTasks && item.linkedTasks.length > 0;
    const canExpand = hasChildren || hasTasks;
    const config = planningLevelConfig[item.level];
    const statusConfig = planningStatusConfig[item.status];

    return (
      <React.Fragment key={item.id}>
        <div 
          className={cn(
            'flex border-b border-border hover:bg-muted/30 transition-colors',
            selectedItem?.id === item.id && 'bg-muted/50'
          )}
        >
          {/* Left Panel - Item Info */}
          <div 
            className="w-80 flex-shrink-0 p-3 border-r border-border"
            style={{ paddingLeft: `${12 + depth * 20}px` }}
          >
            <div className="flex items-start gap-2">
              {canExpand ? (
                <button 
                  onClick={() => toggleExpanded(item.id)}
                  className="mt-0.5 p-0.5 hover:bg-muted rounded"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronUp className="h-4 w-4 text-muted-foreground rotate-180" />
                  )}
                </button>
              ) : (
                <div className="w-5" />
              )}
              
              <div 
                className={cn('p-1 rounded', config.bgColor)}
                title={config.label}
              >
                <span className={config.color}>{levelIcons[item.level]}</span>
              </div>
              
              <div className="flex-1 min-w-0">
                <p 
                  className="font-medium text-sm truncate cursor-pointer hover:text-primary"
                  onClick={() => setSelectedItem(item)}
                >
                  {item.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className={cn('text-[10px] h-5', statusConfig.bgColor, statusConfig.color)}>
                    {statusConfig.label}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    {item.progress}%
                  </span>
                  {hasTasks && (
                    <span className="text-[10px] text-muted-foreground">
                      • {item.linkedTasks.length} tareas
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Timeline Bar */}
          <div className="flex-1 relative h-16">
            {isVisible(item.startDate, item.endDate) && (
              <div
                className="absolute top-3 h-8 rounded-md flex items-center overflow-hidden cursor-pointer group"
                style={getBarStyle(item.startDate, item.endDate)}
                onClick={() => setSelectedItem(item)}
              >
                {/* Background bar */}
                <div className={cn('absolute inset-0 opacity-30', getStatusColor(item.status))} />
                
                {/* Progress fill */}
                <div 
                  className={cn('absolute inset-y-0 left-0', getStatusColor(item.status))}
                  style={{ width: `${item.progress}%` }}
                />
                
                {/* Label */}
                <span className="relative z-10 px-2 text-xs font-medium text-foreground truncate">
                  {item.name}
                </span>
                
                {/* Hover effect */}
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors" />
              </div>
            )}
          </div>
        </div>

        {/* Expanded: Show linked tasks */}
        {isExpanded && hasTasks && item.linkedTasks.map((task) => (
          <div 
            key={task.id}
            className="flex border-b border-border bg-muted/10"
          >
            <div 
              className="w-80 flex-shrink-0 p-2 border-r border-border"
              style={{ paddingLeft: `${32 + depth * 20}px` }}
            >
              <div className="flex items-center gap-2">
                <CheckSquare className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs truncate">{task.name}</span>
                {task.assigneeName && (
                  <span className="text-[10px] text-muted-foreground">
                    • {task.assigneeName}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex-1 relative h-10">
              {isVisible(task.startDate, task.endDate) && (
                <div
                  className="absolute top-2 h-5 rounded flex items-center"
                  style={getBarStyle(task.startDate, task.endDate)}
                >
                  <div className={cn('absolute inset-0 rounded', getTaskStatusColor(task.status))} />
                  <span className="relative z-10 px-1.5 text-[10px] text-white truncate">
                    {task.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Expanded: Show children */}
        {isExpanded && hasChildren && item.children!.map((child) => renderTimelineRow(child, depth + 1))}
      </React.Fragment>
    );
  };

  // Get months for header
  const months = useMemo(() => {
    const result: { month: Date; startIdx: number; span: number }[] = [];
    let currentM = format(visibleDays[0], 'yyyy-MM');
    let startIdx = 0;
    
    visibleDays.forEach((day, idx) => {
      const m = format(day, 'yyyy-MM');
      if (m !== currentM) {
        result.push({ month: parseISO(`${currentM}-01`), startIdx, span: idx - startIdx });
        currentM = m;
        startIdx = idx;
      }
    });
    result.push({ month: parseISO(`${currentM}-01`), startIdx, span: visibleDays.length - startIdx });
    
    return result;
  }, [visibleDays]);

  return (
    <div className={cn('flex flex-col h-[calc(100vh-200px)]', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Hoy
          </Button>
          <Button variant="outline" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="ml-2 font-medium text-foreground">
            {format(currentMonth, 'MMMM yyyy', { locale: es })}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <div className="h-2 w-2 rounded-full bg-success" />
            Completado
          </Badge>
          <Badge variant="outline" className="gap-1">
            <div className="h-2 w-2 rounded-full bg-primary" />
            En progreso
          </Badge>
          <Badge variant="outline" className="gap-1">
            <div className="h-2 w-2 rounded-full bg-warning" />
            En pausa
          </Badge>
          <Badge variant="outline" className="gap-1">
            <div className="h-2 w-2 rounded-full bg-muted-foreground" />
            Pendiente
          </Badge>
        </div>
      </div>

      {/* Timeline Container */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="min-w-[1200px]">
            {/* Time Header */}
            <div className="flex sticky top-0 z-10 bg-muted/80 backdrop-blur-sm border-b border-border">
              <div className="w-80 flex-shrink-0 p-2 border-r border-border">
                <span className="text-sm font-medium text-muted-foreground">Iniciativas / Tareas</span>
              </div>
              <div className="flex-1 flex">
                {months.map(({ month, startIdx, span }) => (
                  <div
                    key={format(month, 'yyyy-MM')}
                    className="border-r border-border text-center py-2"
                    style={{ width: `${(span / totalDays) * 100}%` }}
                  >
                    <span className="text-sm font-medium text-foreground">
                      {format(month, 'MMMM yyyy', { locale: es })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Today marker */}
            <div className="relative">
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-destructive z-20"
                style={{ 
                  left: `calc(320px + ${(differenceInDays(new Date(), visibleStart) / totalDays) * (100 - (320 / 12))}%)` 
                }}
              />
            </div>

            {/* Timeline Rows */}
            <div className="relative">
              {mockTimelineData.map((item) => renderTimelineRow(item))}
            </div>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Item Detail Panel */}
      {selectedItem && (
        <div className="border-t border-border bg-card p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className={cn('p-2 rounded-lg', planningLevelConfig[selectedItem.level].bgColor)}>
                <span className={planningLevelConfig[selectedItem.level].color}>
                  {levelIcons[selectedItem.level]}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-foreground">{selectedItem.name}</h3>
                {selectedItem.description && (
                  <p className="text-sm text-muted-foreground mt-1">{selectedItem.description}</p>
                )}
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {format(parseISO(selectedItem.startDate), 'd MMM', { locale: es })} - {format(parseISO(selectedItem.endDate), 'd MMM yyyy', { locale: es })}
                    </span>
                  </div>
                  {selectedItem.ownerName && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Responsable:</span>
                      <span className="text-sm font-medium">{selectedItem.ownerName}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">{selectedItem.progress}%</p>
                <p className="text-sm text-muted-foreground">Progreso</p>
              </div>
              <Progress value={selectedItem.progress} className="w-32 h-3" />
              <Button variant="ghost" size="sm" onClick={() => setSelectedItem(null)}>
                ✕
              </Button>
            </div>
          </div>

          {/* Linked Tasks Summary */}
          {selectedItem.linkedTasks.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <h4 className="text-sm font-medium mb-3">Tareas vinculadas ({selectedItem.linkedTasks.length})</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {selectedItem.linkedTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                    {task.status === 'completed' ? (
                      <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                    ) : task.status === 'in_progress' ? (
                      <Clock className="h-4 w-4 text-primary flex-shrink-0" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">{task.name}</p>
                      <p className="text-[10px] text-muted-foreground">{task.assigneeName}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OperationsTimelineView;
