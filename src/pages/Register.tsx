import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, ArrowLeft, Ticket } from 'lucide-react';
import { Logo } from '@/components/icons/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    inviteCode: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate registration
    setTimeout(() => {
      setIsLoading(false);
      navigate('/employee');
    }, 1000);
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background">
      <div className="w-full max-w-md">
        {/* Back button */}
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Volver al inicio</span>
        </button>

        {/* Logo */}
        <div className="mb-8">
          <Logo size="lg" />
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Únete a tu equipo
          </h1>
          <p className="text-muted-foreground">
            Ingresa el código de invitación que te proporcionó tu administrador
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-5">
          {/* Invite Code - Highlighted */}
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
                Crear cuenta
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </Button>
        </form>

        {/* Terms */}
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
