// Fix: Removed circular import of 'User' from the same file.
export interface User {
  name: string;
  role: 'admin' | 'user';
}

export type Page = 'materiel' | 'qui-est-ou' | 'scanner';

export interface Employe {
  id: string;
  nom: string;
  created_at?: string;
}

export interface Chantier {
  id: string;
  nom: string;
  adresse?: string | null;
  created_at?: string;
}

export interface Affectation {
  id?: number;
  chantier_id: string;
  employe_id: string;
}

export interface Materiel {
  id: string;
  created_at?: string;
  nom: string;
  statut: 'disponible' | 'emprunté' | 'maintenance';
  dernierEmprunteur?: string | null;
  employe_id?: string | null;
  commentaire?: string | null;
  date_achat?: string | null; // ISO date string
  photo_materiel_url?: string | null;
  photo_facture_url?: string | null;
  qr_code_url?: string | null;
  numero_serie?: string | null;
}