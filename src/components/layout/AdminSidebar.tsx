import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  FileText,
  AlertTriangle,
  UserPlus,
  ListTodo,
  Shield,
  Network,
  Heart,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/icons/Logo';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  isSupervisor?: boolean;
}

const adminNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Layers, label: 'Procesos', path: '/admin/processes' },
  { icon: ListTodo, label: 'Tareas', path: '/admin/tasks' },
  { icon: Users, label: 'Equipo', path: '/admin/team' },
  { icon: Network, label: 'Jerarquía', path: '/admin/hierarchy' },
  { icon: Heart, label: 'Visión y Liderazgo', path: '/admin/vision' },
  { icon: UserPlus, label: 'Onboardings', path: '/admin/onboardings' },
  { icon: AlertTriangle, label: 'Errores', path: '/admin/errors' },
  { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
  { icon: FileText, label: 'Reportes', path: '/admin/reports' },
];

const supervisorNavItems = [
  { icon: LayoutDashboard, label: 'Mi Dashboard', path: '/supervisor' },
  { icon: ListTodo, label: 'Mis Tareas', path: '/supervisor/my-tasks' },
  { icon: Users, label: 'Mi Equipo', path: '/supervisor/team' },
  { icon: UserPlus, label: 'Onboardings', path: '/supervisor/onboardings' },
  { icon: AlertTriangle, label: 'Errores', path: '/supervisor/errors' },
  { icon: BarChart3, label: 'Analytics', path: '/supervisor/analytics' },
  { icon: Heart, label: 'Visión y Liderazgo', path: '/supervisor/vision' },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  collapsed,
  onToggle,
  isSupervisor = false,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = isSupervisor ? supervisorNavItems : adminNavItems;
  const basePath = isSupervisor ? '/supervisor' : '/admin';

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

  const isActive = (path: string) => {
    if (path === basePath) {
      return location.pathname === basePath;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 z-40',
        collapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        {!collapsed && <Logo size="sm" />}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="shrink-0 ml-auto"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Role indicator */}
      {!collapsed && (
        <div className="px-4 py-2 border-b border-sidebar-border">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              {isSupervisor ? 'Supervisor' : 'Administrador'}
            </span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map(({ icon: Icon, label, path }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all duration-200',
                collapsed && 'justify-center',
                isActive(path) && 'bg-sidebar-accent text-sidebar-primary font-medium'
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="text-sm">{label}</span>}
            </button>
          ))}
        </div>

        {/* If supervisor, show link to switch to collaborator view */}
        {isSupervisor && !collapsed && (
          <div className="mt-6 pt-4 border-t border-sidebar-border">
            <p className="text-xs text-sidebar-foreground/50 px-3 mb-2">Vista Colaborador</p>
            <button
              onClick={() => navigate('/employee')}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all duration-200"
            >
              <LayoutDashboard className="w-5 h-5 shrink-0" />
              <span className="text-sm">Mi Espacio</span>
            </button>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        <button
          onClick={() => navigate(`${basePath}/settings`)}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all duration-200',
            collapsed && 'justify-center',
            isActive(`${basePath}/settings`) && 'bg-sidebar-accent text-sidebar-primary font-medium'
          )}
        >
          <Settings className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="text-sm">Configuración</span>}
        </button>

        <button
          onClick={handleLogout}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-destructive/70 hover:bg-destructive/10 hover:text-destructive transition-all duration-200 w-full',
            collapsed && 'justify-center'
          )}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="text-sm">Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
};