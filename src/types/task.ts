
export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'done';
  createdAt: Date;
  updatedAt: Date;
  subtasks: Subtask[];
  category: 'work' | 'personal' | 'urgent';
  dueDate?: Date;
}

export interface Column {
  id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'done';
  color: string;
}

export const categories = {
  work: { label: 'Trabajo', color: 'bg-blue-500', textColor: 'text-white' },
  personal: { label: 'Personal', color: 'bg-green-500', textColor: 'text-white' },
  urgent: { label: 'Urgente', color: 'bg-red-500', textColor: 'text-white' }
} as const;
