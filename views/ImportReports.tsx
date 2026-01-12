import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import * as XLSX from 'xlsx';
import { toast } from 'react-hot-toast';
import { NewFreightModal } from '../components/NewFreightModal';

export const ImportReports: React.FC = () => {
    const [processing, setProcessing] = useState(false);
    const [extractedData, setExtractedData] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFreight, setSelectedFreight] = useState<any>(null);
    const [drivers, setDrivers] = useState<any[]>([]);
    const [routes, setRoutes] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const { data: d } = await supabase.from('drivers').select('*');
            const { data: r } = await supabase.from('routes').select('*');
            const { data: c } = await supabase.from('cities').select('*');
            if (d) setDrivers(d);
            if (r) setRoutes(r);
            if (c) setCities(c);
        };
        fetchData();
    }, []);

    const isNameMatch = (name1: string, name2: string) => {
        const clean = (s: string) => s.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
            .replace(/^rota\s+/i, '') // Remove "ROTA " prefix
            .trim();

        const n1 = clean(name1);
        const n2 = clean(name2);

        if (!n1 || !n2) return false;
        if (n1 === n2) return true;

        // Check if one contains the other (with minimum length to avoid false positives)
        if (n1.length >= 4 && n2.includes(n1)) return true;
        if (n2.length >= 4 && n1.includes(n2)) return true;

        // Check first name match
        const first1 = n1.split(' ')[0];
        const first2 = n2.split(' ')[0];
        if (first1.length >= 4 && first1 === first2) return true;

        return false;
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'main' | 'driver') => {
        if (!e.target.files || e.target.files.length === 0) return;

        setProcessing(true);
        try {
            const files = Array.from(e.target.files) as File[];
            let allResults: any[] = [];

            for (const file of files) {
                const data = await readExcel(file);
                if (type === 'main') {
                    const results = await extractMainData(data);
                    allResults = [...allResults, ...results];
                } else {
                    const result = await extractDriverData(data, file.name);
                    if (result) allResults.push(result);
                }
            }

            setExtractedData(prev => {
                const updatedData = [...prev];

                allResults.forEach(newItem => {
                    if (type === 'driver') {
                        // Try to find a 'Principal' entry for the same driver
                        const existingIndex = updatedData.findIndex(item =>
                            item.type === 'Principal' && isNameMatch(item.driver_name, newItem.driver_name)
                        );

                        if (existingIndex !== -1) {
                            // Merge driver data into the main report entry
                            updatedData[existingIndex] = {
                                ...updatedData[existingIndex],
                                origin: newItem.origin,
                                destination: newItem.destination,
                                visitedCities: newItem.visitedCities,
                                total_pontos: newItem.total_pontos,
                                additional_cities: newItem.additional_cities,
                                route_id: newItem.route_id,
                                hasDriverData: true,
                                fileName: newItem.fileName // Keep track of the source file
                            };
                        } else {
                            // If no main report found, add as a new driver report entry
                            updatedData.unshift(newItem);
                        }
                    } else {
                        // For main reports, check if a driver report already exists for this driver
                        const existingDriverIndex = updatedData.findIndex(item =>
                            item.type === 'Motorista' && isNameMatch(item.driver_name, newItem.driver_name)
                        );

                        if (existingDriverIndex !== -1) {
                            // Merge main data into the existing driver report entry and upgrade it to 'Principal'
                            updatedData[existingDriverIndex] = {
                                ...newItem,
                                origin: updatedData[existingDriverIndex].origin,
                                destination: updatedData[existingDriverIndex].destination,
                                visitedCities: updatedData[existingDriverIndex].visitedCities,
                                total_pontos: updatedData[existingDriverIndex].total_pontos,
                                additional_cities: updatedData[existingDriverIndex].additional_cities,
                                route_id: updatedData[existingDriverIndex].route_id,
                                hasDriverData: true,
                                fileName: updatedData[existingDriverIndex].fileName
                            };
                        } else {
                            // Avoid duplicate manifestos
                            const isDuplicate = updatedData.some(item => item.manifesto === newItem.manifesto);
                            if (!isDuplicate) {
                                updatedData.unshift(newItem);
                            }
                        }
                    }
                });

                return updatedData;
            });
            toast.success('Dados extraídos com sucesso! Confira na lista abaixo.');
        } catch (error: any) {
            console.error('Error processing file:', error);
            toast.error(`Erro ao processar: ${error.message || 'Erro desconhecido'}`);
        } finally {
            setProcessing(false);
            e.target.value = ''; // Reset input
        }
    };

    const extractMainData = async (data: any[]) => {
        // Group by 'Número' (Manifesto) to avoid duplicates if the same manifesto appears in multiple rows
        const manifestosMap = new Map();

        data.forEach(row => {
            const manifesto = row['Número']?.toString() || '';
            if (!manifesto) return;

            if (!manifestosMap.has(manifesto)) {
                const driverName = row['Motorista'] || '';
                let reportDate = null;

                const rawDate = row['Data'];
                if (rawDate) {
                    if (typeof rawDate === 'number') {
                        const date = new Date((rawDate - 25569) * 86400 * 1000);
                        reportDate = date.toISOString().split('T')[0];
                    } else if (typeof rawDate === 'string') {
                        const parts = rawDate.split('/');
                        if (parts.length === 3) {
                            reportDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                        } else {
                            const d = new Date(rawDate);
                            if (!isNaN(d.getTime())) reportDate = d.toISOString().split('T')[0];
                        }
                    }
                }

                const driver = drivers.find(d => isNameMatch(d.name, driverName));

                manifestosMap.set(manifesto, {
                    manifesto,
                    freight_date: reportDate,
                    driver_id: driver?.id || '',
                    driver_name: driverName,
                    origin: '',
                    destination: '',
                    visitedCities: [],
                    total_pontos: 0,
                    additional_cities: [],
                    type: 'Principal'
                });
            }
        });

        return Array.from(manifestosMap.values());
    };

    const extractDriverData = async (data: any[], fileName: string) => {
        if (data.length === 0) return null;

        let visitedCities: string[] = [];
        let uniqueAddresses = new Set<string>();
        let driverNameFromReport = '';

        data.forEach(row => {
            const city = row['Cidade'];
            const address = row['Endereco'];
            if (city && !visitedCities.includes(city)) visitedCities.push(city);
            if (address) uniqueAddresses.add(address.trim().toLowerCase());

            // Try to find driver name in the report rows
            if (!driverNameFromReport) {
                driverNameFromReport = row['Motorista'] || row['Nome'] || row['NOME'] || '';
            }
        });

        const origin = visitedCities[0] || '';
        const destination = visitedCities[visitedCities.length - 1] || '';
        const total_pontos = uniqueAddresses.size;

        // Try to find route to identify additional cities
        const route = routes.find(r =>
            r.origin.toLowerCase() === origin.toLowerCase() &&
            r.destination.toLowerCase() === destination.toLowerCase()
        );

        const routeCities = route?.cities?.map((c: any) => c.name.toLowerCase()) || [];
        const additionalCitiesNames = visitedCities.filter(city =>
            !routeCities.includes(city.toLowerCase()) &&
            city.toLowerCase() !== origin.toLowerCase() &&
            city.toLowerCase() !== destination.toLowerCase()
        );

        const additional_cities = additionalCitiesNames.map(name => ({ name }));

        const driver = drivers.find(d => isNameMatch(d.name, driverNameFromReport || fileName));

        return {
            manifesto: '', // Driver report doesn't have manifesto
            driver_id: driver?.id || '',
            driver_name: driverNameFromReport || fileName.replace(/\.[^/.]+$/, ""),
            origin,
            destination,
            visitedCities,
            total_pontos,
            additional_cities,
            route_id: route?.id || '',
            type: 'Motorista',
            fileName
        };
    };

    const handleLaunch = (item: any) => {
        setSelectedFreight(item);
        setIsModalOpen(true);
    };

    const readExcel = async (file: File): Promise<any[]> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target?.result as ArrayBuffer);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(firstSheet);
                    resolve(jsonData);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold">Lançamento de Relatórios</h2>
                    <p className="text-sm text-text-secondary mt-1">
                        Extraia os dados dos arquivos e complete o lançamento manualmente.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-surface-dark p-6 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">description</span>
                        1. Relatório Principal (Geral)
                    </h3>
                    <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={(e) => handleFileUpload(e, 'main')}
                        className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                    />
                    <p className="text-[10px] text-text-secondary mt-2">Extrai Manifestos, Motoristas e Datas.</p>
                </div>

                <div className="bg-white dark:bg-surface-dark p-6 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-success">person</span>
                        2. Relatórios dos Motoristas (Individual)
                    </h3>
                    <input
                        type="file"
                        accept=".xlsx,.xls"
                        multiple
                        onChange={(e) => handleFileUpload(e, 'driver')}
                        className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-success/10 file:text-success hover:file:bg-success/20"
                    />
                    <p className="text-[10px] text-text-secondary mt-2">Extrai Cidades, Pontos e Origem/Destino.</p>
                </div>
            </div>

            {processing && (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    <span className="ml-3 text-text-secondary">Extraindo dados...</span>
                </div>
            )}

            {extractedData.length > 0 && (
                <div className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg">Dados Extraídos (Aguardando Conferência)</h3>
                        <button
                            onClick={() => setExtractedData([])}
                            className="text-xs text-danger hover:underline"
                        >
                            Limpar Lista
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800">
                                    <th className="text-left p-3 font-semibold text-text-secondary">Origem</th>
                                    <th className="text-left p-3 font-semibold text-text-secondary">Manifesto</th>
                                    <th className="text-left p-3 font-semibold text-text-secondary">Motorista</th>
                                    <th className="text-left p-3 font-semibold text-text-secondary">Cidades / Pontos</th>
                                    <th className="text-center p-3 font-semibold text-text-secondary">Ação</th>
                                </tr>
                            </thead>
                            <tbody>
                                {extractedData.map((item, i) => (
                                    <tr key={i} className="border-b border-slate-50 dark:border-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                                        <td className="p-3">
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${item.type === 'Principal' ? 'bg-primary/10 text-primary' : 'bg-success/10 text-success'
                                                }`}>
                                                {item.type}
                                            </span>
                                            {item.hasDriverData && (
                                                <span className="ml-1 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-success text-white">
                                                    + Dados Motorista
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-3 font-bold">{item.manifesto || <span className="text-text-secondary italic text-[10px]">Preencher no form</span>}</td>
                                        <td className="p-3">{item.driver_name || '-'}</td>
                                        <td className="p-3">
                                            <div className="text-xs">
                                                <p>{item.origin} {item.destination ? `→ ${item.destination}` : ''}</p>
                                                <p className="text-text-secondary">
                                                    {item.total_pontos} pontos | {item.additional_cities?.length || 0} cidades adic.
                                                </p>
                                            </div>
                                        </td>
                                        <td className="p-3 text-center flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleLaunch(item)}
                                                className="bg-primary text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-primary/90 transition-all shadow-sm active:scale-95 flex items-center gap-1"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">edit_note</span>
                                                Conferir e Lançar
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (window.confirm('Remover este item da lista?')) {
                                                        setExtractedData(prev => prev.filter((_, index) => index !== i));
                                                    }
                                                }}
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-danger hover:bg-danger/10 transition-all"
                                                title="Remover"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <NewFreightModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    setExtractedData(prev => prev.filter(item =>
                        (item.manifesto && item.manifesto !== selectedFreight?.manifesto) ||
                        (item.fileName && item.fileName !== selectedFreight?.fileName)
                    ));
                    setIsModalOpen(false);
                }}
                initialData={selectedFreight}
            />
        </div>
    );
};
