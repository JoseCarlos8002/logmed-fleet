
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { analyzeFleetStatus } from '../services/gemini';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { Card } from '../components/Card';
import { supabase } from '../services/supabase';

interface DashboardMetrics {
  totalDrivers: number;
  activeDrivers: number;
  totalFreights: number;
  monthlyRevenue: number;
  activeRoutes: number;
  avgFreightValue: number;
  totalKm: number;
  growthRate: number;
  occupationRate: number;
}

interface ChartData {
  name: string;
  value: number;
}

interface FreightRecord {
  id: string;
  manifesto: string;
  freight_date: string;
  value: number;
  origin: string;
  destination: string;
  drivers: { name: string };
}

interface DriverPerformance {
  name: string;
  revenue: number;
  freights: number;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 p-3 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl">
        <p className="text-xs font-bold text-text-secondary mb-1 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-extrabold text-primary">
          {payload[0].name === 'freights' ? 'Fretes: ' : payload[0].name === 'count' ? 'Quantidade: ' : 'Valor: R$ '}
          {payload[0].name === 'freights' || payload[0].name === 'count' ? payload[0].value : payload[0].value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
      </div>
    );
  }
  return null;
};

const Dashboard: React.FC = () => {
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalDrivers: 0,
    activeDrivers: 0,
    totalFreights: 0,
    monthlyRevenue: 0,
    activeRoutes: 0,
    avgFreightValue: 0,
    totalKm: 0,
    growthRate: 0,
    occupationRate: 0
  });
  const [freightChartData, setFreightChartData] = useState<ChartData[]>([]);
  const [revenueChartData, setRevenueChartData] = useState<ChartData[]>([]);
  const [topDrivers, setTopDrivers] = useState<DriverPerformance[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<ChartData[]>([]);
  const [recentFreights, setRecentFreights] = useState<FreightRecord[]>([]);
  const [monthlyEvolution, setMonthlyEvolution] = useState<ChartData[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setDataLoading(true);
    try {
      // Fetch drivers
      const { data: drivers } = await supabase
        .from('drivers')
        .select('status, id');

      const totalDrivers = drivers?.length || 0;
      const activeDrivers = drivers?.filter(d => d.status === 'active').length || 0;

      // Fetch freights for current month
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
      const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();

      const { data: freights } = await supabase
        .from('freights')
        .select('*, drivers(name)')
        .gte('freight_date', firstDayOfMonth);

      const { data: lastMonthFreights } = await supabase
        .from('freights')
        .select('value')
        .gte('freight_date', firstDayOfLastMonth)
        .lte('freight_date', lastDayOfLastMonth);

      const totalFreights = freights?.length || 0;
      const monthlyRevenue = freights?.reduce((sum, f) => sum + (Number(f.value) || 0), 0) || 0;
      const lastMonthRevenue = lastMonthFreights?.reduce((sum, f) => sum + (Number(f.value) || 0), 0) || 0;
      const growthRate = lastMonthRevenue > 0 ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

      // Fetch routes
      const { data: routes } = await supabase
        .from('routes')
        .select('id, status')
        .eq('status', 'Ativo');

      const activeRoutes = routes?.length || 0;

      // Calculate metrics
      const avgFreightValue = totalFreights > 0 ? monthlyRevenue / totalFreights : 0;
      const totalKm = freights?.reduce((sum, f) => sum + ((f.km_final || 0) - (f.km_inicial || 0)), 0) || 0;
      const occupationRate = totalDrivers > 0 ? (totalFreights / totalDrivers) : 0;

      // Recent freights
      const { data: recentFreightsData } = await supabase
        .from('freights')
        .select('id, manifesto, freight_date, value, origin, destination, drivers(name)')
        .order('freight_date', { ascending: false })
        .limit(5);

      setRecentFreights(recentFreightsData as any || []);

      // Top drivers by revenue
      const driverRevenue: { [key: string]: { name: string; revenue: number; freights: number } } = {};
      freights?.forEach(f => {
        const driverName = f.drivers?.name || 'Desconhecido';
        if (!driverRevenue[driverName]) {
          driverRevenue[driverName] = { name: driverName, revenue: 0, freights: 0 };
        }
        driverRevenue[driverName].revenue += Number(f.value) || 0;
        driverRevenue[driverName].freights += 1;
      });

      const topDriversArray = Object.values(driverRevenue)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
      setTopDrivers(topDriversArray);

      // Status distribution
      const statusCount: { [key: string]: number } = {};
      freights?.forEach(f => {
        const status = f.status || 'Pendente';
        statusCount[status] = (statusCount[status] || 0) + 1;
      });
      setStatusDistribution(Object.entries(statusCount).map(([name, value]) => ({ name, value })));

      // Prepare chart data for last 7 days
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date;
      });

      const freightsByDay = last7Days.map(date => {
        const dayStart = new Date(date.setHours(0, 0, 0, 0)).toISOString();
        const dayEnd = new Date(date.setHours(23, 59, 59, 999)).toISOString();

        const dayFreights = freights?.filter(f =>
          f.freight_date >= dayStart && f.freight_date <= dayEnd
        ) || [];

        const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

        return {
          name: dayNames[date.getDay()],
          freights: dayFreights.length,
          value: dayFreights.reduce((sum, f) => sum + (Number(f.value) || 0), 0)
        };
      });

      // Monthly evolution (last 6 months)
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (5 - i));
        return date;
      });

      const monthlyData = await Promise.all(last6Months.map(async (date) => {
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
        const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59).toISOString();

        const { data } = await supabase
          .from('freights')
          .select('value')
          .gte('freight_date', firstDay)
          .lte('freight_date', lastDay);

        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        return {
          name: monthNames[date.getMonth()],
          value: data?.reduce((sum, f) => sum + (Number(f.value) || 0), 0) || 0
        };
      }));

      setMonthlyEvolution(monthlyData);

      setMetrics({
        totalDrivers,
        activeDrivers,
        totalFreights,
        monthlyRevenue,
        activeRoutes,
        avgFreightValue,
        totalKm,
        growthRate,
        occupationRate
      });

      setFreightChartData(freightsByDay.map(d => ({ name: d.name, value: d.freights })));
      setRevenueChartData(freightsByDay.map(d => ({ name: d.name, value: d.value })));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleAiAnalysis = async () => {
    setLoading(true);
    const summary = `${metrics.totalDrivers} motoristas cadastrados, ${metrics.activeDrivers} disponíveis, ${metrics.totalFreights} fretes no mês, faturamento mensal de R$ ${metrics.monthlyRevenue.toFixed(2)}, crescimento de ${metrics.growthRate.toFixed(1)}% vs mês anterior.`;
    const result = await analyzeFleetStatus(summary);
    setAiAnalysis(result);
    setLoading(false);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
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
        <div>
          <h2 className="text-2xl font-bold text-text-main dark:text-white">Resumo Operacional</h2>
          <p className="text-sm text-text-secondary mt-1">Visão completa da operação em tempo real</p>
        </div>
        <button
          onClick={handleAiAnalysis}
          disabled={loading}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-md active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">{loading ? 'sync' : 'psychology'}</span>
          <span>{loading ? 'Analisando...' : 'IA Intelligence'}</span>
        </button>
      </div>

      {aiAnalysis && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-4 rounded-xl flex gap-4"
        >
          <span className="material-symbols-outlined text-primary text-[32px]">tips_and_updates</span>
          <div className="text-sm text-blue-900 dark:text-blue-100 whitespace-pre-wrap leading-relaxed">
            {aiAnalysis}
          </div>
        </motion.div>
      )}

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={itemVariants}>
          <Card>
            <div className="flex justify-between items-start mb-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <span className="material-symbols-outlined text-2xl">badge</span>
              </div>
              {metrics.activeDrivers > 0 && (
                <span className="text-xs font-bold text-success bg-success/10 px-2 py-1 rounded-full">
                  {Math.round((metrics.activeDrivers / metrics.totalDrivers) * 100)}%
                </span>
              )}
            </div>
            <p className="text-xs font-semibold text-text-secondary uppercase">Motoristas</p>
            <h3 className="text-2xl font-extrabold mt-1">
              {dataLoading ? '...' : metrics.activeDrivers} <span className="text-sm font-normal text-slate-400">/ {metrics.totalDrivers}</span>
            </h3>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <div className="flex justify-between items-start mb-3">
              <div className="p-2 bg-warning/10 rounded-lg text-warning">
                <span className="material-symbols-outlined text-2xl">local_shipping</span>
              </div>
            </div>
            <p className="text-xs font-semibold text-text-secondary uppercase">Fretes (Mês)</p>
            <h3 className="text-2xl font-extrabold mt-1">{dataLoading ? '...' : metrics.totalFreights}</h3>
            <p className="text-xs text-text-secondary font-medium mt-1">Mês atual</p>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <div className="flex justify-between items-start mb-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                <span className="material-symbols-outlined text-2xl">payments</span>
              </div>
              {metrics.growthRate !== 0 && (
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${metrics.growthRate > 0 ? 'text-success bg-success/10' : 'text-red-500 bg-red-500/10'}`}>
                  {metrics.growthRate > 0 ? '+' : ''}{metrics.growthRate.toFixed(1)}%
                </span>
              )}
            </div>
            <p className="text-xs font-semibold text-text-secondary uppercase">Faturamento</p>
            <h3 className="text-2xl font-extrabold mt-1">
              {dataLoading ? '...' : `R$ ${(metrics.monthlyRevenue / 1000).toFixed(1)}k`}
            </h3>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <div className="flex justify-between items-start mb-3">
              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                <span className="material-symbols-outlined text-2xl">route</span>
              </div>
            </div>
            <p className="text-xs font-semibold text-text-secondary uppercase">Rotas Ativas</p>
            <h3 className="text-2xl font-extrabold mt-1">{dataLoading ? '...' : metrics.activeRoutes}</h3>
            <p className="text-xs text-text-secondary font-medium mt-1">Cadastradas</p>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <div className="flex justify-between items-start mb-3">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                <span className="material-symbols-outlined text-2xl">trending_up</span>
              </div>
            </div>
            <p className="text-xs font-semibold text-text-secondary uppercase">Ticket Médio</p>
            <h3 className="text-2xl font-extrabold mt-1">
              {dataLoading ? '...' : `R$ ${metrics.avgFreightValue.toFixed(0)}`}
            </h3>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <div className="flex justify-between items-start mb-3">
              <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
                <span className="material-symbols-outlined text-2xl">speed</span>
              </div>
            </div>
            <p className="text-xs font-semibold text-text-secondary uppercase">Total KM</p>
            <h3 className="text-2xl font-extrabold mt-1">
              {dataLoading ? '...' : `${(metrics.totalKm / 1000).toFixed(1)}k`}
            </h3>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <div className="flex justify-between items-start mb-3">
              <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-500">
                <span className="material-symbols-outlined text-2xl">percent</span>
              </div>
            </div>
            <p className="text-xs font-semibold text-text-secondary uppercase">Taxa Ocupação</p>
            <h3 className="text-2xl font-extrabold mt-1">
              {dataLoading ? '...' : `${metrics.occupationRate.toFixed(1)}`}
            </h3>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <div className="flex justify-between items-start mb-3">
              <div className="p-2 bg-pink-500/10 rounded-lg text-pink-500">
                <span className="material-symbols-outlined text-2xl">attach_money</span>
              </div>
            </div>
            <p className="text-xs font-semibold text-text-secondary uppercase">Custo/KM</p>
            <h3 className="text-2xl font-extrabold mt-1">
              {dataLoading ? '...' : `R$ ${metrics.totalKm > 0 ? (metrics.monthlyRevenue / metrics.totalKm).toFixed(2) : '0.00'}`}
            </h3>
          </Card>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <Card>
            <h3 className="text-lg font-bold mb-4">Fretes por Dia (Últimos 7 dias)</h3>
            <div className="h-64">
              {dataLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={freightChartData}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1E3A8A" stopOpacity={1} />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                    <Bar dataKey="value" fill="url(#barGradient)" radius={[6, 6, 0, 0]} barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <h3 className="text-lg font-bold mb-4">Faturamento Diário (Últimos 7 dias)</h3>
            <div className="h-64">
              {dataLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueChartData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="value" stroke="#1E3A8A" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <h3 className="text-lg font-bold mb-4">Top 5 Motoristas (Receita)</h3>
            <div className="h-64">
              {dataLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topDrivers} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} width={120} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                    <Bar dataKey="revenue" fill="#10b981" radius={[0, 6, 6, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <h3 className="text-lg font-bold mb-4">Distribuição por Status</h3>
            <div className="h-64">
              {dataLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : statusDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-text-secondary">
                  Sem dados disponíveis
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card>
            <h3 className="text-lg font-bold mb-4">Evolução Mensal (Últimos 6 Meses)</h3>
            <div className="h-64">
              {dataLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyEvolution}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Recent Freights Table */}
      <motion.div variants={itemVariants}>
        <Card>
          <h3 className="text-lg font-bold mb-4">Últimos Fretes</h3>
          {dataLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : recentFreights.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 text-xs font-bold text-text-secondary uppercase">Manifesto</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-text-secondary uppercase">Motorista</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-text-secondary uppercase">Rota</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-text-secondary uppercase">Data</th>
                    <th className="text-right py-3 px-4 text-xs font-bold text-text-secondary uppercase">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {recentFreights.map((freight) => (
                    <tr key={freight.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4 text-sm font-medium">{freight.manifesto}</td>
                      <td className="py-3 px-4 text-sm">{freight.drivers?.name || 'N/A'}</td>
                      <td className="py-3 px-4 text-sm">{freight.origin} → {freight.destination}</td>
                      <td className="py-3 px-4 text-sm">{new Date(freight.freight_date).toLocaleDateString('pt-BR')}</td>
                      <td className="py-3 px-4 text-sm font-bold text-right text-success">R$ {Number(freight.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-text-secondary">
              Nenhum frete registrado
            </div>
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
