import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Settings,
  LogOut,
  X,
  LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/icons/Logo';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface NavItem {
  icon: LucideIcon;
  label: string;
  path: string;
}

interface ResponsiveSidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggle: () => void;
  onMobileClose: () => void;
  navItems: NavItem[];
  basePath: string;
  roleIndicator?: {
    icon: LucideIcon;
    label: string;
    className?: string;
  };
  extraContent?: React.ReactNode;
}

export const ResponsiveSidebar: React.FC<ResponsiveSidebarProps> = ({
  collapsed,
  mobileOpen,
  onToggle,
  onMobileClose,
  navItems,
  basePath,
  roleIndicator,
  extraContent,
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
    if (path === basePath) {
      return location.pathname === basePath;
    }
    return location.pathname.startsWith(path);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    onMobileClose();
  };

  const sidebarContent = (
    <>
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        {!collapsed && <Logo size="sm" />}
        {/* Mobile close button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMobileClose}
          className="lg:hidden shrink-0 ml-auto"
        >
          <X className="w-5 h-5" />
        </Button>
        {/* Desktop toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="hidden lg:flex shrink-0 ml-auto"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Role indicator */}
      {roleIndicator && !collapsed && (
        <div className="px-4 py-2 border-b border-sidebar-border">
          <div className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg',
            roleIndicator.className || 'bg-primary/10'
          )}>
            <roleIndicator.icon className="w-4 h-4" />
            <span className="text-sm font-medium">{roleIndicator.label}</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map(({ icon: Icon, label, path }) => (
            <button
              key={path}
              onClick={() => handleNavigation(path)}
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

        {/* Extra content */}
        {extraContent && !collapsed && (
          <div className="mt-6 pt-4 border-t border-sidebar-border">
            {extraContent}
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        <button
          onClick={() => handleNavigation(`${basePath}/settings`)}
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
    </>
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Desktop sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex-col transition-all duration-300 z-50 hidden lg:flex',
          collapsed ? 'w-[72px]' : 'w-64'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 z-50 lg:hidden w-72',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
};
