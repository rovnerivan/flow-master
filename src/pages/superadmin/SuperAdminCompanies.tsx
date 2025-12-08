import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Users,
  FileText,
  TrendingUp,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Ban,
  CheckCircle,
  Download,
  Filter,
  RefreshCw,
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
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { KPICard } from '@/components/dashboard/KPICard';

interface Company {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  employees: number;
  processes: number;
  compliance: number;
  plan: 'Basic' | 'Pro' | 'Enterprise';
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  inviteCode: string;
  adminName: string;
  adminEmail: string;
  monthlyRevenue: number;
  lastActivity: string;
}

const mockCompanies: Company[] = [
  {
    id: '1',
    name: 'Empresa Demo S.A.',
    email: 'contacto@empresademo.com',
    phone: '+52 55 1234 5678',
    address: 'Ciudad de México, México',
    employees: 24,
    processes: 12,
    compliance: 87,
    plan: 'Pro',
    status: 'active',
    createdAt: '2024-01-05',
    inviteCode: 'DEMO1234',
    adminName: 'Juan Pérez',
    adminEmail: 'juan@empresademo.com',
    monthlyRevenue: 149,
    lastActivity: '2024-01-15',
  },
  {
    id: '2',
    name: 'Tech Solutions',
    email: 'info@techsolutions.com',
    phone: '+52 33 9876 5432',
    address: 'Guadalajara, México',
    employees: 45,
    processes: 28,
    compliance: 92,
    plan: 'Enterprise',
    status: 'active',
    createdAt: '2024-01-10',
    inviteCode: 'TECH5678',
    adminName: 'María García',
    adminEmail: 'maria@techsolutions.com',
    monthlyRevenue: 299,
    lastActivity: '2024-01-15',
  },
  {
    id: '3',
    name: 'Retail Corp',
    email: 'ventas@retailcorp.com',
    phone: '+52 81 5555 1234',
    address: 'Monterrey, México',
    employees: 18,
    processes: 8,
    compliance: 75,
    plan: 'Basic',
    status: 'active',
    createdAt: '2024-01-12',
    inviteCode: 'RETL9012',
    adminName: 'Carlos López',
    adminEmail: 'carlos@retailcorp.com',
    monthlyRevenue: 49,
    lastActivity: '2024-01-14',
  },
  {
    id: '4',
    name: 'Servicios Industriales',
    email: 'admin@servindustrial.com',
    phone: '+52 55 4444 5555',
    address: 'Querétaro, México',
    employees: 32,
    processes: 15,
    compliance: 68,
    plan: 'Pro',
    status: 'suspended',
    createdAt: '2023-11-20',
    inviteCode: 'SERV3456',
    adminName: 'Ana Martínez',
    adminEmail: 'ana@servindustrial.com',
    monthlyRevenue: 0,
    lastActivity: '2024-01-01',
  },
];

