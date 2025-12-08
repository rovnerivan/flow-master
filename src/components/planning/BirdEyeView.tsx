import React from 'react';
import { 
  Compass, 
  Target, 
  Rocket, 
  CheckSquare,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { 
  PlanningItem, 
  PlanningLevel,
  planningLevelConfig, 
  planningStatusConfig,
  calculateAggregatedProgress
} from '@/lib/planningTypes';

interface BirdEyeViewProps {
  items: PlanningItem[];
  onItemClick?: (item: PlanningItem) => void;
}

const levelIcons: Record<PlanningLevel, React.ReactNode> = {
  strategy: <Compass className="w-5 h-5" />,
  objective: <Target className="w-5 h-5" />,
  initiative: <Rocket className="w-5 h-5" />,
  action: <CheckSquare className="w-5 h-5" />,
};

const getTrendIcon = (progress: number) => {
  if (progress >= 70) return <TrendingUp className="w-4 h-4 text-success" />;
  if (progress >= 40) return <Minus className="w-4 h-4 text-warning" />;
  return <TrendingDown className="w-4 h-4 text-destructive" />;
};

const StrategyCard: React.FC<{
  strategy: PlanningItem;
  onItemClick?: (item: PlanningItem) => void;
}> = ({ strategy, onItemClick }) => {
  const progress = calculateAggregatedProgress(strategy);
  const objectives = strategy.children || [];
  const totalInitiatives = objectives.reduce((sum, obj) => sum + (obj.children?.length || 0), 0);
  const totalActions = objectives.reduce((sum, obj) => 
    sum + (obj.children?.reduce((s, init) => s + (init.children?.length || 0), 0) || 0), 0);
  
  const completedObjectives = objectives.filter(o => o.status === 'completed').length;
  const activeObjectives = objectives.filter(o => o.status === 'active').length;
  const atRiskObjectives = objectives.filter(o => 
    o.status === 'active' && calculateAggregatedProgress(o) < 30
  ).length;

  return (
    <div 
      className="kpi-card border-l-4 hover:shadow-lg transition-all cursor-pointer"
      style={{ borderLeftColor: strategy.color || 'hsl(var(--primary))' }}
      onClick={() => onItemClick?.(strategy)}
    >
      {/* Strategy Header */}
      <div className="flex items-start justify-between gap-2 mb-4">
        <div className="flex items-start gap-3 min-w-0">
          <div 
            className="p-2 sm:p-3 rounded-xl flex-shrink-0"
            style={{ backgroundColor: `${strategy.color}20` || 'hsl(var(--primary) / 0.1)' }}
          >
            <Compass 
              className="w-5 h-5 sm:w-6 sm:h-6" 
              style={{ color: strategy.color || 'hsl(var(--primary))' }}
            />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground text-base sm:text-lg break-words">{strategy.name}</h3>
            <span className={cn(
              'inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-1',
              planningStatusConfig[strategy.status].bgColor,
              planningStatusConfig[strategy.status].color
            )}>
              {planningStatusConfig[strategy.status].label}
            </span>
          </div>
        </div>
        <div className="flex-shrink-0">
          {getTrendIcon(progress)}
        </div>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">Progreso global</span>
          <span className="font-semibold text-foreground">{progress}%</span>
        </div>
        <Progress value={progress} className="h-3" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-2 rounded-lg bg-blue-500/10">
          <p className="text-xl font-bold text-blue-500">{objectives.length}</p>
          <p className="text-xs text-muted-foreground">Objetivos</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-green-500/10">
          <p className="text-xl font-bold text-green-500">{totalInitiatives}</p>
          <p className="text-xs text-muted-foreground">Iniciativas</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-orange-500/10">
          <p className="text-xl font-bold text-orange-500">{totalActions}</p>
          <p className="text-xs text-muted-foreground">Acciones</p>
        </div>
      </div>

      {/* Quick Status */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm border-t border-border pt-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success" />
          <span className="text-muted-foreground text-xs sm:text-sm">{completedObjectives} completados</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-muted-foreground text-xs sm:text-sm">{activeObjectives} activos</span>
        </div>
        {atRiskObjectives > 0 && (
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-destructive" />
            <span className="text-destructive text-xs sm:text-sm">{atRiskObjectives} en riesgo</span>
          </div>
        )}
      </div>

      {/* Objectives Preview */}
      {objectives.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Objetivos clave</p>
          {objectives.slice(0, 3).map((obj) => {
            const objProgress = calculateAggregatedProgress(obj);
            return (
              <div 
                key={obj.id}
                className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onItemClick?.(obj);
                }}
              >
                <Target className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-foreground line-clamp-1 flex-1 min-w-0">{obj.name}</span>
                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                  <Progress value={objProgress} className="w-10 sm:w-16 h-1.5" />
                  <span className="text-xs text-muted-foreground w-7 sm:w-8">{objProgress}%</span>
                </div>
              </div>
            );
          })}
          {objectives.length > 3 && (
            <p className="text-xs text-muted-foreground text-center">
              +{objectives.length - 3} más
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export const BirdEyeView: React.FC<BirdEyeViewProps> = ({ items, onItemClick }) => {
  // Filter only strategies (top-level items)
  const strategies = items.filter(item => item.level === 'strategy');
  
  // Calculate global stats
  const allItems = (function flattenItems(items: PlanningItem[]): PlanningItem[] {
    return items.flatMap(item => [item, ...flattenItems(item.children || [])]);
  })(items);
  
  const globalStats = {
    strategies: allItems.filter(i => i.level === 'strategy').length,
    objectives: allItems.filter(i => i.level === 'objective').length,
    initiatives: allItems.filter(i => i.level === 'initiative').length,
    actions: allItems.filter(i => i.level === 'action').length,
    avgProgress: allItems.length > 0 
      ? Math.round(allItems.reduce((sum, i) => sum + i.progressPercentage, 0) / allItems.length)
      : 0,
    completed: allItems.filter(i => i.status === 'completed').length,
    active: allItems.filter(i => i.status === 'active').length,
    atRisk: allItems.filter(i => i.status === 'active' && i.progressPercentage < 30).length,
  };

  if (strategies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="p-4 rounded-full bg-primary/10 mb-4">
          <Compass className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Sin estrategias definidas
        </h3>
        <p className="text-muted-foreground max-w-md">
          Crea tu primera estrategia para comenzar a visualizar el panorama general de tu organización.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Global Summary Bar */}
      <div className="kpi-card bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Main stats */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-foreground">{globalStats.avgProgress}%</p>
                <p className="text-xs text-muted-foreground">Progreso global</p>
              </div>
            </div>
            <div className="hidden sm:block h-10 w-px bg-border" />
            <div className="flex flex-wrap gap-3 sm:gap-6 text-xs sm:text-sm">
              <div>
                <span className="font-semibold text-foreground">{globalStats.completed}</span>
                <span className="text-muted-foreground ml-1">completados</span>
              </div>
              <div>
                <span className="font-semibold text-foreground">{globalStats.active}</span>
                <span className="text-muted-foreground ml-1">en progreso</span>
              </div>
              {globalStats.atRisk > 0 && (
                <div className="flex items-center gap-1 text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-semibold">{globalStats.atRisk}</span>
                  <span>en riesgo</span>
                </div>
              )}
            </div>
          </div>
          {/* Counts */}
          <div className="flex flex-wrap gap-2 sm:gap-4 text-xs text-muted-foreground">
            <span>{globalStats.strategies} estrategias</span>
            <span className="hidden sm:inline">•</span>
            <span>{globalStats.objectives} objetivos</span>
            <span className="hidden sm:inline">•</span>
            <span>{globalStats.initiatives} iniciativas</span>
            <span className="hidden sm:inline">•</span>
            <span>{globalStats.actions} acciones</span>
          </div>
        </div>
      </div>

      {/* Strategy Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {strategies.map((strategy) => (
          <StrategyCard 
            key={strategy.id} 
            strategy={strategy} 
            onItemClick={onItemClick}
          />
        ))}
      </div>
    </div>
  );
};

export default BirdEyeView;