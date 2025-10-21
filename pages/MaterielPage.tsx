import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, Materiel, Employe } from '../types';
import { getSupabase } from '../services/supabaseClient';
import MaterielList from '../components/MaterielList';
import MaterielFormModal from '../components/MaterielFormModal';
import MaterielDetailModal from '../components/MaterielDetailModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { PlusIcon } from '../components/icons/PlusIcon';

// Fix: Add MaterielPageProps interface definition.
interface MaterielPageProps {
  user: User;
}

const formatErrorMessage = (error: any, context: string): string => {
    let message = `Erreur lors de ${context} :\n${error.message}`;
    if (error.message.includes('violates row-level security policy')) {
        message += "\n\nCAUSE PROBABLE : Problème de permissions dans Supabase. Veuillez vérifier les politiques de sécurité (RLS) de la table ou du stockage."
    } else if (error.message.includes('storage') || error.message.includes('Invalid key')) {
         message += "\n\nCAUSE PROBABLE : Problème avec le stockage Supabase. Vérifiez que le bucket 'photos' existe, qu'il est public et que les politiques autorisent l'upload."
    }
    return message;
};

// Fonction robuste pour nettoyer les noms de fichiers
const sanitizeFileName = (filename: string): string => {
  const accents =    'ÀÁÂÃÄÅàáâãäåÒÓÔÕÕÖØòóôõöøÈÉÊËèéêëðÇçÐÌÍÎÏìíîïÙÚÛÜùúûüÑñŠšŸÿýŽž';
  const nonAccents = 'AAAAAAaaaaaaOOOOOOOooooooEEEEeeeeeCcDIIIIiiiiUUUUuuuuNnSsYyyZz';
  let sanitized = filename;

  for (let i = 0; i < accents.length; i++) {
    sanitized = sanitized.replace(new RegExp(accents[i], 'g'), nonAccents[i]);
  }
  
  // Remplace les espaces et autres caractères non valides par un tiret
  return sanitized
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-');
};

const generateUniqueQrCode = async (materielNom: string, supabase: any): Promise<string> => {
    const baseName = sanitizeFileName(materielNom.toLowerCase()).substring(0, 20);
            
    const { data: existingQRCodes, error: qrError } = await supabase
        .from('materiel')
        .select('qr_code_url')
        .like('qr_code_url', `${baseName}%`);

    if(qrError){
        throw new Error(`Erreur lors de la vérification des QR codes existants: ${qrError.message}`);
    }

    let counter = 1;
    let nextQrCode = `${baseName}_${counter}`;
    while (existingQRCodes && existingQRCodes.some(m => m.qr_code_url === nextQrCode)) {
        counter++;
        nextQrCode = `${baseName}_${counter}`;
    }
    return nextQrCode;
}


