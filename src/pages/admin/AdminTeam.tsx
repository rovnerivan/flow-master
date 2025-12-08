import React, { useState } from 'react';
import { Plus, Search, Filter, MoreVertical, UserCog, Mail, Trash2, Eye, Calendar, BarChart3, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  jobTitle: string;
  compliance: number;
  status: 'active' | 'onboarding';
  processesCompleted: number;
  tasksToday: { completed: number; total: number };
}

const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'María García',
    email: 'maria@empresa.com',
    role: 'supervisor',
    jobTitle: 'Supervisora de Operaciones',
    compliance: 95,
    status: 'active',
    processesCompleted: 12,
    tasksToday: { completed: 5, total: 6 },
  },
  {
    id: '2',
    name: 'Carlos López',
    email: 'carlos@empresa.com',
    role: 'employee',
    jobTitle: 'Operador de Almacén',
    compliance: 88,
    status: 'active',
    processesCompleted: 8,
    tasksToday: { completed: 3, total: 5 },
  },
  {
    id: '3',
    name: 'Ana Martínez',
    email: 'ana@empresa.com',
    role: 'employee',
    jobTitle: 'Atención al Cliente',
    compliance: 72,
    status: 'active',
    processesCompleted: 5,
    tasksToday: { completed: 2, total: 4 },
  },
  {
    id: '4',
    name: 'Pedro Sánchez',
    email: 'pedro@empresa.com',
    role: 'employee',
    jobTitle: 'Cajero',
    compliance: 91,
    status: 'onboarding',
    processesCompleted: 3,
    tasksToday: { completed: 1, total: 3 },
  },
];

const roleLabels: Record<string, string> = {
  business_admin: 'Administrador',
  supervisor: 'Supervisor',
  employee: 'Colaborador',
};

const roleOptions = [
  { value: 'employee', label: 'Colaborador' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'business_admin', label: 'Administrador' },
];

