import React from 'react';
import { X, History, Clock, User, FileText, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export interface ProcessVersion {
  id: string;
  versionNumber: string;
  name: string;
  description?: string;
  stepsSnapshot?: any;
  createdBy?: string;
  createdByName?: string;
  createdAt: string;
  changeSummary?: string;
}

interface ProcessVersionHistoryProps {
  open: boolean;
  onClose: () => void;
  processName: string;
  currentVersion: string;
  versions: ProcessVersion[];
  onViewVersion?: (version: ProcessVersion) => void;
  onRestoreVersion?: (version: ProcessVersion) => void;
}

export const ProcessVersionHistory: React.FC<ProcessVersionHistoryProps> = ({
  open,
  onClose,
  processName,
  currentVersion,
  versions,
  onViewVersion,
  onRestoreVersion,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl mx-4 bg-card border border-border rounded-2xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <History className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Historial de Versiones</h2>
              <p className="text-sm text-muted-foreground">{processName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {versions.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Sin historial</h3>
              <p className="text-muted-foreground">
                Las versiones se guardarán cuando se edite el proceso
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {versions.map((version, index) => {
                const isCurrent = version.versionNumber === currentVersion;
                
                return (
                  <div
                    key={version.id}
                    className={cn(
                      "p-4 rounded-xl border transition-colors",
                      isCurrent
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold",
                          isCurrent
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-muted-foreground"
                        )}>
                          v{version.versionNumber}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">
                              Versión {version.versionNumber}
                            </span>
                            {isCurrent && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary">
                                Actual
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {format(new Date(version.createdAt), "d MMM yyyy, HH:mm", { locale: es })}
                            </span>
                            {version.createdByName && (
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {version.createdByName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {onViewVersion && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewVersion(version)}
                            className="gap-1"
                          >
                            Ver
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        )}
                        {!isCurrent && onRestoreVersion && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onRestoreVersion(version)}
                          >
                            Restaurar
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {version.changeSummary && (
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <div className="flex items-start gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                          <p className="text-sm text-muted-foreground">
                            {version.changeSummary}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-border">
          <Button variant="outline" onClick={onClose} className="w-full">
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
};