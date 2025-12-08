import React, { useState } from 'react';
import { X, Upload, Mic, FileText, Plus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface ProcessCreatorModalProps {
  open: boolean;
  onClose: () => void;
}

type CreationMethod = 'select' | 'manual' | 'upload' | 'record';

export const ProcessCreatorModal: React.FC<ProcessCreatorModalProps> = ({
  open,
  onClose,
}) => {
  const [method, setMethod] = useState<CreationMethod>('select');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  if (!open) return null;

  const handleCreate = () => {
    if (!formData.name) {
      toast.error('Ingresa un nombre para el proceso');
      return;
    }
    toast.success('Proceso creado exitosamente');
    onClose();
    setMethod('select');
    setFormData({ name: '', description: '' });
  };

  const renderMethodSelection = () => (
    <div className="space-y-4">
      <p className="text-muted-foreground">
        Selecciona cómo deseas crear el proceso
      </p>
      
      <div className="grid grid-cols-1 gap-3">
        <button
          onClick={() => setMethod('manual')}
          className="p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-all text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Plus className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-foreground">Crear manualmente</h4>
              <p className="text-sm text-muted-foreground">
                Define los pasos uno por uno
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setMethod('upload')}
          className="p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-all text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Upload className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-foreground">Subir documento</h4>
              <p className="text-sm text-muted-foreground">
                Sube un PDF y la IA lo estructurará
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setMethod('record')}
          className="p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-all text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Mic className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-foreground">Grabar explicación</h4>
              <p className="text-sm text-muted-foreground">
                Graba tu voz y la IA creará los pasos
              </p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );

  const renderManualForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Nombre del proceso
        </label>
        <Input
          placeholder="Ej: Preparación de Pedidos"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Descripción
        </label>
        <Textarea
          placeholder="Describe brevemente el proceso..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setMethod('select')} className="flex-1">
          Volver
        </Button>
        <Button variant="hero" onClick={handleCreate} className="flex-1 gap-2">
          Crear proceso
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  const renderUploadForm = () => (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
        <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="font-medium text-foreground mb-1">
          Arrastra un archivo aquí
        </p>
        <p className="text-sm text-muted-foreground">
          o haz clic para seleccionar (PDF, DOCX)
        </p>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setMethod('select')} className="flex-1">
          Volver
        </Button>
        <Button variant="hero" className="flex-1 gap-2" disabled>
          Procesar documento
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  const renderRecordForm = () => (
    <div className="space-y-4">
      <div className="border border-border rounded-xl p-8 text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Mic className="w-10 h-10 text-primary" />
        </div>
        <p className="font-medium text-foreground mb-1">
          Haz clic para comenzar a grabar
        </p>
        <p className="text-sm text-muted-foreground">
          Explica el proceso con tu voz y la IA lo transcribirá
        </p>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setMethod('select')} className="flex-1">
          Volver
        </Button>
        <Button variant="hero" className="flex-1 gap-2">
          Comenzar grabación
          <Mic className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-card border border-border rounded-2xl shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            Nuevo Proceso
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {method === 'select' && renderMethodSelection()}
          {method === 'manual' && renderManualForm()}
          {method === 'upload' && renderUploadForm()}
          {method === 'record' && renderRecordForm()}
        </div>
      </div>
    </div>
  );
};
