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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProgressRing } from '@/components/dashboard/ProgressRing';

interface ProcessViewerModalProps {
  processId: string;
  onClose: () => void;
}

// Mock process data
const mockProcess = {
  id: '1',
  name: 'Preparación de Pedidos',
  description:
    'Este proceso es fundamental para garantizar que cada cliente reciba exactamente lo que ordenó, en las mejores condiciones posibles. Un error aquí puede significar pérdida de clientes y costos adicionales.',
  importance:
    'La preparación correcta de pedidos impacta directamente en: satisfacción del cliente, costos de devolución, reputación de la empresa, y eficiencia operativa general.',
  expectedResult:
    'Al completar este proceso correctamente, cada pedido saldrá verificado, bien empacado, y listo para entrega sin errores.',
  estimatedTime: '15 min',
  totalSteps: 8,
  coverImage: null,
  steps: [
    {
      id: 's1',
      number: 1,
      title: 'Recibir y revisar la orden',
      description:
        'Verifica que tengas la orden impresa o en el sistema. Revisa todos los items, cantidades y especificaciones especiales.',
      videoUrl: null,
      duration: '2 min',
    },
    {
      id: 's2',
      number: 2,
      title: 'Localizar productos',
      description:
        'Ubica cada producto en el almacén siguiendo el orden de la lista para optimizar el recorrido.',
      videoUrl: null,
      duration: '3 min',
    },
    {
      id: 's3',
      number: 3,
      title: 'Verificar cantidades',
      description:
        'Cuenta cada producto y verifica que coincida exactamente con la orden. Marca cada item verificado.',
      videoUrl: null,
      duration: '2 min',
    },
    {
      id: 's4',
      number: 4,
      title: 'Inspección de calidad',
      description:
        'Revisa que cada producto esté en perfectas condiciones. Descarta cualquier item dañado.',
      videoUrl: null,
      duration: '2 min',
    },
    {
      id: 's5',
      number: 5,
      title: 'Empaque adecuado',
      description:
        'Selecciona la caja o empaque apropiado según el tamaño y fragilidad de los productos.',
      videoUrl: null,
      duration: '2 min',
    },
    {
      id: 's6',
      number: 6,
      title: 'Protección de productos',
      description:
        'Añade material de protección para productos frágiles. Asegura que nada se mueva dentro del paquete.',
      videoUrl: null,
      duration: '1 min',
    },
    {
      id: 's7',
      number: 7,
      title: 'Etiquetado',
      description:
        'Coloca la etiqueta de envío correctamente visible. Añade etiquetas de "frágil" si aplica.',
      videoUrl: null,
      duration: '1 min',
    },
    {
      id: 's8',
      number: 8,
      title: 'Registro y confirmación',
      description:
        'Registra el pedido como preparado en el sistema. Coloca en el área de despacho correspondiente.',
      videoUrl: null,
      duration: '2 min',
    },
  ],
};

export const ProcessViewerModal: React.FC<ProcessViewerModalProps> = ({
  processId,
  onClose,
}) => {
  const [view, setView] = useState<'overview' | 'learning'>('overview');
  const [currentStep, setCurrentStep] = useState(0);

  const process = mockProcess;
  const step = process.steps[currentStep];

  const handleNext = () => {
    if (currentStep < process.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    setView('learning');
  };

  const progress = ((currentStep + 1) / process.steps.length) * 100;

  const renderOverview = () => (
    <div className="flex-1 overflow-y-auto">
      {/* Cover/Diagram Placeholder */}
      <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-primary/50 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Diagrama del proceso</p>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce">
          <ChevronsDown className="w-6 h-6 text-primary" />
          <span className="text-xs text-muted-foreground mt-1">Desliza para ver más</span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Title and Description */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {process.name}
          </h2>
          <p className="text-muted-foreground">{process.description}</p>
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

        {/* Expected Result */}
        <div className="p-4 rounded-xl bg-success/10 border border-success/20">
          <div className="flex items-center gap-2 text-success mb-2">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Resultado Esperado</span>
          </div>
          <p className="text-sm text-foreground">{process.expectedResult}</p>
        </div>

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
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/30 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground text-sm">{s.title}</p>
                  <p className="text-xs text-muted-foreground">{s.duration}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-xs text-primary"
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
          Comenzar Aprendizaje
        </Button>
      </div>
    </div>
  );

  const renderLearning = () => (
    <div className="flex-1 flex flex-col">
      {/* Progress indicator with diagram */}
      <div className="p-4 bg-secondary/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            Paso {currentStep + 1} de {process.steps.length}
          </span>
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
          {process.steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`flex-1 h-1.5 rounded-full transition-colors cursor-pointer hover:opacity-80 ${
                index <= currentStep ? 'bg-primary' : 'bg-border'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Step Video/Content Placeholder */}
        <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center mb-6">
          <div className="text-center">
            <Play className="w-16 h-16 text-primary/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Video del paso</p>
          </div>
        </div>

        {/* Step Title and Description */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                {step.number}
              </div>
              <span className="text-sm text-muted-foreground">{step.duration}</span>
            </div>
            <h3 className="text-xl font-bold text-foreground">{step.title}</h3>
          </div>

          <p className="text-muted-foreground">{step.description}</p>

          {/* Extended Version Button */}
          <Button variant="outline" size="sm" className="gap-2">
            <FileText className="w-4 h-4" />
            Ver versión extendida
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-4 border-t border-border flex items-center justify-between gap-4">
        {currentStep > 0 ? (
          <Button
            variant="outline"
            onClick={handlePrev}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Paso anterior
          </Button>
        ) : (
          <div />
        )}

        {currentStep === process.steps.length - 1 ? (
          <Button variant="hero" onClick={onClose} className="gap-2">
            <CheckCircle className="w-4 h-4" />
            Completar
          </Button>
        ) : (
          <Button variant="hero" onClick={handleNext} className="gap-2">
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border">
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
        <div className="w-9" />
      </header>

      {/* Content */}
      {view === 'overview' ? renderOverview() : renderLearning()}
    </div>
  );
};