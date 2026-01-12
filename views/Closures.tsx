
import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { NewClosureModal } from '../components/NewClosureModal';
import { PaymentForm } from '../components/PaymentForm';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from 'react-hot-toast';

interface ClosureRecord {
  id: string;
  driver_id: string;
  period_start: string;
  period_end: string;
  total_value: number;
  status: 'Aberto' | 'Fechado';
  drivers: {
    name: string;
    cnpj_cpf: string;
    plate: string;
    valor_km: number;
    valor_ponto: number;
  };
}

export const Closures: React.FC = () => {
  const [closures, setClosures] = useState<ClosureRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingClosure, setViewingClosure] = useState<ClosureRecord | null>(null);
  const [closureFreights, setClosureFreights] = useState<any[]>([]);
  const [isViewingFicha, setIsViewingFicha] = useState(false);

  const fetchClosures = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('closures')
      .select(`
        *,
        drivers (
          name,
          cnpj_cpf,
          plate,
          valor_km,
          valor_ponto
        )
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setClosures(data as any);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClosures();
  }, []);

  const handleViewFicha = async (closure: ClosureRecord) => {
    setViewingClosure(closure);
    const { data, error } = await supabase
      .from('freights')
      .select('*')
      .eq('driver_id', closure.driver_id)
      .gte('freight_date', closure.period_start)
      .lte('freight_date', closure.period_end);

    if (!error && data) {
      setClosureFreights(data);
      setIsViewingFicha(true);
    } else {
      toast.error('Erro ao carregar fretes do fechamento.');
    }
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('payment-form');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Ficha_Pagamento_${viewingClosure?.drivers.name}_${viewingClosure?.period_end}.pdf`);
      toast.success('PDF gerado com sucesso!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Erro ao gerar PDF.');
    }
  };

  const totalOpen = closures
    .filter(c => c.status === 'Aberto')
    .reduce((acc, curr) => acc + Number(curr.total_value), 0);

  const totalPaid = closures
    .filter(c => c.status === 'Fechado')
    .reduce((acc, curr) => acc + Number(curr.total_value), 0);

  const pendingDrivers = new Set(closures.filter(c => c.status === 'Aberto').map(c => c.driver_id)).size;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Fechamentos de Ciclo</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">lock_open</span>
          Novo Fechamento
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-surface-dark p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-xs font-bold text-text-secondary uppercase mb-1">Total em Aberto</p>
          <p className="text-2xl font-extrabold text-warning">R$ {totalOpen.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          <div className="mt-3 flex items-center gap-1 text-[10px] font-bold text-text-secondary">
            <span className="material-symbols-outlined text-[14px]">info</span>
            {pendingDrivers} {pendingDrivers === 1 ? 'motorista pendente' : 'motoristas pendentes'}
          </div>
        </div>
        <div className="bg-white dark:bg-surface-dark p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-xs font-bold text-text-secondary uppercase mb-1">Total Pago (Geral)</p>
          <p className="text-2xl font-extrabold text-success">R$ {totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          <div className="mt-3 flex items-center gap-1 text-[10px] font-bold text-success">
            <span className="material-symbols-outlined text-[14px]">check_circle</span>
            Fechamentos concluídos
          </div>
        </div>
        <div className="bg-white dark:bg-surface-dark p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-xs font-bold text-text-secondary uppercase mb-1">Último Fechamento</p>
          <p className="text-2xl font-extrabold text-primary">
            {closures.length > 0 ? new Date(closures[0].period_end).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : '--'}
          </p>
          <div className="mt-3 flex items-center gap-1 text-[10px] font-bold text-text-secondary">
            <span className="material-symbols-outlined text-[14px]">calendar_today</span>
            Data de referência
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : closures.length === 0 ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-6xl text-slate-200 dark:text-slate-700 mb-4">history</span>
            <p className="text-text-secondary">Nenhum fechamento registrado.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <th className="px-6 py-4 text-xs font-bold uppercase text-text-secondary tracking-wider">Protocolo</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-text-secondary tracking-wider">Motorista</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-text-secondary tracking-wider">Período</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-text-secondary tracking-wider">Valor Total</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-text-secondary tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-text-secondary tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {closures.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-sm text-primary truncate max-w-[100px]">{c.id.substring(0, 8)}...</td>
                  <td className="px-6 py-4 font-semibold text-sm">{c.drivers?.name}</td>
                  <td className="px-6 py-4 text-sm text-text-secondary">
                    {new Date(c.period_start).toLocaleDateString('pt-BR')} - {new Date(c.period_end).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 font-bold text-sm">R$ {Number(c.total_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-1 rounded-full ${c.status === 'Fechado' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                      }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewFicha(c)}
                        className="material-symbols-outlined text-text-secondary hover:text-primary transition-colors"
                        title="Ver Ficha de Solicitação"
                      >
                        receipt_long
                      </button>
                      <button
                        onClick={() => handleViewFicha(c).then(() => handleDownloadPDF())}
                        className="material-symbols-outlined text-text-secondary hover:text-primary transition-colors"
                        title="Baixar PDF"
                      >
                        download
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Ficha View Modal */}
      {isViewingFicha && viewingClosure && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-surface-dark w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[95vh]">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="text-lg font-bold">Ficha de Solicitação de Pagamento</h3>
              <div className="flex gap-3">
                <button
                  onClick={handleDownloadPDF}
                  className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  Baixar PDF
                </button>
                <button onClick={() => setIsViewingFicha(false)} className="text-text-secondary hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
            <div className="p-8 overflow-y-auto bg-slate-100 dark:bg-slate-900 flex-1">
              <PaymentForm
                driver={viewingClosure.drivers}
                freights={closureFreights}
                periodStart={viewingClosure.period_start}
                periodEnd={viewingClosure.period_end}
              />
            </div>
          </div>
        </div>
      )}

      <NewClosureModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchClosures}
      />
    </div>
  );
};
