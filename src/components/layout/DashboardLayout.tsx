import React, { useState } from 'react';
import { MessageCircle, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ResponsiveSidebar } from './ResponsiveSidebar';
import { MobileHeader } from './MobileHeader';

interface NavItem {
  icon: LucideIcon;
  label: string;
  path: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  navItems: NavItem[];
  basePath: string;
  roleIndicator?: {
    icon: LucideIcon;
    label: string;
    className?: string;
  };
  extraSidebarContent?: React.ReactNode;
  showSupport?: boolean;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  navItems,
  basePath,
  roleIndicator,
  extraSidebarContent,
  showSupport = true,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSupport = () => {
    toast.info('Función de soporte próximamente disponible');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row w-full">
      {/* Mobile Header */}
      <MobileHeader 
        onMenuClick={() => setMobileMenuOpen(true)}
      />

      {/* Sidebar */}
      <ResponsiveSidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileMenuOpen}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onMobileClose={() => setMobileMenuOpen(false)}
        navItems={navItems}
        basePath={basePath}
        roleIndicator={roleIndicator}
        extraContent={extraSidebarContent}
      />

      {/* Main Content */}
      <main
        className={cn(
          'flex-1 transition-all duration-300 pt-14 lg:pt-0',
          // Desktop margin based on sidebar state
          sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-64'
        )}
      >
        <div className="p-4 sm:p-6 lg:p-8 min-h-screen">
          {children}
        </div>
      </main>

      {/* Floating Support Button */}
      {showSupport && (
        <button
          onClick={handleSupport}
          className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 p-3 lg:p-4 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:scale-105 z-30"
        >
          <MessageCircle className="w-5 h-5 lg:w-6 lg:h-6" />
        </button>
      )}
    </div>
  );
};
