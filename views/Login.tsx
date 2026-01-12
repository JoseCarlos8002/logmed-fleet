import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';

export const Login: React.FC = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        if (isSignUp) {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    }
                }
            });

            if (error) {
                setError(error.message);
                setLoading(false);
            } else {
                setSuccess('Cadastro realizado com sucesso! Verifique seu e-mail para confirmar a conta.');
                setLoading(false);
            }
        } else {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setError(error.message);
                setLoading(false);
            } else {
                navigate('/dashboard');
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-background-dark p-4">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-surface-dark p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4 shadow-lg shadow-primary/20">
                        <span className="material-symbols-outlined text-white text-4xl">local_hospital</span>
                    </div>
                    <h2 className="text-3xl font-extrabold text-text-main dark:text-white tracking-tight">Logmed RP</h2>
                    <p className="mt-2 text-sm text-text-secondary">Gestão Inteligente de Frota</p>
                </div>

                <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6">
                    <button
                        onClick={() => { setIsSignUp(false); setError(null); setSuccess(null); }}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isSignUp ? 'bg-white dark:bg-surface-dark shadow-sm text-primary' : 'text-text-secondary hover:text-text-main'}`}
                    >
                        Entrar
                    </button>
                    <button
                        onClick={() => { setIsSignUp(true); setError(null); setSuccess(null); }}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isSignUp ? 'bg-white dark:bg-surface-dark shadow-sm text-primary' : 'text-text-secondary hover:text-text-main'}`}
                    >
                        Cadastrar
                    </button>
                </div>

                <form className="mt-4 space-y-6" onSubmit={handleAuth}>
                    {error && (
                        <div className="bg-danger/10 border border-danger/20 text-danger px-4 py-3 rounded-lg text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                            <span className="material-symbols-outlined text-[20px]">error</span>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-success/10 border border-success/20 text-success px-4 py-3 rounded-lg text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                            <span className="material-symbols-outlined text-[20px]">check_circle</span>
                            {success}
                        </div>
                    )}

                    <div className="space-y-4">
                        {isSignUp && (
                            <div>
                                <label className="block text-sm font-semibold text-text-main dark:text-slate-300 mb-1.5" htmlFor="fullName">
                                    Nome Completo
                                </label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                        <span className="material-symbols-outlined text-[20px]">person</span>
                                    </span>
                                    <input
                                        id="fullName"
                                        type="text"
                                        required={isSignUp}
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-text-main dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                        placeholder="Seu nome completo"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-semibold text-text-main dark:text-slate-300 mb-1.5" htmlFor="email">
                                E-mail
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                    <span className="material-symbols-outlined text-[20px]">mail</span>
                                </span>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-text-main dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                    placeholder="seu@email.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-text-main dark:text-slate-300 mb-1.5" htmlFor="password">
                                Senha
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                    <span className="material-symbols-outlined text-[20px]">lock</span>
                                </span>
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-text-main dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    </div>

                    {!isSignUp && (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded cursor-pointer"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-text-secondary cursor-pointer">
                                    Lembrar-me
                                </label>
                            </div>

                            <div className="text-sm">
                                <a href="#" className="font-semibold text-primary hover:text-primary-hover transition-colors">
                                    Esqueceu a senha?
                                </a>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all shadow-lg shadow-primary/25 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="material-symbols-outlined animate-spin">sync</span>
                        ) : (
                            isSignUp ? 'Criar Minha Conta' : 'Entrar no Sistema'
                        )}
                    </button>
                </form>

                <div className="text-center mt-6">
                    <p className="text-sm text-text-secondary">
                        {isSignUp ? 'Já tem uma conta?' : 'Não tem uma conta?'} {' '}
                        <button
                            onClick={() => { setIsSignUp(!isSignUp); setError(null); setSuccess(null); }}
                            className="font-bold text-primary hover:text-primary-hover transition-colors"
                        >
                            {isSignUp ? 'Fazer Login' : 'Solicitar acesso'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};
