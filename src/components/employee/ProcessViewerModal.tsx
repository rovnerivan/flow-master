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
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExtendedContentItem {
  id: string;
  type: 'video' | 'audio' | 'image' | 'document' | 'text' | 'link';
  title?: string;
  content: string;
  description?: string;
}

interface ProcessViewerModalProps {
  processId: string;
  onClose: () => void;
}

// Mock process data with rich extended content
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
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      audioUrl: null,
      imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800',
      documentUrl: null,
      duration: '2 min',
      extendedContent: [
        {
          id: 'e1',
          type: 'text' as const,
          title: 'Checklist de verificación',
          content: 'Al recibir la orden, asegúrate de verificar lo siguiente:\n\n1. **Número de orden**: Confirma que coincida con el ticket impreso\n2. **Datos del cliente**: Nombre, dirección y teléfono de contacto\n3. **Items solicitados**: Lista completa con códigos SKU\n4. **Cantidades**: Verifica cada cantidad individualmente\n5. **Especificaciones especiales**: Notas de empaque, instrucciones de entrega, etc.',
        },
        {
          id: 'e2',
          type: 'link' as const,
          title: 'Guía completa de recepción',
          content: 'https://docs.example.com/recepcion-ordenes',
          description: 'Documentación detallada sobre el proceso de recepción',
        },
      ],
    },
    {
      id: 's2',
      number: 2,
      title: 'Localizar productos',
      description:
        'Ubica cada producto en el almacén siguiendo el orden de la lista para optimizar el recorrido.',
      videoUrl: null,
      duration: '3 min',
      extendedContent: [
        {
          id: 'e3',
          type: 'video' as const,
          title: 'Tutorial de navegación en almacén',
          content: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        },
        {
          id: 'e4',
          type: 'text' as const,
          title: 'Consejos para optimizar tiempo',
          content: 'Para optimizar el tiempo de recolección:\n\n1. **Organiza la ruta**: Revisa todas las ubicaciones antes de empezar\n2. **Sigue el patrón de pasillo**: Ve de izquierda a derecha, arriba hacia abajo\n3. **Usa el carro adecuado**: Selecciona según el tamaño del pedido\n4. **Verifica códigos**: Escanea cada producto al tomarlo\n5. **Productos pesados abajo**: Coloca items pesados en la base del carro',
        },
      ],
    },
    {
      id: 's3',
      number: 3,
      title: 'Verificar cantidades',
      description:
        'Cuenta cada producto y verifica que coincida exactamente con la orden. Marca cada item verificado.',
      videoUrl: null,
      duration: '2 min',
      extendedContent: [
        {
          id: 'e5',
          type: 'text' as const,
          content: 'La verificación de cantidades es crítica para evitar errores:\n\n1. **Cuenta física**: Cuenta cada unidad manualmente\n2. **Doble verificación**: Cuenta de nuevo si hay más de 5 unidades\n3. **Marca en lista**: Usa el sistema para confirmar cada item\n4. **Productos similares**: Presta atención extra a productos parecidos\n5. **Registro de faltantes**: Si falta stock, documenta inmediatamente\n\nError máximo permitido: 0%',
        },
      ],
    },
    {
      id: 's4',
      number: 4,
      title: 'Inspección de calidad',
      description:
        'Revisa que cada producto esté en perfectas condiciones. Descarta cualquier item dañado.',
      videoUrl: null,
      duration: '2 min',
      extendedContent: [
        {
          id: 'e6',
          type: 'image' as const,
          title: 'Ejemplo de productos aceptables vs rechazables',
          content: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=800',
        },
        {
          id: 'e7',
          type: 'text' as const,
          title: 'Criterios de inspección',
          content: 'Criterios de inspección de calidad:\n\n**Verificar:**\n- Empaque original intacto\n- Sin abolladuras ni roturas\n- Etiquetas legibles y completas\n- Fechas de vencimiento vigentes\n\n**Rechazar si:**\n- Empaque abierto o dañado\n- Producto vencido o próximo a vencer (menos de 30 días)\n- Etiqueta ilegible o faltante',
        },
      ],
    },
    {
      id: 's5',
      number: 5,
      title: 'Empaque adecuado',
      description:
        'Selecciona la caja o empaque apropiado según el tamaño y fragilidad de los productos.',
      videoUrl: null,
      duration: '2 min',
      extendedContent: [
        {
          id: 'e8',
          type: 'document' as const,
          title: 'Manual de empaque',
          content: 'https://example.com/manual-empaque.pdf',
        },
        {
          id: 'e9',
          type: 'text' as const,
          content: 'Guía de selección de empaque:\n\n**Cajas pequeñas (S)**: 1-5 items pequeños, peso < 2kg\n**Cajas medianas (M)**: 5-15 items, peso 2-5kg\n**Cajas grandes (L)**: 15+ items o bultos, peso 5-10kg\n**Sobres acolchados**: Items planos, documentos, accesorios pequeños',
        },
      ],
    },
    {
      id: 's6',
      number: 6,
      title: 'Protección de productos',
      description:
        'Añade material de protección para productos frágiles. Asegura que nada se mueva dentro del paquete.',
      videoUrl: null,
      duration: '1 min',
      extendedContent: [
        {
          id: 'e10',
          type: 'text' as const,
          content: 'Materiales de protección según tipo de producto:\n\n**Papel kraft**: Relleno general, productos no frágiles\n**Plástico burbuja**: Productos frágiles, electrónicos, vidrio\n**Esquineros de cartón**: Marcos, cuadros, pantallas\n**Separadores**: Múltiples productos frágiles en una caja\n\n**Test de agitación**: Sacude suavemente la caja. Si algo se mueve, añade más protección.',
        },
      ],
    },
    {
      id: 's7',
      number: 7,
      title: 'Etiquetado',
      description:
        'Coloca la etiqueta de envío correctamente visible. Añade etiquetas de "frágil" si aplica.',
      videoUrl: null,
      duration: '1 min',
      extendedContent: [
        {
          id: 'e11',
          type: 'text' as const,
          content: 'Protocolo de etiquetado:\n\n1. **Etiqueta principal**: Lado superior de la caja, completamente visible\n2. **Orientación**: Flechas "Este lado arriba" cuando aplique\n3. **Etiqueta frágil**: Dos lados opuestos de la caja\n4. **Código de barras**: Debe ser escaneable, sin arrugas\n5. **Duplicado interior**: Incluir copia de la orden dentro del paquete',
        },
      ],
    },
    {
      id: 's8',
      number: 8,
      title: 'Registro y confirmación',
      description:
        'Registra el pedido como preparado en el sistema. Coloca en el área de despacho correspondiente.',
      videoUrl: null,
      duration: '2 min',
      extendedContent: [
        {
          id: 'e12',
          type: 'audio' as const,
          title: 'Instrucciones de voz para registro',
          content: 'https://example.com/audio-registro.mp3',
        },
        {
          id: 'e13',
          type: 'text' as const,
          content: 'Pasos finales de registro:\n\n1. **Escanear código**: Confirmar preparación en sistema\n2. **Foto opcional**: Documentar estado del paquete si aplica\n3. **Zona de despacho**: Ubicar según transportista asignado\n4. **Prioridad**: Colocar envíos express al frente\n5. **Hora límite**: Verificar que llegue antes del corte de despacho\n\n**Confirmación exitosa**: El sistema debe mostrar estado "Listo para envío".',
        },
      ],
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
                ) : item.content.includes('vimeo') ? (
                  <iframe
                    src={item.content.replace('vimeo.com/', 'player.vimeo.com/video/')}
                    className="w-full h-full"
                    allowFullScreen
                  />
                ) : (
                  <video src={item.content} controls className="w-full h-full" />
                )}
              </div>
            )}
            
            {item.type === 'audio' && item.content && (
              <div className="p-4 rounded-lg bg-secondary/50">
                <audio src={item.content} controls className="w-full" />
              </div>
            )}
            
            {item.type === 'image' && item.content && (
              <div className="rounded-lg overflow-hidden">
                <img src={item.content} alt={item.title || 'Imagen'} className="w-full object-cover max-h-96" />
              </div>
            )}
            
            {item.type === 'document' && item.content && (
              <a
                href={item.content}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <File className="w-8 h-8 text-primary" />
                <div>
                  <p className="font-medium text-foreground">{item.title || 'Documento'}</p>
                  <p className="text-sm text-muted-foreground">Haz clic para abrir</p>
                </div>
              </a>
            )}
            
            {item.type === 'text' && item.content && (
              <div className="p-4 rounded-lg bg-secondary/50">
                <p className="text-foreground whitespace-pre-wrap text-sm leading-relaxed">{item.content}</p>
              </div>
            )}
            
            {item.type === 'link' && item.content && (
              <a
                href={item.content}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors"
              >
                <Link className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-primary">{item.title || item.content}</p>
                  {item.description && (
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  )}
                </div>
              </a>
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

  const process = mockProcess;
  const step = process.steps[currentStep];

  const handleNext = () => {
    if (currentStep < process.steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setShowExtended(false);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setShowExtended(false);
    }
  };

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    setShowExtended(false);
    setView('learning');
  };

  const toggleExtended = () => {
    setShowExtended(!showExtended);
  };

  const progress = ((currentStep + 1) / process.steps.length) * 100;

  const renderOverview = () => (
    <div className="flex-1 overflow-y-auto">
      {/* Cover/Diagram Placeholder */}
      <div className="relative bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center" style={{ minHeight: '200px', maxHeight: '40vh' }}>
        <div className="text-center py-8">
          <FileText className="w-16 h-16 text-primary/50 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Diagrama del proceso</p>
        </div>
      </div>
      
      {/* Scroll Indicator - Centered and more visible */}
      <div className="flex justify-center py-3 bg-background border-b border-border">
        <div className="flex flex-col items-center animate-bounce">
          <ChevronsDown className="w-6 h-6 text-primary" />
          <span className="text-xs text-muted-foreground">Desliza para ver más</span>
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
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm truncate">{s.title}</p>
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
          Comenzar Aprendizaje
        </Button>
      </div>
    </div>
  );

  const renderLearning = () => (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Progress indicator with diagram */}
      <div className="p-4 bg-secondary/30 shrink-0">
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
              onClick={() => {
                setCurrentStep(index);
                setShowExtended(false);
              }}
              className={`flex-1 h-1.5 rounded-full transition-colors cursor-pointer hover:opacity-80 ${
                index <= currentStep ? 'bg-primary' : 'bg-border'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4">
        {showExtended && step.extendedContent && step.extendedContent.length > 0 ? (
          /* Extended Content View */
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Versión Extendida</h3>
            </div>
            
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 mb-4">
              <h4 className="font-medium text-foreground mb-2">{step.title}</h4>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>

            {/* Rich Extended Content */}
            <ExtendedContentViewer items={step.extendedContent} />

            <Button 
              variant="outline" 
              className="w-full gap-2 mt-4"
              onClick={toggleExtended}
            >
              <ChevronLeft className="w-4 h-4" />
              Volver al paso
            </Button>
          </div>
        ) : (
          /* Normal Step View */
          <>
            {/* Step Video - Primary content */}
            {step.videoUrl ? (
              <div className="w-full rounded-xl overflow-hidden mb-4" style={{ aspectRatio: '16/9', maxHeight: '35vh' }}>
                {step.videoUrl.includes('youtube') || step.videoUrl.includes('youtu.be') ? (
                  <iframe
                    src={step.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                    className="w-full h-full"
                    allowFullScreen
                  />
                ) : step.videoUrl.includes('vimeo') ? (
                  <iframe
                    src={step.videoUrl.replace('vimeo.com/', 'player.vimeo.com/video/')}
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

            {/* Audio player if available */}
            {step.audioUrl && (
              <div className="p-3 rounded-lg bg-secondary/50 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileAudio className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Audio del paso</span>
                </div>
                <audio src={step.audioUrl} controls className="w-full" />
              </div>
            )}

            {/* Document link if available */}
            {step.documentUrl && (
              <a
                href={step.documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors mb-4"
              >
                <File className="w-6 h-6 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Documento adjunto</p>
                  <p className="text-xs text-muted-foreground">Haz clic para abrir</p>
                </div>
              </a>
            )}

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
              {step.extendedContent && step.extendedContent.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={toggleExtended}
                >
                  <FileText className="w-4 h-4" />
                  Ver versión extendida ({step.extendedContent.length} recurso{step.extendedContent.length > 1 ? 's' : ''})
                </Button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Navigation - Fixed at bottom */}
      {!showExtended && (
        <div className="p-4 border-t border-border shrink-0 bg-background">
          <div className="flex items-center justify-between gap-4">
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
        <div className="w-9" /> {/* Spacer for centering */}
      </header>

      {view === 'overview' ? renderOverview() : renderLearning()}
    </div>
  );
};
