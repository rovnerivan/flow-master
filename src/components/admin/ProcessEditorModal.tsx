import React, { useState } from 'react';
import { X, Plus, Trash2, GripVertical, Save, Tag, AlertTriangle, Wrench, User, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { defaultTags, TagInfo } from '@/lib/processTags';
import { ExtendedContentEditor, ExtendedContentItem } from './ExtendedContentEditor';
import { MediaUploader } from './MediaUploader';
import { ProcessStatus } from './ProcessStatusModal';
import { 
  ProcessStep, 
  RiskLevel, 
  ProcessFrequency, 
  riskLevelConfig, 
  frequencyConfig,
  ChecklistItem 
} from '@/lib/processTypes';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface Process {
  id: string;
  name: string;
  description: string;
  steps: number;
  compliance: number;
  status: ProcessStatus;
  lastUpdated: string;
  tags?: string[];
  currentVersion?: string;
}

interface ProcessEditorModalProps {
  process: Process;
  onClose: () => void;
  onSave: (process: Process) => void;
  availableTags?: TagInfo[];
  onCreateTag?: (name: string) => void;
}

export const ProcessEditorModal: React.FC<ProcessEditorModalProps> = ({
  process,
  onClose,
  onSave,
  availableTags = defaultTags,
  onCreateTag,
}) => {
  const [formData, setFormData] = useState({
    name: process.name,
    description: process.description,
    importance: '',
    expectedResult: '',
    estimatedTime: '15',
    // Phase 1 fields
    owner: '',
    riskLevel: 'low' as RiskLevel,
    frequency: 'daily' as ProcessFrequency,
    requiredTools: '',
    successCriteria: '',
  });

  const [selectedTags, setSelectedTags] = useState<string[]>(process.tags || []);
  const [newTagName, setNewTagName] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);

  const [steps, setSteps] = useState<ProcessStep[]>([
    { 
      id: '1', 
      title: 'Paso 1', 
      description: 'Descripción del paso', 
      duration: '2', 
      isCritical: false,
      checklist: [],
      troubleshooting: ''
    },
  ]);

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(t => t !== tagId) 
        : [...prev, tagId]
    );
  };

  const addStep = () => {
    const newStep: ProcessStep = {
      id: Date.now().toString(),
      title: `Paso ${steps.length + 1}`,
      description: '',
      duration: '2',
      isCritical: false,
      checklist: [],
      troubleshooting: '',
    };
    setSteps([...steps, newStep]);
  };

  const updateStepExtendedContent = (stepId: string, content: ExtendedContentItem[]) => {
    setSteps(steps.map(s => s.id === stepId ? { ...s, extendedContent: content } : s));
  };

  const removeStep = (id: string) => {
    if (steps.length > 1) {
      setSteps(steps.filter((s) => s.id !== id));
    }
  };

  const updateStep = (id: string, field: keyof ProcessStep, value: any) => {
    setSteps(steps.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const addChecklistItem = (stepId: string) => {
    setSteps(steps.map(s => {
      if (s.id === stepId) {
        const newItem: ChecklistItem = { id: Date.now().toString(), text: '', checked: false };
        return { ...s, checklist: [...(s.checklist || []), newItem] };
      }
      return s;
    }));
  };

  const updateChecklistItem = (stepId: string, itemId: string, text: string) => {
    setSteps(steps.map(s => {
      if (s.id === stepId) {
        return {
          ...s,
          checklist: (s.checklist || []).map(item => 
            item.id === itemId ? { ...item, text } : item
          )
        };
      }
      return s;
    }));
  };

  const removeChecklistItem = (stepId: string, itemId: string) => {
    setSteps(steps.map(s => {
      if (s.id === stepId) {
        return { ...s, checklist: (s.checklist || []).filter(item => item.id !== itemId) };
      }
      return s;
    }));
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

            {/* Phase 1: Owner and Risk Level */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Responsable del proceso
                </label>
                <Input
                  value={formData.owner}
                  onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                  placeholder="Nombre del responsable"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Nivel de riesgo
                </label>
                <Select 
                  value={formData.riskLevel} 
                  onValueChange={(value: RiskLevel) => setFormData({ ...formData, riskLevel: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(riskLevelConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <span className={config.color}>{config.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Phase 1: Frequency and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Frecuencia esperada
                </label>
                <Select 
                  value={formData.frequency} 
                  onValueChange={(value: ProcessFrequency) => setFormData({ ...formData, frequency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(frequencyConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Tiempo estimado (minutos)</label>
                <Input
                  type="number"
                  value={formData.estimatedTime}
                  onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                  placeholder="15"
                  className="w-full"
                />
              </div>
            </div>

            {/* Phase 1: Required Tools */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                Herramientas/Recursos necesarios
              </label>
              <Input
                value={formData.requiredTools}
                onChange={(e) => setFormData({ ...formData, requiredTools: e.target.value })}
                placeholder="Ej: Computadora, escáner, etiquetadora (separados por coma)"
              />
              <p className="text-xs text-muted-foreground">Separa cada herramienta con una coma</p>
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
                {onCreateTag && !showTagInput && (
                  <button
                    type="button"
                    onClick={() => setShowTagInput(true)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-secondary text-muted-foreground hover:bg-secondary/80 flex items-center gap-1 border border-dashed border-border"
                  >
                    <Plus className="w-3 h-3" />
                    Nueva
                  </button>
                )}
              </div>
              {showTagInput && onCreateTag && (
                <div className="flex gap-2 items-center">
                  <Input
                    placeholder="Nombre de la etiqueta"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    className="h-8 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newTagName.trim()) {
                          onCreateTag(newTagName.trim());
                          setNewTagName('');
                          setShowTagInput(false);
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="hero"
                    onClick={() => {
                      if (newTagName.trim()) {
                        onCreateTag(newTagName.trim());
                        setNewTagName('');
                        setShowTagInput(false);
                      }
                    }}
                  >
                    Crear
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setNewTagName('');
                      setShowTagInput(false);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
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

            {/* Phase 1: Success Criteria */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Criterios de éxito</label>
              <Textarea
                value={formData.successCriteria}
                onChange={(e) => setFormData({ ...formData, successCriteria: e.target.value })}
                placeholder="¿Cómo saber si el proceso se completó correctamente?"
                rows={2}
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
                  className={cn(
                    "p-4 rounded-lg border bg-secondary/30 space-y-3",
                    step.isCritical ? "border-warning/50 bg-warning/5" : "border-border"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <GripVertical className="w-4 h-4 cursor-grab" />
                      <span className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium",
                        step.isCritical 
                          ? "bg-warning/20 text-warning" 
                          : "bg-primary/10 text-primary"
                      )}>
                        {step.isCritical ? '⚠️' : index + 1}
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

                  {/* Critical step toggle */}
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`critical-${step.id}`}
                      checked={step.isCritical}
                      onCheckedChange={(checked) => updateStep(step.id, 'isCritical', checked)}
                    />
                    <label 
                      htmlFor={`critical-${step.id}`}
                      className="text-sm text-muted-foreground cursor-pointer flex items-center gap-1"
                    >
                      <AlertTriangle className="w-3 h-3 text-warning" />
                      Marcar como punto crítico/precaución
                    </label>
                  </div>

                  <Textarea
                    value={step.description}
                    onChange={(e) => updateStep(step.id, 'description', e.target.value)}
                    placeholder="Descripción detallada del paso..."
                    rows={2}
                  />

                  {/* Media content for step */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <MediaUploader
                      type="video"
                      value={step.videoUrl || ''}
                      onChange={(url) => updateStep(step.id, 'videoUrl', url)}
                      label="Video del paso"
                    />
                    <MediaUploader
                      type="audio"
                      value={step.audioUrl || ''}
                      onChange={(url) => updateStep(step.id, 'audioUrl', url)}
                      label="Audio"
                    />
                    <MediaUploader
                      type="image"
                      value={step.imageUrl || ''}
                      onChange={(url) => updateStep(step.id, 'imageUrl', url)}
                      label="Imagen"
                    />
                    <MediaUploader
                      type="document"
                      value={step.documentUrl || ''}
                      onChange={(url) => updateStep(step.id, 'documentUrl', url)}
                      label="Documento"
                    />
                  </div>

                  {/* Checklist for step */}
                  <details className="group">
                    <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                      <Plus className="w-3 h-3 group-open:rotate-45 transition-transform" />
                      Checklist de verificación - {step.checklist?.length || 0} item(s)
                    </summary>
                    <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                      {(step.checklist || []).map((item) => (
                        <div key={item.id} className="flex items-center gap-2">
                          <Input
                            value={item.text}
                            onChange={(e) => updateChecklistItem(step.id, item.id, e.target.value)}
                            placeholder="Item de verificación..."
                            className="flex-1 h-8 text-sm"
                          />
                          <button
                            onClick={() => removeChecklistItem(step.id, item.id)}
                            className="p-1 rounded hover:bg-destructive/10 text-destructive"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => addChecklistItem(step.id)}
                        className="gap-1 text-xs"
                      >
                        <Plus className="w-3 h-3" />
                        Agregar item
                      </Button>
                    </div>
                  </details>

                  {/* Troubleshooting */}
                  <details className="group">
                    <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                      <Plus className="w-3 h-3 group-open:rotate-45 transition-transform" />
                      ¿Qué hacer si algo falla? (Troubleshooting)
                    </summary>
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <Textarea
                        value={step.troubleshooting || ''}
                        onChange={(e) => updateStep(step.id, 'troubleshooting', e.target.value)}
                        placeholder="Describe qué hacer si algo sale mal en este paso..."
                        rows={2}
                      />
                    </div>
                  </details>

                  {/* Extended version */}
                  <details className="group">
                    <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                      <Plus className="w-3 h-3 group-open:rotate-45 transition-transform" />
                      Versión extendida (opcional) - {step.extendedContent?.length || 0} elemento(s)
                    </summary>
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <p className="text-xs text-muted-foreground mb-3">
                        Añade videos, audios, imágenes, documentos, textos o enlaces para profundizar en este paso.
                      </p>
                      <ExtendedContentEditor
                        items={step.extendedContent || []}
                        onChange={(items) => updateStepExtendedContent(step.id, items)}
                      />
                    </div>
                  </details>
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
