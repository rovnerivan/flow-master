import React, { useState } from 'react';
import { Plus, Search, Filter, MoreVertical, Play, Edit, Trash2, Eye, Tag, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ProcessCreatorModal } from '@/components/admin/ProcessCreatorModal';
import { ProcessEditorModal } from '@/components/admin/ProcessEditorModal';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

import { defaultTags, customTagColors, TagInfo } from '@/lib/processTags';

interface Process {
  id: string;
  name: string;
  description: string;
  steps: number;
  compliance: number;
  status: 'published' | 'draft';
  lastUpdated: string;
  tags: string[];
}

const initialProcesses: Process[] = [
  {
    id: '1',
    name: 'Preparación de Pedidos',
    description: 'Proceso completo para preparar y empacar pedidos',
    steps: 8,
    compliance: 92,
    status: 'published',
    lastUpdated: '2024-01-15',
    tags: ['operaciones', 'almacen'],
  },
  {
    id: '2',
    name: 'Atención al Cliente',
    description: 'Protocolo de atención y resolución de consultas',
    steps: 5,
    compliance: 78,
    status: 'published',
    lastUpdated: '2024-01-10',
    tags: ['atencion', 'ventas'],
  },
  {
    id: '3',
    name: 'Cierre de Caja',
    description: 'Procedimiento para el cierre diario de caja',
    steps: 6,
    compliance: 95,
    status: 'published',
    lastUpdated: '2024-01-08',
    tags: ['finanzas', 'operaciones'],
  },
  {
    id: '4',
    name: 'Inventario Semanal',
    description: 'Control y registro de inventario',
    steps: 10,
    compliance: 65,
    status: 'draft',
    lastUpdated: '2024-01-05',
    tags: ['almacen', 'calidad'],
  },
];

