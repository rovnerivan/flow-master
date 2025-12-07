import React from 'react';
import { Play, ChevronRight, Clock, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProgressRing } from '@/components/dashboard/ProgressRing';

interface ProcessCardProps {
  title: string;
  description: string;
  progress: number;
  totalSteps: number;
  completedSteps: number;
  estimatedTime: string;
  isCompleted?: boolean;
  onClick?: () => void;
}

export const ProcessCard: React.FC<ProcessCardProps> = ({
  title,
  description,
  progress,
  totalSteps,
  completedSteps,
  estimatedTime,
  isCompleted = false,
  onClick,
}) => {
  return (
    <div
      className={cn(
        'mobile-card cursor-pointer group',
        isCompleted && 'border-success/30'
      )}
      onClick={onClick}
    >
      <div className="flex gap-4">
        {/* Progress Ring */}
        <ProgressRing progress={progress} size={64} strokeWidth={5}>
          {isCompleted ? (
            <CheckCircle className="w-6 h-6 text-success" />
          ) : (
            <span className="text-sm font-bold text-foreground">{progress}%</span>
          )}
        </ProgressRing>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-semibold text-foreground line-clamp-1">{title}</h4>
            <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {description}
          </p>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Play className="w-3 h-3" />
              <span>
                {completedSteps}/{totalSteps} pasos
              </span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{estimatedTime}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
