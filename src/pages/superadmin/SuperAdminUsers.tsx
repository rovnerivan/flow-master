import React, { useState } from 'react';
import {
  Users,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Shield,
  Mail,
  Building2,
  Calendar,
  Ban,
  CheckCircle,
  Download,
  UserPlus,
  Crown,
  Briefcase,
  User,
  Clock,
  Filter,
  RefreshCw,
  Key,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { KPICard } from '@/components/dashboard/KPICard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AppUser {
  id: string;
  fullName: string;
  email: string;
  avatar?: string;
  role: 'super_admin' | 'business_admin' | 'supervisor' | 'employee';
  companyId: string;
  companyName: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  lastLogin: string;
  jobTitle?: string;
  processesCompleted: number;
  tasksCompleted: number;
  compliance: number;
}

const mockUsers: AppUser[] = [
  {
    id: '1',
    fullName: 'Juan Pérez',
    email: 'juan@empresademo.com',
    role: 'business_admin',
    companyId: '1',
    companyName: 'Empresa Demo S.A.',
    status: 'active',
    createdAt: '2024-01-05',
    lastLogin: '2024-01-15 10:30',
    jobTitle: 'Director de Operaciones',
    processesCompleted: 15,
    tasksCompleted: 89,
    compliance: 92,
  },
  {
    id: '2',
    fullName: 'María García',
    email: 'maria@techsolutions.com',
    role: 'business_admin',
    companyId: '2',
    companyName: 'Tech Solutions',
    status: 'active',
    createdAt: '2024-01-10',
    lastLogin: '2024-01-15 09:15',
    jobTitle: 'CEO',
    processesCompleted: 28,
    tasksCompleted: 156,
    compliance: 95,
  },
  {
    id: '3',
    fullName: 'Carlos López',
    email: 'carlos@retailcorp.com',
    role: 'business_admin',
    companyId: '3',
    companyName: 'Retail Corp',
    status: 'active',
    createdAt: '2024-01-12',
    lastLogin: '2024-01-14 16:45',
    jobTitle: 'Gerente General',
    processesCompleted: 8,
    tasksCompleted: 42,
    compliance: 78,
  },
  {
    id: '4',
    fullName: 'Ana Martínez',
    email: 'ana@empresademo.com',
    role: 'supervisor',
    companyId: '1',
    companyName: 'Empresa Demo S.A.',
    status: 'active',
    createdAt: '2024-01-08',
    lastLogin: '2024-01-15 11:20',
    jobTitle: 'Supervisora de Producción',
    processesCompleted: 12,
    tasksCompleted: 67,
    compliance: 88,
  },
  {
    id: '5',
    fullName: 'Roberto Sánchez',
    email: 'roberto@empresademo.com',
    role: 'employee',
    companyId: '1',
    companyName: 'Empresa Demo S.A.',
    status: 'active',
    createdAt: '2024-01-09',
    lastLogin: '2024-01-15 08:00',
    jobTitle: 'Operador',
    processesCompleted: 10,
    tasksCompleted: 45,
    compliance: 85,
  },
  {
    id: '6',
    fullName: 'Laura Fernández',
    email: 'laura@techsolutions.com',
    role: 'employee',
    companyId: '2',
    companyName: 'Tech Solutions',
    status: 'inactive',
    createdAt: '2024-01-11',
    lastLogin: '2024-01-10 14:30',
    jobTitle: 'Desarrolladora',
    processesCompleted: 5,
    tasksCompleted: 23,
    compliance: 72,
  },
  {
    id: '7',
    fullName: 'Super Admin',
    email: 'admin@processflow.com',
    role: 'super_admin',
    companyId: '0',
    companyName: 'ProcessFlow',
    status: 'active',
    createdAt: '2023-01-01',
    lastLogin: '2024-01-15 12:00',
    jobTitle: 'Administrador del Sistema',
    processesCompleted: 0,
    tasksCompleted: 0,
    compliance: 100,
  },
];

const roleLabels: Record<AppUser['role'], string> = {
  super_admin: 'Super Admin',
  business_admin: 'Admin Empresarial',
  supervisor: 'Supervisor',
  employee: 'Empleado',
};

