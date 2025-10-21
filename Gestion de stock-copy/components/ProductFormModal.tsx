
import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { generateDescription } from '../services/geminiService';
import { SparklesIcon } from './icons/SparklesIcon';
import { CloseIcon } from './icons/CloseIcon';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  productToEdit: Product | null;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({ isOpen, onClose, onSave, productToEdit }) => {
  const [product, setProduct] = useState<Partial<Product>>({
    name: '', sku: '', quantity: 0, price: 0, category: '', description: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (productToEdit) {
      setProduct(productToEdit);
    } else {
      setProduct({ name: '', sku: '', quantity: 0, price: 0, category: '', description: '' });
    }
  }, [productToEdit, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const handleGenerateDescription = async () => {
    if (!product.name) {
      alert("Veuillez d'abord entrer un nom de produit.");
      return;
    }
    setIsGenerating(true);
    const keywords = `${product.category}, ${product.name}`;
    const desc = await generateDescription(product.name, keywords);
    setProduct({ ...product, description: desc });
    setIsGenerating(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(product as Product);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-800">
            {productToEdit ? 'Modifier le Produit' : 'Ajouter un Produit'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">Nom du produit</label>
              <input type="text" name="name" id="name" value={product.name} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" required />
            </div>
            <div>
              <label htmlFor="sku" className="block text-sm font-medium text-slate-700">SKU</label>
              <input type="text" name="sku" id="sku" value={product.sku} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" required />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-slate-700">Catégorie</label>
              <input type="text" name="category" id="category" value={product.category} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" required />
            </div>
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-slate-700">Quantité</label>
              <input type="number" name="quantity" id="quantity" value={product.quantity} onChange={handleChange} min="0" className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" required />
            </div>
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-slate-700">Prix</label>
              <input type="number" name="price" id="price" value={product.price} onChange={handleChange} min="0" step="0.01" className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" required />
            </div>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700">Description</label>
            <div className="relative mt-1">
              {/* Fix: Added value prop to make textarea a controlled component. */}
              <textarea name="description" id="description" value={product.description || ''} onChange={handleChange} rows={4} className="block w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 pr-28"></textarea>
              <button
                type="button"
                onClick={handleGenerateDescription}
                disabled={isGenerating}
                className="absolute top-2 right-2 flex items-center gap-2 bg-indigo-100 text-indigo-700 font-semibold px-3 py-1.5 text-xs rounded-md hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? 'Génération...' : <>
                  <SparklesIcon className="w-4 h-4" />
                  Générer
                </>}
              </button>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Annuler</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
              {productToEdit ? 'Enregistrer les modifications' : 'Ajouter le Produit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;
