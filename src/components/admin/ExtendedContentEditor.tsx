import React, { useState, useRef } from 'react';
import { Plus, X, Video, FileAudio, Image, FileText, Link, File, Upload, Trash2, Loader2, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { uploadMediaFile, getMediaAcceptTypes, MediaType } from '@/lib/uploadMedia';
import { toast } from 'sonner';

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
  { type: 'video' as const, label: 'Video', icon: Video, placeholder: 'URL del video', mediaType: 'video' as MediaType },
  { type: 'audio' as const, label: 'Audio', icon: FileAudio, placeholder: 'URL del audio', mediaType: 'audio' as MediaType },
  { type: 'image' as const, label: 'Imagen', icon: Image, placeholder: 'URL de la imagen', mediaType: 'image' as MediaType },
  { type: 'document' as const, label: 'Documento', icon: File, placeholder: 'URL del documento', mediaType: 'document' as MediaType },
  { type: 'text' as const, label: 'Texto', icon: FileText, placeholder: 'Contenido de texto...', mediaType: null },
  { type: 'link' as const, label: 'Enlace', icon: Link, placeholder: 'https://...', mediaType: null },
];

type InputMode = 'none' | 'upload' | 'url';

export const ExtendedContentEditor: React.FC<ExtendedContentEditorProps> = ({
  items,
  onChange,
  className,
}) => {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [uploadingItemId, setUploadingItemId] = useState<string | null>(null);
  const [inputModes, setInputModes] = useState<{ [key: string]: InputMode }>({});
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

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
    // Clean up input mode
    setInputModes(prev => {
      const newModes = { ...prev };
      delete newModes[id];
      return newModes;
    });
  };

  const setInputMode = (itemId: string, mode: InputMode) => {
    setInputModes(prev => ({ ...prev, [itemId]: mode }));
  };

  const handleFileUpload = async (itemId: string, type: ExtendedContentItem['type'], e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const mediaType = contentTypes.find(t => t.type === type)?.mediaType;
    if (!mediaType) return;

    setUploadingItemId(itemId);
    try {
      const { url, error } = await uploadMediaFile(file, mediaType);
      if (error) {
        toast.error(error);
      } else {
        updateItem(itemId, 'content', url);
        setInputMode(itemId, 'none');
        toast.success('Archivo subido correctamente');
      }
    } catch {
      toast.error('Error al subir el archivo');
    } finally {
      setUploadingItemId(null);
    }
  };

  const getTypeInfo = (type: ExtendedContentItem['type']) => {
    return contentTypes.find(t => t.type === type)!;
  };

  const canUpload = (type: ExtendedContentItem['type']) => {
    return ['video', 'audio', 'image', 'document'].includes(type);
  };

  const renderMediaPreview = (item: ExtendedContentItem) => {
    switch (item.type) {
      case 'video':
        if (item.content.includes('youtube') || item.content.includes('youtu.be')) {
          return (
            <iframe
              src={item.content.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
              className="w-full aspect-video rounded"
              allowFullScreen
            />
          );
        }
        return <video src={item.content} controls className="w-full aspect-video rounded" />;
      case 'audio':
        return <audio src={item.content} controls className="w-full" />;
      case 'image':
        return <img src={item.content} alt="Preview" className="w-full max-h-40 object-cover rounded" />;
      case 'document':
        return (
          <a href={item.content} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline text-sm">
            <File className="w-4 h-4" />
            Ver documento
          </a>
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      {items.map((item) => {
        const typeInfo = getTypeInfo(item.type);
        const Icon = typeInfo.icon;
        const isUploading = uploadingItemId === item.id;
        const currentMode = inputModes[item.id] || 'none';
        const hasContent = !!item.content;
        
        return (
          <div key={item.id} className="p-4 rounded-lg border border-border bg-card space-y-3">
            {/* Header */}
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground flex-1">{typeInfo.label}</span>
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Título (opcional)</label>
              <Input
                placeholder="Ej: Tutorial completo"
                value={item.title || ''}
                onChange={(e) => updateItem(item.id, 'title', e.target.value)}
                className="text-sm"
              />
            </div>
            
            {/* Content based on type */}
            {item.type === 'text' ? (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Contenido</label>
                <Textarea
                  placeholder={typeInfo.placeholder}
                  value={item.content}
                  onChange={(e) => updateItem(item.id, 'content', e.target.value)}
                  rows={4}
                />
              </div>
            ) : item.type === 'link' ? (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">URL del enlace</label>
                  <Input
                    placeholder={typeInfo.placeholder}
                    value={item.content}
                    onChange={(e) => updateItem(item.id, 'content', e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Descripción (opcional)</label>
                  <Input
                    placeholder="Descripción del enlace"
                    value={item.description || ''}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                  />
                </div>
              </div>
            ) : canUpload(item.type) ? (
              <div className="space-y-3">
                {/* Hidden file input */}
                <input
                  ref={(el) => { fileInputRefs.current[item.id] = el; }}
                  type="file"
                  accept={getMediaAcceptTypes(typeInfo.mediaType!)}
                  onChange={(e) => handleFileUpload(item.id, item.type, e)}
                  className="hidden"
                />
                
                {hasContent ? (
                  /* Show preview when content exists */
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-muted-foreground">Contenido actual</label>
                      <button
                        type="button"
                        onClick={() => updateItem(item.id, 'content', '')}
                        className="text-xs text-destructive hover:underline flex items-center gap-1"
                      >
                        <X className="w-3 h-3" />
                        Eliminar
                      </button>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/50">
                      {renderMediaPreview(item)}
                      <p className="text-xs text-muted-foreground mt-2 truncate">{item.content}</p>
                    </div>
                  </div>
                ) : currentMode === 'none' ? (
                  /* Show upload/URL options */
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Agregar {typeInfo.label.toLowerCase()}</label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRefs.current[item.id]?.click()}
                        disabled={isUploading}
                        className="flex-1 gap-2"
                      >
                        {isUploading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                        Subir archivo
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setInputMode(item.id, 'url')}
                        className="flex-1 gap-2"
                      >
                        <Link2 className="w-4 h-4" />
                        Ingresar URL
                      </Button>
                    </div>
                  </div>
                ) : currentMode === 'url' ? (
                  /* Show URL input */
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-muted-foreground">URL del {typeInfo.label.toLowerCase()}</label>
                      <button
                        type="button"
                        onClick={() => setInputMode(item.id, 'none')}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Cancelar
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder={typeInfo.placeholder}
                        value={item.content}
                        onChange={(e) => updateItem(item.id, 'content', e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => fileInputRefs.current[item.id]?.click()}
                        disabled={isUploading}
                        title="O subir archivo"
                      >
                        {isUploading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Pega una URL o haz clic en el botón para subir un archivo
                    </p>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Contenido</label>
                <Input
                  placeholder={typeInfo.placeholder}
                  value={item.content}
                  onChange={(e) => updateItem(item.id, 'content', e.target.value)}
                />
              </div>
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
              const TypeIcon = type.icon;
              return (
                <button
                  key={type.type}
                  type="button"
                  onClick={() => addItem(type.type)}
                  className="flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-secondary transition-colors"
                >
                  <TypeIcon className="w-5 h-5 text-primary" />
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
