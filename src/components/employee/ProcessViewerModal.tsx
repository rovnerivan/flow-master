import React, { useState } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Clock,
  Target,
  AlertCircle,
  CheckCircle,
  FileText,
  ChevronsDown,
  ArrowRight,
  Video,
  FileAudio,
  Image,
  File,
  Link,
  AlertTriangle,
  Wrench,
  User,
  HelpCircle,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { 
  ProcessStep, 
  ExtendedContentItem, 
  riskLevelConfig, 
  frequencyConfig,
  RiskLevel,
  ProcessFrequency,
  ChecklistItem
} from '@/lib/processTypes';

interface ProcessViewerModalProps {
  processId: string;
  onClose: () => void;
}

// Mock process data with Phase 1 features
const mockProcess = {
  id: '1',
  name: 'Preparación de Pedidos',
  description:
    'Este proceso es fundamental para garantizar que cada cliente reciba exactamente lo que ordenó, en las mejores condiciones posibles.',
  importance:
    'La preparación correcta de pedidos impacta directamente en: satisfacción del cliente, costos de devolución, reputación de la empresa.',
  expectedResult:
    'Cada pedido saldrá verificado, bien empacado, y listo para entrega sin errores.',
  estimatedTime: '15 min',
  totalSteps: 8,
  // Phase 1 fields
  owner: 'María García',
  riskLevel: 'medium' as RiskLevel,
  frequency: 'daily' as ProcessFrequency,
  requiredTools: ['Computadora', 'Escáner', 'Etiquetadora', 'Cinta de empaque'],
  successCriteria: 'Pedido empacado correctamente, etiqueta legible, sin productos dañados',
  steps: [
    {
      id: 's1',
      number: 1,
      title: 'Recibir y revisar la orden',
      description:
        'Verifica que tengas la orden impresa o en el sistema. Revisa todos los items, cantidades y especificaciones especiales.',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800',
      duration: '2 min',
      isCritical: false,
      checklist: [
        { id: 'c1', text: 'Número de orden verificado' },
        { id: 'c2', text: 'Datos del cliente correctos' },
        { id: 'c3', text: 'Lista de items completa' },
      ],
      troubleshooting: 'Si la orden no aparece en el sistema, verifica con el supervisor antes de continuar.',
      extendedContent: [
        {
          id: 'e1',
          type: 'text' as const,
          title: 'Checklist de verificación',
          content: 'Al recibir la orden, asegúrate de verificar:\n\n1. Número de orden\n2. Datos del cliente\n3. Items solicitados',
        },
      ],
    },
    {
      id: 's2',
      number: 2,
      title: 'Localizar productos en almacén',
      description:
        'Ubica cada producto siguiendo el orden de la lista para optimizar el recorrido.',
      duration: '3 min',
      isCritical: false,
      checklist: [],
      extendedContent: [],
    },
    {
      id: 's3',
      number: 3,
      title: 'Verificar cantidades',
      description:
        'Cuenta cada producto y verifica que coincida exactamente con la orden.',
      duration: '2 min',
      isCritical: true,
      checklist: [
        { id: 'c4', text: 'Conteo físico realizado' },
        { id: 'c5', text: 'Cantidades coinciden con orden' },
      ],
      troubleshooting: 'Si faltan productos, documenta inmediatamente y notifica al supervisor.',
      extendedContent: [],
    },
    {
      id: 's4',
      number: 4,
      title: 'Inspección de calidad',
      description:
        'Revisa que cada producto esté en perfectas condiciones.',
      duration: '2 min',
      isCritical: true,
      checklist: [
        { id: 'c6', text: 'Empaque original intacto' },
        { id: 'c7', text: 'Sin daños visibles' },
        { id: 'c8', text: 'Fecha de vencimiento vigente' },
      ],
      troubleshooting: 'Productos dañados van al área de devoluciones. No incluir en el pedido.',
      extendedContent: [],
    },
  ],
};

