'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const createTestUser = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('🔄 Début création/connexion utilisateur test...');
      
      // Essayer de se connecter directement d'abord
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'testpassword',
      });
      
      if (loginData.user && !loginError) {
        console.log('✅ Connexion directe réussie!');
        console.log('Session:', loginData.session);
        console.log('🔄 Redirection vers dashboard...');
        window.location.href = '/dashboard';
        return;
      }
      
      console.log('❌ Connexion directe échouée, création du compte...');
      
      // Si la connexion échoue, créer l'utilisateur
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email: 'test@example.com',
        password: 'testpassword',
      });
      
      if (signupError) {
        console.error('❌ Erreur création:', signupError);
        if (!signupError.message.includes('already registered')) {
          setError('Erreur: ' + signupError.message);
          setLoading(false);
          return;
        }
      }
      
      console.log('✅ Compte créé, tentative de connexion...');
      
      // Essayer de se connecter après création
      const { data: finalLoginData, error: finalLoginError } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'testpassword',
      });
      
      if (finalLoginError) {
        console.error('❌ Erreur connexion finale:', finalLoginError);
        setError('Erreur connexion: ' + finalLoginError.message);
      } else if (finalLoginData.user) {
        console.log('✅ Connexion finale réussie!');
        console.log('Session:', finalLoginData.session);
        console.log('🔄 Redirection vers dashboard...');
        window.location.href = '/dashboard';
      }
      
    } catch (err) {
      console.error('❌ Erreur catch:', err);
      setError('Une erreur est survenue: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Tentative de connexion avec:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('Réponse de connexion:', { data, error });

      if (error) {
        console.error('Erreur de connexion:', error);
        setError(error.message);
      } else if (data.user) {
        console.log('Connexion réussie, redirection vers dashboard...');
        // Forcer le rechargement complet de la page pour que le middleware détecte la session
        window.location.href = '/dashboard';
      }
    } catch (err) {
      console.error('Erreur catch:', err);
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Connexion</CardTitle>
          <p className="text-center text-gray-600">Accédez à votre tableau de bord FreeBoard</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="votre@email.com"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </Button>
          </form>
          
          <div className="mt-4 space-y-3">
            <Button 
              onClick={createTestUser} 
              variant="outline" 
              className="w-full" 
              disabled={loading}
              type="button"
            >
              {loading ? 'Création en cours...' : '🧪 Créer et se connecter avec test@example.com'}
            </Button>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Pas encore de compte ?{' '}
                <Link href="/signup" className="text-blue-600 hover:underline">
                  S'inscrire
                </Link>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}