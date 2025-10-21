import React, { useState, useEffect } from 'react';
import { Materiel, User, Employe } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';

interface MaterielFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (materiel: Partial<Materiel>, photoMaterielFile?: File, photoFactureFile?: File) => void;
  materielToEdit: Materiel | null;
  user: User;
  isSaving: boolean;
  saveError: string | null;
  employes: Employe[];
}

const initialMaterielState: Partial<Materiel> = {
  nom: '',
  statut: 'disponible',
  date_achat: new Date().toISOString().split('T')[0],
  numero_serie: '',
  commentaire: '',
  dernierEmprunteur: null,
  employe_id: null,
};

const MaterielFormModal: React.FC<MaterielFormModalProps> = ({ isOpen, onClose, onSave, materielToEdit, user, isSaving, saveError, employes }) => {
  const [materiel, setMateriel] = useState<Partial<Materiel>>(initialMaterielState);
  const [photoMaterielFile, setPhotoMaterielFile] = useState<File | undefined>();
  const [photoFactureFile, setPhotoFactureFile] = useState<File | undefined>();
  
  useEffect(() => {
    if (isOpen) {
        if (materielToEdit) {
            const formattedDate = materielToEdit.date_achat 
                ? new Date(materielToEdit.date_achat).toISOString().split('T')[0] 
                : '';
            setMateriel({ ...materielToEdit, date_achat: formattedDate });
        } else {
            setMateriel(initialMaterielState);
        }
        setPhotoMaterielFile(undefined);
        setPhotoFactureFile(undefined);
    }
  }, [materielToEdit, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'statut' && value !== 'emprunté') {
      setMateriel({ ...materiel, statut: value as Materiel['statut'], dernierEmprunteur: null, employe_id: null });
    } else if (name === 'employe_id') {
      const selectedEmploye = employes.find(emp => emp.id === value);
      setMateriel({ ...materiel, employe_id: value, dernierEmprunteur: selectedEmploye?.nom || null });
    }
    else {
      setMateriel({ ...materiel, [name]: value });
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      if (name === 'photo_materiel') {
        setPhotoMaterielFile(files[0]);
      } else if (name === 'photo_facture') {
        setPhotoFactureFile(files[0]);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(materiel, photoMaterielFile, photoFactureFile);
  };
  
  const photoMaterielPreview = photoMaterielFile ? URL.createObjectURL(photoMaterielFile) : materiel.photo_materiel_url;
  const photoFacturePreview = photoFactureFile ? URL.createObjectURL(photoFactureFile) : materiel.photo_facture_url;


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-40 flex justify-center items-center p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-gray-700">
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">
            {materielToEdit ? 'Modifier le Matériel' : 'Ajouter du Matériel'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4">
          
          {saveError && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-300 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-300">Erreur d'enregistrement</h3>
                  <div className="mt-2 text-sm text-red-400">
                    <p className="whitespace-pre-wrap">{saveError}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="nom" className="block text-sm font-medium text-gray-300">Nom du matériel</label>
            <input type="text" name="nom" id="nom" value={materiel.nom} onChange={handleChange} className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="numero_serie" className="block text-sm font-medium text-gray-300">Numéro de série</label>
              <input type="text" name="numero_serie" id="numero_serie" value={materiel.numero_serie || ''} onChange={handleChange} className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500" />
            </div>
             <div>
              <label htmlFor="statut" className="block text-sm font-medium text-gray-300">Statut</label>
              <select name="statut" id="statut" value={materiel.statut} onChange={handleChange} className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500" required>
                <option value="disponible">Disponible</option>
                <option value="emprunté">Emprunté</option>
                <option value="maintenance">En maintenance</option>
              </select>
            </div>
          </div>
          
           {materiel.statut === 'emprunté' && (
             <div>
              <label htmlFor="employe_id" className="block text-sm font-medium text-gray-300">Emprunté par</label>
              <select name="employe_id" id="employe_id" value={materiel.employe_id || ''} onChange={handleChange} className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500" required>
                 <option value="">Sélectionner un employé</option>
                 {employes.map(e => <option key={e.id} value={e.id}>{e.nom}</option>)}
              </select>
            </div>
           )}

           <div>
              <label htmlFor="date_achat" className="block text-sm font-medium text-gray-300">Date d'achat</label>
              <input type="date" name="date_achat" id="date_achat" value={materiel.date_achat || ''} onChange={handleChange} className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500" />
            </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label htmlFor="photo_materiel" className="block text-sm font-medium text-gray-300">Photo du matériel</label>
                <input type="file" name="photo_materiel" id="photo_materiel" onChange={handleFileChange} accept="image/*" className="mt-1 block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-900/50 file:text-cyan-300 hover:file:bg-cyan-800/50"/>
                {photoMaterielPreview && <img src={photoMaterielPreview} alt="Aperçu" className="mt-2 h-24 w-24 object-cover rounded-md"/>}
            </div>
            <div>
                <label htmlFor="photo_facture" className="block text-sm font-medium text-gray-300">Photo de la facture</label>
                <input type="file" name="photo_facture" id="photo_facture" onChange={handleFileChange} accept="image/*" className="mt-1 block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-900/50 file:text-cyan-300 hover:file:bg-cyan-800/50"/>
                {photoFacturePreview && <img src={photoFacturePreview} alt="Aperçu" className="mt-2 h-24 w-24 object-cover rounded-md"/>}
            </div>
          </div>
          <div>
            <label htmlFor="commentaire" className="block text-sm font-medium text-gray-300">Commentaires</label>
            <div className="relative mt-1">
              <textarea name="commentaire" id="commentaire" value={materiel.commentaire || ''} onChange={handleChange} rows={4} className="block w-full bg-gray-900 border-gray-600 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500"></textarea>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} disabled={isSaving} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 disabled:opacity-50">Annuler</button>
            <button type="submit" disabled={isSaving} className="px-4 py-2 bg-cyan-600 text-black font-semibold rounded-md hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-wait">
              {isSaving ? 'Enregistrement...' : (materielToEdit ? 'Enregistrer les modifications' : 'Ajouter le Matériel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaterielFormModal;