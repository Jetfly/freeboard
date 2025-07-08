import { createClient } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ✅ CLIENT POUR COMPOSANTS - Gère automatiquement les cookies
export const supabase = createClientComponentClient();

// ✅ CLIENT BASIQUE - Pour les cas où on a besoin du client standard
export const supabaseBasic = createClient(supabaseUrl, supabaseAnonKey);

// ✅ FONCTION UTILITAIRE - Pattern sécurisé pour getUser()
export const getAuthenticatedUser = async () => {
  try {
    // Vérifier d'abord si une session existe
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (!session || sessionError) {
      return { user: null, error: sessionError || 'No session' }
    }
    
    // Seulement si session existe, appeler getUser()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    return { user, error: userError }
  } catch (error) {
    console.error('Auth error:', error)
    return { user: null, error }
  }
}

// Types pour la base de données
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          first_name: string | null;
          last_name: string | null;
          business_name: string | null;
          legal_status: 'micro' | 'eirl' | 'eurl' | 'sasu' | null;
          vat_number: string | null;
          siret: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          first_name?: string | null;
          last_name?: string | null;
          business_name?: string | null;
          legal_status?: 'micro' | 'eirl' | 'eurl' | 'sasu' | null;
          vat_number?: string | null;
          siret?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string | null;
          last_name?: string | null;
          business_name?: string | null;
          legal_status?: 'micro' | 'eirl' | 'eurl' | 'sasu' | null;
          vat_number?: string | null;
          siret?: string | null;
          created_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          amount_ht: number | null;
          vat_amount: number | null;
          vat_rate: number;
          type: 'income' | 'expense';
          category: string;
          description: string;
          date: string;
          client_name: string | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          amount_ht?: number | null;
          vat_amount?: number | null;
          vat_rate?: number;
          type: 'income' | 'expense';
          category: string;
          description: string;
          date: string;
          client_name?: string | null;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          amount_ht?: number | null;
          vat_amount?: number | null;
          vat_rate?: number;
          type?: 'income' | 'expense';
          category?: string;
          description?: string;
          date?: string;
          client_name?: string | null;
          status?: string;
          created_at?: string;
        };
      };
      financial_goals: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          target_amount: number;
          current_amount: number;
          deadline: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          target_amount: number;
          current_amount?: number;
          deadline?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          target_amount?: number;
          current_amount?: number;
          deadline?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];