const AdminProcesses: React.FC = () => {
  const [showCreator, setShowCreator] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null);
  const [showViewer, setShowViewer] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedTagFilters, setSelectedTagFilters] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [processes, setProcesses] = useState<Process[]>(initialProcesses);
  const [availableTags, setAvailableTags] = useState<TagInfo[]>(defaultTags);
  const [newTagName, setNewTagName] = useState('');
  const [showTagCreator, setShowTagCreator] = useState(false);

  const toggleTagFilter = (tagId: string) => {
    setSelectedTagFilters(prev => 
      prev.includes(tagId) 
        ? prev.filter(t => t !== tagId) 
        : [...prev, tagId]
    );
  };

  const clearFilters = () => {
    setSelectedTagFilters([]);
    setStatusFilter('all');
    setSearchQuery('');
  };

  const createCustomTag = () => {
    if (!newTagName.trim()) {
      toast.error('Ingresa un nombre para la etiqueta');
      return;
    }
    const tagId = newTagName.toLowerCase().replace(/\s+/g, '-');
    if (availableTags.some(t => t.id === tagId)) {
      toast.error('Esta etiqueta ya existe');
      return;
    }
    const colorIndex = (availableTags.length - defaultTags.length) % customTagColors.length;
    const newTag: TagInfo = {
      id: tagId,
      name: newTagName.trim(),
      color: customTagColors[colorIndex],
    };
    setAvailableTags(prev => [...prev, newTag]);
    setNewTagName('');
    setShowTagCreator(false);
    toast.success(`Etiqueta "${newTag.name}" creada`);
  };

  const deleteCustomTag = (tagId: string) => {
    // Only allow deleting custom tags (not default ones)
    if (defaultTags.some(t => t.id === tagId)) {
      toast.error('No se pueden eliminar etiquetas del sistema');
      return;
    }
    setAvailableTags(prev => prev.filter(t => t.id !== tagId));
    setSelectedTagFilters(prev => prev.filter(t => t !== tagId));
    // Remove tag from all processes
    setProcesses(prev => prev.map(p => ({
      ...p,
      tags: p.tags.filter(t => t !== tagId)
    })));
    toast.success('Etiqueta eliminada');
  };

  const filteredProcesses = processes.filter((p) => {
    // Search filter
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Tags filter
    const matchesTags = selectedTagFilters.length === 0 || 
                        selectedTagFilters.some(tag => p.tags.includes(tag));
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;

    return matchesSearch && matchesTags && matchesStatus;
  });

  const getTagInfo = (tagId: string) => {
    return availableTags.find(t => t.id === tagId) || { id: tagId, name: tagId, color: 'bg-muted text-muted-foreground' };
  };

  const handleViewProcess = (process: Process) => {
    setSelectedProcess(process);
    setShowViewer(true);
  };

  const handleEditProcess = (process: Process) => {
    setSelectedProcess(process);
    setShowEditor(true);
  };

  const handleDeleteProcess = (process: Process) => {
    setProcesses(prev => prev.filter(p => p.id !== process.id));
    toast.success(`Proceso "${process.name}" eliminado`);
  };

  const activeFiltersCount = selectedTagFilters.length + (statusFilter !== 'all' ? 1 : 0);

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
        <div className="relative">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
          >
            <Filter className="w-4 h-4" />
            Filtrar
            {activeFiltersCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-primary text-primary-foreground">
                {activeFiltersCount}
              </span>
            )}
            <ChevronDown className={cn("w-4 h-4 transition-transform", showFilterDropdown && "rotate-180")} />
          </Button>

          {/* Filter Dropdown */}
          {showFilterDropdown && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-card border border-border rounded-xl shadow-lg z-50 p-4 space-y-4">
              {/* Status Filter */}
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Estado</p>
                <div className="flex gap-2">
                  {[
                    { value: 'all', label: 'Todos' },
                    { value: 'published', label: 'Publicados' },
                    { value: 'draft', label: 'Borradores' },
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => setStatusFilter(option.value as typeof statusFilter)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-sm transition-colors",
                        statusFilter === option.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags Filter */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-foreground">Etiquetas</p>
                  <button
                    onClick={() => setShowTagCreator(!showTagCreator)}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Nueva
                  </button>
                </div>

                {/* Tag Creator */}
                {showTagCreator && (
                  <div className="flex gap-2 mb-3">
                    <Input
                      placeholder="Nombre de etiqueta..."
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      className="h-8 text-xs"
                      onKeyDown={(e) => e.key === 'Enter' && createCustomTag()}
                    />
                    <Button size="sm" className="h-8 px-2" onClick={createCustomTag}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {availableTags.map(tag => {
                    const isCustom = !defaultTags.some(t => t.id === tag.id);
                    return (
                      <div key={tag.id} className="relative group">
                        <button
                          onClick={() => toggleTagFilter(tag.id)}
                          className={cn(
                            "px-2.5 py-1 rounded-full text-xs font-medium transition-all",
                            selectedTagFilters.includes(tag.id)
                              ? tag.color + " ring-2 ring-offset-2 ring-offset-card ring-primary"
                              : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                          )}
                        >
                          {tag.name}
                        </button>
                        {isCustom && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteCustomTag(tag.id);
                            }}
                            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Clear Filters */}
              {activeFiltersCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full text-muted-foreground"
                  onClick={clearFilters}
                >
                  <X className="w-4 h-4 mr-2" />
                  Limpiar filtros
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {(selectedTagFilters.length > 0 || statusFilter !== 'all') && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Filtros activos:</span>
          {statusFilter !== 'all' && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-secondary text-foreground flex items-center gap-1">
              {statusFilter === 'published' ? 'Publicados' : 'Borradores'}
              <button onClick={() => setStatusFilter('all')} className="hover:text-destructive">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedTagFilters.map(tagId => {
            const tag = getTagInfo(tagId);
            return (
              <span 
                key={tagId} 
                className={cn("px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1", tag.color)}
              >
                {tag.name}
                <button onClick={() => toggleTagFilter(tagId)} className="hover:opacity-70">
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
          <button 
            onClick={clearFilters}
            className="text-xs text-primary hover:underline"
          >
            Limpiar todo
          </button>
        </div>
      )}

      {/* Processes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProcesses.map((process) => (
          <div
            key={process.id}
            className="kpi-card hover:border-primary/30 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground">{process.name}</h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {process.description}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1 rounded hover:bg-secondary shrink-0">
                    <MoreVertical className="w-4 h-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card border border-border">
                  <DropdownMenuItem onClick={() => handleViewProcess(process)}>
                    <Eye className="w-4 h-4 mr-2" />
                    Ver proceso
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleEditProcess(process)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={() => handleDeleteProcess(process)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Tags */}
            {process.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {process.tags.map(tagId => {
                  const tag = getTagInfo(tagId);
                  return (
                    <span 
                      key={tagId} 
                      className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium", tag.color)}
                    >
                      {tag.name}
                    </span>
                  );
                })}
              </div>
            )}

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

            {/* Quick Actions */}
            <div className="mt-4 flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 gap-1"
                onClick={() => handleViewProcess(process)}
              >
                <Eye className="w-3 h-3" />
                Ver
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 gap-1"
                onClick={() => handleEditProcess(process)}
              >
                <Edit className="w-3 h-3" />
                Editar
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredProcesses.length === 0 && (
        <div className="text-center py-12">
          <Tag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No se encontraron procesos</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || selectedTagFilters.length > 0 || statusFilter !== 'all'
              ? 'Prueba ajustando los filtros de búsqueda'
              : 'Crea tu primer proceso para comenzar'}
          </p>
          {(searchQuery || selectedTagFilters.length > 0 || statusFilter !== 'all') && (
            <Button variant="outline" onClick={clearFilters}>
              Limpiar filtros
            </Button>
          )}
        </div>
      )}

      {/* Click outside to close filter dropdown */}
      {showFilterDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowFilterDropdown(false)} 
        />
      )}

      {/* Process Creator Modal */}
      <ProcessCreatorModal
        open={showCreator}
        onClose={() => setShowCreator(false)}
      />

      {/* Process Viewer Modal */}
      {showViewer && selectedProcess && (
        <ProcessViewerModal 
          process={selectedProcess}
          onClose={() => {
            setShowViewer(false);
            setSelectedProcess(null);
          }}
        />
      )}

      {/* Process Editor Modal */}
      {showEditor && selectedProcess && (
        <ProcessEditorModal
          process={selectedProcess}
          onClose={() => {
            setShowEditor(false);
            setSelectedProcess(null);
          }}
          onSave={(updatedProcess) => {
            toast.success(`Proceso "${updatedProcess.name}" actualizado`);
            setShowEditor(false);
            setSelectedProcess(null);
          }}
        />
      )}
    </div>
  );
};

// Process Viewer Modal for Admin
const ProcessViewerModal: React.FC<{ process: Process; onClose: () => void }> = ({
  process,
  onClose,
}) => {
  const getTagInfoLocal = (tagId: string) => {
    return defaultTags.find(t => t.id === tagId) || { id: tagId, name: tagId, color: 'bg-muted text-muted-foreground' };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl mx-4 bg-card border border-border rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-border bg-card">
          <h2 className="text-xl font-semibold text-foreground">{process.name}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Plus className="w-5 h-5 rotate-45" />
          </Button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Tags */}
          {process.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {process.tags.map(tagId => {
                const tag = getTagInfoLocal(tagId);
                return (
                  <span 
                    key={tagId} 
                    className={cn("px-3 py-1 rounded-full text-xs font-medium", tag.color)}
                  >
                    {tag.name}
                  </span>
                );
              })}
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Descripción</h3>
            <p className="text-foreground">{process.description}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-secondary/50">
              <p className="text-sm text-muted-foreground">Pasos</p>
              <p className="text-2xl font-bold text-foreground">{process.steps}</p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/50">
              <p className="text-sm text-muted-foreground">Cumplimiento</p>
              <p className="text-2xl font-bold text-foreground">{process.compliance}%</p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-secondary/50">
            <p className="text-sm text-muted-foreground mb-1">Estado</p>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              process.status === 'published'
                ? 'bg-success/20 text-success'
                : 'bg-warning/20 text-warning'
            }`}>
              {process.status === 'published' ? 'Publicado' : 'Borrador'}
            </span>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cerrar
            </Button>
            <Button variant="hero" className="flex-1 gap-2">
              <Play className="w-4 h-4" />
              Vista previa
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProcesses;

export { defaultTags };