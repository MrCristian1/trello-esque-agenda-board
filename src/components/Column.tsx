
import React from 'react';
import { Task, Column as ColumnType } from '../types/task';
import { TaskCard } from './TaskCard';
import { Badge } from '@/components/ui/badge';

interface ColumnProps {
  column: ColumnType;
  tasks: Task[];
  onUpdateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
  onDeleteTask: (id: string) => void;
  onDragStart: (e: React.DragEvent, task: Task) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, status: Task['status']) => void;
  onSubtasksChange: (taskId: string, subtasks: Task['subtasks']) => void;
  isDragOver: boolean;
}

export const Column: React.FC<ColumnProps> = ({
  column,
  tasks,
  onUpdateTask,
  onDeleteTask,
  onDragStart,
  onDragOver,
  onDrop,
  onSubtasksChange,
  isDragOver
}) => {
  return (
    <div
      className={`bg-column-bg rounded-lg p-4 min-h-[500px] transition-all duration-200 column-hover ${
        isDragOver ? 'drag-over' : ''
      }`}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, column.status)}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-lg">{column.title}</h2>
        <Badge 
          variant="secondary" 
          className={`text-white font-medium`}
          style={{ backgroundColor: column.color }}
        >
          {tasks.length}
        </Badge>
      </div>
      
      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onUpdate={onUpdateTask}
            onDelete={onDeleteTask}
            onDragStart={onDragStart}
            onSubtasksChange={onSubtasksChange}
          />
        ))}
        
        {tasks.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No hay tareas aquí</p>
            <p className="text-xs mt-1">Arrastra tareas o crea una nueva</p>
          </div>
        )}
      </div>
    </div>
  );
};
