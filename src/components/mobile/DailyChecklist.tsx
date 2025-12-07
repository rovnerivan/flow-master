import React, { useState } from 'react';
import { Check, ChevronRight, Clock, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChecklistItem {
  id: string;
  title: string;
  processLink?: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

const mockChecklist: ChecklistItem[] = [
  {
    id: '1',
    title: 'Verificar inventario de caja',
    processLink: '/process/1',
    completed: false,
    priority: 'high',
  },
  {
    id: '2',
    title: 'Revisar correos de proveedores',
    processLink: '/process/2',
    completed: true,
    priority: 'medium',
  },
  {
    id: '3',
    title: 'Actualizar registro de ventas',
    processLink: '/process/3',
    completed: false,
    priority: 'high',
  },
  {
    id: '4',
    title: 'Limpiar área de trabajo',
    completed: false,
    priority: 'low',
  },
];

export const DailyChecklist: React.FC = () => {
  const [items, setItems] = useState(mockChecklist);
  const completedCount = items.filter((i) => i.completed).length;
  const progress = (completedCount / items.length) * 100;

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const priorityColors = {
    high: 'border-l-destructive',
    medium: 'border-l-warning',
    low: 'border-l-muted-foreground',
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
            <h3 className="font-semibold text-foreground">Checklist Diario</h3>
            <p className="text-xs text-muted-foreground">
              {completedCount} de {items.length} completados
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
        {items.map((item) => (
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
                'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200',
                item.completed
                  ? 'bg-primary border-primary'
                  : 'border-muted-foreground hover:border-primary'
              )}
            >
              {item.completed && <Check className="w-4 h-4 text-primary-foreground" />}
            </button>
            <span
              className={cn(
                'flex-1 text-sm',
                item.completed && 'line-through text-muted-foreground'
              )}
            >
              {item.title}
            </span>
            {item.processLink && (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
