import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import Dashboard from './views/Dashboard';
import { Fleet } from './views/Fleet';
import { Drivers } from './views/Drivers';
import { Freight } from './views/Freight';
import { Cities } from './views/Cities';
import { Tasks } from './views/Tasks';
import { Financial } from './views/Financial';
import { Routes as RoutesView } from './views/Routes';
import { Calendar } from './views/Calendar';
import { UserManagement } from './views/UserManagement';
import { Profile as ProfileView } from './views/Profile';
import { Closures } from './views/Closures';
import { ImportReports } from './views/ImportReports';
import { Login } from './views/Login';
import { Toaster } from 'react-hot-toast';
import { supabase } from './services/supabase';
import { Session } from '@supabase/supabase-js';

interface Profile {
  id: string;
  full_name: string;
  avatar_url: string;
  role: 'admin' | 'manager' | 'driver' | 'user';
}

const Layout: React.FC<{ children: React.ReactNode; profile: Profile | null }> = ({ children, profile }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark">
      <Sidebar profile={profile} />
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Navbar profile={profile} />
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 no-scrollbar">
          <div className="w-full mx-auto pb-10">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!error && data) {
      setProfile(data);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    }).catch(err => {
      console.error("Failed to get session:", err);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-background-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route
          path="/login"
          element={!session ? <Login /> : <Navigate to="/dashboard" replace />}
        />

        <Route
          path="/dashboard"
          element={session ? <Layout profile={profile}><Dashboard /></Layout> : <Navigate to="/login" replace />}
        />
        <Route
          path="/frota"
          element={session ? <Layout profile={profile}><Fleet /></Layout> : <Navigate to="/login" replace />}
        />
        <Route
          path="/motoristas"
          element={session ? <Layout profile={profile}><Drivers /></Layout> : <Navigate to="/login" replace />}
        />
        <Route
          path="/fretes"
          element={session ? <Layout profile={profile}><Freight /></Layout> : <Navigate to="/login" replace />}
        />
        <Route
          path="/cidades"
          element={session ? <Layout profile={profile}><Cities /></Layout> : <Navigate to="/login" replace />}
        />
        <Route
          path="/tarefas"
          element={session ? <Layout profile={profile}><Tasks /></Layout> : <Navigate to="/login" replace />}
        />
        <Route
          path="/financeiro"
          element={session ? <Layout profile={profile}><Financial /></Layout> : <Navigate to="/login" replace />}
        />
        <Route
          path="/rotas"
          element={session ? <Layout profile={profile}><RoutesView /></Layout> : <Navigate to="/login" replace />}
        />
        <Route
          path="/agenda"
          element={session ? <Layout profile={profile}><Calendar /></Layout> : <Navigate to="/login" replace />}
        />
        <Route
          path="/usuarios"
          element={session && profile?.role === 'admin' ? <Layout profile={profile}><UserManagement /></Layout> : <Navigate to="/login" replace />}
        />
        <Route
          path="/fechamentos"
          element={session ? <Layout profile={profile}><Closures /></Layout> : <Navigate to="/login" replace />}
        />
        <Route
          path="/importar"
          element={session ? <Layout profile={profile}><ImportReports /></Layout> : <Navigate to="/login" replace />}
        />

        <Route
          path="/perfil"
          element={session ? <Layout profile={profile}><ProfileView profile={profile} /></Layout> : <Navigate to="/login" replace />}
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

export default App;

