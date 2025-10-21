
import React from 'react';
import { Product } from '../types';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';

interface ProductListProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, onEdit, onDelete }) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-slate-700">Aucun produit trouvé</h2>
        <p className="text-slate-500 mt-2">Essayez d'ajouter un nouveau produit ou de modifier vos termes de recherche.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-100 text-slate-600 uppercase text-sm leading-normal">
            <tr>
              <th className="py-3 px-6">Produit</th>
              <th className="py-3 px-6">SKU</th>
              <th className="py-3 px-6 text-center">Quantité</th>
              <th className="py-3 px-6 text-right">Prix</th>
              <th className="py-3 px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-slate-700 text-sm font-light">
            {products.map(product => (
              <tr key={product.id} className="border-b border-slate-200 hover:bg-slate-50">
                <td className="py-4 px-6">
                  <div className="font-medium">{product.name}</div>
                  <div className="text-slate-500 text-xs">{product.category}</div>
                </td>
                <td className="py-4 px-6 font-mono text-slate-500">{product.sku}</td>
                <td className="py-4 px-6 text-center">
                   <span className={`px-3 py-1 rounded-full text-xs font-semibold ${product.quantity > 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                     {product.quantity}
                   </span>
                </td>
                <td className="py-4 px-6 text-right font-medium">{product.price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</td>
                <td className="py-4 px-6 text-center">
                  <div className="flex item-center justify-center gap-4">
                    <button onClick={() => onEdit(product)} className="text-slate-500 hover:text-indigo-600 transition-colors" title="Modifier">
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => onDelete(product.id)} className="text-slate-500 hover:text-red-600 transition-colors" title="Supprimer">
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductList;