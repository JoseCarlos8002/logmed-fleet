import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../services/supabase';
import { NewTransactionModal } from '../components/NewTransactionModal';
import { motion } from 'framer-motion';
import { Skeleton, TableSkeleton } from '../components/Skeleton';
import { toast } from 'react-hot-toast';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'Receita' | 'Despesa';
  category: string;
  date: string;
  status: 'Pago' | 'Pendente';
}

export const Financial: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTransactions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('financial_transactions')
      .select('*')
      .order('date', { ascending: false });

    if (!error && data) {
      setTransactions(data);
    }
    setLoading(false);
  };

  const handleDeleteTransaction = async (id: string, description: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir a transação "${description}"?`)) return;

    try {
      const { error } = await supabase
        .from('financial_transactions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting transaction:', error);
        toast.error('Erro ao excluir transação: ' + error.message);
      } else {
        toast.success('Transação excluída com sucesso');
        fetchTransactions();
      }
    } catch (err: any) {
      console.error('Unexpected error deleting transaction:', err);
      toast.error('Erro inesperado ao excluir.');
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const totalRevenue = transactions
    .filter(t => t.type === 'Receita')
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'Despesa')
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const netProfit = totalRevenue - totalExpenses;
  const fuelExpenses = transactions
    .filter(t => t.category === 'Combustível')
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const maintenanceExpenses = transactions
    .filter(t => t.category === 'Manutenção')
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  // Simple aggregation for the chart (by date)
  const chartData = transactions.reduce((acc: any[], curr) => {
    const date = new Date(curr.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    const existing = acc.find(item => item.name === date);
    if (existing) {
      if (curr.type === 'Receita') existing.revenue += Number(curr.amount);
      else existing.expenses += Number(curr.amount);
    } else {
      acc.push({
        name: date,
        revenue: curr.type === 'Receita' ? Number(curr.amount) : 0,
        expenses: curr.type === 'Despesa' ? Number(curr.amount) : 0
      });
    }
    return acc;
  }, []).reverse().slice(-7); // Last 7 days with data

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl">
          <p className="text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">{label}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                <p className="text-sm font-extrabold" style={{ color: entry.color }}>
                  {entry.name === 'revenue' ? 'Receita' : 'Despesa'}: R$ {entry.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
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
        <h2 className="text-xl font-bold">Visão Financeira</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-md active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">add_card</span>
          Nova Transação
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Faturamento Bruto', value: totalRevenue, color: 'text-primary', sub: 'Total acumulado', subColor: 'text-success' },
          { label: 'Custo Combustível', value: fuelExpenses, color: 'text-danger', sub: 'Total em diesel/gasolina', subColor: 'text-danger' },
          { label: 'Manutenção', value: maintenanceExpenses, color: 'text-warning', sub: 'Total em reparos', subColor: 'text-text-secondary' },
          { label: 'Lucro Líquido', value: netProfit, color: netProfit >= 0 ? 'text-success' : 'text-danger', sub: 'Saldo atual em conta', subColor: 'text-text-secondary' },
        ].map((card, i) => (
          <motion.div key={i} variants={itemVariants} className="bg-white dark:bg-surface-dark p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <p className="text-xs font-bold text-text-secondary uppercase mb-1">{card.label}</p>
            {loading ? (
              <Skeleton className="h-8 w-3/4 mt-1" />
            ) : (
              <p className={`text-2xl font-extrabold ${card.color}`}>
                R$ {card.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            )}
            <p className={`text-[10px] font-bold mt-1 ${card.subColor}`}>{card.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white dark:bg-surface-dark p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-lg font-bold mb-6">Comparativo Receita x Despesa</h3>
          <div className="h-80">
            {loading ? (
              <Skeleton className="h-full w-full" />
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1E3A8A" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#1E3A8A" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="revenue" stroke="#1E3A8A" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                  <Area type="monotone" dataKey="expenses" stroke="#ef4444" fillOpacity={1} fill="url(#colorExp)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-text-secondary italic">
                Sem dados suficientes para o gráfico
              </div>
            )}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold mb-4">Últimas Transações</h3>
          <div className="flex-1 space-y-4 overflow-y-auto max-h-[320px] pr-2 no-scrollbar">
            {loading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <Skeleton variant="circular" className="h-8 w-8" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <div className="space-y-1 text-right">
                      <Skeleton className="h-4 w-16 ml-auto" />
                      <Skeleton className="h-3 w-10 ml-auto" />
                    </div>
                  </div>
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <p className="text-center text-text-secondary py-8 italic text-sm">Nenhuma transação registrada.</p>
            ) : (
              transactions.map(t => (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={t.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${t.type === 'Receita' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                      <span className="material-symbols-outlined text-[18px]">
                        {t.type === 'Receita' ? 'arrow_upward' : 'arrow_downward'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-bold truncate max-w-[120px]">{t.description}</p>
                      <p className="text-[10px] text-text-secondary uppercase font-bold">{t.category} • {new Date(t.date).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div>
                      <p className={`text-sm font-bold ${t.type === 'Receita' ? 'text-success' : 'text-danger'}`}>
                        {t.type === 'Receita' ? '+' : '-'} R$ {Number(t.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <p className={`text-[10px] font-bold ${t.status === 'Pago' ? 'text-success' : 'text-warning'}`}>{t.status}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteTransaction(t.id, t.description)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-danger hover:bg-danger/10 transition-all"
                      title="Excluir"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      <NewTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchTransactions}
      />
    </motion.div>
  );
};
