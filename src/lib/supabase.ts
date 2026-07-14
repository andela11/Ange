import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check .env for VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export interface Profile {
  id: string;
  name: string;
  role: 'user' | 'admin';
  created_at: string;
}

export interface Evenement {
  id: string;
  titre: string;
  description: string;
  date_evenement: string;
  lieu: string;
  image_url: string | null;
  created_at: string;
}

export interface Autorite {
  id: string;
  nom: string;
  titre: string;
  type: 'traditional' | 'administrative';
  photo: string;
  description: string;
  ordre_affichage: number;
  created_at: string;
}

export interface GalerieItem {
  id: string;
  titre: string;
  photo: string;
  date_evenement: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  titre: string;
  message: string;
  status: 'unread' | 'read';
  created_at: string;
}
