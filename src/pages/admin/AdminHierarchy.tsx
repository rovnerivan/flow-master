import React, { useState } from 'react';
import { 
  Users, 
  ChevronDown, 
  ChevronRight, 
  UserCog, 
  Plus, 
  X,
  Save,
  Search,
  Network
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'business_admin' | 'supervisor' | 'employee';
  jobTitle: string;
  supervisorLevel?: number; // 1 = top supervisor, 2 = second level, etc.
  reportsToId?: string;
  subordinates?: TeamMember[];
}

// Mock data with hierarchy - owners at the top
const mockTeamData: TeamMember[] = [
  {
    id: 'owner-1',
    name: 'Carlos Mendoza',
    email: 'carlos.mendoza@empresa.com',
    role: 'owner',
    jobTitle: 'Socio Fundador',
    subordinates: [],
  },
  {
    id: 'owner-2',
    name: 'Patricia Vega',
    email: 'patricia.vega@empresa.com',
    role: 'owner',
    jobTitle: 'Socia Inversora',
    subordinates: [],
  },
  {
    id: 'admin-1',
    name: 'Roberto Fernández',
    email: 'roberto@empresa.com',
    role: 'business_admin',
    jobTitle: 'Director General',
    subordinates: [
      {
        id: 'sup-1',
        name: 'María García',
        email: 'maria@empresa.com',
        role: 'supervisor',
        jobTitle: 'Supervisora de Operaciones',
        supervisorLevel: 1,
        reportsToId: 'admin-1',
        subordinates: [
          {
            id: 'sup-2',
            name: 'Juan Pérez',
            email: 'juan@empresa.com',
            role: 'supervisor',
            jobTitle: 'Supervisor de Almacén',
            supervisorLevel: 2,
            reportsToId: 'sup-1',
            subordinates: [
              {
                id: 'emp-1',
                name: 'Carlos López',
                email: 'carlos@empresa.com',
                role: 'employee',
                jobTitle: 'Operador de Almacén',
                reportsToId: 'sup-2',
              },
              {
                id: 'emp-2',
                name: 'Laura Sánchez',
                email: 'laura@empresa.com',
                role: 'employee',
                jobTitle: 'Asistente de Almacén',
                reportsToId: 'sup-2',
              },
            ],
          },
          {
            id: 'emp-3',
            name: 'Ana Martínez',
            email: 'ana@empresa.com',
            role: 'employee',
            jobTitle: 'Atención al Cliente',
            reportsToId: 'sup-1',
          },
        ],
      },
      {
        id: 'sup-3',
        name: 'Pedro Ramírez',
        email: 'pedro@empresa.com',
        role: 'supervisor',
        jobTitle: 'Supervisor de Ventas',
        supervisorLevel: 1,
        reportsToId: 'admin-1',
        subordinates: [
          {
            id: 'emp-4',
            name: 'Elena Torres',
            email: 'elena@empresa.com',
            role: 'employee',
            jobTitle: 'Vendedora',
            reportsToId: 'sup-3',
          },
        ],
      },
    ],
  },
];

// Flatten the hierarchy for the member list
const flattenHierarchy = (members: TeamMember[]): TeamMember[] => {
  const result: TeamMember[] = [];
  const flatten = (member: TeamMember) => {
    result.push(member);
    member.subordinates?.forEach(flatten);
  };
  members.forEach(flatten);
  return result;
};

const roleLabels: Record<string, string> = {
  owner: 'Dueño/Socio',
  business_admin: 'Administrador',
  supervisor: 'Supervisor',
  employee: 'Colaborador',
};

const roleColors: Record<string, string> = {
  owner: 'bg-violet-500/20 text-violet-400',
  business_admin: 'bg-primary text-primary-foreground',
  supervisor: 'bg-warning/20 text-warning',
  employee: 'bg-muted text-muted-foreground',
};