// Extended content viewer component
const ExtendedContentViewer: React.FC<{ items: ExtendedContentItem[] }> = ({ items }) => {
  if (items.length === 0) return null;

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const iconMap = {
          video: Video,
          audio: FileAudio,
          image: Image,
          document: File,
          text: FileText,
          link: Link,
        };
        const Icon = iconMap[item.type];

        return (
          <div key={item.id} className="space-y-2">
            {item.title && (
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-primary" />
                <h4 className="font-medium text-foreground">{item.title}</h4>
              </div>
            )}
            
            {item.type === 'video' && item.content && (
              <div className="aspect-video rounded-lg overflow-hidden bg-secondary">
                {item.content.includes('youtube') || item.content.includes('youtu.be') ? (
                  <iframe
                    src={item.content.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                    className="w-full h-full"
                    allowFullScreen
                  />
                ) : (
                  <video src={item.content} controls className="w-full h-full" />
                )}
              </div>
            )}
            
            {item.type === 'text' && item.content && (
              <div className="p-4 rounded-lg bg-secondary/50">
                <p className="text-foreground whitespace-pre-wrap text-sm leading-relaxed">{item.content}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export const ProcessViewerModal: React.FC<ProcessViewerModalProps> = ({
  processId,
  onClose,
}) => {
  const [view, setView] = useState<'overview' | 'learning'>('overview');
  const [currentStep, setCurrentStep] = useState(0);
  const [showExtended, setShowExtended] = useState(false);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  const [practiceMode, setPracticeMode] = useState(false);
  const [stepChecklists, setStepChecklists] = useState<Record<string, Record<string, boolean>>>({});
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const process = mockProcess;
  const step = process.steps[currentStep];
  const riskConfig = riskLevelConfig[process.riskLevel];
  const freqConfig = frequencyConfig[process.frequency];

  const handleNext = () => {
    if (currentStep < process.steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setShowExtended(false);
      setShowTroubleshooting(false);
    } else {
      // Last step - show completion modal
      setShowCompletionModal(true);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setShowExtended(false);
      setShowTroubleshooting(false);
    }
  };

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    setShowExtended(false);
    setShowTroubleshooting(false);
    setView('learning');
  };

  const toggleChecklistItem = (stepId: string, itemId: string) => {
    setStepChecklists(prev => ({
      ...prev,
      [stepId]: {
        ...(prev[stepId] || {}),
        [itemId]: !prev[stepId]?.[itemId]
      }
    }));
  };

  const isChecklistComplete = (stepId: string, checklist: ChecklistItem[]) => {
    if (!checklist || checklist.length === 0) return true;
    return checklist.every(item => stepChecklists[stepId]?.[item.id]);
  };

  const progress = ((currentStep + 1) / process.steps.length) * 100;

  const handleComplete = (understood: boolean) => {
    setShowCompletionModal(false);
    if (understood) {
      if (!practiceMode) {
        // Register completion
        console.log('Process completed');
      }
      onClose();
    }
  };

  const renderCompletionModal = () => (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl p-6 max-w-sm mx-4 space-y-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {practiceMode ? '¡Práctica completada!' : '¿Entendiste todo?'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {practiceMode 
              ? 'Has completado el recorrido en modo práctica. No se registró tu progreso.'
              : 'Confirma si comprendiste todos los pasos del proceso.'}
          </p>
        </div>
        {!practiceMode && (
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => handleComplete(false)}
            >
              Tengo dudas
            </Button>
            <Button 
              variant="hero" 
              className="flex-1"
              onClick={() => handleComplete(true)}
            >
              Sí, entendí
            </Button>
          </div>
        )}
        {practiceMode && (
          <Button 
            variant="hero" 
            className="w-full"
            onClick={() => handleComplete(true)}
          >
            Cerrar
          </Button>
        )}
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="flex-1 overflow-y-auto">
      {/* Cover with risk level badge */}
      <div className="relative bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center p-8">
        <div className="text-center">
          <FileText className="w-16 h-16 text-primary/50 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Diagrama del proceso</p>
        </div>
        {/* Risk Level Badge */}
        <div className={cn(
          "absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium",
          riskConfig.bgColor, riskConfig.color
        )}>
          Riesgo {riskConfig.label}
        </div>
      </div>
      
      <div className="flex justify-center py-3 bg-background border-b border-border">
        <div className="flex flex-col items-center animate-bounce">
          <ChevronsDown className="w-6 h-6 text-primary" />
          <span className="text-xs text-muted-foreground">Desliza para ver más</span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Title and Description */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">{process.name}</h2>
          <p className="text-muted-foreground">{process.description}</p>
        </div>

        {/* Practice Mode Toggle */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-foreground">Modo práctica</span>
          </div>
          <button
            onClick={() => setPracticeMode(!practiceMode)}
            className={cn(
              "w-12 h-6 rounded-full transition-colors relative",
              practiceMode ? "bg-primary" : "bg-muted"
            )}
          >
            <div className={cn(
              "w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform",
              practiceMode ? "translate-x-6" : "translate-x-0.5"
            )} />
          </button>
        </div>
        {practiceMode && (
          <p className="text-xs text-muted-foreground -mt-4">
            En modo práctica puedes recorrer el proceso sin que se registre tu progreso.
          </p>
        )}

        {/* Owner and Frequency */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-secondary/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <User className="w-4 h-4" />
              Responsable
            </div>
            <p className="font-semibold text-foreground">{process.owner}</p>
          </div>
          <div className="p-4 rounded-xl bg-secondary/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Clock className="w-4 h-4" />
              Frecuencia
            </div>
            <p className="font-semibold text-foreground">{freqConfig.label}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-secondary/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Clock className="w-4 h-4" />
              Tiempo estimado
            </div>
            <p className="font-semibold text-foreground">{process.estimatedTime}</p>
          </div>
          <div className="p-4 rounded-xl bg-secondary/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Target className="w-4 h-4" />
              Pasos totales
            </div>
            <p className="font-semibold text-foreground">{process.totalSteps} pasos</p>
          </div>
        </div>

        {/* Required Tools */}
        {process.requiredTools && process.requiredTools.length > 0 && (
          <div className="p-4 rounded-xl bg-secondary/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Wrench className="w-4 h-4" />
              Herramientas necesarias
            </div>
            <div className="flex flex-wrap gap-2">
              {process.requiredTools.map((tool, idx) => (
                <span key={idx} className="px-2 py-1 rounded-full bg-background text-xs text-foreground">
                  {tool}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Expected Result */}
        <div className="p-4 rounded-xl bg-success/10 border border-success/20">
          <div className="flex items-center gap-2 text-success mb-2">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Resultado Esperado</span>
          </div>
          <p className="text-sm text-foreground">{process.expectedResult}</p>
        </div>

        {/* Success Criteria */}
        {process.successCriteria && (
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-2 text-primary mb-2">
              <Target className="w-5 h-5" />
              <span className="font-medium">Criterios de éxito</span>
            </div>
            <p className="text-sm text-foreground">{process.successCriteria}</p>
          </div>
        )}

        {/* Importance */}
        <div className="p-4 rounded-xl bg-warning/10 border border-warning/20">
          <div className="flex items-center gap-2 text-warning mb-2">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">¿Por qué es importante?</span>
          </div>
          <p className="text-sm text-foreground">{process.importance}</p>
        </div>

        {/* Steps List */}
        <div>
          <h3 className="font-semibold text-foreground mb-3">Pasos del Proceso</h3>
          <div className="space-y-2">
            {process.steps.map((s, index) => (
              <div
                key={s.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                  s.isCritical 
                    ? "border-warning/30 bg-warning/5 hover:border-warning/50" 
                    : "border-border hover:border-primary/30"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0",
                  s.isCritical 
                    ? "bg-warning/20 text-warning" 
                    : "bg-primary/10 text-primary"
                )}>
                  {s.isCritical ? <AlertTriangle className="w-4 h-4" /> : index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm truncate">
                    {s.title}
                    {s.isCritical && <span className="ml-2 text-xs text-warning">(Crítico)</span>}
                  </p>
                  <p className="text-xs text-muted-foreground">{s.duration}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-xs text-primary shrink-0"
                  onClick={() => goToStep(index)}
                >
                  Ir al paso
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Start Learning Button */}
        <Button
          variant="hero"
          size="lg"
          className="w-full gap-2"
          onClick={() => setView('learning')}
        >
          <Play className="w-5 h-5" />
          {practiceMode ? 'Iniciar práctica' : 'Comenzar Aprendizaje'}
        </Button>
      </div>
    </div>
  );

  const renderLearning = () => (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Progress indicator */}
      <div className="p-4 bg-secondary/30 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Paso {currentStep + 1} de {process.steps.length}
            </span>
            {practiceMode && (
              <span className="px-2 py-0.5 rounded-full bg-muted text-xs text-muted-foreground">
                Práctica
              </span>
            )}
          </div>
          <span className="text-sm font-medium text-primary">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Mini step indicators */}
        <div className="flex gap-1 mt-3">
          {process.steps.map((s, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentStep(index);
                setShowExtended(false);
                setShowTroubleshooting(false);
              }}
              className={cn(
                "flex-1 h-1.5 rounded-full transition-colors cursor-pointer hover:opacity-80",
                index <= currentStep 
                  ? s.isCritical ? 'bg-warning' : 'bg-primary' 
                  : 'bg-border'
              )}
            />
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {showExtended && step.extendedContent && step.extendedContent.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Versión Extendida</h3>
            </div>
            <ExtendedContentViewer items={step.extendedContent} />
            <Button 
              variant="outline" 
              className="w-full gap-2 mt-4"
              onClick={() => setShowExtended(false)}
            >
              <ChevronLeft className="w-4 h-4" />
              Volver al paso
            </Button>
          </div>
        ) : showTroubleshooting && step.troubleshooting ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <HelpCircle className="w-5 h-5 text-warning" />
              <h3 className="text-lg font-semibold text-foreground">¿Qué hacer si algo falla?</h3>
            </div>
            <div className="p-4 rounded-xl bg-warning/10 border border-warning/20">
              <p className="text-foreground whitespace-pre-wrap">{step.troubleshooting}</p>
            </div>
            <Button 
              variant="outline" 
              className="w-full gap-2 mt-4"
              onClick={() => setShowTroubleshooting(false)}
            >
              <ChevronLeft className="w-4 h-4" />
              Volver al paso
            </Button>
          </div>
        ) : (
          <>
            {/* Critical Step Warning */}
            {step.isCritical && (
              <div className="p-3 rounded-xl bg-warning/10 border border-warning/20 mb-4 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
                <div>
                  <p className="font-medium text-warning text-sm">Punto crítico</p>
                  <p className="text-xs text-muted-foreground">Este paso requiere especial atención</p>
                </div>
              </div>
            )}

            {/* Step Video/Image */}
            {step.videoUrl ? (
              <div className="w-full rounded-xl overflow-hidden mb-4" style={{ aspectRatio: '16/9', maxHeight: '35vh' }}>
                {step.videoUrl.includes('youtube') || step.videoUrl.includes('youtu.be') ? (
                  <iframe
                    src={step.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                    className="w-full h-full"
                    allowFullScreen
                  />
                ) : (
                  <video src={step.videoUrl} controls className="w-full h-full bg-black" />
                )}
              </div>
            ) : step.imageUrl ? (
              <div className="w-full rounded-xl overflow-hidden mb-4" style={{ maxHeight: '35vh' }}>
                <img src={step.imageUrl} alt={step.title} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-full bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center mb-4" style={{ aspectRatio: '16/9', maxHeight: '35vh' }}>
                <div className="text-center">
                  <Play className="w-12 h-12 text-primary/50 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Sin contenido multimedia</p>
                </div>
              </div>
            )}

            {/* Step Title and Description */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                    step.isCritical 
                      ? "bg-warning text-warning-foreground" 
                      : "bg-primary text-primary-foreground"
                  )}>
                    {step.number}
                  </div>
                  <span className="text-sm text-muted-foreground">{step.duration}</span>
                </div>
                <h3 className="text-xl font-bold text-foreground">{step.title}</h3>
              </div>

              <p className="text-muted-foreground">{step.description}</p>

              {/* Checklist */}
              {step.checklist && step.checklist.length > 0 && (
                <div className="p-4 rounded-xl bg-secondary/50 space-y-3">
                  <p className="text-sm font-medium text-foreground">Verificación</p>
                  {step.checklist.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <Checkbox
                        id={item.id}
                        checked={stepChecklists[step.id]?.[item.id] || false}
                        onCheckedChange={() => toggleChecklistItem(step.id, item.id)}
                      />
                      <label 
                        htmlFor={item.id}
                        className={cn(
                          "text-sm cursor-pointer",
                          stepChecklists[step.id]?.[item.id] 
                            ? "text-muted-foreground line-through" 
                            : "text-foreground"
                        )}
                      >
                        {item.text}
                      </label>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                {step.extendedContent && step.extendedContent.length > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2 flex-1"
                    onClick={() => setShowExtended(true)}
                  >
                    <FileText className="w-4 h-4" />
                    Ver más
                  </Button>
                )}
                {step.troubleshooting && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2 flex-1"
                    onClick={() => setShowTroubleshooting(true)}
                  >
                    <HelpCircle className="w-4 h-4" />
                    ¿Problemas?
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Navigation */}
      {!showExtended && !showTroubleshooting && (
        <div className="p-4 border-t border-border shrink-0 bg-background">
          <div className="flex items-center justify-between gap-4">
            {currentStep > 0 ? (
              <Button variant="outline" onClick={handlePrev} className="gap-2">
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </Button>
            ) : (
              <div />
            )}

            <Button variant="hero" onClick={handleNext} className="gap-2">
              {currentStep === process.steps.length - 1 ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Finalizar
                </>
              ) : (
                <>
                  Siguiente
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border shrink-0">
        <button
          onClick={view === 'learning' ? () => setView('overview') : onClose}
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
        >
          {view === 'learning' ? (
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          ) : (
            <X className="w-5 h-5 text-muted-foreground" />
          )}
        </button>
        <h1 className="font-semibold text-foreground">
          {view === 'overview' ? 'Detalle del Proceso' : process.name}
        </h1>
        {view === 'learning' ? (
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        ) : (
          <div className="w-9" />
        )}
      </header>

      {view === 'overview' ? renderOverview() : renderLearning()}
      {showCompletionModal && renderCompletionModal()}
    </div>
  );
};
