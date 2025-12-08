import React, { useState } from 'react';
import { Calendar, ChevronDown, ArrowRightLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format, subDays, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, subYears, startOfYear, endOfYear } from 'date-fns';
import { es } from 'date-fns/locale';

export interface DateRange {
  from: Date;
  to: Date;
}

export interface DateRangeSelection {
  primary: DateRange;
  comparison?: DateRange;
}

export type PresetKey = 'today' | '7d' | '30d' | 'this_month' | 'last_month' | '90d' | 'this_year' | 'custom';

interface DateRangeFilterProps {
  value: DateRangeSelection;
  onChange: (value: DateRangeSelection) => void;
  showComparison?: boolean;
  className?: string;
}

const presets: { key: PresetKey; label: string; getRange: () => DateRange }[] = [
  {
    key: 'today',
    label: 'Hoy',
    getRange: () => {
      const today = new Date();
      return { from: today, to: today };
    },
  },
  {
    key: '7d',
    label: 'Últimos 7 días',
    getRange: () => ({
      from: subDays(new Date(), 6),
      to: new Date(),
    }),
  },
  {
    key: '30d',
    label: 'Últimos 30 días',
    getRange: () => ({
      from: subDays(new Date(), 29),
      to: new Date(),
    }),
  },
  {
    key: 'this_month',
    label: 'Este mes',
    getRange: () => ({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    }),
  },
  {
    key: 'last_month',
    label: 'Mes pasado',
    getRange: () => ({
      from: startOfMonth(subMonths(new Date(), 1)),
      to: endOfMonth(subMonths(new Date(), 1)),
    }),
  },
  {
    key: '90d',
    label: 'Últimos 90 días',
    getRange: () => ({
      from: subDays(new Date(), 89),
      to: new Date(),
    }),
  },
  {
    key: 'this_year',
    label: 'Este año',
    getRange: () => ({
      from: startOfYear(new Date()),
      to: endOfYear(new Date()),
    }),
  },
];

