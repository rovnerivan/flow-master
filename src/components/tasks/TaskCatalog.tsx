import React, { useState } from 'react';
import { 
  Plus, Search, Filter, MoreVertical, Edit, Trash2, Copy, 
  Clock, Users, Calendar, RefreshCw, Play, FileText, 
  ChevronRight, Layers, CheckCircle, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { RecurrenceRuleEditor } from './RecurrenceRuleEditor';
import { 
  RecurrenceRule, 
  patternTypeLabels, 
  dayOfWeekLabels 
} from '@/lib/recurrenceTypes';

interface TaskDefinition {
  id: string;
  name: string;
  description: string | null;
  estimated_duration_min: number;
  frequency: string;
  is_active: boolean;
  linked_process_id: string | null;
  linked_process_name?: string;
  recurrence_rule?: Partial<RecurrenceRule>;
  instances_count?: number;
  last_instance_date?: string;
}

// Mock data for task catalog
const mockTasks: TaskDefinition[] = [
  {
    id: '1',
    name: 'Apertura de tienda',
    description: 'Verificar inventario inicial, encender sistemas, preparar caja',
    estimated_duration_min: 30,
    frequency: 'daily',
    is_active: true,
    linked_process_id: 'p1',
    linked_process_name: 'Proceso de Apertura',
    recurrence_rule: {
      pattern_type: 'specific_days',
      days_of_week: [1, 2, 3, 4, 5, 6],
      default_due_time: '09:00',
    },
    instances_count: 156,
    last_instance_date: '2024-01-15',
  },
  {
    id: '2',
    name: 'Cierre de caja',
    description: 'Cuadrar caja, generar reporte del día, preparar depósito',
    estimated_duration_min: 45,
    frequency: 'daily',
    is_active: true,
    linked_process_id: 'p2',
    linked_process_name: 'Proceso de Cierre',
    recurrence_rule: {
      pattern_type: 'daily',
      default_due_time: '21:00',
    },
    instances_count: 312,
    last_instance_date: '2024-01-15',
  },
  {
    id: '3',
    name: 'Inventario semanal',
    description: 'Conteo físico de productos y actualización en sistema',
    estimated_duration_min: 120,
    frequency: 'weekly',
    is_active: true,
    linked_process_id: null,
    recurrence_rule: {
      pattern_type: 'weekly',
      default_due_time: '14:00',
    },
    instances_count: 52,
    last_instance_date: '2024-01-12',
  },
  {
    id: '4',
    name: 'Reporte mensual de ventas',
    description: 'Compilar datos de ventas, analizar tendencias, presentar a gerencia',
    estimated_duration_min: 180,
    frequency: 'monthly',
    is_active: true,
    linked_process_id: null,
    recurrence_rule: {
      pattern_type: 'monthly',
      day_of_month: 1,
      default_due_time: '10:00',
    },
    instances_count: 12,
    last_instance_date: '2024-01-01',
  },
  {
    id: '5',
    name: 'Capacitación de seguridad',
    description: 'Entrenamiento anual obligatorio de seguridad laboral',
    estimated_duration_min: 240,
    frequency: 'annual',
    is_active: false,
    linked_process_id: 'p5',
    linked_process_name: 'Programa de Seguridad',
    recurrence_rule: {
      pattern_type: 'annual',
      month_of_year: 6,
      day_of_month: 15,
      default_due_time: '09:00',
    },
    instances_count: 2,
    last_instance_date: '2023-06-15',
  },
];

interface TaskCatalogProps {
  onSelectTask?: (task: TaskDefinition) => void;
  onCreateTask?: () => void;
  selectable?: boolean;
  className?: string;
}

export const TaskCatalog: React.FC<TaskCatalogProps> = ({
  onSelectTask,
  onCreateTask,
  selectable = false,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRecurrenceModal, setShowRecurrenceModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskDefinition | null>(null);

  // New task form state
  const [newTask, setNewTask] = useState({
    name: '',
    description: '',
    estimated_duration_min: 30,
    is_active: true,
  });
  const [recurrenceRule, setRecurrenceRule] = useState<Partial<RecurrenceRule>>({});

  const filteredTasks = mockTasks.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesActive = filterActive === null || task.is_active === filterActive;
    return matchesSearch && matchesActive;
  });

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  const getRecurrenceLabel = (rule?: Partial<RecurrenceRule>) => {
    if (!rule?.pattern_type) return 'Sin configurar';
    
    const typeLabel = patternTypeLabels[rule.pattern_type].label;
    
    if (rule.pattern_type === 'specific_days' && rule.days_of_week?.length) {
      const days = rule.days_of_week.map(d => dayOfWeekLabels[d].short).join('-');
      return `${days}`;
    }
    
    return typeLabel;
  };

  const handleCreateTask = () => {
    // Here you would save to Supabase
    console.log('Creating task:', newTask, 'with recurrence:', recurrenceRule);
    setShowCreateModal(false);
    setNewTask({ name: '', description: '', estimated_duration_min: 30, is_active: true });
    setRecurrenceRule({});
  };

  const handleConfigureRecurrence = (task: TaskDefinition) => {
    setSelectedTask(task);
    setRecurrenceRule(task.recurrence_rule || {});
    setShowRecurrenceModal(true);
  };

  const handleSaveRecurrence = () => {
    // Here you would save to Supabase
    console.log('Saving recurrence for task:', selectedTask?.id, recurrenceRule);
    setShowRecurrenceModal(false);
    setSelectedTask(null);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tareas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="w-4 h-4" />
                Filtrar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setFilterActive(null)}>
                <Layers className="w-4 h-4 mr-2" />
                Todas
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterActive(true)}>
                <CheckCircle className="w-4 h-4 mr-2 text-success" />
                Solo activas
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterActive(false)}>
                <AlertCircle className="w-4 h-4 mr-2 text-muted-foreground" />
                Solo inactivas
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={() => setShowCreateModal(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Nueva tarea
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-sm text-muted-foreground">
        <span>{filteredTasks.length} tareas en catálogo</span>
        <span>•</span>
        <span>{filteredTasks.filter(t => t.is_active).length} activas</span>
        <span>•</span>
        <span>{filteredTasks.filter(t => t.recurrence_rule).length} con recurrencia</span>
      </div>

      {/* Task Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTasks.map(task => (
          <Card 
            key={task.id}
            className={cn(
              'group transition-all hover:shadow-md',
              selectable && 'cursor-pointer hover:ring-2 hover:ring-primary/50',
              !task.is_active && 'opacity-60'
            )}
            onClick={() => selectable && onSelectTask?.(task)}
          >
            <CardContent className="p-4 space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{task.name}</h3>
                  {task.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {task.description}
                    </p>
                  )}
                </div>
                
                {!selectable && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleConfigureRecurrence(task)}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Configurar recurrencia
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Play className="w-4 h-4 mr-2" />
                        Generar instancias
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="outline" className="text-xs gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDuration(task.estimated_duration_min)}
                </Badge>
                
                <Badge 
                  variant={task.recurrence_rule ? 'default' : 'secondary'} 
                  className="text-xs gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  {getRecurrenceLabel(task.recurrence_rule)}
                </Badge>
                
                {task.linked_process_name && (
                  <Badge variant="outline" className="text-xs gap-1">
                    <FileText className="w-3 h-3" />
                    {task.linked_process_name}
                  </Badge>
                )}
              </div>

              {/* Stats Footer */}
              <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
                <span>{task.instances_count} instancias ejecutadas</span>
                {task.is_active ? (
                  <Badge variant="outline" className="text-xs text-success border-success/30 bg-success/10">
                    Activa
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">
                    Inactiva
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Layers className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No hay tareas en el catálogo</p>
          <p className="text-sm mt-1">Crea tu primera tarea para empezar</p>
          <Button onClick={() => setShowCreateModal(true)} className="mt-4 gap-2">
            <Plus className="w-4 h-4" />
            Nueva tarea
          </Button>
        </div>
      )}

      {/* Create Task Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nueva tarea en catálogo</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>Nombre de la tarea</Label>
              <Input
                value={newTask.name}
                onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                placeholder="Ej: Apertura de tienda"
              />
            </div>

            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Describe los pasos principales de la tarea..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Duración estimada (minutos)</Label>
              <Input
                type="number"
                value={newTask.estimated_duration_min}
                onChange={(e) => setNewTask({ ...newTask, estimated_duration_min: parseInt(e.target.value) || 0 })}
                min={1}
                className="w-32"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div className="space-y-0.5">
                <Label className="text-base">Tarea activa</Label>
                <p className="text-xs text-muted-foreground">
                  Las tareas inactivas no generan instancias
                </p>
              </div>
              <Switch
                checked={newTask.is_active}
                onCheckedChange={(checked) => setNewTask({ ...newTask, is_active: checked })}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base">Configuración de recurrencia</Label>
              </div>
              <RecurrenceRuleEditor
                value={recurrenceRule}
                onChange={setRecurrenceRule}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateTask} disabled={!newTask.name}>
              Crear tarea
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recurrence Configuration Modal */}
      <Dialog open={showRecurrenceModal} onOpenChange={setShowRecurrenceModal}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configurar recurrencia</DialogTitle>
            {selectedTask && (
              <p className="text-sm text-muted-foreground">{selectedTask.name}</p>
            )}
          </DialogHeader>
          
          <RecurrenceRuleEditor
            value={recurrenceRule}
            onChange={setRecurrenceRule}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRecurrenceModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveRecurrence}>
              Guardar configuración
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
