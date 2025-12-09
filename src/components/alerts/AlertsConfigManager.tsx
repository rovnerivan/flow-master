import React, { useState } from 'react';
import { 
  Bell, Settings, Plus, Trash2, AlertTriangle, TrendingDown, 
  Trophy, Target, Users, BarChart3, Clock, CheckCircle2, X,
  Edit2, Power, PowerOff
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export type AlertCategory = 'critical' | 'warning' | 'celebration' | 'insight';
export type AlertTrigger = 
  | 'error_critical' 
  | 'error_threshold' 
  | 'efficiency_drop' 
  | 'task_overdue'
  | 'process_confusion'
  | 'employee_decline'
  | 'achievement_certification'
  | 'achievement_milestone'
  | 'onboarding_complete'
  | 'pattern_detected';

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  category: AlertCategory;
  trigger: AlertTrigger;
  enabled: boolean;
  threshold?: number;
  thresholdUnit?: string;
  timeframe?: string;
  notifyEmail: boolean;
  notifyPush: boolean;
  createdAt: string;
}

const defaultRules: AlertRule[] = [
  {
    id: '1',
    name: 'Error crítico detectado',
    description: 'Notificar inmediatamente cuando se registre un error crítico',
    category: 'critical',
    trigger: 'error_critical',
    enabled: true,
    notifyEmail: true,
    notifyPush: true,
    createdAt: '2024-01-01'
  },
  {
    id: '2',
    name: 'Eficiencia en caída',
    description: 'Alertar cuando la eficiencia de un empleado baje más del umbral',
    category: 'warning',
    trigger: 'efficiency_drop',
    enabled: true,
    threshold: 15,
    thresholdUnit: '%',
    timeframe: '2 semanas',
    notifyEmail: false,
    notifyPush: true,
    createdAt: '2024-01-01'
  },
  {
    id: '3',
    name: 'Proceso con alta confusión',
    description: 'Alertar cuando un proceso supere el umbral de confusión',
    category: 'warning',
    trigger: 'process_confusion',
    enabled: true,
    threshold: 30,
    thresholdUnit: '%',
    notifyEmail: false,
    notifyPush: true,
    createdAt: '2024-01-01'
  },
  {
    id: '4',
    name: 'Tarea crítica vencida',
    description: 'Alertar cuando una tarea crítica exceda el tiempo límite',
    category: 'critical',
    trigger: 'task_overdue',
    enabled: true,
    threshold: 24,
    thresholdUnit: 'horas',
    notifyEmail: true,
    notifyPush: true,
    createdAt: '2024-01-01'
  },
  {
    id: '5',
    name: 'Certificación completada',
    description: 'Celebrar cuando un empleado complete una certificación',
    category: 'celebration',
    trigger: 'achievement_certification',
    enabled: true,
    notifyEmail: false,
    notifyPush: true,
    createdAt: '2024-01-01'
  },
  {
    id: '6',
    name: 'Onboarding completado',
    description: 'Celebrar cuando un empleado complete su onboarding',
    category: 'celebration',
    trigger: 'onboarding_complete',
    enabled: true,
    notifyEmail: false,
    notifyPush: true,
    createdAt: '2024-01-01'
  },
  {
    id: '7',
    name: 'Patrón de errores detectado',
    description: 'Insight cuando se detecte un patrón recurrente de errores',
    category: 'insight',
    trigger: 'pattern_detected',
    enabled: true,
    notifyEmail: false,
    notifyPush: true,
    createdAt: '2024-01-01'
  },
  {
    id: '8',
    name: 'Empleado en tendencia negativa',
    description: 'Alertar cuando un empleado muestre tendencia negativa por varias semanas',
    category: 'warning',
    trigger: 'employee_decline',
    enabled: true,
    threshold: 3,
    thresholdUnit: 'semanas',
    notifyEmail: true,
    notifyPush: true,
    createdAt: '2024-01-01'
  }
];

const categoryConfig: Record<AlertCategory, { label: string; color: string; bgColor: string; icon: React.ComponentType<{ className?: string }> }> = {
  critical: { label: 'Crítico', color: 'text-red-500', bgColor: 'bg-red-500/10', icon: AlertTriangle },
  warning: { label: 'Preventivo', color: 'text-amber-500', bgColor: 'bg-amber-500/10', icon: TrendingDown },
  celebration: { label: 'Celebración', color: 'text-emerald-500', bgColor: 'bg-emerald-500/10', icon: Trophy },
  insight: { label: 'Insight', color: 'text-blue-500', bgColor: 'bg-blue-500/10', icon: BarChart3 }
};

