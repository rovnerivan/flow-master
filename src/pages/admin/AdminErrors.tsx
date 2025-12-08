import React, { useState } from 'react';
import { AlertTriangle, Filter, Search, ChevronDown, Calendar, User, Layers, MessageSquare, XCircle, CheckCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { HierarchyFilter, HierarchySelection, matchesHierarchyFilter } from '@/components/admin/HierarchyFilter';
import { DateRangeFilter, useDateRangeFilter } from '@/components/filters/DateRangeFilter';
import { ComparisonBadge } from '@/components/filters/ComparisonBadge';
import { toast } from 'sonner';

interface ErrorItem {
  id: string;
  date: string;
  type: string;
  process: string;
  task: string;
  employee: string;
  description: string;
  employeeNotes: string;
  adminNotes: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'unsolvable';
  // Hierarchy info
  verticalId?: string;
  managementId?: string;
  departmentId?: string;
  employeeId?: string;
}

const initialMockErrors: ErrorItem[] = [
  {
    id: '1',
    date: '2024-01-15',
    type: 'Procedimiento incorrecto',
    process: 'Preparación de Pedidos',
    task: 'Verificación de items',
    employee: 'Carlos López',
    description: 'No se verificó la cantidad de productos antes del empaque',
    employeeNotes: 'El sistema estaba lento y me saltee el paso',
    adminNotes: 'Revisar capacitación del proceso',
    status: 'reviewed',
    verticalId: 'v1',
    managementId: 'm1',
    departmentId: 'd1',
    employeeId: 'e1',
  },
  {
    id: '2',
    date: '2024-01-14',
    type: 'Error de registro',
    process: 'Cierre de Caja',
    task: 'Conteo de efectivo',
    employee: 'Andrea Morales',
    description: 'Diferencia de $50 en el conteo final',
    employeeNotes: '',
    adminNotes: '',
    status: 'pending',
    verticalId: 'v3',
    managementId: 'm5',
    departmentId: 'd6',
    employeeId: 'e9', // Andrea Morales - matches mockHierarchy
  },
  {
    id: '3',
    date: '2024-01-13',
    type: 'Comunicación fallida',
    process: 'Atención al Cliente',
    task: 'Resolución de quejas',
    employee: 'Pedro Sánchez',
    description: 'Cliente escaló queja por falta de seguimiento',
    employeeNotes: 'No tenía acceso al sistema de tickets',
    adminNotes: 'Verificar permisos de acceso',
    status: 'resolved',
    verticalId: 'v1',
    managementId: 'm1',
    departmentId: 'd2',
    employeeId: 'e3', // Pedro Sánchez - matches mockHierarchy
  },
  {
    id: '4',
    date: '2024-01-12',
    type: 'Incumplimiento de protocolo',
    process: 'Inventario Semanal',
    task: 'Registro de productos',
    employee: 'Laura García',
    description: 'Productos no registrados en sistema',
    employeeNotes: '',
    adminNotes: '',
    status: 'pending',
    verticalId: 'v1',
    managementId: 'm2',
    departmentId: 'd3',
    employeeId: 'e4', // Laura García - matches mockHierarchy
  },
  {
    id: '5',
    date: '2024-01-11',
    type: 'Error técnico',
    process: 'Gestión de Marketing Digital',
    task: 'Publicación de contenido',
    employee: 'Sofia Ruiz',
    description: 'Publicación programada no se ejecutó',
    employeeNotes: 'El sistema mostró error de conexión',
    adminNotes: '',
    status: 'pending',
    verticalId: 'v2',
    managementId: 'm4',
    departmentId: 'd5',
    employeeId: 'e8',
  },
];

const errorTypes = [
  'Todos los tipos',
  'Procedimiento incorrecto',
  'Error de registro',
  'Comunicación fallida',
  'Incumplimiento de protocolo',
  'Error técnico',
];

const statusLabels: Record<string, { label: string; class: string }> = {
  pending: { label: 'Pendiente', class: 'bg-warning/20 text-warning' },
  reviewed: { label: 'Revisado', class: 'bg-primary/20 text-primary' },
  resolved: { label: 'Resuelto', class: 'bg-success/20 text-success' },
  unsolvable: { label: 'No salvable', class: 'bg-destructive/20 text-destructive' },
};

const AdminErrors: React.FC = () => {
  const [errors, setErrors] = useState<ErrorItem[]>(initialMockErrors);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('Todos los tipos');
  const [expandedError, setExpandedError] = useState<string | null>(null);
  const [noteModal, setNoteModal] = useState<{ errorId: string; type: 'admin' } | null>(null);
  const [newNote, setNewNote] = useState('');
  const [hierarchyFilter, setHierarchyFilter] = useState<HierarchySelection>({ level: 'all' });
  const { dateRange, setDateRange, filterByDateRange, getComparisonItems } = useDateRangeFilter(30);

  // Filter by date range first
  const dateFilteredErrors = filterByDateRange(errors);
  const comparisonErrors = getComparisonItems(errors);

  const filteredErrors = dateFilteredErrors.filter((error) => {
    const matchesSearch =
      error.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      error.employee.toLowerCase().includes(searchQuery.toLowerCase()) ||
      error.process.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'Todos los tipos' || error.type === selectedType;
    const matchesHierarchy = matchesHierarchyFilter(hierarchyFilter, {
      verticalId: error.verticalId,
      managementId: error.managementId,
      departmentId: error.departmentId,
      employeeId: error.employeeId,
    });
    return matchesSearch && matchesType && matchesHierarchy;
  });

  // Stats for current period
  const totalErrors = dateFilteredErrors.length;
  const pendingErrors = dateFilteredErrors.filter((e) => e.status === 'pending').length;
  const resolvedErrors = dateFilteredErrors.filter((e) => e.status === 'resolved').length;
  const unsolvableErrors = dateFilteredErrors.filter((e) => e.status === 'unsolvable').length;

  // Stats for comparison period
  const prevTotalErrors = comparisonErrors.length;
  const prevPendingErrors = comparisonErrors.filter((e) => e.status === 'pending').length;
  const prevResolvedErrors = comparisonErrors.filter((e) => e.status === 'resolved').length;

  // Stats by employee
  const errorsByEmployee = dateFilteredErrors.reduce((acc, err) => {
    acc[err.employee] = acc[err.employee] || { total: 0, resolved: 0, unsolvable: 0 };
    acc[err.employee].total++;
    if (err.status === 'resolved') acc[err.employee].resolved++;
    if (err.status === 'unsolvable') acc[err.employee].unsolvable++;
    return acc;
  }, {} as Record<string, { total: number; resolved: number; unsolvable: number }>);

  const handleAddNote = (errorId: string) => {
    setNoteModal({ errorId, type: 'admin' });
  };

  const saveNote = () => {
    if (!noteModal || !newNote.trim()) {
      toast.error('Ingresa una nota');
      return;
    }
    setErrors(prev => prev.map(e => 
      e.id === noteModal.errorId 
        ? { ...e, adminNotes: e.adminNotes ? `${e.adminNotes}\n\n${newNote}` : newNote }
        : e
    ));
    toast.success('Nota agregada');
    setNoteModal(null);
    setNewNote('');
  };

  const markAsResolved = (errorId: string) => {
    setErrors(prev => prev.map(e => 
      e.id === errorId ? { ...e, status: 'resolved' as const } : e
    ));
    toast.success('Error marcado como resuelto');
  };

  const markAsUnsolvable = (errorId: string) => {
    setErrors(prev => prev.map(e => 
      e.id === errorId ? { ...e, status: 'unsolvable' as const } : e
    ));
    toast.info('Error marcado como no salvable');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Errores Detectados</h1>
          <p className="text-muted-foreground">
            Seguimiento y análisis de errores operativos
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Calendar className="w-4 h-4" />
          Exportar historial
        </Button>
      </div>

      {/* Filters Row */}
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

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="kpi-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10">
              <AlertTriangle className="w-5 h-5 text-warning" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-foreground">{totalErrors}</p>
                {dateRange.comparison && <ComparisonBadge current={totalErrors} previous={prevTotalErrors} inverse />}
              </div>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <AlertTriangle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-foreground">{pendingErrors}</p>
                {dateRange.comparison && <ComparisonBadge current={pendingErrors} previous={prevPendingErrors} inverse />}
              </div>
              <p className="text-sm text-muted-foreground">Pendientes</p>
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-foreground">{resolvedErrors}</p>
                {dateRange.comparison && <ComparisonBadge current={resolvedErrors} previous={prevResolvedErrors} />}
              </div>
              <p className="text-sm text-muted-foreground">Resueltos</p>
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10">
              <XCircle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{unsolvableErrors}</p>
              <p className="text-sm text-muted-foreground">No salvables</p>
            </div>
          </div>
        </div>
      </div>

      {/* Impact by Employee */}
      <div className="kpi-card">
        <h3 className="font-semibold text-foreground mb-4">Impacto por Empleado</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(errorsByEmployee).map(([employee, stats]) => (
            <div key={employee} className="p-3 rounded-lg bg-secondary/30">
              <p className="font-medium text-foreground text-sm">{employee}</p>
              <div className="flex gap-3 mt-2 text-xs">
                <span className="text-muted-foreground">Total: {stats.total}</span>
                <span className="text-success">Resueltos: {stats.resolved}</span>
                <span className="text-destructive">No salv: {stats.unsolvable}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por descripción, empleado o proceso..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              {selectedType}
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {errorTypes.map((type) => (
              <DropdownMenuItem key={type} onClick={() => setSelectedType(type)}>
                {type}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Errors List */}
      <div className="space-y-4">
        {filteredErrors.map((error) => (
          <div
            key={error.id}
            className="kpi-card hover:border-primary/30 transition-colors cursor-pointer"
            onClick={() => setExpandedError(expandedError === error.id ? null : error.id)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusLabels[error.status].class}`}>
                    {statusLabels[error.status].label}
                  </span>
                  <span className="text-xs text-muted-foreground">{error.date}</span>
                </div>
                <h4 className="font-medium text-foreground mb-1">{error.description}</h4>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Layers className="w-3 h-3" />
                    {error.process}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {error.employee}
                  </span>
                </div>
              </div>
              <span className="px-3 py-1 rounded-lg bg-secondary text-xs font-medium text-foreground">
                {error.type}
              </span>
            </div>

            {/* Expanded Details */}
            {expandedError === error.id && (
              <div className="mt-4 pt-4 border-t border-border space-y-4" onClick={(e) => e.stopPropagation()}>
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Tarea afectada</p>
                  <p className="text-sm text-muted-foreground">{error.task}</p>
                </div>
                
                {error.employeeNotes && (
                  <div className="p-3 rounded-lg bg-secondary/50">
                    <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      Nota del empleado
                    </p>
                    <p className="text-sm text-foreground">{error.employeeNotes}</p>
                  </div>
                )}

                {error.adminNotes && (
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-xs font-medium text-primary mb-1 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      Nota del administrador
                    </p>
                    <p className="text-sm text-foreground whitespace-pre-line">{error.adminNotes}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleAddNote(error.id)} className="gap-1">
                    <Plus className="w-3 h-3" />
                    Agregar nota
                  </Button>
                  {error.status !== 'resolved' && error.status !== 'unsolvable' && (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => markAsResolved(error.id)}
                        className="gap-1 text-success hover:text-success"
                      >
                        <CheckCircle className="w-3 h-3" />
                        Marcar resuelto
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => markAsUnsolvable(error.id)}
                        className="gap-1 text-destructive hover:text-destructive"
                      >
                        <XCircle className="w-3 h-3" />
                        No salvable
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Note Modal */}
      {noteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setNoteModal(null)} />
          <div className="relative w-full max-w-md mx-4 bg-card border border-border rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Agregar Nota</h3>
            <Textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Escribe tu nota aquí..."
              rows={4}
            />
            <div className="flex gap-3 mt-4">
              <Button variant="outline" onClick={() => setNoteModal(null)} className="flex-1">
                Cancelar
              </Button>
              <Button variant="hero" onClick={saveNote} className="flex-1">
                Guardar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminErrors;