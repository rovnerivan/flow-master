import React from 'react';
import { BarChart3, TrendingUp, TrendingDown, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AdminAnalytics: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">
            Métricas detalladas de tu operación
          </p>
        </div>
        <Button variant="outline">Exportar datos</Button>
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="kpi-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Errores por Proceso
          </h3>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Gráfico de errores detectados</p>
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Tiempo Salvado por Mes
          </h3>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Gráfico de tiempo ahorrado</p>
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Cumplimiento por Empleado
          </h3>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Gráfico de cumplimiento</p>
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Tendencia de Errores
          </h3>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Gráfico de tendencia de errores</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
