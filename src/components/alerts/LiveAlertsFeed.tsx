import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, TrendingDown, Trophy, BarChart3, Bell, 
  X, CheckCircle2, Clock, Users, Target, Sparkles,
  ChevronRight, Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type LiveAlertCategory = 'critical' | 'warning' | 'celebration' | 'insight';

export interface LiveAlert {
  id: string;
  category: LiveAlertCategory;
  title: string;
  message: string;
  source: string;
  timestamp: Date;
  read: boolean;
  dismissed: boolean;
  actionLabel?: string;
  actionUrl?: string;
  metadata?: {
    employee?: string;
    process?: string;
    value?: number;
    previousValue?: number;
    threshold?: number;
  };
}

const mockAlerts: LiveAlert[] = [
  {
    id: '1',
    category: 'critical',
    title: 'Error crítico en Cierre de Caja',
    message: 'Se detectó un error que afecta directamente las operaciones. Requiere atención inmediata.',
    source: 'Sistema de Errores',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    read: false,
    dismissed: false,
    actionLabel: 'Ver detalles',
    metadata: { process: 'Cierre de Caja', employee: 'Carlos Ruiz' }
  },
  {
    id: '2',
    category: 'warning',
    title: 'Eficiencia en caída: Carlos Ruiz',
    message: 'La eficiencia ha bajado un 15% en las últimas 2 semanas. Se recomienda reunión 1:1.',
    source: 'Monitor de Rendimiento',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    read: false,
    dismissed: false,
    actionLabel: 'Ver perfil',
    metadata: { employee: 'Carlos Ruiz', value: 78, previousValue: 92, threshold: 15 }
  },
  {
    id: '3',
    category: 'celebration',
    title: '🎉 María García completó certificación',
    message: 'Certificación en "Procesos Críticos de Inventario" completada exitosamente.',
    source: 'Sistema de Certificaciones',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false,
    dismissed: false,
    actionLabel: 'Celebrar',
    metadata: { employee: 'María García', process: 'Procesos Críticos de Inventario' }
  },
  {
    id: '4',
    category: 'warning',
    title: 'Proceso "Inventario Semanal" con alta confusión',
    message: 'El 45% de los empleados reportaron confusión en este proceso. Revisar pasos 3-5.',
    source: 'Análisis de Procesos',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    read: true,
    dismissed: false,
    actionLabel: 'Revisar proceso',
    metadata: { process: 'Inventario Semanal', value: 45, threshold: 30 }
  },
  {
    id: '5',
    category: 'insight',
    title: 'Patrón detectado: Errores en cierre de viernes',
    message: 'Los errores de cierre aumentan 3x los viernes. Considera reforzar supervisión.',
    source: 'Análisis de Patrones',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    read: true,
    dismissed: false,
    actionLabel: 'Ver análisis',
    metadata: { value: 300 }
  },
  {
    id: '6',
    category: 'celebration',
    title: '🚀 Récord de onboarding: Pedro Sánchez',
    message: 'Onboarding completado en 18 días. 40% más rápido que el promedio de 30 días.',
    source: 'Sistema de Onboarding',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    read: true,
    dismissed: false,
    metadata: { employee: 'Pedro Sánchez', value: 18, previousValue: 30 }
  }
];

const categoryConfig: Record<LiveAlertCategory, { 
  label: string; 
  color: string; 
  bgColor: string; 
  borderColor: string;
  icon: React.ComponentType<{ className?: string }> 
}> = {
  critical: { 
    label: 'Crítico', 
    color: 'text-red-500', 
    bgColor: 'bg-red-500/10', 
    borderColor: 'border-red-500/30',
    icon: AlertTriangle 
  },
  warning: { 
    label: 'Preventivo', 
    color: 'text-amber-500', 
    bgColor: 'bg-amber-500/10', 
    borderColor: 'border-amber-500/30',
    icon: TrendingDown 
  },
  celebration: { 
    label: 'Celebración', 
    color: 'text-emerald-500', 
    bgColor: 'bg-emerald-500/10', 
    borderColor: 'border-emerald-500/30',
    icon: Trophy 
  },
  insight: { 
    label: 'Insight', 
    color: 'text-blue-500', 
    bgColor: 'bg-blue-500/10', 
    borderColor: 'border-blue-500/30',
    icon: BarChart3 
  }
};

interface LiveAlertsFeedProps {
  maxAlerts?: number;
  showFilters?: boolean;
}

