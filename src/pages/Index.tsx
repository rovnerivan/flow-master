import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Play, Sparkles, Users, BarChart3, Zap, Upload, Settings, TrendingUp, ChevronDown } from 'lucide-react';
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
    title: 'Aprendizajes Pequeños',
    description: 'Tips de 45 segundos que impactan día a día sin interrumpir tu operación.',
  },
  {
    icon: BarChart3,
    title: 'Inversión con Resultados',
    description: 'Dashboards que demuestran el impacto real en tu operación.',
  },
  {
    icon: Users,
    title: 'Desarrollo Grupal',
    description: 'Tu equipo aprende mejor cuando comparte logros y conocimiento.',
  },
];

const processSteps = [
  {
    number: 1,
    icon: Upload,
    title: 'Sube tu contenido',
    description: 'Carga PDFs, documentos de texto, o graba directamente tu voz explicando el proceso.',
  },
  {
    number: 2,
    icon: Settings,
    title: 'La IA estructura todo',
    description: 'Nuestro motor de IA convierte tu contenido en pasos claros y micro-videos optimizados.',
  },
  {
    number: 3,
    icon: Play,
    title: 'Tu equipo aprende',
    description: 'Los empleados acceden desde su móvil, completan checklists y certifican su conocimiento.',
  },
  {
    number: 4,
    icon: TrendingUp,
    title: 'Mide el impacto',
    description: 'Dashboard en tiempo real con métricas de ROI, compliance y tiempo ahorrado.',
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
            Mejora tu empresa
          </Button>
        </div>
      </header>

      {/* Hero Section with Pain Points */}
      <section className="relative z-10 px-6 lg:px-12 py-16 lg:py-24">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-slide-up">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Powered by AI • Diseñado para PYMEs
            </span>
          </div>

          {/* Pain Point Storytelling */}
          <div className="mb-8 animate-slide-up" style={{ animationDelay: '0.05s' }}>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-4 italic">
              ¿Cansado de repetir lo mismo una y otra vez a tu equipo?
            </p>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              ¿De estar detrás de ellos para ver si hicieron X o Y? ¿De que se olviden de lo importante 
              y no hagan bien las cosas?
            </p>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Todo fluye cuando{' '}
            <span className="gradient-text">gestionas bien</span>
          </h1>

          {/* Solution */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <span className="text-primary font-semibold">Viento en Popa Manager</span> te ayuda a que eso no pase más.
          </p>
          <p className="text-lg text-foreground max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.25s' }}>
            Procesos claros, tareas organizadas, equipo alineado. Navega sin contratiempos.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <Button
              variant="hero"
              size="xl"
              onClick={() => navigate('/register')}
              className="gap-2"
            >
              Mejora tu empresa
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="glass" size="xl" className="gap-2">
              <Play className="w-5 h-5" />
              Ver demo (2 min)
            </Button>
          </div>
        </div>
      </section>

      {/* Process Steps Section - "De proceso a video en minutos" */}
      <section className="relative z-10 px-6 lg:px-12 py-16 lg:py-24 bg-secondary/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              De proceso a video{' '}
              <span className="gradient-text">en minutos</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Cuatro simples pasos para transformar la manera en que entrenas a tu equipo.
            </p>
          </div>

          {/* Steps Timeline */}
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border hidden md:block" />

            <div className="space-y-8">
              {processSteps.map(({ number, icon: Icon, title, description }, index) => (
                <div
                  key={number}
                  className="relative flex items-start gap-6 animate-slide-up"
                  style={{ animationDelay: `${0.1 * index}s` }}
                >
                  {/* Icon Circle */}
                  <div className="relative z-10 flex-shrink-0">
                    <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                      <Icon className="w-7 h-7 text-primary-foreground" />
                    </div>
                    {/* Number Badge */}
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary-foreground text-primary text-sm font-bold flex items-center justify-center border-2 border-primary">
                      {number}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="pt-2">
                    <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
                    <p className="text-muted-foreground">{description}</p>
                  </div>
                </div>
              ))}
            </div>
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
              ¿Listo para dejar de repetir las mismas instrucciones?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Comienza hoy y ve resultados reales en tu operación.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                variant="hero"
                size="lg"
                onClick={() => navigate('/register')}
                className="gap-2"
              >
                Mejora tu empresa
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border px-6 lg:px-12 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <p className="text-sm text-muted-foreground">
            © 2024 Viento en Popa Manager. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;