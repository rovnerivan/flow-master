import React, { useState } from 'react';
import { Bell, Settings, Activity } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HierarchyFilter, HierarchySelection } from '@/components/admin/HierarchyFilter';
import AlertsConfigManager from '@/components/alerts/AlertsConfigManager';
import LiveAlertsFeed from '@/components/alerts/LiveAlertsFeed';

const AdminAlerts: React.FC = () => {
  const [hierarchyFilter, setHierarchyFilter] = useState<HierarchySelection>({ level: 'all' });
  const [activeTab, setActiveTab] = useState('live');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Sistema de Alertas</h1>
        <p className="text-muted-foreground">
          Monitoreo en tiempo real y configuración de reglas de alerta
        </p>
      </div>

      {/* Hierarchy Filter */}
      <HierarchyFilter 
        value={hierarchyFilter}
        onChange={setHierarchyFilter}
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="live" className="gap-2">
            <Activity className="w-4 h-4" />
            Alertas en Vivo
          </TabsTrigger>
          <TabsTrigger value="config" className="gap-2">
            <Settings className="w-4 h-4" />
            Configuración
          </TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="mt-6">
          <LiveAlertsFeed maxAlerts={20} showFilters={true} />
        </TabsContent>

        <TabsContent value="config" className="mt-6">
          <AlertsConfigManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAlerts;
