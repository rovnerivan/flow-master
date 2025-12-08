import React, { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, X, Loader2, Video, FileAudio, Image, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { uploadMediaFile, getMediaAcceptTypes, MediaType } from '@/lib/uploadMedia';
import { toast } from 'sonner';

interface MediaUploaderProps {
  type: MediaType;
  value: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
}

const typeConfig = {
  video: { icon: Video, label: 'Video', placeholder: 'URL del video (YouTube, Vimeo, etc.)' },
  audio: { icon: FileAudio, label: 'Audio', placeholder: 'URL del archivo de audio' },
  image: { icon: Image, label: 'Imagen', placeholder: 'URL de la imagen' },
  document: { icon: File, label: 'Documento', placeholder: 'URL del documento' },
};

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  type,
  value,
  onChange,
  label,
  className,
}) => {
  const [mode, setMode] = useState<'none' | 'url' | 'upload'>('none');
  const [isUploading, setIsUploading] = useState(false);
  const [urlInput, setUrlInput] = useState(value || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const config = typeConfig[type];
  const Icon = config.icon;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { url, error } = await uploadMediaFile(file, type);
      if (error) {
        toast.error(error);
      } else {
        onChange(url);
        toast.success(`${config.label} subido correctamente`);
        setMode('none');
      }
    } catch {
      toast.error('Error al subir el archivo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setMode('none');
    }
  };

  const handleRemove = () => {
    onChange('');
    setUrlInput('');
    setMode('none');
  };

  // If there's a value, show preview
  if (value) {
    return (
      <div className={cn("space-y-2", className)}>
        {label && <label className="text-sm font-medium text-foreground">{label}</label>}
        <div className="relative rounded-lg border border-border bg-secondary/30 overflow-hidden">
          {type === 'video' && (
            <div className="aspect-video bg-black">
              {value.includes('youtube') || value.includes('youtu.be') ? (
                <iframe
                  src={value.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                  className="w-full h-full"
                  allowFullScreen
                />
              ) : value.includes('vimeo') ? (
                <iframe
                  src={value.replace('vimeo.com/', 'player.vimeo.com/video/')}
                  className="w-full h-full"
                  allowFullScreen
                />
              ) : (
                <video src={value} controls className="w-full h-full" />
              )}
            </div>
          )}
          {type === 'audio' && (
            <div className="p-4">
              <audio src={value} controls className="w-full" />
            </div>
          )}
          {type === 'image' && (
            <img src={value} alt="Preview" className="w-full max-h-48 object-cover" />
          )}
          {type === 'document' && (
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 hover:bg-secondary transition-colors"
            >
              <File className="w-8 h-8 text-primary" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{value.split('/').pop()}</p>
                <p className="text-sm text-muted-foreground">Haz clic para abrir</p>
              </div>
            </a>
          )}
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 hover:bg-background text-destructive transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && <label className="text-sm font-medium text-foreground">{label}</label>}
      
      <input
        ref={fileInputRef}
        type="file"
        accept={getMediaAcceptTypes(type)}
        onChange={handleFileChange}
        className="hidden"
      />

      {mode === 'none' && (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex-1 gap-2"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Subir {config.label}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setMode('url')}
            className="flex-1 gap-2"
          >
            <LinkIcon className="w-4 h-4" />
            URL
          </Button>
        </div>
      )}

      {mode === 'url' && (
        <div className="flex gap-2">
          <Input
            placeholder={config.placeholder}
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
          />
          <Button type="button" size="sm" variant="hero" onClick={handleUrlSubmit}>
            Añadir
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => setMode('none')}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {isUploading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Subiendo archivo...
        </div>
      )}
    </div>
  );
};
