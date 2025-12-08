import React, { useState } from 'react';
import { Bell, Search, MessageCircle, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MobileNav } from '@/components/layout/MobileNav';
import { DailyChecklist } from '@/components/mobile/DailyChecklist';
import { MicroLearningCard } from '@/components/mobile/MicroLearningCard';
import { ProcessCard } from '@/components/mobile/ProcessCard';
import { ProcessViewerModal } from '@/components/employee/ProcessViewerModal';
import { Logo } from '@/components/icons/Logo';
import { Button } from '@/components/ui/button';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { toast } from 'sonner';

const mockProcesses = [
  {
    id: '1',
    title: 'Cierre de Caja',
    description: 'Aprende el proceso completo de cierre diario de caja registradora.',
    progress: 75,
    totalSteps: 8,
    completedSteps: 6,
    estimatedTime: '15 min',
  },
  {
    id: '2',
    title: 'Atención al Cliente',
    description: 'Protocolo estándar para resolver quejas y consultas de clientes.',
    progress: 30,
    totalSteps: 10,
    completedSteps: 3,
    estimatedTime: '25 min',
  },
  {
    id: '3',
    title: 'Manejo de Inventario',
    description: 'Sistema de control y registro de inventario en almacén.',
    progress: 100,
    totalSteps: 6,
    completedSteps: 6,
    estimatedTime: '12 min',
    isCompleted: true,
  },
];

// Mock user data
const mockUser = {
  name: 'Carlos López',
  cargo: 'Operador de Caja',
  supervisor: 'María García',
  team: 'Equipo Ventas Norte',
};

const EmployeeDashboard: React.FC = () => {
  const [selectedProcess, setSelectedProcess] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if coming from supervisor view
  const fromSupervisor = location.state?.fromSupervisor;

  const handleSupport = () => {
    toast.info('Función de soporte próximamente disponible');
  };

  const handleProcessClick = (processId: string) => {
    setSelectedProcess(processId);
  };

  const handleBackToSupervisor = () => {
    navigate('/supervisor');
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-card border-b border-border">
        <div className="flex items-center justify-between px-4 h-16 max-w-lg mx-auto">
          {fromSupervisor ? (
            <Button variant="ghost" size="sm" onClick={handleBackToSupervisor} className="gap-2 text-primary">
              <ArrowLeft className="w-4 h-4" />
              Volver a Supervisor
            </Button>
          ) : (
            <Logo size="sm" />
          )}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Search className="w-5 h-5" />
            </Button>
            <NotificationBell />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-6 max-w-lg mx-auto space-y-6">
        {/* Greeting with name and cargo */}
        <div className="animate-slide-up">
          <h1 className="text-2xl font-bold text-foreground">
            ¡Hola, {mockUser.name}! 👋
          </h1>
          <p className="text-primary font-medium">{mockUser.cargo}</p>
          <p className="text-muted-foreground text-sm mt-1">
            Supervisor: {mockUser.supervisor}
          </p>
          <p className="text-muted-foreground mt-2">
            Tienes 3 tareas pendientes para hoy
          </p>
        </div>

        {/* Daily Checklist - KILLER FEATURE */}
        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <DailyChecklist />
        </div>

        {/* Micro-Learning Card */}
        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <MicroLearningCard
            title="Tip del día: Cómo manejar devoluciones rápidamente"
            duration="45 seg"
            category="Servicio"
          />
        </div>

        {/* Continue Learning Section */}
        <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Continúa aprendiendo
            </h2>
            <Button variant="ghost" size="sm" className="text-primary">
              Ver todos
            </Button>
          </div>

          <div className="space-y-3">
            {mockProcesses.map((process, index) => (
              <div
                key={process.id}
                className="animate-slide-up cursor-pointer"
                style={{ animationDelay: `${0.4 + index * 0.1}s` }}
                onClick={() => handleProcessClick(process.id)}
              >
                <ProcessCard {...process} />
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <MobileNav />

      {/* Floating Support Button */}
      <button
        onClick={handleSupport}
        className="fixed bottom-24 right-4 p-4 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:scale-105 z-40"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Process Viewer Modal */}
      {selectedProcess && (
        <ProcessViewerModal
          processId={selectedProcess}
          onClose={() => setSelectedProcess(null)}
        />
      )}
    </div>
  );
};

export default EmployeeDashboard;