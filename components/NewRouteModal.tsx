import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { toast } from 'react-hot-toast';

interface City {
    id: string;
    name: string;
}

interface RouteData {
    id: string;
    origin: string;
    destination: string;
    value: number;
    cities: { name: string; value: number }[];
}

interface NewRouteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editRoute?: RouteData | null;
}

export const NewRouteModal: React.FC<NewRouteModalProps> = ({ isOpen, onClose, onSuccess, editRoute }) => {
    const [loading, setLoading] = useState(false);
    const [availableCities, setAvailableCities] = useState<City[]>([]);
    const [routeCities, setRouteCities] = useState<City[]>([]);
    const [selectedCityId, setSelectedCityId] = useState('');

    const [formData, setFormData] = useState({
        id: '',
        origin: '',
        value: '0',
    });

    useEffect(() => {
        if (isOpen) {
            fetchCities();
            if (editRoute) {
                setFormData({
                    id: editRoute.id,
                    origin: editRoute.origin,
                    value: editRoute.value.toString()
                });
                setRouteCities(editRoute.cities || []);
            } else {
                setFormData({ id: '', origin: '', value: '0' });
                setRouteCities([]);
            }
        }
    }, [isOpen, editRoute]);

    const fetchCities = async () => {
        const { data, error } = await supabase
            .from('cities')
            .select('id, name')
            .order('name', { ascending: true });

        if (!error && data) {
            setAvailableCities(data);
        }
    };

    const handleAddCity = () => {
        if (!selectedCityId) return;
        const cityToAdd = availableCities.find(c => c.id === selectedCityId);
        if (cityToAdd && !routeCities.find(rc => rc.id === cityToAdd.id)) {
            setRouteCities([...routeCities, cityToAdd]);
            setSelectedCityId('');
        }
    };

    const handleRemoveCity = (cityId: string) => {
        setRouteCities(routeCities.filter(c => c.id !== cityId));
    };

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const destination = routeCities.length > 0 ? routeCities[routeCities.length - 1].name : '';

            const routeData = {
                id: formData.id,
                origin: formData.origin,
                destination: destination,
                value: parseFloat(formData.value) || 0,
                cities: routeCities,
                status: 'Ativo'
            };

            if (editRoute) {
                // Update existing route
                const { error } = await supabase
                    .from('routes')
                    .update(routeData)
                    .eq('id', editRoute.id);

                if (error) throw error;
                toast.success('Rota atualizada com sucesso!');
            } else {
                // Create new route
                const { error } = await supabase
                    .from('routes')
                    .insert([routeData]);

                if (error) throw error;
                toast.success('Rota criada com sucesso!');
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving route:', error);
            toast.error(editRoute ? 'Erro ao atualizar rota.' : 'Erro ao criar rota.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-surface-dark w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                    <h3 className="text-lg font-bold">{editRoute ? 'Editar Rota' : 'Nova Rota'}</h3>
                    <button onClick={onClose} className="text-text-secondary hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto no-scrollbar">
                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-text-secondary">Código da Rota (ID)</label>
                        <input
                            required
                            type="text"
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            placeholder="Ex: R-101"
                            value={formData.id}
                            onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-text-secondary">Origem</label>
                            <input
                                required
                                type="text"
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="Ex: RP"
                                value={formData.origin}
                                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-text-secondary">Valor da Rota (R$)</label>
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

                    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <label className="text-xs font-bold uppercase text-text-secondary">Cidades da Rota</label>

                        <div className="flex gap-2">
                            <select
                                className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none"
                                value={selectedCityId}
                                onChange={(e) => setSelectedCityId(e.target.value)}
                            >
                                <option value="">Selecionar Cidade</option>
                                {availableCities.map(city => (
                                    <option key={city.id} value={city.id}>{city.name}</option>
                                ))}
                            </select>
                            <button
                                type="button"
                                onClick={handleAddCity}
                                disabled={!selectedCityId}
                                className="px-4 py-2 rounded-lg bg-primary/10 text-primary font-bold hover:bg-primary/20 transition-colors disabled:opacity-50"
                            >
                                Adicionar
                            </button>
                        </div>

                        {routeCities.length > 0 && (
                            <div className="space-y-2 mt-2">
                                {routeCities.map((city, index) => (
                                    <div key={city.id} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold bg-slate-200 dark:bg-slate-700 w-5 h-5 flex items-center justify-center rounded-full text-text-secondary">
                                                {index + 1}
                                            </span>
                                            <span className="text-sm font-medium">{city.name}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveCity(city.id)}
                                            className="text-text-secondary hover:text-red-500 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-lg">delete</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {routeCities.length === 0 && (
                            <p className="text-xs text-text-secondary italic text-center py-2">Nenhuma cidade adicionada à rota.</p>
                        )}
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
                            {loading ? 'Salvando...' : 'Salvar Rota'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
