import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

interface ProfileData {
    id: string;
    full_name: string;
    avatar_url: string;
    role: string;
}

export const Profile: React.FC<{ profile: ProfileData | null }> = ({ profile: initialProfile }) => {
    const [loading, setLoading] = useState(false);
    const [fullName, setFullName] = useState(initialProfile?.full_name || '');
    const [avatarUrl, setAvatarUrl] = useState(initialProfile?.avatar_url || '');
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (initialProfile) {
            setFullName(initialProfile.full_name);
            setAvatarUrl(initialProfile.avatar_url || '');
        }
    }, [initialProfile]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!initialProfile) return;

        setLoading(true);
        setMessage(null);

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: fullName,
                    avatar_url: avatarUrl,
                    updated_at: new Date().toISOString()
                })
                .eq('id', initialProfile.id);

            if (error) throw error;

            setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
            // The parent App component should ideally refresh the profile state
            // but since we're using a simple setup, a refresh might be needed or 
            // the user will see the change on next mount/refresh.
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage({ type: 'error', text: 'Erro ao atualizar perfil.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Meu Perfil</h2>
            </div>

            <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-8">
                    <div className="flex flex-col items-center mb-8">
                        <div className="relative group">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt={fullName} className="h-24 w-24 rounded-full object-cover border-4 border-primary/10" />
                            ) : (
                                <div className="h-24 w-24 rounded-full bg-primary/10 text-primary flex items-center justify-center text-3xl font-bold border-4 border-primary/10">
                                    {fullName ? fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'U'}
                                </div>
                            )}
                        </div>
                        <h3 className="mt-4 text-lg font-bold">{fullName || 'Usuário'}</h3>
                        <p className="text-sm text-text-secondary uppercase font-bold tracking-wider">
                            {initialProfile?.role === 'admin' ? 'Administrador' :
                                initialProfile?.role === 'manager' ? 'Gerente' :
                                    initialProfile?.role === 'driver' ? 'Motorista' : 'Usuário'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-text-secondary">Nome Completo</label>
                            <input
                                required
                                type="text"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="Seu nome completo"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-text-secondary">URL do Avatar (Opcional)</label>
                            <input
                                type="url"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="https://exemplo.com/foto.jpg"
                                value={avatarUrl}
                                onChange={(e) => setAvatarUrl(e.target.value)}
                            />
                        </div>

                        {message && (
                            <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-2 ${message.type === 'success' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                                }`}>
                                <span className="material-symbols-outlined text-[18px]">
                                    {message.type === 'success' ? 'check_circle' : 'error'}
                                </span>
                                {message.text}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div>
                                    Salvando...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-[20px]">save</span>
                                    Salvar Alterações
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
