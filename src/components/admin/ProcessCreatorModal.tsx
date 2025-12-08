import React, { useState, useRef } from 'react';
import { X, Upload, Mic, FileText, Plus, ArrowRight, Square, Loader2, FileAudio, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ProcessCreatorModalProps {
  open: boolean;
  onClose: () => void;
}

type CreationMethod = 'select' | 'manual' | 'upload' | 'record' | 'audio-complete' | 'audio-guided';

interface Step {
  id: string;
  title: string;
  description: string;
  duration: string;
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

export const ProcessCreatorModal: React.FC<ProcessCreatorModalProps> = ({
  open,
  onClose,
}) => {
  const [method, setMethod] = useState<CreationMethod>('select');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioFileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    importance: '',
    expectedResult: '',
    estimatedTime: '15',
  });

  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const [steps, setSteps] = useState<Step[]>([
    { id: '1', title: '', description: '', duration: '2' },
  ]);

  // Audio-guided form hooks - must be before conditional return
  const [recordingField, setRecordingField] = useState<string | null>(null);
  const [fieldRecordingTime, setFieldRecordingTime] = useState(0);
  const fieldTimerRef = useRef<NodeJS.Timeout | null>(null);

  if (!open) return null;

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(t => t !== tagId) 
        : [...prev, tagId]
    );
  };

  const resetState = () => {
    setMethod('select');
    setFormData({ name: '', description: '', importance: '', expectedResult: '', estimatedTime: '15' });
    setSteps([{ id: '1', title: '', description: '', duration: '2' }]);
    setSelectedTags([]);
    setAudioBlob(null);
    setUploadedFile(null);
    setIsRecording(false);
    setRecordingTime(0);
    setIsProcessing(false);
  };

  const handleCreate = () => {
    if (!formData.name) {
      toast.error('Ingresa un nombre para el proceso');
      return;
    }
    if (steps.some(s => !s.title.trim())) {
      toast.error('Todos los pasos deben tener un título');
      return;
    }
    toast.success('Proceso creado exitosamente');
    onClose();
    resetState();
  };

  const addStep = () => {
    setSteps([...steps, { 
      id: Date.now().toString(), 
      title: '', 
      description: '', 
      duration: '2' 
    }]);
  };

  const removeStep = (id: string) => {
    if (steps.length > 1) {
      setSteps(steps.filter(s => s.id !== id));
    }
  };

  const updateStep = (id: string, field: keyof Step, value: string) => {
    setSteps(steps.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  // Recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(t => t + 1);
      }, 1000);

      toast.success('Grabación iniciada');
    } catch (error) {
      toast.error('No se pudo acceder al micrófono. Verifica los permisos.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      toast.success('Grabación completada');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      toast.success(`Archivo "${file.name}" cargado`);
    }
  };

  const handleAudioFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioBlob(file);
      toast.success(`Audio "${file.name}" cargado`);
    }
  };

  const processWithAI = async () => {
    setIsProcessing(true);
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock AI response - would be replaced with actual n8n webhook call
    setFormData({
      name: 'Proceso generado por IA',
      description: 'Descripción generada automáticamente basada en el contenido proporcionado.',
      importance: 'Este proceso es fundamental para mantener la consistencia operativa.',
      expectedResult: 'Al completar este proceso, el resultado será consistente y de alta calidad.',
      estimatedTime: '10',
    });
    
    setSteps([
      { id: '1', title: 'Paso 1: Preparación', description: 'Preparar los materiales necesarios', duration: '2' },
      { id: '2', title: 'Paso 2: Ejecución', description: 'Realizar la tarea principal', duration: '5' },
      { id: '3', title: 'Paso 3: Verificación', description: 'Verificar que todo está correcto', duration: '3' },
    ]);

    setIsProcessing(false);
    setMethod('manual'); // Switch to manual for editing
    toast.success('¡Proceso generado! Ahora puedes editarlo.');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
                Completa el formulario paso a paso
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setMethod('audio-complete')}
          className="p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-all text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Mic className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-foreground">Grabar audio completo</h4>
              <p className="text-sm text-muted-foreground">
                Explica todo el proceso y la IA lo estructurará automáticamente
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setMethod('audio-guided')}
          className="p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-all text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-foreground">Formulario con audio por campo</h4>
              <p className="text-sm text-muted-foreground">
                Completa cada campo dictando o escribiendo
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
                Sube un PDF o documento y la IA lo estructurará
              </p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );

  const renderManualForm = () => (
    <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground border-b border-border pb-2">
          Información General
        </h3>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Nombre del proceso *</label>
          <Input
            placeholder="Ej: Preparación de Pedidos"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Descripción</label>
          <Textarea
            placeholder="Describe brevemente el proceso y su propósito..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">¿Por qué es importante?</label>
          <Textarea
            placeholder="Explica el impacto en la operación si no se hace bien..."
            value={formData.importance}
            onChange={(e) => setFormData({ ...formData, importance: e.target.value })}
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Resultado esperado</label>
          <Textarea
            placeholder="Al completar este proceso correctamente, el resultado será..."
            value={formData.expectedResult}
            onChange={(e) => setFormData({ ...formData, expectedResult: e.target.value })}
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Tiempo estimado (minutos)</label>
          <Input
            type="number"
            placeholder="15"
            value={formData.estimatedTime}
            onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
            className="w-32"
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <h3 className="font-semibold text-foreground">Pasos del Proceso</h3>
          <Button variant="outline" size="sm" onClick={addStep} className="gap-1">
            <Plus className="w-4 h-4" />
            Agregar paso
          </Button>
        </div>

        <div className="space-y-3">
          {steps.map((step, index) => (
            <div key={step.id} className="p-4 rounded-lg border border-border bg-secondary/20 space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary flex-shrink-0">
                  {index + 1}
                </span>
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
                  className="w-16"
                  placeholder="Min"
                />
                <span className="text-xs text-muted-foreground">min</span>
                {steps.length > 1 && (
                  <button
                    onClick={() => removeStep(step.id)}
                    className="p-1.5 rounded hover:bg-destructive/10 text-destructive transition-colors"
                  >
                    <X className="w-4 h-4" />
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

      <div className="flex gap-3 pt-4 border-t border-border">
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
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        onChange={handleFileUpload}
        className="hidden"
      />
      
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
      >
        <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="font-medium text-foreground mb-1">
          {uploadedFile ? uploadedFile.name : 'Arrastra un archivo aquí'}
        </p>
        <p className="text-sm text-muted-foreground">
          o haz clic para seleccionar (PDF, DOCX, TXT)
        </p>
      </div>

      {uploadedFile && (
        <div className="p-3 rounded-lg bg-success/10 border border-success/20 flex items-center gap-3">
          <FileText className="w-5 h-5 text-success" />
          <span className="text-sm text-foreground flex-1">{uploadedFile.name}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setUploadedFile(null)}
            className="text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setMethod('select')} className="flex-1">
          Volver
        </Button>
        <Button 
          variant="hero" 
          className="flex-1 gap-2" 
          disabled={!uploadedFile || isProcessing}
          onClick={processWithAI}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              Procesar con IA
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );

  const renderRecordForm = () => (
    <div className="space-y-4">
      <div className="border border-border rounded-xl p-8 text-center">
        <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 transition-colors ${
          isRecording ? 'bg-destructive/20 animate-pulse' : 'bg-primary/10'
        }`}>
          {isRecording ? (
            <Square className="w-8 h-8 text-destructive" />
          ) : (
            <Mic className="w-10 h-10 text-primary" />
          )}
        </div>
        
        {isRecording && (
          <p className="text-2xl font-mono font-bold text-foreground mb-2">
            {formatTime(recordingTime)}
          </p>
        )}
        
        <p className="font-medium text-foreground mb-1">
          {isRecording 
            ? 'Grabando... Haz clic para detener' 
            : audioBlob 
              ? 'Grabación completada' 
              : 'Haz clic para comenzar a grabar'}
        </p>
        <p className="text-sm text-muted-foreground">
          {isRecording 
            ? 'Explica el proceso completo con tu voz' 
            : 'La IA transcribirá y estructurará tu explicación'}
        </p>
      </div>

      {audioBlob && !isRecording && (
        <div className="p-3 rounded-lg bg-success/10 border border-success/20 flex items-center gap-3">
          <Mic className="w-5 h-5 text-success" />
          <span className="text-sm text-foreground flex-1">
            Audio grabado ({formatTime(recordingTime)})
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => { setAudioBlob(null); setRecordingTime(0); }}
            className="text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Option to upload existing audio */}
      <div className="text-center">
        <input
          ref={audioFileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleAudioFileUpload}
          className="hidden"
        />
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => audioFileInputRef.current?.click()}
          className="gap-2"
        >
          <FileAudio className="w-4 h-4" />
          O sube un archivo de audio existente
        </Button>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setMethod('select')} className="flex-1">
          Volver
        </Button>
        
        {!audioBlob ? (
          <Button 
            variant={isRecording ? "destructive" : "hero"}
            className="flex-1 gap-2"
            onClick={isRecording ? stopRecording : startRecording}
          >
            {isRecording ? (
              <>
                <Square className="w-4 h-4" />
                Detener grabación
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                Comenzar grabación
              </>
            )}
          </Button>
        ) : (
          <Button 
            variant="hero" 
            className="flex-1 gap-2"
            disabled={isProcessing}
            onClick={processWithAI}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                Procesar con IA
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );

  // Audio-guided form with microphone option per field

  const startFieldRecording = async (fieldName: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        // Simulate AI transcription
        toast.success('Procesando audio...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock transcription result
        const mockTranscriptions: Record<string, string> = {
          name: 'Proceso de Control de Calidad',
          description: 'Este proceso asegura que todos los productos cumplan con los estándares de calidad antes de su envío.',
          importance: 'Es fundamental para mantener la satisfacción del cliente y evitar devoluciones costosas.',
          expectedResult: 'Productos verificados y aprobados listos para distribución.',
        };
        
        if (fieldName in formData) {
          setFormData(prev => ({ ...prev, [fieldName]: mockTranscriptions[fieldName] || 'Texto transcrito del audio' }));
        }
        toast.success('Audio transcrito correctamente');
      };

      mediaRecorder.start();
      setRecordingField(fieldName);
      setFieldRecordingTime(0);

      fieldTimerRef.current = setInterval(() => {
        setFieldRecordingTime(t => t + 1);
      }, 1000);

      toast.success('Grabando...');
    } catch (error) {
      toast.error('No se pudo acceder al micrófono');
    }
  };

  const stopFieldRecording = () => {
    if (mediaRecorderRef.current && recordingField) {
      mediaRecorderRef.current.stop();
      setRecordingField(null);
      if (fieldTimerRef.current) {
        clearInterval(fieldTimerRef.current);
      }
    }
  };

  const renderAudioGuidedForm = () => (
    <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
      <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
        <p className="text-sm text-foreground">
          <strong>Tip:</strong> Haz clic en el ícono de micrófono junto a cada campo para dictar el contenido.
        </p>
      </div>

      {/* Basic Info with audio option */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground border-b border-border pb-2">
          Información General
        </h3>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Nombre del proceso *</label>
          <div className="flex gap-2">
            <Input
              placeholder="Ej: Preparación de Pedidos"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="flex-1"
            />
            <Button
              variant={recordingField === 'name' ? 'destructive' : 'outline'}
              size="icon"
              onClick={() => recordingField === 'name' ? stopFieldRecording() : startFieldRecording('name')}
            >
              {recordingField === 'name' ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
          </div>
          {recordingField === 'name' && (
            <p className="text-xs text-destructive animate-pulse">Grabando... {formatTime(fieldRecordingTime)}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Descripción</label>
          <div className="flex gap-2">
            <Textarea
              placeholder="Describe brevemente el proceso..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="flex-1"
            />
            <Button
              variant={recordingField === 'description' ? 'destructive' : 'outline'}
              size="icon"
              className="self-start"
              onClick={() => recordingField === 'description' ? stopFieldRecording() : startFieldRecording('description')}
            >
              {recordingField === 'description' ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
          </div>
          {recordingField === 'description' && (
            <p className="text-xs text-destructive animate-pulse">Grabando... {formatTime(fieldRecordingTime)}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">¿Por qué es importante?</label>
          <div className="flex gap-2">
            <Textarea
              placeholder="Explica el impacto..."
              value={formData.importance}
              onChange={(e) => setFormData({ ...formData, importance: e.target.value })}
              rows={2}
              className="flex-1"
            />
            <Button
              variant={recordingField === 'importance' ? 'destructive' : 'outline'}
              size="icon"
              className="self-start"
              onClick={() => recordingField === 'importance' ? stopFieldRecording() : startFieldRecording('importance')}
            >
              {recordingField === 'importance' ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
          </div>
          {recordingField === 'importance' && (
            <p className="text-xs text-destructive animate-pulse">Grabando... {formatTime(fieldRecordingTime)}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Resultado esperado</label>
          <div className="flex gap-2">
            <Textarea
              placeholder="Al completar correctamente..."
              value={formData.expectedResult}
              onChange={(e) => setFormData({ ...formData, expectedResult: e.target.value })}
              rows={2}
              className="flex-1"
            />
            <Button
              variant={recordingField === 'expectedResult' ? 'destructive' : 'outline'}
              size="icon"
              className="self-start"
              onClick={() => recordingField === 'expectedResult' ? stopFieldRecording() : startFieldRecording('expectedResult')}
            >
              {recordingField === 'expectedResult' ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
          </div>
          {recordingField === 'expectedResult' && (
            <p className="text-xs text-destructive animate-pulse">Grabando... {formatTime(fieldRecordingTime)}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Tiempo estimado (minutos)</label>
          <Input
            type="number"
            placeholder="15"
            value={formData.estimatedTime}
            onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
            className="w-32"
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <h3 className="font-semibold text-foreground">Pasos del Proceso</h3>
          <Button variant="outline" size="sm" onClick={addStep} className="gap-1">
            <Plus className="w-4 h-4" />
            Agregar paso
          </Button>
        </div>

        <div className="space-y-3">
          {steps.map((step, index) => (
            <div key={step.id} className="p-4 rounded-lg border border-border bg-secondary/20 space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary flex-shrink-0">
                  {index + 1}
                </span>
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
                  className="w-16"
                />
                <span className="text-xs text-muted-foreground">min</span>
                {steps.length > 1 && (
                  <button
                    onClick={() => removeStep(step.id)}
                    className="p-1.5 rounded hover:bg-destructive/10 text-destructive transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <Textarea
                  value={step.description}
                  onChange={(e) => updateStep(step.id, 'description', e.target.value)}
                  placeholder="Descripción del paso..."
                  rows={2}
                  className="flex-1"
                />
                <Button
                  variant={recordingField === `step-${step.id}` ? 'destructive' : 'outline'}
                  size="icon"
                  className="self-start"
                  onClick={() => {
                    if (recordingField === `step-${step.id}`) {
                      stopFieldRecording();
                    } else {
                      // Start recording for this step
                      startFieldRecording(`step-${step.id}`);
                    }
                  }}
                >
                  {recordingField === `step-${step.id}` ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
              </div>
              {recordingField === `step-${step.id}` && (
                <p className="text-xs text-destructive animate-pulse">Grabando... {formatTime(fieldRecordingTime)}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-border">
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-card border border-border rounded-2xl shadow-xl max-h-[90vh] overflow-hidden">
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
          {(method === 'record' || method === 'audio-complete') && renderRecordForm()}
          {method === 'audio-guided' && renderAudioGuidedForm()}
        </div>
      </div>
    </div>
  );
};