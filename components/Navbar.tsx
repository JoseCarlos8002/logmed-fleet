import React from 'react';

interface Profile {
  id: string;
  full_name: string;
  avatar_url: string;
  role: 'admin' | 'manager' | 'driver' | 'user';
}

interface NavbarProps {
  onMenuClick?: () => void;
  profile: Profile | null;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick, profile }) => {
  return (
    <header className="h-16 bg-surface-light dark:bg-surface-dark border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6 lg:px-8 z-10 shrink-0">
      <div className="flex items-center gap-4">
        <button
          className="md:hidden text-text-secondary"
          onClick={onMenuClick}
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <h2 className="text-xl font-bold">Operação Logmed RP</h2>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <span className="material-symbols-outlined text-[18px]">search</span>
          </span>
          <input
            className="pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-gray-50 dark:bg-gray-800 text-text-main dark:text-white focus:ring-2 focus:ring-primary w-64 transition-all"
            placeholder="Pesquisar placa, motorista ou nota..."
            type="text"
          />
        </div>
        <div className="flex items-center gap-2 border-l pl-4 border-slate-200 dark:border-slate-700">
          <span className="material-symbols-outlined text-text-secondary cursor-pointer hover:text-primary transition-colors">notifications</span>
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.full_name} className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-text-secondary">
              {profile?.full_name ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'U'}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
