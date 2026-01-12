
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CardSkeleton } from '../components/Skeleton';
import { supabase } from '../services/supabase';
import { NewDriverModal } from '../components/NewDriverModal';
import { toast } from 'react-hot-toast';

interface DriverRecord {
  id: string;
  name: string;
  photo_url: string;
  plate: string;
  status: 'active' | 'in_route';
  monthly_routes: number;
  revenue: number;
  cnpj_cpf: string;
  valor_km: number;
  valor_ponto: number;
}

export const Drivers: React.FC = () => {
  const [drivers, setDrivers] = useState<DriverRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<DriverRecord | null>(null);

  const fetchDrivers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching drivers:', error);
    }

    if (!error && data) {
      // Ensure numeric fields are numbers
      const formattedData = data.map((d: any) => ({
        ...d,
        revenue: Number(d.revenue || 0),
        monthly_routes: Number(d.monthly_routes || 0),
        valor_km: Number(d.valor_km || 0),
        valor_ponto: Number(d.valor_ponto || 0)
      }));
      setDrivers(formattedData);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleEditDriver = (driver: DriverRecord) => {
    setEditingDriver(driver);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDriver(null);
  };

  const handleDeleteDriver = async (driver: DriverRecord) => {
    console.log('🗑️ Delete button clicked for driver:', driver.name, 'ID:', driver.id);

    // Show confirmation dialog first
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir o motorista "${driver.name}"?\n\nEsta ação não pode ser desfeita.`
    );

    console.log('✅ User confirmation:', confirmed);
    if (!confirmed) {
      console.log('❌ Deletion cancelled by user');
      return;
    }

    try {
      console.log('🔍 Checking for associated freights...');
      // Check if driver has associated freights
      const { data: freights, error: freightError } = await supabase
        .from('freights')
        .select('id')
        .eq('driver_id', driver.id);

      console.log('📦 Freights check result:', { freights, freightError });

      if (freightError) {
        console.error('❌ Error checking freights:', freightError);
        toast.error('Erro ao verificar fretes associados.');
        return;
      }

      if (freights && freights.length > 0) {
        console.log('⚠️ Driver has associated freights, cannot delete');
        toast.error(`Não é possível excluir o motorista "${driver.name}" pois existem ${freights.length} frete(s) associado(s).`);
        return;
      }

      console.log('🚀 Proceeding with deletion...');
      // Proceed with deletion
      const { error, data } = await supabase
        .from('drivers')
        .delete()
        .eq('id', driver.id)
        .select();

      console.log('🔥 Delete operation result:', { error, data });

      if (error) {
        console.error('❌ Supabase delete error:', error);
        toast.error(`Erro ao excluir: ${error.message}`);
        throw error;
      }

      console.log('✅ Driver deleted successfully!');
      toast.success('Motorista excluído com sucesso!');
      fetchDrivers();
    } catch (error) {
      console.error('💥 Error deleting driver:', error);
      toast.error('Erro ao excluir motorista.');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Gestão de Motoristas</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-md active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Novo Motorista
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : drivers.length === 0 ? (
        <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
          <span className="material-symbols-outlined text-6xl text-slate-200 dark:text-slate-700 mb-4">badge</span>
          <p className="text-text-secondary">Nenhum motorista cadastrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drivers.map((driver) => (
            <div
              key={driver.id}
              className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={driver.photo_url || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop'}
                  alt={driver.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-slate-100 dark:border-slate-800"
                />
                <div>
                  <h4 className="font-bold text-lg">{driver.name}</h4>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${driver.status === 'active' ? 'bg-success' : 'bg-slate-400'}`}></span>
                    <span className="text-xs font-medium text-text-secondary uppercase">{driver.status === 'active' ? 'Disponível' : 'Em Rota'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Veículo Fixo:</span>
                  <span className="font-bold text-primary">{driver.plate || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Rotas (Mês):</span>
                  <span className="font-bold">{driver.monthly_routes}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Faturamento:</span>
                  <span className="font-bold text-success">R$ {driver.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => handleEditDriver(driver)}
                  className="flex-1 py-2 text-xs font-bold border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  Editar
                </button>
                <button
                  onClick={() => handleDeleteDriver(driver)}
                  className="py-2 px-3 text-xs font-bold border border-red-500 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center"
                  title="Excluir motorista"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <NewDriverModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={fetchDrivers}
        editDriver={editingDriver}
      />
    </motion.div>
  );
};
