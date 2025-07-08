'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestAuthPage() {
  const [status, setStatus] = useState('Vérification...');
  const [session, setSession] = useState<any>(null);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    testSupabaseConnection();
  }, []);

  const testSupabaseConnection = async () => {
    try {
      addResult('🔍 Test de connexion Supabase...');
      
      // Test 1: Vérifier les variables d'environnement
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!url || !key) {
        addResult('❌ Variables d\'environnement manquantes');
        setStatus('Erreur de configuration');
        return;
      }
      
      addResult('✅ Variables d\'environnement OK');
      addResult(`📍 URL: ${url}`);
      
      // Test 2: Vérifier la session actuelle
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        addResult(`❌ Erreur session: ${sessionError.message}`);
      } else {
        addResult('✅ Récupération session OK');
        setSession(sessionData.session);
        
        if (sessionData.session) {
          addResult(`👤 Utilisateur connecté: ${sessionData.session.user.email}`);
        } else {
          addResult('👤 Aucun utilisateur connecté');
        }
      }
      
      // Test 3: Test de connexion simple
      addResult('🔐 Test de connexion avec email/mot de passe...');
      
      setStatus('Tests terminés');
      
    } catch (error) {
      addResult(`❌ Erreur générale: ${error}`);
      setStatus('Erreur');
    }
  };

  const testLogin = async () => {
    const testEmail = 'test@example.com';
    const testPassword = 'testpassword';
    
    addResult(`🔐 Tentative de connexion avec ${testEmail}...`);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });
      
      if (error) {
        addResult(`❌ Erreur de connexion: ${error.message}`);
      } else {
        addResult('✅ Connexion réussie!');
        addResult(`👤 Utilisateur: ${data.user?.email}`);
        setSession(data.session);
      }
    } catch (error) {
      addResult(`❌ Erreur catch: ${error}`);
    }
  };

  const testLogout = async () => {
    addResult('🚪 Tentative de déconnexion...');
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        addResult(`❌ Erreur de déconnexion: ${error.message}`);
      } else {
        addResult('✅ Déconnexion réussie!');
        setSession(null);
      }
    } catch (error) {
      addResult(`❌ Erreur catch: ${error}`);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🧪 Test d'Authentification Supabase</CardTitle>
            <p className="text-gray-600">Diagnostic de la connexion et de l'authentification</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <strong>Statut:</strong> {status}
              </div>
              
              <div>
                <strong>Session actuelle:</strong> {session ? '✅ Connecté' : '❌ Non connecté'}
                {session && (
                  <div className="ml-4 text-sm text-gray-600">
                    Email: {session.user?.email}<br/>
                    ID: {session.user?.id}
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button onClick={testSupabaseConnection} variant="outline">
                  🔄 Re-tester la connexion
                </Button>
                <Button onClick={testLogin} variant="outline">
                  🔐 Test Login
                </Button>
                <Button onClick={testLogout} variant="outline">
                  🚪 Test Logout
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>📋 Logs de Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
              {testResults.map((result, index) => (
                <div key={index}>{result}</div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}