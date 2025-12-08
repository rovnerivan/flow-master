import React, { useState } from 'react';
import { X, Plus, Trash2, GripVertical, Save, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Process {
  id: string;
  name: string;
  description: string;
  steps: number;
  compliance: number;
  status: 'published' | 'draft';
  lastUpdated: string;
  tags?: string[];
}

interface Step {
  id: string;
  title: string;
  description: string;
  duration: string;
}

interface ProcessEditorModalProps {
  process: Process;
  onClose: () => void;
  onSave: (process: Process) => void;
}

// Available tags for the system
const availableTags = [
  { id: 'operaciones', name: 'Operaciones', color: 'bg-blue-500/20 text-blue-400' },
  { id: 'ventas', name: 'Ventas', color: 'bg-green-500/20 text-green-400' },
  { id: 'atencion', name: 'Atención al Cliente', color: 'bg-purple-500/20 text-purple-400' },
  { id: 'almacen', name: 'Almacén', color: 'bg-orange-500/20 text-orange-400' },
  { id: 'finanzas', name: 'Finanzas', color: 'bg-yellow-500/20 text-yellow-400' },
  { id: 'seguridad', name: 'Seguridad', color: 'bg-red-500/20 text-red-400' },
  { id: 'calidad', name: 'Calidad', color: 'bg-teal-500/20 text-teal-400' },
  { id: 'rrhh', name: 'RRHH', color: 'bg-pink-500/20 text-pink-400' },
];

export const ProcessEditorModal: React.FC<ProcessEditorModalProps> = ({
  process,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    name: process.name,
    description: process.description,
    importance: '',
    expectedResult: '',
    estimatedTime: '15',
  });

  const [selectedTags, setSelectedTags] = useState<string[]>(process.tags || []);

  const [steps, setSteps] = useState<Step[]>([
    { id: '1', title: 'Paso 1', description: 'Descripción del paso', duration: '2' },
  ]);

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(t => t !== tagId) 
        : [...prev, tagId]
    );
  };

  const addStep = () => {
    const newStep: Step = {
      id: Date.now().toString(),
      title: `Paso ${steps.length + 1}`,
      description: '',
      duration: '2',
    };
    setSteps([...steps, newStep]);
  };

  const removeStep = (id: string) => {
    if (steps.length > 1) {
      setSteps(steps.filter((s) => s.id !== id));
    }
  };

  const updateStep = (id: string, field: keyof Step, value: string) => {
    setSteps(steps.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error('El nombre es requerido');
      return;
    }
    onSave({
      ...process,
      name: formData.name,
      description: formData.description,
      steps: steps.length,
      tags: selectedTags,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl mx-4 bg-card border border-border rounded-2xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Editar Proceso</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Información Básica</h3>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Nombre del proceso</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Preparación de Pedidos"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Descripción</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe el propósito del proceso..."
                rows={3}
              />
            </div>

            {/* Tags Section */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Etiquetas
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                      selectedTags.includes(tag.id)
                        ? tag.color + " ring-2 ring-offset-2 ring-offset-card ring-primary"
                        : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                    )}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
              {selectedTags.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {selectedTags.length} etiqueta{selectedTags.length > 1 ? 's' : ''} seleccionada{selectedTags.length > 1 ? 's' : ''}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">¿Por qué es importante?</label>
                <Textarea
                  value={formData.importance}
                  onChange={(e) => setFormData({ ...formData, importance: e.target.value })}
                  placeholder="Impacto en la operación..."
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Resultado esperado</label>
                <Textarea
                  value={formData.expectedResult}
                  onChange={(e) => setFormData({ ...formData, expectedResult: e.target.value })}
                  placeholder="Al completar este proceso..."
                  rows={2}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Tiempo estimado (minutos)</label>
              <Input
                type="number"
                value={formData.estimatedTime}
                onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                placeholder="15"
                className="w-32"
              />
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Pasos del Proceso</h3>
              <Button variant="outline" size="sm" onClick={addStep} className="gap-1">
                <Plus className="w-4 h-4" />
                Agregar paso
              </Button>
            </div>

            <div className="space-y-3">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className="p-4 rounded-lg border border-border bg-secondary/30 space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <GripVertical className="w-4 h-4 cursor-grab" />
                      <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                        {index + 1}
                      </span>
                    </div>
                    <Input
                      value={step.title}
                      onChange={(e) => updateStep(step.id, 'title', e.target.value)}
                      placeholder="Título del paso"
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={step.duration}
                      onChange={(e) => updateStep(step.id, 'duration', e.target.value)}
                      placeholder="Min"
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">min</span>
                    {steps.length > 1 && (
                      <button
                        onClick={() => removeStep(step.id)}
                        className="p-2 rounded hover:bg-destructive/10 text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <Textarea
                    value={step.description}
                    onChange={(e) => updateStep(step.id, 'description', e.target.value)}
                    placeholder="Descripción detallada del paso..."
                    rows={2}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button variant="hero" onClick={handleSave} className="flex-1 gap-2">
            <Save className="w-4 h-4" />
            Guardar cambios
          </Button>
        </div>
      </div>
    </div>
  );
};