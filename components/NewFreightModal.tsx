import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { toast } from 'react-hot-toast';

interface NewFreightModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: any;
}

export const NewFreightModal: React.FC<NewFreightModalProps> = ({ isOpen, onClose, onSuccess, initialData }) => {
    const [loading, setLoading] = useState(false);
    const [drivers, setDrivers] = useState<any[]>([]);
    const [routes, setRoutes] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);
    const [selectedCities, setSelectedCities] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        driver_id: '',
        route_id: '',
        manifesto: '',
        origin: '',
        destination: '',
        value: '0',
        km_inicial: '',
        km_final: '',
        horario_saida: '',
        horario_chegada: '',
        total_pontos: '0',
        tolls: '0',
        status: 'Pending',
        freight_date: new Date().toISOString().split('T')[0]
    });

    React.useEffect(() => {
        const fetchData = async () => {
            const { data: driversData } = await supabase.from('drivers').select('id, name, valor_km, valor_ponto').eq('status', 'active');
            if (driversData) setDrivers(driversData);

            const { data: routesData } = await supabase.from('routes').select('*');
            if (routesData) setRoutes(routesData);

            const { data: citiesData } = await supabase.from('cities').select('*').order('name');
            if (citiesData) setCities(citiesData);
        };
        fetchData();
    }, []);

    const isCityMatch = (name1: string, name2: string) => {
        const clean = (s: string) => s.split('/')[0].toLowerCase().trim()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return clean(name1) === clean(name2);
    };

    React.useEffect(() => {
        if (isOpen && initialData?.visitedCities && cities.length > 0) {
            // Attempt to find a matching route if route_id is not provided
            let matchedRouteId = formData.route_id || initialData.route_id || '';

            if (!matchedRouteId && initialData.origin && initialData.destination) {
                const foundRoute = routes.find(r =>
                    r.origin.toLowerCase().trim() === initialData.origin.toLowerCase().trim() &&
                    r.destination.toLowerCase().trim() === initialData.destination.toLowerCase().trim()
                );
                if (foundRoute) matchedRouteId = foundRoute.id;
            }

            // Identify which cities from the report should be flagged as "Additional"
            const selectedRoute = routes.find(r => r.id === matchedRouteId);
            const routeCityNames = new Set([
                (selectedRoute?.origin || '').toLowerCase().trim(),
                (selectedRoute?.destination || '').toLowerCase().trim(),
                ...(selectedRoute?.cities?.map((c: any) => c.name.toLowerCase().trim()) || [])
            ]);

            const autoSelectedCities = cities
                .filter(city =>
                    initialData.visitedCities.some((vc: string) => isCityMatch(vc, city.name)) &&
                    !routeCityNames.has(city.name.toLowerCase().trim())
                )
                .map(city => ({ id: city.id, name: city.name, value: city.value }));

            setFormData(prev => ({
                ...prev,
                ...initialData,
                driver_id: initialData.driver_id || prev.driver_id,
                route_id: matchedRouteId || prev.route_id,
                manifesto: initialData.manifesto || prev.manifesto,
                freight_date: initialData.freight_date || prev.freight_date,
                origin: initialData.origin || (initialData.visitedCities?.[0]) || prev.origin,
                destination: initialData.destination || (initialData.visitedCities?.[initialData.visitedCities.length - 1]) || prev.destination,
                total_pontos: initialData.total_pontos?.toString() || prev.total_pontos,
            }));

            setSelectedCities(autoSelectedCities);
        }
    }, [initialData, isOpen, cities, routes, formData.route_id]);

    // Automated Calculation Logic
    React.useEffect(() => {
        const calculateTotal = () => {
            const points = parseInt(formData.total_pontos) || 0;
            const tolls = parseFloat(formData.tolls) || 0;
            const kmInicial = parseFloat(formData.km_inicial) || 0;
            const kmFinal = parseFloat(formData.km_final) || 0;
            const kmDiff = Math.max(0, kmFinal - kmInicial);

            // Get selected driver's rates
            const selectedDriver = drivers.find(d => d.id === formData.driver_id);
            const driverKmRate = selectedDriver?.valor_km || 0;
            const driverPointRate = selectedDriver?.valor_ponto || 0;

            // Calculate Additional Cities Cost
            const citiesCost = selectedCities.reduce((acc, city) => acc + (parseFloat(city.value) || 0), 0);

            let routeValue = 0;
            const selectedRoute = routes.find(r => r.id === formData.route_id);
            if (selectedRoute) {
                routeValue = parseFloat(selectedRoute.value) || 0;
            }

            const kmValue = kmDiff * driverKmRate;
            const pointsValue = points * driverPointRate;

            const total = routeValue + kmValue + pointsValue + tolls + citiesCost;
            setFormData(prev => ({ ...prev, value: total.toFixed(2) }));
        };

        calculateTotal();
    }, [formData.total_pontos, formData.tolls, formData.km_inicial, formData.km_final, formData.route_id, formData.driver_id, selectedCities, routes, drivers, cities]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase
                .from('freights')
                .insert([
                    {
                        driver_id: formData.driver_id || null,
                        route_id: formData.route_id || null,
                        manifesto: formData.manifesto,
                        origin: formData.origin,
                        destination: formData.destination,
                        value: parseFloat(formData.value) || 0,
                        km_inicial: parseFloat(formData.km_inicial) || 0,
                        km_final: parseFloat(formData.km_final) || 0,
                        horario_saida: formData.horario_saida || null,
                        horario_chegada: formData.horario_chegada || null,
                        total_pontos: parseInt(formData.total_pontos) || 0,
                        tolls: parseFloat(formData.tolls) || 0,
                        status: formData.status,
                        freight_date: formData.freight_date,
                        additional_cities: selectedCities.map(city => ({
                            id: city.id,
                            name: city.name,
                            value: parseFloat(city.value) || 0
                        }))
                    }
                ]);

            if (error) throw error;

            toast.success('Frete criado com sucesso!');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error creating freight:', error);
            toast.error('Erro ao criar frete.');
        } finally {
            setLoading(false);
        }
    };

    const handleRouteChange = (routeId: string) => {
        const selectedRoute = routes.find(r => r.id === routeId);
        if (selectedRoute) {
            setFormData({
                ...formData,
                route_id: routeId,
                origin: selectedRoute.origin || formData.origin,
                destination: selectedRoute.destination || formData.destination
            });
        } else {
            setFormData({ ...formData, route_id: '' });
        }
    };

    const addCityRow = () => {
        setSelectedCities([...selectedCities, { id: crypto.randomUUID(), name: '', value: 0 }]);
    };

    const updateCity = (index: number, field: string, value: any) => {
        const newCities = [...selectedCities];
        newCities[index] = { ...newCities[index], [field]: value };
        setSelectedCities(newCities);
    };

    const removeCityRow = (index: number) => {
        setSelectedCities(selectedCities.filter((_, i) => i !== index));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-surface-dark w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                    <h3 className="text-lg font-bold">Novo Frete</h3>
                    <button onClick={onClose} className="text-text-secondary hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto no-scrollbar">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-text-secondary">Motorista</label>
                            <select
                                required
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none"
                                value={formData.driver_id}
                                onChange={(e) => setFormData({ ...formData, driver_id: e.target.value })}
                            >
                                <option value="">Selecionar Motorista</option>
                                {drivers.map(d => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-text-secondary">Rota</label>
                            <select
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none"
                                value={formData.route_id}
                                onChange={(e) => handleRouteChange(e.target.value)}
                            >
                                <option value="">Selecionar Rota (Opcional)</option>
                                {routes.map(r => (
                                    <option key={r.id} value={r.id}>
                                        {r.id} ({r.origin} → {r.destination})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-text-secondary">Manifesto</label>
                            <input
                                required
                                type="text"
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="Nº do Manifesto"
                                value={formData.manifesto}
                                onChange={(e) => setFormData({ ...formData, manifesto: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-text-secondary">Data</label>
                            <input
                                required
                                type="date"
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                value={formData.freight_date}
                                onChange={(e) => setFormData({ ...formData, freight_date: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Visited Cities Table */}
                    {initialData?.visitedCities && initialData.visitedCities.length > 0 && (
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-text-secondary">Cidades Visitadas (Relatório)</label>
                            <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                                <table className="w-full text-xs">
                                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                                        <tr>
                                            <th className="text-left p-2 font-semibold">Ordem</th>
                                            <th className="text-left p-2 font-semibold">Cidade</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {initialData.visitedCities.map((city: string, idx: number) => (
                                            <tr key={idx}>
                                                <td className="p-2 text-text-secondary">{idx + 1}º</td>
                                                <td className="p-2 font-medium">{city}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-text-secondary">KM Inicial</label>
                            <input
                                type="number"
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="0"
                                value={formData.km_inicial}
                                onChange={(e) => setFormData({ ...formData, km_inicial: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-text-secondary">KM Final</label>
                            <input
                                type="number"
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="0"
                                value={formData.km_final}
                                onChange={(e) => setFormData({ ...formData, km_final: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-text-secondary">Saída</label>
                            <input
                                type="time"
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                value={formData.horario_saida}
                                onChange={(e) => setFormData({ ...formData, horario_saida: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-text-secondary">Chegada</label>
                            <input
                                type="time"
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                value={formData.horario_chegada}
                                onChange={(e) => setFormData({ ...formData, horario_chegada: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Additional Cities (Editable List) */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-bold uppercase text-text-secondary">Cidades Adicionais e Custos</label>
                            <button
                                type="button"
                                onClick={addCityRow}
                                className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
                            >
                                <span className="material-symbols-outlined text-xs">add</span>
                                Adicionar Cidade
                            </button>
                        </div>
                        <div className="space-y-2 border border-slate-200 dark:border-slate-700 rounded-lg p-3 max-h-48 overflow-y-auto no-scrollbar">
                            {selectedCities.length === 0 && (
                                <p className="text-center text-xs text-text-secondary py-4">Nenhuma cidade adicional selecionada.</p>
                            )}
                            {selectedCities.map((city, index) => (
                                <div key={city.id} className="flex gap-2 items-center animate-in fade-in slide-in-from-left-2 duration-200">
                                    <input
                                        type="text"
                                        placeholder="Nome da Cidade"
                                        className="flex-1 px-3 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        value={city.name}
                                        onChange={(e) => updateCity(index, 'name', e.target.value)}
                                    />
                                    <div className="flex items-center gap-1 w-24">
                                        <span className="text-[10px] text-text-secondary font-bold">R$</span>
                                        <input
                                            type="number"
                                            placeholder="0.00"
                                            className="w-full px-2 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                            value={city.value}
                                            onChange={(e) => updateCity(index, 'value', e.target.value)}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeCityRow(index)}
                                        className="text-slate-400 hover:text-danger transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-sm">delete</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-text-secondary">Pontos</label>
                            <input
                                type="number"
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="0"
                                value={formData.total_pontos}
                                onChange={(e) => setFormData({ ...formData, total_pontos: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-text-secondary">Pedágios</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="0.00"
                                value={formData.tolls}
                                onChange={(e) => setFormData({ ...formData, tolls: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-text-secondary">Valor Total</label>
                            <div className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 font-bold text-primary">
                                R$ {formData.value}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-text-secondary">Status</label>
                        <select
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                            <option value="Pending">Pendente</option>
                            <option value="In Transit">Em Trânsito</option>
                            <option value="Delivered">Entregue</option>
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
                            {loading ? 'Salvando...' : 'Salvar Frete'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
