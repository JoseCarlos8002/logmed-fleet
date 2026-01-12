import React, { useState } from 'react';
import { supabase } from '../services/supabase';

interface NewEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const NewEventModal: React.FC<NewEventModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        date: new Date().toISOString().split('T')[0],
        color: '#3b82f6',
        description: ''
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase
                .from('calendar_events')
                .insert([
                    {
                        title: formData.title,
                        date: formData.date,
                        color: formData.color,
                        description: formData.description
                    }
                ]);

            if (error) throw error;

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error creating event:', error);
            alert('Erro ao criar evento. Verifique o console.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-surface-dark w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                    <h3 className="text-lg font-bold">Novo Evento</h3>
                    <button onClick={onClose} className="text-text-secondary hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-text-secondary">Título do Evento</label>
                        <input
                            required
                            type="text"
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            placeholder="Ex: Manutenção Caminhão ABC-1234"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-text-secondary">Data</label>
                            <input
                                required
                                type="date"
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-text-secondary">Cor</label>
                            <div className="flex gap-2 items-center h-[42px]">
                                <input
                                    type="color"
                                    className="w-10 h-10 rounded cursor-pointer border-none bg-transparent"
                                    value={formData.color}
                                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                />
                                <div className="flex-1 flex gap-1">
                                    {['#ef4444', '#f59e0b', '#3b82f6', '#10b981'].map(c => (
                                        <button
                                            key={c}
                                            type="button"
                                            className={`w-6 h-6 rounded-full border-2 ${formData.color === c ? 'border-slate-400' : 'border-transparent'}`}
                                            style={{ backgroundColor: c }}
                                            onClick={() => setFormData({ ...formData, color: c })}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-text-secondary">Descrição (Opcional)</label>
                        <textarea
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                            rows={3}
                            placeholder="Detalhes adicionais..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                            {loading ? 'Salvando...' : 'Salvar Evento'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
