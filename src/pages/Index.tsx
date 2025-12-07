import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Play, Sparkles, Users, BarChart3, Zap, CheckCircle } from 'lucide-react';
import { Logo } from '@/components/icons/Logo';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: Sparkles,
    title: 'IA que Simplifica',
    description: 'Convierte PDFs y manuales en micro-videos interactivos automáticamente.',
  },
  {
    icon: Zap,
    title: 'Micro-Learning Diario',
    description: 'Tips de 45 segundos que mantienen a tu equipo actualizado sin interrumpir.',
  },
  {
    icon: BarChart3,
    title: 'ROI Medible',
    description: 'Dashboards que demuestran el impacto real en tu operación.',
  },
  {
    icon: Users,
    title: 'Social Learning',
    description: 'Tu equipo aprende mejor cuando comparte logros y conocimiento.',
  },
];

const Index: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-primary/3 blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-6">
        <Logo size="md" />
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/login')}>
            Iniciar sesión
          </Button>
          <Button variant="hero" onClick={() => navigate('/register')}>
            Comenzar gratis
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 px-6 lg:px-12 py-16 lg:py-24">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-slide-up">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Powered by AI • Diseñado para PYMEs
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Entrena a tu equipo{' '}
            <span className="gradient-text">sin perder tiempo</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            ProcessFlow convierte tus procesos en micro-videos que tu equipo realmente
            completa. Menos errores, más consistencia, ROI medible.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <Button
              variant="hero"
              size="xl"
              onClick={() => navigate('/register')}
              className="gap-2"
            >
              Comenzar prueba gratuita
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="glass" size="xl" className="gap-2">
              <Play className="w-5 h-5" />
              Ver demo (2 min)
            </Button>
          </div>

          {/* Social Proof */}
          <div className="flex items-center justify-center gap-8 mt-12 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            {[
              { value: '500+', label: 'Empresas' },
              { value: '10k+', label: 'Empleados' },
              { value: '85%', label: 'Retención' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-6 lg:px-12 py-16 lg:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Todo lo que necesitas para{' '}
              <span className="gradient-text">escalar tu entrenamiento</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Una plataforma completa que combina IA, gamificación y analytics
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="kpi-card group hover:border-primary/30 cursor-pointer"
              >
                <div className="p-3 rounded-xl bg-primary/10 w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 lg:px-12 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto">
          <div className="kpi-card text-center py-12 px-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
              Listo para transformar tu entrenamiento?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Únete a más de 500 empresas que ya están ahorrando tiempo y reduciendo errores.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                variant="hero"
                size="lg"
                onClick={() => navigate('/register')}
                className="gap-2"
              >
                Comenzar ahora
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                14 días gratis
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                Sin tarjeta de crédito
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                Soporte 24/7
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border px-6 lg:px-12 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <p className="text-sm text-muted-foreground">
            © 2024 ProcessFlow. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
