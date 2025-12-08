import React from 'react';
import { FileText, Download, Calendar, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

const mockReports = [
  {
    id: '1',
    name: 'Reporte Mensual - Enero 2024',
    type: 'monthly',
    generatedAt: '2024-01-31',
    size: '2.4 MB',
  },
  {
    id: '2',
    name: 'Errores por Proceso - Enero',
    type: 'errors',
    generatedAt: '2024-01-31',
    size: '1.1 MB',
  },
  {
    id: '3',
    name: 'Cumplimiento del Equipo - Enero',
    type: 'compliance',
    generatedAt: '2024-01-31',
    size: '890 KB',
  },
  {
    id: '4',
    name: 'Onboardings Completados - Enero',
    type: 'onboarding',
    generatedAt: '2024-01-31',
    size: '650 KB',
  },
];

const AdminReports: React.FC = () => {
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
        <Button variant="hero" className="gap-2">
          <FileText className="w-4 h-4" />
          Generar Reporte
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button variant="outline" className="gap-2">
          <Calendar className="w-4 h-4" />
          Rango de fechas
        </Button>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Tipo de reporte
        </Button>
      </div>

      {/* Reports List */}
      <div className="kpi-card">
        <div className="space-y-4">
          {mockReports.map((report) => (
            <div
              key={report.id}
              className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-secondary/30 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">{report.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Generado el {report.generatedAt} • {report.size}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                Descargar
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
