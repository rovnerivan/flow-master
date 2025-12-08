import React, { useState } from 'react';
import { AlertTriangle, Filter, Search, ChevronDown, Calendar, User, Layers, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const mockErrors = [
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
  },
  {
    id: '2',
    date: '2024-01-14',
    type: 'Error de registro',
    process: 'Cierre de Caja',
    task: 'Conteo de efectivo',
    employee: 'Ana Martínez',
    description: 'Diferencia de $50 en el conteo final',
    employeeNotes: '',
    adminNotes: '',
    status: 'pending',
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
  },
  {
    id: '4',
    date: '2024-01-12',
    type: 'Incumplimiento de protocolo',
    process: 'Inventario Semanal',
    task: 'Registro de productos',
    employee: 'María García',
    description: 'Productos no registrados en sistema',
    employeeNotes: '',
    adminNotes: '',
    status: 'pending',
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
};

const AdminErrors: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('Todos los tipos');
  const [expandedError, setExpandedError] = useState<string | null>(null);

  const filteredErrors = mockErrors.filter((error) => {
    const matchesSearch =
      error.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      error.employee.toLowerCase().includes(searchQuery.toLowerCase()) ||
      error.process.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'Todos los tipos' || error.type === selectedType;
    return matchesSearch && matchesType;
  });

  // Stats
  const totalErrors = mockErrors.length;
  const pendingErrors = mockErrors.filter((e) => e.status === 'pending').length;
  const resolvedErrors = mockErrors.filter((e) => e.status === 'resolved').length;

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

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="kpi-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10">
              <AlertTriangle className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalErrors}</p>
              <p className="text-sm text-muted-foreground">Total este mes</p>
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <AlertTriangle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{pendingErrors}</p>
              <p className="text-sm text-muted-foreground">Pendientes de revisión</p>
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <AlertTriangle className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{resolvedErrors}</p>
              <p className="text-sm text-muted-foreground">Resueltos</p>
            </div>
          </div>
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
              <div className="mt-4 pt-4 border-t border-border space-y-4">
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
                    <p className="text-sm text-foreground">{error.adminNotes}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Agregar nota
                  </Button>
                  <Button variant="outline" size="sm">
                    Marcar como resuelto
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminErrors;
