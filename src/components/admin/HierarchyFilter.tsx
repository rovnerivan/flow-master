import React, { useState } from 'react';
import { Building2, Users, User, ChevronDown, Network, Layers, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type HierarchyLevel = 'all' | 'vertical' | 'management' | 'department' | 'individual';

export interface HierarchySelection {
  level: HierarchyLevel;
  selectedId?: string;
}

export interface HierarchyOption {
  id: string;
  name: string;
  type: 'vertical' | 'management' | 'department' | 'employee';
  children?: HierarchyOption[];
}

// Mock organizational structure - in production this would come from DB
export const mockHierarchy: HierarchyOption[] = [
  {
    id: 'v1',
    name: 'Operaciones',
    type: 'vertical',
    children: [
      {
        id: 'm1',
        name: 'Gerencia de Almacén',
        type: 'management',
        children: [
          {
            id: 'd1',
            name: 'Depto. Recepción',
            type: 'department',
            children: [
              { id: 'e1', name: 'Carlos López', type: 'employee' },
              { id: 'e2', name: 'Ana Martínez', type: 'employee' },
            ]
          },
          {
            id: 'd2',
            name: 'Depto. Despacho',
            type: 'department',
            children: [
              { id: 'e3', name: 'Pedro Sánchez', type: 'employee' },
            ]
          }
        ]
      },
      {
        id: 'm2',
        name: 'Gerencia de Producción',
        type: 'management',
        children: [
          {
            id: 'd3',
            name: 'Depto. Ensamblaje',
            type: 'department',
            children: [
              { id: 'e4', name: 'Laura García', type: 'employee' },
              { id: 'e5', name: 'Miguel Torres', type: 'employee' },
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'v2',
    name: 'Comercial',
    type: 'vertical',
    children: [
      {
        id: 'm3',
        name: 'Gerencia de Ventas',
        type: 'management',
        children: [
          {
            id: 'd4',
            name: 'Depto. Retail',
            type: 'department',
            children: [
              { id: 'e6', name: 'María Fernández', type: 'employee' },
              { id: 'e7', name: 'Roberto Díaz', type: 'employee' },
            ]
          }
        ]
      },
      {
        id: 'm4',
        name: 'Gerencia de Marketing',
        type: 'management',
        children: [
          {
            id: 'd5',
            name: 'Depto. Digital',
            type: 'department',
            children: [
              { id: 'e8', name: 'Sofia Ruiz', type: 'employee' },
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'v3',
    name: 'Finanzas',
    type: 'vertical',
    children: [
      {
        id: 'm5',
        name: 'Gerencia de Contabilidad',
        type: 'management',
        children: [
          {
            id: 'd6',
            name: 'Depto. Tesorería',
            type: 'department',
            children: [
              { id: 'e9', name: 'Andrea Morales', type: 'employee' },
            ]
          }
        ]
      }
    ]
  }
];

// Helper function to get all IDs under a hierarchy node
export const getHierarchyIds = (nodeId: string, hierarchy: HierarchyOption[] = mockHierarchy): string[] => {
  const ids: string[] = [];
  
  const findAndCollect = (nodes: HierarchyOption[], collecting: boolean): boolean => {
    for (const node of nodes) {
      const shouldCollect = collecting || node.id === nodeId;
      
      if (shouldCollect) {
        ids.push(node.id);
      }
      
      if (node.children) {
        if (node.id === nodeId) {
          // Found the target, collect all children
          findAndCollect(node.children, true);
          return true;
        } else if (findAndCollect(node.children, shouldCollect)) {
          return true;
        }
      }
      
      if (node.id === nodeId) {
        return true;
      }
    }
    return false;
  };
  
  findAndCollect(hierarchy, false);
  return ids;
};

// Helper to check if an item matches the hierarchy filter
export const matchesHierarchyFilter = (
  filter: HierarchySelection,
  itemHierarchy: { verticalId?: string; managementId?: string; departmentId?: string; employeeId?: string }
): boolean => {
  if (filter.level === 'all') return true;
  if (!filter.selectedId) return true;
  
  const selectedIds = getHierarchyIds(filter.selectedId);
  
  // Check if any of the item's hierarchy IDs match
  const itemIds = [
    itemHierarchy.verticalId,
    itemHierarchy.managementId,
    itemHierarchy.departmentId,
    itemHierarchy.employeeId,
  ].filter(Boolean) as string[];
  
  return itemIds.some(id => selectedIds.includes(id));
};

interface HierarchyFilterProps {
  value: HierarchySelection;
  onChange: (selection: HierarchySelection) => void;
  // If true, only show subordinates of current user (for supervisor view)
  restrictToSubordinates?: boolean;
  className?: string;
}

const levelConfig: Record<HierarchyLevel, { label: string; icon: React.ElementType; color: string }> = {
  all: { label: 'Toda la organización', icon: Building2, color: 'bg-primary/20 text-primary' },
  vertical: { label: 'Por vertical', icon: Layers, color: 'bg-purple-500/20 text-purple-400' },
  management: { label: 'Por gerencia', icon: Network, color: 'bg-cyan-500/20 text-cyan-400' },
  department: { label: 'Por departamento', icon: Users, color: 'bg-success/20 text-success' },
  individual: { label: 'Individual', icon: UserCircle, color: 'bg-warning/20 text-warning' },
};

// Helper to get options for a specific level
const getOptionsForLevel = (level: HierarchyLevel): HierarchyOption[] => {
  const flattenByType = (nodes: HierarchyOption[], type: string): HierarchyOption[] => {
    const result: HierarchyOption[] = [];
    const traverse = (items: HierarchyOption[]) => {
      for (const item of items) {
        if (item.type === type) {
          result.push(item);
        }
        if (item.children) {
          traverse(item.children);
        }
      }
    };
    traverse(nodes);
    return result;
  };

  switch (level) {
    case 'vertical':
      return mockHierarchy;
    case 'management':
      return flattenByType(mockHierarchy, 'management');
    case 'department':
      return flattenByType(mockHierarchy, 'department');
    case 'individual':
      return flattenByType(mockHierarchy, 'employee');
    default:
      return [];
  }
};

export const HierarchyFilter: React.FC<HierarchyFilterProps> = ({
  value,
  onChange,
  restrictToSubordinates = false,
  className,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [expandedLevel, setExpandedLevel] = useState<HierarchyLevel | null>(null);

  const handleOptionSelect = (level: HierarchyLevel, id: string) => {
    onChange({ level, selectedId: id });
    setShowDropdown(false);
    setExpandedLevel(null);
  };

  const getSelectedLabel = (): string => {
    if (value.level === 'all') return 'Toda la organización';
    if (!value.selectedId) return levelConfig[value.level].label;
    
    const options = getOptionsForLevel(value.level);
    const selected = options.find(o => o.id === value.selectedId);
    return selected?.name || levelConfig[value.level].label;
  };

  return (
    <div className={cn("relative", className)}>
      {/* Main filter buttons - tag style */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(levelConfig).map(([level, config]) => {
          const Icon = config.icon;
          const isActive = value.level === level;
          const hasSelection = isActive && value.selectedId;
          
          return (
            <div key={level} className="relative">
              <button
                onClick={() => {
                  if (level === 'all') {
                    onChange({ level: 'all' });
                    setShowDropdown(false);
                    setExpandedLevel(null);
                  } else {
                    setShowDropdown(true);
                    setExpandedLevel(level as HierarchyLevel);
                  }
                }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                  isActive
                    ? config.color + " ring-2 ring-offset-2 ring-offset-background ring-primary/50"
                    : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {hasSelection ? (
                  <span className="max-w-32 truncate">{getSelectedLabel()}</span>
                ) : (
                  config.label
                )}
                {level !== 'all' && (
                  <ChevronDown className={cn(
                    "w-3 h-3 transition-transform",
                    showDropdown && expandedLevel === level && "rotate-180"
                  )} />
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Dropdown for selecting specific item within level */}
      {showDropdown && expandedLevel && expandedLevel !== 'all' && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => {
              setShowDropdown(false);
              setExpandedLevel(null);
            }} 
          />
          <div className="absolute left-0 top-full mt-2 z-50 w-72 max-h-80 overflow-y-auto bg-card border border-border rounded-xl shadow-lg p-2">
            <p className="text-xs text-muted-foreground px-2 py-1.5 border-b border-border mb-2">
              Seleccionar {levelConfig[expandedLevel].label.toLowerCase()}
            </p>
            {getOptionsForLevel(expandedLevel).map((option) => {
              const isSelected = value.level === expandedLevel && value.selectedId === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => handleOptionSelect(expandedLevel, option.id)}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center gap-2",
                    isSelected 
                      ? "bg-primary/20 text-primary" 
                      : "hover:bg-secondary text-foreground"
                  )}
                >
                  {expandedLevel === 'individual' ? (
                    <User className="w-4 h-4 text-muted-foreground" />
                  ) : expandedLevel === 'vertical' ? (
                    <Layers className="w-4 h-4 text-muted-foreground" />
                  ) : expandedLevel === 'management' ? (
                    <Network className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Users className="w-4 h-4 text-muted-foreground" />
                  )}
                  {option.name}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default HierarchyFilter;
