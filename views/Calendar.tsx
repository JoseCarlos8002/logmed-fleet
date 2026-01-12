
import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { NewEventModal } from '../components/NewEventModal';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  color: string;
  description?: string;
}

export const Calendar: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const fetchEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .order('date', { ascending: true });

    if (!error && data) {
      setEvents(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const monthName = currentMonth.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentMonth(newDate);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Agenda de Operações</h2>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => changeMonth(-1)}
              className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            <h3 className="text-lg font-bold min-w-[150px] text-center capitalize">{monthName}</h3>
            <button
              onClick={() => changeMonth(1)}
              className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Novo Evento
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="grid grid-cols-7 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
              {weekdays.map(day => (
                <div key={day} className="px-4 py-3 text-center text-xs font-bold text-text-secondary uppercase">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 min-h-[500px]">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="border-r border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10"></div>
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                const dayEvents = events.filter(e => e.date === dateStr);

                return (
                  <div key={day} className="min-h-[100px] p-2 border-r border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors relative">
                    <span className="text-xs font-bold text-slate-400">{day}</span>
                    <div className="mt-1 space-y-1">
                      {dayEvents.map(event => (
                        <div
                          key={event.id}
                          className="text-[9px] font-bold p-1 rounded text-white truncate cursor-pointer hover:opacity-80 transition-opacity"
                          style={{ backgroundColor: event.color }}
                          title={event.description}
                        >
                          {event.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h4 className="font-bold mb-4">Eventos do Mês</h4>
            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : events.filter(e => e.date.startsWith(`${year}-${(month + 1).toString().padStart(2, '0')}`)).length === 0 ? (
                <p className="text-xs text-text-secondary text-center">Nenhum evento este mês.</p>
              ) : (
                events
                  .filter(e => e.date.startsWith(`${year}-${(month + 1).toString().padStart(2, '0')}`))
                  .map(event => (
                    <div key={event.id} className="flex gap-3">
                      <div className="w-1 h-full rounded-full" style={{ backgroundColor: event.color }}></div>
                      <div>
                        <p className="text-xs font-bold">{event.title}</p>
                        <p className="text-[10px] text-text-secondary uppercase">{new Date(event.date).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 p-5 rounded-2xl">
            <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">info</span>
              Legenda Sugerida
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium">
                <span className="w-3 h-3 rounded-full bg-[#ef4444]"></span> Manutenção / Urgente
              </div>
              <div className="flex items-center gap-2 text-xs font-medium">
                <span className="w-3 h-3 rounded-full bg-[#f59e0b]"></span> Vistoria / Aviso
              </div>
              <div className="flex items-center gap-2 text-xs font-medium">
                <span className="w-3 h-3 rounded-full bg-[#3b82f6]"></span> Operação / Rota
              </div>
              <div className="flex items-center gap-2 text-xs font-medium">
                <span className="w-3 h-3 rounded-full bg-[#10b981]"></span> Concluído / Administrativo
              </div>
            </div>
          </div>
        </div>
      </div>

      <NewEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchEvents}
      />
    </div>
  );
};