const SuperAdminCompanies: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>(mockCompanies);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlan, setFilterPlan] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.adminEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlan = filterPlan === 'all' || company.plan === filterPlan;
    const matchesStatus = filterStatus === 'all' || company.status === filterStatus;
    return matchesSearch && matchesPlan && matchesStatus;
  });

  const totalRevenue = companies
    .filter((c) => c.status === 'active')
    .reduce((sum, c) => sum + c.monthlyRevenue, 0);

  const totalEmployees = companies.reduce((sum, c) => sum + c.employees, 0);

  const handleStatusChange = (companyId: string, newStatus: Company['status']) => {
    setCompanies((prev) =>
      prev.map((c) => (c.id === companyId ? { ...c, status: newStatus } : c))
    );
    toast.success(`Estado de la empresa actualizado a ${newStatus}`);
  };

  const handleDeleteCompany = (companyId: string) => {
    setCompanies((prev) => prev.filter((c) => c.id !== companyId));
    toast.success('Empresa eliminada correctamente');
  };

  const handleCreateCompany = (data: Partial<Company>) => {
    const newCompany: Company = {
      id: Date.now().toString(),
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || '',
      address: data.address || '',
      employees: 0,
      processes: 0,
      compliance: 0,
      plan: (data.plan as Company['plan']) || 'Basic',
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      inviteCode: Math.random().toString(36).substring(2, 10).toUpperCase(),
      adminName: data.adminName || '',
      adminEmail: data.adminEmail || '',
      monthlyRevenue: data.plan === 'Enterprise' ? 299 : data.plan === 'Pro' ? 149 : 49,
      lastActivity: new Date().toISOString().split('T')[0],
    };
    setCompanies((prev) => [newCompany, ...prev]);
    setIsCreateModalOpen(false);
    toast.success('Empresa creada correctamente');
  };

  const handleEditCompany = (data: Partial<Company>) => {
    if (!selectedCompany) return;
    setCompanies((prev) =>
      prev.map((c) =>
        c.id === selectedCompany.id ? { ...c, ...data } : c
      )
    );
    setIsEditModalOpen(false);
    toast.success('Empresa actualizada correctamente');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestión de Empresas</h1>
          <p className="text-muted-foreground">Administra todas las empresas registradas</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Empresa
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Empresas"
          value={companies.length.toString()}
          subtitle={`${companies.filter((c) => c.status === 'active').length} activas`}
          icon={Building2}
        />
        <KPICard
          title="Total Empleados"
          value={totalEmployees.toString()}
          subtitle="en todas las empresas"
          icon={Users}
        />
        <KPICard
          title="MRR Total"
          value={`$${totalRevenue}`}
          subtitle="ingresos mensuales"
          icon={TrendingUp}
          variant="success"
        />
        <KPICard
          title="Cumplimiento Promedio"
          value={`${Math.round(
            companies.reduce((sum, c) => sum + c.compliance, 0) / companies.length
          )}%`}
          subtitle="promedio global"
          icon={FileText}
        />
      </div>

      {/* Filters */}
      <div className="kpi-card">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={filterPlan} onValueChange={setFilterPlan}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los planes</SelectItem>
                <SelectItem value="Basic">Basic</SelectItem>
                <SelectItem value="Pro">Pro</SelectItem>
                <SelectItem value="Enterprise">Enterprise</SelectItem>
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

      {/* Companies Table */}
      <div className="kpi-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Empresa
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Admin
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Plan
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Empleados
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Cumplimiento
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
              {filteredCompanies.map((company) => (
                <tr
                  key={company.id}
                  className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{company.name}</p>
                        <p className="text-xs text-muted-foreground">{company.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="text-sm text-foreground">{company.adminName}</p>
                      <p className="text-xs text-muted-foreground">{company.adminEmail}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={cn(
                        'px-2 py-1 rounded-full text-xs font-medium',
                        company.plan === 'Enterprise' && 'bg-purple-500/20 text-purple-500',
                        company.plan === 'Pro' && 'bg-primary/20 text-primary',
                        company.plan === 'Basic' && 'bg-secondary text-muted-foreground'
                      )}
                    >
                      {company.plan}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-foreground">{company.employees}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 rounded-full bg-secondary overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full',
                            company.compliance >= 80 && 'bg-success',
                            company.compliance >= 60 && company.compliance < 80 && 'bg-warning',
                            company.compliance < 60 && 'bg-destructive'
                          )}
                          style={{ width: `${company.compliance}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {company.compliance}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={cn(
                        'px-2 py-1 rounded-full text-xs font-medium',
                        company.status === 'active' && 'bg-success/20 text-success',
                        company.status === 'inactive' && 'bg-secondary text-muted-foreground',
                        company.status === 'suspended' && 'bg-destructive/20 text-destructive'
                      )}
                    >
                      {company.status === 'active' && 'Activo'}
                      {company.status === 'inactive' && 'Inactivo'}
                      {company.status === 'suspended' && 'Suspendido'}
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
                            setSelectedCompany(company);
                            setIsViewModalOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Ver detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedCompany(company);
                            setIsEditModalOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {company.status === 'active' ? (
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(company.id, 'suspended')}
                          >
                            <Ban className="w-4 h-4 mr-2" />
                            Suspender
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(company.id, 'active')}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Activar
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteCompany(company.id)}
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

        {filteredCompanies.length === 0 && (
          <div className="py-12 text-center">
            <Building2 className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No se encontraron empresas</p>
          </div>
        )}
      </div>

      {/* View Company Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles de la Empresa</DialogTitle>
          </DialogHeader>
          {selectedCompany && (
            <Tabs defaultValue="info" className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">Información</TabsTrigger>
                <TabsTrigger value="stats">Estadísticas</TabsTrigger>
                <TabsTrigger value="billing">Facturación</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4 mt-4">
                <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30">
                  <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {selectedCompany.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Código: {selectedCompany.inviteCode}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Mail className="w-3 h-3" /> Email
                    </p>
                    <p className="text-sm text-foreground">{selectedCompany.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Phone className="w-3 h-3" /> Teléfono
                    </p>
                    <p className="text-sm text-foreground">{selectedCompany.phone}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Ubicación
                    </p>
                    <p className="text-sm text-foreground">{selectedCompany.address}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Registro
                    </p>
                    <p className="text-sm text-foreground">{selectedCompany.createdAt}</p>
                  </div>
                </div>

                <div className="p-4 rounded-lg border border-border">
                  <h4 className="text-sm font-medium text-foreground mb-3">
                    Administrador Principal
                  </h4>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {selectedCompany.adminName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {selectedCompany.adminEmail}
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="stats" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-secondary/30 text-center">
                    <p className="text-3xl font-bold text-foreground">
                      {selectedCompany.employees}
                    </p>
                    <p className="text-sm text-muted-foreground">Empleados</p>
                  </div>
                  <div className="p-4 rounded-lg bg-secondary/30 text-center">
                    <p className="text-3xl font-bold text-foreground">
                      {selectedCompany.processes}
                    </p>
                    <p className="text-sm text-muted-foreground">Procesos</p>
                  </div>
                  <div className="p-4 rounded-lg bg-secondary/30 text-center">
                    <p className="text-3xl font-bold text-foreground">
                      {selectedCompany.compliance}%
                    </p>
                    <p className="text-sm text-muted-foreground">Cumplimiento</p>
                  </div>
                  <div className="p-4 rounded-lg bg-secondary/30 text-center">
                    <p className="text-3xl font-bold text-foreground">
                      {selectedCompany.lastActivity}
                    </p>
                    <p className="text-sm text-muted-foreground">Última actividad</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="billing" className="space-y-4 mt-4">
                <div className="p-4 rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-sm font-medium text-foreground">Plan Actual</h4>
                      <p className="text-2xl font-bold text-primary">
                        {selectedCompany.plan}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Mensual</p>
                      <p className="text-2xl font-bold text-foreground">
                        ${selectedCompany.monthlyRevenue}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    Cambiar Plan
                  </Button>
                </div>

                <div className="p-4 rounded-lg bg-secondary/30">
                  <h4 className="text-sm font-medium text-foreground mb-3">
                    Historial de Pagos
                  </h4>
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-2 border-b border-border last:border-0"
                      >
                        <div>
                          <p className="text-sm text-foreground">
                            Enero 2024 - {selectedCompany.plan}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Pagado el 01/01/2024
                          </p>
                        </div>
                        <span className="text-sm font-medium text-success">
                          ${selectedCompany.monthlyRevenue}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Company Modal */}
      <CompanyFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateCompany}
        title="Nueva Empresa"
      />

      {/* Edit Company Modal */}
      <CompanyFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditCompany}
        title="Editar Empresa"
        initialData={selectedCompany || undefined}
      />
    </div>
  );
};

interface CompanyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Company>) => void;
  title: string;
  initialData?: Partial<Company>;
}

const CompanyFormModal: React.FC<CompanyFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  initialData,
}) => {
  const [formData, setFormData] = useState<Partial<Company>>(
    initialData || {
      name: '',
      email: '',
      phone: '',
      address: '',
      plan: 'Basic',
      adminName: '',
      adminEmail: '',
    }
  );

  React.useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        plan: 'Basic',
        adminName: '',
        adminEmail: '',
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.adminEmail) {
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
            <Label>Nombre de la Empresa *</Label>
            <Input
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nombre de la empresa"
            />
          </div>
          <div className="space-y-2">
            <Label>Email de la Empresa *</Label>
            <Input
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="contacto@empresa.com"
            />
          </div>
          <div className="space-y-2">
            <Label>Teléfono</Label>
            <Input
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+52 55 1234 5678"
            />
          </div>
          <div className="space-y-2">
            <Label>Ubicación</Label>
            <Input
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Ciudad, País"
            />
          </div>
          <div className="space-y-2">
            <Label>Plan</Label>
            <Select
              value={formData.plan}
              onValueChange={(value) =>
                setFormData({ ...formData, plan: value as Company['plan'] })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Basic">Basic - $49/mes</SelectItem>
                <SelectItem value="Pro">Pro - $149/mes</SelectItem>
                <SelectItem value="Enterprise">Enterprise - $299/mes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Nombre del Administrador *</Label>
            <Input
              value={formData.adminName || ''}
              onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
              placeholder="Nombre completo"
            />
          </div>
          <div className="space-y-2">
            <Label>Email del Administrador *</Label>
            <Input
              type="email"
              value={formData.adminEmail || ''}
              onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
              placeholder="admin@empresa.com"
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleSubmit} className="flex-1">
              {initialData ? 'Guardar Cambios' : 'Crear Empresa'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SuperAdminCompanies;
