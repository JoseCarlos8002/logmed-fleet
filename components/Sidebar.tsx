
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { supabase } from '../services/supabase';

interface MenuItem {
  path?: string;
  label: string;
  icon: string;
  children?: MenuItem[];
}

const menuStructure: MenuItem[] = [
  { path: '/dashboard', label: 'Painel', icon: 'dashboard' },
  { path: '/frota', label: 'Frota', icon: 'directions_car' },
  {
    label: 'Lançamentos',
    icon: 'local_shipping',
    children: [
      { path: '/fretes', label: 'Fretes', icon: 'local_shipping' },
      { path: '/importar', label: 'Importar', icon: 'upload_file' },
    ]
  },
  {
    label: 'Cadastros',
    icon: 'folder',
    children: [
      { path: '/motoristas', label: 'Motoristas', icon: 'badge' },
      { path: '/rotas', label: 'Rotas', icon: 'route' },
      { path: '/cidades', label: 'Cidades', icon: 'location_city' },
      { path: '/usuarios', label: 'Usuários', icon: 'group' },
    ]
  },
  { path: '/agenda', label: 'Agenda', icon: 'calendar_month' },
  { path: '/tarefas', label: 'Tarefas', icon: 'check_circle' },
  {
    label: 'Financeiro',
    icon: 'attach_money',
    children: [
      { path: '/financeiro', label: 'Financeiro', icon: 'attach_money' },
      { path: '/fechamentos', label: 'Fechamentos', icon: 'history' },
    ]
  },
];

interface Profile {
  id: string;
  full_name: string;
  avatar_url: string;
  role: 'admin' | 'manager' | 'driver' | 'user';
}

interface SidebarProps {
  profile: Profile | null;
}

const MenuItemComponent: React.FC<{
  item: MenuItem;
  profile: Profile | null;
  expandedMenus: Set<string>;
  toggleMenu: (label: string) => void;
}> = ({ item, profile, expandedMenus, toggleMenu }) => {
  const location = useLocation();

  // Filter children based on role
  const filterByRole = (menuItem: MenuItem): boolean => {
    if (profile?.role === 'admin') return true;
    if (profile?.role === 'manager') {
      if (menuItem.path === '/usuarios') return false;
      return true;
    }
    if (menuItem.path === '/financeiro' || menuItem.path === '/fechamentos' || menuItem.path === '/usuarios') {
      return false;
    }
    return true;
  };

  // Check if this menu item or any of its children should be visible
  const isVisible = (): boolean => {
    if (item.path) {
      return filterByRole(item);
    }
    if (item.children) {
      return item.children.some(child => filterByRole(child));
    }
    return true;
  };

  if (!isVisible()) return null;

  const filteredChildren = item.children?.filter(filterByRole) || [];
  const hasChildren = filteredChildren.length > 0;
  const isExpanded = expandedMenus.has(item.label);

  // Check if any child is active
  const isChildActive = filteredChildren.some(child => child.path === location.pathname);

  // If this is a parent menu item (has children)
  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => toggleMenu(item.label)}
          className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-colors ${isChildActive
            ? 'bg-primary/10 text-primary border border-primary/20'
            : 'hover:bg-gray-800 hover:text-white'
            }`}
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            <span className="text-sm font-medium">{item.label}</span>
          </div>
          <span
            className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''
              }`}
          >
            expand_more
          </span>
        </button>

        {/* Submenu items */}
        <div
          className={`overflow-hidden transition-all duration-200 ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
        >
          <div className="pl-4 mt-1 space-y-1">
            {filteredChildren.map((child) => (
              <NavLink
                key={child.path}
                to={child.path!}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'hover:bg-gray-800 hover:text-white'
                  }`
                }
              >
                <span className="material-symbols-outlined text-[18px]">{child.icon}</span>
                <span className="text-sm font-medium">{child.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // If this is a regular menu item (no children)
  return (
    <NavLink
      to={item.path!}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive
          ? 'bg-primary/10 text-primary border border-primary/20'
          : 'hover:bg-gray-800 hover:text-white'
        }`
      }
    >
      <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
      <span className="text-sm font-medium">{item.label}</span>
    </NavLink>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ profile }) => {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const toggleMenu = (label: string) => {
    setExpandedMenus(prev => {
      const newSet = new Set(prev);
      if (newSet.has(label)) {
        newSet.delete(label);
      } else {
        newSet.add(label);
      }
      return newSet;
    });
  };

  // Auto-expand menu when a child route is active
  useEffect(() => {
    menuStructure.forEach(item => {
      if (item.children) {
        const hasActiveChild = item.children.some(child => child.path === location.pathname);
        if (hasActiveChild) {
          setExpandedMenus(prev => new Set(prev).add(item.label));
        }
      }
    });
  }, [location.pathname]);

  return (
    <aside className="w-64 bg-sidebar-dark text-slate-300 hidden md:flex flex-col flex-shrink-0 transition-all duration-300 border-r border-gray-800">
      <div className="h-16 flex items-center px-6 border-b border-gray-800 bg-[#1E3A8A]">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-white text-[24px]">local_hospital</span>
          <h1 className="font-bold text-white text-lg tracking-tight">Logmed RP</h1>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 no-scrollbar">
        {menuStructure.map((item, index) => (
          <MenuItemComponent
            key={item.path || item.label + index}
            item={item}
            profile={profile}
            expandedMenus={expandedMenus}
            toggleMenu={toggleMenu}
          />
        ))}
      </nav>

      <div className="p-3 border-t border-gray-800">
        <div className="flex items-center justify-between gap-2">
          <NavLink
            to="/perfil"
            className={({ isActive }) =>
              `flex-1 flex items-center gap-2 p-1.5 rounded-lg transition-all ${isActive ? 'bg-primary/10 border border-primary/20' : 'hover:bg-gray-800'
              }`
            }
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name} className="h-7 w-7 rounded-full object-cover" />
            ) : (
              <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-white font-bold text-[10px]">
                {profile?.full_name ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'U'}
              </div>
            )}
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-semibold text-white truncate max-w-[100px]">
                {profile?.full_name || 'Carregando...'}
              </span>
              <span className="text-[10px] text-gray-500 truncate">
                {profile?.role === 'admin' ? 'Administrador' : profile?.role === 'manager' ? 'Gerente' : profile?.role === 'driver' ? 'Motorista' : 'Usuário'}
              </span>
            </div>
          </NavLink>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-danger transition-all flex-shrink-0"
            title="Sair"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