const AdminHierarchy: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['owner-1', 'owner-2', 'admin-1', 'sup-1', 'sup-3']));
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [allMembers] = useState(() => flattenHierarchy(mockTeamData));

  const toggleNode = (id: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const filteredMembers = allMembers.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderHierarchyNode = (member: TeamMember, depth: number = 0) => {
    const hasSubordinates = member.subordinates && member.subordinates.length > 0;
    const isExpanded = expandedNodes.has(member.id);

    return (
      <div key={member.id} className="select-none">
        <div 
          className={`flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer ${
            selectedMember?.id === member.id ? 'bg-primary/10 border border-primary/30' : ''
          }`}
          style={{ marginLeft: `${depth * 24}px` }}
          onClick={() => setSelectedMember(member)}
        >
          {hasSubordinates ? (
            <button 
              onClick={(e) => { e.stopPropagation(); toggleNode(member.id); }}
              className="p-1 rounded hover:bg-secondary"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          ) : (
            <div className="w-6" />
          )}

          <Avatar className="h-9 w-9">
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary/10 text-primary text-sm">
              {getInitials(member.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">{member.name}</p>
            <p className="text-xs text-muted-foreground truncate">{member.jobTitle}</p>
          </div>

          <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[member.role]}`}>
            {roleLabels[member.role]}
            {member.supervisorLevel && ` Nv.${member.supervisorLevel}`}
          </span>

          {hasSubordinates && (
            <span className="text-xs text-muted-foreground">
              {member.subordinates?.length} subordinado{member.subordinates?.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {hasSubordinates && isExpanded && (
          <div className="border-l border-border ml-6">
            {member.subordinates?.map(sub => renderHierarchyNode(sub, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Jerarquía del Equipo</h1>
          <p className="text-muted-foreground">
            Gestiona las relaciones de subordinación entre supervisores y colaboradores
          </p>
        </div>
        <Button variant="hero" className="gap-2" onClick={() => setShowAssignModal(true)}>
          <UserCog className="w-4 h-4" />
          Asignar Subordinación
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hierarchy Tree */}
        <div className="lg:col-span-2 kpi-card">
          <div className="flex items-center gap-2 mb-4">
            <Network className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Organigrama</h2>
          </div>
          
          <div className="space-y-1">
            {mockTeamData.map(member => renderHierarchyNode(member))}
          </div>
        </div>

        {/* Member Detail Panel */}
        <div className="kpi-card">
          <h2 className="text-lg font-semibold mb-4">Detalle de Miembro</h2>
          
          {selectedMember ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-14 w-14">
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">
                    {getInitials(selectedMember.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-foreground">{selectedMember.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedMember.email}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-secondary/50">
                  <p className="text-xs text-muted-foreground mb-1">Cargo</p>
                  <p className="text-sm font-medium text-foreground">{selectedMember.jobTitle}</p>
                </div>

                <div className="p-3 rounded-lg bg-secondary/50">
                  <p className="text-xs text-muted-foreground mb-1">Rol</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[selectedMember.role]}`}>
                    {roleLabels[selectedMember.role]}
                    {selectedMember.supervisorLevel && ` Nivel ${selectedMember.supervisorLevel}`}
                  </span>
                </div>

                {selectedMember.reportsToId && (
                  <div className="p-3 rounded-lg bg-secondary/50">
                    <p className="text-xs text-muted-foreground mb-1">Reporta a</p>
                    <p className="text-sm font-medium text-foreground">
                      {allMembers.find(m => m.id === selectedMember.reportsToId)?.name || 'No asignado'}
                    </p>
                  </div>
                )}

                {selectedMember.subordinates && selectedMember.subordinates.length > 0 && (
                  <div className="p-3 rounded-lg bg-secondary/50">
                    <p className="text-xs text-muted-foreground mb-2">Subordinados directos</p>
                    <div className="space-y-2">
                      {selectedMember.subordinates.map(sub => (
                        <div key={sub.id} className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getInitials(sub.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-foreground">{sub.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Button 
                variant="outline" 
                className="w-full gap-2"
                onClick={() => setShowAssignModal(true)}
              >
                <UserCog className="w-4 h-4" />
                Modificar Subordinación
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="w-12 h-12 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">
                Selecciona un miembro del organigrama para ver sus detalles
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Member List */}
      <div className="kpi-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Listado Completo</h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar miembro..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Miembro</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Cargo</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Rol</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Reporta a</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Subordinados</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr key={member.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground text-sm">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{member.jobTitle}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[member.role]}`}>
                      {roleLabels[member.role]}
                      {member.supervisorLevel && ` Nv.${member.supervisorLevel}`}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {member.reportsToId 
                      ? allMembers.find(m => m.id === member.reportsToId)?.name 
                      : '—'}
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {member.subordinates?.length || 0}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setSelectedMember(member);
                        setShowAssignModal(true);
                      }}
                    >
                      <UserCog className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Subordination Modal */}
      {showAssignModal && (
        <AssignSubordinationModal 
          member={selectedMember}
          allMembers={allMembers}
          onClose={() => setShowAssignModal(false)}
        />
      )}
    </div>
  );
};

// Modal for assigning subordination
const AssignSubordinationModal: React.FC<{
  member: TeamMember | null;
  allMembers: TeamMember[];
  onClose: () => void;
}> = ({ member, allMembers, onClose }) => {
  const [selectedMemberId, setSelectedMemberId] = useState(member?.id || '');
  const [selectedSupervisorId, setSelectedSupervisorId] = useState(member?.reportsToId || '');
  const [supervisorLevel, setSupervisorLevel] = useState(member?.supervisorLevel || 1);

  const supervisorCandidates = allMembers.filter(m => 
    m.role === 'owner' || m.role === 'supervisor' || m.role === 'business_admin'
  );

  const subordinateCandidates = allMembers.filter(m => 
    m.role === 'business_admin' || m.role === 'supervisor' || m.role === 'employee'
  );

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleSave = () => {
    const selectedMember = allMembers.find(m => m.id === selectedMemberId);
    const supervisor = allMembers.find(m => m.id === selectedSupervisorId);
    
    if (selectedMember && supervisor) {
      toast.success(`${selectedMember.name} ahora reporta a ${supervisor.name}`);
    } else if (selectedMember) {
      toast.success(`Actualizada jerarquía de ${selectedMember.name}`);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg mx-4 bg-card border border-border rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Asignar Subordinación</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Select Member */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Seleccionar Miembro</label>
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="">Seleccionar...</option>
              {subordinateCandidates.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} - {roleLabels[m.role]}
                </option>
              ))}
            </select>
          </div>

          {/* Select Supervisor */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Asignar Supervisor (reporta a)</label>
            <select
              value={selectedSupervisorId}
              onChange={(e) => setSelectedSupervisorId(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="">Sin supervisor directo</option>
              {supervisorCandidates.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} - {roleLabels[m.role]}
                  {m.supervisorLevel && ` (Nivel ${m.supervisorLevel})`}
                </option>
              ))}
            </select>
          </div>

          {/* Supervisor Level (if role is supervisor) */}
          {allMembers.find(m => m.id === selectedMemberId)?.role === 'supervisor' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Nivel de Supervisor</label>
              <p className="text-xs text-muted-foreground mb-2">
                Nivel 1 = más alto (reporta al admin), Nivel 2+ = supervisor intermedio
              </p>
              <select
                value={supervisorLevel}
                onChange={(e) => setSupervisorLevel(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                {[1, 2, 3, 4, 5].map((level) => (
                  <option key={level} value={level}>
                    Nivel {level}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Preview */}
          {selectedMemberId && (
            <div className="p-4 rounded-lg bg-secondary/50 space-y-2">
              <p className="text-sm font-medium">Vista previa de cambio:</p>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {getInitials(allMembers.find(m => m.id === selectedMemberId)?.name || '')}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{allMembers.find(m => m.id === selectedMemberId)?.name}</span>
                <span className="text-muted-foreground">→</span>
                {selectedSupervisorId ? (
                  <>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-warning/20 text-warning text-xs">
                        {getInitials(allMembers.find(m => m.id === selectedSupervisorId)?.name || '')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{allMembers.find(m => m.id === selectedSupervisorId)?.name}</span>
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">Sin supervisor</span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button variant="hero" onClick={handleSave} className="flex-1 gap-2">
            <Save className="w-4 h-4" />
            Guardar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminHierarchy;
