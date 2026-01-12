
import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { toast } from 'react-hot-toast';
import { NewCityModal } from '../components/NewCityModal';

interface CityRecord {
  id: string;
  name: string;
  state: string;
  region: string;
  value: number;
  type: 'fixed' | 'per_km';
  updated_at: string;
}

export const Cities: React.FC = () => {
  const [cities, setCities] = useState<CityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedCity, setSelectedCity] = useState<CityRecord | null>(null);

  const fetchCities = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .order('name', { ascending: true });

    if (!error && data) {
      setCities(data);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta região?')) return;

    try {
      const { error } = await supabase
        .from('cities')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase error deleting city:', error);
        toast.error('Erro ao excluir região: ' + error.message);
      } else {
        toast.success('Região excluída com sucesso');
        fetchCities();
      }
    } catch (err: any) {
      console.error('Unexpected error deleting city:', err);
      toast.error('Erro inesperado ao excluir.');
    }
  };

  const handleEdit = (city: CityRecord) => {
    setSelectedCity(city);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCity(null);
  };

  useEffect(() => {
    fetchCities();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Cidades e Custos</h2>
        <button
          onClick={() => {
            setSelectedCity(null);
            setIsModalOpen(true);
          }}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          Configurar Nova Região
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : cities.length === 0 ? (
        <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
          <span className="material-symbols-outlined text-6xl text-slate-200 dark:text-slate-700 mb-4">location_city</span>
          <p className="text-text-secondary">Nenhuma região configurada.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cities.map((city) => (
            <div key={city.id} className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute top-0 right-0 p-2 flex gap-1 z-10">
                <button
                  onClick={() => handleEdit(city)}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-primary transition-colors"
                  title="Editar"
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </button>
                <button
                  onClick={() => handleDelete(city.id)}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-danger transition-colors"
                  title="Excluir"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
                <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded h-fit">{city.state}</span>
              </div>
              <h4 className="text-lg font-bold mb-1 pr-20">{city.name}</h4>
              <p className="text-xs text-text-secondary mb-4">{city.region}</p>

              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div>
                  <p className="text-[10px] uppercase font-bold text-text-secondary">Valor {city.type === 'fixed' ? 'Fixo' : 'por KM'}</p>
                  <p className="text-xl font-extrabold text-primary">R$ {city.value.toFixed(2)}</p>
                </div>
                <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors">{city.type === 'fixed' ? 'payments' : 'route'}</span>
              </div>

              <p className="mt-4 text-[10px] text-text-secondary">Última atualização: {new Date(city.updated_at).toLocaleDateString('pt-BR')}</p>
            </div>
          ))}
        </div>
      )}

      <NewCityModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={fetchCities}
        initialData={selectedCity}
      />
    </div>
  );
};
