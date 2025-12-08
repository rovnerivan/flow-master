import React, { useState } from 'react';
import { AlertTriangle, Archive, X, CheckCircle, Clock, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export type ProcessStatus = 'draft' | 'published' | 'under_review' | 'discontinued';

interface ProcessStatusModalProps {
  open: boolean;
  onClose: () => void;
  currentStatus: ProcessStatus;
  processName: string;
  onStatusChange: (newStatus: ProcessStatus, details?: StatusChangeDetails) => void;
}

export interface StatusChangeDetails {
  reviewDescription?: string;
  reviewReason?: string;
  reviewRisks?: string;
  discontinuedReason?: string;
}

export const statusConfig: Record<ProcessStatus, { label: string; color: string; icon: React.ElementType; bgColor: string }> = {
  draft: { 
    label: 'Borrador', 
    color: 'text-warning', 
    icon: Clock,
    bgColor: 'bg-warning/20'
  },
  published: { 
    label: 'Publicado', 
    color: 'text-success', 
    icon: CheckCircle,
    bgColor: 'bg-success/20'
  },
  under_review: { 
    label: 'En Revisión', 
    color: 'text-orange-500', 
    icon: AlertTriangle,
    bgColor: 'bg-orange-500/20'
  },
  discontinued: { 
    label: 'Descontinuado', 
    color: 'text-muted-foreground', 
    icon: Archive,
    bgColor: 'bg-muted'
  },
};

export const ProcessStatusModal: React.FC<ProcessStatusModalProps> = ({
  open,
  onClose,
  currentStatus,
  processName,
  onStatusChange,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<ProcessStatus>(currentStatus);
  const [reviewDescription, setReviewDescription] = useState('');
  const [reviewReason, setReviewReason] = useState('');
  const [reviewRisks, setReviewRisks] = useState('');
  const [discontinuedReason, setDiscontinuedReason] = useState('');

  if (!open) return null;

  const handleConfirm = () => {
    const details: StatusChangeDetails = {};
    
    if (selectedStatus === 'under_review') {
      if (!reviewDescription.trim() || !reviewReason.trim()) {
        return; // validation
      }
      details.reviewDescription = reviewDescription;
      details.reviewReason = reviewReason;
      details.reviewRisks = reviewRisks;
    } else if (selectedStatus === 'discontinued') {
      if (!discontinuedReason.trim()) {
        return; // validation
      }
      details.discontinuedReason = discontinuedReason;
    }
    
    onStatusChange(selectedStatus, details);
  };

  const isValid = () => {
    if (selectedStatus === 'under_review') {
      return reviewDescription.trim() && reviewReason.trim();
    }
    if (selectedStatus === 'discontinued') {
      return discontinuedReason.trim();
    }
    return true;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg mx-4 bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Cambiar Estado</h2>
            <p className="text-sm text-muted-foreground mt-1">{processName}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Options */}
          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(statusConfig) as ProcessStatus[]).map((status) => {
              const config = statusConfig[status];
              const Icon = config.icon;
              const isSelected = selectedStatus === status;
              
              return (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className={cn("p-2 rounded-full", config.bgColor)}>
                    <Icon className={cn("w-5 h-5", config.color)} />
                  </div>
                  <span className={cn(
                    "text-sm font-medium",
                    isSelected ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {config.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Under Review Details */}
          {selectedStatus === 'under_review' && (
            <div className="space-y-4 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <div className="flex items-center gap-2 text-orange-500">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">Información de Revisión</span>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  ¿Qué se está revisando? *
                </label>
                <Textarea
                  value={reviewDescription}
                  onChange={(e) => setReviewDescription(e.target.value)}
                  placeholder="Ej: Se está revisando el paso 3 sobre manejo de productos..."
                  rows={2}
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  ¿Por qué se revisa? *
                </label>
                <Textarea
                  value={reviewReason}
                  onChange={(e) => setReviewReason(e.target.value)}
                  placeholder="Ej: Se detectaron inconsistencias en el procedimiento actual..."
                  rows={2}
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Riesgos a considerar durante la revisión
                </label>
                <Textarea
                  value={reviewRisks}
                  onChange={(e) => setReviewRisks(e.target.value)}
                  placeholder="Ej: Evitar saltar el paso de verificación, consultar con supervisor antes de..."
                  rows={2}
                  className="bg-background"
                />
                <p className="text-xs text-muted-foreground">
                  Esta información será visible para los empleados afectados
                </p>
              </div>
            </div>
          )}

          {/* Discontinued Details */}
          {selectedStatus === 'discontinued' && (
            <div className="space-y-4 p-4 rounded-xl bg-muted/50 border border-border">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Archive className="w-5 h-5" />
                <span className="font-medium">Motivo de Descontinuación</span>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  ¿Por qué se descontinúa este proceso? *
                </label>
                <Textarea
                  value={discontinuedReason}
                  onChange={(e) => setDiscontinuedReason(e.target.value)}
                  placeholder="Ej: Este proceso fue absorbido por 'Nuevo Proceso de Logística' o ya no aplica a nuestras operaciones..."
                  rows={3}
                  className="bg-background"
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-border flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button 
            variant="hero" 
            onClick={handleConfirm} 
            className="flex-1"
            disabled={!isValid() || selectedStatus === currentStatus}
          >
            Confirmar Cambio
          </Button>
        </div>
      </div>
    </div>
  );
};