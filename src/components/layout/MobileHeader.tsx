import React from 'react';
import { Menu, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons/Logo';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { cn } from '@/lib/utils';

interface MobileHeaderProps {
  onMenuClick: () => void;
  showNotifications?: boolean;
  className?: string;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  onMenuClick,
  showNotifications = true,
  className,
}) => {
  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 h-14 bg-background/95 backdrop-blur-sm border-b border-border flex items-center justify-between px-4 z-30 lg:hidden',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="shrink-0"
        >
          <Menu className="w-5 h-5" />
        </Button>
        <Logo size="sm" />
      </div>

      {showNotifications && (
        <div className="flex items-center gap-2">
          <NotificationBell />
        </div>
      )}
    </header>
  );
};
