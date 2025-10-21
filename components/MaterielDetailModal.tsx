import React, { useState, useEffect } from 'react';
import { Materiel, User } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { ImageIcon } from './icons/ImageIcon';

interface MaterielDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  materiel: Materiel | null;
  user: User;
  onSaveComment: (materiel: Materiel) => void;
  onAutoGenerateQrCode: (materiel: Materiel) => void;
}

const MaterielDetailModal: React.FC<MaterielDetailModalProps> = ({ isOpen, onClose, materiel, user, onSaveComment, onAutoGenerateQrCode }) => {
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (materiel) {
      setComment(materiel.commentaire || '');
       // Auto-generate QR code if it's missing when modal opens
      if (isOpen && !materiel.qr_code_url && user.role === 'admin') {
        onAutoGenerateQrCode(materiel);
      }
    }
  }, [materiel, isOpen, user.role, onAutoGenerateQrCode]);

  if (!isOpen || !materiel) return null;
  
  const isAdmin = user.role === 'admin';

  const handleSave = () => {
    if (materiel) {
      onSaveComment({ ...materiel, commentaire: comment });
    }
  };

  const getStatusClasses = (status: Materiel['statut']) => {
    switch (status) {
      case 'disponible':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'emprunté':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'maintenance':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">
            Fiche d'Information
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-6">
          
          <div>
            <h3 className="text-2xl font-bold text-white">{materiel.nom}</h3>
            <div className="flex flex-wrap items-center gap-4 mt-2">
              <div className={`py-1 px-3 rounded-md text-sm font-semibold border ${getStatusClasses(materiel.statut)}`}>
                <p className="capitalize">{materiel.statut}</p>
              </div>
              {materiel.date_achat && (
                <div className="py-1 px-3 rounded-md border border-gray-700 bg-gray-900/50">
                  <p className="text-sm text-gray-300">Acheté le: {new Date(materiel.date_achat).toLocaleDateString('fr-FR')}</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">Photo du Matériel</h4>
              <a href={materiel.photo_materiel_url} target="_blank" rel="noopener noreferrer" className="block w-full h-48 bg-gray-900 rounded-md flex items-center justify-center border border-gray-700">
                {materiel.photo_materiel_url ? (
                  <img src={materiel.photo_materiel_url} alt={materiel.nom} className="object-cover w-full h-full rounded-md" />
                ) : (
                  <ImageIcon className="w-16 h-16 text-gray-600" />
                )}
              </a>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">Photo de la Facture</h4>
              <a href={materiel.photo_facture_url} target="_blank" rel="noopener noreferrer" className="block w-full h-48 bg-gray-900 rounded-md flex items-center justify-center border border-gray-700">
                {materiel.photo_facture_url ? (
                  <img src={materiel.photo_facture_url} alt={`Facture pour ${materiel.nom}`} className="object-cover w-full h-full rounded-md" />
                ) : (
                  <ImageIcon className="w-16 h-16 text-gray-600" />
                )}
              </a>
            </div>
          </div>
          
           {materiel.qr_code_url && (
            <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">QR Code</h4>
                <div className="flex items-center gap-4 p-4 rounded-md border border-gray-700 bg-gray-900/50">
                    <div className="bg-white p-2 rounded-md">
                        <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(materiel.qr_code_url)}`} 
                            alt="QR Code"
                            className="w-32 h-32"
                        />
                    </div>
                    <div className="flex-1">
                        <p className="text-gray-300">Ce QR code est lié à cet article. Scannez-le pour l'emprunter ou le retourner rapidement.</p>
                        <input 
                            type="text" 
                            readOnly 
                            value={materiel.qr_code_url}
                            className="w-full mt-2 bg-gray-800 text-gray-400 text-sm rounded-md p-2 border border-gray-600"
                         />
                    </div>
                </div>
            </div>
          )}


          <div className="p-4 rounded-md border border-gray-700 bg-gray-900/50">
              <p className="text-sm font-medium text-gray-300">Dernier Emprunteur</p>
              <p className="text-lg font-semibold">{materiel.dernierEmprunteur || 'N/A'}</p>
          </div>

          <div>
            <label htmlFor="commentaire-detail" className="block text-sm font-medium text-gray-400 mb-2">Commentaires</label>
            <textarea
              id="commentaire-detail"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              readOnly={!isAdmin}
              rows={4}
              className={`w-full bg-gray-900 border-gray-600 text-white rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 ${!isAdmin ? 'cursor-not-allowed' : ''}`}
            />
            {isAdmin && (
              <div className="mt-2 text-right">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-cyan-500 text-black font-semibold rounded-md hover:bg-cyan-400 text-sm"
                >
                  Enregistrer le commentaire
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 bg-gray-900/50 border-t border-gray-700 flex justify-end">
            <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500">Fermer</button>
        </div>
      </div>
    </div>
  );
};

export default MaterielDetailModal;