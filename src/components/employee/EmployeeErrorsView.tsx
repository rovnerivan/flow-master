import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  Lightbulb,
  ChevronDown,
  Calendar,
  Layers,
  Briefcase,
  PenLine,
  Save,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface EmployeeError {
  id: string;
  date: string;
  type: string;
  process: string;
  task: string;
  description: string;
  supervisorNotes: string;
  status: 'resolved' | 'unsolvable';
  // Employee's own learning notes
  lessonsLearned?: string;
  selfAdvice?: string;
}

// Mock errors for current employee
const mockEmployeeErrors: EmployeeError[] = [
  {
    id: '1',
    date: '2024-01-15',
    type: 'Corrección resuelta',
    process: 'Cierre de Caja',
    task: 'Conteo de efectivo',
    description: 'Diferencia de $50 en el conteo final - corregido después de revisión',
    supervisorNotes: 'Recuerda contar dos veces antes de registrar. La próxima vez usa el método de conteo por denominación.',
    status: 'resolved',
    lessonsLearned: 'Siempre verificar el conteo dos veces antes de registrar en sistema.',
    selfAdvice: 'Usar método de conteo por denominación: primero billetes grandes, luego pequeños, luego monedas.',
  },
  {
    id: '2',
    date: '2024-01-10',
    type: 'Error no salvable',
    process: 'Reporte de incidencias',
    task: 'Documentación de turno',
    description: 'Reporte entregado fuera de tiempo y con formato incorrecto',
    supervisorNotes: 'El reporte debe entregarse antes del fin del turno y usar la plantilla estándar. Este error impactó la planificación del día siguiente.',
    status: 'unsolvable',
    lessonsLearned: '',
    selfAdvice: '',
  },
  {
    id: '3',
    date: '2024-01-05',
    type: 'Corrección resuelta',
    process: 'Auditoría de productos',
    task: 'Verificación de vencimientos',
    description: 'Sección de lácteos no verificada en primera revisión',
    supervisorNotes: 'Completar todas las secciones antes de marcar como terminado. Usar el checklist físico.',
    status: 'resolved',
    lessonsLearned: 'No marcar tarea como completa hasta revisar TODO el checklist.',
    selfAdvice: 'Llevar el checklist impreso y marcar cada sección físicamente mientras la reviso.',
  },
];

const statusConfig = {
  resolved: { 
    label: 'Resuelto', 
    color: 'bg-success/20 text-success',
    icon: CheckCircle,
    description: 'Este error fue corregido y aprobado'
  },
  unsolvable: { 
    label: 'No salvable', 
    color: 'bg-destructive/20 text-destructive',
    icon: XCircle,
    description: 'Este error no pudo corregirse'
  },
};

