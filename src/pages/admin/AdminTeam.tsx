import React, { useState } from 'react';
import { Plus, Search, Filter, MoreVertical, UserCog, Mail, Trash2, X, Users, TrendingUp } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TeamPerformanceMatrix from '@/components/analytics/TeamPerformanceMatrix';
import EmployeeProfileCard, { EmployeeData } from '@/components/team/EmployeeProfileCard';
import EmployeeDetailModal from '@/components/team/EmployeeDetailModal';

// Transform mock data to EmployeeData format
const mockEmployees: EmployeeData[] = [
  {
    id: '1',
    name: 'María García',
    email: 'maria@empresa.com',
    role: 'supervisor',
    jobTitle: 'Supervisora de Operaciones',
    tenureDays: 180,
    efficiency: 95,
    efficiencyTrend: 'up',
    efficiencyChange: 5,
    volume: 45,
    tasksToday: { completed: 5, total: 6 },
    workloadHours: 38,
    capacityHours: 40,
    status: 'active',
    quadrant: 'star',
    alerts: [],
    achievements: ['Completó certificación en Cierre de Caja', '0 errores en 2 semanas'],
  },
  {
    id: '2',
    name: 'Carlos López',
    email: 'carlos@empresa.com',
    role: 'employee',
    jobTitle: 'Operador de Almacén',
    tenureDays: 120,
    efficiency: 68,
    efficiencyTrend: 'down',
    efficiencyChange: -12,
    volume: 52,
    tasksToday: { completed: 3, total: 5 },
    workloadHours: 44,
    capacityHours: 40,
    status: 'active',
    quadrant: 'coaching',
    alerts: [{ type: 'warning', message: 'Eficiencia cayó 12% esta semana' }],
    achievements: [],
  },
  {
    id: '3',
    name: 'Ana Martínez',
    email: 'ana@empresa.com',
    role: 'employee',
    jobTitle: 'Atención al Cliente',
    tenureDays: 90,
    efficiency: 72,
    efficiencyTrend: 'down',
    efficiencyChange: -8,
    volume: 28,
    tasksToday: { completed: 2, total: 4 },
    workloadHours: 32,
    capacityHours: 40,
    status: 'active',
    quadrant: 'attention',
    alerts: [{ type: 'critical', message: 'Bajo rendimiento sostenido' }],
    achievements: [],
  },
  {
    id: '4',
    name: 'Pedro Sánchez',
    email: 'pedro@empresa.com',
    role: 'employee',
    jobTitle: 'Cajero',
    tenureDays: 15,
    efficiency: 65,
    efficiencyTrend: 'up',
    efficiencyChange: 15,
    volume: 18,
    tasksToday: { completed: 1, total: 3 },
    workloadHours: 30,
    capacityHours: 40,
    status: 'onboarding',
    quadrant: 'potential',
    alerts: [],
    achievements: ['Mejora de 15% en primera semana'],
  },
  {
    id: '5',
    name: 'Laura Fernández',
    email: 'laura@empresa.com',
    role: 'employee',
    jobTitle: 'Supervisora de Turno',
    tenureDays: 200,
    efficiency: 91,
    efficiencyTrend: 'stable',
    efficiencyChange: 1,
    volume: 38,
    tasksToday: { completed: 4, total: 5 },
    workloadHours: 36,
    capacityHours: 40,
    status: 'active',
    quadrant: 'star',
    alerts: [],
    achievements: ['Mentor de 3 empleados nuevos'],
  },
  {
    id: '6',
    name: 'Diego Ruiz',
    email: 'diego@empresa.com',
    role: 'employee',
    jobTitle: 'Auxiliar de Inventario',
    tenureDays: 60,
    efficiency: 85,
    efficiencyTrend: 'up',
    efficiencyChange: 3,
    volume: 55,
    tasksToday: { completed: 6, total: 7 },
    workloadHours: 42,
    capacityHours: 40,
    status: 'active',
    quadrant: 'potential',
    alerts: [{ type: 'info', message: 'Carga de trabajo sobre capacidad' }],
    achievements: [],
  },
];

// Mock data for performance matrix
const mockPerformanceData = mockEmployees.map(emp => ({
  id: emp.id,
  name: emp.name,
  efficiency: emp.efficiency,
  volume: emp.volume,
  trend: emp.efficiencyTrend,
  trendValue: emp.efficiencyChange,
  weeklyHistory: [emp.efficiency - 10, emp.efficiency - 7, emp.efficiency - 3, emp.efficiency],
  tenureDays: emp.tenureDays,
  workloadHours: emp.workloadHours,
  capacityHours: emp.capacityHours,
}));

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
  const [editRoleModal, setEditRoleModal] = useState<EmployeeData | null>(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeData | null>(null);

  const filteredMembers = mockEmployees.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase();
  };

  const openEditRole = (member: EmployeeData) => {
    setEditRoleModal(member);
    setSelectedRole(member.role);
  };

  const saveRole = () => {
    if (!editRoleModal) return;
    toast.success(`Rol de ${editRoleModal.name} actualizado a ${roleLabels[selectedRole] || selectedRole}`);
    setEditRoleModal(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Equipo</h1>
          <p className="text-muted-foreground">
            Gestiona los miembros y rendimiento de tu equipo
          </p>
        </div>
        <Button variant="hero" className="gap-2">
          <Plus className="w-4 h-4" />
          Invitar Miembro
        </Button>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="members" className="space-y-6">
        <TabsList>
          <TabsTrigger value="members" className="gap-2">
            <Users className="w-4 h-4" />
            Miembros
          </TabsTrigger>
          <TabsTrigger value="performance" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Rendimiento
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
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

          {/* Team Members Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredMembers.map((employee) => (
              <EmployeeProfileCard
                key={employee.id}
                employee={employee}
                onClick={() => setSelectedEmployee(employee)}
                isSelected={selectedEmployee?.id === employee.id}
              />
            ))}
          </div>

          {filteredMembers.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron miembros</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="performance">
          <TeamPerformanceMatrix
            employees={mockPerformanceData}
            averageEfficiency={80}
            averageVolume={40}
          />
        </TabsContent>
      </Tabs>

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

      {/* Employee Detail Modal */}
      {selectedEmployee && (
        <EmployeeDetailModal
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
        />
      )}
    </div>
  );
};

export default AdminTeam;
