import React, { useState } from 'react';
import { 
  Plus, 
  Target, 
  Compass, 
  Rocket, 
  CheckSquare,
  TrendingUp,
  BarChart3,
  Filter,
  LayoutGrid,
  List
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { HierarchyFilter, HierarchySelection } from '@/components/admin/HierarchyFilter';
import { DateRangeFilter, useDateRangeFilter } from '@/components/filters/DateRangeFilter';
import { PlanningTreeView } from '@/components/planning/PlanningTreeView';
import { BirdEyeView } from '@/components/planning/BirdEyeView';
import { 
  PlanningItem, 
  PlanningLevel, 
  PlanningStatus,
  planningLevelConfig, 
  planningStatusConfig,
  buildPlanningTree,
  getChildLevel
} from '@/lib/planningTypes';

// Mock data for demonstration
const mockPlanningItems: PlanningItem[] = [
  {
    id: 's1',
    teamId: 't1',
    parentId: null,
    level: 'strategy',
    name: 'Liderazgo en experiencia del cliente',
    description: 'Convertirnos en referentes de experiencia del cliente en nuestra industria',
    status: 'active',
    progressPercentage: 45,
    orderIndex: 0,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
    color: '#8b5cf6',
  },
  {
    id: 'o1',
    teamId: 't1',
    parentId: 's1',
    level: 'objective',
    name: 'Reducir tiempo de respuesta a clientes',
    description: 'Disminuir el tiempo promedio de respuesta a menos de 2 horas',
    status: 'active',
    progressPercentage: 60,
    targetValue: 2,
    currentValue: 3.5,
    unit: 'horas',
    orderIndex: 0,
    createdAt: '2024-01-02',
    updatedAt: '2024-01-15',
  },
  {
    id: 'i1',
    teamId: 't1',
    parentId: 'o1',
    level: 'initiative',
    name: 'Implementar sistema de tickets automatizado',
    description: 'Configurar y desplegar sistema de gestión de tickets con IA',
    status: 'active',
    progressPercentage: 75,
    orderIndex: 0,
    createdAt: '2024-01-05',
    updatedAt: '2024-01-15',
    linkedTasks: [{ id: 't1', name: 'Configurar software de tickets' }],
  },
  {
    id: 'a1',
    teamId: 't1',
    parentId: 'i1',
    level: 'action',
    name: 'Capacitar equipo en nuevo sistema',
    description: 'Entrenar a todo el equipo de soporte en el uso del nuevo sistema',
    status: 'completed',
    progressPercentage: 100,
    orderIndex: 0,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-14',
  },
  {
    id: 'a2',
    teamId: 't1',
    parentId: 'i1',
    level: 'action',
    name: 'Migrar tickets existentes',
    description: 'Transferir historial de tickets al nuevo sistema',
    status: 'active',
    progressPercentage: 50,
    orderIndex: 1,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
  },
  {
    id: 'o2',
    teamId: 't1',
    parentId: 's1',
    level: 'objective',
    name: 'Aumentar satisfacción del cliente a 95%',
    description: 'Lograr un NPS de 95 o superior',
    status: 'active',
    progressPercentage: 30,
    targetValue: 95,
    currentValue: 82,
    unit: 'NPS',
    orderIndex: 1,
    createdAt: '2024-01-02',
    updatedAt: '2024-01-15',
  },
  {
    id: 's2',
    teamId: 't1',
    parentId: null,
    level: 'strategy',
    name: 'Eficiencia operacional',
    description: 'Optimizar procesos internos para reducir costos y tiempos',
    status: 'active',
    progressPercentage: 35,
    orderIndex: 1,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
    color: '#3b82f6',
  },
  {
    id: 'o3',
    teamId: 't1',
    parentId: 's2',
    level: 'objective',
    name: 'Automatizar 50% de procesos repetitivos',
    description: 'Identificar y automatizar tareas manuales recurrentes',
    status: 'active',
    progressPercentage: 35,
    targetValue: 50,
    currentValue: 17.5,
    unit: '%',
    orderIndex: 0,
    createdAt: '2024-01-03',
    updatedAt: '2024-01-15',
    linkedProcesses: [{ id: 'p1', name: 'Proceso de facturación' }],
  },
];

type ViewMode = 'tree' | 'birdeye';

const AdminPlanning: React.FC = () => {
  const [items, setItems] = useState<PlanningItem[]>(mockPlanningItems);
  const [hierarchyFilter, setHierarchyFilter] = useState<HierarchySelection>({ level: 'all' });
  const { dateRange, setDateRange } = useDateRangeFilter(90);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<PlanningItem | null>(null);
  const [parentForNew, setParentForNew] = useState<PlanningItem | null>(null);
  const [filterLevel, setFilterLevel] = useState<PlanningLevel | 'all'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('birdeye');

  // Build tree structure
  const filteredItems = items.filter(item => {
    if (filterLevel !== 'all' && item.level !== filterLevel) return false;
    return true;
  });
  const treeItems = buildPlanningTree(filterLevel === 'all' ? items : filteredItems);

  // Stats
  const totalStrategies = items.filter(i => i.level === 'strategy').length;
  const totalObjectives = items.filter(i => i.level === 'objective').length;
  const totalInitiatives = items.filter(i => i.level === 'initiative').length;
  const totalActions = items.filter(i => i.level === 'action').length;
  const avgProgress = items.length > 0 
    ? Math.round(items.reduce((sum, i) => sum + i.progressPercentage, 0) / items.length)
    : 0;

  const handleEdit = (item: PlanningItem) => {
    setEditingItem(item);
    setParentForNew(null);
    setShowModal(true);
  };

  const handleDelete = (item: PlanningItem) => {
    // In production, this would be an API call
    setItems(prev => prev.filter(i => i.id !== item.id && i.parentId !== item.id));
    toast.success(`${planningLevelConfig[item.level].label} eliminado`);
  };

  const handleAddChild = (parent: PlanningItem) => {
    setParentForNew(parent);
    setEditingItem(null);
    setShowModal(true);
  };

  const handleAddNew = (level: PlanningLevel) => {
    setParentForNew(null);
    setEditingItem({ level } as PlanningItem);
    setShowModal(true);
  };

  const handleLinkTask = (item: PlanningItem) => {
    toast.info('Vinculación de tareas próximamente');
  };

  const handleLinkProcess = (item: PlanningItem) => {
    toast.info('Vinculación de procesos próximamente');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestión Estratégica</h1>
          <p className="text-muted-foreground">
            Planifica, organiza y controla desde la estrategia hasta la acción
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleAddNew('strategy')}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Estrategia
          </Button>
        </div>
      </div>

      {/* Filters and View Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <DateRangeFilter
            value={dateRange}
            onChange={setDateRange}
            showComparison={false}
          />
          <Select 
            value={filterLevel} 
            onValueChange={(v) => setFilterLevel(v as PlanningLevel | 'all')}
          >
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filtrar por nivel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los niveles</SelectItem>
              <SelectItem value="strategy">Solo Estrategias</SelectItem>
              <SelectItem value="objective">Solo Objetivos</SelectItem>
              <SelectItem value="initiative">Solo Iniciativas</SelectItem>
              <SelectItem value="action">Solo Acciones</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-secondary/50">
          <Button
            variant={viewMode === 'birdeye' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('birdeye')}
            className="gap-2"
          >
            <LayoutGrid className="w-4 h-4" />
            Vista de pájaro
          </Button>
          <Button
            variant={viewMode === 'tree' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('tree')}
            className="gap-2"
          >
            <List className="w-4 h-4" />
            Árbol jerárquico
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="kpi-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Compass className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalStrategies}</p>
              <p className="text-sm text-muted-foreground">Estrategias</p>
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Target className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalObjectives}</p>
              <p className="text-sm text-muted-foreground">Objetivos</p>
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Rocket className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalInitiatives}</p>
              <p className="text-sm text-muted-foreground">Iniciativas</p>
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <CheckSquare className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalActions}</p>
              <p className="text-sm text-muted-foreground">Acciones</p>
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{avgProgress}%</p>
              <p className="text-sm text-muted-foreground">Progreso global</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main View */}
      {viewMode === 'birdeye' ? (
        <BirdEyeView
          items={treeItems}
          onItemClick={handleEdit}
        />
      ) : (
        <div className="kpi-card">
          <PlanningTreeView
            items={treeItems}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddChild={handleAddChild}
            onLinkTask={handleLinkTask}
            onLinkProcess={handleLinkProcess}
          />
        </div>
      )}

      {/* Planning Item Modal */}
      {showModal && (
        <PlanningItemModal
          item={editingItem}
          parentItem={parentForNew}
          onClose={() => {
            setShowModal(false);
            setEditingItem(null);
            setParentForNew(null);
          }}
          onSave={(item) => {
            if (editingItem?.id) {
              setItems(prev => prev.map(i => i.id === item.id ? item : i));
              toast.success(`${planningLevelConfig[item.level].label} actualizado`);
            } else {
              setItems(prev => [...prev, item]);
              toast.success(`${planningLevelConfig[item.level].label} creado`);
            }
            setShowModal(false);
            setEditingItem(null);
            setParentForNew(null);
          }}
        />
      )}
    </div>
  );
};

