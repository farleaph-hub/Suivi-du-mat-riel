import React from 'react';
import { User, Materiel } from '../types';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';

interface MaterielListProps {
  materiels: Materiel[];
  user: User;
  onEdit?: (materiel: Materiel) => void;
  onDelete?: (materiel: Materiel) => void;
  onView: (materiel: Materiel) => void;
}

const MaterielList: React.FC<MaterielListProps> = ({ materiels, user, onEdit, onDelete, onView }) => {
  if (materiels.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-gray-800 rounded-lg border border-gray-700">
        <h2 className="text-2xl font-semibold text-white">Aucun matériel trouvé</h2>
        <p className="text-gray-400 mt-2">Essayez d'ajouter du nouveau matériel ou de modifier vos termes de recherche.</p>
      </div>
    );
  }

  const getStatusColorClasses = (status: Materiel['statut']) => {
    switch (status) {
      case 'disponible':
        return 'bg-green-500';
      case 'emprunté':
        return 'bg-red-500';
      case 'maintenance':
        return 'bg-cyan-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  const isAdmin = user.role === 'admin';

  return (
    <div className="space-y-4">
      {materiels.map(materiel => (
        <div key={materiel.id} className="bg-gray-800 rounded-lg shadow-md border border-gray-700 overflow-hidden relative">
          <div className={`absolute left-0 top-0 bottom-0 w-2 ${getStatusColorClasses(materiel.statut)}`}></div>
          
          <div className="p-4 pl-6 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <button
                onClick={() => isAdmin && onView(materiel)}
                disabled={!isAdmin}
                className={`text-lg font-bold text-white text-left truncate block w-full ${isAdmin ? 'hover:text-cyan-400 cursor-pointer' : 'cursor-default'}`}
                title={isAdmin ? "Voir la fiche d'info" : ''}
              >
                {materiel.nom}
              </button>
              <p className="text-sm text-gray-400 mt-1 capitalize">
                {materiel.statut === 'disponible' ? 'Disponible' : `${materiel.statut} - ${materiel.dernierEmprunteur || 'N/A'}`}
              </p>
            </div>
            
            {isAdmin && (
              <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                {onEdit && (
                  <button 
                    onClick={() => onEdit(materiel)} 
                    className="p-2 text-gray-400 hover:text-cyan-400 rounded-full hover:bg-gray-700/50 transition-colors" 
                    title="Modifier"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                )}
                {onDelete && (
                  <button 
                    onClick={() => onDelete(materiel)} 
                    className="p-2 text-gray-400 hover:text-red-400 rounded-full hover:bg-gray-700/50 transition-colors" 
                    title="Supprimer"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MaterielList;