import React, { useState } from 'react';
import { Plus, Search, Filter, MoreVertical, UserCog, Mail, Trash2 } from 'lucide-react';
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

const mockTeamMembers = [
  {
    id: '1',
    name: 'María García',
    email: 'maria@empresa.com',
    role: 'supervisor',
    jobTitle: 'Supervisora de Operaciones',
    compliance: 95,
    status: 'active',
  },
  {
    id: '2',
    name: 'Carlos López',
    email: 'carlos@empresa.com',
    role: 'employee',
    jobTitle: 'Operador de Almacén',
    compliance: 88,
    status: 'active',
  },
  {
    id: '3',
    name: 'Ana Martínez',
    email: 'ana@empresa.com',
    role: 'employee',
    jobTitle: 'Atención al Cliente',
    compliance: 72,
    status: 'active',
  },
  {
    id: '4',
    name: 'Pedro Sánchez',
    email: 'pedro@empresa.com',
    role: 'employee',
    jobTitle: 'Cajero',
    compliance: 91,
    status: 'onboarding',
  },
];

const roleLabels: Record<string, string> = {
  business_admin: 'Administrador',
  supervisor: 'Supervisor',
  employee: 'Colaborador',
};

const AdminTeam: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 rounded hover:bg-secondary">
                          <MoreVertical className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <UserCog className="w-4 h-4 mr-2" />
                          Editar rol
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="w-4 h-4 mr-2" />
                          Enviar mensaje
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
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
      </div>
    </div>
  );
};

export default AdminTeam;
