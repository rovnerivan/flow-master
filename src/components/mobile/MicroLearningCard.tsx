import React from 'react';
import { Play, Clock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MicroLearningProps {
  title: string;
  duration: string;
  thumbnail?: string;
  category: string;
}

export const MicroLearningCard: React.FC<MicroLearningProps> = ({
  title,
  duration,
  category,
}) => {
  return (
    <div className="mobile-card overflow-hidden">
      {/* Gradient Header */}
      <div className="relative h-28 -mx-4 -mt-4 mb-4 bg-gradient-primary flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-glow" />
        <div className="relative z-10 flex flex-col items-center gap-2">
          <div className="p-3 rounded-full bg-background/20 backdrop-blur-sm">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-xs font-medium text-primary-foreground/80 uppercase tracking-wider">
            Micro-Learning
          </span>
        </div>
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-background/5" />
        <div className="absolute -bottom-5 -left-5 w-20 h-20 rounded-full bg-background/5" />
      </div>

      {/* Content */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
            {category}
          </span>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{duration}</span>
          </div>
        </div>

        <h4 className="font-semibold text-foreground leading-snug">{title}</h4>

        <Button variant="hero" size="sm" className="w-full gap-2">
          <Play className="w-4 h-4" />
          Ver ahora
        </Button>
      </div>
    </div>
  );
};
