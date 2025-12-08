import React, { useState } from 'react';
import { Plus, X, Video, FileAudio, Image, FileText, Link, File, Upload, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export interface ExtendedContentItem {
  id: string;
  type: 'video' | 'audio' | 'image' | 'document' | 'text' | 'link';
  title?: string;
  content: string; // URL for media, text content for text, URL for link
  description?: string;
}

interface ExtendedContentEditorProps {
  items: ExtendedContentItem[];
  onChange: (items: ExtendedContentItem[]) => void;
  className?: string;
}

const contentTypes = [
  { type: 'video' as const, label: 'Video', icon: Video, placeholder: 'URL del video (YouTube, Vimeo, etc.)' },
  { type: 'audio' as const, label: 'Audio', icon: FileAudio, placeholder: 'URL del archivo de audio' },
  { type: 'image' as const, label: 'Imagen', icon: Image, placeholder: 'URL de la imagen' },
  { type: 'document' as const, label: 'Documento', icon: File, placeholder: 'URL del documento (PDF, DOCX, etc.)' },
  { type: 'text' as const, label: 'Texto', icon: FileText, placeholder: 'Contenido de texto...' },
  { type: 'link' as const, label: 'Enlace', icon: Link, placeholder: 'https://...' },
];

export const ExtendedContentEditor: React.FC<ExtendedContentEditorProps> = ({
  items,
  onChange,
  className,
}) => {
  const [showAddMenu, setShowAddMenu] = useState(false);

  const addItem = (type: ExtendedContentItem['type']) => {
    const newItem: ExtendedContentItem = {
      id: Date.now().toString(),
      type,
      content: '',
      title: '',
    };
    onChange([...items, newItem]);
    setShowAddMenu(false);
  };

  const updateItem = (id: string, field: keyof ExtendedContentItem, value: string) => {
    onChange(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeItem = (id: string) => {
    onChange(items.filter(item => item.id !== id));
  };

  const getTypeInfo = (type: ExtendedContentItem['type']) => {
    return contentTypes.find(t => t.type === type)!;
  };

  return (
    <div className={cn("space-y-3", className)}>
      {items.map((item) => {
        const typeInfo = getTypeInfo(item.type);
        const Icon = typeInfo.icon;
        
        return (
          <div key={item.id} className="p-3 rounded-lg border border-border bg-card space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded bg-primary/10">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground flex-1">{typeInfo.label}</span>
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="p-1 rounded hover:bg-destructive/10 text-destructive transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            {/* Title (optional) */}
            <Input
              placeholder="Título (opcional)"
              value={item.title || ''}
              onChange={(e) => updateItem(item.id, 'title', e.target.value)}
              className="text-sm"
            />
            
            {/* Content based on type */}
            {item.type === 'text' ? (
              <Textarea
                placeholder={typeInfo.placeholder}
                value={item.content}
                onChange={(e) => updateItem(item.id, 'content', e.target.value)}
                rows={4}
              />
            ) : (
              <Input
                placeholder={typeInfo.placeholder}
                value={item.content}
                onChange={(e) => updateItem(item.id, 'content', e.target.value)}
              />
            )}
            
            {/* Description for links */}
            {item.type === 'link' && (
              <Input
                placeholder="Descripción del enlace (opcional)"
                value={item.description || ''}
                onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                className="text-sm"
              />
            )}
          </div>
        );
      })}

      {/* Add content button */}
      <div className="relative">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="gap-2 w-full border-dashed"
        >
          <Plus className="w-4 h-4" />
          Agregar contenido extendido
        </Button>
        
        {showAddMenu && (
          <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-card border border-border rounded-lg shadow-lg z-10 grid grid-cols-3 gap-2">
            {contentTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.type}
                  type="button"
                  onClick={() => addItem(type.type)}
                  className="flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-secondary transition-colors"
                >
                  <Icon className="w-5 h-5 text-primary" />
                  <span className="text-xs text-foreground">{type.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// Simple viewer component for employee view
interface ExtendedContentViewerProps {
  items: ExtendedContentItem[];
  className?: string;
}

export const ExtendedContentViewer: React.FC<ExtendedContentViewerProps> = ({
  items,
  className,
}) => {
  if (items.length === 0) return null;

  return (
    <div className={cn("space-y-4", className)}>
      {items.map((item) => {
        const typeInfo = contentTypes.find(t => t.type === item.type)!;
        const Icon = typeInfo.icon;

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
                <p className="text-foreground whitespace-pre-wrap">{item.content}</p>
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
