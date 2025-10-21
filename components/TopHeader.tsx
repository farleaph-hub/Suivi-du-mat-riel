import React from 'react';
import { User, Page } from '../types';
import { LogoutIcon } from './icons/LogoutIcon';
import { UserCircleIcon } from './icons/UserCircleIcon';

interface TopHeaderProps {
  user: User;
  onLogout: () => void;
  currentPage: Page;
}

const TopHeader: React.FC<TopHeaderProps> = ({ user, onLogout, currentPage }) => {
  const getPageTitle = (page: Page) => {
    switch (page) {
      case 'materiel':
        return 'Gestion du Matériel';
      case 'qui-est-ou':
        return 'Qui est où ?';
      case 'scanner':
        return 'Scanner';
      default:
        return 'InvManager';
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4 z-20">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-white">
          {getPageTitle(currentPage)}
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 text-sm text-gray-300">
           <UserCircleIcon className="w-6 h-6" />
           <span>{user.name}</span>
           <span className="px-2 py-0.5 bg-cyan-800 text-cyan-300 text-xs font-semibold rounded-full">{user.role}</span>
        </div>
        <button
          onClick={onLogout}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors"
          title="Déconnexion"
        >
          <LogoutIcon className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
};

export default TopHeader;