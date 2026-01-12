import React, { useState } from 'react';
import { supabase } from '../services/supabase';

interface NewCityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: any;
}

export const NewCityModal: React.FC<NewCityModalProps> = ({ isOpen, onClose, onSuccess, initialData }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        state: 'SP',
        region: '',
        value: '',
        type: 'fixed'
    });

    React.useEffect(() => {
        if (initialData && isOpen) {
            setFormData({
                name: initialData.name || '',
                state: initialData.state || 'SP',
                region: initialData.region || '',
                value: initialData.value?.toString() || '',
                type: initialData.type || 'fixed'
            });
        } else if (isOpen) {
            setFormData({
                name: '',
                state: 'SP',
                region: '',
                value: '',
                type: 'fixed'
            });
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const cityData = {
                name: formData.name,
                state: formData.state,
                region: formData.region,
                value: parseFloat(formData.value),
                type: formData.type,
                updated_at: new Date().toISOString()
            };

            const { error } = initialData?.id
                ? await supabase.from('cities').update(cityData).eq('id', initialData.id)
                : await supabase.from('cities').insert([cityData]);

            if (error) throw error;

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving city:', error);
            alert('Erro ao salvar região. Verifique o console.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-surface-dark w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                    <h3 className="text-lg font-bold">Configurar Nova Região</h3>
                    <button onClick={onClose} className="text-text-secondary hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2 space-y-1">
                            <label className="text-xs font-bold uppercase text-text-secondary">Cidade</label>
                            <input
                                required
                                type="text"
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="Ex: Ribeirão Preto"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-text-secondary">UF</label>
                            <input
                                required
                                type="text"
                                maxLength={2}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all uppercase"
                                placeholder="SP"
                                value={formData.state}
                                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-text-secondary">Região / Descrição</label>
                        <input
                            required
                            type="text"
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            placeholder="Ex: Ribeirão Preto e Região"
                            value={formData.region}
                            onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-text-secondary">Tipo de Cobrança</label>
                            <select
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="fixed">Valor Fixo</option>
                                <option value="per_km">Por KM</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-text-secondary">Valor (R$)</label>
                            <input
                                required
                                type="number"
                                step="0.01"
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="0.00"
                                value={formData.value}
                                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                            />
                        </div>
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
                            {loading ? 'Salvando...' : 'Salvar Região'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
