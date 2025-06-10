
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';
import { es } from 'date-fns/locale';

interface WeekNavigationProps {
  currentWeek: Date;
  onWeekChange: (date: Date) => void;
}

export const WeekNavigation: React.FC<WeekNavigationProps> = ({
  currentWeek,
  onWeekChange
}) => {
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });

  const goToPreviousWeek = () => {
    onWeekChange(subWeeks(currentWeek, 1));
  };

  const goToNextWeek = () => {
    onWeekChange(addWeeks(currentWeek, 1));
  };

  const goToCurrentWeek = () => {
    onWeekChange(new Date());
  };

  const isCurrentWeek = () => {
    const now = new Date();
    const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 });
    return weekStart.getTime() === currentWeekStart.getTime();
  };

  return (
    <div className="flex items-center justify-between bg-card rounded-lg p-4 mb-6 border">
      <Button
        variant="outline"
        size="sm"
        onClick={goToPreviousWeek}
        className="flex items-center gap-2"
      >
        <ChevronLeft className="h-4 w-4" />
        Semana anterior
      </Button>

      <div className="flex items-center gap-4">
        <div className="text-center">
          <div className="font-semibold text-lg">
            {format(weekStart, 'd', { locale: es })} - {format(weekEnd, 'd MMM yyyy', { locale: es })}
          </div>
          <div className="text-sm text-muted-foreground">
            Semana del {format(weekStart, 'EEEE', { locale: es })} al {format(weekEnd, 'EEEE', { locale: es })}
          </div>
        </div>
        
        {!isCurrentWeek() && (
          <Button
            variant="ghost"
            size="sm"
            onClick={goToCurrentWeek}
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Hoy
          </Button>
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={goToNextWeek}
        className="flex items-center gap-2"
      >
        Semana siguiente
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
