import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

interface Profile {
    id: string;
    full_name: string;
    avatar_url: string;
    role: 'admin' | 'manager' | 'driver' | 'user';
    updated_at: string;
}

export const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);

    const fetchUsers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('full_name', { ascending: true });

        if (!error && data) {
            setUsers(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleChange = async (userId: string, newRole: Profile['role']) => {
        setUpdating(userId);
        const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId);

        if (!error) {
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } else {
            alert('Erro ao atualizar cargo.');
        }
        setUpdating(null);
    };

    const handleNameChange = async (userId: string, newName: string) => {
        const { error } = await supabase
            .from('profiles')
            .update({ full_name: newName })
            .eq('id', userId);

        if (error) {
            alert('Erro ao atualizar nome.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Gestão de Usuários</h2>
            </div>

            <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : users.length === 0 ? (
                    <div className="p-12 text-center">
                        <span className="material-symbols-outlined text-6xl text-slate-200 dark:text-slate-700 mb-4">group</span>
                        <p className="text-text-secondary">Nenhum usuário encontrado.</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                                <th className="px-6 py-4 text-xs font-bold uppercase text-text-secondary tracking-wider">Usuário</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase text-text-secondary tracking-wider">Cargo Atual</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase text-text-secondary tracking-wider">Alterar Cargo</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase text-text-secondary tracking-wider">Última Atualização</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {users.map((u) => (
                                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {u.avatar_url ? (
                                                <img src={u.avatar_url} alt={u.full_name} className="h-8 w-8 rounded-full object-cover" />
                                            ) : (
                                                <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                                                    {u.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'U'}
                                                </div>
                                            )}
                                            <input
                                                type="text"
                                                className="font-semibold text-sm bg-transparent border-b border-transparent hover:border-slate-200 focus:border-primary outline-none transition-all"
                                                value={u.full_name}
                                                onChange={(e) => {
                                                    const newName = e.target.value;
                                                    setUsers(users.map(user => user.id === u.id ? { ...user, full_name: newName } : user));
                                                }}
                                                onBlur={(e) => handleNameChange(u.id, e.target.value)}
                                            />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] font-extrabold uppercase px-2 py-1 rounded-full ${u.role === 'admin' ? 'bg-danger/10 text-danger' :
                                                u.role === 'manager' ? 'bg-primary/10 text-primary' :
                                                    u.role === 'driver' ? 'bg-success/10 text-success' : 'bg-slate-100 text-slate-500'
                                            }`}>
                                            {u.role === 'admin' ? 'Administrador' : u.role === 'manager' ? 'Gerente' : u.role === 'driver' ? 'Motorista' : 'Usuário'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <select
                                            disabled={updating === u.id}
                                            className="text-sm bg-transparent border border-slate-200 dark:border-slate-700 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-primary"
                                            value={u.role}
                                            onChange={(e) => handleRoleChange(u.id, e.target.value as any)}
                                        >
                                            <option value="admin">Administrador</option>
                                            <option value="manager">Gerente</option>
                                            <option value="driver">Motorista</option>
                                            <option value="user">Usuário</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-text-secondary">
                                        {u.updated_at ? new Date(u.updated_at).toLocaleString('pt-BR') : 'Nunca'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};
