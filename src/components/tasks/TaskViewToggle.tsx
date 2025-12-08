import React from 'react';
import { List, Calendar, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ViewMode } from '@/lib/taskTypes';

interface TaskViewToggleProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

const views: { mode: ViewMode; icon: React.ElementType; label: string }[] = [
  { mode: 'list', icon: List, label: 'Lista' },
  { mode: 'calendar', icon: Calendar, label: 'Calendario' },
  { mode: 'kanban', icon: LayoutGrid, label: 'Kanban' },
];

const TaskViewToggle: React.FC<TaskViewToggleProps> = ({ currentView, onViewChange }) => {
  return (
    <div className="flex items-center bg-secondary rounded-lg p-1">
      {views.map(({ mode, icon: Icon, label }) => (
        <Button
          key={mode}
          variant="ghost"
          size="sm"
          className={cn(
            "gap-1.5 transition-colors",
            currentView === mode 
              ? "bg-card text-foreground shadow-sm" 
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => onViewChange(mode)}
        >
          <Icon className="h-4 w-4" />
          <span className="hidden sm:inline">{label}</span>
        </Button>
      ))}
    </div>
  );
};

export default TaskViewToggle;