const EmployeeErrorsView: React.FC = () => {
  const [errors, setErrors] = useState(mockEmployeeErrors);
  const [expandedError, setExpandedError] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<{ errorId: string; field: 'lessonsLearned' | 'selfAdvice' } | null>(null);
  const [noteText, setNoteText] = useState('');

  // Stats
  const totalErrors = errors.length;
  const resolvedErrors = errors.filter(e => e.status === 'resolved').length;
  const unsolvableErrors = errors.filter(e => e.status === 'unsolvable').length;

  const startEditNote = (errorId: string, field: 'lessonsLearned' | 'selfAdvice') => {
    const error = errors.find(e => e.id === errorId);
    if (!error) return;
    setEditingNotes({ errorId, field });
    setNoteText(error[field] || '');
  };

  const saveNote = () => {
    if (!editingNotes) return;
    
    setErrors(prev => prev.map(e => 
      e.id === editingNotes.errorId 
        ? { ...e, [editingNotes.field]: noteText }
        : e
    ));
    
    toast.success('Nota guardada');
    setEditingNotes(null);
    setNoteText('');
  };

  const cancelEdit = () => {
    setEditingNotes(null);
    setNoteText('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mobile-card bg-primary/5 border-primary/20">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Lightbulb className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Aprende de tus errores</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Este espacio es para reflexionar y aprender. Usa las notas de tu supervisor y agrega tus propias lecciones aprendidas.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="mobile-card text-center">
          <AlertTriangle className="w-5 h-5 mx-auto mb-1 text-warning" />
          <p className="text-xl font-bold text-foreground">{totalErrors}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
        <div className="mobile-card text-center">
          <CheckCircle className="w-5 h-5 mx-auto mb-1 text-success" />
          <p className="text-xl font-bold text-foreground">{resolvedErrors}</p>
          <p className="text-xs text-muted-foreground">Resueltos</p>
        </div>
        <div className="mobile-card text-center">
          <XCircle className="w-5 h-5 mx-auto mb-1 text-destructive" />
          <p className="text-xl font-bold text-foreground">{unsolvableErrors}</p>
          <p className="text-xs text-muted-foreground">No salvables</p>
        </div>
      </div>

      {/* Errors List */}
      <div className="space-y-4">
        {errors.map(error => {
          const StatusIcon = statusConfig[error.status].icon;
          const isExpanded = expandedError === error.id;
          
          return (
            <div 
              key={error.id}
              className={cn(
                "mobile-card",
                error.status === 'unsolvable' && "border-destructive/30"
              )}
            >
              <div 
                className="cursor-pointer"
                onClick={() => setExpandedError(isExpanded ? null : error.id)}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1",
                        statusConfig[error.status].color
                      )}>
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig[error.status].label}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {error.date}
                      </span>
                    </div>
                    <p className="font-medium text-foreground">{error.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3 h-3" />
                        {error.process}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        {error.task}
                      </span>
                    </div>
                  </div>
                  <ChevronDown className={cn(
                    "w-5 h-5 text-muted-foreground transition-transform",
                    isExpanded && "rotate-180"
                  )} />
                </div>
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-border space-y-4">
                  {/* Supervisor Notes */}
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-xs font-medium text-primary mb-1 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      Notas del supervisor
                    </p>
                    <p className="text-sm text-foreground">{error.supervisorNotes}</p>
                  </div>

                  {/* Lessons Learned */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground flex items-center gap-1">
                        <Lightbulb className="w-4 h-4 text-warning" />
                        Lecciones aprendidas
                      </p>
                      {editingNotes?.errorId !== error.id || editingNotes?.field !== 'lessonsLearned' ? (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditNote(error.id, 'lessonsLearned');
                          }}
                          className="h-7 text-xs gap-1"
                        >
                          <PenLine className="w-3 h-3" />
                          {error.lessonsLearned ? 'Editar' : 'Agregar'}
                        </Button>
                      ) : null}
                    </div>
                    
                    {editingNotes?.errorId === error.id && editingNotes?.field === 'lessonsLearned' ? (
                      <div className="space-y-2">
                        <Textarea
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          placeholder="¿Qué aprendiste de este error?"
                          rows={3}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation();
                              cancelEdit();
                            }}
                          >
                            Cancelar
                          </Button>
                          <Button 
                            variant="hero" 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation();
                              saveNote();
                            }}
                            className="gap-1"
                          >
                            <Save className="w-3 h-3" />
                            Guardar
                          </Button>
                        </div>
                      </div>
                    ) : error.lessonsLearned ? (
                      <p className="text-sm text-muted-foreground p-3 rounded-lg bg-warning/5 border border-warning/20">
                        {error.lessonsLearned}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        Aún no has agregado lecciones aprendidas
                      </p>
                    )}
                  </div>

                  {/* Self Advice */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground flex items-center gap-1">
                        <MessageSquare className="w-4 h-4 text-primary" />
                        Autoconsejos para la próxima
                      </p>
                      {editingNotes?.errorId !== error.id || editingNotes?.field !== 'selfAdvice' ? (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditNote(error.id, 'selfAdvice');
                          }}
                          className="h-7 text-xs gap-1"
                        >
                          <PenLine className="w-3 h-3" />
                          {error.selfAdvice ? 'Editar' : 'Agregar'}
                        </Button>
                      ) : null}
                    </div>
                    
                    {editingNotes?.errorId === error.id && editingNotes?.field === 'selfAdvice' ? (
                      <div className="space-y-2">
                        <Textarea
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          placeholder="¿Qué te dirías a ti mismo para evitar esto en el futuro?"
                          rows={3}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation();
                              cancelEdit();
                            }}
                          >
                            Cancelar
                          </Button>
                          <Button 
                            variant="hero" 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation();
                              saveNote();
                            }}
                            className="gap-1"
                          >
                            <Save className="w-3 h-3" />
                            Guardar
                          </Button>
                        </div>
                      </div>
                    ) : error.selfAdvice ? (
                      <p className="text-sm text-muted-foreground p-3 rounded-lg bg-primary/5 border border-primary/20">
                        {error.selfAdvice}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        Aún no has agregado autoconsejos
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {errors.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50 text-success" />
          <p className="font-medium">¡Excelente trabajo!</p>
          <p className="text-sm">No tienes errores registrados</p>
        </div>
      )}
    </div>
  );
};

export default EmployeeErrorsView;
