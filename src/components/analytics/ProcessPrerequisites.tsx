import React, { useState } from 'react';
import { Link2, Plus, X, ChevronRight, CheckCircle, AlertCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface Process {
  id: string;
  name: string;
  status: 'draft' | 'published' | 'under_review' | 'discontinued';
  isCompleted?: boolean;
}

interface ProcessPrerequisitesProps {
  currentProcessId: string;
  prerequisites: string[];
  onPrerequisitesChange: (prerequisites: string[]) => void;
  availableProcesses: Process[];
  readOnly?: boolean;
}

// For employee view - shows prerequisite status
interface PrerequisiteStatusProps {
  prerequisites: Process[];
  onProcessClick?: (processId: string) => void;
}

export const PrerequisiteStatus: React.FC<PrerequisiteStatusProps> = ({
  prerequisites,
  onProcessClick,
}) => {
  if (prerequisites.length === 0) return null;

  const allComplete = prerequisites.every(p => p.isCompleted);
  const completedCount = prerequisites.filter(p => p.isCompleted).length;

  return (
    <div className={cn(
      "p-4 rounded-xl border",
      allComplete 
        ? "bg-success/10 border-success/20" 
        : "bg-warning/10 border-warning/20"
    )}>
      <div className="flex items-center gap-2 mb-3">
        <Link2 className={cn("w-4 h-4", allComplete ? "text-success" : "text-warning")} />
        <span className="font-medium text-foreground">
          Procesos Previos Requeridos
        </span>
        <span className={cn(
          "ml-auto text-sm",
          allComplete ? "text-success" : "text-warning"
        )}>
          {completedCount}/{prerequisites.length} completados
        </span>
      </div>

      <div className="space-y-2">
        {prerequisites.map((process) => (
          <div 
            key={process.id}
            className={cn(
              "flex items-center gap-3 p-2 rounded-lg transition-colors",
              process.isCompleted 
                ? "bg-success/5" 
                : "bg-warning/5 cursor-pointer hover:bg-warning/10"
            )}
            onClick={() => !process.isCompleted && onProcessClick?.(process.id)}
          >
            {process.isCompleted ? (
              <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-warning flex-shrink-0" />
            )}
            <span className={cn(
              "flex-1 text-sm",
              process.isCompleted ? "text-muted-foreground line-through" : "text-foreground"
            )}>
              {process.name}
            </span>
            {!process.isCompleted && (
              <ChevronRight className="w-4 h-4 text-warning" />
            )}
          </div>
        ))}
      </div>

      {!allComplete && (
        <p className="text-xs text-warning mt-3">
          Debes completar los procesos anteriores antes de iniciar este.
        </p>
      )}
    </div>
  );
};

// For admin view - manage prerequisites
export const ProcessPrerequisitesEditor: React.FC<ProcessPrerequisitesProps> = ({
  currentProcessId,
  prerequisites,
  onPrerequisitesChange,
  availableProcesses,
  readOnly = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSelector, setShowSelector] = useState(false);

  const selectedProcesses = availableProcesses.filter(p => prerequisites.includes(p.id));
  const availableToAdd = availableProcesses.filter(
    p => p.id !== currentProcessId && 
    !prerequisites.includes(p.id) && 
    p.status === 'published' &&
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addPrerequisite = (processId: string) => {
    onPrerequisitesChange([...prerequisites, processId]);
  };

  const removePrerequisite = (processId: string) => {
    onPrerequisitesChange(prerequisites.filter(id => id !== processId));
  };

  if (readOnly) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
          <Link2 className="w-4 h-4" />
          Procesos previos requeridos
        </label>
        {selectedProcesses.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedProcesses.map(process => (
              <span 
                key={process.id}
                className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
              >
                {process.name}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Sin requisitos previos</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
          <Link2 className="w-4 h-4" />
          Procesos previos requeridos
        </label>
        {!showSelector && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowSelector(true)}
            className="h-7 text-xs gap-1"
          >
            <Plus className="w-3 h-3" />
            Agregar
          </Button>
        )}
      </div>

      {/* Selected prerequisites */}
      {selectedProcesses.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedProcesses.map(process => (
            <span 
              key={process.id}
              className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm flex items-center gap-2"
            >
              {process.name}
              <button
                onClick={() => removePrerequisite(process.id)}
                className="hover:bg-primary/20 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {selectedProcesses.length === 0 && !showSelector && (
        <p className="text-sm text-muted-foreground italic">
          Sin requisitos previos - El empleado puede iniciar directamente
        </p>
      )}

      {/* Selector */}
      {showSelector && (
        <div className="border border-border rounded-lg p-3 space-y-3 bg-secondary/30">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar proceso..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-8"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowSelector(false);
                setSearchQuery('');
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-1">
            {availableToAdd.length > 0 ? (
              availableToAdd.map(process => (
                <button
                  key={process.id}
                  type="button"
                  onClick={() => addPrerequisite(process.id)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-primary/10 text-sm text-foreground transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4 text-primary" />
                  {process.name}
                </button>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                {searchQuery ? 'No se encontraron procesos' : 'No hay más procesos disponibles'}
              </p>
            )}
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        El empleado deberá completar estos procesos antes de poder iniciar este.
      </p>
    </div>
  );
};

export default ProcessPrerequisitesEditor;