const triggerLabels: Record<AlertTrigger, string> = {
  error_critical: 'Error crítico registrado',
  error_threshold: 'Errores superan umbral',
  efficiency_drop: 'Caída de eficiencia',
  task_overdue: 'Tarea vencida',
  process_confusion: 'Confusión en proceso',
  employee_decline: 'Tendencia negativa de empleado',
  achievement_certification: 'Certificación completada',
  achievement_milestone: 'Hito alcanzado',
  onboarding_complete: 'Onboarding completado',
  pattern_detected: 'Patrón detectado'
};

interface AlertsConfigManagerProps {
  onClose?: () => void;
}

const AlertsConfigManager: React.FC<AlertsConfigManagerProps> = ({ onClose }) => {
  const [rules, setRules] = useState<AlertRule[]>(defaultRules);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
  const [filterCategory, setFilterCategory] = useState<AlertCategory | 'all'>('all');

  const toggleRule = (ruleId: string) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    ));
    toast.success('Regla actualizada');
  };

  const toggleNotification = (ruleId: string, type: 'email' | 'push') => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId 
        ? { 
            ...rule, 
            notifyEmail: type === 'email' ? !rule.notifyEmail : rule.notifyEmail,
            notifyPush: type === 'push' ? !rule.notifyPush : rule.notifyPush
          } 
        : rule
    ));
  };

  const deleteRule = (ruleId: string) => {
    setRules(prev => prev.filter(rule => rule.id !== ruleId));
    toast.success('Regla eliminada');
  };

  const filteredRules = filterCategory === 'all' 
    ? rules 
    : rules.filter(r => r.category === filterCategory);

  const rulesByCategory = {
    critical: rules.filter(r => r.category === 'critical'),
    warning: rules.filter(r => r.category === 'warning'),
    celebration: rules.filter(r => r.category === 'celebration'),
    insight: rules.filter(r => r.category === 'insight')
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Configuración de Alertas</h2>
            <p className="text-sm text-muted-foreground">Define reglas para recibir notificaciones automáticas</p>
          </div>
        </div>
        <Button variant="hero" className="gap-2" onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4" />
          Nueva Regla
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(Object.entries(categoryConfig) as [AlertCategory, typeof categoryConfig[AlertCategory]][]).map(([cat, config]) => {
          const Icon = config.icon;
          const count = rulesByCategory[cat].length;
          const activeCount = rulesByCategory[cat].filter(r => r.enabled).length;
          
          return (
            <Card 
              key={cat}
              className={cn(
                "cursor-pointer transition-all hover:border-primary/30",
                filterCategory === cat && "border-primary ring-1 ring-primary/20"
              )}
              onClick={() => setFilterCategory(filterCategory === cat ? 'all' : cat)}
            >
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className={cn("p-2 rounded-lg", config.bgColor)}>
                    <Icon className={cn("w-4 h-4", config.color)} />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {activeCount}/{count} activas
                  </Badge>
                </div>
                <div className="mt-3">
                  <p className={cn("text-sm font-medium", config.color)}>{config.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{count} reglas</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filter */}
      {filterCategory !== 'all' && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            Filtrando: {categoryConfig[filterCategory].label}
            <button onClick={() => setFilterCategory('all')} className="ml-1">
              <X className="w-3 h-3" />
            </button>
          </Badge>
        </div>
      )}

      {/* Rules List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Reglas de Alerta ({filteredRules.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredRules.map((rule) => {
              const catConfig = categoryConfig[rule.category];
              const Icon = catConfig.icon;
              
              return (
                <div 
                  key={rule.id}
                  className={cn(
                    "p-4 rounded-lg border transition-all",
                    rule.enabled 
                      ? "border-border bg-background" 
                      : "border-border/50 bg-muted/30 opacity-70"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn("p-2 rounded-lg shrink-0", catConfig.bgColor)}>
                      <Icon className={cn("w-4 h-4", catConfig.color)} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-foreground">{rule.name}</h4>
                            <Badge variant="outline" className={cn("text-xs", catConfig.color)}>
                              {catConfig.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{rule.description}</p>
                        </div>
                        
                        <Switch 
                          checked={rule.enabled}
                          onCheckedChange={() => toggleRule(rule.id)}
                        />
                      </div>
                      
                      {/* Threshold info */}
                      {rule.threshold && (
                        <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            Umbral: {rule.threshold}{rule.thresholdUnit}
                          </span>
                          {rule.timeframe && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Periodo: {rule.timeframe}
                            </span>
                          )}
                        </div>
                      )}
                      
                      {/* Notification channels */}
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 text-sm">
                            <input 
                              type="checkbox" 
                              checked={rule.notifyPush}
                              onChange={() => toggleNotification(rule.id, 'push')}
                              className="rounded border-input"
                            />
                            <Bell className="w-3 h-3" />
                            Push
                          </label>
                          <label className="flex items-center gap-2 text-sm">
                            <input 
                              type="checkbox" 
                              checked={rule.notifyEmail}
                              onChange={() => toggleNotification(rule.id, 'email')}
                              className="rounded border-input"
                            />
                            Email
                          </label>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => setEditingRule(rule)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => deleteRule(rule.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      {(showAddModal || editingRule) && (
        <AlertRuleModal 
          rule={editingRule}
          onClose={() => {
            setShowAddModal(false);
            setEditingRule(null);
          }}
          onSave={(newRule) => {
            if (editingRule) {
              setRules(prev => prev.map(r => r.id === editingRule.id ? newRule : r));
              toast.success('Regla actualizada');
            } else {
              setRules(prev => [...prev, { ...newRule, id: Date.now().toString() }]);
              toast.success('Regla creada');
            }
            setShowAddModal(false);
            setEditingRule(null);
          }}
        />
      )}
    </div>
  );
};

interface AlertRuleModalProps {
  rule: AlertRule | null;
  onClose: () => void;
  onSave: (rule: AlertRule) => void;
}

const AlertRuleModal: React.FC<AlertRuleModalProps> = ({ rule, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<AlertRule>>(rule || {
    name: '',
    description: '',
    category: 'warning',
    trigger: 'efficiency_drop',
    enabled: true,
    threshold: undefined,
    thresholdUnit: '%',
    notifyEmail: false,
    notifyPush: true,
    createdAt: new Date().toISOString()
  });

  const handleSave = () => {
    if (!formData.name || !formData.description) {
      toast.error('Completa todos los campos requeridos');
      return;
    }
    onSave(formData as AlertRule);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg mx-4 bg-card border border-border rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">
            {rule ? 'Editar Regla' : 'Nueva Regla de Alerta'}
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nombre de la regla *</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              placeholder="Ej: Eficiencia en caída"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Descripción *</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
              rows={2}
              placeholder="Describe cuando se activará esta alerta"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Categoría</label>
              <select
                value={formData.category || 'warning'}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as AlertCategory })}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="critical">🔴 Crítico</option>
                <option value="warning">🟡 Preventivo</option>
                <option value="celebration">🟢 Celebración</option>
                <option value="insight">🔵 Insight</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Disparador</label>
              <select
                value={formData.trigger || 'efficiency_drop'}
                onChange={(e) => setFormData({ ...formData, trigger: e.target.value as AlertTrigger })}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                {Object.entries(triggerLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Umbral (opcional)</label>
              <input
                type="number"
                value={formData.threshold || ''}
                onChange={(e) => setFormData({ ...formData, threshold: Number(e.target.value) })}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                placeholder="Ej: 15"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Unidad</label>
              <select
                value={formData.thresholdUnit || '%'}
                onChange={(e) => setFormData({ ...formData, thresholdUnit: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="%">Porcentaje (%)</option>
                <option value="horas">Horas</option>
                <option value="días">Días</option>
                <option value="semanas">Semanas</option>
                <option value="errores">Errores</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Canales de notificación</label>
            <div className="flex items-center gap-6 mt-2">
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={formData.notifyPush}
                  onChange={(e) => setFormData({ ...formData, notifyPush: e.target.checked })}
                  className="rounded border-input"
                />
                <Bell className="w-4 h-4" />
                Notificación push
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={formData.notifyEmail}
                  onChange={(e) => setFormData({ ...formData, notifyEmail: e.target.checked })}
                  className="rounded border-input"
                />
                Email
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
            <span className="text-sm font-medium">Regla activa</span>
            <Switch 
              checked={formData.enabled}
              onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button variant="hero" onClick={handleSave} className="flex-1">
            {rule ? 'Guardar Cambios' : 'Crear Regla'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AlertsConfigManager;
