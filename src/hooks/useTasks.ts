
import { useState, useEffect } from 'react';
import { Task, Subtask } from '../types/task';
import { startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';

const STORAGE_KEY = 'trello-tasks';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsedTasks = JSON.parse(saved);
        return parsedTasks.map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt),
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined
        }));
      } catch (error) {
        console.error('Error parsing tasks from localStorage:', error);
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (
    title: string, 
    description?: string, 
    category: Task['category'] = 'personal',
    dueDate?: Date
  ) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      description,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      subtasks: [],
      category,
      dueDate
    };
    setTasks(prev => [...prev, newTask]);
    return newTask;
  };

  const updateTask = (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === id 
          ? { ...task, ...updates, updatedAt: new Date() }
          : task
      )
    );
  };

  const updateSubtasks = (taskId: string, subtasks: Subtask[]) => {
    updateTask(taskId, { subtasks });
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const moveTask = (id: string, newStatus: Task['status']) => {
    updateTask(id, { status: newStatus });
  };

  const getTasksByStatus = (status: Task['status']) => {
    return tasks.filter(task => task.status === status);
  };

  const getTasksForWeek = (weekDate: Date) => {
    const weekStart = startOfWeek(weekDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(weekDate, { weekStartsOn: 1 });
    
    return tasks.filter(task => {
      if (task.dueDate) {
        return isWithinInterval(task.dueDate, { start: weekStart, end: weekEnd });
      }
      // Si no hay fecha de vencimiento, incluir tareas de la semana actual por defecto
      const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const currentWeekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
      return isWithinInterval(task.createdAt, { start: currentWeekStart, end: currentWeekEnd }) &&
             weekStart.getTime() === currentWeekStart.getTime();
    });
  };

  const getFilteredTasksByStatus = (status: Task['status'], weekDate: Date, searchTerm: string = '') => {
    let filteredTasks = getTasksForWeek(weekDate).filter(task => task.status === status);
    
    if (searchTerm) {
      filteredTasks = filteredTasks.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.subtasks.some(subtask => 
          subtask.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    // Ordenar por fecha de vencimiento
    return filteredTasks.sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.getTime() - b.dueDate.getTime();
    });
  };

  return {
    tasks,
    addTask,
    updateTask,
    updateSubtasks,
    deleteTask,
    moveTask,
    getTasksByStatus,
    getTasksForWeek,
    getFilteredTasksByStatus
  };
};
