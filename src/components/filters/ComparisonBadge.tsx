import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ComparisonBadgeProps {
  current: number;
  previous: number;
  format?: 'number' | 'percentage' | 'time';
  inverse?: boolean; // For metrics where lower is better (e.g., errors)
  className?: string;
}

export const ComparisonBadge: React.FC<ComparisonBadgeProps> = ({
  current,
  previous,
  format = 'number',
  inverse = false,
  className,
}) => {
  if (previous === 0) {
    if (current === 0) {
      return (
        <span className={cn('inline-flex items-center gap-1 text-xs text-muted-foreground', className)}>
          <Minus className="w-3 h-3" />
          Sin cambio
        </span>
      );
    }
    return (
      <span className={cn('inline-flex items-center gap-1 text-xs text-success', className)}>
        <TrendingUp className="w-3 h-3" />
        +100%
      </span>
    );
  }

  const percentChange = ((current - previous) / previous) * 100;
  const isPositive = percentChange > 0;
  const isNeutral = Math.abs(percentChange) < 1;

  // Determine if change is good or bad
  const isGood = inverse ? !isPositive : isPositive;

  if (isNeutral) {
    return (
      <span className={cn('inline-flex items-center gap-1 text-xs text-muted-foreground', className)}>
        <Minus className="w-3 h-3" />
        Sin cambio
      </span>
    );
  }

  const Icon = isPositive ? TrendingUp : TrendingDown;
  const colorClass = isGood ? 'text-success' : 'text-destructive';

  return (
    <span className={cn('inline-flex items-center gap-1 text-xs', colorClass, className)}>
      <Icon className="w-3 h-3" />
      {isPositive ? '+' : ''}{percentChange.toFixed(1)}%
    </span>
  );
};

interface ComparisonValueProps {
  current: number;
  previous?: number;
  label: string;
  format?: 'number' | 'percentage' | 'time' | 'currency';
  inverse?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export const ComparisonValue: React.FC<ComparisonValueProps> = ({
  current,
  previous,
  label,
  format = 'number',
  inverse = false,
  icon,
  className,
}) => {
  const formatValue = (value: number) => {
    switch (format) {
      case 'percentage':
        return `${value}%`;
      case 'time':
        return `${value}h`;
      case 'currency':
        return `$${value.toLocaleString()}`;
      default:
        return value.toLocaleString();
    }
  };

  return (
    <div className={cn('flex flex-col', className)}>
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-2xl font-bold text-foreground">{formatValue(current)}</span>
        {previous !== undefined && (
          <ComparisonBadge current={current} previous={previous} inverse={inverse} />
        )}
      </div>
      <span className="text-sm text-muted-foreground">{label}</span>
      {previous !== undefined && (
        <span className="text-xs text-muted-foreground mt-1">
          Período anterior: {formatValue(previous)}
        </span>
      )}
    </div>
  );
};

export default ComparisonBadge;
