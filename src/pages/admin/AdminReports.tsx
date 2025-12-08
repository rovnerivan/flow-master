import React, { useState } from 'react';
import { FileText, Download, Calendar, Filter, Plus, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HierarchyFilter, HierarchySelection, matchesHierarchyFilter } from '@/components/admin/HierarchyFilter';
import { toast } from 'sonner';

interface Report {
  id: string;
  name: string;
  description: string;
  type: string;
  generatedAt: string;
  size: string;
}

const mockReports: Report[] = [
  {
    id: '1',
    name: 'Reporte Mensual - Enero 2024',
    description: 'Resumen completo de operaciones, errores, cumplimiento y métricas de tiempo del mes.',
    type: 'monthly',
    generatedAt: '2024-01-31',
    size: '2.4 MB',
  },
  {
    id: '2',
    name: 'Errores por Proceso - Enero',
    description: 'Detalle de todos los errores detectados, categorizados por proceso y empleado.',
    type: 'errors',
    generatedAt: '2024-01-31',
    size: '1.1 MB',
  },
  {
    id: '3',
    name: 'Cumplimiento del Equipo - Enero',
    description: 'Análisis del cumplimiento individual y grupal de procesos y tareas.',
    type: 'compliance',
    generatedAt: '2024-01-31',
    size: '890 KB',
  },
  {
    id: '4',
    name: 'Onboardings Completados - Enero',
    description: 'Estado y progreso de todos los procesos de onboarding del período.',
    type: 'onboarding',
    generatedAt: '2024-01-31',
    size: '650 KB',
  },
  {
    id: '5',
    name: 'Tiempo por Tarea - Enero',
    description: 'Desglose del tiempo dedicado a cada tipo de tarea por empleado.',
    type: 'time',
    generatedAt: '2024-01-31',
    size: '780 KB',
  },
];

const reportTypes = [
  { value: 'all', label: 'Todos los tipos' },
  { value: 'monthly', label: 'Mensual' },
  { value: 'errors', label: 'Errores' },
  { value: 'compliance', label: 'Cumplimiento' },
  { value: 'onboarding', label: 'Onboarding' },
  { value: 'time', label: 'Tiempo' },
];

const AdminReports: React.FC = () => {
  const [selectedType, setSelectedType] = useState('all');
  const [downloading, setDownloading] = useState<string | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [hierarchyFilter, setHierarchyFilter] = useState<HierarchySelection>({ level: 'all' });

  const filteredReports = selectedType === 'all' 
    ? mockReports 
    : mockReports.filter(r => r.type === selectedType);

  const handleDownload = async (report: Report) => {
    setDownloading(report.id);
    
    // Simulate download
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Create a fake file download
    const blob = new Blob([`Reporte: ${report.name}\n\nContenido del reporte...`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.name.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setDownloading(null);
    toast.success(`"${report.name}" descargado`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reportes</h1>
          <p className="text-muted-foreground">
            Genera y descarga reportes de tu operación
          </p>
        </div>
        <Button variant="hero" className="gap-2" onClick={() => setShowGenerateModal(true)}>
          <Plus className="w-4 h-4" />
          Generar Reporte
        </Button>
      </div>

      {/* Hierarchy Filter */}
      <HierarchyFilter 
        value={hierarchyFilter}
        onChange={setHierarchyFilter}
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button variant="outline" className="gap-2">
          <Calendar className="w-4 h-4" />
          Rango de fechas
        </Button>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="h-10 px-3 rounded-md border border-input bg-background text-sm"
        >
          {reportTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Reports List */}
      <div className="kpi-card">
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="flex items-start justify-between p-4 rounded-lg border border-border hover:bg-secondary/30 transition-colors gap-4"
            >
              <div className="flex items-start gap-4 flex-1">
                <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground">{report.name}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {report.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Generado el {report.generatedAt} • {report.size}
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 shrink-0"
                onClick={() => handleDownload(report)}
                disabled={downloading === report.id}
              >
                {downloading === report.id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Descargando...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Descargar
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Generate Report Modal */}
      {showGenerateModal && (
        <GenerateReportModal onClose={() => setShowGenerateModal(false)} />
      )}
    </div>
  );
};

const GenerateReportModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [generating, setGenerating] = useState(false);
  const [formData, setFormData] = useState({
    type: 'monthly',
    startDate: '',
    endDate: '',
  });

  const handleGenerate = async () => {
    if (!formData.startDate || !formData.endDate) {
      toast.error('Selecciona las fechas del reporte');
      return;
    }
    
    setGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setGenerating(false);
    toast.success('Reporte generado exitosamente');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 bg-card border border-border rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">Generar Reporte</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo de reporte</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="monthly">Reporte Mensual Completo</option>
              <option value="errors">Reporte de Errores</option>
              <option value="compliance">Reporte de Cumplimiento</option>
              <option value="onboarding">Reporte de Onboardings</option>
              <option value="time">Reporte de Tiempo por Tarea</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Fecha inicio</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Fecha fin</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button 
            variant="hero" 
            onClick={handleGenerate} 
            className="flex-1 gap-2"
            disabled={generating}
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Generar
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;