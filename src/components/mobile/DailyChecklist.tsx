import React, { useState } from 'react';
import { 
  Check, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp,
  Clock, 
  Zap, 
  Link2,
  Play,
  ArrowLeft,
  X,
  FileText,
  Target,
  AlertCircle,
  CheckCircle,
  ChevronsDown,
  ArrowRight,
  Maximize2,
} from 'lucide-react';
import { ProcessViewerModal } from '@/components/employee/ProcessViewerModal';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ProcessInfo {
  id: string;
  name: string;
  description: string;
  estimatedTime: string;
  steps: {
    id: string;
    number: number;
    title: string;
    description: string;
    duration: string;
    extendedContent?: string;
  }[];
}

interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  frequency: 'daily' | 'weekly' | 'monthly';
  associatedProcesses?: ProcessInfo[];
}

const mockProcesses: ProcessInfo[] = [
  {
    id: 'proc-1',
    name: 'Cierre de Caja',
    description: 'Proceso completo de cierre diario de caja registradora.',
    estimatedTime: '15 min',
    steps: [
      { id: 's1', number: 1, title: 'Contar efectivo', description: 'Cuenta todo el efectivo en la caja.', duration: '3 min', extendedContent: 'Asegúrate de separar los billetes por denominación. Cuenta cada pila dos veces para evitar errores. Si hay discrepancias, revisa las transacciones del día.' },
      { id: 's2', number: 2, title: 'Verificar vouchers', description: 'Revisa todos los vouchers de tarjetas.', duration: '2 min', extendedContent: 'Compara cada voucher con la transacción correspondiente en el sistema. Asegúrate de que las firmas coincidan y que no haya vouchers anulados sin documentar.' },
      { id: 's3', number: 3, title: 'Cuadrar totales', description: 'Compara con el sistema de ventas.', duration: '5 min', extendedContent: 'El total en caja debe coincidir exactamente con el reporte del sistema. Si hay diferencias menores a $5, documéntalas en el libro de incidencias. Diferencias mayores requieren autorización del supervisor.' },
    ],
  },
  {
    id: 'proc-2',
    name: 'Control de Inventario',
    description: 'Verificación de existencias y registro de faltantes.',
    estimatedTime: '10 min',
    steps: [
      { id: 's1', number: 1, title: 'Revisar stock físico', description: 'Verifica cantidades en estante.', duration: '5 min', extendedContent: 'Recorre cada sección del almacén sistemáticamente. Usa el escáner para verificar cantidades y registra cualquier producto dañado o próximo a vencer.' },
      { id: 's2', number: 2, title: 'Reportar faltantes', description: 'Documenta productos agotados.', duration: '5 min', extendedContent: 'Completa el formulario de faltantes con código de producto, cantidad faltante y fecha. Notifica inmediatamente productos de alta rotación para reposición urgente.' },
    ],
  },
];

const mockChecklist: ChecklistItem[] = [
  {
    id: '1',
    title: 'Verificar inventario de caja',
    completed: false,
    priority: 'high',
    frequency: 'daily',
    associatedProcesses: [mockProcesses[0], mockProcesses[1]],
  },
  {
    id: '2',
    title: 'Revisar correos de proveedores',
    completed: true,
    priority: 'medium',
    frequency: 'daily',
  },
  {
    id: '3',
    title: 'Actualizar registro de ventas',
    completed: false,
    priority: 'high',
    frequency: 'daily',
    associatedProcesses: [mockProcesses[0]],
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
    completed: false,
    priority: 'medium',
    frequency: 'weekly',
    associatedProcesses: [mockProcesses[1]],
  },
];

// Embedded Process Viewer Component
interface EmbeddedProcessViewerProps {
  process: ProcessInfo;
  onClose: () => void;
  onMaximize: () => void;
}

