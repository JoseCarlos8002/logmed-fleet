import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { VehicleStatus } from '../types';
import { Card } from '../components/Card';
import { NewVehicleModal } from '../components/NewVehicleModal';
import { toast } from 'react-hot-toast';

interface VehicleRecord {
  id: string;
  plate: string;
  model: string;
  brand: string;
  year: number;
  type: string;
  status: 'active' | 'attention' | 'maintenance';
  image_url: string;
  maintenance_note: string;
  avg_consumption: number;
  cost_per_km: number;
  current_km: number;
}

export const Fleet: React.FC = () => {
  const [vehicles, setVehicles] = useState<VehicleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchVehicles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('fleet')
      .select('*')
      .order('model', { ascending: true });

    if (!error && data) {
      setVehicles(data);
    }
    setLoading(false);
  };

  const handleDeleteVehicle = async (id: string, model: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o veículo "${model}"?`)) return;

    try {
      const { error } = await supabase
        .from('fleet')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting vehicle:', error);
        toast.error('Erro ao excluir veículo: ' + error.message);
      } else {
        toast.success('Veículo excluído com sucesso');
        fetchVehicles();
      }
    } catch (err: any) {
      console.error('Unexpected error deleting vehicle:', err);
      toast.error('Erro inesperado ao excluir.');
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          Lista de Veículos
          <span className="bg-slate-100 dark:bg-slate-700 text-xs py-0.5 px-2 rounded-full text-text-secondary">Total: {vehicles.length}</span>
        </h3>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 text-sm font-medium text-text-secondary bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">filter_list</span> Filtrar
          </button>
          <button className="px-3 py-1.5 text-sm font-medium text-text-secondary bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">sort</span> Ordenar
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {vehicles.map((v) => (
            <Card key={v.id} className={`group hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6 ${v.status === 'maintenance' ? 'opacity-90 grayscale' : ''}`}>
              <div className="w-full md:w-5/12 flex flex-col gap-4 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-700 pb-4 md:pb-0 md:pr-4">
                <div className="relative w-full h-40 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img alt={v.model} className="w-full h-full object-cover" src={v.image_url} />
                  <div className="absolute top-2 left-2 bg-white/90 dark:bg-black/70 backdrop-blur px-2 py-1 rounded text-xs font-bold shadow-sm">
                    {v.model}
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-bold">{v.model}</h4>
                  <p className="text-sm font-medium text-text-secondary">Placa: <span className="text-text-main dark:text-slate-200 font-semibold">{v.plate}</span></p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className={`flex h-2.5 w-2.5 rounded-full ${v.status === 'active' ? 'bg-success' : v.status === 'attention' ? 'bg-warning' : 'bg-danger'
                      }`}></span>
                    <span className={`text-sm font-semibold px-2 py-0.5 rounded ${v.status === 'active' ? 'text-success bg-success/5' : v.status === 'attention' ? 'text-warning bg-warning/5' : 'text-danger bg-danger/5'
                      }`}>
                      {v.status === 'active' ? 'Em Dia' : v.status === 'attention' ? 'Requer Atenção' : 'Em Manutenção'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-7/12 flex flex-col justify-between">
                {v.maintenance_note && (
                  <div className={`${v.status === 'attention' ? 'bg-warning/10 border-warning/20 text-warning' : 'bg-slate-50 dark:bg-slate-800 text-slate-500'} border rounded-lg p-3 flex items-start gap-3 mb-4`}>
                    <span className="material-symbols-outlined text-[20px] mt-0.5">warning</span>
                    <div>
                      <p className="text-sm font-bold">Aviso de Status</p>
                      <p className="text-xs">{v.maintenance_note}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-background-light dark:bg-slate-800/50 p-3 rounded-lg">
                    <p className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Consumo Médio</p>
                    <p className="text-lg font-bold">{v.avg_consumption} <span className="text-xs font-normal text-text-secondary">km/L</span></p>
                  </div>
                  <div className="bg-background-light dark:bg-slate-800/50 p-3 rounded-lg">
                    <p className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Custo por KM</p>
                    <p className="text-lg font-bold">R$ {Number(v.cost_per_km).toFixed(2)}</p>
                  </div>
                  <div className="bg-background-light dark:bg-slate-800/50 p-3 rounded-lg">
                    <p className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">KM Atual</p>
                    <p className="text-sm font-bold">{v.current_km.toLocaleString()} km</p>
                  </div>
                  <div className="bg-background-light dark:bg-slate-800/50 p-3 rounded-lg">
                    <p className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Ano</p>
                    <p className="text-sm font-bold">{v.year}</p>
                  </div>
                </div>

                <div className="flex gap-3 mt-auto">
                  <button className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold text-sm transition-all shadow-sm">
                    <span className="material-symbols-outlined text-[18px]">checklist</span>
                    Checklist
                  </button>
                  <button className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-600 hover:bg-slate-50 text-text-main font-semibold text-sm transition-all">
                    <span className="material-symbols-outlined text-[18px]">local_gas_station</span>
                    Abastecer
                  </button>
                  <button
                    onClick={() => handleDeleteVehicle(v.id, v.model)}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-white dark:bg-surface-dark border border-red-200 dark:border-red-900/30 hover:bg-red-50 text-red-500 transition-all"
                    title="Excluir Veículo"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            </Card>
          ))}

          <button
            onClick={() => setIsModalOpen(true)}
            className="group bg-slate-50 dark:bg-surface-dark/40 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary hover:bg-primary/5 transition-all p-6 flex flex-col items-center justify-center gap-4 min-h-[280px]"
          >
            <div className="h-16 w-16 rounded-full bg-slate-200 dark:bg-slate-700 group-hover:bg-primary/20 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-[32px]">add</span>
            </div>
            <div className="text-center">
              <h4 className="text-lg font-bold text-text-secondary dark:text-slate-400 group-hover:text-primary transition-colors">Cadastrar Novo Veículo</h4>
              <p className="text-sm text-slate-400 mt-1">Adicionar um novo veículo à frota Logmed</p>
            </div>
          </button>
        </div>
      )}

      <NewVehicleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchVehicles}
      />
    </div>
  );
};
