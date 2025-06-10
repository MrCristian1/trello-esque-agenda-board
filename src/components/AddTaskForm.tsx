
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X, Calendar as CalendarIcon } from 'lucide-react';
import { Task, categories } from '../types/task';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface AddTaskFormProps {
  onAddTask: (title: string, description?: string, category?: Task['category'], dueDate?: Date) => void;
}

export const AddTaskForm: React.FC<AddTaskFormProps> = ({ onAddTask }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Task['category']>('personal');
  const [dueDate, setDueDate] = useState<Date | undefined>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAddTask(title.trim(), description.trim() || undefined, category, dueDate);
      setTitle('');
      setDescription('');
      setCategory('personal');
      setDueDate(undefined);
      setIsOpen(false);
    }
  };

  const handleCancel = () => {
    setTitle('');
    setDescription('');
    setCategory('personal');
    setDueDate(undefined);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="w-full mb-6 bg-primary hover:bg-primary/90 text-primary-foreground animate-scale-in"
        size="lg"
      >
        <Plus className="w-4 h-4 mr-2" />
        Añadir Nueva Tarea
      </Button>
    );
  }

  return (
    <Card className="mb-6 border-primary/20 animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Nueva Tarea</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="task-title">Título *</Label>
            <Input
              id="task-title"
              type="text"
              placeholder="Escribe el título de la tarea..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>
          
          <div>
            <Label htmlFor="task-description">Descripción</Label>
            <Textarea
              id="task-description"
              placeholder="Añade una descripción opcional..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="task-category">Categoría</Label>
            <Select value={category} onValueChange={(value: Task['category']) => setCategory(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(categories).map(([key, categoryInfo]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <div className={cn("w-3 h-3 rounded-full", categoryInfo.color)} />
                      {categoryInfo.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Fecha de vencimiento (opcional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                  className="pointer-events-auto"
                />
                {dueDate && (
                  <div className="p-3 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDueDate(undefined)}
                      className="w-full"
                    >
                      Quitar fecha
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="flex gap-2">
            <Button type="submit" disabled={!title.trim()}>
              <Plus className="w-4 h-4 mr-2" />
              Crear Tarea
            </Button>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
