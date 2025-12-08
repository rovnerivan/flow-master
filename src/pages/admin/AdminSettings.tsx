import React, { useState } from 'react';
import { Building2, Users, Bell, Shield, Palette, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const AdminSettings: React.FC = () => {
  const [codeCopied, setCodeCopied] = useState(false);
  const inviteCode = 'FLOW12345';

  const copyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCodeCopied(true);
    toast.success('Código copiado');
    setTimeout(() => setCodeCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configuración</h1>
        <p className="text-muted-foreground">
          Administra la configuración de tu empresa
        </p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* Company Info */}
        <div className="kpi-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              Información de la Empresa
            </h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">
                Nombre de la empresa
              </label>
              <Input defaultValue="Mi Empresa S.A." className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">
                Email de contacto
              </label>
              <Input defaultValue="admin@miempresa.com" className="mt-1" />
            </div>
          </div>
        </div>

        {/* Invite Code */}
        <div className="kpi-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              Código de Invitación
            </h2>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4">
            Comparte este código con nuevos empleados para que se unan a tu equipo
          </p>
          
          <div className="flex items-center gap-2">
            <code className="flex-1 px-4 py-3 rounded-lg bg-secondary border border-border font-mono text-lg text-center tracking-wider">
              {inviteCode}
            </code>
            <Button
              variant="outline"
              size="icon"
              onClick={copyCode}
            >
              {codeCopied ? (
                <Check className="w-4 h-4 text-success" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Notifications */}
        <div className="kpi-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              Notificaciones
            </h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Alertas de errores</p>
                <p className="text-sm text-muted-foreground">
                  Recibe notificaciones cuando se detecten errores
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Onboardings completados</p>
                <p className="text-sm text-muted-foreground">
                  Notificación cuando un empleado completa onboarding
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Reportes semanales</p>
                <p className="text-sm text-muted-foreground">
                  Recibe un resumen semanal por email
                </p>
              </div>
              <Switch />
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="kpi-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              Seguridad
            </h2>
          </div>
          
          <div className="space-y-4">
            <Button variant="outline">Cambiar contraseña</Button>
            <Button variant="outline">Configurar 2FA</Button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button variant="hero" onClick={() => toast.success('Configuración guardada')}>
          Guardar cambios
        </Button>
      </div>
    </div>
  );
};

export default AdminSettings;
