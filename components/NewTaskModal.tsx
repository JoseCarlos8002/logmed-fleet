import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

interface Profile {
    id: string;
    full_name: string;
}

interface NewTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Operacional',
        priority: 'medium',
        status: 'pending',
        responsible_id: '',
        due_time: ''
    });

    useEffect(() => {
        if (isOpen) {
            fetchProfiles();
        }
    }, [isOpen]);

    const fetchProfiles = async () => {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name')
            .order('full_name', { ascending: true });

        if (!error && data) {
            setProfiles(data);
        }
    };

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase
                .from('tasks')
                .insert([
                    {
                        title: formData.title,
                        description: formData.description,
                        category: formData.category,
                        priority: formData.priority,
                        status: formData.status,
                        responsible_id: formData.responsible_id || null,
                        due_time: formData.due_time
                    }
                ]);

            if (error) throw error;

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error creating task:', error);
            alert('Erro ao criar tarefa. Verifique o console.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-surface-dark w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                    <h3 className="text-lg font-bold">Nova Tarefa</h3>
                    <button onClick={onClose} className="text-text-secondary hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-text-secondary">Título</label>
                        <input
                            required
                            type="text"
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            placeholder="Ex: Conferência de Carga"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-text-secondary">Descrição</label>
                        <textarea
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                            rows={2}
                            placeholder="Detalhes da tarefa..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-text-secondary">Categoria</label>
                            <input
                                required
                                type="text"
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="Ex: Logística"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-text-secondary">Prioridade</label>
                            <select
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none"
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                            >
                                <option value="low">Baixa</option>
                                <option value="medium">Média</option>
                                <option value="high">Alta</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-text-secondary">Responsável</label>
                        <select
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none"
                            value={formData.responsible_id}
                            onChange={(e) => setFormData({ ...formData, responsible_id: e.target.value })}
                        >
                            <option value="">Selecione um responsável</option>
                            {profiles.map(p => (
                                <option key={p.id} value={p.id}>{p.full_name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-text-secondary">Prazo / Horário</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            placeholder="Ex: Hoje às 14h ou Em 2h"
                            value={formData.due_time}
                            onChange={(e) => setFormData({ ...formData, due_time: e.target.value })}
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Salvando...' : 'Criar Tarefa'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
