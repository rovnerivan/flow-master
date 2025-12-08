import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Task, 
  frequencyLabels, 
  statusLabels, 
  getOverallStatus,
  getMonthDays,
  isSameDay,
} from '@/lib/taskTypes';

interface TaskCalendarViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
}

const TaskCalendarView: React.FC<TaskCalendarViewProps> = ({
  tasks,
  onTaskClick,
  selectedDate,
  onDateSelect,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const weeks = getMonthDays(currentMonth);
  const weekDayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  
  const getTasksForDate = (date: Date): Task[] => {
    return tasks.filter(task => {
      if (!task.dueDate) {
        // Daily tasks appear every day
        if (task.frequency === 'daily') return true;
        // Weekly tasks on specific days
        if (task.frequency === 'weekly') {
          return date.getDay() === 1; // Monday by default
        }
        return false;
      }
      return isSameDay(new Date(task.dueDate), date);
    });
  };
  
  const prevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  
  const nextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };
  
  const goToToday = () => {
    setCurrentMonth(new Date());
    onDateSelect?.(new Date());
  };
  
  const isToday = (date: Date): boolean => isSameDay(date, new Date());
  const isSelected = (date: Date): boolean => selectedDate ? isSameDay(date, selectedDate) : false;
  
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">
            {currentMonth.toLocaleDateString('es', { month: 'long', year: 'numeric' })}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Hoy
          </Button>
          <Button variant="ghost" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Week day headers */}
      <div className="grid grid-cols-7 border-b border-border">
        {weekDayNames.map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="divide-y divide-border">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 divide-x divide-border">
            {week.map((date, dayIndex) => {
              if (!date) {
                return <div key={dayIndex} className="min-h-[100px] bg-secondary/20" />;
              }
              
              const dayTasks = getTasksForDate(date);
              const maxVisible = 3;
              const hasMore = dayTasks.length > maxVisible;
              
              return (
                <div
                  key={dayIndex}
                  className={cn(
                    "min-h-[100px] p-1 cursor-pointer transition-colors hover:bg-secondary/30",
                    isToday(date) && "bg-primary/5",
                    isSelected(date) && "bg-primary/10 ring-2 ring-primary ring-inset"
                  )}
                  onClick={() => onDateSelect?.(date)}
                >
                  <div className={cn(
                    "text-sm font-medium mb-1 p-1 rounded-full w-7 h-7 flex items-center justify-center",
                    isToday(date) && "bg-primary text-primary-foreground"
                  )}>
                    {date.getDate()}
                  </div>
                  
                  <div className="space-y-1">
                    {dayTasks.slice(0, maxVisible).map(task => {
                      const status = getOverallStatus(task.assignments);
                      const statusInfo = statusLabels[status];
                      const freqInfo = frequencyLabels[task.frequency];
                      
                      return (
                        <div
                          key={task.id}
                          className={cn(
                            "text-xs p-1 rounded truncate cursor-pointer hover:opacity-80",
                            statusInfo.color
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            onTaskClick(task);
                          }}
                          title={task.title}
                        >
                          <span className="font-medium">{freqInfo.shortLabel}</span> {task.title}
                        </div>
                      );
                    })}
                    {hasMore && (
                      <div className="text-xs text-muted-foreground text-center">
                        +{dayTasks.length - maxVisible} más
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskCalendarView;
