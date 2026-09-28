export type TaskPriority = 'low' | 'medium' | 'high';

export type TaskCategory = 'General' | 'Work' | 'Personal' | 'Product' | 'Engineering';

export type TaskFilter = 'all' | 'active' | 'completed';

export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: TaskPriority;
  category: TaskCategory;
  dueDate?: string;
  createdAt: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  priority: TaskPriority;
  category: TaskCategory;
  dueDate?: string;
}
