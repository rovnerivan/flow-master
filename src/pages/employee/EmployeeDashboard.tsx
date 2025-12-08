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
  ChevronRight,
} from 'lucide-react';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import { MobileNav } from '@/components/layout/MobileNav';
import { DailyChecklist } from '@/components/mobile/DailyChecklist';
import { MicroLearningCard } from '@/components/mobile/MicroLearningCard';
import { ProcessCard } from '@/components/mobile/ProcessCard';
import { ProcessViewerModal } from '@/components/employee/ProcessViewerModal';
import { TeamMemberModal } from '@/components/employee/TeamMemberModal';
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
const EmployeeHome: React.FC = () => {
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
  const [selectedMember, setSelectedMember] = useState<TeamMemberData | null>(null);

  const teamMembersData: TeamMemberData[] = [
    { 
      id: '1', 
      name: 'Carlos López', 
      cargo: 'Operador de Caja',
      cargoDescription: 'Responsable de gestionar las transacciones en caja, asegurando un servicio rápido y amable al cliente.',
      skills: ['Atención al cliente', 'Manejo de efectivo', 'Resolución de problemas'],
      usualTasks: [
        { id: 't1', title: 'Apertura de caja', frequency: 'Diaria' },
        { id: 't2', title: 'Cierre de caja', frequency: 'Diaria' },
        { id: 't3', title: 'Arqueo de caja', frequency: 'Semanal' },
      ],
      usualProcesses: [
        { id: 'p1', title: 'Proceso de cobro estándar' },
        { id: 'p2', title: 'Gestión de devoluciones' },
      ],
      funFact: 'Le encanta el café y siempre tiene una sonrisa para los clientes.',
      joinedDate: 'Marzo 2023',
      isMe: true
    },
    { 
      id: '2', 
      name: 'Ana Martínez', 
      cargo: 'Vendedora',
      cargoDescription: 'Especialista en atención personalizada al cliente, con enfoque en identificar necesidades y ofrecer soluciones.',
      skills: ['Ventas', 'Comunicación', 'Trabajo en equipo', 'Empatía'],
      usualTasks: [
        { id: 't1', title: 'Atención en piso de ventas', frequency: 'Diaria' },
        { id: 't2', title: 'Reposición de productos', frequency: 'Diaria' },
        { id: 't3', title: 'Inventario de sección', frequency: 'Semanal' },
      ],
      usualProcesses: [
        { id: 'p1', title: 'Atención al cliente premium' },
        { id: 'p2', title: 'Técnicas de venta cruzada' },
      ],
      funFact: 'Conoce todos los productos de memoria y siempre recomienda el mejor.',
      joinedDate: 'Enero 2022'
    },
    { 
      id: '3', 
      name: 'Pedro Sánchez', 
      cargo: 'Almacenista',
      cargoDescription: 'Encargado de la recepción, organización y control de inventario en el almacén.',
      skills: ['Organización', 'Logística', 'Fuerza física', 'Atención al detalle'],
      usualTasks: [
        { id: 't1', title: 'Recepción de mercancía', frequency: 'Diaria' },
        { id: 't2', title: 'Acomodo de productos', frequency: 'Diaria' },
        { id: 't3', title: 'Control de inventario', frequency: 'Mensual' },
      ],
      usualProcesses: [
        { id: 'p1', title: 'Recepción de proveedores' },
        { id: 'p2', title: 'Control de mermas' },
      ],
      funFact: 'Tiene el récord de organizar el almacén más rápido.',
      joinedDate: 'Julio 2021'
    },
    { 
      id: '4', 
      name: 'Luis Ramírez', 
      cargo: 'Vendedor',
      cargoDescription: 'Asesor de ventas enfocado en productos tecnológicos y electrónicos.',
      skills: ['Conocimiento técnico', 'Paciencia', 'Ventas', 'Tecnología'],
      usualTasks: [
        { id: 't1', title: 'Asesoría de productos', frequency: 'Diaria' },
        { id: 't2', title: 'Demostración de equipos', frequency: 'Diaria' },
        { id: 't3', title: 'Seguimiento a clientes', frequency: 'Semanal' },
      ],
      usualProcesses: [
        { id: 'p1', title: 'Demostración de productos' },
        { id: 'p2', title: 'Garantías y devoluciones' },
      ],
      funFact: 'Es el experto en tecnología del equipo, siempre al día con las novedades.',
      joinedDate: 'Octubre 2022'
    },
  ];

  // Supervisor data
  const supervisorData: TeamMemberData = {
    id: 'sup1',
    name: mockUser.supervisor,
    cargo: 'Supervisora de Operaciones',
    cargoDescription: 'Líder del equipo de operaciones, responsable de coordinar actividades diarias y asegurar el cumplimiento de objetivos.',
    skills: ['Liderazgo', 'Gestión de equipos', 'Planificación', 'Comunicación efectiva'],
    usualTasks: [
      { id: 't1', title: 'Revisión de KPIs del equipo', frequency: 'Diaria' },
      { id: 't2', title: 'Reunión de equipo', frequency: 'Semanal' },
      { id: 't3', title: 'Evaluaciones de desempeño', frequency: 'Mensual' },
    ],
    usualProcesses: [
      { id: 'p1', title: 'Gestión de turnos' },
      { id: 'p2', title: 'Resolución de conflictos' },
      { id: 'p3', title: 'Capacitación de nuevos empleados' },
    ],
    funFact: 'Siempre tiene tiempo para escuchar y ayudar a su equipo.',
    joinedDate: 'Marzo 2019'
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mi Equipo</h1>
        <p className="text-muted-foreground">{mockUser.team}</p>
      </div>

      {/* Supervisor Card - Clickable */}
      <div 
        className="mobile-card cursor-pointer hover:border-primary/50 transition-colors"
        onClick={() => setSelectedMember(supervisorData)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-foreground">Supervisor</p>
            <p className="text-primary">{mockUser.supervisor}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-foreground">Compañeros de equipo</h3>
        {teamMembersData.map((member) => (
          <div 
            key={member.id} 
            className={cn(
              "mobile-card flex items-center gap-3 cursor-pointer hover:border-primary/50 transition-colors",
              member.isMe && "border-primary/30 bg-primary/5"
            )}
            onClick={() => !member.isMe && setSelectedMember(member)}
          >
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">
                {member.name}
                {member.isMe && <span className="text-primary text-xs ml-2">(Tú)</span>}
              </p>
              <p className="text-sm text-muted-foreground">{member.cargo}</p>
            </div>
            {!member.isMe && <ChevronRight className="w-5 h-5 text-muted-foreground" />}
          </div>
        ))}
      </div>

      {/* Team Member Modal */}
      <TeamMemberModal
        member={selectedMember}
        open={!!selectedMember}
        onClose={() => setSelectedMember(null)}
      />
    </div>
  );
};

// Interface for team member data
interface TeamMemberData {
  id: string;
  name: string;
  cargo: string;
  cargoDescription: string;
  skills: string[];
  usualTasks: { id: string; title: string; frequency: string }[];
  usualProcesses: { id: string; title: string }[];
  funFact?: string;
  joinedDate: string;
  isMe?: boolean;
}

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
          <Route path="/" element={<EmployeeHome />} />
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