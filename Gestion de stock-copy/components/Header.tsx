
import React from 'react';
import { PlusIcon } from './icons/PlusIcon';

interface HeaderProps {
  onAddProduct: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onAddProduct, searchTerm, onSearchChange }) => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4 md:px-8 py-4 flex flex-col md:flex-row justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-700 mb-4 md:mb-0">
          📦 Gestion de Stock
        </h1>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-4 pr-10 py-2 border rounded-full bg-slate-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          <button
            onClick={onAddProduct}
            className="flex items-center gap-2 bg-indigo-600 text-white font-semibold px-4 py-2 rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105"
          >
            <PlusIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Ajouter Produit</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;