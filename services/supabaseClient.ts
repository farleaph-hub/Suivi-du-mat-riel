import { createClient, SupabaseClient } from '@supabase/supabase-js';

// VEUILLEZ REMPLACER LES VALEURS CI-DESSOUS PAR VOS PROPRES CLÉS SUPABASE
// Vous pouvez trouver ces informations dans le tableau de bord de votre projet Supabase,
// sous Paramètres > API.
const supabaseUrl: string = 'https://vpygxdazngmbyecxfxsz.supabase.co';
const supabaseAnonKey: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZweWd4ZGF6bmdtYnllY3hmeHN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NjQ0MDQsImV4cCI6MjA3NjA0MDQwNH0.rtuHf6xjItMjhb2E-9J2rIX_C8HKHwnqRFQxBQ7Lnl0';

// Affiche un avertissement dans la console si les clés par défaut sont utilisées.
if (supabaseUrl.includes('vpygxdazngmbyecxfxsz')) {
  console.warn(
    "ATTENTION : Vous utilisez les clés Supabase par défaut. L'application risque de ne pas fonctionner. Veuillez les remplacer dans le fichier `services/supabaseClient.ts`."
  );
}

let supabaseInstance: SupabaseClient;

// Nous exportons une fonction qui renvoie l'instance du client.
// Cela garantit que createClient n'est appelé que lorsque le client est nécessaire pour la première fois,
// et non pendant le chargement initial du script.
export const getSupabase = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
};
