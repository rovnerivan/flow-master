// Types for strategic planning system
export type PlanningLevel = 'strategy' | 'objective' | 'initiative' | 'action';
export type PlanningStatus = 'draft' | 'active' | 'completed' | 'on_hold' | 'cancelled' | 'not_achieved';

export interface PlanningItem {
  id: string;
  teamId: string;
  parentId: string | null;
  level: PlanningLevel;
  name: string;
  description?: string;
  status: PlanningStatus;
  ownerId?: string;
  ownerName?: string;
  startDate?: string;
  endDate?: string;
  progressPercentage: number;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  color?: string;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  // Computed for tree view
  children?: PlanningItem[];
  linkedTasks?: { id: string; name: string }[];
  linkedProcesses?: { id: string; name: string }[];
}

export const planningLevelConfig: Record<PlanningLevel, {
  label: string;
  labelPlural: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
}> = {
  strategy: {
    label: 'Estrategia',
    labelPlural: 'Estrategias',
    description: 'Dirección de largo plazo y visión organizacional',
    icon: 'Compass',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  objective: {
    label: 'Objetivo',
    labelPlural: 'Objetivos',
    description: 'Metas específicas y medibles derivadas de la estrategia',
    icon: 'Target',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  initiative: {
    label: 'Iniciativa',
    labelPlural: 'Iniciativas',
    description: 'Proyectos o programas para lograr los objetivos',
    icon: 'Rocket',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  action: {
    label: 'Acción',
    labelPlural: 'Acciones',
    description: 'Tareas específicas y ejecutables',
    icon: 'CheckSquare',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
};

export const planningStatusConfig: Record<PlanningStatus, {
  label: string;
  description: string;
  color: string;
  bgColor: string;
  icon: string;
}> = {
  draft: {
    label: 'Borrador',
    description: 'En preparación, aún no iniciado',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
    icon: 'FileEdit',
  },
  active: {
    label: 'Activo',
    description: 'En progreso actualmente',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    icon: 'Play',
  },
  completed: {
    label: 'Completado',
    description: 'Logrado exitosamente (incluso prematuramente)',
    color: 'text-success',
    bgColor: 'bg-success/10',
    icon: 'CheckCircle',
  },
  on_hold: {
    label: 'En pausa',
    description: 'Temporalmente detenido',
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    icon: 'Pause',
  },
  not_achieved: {
    label: 'No alcanzado',
    description: 'No se logró el objetivo esperado',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    icon: 'XCircle',
  },
  cancelled: {
    label: 'Abandonado',
    description: 'Descartado o abandonado definitivamente',
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    icon: 'Ban',
  },
};

// Helper to get child level
export const getChildLevel = (level: PlanningLevel): PlanningLevel | null => {
  const hierarchy: PlanningLevel[] = ['strategy', 'objective', 'initiative', 'action'];
  const currentIndex = hierarchy.indexOf(level);
  if (currentIndex < hierarchy.length - 1) {
    return hierarchy[currentIndex + 1];
  }
  return null;
};

// Helper to get parent level
export const getParentLevel = (level: PlanningLevel): PlanningLevel | null => {
  const hierarchy: PlanningLevel[] = ['strategy', 'objective', 'initiative', 'action'];
  const currentIndex = hierarchy.indexOf(level);
  if (currentIndex > 0) {
    return hierarchy[currentIndex - 1];
  }
  return null;
};

// Build tree structure from flat array
export const buildPlanningTree = (items: PlanningItem[]): PlanningItem[] => {
  const itemMap = new Map<string, PlanningItem>();
  const roots: PlanningItem[] = [];

  // First pass: create map with children arrays
  items.forEach(item => {
    itemMap.set(item.id, { ...item, children: [] });
  });

  // Second pass: build tree
  items.forEach(item => {
    const node = itemMap.get(item.id)!;
    if (item.parentId && itemMap.has(item.parentId)) {
      itemMap.get(item.parentId)!.children!.push(node);
    } else if (!item.parentId) {
      roots.push(node);
    }
  });

  // Sort children by orderIndex
  const sortChildren = (node: PlanningItem) => {
    if (node.children) {
      node.children.sort((a, b) => a.orderIndex - b.orderIndex);
      node.children.forEach(sortChildren);
    }
  };
  roots.sort((a, b) => a.orderIndex - b.orderIndex);
  roots.forEach(sortChildren);

  return roots;
};

// Calculate aggregated progress from children
export const calculateAggregatedProgress = (item: PlanningItem): number => {
  if (!item.children || item.children.length === 0) {
    return item.progressPercentage;
  }
  const totalProgress = item.children.reduce((sum, child) => {
    return sum + calculateAggregatedProgress(child);
  }, 0);
  return Math.round(totalProgress / item.children.length);
};