const roleIcons: Record<AppUser['role'], React.ReactNode> = {
  super_admin: <Crown className="w-4 h-4" />,
  business_admin: <Briefcase className="w-4 h-4" />,
  supervisor: <Shield className="w-4 h-4" />,
  employee: <User className="w-4 h-4" />,
};

const SuperAdminUsers: React.FC = () => {
  const [users, setUsers] = useState<AppUser[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterCompany, setFilterCompany] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const companies = Array.from(new Set(users.map((u) => u.companyName))).filter(
    (c) => c !== 'ProcessFlow'
  );

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesCompany = filterCompany === 'all' || user.companyName === filterCompany;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesCompany && matchesStatus;
  });

  const handleStatusChange = (userId: string, newStatus: AppUser['status']) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
    );
    toast.success(`Estado del usuario actualizado a ${newStatus}`);
  };

  const handleRoleChange = (userId: string, newRole: AppUser['role']) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    toast.success(`Rol del usuario actualizado a ${roleLabels[newRole]}`);
  };

  const handleDeleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    toast.success('Usuario eliminado correctamente');
  };

  const handleResetPassword = (user: AppUser) => {
    toast.success(`Email de recuperación enviado a ${user.email}`);
  };

  const handleCreateUser = (data: Partial<AppUser>) => {
    const newUser: AppUser = {
      id: Date.now().toString(),
      fullName: data.fullName || '',
      email: data.email || '',
      role: data.role || 'employee',
      companyId: data.companyId || '',
      companyName: data.companyName || '',
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: '-',
      jobTitle: data.jobTitle,
      processesCompleted: 0,
      tasksCompleted: 0,
      compliance: 0,
    };
    setUsers((prev) => [newUser, ...prev]);
    setIsCreateModalOpen(false);
    toast.success('Usuario creado correctamente');
  };

  const handleEditUser = (data: Partial<AppUser>) => {
    if (!selectedUser) return;
    setUsers((prev) =>
      prev.map((u) => (u.id === selectedUser.id ? { ...u, ...data } : u))
    );
    setIsEditModalOpen(false);
    toast.success('Usuario actualizado correctamente');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">Administra todos los usuarios del sistema</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Usuarios"
          value={users.length.toString()}
          subtitle={`${users.filter((u) => u.status === 'active').length} activos`}
          icon={Users}
        />
        <KPICard
          title="Admins Empresariales"
          value={users.filter((u) => u.role === 'business_admin').length.toString()}
          subtitle="administradores de equipos"
          icon={Briefcase}
        />
        <KPICard
          title="Supervisores"
          value={users.filter((u) => u.role === 'supervisor').length.toString()}
          subtitle="líderes de área"
          icon={Shield}
        />
        <KPICard
          title="Empleados"
          value={users.filter((u) => u.role === 'employee').length.toString()}
          subtitle="colaboradores"
          icon={User}
        />
      </div>

      {/* Filters */}
      <div className="kpi-card">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="business_admin">Admin Empresarial</SelectItem>
                <SelectItem value="supervisor">Supervisor</SelectItem>
                <SelectItem value="employee">Empleado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCompany} onValueChange={setFilterCompany}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Empresa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las empresas</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company} value={company}>
                    {company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="inactive">Inactivo</SelectItem>
                <SelectItem value="suspended">Suspendido</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="kpi-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Usuario
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Empresa
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Rol
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Cumplimiento
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Último acceso
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Estado
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {user.fullName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">{user.fullName}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{user.companyName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div
                      className={cn(
                        'inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium',
                        user.role === 'super_admin' && 'bg-purple-500/20 text-purple-500',
                        user.role === 'business_admin' && 'bg-primary/20 text-primary',
                        user.role === 'supervisor' && 'bg-warning/20 text-warning',
                        user.role === 'employee' && 'bg-secondary text-muted-foreground'
                      )}
                    >
                      {roleIcons[user.role]}
                      {roleLabels[user.role]}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 rounded-full bg-secondary overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full',
                            user.compliance >= 80 && 'bg-success',
                            user.compliance >= 60 && user.compliance < 80 && 'bg-warning',
                            user.compliance < 60 && 'bg-destructive'
                          )}
                          style={{ width: `${user.compliance}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {user.compliance}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {user.lastLogin}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={cn(
                        'px-2 py-1 rounded-full text-xs font-medium',
                        user.status === 'active' && 'bg-success/20 text-success',
                        user.status === 'inactive' && 'bg-secondary text-muted-foreground',
                        user.status === 'suspended' && 'bg-destructive/20 text-destructive'
                      )}
                    >
                      {user.status === 'active' && 'Activo'}
                      {user.status === 'inactive' && 'Inactivo'}
                      {user.status === 'suspended' && 'Suspendido'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUser(user);
                            setIsViewModalOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Ver perfil
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUser(user);
                            setIsEditModalOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleResetPassword(user)}>
                          <Key className="w-4 h-4 mr-2" />
                          Resetear contraseña
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() =>
                            handleRoleChange(
                              user.id,
                              user.role === 'employee' ? 'supervisor' : 'employee'
                            )
                          }
                          disabled={user.role === 'super_admin'}
                        >
                          <Shield className="w-4 h-4 mr-2" />
                          Cambiar rol
                        </DropdownMenuItem>
                        {user.status === 'active' ? (
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(user.id, 'suspended')}
                          >
                            <Ban className="w-4 h-4 mr-2" />
                            Suspender
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(user.id, 'active')}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Activar
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={user.role === 'super_admin'}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="py-12 text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No se encontraron usuarios</p>
          </div>
        )}
      </div>

      {/* View User Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Perfil del Usuario</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <Tabs defaultValue="info" className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">Información</TabsTrigger>
                <TabsTrigger value="activity">Actividad</TabsTrigger>
                <TabsTrigger value="permissions">Permisos</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4 mt-4">
                <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={selectedUser.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xl">
                      {selectedUser.fullName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {selectedUser.fullName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedUser.jobTitle || 'Sin cargo asignado'}
                    </p>
                    <div
                      className={cn(
                        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium mt-1',
                        selectedUser.role === 'super_admin' &&
                          'bg-purple-500/20 text-purple-500',
                        selectedUser.role === 'business_admin' &&
                          'bg-primary/20 text-primary',
                        selectedUser.role === 'supervisor' && 'bg-warning/20 text-warning',
                        selectedUser.role === 'employee' &&
                          'bg-secondary text-muted-foreground'
                      )}
                    >
                      {roleIcons[selectedUser.role]}
                      {roleLabels[selectedUser.role]}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Mail className="w-3 h-3" /> Email
                    </p>
                    <p className="text-sm text-foreground">{selectedUser.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Building2 className="w-3 h-3" /> Empresa
                    </p>
                    <p className="text-sm text-foreground">{selectedUser.companyName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Registro
                    </p>
                    <p className="text-sm text-foreground">{selectedUser.createdAt}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Último acceso
                    </p>
                    <p className="text-sm text-foreground">{selectedUser.lastLogin}</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="activity" className="space-y-4 mt-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-secondary/30 text-center">
                    <p className="text-3xl font-bold text-foreground">
                      {selectedUser.processesCompleted}
                    </p>
                    <p className="text-sm text-muted-foreground">Procesos completados</p>
                  </div>
                  <div className="p-4 rounded-lg bg-secondary/30 text-center">
                    <p className="text-3xl font-bold text-foreground">
                      {selectedUser.tasksCompleted}
                    </p>
                    <p className="text-sm text-muted-foreground">Tareas realizadas</p>
                  </div>
                  <div className="p-4 rounded-lg bg-secondary/30 text-center">
                    <p className="text-3xl font-bold text-foreground">
                      {selectedUser.compliance}%
                    </p>
                    <p className="text-sm text-muted-foreground">Cumplimiento</p>
                  </div>
                </div>

                <div className="p-4 rounded-lg border border-border">
                  <h4 className="text-sm font-medium text-foreground mb-3">
                    Actividad Reciente
                  </h4>
                  <div className="space-y-3">
                    {[
                      {
                        action: 'Completó proceso "Seguridad Industrial"',
                        time: 'Hace 2 horas',
                      },
                      { action: 'Inició sesión', time: 'Hace 3 horas' },
                      { action: 'Completó 5 tareas diarias', time: 'Ayer' },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-2 border-b border-border last:border-0"
                      >
                        <p className="text-sm text-foreground">{item.action}</p>
                        <span className="text-xs text-muted-foreground">{item.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="permissions" className="space-y-4 mt-4">
                <div className="p-4 rounded-lg border border-border">
                  <h4 className="text-sm font-medium text-foreground mb-3">
                    Permisos del Rol: {roleLabels[selectedUser.role]}
                  </h4>
                  <div className="space-y-2">
                    {selectedUser.role === 'super_admin' && (
                      <>
                        <PermissionItem label="Gestión de empresas" granted />
                        <PermissionItem label="Gestión de usuarios globales" granted />
                        <PermissionItem label="Configuración del sistema" granted />
                        <PermissionItem label="Acceso a métricas SaaS" granted />
                      </>
                    )}
                    {selectedUser.role === 'business_admin' && (
                      <>
                        <PermissionItem label="Gestión de procesos" granted />
                        <PermissionItem label="Gestión de equipo" granted />
                        <PermissionItem label="Reportes y analytics" granted />
                        <PermissionItem label="Configuración de empresa" granted />
                        <PermissionItem label="Gestión global" granted={false} />
                      </>
                    )}
                    {selectedUser.role === 'supervisor' && (
                      <>
                        <PermissionItem label="Ver procesos del equipo" granted />
                        <PermissionItem label="Gestionar tareas del equipo" granted />
                        <PermissionItem label="Ver reportes del equipo" granted />
                        <PermissionItem label="Crear procesos" granted={false} />
                        <PermissionItem label="Gestión de empresa" granted={false} />
                      </>
                    )}
                    {selectedUser.role === 'employee' && (
                      <>
                        <PermissionItem label="Ver procesos asignados" granted />
                        <PermissionItem label="Completar tareas" granted />
                        <PermissionItem label="Ver progreso personal" granted />
                        <PermissionItem label="Gestión de equipo" granted={false} />
                        <PermissionItem label="Reportes" granted={false} />
                      </>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Create User Modal */}
      <UserFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateUser}
        title="Nuevo Usuario"
        companies={companies}
      />

      {/* Edit User Modal */}
      <UserFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditUser}
        title="Editar Usuario"
        initialData={selectedUser || undefined}
        companies={companies}
      />
    </div>
  );
};

const PermissionItem: React.FC<{ label: string; granted: boolean }> = ({
  label,
  granted,
}) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-sm text-foreground">{label}</span>
    <span
      className={cn(
        'px-2 py-0.5 rounded text-xs font-medium',
        granted ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
      )}
    >
      {granted ? 'Permitido' : 'Denegado'}
    </span>
  </div>
);

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<AppUser>) => void;
  title: string;
  initialData?: Partial<AppUser>;
  companies: string[];
}

const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  initialData,
  companies,
}) => {
  const [formData, setFormData] = useState<Partial<AppUser>>(
    initialData || {
      fullName: '',
      email: '',
      role: 'employee',
      companyName: '',
      jobTitle: '',
    }
  );

  React.useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        fullName: '',
        email: '',
        role: 'employee',
        companyName: '',
        jobTitle: '',
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = () => {
    if (!formData.fullName || !formData.email) {
      toast.error('Por favor completa los campos requeridos');
      return;
    }
    onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Nombre Completo *</Label>
            <Input
              value={formData.fullName || ''}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Nombre completo"
            />
          </div>
          <div className="space-y-2">
            <Label>Email *</Label>
            <Input
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="usuario@empresa.com"
            />
          </div>
          <div className="space-y-2">
            <Label>Empresa</Label>
            <Select
              value={formData.companyName || ''}
              onValueChange={(value) => setFormData({ ...formData, companyName: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar empresa" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company} value={company}>
                    {company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Rol</Label>
            <Select
              value={formData.role}
              onValueChange={(value) =>
                setFormData({ ...formData, role: value as AppUser['role'] })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employee">Empleado</SelectItem>
                <SelectItem value="supervisor">Supervisor</SelectItem>
                <SelectItem value="business_admin">Admin Empresarial</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Cargo / Título</Label>
            <Input
              value={formData.jobTitle || ''}
              onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
              placeholder="Ej: Gerente de Operaciones"
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleSubmit} className="flex-1">
              {initialData ? 'Guardar Cambios' : 'Crear Usuario'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SuperAdminUsers;
