import React, { useState } from 'react';
import { Bell, X, Check, CheckCheck, Clock, AlertTriangle, UserPlus, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'task' | 'error' | 'onboarding' | 'process' | 'general';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'task',
    title: 'Nueva tarea asignada',
    message: 'Se te ha asignado la tarea "Verificar inventario de caja"',
    timestamp: 'Hace 5 min',
    read: false,
  },
  {
    id: '2',
    type: 'error',
    title: 'Error detectado',
    message: 'Se detectó un error en el proceso "Cierre de Caja"',
    timestamp: 'Hace 15 min',
    read: false,
  },
  {
    id: '3',
    type: 'onboarding',
    title: 'Onboarding completado',
    message: 'Pedro Sánchez completó su proceso de onboarding',
    timestamp: 'Hace 1 hora',
    read: true,
  },
  {
    id: '4',
    type: 'process',
    title: 'Nuevo proceso publicado',
    message: 'El proceso "Atención al Cliente v2" está disponible',
    timestamp: 'Hace 2 horas',
    read: true,
  },
  {
    id: '5',
    type: 'general',
    title: 'Recordatorio',
    message: 'Tienes 3 tareas pendientes para hoy',
    timestamp: 'Hace 3 horas',
    read: true,
  },
];

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  task: Clock,
  error: AlertTriangle,
  onboarding: UserPlus,
  process: Layers,
  general: Bell,
};

const typeColors: Record<string, string> = {
  task: 'bg-primary/10 text-primary',
  error: 'bg-destructive/10 text-destructive',
  onboarding: 'bg-success/10 text-success',
  process: 'bg-warning/10 text-warning',
  general: 'bg-muted text-muted-foreground',
};

interface NotificationBellProps {
  className?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const [showFullView, setShowFullView] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const NotificationItem: React.FC<{ notification: Notification }> = ({ notification }) => {
    const Icon = typeIcons[notification.type] || Bell;
    
    return (
      <div 
        className={cn(
          'flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer hover:bg-secondary/50',
          !notification.read && 'bg-primary/5'
        )}
        onClick={() => markAsRead(notification.id)}
      >
        <div className={cn('p-2 rounded-lg shrink-0', typeColors[notification.type])}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={cn('text-sm font-medium', !notification.read && 'text-foreground')}>
              {notification.title}
            </p>
            {!notification.read && (
              <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {notification.timestamp}
          </p>
        </div>
      </div>
    );
  };

  // Full page view
  if (showFullView) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <header className="flex items-center justify-between p-4 border-b border-border">
          <h1 className="text-xl font-semibold">Notificaciones</h1>
          <Button variant="ghost" size="icon" onClick={() => setShowFullView(false)}>
            <X className="w-5 h-5" />
          </Button>
        </header>

        <div className="p-4 space-y-6 max-w-2xl mx-auto">
          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {['Todas', 'Tareas', 'Errores', 'Onboarding', 'Procesos'].map((cat) => (
              <Button key={cat} variant="outline" size="sm">
                {cat}
              </Button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="gap-2">
              <CheckCheck className="w-4 h-4" />
              Marcar todo como leído
            </Button>
          </div>

          {/* Notifications List */}
          <div className="space-y-2">
            {notifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      <Button 
        variant="ghost" 
        size="icon" 
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Notificaciones</h3>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  <CheckCheck className="w-3 h-3 mr-1" />
                  Marcar leídas
                </Button>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-border">
              {notifications.slice(0, 5).map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}
            </div>

            <div className="p-3 border-t border-border">
              <Button 
                variant="ghost" 
                className="w-full text-sm"
                onClick={() => {
                  setIsOpen(false);
                  setShowFullView(true);
                }}
              >
                Ver todas las notificaciones
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};