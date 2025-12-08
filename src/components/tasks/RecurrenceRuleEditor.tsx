import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Info, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  RecurrencePatternType,
  RecurrenceRule,
  patternTypeLabels,
  dayOfWeekLabels,
  calculateNextOccurrences,
  formatTime,
} from '@/lib/recurrenceTypes';

interface RecurrenceRuleEditorProps {
  value?: Partial<RecurrenceRule>;
  onChange: (rule: Partial<RecurrenceRule>) => void;
  className?: string;
}

export const RecurrenceRuleEditor: React.FC<RecurrenceRuleEditorProps> = ({
  value,
  onChange,
  className,
}) => {
  const [rule, setRule] = useState<Partial<RecurrenceRule>>({
    pattern_type: 'daily',
    days_of_week: [],
    day_of_month: null,
    week_of_month: null,
    month_of_year: null,
    default_due_time: '17:00',
    starts_on: format(new Date(), 'yyyy-MM-dd'),
    ends_on: null,
    auto_generate: false,
    is_active: true,
    ...value,
  });

  const [showEndDate, setShowEndDate] = useState(!!rule.ends_on);
  const [nextOccurrences, setNextOccurrences] = useState<Date[]>([]);

  useEffect(() => {
    // Calculate next occurrences when rule changes
    if (rule.pattern_type && rule.starts_on) {
      const fullRule = {
        id: '',
        task_id: '',
        team_id: '',
        created_at: '',
        updated_at: '',
        ...rule,
        days_of_week: rule.days_of_week || [],
        default_due_time: rule.default_due_time || '17:00',
        starts_on: rule.starts_on,
        is_active: rule.is_active ?? true,
        auto_generate: rule.auto_generate ?? false,
      } as RecurrenceRule;
      
      const occurrences = calculateNextOccurrences(fullRule, 5);
      setNextOccurrences(occurrences);
    }
  }, [rule]);

  const updateRule = (updates: Partial<RecurrenceRule>) => {
    const newRule = { ...rule, ...updates };
    setRule(newRule);
    onChange(newRule);
  };

  const toggleDayOfWeek = (day: number) => {
    const currentDays = rule.days_of_week || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day].sort();
    updateRule({ days_of_week: newDays });
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Pattern Type Selection */}
      <div className="space-y-2">
        <Label>Tipo de recurrencia</Label>
        <Select
          value={rule.pattern_type}
          onValueChange={(value: RecurrencePatternType) => updateRule({ pattern_type: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar frecuencia" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(patternTypeLabels).map(([key, { label, description }]) => (
              <SelectItem key={key} value={key}>
                <div>
                  <div className="font-medium">{label}</div>
                  <div className="text-xs text-muted-foreground">{description}</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Days of Week (for specific_days pattern) */}
      {rule.pattern_type === 'specific_days' && (
        <div className="space-y-2">
          <Label>Días de la semana</Label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5, 6, 7].map(day => (
              <button
                key={day}
                type="button"
                onClick={() => toggleDayOfWeek(day)}
                className={cn(
                  'w-10 h-10 rounded-full text-sm font-medium transition-colors',
                  rule.days_of_week?.includes(day)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                )}
              >
                {dayOfWeekLabels[day].short}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Selecciona los días en que se ejecutará la tarea
          </p>
        </div>
      )}

      {/* Day of Month (for monthly, quarterly, annual) */}
      {['monthly', 'quarterly', 'annual'].includes(rule.pattern_type || '') && (
        <div className="space-y-2">
          <Label>Día del mes</Label>
          <Select
            value={rule.day_of_month?.toString() || ''}
            onValueChange={(value) => updateRule({ day_of_month: parseInt(value) })}
          >
            <SelectTrigger className="w-24">
              <SelectValue placeholder="Día" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                <SelectItem key={day} value={day.toString()}>
                  {day}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Month of Year (for annual) */}
      {rule.pattern_type === 'annual' && (
        <div className="space-y-2">
          <Label>Mes del año</Label>
          <Select
            value={rule.month_of_year?.toString() || ''}
            onValueChange={(value) => updateRule({ month_of_year: parseInt(value) })}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Mes" />
            </SelectTrigger>
            <SelectContent>
              {[
                'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
              ].map((month, index) => (
                <SelectItem key={index + 1} value={(index + 1).toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Default Due Time */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Hora de vencimiento
        </Label>
        <Input
          type="time"
          value={rule.default_due_time || '17:00'}
          onChange={(e) => updateRule({ default_due_time: e.target.value })}
          className="w-32"
        />
      </div>

      {/* Start Date */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Fecha de inicio
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-48 justify-start text-left font-normal">
              <Calendar className="mr-2 h-4 w-4" />
              {rule.starts_on 
                ? format(new Date(rule.starts_on), 'PPP', { locale: es })
                : 'Seleccionar fecha'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={rule.starts_on ? new Date(rule.starts_on) : undefined}
              onSelect={(date) => date && updateRule({ starts_on: format(date, 'yyyy-MM-dd') })}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* End Date Toggle */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Fecha de fin (opcional)</Label>
          <Switch
            checked={showEndDate}
            onCheckedChange={(checked) => {
              setShowEndDate(checked);
              if (!checked) updateRule({ ends_on: null });
            }}
          />
        </div>
        
        {showEndDate && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-48 justify-start text-left font-normal">
                <Calendar className="mr-2 h-4 w-4" />
                {rule.ends_on 
                  ? format(new Date(rule.ends_on), 'PPP', { locale: es })
                  : 'Seleccionar fecha'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={rule.ends_on ? new Date(rule.ends_on) : undefined}
                onSelect={(date) => date && updateRule({ ends_on: format(date, 'yyyy-MM-dd') })}
                disabled={(date) => rule.starts_on ? date < new Date(rule.starts_on) : false}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Auto Generate Toggle */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
        <div className="space-y-0.5">
          <Label className="text-base">Generación automática</Label>
          <p className="text-xs text-muted-foreground">
            Crear instancias automáticamente según la regla
          </p>
        </div>
        <Switch
          checked={rule.auto_generate || false}
          onCheckedChange={(checked) => updateRule({ auto_generate: checked })}
        />
      </div>

      {/* Preview of Next Occurrences */}
      {nextOccurrences.length > 0 && (
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <Info className="w-4 h-4" />
            <span className="text-sm font-medium">Próximas ocurrencias</span>
          </div>
          <ul className="space-y-1">
            {nextOccurrences.map((date, index) => (
              <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-3 h-3 text-success" />
                {format(date, "EEEE d 'de' MMMM, yyyy", { locale: es })}
                {rule.default_due_time && (
                  <span className="text-xs">a las {formatTime(rule.default_due_time)}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
