import React, { useState } from 'react';
import { 
  Search, 
  MessageCircle, 
  ArrowLeft, 
  Briefcase, 
  CheckCircle, 
  User as UserIcon,
  BookOpen,
  Users,
  Home,
  Settings,
  LogOut,
} from 'lucide-react';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import { MobileNav } from '@/components/layout/MobileNav';
import { DailyChecklist } from '@/components/mobile/DailyChecklist';
import { MicroLearningCard } from '@/components/mobile/MicroLearningCard';
import { ProcessCard } from '@/components/mobile/ProcessCard';
import { ProcessViewerModal } from '@/components/employee/ProcessViewerModal';
import { Logo } from '@/components/icons/Logo';
import { Button } from '@/components/ui/button';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

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

// Mock user data with cargo details
const mockUser = {
  name: 'Carlos López',
  email: 'carlos.lopez@empresa.com',
  cargo: 'Operador de Caja',
  supervisor: 'María García',
  team: 'Equipo Ventas Norte',
  hireDate: '2023-06-15',
  cargoDescription: 'Responsable de las operaciones de caja, incluyendo cobros, devoluciones y cuadre de efectivo. Atención directa al cliente en punto de venta.',
  responsibilities: [
    'Realizar cobros y devoluciones correctamente',
    'Mantener el área de caja limpia y ordenada',
    'Cuadrar caja al final del turno',
    'Atender consultas básicas de clientes',
    'Reportar incidencias al supervisor',
  ],
};

// Home Page
const EmployeeHome: React.FC<{ onProcessClick: (id: string) => void }> = ({ onProcessClick }) => {
  return (
    <div className="space-y-6">
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
              onClick={() => onProcessClick(process.id)}
            >
              <ProcessCard {...process} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Processes Page
const EmployeeProcesses: React.FC<{ onProcessClick: (id: string) => void }> = ({ onProcessClick }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mis Procesos</h1>
        <p className="text-muted-foreground">Capacitaciones asignadas a ti</p>
      </div>

      <div className="space-y-3">
        {mockProcesses.map((process) => (
          <div
            key={process.id}
            className="cursor-pointer"
            onClick={() => onProcessClick(process.id)}
          >
            <ProcessCard {...process} />
          </div>
        ))}
      </div>
    </div>
  );
};

// Team Page
const EmployeeTeam: React.FC = () => {
  const teamMembers = [
    { id: '1', name: 'Carlos López', cargo: 'Operador de Caja', isMe: true },
    { id: '2', name: 'Ana Martínez', cargo: 'Vendedora' },
    { id: '3', name: 'Pedro Sánchez', cargo: 'Almacenista' },
    { id: '4', name: 'Luis Ramírez', cargo: 'Vendedor' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mi Equipo</h1>
        <p className="text-muted-foreground">{mockUser.team}</p>
      </div>

      <div className="mobile-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">Supervisor</p>
            <p className="text-primary">{mockUser.supervisor}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-foreground">Compañeros de equipo</h3>
        {teamMembers.map((member) => (
          <div 
            key={member.id} 
            className={cn(
              "mobile-card flex items-center gap-3",
              member.isMe && "border-primary/30 bg-primary/5"
            )}
          >
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">
                {member.name}
                {member.isMe && <span className="text-primary text-xs ml-2">(Tú)</span>}
              </p>
              <p className="text-sm text-muted-foreground">{member.cargo}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Profile Page with Mi Cargo
const EmployeeProfile: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'profile' | 'cargo'>('profile');

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Sesión cerrada');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error al cerrar sesión');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mi Perfil</h1>
        <p className="text-muted-foreground">Información personal y de cargo</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 p-1 rounded-xl bg-secondary/50">
        <button
          onClick={() => setActiveTab('profile')}
          className={cn(
            "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors",
            activeTab === 'profile' 
              ? "bg-background text-foreground shadow-sm" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Datos Personales
        </button>
        <button
          onClick={() => setActiveTab('cargo')}
          className={cn(
            "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors",
            activeTab === 'cargo' 
              ? "bg-background text-foreground shadow-sm" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Mi Cargo
        </button>
      </div>

      {activeTab === 'profile' ? (
        /* Profile Tab */
        <div className="space-y-4">
          <div className="mobile-card">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <UserIcon className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">{mockUser.name}</h2>
                <p className="text-primary">{mockUser.cargo}</p>
              </div>
            </div>
          </div>

          <div className="mobile-card space-y-4">
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-foreground">{mockUser.email}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Equipo</p>
              <p className="text-foreground">{mockUser.team}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Supervisor</p>
              <p className="text-foreground">{mockUser.supervisor}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Fecha de ingreso</p>
              <p className="text-foreground">{mockUser.hireDate}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Button variant="outline" className="w-full gap-2" onClick={() => toast.info('Configuración próximamente')}>
              <Settings className="w-4 h-4" />
              Configuración
            </Button>
            <Button variant="outline" className="w-full gap-2 text-destructive hover:text-destructive" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      ) : (
        /* Mi Cargo Tab */
        <div className="space-y-4">
          <div className="mobile-card">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Briefcase className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">{mockUser.cargo}</h2>
                <p className="text-muted-foreground">{mockUser.team}</p>
              </div>
            </div>
          </div>

          <div className="mobile-card">
            <h3 className="font-semibold text-foreground mb-3">Descripción del Cargo</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {mockUser.cargoDescription}
            </p>
          </div>

          <div className="mobile-card">
            <h3 className="font-semibold text-foreground mb-3">Responsabilidades Principales</h3>
            <ul className="space-y-2">
              {mockUser.responsibilities.map((resp, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
                  {resp}
                </li>
              ))}
            </ul>
          </div>

          <div className="mobile-card">
            <h3 className="font-semibold text-foreground mb-3">Organigrama</h3>
            <div className="space-y-3">
              <div className="p-3 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground">Reporto a:</p>
                <p className="font-medium text-foreground">{mockUser.supervisor}</p>
                <p className="text-xs text-muted-foreground">Supervisora de Operaciones</p>
              </div>
              <div className="p-3 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground">Mi equipo:</p>
                <p className="font-medium text-foreground">{mockUser.team}</p>
              </div>
            </div>
          </div>

          <div className="mobile-card bg-primary/5 border-primary/20">
            <p className="text-xs text-muted-foreground mb-1">Información asignada por:</p>
            <p className="font-medium text-foreground">{mockUser.supervisor}</p>
            <p className="text-xs text-muted-foreground">Supervisora de Operaciones</p>
          </div>
        </div>
      )}
    </div>
  );
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
      <main className="px-4 py-6 max-w-lg mx-auto">
        <Routes>
          <Route path="/" element={<EmployeeHome onProcessClick={handleProcessClick} />} />
          <Route path="/processes" element={<EmployeeProcesses onProcessClick={handleProcessClick} />} />
          <Route path="/team" element={<EmployeeTeam />} />
          <Route path="/profile" element={<EmployeeProfile />} />
        </Routes>
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