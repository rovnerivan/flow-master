import React, { useState } from 'react';
import { Play, Clock, Heart, X, ChevronLeft, Video, FileText, Link2, Mic, History, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface CultureContent {
  id: string;
  title: string;
  type: 'video' | 'audio' | 'text' | 'link';
  content: string; // URL for video/audio/link, text content for text
  author: {
    name: string;
    role: 'owner' | 'admin' | 'supervisor';
    avatar?: string;
  };
  duration?: string;
  category: string;
  createdAt: string;
  isNew?: boolean;
}

interface CultureCardProps {
  content: CultureContent;
  onViewHistory?: () => void;
}

// Mock current content
const mockCurrentContent: CultureContent = {
  id: '1',
  title: 'Nuestra visión para este trimestre: Enfoque en el cliente',
  type: 'text',
  content: `Equipo,

Quiero compartir con ustedes nuestra visión para este trimestre. Nos enfocaremos en tres pilares fundamentales:

**1. El cliente siempre es primero**
Cada decisión que tomemos debe pasar por el filtro: "¿Esto beneficia a nuestros clientes?" Si la respuesta es sí, vamos adelante.

**2. Trabajo en equipo**
Somos más fuertes juntos. Celebremos los éxitos de los demás y apoyémonos en los momentos difíciles.

**3. Mejora continua**
Cada día es una oportunidad para ser mejores que ayer. No tengamos miedo de proponer ideas nuevas.

Confío plenamente en cada uno de ustedes. ¡Hagamos de este trimestre el mejor!

Con orgullo,
María González`,
  author: {
    name: 'María González',
    role: 'owner',
  },
  category: 'Visión',
  createdAt: '2024-01-15',
  isNew: true,
};

const mockHistory: CultureContent[] = [
  {
    id: '2',
    title: 'Celebrando nuestro primer año juntos',
    type: 'video',
    content: 'https://example.com/video.mp4',
    author: { name: 'Carlos Ruiz', role: 'admin' },
    duration: '3 min',
    category: 'Celebración',
    createdAt: '2024-01-10',
  },
  {
    id: '3',
    title: 'Mensaje de motivación semanal',
    type: 'audio',
    content: 'https://example.com/audio.mp3',
    author: { name: 'Ana Torres', role: 'supervisor' },
    duration: '2 min',
    category: 'Motivación',
    createdAt: '2024-01-08',
  },
  {
    id: '4',
    title: 'Artículo: Liderazgo en tiempos de cambio',
    type: 'link',
    content: 'https://example.com/article',
    author: { name: 'María González', role: 'owner' },
    category: 'Recursos',
    createdAt: '2024-01-05',
  },
];

const getRoleLabel = (role: 'owner' | 'admin' | 'supervisor') => {
  switch (role) {
    case 'owner': return 'Dueño/Socio';
    case 'admin': return 'Gerente';
    case 'supervisor': return 'Supervisor';
  }
};

const getRoleColor = (role: 'owner' | 'admin' | 'supervisor') => {
  switch (role) {
    case 'owner': return 'text-violet-400 bg-violet-500/10';
    case 'admin': return 'text-primary bg-primary/10';
    case 'supervisor': return 'text-amber-400 bg-amber-500/10';
  }
};

const getTypeIcon = (type: 'video' | 'audio' | 'text' | 'link') => {
  switch (type) {
    case 'video': return Video;
    case 'audio': return Mic;
    case 'text': return FileText;
    case 'link': return Link2;
  }
};

export const CultureCard: React.FC<CultureCardProps> = () => {
  const [showModal, setShowModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedContent, setSelectedContent] = useState<CultureContent>(mockCurrentContent);

  const handleWatch = () => {
    setSelectedContent(mockCurrentContent);
    setShowModal(true);
    setShowHistory(false);
  };

  const handleViewHistory = () => {
    setShowHistory(true);
    setShowModal(true);
  };

  const handleSelectHistoryItem = (item: CultureContent) => {
    setSelectedContent(item);
    setShowHistory(false);
  };

  const TypeIcon = getTypeIcon(mockCurrentContent.type);

  return (
    <>
      <div className="mobile-card overflow-hidden">
        {/* Gradient Header */}
        <div className="relative h-28 -mx-4 -mt-4 mb-4 bg-gradient-to-br from-violet-600 to-primary flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-glow opacity-50" />
          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className="p-3 rounded-full bg-background/20 backdrop-blur-sm">
              <Heart className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xs font-medium text-primary-foreground/80 uppercase tracking-wider">
              Cultura de la Empresa
            </span>
          </div>
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-background/5" />
          <div className="absolute -bottom-5 -left-5 w-20 h-20 rounded-full bg-background/5" />
          
          {/* New Badge */}
          {mockCurrentContent.isNew && (
            <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-success text-success-foreground text-xs font-medium">
              Nuevo
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 text-xs font-medium bg-violet-500/10 text-violet-400 rounded-full">
              {mockCurrentContent.category}
            </span>
            <div className="flex items-center gap-1">
              <TypeIcon className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground capitalize">{mockCurrentContent.type === 'text' ? 'Mensaje' : mockCurrentContent.type}</span>
            </div>
          </div>

          <h4 className="font-semibold text-foreground leading-snug line-clamp-2">{mockCurrentContent.title}</h4>

          {/* Author */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
              <User className="w-3 h-3 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-foreground">{mockCurrentContent.author.name}</span>
              <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium", getRoleColor(mockCurrentContent.author.role))}>
                {getRoleLabel(mockCurrentContent.author.role)}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="hero" size="sm" className="flex-1 gap-2" onClick={handleWatch}>
              <Play className="w-4 h-4" />
              Ver mensaje
            </Button>
            <Button variant="outline" size="sm" className="gap-1" onClick={handleViewHistory}>
              <History className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background">
          {/* Header */}
          <header className="flex items-center justify-between p-4 border-b border-border">
            <button
              onClick={() => {
                if (showHistory) {
                  setShowHistory(false);
                  setShowModal(false);
                } else {
                  setShowModal(false);
                }
              }}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <h1 className="font-semibold text-foreground">
              {showHistory ? 'Historial' : 'Cultura de la Empresa'}
            </h1>
            <button
              onClick={() => setShowModal(false)}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </header>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {showHistory ? (
              /* History View */
              <div className="p-4 space-y-3">
                <p className="text-sm text-muted-foreground mb-4">
                  Mensajes anteriores de liderazgo y cultura
                </p>
                {mockHistory.map((item) => {
                  const ItemIcon = getTypeIcon(item.type);
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectHistoryItem(item)}
                      className="w-full p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors text-left"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-secondary">
                          <ItemIcon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-foreground line-clamp-2">{item.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">{item.author.name}</span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">{item.createdAt}</span>
                            {item.duration && (
                              <>
                                <span className="text-xs text-muted-foreground">•</span>
                                <span className="text-xs text-muted-foreground">{item.duration}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Content View */
              <>
                {/* Media Placeholder */}
                {selectedContent.type === 'video' && (
                  <div className="aspect-video bg-gradient-to-br from-violet-500/20 to-primary/5 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-4">
                        <Play className="w-10 h-10 text-primary" />
                      </div>
                      <p className="text-sm text-muted-foreground">Video de {selectedContent.author.name}</p>
                    </div>
                  </div>
                )}

                {selectedContent.type === 'audio' && (
                  <div className="h-32 bg-gradient-to-br from-violet-500/20 to-primary/5 flex items-center justify-center">
                    <div className="flex items-center gap-4">
                      <button className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
                        <Play className="w-6 h-6 text-primary-foreground" />
                      </button>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">Audio mensaje</span>
                        <span className="text-xs text-muted-foreground">{selectedContent.duration}</span>
                      </div>
                    </div>
                  </div>
                )}

                {selectedContent.type === 'link' && (
                  <div className="p-6 bg-gradient-to-br from-violet-500/10 to-primary/5">
                    <a 
                      href={selectedContent.content}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:border-primary transition-colors"
                    >
                      <div className="p-3 rounded-lg bg-primary/10">
                        <Link2 className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground">Abrir enlace externo</p>
                        <p className="text-xs text-muted-foreground truncate">{selectedContent.content}</p>
                      </div>
                    </a>
                  </div>
                )}

                <div className="p-6 space-y-6">
                  {/* Title and Author */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-1 text-xs font-medium bg-violet-500/10 text-violet-400 rounded-full">
                        {selectedContent.category}
                      </span>
                      <span className="text-xs text-muted-foreground">{selectedContent.createdAt}</span>
                    </div>
                    <h2 className="text-xl font-bold text-foreground mb-3">
                      {selectedContent.title}
                    </h2>
                    
                    {/* Author Card */}
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                      <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center">
                        <User className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">{selectedContent.author.name}</p>
                        <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium", getRoleColor(selectedContent.author.role))}>
                          {getRoleLabel(selectedContent.author.role)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Text Content */}
                  {selectedContent.type === 'text' && (
                    <div className="prose prose-sm prose-invert max-w-none">
                      <div className="p-4 rounded-xl bg-secondary/50 space-y-4">
                        {selectedContent.content.split('\n\n').map((paragraph, index) => (
                          <p key={index} className="text-foreground whitespace-pre-line text-sm leading-relaxed">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={handleViewHistory}
                    >
                      <History className="w-4 h-4 mr-2" />
                      Ver historial
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
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};