// Helper to get automatic comparison period (same duration, previous period)
const getAutoComparisonRange = (primary: DateRange): DateRange => {
  const durationMs = primary.to.getTime() - primary.from.getTime();
  const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24)) + 1;
  return {
    from: subDays(primary.from, durationDays),
    to: subDays(primary.from, 1),
  };
};

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  value,
  onChange,
  showComparison = true,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activePreset, setActivePreset] = useState<PresetKey>('30d');
  const [isSelectingComparison, setIsSelectingComparison] = useState(false);
  const [comparisonMode, setComparisonMode] = useState<'auto' | 'custom' | 'none'>('none');

  const handlePresetClick = (preset: typeof presets[0]) => {
    const newRange = preset.getRange();
    setActivePreset(preset.key);
    
    let comparison: DateRange | undefined = undefined;
    if (comparisonMode === 'auto') {
      comparison = getAutoComparisonRange(newRange);
    } else if (comparisonMode === 'custom' && value.comparison) {
      comparison = value.comparison;
    }
    
    onChange({ primary: newRange, comparison });
    if (preset.key !== 'custom') {
      setIsOpen(false);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    if (isSelectingComparison && comparisonMode === 'custom') {
      // Selecting comparison range
      if (!value.comparison || value.comparison.to === value.comparison.from) {
        // First date of comparison range
        onChange({ ...value, comparison: { from: date, to: date } });
      } else if (date < value.comparison.from) {
        onChange({ ...value, comparison: { from: date, to: value.comparison.to } });
      } else {
        onChange({ ...value, comparison: { from: value.comparison.from, to: date } });
        setIsSelectingComparison(false);
      }
    } else {
      // Selecting primary range
      setActivePreset('custom');
      if (value.primary.from === value.primary.to || date < value.primary.from) {
        // First date or earlier date selected
        const newPrimary = { from: date, to: date };
        let comparison: DateRange | undefined = undefined;
        if (comparisonMode === 'auto') {
          comparison = getAutoComparisonRange(newPrimary);
        }
        onChange({ primary: newPrimary, comparison });
      } else {
        // Second date (end of range)
        const newPrimary = { from: value.primary.from, to: date };
        let comparison: DateRange | undefined = undefined;
        if (comparisonMode === 'auto') {
          comparison = getAutoComparisonRange(newPrimary);
        } else if (comparisonMode === 'custom' && value.comparison) {
          comparison = value.comparison;
        }
        onChange({ primary: newPrimary, comparison });
      }
    }
  };

  const toggleComparison = () => {
    if (comparisonMode === 'none') {
      // Enable auto comparison
      setComparisonMode('auto');
      const comparison = getAutoComparisonRange(value.primary);
      onChange({ ...value, comparison });
    } else if (comparisonMode === 'auto') {
      // Switch to custom
      setComparisonMode('custom');
      setIsSelectingComparison(true);
    } else {
      // Disable comparison
      setComparisonMode('none');
      onChange({ ...value, comparison: undefined });
      setIsSelectingComparison(false);
    }
  };

  const formatRangeLabel = (range: DateRange) => {
    if (range.from.getTime() === range.to.getTime()) {
      return format(range.from, 'd MMM yyyy', { locale: es });
    }
    return `${format(range.from, 'd MMM', { locale: es })} - ${format(range.to, 'd MMM yyyy', { locale: es })}`;
  };

  const getComparisonLabel = () => {
    if (comparisonMode === 'auto') return 'vs período anterior (auto)';
    if (comparisonMode === 'custom' && value.comparison) {
      return `vs ${formatRangeLabel(value.comparison)}`;
    }
    return '';
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'gap-2 h-auto py-2 px-3',
            value.comparison && 'border-primary/50',
            className
          )}
        >
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <div className="flex flex-col items-start text-left">
            <span className="text-sm font-medium">
              {formatRangeLabel(value.primary)}
            </span>
            {value.comparison && (
              <span className="text-xs text-muted-foreground">
                {getComparisonLabel()}
              </span>
            )}
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground ml-1" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          {/* Presets sidebar */}
          <div className="border-r border-border p-2 space-y-1 min-w-[140px]">
            {presets.map((preset) => (
              <button
                key={preset.key}
                onClick={() => handlePresetClick(preset)}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                  activePreset === preset.key
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-secondary text-foreground'
                )}
              >
                {preset.label}
              </button>
            ))}
            <div className="border-t border-border my-2" />
            <button
              onClick={() => {
                setActivePreset('custom');
              }}
              className={cn(
                'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                activePreset === 'custom'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-secondary text-foreground'
              )}
            >
              Personalizado
            </button>
          </div>

          {/* Calendar */}
          <div className="p-3">
            <CalendarComponent
              mode="single"
              selected={isSelectingComparison ? value.comparison?.from : value.primary.from}
              onSelect={handleDateSelect}
              locale={es}
              numberOfMonths={2}
              className="pointer-events-auto"
              modifiers={{
                range_start: value.primary.from,
                range_end: value.primary.to,
                range_middle: {
                  after: value.primary.from,
                  before: value.primary.to,
                },
                comparison_start: value.comparison?.from,
                comparison_end: value.comparison?.to,
              }}
              modifiersClassNames={{
                range_start: 'bg-primary text-primary-foreground rounded-l-md',
                range_end: 'bg-primary text-primary-foreground rounded-r-md',
                range_middle: 'bg-primary/20 text-foreground',
                comparison_start: 'bg-warning/80 text-warning-foreground rounded-l-md',
                comparison_end: 'bg-warning/80 text-warning-foreground rounded-r-md',
              }}
            />

            {/* Comparison toggle */}
            {showComparison && (
              <div className="border-t border-border mt-3 pt-3">
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleComparison}
                    className={cn(
                      'gap-2',
                      comparisonMode !== 'none' && 'text-primary'
                    )}
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                    {comparisonMode === 'none' && 'Comparar períodos'}
                    {comparisonMode === 'auto' && 'Comparación automática'}
                    {comparisonMode === 'custom' && 'Comparación personalizada'}
                  </Button>
                  
                  {comparisonMode !== 'none' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setComparisonMode('none');
                        onChange({ ...value, comparison: undefined });
                        setIsSelectingComparison(false);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {comparisonMode !== 'none' && value.comparison && (
                  <div className="mt-2 p-2 rounded-md bg-warning/10 text-sm">
                    <div className="flex items-center gap-2 text-warning">
                      <div className="w-3 h-3 rounded-full bg-warning/80" />
                      <span>Período de comparación:</span>
                    </div>
                    <p className="text-foreground mt-1">
                      {formatRangeLabel(value.comparison)}
                    </p>
                  </div>
                )}

                {isSelectingComparison && comparisonMode === 'custom' && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Selecciona las fechas del período de comparación
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

// Helper hook to use date range filtering
export const useDateRangeFilter = (defaultDays: number = 30) => {
  const defaultRange: DateRange = {
    from: subDays(new Date(), defaultDays - 1),
    to: new Date(),
  };

  const [dateRange, setDateRange] = useState<DateRangeSelection>({
    primary: defaultRange,
  });

  const isInRange = (date: Date | string, range: DateRange): boolean => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d >= range.from && d <= range.to;
  };

  const filterByDateRange = <T extends { date?: string; createdAt?: string; startDate?: string }>(
    items: T[]
  ): T[] => {
    return items.filter((item) => {
      const dateStr = item.date || item.createdAt || item.startDate;
      if (!dateStr) return true;
      return isInRange(dateStr, dateRange.primary);
    });
  };

  const getComparisonItems = <T extends { date?: string; createdAt?: string; startDate?: string }>(
    items: T[]
  ): T[] => {
    if (!dateRange.comparison) return [];
    return items.filter((item) => {
      const dateStr = item.date || item.createdAt || item.startDate;
      if (!dateStr) return false;
      return isInRange(dateStr, dateRange.comparison!);
    });
  };

  return {
    dateRange,
    setDateRange,
    filterByDateRange,
    getComparisonItems,
    isInRange,
  };
};

export default DateRangeFilter;
