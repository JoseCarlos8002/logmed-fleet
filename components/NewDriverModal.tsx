import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { toast } from 'react-hot-toast';

interface DriverData {
    id?: string;
    name: string;
    plate: string;
    cnpj_cpf: string;
    valor_km: number;
    valor_ponto: number;
    photo_url: string;
    status: string;
}

interface NewDriverModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editDriver?: DriverData | null;
}

export const NewDriverModal: React.FC<NewDriverModalProps> = ({ isOpen, onClose, onSuccess, editDriver }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        plate: '',
        cnpj_cpf: '',
        valor_km: '',
        valor_ponto: '',
        photo_url: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop',
        status: 'active'
    });

    useEffect(() => {
        if (editDriver) {
            setFormData({
                name: editDriver.name || '',
                plate: editDriver.plate || '',
                cnpj_cpf: editDriver.cnpj_cpf || '',
                valor_km: editDriver.valor_km?.toString() || '0',
                valor_ponto: editDriver.valor_ponto?.toString() || '0',
                photo_url: editDriver.photo_url || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop',
                status: editDriver.status || 'active'
            });
        } else {
            setFormData({
                name: '',
                plate: '',
                cnpj_cpf: '',
                valor_km: '',
                valor_ponto: '',
                photo_url: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop',
                status: 'active'
            });
        }
    }, [editDriver, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const driverData = {
                name: formData.name,
                plate: formData.plate,
                cnpj_cpf: formData.cnpj_cpf,
                valor_km: parseFloat(formData.valor_km) || 0,
                valor_ponto: parseFloat(formData.valor_ponto) || 0,
                photo_url: formData.photo_url,
                status: formData.status
            };

            if (editDriver?.id) {
                // Update existing driver
                const { error } = await supabase
                    .from('drivers')
                    .update(driverData)
                    .eq('id', editDriver.id);

                if (error) throw error;
                toast.success('Motorista atualizado com sucesso!');
            } else {
                // Create new driver
                const { error } = await supabase
                    .from('drivers')
                    .insert([{
                        ...driverData,
                        monthly_routes: 0,
                        revenue: 0
                    }]);

                if (error) throw error;
                toast.success('Motorista cadastrado com sucesso!');
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving driver:', error);
            toast.error(editDriver ? 'Erro ao atualizar motorista.' : 'Erro ao cadastrar motorista.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-surface-dark w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                    <h3 className="text-lg font-bold">{editDriver ? 'Editar Motorista' : 'Novo Motorista'}</h3>
                    <button onClick={onClose} className="text-text-secondary hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto no-scrollbar">
                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-text-secondary">Nome Completo</label>
                        <input
                            required
                            type="text"
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            placeholder="Nome do motorista"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-text-secondary">Placa</label>
                            <input
                                required
                                type="text"
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="ABC-1234"
                                value={formData.plate}
                                onChange={(e) => setFormData({ ...formData, plate: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-text-secondary">CNPJ / CPF</label>
                            <input
                                required
                                type="text"
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="00.000.000/0001-00"
                                value={formData.cnpj_cpf}
                                onChange={(e) => setFormData({ ...formData, cnpj_cpf: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-text-secondary">Valor por KM (R$)</label>
                            <input
                                required
                                type="number"
                                step="0.01"
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="1.02"
                                value={formData.valor_km}
                                onChange={(e) => setFormData({ ...formData, valor_km: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-text-secondary">Valor por Ponto (R$)</label>
                            <input
                                required
                                type="number"
                                step="0.01"
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="7.00"
                                value={formData.valor_ponto}
                                onChange={(e) => setFormData({ ...formData, valor_ponto: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-text-secondary">URL da Foto (Opcional)</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            placeholder="https://..."
                            value={formData.photo_url}
                            onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-text-secondary">Status</label>
                        <select
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                            <option value="active">Disponível</option>
                            <option value="in_route">Em Rota</option>
                        </select>
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
                            {loading ? 'Salvando...' : editDriver ? 'Atualizar' : 'Salvar Motorista'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