const MaterielPage: React.FC<MaterielPageProps> = ({ user }) => {
  const [materiels, setMateriels] = useState<Materiel[]>([]);
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingMateriel, setEditingMateriel] = useState<Materiel | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);


  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [viewingMateriel, setViewingMateriel] = useState<Materiel | null>(null);
  
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [deletingMateriel, setDeletingMateriel] = useState<Materiel | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  
  const supabase = getSupabase();
  const isAdmin = user.role === 'admin';

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
        const [materielRes, employesRes] = await Promise.all([
            supabase.from('materiel').select('*').order('nom', { ascending: true }),
            supabase.from('employes').select('*').order('nom', { ascending: true })
        ]);

        if (materielRes.error) throw materielRes.error;
        if (employesRes.error) throw employesRes.error;

        setMateriels(materielRes.data as Materiel[]);
        setEmployes(employesRes.data as Employe[]);
    } catch(err: any) {
         setError(formatErrorMessage(err, 'la récupération des données'));
    } finally {
        setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredMateriels = useMemo(() => {
    return materiels.filter(m =>
      m.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.dernierEmprunteur && m.dernierEmprunteur.toLowerCase().includes(searchTerm.toLowerCase())) ||
      m.statut.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [materiels, searchTerm]);

  // Modal handlers
  const handleAddMateriel = () => {
    setEditingMateriel(null);
    setSaveError(null);
    setIsFormModalOpen(true);
  };
  
  const handleEditMateriel = (materiel: Materiel) => {
    setEditingMateriel(materiel);
    setSaveError(null);
    setIsFormModalOpen(true);
  };

  const handleViewMateriel = (materiel: Materiel) => {
    setViewingMateriel(materiel);
    setIsDetailModalOpen(true);
  };

  const handleDeleteClick = (materiel: Materiel) => {
    setDeletingMateriel(materiel);
    setIsConfirmModalOpen(true);
  };
  
  const handleCloseModals = () => {
    setIsFormModalOpen(false);
    setIsDetailModalOpen(false);
    setIsConfirmModalOpen(false);
    setEditingMateriel(null);
    setViewingMateriel(null);
    setDeletingMateriel(null);
  };

  const uploadFile = async (file: File): Promise<string> => {
      const sanitizedName = sanitizeFileName(file.name);
      const fileName = `${crypto.randomUUID()}-${sanitizedName}`;
      const { error: uploadError } = await supabase.storage.from('photos').upload(fileName, file);
      if (uploadError) {
          throw uploadError;
      }
      const { data } = supabase.storage.from('photos').getPublicUrl(fileName);
      return data.publicUrl;
  };
  
const handleSaveMateriel = async (materielData: Partial<Materiel>, photoMaterielFile?: File, photoFactureFile?: File) => {
    setIsSaving(true);
    setSaveError(null);
    try {
        let updatedData = { ...materielData };
        
        // Handle file uploads
        if (photoMaterielFile) {
            updatedData.photo_materiel_url = await uploadFile(photoMaterielFile);
        }
        if (photoFactureFile) {
            updatedData.photo_facture_url = await uploadFile(photoFactureFile);
        }

        // Auto-generate QR code for new items or existing items without one
        if ((!updatedData.id || !updatedData.qr_code_url) && updatedData.nom) {
            updatedData.qr_code_url = await generateUniqueQrCode(updatedData.nom, supabase);
        }

        // Ensure date is null if empty, otherwise DB might reject it
        if (!updatedData.date_achat) {
            updatedData.date_achat = null;
        }

        const { error } = await supabase.from('materiel').upsert(updatedData);

        if (error) throw error;

        handleCloseModals();
        fetchData(); // Refresh data
    } catch (error: any) {
        setSaveError(formatErrorMessage(error, "l'enregistrement du matériel"));
    } finally {
        setIsSaving(false);
    }
};

  const handleAutoGenerateQrCode = useCallback(async (materiel: Materiel) => {
    if (!materiel.nom) return;
    try {
        const newQrCodeUrl = await generateUniqueQrCode(materiel.nom, supabase);
        const { error } = await supabase
            .from('materiel')
            .update({ qr_code_url: newQrCodeUrl })
            .eq('id', materiel.id);
        if (error) throw error;
        fetchData(); // Refresh data to update the whole app state
    } catch (error: any) {
        console.error("Erreur lors de la génération automatique du QR code:", formatErrorMessage(error, 'génération QR auto'));
    }
  }, [supabase, fetchData]);
  
  const handleDeleteConfirm = async () => {
      if (!deletingMateriel) return;
      setIsConfirming(true);
      try {
        const { error } = await supabase.from('materiel').delete().eq('id', deletingMateriel.id);
        if (error) throw error;
        handleCloseModals();
        fetchData();
      } catch (error: any) {
        alert(formatErrorMessage(error, 'la suppression du matériel'));
      } finally {
        setIsConfirming(false);
      }
  };
  
  const handleSaveComment = async (materielWithComment: Materiel) => {
      try {
          const { error } = await supabase.from('materiel').update({ commentaire: materielWithComment.commentaire }).eq('id', materielWithComment.id);
          if (error) throw error;
          handleCloseModals();
          fetchData();
      } catch (error: any) {
          alert(formatErrorMessage(error, "la sauvegarde du commentaire"));
      }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div className="relative w-full md:w-auto md:flex-grow">
          <input
            type="text"
            placeholder="Rechercher du matériel..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-2 border rounded-full bg-gray-800 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
          />
        </div>
        {isAdmin && (
          <button
            onClick={handleAddMateriel}
            className="flex items-center justify-center gap-2 bg-cyan-600 text-black font-semibold px-4 py-2 rounded-full hover:bg-cyan-500 transition-transform transform hover:scale-105 w-full md:w-auto"
          >
            <PlusIcon className="w-5 h-5" />
            <span className="sm:inline">Ajouter Matériel</span>
          </button>
        )}
      </div>

      {loading && <p className="text-center text-gray-400">Chargement du matériel...</p>}
      {error && <p className="text-center text-red-400 whitespace-pre-wrap">{error}</p>}
      {!loading && !error && (
        <MaterielList 
          materiels={filteredMateriels}
          user={user}
          onEdit={isAdmin ? handleEditMateriel : undefined}
          onDelete={isAdmin ? handleDeleteClick : undefined}
          onView={handleViewMateriel}
        />
      )}

      {isFormModalOpen && (
        <MaterielFormModal
          isOpen={isFormModalOpen}
          onClose={handleCloseModals}
          onSave={handleSaveMateriel}
          materielToEdit={editingMateriel}
          user={user}
          isSaving={isSaving}
          saveError={saveError}
          employes={employes}
        />
      )}

      {isDetailModalOpen && viewingMateriel && (
          <MaterielDetailModal
            isOpen={isDetailModalOpen}
            onClose={handleCloseModals}
            materiel={viewingMateriel}
            user={user}
            onSaveComment={handleSaveComment}
            onAutoGenerateQrCode={handleAutoGenerateQrCode}
          />
      )}

      {isConfirmModalOpen && deletingMateriel && (
          <ConfirmationModal
            isOpen={isConfirmModalOpen}
            onClose={handleCloseModals}
            onConfirm={handleDeleteConfirm}
            title="Confirmer la suppression"
            message={`Êtes-vous sûr de vouloir supprimer "${deletingMateriel.nom}" ? Cette action est irréversible.`}
            isConfirming={isConfirming}
          />
      )}
    </div>
  );
};

export default MaterielPage;