const EmbeddedProcessViewer: React.FC<EmbeddedProcessViewerProps> = ({ process, onClose, onMaximize }) => {
  const [currentStep, setCurrentStep] = useState<number | null>(null);
  const [showExtended, setShowExtended] = useState(false);

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    setShowExtended(false);
  };

  const handleBack = () => {
    if (showExtended) {
      setShowExtended(false);
    } else if (currentStep !== null) {
      setCurrentStep(null);
    } else {
      onClose();
    }
  };

  // Step view
  if (currentStep !== null) {
    const step = process.steps[currentStep];
    const progress = ((currentStep + 1) / process.steps.length) * 100;

    return (
      <div className="bg-background rounded-xl border border-border overflow-hidden">
        {/* Step Header */}
        <div className="flex items-center justify-between p-3 border-b border-border bg-secondary/30">
          <button onClick={handleBack} className="p-1 hover:bg-secondary rounded-lg transition-colors">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <span className="text-sm font-medium text-foreground">{process.name}</span>
          <div className="flex items-center gap-1">
            <button 
              onClick={onMaximize} 
              className="p-1 hover:bg-secondary rounded-lg transition-colors"
              title="Ver vista completa"
            >
              <Maximize2 className="w-4 h-4 text-primary" />
            </button>
            <button onClick={onClose} className="p-1 hover:bg-secondary rounded-lg transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="px-3 pt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Paso {currentStep + 1} de {process.steps.length}</span>
            <span className="text-xs font-medium text-primary">{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
            <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex gap-0.5 mt-2">
            {process.steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`flex-1 h-1 rounded-full transition-colors ${idx <= currentStep ? 'bg-primary' : 'bg-border'}`}
              />
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="p-4">
          {showExtended && step.extendedContent ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <span className="font-medium text-foreground">Versión Extendida</span>
              </div>
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm text-foreground leading-relaxed">{step.extendedContent}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowExtended(false)} className="w-full">
                Volver al paso
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                  {step.number}
                </div>
                <span className="text-xs text-muted-foreground">{step.duration}</span>
              </div>
              <h4 className="font-semibold text-foreground">{step.title}</h4>
              <p className="text-sm text-muted-foreground">{step.description}</p>
              
              {step.extendedContent && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => setShowExtended(true)}
                >
                  <FileText className="w-3 h-3" />
                  Ver versión extendida
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Step Navigation */}
        {!showExtended && (
          <div className="p-3 border-t border-border flex items-center justify-between">
            {currentStep > 0 ? (
              <Button variant="outline" size="sm" onClick={() => setCurrentStep(currentStep - 1)}>
                <ChevronRight className="w-3 h-3 rotate-180 mr-1" />
                Anterior
              </Button>
            ) : <div />}
            {currentStep < process.steps.length - 1 ? (
              <Button variant="default" size="sm" onClick={() => setCurrentStep(currentStep + 1)}>
                Siguiente
                <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            ) : (
              <Button variant="default" size="sm" onClick={onClose}>
                <CheckCircle className="w-3 h-3 mr-1" />
                Completar
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }

  // Process overview
  return (
    <div className="bg-background rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-secondary/30">
        <button onClick={onClose} className="p-1 hover:bg-secondary rounded-lg transition-colors">
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        <span className="text-sm font-medium text-foreground">{process.name}</span>
        <div className="flex items-center gap-1">
          <button 
            onClick={onMaximize} 
            className="p-1 hover:bg-secondary rounded-lg transition-colors"
            title="Ver vista completa"
          >
            <Maximize2 className="w-4 h-4 text-primary" />
          </button>
          <button onClick={onClose} className="p-1 hover:bg-secondary rounded-lg transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <p className="text-sm text-muted-foreground">{process.description}</p>
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {process.estimatedTime}
          </div>
          <div className="flex items-center gap-1">
            <Target className="w-3 h-3" />
            {process.steps.length} pasos
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">Pasos</h4>
          {process.steps.map((step, idx) => (
            <button
              key={step.id}
              onClick={() => handleStepClick(idx)}
              className="w-full flex items-center gap-2 p-2 rounded-lg border border-border hover:border-primary/30 transition-colors text-left"
            >
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                {idx + 1}
              </div>
              <span className="text-sm text-foreground flex-1">{step.title}</span>
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
            </button>
          ))}
        </div>

        <Button variant="hero" size="sm" className="w-full gap-2" onClick={() => handleStepClick(0)}>
          <Play className="w-3 h-3" />
          Comenzar
        </Button>
      </div>
    </div>
  );
};

export const DailyChecklist: React.FC = () => {
  const [items, setItems] = useState(mockChecklist);
  const [showAll, setShowAll] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [activeProcess, setActiveProcess] = useState<{ itemId: string; process: ProcessInfo; currentStep?: number } | null>(null);
  const [maximizedProcess, setMaximizedProcess] = useState<{ processId: string; itemId: string; process: ProcessInfo } | null>(null);
  
  const dailyItems = items.filter((i) => i.frequency === 'daily');
  const otherItems = items.filter((i) => i.frequency !== 'daily');
  const displayItems = showAll ? items : dailyItems;
  
  const completedCount = displayItems.filter((i) => i.completed).length;
  const progress = (completedCount / displayItems.length) * 100;

  const toggleItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const toggleExpanded = (id: string) => {
    if (activeProcess?.itemId === id) {
      setActiveProcess(null);
    }
    setExpandedItem(expandedItem === id ? null : id);
  };

  const openProcess = (itemId: string, process: ProcessInfo) => {
    setActiveProcess({ itemId, process });
  };

  const closeProcess = () => {
    setActiveProcess(null);
  };

  const handleMaximize = (itemId: string, process: ProcessInfo) => {
    setMaximizedProcess({ processId: process.id, itemId, process });
  };

  const handleCloseMaximized = () => {
    setMaximizedProcess(null);
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
          <div key={item.id} className="space-y-2">
            <div
              className={cn(
                'flex items-center gap-3 p-3 rounded-xl border-l-4 bg-secondary/30 transition-all duration-200',
                priorityColors[item.priority],
                item.completed && 'opacity-60',
                expandedItem === item.id && 'bg-secondary/50'
              )}
              onClick={() => item.associatedProcesses?.length ? toggleExpanded(item.id) : null}
            >
              <button
                onClick={(e) => toggleItem(item.id, e)}
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
                {item.associatedProcesses && item.associatedProcesses.length > 0 && (
                  <span className="text-xs text-primary flex items-center gap-1 mt-0.5">
                    <Link2 className="w-3 h-3" />
                    {item.associatedProcesses.length} proceso{item.associatedProcesses.length > 1 ? 's' : ''} asociado{item.associatedProcesses.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {frequencyBadge[item.frequency] && (
                  <span className={`px-2 py-0.5 rounded-full text-xs ${frequencyBadge[item.frequency]!.class}`}>
                    {frequencyBadge[item.frequency]!.label}
                  </span>
                )}
                {item.associatedProcesses && item.associatedProcesses.length > 0 && (
                  expandedItem === item.id ? (
                    <ChevronUp className="w-4 h-4 text-primary flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  )
                )}
              </div>
            </div>

            {/* Expanded content with processes */}
            {expandedItem === item.id && item.associatedProcesses && (
              <div className="ml-4 pl-4 border-l-2 border-primary/20 space-y-2">
                {activeProcess?.itemId === item.id ? (
                  <EmbeddedProcessViewer 
                    process={activeProcess.process} 
                    onClose={closeProcess}
                    onMaximize={() => handleMaximize(item.id, activeProcess.process)}
                  />
                ) : (
                  <>
                    <p className="text-xs text-muted-foreground py-1">Procesos asociados:</p>
                    {item.associatedProcesses.map((proc) => (
                      <button
                        key={proc.id}
                        onClick={() => openProcess(item.id, proc)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg bg-background border border-border hover:border-primary/30 transition-colors text-left"
                      >
                        <div className="p-1.5 rounded-lg bg-primary/10">
                          <FileText className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{proc.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{proc.description}</p>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {proc.estimatedTime}
                        </div>
                        <ChevronRight className="w-4 h-4 text-primary" />
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}
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

      {/* Maximized Process Modal */}
      {maximizedProcess && (
        <ProcessViewerModal
          processId={maximizedProcess.processId}
          onClose={handleCloseMaximized}
        />
      )}
    </div>
  );
};