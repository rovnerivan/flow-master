import React, { useState } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  Plus, 
  MoreVertical, 
  Target, 
  Compass, 
  Rocket, 
  CheckSquare,
  Link2,
  Edit,
  Trash2,
  Users,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  PlanningItem, 
  PlanningLevel,
  planningLevelConfig, 
  planningStatusConfig,
  getChildLevel,
  calculateAggregatedProgress
} from '@/lib/planningTypes';

interface PlanningTreeNodeProps {
  item: PlanningItem;
  depth?: number;
  onEdit: (item: PlanningItem) => void;
  onDelete: (item: PlanningItem) => void;
  onAddChild: (parent: PlanningItem) => void;
  onLinkTask: (item: PlanningItem) => void;
  onLinkProcess: (item: PlanningItem) => void;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
}

const levelIcons: Record<PlanningLevel, React.ReactNode> = {
  strategy: <Compass className="w-4 h-4" />,
  objective: <Target className="w-4 h-4" />,
  initiative: <Rocket className="w-4 h-4" />,
  action: <CheckSquare className="w-4 h-4" />,
};

export const PlanningTreeNode: React.FC<PlanningTreeNodeProps> = ({
  item,
  depth = 0,
  onEdit,
  onDelete,
  onAddChild,
  onLinkTask,
  onLinkProcess,
  expandedIds,
  onToggleExpand,
}) => {
  const hasChildren = item.children && item.children.length > 0;
  const isExpanded = expandedIds.has(item.id);
  const config = planningLevelConfig[item.level];
  const statusConfig = planningStatusConfig[item.status];
  const childLevel = getChildLevel(item.level);
  const aggregatedProgress = calculateAggregatedProgress(item);

  return (
    <div className="select-none">
      <div
        className={cn(
          'group flex items-center gap-2 py-2 px-3 rounded-lg transition-colors',
          'hover:bg-secondary/50 cursor-pointer',
          depth > 0 && 'ml-6 border-l-2 border-border'
        )}
        style={{ paddingLeft: `${depth * 8 + 12}px` }}
      >
        {/* Expand/Collapse button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand(item.id);
          }}
          className={cn(
            'p-1 rounded hover:bg-secondary transition-colors',
            !hasChildren && 'opacity-0 pointer-events-none'
          )}
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        {/* Level icon */}
        <div className={cn('p-1.5 rounded-md', config.bgColor, config.color)}>
          {levelIcons[item.level]}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0" onClick={() => onEdit(item)}>
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground truncate">{item.name}</span>
            <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', statusConfig.bgColor, statusConfig.color)}>
              {statusConfig.label}
            </span>
          </div>
          {item.description && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {item.description}
            </p>
          )}
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 min-w-[120px]">
          <Progress value={aggregatedProgress} className="h-2 flex-1" />
          <span className="text-xs font-medium text-muted-foreground w-10 text-right">
            {aggregatedProgress}%
          </span>
        </div>

        {/* Links count */}
        {(item.linkedTasks?.length || item.linkedProcesses?.length) ? (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Link2 className="w-3 h-3" />
            {(item.linkedTasks?.length || 0) + (item.linkedProcesses?.length || 0)}
          </div>
        ) : null}

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(item)}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </DropdownMenuItem>
            {childLevel && (
              <DropdownMenuItem onClick={() => onAddChild(item)}>
                <Plus className="w-4 h-4 mr-2" />
                Agregar {planningLevelConfig[childLevel].label}
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onLinkTask(item)}>
              <CheckSquare className="w-4 h-4 mr-2" />
              Vincular Tarea
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onLinkProcess(item)}>
              <Link2 className="w-4 h-4 mr-2" />
              Vincular Proceso
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(item)} className="text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="mt-1">
          {item.children!.map((child) => (
            <PlanningTreeNode
              key={child.id}
              item={child}
              depth={depth + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
              onLinkTask={onLinkTask}
              onLinkProcess={onLinkProcess}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface PlanningTreeViewProps {
  items: PlanningItem[];
  onEdit: (item: PlanningItem) => void;
  onDelete: (item: PlanningItem) => void;
  onAddChild: (parent: PlanningItem) => void;
  onLinkTask: (item: PlanningItem) => void;
  onLinkProcess: (item: PlanningItem) => void;
}

export const PlanningTreeView: React.FC<PlanningTreeViewProps> = ({
  items,
  onEdit,
  onDelete,
  onAddChild,
  onLinkTask,
  onLinkProcess,
}) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    // Start with all strategy and objective items expanded
    const expanded = new Set<string>();
    const addExpanded = (items: PlanningItem[]) => {
      items.forEach(item => {
        if (item.level === 'strategy' || item.level === 'objective') {
          expanded.add(item.id);
        }
        if (item.children) {
          addExpanded(item.children);
        }
      });
    };
    addExpanded(items);
    return expanded;
  });

  const handleToggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    const allIds = new Set<string>();
    const addAll = (items: PlanningItem[]) => {
      items.forEach(item => {
        allIds.add(item.id);
        if (item.children) addAll(item.children);
      });
    };
    addAll(items);
    setExpandedIds(allIds);
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="p-4 rounded-full bg-primary/10 mb-4">
          <Compass className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Sin elementos de planificación
        </h3>
        <p className="text-muted-foreground max-w-md">
          Comienza creando una estrategia para definir la dirección de tu organización.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Controls */}
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="sm" onClick={expandAll}>
          Expandir todo
        </Button>
        <Button variant="ghost" size="sm" onClick={collapseAll}>
          Colapsar todo
        </Button>
      </div>

      {/* Tree */}
      {items.map((item) => (
        <PlanningTreeNode
          key={item.id}
          item={item}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddChild={onAddChild}
          onLinkTask={onLinkTask}
          onLinkProcess={onLinkProcess}
          expandedIds={expandedIds}
          onToggleExpand={handleToggleExpand}
        />
      ))}
    </div>
  );
};

export default PlanningTreeView;
