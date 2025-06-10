
import React, { useState, useMemo } from 'react';
import { Task, Column as ColumnType } from '../types/task';
import { useTasks } from '../hooks/useTasks';
import { Column } from './Column';
import { AddTaskForm } from './AddTaskForm';
import { SearchFilter } from './SearchFilter';
import { WeekNavigation } from './WeekNavigation';
import { useToast } from '@/hooks/use-toast';

const columns: ColumnType[] = [
  { id: 'pending', title: 'Pendiente', status: 'pending', color: 'hsl(var(--pending))' },
  { id: 'in-progress', title: 'En Proceso', status: 'in-progress', color: 'hsl(var(--in-progress))' },
  { id: 'done', title: 'Hecho', status: 'done', color: 'hsl(var(--done))' }
];

export const Board: React.FC = () => {
  const { 
    tasks, 
    addTask, 
    updateTask, 
    deleteTask, 
    moveTask, 
    getTasksForWeek, 
    getFilteredTasksByStatus,
    updateSubtasks
  } = useTasks();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const { toast } = useToast();

  const weekTasks = useMemo(() => getTasksForWeek(currentWeek), [tasks, currentWeek]);

  const filteredTasks = useMemo(() => {
    if (!searchTerm) return weekTasks;
    return weekTasks.filter(task =>
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.subtasks.some(subtask => 
        subtask.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [weekTasks, searchTerm]);

  const getFilteredTasksByStatusMemo = (status: Task['status']) => {
    return getFilteredTasksByStatus(status, currentWeek, searchTerm);
  };

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', '');
    
    setTimeout(() => {
      (e.target as HTMLElement).classList.add('dragging');
    }, 0);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e: React.DragEvent, status: Task['status']) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (draggedTask && draggedTask.status !== status) {
      moveTask(draggedTask.id, status);
      toast({
        title: "Tarea movida",
        description: `La tarea "${draggedTask.title}" se movió a ${columns.find(c => c.status === status)?.title}`,
      });
    }

    document.querySelectorAll('.dragging').forEach(el => {
      el.classList.remove('dragging');
    });
    
    setDraggedTask(null);
  };

  const handleAddTask = (title: string, description?: string, category?: Task['category'], dueDate?: Date) => {
    addTask(title, description, category, dueDate);
    toast({
      title: "Tarea creada",
      description: `La tarea "${title}" se añadió a Pendiente`,
    });
  };

  const handleUpdateTask = (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
    updateTask(id, updates);
    toast({
      title: "Tarea actualizada",
      description: "Los cambios se guardaron correctamente",
    });
  };

  const handleDeleteTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    deleteTask(id);
    toast({
      title: "Tarea eliminada",
      description: task ? `La tarea "${task.title}" se eliminó` : "Tarea eliminada",
      variant: "destructive"
    });
  };

  const handleSubtasksChange = (taskId: string, subtasks: Task['subtasks']) => {
    updateSubtasks(taskId, subtasks);
  };

  const totalTasks = weekTasks.length;
  const completedTasks = weekTasks.filter(task => task.status === 'done').length;

  return (
    <div className="p-6 bg-board-bg min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Mi Agenda Personal</h1>
          <p className="text-muted-foreground">
            {totalTasks} tareas esta semana • {completedTasks} completadas
          </p>
        </div>

        {/* Week Navigation */}
        <WeekNavigation 
          currentWeek={currentWeek}
          onWeekChange={setCurrentWeek}
        />

        {/* Add Task Form */}
        <AddTaskForm onAddTask={handleAddTask} />

        {/* Search Filter */}
        <div className="mb-6">
          <SearchFilter searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        </div>

        {/* Search Results Info */}
        {searchTerm && (
          <div className="mb-4 p-3 bg-primary/10 rounded-lg animate-fade-in">
            <p className="text-sm">
              Mostrando {filteredTasks.length} de {totalTasks} tareas para "{searchTerm}"
            </p>
          </div>
        )}

        {/* Board Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((column) => (
            <div
              key={column.id}
              onDragEnter={(e) => handleDragEnter(e, column.id)}
              onDragLeave={handleDragLeave}
            >
              <Column
                column={column}
                tasks={getFilteredTasksByStatusMemo(column.status)}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onSubtasksChange={handleSubtasksChange}
                isDragOver={dragOverColumn === column.id}
              />
            </div>
          ))}
        </div>

        {/* Empty State */}
        {totalTasks === 0 && (
          <div className="text-center py-12 animate-fade-in">
            <h3 className="text-xl font-medium mb-2">¡No hay tareas esta semana!</h3>
            <p className="text-muted-foreground mb-4">
              Comienza creando tu primera tarea para organizar tu trabajo.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
