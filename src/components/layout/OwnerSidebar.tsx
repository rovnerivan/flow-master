import React from 'react';
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
  Crown,
  Network,
  Heart,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/icons/Logo';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface OwnerSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const ownerNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/owner' },
  { icon: Layers, label: 'Procesos', path: '/owner/processes' },
  { icon: ListTodo, label: 'Tareas', path: '/owner/tasks' },
  { icon: Users, label: 'Equipo', path: '/owner/team' },
  { icon: Network, label: 'Jerarquía', path: '/owner/hierarchy' },
  { icon: Heart, label: 'Visión y Liderazgo', path: '/owner/vision' },
  { icon: UserPlus, label: 'Onboardings', path: '/owner/onboardings' },
  { icon: AlertTriangle, label: 'Errores', path: '/owner/errors' },
  { icon: BarChart3, label: 'Analytics', path: '/owner/analytics' },
  { icon: FileText, label: 'Reportes', path: '/owner/reports' },
];

export const OwnerSidebar: React.FC<OwnerSidebarProps> = ({
  collapsed,
  onToggle,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

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
    if (path === '/owner') {
      return location.pathname === '/owner';
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
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-500/10">
            <Crown className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-medium text-violet-400">
              Dueño / Socio
            </span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <div className="space-y-1">
          {ownerNavItems.map(({ icon: Icon, label, path }) => (
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
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        <button
          onClick={() => navigate('/owner/settings')}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all duration-200',
            collapsed && 'justify-center',
            isActive('/owner/settings') && 'bg-sidebar-accent text-sidebar-primary font-medium'
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