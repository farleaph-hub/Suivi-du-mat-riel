
import React, { useState, useCallback, useMemo } from 'react';
import { Product } from './types';
import Header from './components/Header';
import ProductList from './components/ProductList';
import ProductFormModal from './components/ProductFormModal';

const initialProducts: Product[] = [
  { id: '1', name: 'Ordinateur Portable Pro', sku: 'LP-PRO-15-2024', quantity: 25, price: 1499.99, category: 'Électronique', description: 'Un ordinateur portable puissant pour les professionnels.' },
  { id: '2', name: 'Souris Ergonomique Sans Fil', sku: 'MS-ERG-WL-BLK', quantity: 150, price: 79.99, category: 'Accessoires', description: 'Confort et précision pour une utilisation prolongée.' },
  { id: '3', name: 'Clavier Mécanique RGB', sku: 'KB-MECH-RGB-FR', quantity: 75, price: 129.99, category: 'Accessoires', description: 'Clavier réactif avec rétroéclairage personnalisable.' },
  { id: '4', name: 'Moniteur 4K 27 pouces', sku: 'MON-4K-27-IPS', quantity: 40, price: 449.50, category: 'Électronique', description: 'Images ultra-nettes avec des couleurs fidèles.' },
  { id: '5', name: 'Chaise de Bureau Premium', sku: 'CHR-OFF-PREM-GRY', quantity: 30, price: 399.00, category: 'Mobilier', description: 'Soutien lombaire et design moderne.' },
];

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = useCallback((productId: string) => {
    setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSaveProduct = (product: Product) => {
    if (editingProduct) {
      setProducts(products.map(p => p.id === product.id ? product : p));
    } else {
      setProducts([...products, { ...product, id: Date.now().toString() }]);
    }
    handleCloseModal();
  };

  const filteredProducts = useMemo(() => {
    return products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  return (
    <div className="min-h-screen font-sans text-slate-800">
      <Header onAddProduct={handleAddProduct} searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      <main className="container mx-auto p-4 md:p-8">
        <ProductList 
          products={filteredProducts} 
          onEdit={handleEditProduct} 
          onDelete={handleDeleteProduct} 
        />
      </main>
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveProduct}
        productToEdit={editingProduct}
      />
    </div>
  );
};

export default App;