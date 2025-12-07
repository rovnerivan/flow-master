import React from 'react';
import { Bell, Search } from 'lucide-react';
import { MobileNav } from '@/components/layout/MobileNav';
import { DailyChecklist } from '@/components/mobile/DailyChecklist';
import { MicroLearningCard } from '@/components/mobile/MicroLearningCard';
import { ProcessCard } from '@/components/mobile/ProcessCard';
import { Logo } from '@/components/icons/Logo';
import { Button } from '@/components/ui/button';

const mockProcesses = [
  {
    title: 'Cierre de Caja',
    description: 'Aprende el proceso completo de cierre diario de caja registradora.',
    progress: 75,
    totalSteps: 8,
    completedSteps: 6,
    estimatedTime: '15 min',
  },
  {
    title: 'Atención al Cliente',
    description: 'Protocolo estándar para resolver quejas y consultas de clientes.',
    progress: 30,
    totalSteps: 10,
    completedSteps: 3,
    estimatedTime: '25 min',
  },
  {
    title: 'Manejo de Inventario',
    description: 'Sistema de control y registro de inventario en almacén.',
    progress: 100,
    totalSteps: 6,
    completedSteps: 6,
    estimatedTime: '12 min',
    isCompleted: true,
  },
];

const EmployeeDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-card border-b border-border">
        <div className="flex items-center justify-between px-4 h-16 max-w-lg mx-auto">
          <Logo size="sm" />
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Search className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-6 max-w-lg mx-auto space-y-6">
        {/* Greeting */}
        <div className="animate-slide-up">
          <h1 className="text-2xl font-bold text-foreground">
            ¡Hola, Carlos! 👋
          </h1>
          <p className="text-muted-foreground">
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
                key={process.title}
                className="animate-slide-up"
                style={{ animationDelay: `${0.4 + index * 0.1}s` }}
              >
                <ProcessCard {...process} />
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <MobileNav />
    </div>
  );
};

export default EmployeeDashboard;
