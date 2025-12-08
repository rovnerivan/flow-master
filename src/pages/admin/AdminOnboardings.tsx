import React, { useState } from 'react';
import { UserPlus, Clock, CheckCircle, TrendingUp, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { HierarchyFilter, HierarchySelection } from '@/components/admin/HierarchyFilter';

const mockOnboardings = [
  {
    id: '1',
    name: 'Pedro Sánchez',
    email: 'pedro@empresa.com',
    startDate: '2024-01-10',
    progress: 65,
    completedProcesses: 4,
    totalProcesses: 6,
    avgTimePerProcess: '18 min',
    status: 'in_progress',
  },
  {
    id: '2',
    name: 'Laura Torres',
    email: 'laura@empresa.com',
    startDate: '2024-01-12',
    progress: 30,
    completedProcesses: 2,
    totalProcesses: 6,
    avgTimePerProcess: '22 min',
    status: 'in_progress',
  },
  {
    id: '3',
    name: 'Roberto Díaz',
    email: 'roberto@empresa.com',
    startDate: '2024-01-14',
    progress: 15,
    completedProcesses: 1,
    totalProcesses: 6,
    avgTimePerProcess: '25 min',
    status: 'in_progress',
  },
  {
    id: '4',
    name: 'Carmen Ruiz',
    email: 'carmen@empresa.com',
    startDate: '2024-01-08',
    progress: 100,
    completedProcesses: 6,
    totalProcesses: 6,
    avgTimePerProcess: '15 min',
    status: 'completed',
  },
  {
    id: '5',
    name: 'Diego Morales',
    email: 'diego@empresa.com',
    startDate: '2024-01-05',
    progress: 100,
    completedProcesses: 6,
    totalProcesses: 6,
    avgTimePerProcess: '12 min',
    status: 'completed',
  },
];

const AdminOnboardings: React.FC = () => {
  const [hierarchyFilter, setHierarchyFilter] = useState<HierarchySelection>({ level: 'all' });
  
  const activeOnboardings = mockOnboardings.filter((o) => o.status === 'in_progress');
  const completedOnboardings = mockOnboardings.filter((o) => o.status === 'completed');

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const getDaysSinceStart = (startDate: string) => {
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Onboardings</h1>
          <p className="text-muted-foreground">
            Seguimiento del progreso de nuevos empleados
          </p>
        </div>
      </div>

      {/* Hierarchy Filter */}
      <HierarchyFilter 
        value={hierarchyFilter}
        onChange={setHierarchyFilter}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="kpi-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <UserPlus className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{activeOnboardings.length}</p>
              <p className="text-sm text-muted-foreground">En progreso</p>
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{completedOnboardings.length}</p>
              <p className="text-sm text-muted-foreground">Completados este mes</p>
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">4.2 días</p>
              <p className="text-sm text-muted-foreground">Tiempo promedio</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Onboardings */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">En Progreso</h2>
        <div className="space-y-4">
          {activeOnboardings.map((onboarding) => (
            <div key={onboarding.id} className="kpi-card">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(onboarding.name)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-foreground">{onboarding.name}</h3>
                      <p className="text-sm text-muted-foreground">{onboarding.email}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Día {getDaysSinceStart(onboarding.startDate)}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Progreso</span>
                        <span className="font-medium text-foreground">{onboarding.progress}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${onboarding.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm">
                    <span className="text-muted-foreground">
                      {onboarding.completedProcesses}/{onboarding.totalProcesses} procesos
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {onboarding.avgTimePerProcess} promedio
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Completed Onboardings */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Completados Recientemente</h2>
        <div className="kpi-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Empleado</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Duración</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Tiempo promedio</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Estado</th>
              </tr>
            </thead>
            <tbody>
              {completedOnboardings.map((onboarding) => (
                <tr key={onboarding.id} className="border-b border-border last:border-0">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-success/10 text-success text-xs">
                          {getInitials(onboarding.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-foreground">{onboarding.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {getDaysSinceStart(onboarding.startDate)} días
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {onboarding.avgTimePerProcess}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-success/20 text-success">
                      Completado
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOnboardings;
