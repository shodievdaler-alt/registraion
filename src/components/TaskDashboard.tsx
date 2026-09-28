import React, { useState, useRef } from 'react';
import {
  Plus,
  Check,
  Trash2,
  Search,
  LogOut,
  SlidersHorizontal,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import {
  User,
  Task,
  TaskFilter,
  TaskPriority,
  TaskCategory,
  CreateTaskPayload,
} from '../types/task';

interface TaskDashboardProps {
  user: User;
  tasks: Task[];
  onCreateTask: (payload: CreateTaskPayload) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onLogout: () => void;
}

const CATEGORIES: TaskCategory[] = ['General', 'Work', 'Personal', 'Product', 'Engineering'];
const PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: 'low', label: 'Low priority' },
  { value: 'medium', label: 'Medium priority' },
  { value: 'high', label: 'High priority' },
];

export const TaskDashboard: React.FC<TaskDashboardProps> = ({
  user,
  tasks,
  onCreateTask,
  onToggleTask,
  onDeleteTask,
  onLogout,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('General');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [filter, setFilter] = useState<TaskFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<TaskCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const titleInputRef = useRef<HTMLInputElement>(null);

  // Strict user isolation: only show tasks belonging to the current user
  const userTasks = tasks.filter(task => task.userId === user.id);

  const totalCount = userTasks.length;
  const completedCount = userTasks.filter(t => t.completed).length;
  const activeCount = totalCount - completedCount;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const filteredTasks = userTasks.filter(task => {
    if (filter === 'active' && task.completed) return false;
    if (filter === 'completed' && !task.completed) return false;
    if (categoryFilter !== 'ALL' && task.category !== categoryFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description?.toLowerCase().includes(q) ?? false;
      const matchCat = task.category.toLowerCase().includes(q);
      return matchTitle || matchDesc || matchCat;
    }
    return true;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setFormError('Please enter a task title.');
      titleInputRef.current?.focus();
      return;
    }

    setFormError(null);
    onCreateTask({
      title: trimmed,
      description: description.trim() || undefined,
      priority,
      category,
      dueDate: dueDate || undefined,
    });

    setTitle('');
    setDescription('');
    setDueDate('');
    titleInputRef.current?.focus();
  };

  const formatDate = (isoOrDateString: string) => {
    const parsed = new Date(isoOrDateString);
    if (Number.isNaN(parsed.getTime())) return isoOrDateString;
    return parsed.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Bar Contract: 3 zones (Brand | Nav Links | User & Logout Action) */}
      <header className="w-full bg-white border-b border-slate-200 px-4 sm:px-8 py-4 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Zone 1: Brand Title (single text element) */}
          <a
            href="#my-tasks"
            onClick={e => {
              e.preventDefault();
              setFilter('all');
              setCategoryFilter('ALL');
            }}
            className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap"
          >
            My Tasks
          </a>

          {/* Zone 2: 4-6 clean text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap ${
                filter === 'all' ? 'text-slate-900 underline underline-offset-8 decoration-2' : ''
              }`}
            >
              All Tasks
            </button>
            <button
              type="button"
              onClick={() => setFilter('active')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap ${
                filter === 'active' ? 'text-slate-900 underline underline-offset-8 decoration-2' : ''
              }`}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => setFilter('completed')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap ${
                filter === 'completed'
                  ? 'text-slate-900 underline underline-offset-8 decoration-2'
                  : ''
              }`}
            >
              Completed
            </button>
            <button
              type="button"
              onClick={() => titleInputRef.current?.focus()}
              className="hover:text-slate-900 transition-colors whitespace-nowrap"
            >
              New Task
            </button>
          </nav>

          {/* Zone 3: Account email + Logout button */}
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-block text-xs text-slate-500 truncate max-w-[200px]">
              {user.email}
            </span>
            <button
              type="button"
              onClick={onLogout}
              className="py-2 px-4 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-10">
        {/* Dashboard Heading & Mobile User Identity */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              My Tasks
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Signed in as <span className="font-medium text-slate-900">{user.email}</span> ·
              Showing only your personal tasks
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-600 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200">
            <div>
              <span className="text-slate-500">Total</span>{' '}
              <span className="font-mono font-semibold text-slate-900 tabular-nums ml-1">
                {totalCount}
              </span>
            </div>
            <span aria-hidden="true" className="text-slate-300">
              ·
            </span>
            <div>
              <span className="text-slate-500">Active</span>{' '}
              <span className="font-mono font-semibold text-slate-900 tabular-nums ml-1">
                {activeCount}
              </span>
            </div>
            <span aria-hidden="true" className="text-slate-300">
              ·
            </span>
            <div>
              <span className="text-slate-500">Completed</span>{' '}
              <span className="font-mono font-semibold text-emerald-700 tabular-nums ml-1">
                {completedCount} ({completionRate}%)
              </span>
            </div>
          </div>
        </div>

        {/* Desktop 12-Column Layout: Sidebar Filters + Main Task Queue */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (Sidebar on Desktop): Quick Filters & Category Breakdown */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-5">
              <div>
                <h2 className="text-xs font-semibold text-slate-900 mb-3">Status View</h2>
                <div className="space-y-1">
                  {(
                    [
                      { id: 'all', label: 'All Tasks', count: totalCount },
                      { id: 'active', label: 'Active', count: activeCount },
                      { id: 'completed', label: 'Completed', count: completedCount },
                    ] as const
                  ).map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFilter(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        filter === item.id
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <span className="whitespace-nowrap">{item.label}</span>
                      <span
                        className={`font-mono tabular-nums ${
                          filter === item.id ? 'text-slate-200' : 'text-slate-400'
                        }`}
                      >
                        {item.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <h2 className="text-xs font-semibold text-slate-900 mb-3">Categories</h2>
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => setCategoryFilter('ALL')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      categoryFilter === 'ALL'
                        ? 'bg-slate-100 text-slate-900 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span>All Categories</span>
                    <span className="font-mono tabular-nums text-slate-400">{totalCount}</span>
                  </button>
                  {CATEGORIES.map(cat => {
                    const count = userTasks.filter(t => t.category === cat).length;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategoryFilter(cat)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                          categoryFilter === cat
                            ? 'bg-slate-100 text-slate-900 font-semibold'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <span className="whitespace-nowrap">{cat}</span>
                        <span className="font-mono tabular-nums text-slate-400">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

          {/* Right Column (Main Viewport): Task Creation + Filter Bar + Task Rows */}
          <section className="lg:col-span-9 space-y-6">
            {/* Task Creation Form */}
            <form
              onSubmit={handleCreateSubmit}
              className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5"
            >
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex-1">
                  <label htmlFor="new-task-title" className="sr-only">
                    Task title
                  </label>
                  <input
                    ref={titleInputRef}
                    id="new-task-title"
                    type="text"
                    value={title}
                    onChange={e => {
                      setTitle(e.target.value);
                      if (formError) setFormError(null);
                    }}
                    placeholder="Add a new task... (e.g., Prepare sprint review deck)"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(prev => !prev)}
                    aria-expanded={showAdvanced}
                    className={`py-2.5 px-3.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                      showAdvanced
                        ? 'bg-slate-100 border-slate-300 text-slate-900'
                        : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                    }`}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Details</span>
                  </button>

                  <button
                    type="submit"
                    className="flex-1 sm:flex-initial py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Task</span>
                  </button>
                </div>
              </div>

              {formError && (
                <p className="text-xs text-red-600 mt-2">{formError}</p>
              )}

              {/* Expandable Optional Task Metadata */}
              {showAdvanced && (
                <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-3">
                    <label
                      htmlFor="new-task-desc"
                      className="block text-xs font-medium text-slate-600 mb-1"
                    >
                      Notes or description (optional)
                    </label>
                    <input
                      id="new-task-desc"
                      type="text"
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Add context, acceptance criteria, or links..."
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="new-task-category"
                      className="block text-xs font-medium text-slate-600 mb-1"
                    >
                      Category
                    </label>
                    <select
                      id="new-task-category"
                      value={category}
                      onChange={e => setCategory(e.target.value as TaskCategory)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    >
                      {CATEGORIES.map(c => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="new-task-priority"
                      className="block text-xs font-medium text-slate-600 mb-1"
                    >
                      Priority
                    </label>
                    <select
                      id="new-task-priority"
                      value={priority}
                      onChange={e => setPriority(e.target.value as TaskPriority)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    >
                      {PRIORITIES.map(p => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="new-task-due"
                      className="block text-xs font-medium text-slate-600 mb-1"
                    >
                      Due date (optional)
                    </label>
                    <input
                      id="new-task-due"
                      type="date"
                      value={dueDate}
                      onChange={e => setDueDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>
              )}
            </form>

            {/* Search & Mobile Segmented Filter Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search your tasks..."
                  aria-label="Search your tasks"
                  className="w-full pl-10 pr-3.5 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {/* Segmented Filter Control */}
              <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg self-start sm:self-auto">
                {(
                  [
                    { id: 'all', label: 'All' },
                    { id: 'active', label: 'Active' },
                    { id: 'completed', label: 'Completed' },
                  ] as const
                ).map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFilter(tab.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                      filter === tab.id
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Task List Surface */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              {filteredTasks.length === 0 ? (
                <div className="px-6 py-14 text-center">
                  <p className="text-sm font-semibold text-slate-900">
                    {userTasks.length === 0
                      ? 'No tasks in your workspace yet'
                      : 'No tasks match your current filter'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    {userTasks.length === 0
                      ? 'Create your first task above to start tracking your personal work queue.'
                      : 'Try clearing your search query or switching back to All Tasks.'}
                  </p>
                  <div className="mt-5">
                    {userTasks.length === 0 ? (
                      <button
                        type="button"
                        onClick={() => titleInputRef.current?.focus()}
                        className="py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Create First Task</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setFilter('all');
                          setCategoryFilter('ALL');
                          setSearchQuery('');
                        }}
                        className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                      >
                        Reset Filters
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <ul className="divide-y divide-slate-200" role="list">
                  {filteredTasks.map(task => (
                    <li
                      key={task.id}
                      className="px-4 sm:px-5 py-3.5 hover:bg-slate-50/80 transition-colors flex items-start justify-between gap-3 group"
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        {/* Accessible 40px+ Touch Target Checkbox Button */}
                        <button
                          type="button"
                          onClick={() => onToggleTask(task.id)}
                          aria-label={
                            task.completed
                              ? `Mark "${task.title}" as active`
                              : `Mark "${task.title}" as completed`
                          }
                          className="w-10 h-10 -ml-2 -my-1.5 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-slate-900 shrink-0 cursor-pointer"
                        >
                          {task.completed ? (
                            <span className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center">
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            </span>
                          ) : (
                            <span className="w-5 h-5 rounded-md border border-slate-300 group-hover:border-slate-500 bg-white transition-colors" />
                          )}
                        </button>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              onClick={() => onToggleTask(task.id)}
                              className={`text-sm font-medium cursor-pointer select-none break-words ${
                                task.completed
                                  ? 'line-through text-slate-400'
                                  : 'text-slate-900'
                              }`}
                            >
                              {task.title}
                            </span>
                          </div>

                          {task.description && (
                            <p
                              className={`text-xs mt-1 break-words ${
                                task.completed ? 'text-slate-400' : 'text-slate-600'
                              }`}
                            >
                              {task.description}
                            </p>
                          )}

                          {/* Zero-Pill Unboxed Metadata Line with Typographic Separators */}
                          <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-xs text-slate-500">
                            <span className="inline-flex items-center gap-1">
                              {task.completed ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span className="text-emerald-700 font-medium">Completed</span>
                                </>
                              ) : (
                                <>
                                  <Circle className="w-3 h-3 text-slate-400" />
                                  <span>Active</span>
                                </>
                              )}
                            </span>

                            <span aria-hidden="true">·</span>
                            <span>{task.category}</span>

                            <span aria-hidden="true">·</span>
                            <span
                              className={
                                task.priority === 'high' && !task.completed
                                  ? 'text-amber-700 font-medium'
                                  : task.priority === 'low'
                                  ? 'text-slate-400'
                                  : 'text-slate-500'
                              }
                            >
                              {task.priority === 'high'
                                ? 'High priority'
                                : task.priority === 'medium'
                                ? 'Medium priority'
                                : 'Low priority'}
                            </span>

                            {task.dueDate && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="font-mono tabular-nums">
                                  Due {formatDate(task.dueDate)}
                                </span>
                              </>
                            )}

                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums text-slate-400">
                              Added {formatDate(task.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Delete Task Button (40px+ accessible target) */}
                      <button
                        type="button"
                        onClick={() => onDeleteTask(task.id)}
                        aria-label={`Delete task "${task.title}"`}
                        className="w-10 h-10 -mr-2 -my-1.5 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};
