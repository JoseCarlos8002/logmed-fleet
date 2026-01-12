import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { NewTaskModal } from '../components/NewTaskModal';
import { toast } from 'react-hot-toast';

interface TaskRecord {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  due_time: string;
  profiles: {
    full_name: string;
    avatar_url: string;
  } | null;
}

export const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<'pending' | 'in_progress' | 'completed'>('pending');

  const fetchTasks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        profiles (
          full_name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTasks(data as any);
    }
    setLoading(false);
  };

  const handleDeleteTask = async (id: string, title: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir a tarefa "${title}"?`)) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting task:', error);
        toast.error('Erro ao excluir tarefa: ' + error.message);
      } else {
        toast.success('Tarefa excluída com sucesso');
        fetchTasks();
      }
    } catch (err: any) {
      console.error('Unexpected error deleting task:', err);
      toast.error('Erro inesperado ao excluir.');
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const filteredTasks = tasks.filter(t => t.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Tarefas Operacionais</h2>
        <div className="flex gap-4 items-center">
          <div className="flex bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-lg p-1">
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${filter === 'pending' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              Pendentes
            </button>
            <button
              onClick={() => setFilter('in_progress')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${filter === 'in_progress' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              Em Curso
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${filter === 'completed' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              Concluídas
            </button>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add_task</span>
            Nova Tarefa
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
          <span className="material-symbols-outlined text-6xl text-slate-200 dark:text-slate-700 mb-4">task_alt</span>
          <p className="text-text-secondary">Nenhuma tarefa encontrada nesta categoria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <div key={task.id} className="bg-white dark:bg-surface-dark p-5 rounded-xl border-l-4 border-l-primary border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-6 group hover:shadow-md transition-shadow">
              <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 ${task.priority === 'high' ? 'bg-danger/10 text-danger' : 'bg-primary/10 text-primary'
                }`}>
                <span className="material-symbols-outlined text-[24px]">
                  {task.priority === 'high' ? 'priority_high' : 'assignment'}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="font-bold">{task.title}</h4>
                  <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-text-secondary uppercase">{task.category}</span>
                </div>
                <p className="text-sm text-text-secondary line-clamp-1">{task.description}</p>
              </div>
              <div className="hidden md:flex flex-col items-end gap-1">
                {task.profiles ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">{task.profiles.full_name}</span>
                    {task.profiles.avatar_url ? (
                      <img src={task.profiles.avatar_url} className="w-6 h-6 rounded-full" alt="" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold">
                        {task.profiles.full_name.charAt(0)}
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-xs font-medium text-text-secondary">Não atribuído</span>
                )}
                <span className="text-xs text-slate-400 font-mono">{task.due_time || 'Sem prazo'}</span>
              </div>
              <div className="flex gap-2">
                <button className="h-10 w-10 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center transition-colors">
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
                <button
                  onClick={() => handleDeleteTask(task.id, task.title)}
                  className="h-10 w-10 rounded-lg border border-red-200 dark:border-red-900/30 hover:bg-red-50 text-red-500 flex items-center justify-center transition-colors"
                  title="Excluir"
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <NewTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchTasks}
      />
    </div>
  );
};
