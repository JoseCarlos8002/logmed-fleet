import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PaymentFormProps {
    driver: {
        name: string;
        cnpj_cpf: string;
        plate: string;
        valor_km: number;
        valor_ponto: number;
    };
    freights: any[];
    periodStart: string;
    periodEnd: string;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({ driver, freights, periodStart, periodEnd }) => {
    const totalKm = freights.reduce((acc, f) => acc + (f.km_final - f.km_inicial), 0);
    const totalPoints = freights.reduce((acc, f) => acc + (f.total_pontos || 0), 0);
    const totalFreight = freights.reduce((acc, f) => acc + (f.value || 0), 0);

    // grandTotal is now just the sum of all freight values, as they include KM + Points + Tolls
    const grandTotal = totalFreight;

    // We still calculate these for display purposes only
    const kmValue = totalKm * (driver.valor_km || 0);
    const pointsValue = totalPoints * (driver.valor_ponto || 0);

    return (
        <div id="payment-form" className="bg-white p-8 max-w-[800px] mx-auto border border-slate-200 shadow-sm text-slate-900 font-sans">
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-6">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tighter">Logmed RP</h1>
                    <p className="text-xs font-bold text-slate-500">SOLICITAÇÃO DE PAGAMENTO DE TRANSPORTES</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-bold uppercase">Data de Emissão</p>
                    <p className="font-bold">{format(new Date(), 'dd/MM/yyyy')}</p>
                </div>
            </div>

            {/* Driver Info */}
            <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase text-slate-500">Favorecido (Motorista)</p>
                    <p className="text-sm font-bold border-b border-slate-200 pb-1">{driver.name}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase text-slate-500">CNPJ / CPF</p>
                    <p className="text-sm font-bold border-b border-slate-200 pb-1">{driver.cnpj_cpf}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase text-slate-500">Placa do Veículo</p>
                    <p className="text-sm font-bold border-b border-slate-200 pb-1">{driver.plate}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase text-slate-500">Período de Referência</p>
                    <p className="text-sm font-bold border-b border-slate-200 pb-1">
                        {format(new Date(periodStart), 'dd/MM/yyyy')} até {format(new Date(periodEnd), 'dd/MM/yyyy')}
                    </p>
                </div>
            </div>

            {/* Table */}
            <div className="mb-8">
                <table className="w-full text-xs border-collapse">
                    <thead>
                        <tr className="bg-slate-100 border-y border-slate-900">
                            <th className="py-2 px-2 text-left">DATA</th>
                            <th className="py-2 px-2 text-left">MANIFESTO</th>
                            <th className="py-2 px-2 text-left">ORIGEM/DESTINO</th>
                            <th className="py-2 px-2 text-right">KM</th>
                            <th className="py-2 px-2 text-right">PONTOS</th>
                            <th className="py-2 px-2 text-right">VALOR</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {freights.map((f, i) => (
                            <tr key={i}>
                                <td className="py-2 px-2">{format(new Date(f.freight_date), 'dd/MM/yy')}</td>
                                <td className="py-2 px-2 font-mono">{f.manifesto || '-'}</td>
                                <td className="py-2 px-2">{f.origin} / {f.destination}</td>
                                <td className="py-2 px-2 text-right">{f.km_final - f.km_inicial}</td>
                                <td className="py-2 px-2 text-right">{f.total_pontos || 0}</td>
                                <td className="py-2 px-2 text-right">R$ {f.value?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Totals and Summary */}
            <div className="grid grid-cols-2 gap-8 mb-12">
                <div className="space-y-2">
                    <div className="flex justify-between text-xs border-b border-slate-100 pb-1">
                        <span className="text-slate-500">Total KM ({totalKm} km x R$ {driver.valor_km?.toFixed(2)})</span>
                        <span className="font-bold">R$ {kmValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-xs border-b border-slate-100 pb-1">
                        <span className="text-slate-500">Total Pontos ({totalPoints} pts x R$ {driver.valor_ponto?.toFixed(2)})</span>
                        <span className="font-bold">R$ {pointsValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-xs border-b border-slate-100 pb-1">
                        <span className="text-slate-500">Total Consolidado</span>
                        <span className="font-bold">R$ {totalFreight.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>
                <div className="bg-slate-900 text-white p-4 rounded-lg flex flex-col justify-center items-end">
                    <p className="text-[10px] font-bold uppercase opacity-70">Valor Total a Pagar</p>
                    <p className="text-2xl font-black">R$ {grandTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-12 pt-12">
                <div className="text-center">
                    <div className="border-t border-slate-900 pt-2">
                        <p className="text-[10px] font-bold uppercase">Assinatura do Favorecido</p>
                        <p className="text-[9px] text-slate-400 mt-1">{driver.name}</p>
                    </div>
                </div>
                <div className="text-center">
                    <div className="border-t border-slate-900 pt-2">
                        <p className="text-[10px] font-bold uppercase">Logmed RP - Aprovação</p>
                        <p className="text-[9px] text-slate-400 mt-1">Responsável Financeiro</p>
                    </div>
                </div>
            </div>

            <div className="mt-12 text-center">
                <p className="text-[8px] text-slate-300 uppercase tracking-widest">Documento gerado eletronicamente via Logmed Fleet Management System</p>
            </div>
        </div>
    );
};
