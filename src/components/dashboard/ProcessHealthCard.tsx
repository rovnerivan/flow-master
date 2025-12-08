import React from 'react';
import { AlertTriangle, CheckCircle, Clock, User, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RiskLevel, riskLevelConfig, ProcessFrequency, frequencyConfig } from '@/lib/processTypes';

interface ProcessHealthProps {
  name: string;
  completionRate: number;
  confusionRate: number;
  status: 'healthy' | 'warning' | 'critical';
  lastUpdated: string;
  // Phase 1 additions
  owner?: string;
  riskLevel?: RiskLevel;
  frequency?: ProcessFrequency;
}

export const ProcessHealthCard: React.FC<ProcessHealthProps> = ({
  name,
  completionRate,
  confusionRate,
  status,
  lastUpdated,
  owner,
  riskLevel = 'low',
  frequency,
}) => {
  const statusConfig = {
    healthy: {
      icon: CheckCircle,
      color: 'text-success',
      bg: 'bg-success/10',
      border: 'border-success/20',
    },
    warning: {
      icon: AlertTriangle,
      color: 'text-warning',
      bg: 'bg-warning/10',
      border: 'border-warning/20',
    },
    critical: {
      icon: AlertTriangle,
      color: 'text-destructive',
      bg: 'bg-destructive/10',
      border: 'border-destructive/20',
    },
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;
  const riskConfig = riskLevelConfig[riskLevel];

  return (
    <div
      className={cn(
        'p-4 rounded-xl border bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/30',
        config.border
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground mb-1 line-clamp-1">
            {name}
          </h4>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{lastUpdated}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Risk Level Badge */}
          <div className={cn(
            "px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1",
            riskConfig.bgColor, riskConfig.color
          )}>
            <Shield className="w-3 h-3" />
            {riskConfig.label}
          </div>
          <div className={cn('p-2 rounded-lg', config.bg)}>
            <StatusIcon className={cn('w-4 h-4', config.color)} />
          </div>
        </div>
      </div>

      {/* Owner and Frequency */}
      {(owner || frequency) && (
        <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
          {owner && (
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{owner}</span>
            </div>
          )}
          {frequency && (
            <span className="px-1.5 py-0.5 rounded bg-secondary text-xs">
              {frequencyConfig[frequency].label}
            </span>
          )}
        </div>
      )}

      <div className="space-y-3">
        {/* Completion Rate */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Completado</span>
            <span className="font-medium text-foreground">{completionRate}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        {/* Clarity Score / Confusion Rate */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Claridad</span>
            <span className={cn(
              "font-medium",
              confusionRate > 30 ? "text-warning" : "text-foreground"
            )}>
              {100 - confusionRate}%
              {confusionRate > 30 && (
                <span className="ml-1 text-warning">⚠️</span>
              )}
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                confusionRate > 30 ? 'bg-warning' : 'bg-success'
              )}
              style={{ width: `${100 - confusionRate}%` }}
            />
          </div>
          {confusionRate > 30 && (
            <p className="text-xs text-warning mt-1">
              Alta tasa de "no entendí" - revisar contenido
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
