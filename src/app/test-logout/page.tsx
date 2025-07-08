'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function TestLogoutPage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    getUser();
  }, [supabase]);

  const handleLogout = async () => {
    setIsLoading(true);
    console.log('🔄 [TEST] Début de la déconnexion...');
    
    try {
      // Étape 1: Déconnexion Supabase
      console.log('🔄 [TEST] Étape 1: Déconnexion Supabase...');
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        console.error('❌ [TEST] Erreur Supabase:', error);
      } else {
        console.log('✅ [TEST] Déconnexion Supabase réussie');
      }
      
      // Étape 2: Vérification de la session
      console.log('🔄 [TEST] Étape 2: Vérification de la session...');
      const { data: { session } } = await supabase.auth.getSession();
      console.log('🔍 [TEST] Session après signOut:', session ? 'ENCORE ACTIVE' : 'SUPPRIMÉE');
      
      // Étape 3: Nettoyage manuel
      console.log('🔄 [TEST] Étape 3: Nettoyage manuel...');
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
        
        // Supprimer les cookies Supabase
        const cookieName = 'sb-irgykbpyraczsyehrpbw-auth-token';
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
        
        console.log('✅ [TEST] Nettoyage terminé');
      }
      
      // Étape 4: Attendre et rediriger
      console.log('🔄 [TEST] Étape 4: Redirection dans 2 secondes...');
      setTimeout(() => {
        console.log('🔄 [TEST] Redirection maintenant...');
        window.location.replace('/login');
      }, 2000);
      
    } catch (error) {
      console.error('❌ [TEST] Erreur inattendue:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Test de Déconnexion</h1>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">État de la session:</h2>
          {user ? (
            <div className="bg-green-100 p-3 rounded">
              <p className="text-green-800">✅ Connecté</p>
              <p className="text-sm text-green-600">Email: {user.email}</p>
            </div>
          ) : (
            <div className="bg-red-100 p-3 rounded">
              <p className="text-red-800">❌ Non connecté</p>
            </div>
          )}
        </div>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Instructions:</h2>
          <ol className="text-sm text-gray-600 list-decimal list-inside space-y-1">
            <li>Ouvrez la console du navigateur (F12)</li>
            <li>Cliquez sur "Tester la déconnexion"</li>
            <li>Observez les logs détaillés</li>
            <li>Vérifiez la redirection vers /login</li>
          </ol>
        </div>
        
        <button
          onClick={handleLogout}
          disabled={isLoading || !user}
          className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Déconnexion en cours...' : 'Tester la déconnexion'}
        </button>
        
        <div className="mt-4 text-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Retour au Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}