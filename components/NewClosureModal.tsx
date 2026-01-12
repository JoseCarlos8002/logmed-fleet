import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { toast } from 'react-hot-toast';

interface Driver {
    id: string;
    name: string;
}

interface NewClosureModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const NewClosureModal: React.FC<NewClosureModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [drivers, setDrivers] = useState<any[]>([]);
    const [selectedDriver, setSelectedDriver] = useState<any>(null);
    const [freights, setFreights] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        driver_id: '',
        period_start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
        period_end: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
        total_value: '0',
        status: 'Aberto'
    });

    useEffect(() => {
        if (isOpen) {
            fetchDrivers();
        }
    }, [isOpen]);

    useEffect(() => {
        if (formData.driver_id && formData.period_start && formData.period_end) {
            calculateTotal();
        }
    }, [formData.driver_id, formData.period_start, formData.period_end]);

    const fetchDrivers = async () => {
        const { data, error } = await supabase
            .from('drivers')
            .select('*')
            .order('name', { ascending: true });

        if (!error && data) {
            setDrivers(data);
        }
    };

    const calculateTotal = async () => {
        const driver = drivers.find(d => d.id === formData.driver_id);
        setSelectedDriver(driver);
        if (!driver) return;

        const { data, error } = await supabase
            .from('freights')
            .select('*')
            .eq('driver_id', formData.driver_id)
            .gte('freight_date', formData.period_start)
            .lte('freight_date', formData.period_end);

        if (!error && data) {
            setFreights(data);
            const totalKm = data.reduce((acc, f) => acc + (f.km_final - f.km_inicial), 0);
            const totalPoints = data.reduce((acc, f) => acc + (f.total_pontos || 0), 0);
            const totalFreight = data.reduce((acc, f) => acc + (f.value || 0), 0);

            const kmValue = totalKm * (driver.valor_km || 0);
            const pointsValue = totalPoints * (driver.valor_ponto || 0);
            const grandTotal = kmValue + pointsValue + totalFreight;

            setFormData(prev => ({ ...prev, total_value: grandTotal.toString() }));
        }
    };

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase
                .from('closures')
                .insert([
                    {
                        driver_id: formData.driver_id,
                        period_start: formData.period_start,
                        period_end: formData.period_end,
                        total_value: parseFloat(formData.total_value) || 0,
                        status: formData.status
                    }
                ]);

            if (error) throw error;

            toast.success('Fechamento criado com sucesso!');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error creating closure:', error);
            toast.error('Erro ao criar fechamento.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-surface-dark w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                    <h3 className="text-lg font-bold">Novo Fechamento</h3>
                    <button onClick={onClose} className="text-text-secondary hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[85vh] overflow-y-auto no-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-text-secondary">Motorista</label>
                                <select
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none"
                                    value={formData.driver_id}
                                    onChange={(e) => setFormData({ ...formData, driver_id: e.target.value })}
                                >
                                    <option value="">Selecione um motorista</option>
                                    {drivers.map(d => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-text-secondary">Início</label>
                                    <input
                                        required
                                        type="date"
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        value={formData.period_start}
                                        onChange={(e) => setFormData({ ...formData, period_start: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-text-secondary">Fim</label>
                                    <input
                                        required
                                        type="date"
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        value={formData.period_end}
                                        onChange={(e) => setFormData({ ...formData, period_end: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                                <p className="text-[10px] font-bold uppercase text-text-secondary mb-2">Resumo do Cálculo</p>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span>Total Fretes:</span>
                                        <span className="font-bold">R$ {parseFloat(formData.total_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    {selectedDriver && (
                                        <p className="text-[10px] text-text-secondary italic">
                                            Taxas: R$ {selectedDriver.valor_km}/km | R$ {selectedDriver.valor_ponto}/ponto
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-text-secondary">Status</label>
                                <select
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="Aberto">Aberto</option>
                                    <option value="Fechado">Fechado</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-text-secondary">Fretes no Período ({freights.length})</label>
                            <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden max-h-[300px] overflow-y-auto no-scrollbar">
                                {freights.length === 0 ? (
                                    <div className="p-8 text-center text-text-secondary text-xs italic">
                                        Nenhum frete encontrado para este motorista no período selecionado.
                                    </div>
                                ) : (
                                    <table className="w-full text-[10px] text-left">
                                        <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0">
                                            <tr>
                                                <th className="p-2">Data</th>
                                                <th className="p-2">Destino</th>
                                                <th className="p-2 text-right">KM</th>
                                                <th className="p-2 text-right">Valor</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                            {freights.map((f, i) => (
                                                <tr key={i}>
                                                    <td className="p-2">{new Date(f.freight_date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</td>
                                                    <td className="p-2 truncate max-w-[80px]">{f.destination}</td>
                                                    <td className="p-2 text-right">{f.km_final - f.km_inicial}</td>
                                                    <td className="p-2 text-right">R$ {f.value?.toLocaleString('pt-BR')}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
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
                            {loading ? 'Salvando...' : 'Criar Fechamento'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
