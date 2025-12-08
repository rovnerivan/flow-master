import React, { useState } from 'react';
import { Plus, Search, Filter, MoreVertical, Play, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ProcessCreatorModal } from '@/components/admin/ProcessCreatorModal';
import { toast } from 'sonner';

const mockProcesses = [
  {
    id: '1',
    name: 'Preparación de Pedidos',
    description: 'Proceso completo para preparar y empacar pedidos',
    steps: 8,
    compliance: 92,
    status: 'published',
    lastUpdated: '2024-01-15',
  },
  {
    id: '2',
    name: 'Atención al Cliente',
    description: 'Protocolo de atención y resolución de consultas',
    steps: 5,
    compliance: 78,
    status: 'published',
    lastUpdated: '2024-01-10',
  },
  {
    id: '3',
    name: 'Cierre de Caja',
    description: 'Procedimiento para el cierre diario de caja',
    steps: 6,
    compliance: 95,
    status: 'published',
    lastUpdated: '2024-01-08',
  },
  {
    id: '4',
    name: 'Inventario Semanal',
    description: 'Control y registro de inventario',
    steps: 10,
    compliance: 65,
    status: 'draft',
    lastUpdated: '2024-01-05',
  },
];

const AdminProcesses: React.FC = () => {
  const [showCreator, setShowCreator] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProcesses = mockProcesses.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Procesos</h1>
          <p className="text-muted-foreground">
            Gestiona y crea nuevos procesos de capacitación
          </p>
        </div>
        <Button variant="hero" className="gap-2" onClick={() => setShowCreator(true)}>
          <Plus className="w-4 h-4" />
          Nuevo Proceso
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar procesos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Filtrar
        </Button>
      </div>

      {/* Processes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProcesses.map((process) => (
          <div
            key={process.id}
            className="kpi-card hover:border-primary/30 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-foreground">{process.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {process.description}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1 rounded hover:bg-secondary">
                    <MoreVertical className="w-4 h-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Play className="w-4 h-4 mr-2" />
                    Ver proceso
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">
                {process.steps} pasos
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  process.status === 'published'
                    ? 'bg-success/20 text-success'
                    : 'bg-warning/20 text-warning'
                }`}
              >
                {process.status === 'published' ? 'Publicado' : 'Borrador'}
              </span>
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Cumplimiento</span>
                <span className="font-semibold text-foreground">
                  {process.compliance}%
                </span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${process.compliance}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Process Creator Modal */}
      <ProcessCreatorModal
        open={showCreator}
        onClose={() => setShowCreator(false)}
      />
    </div>
  );
};

export default AdminProcesses;
