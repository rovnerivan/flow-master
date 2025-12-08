import React from 'react';
import { X, BarChart3 } from 'lucide-react';
import { ProcessAnalyticsDashboard } from './ProcessAnalyticsDashboard';

interface ProcessAnalyticsModalProps {
  processId: string;
  processName: string;
  onClose: () => void;
}

export const ProcessAnalyticsModal: React.FC<ProcessAnalyticsModalProps> = ({
  processId,
  processName,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl mx-4 bg-card border border-border rounded-2xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Analytics del Proceso</h2>
              <p className="text-sm text-muted-foreground">{processName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <ProcessAnalyticsDashboard 
            processId={processId} 
            processName={processName} 
          />
        </div>
      </div>
    </div>
  );
};

export default ProcessAnalyticsModal;
