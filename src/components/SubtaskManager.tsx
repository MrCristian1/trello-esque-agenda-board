
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, X } from 'lucide-react';
import { Subtask } from '../types/task';

interface SubtaskManagerProps {
  subtasks: Subtask[];
  onSubtasksChange: (subtasks: Subtask[]) => void;
}

export const SubtaskManager: React.FC<SubtaskManagerProps> = ({
  subtasks,
  onSubtasksChange
}) => {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const addSubtask = () => {
    if (newSubtaskTitle.trim()) {
      const newSubtask: Subtask = {
        id: crypto.randomUUID(),
        title: newSubtaskTitle.trim(),
        completed: false
      };
      onSubtasksChange([...subtasks, newSubtask]);
      setNewSubtaskTitle('');
      setIsAdding(false);
    }
  };

  const toggleSubtask = (id: string) => {
    onSubtasksChange(
      subtasks.map(subtask =>
        subtask.id === id
          ? { ...subtask, completed: !subtask.completed }
          : subtask
      )
    );
  };

  const removeSubtask = (id: string) => {
    onSubtasksChange(subtasks.filter(subtask => subtask.id !== id));
  };

  const completedCount = subtasks.filter(s => s.completed).length;

  return (
    <div className="space-y-2">
      {subtasks.length > 0 && (
        <div className="text-xs text-muted-foreground mb-2">
          Subtareas: {completedCount}/{subtasks.length}
        </div>
      )}
      
      {subtasks.map((subtask) => (
        <div key={subtask.id} className="flex items-center gap-2">
          <Checkbox
            checked={subtask.completed}
            onCheckedChange={() => toggleSubtask(subtask.id)}
          />
          <span
            className={`text-sm flex-1 ${
              subtask.completed ? 'line-through text-muted-foreground' : ''
            }`}
          >
            {subtask.title}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => removeSubtask(subtask.id)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ))}

      {isAdding ? (
        <div className="flex gap-2">
          <Input
            placeholder="Nueva subtarea..."
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addSubtask()}
            className="text-sm"
            autoFocus
          />
          <Button size="sm" onClick={addSubtask}>
            <Plus className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsAdding(false);
              setNewSubtaskTitle('');
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsAdding(true)}
          className="w-full justify-start text-muted-foreground"
        >
          <Plus className="h-3 w-3 mr-1" />
          Añadir subtarea
        </Button>
      )}
    </div>
  );
};