const LiveAlertsFeed: React.FC<LiveAlertsFeedProps> = ({ maxAlerts = 10, showFilters = true }) => {
  const [alerts, setAlerts] = useState<LiveAlert[]>(mockAlerts);
  const [filterCategory, setFilterCategory] = useState<LiveAlertCategory | 'all'>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours}h`;
    return `Hace ${days}d`;
  };

  const markAsRead = (alertId: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, read: true } : a
    ));
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, dismissed: true } : a
    ));
  };

  const markAllAsRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  };

  const filteredAlerts = alerts
    .filter(a => !a.dismissed)
    .filter(a => filterCategory === 'all' || a.category === filterCategory)
    .filter(a => !showUnreadOnly || !a.read)
    .slice(0, maxAlerts);

  const unreadCount = alerts.filter(a => !a.read && !a.dismissed).length;
  const criticalCount = alerts.filter(a => a.category === 'critical' && !a.dismissed).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-xl",
              criticalCount > 0 ? "bg-red-500/10" : "bg-primary/10"
            )}>
              <Bell className={cn(
                "w-5 h-5",
                criticalCount > 0 ? "text-red-500" : "text-primary"
              )} />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                Alertas en Vivo
                {unreadCount > 0 && (
                  <Badge variant="default" className="text-xs">
                    {unreadCount} nuevas
                  </Badge>
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {criticalCount > 0 
                  ? `${criticalCount} alerta${criticalCount > 1 ? 's' : ''} crítica${criticalCount > 1 ? 's' : ''} requiere${criticalCount > 1 ? 'n' : ''} atención`
                  : 'Monitoreo en tiempo real'
                }
              </p>
            </div>
          </div>
          
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Marcar leídas
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Filters */}
        {showFilters && (
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              variant={filterCategory === 'all' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setFilterCategory('all')}
            >
              Todas
            </Button>
            {(Object.entries(categoryConfig) as [LiveAlertCategory, typeof categoryConfig[LiveAlertCategory]][]).map(([cat, config]) => {
              const count = alerts.filter(a => a.category === cat && !a.dismissed).length;
              return (
                <Button
                  key={cat}
                  variant={filterCategory === cat ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setFilterCategory(cat)}
                  className="gap-1"
                >
                  <span className={config.color}>{config.label}</span>
                  {count > 0 && (
                    <Badge variant="outline" className="ml-1 text-xs h-5">
                      {count}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
        )}

        {/* Alerts List */}
        <div className="space-y-3">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No hay alertas {filterCategory !== 'all' ? `de tipo "${categoryConfig[filterCategory].label}"` : ''}</p>
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const config = categoryConfig[alert.category];
              const Icon = config.icon;
              
              return (
                <div 
                  key={alert.id}
                  className={cn(
                    "p-4 rounded-lg border transition-all",
                    !alert.read && "ring-1 ring-primary/20",
                    config.borderColor,
                    config.bgColor
                  )}
                  onClick={() => markAsRead(alert.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn("p-2 rounded-lg shrink-0", config.bgColor)}>
                      <Icon className={cn("w-4 h-4", config.color)} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className={cn(
                            "font-medium text-foreground",
                            !alert.read && "font-semibold"
                          )}>
                            {alert.title}
                          </h4>
                          {!alert.read && (
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            dismissAlert(alert.id);
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mt-1">
                        {alert.message}
                      </p>
                      
                      {/* Metadata */}
                      {alert.metadata && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {alert.metadata.employee && (
                            <Badge variant="outline" className="text-xs gap-1">
                              <Users className="w-3 h-3" />
                              {alert.metadata.employee}
                            </Badge>
                          )}
                          {alert.metadata.process && (
                            <Badge variant="outline" className="text-xs gap-1">
                              <Target className="w-3 h-3" />
                              {alert.metadata.process}
                            </Badge>
                          )}
                          {alert.metadata.value !== undefined && alert.metadata.previousValue !== undefined && (
                            <Badge variant="outline" className={cn(
                              "text-xs",
                              alert.metadata.value < alert.metadata.previousValue 
                                ? "text-red-500 border-red-500/30" 
                                : "text-emerald-500 border-emerald-500/30"
                            )}>
                              {alert.metadata.value}% → {alert.metadata.previousValue}%
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimestamp(alert.timestamp)} • {alert.source}
                        </span>
                        
                        {alert.actionLabel && (
                          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                            {alert.actionLabel}
                            <ChevronRight className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveAlertsFeed;
