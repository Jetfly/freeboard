'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DebugAuthPage() {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      addLog('🔍 Vérification de la session...');
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        addLog(`❌ Erreur session: ${error.message}`);
      } else {
        addLog(`✅ Session récupérée: ${session ? 'Connecté' : 'Non connecté'}`);
        setSession(session);
        setUser(session?.user || null);
      }
    } catch (err) {
      addLog(`❌ Erreur catch: ${(err as Error).message}`);
    }
  };

  const testLogin = async () => {
    setLoading(true);
    try {
      addLog('🔄 Test de connexion...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'testpassword',
      });
      
      if (error) {
        addLog(`❌ Erreur connexion: ${error.message}`);
      } else {
        addLog(`✅ Connexion réussie!`);
        addLog(`User ID: ${data.user?.id}`);
        addLog(`Email: ${data.user?.email}`);
        addLog(`Session: ${data.session ? 'Présente' : 'Absente'}`);
        
        setSession(data.session);
        setUser(data.user);
        
        // Test de redirection manuelle
        addLog('🔄 Test de redirection vers dashboard...');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      }
    } catch (err) {
      addLog(`❌ Erreur catch: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const testLogout = async () => {
    try {
      addLog('🔄 Test de déconnexion...');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        addLog(`❌ Erreur déconnexion: ${error.message}`);
      } else {
        addLog('✅ Déconnexion réussie!');
        setSession(null);
        setUser(null);
      }
    } catch (err) {
      addLog(`❌ Erreur catch: ${(err as Error).message}`);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🔧 Debug Authentification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button onClick={checkSession} variant="outline">
                🔍 Vérifier Session
              </Button>
              <Button onClick={testLogin} disabled={loading}>
                {loading ? '⏳' : '🔑'} Test Connexion
              </Button>
              <Button onClick={testLogout} variant="destructive">
                🚪 Test Déconnexion
              </Button>
            </div>
            
            <Button onClick={clearLogs} variant="ghost" size="sm">
              🗑️ Effacer logs
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📊 État Actuel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Session:</strong> {session ? '✅ Présente' : '❌ Absente'}</p>
              <p><strong>Utilisateur:</strong> {user ? `✅ ${user.email}` : '❌ Aucun'}</p>
              <p><strong>User ID:</strong> {user?.id || 'N/A'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📝 Logs de Debug</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-green-400 p-4 rounded-md font-mono text-sm max-h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <p>Aucun log pour le moment...</p>
              ) : (
                logs.map((log, index) => (
                  <div key={index}>{log}</div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}