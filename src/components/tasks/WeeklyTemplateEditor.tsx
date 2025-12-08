import React, { useState } from 'react';
import { 
  Calendar, Clock, GripVertical, Plus, X, ChevronLeft, ChevronRight,
  Copy, Download, Upload, Wand2, Check, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { dayOfWeekLabels } from '@/lib/recurrenceTypes';
import type { DateRange } from 'react-day-picker';

interface TemplateTask {
  id: string;
  task_id: string;
  name: string;
  estimated_duration_min: number;
  due_time: string;
  linked_process_name?: string;
}

interface WeeklyTemplate {
  [day: number]: TemplateTask[]; // 1-7 for Mon-Sun
}

// Mock available tasks for drag & drop
const availableTasks = [
  { id: 't1', name: 'Apertura de tienda', estimated_duration_min: 30 },
  { id: 't2', name: 'Cierre de caja', estimated_duration_min: 45 },
  { id: 't3', name: 'Inventario', estimated_duration_min: 120 },
  { id: 't4', name: 'Atención al cliente', estimated_duration_min: 480 },
  { id: 't5', name: 'Limpieza general', estimated_duration_min: 60 },
  { id: 't6', name: 'Reposición de productos', estimated_duration_min: 90 },
  { id: 't7', name: 'Reunión de equipo', estimated_duration_min: 30 },
];

// Mock initial template
const initialTemplate: WeeklyTemplate = {
  1: [
    { id: '1', task_id: 't1', name: 'Apertura de tienda', estimated_duration_min: 30, due_time: '09:00' },
    { id: '2', task_id: 't4', name: 'Atención al cliente', estimated_duration_min: 480, due_time: '18:00' },
    { id: '3', task_id: 't2', name: 'Cierre de caja', estimated_duration_min: 45, due_time: '21:00' },
  ],
  2: [
    { id: '4', task_id: 't1', name: 'Apertura de tienda', estimated_duration_min: 30, due_time: '09:00' },
    { id: '5', task_id: 't4', name: 'Atención al cliente', estimated_duration_min: 480, due_time: '18:00' },
    { id: '6', task_id: 't2', name: 'Cierre de caja', estimated_duration_min: 45, due_time: '21:00' },
  ],
  3: [
    { id: '7', task_id: 't1', name: 'Apertura de tienda', estimated_duration_min: 30, due_time: '09:00' },
    { id: '8', task_id: 't3', name: 'Inventario', estimated_duration_min: 120, due_time: '14:00' },
    { id: '9', task_id: 't4', name: 'Atención al cliente', estimated_duration_min: 480, due_time: '18:00' },
    { id: '10', task_id: 't2', name: 'Cierre de caja', estimated_duration_min: 45, due_time: '21:00' },
  ],
  4: [
    { id: '11', task_id: 't1', name: 'Apertura de tienda', estimated_duration_min: 30, due_time: '09:00' },
    { id: '12', task_id: 't4', name: 'Atención al cliente', estimated_duration_min: 480, due_time: '18:00' },
    { id: '13', task_id: 't2', name: 'Cierre de caja', estimated_duration_min: 45, due_time: '21:00' },
  ],
  5: [
    { id: '14', task_id: 't1', name: 'Apertura de tienda', estimated_duration_min: 30, due_time: '09:00' },
    { id: '15', task_id: 't7', name: 'Reunión de equipo', estimated_duration_min: 30, due_time: '10:00' },
    { id: '16', task_id: 't4', name: 'Atención al cliente', estimated_duration_min: 480, due_time: '18:00' },
    { id: '17', task_id: 't5', name: 'Limpieza general', estimated_duration_min: 60, due_time: '20:00' },
    { id: '18', task_id: 't2', name: 'Cierre de caja', estimated_duration_min: 45, due_time: '21:00' },
  ],
  6: [
    { id: '19', task_id: 't1', name: 'Apertura de tienda', estimated_duration_min: 30, due_time: '10:00' },
    { id: '20', task_id: 't4', name: 'Atención al cliente', estimated_duration_min: 360, due_time: '16:00' },
    { id: '21', task_id: 't2', name: 'Cierre de caja', estimated_duration_min: 45, due_time: '17:00' },
  ],
  7: [], // Sunday - closed
};

interface WeeklyTemplateEditorProps {
  className?: string;
}

export const WeeklyTemplateEditor: React.FC<WeeklyTemplateEditorProps> = ({
  className,
}) => {
  const [template, setTemplate] = useState<WeeklyTemplate>(initialTemplate);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [draggedTask, setDraggedTask] = useState<typeof availableTasks[0] | null>(null);
  
  // Apply period state
  const [applyMonth, setApplyMonth] = useState<Date>(new Date());
  const [applyRange, setApplyRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  const getTotalHours = (day: number) => {
    const dayTasks = template[day] || [];
    const totalMinutes = dayTasks.reduce((acc, t) => acc + t.estimated_duration_min, 0);
    return (totalMinutes / 60).toFixed(1);
  };

  const handleDragStart = (task: typeof availableTasks[0]) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (day: number) => {
    if (draggedTask) {
      const newTask: TemplateTask = {
        id: crypto.randomUUID(),
        task_id: draggedTask.id,
        name: draggedTask.name,
        estimated_duration_min: draggedTask.estimated_duration_min,
        due_time: '17:00',
      };
      
      setTemplate(prev => ({
        ...prev,
        [day]: [...(prev[day] || []), newTask],
      }));
      
      setDraggedTask(null);
      toast.success(`${draggedTask.name} agregada al ${dayOfWeekLabels[day].full}`);
    }
  };

  const handleRemoveTask = (day: number, taskId: string) => {
    setTemplate(prev => ({
      ...prev,
      [day]: prev[day].filter(t => t.id !== taskId),
    }));
  };

  const handleCopyDay = (fromDay: number) => {
    const dayTasks = template[fromDay] || [];
    // Show selection of target day
    toast.info(`Tareas del ${dayOfWeekLabels[fromDay].full} copiadas. Selecciona el día destino.`);
  };

  const handleApplyTemplate = () => {
    if (!applyRange.from || !applyRange.to) {
      toast.error('Selecciona un rango de fechas');
      return;
    }

    // Calculate how many instances would be created
    const totalTasks = Object.values(template).flat().length;
    const weeks = Math.ceil((applyRange.to.getTime() - applyRange.from.getTime()) / (7 * 24 * 60 * 60 * 1000));
    const totalInstances = totalTasks * weeks;

    toast.success(`Se crearán ${totalInstances} instancias de tareas para el período seleccionado`);
    setShowApplyModal(false);
    
    // Here you would call Supabase to create the task_assignments
    console.log('Applying template:', template, 'to range:', applyRange);
  };

  const handleAddTask = (day: number) => {
    setSelectedDay(day);
    setShowAddTaskModal(true);
  };

  const handleSelectTask = (task: typeof availableTasks[0]) => {
    if (selectedDay !== null) {
      const newTask: TemplateTask = {
        id: crypto.randomUUID(),
        task_id: task.id,
        name: task.name,
        estimated_duration_min: task.estimated_duration_min,
        due_time: '17:00',
      };
      
      setTemplate(prev => ({
        ...prev,
        [selectedDay]: [...(prev[selectedDay] || []), newTask],
      }));
      
      setShowAddTaskModal(false);
      setSelectedDay(null);
      toast.success(`${task.name} agregada`);
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-xl font-semibold">Semana Tipo</h2>
          <p className="text-sm text-muted-foreground">
            Configura las tareas recurrentes de una semana típica
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Upload className="w-4 h-4" />
            Importar
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            Exportar
          </Button>
          <Button 
            onClick={() => setShowApplyModal(true)} 
            className="gap-2"
          >
            <Wand2 className="w-4 h-4" />
            Aplicar a período
          </Button>
        </div>
      </div>

      {/* Available Tasks Pool */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium">
            Catálogo de tareas (arrastra para agregar)
          </CardTitle>
        </CardHeader>
        <CardContent className="py-3">
          <div className="flex flex-wrap gap-2">
            {availableTasks.map(task => (
              <div
                key={task.id}
                draggable
                onDragStart={() => handleDragStart(task)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg',
                  'bg-muted hover:bg-muted/80 cursor-grab active:cursor-grabbing',
                  'border border-transparent hover:border-primary/30 transition-all'
                )}
              >
                <GripVertical className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">{task.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {formatDuration(task.estimated_duration_min)}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Grid */}
      <div className="grid grid-cols-7 gap-2">
        {[1, 2, 3, 4, 5, 6, 7].map(day => {
          const dayTasks = template[day] || [];
          const totalHours = getTotalHours(day);
          const isWeekend = day >= 6;
          
          return (
            <div
              key={day}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(day)}
              className={cn(
                'min-h-[300px] rounded-lg border transition-all',
                isWeekend ? 'bg-muted/30' : 'bg-background',
                draggedTask && 'ring-2 ring-primary/20 ring-dashed'
              )}
            >
              {/* Day Header */}
              <div className={cn(
                'p-3 border-b font-medium text-center',
                isWeekend ? 'bg-muted/50' : 'bg-muted/30'
              )}>
                <div className="text-sm">{dayOfWeekLabels[day].full}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {dayTasks.length} tareas • {totalHours}h
                </div>
              </div>

              {/* Day Tasks */}
              <div className="p-2 space-y-2">
                {dayTasks.map(task => (
                  <div
                    key={task.id}
                    className={cn(
                      'group relative p-2 rounded-md border bg-card',
                      'hover:shadow-sm transition-shadow'
                    )}
                  >
                    <button
                      onClick={() => handleRemoveTask(day, task.id)}
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    
                    <div className="text-xs font-medium truncate">{task.name}</div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{task.due_time}</span>
                      <span>•</span>
                      <span>{formatDuration(task.estimated_duration_min)}</span>
                    </div>
                  </div>
                ))}

                {/* Add Task Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full h-8 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => handleAddTask(day)}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Agregar
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-6 justify-center text-center">
            <div>
              <div className="text-2xl font-bold text-primary">
                {Object.values(template).flat().length}
              </div>
              <div className="text-xs text-muted-foreground">Tareas por semana</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {(Object.values(template).flat().reduce((acc, t) => acc + t.estimated_duration_min, 0) / 60).toFixed(0)}h
              </div>
              <div className="text-xs text-muted-foreground">Horas totales</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {Object.values(template).filter(tasks => tasks.length > 0).length}
              </div>
              <div className="text-xs text-muted-foreground">Días activos</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Apply to Period Modal */}
      <Dialog open={showApplyModal} onOpenChange={setShowApplyModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Aplicar plantilla a período</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setApplyMonth(subMonths(applyMonth, 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="font-medium">
                {format(applyMonth, 'MMMM yyyy', { locale: es })}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setApplyMonth(addMonths(applyMonth, 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setApplyRange({
                  from: startOfMonth(applyMonth),
                  to: endOfMonth(applyMonth),
                })}
              >
                Todo el mes
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  const start = new Date();
                  const end = new Date(start);
                  end.setDate(end.getDate() + 7);
                  setApplyRange({ from: start, to: end });
                }}
              >
                Próxima semana
              </Button>
            </div>

            <CalendarComponent
              mode="range"
              selected={applyRange}
              onSelect={(range) => setApplyRange(range)}
              numberOfMonths={1}
              className="rounded-md border p-3 pointer-events-auto"
            />

            {applyRange.from && applyRange.to && (
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-center gap-2 text-primary">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Resumen</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Se generarán instancias desde el {format(applyRange.from, 'd MMM', { locale: es })} 
                  {' '}hasta el {format(applyRange.to, 'd MMM yyyy', { locale: es })}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApplyModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleApplyTemplate} className="gap-2">
              <Check className="w-4 h-4" />
              Aplicar plantilla
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Task Modal */}
      <Dialog open={showAddTaskModal} onOpenChange={setShowAddTaskModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Agregar tarea al {selectedDay !== null ? dayOfWeekLabels[selectedDay].full : ''}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-2 py-4">
            {availableTasks.map(task => (
              <button
                key={task.id}
                onClick={() => handleSelectTask(task)}
                className={cn(
                  'w-full flex items-center justify-between p-3 rounded-lg',
                  'bg-muted/50 hover:bg-muted transition-colors text-left'
                )}
              >
                <div>
                  <div className="font-medium">{task.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatDuration(task.estimated_duration_min)}
                  </div>
                </div>
                <Plus className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTaskModal(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
