import React, { useState } from 'react';
import { AuthPage } from './components/AuthPage';
import { TaskDashboard } from './components/TaskDashboard';
import { User, Task, CreateTaskPayload } from './types/task';

interface RegisteredAccount {
  user: User;
  password: string;
}

export default function App() {
  // Pure in-memory React state (no localStorage or fake backend; ready for Supabase Auth & DB)
  const [accounts, setAccounts] = useState<RegisteredAccount[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  const handleRegister = async (
    email: string,
    password: string
  ): Promise<{ error?: string }> => {
    const existing = accounts.find(acc => acc.user.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return { error: 'An account with this email already exists. Please sign in.' };
    }

    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      email,
      createdAt: new Date().toISOString(),
    };

    setAccounts(prev => [...prev, { user: newUser, password }]);
    setCurrentUser(newUser);
    return {};
  };

  const handleLogin = async (
    email: string,
    password: string
  ): Promise<{ error?: string }> => {
    const existing = accounts.find(acc => acc.user.email.toLowerCase() === email.toLowerCase());
    if (!existing) {
      return {
        error: 'No account found with that email. Please create an account first.',
      };
    }

    if (existing.password !== password) {
      return { error: 'Incorrect password. Please try again.' };
    }

    setCurrentUser(existing.user);
    return {};
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleCreateTask = (payload: CreateTaskPayload) => {
    if (!currentUser) return;

    const newTask: Task = {
      id: `task_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      userId: currentUser.id,
      title: payload.title,
      description: payload.description,
      completed: false,
      priority: payload.priority,
      category: payload.category,
      dueDate: payload.dueDate,
      createdAt: new Date().toISOString(),
    };

    setTasks(prev => [newTask, ...prev]);
  };

  const handleToggleTask = (taskId: string) => {
    if (!currentUser) return;
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId && task.userId === currentUser.id
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  };

  const handleDeleteTask = (taskId: string) => {
    if (!currentUser) return;
    setTasks(prev =>
      prev.filter(task => !(task.id === taskId && task.userId === currentUser.id))
    );
  };

  if (!currentUser) {
    return <AuthPage onLogin={handleLogin} onRegister={handleRegister} />;
  }

  return (
    <TaskDashboard
      user={currentUser}
      tasks={tasks}
      onCreateTask={handleCreateTask}
      onToggleTask={handleToggleTask}
      onDeleteTask={handleDeleteTask}
      onLogout={handleLogout}
    />
  );
}
