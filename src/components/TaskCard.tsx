
import React, { useState } from 'react';
import { Task, categories } from '../types/task';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Edit2, Trash2, Calendar as CalendarIcon, AlertTriangle } from 'lucide-react';
import { SubtaskManager } from './SubtaskManager';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onUpdate: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
  onDelete: (id: string) => void;
  onDragStart: (e: React.DragEvent, task: Task) => void;
  onSubtasksChange: (taskId: string, subtasks: Task['subtasks']) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onUpdate, 
  onDelete, 
  onDragStart, 
  onSubtasksChange 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [editCategory, setEditCategory] = useState(task.category);
  const [editDueDate, setEditDueDate] = useState<Date | undefined>(task.dueDate);

  const handleSave = () => {
    onUpdate(task.id, {
      title: editTitle,
      description: editDescription,
      category: editCategory,
      dueDate: editDueDate
    });
    setIsEditing(false);
  };

  const formatDate = (date: Date) => {
    return format(date, 'dd MMM', { locale: es });
  };

  const isOverdue = () => {
    if (!task.dueDate) return false;
    return task.dueDate < new Date() && task.status !== 'done';
  };

  const isDueSoon = () => {
    if (!task.dueDate) return false;
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    return task.dueDate <= threeDaysFromNow && task.dueDate >= new Date() && task.status !== 'done';
  };

  const getStatusBadge = () => {
    const statusMap = {
      pending: { label: 'Pendiente', className: 'bg-pending text-black' },
      'in-progress': { label: 'En proceso', className: 'bg-in-progress text-white' },
      done: { label: 'Hecho', className: 'bg-done text-white' }
    };
    return statusMap[task.status];
  };

  const categoryInfo = categories[task.category];
  const completedSubtasks = task.subtasks.filter(s => s.completed).length;
  const totalSubtasks = task.subtasks.length;

  return (
    <Card
      className={cn(
        "task-enter cursor-move hover:shadow-lg transition-all duration-200 bg-task-bg border-task-shadow animate-fade-in",
        isOverdue() && "border-red-500 border-2"
      )}
      draggable
      onDragStart={(e) => onDragStart(e, task)}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-sm leading-tight flex-1">{task.title}</h3>
          <div className="flex gap-1 ml-2">
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Edit2 className="h-3 w-3" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Editar Tarea</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Título</Label>
                    <Input
                      id="title"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Categoría</Label>
                    <Select value={editCategory} onValueChange={(value: Task['category']) => setEditCategory(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(categories).map(([key, category]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <div className={cn("w-3 h-3 rounded-full", category.color)} />
                              {category.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Fecha de vencimiento</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !editDueDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {editDueDate ? format(editDueDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={editDueDate}
                          onSelect={setEditDueDate}
                          initialFocus
                          className="pointer-events-auto"
                        />
                        {editDueDate && (
                          <div className="p-3 border-t">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditDueDate(undefined)}
                              className="w-full"
                            >
                              Quitar fecha
                            </Button>
                          </div>
                        )}
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label>Subtareas</Label>
                    <SubtaskManager
                      subtasks={task.subtasks}
                      onSubtasksChange={(subtasks) => onSubtasksChange(task.id, subtasks)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSave}>Guardar</Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => onDelete(task.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        {task.description && (
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Subtasks Progress */}
        {totalSubtasks > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Subtareas</span>
              <span>{completedSubtasks}/{totalSubtasks}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div 
                className="bg-primary rounded-full h-1.5 transition-all duration-300"
                style={{ width: `${totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Badge className={`text-xs ${getStatusBadge().className}`}>
              {getStatusBadge().label}
            </Badge>
            <Badge className={cn("text-xs", categoryInfo.color, categoryInfo.textColor)}>
              {categoryInfo.label}
            </Badge>
          </div>
          
          {task.dueDate && (
            <div className={cn(
              "flex items-center gap-1 text-xs",
              isOverdue() ? "text-red-500" : isDueSoon() ? "text-yellow-600" : "text-muted-foreground"
            )}>
              {isOverdue() && <AlertTriangle className="h-3 w-3" />}
              <CalendarIcon className="h-3 w-3" />
              {formatDate(task.dueDate)}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
