import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { NewRouteModal } from '../components/NewRouteModal';
import { toast } from 'react-hot-toast';

interface RouteRecord {
  id: string;
  origin: string;
  destination: string;
  value: number;
  status: 'Ativo' | 'Inativo';
  cities: { name: string; value: number }[];
  created_at: string;
}

export const Routes: React.FC = () => {
  const [routes, setRoutes] = useState<RouteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<RouteRecord | null>(null);

  const fetchRoutes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setRoutes(data as any);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const handleEditRoute = (route: RouteRecord) => {
    setEditingRoute(route);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRoute(null);
  };

  const handleDeleteRoute = async (route: RouteRecord) => {
    // Check if route has associated freights
    const { data: freights, error: freightError } = await supabase
      .from('freights')
      .select('id')
      .eq('route_id', route.id);

    if (freightError) {
      console.error('Error checking freights:', freightError);
      toast.error('Erro ao verificar fretes associados.');
      return;
    }

    if (freights && freights.length > 0) {
      toast.error(`Não é possível excluir esta rota pois existem ${freights.length} frete(s) associado(s).`);
      return;
    }

    const confirmed = window.confirm(
      `Tem certeza que deseja excluir a rota "${route.id}"?\n\nOrigem: ${route.origin}\nDestino: ${route.destination}\n\nEsta ação não pode ser desfeita.`
    );

    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('routes')
        .delete()
        .eq('id', route.id);

      if (error) {
        console.error('Supabase delete error:', error);
        throw error;
      }

      toast.success('Rota excluída com sucesso!');
      fetchRoutes();
    } catch (error) {
      console.error('Error deleting route:', error);
      toast.error('Erro ao excluir rota.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Planejamento de Rotas</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">add_road</span>
          Nova Rota
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider">Rotas Cadastradas</h3>
            {routes.length === 0 ? (
              <div className="bg-white dark:bg-surface-dark p-8 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                <p className="text-text-secondary">Nenhuma rota cadastrada.</p>
              </div>
            ) : (
              routes.map(route => (
                <div key={route.id} className="bg-white dark:bg-surface-dark p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-primary text-lg">{route.id}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${route.status === 'Ativo' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'
                          }`}>{route.status || 'Ativo'}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-sm">
                        <span className="font-bold">{route.origin}</span>
                        <span className="material-symbols-outlined text-xs text-text-secondary">arrow_forward</span>
                        <span className="font-bold">{route.destination}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-text-secondary uppercase">Valor da Rota</p>
                      <p className="font-bold text-lg">R$ {route.value?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 pt-3 mt-3">
                    <p className="text-xs font-bold text-text-secondary uppercase mb-2">Cidades da Rota</p>
                    <div className="flex flex-wrap gap-2">
                      {route.cities && route.cities.length > 0 ? (
                        route.cities.map((city, idx) => (
                          <span key={idx} className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded font-medium">
                            {city.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-text-secondary italic">Nenhuma cidade cadastrada</span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleEditRoute(route)}
                      className="flex-1 py-2 text-xs font-bold border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors flex items-center justify-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteRoute(route)}
                      className="py-2 px-3 text-xs font-bold border border-red-500 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center"
                      title="Excluir rota"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <NewRouteModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={fetchRoutes}
        editRoute={editingRoute}
      />
    </div>
  );
};
