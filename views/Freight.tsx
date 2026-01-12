import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TableSkeleton } from '../components/Skeleton';
import { supabase } from '../services/supabase';
import { NewFreightModal } from '../components/NewFreightModal';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { toast } from 'react-hot-toast';

interface FreightRecord {
  id: string;
  manifesto: string;
  freight_date: string;
  status: string;
  value: number;
  origin: string;
  destination: string;
  additional_cities: any[];
  km_inicial: number;
  km_final: number;
  total_pontos: number;
  tolls: number;
  drivers: { name: string };
  routes: { id: string };
}

export const Freight: React.FC = () => {
  const [freights, setFreights] = useState<FreightRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchFreights = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('freights')
      .select(`
        *,
        drivers (name),
        routes (id)
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setFreights(data as any);
    }
    setLoading(false);
  };

  const handleDeleteFreight = async (id: string, manifesto: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o frete do manifesto "${manifesto}"?`)) return;

    try {
      const { error } = await supabase
        .from('freights')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting freight:', error);
        toast.error('Erro ao excluir frete: ' + error.message);
      } else {
        toast.success('Frete excluído com sucesso');
        fetchFreights();
      }
    } catch (err: any) {
      console.error('Unexpected error deleting freight:', err);
      toast.error('Erro inesperado ao excluir.');
    }
  };

  useEffect(() => {
    fetchFreights();
  }, []);

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // Title
      doc.setFontSize(18);
      doc.setTextColor(0, 0, 0);
      doc.text('Relatório de Fretes', 14, 20);

      // Subtitle
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 27);

      // Table headers
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      doc.setFillColor(37, 99, 235);
      doc.rect(10, 32, 277, 8, 'F');

      doc.setTextColor(255, 255, 255);
      const headers = ["Motorista", "Rota", "Manifesto", "Data", "Origem", "Destino", "KM I", "KM F", "Pts", "Pedág", "Valor"];
      let x = 12;
      const colWidths = [30, 20, 25, 20, 25, 25, 15, 15, 12, 20, 25];

      headers.forEach((header, i) => {
        doc.text(header, x, 37);
        x += colWidths[i];
      });

      // Table rows
      doc.setTextColor(0, 0, 0);
      let y = 45;

      freights.forEach((f, index) => {
        if (y > 190) { // New page if needed
          doc.addPage();
          y = 20;
        }

        x = 12;
        const row = [
          (f.drivers?.name || '-').substring(0, 15),
          (f.routes?.id || '-').substring(0, 10),
          (f.manifesto || '-').substring(0, 12),
          new Date(f.freight_date).toLocaleDateString('pt-BR'),
          f.origin.substring(0, 12),
          f.destination.substring(0, 12),
          String(f.km_inicial || 0),
          String(f.km_final || 0),
          String(f.total_pontos || 0),
          `R$${(f.tolls || 0).toFixed(0)}`,
          `R$${f.value.toFixed(2)}`
        ];

        row.forEach((cell, i) => {
          doc.text(cell, x, y);
          x += colWidths[i];
        });

        y += 7;

        // Draw line
        doc.setDrawColor(200, 200, 200);
        doc.line(10, y - 2, 287, y - 2);
      });

      const fileName = `fretes_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      toast.success('PDF exportado com sucesso!');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Erro ao exportar PDF: ' + (error as Error).message);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.05 }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Controle de Fretes</h2>
        <div className="flex gap-2">
          <button
            onClick={handleExportPDF}
            className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-all shadow-sm active:scale-95"
          >
            Exportar PDF
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all shadow-md active:scale-95"
          >
            + Novo Frete
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm flex flex-col h-[calc(100vh-200px)]">
        <div className="overflow-auto flex-1">
          <table className="w-full text-left border-collapse whitespace-nowrap relative">
            <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-800 shadow-sm">
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="px-3 py-3 text-xs font-bold uppercase text-text-secondary tracking-wider min-w-[150px]">Motorista</th>
                <th className="px-3 py-3 text-xs font-bold uppercase text-text-secondary tracking-wider min-w-[100px]">Rota</th>
                <th className="px-3 py-3 text-xs font-bold uppercase text-text-secondary tracking-wider min-w-[100px]">Manifesto</th>
                <th className="px-3 py-3 text-xs font-bold uppercase text-text-secondary tracking-wider min-w-[100px]">Data</th>
                <th className="px-3 py-3 text-xs font-bold uppercase text-text-secondary tracking-wider min-w-[120px]">Origem</th>
                <th className="px-3 py-3 text-xs font-bold uppercase text-text-secondary tracking-wider min-w-[120px]">Destino</th>
                <th className="px-3 py-3 text-xs font-bold uppercase text-text-secondary tracking-wider w-20">KM Ini</th>
                <th className="px-3 py-3 text-xs font-bold uppercase text-text-secondary tracking-wider w-20">KM Fim</th>
                <th className="px-3 py-3 text-xs font-bold uppercase text-text-secondary tracking-wider min-w-[100px]">Cidades Adic.</th>
                <th className="px-3 py-3 text-xs font-bold uppercase text-text-secondary tracking-wider w-16">Pts</th>
                <th className="px-3 py-3 text-xs font-bold uppercase text-text-secondary tracking-wider min-w-[100px]">Pedágios</th>
                <th className="px-3 py-3 text-xs font-bold uppercase text-text-secondary tracking-wider min-w-[100px]">Valor Total</th>
                <th className="px-3 py-3 text-xs font-bold uppercase text-text-secondary tracking-wider w-20 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={13} className="p-0">
                    <TableSkeleton rows={10} />
                  </td>
                </tr>
              ) : freights.length === 0 ? (
                <tr>
                  <td colSpan={13} className="px-6 py-12 text-center">
                    <span className="material-symbols-outlined text-4xl text-slate-200 dark:text-slate-700 mb-2">inventory_2</span>
                    <p className="text-text-secondary text-sm italic">Nenhum frete encontrado.</p>
                  </td>
                </tr>
              ) : (
                freights.map((f) => (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={f.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    <td className="px-3 py-2.5 text-sm font-bold max-w-[180px] truncate" title={f.drivers?.name}>{f.drivers?.name || '-'}</td>
                    <td className="px-3 py-2.5 text-sm max-w-[120px] truncate" title={f.routes?.id}>{f.routes?.id || '-'}</td>
                    <td className="px-3 py-2.5 text-sm font-semibold">{f.manifesto || '-'}</td>
                    <td className="px-3 py-2.5 text-sm text-text-secondary">{new Date(f.freight_date).toLocaleDateString('pt-BR')}</td>
                    <td className="px-3 py-2.5 text-sm max-w-[150px] truncate" title={f.origin}>{f.origin}</td>
                    <td className="px-3 py-2.5 text-sm max-w-[150px] truncate" title={f.destination}>{f.destination}</td>
                    <td className="px-3 py-2.5 text-sm">{f.km_inicial || 0}</td>
                    <td className="px-3 py-2.5 text-sm">{f.km_final || 0}</td>
                    <td className="px-3 py-2.5">
                      <div className="text-xs text-text-secondary max-w-[150px] truncate" title={f.additional_cities?.map((c: any) => c.name).join(', ')}>
                        {f.additional_cities && f.additional_cities.length > 0
                          ? f.additional_cities.length + ' cidade(s)'
                          : '-'}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-sm">{f.total_pontos || 0}</td>
                    <td className="px-3 py-2.5 text-sm">R$ {f.tolls?.toFixed(2) || '0.00'}</td>
                    <td className="px-3 py-2.5 font-bold text-sm text-primary">R$ {f.value.toFixed(2)}</td>
                    <td className="px-3 py-2.5 flex gap-1 justify-center">
                      <button className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-text-secondary hover:text-primary transition-colors" title="Visualizar">
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                      </button>
                      <button
                        onClick={() => handleDeleteFreight(f.id, f.manifesto)}
                        className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-text-secondary hover:text-danger transition-colors"
                        title="Excluir"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <NewFreightModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchFreights}
      />
    </motion.div>
  );
};