// Modal for creating/editing planning items
interface PlanningItemModalProps {
  item: PlanningItem | null;
  parentItem: PlanningItem | null;
  onClose: () => void;
  onSave: (item: PlanningItem) => void;
}

const PlanningItemModal: React.FC<PlanningItemModalProps> = ({
  item,
  parentItem,
  onClose,
  onSave,
}) => {
  const isEditing = item?.id != null;
  const level: PlanningLevel = parentItem 
    ? getChildLevel(parentItem.level)! 
    : (item?.level || 'strategy');

  const [formData, setFormData] = useState({
    name: item?.name || '',
    description: item?.description || '',
    status: item?.status || 'draft',
    startDate: item?.startDate || '',
    endDate: item?.endDate || '',
    targetValue: item?.targetValue?.toString() || '',
    unit: item?.unit || '',
  });

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    const newItem: PlanningItem = {
      id: item?.id || `${level}-${Date.now()}`,
      teamId: item?.teamId || 't1',
      parentId: parentItem?.id || item?.parentId || null,
      level,
      name: formData.name,
      description: formData.description,
      status: formData.status as PlanningStatus,
      startDate: formData.startDate || undefined,
      endDate: formData.endDate || undefined,
      targetValue: formData.targetValue ? parseFloat(formData.targetValue) : undefined,
      unit: formData.unit || undefined,
      progressPercentage: item?.progressPercentage || 0,
      orderIndex: item?.orderIndex || 0,
      createdAt: item?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(newItem);
  };

  const config = planningLevelConfig[level];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg mx-4 bg-card border border-border rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-1">
          {isEditing ? `Editar ${config.label}` : `Nueva ${config.label}`}
        </h3>
        {parentItem && (
          <p className="text-sm text-muted-foreground mb-4">
            Bajo: {parentItem.name}
          </p>
        )}

        <div className="space-y-4 mt-4">
          <div>
            <Label>Nombre *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder={`Nombre de la ${config.label.toLowerCase()}`}
            />
          </div>

          <div>
            <Label>Descripción</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descripción detallada"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Estado</Label>
              <Select 
                value={formData.status} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, status: v as PlanningStatus }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(planningStatusConfig).map(([key, val]) => (
                    <SelectItem key={key} value={key}>{val.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Fecha inicio</Label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div>
              <Label>Fecha fin</Label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
          </div>

          {(level === 'objective' || level === 'initiative') && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Meta/Objetivo (número)</Label>
                <Input
                  type="number"
                  value={formData.targetValue}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetValue: e.target.value }))}
                  placeholder="Ej: 100"
                />
              </div>
              <div>
                <Label>Unidad</Label>
                <Input
                  value={formData.unit}
                  onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                  placeholder="Ej: %, horas, clientes"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button variant="hero" onClick={handleSubmit} className="flex-1">
            {isEditing ? 'Guardar cambios' : 'Crear'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminPlanning;
