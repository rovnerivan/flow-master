import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, ArrowLeft, Ticket, Building2, Users, Copy, Check, Mail } from 'lucide-react';
import { Logo } from '@/components/icons/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type RegistrationType = 'select' | 'company' | 'employee';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [registrationType, setRegistrationType] = useState<RegistrationType>('select');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    inviteCode: '',
    companyName: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);

  const handleCompanyRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Register the company admin
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: formData.name,
            company_name: formData.companyName,
          },
        },
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          toast.error('Este email ya está registrado. Intenta iniciar sesión.');
        } else {
          toast.error(authError.message);
        }
        setIsLoading(false);
        return;
      }

      if (authData.user) {
        // Fetch the team's invite code
        const { data: profileData } = await supabase
          .from('profiles')
          .select('team_id')
          .eq('id', authData.user.id)
          .single();

        if (profileData?.team_id) {
          const { data: teamData } = await supabase
            .from('teams')
            .select('invite_code')
            .eq('id', profileData.team_id)
            .single();

          if (teamData?.invite_code) {
            setGeneratedCode(teamData.invite_code);
            toast.success('¡Cuenta creada exitosamente!');
          }
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Error al crear la cuenta. Intenta de nuevo.');
    }

    setIsLoading(false);
  };

  const handleEmployeeRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: formData.name,
            invite_code: formData.inviteCode.toUpperCase(),
          },
        },
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          toast.error('Este email ya está registrado. Intenta iniciar sesión.');
        } else {
          toast.error(authError.message);
        }
        setIsLoading(false);
        return;
      }

      if (authData.user) {
        toast.success('¡Cuenta creada! Bienvenido al equipo.');
        navigate('/employee');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Error al crear la cuenta. Verifica el código de invitación.');
    }

    setIsLoading(false);
  };

  const copyCode = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      setCodeCopied(true);
      toast.success('Código copiado al portapapeles');
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Success screen after company registration
  if (generatedCode) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background">
        <div className="w-full max-w-md text-center">
          <div className="mb-8">
            <Logo size="lg" />
          </div>

          <div className="kpi-card p-8">
            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-success" />
            </div>

            <h1 className="text-2xl font-bold text-foreground mb-2">
              ¡Bienvenido a ProcessFlow!
            </h1>
            <p className="text-muted-foreground mb-6">
              Tu empresa <strong>{formData.companyName}</strong> ha sido creada exitosamente.
            </p>

            <div className="bg-secondary/50 rounded-xl p-6 mb-6">
              <p className="text-sm text-muted-foreground mb-2">
                Tu código de invitación para empleados:
              </p>
              <div className="flex items-center justify-center gap-3">
                <code className="text-2xl font-mono font-bold text-primary tracking-wider">
                  {generatedCode}
                </code>
                <button
                  onClick={copyCode}
                  className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
                >
                  {codeCopied ? (
                    <Check className="w-5 h-5 text-success" />
                  ) : (
                    <Copy className="w-5 h-5 text-primary" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-3 text-left bg-primary/5 rounded-xl p-4 mb-6">
              <Mail className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                También te hemos enviado el código a <strong>{formData.email}</strong>
              </p>
            </div>

            <Button
              variant="hero"
              size="lg"
              className="w-full"
              onClick={() => navigate('/admin')}
            >
              Ir al panel de administración
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Type selection screen
  if (registrationType === 'select') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background">
        <div className="w-full max-w-lg">
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Volver al inicio</span>
          </button>

          <div className="mb-8">
            <Logo size="lg" />
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Mejora tu empresa
            </h1>
            <p className="text-muted-foreground">
              Selecciona cómo deseas registrarte
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setRegistrationType('company')}
              className="w-full p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition-all text-left group"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    Soy dueño/admin de empresa
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Crea tu cuenta de empresa y obtén un código para invitar a tu equipo
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setRegistrationType('employee')}
              className="w-full p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition-all text-left group"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    Tengo un código de invitación
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Mi administrador me dio un código para unirme al equipo
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Company registration form
  if (registrationType === 'company') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background">
        <div className="w-full max-w-md">
          <button
            onClick={() => setRegistrationType('select')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Volver</span>
          </button>

          <div className="mb-8">
            <Logo size="lg" />
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Crea tu cuenta de empresa
            </h1>
            <p className="text-muted-foreground">
              Al registrarte, recibirás un código para invitar a tu equipo
            </p>
          </div>

          <form onSubmit={handleCompanyRegister} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                Nombre de la empresa
              </label>
              <Input
                type="text"
                placeholder="Mi Empresa S.A."
                value={formData.companyName}
                onChange={(e) => updateField('companyName', e.target.value)}
                required
              />
            </div>

            <div className="h-px bg-border" />

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Tu nombre completo
              </label>
              <Input
                type="text"
                placeholder="Juan Pérez"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Email
              </label>
              <Input
                type="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Contraseña
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres"
                  value={formData.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="animate-pulse">Creando cuenta...</span>
              ) : (
                <>
                  Crear cuenta de empresa
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-6 text-xs text-muted-foreground text-center">
            Al crear una cuenta, aceptas nuestros{' '}
            <button className="text-primary hover:underline">
              Términos de Servicio
            </button>{' '}
            y{' '}
            <button className="text-primary hover:underline">
              Política de Privacidad
            </button>
          </p>
        </div>
      </div>
    );
  }

  // Employee registration form (with invite code)
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background">
      <div className="w-full max-w-md">
        <button
          onClick={() => setRegistrationType('select')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Volver</span>
        </button>

        <div className="mb-8">
          <Logo size="lg" />
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Únete a tu equipo
          </h1>
          <p className="text-muted-foreground">
            Ingresa el código de invitación que te proporcionó tu administrador
          </p>
        </div>

        <form onSubmit={handleEmployeeRegister} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Ticket className="w-4 h-4 text-primary" />
              Código de Invitación
            </label>
            <Input
              type="text"
              placeholder="FLOW12345"
              value={formData.inviteCode}
              onChange={(e) => updateField('inviteCode', e.target.value.toUpperCase())}
              className="font-mono text-center text-lg tracking-wider uppercase border-primary/50 focus:border-primary"
              required
            />
            <p className="text-xs text-muted-foreground">
              Este código vincula tu cuenta al equipo de tu empresa
            </p>
          </div>

          <div className="h-px bg-border my-6" />

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Nombre completo
            </label>
            <Input
              type="text"
              placeholder="Juan Pérez"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Email
            </label>
            <Input
              type="email"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Contraseña
            </label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Mínimo 8 caracteres"
                value={formData.password}
                onChange={(e) => updateField('password', e.target.value)}
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="hero"
            size="lg"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="animate-pulse">Creando cuenta...</span>
            ) : (
              <>
                Unirme al equipo
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </Button>
        </form>

        <p className="mt-6 text-xs text-muted-foreground text-center">
          Al crear una cuenta, aceptas nuestros{' '}
          <button className="text-primary hover:underline">
            Términos de Servicio
          </button>{' '}
          y{' '}
          <button className="text-primary hover:underline">
            Política de Privacidad
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;
