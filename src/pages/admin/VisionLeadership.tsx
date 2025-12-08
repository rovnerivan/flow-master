import React, { useState } from 'react';
import { Plus, Video, Mic, FileText, Link2, MoreVertical, Edit, Trash2, Eye, Play, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CultureContent {
  id: string;
  title: string;
  type: 'video' | 'audio' | 'text' | 'link';
  content: string;
  category: string;
  createdAt: string;
  isActive: boolean;
  views: number;
}

const mockContents: CultureContent[] = [
  {
    id: '1',
    title: 'Nuestra visión para este trimestre: Enfoque en el cliente',
    type: 'text',
    content: 'Mensaje de visión trimestral...',
    category: 'Visión',
    createdAt: '2024-01-15',
    isActive: true,
    views: 45,
  },
  {
    id: '2',
    title: 'Celebrando nuestro primer año juntos',
    type: 'video',
    content: 'https://example.com/video.mp4',
    category: 'Celebración',
    createdAt: '2024-01-10',
    isActive: false,
    views: 38,
  },
  {
    id: '3',
    title: 'Mensaje de motivación semanal',
    type: 'audio',
    content: 'https://example.com/audio.mp3',
    category: 'Motivación',
    createdAt: '2024-01-08',
    isActive: false,
    views: 52,
  },
  {
    id: '4',
    title: 'Artículo: Liderazgo en tiempos de cambio',
    type: 'link',
    content: 'https://example.com/article',
    category: 'Recursos',
    createdAt: '2024-01-05',
    isActive: false,
    views: 29,
  },
];

const categories = ['Visión', 'Motivación', 'Celebración', 'Valores', 'Recursos', 'Anuncios'];

const getTypeIcon = (type: 'video' | 'audio' | 'text' | 'link') => {
  switch (type) {
    case 'video': return Video;
    case 'audio': return Mic;
    case 'text': return FileText;
    case 'link': return Link2;
  }
};

const getTypeColor = (type: 'video' | 'audio' | 'text' | 'link') => {
  switch (type) {
    case 'video': return 'bg-red-500/20 text-red-400';
    case 'audio': return 'bg-purple-500/20 text-purple-400';
    case 'text': return 'bg-blue-500/20 text-blue-400';
    case 'link': return 'bg-green-500/20 text-green-400';
  }
};

export const VisionLeadership: React.FC = () => {
  const [contents, setContents] = useState(mockContents);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreator, setShowCreator] = useState(false);
  const [selectedType, setSelectedType] = useState<'video' | 'audio' | 'text' | 'link'>('text');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Visión',
    url: '',
  });

  const filteredContents = contents.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = () => {
    if (!formData.title) {
      toast.error('Ingresa un título');
      return;
    }
    if (selectedType === 'text' && !formData.content) {
      toast.error('Ingresa el contenido del mensaje');
      return;
    }
    if ((selectedType === 'video' || selectedType === 'audio' || selectedType === 'link') && !formData.url) {
      toast.error('Ingresa la URL');
      return;
    }

    const newContent: CultureContent = {
      id: Date.now().toString(),
      title: formData.title,
      type: selectedType,
      content: selectedType === 'text' ? formData.content : formData.url,
      category: formData.category,
      createdAt: new Date().toISOString().split('T')[0],
      isActive: true,
      views: 0,
    };

    // Deactivate previous active content
    setContents(prev => prev.map(c => ({ ...c, isActive: false })));
    setContents(prev => [newContent, ...prev]);

    setFormData({ title: '', content: '', category: 'Visión', url: '' });
    setShowCreator(false);
    toast.success('Contenido publicado exitosamente');
  };

  const handleSetActive = (id: string) => {
    setContents(prev => prev.map(c => ({
      ...c,
      isActive: c.id === id
    })));
    toast.success('Contenido establecido como activo');
  };

  const handleDelete = (id: string) => {
    setContents(prev => prev.filter(c => c.id !== id));
    toast.success('Contenido eliminado');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Visión y Liderazgo</h1>
          <p className="text-muted-foreground">
            Crea contenido inspiracional para tu equipo
          </p>
        </div>
        <Button variant="hero" className="gap-2" onClick={() => setShowCreator(true)}>
          <Plus className="w-4 h-4" />
          Nuevo Mensaje
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar contenido..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContents.map((content) => {
          const TypeIcon = getTypeIcon(content.type);
          return (
            <div
              key={content.id}
              className={cn(
                "kpi-card hover:border-primary/30 transition-colors",
                content.isActive && "ring-2 ring-primary ring-offset-2 ring-offset-background"
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={cn("p-2 rounded-lg", getTypeColor(content.type))}>
                  <TypeIcon className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-2">
                  {content.isActive && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-success/20 text-success">
                      Activo
                    </span>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 rounded hover:bg-secondary">
                        <MoreVertical className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-card border border-border">
                      <DropdownMenuItem onClick={() => handleSetActive(content.id)}>
                        <Play className="w-4 h-4 mr-2" />
                        Establecer como activo
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Eye className="w-4 h-4 mr-2" />
                        Vista previa
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => handleDelete(content.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                {content.title}
              </h3>

              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="px-2 py-0.5 rounded-full bg-secondary text-xs">
                  {content.category}
                </span>
                <span>{content.createdAt}</span>
              </div>

              <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <span>{content.views} visualizaciones</span>
                <span className="capitalize">{content.type === 'text' ? 'Mensaje' : content.type}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredContents.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No hay contenido</h3>
          <p className="text-muted-foreground mb-4">
            Crea tu primer mensaje inspiracional para el equipo
          </p>
          <Button variant="hero" onClick={() => setShowCreator(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Crear contenido
          </Button>
        </div>
      )}

      {/* Creator Dialog */}
      <Dialog open={showCreator} onOpenChange={setShowCreator}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear mensaje de liderazgo</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 pt-4">
            {/* Type Selection */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Tipo de contenido
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { type: 'text' as const, icon: FileText, label: 'Texto' },
                  { type: 'video' as const, icon: Video, label: 'Video' },
                  { type: 'audio' as const, icon: Mic, label: 'Audio' },
                  { type: 'link' as const, icon: Link2, label: 'Enlace' },
                ].map(({ type, icon: Icon, label }) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={cn(
                      "p-3 rounded-xl border text-center transition-all",
                      selectedType === type
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card hover:border-primary/50"
                    )}
                  >
                    <Icon className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-xs">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Título
              </label>
              <Input
                placeholder="Ej: Mensaje de bienvenida al nuevo trimestre"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            {/* Category */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Categoría
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFormData(prev => ({ ...prev, category: cat }))}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm transition-colors",
                      formData.category === cat
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Content based on type */}
            {selectedType === 'text' ? (
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Contenido del mensaje
                </label>
                <Textarea
                  placeholder="Escribe tu mensaje inspiracional..."
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  rows={8}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Puedes usar **texto** para negrita y saltos de línea para párrafos
                </p>
              </div>
            ) : (
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  URL del {selectedType === 'video' ? 'video' : selectedType === 'audio' ? 'audio' : 'enlace'}
                </label>
                <Input
                  placeholder={
                    selectedType === 'video' 
                      ? 'https://youtube.com/watch?v=...' 
                      : selectedType === 'audio'
                      ? 'https://soundcloud.com/...'
                      : 'https://...'
                  }
                  value={formData.url}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                />
                {selectedType === 'video' && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Soporta YouTube, Vimeo, Loom y enlaces directos
                  </p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowCreator(false)}>
                Cancelar
              </Button>
              <Button variant="hero" className="flex-1" onClick={handleCreate}>
                Publicar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VisionLeadership;
