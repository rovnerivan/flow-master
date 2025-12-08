import React, { useState } from 'react';
import { Check, ChevronRight, Clock, Zap, Link2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ChecklistItem {
  id: string;
  title: string;
  processLink?: string;
  processName?: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  frequency: 'daily' | 'weekly' | 'monthly';
}

const mockChecklist: ChecklistItem[] = [
  {
    id: '1',
    title: 'Verificar inventario de caja',
    processLink: '/process/1',
    processName: 'Cierre de Caja',
    completed: false,
    priority: 'high',
    frequency: 'daily',
  },
  {
    id: '2',
    title: 'Revisar correos de proveedores',
    processLink: '/process/2',
    processName: 'Comunicación',
    completed: true,
    priority: 'medium',
    frequency: 'daily',
  },
  {
    id: '3',
    title: 'Actualizar registro de ventas',
    processLink: '/process/3',
    processName: 'Registro de Ventas',
    completed: false,
    priority: 'high',
    frequency: 'daily',
  },
  {
    id: '4',
    title: 'Limpiar área de trabajo',
    completed: false,
    priority: 'low',
    frequency: 'daily',
  },
  {
    id: '5',
    title: 'Reporte semanal de inventario',
    processLink: '/process/5',
    processName: 'Inventario Semanal',
    completed: false,
    priority: 'medium',
    frequency: 'weekly',
  },
];

export const DailyChecklist: React.FC = () => {
  const [items, setItems] = useState(mockChecklist);
  const [showAll, setShowAll] = useState(false);
  
  const dailyItems = items.filter((i) => i.frequency === 'daily');
  const otherItems = items.filter((i) => i.frequency !== 'daily');
  const displayItems = showAll ? items : dailyItems;
  
  const completedCount = displayItems.filter((i) => i.completed).length;
  const progress = (completedCount / displayItems.length) * 100;

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleProcessLink = (e: React.MouseEvent, item: ChecklistItem) => {
    e.stopPropagation();
    if (item.processName) {
      toast.info(`Abriendo proceso: ${item.processName}`);
    }
  };

  const priorityColors = {
    high: 'border-l-destructive',
    medium: 'border-l-warning',
    low: 'border-l-muted-foreground',
  };

  const frequencyBadge = {
    daily: null,
    weekly: { label: 'Semanal', class: 'bg-warning/20 text-warning' },
    monthly: { label: 'Mensual', class: 'bg-success/20 text-success' },
  };

  return (
    <div className="mobile-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Checklist del Día</h3>
            <p className="text-xs text-muted-foreground">
              {completedCount} de {displayItems.length} completados
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>Hoy</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-gradient-primary rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Checklist Items */}
      <div className="space-y-2">
        {displayItems.map((item) => (
          <div
            key={item.id}
            className={cn(
              'flex items-center gap-3 p-3 rounded-xl border-l-4 bg-secondary/30 transition-all duration-200 active:scale-[0.98]',
              priorityColors[item.priority],
              item.completed && 'opacity-60'
            )}
            onClick={() => toggleItem(item.id)}
          >
            <button
              className={cn(
                'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0',
                item.completed
                  ? 'bg-primary border-primary'
                  : 'border-muted-foreground hover:border-primary'
              )}
            >
              {item.completed && <Check className="w-4 h-4 text-primary-foreground" />}
            </button>
            <div className="flex-1 min-w-0">
              <span
                className={cn(
                  'text-sm block',
                  item.completed && 'line-through text-muted-foreground'
                )}
              >
                {item.title}
              </span>
              {item.processName && (
                <button
                  onClick={(e) => handleProcessLink(e, item)}
                  className="text-xs text-primary flex items-center gap-1 mt-0.5 hover:underline"
                >
                  <Link2 className="w-3 h-3" />
                  {item.processName}
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              {frequencyBadge[item.frequency] && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${frequencyBadge[item.frequency]!.class}`}>
                  {frequencyBadge[item.frequency]!.label}
                </span>
              )}
              {item.processLink && (
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Show Other Tasks */}
      {otherItems.length > 0 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-4 w-full py-2 text-sm text-primary hover:underline"
        >
          {showAll ? 'Ver solo tareas diarias' : `Ver ${otherItems.length} tareas adicionales`}
        </button>
      )}
    </div>
  );
};