const AdminTeam: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editRoleModal, setEditRoleModal] = useState<TeamMember | null>(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [memberDetailModal, setMemberDetailModal] = useState<TeamMember | null>(null);

  const filteredMembers = mockTeamMembers.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const openEditRole = (member: TeamMember) => {
    setEditRoleModal(member);
    setSelectedRole(member.role);
  };

  const saveRole = () => {
    if (!editRoleModal) return;
    toast.success(`Rol de ${editRoleModal.name} actualizado a ${roleLabels[selectedRole] || selectedRole}`);
    setEditRoleModal(null);
  };

  const openMemberDetail = (member: TeamMember) => {
    setMemberDetailModal(member);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Equipo</h1>
          <p className="text-muted-foreground">
            Gestiona los miembros de tu equipo
          </p>
        </div>
        <Button variant="hero" className="gap-2">
          <Plus className="w-4 h-4" />
          Invitar Miembro
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Filtrar
        </Button>
      </div>

      {/* Team Members Table */}
      <div className="kpi-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Miembro
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Rol
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Cargo
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Cumplimiento
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Estado
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr
                  key={member.id}
                  className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">
                          {member.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {member.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-foreground">
                      {roleLabels[member.role] || member.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-muted-foreground">
                      {member.jobTitle}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${member.compliance}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {member.compliance}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        member.status === 'active'
                          ? 'bg-success/20 text-success'
                          : 'bg-warning/20 text-warning'
                      }`}
                    >
                      {member.status === 'active' ? 'Activo' : 'En onboarding'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => openMemberDetail(member)}
                        className="gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        Ver más
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1 rounded hover:bg-secondary">
                            <MoreVertical className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditRole(member)}>
                            <UserCog className="w-4 h-4 mr-2" />
                            Editar rol
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.info('Función de mensaje próximamente')}>
                            <Mail className="w-4 h-4 mr-2" />
                            Enviar mensaje
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Role Modal */}
      {editRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setEditRoleModal(null)} />
          <div className="relative w-full max-w-md mx-4 bg-card border border-border rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Editar Rol</h3>
              <button onClick={() => setEditRoleModal(null)} className="p-2 rounded-lg hover:bg-secondary">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex items-center gap-3 mb-6">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getInitials(editRoleModal.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-foreground">{editRoleModal.name}</p>
                <p className="text-sm text-muted-foreground">{editRoleModal.email}</p>
              </div>
            </div>

            <div className="space-y-2 mb-6">
              <label className="text-sm font-medium">Rol</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                {roleOptions.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setEditRoleModal(null)} className="flex-1">
                Cancelar
              </Button>
              <Button variant="hero" onClick={saveRole} className="flex-1">
                Guardar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Member Detail Modal */}
      {memberDetailModal && (
        <MemberDetailModal member={memberDetailModal} onClose={() => setMemberDetailModal(null)} />
      )}
    </div>
  );
};

// Member Detail Modal with tasks, history, KPIs
const MemberDetailModal: React.FC<{ member: TeamMember; onClose: () => void }> = ({ member, onClose }) => {
  const [activeTab, setActiveTab] = useState<'today' | 'history' | 'kpis' | 'processes'>('today');

  const mockTodayTasks = [
    { id: '1', title: 'Verificar inventario', status: 'completed', time: '08:30' },
    { id: '2', title: 'Preparar pedidos zona A', status: 'completed', time: '09:15' },
    { id: '3', title: 'Revisión de calidad', status: 'in_progress', time: '10:00' },
    { id: '4', title: 'Cierre de caja', status: 'pending', time: '18:00' },
  ];

  const mockHistory = [
    { date: '2024-01-15', tasksCompleted: 5, tasksTotal: 5, time: '7h 30m' },
    { date: '2024-01-14', tasksCompleted: 4, tasksTotal: 5, time: '8h 15m' },
    { date: '2024-01-13', tasksCompleted: 5, tasksTotal: 5, time: '7h 45m' },
    { date: '2024-01-12', tasksCompleted: 3, tasksTotal: 4, time: '6h 20m' },
  ];

  const mockProcesses = [
    { id: '1', name: 'Cierre de Caja', progress: 100, certified: true },
    { id: '2', name: 'Atención al Cliente', progress: 80, certified: false },
    { id: '3', name: 'Preparación de Pedidos', progress: 60, certified: false },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl mx-4 bg-card border border-border rounded-2xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarFallback className="bg-primary/10 text-primary text-lg">
                {member.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold text-foreground">{member.name}</h2>
              <p className="text-sm text-muted-foreground">{member.jobTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border px-6">
          {[
            { key: 'today', label: 'Tareas Hoy', icon: Calendar },
            { key: 'history', label: 'Historial', icon: Calendar },
            { key: 'kpis', label: 'Desempeño', icon: BarChart3 },
            { key: 'processes', label: 'Procesos', icon: Eye },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'today' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Tareas de hoy</h3>
                <span className="text-sm text-muted-foreground">
                  {member.tasksToday.completed}/{member.tasksToday.total} completadas
                </span>
              </div>
              {mockTodayTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      task.status === 'completed' ? 'bg-success' :
                      task.status === 'in_progress' ? 'bg-primary' : 'bg-muted'
                    }`} />
                    <span className="text-foreground">{task.title}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{task.time}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground mb-4">Historial de días</h3>
              {mockHistory.map((day) => (
                <div key={day.date} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div>
                    <p className="font-medium text-foreground">{day.date}</p>
                    <p className="text-sm text-muted-foreground">
                      {day.tasksCompleted}/{day.tasksTotal} tareas • {day.time} trabajadas
                    </p>
                  </div>
                  <div className="w-16 h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(day.tasksCompleted / day.tasksTotal) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'kpis' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-secondary/30">
                  <p className="text-sm text-muted-foreground">Cumplimiento</p>
                  <p className="text-3xl font-bold text-foreground">{member.compliance}%</p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/30">
                  <p className="text-sm text-muted-foreground">Procesos completados</p>
                  <p className="text-3xl font-bold text-foreground">{member.processesCompleted}</p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/30">
                  <p className="text-sm text-muted-foreground">Tareas esta semana</p>
                  <p className="text-3xl font-bold text-foreground">23</p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/30">
                  <p className="text-sm text-muted-foreground">Errores este mes</p>
                  <p className="text-3xl font-bold text-foreground">2</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'processes' && (
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground mb-4">Procesos aprendidos</h3>
              {mockProcesses.map((proc) => (
                <div key={proc.id} className="p-4 rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-foreground">{proc.name}</span>
                    {proc.certified && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-success/20 text-success">
                        Certificado
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${proc.progress}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">{proc.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminTeam;