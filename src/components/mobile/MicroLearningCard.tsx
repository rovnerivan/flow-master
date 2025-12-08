import React, { useState } from 'react';
import { Play, Clock, Sparkles, X, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MicroLearningProps {
  title: string;
  duration: string;
  thumbnail?: string;
  category: string;
}

// Mock micro-learning content
const mockMicroLearning = {
  title: 'Tip del día: Cómo manejar devoluciones rápidamente',
  duration: '45 seg',
  category: 'Servicio',
  videoUrl: null,
  script: `Las devoluciones son una oportunidad para fidelizar clientes. Sigue estos pasos:

1. **Escucha activamente** - Deja que el cliente explique su situación sin interrumpir.

2. **Valida su experiencia** - "Entiendo que esto es frustrante, vamos a resolverlo juntos."

3. **Ofrece soluciones** - Presenta opciones: cambio, crédito o reembolso según política.

4. **Actúa rápido** - Procesa la devolución en menos de 5 minutos.

5. **Cierra positivamente** - "¿Hay algo más en que pueda ayudarte hoy?"

Recuerda: Un cliente con una devolución bien manejada es más leal que uno que nunca tuvo problemas.`,
};

export const MicroLearningCard: React.FC<MicroLearningProps> = ({
  title,
  duration,
  category,
}) => {
  const [showModal, setShowModal] = useState(false);

  const handleWatch = () => {
    setShowModal(true);
  };

  return (
    <>
      <div className="mobile-card overflow-hidden">
        {/* Gradient Header */}
        <div className="relative h-28 -mx-4 -mt-4 mb-4 bg-gradient-primary flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-glow" />
          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className="p-3 rounded-full bg-background/20 backdrop-blur-sm">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xs font-medium text-primary-foreground/80 uppercase tracking-wider">
              Micro-Learning
            </span>
          </div>
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-background/5" />
          <div className="absolute -bottom-5 -left-5 w-20 h-20 rounded-full bg-background/5" />
        </div>

        {/* Content */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
              {category}
            </span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{duration}</span>
            </div>
          </div>

          <h4 className="font-semibold text-foreground leading-snug">{title}</h4>

          <Button variant="hero" size="sm" className="w-full gap-2" onClick={handleWatch}>
            <Play className="w-4 h-4" />
            Ver ahora
          </Button>
        </div>
      </div>

      {/* Micro Learning Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background">
          {/* Header */}
          <header className="flex items-center justify-between p-4 border-b border-border">
            <button
              onClick={() => setShowModal(false)}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <h1 className="font-semibold text-foreground">Micro-Learning</h1>
            <button
              onClick={() => setShowModal(false)}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </header>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Video/Content Placeholder */}
            <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <Play className="w-10 h-10 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">Video del tip</p>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Title and Meta */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                    {mockMicroLearning.category}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{mockMicroLearning.duration}</span>
                  </div>
                </div>
                <h2 className="text-xl font-bold text-foreground">
                  {mockMicroLearning.title}
                </h2>
              </div>

              {/* Script Content */}
              <div className="prose prose-sm prose-invert max-w-none">
                <div className="p-4 rounded-xl bg-secondary/50 space-y-4">
                  {mockMicroLearning.script.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="text-foreground whitespace-pre-line">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowModal(false)}
                >
                  Volver
                </Button>
                <Button
                  variant="hero"
                  className="flex-1 gap-2"
                  onClick={() => setShowModal(false)}
                >
                  Entendido ✓
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};